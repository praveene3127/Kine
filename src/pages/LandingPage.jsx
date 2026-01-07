import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import KineLogo from '../components/KineLogo';
import './LandingPage.css';

const LandingPage = () => {
    const { speak, settings } = useAudio();
    const { user, signInWithGoogle, signOut, loading } = useAuth();
    const hasSpoken = useRef(false);

    const dummyData = {
        headline: "Write with gestures. Hear everything.",
        description: "Gesture-to-Text Converter lets you write, communicate, and control your digital world using air gestures and AI.",
        primary_cta: "Start Gesture Input",
        secondary_cta: "Learn How It Works",
        audio_on_autoplay: true
    };

    useEffect(() => {
        if (settings.autoPlay && !hasSpoken.current) {
            hasSpoken.current = true;
            const welcomeMessage = `Welcome to Kine. ${dummyData.headline}. ${dummyData.description}. Press Tab to navigate, or Enter to start gesture input.`;
            speak(welcomeMessage);
        }
    }, [speak, settings.autoPlay, dummyData.headline, dummyData.description]);

    const handleKeyDown = (e) => {
        if (e.key === '?') {
            speak('Keyboard shortcuts: Tab to navigate between elements. Enter to activate buttons. Question mark for help. Escape to stop audio.');
        }
        if (e.key === 'Escape') {
            window.speechSynthesis?.cancel();
        }
    };

    return (
        <div className="landing-page" onKeyDown={handleKeyDown} tabIndex={-1}>
            <a href="#main-content" className="skip-link">Skip to main content</a>

            {/* Decorative Background */}
            <div className="landing-bg">
                <div className="landing-bg-gradient"></div>
                <div className="landing-bg-grid"></div>
                <div className="landing-bg-glow"></div>
            </div>

            {/* Navigation */}
            <nav className="landing-nav" role="navigation" aria-label="Main navigation">
                <div className="landing-nav-logo">
                    <img src="/logo.png" alt="Kine" style={{ width: '40px', height: '40px', marginRight: '12px' }} />
                    <span className="logo-text">Kine</span>
                </div>
                <div className="landing-nav-links">
                    <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                            e.preventDefault();
                            alert('Help documentation coming soon!');
                        }}
                        aria-label="Help and documentation"
                    >
                        Help
                    </button>
                    {user ? (
                        <div className="user-profile">
                            <img
                                src={user.photoURL || '/logo.png'}
                                alt={user.displayName || 'User'}
                                className="user-avatar"
                            />
                            <span className="user-name">{user.displayName?.split(' ')[0] || 'User'}</span>
                            <button
                                className="btn btn-ghost"
                                onClick={signOut}
                                aria-label="Sign out"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={signInWithGoogle}
                            disabled={loading}
                            aria-label="Sign in with Google"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main id="main-content" className="landing-main">
                <div className="landing-hero">
                    <div className="hero-badge animate-fade-in">
                        <span className="badge-dot" aria-hidden="true"></span>
                        <span>Audio-First Experience</span>
                    </div>

                    <h1
                        className="hero-title animate-slide-up"
                        data-text={dummyData.headline}
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                            e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.setProperty('--mouse-x', '-200%');
                            e.currentTarget.style.setProperty('--mouse-y', '-200%');
                        }}
                    >
                        {dummyData.headline}
                    </h1>

                    <p className="hero-description animate-slide-up">
                        {dummyData.description}
                    </p>

                    <div className="hero-actions animate-slide-up">
                        <Link
                            to="/onboarding"
                            className="btn btn-primary btn-lg"
                            aria-label={dummyData.primary_cta}
                            onFocus={() => speak(dummyData.primary_cta)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                            {dummyData.primary_cta}
                        </Link>

                        <Link
                            to="/help"
                            className="btn btn-secondary btn-lg"
                            aria-label={dummyData.secondary_cta}
                            onFocus={() => speak(dummyData.secondary_cta)}
                        >
                            {dummyData.secondary_cta}
                        </Link>
                    </div>

                    {/* Keyboard Hints */}
                    <div className="keyboard-hints" aria-label="Keyboard shortcuts">
                        <div className="hint">
                            <kbd>Tab</kbd>
                            <span>Navigate</span>
                        </div>
                        <div className="hint">
                            <kbd>Enter</kbd>
                            <span>Select</span>
                        </div>
                        <div className="hint">
                            <kbd>?</kbd>
                            <span>Help</span>
                        </div>
                        <div className="hint">
                            <kbd>Esc</kbd>
                            <span>Stop Audio</span>
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <section className="landing-features" aria-label="Features">
                    <div className="feature-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="feature-icon" aria-hidden="true">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" x2="12" y1="19" y2="22" />
                            </svg>
                        </div>
                        <h3>Voice Feedback</h3>
                        <p>Every action confirmed through clear audio cues</p>
                    </div>

                    <div className="feature-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="feature-icon" aria-hidden="true">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
                                <path d="M10 19v-6.8a2 2 0 0 1 .6-1.4l3.4-3.4a2 2 0 0 1 2.8 0l2.8 2.8a2 2 0 0 1 0 2.8l-3.4 3.4a2 2 0 0 1-1.4.6H10Z" />
                            </svg>
                        </div>
                        <h3>Gesture Input</h3>
                        <p>Draw letters in the air with natural hand movements</p>
                    </div>

                    <div className="feature-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="feature-icon" aria-hidden="true">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 8V4H8" />
                                <rect width="16" height="12" x="4" y="8" rx="2" />
                                <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
                            </svg>
                        </div>
                        <h3>AI Powered</h3>
                        <p>Smart predictions and text enhancement</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>Press <kbd>?</kbd> for help at any time</p>
            </footer>
        </div>
    );
};

export default LandingPage;
