import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import Sidebar from '../components/Sidebar';
import { useGesture } from '../context/GestureContext';
import './SettingsPage.css';

const SettingsPage = () => {
    const { speak, settings: audioSettings, updateSettings: updateAudioSettings, voices } = useAudio();
    const { sensitivity, updateSensitivity } = useGesture();
    const hasSpoken = useRef(false);

    const [localSettings, setLocalSettings] = useState({
        audio_feedback: audioSettings.feedbackLevel,
        gesture_sensitivity: sensitivity,
        ai_autocomplete: true,
        cloud_processing: false,
        voice: audioSettings.voice,
        speech_rate: audioSettings.rate === 0.8 ? 'slow' : audioSettings.rate === 1.2 ? 'fast' : 'medium',
    });

    useEffect(() => {
        if (!hasSpoken.current) {
            hasSpoken.current = true;
            speak('Settings page. Configure audio, gesture, AI, and privacy settings. Use Tab to navigate.');
        }
    }, [speak]);

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        speak(`${key.replace(/_/g, ' ')} set to ${value}`);

        // Apply changes immediately
        if (key === 'audio_feedback') {
            updateAudioSettings({ feedbackLevel: value });
        }
        if (key === 'gesture_sensitivity') {
            updateSensitivity(value);
        }
        if (key === 'speech_rate') {
            const rate = value === 'slow' ? 0.8 : value === 'fast' ? 1.2 : 1;
            updateAudioSettings({ rate });
        }
        if (key === 'voice') {
            updateAudioSettings({ voice: value });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
        }
    };

    return (
        <div className="settings-page" onKeyDown={handleKeyDown}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* Sidebar */}
            <Sidebar />

            <main id="main-content" className="main-content">
                <header className="header">
                    <h1 className="header-title">Settings</h1>
                </header>

                <div className="settings-grid">
                    {/* Audio Settings */}
                    <section className="settings-section card">
                        <div className="section-header">
                            <span className="section-icon" aria-hidden="true">🔊</span>
                            <h2>Audio</h2>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <label htmlFor="voice-select">Voice</label>
                                <span className="setting-desc">TTS voice for audio feedback</span>
                            </div>
                            <select
                                id="voice-select"
                                className="form-input form-select"
                                value={localSettings.voice}
                                onChange={(e) => handleChange('voice', e.target.value)}
                            >
                                <option value="default">System Default</option>
                                {voices.map((v, i) => (
                                    <option key={i} value={v.name}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <label htmlFor="rate-select">Speech Rate</label>
                                <span className="setting-desc">How fast Kine speaks</span>
                            </div>
                            <select
                                id="rate-select"
                                className="form-input form-select"
                                value={localSettings.speech_rate}
                                onChange={(e) => handleChange('speech_rate', e.target.value)}
                            >
                                <option value="slow">Slow</option>
                                <option value="medium">Medium</option>
                                <option value="fast">Fast</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <label htmlFor="feedback-select">Feedback Level</label>
                                <span className="setting-desc">How detailed audio feedback is</span>
                            </div>
                            <select
                                id="feedback-select"
                                className="form-input form-select"
                                value={localSettings.audio_feedback}
                                onChange={(e) => handleChange('audio_feedback', e.target.value)}
                            >
                                <option value="minimal">Minimal</option>
                                <option value="normal">Normal</option>
                                <option value="detailed">Detailed</option>
                            </select>
                        </div>
                    </section>

                    {/* Gesture Settings */}
                    <section className="settings-section card">
                        <div className="section-header">
                            <span className="section-icon" aria-hidden="true">✋</span>
                            <h2>Gestures</h2>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <label htmlFor="sensitivity-select">Gesture Sensitivity</label>
                                <span className="setting-desc">How sensitive gesture detection is</span>
                            </div>
                            <select
                                id="sensitivity-select"
                                className="form-input form-select"
                                value={localSettings.gesture_sensitivity}
                                onChange={(e) => handleChange('gesture_sensitivity', e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <span>Recalibrate Gestures</span>
                                <span className="setting-desc">Retrain gesture recognition</span>
                            </div>
                            <Link to="/calibration" className="btn btn-secondary">
                                Calibrate
                            </Link>
                        </div>
                    </section>

                    {/* AI Settings */}
                    <section className="settings-section card">
                        <div className="section-header">
                            <span className="section-icon" aria-hidden="true">🤖</span>
                            <h2>AI</h2>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <span>AI Autocomplete</span>
                                <span className="setting-desc">Show word predictions while typing</span>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    className="toggle-input"
                                    checked={localSettings.ai_autocomplete}
                                    onChange={(e) => handleChange('ai_autocomplete', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </section>

                    {/* Privacy Settings */}
                    <section className="settings-section card">
                        <div className="section-header">
                            <span className="section-icon" aria-hidden="true">🔒</span>
                            <h2>Privacy</h2>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <span>Cloud Processing</span>
                                <span className="setting-desc">Send data to cloud for better AI (off = local only)</span>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    className="toggle-input"
                                    checked={localSettings.cloud_processing}
                                    onChange={(e) => handleChange('cloud_processing', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <span>Delete All Data</span>
                                <span className="setting-desc">Remove all saved preferences and history</span>
                            </div>
                            <button
                                className="btn btn-secondary danger"
                                onClick={() => {
                                    speak('Are you sure you want to delete all data? This cannot be undone.');
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;

