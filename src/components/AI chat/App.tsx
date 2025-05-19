/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

interface EmotionPercentages {
  [key: string]: number;
}

const EmotionalFaceRecognition: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [emotions, setEmotions] = useState<EmotionPercentages>({
    angry: 0,
    disgusted: 0,
    fearful: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    surprised: 0,
    stress: 0
  });
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<'user' | 'environment'>('user');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionActive = useRef(true);

  // Calculate stress level based on emotions
  const calculateStressLevel = (emotions: EmotionPercentages): number => {
    const weights: Record<string, number> = {
      angry: 0.3,
      disgusted: 0.2,
      fearful: 0.25,
      happy: -0.15,
      neutral: -0.05,
      sad: 0.2,
      surprised: 0.05
    };
    
    let stress = 0;
    for (const [emotion, value] of Object.entries(emotions)) {
      stress += value * (weights[emotion] || 0);
    }
    
    return Math.min(1, Math.max(0, stress * 1.5));
  };

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsModelLoading(false);
        if (isCameraOn) startCamera();
      } catch (err) {
        setError('Failed to load models. Please refresh the page.');
        console.error('Model loading error:', err);
      }
    };

    loadModels();

    return () => {
      detectionActive.current = false;
      stopCamera();
    };
  }, []);

  // Start camera with selected type
  const startCamera = async () => {
    stopCamera();
    detectionActive.current = true;

    try {
      const constraints = {
        video: {
          facingMode: cameraType,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (containerRef.current && videoRef.current) {
            const container = containerRef.current;
            const video = videoRef.current;
            
            const containerAspect = container.clientWidth / container.clientHeight;
            const videoAspect = video.videoWidth / video.videoHeight;
            
            if (videoAspect > containerAspect) {
              video.style.width = '70%';
              video.style.height = 'auto';
            } else {
              video.style.width = 'auto';
              video.style.height = '70%';
            }
          }
          
          detectEmotions();
        };
      }
    } catch (err) {
      setError('Could not access camera. Please ensure permissions are granted.');
      console.error('Camera access error:', err);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle between front and back camera
  const toggleCamera = () => {
    setCameraType(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Toggle camera on/off
  const toggleCameraPower = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
    setIsCameraOn(!isCameraOn);
  };

  // Restart camera when cameraType changes
  useEffect(() => {
    if (!isModelLoading && isCameraOn) {
      startCamera();
    }
  }, [cameraType]);

  // Detect emotions in real-time
  const detectEmotions = async () => {
    if (!detectionActive.current || !videoRef.current || !canvasRef.current || !isCameraOn) return;

    try {
      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      };

      canvasRef.current.width = displaySize.width;
      canvasRef.current.height = displaySize.height;
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
      ).withFaceLandmarks().withFaceExpressions();

      if (detections.length > 0) {
        const currentEmotions = detections[0].expressions as unknown as EmotionPercentages;
        const stressLevel = calculateStressLevel(currentEmotions);
        
        setEmotions({
          ...currentEmotions,
          stress: stressLevel
        });
      } else {
        setEmotions(prev => ({
          ...prev,
          angry: 0,
          disgusted: 0,
          fearful: 0,
          happy: 0,
          neutral: 0,
          sad: 0,
          surprised: 0,
          stress: 0
        }));
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw square detection box
        if (detections.length > 0) {
          const box = detections[0].detection.box;
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            box.x, 
            box.y, 
            box.width, 
            box.height
          );
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    if (detectionActive.current && isCameraOn) {
      requestAnimationFrame(detectEmotions);
    }
  };

  // Get color based on percentage value
  const getColorForPercentage = (value: number, emotion: string) => {
    const percentage = value * 100;
    
    if (emotion === 'stress') {
      if (percentage < 30) return 'bg-green-500';
      if (percentage < 60) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (emotion === 'happy' || emotion === 'neutral') {
      if (percentage < 20) return 'bg-red-500';
      if (percentage < 50) return 'bg-yellow-500';
      return 'bg-green-500';
    }
    
    // For negative emotions
    if (percentage < 20) return 'bg-green-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Static emotion order and labels
  const emotionDisplayOrder = [
    { key: 'happy', label: 'Happy' },
    { key: 'sad', label: 'Sad' },
    { key: 'angry', label: 'Angry' },
    { key: 'fearful', label: 'Fearful' },
    { key: 'disgusted', label: 'Disgusted' },
    { key: 'surprised', label: 'Surprised' },
    { key: 'neutral', label: 'Neutral' },
    { key: 'stress', label: 'Stress' }
  ];

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (isModelLoading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-blue-600 dark:text-blue-300">Loading emotion detection models...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-semibold">Real-Time Emotion Detection</h2>
      </div>
      
      {/* Camera view with detection overlay */}
      <div 
        ref={containerRef}
        className="relative mb-4 flex justify-center items-center bg-black rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"
        style={{ height: '480px' }}
      >
        {isCameraOn ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="max-w-full max-h-full object-contain"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
            
            {/* Face detection guidance */}
            {Object.values(emotions).slice(0, -1).every(val => val === 0) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-none">
                <div className="border-2 border-dashed border-red-500 rounded-lg w-65 h-64 flex items-center justify-center animate-pulse">
                  <span className="text-red-500 font-bold text-lg bg-black/70 px-3 py-1 rounded">
                    No Face Detected
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <div className="text-center p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                Camera is currently turned off
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Camera controls at bottom */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleCameraPower}
          className={`flex items-center gap-2 ${
            isCameraOn 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white font-medium py-2 px-6 rounded-lg transition-colors`}
        >
          {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
        
        {isCameraOn && (
          <button
            onClick={toggleCamera}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {cameraType === 'user' ? 'Switch to Rear' : 'Switch to Front'}
          </button>
        )}
      </div>

      {/* Emotion percentages */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Emotion Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {emotionDisplayOrder.map(({ key, label }) => (
            <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="capitalize font-medium">{label}</span>
                <span className="text-sm font-semibold">
                  {(emotions[key] * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getColorForPercentage(emotions[key], key)}`}
                  style={{ width: `${emotions[key] * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionalFaceRecognition;