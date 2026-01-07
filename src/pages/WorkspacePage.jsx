import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useGesture } from '../context/GestureContext';
import KineLogo from '../components/KineLogo';
import './WorkspacePage.css';

const WorkspacePage = () => {
  const { speak, settings } = useAudio();
  const { simulateGesture, lastGesture, confidenceLevel, inputMode, setInputMode, cameraStatus, startCamera, stopCamera, onGestureDetected, isGestureDetectionActive } = useGesture();
  const hasSpoken = useRef(false);
  const textAreaRef = useRef(null);
  const cameraVideoRef = useRef(null);

  const [text, setText] = useState('');
  const [aiPrediction, setAiPrediction] = useState('');
  const [isListening, setIsListening] = useState(true);

  const dummyData = {
    current_text: "Hello this is a test message",
    input_mode: "gesture_typing",
    ai_prediction: "Would you like to continue with 'for today'?",
    last_gesture: "letter-e",
    confidence_level: 0.92
  };

  useEffect(() => {
    if (!hasSpoken.current) {
      hasSpoken.current = true;
      speak('Gesture workspace ready. Enable your camera to start typing with gestures.');
    }
  }, [speak]);

  // Listen for gesture events from MediaPipe
  useEffect(() => {
    onGestureDetected((gestureEvent) => {
      const { gesture, confidence } = gestureEvent;
      console.log('Gesture detected:', gesture, 'confidence:', confidence);

      if (gesture === 'delete') {
        handleDelete();
      } else if (gesture === 'space') {
        handleSimulateGesture(' ');
      } else {
        // It's a letter
        handleSimulateGesture(gesture.toLowerCase());
      }
    });
  }, [onGestureDetected]);

  // Simulate receiving gestures
  const handleSimulateGesture = (letter) => {
    const result = simulateGesture(letter);

    if (settings.confirmEveryLetter) {
      speak(letter);
    }

    setText(prev => {
      const newText = prev + letter;

      // Check for word completion
      if (letter === ' ' && settings.confirmEveryWord) {
        const words = newText.trim().split(' ');
        const lastWord = words[words.length - 1];
        if (lastWord) {
          speak(lastWord);
        }
      }

      return newText;
    });

    // Simulate AI prediction after a few characters
    if (text.length > 10 && Math.random() > 0.7) {
      const predictions = [' for today', ' meeting', ' tomorrow', ' please'];
      setAiPrediction(predictions[Math.floor(Math.random() * predictions.length)]);
    }
  };

  const handleAcceptPrediction = () => {
    if (aiPrediction) {
      setText(prev => prev + aiPrediction);
      speak(`Added: ${aiPrediction}`);
      setAiPrediction('');
    }
  };

  const handleDelete = () => {
    setText(prev => {
      const newText = prev.slice(0, -1);
      speak('Deleted');
      return newText;
    });
  };

  const handleClear = () => {
    setText('');
    speak('Text cleared');
    setAiPrediction('');
  };

  const handleModeToggle = () => {
    const newMode = inputMode === 'gesture_typing' ? 'gesture_command' : 'gesture_typing';
    setInputMode(newMode);
    speak(`Switched to ${newMode === 'gesture_typing' ? 'typing mode' : 'command mode'}`);
  };

  // Camera handlers
  const handleStartCamera = async () => {
    if (cameraVideoRef.current) {
      await startCamera(cameraVideoRef.current);
    }
  };

  const handleToggleCamera = async () => {
    if (cameraStatus === 'active') {
      stopCamera();
    } else if (cameraStatus === 'granted') {
      if (cameraVideoRef.current) {
        await startCamera(cameraVideoRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      window.speechSynthesis?.cancel();
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      handleModeToggle();
    }
    // Keyboard delete support
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      handleDelete();
    }
  };

  return (
    <div className="workspace-page" onKeyDown={handleKeyDown}>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        <div className="sidebar-logo-container">
          <KineLogo size={48} showText={false} />
        </div>

        <nav className="sidebar-nav">
          <Link to="/workspace" className="sidebar-link active" aria-label="Workspace" aria-current="page">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
          </Link>
          <Link to="/review" className="sidebar-link" aria-label="Review text">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          </Link>
          <Link to="/ai-assist" className="sidebar-link" aria-label="AI assistance">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
            </svg>
          </Link>
          <Link to="/settings" className="sidebar-link" aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </Link>
          <Link to="/help" className="sidebar-link" aria-label="Help">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="main-content">
        {/* Header */}
        <header className="header">
          <h1 className="header-title">Workspace</h1>
          <div className="header-actions">
            <div className="mode-indicator">
              <span className={`mode-badge ${inputMode === 'gesture_typing' ? 'typing' : 'command'}`}>
                {inputMode === 'gesture_typing' ? '✏️ Typing' : '⚡ Command'}
              </span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => speak(text || 'No text yet')}
              aria-label="Read current text"
            >
              🔊 Read
            </button>
          </div>
        </header>

        {/* Workspace Grid */}
        <div className="workspace-grid">
          {/* Camera View */}
          <section className="camera-section card" aria-label="Camera feed">
            <div className="camera-header">
              <h2>Camera</h2>
              <div className={`status-dot ${cameraStatus === 'active' ? 'active' : ''}`} aria-label={cameraStatus === 'active' ? 'Camera active' : 'Camera inactive'}></div>
            </div>
            <div className="camera-view">
              {/* Video element always in DOM for ref, hidden when not active */}
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{ display: cameraStatus === 'active' ? 'block' : 'none' }}
                aria-label="Live camera feed"
              />

              {/* Show appropriate placeholder based on status */}
              {cameraStatus === 'granted' && (
                <div className="camera-placeholder camera-paused">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p>Camera Paused</p>
                  <span className="camera-hint">Click "Camera On" to resume</span>
                </div>
              )}

              {cameraStatus === 'denied' && (
                <div className="camera-placeholder camera-denied">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M1 1l22 22M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
                    <path d="M9.5 9.5A4 4 0 1 0 15.27 14" />
                  </svg>
                  <p>Camera Access Denied</p>
                  <span className="camera-hint">Please enable camera in browser settings</span>
                </div>
              )}

              {cameraStatus === 'not_granted' && (
                <div className="camera-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <p>Camera Preview</p>
                  <button
                    className="btn btn-primary"
                    onClick={handleStartCamera}
                    aria-label="Start camera"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>

            {/* Camera Toggle */}
            {cameraStatus !== 'not_granted' && cameraStatus !== 'denied' && (
              <div className="camera-toggle">
                <button
                  className={`btn ${cameraStatus === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleToggleCamera}
                  aria-label={cameraStatus === 'active' ? 'Turn off camera' : 'Turn on camera'}
                >
                  {cameraStatus === 'active' ? '⏹ Camera Off' : '▶ Camera On'}
                </button>
              </div>
            )}

            {/* Gesture Detection Status */}
            {isGestureDetectionActive && (
              <div className="gesture-status" role="status" aria-live="polite">
                <div className="status-indicator active">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span className="status-text">Gesture detection active</span>
              </div>
            )}

            {/* Last Gesture */}
            {lastGesture && (
              <div className="last-gesture" role="status" aria-live="polite">
                <span className="gesture-name">Last: {lastGesture}</span>
                <span className="gesture-confidence">{Math.round(confidenceLevel * 100)}%</span>
              </div>
            )}
          </section>

          {/* Text Area */}
          <section className="text-section card" aria-label="Text input area">
            <div className="text-header">
              <h2>Your Text</h2>
              <span className="char-count">{text.length} characters</span>
            </div>

            <div
              className="text-display"
              ref={textAreaRef}
              role="textbox"
              aria-label="Current text"
              aria-multiline="true"
              tabIndex={0}
            >
              {text || <span className="placeholder">Start drawing gestures to type...</span>}
              <span className="cursor" aria-hidden="true"></span>
            </div>

            {/* AI Prediction */}
            {aiPrediction && (
              <div className="ai-prediction" role="status" aria-live="polite">
                <span className="prediction-label">AI suggests:</span>
                <span className="prediction-text">"{aiPrediction}"</span>
                <button
                  className="btn btn-ghost"
                  onClick={handleAcceptPrediction}
                  aria-label={`Accept suggestion: ${aiPrediction}`}
                >
                  Accept
                </button>
              </div>
            )}

            {/* Text Actions */}
            <div className="text-actions">
              <button className="btn btn-ghost" onClick={handleDelete} aria-label="Delete last character">
                ← Delete
              </button>
              <button className="btn btn-ghost" onClick={() => handleSimulateGesture(' ')} aria-label="Add space">
                Space
              </button>
              <button className="btn btn-ghost" onClick={handleClear} aria-label="Clear all text">
                Clear All
              </button>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="actions-section card" aria-label="Quick actions">
            <h2>Quick Actions</h2>
            <div className="action-grid">
              <Link to="/review" className="action-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Review</span>
              </Link>
              <Link to="/ai-assist" className="action-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
                </svg>
                <span>AI Assist</span>
              </Link>
              <button
                className="action-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(text);
                  speak('Copied to clipboard');
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                <span>Copy</span>
              </button>
              <button
                className="action-btn"
                onClick={() => speak(text || 'No text to read')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>Read All</span>
              </button>
            </div>
          </section>

          {/* Gesture Simulator (for demo) */}
          <section className="simulator-section card" aria-label="Gesture simulator for testing">
            <h2>Test Gestures</h2>
            <p className="simulator-desc">Click letters to simulate gesture input</p>
            <div className="simulator-keyboard">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                <button
                  key={letter}
                  className="sim-key"
                  onClick={() => handleSimulateGesture(letter.toLowerCase())}
                  aria-label={`Simulate gesture for letter ${letter}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default WorkspacePage;
