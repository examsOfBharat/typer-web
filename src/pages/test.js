import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getSampleText, getOrCreateUserId, submitTypingTest } from "@/lib/api";
import { isAuthenticated, getUser, logout } from "@/lib/auth";

const DIFFICULTIES = [
    { id: "easy", label: "Easy", icon: "🌱" },
    { id: "medium", label: "Medium", icon: "🔥" },
    { id: "hard", label: "Hard", icon: "⚡" },
    { id: "expert", label: "Expert", icon: "💎" },
];

const TIME_OPTIONS = [
    { id: 60, label: "1 min" },
    { id: 120, label: "2 min" },
    { id: 300, label: "5 min" },
    { id: 600, label: "10 min" },
    { id: 900, label: "15 min" },
    { id: 1200, label: "20 min" },
    { id: 1800, label: "30 min" },
];

// Circular Timer Component
const CircularTimer = ({ timeLeft, totalTime, isPlaying }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const progress = totalTime > 0 ? (timeLeft / totalTime) * circumference : circumference;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="circular-timer">
            <svg width="160" height="160" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke="url(#timerGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    transform="rotate(-90 80 80)"
                    className={isPlaying ? "timer-ring-animated" : ""}
                />
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="timer-text">
                <span className="timer-value">{formatTime(timeLeft)}</span>
                <span className="timer-label">remaining</span>
            </div>
        </div>
    );
};

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, label, icon, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <label className="dropdown-label">{icon} {label}</label>
            <button
                className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <span>{selectedOption?.icon} {selectedOption?.label}</span>
                <span className="dropdown-arrow">▼</span>
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`dropdown-item ${value === option.id ? 'active' : ''}`}
                            onClick={() => {
                                onChange(option.id);
                                setIsOpen(false);
                            }}
                        >
                            {option.icon} {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Stat Display Component
const StatDisplay = ({ value, label, icon, color, showRing, percentage }) => {
    return (
        <div className="stat-display">
            {showRing ? (
                <div className="accuracy-ring">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="6"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 42}
                            strokeDashoffset={2 * Math.PI * 42 * (1 - percentage / 100)}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="accuracy-value" style={{ color }}>
                        {value}
                    </div>
                </div>
            ) : (
                <div className="stat-value" style={{ color }}>
                    {icon} {value}
                </div>
            )}
            <div className="stat-label">{label}</div>
        </div>
    );
};

export default function TypingTest() {
    const [difficulty, setDifficulty] = useState("medium");
    const [selectedTime, setSelectedTime] = useState(60);
    const [gameState, setGameState] = useState("ready");
    const [text, setText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [results, setResults] = useState(null);
    const inputRef = useRef(null);
    const textContainerRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState({ left: 0, top: 0, height: 24 });
    const [userId, setUserId] = useState(null);

    // Auth state - initialized on client only to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Refs to track current values for finishTest (avoids stale closures)
    const userInputRef = useRef(userInput);
    const textRef = useRef(text);
    const startTimeRef = useRef(startTime);
    const isSubmittingRef = useRef(false); // Prevent double submission
    const audioContextRef = useRef(null); // For typing sounds

    // Play typing sound effect
    const playTypingSound = () => {
        try {
            // Initialize audio context on first use (must be after user interaction)
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;

            // Create oscillator for click sound
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Mechanical keyboard click sound parameters
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1800, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);

            gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.05);
        } catch (e) {
            // Audio not supported or blocked, fail silently
        }
    };

    // Initialize auth state on client side only (after hydration)
    useEffect(() => {
        setMounted(true);
        setUserId(getOrCreateUserId());
        setIsLoggedIn(isAuthenticated());
        setUser(getUser());
    }, []);

    // Keep refs in sync with state
    useEffect(() => {
        userInputRef.current = userInput;
    }, [userInput]);

    useEffect(() => {
        textRef.current = text;
    }, [text]);

    useEffect(() => {
        startTimeRef.current = startTime;
    }, [startTime]);

    const loadText = useCallback(() => {
        const sampleText = getSampleText(difficulty, selectedTime);
        setText(sampleText);
        setUserInput("");
        setTimeLeft(selectedTime);
        setWpm(0);
        setAccuracy(100);
        setGameState("ready");
        setResults(null);
    }, [difficulty, selectedTime]);

    useEffect(() => {
        loadText();
    }, [loadText]);

    useEffect(() => {
        if (gameState !== "playing") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Real-time WPM/accuracy calculation
    useEffect(() => {

        if (gameState !== "playing" || !startTime) return;

        const elapsedMinutes = (Date.now() - startTime) / 60000;
        if (elapsedMinutes > 0) {
            const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;
            setWpm(Math.round(wordsTyped / elapsedMinutes));
        }

        let correct = 0;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === text[i]) {
                correct++;
            }
        }
        const acc = userInput.length > 0 ? (correct / userInput.length) * 100 : 100;
        setAccuracy(Math.round(acc));
    }, [userInput, startTime, gameState, text]);

    const startTest = () => {
        setGameState("playing");
        setStartTime(Date.now());
        setUserInput("");
        setTimeout(() => {
            inputRef.current?.focus({ preventScroll: true });
        }, 50);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState === "playing" && inputRef.current) {
                if (e.key.length === 1 || e.key === "Backspace") {
                    inputRef.current.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState]);

    const finishTest = async () => {
        // Guard against double execution using ref (React state is async, can't rely on it)
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        setGameState("finished");
        // Use refs to get the current values (avoids stale closure from timer)
        const currentInput = userInputRef.current;
        const currentText = textRef.current;
        const currentStartTime = startTimeRef.current;

        const elapsedMinutes = (Date.now() - currentStartTime) / 60000;
        const wordsTyped = currentInput.trim().split(/\s+/).filter(Boolean).length;
        const finalWpm = Math.round(wordsTyped / elapsedMinutes);

        let correct = 0;
        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] === currentText[i]) {
                correct++;
            }
        }
        const finalAccuracy =
            currentInput.length > 0 ? Math.round((correct / currentInput.length) * 100) : 0;

        const testResults = {
            wpm: finalWpm,
            accuracy: finalAccuracy,
            time: Math.round((Date.now() - currentStartTime) / 1000),
            characters: currentInput.length,
            correct: correct,
            errors: currentInput.length - correct,
        };

        setResults(testResults);

        // Save results to backend for logged-in users
        if (isLoggedIn && user?.userId) {
            try {
                const response = await submitTypingTest({
                    userId: user.userId,
                    difficulty: difficulty,
                    duration: testResults.time,
                    totalChars: testResults.characters,
                    correctChars: testResults.correct,
                    errors: testResults.errors,
                    wpm: testResults.wpm,
                    accuracy: testResults.accuracy,
                });
                console.log('Test result saved successfully', response);
                // Update results with performanceScore and performancePoints from API response
                if (response) {
                    setResults(prev => ({
                        ...prev,
                        performanceScore: response.performanceScore,
                        performancePoints: response.performancePoints,
                    }));
                }
            } catch (error) {
                console.error('Failed to save test result:', error);
            }
        }
    };

    const handleInput = (e) => {
        if (gameState !== "playing") return;
        const value = e.target.value;

        // Note: Removed playTypingSound() here as it was causing keystroke lag
        // The audio synthesis on every keystroke is too expensive for smooth typing

        setUserInput(value);
        if (value.length >= text.length) {
            finishTest();
        }
    };

    const resetTest = () => {
        isSubmittingRef.current = false; // Reset submission guard for new test
        loadText();
    };

    // Update cursor position based on character positions
    useEffect(() => {
        if (!textContainerRef.current || gameState !== "playing") return;

        // Use requestAnimationFrame to ensure DOM is rendered
        const updateCursorPosition = () => {
            const container = textContainerRef.current;
            if (!container) return;

            const spans = container.querySelectorAll('span');
            const currentPos = userInput.length;

            if (spans.length === 0) return;

            // Get the target span (current character position or first character if at start)
            const targetSpan = spans[Math.min(currentPos, spans.length - 1)];
            if (!targetSpan) return;

            // Use offsetLeft/offsetTop for correct positioning relative to offset parent
            let left = targetSpan.offsetLeft;
            let top = targetSpan.offsetTop;

            // If we've typed all characters, position cursor after the last character
            if (currentPos >= spans.length) {
                left += targetSpan.offsetWidth;
            }

            // Get character height dynamically
            const height = targetSpan.offsetHeight;

            setCursorPosition({ left, top, height });
        };

        // Run immediately and also after a frame for initial load
        requestAnimationFrame(updateCursorPosition);
    }, [userInput.length, gameState, text]);

    // Optimized text rendering - NO char-current class, cursor is separate element
    const WINDOW_SIZE = 500; // Characters to render before and after current position

    const renderedText = useMemo(() => {
        const currentPos = userInput.length;
        const textLength = text.length;

        // For short texts, render everything (no char-current, just correct/incorrect/pending)
        if (textLength <= WINDOW_SIZE * 2) {
            return text.split("").map((char, index) => {
                let className = "char-pending";
                if (index < currentPos) {
                    className = userInput[index] === char ? "char-correct" : "char-incorrect";
                }
                return (
                    <span key={index} className={className} data-index={index}>
                        {char}
                    </span>
                );
            });
        }

        // For long texts, only render a window around current position
        const startIndex = Math.max(0, currentPos - WINDOW_SIZE);
        const endIndex = Math.min(textLength, currentPos + WINDOW_SIZE);

        const elements = [];

        // Render the visible window
        for (let index = startIndex; index < endIndex; index++) {
            const char = text[index];
            let className = "char-pending";
            if (index < currentPos) {
                className = userInput[index] === char ? "char-correct" : "char-incorrect";
            }
            elements.push(
                <span key={index} className={className} data-index={index}>
                    {char}
                </span>
            );
        }

        return elements;
    }, [text, userInput]);

    const getAccuracyColor = () => {
        if (accuracy >= 90) return "#a7f3d0";  // Very light mint
        if (accuracy >= 70) return "#fef08a";  // Very light yellow
        return "#fecaca";  // Very light coral
    };

    return (
        <>
            <Head>
                <title>Free Typing Test - Check Your WPM Speed & Accuracy | TyperPro</title>
                <meta
                    name="description"
                    content="Take a free typing test to measure your WPM and accuracy. Choose from multiple difficulty levels and time durations. Real-time feedback with detailed results."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="keywords" content="typing test, WPM test, typing speed test, free typing test, accuracy test, keyboard test, typing practice online" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://typer.examsofbharat.com/test" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://typer.examsofbharat.com/test" />
                <meta property="og:title" content="Free Typing Test - Check Your WPM Speed | TyperPro" />
                <meta property="og:description" content="Test your typing speed with real-time WPM tracking. Multiple difficulty levels available." />
                <meta property="og:image" content="https://typer.examsofbharat.com/og-image.png" />
                <meta property="og:site_name" content="TyperPro" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Free Typing Test - TyperPro" />
                <meta name="twitter:description" content="Measure your typing speed and accuracy with our interactive typing test." />
                <meta name="twitter:image" content="https://typer.examsofbharat.com/og-image.png" />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "TyperPro Typing Test",
                            "url": "https://typer.examsofbharat.com/test",
                            "description": "Free online typing speed test with WPM and accuracy tracking",
                            "applicationCategory": "EducationalApplication",
                            "operatingSystem": "Any",
                            "browserRequirements": "Requires JavaScript",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            }
                        })
                    }}
                />
            </Head>

            <div className="test-page">
                {/* Navigation */}
                <nav className="test-nav">
                    <Link href="/" className="logo">
                        TyperPro
                    </Link>
                    <div className="nav-links">
                        <Link href="/">Home</Link>
                        <Link href="/test" className="active">Practice</Link>
                        <Link href="/contest">Contests</Link>
                        <Link href="/leaderboard">Leaderboard</Link>
                        {mounted && isLoggedIn && user && (
                            <Link href="/dashboard">Dashboard</Link>
                        )}
                        {mounted && isLoggedIn && user ? (
                            <div className="user-badge">
                                <span className="avatar">{user?.displayName?.charAt(0).toUpperCase()}</span>
                                <span>{user?.displayName}</span>
                                <button className="logout-btn" onClick={() => { logout(); setIsLoggedIn(false); setUser(null); }}>Logout</button>
                            </div>
                        ) : mounted ? (
                            <Link href="/login">
                                <button className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.9rem" }}>Login</button>
                            </Link>
                        ) : null}
                    </div>
                </nav>

                <div className="test-container">
                    {/* Main Content */}
                    <main className="main-content">
                        <div className="typing-header">
                            <div className="header-top-row">
                                <div className="header-text">
                                    <h1>Start Typing</h1>
                                    <p>Focus on accuracy first, speed will follow</p>
                                </div>
                                <div className="header-action">
                                    {gameState === "ready" && (
                                        <button className="btn-primary pulse-glow" onClick={startTest}>
                                            🚀 Start Test
                                        </button>
                                    )}
                                    {gameState === "playing" && (
                                        <button className="btn-secondary" onClick={finishTest}>
                                            ⏹️ Finish Early
                                        </button>
                                    )}
                                    {gameState === "finished" && (
                                        <button className="btn-primary" onClick={resetTest}>
                                            🔄 Try Again
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Typing Arena */}
                        <div
                            className="typing-arena-new"
                            onClick={() => gameState === "playing" && inputRef.current?.focus({ preventScroll: true })}
                        >
                            <div className="typing-text" ref={textContainerRef}>
                                {renderedText}
                                {/* Smooth animated cursor - Monkeytype style */}
                                {gameState === "playing" && (
                                    <div
                                        id="caret"
                                        style={{
                                            position: 'absolute',
                                            left: `${cursorPosition.left}px`,
                                            top: `${cursorPosition.top}px`,
                                            width: '3px',
                                            height: `${cursorPosition.height}px`,
                                            background: '#ff6600',
                                            borderRadius: '2px',
                                            pointerEvents: 'none',
                                            transition: 'left 0.1s linear, top 0.1s linear',
                                            willChange: 'left, top',
                                            boxShadow: '0 0 8px rgba(255, 102, 0, 0.6)',
                                            zIndex: 10,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        {/* Hidden input moved outside arena to prevent scroll issues */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleInput}
                            disabled={gameState !== "playing"}
                            className="hidden-input"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />

                        {/* Typing Hint */}
                        {gameState === "playing" && (
                            <p className="typing-hint">
                                Click the text area or just start typing...
                            </p>
                        )}
                    </main>

                    {/* Side Panel */}
                    <aside className="side-panel">
                        <div className="panel-section">
                            <CircularTimer
                                timeLeft={timeLeft}
                                totalTime={selectedTime}
                                isPlaying={gameState === "playing"}
                            />
                        </div>

                        <div className="panel-section stats-section">
                            <StatDisplay
                                value={wpm}
                                label="Words Per Minute"
                                icon="⚡"
                                color="#a855f7"
                            />
                            <StatDisplay
                                value={`${accuracy}%`}
                                label="Accuracy"
                                color={getAccuracyColor()}
                                showRing={true}
                                percentage={accuracy}
                            />
                        </div>

                        <div className="panel-divider"></div>

                        <div className="panel-section settings-section">
                            <h3 className="settings-title">⚙️ Settings</h3>
                            <CustomDropdown
                                options={DIFFICULTIES}
                                value={difficulty}
                                onChange={setDifficulty}
                                label="Difficulty"
                                icon="🎯"
                                disabled={gameState === "playing"}
                            />
                            <CustomDropdown
                                options={TIME_OPTIONS}
                                value={selectedTime}
                                onChange={setSelectedTime}
                                label="Duration"
                                icon="⏱️"
                                disabled={gameState === "playing"}
                            />
                        </div>
                    </aside>
                </div>

                {/* Results Modal */}
                {results && (
                    <div className="modal-overlay" onClick={resetTest}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2 className="modal-title">🎉 Test Complete!</h2>
                            <p className="modal-subtitle">Great job! Here are your results:</p>

                            <div className="results-grid">
                                <div className="result-card primary">
                                    <div className="result-value">{results.wpm}</div>
                                    <div className="result-label">Words/Min</div>
                                </div>
                                <div className="result-card secondary">
                                    <div className="result-value">{results.accuracy}%</div>
                                    <div className="result-label">Accuracy</div>
                                </div>
                            </div>

                            {/* Performance Score and Points */}
                            {(results.performanceScore !== undefined || results.performancePoints !== undefined) && (
                                <div className="results-grid" style={{ marginTop: '16px' }}>
                                    {results.performanceScore !== undefined && (
                                        <div className="result-card" style={{
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1))',
                                            border: '1px solid rgba(16, 185, 129, 0.3)'
                                        }}>
                                            <div className="result-value" style={{ color: '#10b981' }}>
                                                {typeof results.performanceScore === 'number' ? results.performanceScore.toFixed(1) : results.performanceScore}
                                            </div>
                                            <div className="result-label">Score</div>
                                        </div>
                                    )}
                                    {results.performancePoints !== undefined && (
                                        <div className="result-card" style={{
                                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.1))',
                                            border: '1px solid rgba(168, 85, 247, 0.3)'
                                        }}>
                                            <div className="result-value" style={{ color: '#a855f7' }}>
                                                +{typeof results.performancePoints === 'number' ? results.performancePoints.toFixed(2) : results.performancePoints}
                                            </div>
                                            <div className="result-label">Points Earned</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="results-details">
                                <div><span>Time:</span> {results.time}s</div>
                                <div><span>Characters:</span> {results.characters}</div>
                                <div>
                                    <span>Errors:</span>{" "}
                                    <span className={results.errors > 0 ? "error" : "success"}>
                                        {results.errors}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-primary" onClick={resetTest}>
                                    Try Again
                                </button>
                                <Link href="/leaderboard">
                                    <button className="btn-secondary">View Leaderboard</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
