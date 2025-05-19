import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyBy0KCb5kFziYZC5gXkFgB3mXEmMzsatTE";

const MOOD_MUSIC_LIBRARY = {
  happy: [
    { id: 1, title: "Jillu Jillu", artist: "Anirudh Ravichander", duration: "3:30", bpm: 120, path: "/music/Happy/Jigidi-Killaadi-MassTamilan.io.mp3" },
    { id: 2, title: "Chellamma", artist: "Anirudh Ravichander", duration: "3:45", bpm: 125, path: "/music/Happy/Chellamma-MassTamilan.fm.mp3" },
    { id: 3, title: "Vaathi Coming", artist: "Anirudh Ravichander", duration: "3:48", bpm: 128, path: "/music/Happy/Vaathi-Coming-MassTamilan.io.mp3" },
    { id: 4, title: "Enjoy Enjaami", artist: "Dhee, Arivu", duration: "4:39", bpm: 115, path: "/music/Happy/Enjoy-Enjaami-MassTamilan.io.mp3" },
    { id: 5, title: "Arabic Kuthu", artist: "Anirudh Ravichander", duration: "4:17", bpm: 130, path: "/music/Happy/Arabic-Kuthu---Halamithi-Habibo-MassTamilan.so.mp3" }
  ],
  sad: [
    { id: 6, title: "Po urava", artist: "Lakshmi Manchu", duration: "5:20", bpm: 70, path: "/music/Sad/Poi-Vazhva.mp3" },
    { id: 7, title: "Kanave Nee Naan", artist: "Sooraj Santhosh", duration: "4:45", bpm: 65, path: "/music/Sad/Kanave-Nee-Naan-MassTamilan.io.mp3" },
    { id: 8, title: "Poi Vazhva", artist: "Santhosh Narayanan", duration: "5:55", bpm: 75, path: "/music/Sad/Poi-Vazhva.mp3" },
    { id: 9, title: "Kadhal Ara Onnu", artist: "Yuvan Shankar Raja", duration: "4:30", bpm: 72, path: "/music/Sad/Nee Yaro Song.mp3" },
    { id: 10, title: "Kanave Kanave", artist: "Anirudh Ravichander", duration: "4:15", bpm: 68, path: "/music/Sad/Kanave-Kanave-MassTamilan.com.mp3" }
  ],
  stressed: [
    { id: 11, title: "Naan Pizhai", artist: "A.R. Rahman", duration: "6:15", bpm: 60, path: "/music/Stress/Naan-Pizhai-MassTamilan.so.mp3" },
    { id: 12, title: "Yaanji", artist: "Chennai Orchestra", duration: "5:45", bpm: 58, path: "/music/Stress/Idhu-Emosion-MassTamilan.com.mp3" },
    { id: 13, title: "Boomi Enna Suthudhe", artist: "Anirudh", duration: "5:30", bpm: 62, path: "/music/Stress/Boomi-Enna-Suthudhe.mp3" },
    { id: 14, title: "Maruvaarthai", artist: "Sid Sriram", duration: "5:20", bpm: 64, path: "/music/Stress/Maruvaarthai-Unplugged-Masstamilan.com.mp3" },
    { id: 15, title: "Kannamma", artist: "Anirudh Ravichander", duration: "4:55", bpm: 66, path: "/music/Stress/Kannamma-MassTamilan.io.mp3" }
  ],
  neutral: [
    { id: 16, title: "Why This Kolaveri Di", artist: "Dhanush", duration: "4:20", bpm: 100, path: "/music/Netural/Why This Kolaveri Di (The Soup of Love).mp3" },
    { id: 17, title: "Aalaporan Thamizhan", artist: "A.R. Rahman", duration: "4:25", bpm: 102, path: "/music/Netural/Aalaporan-Thamizhan-MassTamilan.com.mp3" },
    { id: 18, title: "Kutti Story", artist: "Anirudh Ravichander", duration: "3:28", bpm: 98, path: "/music/Netural/Kutti-Story-MassTamilan.io.mp3" },
    { id: 19, title: "Jai Sulthan", artist: "Vivek-Mervin", duration: "3:50", bpm: 104, path: "/music/Netural/Jai-Sulthan-MassTamilan.io.mp3" },
    { id: 20, title: "Sirikkadhey", artist: "Anirudh Ravichander", duration: "4:15", bpm: 106, path: "/music/Netural/Sirikkadhey.mp3" }
  ],
  focus: [
    { id: 21, title: "Petta Theme", artist: "Anirudh Ravichander", duration: "3:50", bpm: 90, path: "/music/Focus/Petta-Theme-MassTamilan.org.mp3" },
    { id: 22, title: "Vikram Theme", artist: "Anirudh Ravichander", duration: "4:10", bpm: 92, path: "/music/Focus/Rolex-Theme-(Background-Score)-MassTamilan.dev.mp3" },
    { id: 23, title: "Beast Mode", artist: "Anirudh Ravichander", duration: "3:45", bpm: 94, path: "/music/Focus/Beast-Mode-MassTamilan.so.mp3" },
    { id: 24, title: "Master the Blaster", artist: "Anirudh Ravichander", duration: "4:05", bpm: 96, path: "/music/Focus/Master-the-Blaster-MassTamilan.io.mp3" },
    { id: 25, title: "Once Upon a Time", artist: "Anirudh Ravichander", duration: "3:55", bpm: 98, path: "/music/Focus/Once-Upon-a-Time-MassTamilan.so.mp3" }
  ]
};

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  bpm: number;
  path: string;
}

interface MoodData {
  category: string;
  percentage: number;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  explanation: string;
  currentMood: string;
  songQueue: Song[];
  previousSongs: Song[];
}

const MusicPlayerWithAI: React.FC = () => {
  const { userData } = useUser();
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    explanation: '',
    currentMood: '',
    songQueue: [],
    previousSongs: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = playerState.volume / 100;

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration || convertToSeconds(prev.currentSong?.duration || "0:00")
      }));
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      if (!isSeeking && audioRef.current && playerState.currentSong) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration || convertToSeconds(playerState.currentSong.duration);
        const progress = (currentTime / duration) * 100;
        
        setPlayerState(prev => ({
          ...prev,
          progress,
          currentTime,
          duration
        }));
      }
    };

    const handleEnded = () => {
      nextSong();
    };

    const handleError = () => {
      console.error("Audio playback error");
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.src = '';
    };
  }, [isSeeking]);

  // Handle song changes
  useEffect(() => {
    if (!playerState.currentSong) return;

    const audio = audioRef.current;
    audio.src = playerState.currentSong.path;
    audio.load();
    setIsReady(false);

    if (playerState.isPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });
      }
    }
  }, [playerState.currentSong]);

  // Handle play/pause
  useEffect(() => {
    if (!playerState.currentSong) return;

    const audio = audioRef.current;
    if (playerState.isPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setPlayerState(prev => ({ ...prev, isPlaying: false }));
        });
      }
    } else {
      audio.pause();
    }
  }, [playerState.isPlaying]);

  // Handle volume changes
  useEffect(() => {
    audioRef.current.volume = playerState.isMuted ? 0 : playerState.volume / 100;
  }, [playerState.volume, playerState.isMuted]);

  const convertToSeconds = (time: string) => {
    const [mins, secs] = time.split(':').map(Number);
    return mins * 60 + secs;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const analyzeMood = useCallback(() => {
    if (!userData) return [];

    let happy = 30;
    let sad = 20;
    let stressed = 25;
    let neutral = 25;

    if (userData.sleepTime) {
      if (userData.sleepTime < 5) {
        happy -= 15;
        stressed += 20;
      } else if (userData.sleepTime < 7) {
        happy -= 5;
        stressed += 10;
      } else if (userData.sleepTime > 8) {
        happy += 5;
        stressed -= 5;
      }
    }

    if (userData.screenTime) {
      if (userData.screenTime > 6) {
        happy -= 10;
        stressed += 15;
      } else if (userData.screenTime > 4) {
        happy -= 5;
        stressed += 5;
      }
    }

    if (userData.age) {
      if (userData.age < 25) {
        happy += 5;
        sad += 5;
      } else if (userData.age > 40) {
        stressed += 5;
        neutral += 5;
      }
    }

    happy = Math.max(0, Math.min(100, happy));
    sad = Math.max(0, Math.min(100, sad));
    stressed = Math.max(0, Math.min(100, stressed));
    neutral = Math.max(0, Math.min(100, neutral));

    const total = happy + sad + stressed + neutral;
    happy = Math.round((happy / total) * 100);
    sad = Math.round((sad / total) * 100);
    stressed = Math.round((stressed / total) * 100);
    neutral = 100 - happy - sad - stressed;

    return [
      { category: 'happy', percentage: happy },
      { category: 'sad', percentage: sad },
      { category: 'stressed', percentage: stressed },
      { category: 'neutral', percentage: neutral }
    ];
  }, [userData]);

  const getAIRecommendations = async (moodData: MoodData[], songs: Song[]) => {
    try {
      const focusMode = userData?.sleepTime && userData.sleepTime >= 8;
      
      const prompt = `Based on the following mood analysis:
      - Happy: ${moodData.find(m => m.category === 'happy')?.percentage}%
      - Sad: ${moodData.find(m => m.category === 'sad')?.percentage}%
      - Stressed: ${moodData.find(m => m.category === 'stressed')?.percentage}%
      - Neutral: ${moodData.find(m => m.category === 'neutral')?.percentage}%
      ${focusMode ? 'Focus Mode: Activated' : ''}

      And these available songs:
      ${songs.map(s => `${s.title} by ${s.artist} (${s.bpm}BPM)`).join('\n')}

      Please:
      1. Select the 3 most appropriate songs in order of relevance
      2. Provide a detailed explanation for each selection
      3. Suggest the best time to listen to each song

      Return a JSON response with this structure:
      {
        "recommendations": [
          {
            "songId": number,
            "explanation": string,
            "bestTime": string
          }
        ],
        "summary": string
      }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      try {
        const parsedResponse = JSON.parse(responseText);
        return parsedResponse;
      } catch (e) {
        console.error('Failed to parse AI response', e);
        return null;
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return null;
    }
  };

  const loadSong = useCallback((song: Song) => {
    setPlayerState(prev => ({
      ...prev,
      currentSong: song,
      progress: 0,
      currentTime: 0,
      duration: convertToSeconds(song.duration),
      isPlaying: true
    }));
  }, []);

  const getRecommendedSongs = useCallback(async (moodData: MoodData[]) => {
    setIsLoading(true);
    try {
      const primaryMood = moodData.reduce((prev, current) => 
        (prev.percentage > current.percentage) ? prev : current
      ).category;

      const focusMode = userData?.sleepTime && userData.sleepTime >= 8;
      let songs: Song[] = focusMode 
        ? [...MOOD_MUSIC_LIBRARY.focus] 
        : [...MOOD_MUSIC_LIBRARY[primaryMood as keyof typeof MOOD_MUSIC_LIBRARY]];

      // Get AI recommendations
      const aiResponse = await getAIRecommendations(moodData, songs);
      
      let recommendedSongs: Song[] = [];
      let explanation = '';

      if (aiResponse?.recommendations) {
        recommendedSongs = aiResponse.recommendations
          .map((rec: any) => songs.find(s => s.id === rec.songId))
          .filter(Boolean) as Song[];
        
        explanation = aiResponse.summary + '\n\n';
        aiResponse.recommendations.forEach((rec: any) => {
          const song = songs.find(s => s.id === rec.songId);
          if (song) {
            explanation += `• ${song.title} by ${song.artist}\n`;
            explanation += `  Best time: ${rec.bestTime || 'anytime'}\n`;
            explanation += `  Why: ${rec.explanation || 'Perfect for your current mood'}\n\n`;
          }
        });
      } else {
        songs = songs.sort(() => Math.random() - 0.5);
        recommendedSongs = songs.slice(0, 3);
        explanation = `Playing ${focusMode ? 'focus' : primaryMood} music for you.`;
      }

      const songQueue = recommendedSongs.slice(1);
      loadSong(recommendedSongs[0]);
      
      setPlayerState(prev => ({
        ...prev,
        songQueue,
        explanation,
        currentMood: primaryMood,
        previousSongs: prev.currentSong ? [prev.currentSong, ...prev.previousSongs] : prev.previousSongs
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      const primaryMood = moodData.reduce((prev, current) => 
        (prev.percentage > current.percentage) ? prev : current
      ).category;
      const focusMode = userData?.sleepTime && userData.sleepTime >= 8;
      const songs = focusMode 
        ? [...MOOD_MUSIC_LIBRARY.focus] 
        : [...MOOD_MUSIC_LIBRARY[primaryMood as keyof typeof MOOD_MUSIC_LIBRARY]];
      
      loadSong(songs[0]);
      setPlayerState(prev => ({
        ...prev,
        explanation: `Playing ${focusMode ? 'focus' : primaryMood} music`,
        currentMood: primaryMood,
        previousSongs: prev.currentSong ? [prev.currentSong, ...prev.previousSongs] : prev.previousSongs
      }));
    } finally {
      setIsLoading(false);
    }
  }, [userData, loadSong]);

  useEffect(() => {
    if (!playerState.currentSong) {
      const moodData = analyzeMood();
      if (moodData.length > 0) {
        getRecommendedSongs(moodData);
      }
    }
  }, [analyzeMood, getRecommendedSongs, playerState.currentSong]);

  const togglePlay = () => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };
  
  const nextSong = () => {
    if (playerState.songQueue.length > 0) {
      const [nextSong, ...remainingQueue] = playerState.songQueue;
      setPlayerState(prev => ({
        ...prev,
        songQueue: remainingQueue,
        previousSongs: prev.currentSong ? [prev.currentSong, ...prev.previousSongs] : prev.previousSongs
      }));
      loadSong(nextSong);
    } else {
      const moodData = analyzeMood();
      getRecommendedSongs(moodData);
    }
  };

  const prevSong = () => {
    if (playerState.previousSongs.length > 0) {
      const [previousSong, ...remainingPrevious] = playerState.previousSongs;
      setPlayerState(prev => ({
        ...prev,
        previousSongs: remainingPrevious,
        songQueue: prev.currentSong ? [prev.currentSong, ...prev.songQueue] : prev.songQueue
      }));
      loadSong(previousSong);
    }
  };

  const handleProgressMouseDown = () => {
    setIsSeeking(true);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    if (playerState.currentSong) {
      const duration = playerState.duration || convertToSeconds(playerState.currentSong.duration);
      const newTime = (newProgress / 100) * duration;
      
      setPlayerState(prev => ({
        ...prev,
        progress: newProgress,
        currentTime: newTime
      }));
    }
  };

  const handleProgressMouseUp = () => {
    setIsSeeking(false);
    if (playerState.currentSong && audioRef.current) {
      const duration = playerState.duration || convertToSeconds(playerState.currentSong.duration);
      audioRef.current.currentTime = (playerState.progress / 100) * duration;
      
      // If player was playing before seeking, continue playback
      if (playerState.isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
    }
  };

  const toggleMute = () => {
    setPlayerState(prev => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setPlayerState(prev => ({
      ...prev,
      volume: newVolume,
      isMuted: newVolume === 0
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        AI-Powered Tamil Music Player
      </h2>

      {/* Music Player */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : playerState.currentSong ? (
          <>
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-lg mr-4">
                {playerState.isPlaying ? (
                  <Pause className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
                ) : (
                  <Play className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {playerState.currentSong.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {playerState.currentSong.artist} • {playerState.currentSong.duration} • {playerState.currentSong.bpm}BPM
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                  {playerState.currentMood} mood
                </p>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={playerState.progress}
                onChange={handleProgressChange}
                onMouseDown={handleProgressMouseDown}
                onMouseUp={handleProgressMouseUp}
                onTouchStart={handleProgressMouseDown}
                onTouchEnd={handleProgressMouseUp}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>
                  {formatTime(playerState.currentTime)} / {formatTime(playerState.duration || convertToSeconds(playerState.currentSong.duration))}
                </span>
                <span>
                  -{formatTime((playerState.duration || convertToSeconds(playerState.currentSong.duration)) - playerState.currentTime)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={prevSong}
                  disabled={playerState.previousSongs.length === 0}
                  className={`p-2 rounded-full ${playerState.previousSongs.length === 0 ? 'text-gray-400' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  <SkipBack className="h-6 w-6" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                  disabled={!isReady}
                >
                  {playerState.isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={nextSong}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <SkipForward className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center">
                <button onClick={toggleMute} className="mr-2">
                  {playerState.isMuted || playerState.volume === 0 ? (
                    <VolumeX className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playerState.volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-indigo-600"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Analyzing your mood and selecting perfect music...
          </div>
        )}
      </div>

      {/* AI Explanation */}
      {playerState.explanation && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-indigo-800 dark:text-indigo-300">
            AI Music Recommendation
          </h4>
          <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
            {playerState.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default MusicPlayerWithAI;