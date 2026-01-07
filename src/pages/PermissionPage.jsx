import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useGesture } from '../context/GestureContext';
import './PermissionPage.css';

const PermissionPage = () => {
    const { speak } = useAudio();
    const { cameraStatus, requestCameraPermission } = useGesture();
    const navigate = useNavigate();
    const hasSpoken = useRef(false);

    const [consent, setConsent] = useState(false);
    const [testing, setTesting] = useState(false);

    const dummyData = {
        camera_status: cameraStatus,
        privacy_message: "Your camera feed never leaves your device.",
        gesture_test_phrase: "Draw the letter A in the air"
    };

    useEffect(() => {
        if (!hasSpoken.current) {
            hasSpoken.current = true;
            speak('Camera and gesture permission page. Kine needs camera access to recognize your hand gestures. Your camera feed never leaves your device. Check the consent box and press Continue to grant permission.');
        }
    }, [speak]);

    const handleConsentChange = (checked) => {
        setConsent(checked);
        speak(checked ? 'Privacy consent granted' : 'Privacy consent removed');
    };

    const handleRequestPermission = async () => {
        if (!consent) {
            speak('Please check the privacy consent checkbox first.');
            return;
        }

        speak('Requesting camera permission. Please allow access when your browser asks.');
        const granted = await requestCameraPermission();

        if (granted) {
            speak('Camera permission granted. You can now proceed to calibration.');
        } else {
            speak('Camera permission was denied. Kine needs camera access to work. Please try again or check your browser settings.');
        }
    };

    const handleTestCamera = () => {
        setTesting(true);
        speak('Testing camera. Please wait.');

        // Simulate a test
        setTimeout(() => {
            setTesting(false);
            speak('Camera test successful. Your camera is working properly.');
        }, 2000);
    };

    const handleContinue = () => {
        if (cameraStatus === 'granted' || cameraStatus === 'active') {
            speak('Proceeding to gesture calibration.');
            setTimeout(() => navigate('/calibration'), 1000);
        } else {
            speak('Please grant camera permission before continuing.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
        }
    };

    return (
        <div className="permission-page" onKeyDown={handleKeyDown}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <main id="main-content" className="permission-main">
                <div className="permission-card animate-fade-in">
                    {/* Icon */}
                    <div className="permission-icon" aria-hidden="true">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    </div>

                    <h1>Camera Access Required</h1>
                    <p className="permission-desc">
                        Kine uses your camera to recognize hand gestures and convert them to text.
                        This enables hands-free typing and navigation.
                    </p>

                    {/* Privacy Notice */}
                    <div className="privacy-notice" role="region" aria-label="Privacy information">
                        <div className="privacy-icon" aria-hidden="true">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <div className="privacy-content">
                            <strong>Your Privacy is Protected</strong>
                            <p>{dummyData.privacy_message}</p>
                            <ul>
                                <li>All processing happens on your device</li>
                                <li>No video is recorded or stored</li>
                                <li>No data is sent to external servers</li>
                            </ul>
                        </div>
                    </div>

                    {/* Consent Checkbox */}
                    <label className="consent-checkbox">
                        <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => handleConsentChange(e.target.checked)}
                            onFocus={() => speak('Privacy consent checkbox')}
                        />
                        <span className="checkbox-custom" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </span>
                        <span className="checkbox-label">
                            I understand and consent to camera access for gesture recognition
                        </span>
                    </label>

                    {/* Status Indicator */}
                    <div className="camera-status" role="status" aria-live="polite">
                        <div className={`status-indicator ${cameraStatus === 'granted' || cameraStatus === 'active' ? 'granted' : cameraStatus === 'denied' ? 'denied' : 'pending'}`}>
                            {cameraStatus === 'granted' || cameraStatus === 'active' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            ) : cameraStatus === 'denied' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            )}
                        </div>
                        <span className="status-text">
                            {cameraStatus === 'granted' || cameraStatus === 'active'
                                ? 'Camera access granted'
                                : cameraStatus === 'denied'
                                    ? 'Camera access denied'
                                    : 'Camera permission required'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="permission-actions">
                        {cameraStatus !== 'granted' && cameraStatus !== 'active' ? (
                            <button
                                className="btn btn-primary btn-lg w-full"
                                onClick={handleRequestPermission}
                                disabled={!consent}
                                aria-label="Grant camera access"
                                onFocus={() => speak('Grant camera access button')}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                Grant Camera Access
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleTestCamera}
                                    disabled={testing}
                                    aria-label="Test camera"
                                    onFocus={() => speak('Test camera button')}
                                >
                                    {testing ? 'Testing...' : '🎥 Test Camera'}
                                </button>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleContinue}
                                    aria-label="Continue to calibration"
                                    onFocus={() => speak('Continue to calibration')}
                                >
                                    Continue to Calibration →
                                </button>
                            </>
                        )}
                    </div>

                    {/* Skip Option */}
                    <button
                        className="skip-button"
                        onClick={() => {
                            speak('Skipping camera setup. You can enable it later in settings.');
                            navigate('/workspace');
                        }}
                        aria-label="Skip camera setup for now"
                    >
                        Skip for now (limited functionality)
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PermissionPage;
