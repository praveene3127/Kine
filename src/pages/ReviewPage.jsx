import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import Sidebar from '../components/Sidebar';
import './ReviewPage.css';

const ReviewPage = () => {
    const { speak } = useAudio();
    const navigate = useNavigate();
    const hasSpoken = useRef(false);

    const dummyData = {
        document_id: "doc_123",
        content: "Hello this is a test message for today.",
        cursor_position: 34,
        edit_commands: ["delete last word", "insert punctuation"]
    };

    const [content, setContent] = useState(dummyData.content);
    const [isEditing, setIsEditing] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(dummyData.cursor_position);

    useEffect(() => {
        if (!hasSpoken.current) {
            hasSpoken.current = true;
            speak(`Text review page. Your document contains: ${content}. Press R to read again, E to edit, or use arrow keys to navigate.`);
        }
    }, [speak, content]);

    const handleRead = () => {
        speak(content || 'No content to read');
    };

    const handleReadWord = () => {
        const words = content.split(' ');
        const wordIndex = content.substring(0, cursorPosition).split(' ').length - 1;
        if (words[wordIndex]) {
            speak(words[wordIndex]);
        }
    };

    const handleUndo = () => {
        speak('Undo action performed');
        // Simulated undo
    };

    const handleRedo = () => {
        speak('Redo action performed');
        // Simulated redo
    };

    const handleDeleteWord = () => {
        const words = content.trim().split(' ');
        if (words.length > 0) {
            const deletedWord = words.pop();
            setContent(words.join(' '));
            speak(`Deleted: ${deletedWord}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
        }
        if (e.key === 'r' && !isEditing) {
            handleRead();
        }
        if (e.key === 'e') {
            setIsEditing(!isEditing);
            speak(isEditing ? 'Exited edit mode' : 'Entered edit mode');
        }
    };

    return (
        <div className="review-page" onKeyDown={handleKeyDown}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* Sidebar */}
            <Sidebar />

            <main id="main-content" className="main-content">
                <header className="header">
                    <div>
                        <h1 className="header-title">Review & Edit</h1>
                        <p className="header-subtitle">Document ID: {dummyData.document_id}</p>
                    </div>
                    <div className="header-actions">
                        <span className={`edit-badge ${isEditing ? 'active' : ''}`}>
                            {isEditing ? '✏️ Editing' : '👁️ Viewing'}
                        </span>
                    </div>
                </header>

                <div className="review-content">
                    {/* Document Card */}
                    <section className="document-card card">
                        <div className="document-header">
                            <h2>Your Text</h2>
                            <div className="document-stats">
                                <span>{content.split(' ').filter(w => w).length} words</span>
                                <span>{content.length} characters</span>
                            </div>
                        </div>

                        <div
                            className={`document-text ${isEditing ? 'editable' : ''}`}
                            role="textbox"
                            aria-label="Document content"
                            contentEditable={isEditing}
                            suppressContentEditableWarning
                            onInput={(e) => setContent(e.currentTarget.textContent || '')}
                        >
                            {content}
                        </div>

                        {/* Audio Controls */}
                        <div className="audio-controls">
                            <button className="btn btn-secondary" onClick={handleRead} aria-label="Read all text">
                                🔊 Read All
                            </button>
                            <button className="btn btn-ghost" onClick={handleReadWord} aria-label="Read current word">
                                📖 Read Word
                            </button>
                        </div>
                    </section>

                    {/* Edit Commands */}
                    <section className="commands-card card">
                        <h2>Edit Commands</h2>
                        <p>Use gestures or buttons to edit</p>

                        <div className="command-list">
                            <button className="command-btn" onClick={handleUndo}>
                                <span className="command-icon">↩️</span>
                                <span className="command-name">Undo</span>
                                <kbd>Ctrl+Z</kbd>
                            </button>
                            <button className="command-btn" onClick={handleRedo}>
                                <span className="command-icon">↪️</span>
                                <span className="command-name">Redo</span>
                                <kbd>Ctrl+Y</kbd>
                            </button>
                            <button className="command-btn" onClick={handleDeleteWord}>
                                <span className="command-icon">🗑️</span>
                                <span className="command-name">Delete Word</span>
                                <kbd>Ctrl+⌫</kbd>
                            </button>
                            <button className="command-btn" onClick={() => { setContent(content + '.'); speak('Period added'); }}>
                                <span className="command-icon">.</span>
                                <span className="command-name">Add Period</span>
                            </button>
                            <button className="command-btn" onClick={() => { setContent(content + ','); speak('Comma added'); }}>
                                <span className="command-icon">,</span>
                                <span className="command-name">Add Comma</span>
                            </button>
                            <button className="command-btn" onClick={() => { setContent(content + '?'); speak('Question mark added'); }}>
                                <span className="command-icon">?</span>
                                <span className="command-name">Add Question</span>
                            </button>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="actions-card card">
                        <h2>Actions</h2>
                        <div className="action-buttons">
                            <Link to="/ai-assist" className="btn btn-primary">
                                ✨ AI Enhance
                            </Link>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    navigator.clipboard?.writeText(content);
                                    speak('Copied to clipboard');
                                }}
                            >
                                📋 Copy
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    speak('Sending to communication hub');
                                    // Navigate to send
                                }}
                            >
                                📤 Send
                            </button>
                        </div>
                    </section>
                </div>

                {/* Keyboard Hints */}
                <div className="keyboard-hints">
                    <div className="hint"><kbd>R</kbd> Read</div>
                    <div className="hint"><kbd>E</kbd> Toggle Edit</div>
                    <div className="hint"><kbd>Esc</kbd> Stop Audio</div>
                </div>
            </main>
        </div>
    );
};

export default ReviewPage;
