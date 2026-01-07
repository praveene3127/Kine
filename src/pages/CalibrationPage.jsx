import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useGesture } from '../context/GestureContext';
import './CalibrationPage.css';

const CalibrationPage = () => {
    const { speak } = useAudio();
    const { simulateGesture, saveCalibration } = useGesture();
    const navigate = useNavigate();
    const hasSpoken = useRef(false);

    const dummyData = {
        calibration_steps: ["A", "B", "C", "Delete gesture", "Confirm gesture"],
        attempts_per_gesture: 3,
        accuracy_score: 0.87
    };

    const [currentStep, setCurrentStep] = useState(0);
    const [currentAttempt, setCurrentAttempt] = useState(1);
    const [isRecording, setIsRecording] = useState(false);
    const [stepResults, setStepResults] = useState([]);
    const [overallAccuracy, setOverallAccuracy] = useState(0);

    useEffect(() => {
        if (!hasSpoken.current) {
            hasSpoken.current = true;
            speak(`Gesture calibration. We'll practice ${dummyData.calibration_steps.length} gestures, ${dummyData.attempts_per_gesture} times each. This helps Kine learn your style. Press Space or click Start to begin.`);
        }
    }, [speak, dummyData.calibration_steps.length, dummyData.attempts_per_gesture]);

    const currentGesture = dummyData.calibration_steps[currentStep];

    const startRecording = () => {
        setIsRecording(true);
        speak(`Draw ${currentGesture} in the air. Attempt ${currentAttempt} of ${dummyData.attempts_per_gesture}.`);

        // Simulate gesture recognition after 2 seconds
        setTimeout(() => {
            const result = simulateGesture(currentGesture);
            handleGestureResult(result);
        }, 2000);
    };

    const handleGestureResult = (result) => {
        setIsRecording(false);

        const isGood = result.confidence > 0.8;
        speak(isGood ? 'Good!' : 'Try again');

        if (currentAttempt >= dummyData.attempts_per_gesture) {
            // Move to next step
            const newResults = [...stepResults, { gesture: currentGesture, accuracy: result.confidence }];
            setStepResults(newResults);

            if (currentStep < dummyData.calibration_steps.length - 1) {
                setCurrentStep(prev => prev + 1);
                setCurrentAttempt(1);
                speak(`Great! Next gesture: ${dummyData.calibration_steps[currentStep + 1]}`);
            } else {
                // Calibration complete
                const avgAccuracy = newResults.reduce((sum, r) => sum + r.accuracy, 0) / newResults.length;
                setOverallAccuracy(avgAccuracy);
                saveCalibration({ results: newResults, accuracy: avgAccuracy, timestamp: new Date().toISOString() });
                speak(`Calibration complete! Your overall accuracy is ${Math.round(avgAccuracy * 100)} percent. You're ready to start using Kine.`);
            }
        } else {
            setCurrentAttempt(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        speak('Skipping calibration. You can calibrate later in settings.');
        navigate('/workspace');
    };

    const handleComplete = () => {
        speak('Proceeding to the main workspace.');
        navigate('/workspace');
    };

    const handleKeyDown = (e) => {
        if (e.key === ' ' && !isRecording && currentStep < dummyData.calibration_steps.length) {
            e.preventDefault();
            startRecording();
        }
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
        }
    };

    const isComplete = currentStep >= dummyData.calibration_steps.length;
    const progress = ((currentStep + (currentAttempt - 1) / dummyData.attempts_per_gesture) / dummyData.calibration_steps.length) * 100;

    return (
        <div className="calibration-page" onKeyDown={handleKeyDown} tabIndex={0}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* Progress Bar */}
            <div className="calibration-progress">
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">
                    {isComplete ? 'Complete!' : `Step ${currentStep + 1} of ${dummyData.calibration_steps.length}`}
                </span>
            </div>

            <main id="main-content" className="calibration-main">
                {!isComplete ? (
                    <div className="calibration-content animate-fade-in">
                        {/* Gesture Display */}
                        <div className="gesture-display">
                            <div className={`gesture-circle ${isRecording ? 'recording' : ''}`}>
                                <span className="gesture-label">{currentGesture}</span>
                                {isRecording && (
                                    <div className="recording-indicator">
                                        <div className="pulse-ring"></div>
                                        <div className="pulse-ring delay"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="calibration-instructions">
                            <h1>Draw "{currentGesture}"</h1>
                            <p>
                                {isRecording
                                    ? 'Recording... Move your hand to draw the gesture'
                                    : 'Position your hand in front of the camera and press Start'}
                            </p>
                        </div>

                        {/* Attempt Indicators */}
                        <div className="attempt-indicators" aria-label={`Attempt ${currentAttempt} of ${dummyData.attempts_per_gesture}`}>
                            {Array.from({ length: dummyData.attempts_per_gesture }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`attempt-dot ${i < currentAttempt - 1 ? 'complete' : i === currentAttempt - 1 ? 'current' : ''}`}
                                    aria-hidden="true"
                                ></div>
                            ))}
                        </div>

                        {/* Action Button */}
                        <button
                            className={`btn btn-primary btn-lg record-button ${isRecording ? 'recording' : ''}`}
                            onClick={startRecording}
                            disabled={isRecording}
                            aria-label={isRecording ? 'Recording gesture' : 'Start recording gesture'}
                        >
                            {isRecording ? (
                                <>
                                    <span className="recording-dot"></span>
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                    Start (or press Space)
                                </>
                            )}
                        </button>

                        {/* Steps Preview */}
                        <div className="steps-preview">
                            {dummyData.calibration_steps.map((step, i) => (
                                <div
                                    key={i}
                                    className={`step-chip ${i < currentStep ? 'complete' : i === currentStep ? 'current' : ''}`}
                                >
                                    {i < currentStep ? '✓' : step}
                                </div>
                            ))}
                        </div>

                        {/* Skip Button */}
                        <button className="skip-button" onClick={handleSkip}>
                            Skip calibration
                        </button>
                    </div>
                ) : (
                    /* Completion Screen */
                    <div className="calibration-complete animate-fade-in">
                        <div className="complete-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>

                        <h1>Calibration Complete!</h1>
                        <p>Kine has learned your gesture style</p>

                        {/* Accuracy Display */}
                        <div className="accuracy-display">
                            <div className="accuracy-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        strokeDasharray={`${overallAccuracy * 283} 283`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="var(--color-accent-primary)" />
                                            <stop offset="100%" stopColor="var(--color-accent-secondary)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <span className="accuracy-value">{Math.round(overallAccuracy * 100)}%</span>
                            </div>
                            <span className="accuracy-label">Overall Accuracy</span>
                        </div>

                        {/* Results Summary */}
                        <div className="results-summary">
                            {stepResults.map((result, i) => (
                                <div key={i} className="result-item">
                                    <span className="result-gesture">{result.gesture}</span>
                                    <div className="result-bar">
                                        <div className="result-fill" style={{ width: `${result.accuracy * 100}%` }}></div>
                                    </div>
                                    <span className="result-percent">{Math.round(result.accuracy * 100)}%</span>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleComplete}
                            aria-label="Start using Kine"
                        >
                            Start Using Kine →
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CalibrationPage;
