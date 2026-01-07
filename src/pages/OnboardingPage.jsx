import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import './OnboardingPage.css';

const OnboardingPage = () => {
    const { speak, voices, updateSettings, settings } = useAudio();
    const navigate = useNavigate();
    const hasSpoken = useRef(false);

    const [formData, setFormData] = useState({
        tts_voice: settings.voice || 'default',
        speech_rate: settings.rate === 0.8 ? 'slow' : settings.rate === 1.2 ? 'fast' : 'medium',
        audio_feedback_level: settings.feedbackLevel || 'detailed',
        confirm_every_letter: settings.confirmEveryLetter || false,
        confirm_every_word: settings.confirmEveryWord || true,
    });

    const [currentStep, setCurrentStep] = useState(0);
    const steps = ['voice', 'speed', 'feedback', 'confirmation'];

    useEffect(() => {
        if (!hasSpoken.current) {
            hasSpoken.current = true;
            speak('Welcome to accessibility setup. Let\'s configure your audio preferences. Use Tab to move between options, and Enter to confirm.');
        }
    }, [speak]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Provide audio feedback
        if (field === 'tts_voice') {
            speak(`Voice changed to ${value}`);
        } else if (field === 'speech_rate') {
            speak(`Speech rate set to ${value}`);
        } else if (field === 'audio_feedback_level') {
            speak(`Feedback level set to ${value}`);
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            speak(`Step ${currentStep + 2} of ${steps.length}. ${getStepDescription(currentStep + 1)}`);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            speak(`Going back. Step ${currentStep} of ${steps.length}.`);
        }
    };

    const handleComplete = () => {
        const rate = formData.speech_rate === 'slow' ? 0.8 : formData.speech_rate === 'fast' ? 1.2 : 1;

        updateSettings({
            voice: formData.tts_voice,
            rate: rate,
            feedbackLevel: formData.audio_feedback_level,
            confirmEveryLetter: formData.confirm_every_letter,
            confirmEveryWord: formData.confirm_every_word,
        });

        speak('Settings saved. Now let\'s set up camera permissions for gesture input.');
        setTimeout(() => navigate('/permission'), 1500);
    };

    const getStepDescription = (step) => {
        const descriptions = [
            'Choose your preferred voice.',
            'Set your speech rate.',
            'Choose how detailed you want feedback.',
            'Set confirmation preferences.',
        ];
        return descriptions[step];
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
        }
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
                handleNext();
            }
        }
        if (e.key === 'ArrowLeft') {
            handleBack();
        }
    };

    return (
        <div className="onboarding-page" onKeyDown={handleKeyDown}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* Progress */}
            <div className="onboarding-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin="1" aria-valuemax={steps.length}>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    ></div>
                </div>
                <span className="progress-text">Step {currentStep + 1} of {steps.length}</span>
            </div>

            <main id="main-content" className="onboarding-main">
                <div className="onboarding-card animate-fade-in">
                    <div className="onboarding-header">
                        <h1>Accessibility Setup</h1>
                        <p>Configure Kine to work best for you</p>
                    </div>

                    {/* Step 1: Voice Selection */}
                    {currentStep === 0 && (
                        <div className="onboarding-step" role="group" aria-labelledby="voice-heading">
                            <h2 id="voice-heading">Choose Your Voice</h2>
                            <p>Select the voice you'd like Kine to use for audio feedback.</p>

                            <div className="form-group">
                                <label className="form-label" htmlFor="voice-select">Voice</label>
                                <select
                                    id="voice-select"
                                    className="form-input form-select"
                                    value={formData.tts_voice}
                                    onChange={(e) => handleChange('tts_voice', e.target.value)}
                                    onFocus={() => speak('Voice selection dropdown')}
                                >
                                    <option value="default">System Default</option>
                                    {voices.map((voice, index) => (
                                        <option key={index} value={voice.name}>
                                            {voice.name} ({voice.lang})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn btn-ghost"
                                onClick={() => speak('This is a sample of the selected voice.')}
                                aria-label="Test selected voice"
                            >
                                🔊 Test Voice
                            </button>
                        </div>
                    )}

                    {/* Step 2: Speech Rate */}
                    {currentStep === 1 && (
                        <div className="onboarding-step" role="group" aria-labelledby="speed-heading">
                            <h2 id="speed-heading">Speech Rate</h2>
                            <p>How fast should Kine speak?</p>

                            <div className="option-group">
                                {['slow', 'medium', 'fast'].map((speed) => (
                                    <label
                                        key={speed}
                                        className={`option-card ${formData.speech_rate === speed ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="speech_rate"
                                            value={speed}
                                            checked={formData.speech_rate === speed}
                                            onChange={(e) => handleChange('speech_rate', e.target.value)}
                                            onFocus={() => speak(`${speed} speed option`)}
                                        />
                                        <span className="option-label">{speed.charAt(0).toUpperCase() + speed.slice(1)}</span>
                                        <span className="option-desc">
                                            {speed === 'slow' && 'Best for learning'}
                                            {speed === 'medium' && 'Comfortable pace'}
                                            {speed === 'fast' && 'For experienced users'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Feedback Level */}
                    {currentStep === 2 && (
                        <div className="onboarding-step" role="group" aria-labelledby="feedback-heading">
                            <h2 id="feedback-heading">Feedback Detail</h2>
                            <p>How much audio feedback do you want?</p>

                            <div className="option-group vertical">
                                {[
                                    { value: 'minimal', label: 'Minimal', desc: 'Only essential confirmations' },
                                    { value: 'normal', label: 'Normal', desc: 'Standard feedback for actions' },
                                    { value: 'detailed', label: 'Detailed', desc: 'Complete narration of everything' },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className={`option-card horizontal ${formData.audio_feedback_level === option.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="feedback_level"
                                            value={option.value}
                                            checked={formData.audio_feedback_level === option.value}
                                            onChange={(e) => handleChange('audio_feedback_level', e.target.value)}
                                            onFocus={() => speak(`${option.label}. ${option.desc}`)}
                                        />
                                        <div className="option-content">
                                            <span className="option-label">{option.label}</span>
                                            <span className="option-desc">{option.desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation Settings */}
                    {currentStep === 3 && (
                        <div className="onboarding-step" role="group" aria-labelledby="confirm-heading">
                            <h2 id="confirm-heading">Confirmation Settings</h2>
                            <p>When should Kine confirm your input?</p>

                            <div className="toggle-group">
                                <label className="toggle-option">
                                    <div className="toggle-content">
                                        <span className="toggle-label">Confirm every letter</span>
                                        <span className="toggle-desc">Speak each letter as you type</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            className="toggle-input"
                                            checked={formData.confirm_every_letter}
                                            onChange={(e) => handleChange('confirm_every_letter', e.target.checked)}
                                            onFocus={() => speak('Toggle: Confirm every letter')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </label>

                                <label className="toggle-option">
                                    <div className="toggle-content">
                                        <span className="toggle-label">Confirm every word</span>
                                        <span className="toggle-desc">Speak each word after completion</span>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            className="toggle-input"
                                            checked={formData.confirm_every_word}
                                            onChange={(e) => handleChange('confirm_every_word', e.target.checked)}
                                            onFocus={() => speak('Toggle: Confirm every word')}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="onboarding-actions">
                        {currentStep > 0 && (
                            <button
                                className="btn btn-secondary"
                                onClick={handleBack}
                                aria-label="Go back to previous step"
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            aria-label={currentStep === steps.length - 1 ? 'Complete setup' : 'Continue to next step'}
                        >
                            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue →'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OnboardingPage;
