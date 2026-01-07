import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import Sidebar from '../components/Sidebar';
import './HelpPage.css';

const HelpPage = () => {
    const { speak } = useAudio();
    const hasSpoken = useRef(false);

    const dummyData = {
        help_topics: ["How gestures work", "Editing text", "AI features", "Keyboard shortcuts", "Accessibility", "Privacy"],
        selected_topic: null,
        audio_length: "3 minutes"
    };

    const [selectedTopic, setSelectedTopic] = useState(null);

    const topics = [
        {
            id: 'gestures',
            title: 'How Gestures Work',
            icon: '✋',
            duration: '3 min',
            content: `Kine uses your camera to track hand movements and convert them into text. 
      
      To draw a letter, position your hand in front of the camera with your index finger extended. Move your finger to trace the shape of the letter in the air. The camera tracks your movement and recognizes the pattern.
      
      Tips for better recognition:
      - Keep your hand at a comfortable distance from the camera
      - Draw letters large and clear
      - Maintain consistent speed
      - Good lighting helps accuracy`
        },
        {
            id: 'editing',
            title: 'Editing Text',
            icon: '✏️',
            duration: '2 min',
            content: `After entering text with gestures, you can edit it using special gesture commands or the on-screen controls.
      
      Common editing gestures:
      - Swipe left: Delete last character
      - Swipe right: Add space
      - Circle: Delete word
      - Check mark: Confirm/Enter
      
      You can also use the Review page to make detailed edits using the command buttons.`
        },
        {
            id: 'ai',
            title: 'AI Features',
            icon: '🤖',
            duration: '2 min',
            content: `Kine includes AI-powered features to help you write better and faster.
      
      Autocomplete: As you type, Kine suggests words and phrases. Accept suggestions by drawing a check mark gesture or pressing the Accept button.
      
      AI Assist: Visit the AI Assist page to enhance your text. You can shorten, formalize, fix grammar, translate, expand, or simplify your text with one tap.`
        },
        {
            id: 'keyboard',
            title: 'Keyboard Shortcuts',
            icon: '⌨️',
            duration: '1 min',
            content: `Kine is fully keyboard accessible. Here are the main shortcuts:
      
      - Tab: Navigate between elements
      - Enter/Space: Activate buttons
      - Escape: Stop audio playback
      - R: Read current text (on Review page)
      - E: Toggle edit mode (on Review page)
      - ?: Show keyboard help
      - Arrow keys: Navigate within sections`
        },
        {
            id: 'accessibility',
            title: 'Accessibility',
            icon: '♿',
            duration: '2 min',
            content: `Kine is designed audio-first for users who are blind or have low vision.
      
      Every action has audio feedback. Screen reader users can navigate with standard keyboard commands. All interactive elements have proper labels and focus indicators.
      
      Customize your experience in Settings:
      - Adjust speech rate
      - Change voice
      - Set feedback verbosity
      - Enable letter-by-letter confirmation`
        },
        {
            id: 'privacy',
            title: 'Privacy',
            icon: '🔒',
            duration: '1 min',
            content: `Your privacy is important to us.
      
      Camera processing: All gesture recognition happens on your device. No video is recorded or sent anywhere.
      
      Data storage: Your text and settings are stored locally on your device only.
      
      Cloud processing: Optional cloud AI features can be disabled in Settings. When disabled, all processing is 100% local.`
        },
    ];

    useEffect(() => {
        if (!hasSpoken.current) {
            hasSpoken.current = true;
            speak('Help and documentation page. Choose a topic to learn more. Use Tab to navigate topics and Enter to select.');
        }
    }, [speak]);

    const handleSelectTopic = (topic) => {
        setSelectedTopic(topic);
        speak(`${topic.title}. ${topic.content}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
            if (selectedTopic) {
                setSelectedTopic(null);
                speak('Closed topic. Back to topic list.');
            }
        }
    };

    return (
        <div className="help-page" onKeyDown={handleKeyDown}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* Sidebar */}
            <Sidebar />

            <main id="main-content" className="main-content">
                <header className="header">
                    <h1 className="header-title">Help & Documentation</h1>
                    <p className="header-subtitle">Learn how to use Kine</p>
                </header>

                <div className="help-content">
                    {!selectedTopic ? (
                        /* Topic List */
                        <section className="topics-grid" aria-label="Help topics">
                            {topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    className="topic-card"
                                    onClick={() => handleSelectTopic(topic)}
                                    onFocus={() => speak(`${topic.title}. Duration: ${topic.duration}`)}
                                    aria-label={`${topic.title}. Duration: ${topic.duration}`}
                                >
                                    <span className="topic-icon" aria-hidden="true">{topic.icon}</span>
                                    <div className="topic-info">
                                        <h2>{topic.title}</h2>
                                        <span className="topic-duration">🎧 {topic.duration}</span>
                                    </div>
                                    <svg className="topic-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            ))}
                        </section>
                    ) : (
                        /* Topic Detail */
                        <article className="topic-detail card animate-fade-in" aria-label={selectedTopic.title}>
                            <button
                                className="back-btn"
                                onClick={() => { setSelectedTopic(null); speak('Back to topics'); }}
                                aria-label="Back to topic list"
                            >
                                ← Back to topics
                            </button>

                            <div className="topic-header">
                                <span className="topic-icon-large" aria-hidden="true">{selectedTopic.icon}</span>
                                <div>
                                    <h2>{selectedTopic.title}</h2>
                                    <span className="topic-duration">🎧 {selectedTopic.duration}</span>
                                </div>
                            </div>

                            <div className="topic-content">
                                {selectedTopic.content.split('\n\n').map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>

                            <div className="topic-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => speak(selectedTopic.content)}
                                    aria-label="Read this topic aloud"
                                >
                                    🔊 Read Aloud
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => window.speechSynthesis?.cancel()}
                                    aria-label="Stop reading"
                                >
                                    ⏹ Stop
                                </button>
                            </div>
                        </article>
                    )}

                    {/* Quick Help */}
                    <section className="quick-help card">
                        <h2>Need More Help?</h2>
                        <p>Press <kbd>?</kbd> anywhere for keyboard shortcuts</p>
                        <p>Press <kbd>Esc</kbd> to stop audio at any time</p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default HelpPage;

