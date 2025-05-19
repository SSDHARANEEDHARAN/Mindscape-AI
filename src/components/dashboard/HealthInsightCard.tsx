import React, { useState, useCallback, useRef } from 'react';
import { Smile, Frown, Meh, Image as ImageIcon, Upload, AlertTriangle, Loader, FileText } from 'lucide-react';

interface EmotionAnalysis {
  happy: number;
  neutral: number;
  sad: number;
  angry: number;
  surprised: number;
}

interface ObjectDetection {
  object: string;
  score: number;
}

interface TextAnalysis {
  extractedText: string;
  wordCount: number;
  containsDiagram: boolean;
  containsList: boolean;
}

interface ImageAnalysis {
  facesDetected: number;
  emotions?: EmotionAnalysis;
  objectsDetected: ObjectDetection[];
  textAnalysis?: TextAnalysis;
  processingTime: number;
  imageType: 'photo' | 'diagram' | 'text' | 'mixed';
}

const ImageEmotionAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Ready to analyze images');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Your Google Cloud Vision API Key
  const API_KEY = 'AIzaSyDQYn6c9qVjO8v5Rc_DnjqFfxvnsLiwKrc';

  const analyzeWithGoogleVision = async (imageBase64: string) => {
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64.split(',')[1] }, // Remove data URL prefix
          features: [
            { type: 'FACE_DETECTION', maxResults: 10 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
            { type: 'TEXT_DETECTION' }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  };

  const processVisionResults = (visionResponse: any): ImageAnalysis => {
    const startTime = performance.now();
    
    // Process Faces
    const faces = visionResponse.responses[0].faceAnnotations || [];
    const faceAnalysis = {
      count: faces.length,
      emotions: faces.reduce((acc: any, face: any) => {
        const emotions = {
          happy: face.joyLikelihood === 'VERY_LIKELY' ? 100 : 
                face.joyLikelihood === 'LIKELY' ? 75 :
                face.joyLikelihood === 'POSSIBLE' ? 50 : 0,
          sad: face.sorrowLikelihood === 'VERY_LIKELY' ? 100 : 
               face.sorrowLikelihood === 'LIKELY' ? 75 :
               face.sorrowLikelihood === 'POSSIBLE' ? 50 : 0,
          angry: face.angerLikelihood === 'VERY_LIKELY' ? 100 : 
                 face.angerLikelihood === 'LIKELY' ? 75 :
                 face.angerLikelihood === 'POSSIBLE' ? 50 : 0,
          surprised: face.surpriseLikelihood === 'VERY_LIKELY' ? 100 : 
                    face.surpriseLikelihood === 'LIKELY' ? 75 :
                    face.surpriseLikelihood === 'POSSIBLE' ? 50 : 0,
          neutral: face.underExposedLikelihood === 'VERY_LIKELY' ? 100 : 
                  face.underExposedLikelihood === 'LIKELY' ? 75 :
                  face.underExposedLikelihood === 'POSSIBLE' ? 50 : 0
        };
        
        for (const [emotion, value] of Object.entries(emotions)) {
          acc[emotion as keyof EmotionAnalysis] += value;
        }
        return acc;
      }, { happy: 0, neutral: 0, sad: 0, angry: 0, surprised: 0 })
    };

    // Average the emotion scores
    if (faces.length > 0) {
      for (const emotion of Object.keys(faceAnalysis.emotions)) {
        faceAnalysis.emotions[emotion as keyof EmotionAnalysis] = 
          Math.round(faceAnalysis.emotions[emotion as keyof EmotionAnalysis] / faces.length);
      }
    }

    // Process Objects
    const objects = visionResponse.responses[0].localizedObjectAnnotations || [];
    const objectsDetected = objects.map((obj: any) => ({
      object: obj.name,
      score: obj.score
    }));

    // Process Text
    const texts = visionResponse.responses[0].textAnnotations || [];
    const fullText = texts.length > 0 ? texts[0].description : '';
    const lines = fullText.split('\n');
    
    // Fixed: Added proper type annotations for the line parameter
    const containsList = lines.some((line: string) => line.match(/^\s*[\-•]\s|\d+\./));
    const containsDiagram = lines.some((line: string) => line.match(/[┌┐└┘─│┬┴├┤┼═║╔╗╚╝╠╣╦╩╬]/));

    const textAnalysis = {
      extractedText: fullText.length > 500 ? `${fullText.substring(0, 500)}...` : fullText,
      wordCount: fullText.trim() ? fullText.split(/\s+/).length : 0,
      containsDiagram,
      containsList
    };

    // Determine image type
    let imageType: 'photo' | 'diagram' | 'text' | 'mixed' = 'mixed';
    if (faceAnalysis.count > 0) {
      imageType = 'photo';
    } else if (containsDiagram || objects.some((o: any) => ['book', 'computer', 'tv'].includes(o.name.toLowerCase()))) {
      imageType = textAnalysis.wordCount > 10 ? 'mixed' : 'diagram';
    } else if (textAnalysis.wordCount > 20) {
      imageType = 'text';
    }

    return {
      facesDetected: faceAnalysis.count,
      emotions: faceAnalysis.count > 0 ? faceAnalysis.emotions : undefined,
      objectsDetected,
      textAnalysis: textAnalysis.wordCount > 0 ? textAnalysis : undefined,
      processingTime: Math.round(performance.now() - startTime),
      imageType
    };
  };

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size too large (max 10MB)");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setStatusMessage('Processing image...');

    try {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      setPreviewUrl(imageData);
      setStatusMessage('Analyzing with Google Vision API...');
      
      const visionResponse = await analyzeWithGoogleVision(imageData);
      const result = processVisionResults(visionResponse);
      
      setAnalysis(result);
      setStatusMessage('Analysis complete!');
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze the image");
      setStatusMessage('Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetAnalysis = () => {
    setPreviewUrl(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStatusMessage('Ready to analyze images');
  };

  const getEmotionColor = (value: number) => {
    if (value > 60) return 'text-green-500';
    if (value > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2 text-center text-blue-600 dark:text-blue-400">
        Google Vision Image Analysis
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
        Upload images to analyze with Google Cloud Vision API
      </p>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-8 text-center">
        {!previewUrl ? (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition">
              Upload Image
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              JPG, PNG, or WEBP (Max 10MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative mb-4 max-w-full">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-64 max-w-full rounded-lg shadow-md"
              />
              {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center rounded-lg">
                  <Loader className="animate-spin mb-2" size={48} />
                  <p className="text-white font-medium">{statusMessage}</p>
                </div>
              )}
            </div>
            <button 
              onClick={resetAnalysis}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              disabled={loading}
            >
              Upload different image
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg mb-4 text-center bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
          <AlertTriangle className="inline mr-2" />
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Analysis Results</h2>
              <div className="flex items-center">
                <span className="text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded mr-2">
                  {analysis.imageType.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Processed in {analysis.processingTime}ms
                </span>
              </div>
            </div>
            
            {analysis.facesDetected > 0 ? (
              <div className="mb-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <ImageIcon className="mr-2 text-blue-500" />
                  Facial Analysis ({analysis.facesDetected} face{analysis.facesDetected !== 1 ? 's' : ''})
                </h3>
                <div className="space-y-3">
                  {analysis.emotions && Object.entries(analysis.emotions)
                    .filter(([_, value]) => value > 0)
                    .map(([emotion, value]) => (
                      <div key={emotion}>
                        <div className="flex justify-between">
                          <span className="flex items-center capitalize">
                            {emotion === 'happy' && <Smile className={`mr-2 ${getEmotionColor(value)}`} />}
                            {emotion === 'sad' && <Frown className={`mr-2 ${getEmotionColor(value)}`} />}
                            {emotion === 'angry' && <Frown className={`mr-2 ${getEmotionColor(value)}`} />}
                            {emotion === 'surprised' && <Smile className={`mr-2 ${getEmotionColor(value)}`} />}
                            {emotion === 'neutral' && <Meh className={`mr-2 ${getEmotionColor(value)}`} />}
                            {emotion}
                          </span>
                          <span className={getEmotionColor(value)}>
                            {value}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${value}%`,
                              backgroundColor: emotion === 'happy' ? '#10B981' : 
                                            emotion === 'sad' ? '#EF4444' : 
                                            emotion === 'angry' ? '#F59E0B' : 
                                            emotion === 'surprised' ? '#8B5CF6' : 
                                            '#6B7280'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : analysis.imageType !== 'photo' && (
              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <ImageIcon className="mr-2 text-blue-500" />
                  Image Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {analysis.imageType === 'text' ? 'Text document detected' : 
                   analysis.imageType === 'diagram' ? 'Diagram/schematic detected' : 
                   'Mixed content detected'}
                </p>
              </div>
            )}

            {analysis.objectsDetected.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <ImageIcon className="mr-2 text-purple-500" />
                  Objects Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.objectsDetected.map((obj, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      <span className="mr-1">{obj.object}</span>
                      <span className="text-gray-500">{(obj.score * 100).toFixed(0)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.textAnalysis && (
              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <FileText className="mr-2 text-green-500" />
                  Text Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Word Count</h4>
                    <p>{analysis.textAnalysis.wordCount}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Content Type</h4>
                    <p>
                      {analysis.textAnalysis.containsDiagram && 'Diagram '}
                      {analysis.textAnalysis.containsList && 'List '}
                      {!analysis.textAnalysis.containsDiagram && !analysis.textAnalysis.containsList && 'Plain text'}
                    </p>
                  </div>
                </div>
                {analysis.textAnalysis.extractedText && (
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Extracted Text</h4>
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {analysis.textAnalysis.extractedText}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEmotionAnalysis;