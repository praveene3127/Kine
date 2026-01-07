import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import Sidebar from '../components/Sidebar';
import './AIAssistPage.css';

const AIAssistPage = () => {
    const { speak } = useAudio();
    const hasSpoken = useRef(false);

    const dummyData = {
        rewrite_options: ["Shorten", "Make formal", "Fix grammar", "Translate"],
        selected_option: null,
        original_text: "Hello this is a test message for today.",
        ai_output: ""
    };

    const [originalText, setOriginalText] = useState(dummyData.original_text);
    const [selectedOption, setSelectedOption] = useState(null);
    const [aiOutput, setAiOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const rewriteOptions = [
        { id: 'shorten', label: 'Shorten', icon: '✂️', desc: 'Make text more concise' },
        { id: 'formal', label: 'Make Formal', icon: '👔', desc: 'Professional tone' },
        { id: 'grammar', label: 'Fix Grammar', icon: '📝', desc: 'Correct errors' },
        { id: 'translate', label: 'Translate', icon: '🌍', desc: 'Convert to another language' },
        { id: 'expand', label: 'Expand', icon: '📖', desc: 'Add more detail' },
        { id: 'simplify', label: 'Simplify', icon: '💡', desc: 'Make easier to read' },
    ];

    useEffect(() => {
        if (!hasSpoken.current) {
            hasSpoken.current = true;
            speak('AI Assist page. Choose how you want to improve your text. Use Tab to navigate options and Enter to select.');
        }
    }, [speak]);

    const handleSelectOption = (option) => {
        setSelectedOption(option.id);
        speak(`Selected: ${option.label}. ${option.desc}. Press Enter to apply.`);
    };

    const handleApplyOption = () => {
        if (!selectedOption) {
            speak('Please select an option first');
            return;
        }

        setIsProcessing(true);
        speak('Processing with AI. Please wait.');

        // Simulate AI processing
        setTimeout(() => {
            const outputs = {
                shorten: 'Test message for today.',
                formal: 'Greetings, this message serves as a formal test for the current day.',
                grammar: 'Hello, this is a test message for today.',
                translate: 'Hola, este es un mensaje de prueba para hoy.',
                expand: 'Hello there! This is a comprehensive test message that I am sending for today\'s evaluation purposes.',
                simplify: 'Hi! This is a test message for today.',
            };

            setAiOutput(outputs[selectedOption] || originalText);
            setIsProcessing(false);
            speak(`Done! Here is the result: ${outputs[selectedOption]}`);
        }, 1500);
    };

    const handleAccept = () => {
        setOriginalText(aiOutput);
        setAiOutput('');
        setSelectedOption(null);
        speak('Changes accepted. Text updated.');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
        }
    };

    return (
        <div className="ai-assist-page" onKeyDown={handleKeyDown}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* Sidebar */}
            <Sidebar />

            <main id="main-content" className="main-content">
                <header className="header">
                    <h1 className="header-title">AI Assist</h1>
                    <p className="header-subtitle">Enhance your text with AI</p>
                </header>

                <div className="ai-content">
                    {/* Original Text */}
                    <section className="text-card card">
                        <h2>Your Text</h2>
                        <div className="text-display" role="textbox" aria-label="Original text">
                            {originalText}
                        </div>
                        <button className="btn btn-ghost" onClick={() => speak(originalText)}>
                            🔊 Read
                        </button>
                    </section>

                    {/* Options Grid */}
                    <section className="options-section" aria-label="AI enhancement options">
                        <h2>Choose Enhancement</h2>
                        <div className="options-grid">
                            {rewriteOptions.map((option) => (
                                <button
                                    key={option.id}
                                    className={`option-card ${selectedOption === option.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectOption(option)}
                                    onFocus={() => speak(`${option.label}. ${option.desc}`)}
                                    aria-pressed={selectedOption === option.id}
                                >
                                    <span className="option-icon" aria-hidden="true">{option.icon}</span>
                                    <span className="option-label">{option.label}</span>
                                    <span className="option-desc">{option.desc}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary btn-lg apply-btn"
                            onClick={handleApplyOption}
                            disabled={!selectedOption || isProcessing}
                            aria-label="Apply selected enhancement"
                        >
                            {isProcessing ? (
                                <>
                                    <span className="spinner" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                '✨ Apply Enhancement'
                            )}
                        </button>
                    </section>

                    {/* AI Output */}
                    {aiOutput && (
                        <section className="output-card card animate-fade-in" aria-label="AI generated text">
                            <div className="output-header">
                                <h2>AI Result</h2>
                                <span className="badge badge-success">Ready</span>
                            </div>
                            <div className="text-display ai-result">
                                {aiOutput}
                            </div>
                            <div className="output-actions">
                                <button className="btn btn-ghost" onClick={() => speak(aiOutput)}>
                                    🔊 Read
                                </button>
                                <button className="btn btn-primary" onClick={handleAccept}>
                                    ✓ Accept
                                </button>
                                <button className="btn btn-secondary" onClick={() => { setAiOutput(''); speak('Result discarded'); }}>
                                    ✕ Discard
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AIAssistPage;

