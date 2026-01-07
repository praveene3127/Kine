import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    voice: 'default',
    rate: 1,
    pitch: 1,
    volume: 1,
    feedbackLevel: 'detailed', // 'minimal', 'normal', 'detailed'
    confirmEveryLetter: false,
    confirmEveryWord: true,
    autoPlay: true,
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!speechSynthesis) {
      console.log('[TTS Simulated]:', text);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply settings
      utterance.rate = options.rate ?? settings.rate;
      utterance.pitch = options.pitch ?? settings.pitch;
      utterance.volume = options.volume ?? settings.volume;

      // Find and set voice
      if (settings.voice !== 'default' && voices.length > 0) {
        const selectedVoice = voices.find(v => v.name === settings.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.error('Speech synthesis error:', event);
        reject(event);
      };

      speechSynthesis.speak(utterance);
    });
  }, [speechSynthesis, voices, settings]);

  const stop = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSynthesis]);

  const speakFeedback = useCallback((type, message) => {
    // Control verbosity based on feedback level
    if (settings.feedbackLevel === 'minimal' && type === 'info') {
      return Promise.resolve();
    }
    if (settings.feedbackLevel === 'normal' && type === 'debug') {
      return Promise.resolve();
    }
    return speak(message);
  }, [speak, settings.feedbackLevel]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const value = {
    settings,
    updateSettings,
    speak,
    stop,
    speakFeedback,
    isSpeaking,
    voices,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContext;
