import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { getContestById, getContestLeaderboard, submitContestTest } from "@/lib/api";
import { isAuthenticated, getUser, logout } from "@/lib/auth";

export default function ContestDetail() {
    const router = useRouter();
    const { id: contestId } = router.query;

    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Typing test state
    const [gameState, setGameState] = useState("ready"); // ready, playing, finished
    const [text, setText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // Contest timing state
    const [contestCountdown, setContestCountdown] = useState(null); // seconds until contest starts
    const [isContestActive, setIsContestActive] = useState(false); // true when contest can be started

    const inputRef = useRef(null);

    // Refs to access latest values in callbacks (avoid stale closure)
    const userInputRef = useRef("");
    const textRef = useRef("");
    const startTimeRef = useRef(null);

    // Guard to prevent multiple submission attempts (race condition fix)
    const isSubmittingRef = useRef(false);

    // Keep refs synced with state (critical for finishTest to get latest values)
    useEffect(() => {
        userInputRef.current = userInput;
    }, [userInput]);

    useEffect(() => {
        textRef.current = text;
    }, [text]);

    useEffect(() => {
        startTimeRef.current = startTime;
    }, [startTime]);

    useEffect(() => {
        if (isAuthenticated()) {
            setUser(getUser());
        }
    }, []);

    useEffect(() => {
        if (contestId) {
            loadContestData();
        }
    }, [contestId, user]);

    const loadContestData = async () => {
        try {
            const userId = user?.userId || null;
            const contestData = await getContestById(contestId, userId);
            setContest(contestData);

            // Calculate remaining time based on endTime, not durationSeconds
            const now = new Date().getTime();
            const endTimeMs = new Date(contestData.endTime).getTime();
            const remainingSeconds = Math.max(0, Math.ceil((endTimeMs - now) / 1000));
            setTimeLeft(remainingSeconds);

            // Load leaderboard for completed or live contests
            if (contestData.status === "COMPLETED" || contestData.status === "LIVE") {
                const lb = await getContestLeaderboard(contestId);
                setLeaderboard(lb);
            }

            // Load text for contest (when LIVE or when start time has passed)
            const startTimeMs = new Date(contestData.startTime).getTime();
            const shouldLoadText = (contestData.status === "LIVE" || now >= startTimeMs) &&
                contestData.isUserRegistered &&
                !contestData.hasUserSubmitted;

            // Use contest-specific typing text from the contest data
            if (shouldLoadText && !text && contestData.typingText) {
                setText(contestData.typingText);
                textRef.current = contestData.typingText;
            }
        } catch (error) {
            console.error("Failed to load contest:", error);
        } finally {
            setLoading(false);
        }
    };

    // Contest countdown effect - check if contest should be active
    useEffect(() => {
        if (!contest) return;

        const checkContestStatus = () => {
            const now = new Date().getTime();
            const startTimeMs = new Date(contest.startTime).getTime();
            const endTimeMs = new Date(contest.endTime).getTime();

            if (contest.status === "LIVE" || now >= startTimeMs) {
                setIsContestActive(true);
                setContestCountdown(null);

                // Check if contest has ended
                if (now >= endTimeMs) {
                    setIsContestActive(false);
                    // Auto-submit if user was playing
                    if (gameState === "playing") {
                        finishTest();
                    }
                }
            } else {
                // Contest hasn't started yet
                setIsContestActive(false);
                const secondsRemaining = Math.ceil((startTimeMs - now) / 1000);
                setContestCountdown(secondsRemaining);
            }
        };

        // Check immediately
        checkContestStatus();

        // Update every second
        const interval = setInterval(checkContestStatus, 1000);
        return () => clearInterval(interval);
    }, [contest, gameState]);

    // Timer effect - use remaining time until contest ends
    useEffect(() => {
        if (gameState !== "playing" || !contest) return;

        const timer = setInterval(() => {
            const now = Date.now();
            const endTimeMs = new Date(contest.endTime).getTime();
            const remaining = Math.max(0, (endTimeMs - now) / 1000);
            setTimeLeft(Math.ceil(remaining));

            if (remaining <= 0) {
                finishTest();
            }
        }, 100);

        return () => clearInterval(timer);
    }, [gameState, contest]);

    // WPM and accuracy calculation
    useEffect(() => {
        if (gameState !== "playing" || !startTime) return;

        const elapsedMinutes = (Date.now() - startTime) / 60000;
        if (elapsedMinutes > 0) {
            const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;
            setWpm(Math.round(wordsTyped / elapsedMinutes));
        }

        let correct = 0;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === text[i]) correct++;
        }
        const acc = userInput.length > 0 ? (correct / userInput.length) * 100 : 100;
        setAccuracy(Math.round(acc));
    }, [userInput, startTime, gameState, text]);

    const startTest = () => {
        setGameState("playing");
        const now = Date.now();
        setStartTime(now);
        startTimeRef.current = now;
        setUserInput("");
        userInputRef.current = "";
        // Reset submission guard for new test
        isSubmittingRef.current = false;
        setTimeout(() => {
            inputRef.current?.focus({ preventScroll: true });
        }, 50);
    };

    const handleInput = (e) => {
        if (gameState !== "playing") return;
        const value = e.target.value;
        setUserInput(value);
        userInputRef.current = value;
        if (value.length >= text.length) {
            finishTest();
        }
    };

    const finishTest = async () => {
        // Use ref guard to prevent race condition from multiple interval triggers
        if (isSubmittingRef.current) {
            console.log("finishTest: Already submitting, skipping duplicate call");
            return;
        }
        if (gameState !== "playing") return;

        // Set guard immediately to prevent any other calls
        isSubmittingRef.current = true;
        setGameState("finished");

        // Use refs to get latest values (avoid stale closure)
        const currentUserInput = userInputRef.current;
        const currentText = textRef.current;
        const currentStartTime = startTimeRef.current;

        const duration = currentStartTime ? Math.floor((Date.now() - currentStartTime) / 1000) : 0;
        let correct = 0;
        let errors = 0;
        for (let i = 0; i < currentUserInput.length; i++) {
            if (currentUserInput[i] === currentText[i]) correct++;
            else errors++;
        }

        const finalAccuracy = currentUserInput.length > 0 ? (correct / currentUserInput.length) * 100 : 0;
        const finalWpm = duration > 0 ? Math.round((currentUserInput.trim().split(/\s+/).filter(Boolean).length / duration) * 60) : 0;

        console.log("finishTest metrics:", { currentUserInput: currentUserInput.length, duration, correct, errors, finalWpm, finalAccuracy });

        // Submit to contest
        setSubmitting(true);
        try {
            const payload = {
                userId: user.userId,
                wpm: finalWpm,
                accuracy: finalAccuracy,
                errors,
                totalChars: currentUserInput.length,
                correctChars: correct,
                duration,
            };
            console.log("Submitting contest test with payload:", JSON.stringify(payload));

            const response = await submitContestTest(contestId, payload);
            console.log("Contest submission response:", response);

            setResult({
                wpm: finalWpm,
                accuracy: finalAccuracy,
                errors,
                performanceScore: response.performanceScore,
            });
            // Reload leaderboard
            const lb = await getContestLeaderboard(contestId);
            setLeaderboard(lb);
        } catch (error) {
            console.error("Failed to submit contest test:", error);
            console.error("Error details:", error.message, error.stack);
            // Show error to user instead of silently failing
            setResult({
                wpm: finalWpm,
                accuracy: finalAccuracy,
                errors,
                performanceScore: null,
                submissionError: error.message || "Failed to submit. Please check your connection.",
            });
            // Reset guard to allow retry
            isSubmittingRef.current = false;
        } finally {
            setSubmitting(false);
        }
    };

    // Optimized text rendering
    const WINDOW_SIZE = 500;
    const renderedText = useMemo(() => {
        const currentPos = userInput.length;
        const textLength = text.length;

        if (textLength <= WINDOW_SIZE * 2) {
            return text.split("").map((char, index) => {
                let className = "char-pending";
                if (index < currentPos) {
                    className = userInput[index] === char ? "char-correct" : "char-incorrect";
                } else if (index === currentPos) {
                    className = "char-current";
                }
                return <span key={index} className={className}>{char}</span>;
            });
        }

        const startIndex = Math.max(0, currentPos - WINDOW_SIZE);
        const endIndex = Math.min(textLength, currentPos + WINDOW_SIZE);
        const elements = [];

        for (let index = startIndex; index < endIndex; index++) {
            const char = text[index];
            let className = "char-pending";
            if (index < currentPos) {
                className = userInput[index] === char ? "char-correct" : "char-incorrect";
            } else if (index === currentPos) {
                className = "char-current";
            }
            elements.push(<span key={index} className={className}>{char}</span>);
        }

        return elements;
    }, [text, userInput]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="test-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="test-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
                <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                    <h2>Contest Not Found</h2>
                    <Link href="/contest"><button className="btn-primary" style={{ marginTop: "20px" }}>Back to Contests</button></Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{contest.title} - TyperPro Contest</title>
            </Head>

            <div className="test-page">
                <nav className="test-nav">
                    <Link href="/" className="logo">TyperPro</Link>
                    <div className="nav-links">
                        <Link href="/">Home</Link>
                        <Link href="/test">Practice</Link>
                        <Link href="/contest">Contests</Link>
                        <Link href="/leaderboard">Leaderboard</Link>
                        {user && <Link href="/dashboard">Dashboard</Link>}
                        {user ? (
                            <div className="user-badge">
                                <span className="avatar">{user.displayName?.charAt(0).toUpperCase()}</span>
                                <span>{user.displayName}</span>
                                <button className="logout-btn" onClick={() => { logout(); router.push('/'); }}>Logout</button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Login</button>
                            </Link>
                        )}
                    </div>
                </nav>

                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px" }}>
                    {/* Contest Header */}
                    <div className="glass-card" style={{ padding: "32px", marginBottom: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>{contest.title}</h1>
                                <div style={{ display: "flex", gap: "16px", color: "#6b6b80" }}>
                                    <span>⚡ {contest.difficulty}</span>
                                    <span>⏱ {Math.floor(contest.durationSeconds / 60)} min</span>
                                    <span>👥 {contest.registeredParticipants} participants</span>
                                </div>
                            </div>
                            {/* Real-time status badge */}
                            {(() => {
                                const now = new Date();
                                const startTimeDate = new Date(contest.startTime);
                                const endTimeDate = new Date(contest.endTime);
                                const isLive = now >= startTimeDate && now < endTimeDate;
                                const isCompleted = now >= endTimeDate;
                                const displayStatus = isCompleted ? "COMPLETED" : isLive ? "LIVE" : "UPCOMING";

                                return (
                                    <span style={{
                                        padding: "8px 20px",
                                        borderRadius: "20px",
                                        fontWeight: 600,
                                        background: displayStatus === "LIVE" ? "rgba(16, 185, 129, 0.2)" : displayStatus === "COMPLETED" ? "rgba(107, 107, 128, 0.3)" : "rgba(245, 158, 11, 0.2)",
                                        color: displayStatus === "LIVE" ? "#10b981" : displayStatus === "COMPLETED" ? "#6b7280" : "#f59e0b",
                                    }}>
                                        {displayStatus === "LIVE" ? "🔴 Live" : displayStatus === "COMPLETED" ? "✅ Completed" : "🕐 Upcoming"}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Countdown for Upcoming Contest */}
                    {contest.status === "UPCOMING" && contest.isUserRegistered && contestCountdown !== null && (
                        <div className="glass-card" style={{
                            padding: "40px",
                            marginBottom: "32px",
                            textAlign: "center",
                            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1))"
                        }}>
                            <h2 style={{ color: "#b8b8cc", marginBottom: "16px" }}>⏳ Contest Starting Soon</h2>
                            <div style={{
                                fontSize: "3rem",
                                fontWeight: 700,
                                color: "#a855f7",
                                marginBottom: "16px"
                            }}>
                                {Math.floor(contestCountdown / 3600)}:{String(Math.floor((contestCountdown % 3600) / 60)).padStart(2, '0')}:{String(contestCountdown % 60).padStart(2, '0')}
                            </div>
                            <p style={{ color: "#6b6b80" }}>Get ready! The Start Test button will activate when the contest begins.</p>
                        </div>
                    )}

                    {/* Contest Completed Banner */}
                    {contest.status === "COMPLETED" && (
                        <div className="glass-card" style={{
                            padding: "32px",
                            marginBottom: "32px",
                            textAlign: "center",
                            background: "linear-gradient(135deg, rgba(107, 107, 128, 0.2), rgba(50, 50, 60, 0.2))",
                            border: "1px solid rgba(107, 107, 128, 0.3)"
                        }}>
                            <h2 style={{ color: "#b8b8cc", marginBottom: "8px" }}>🏁 Contest Completed</h2>
                            <p style={{ color: "#6b6b80" }}>This contest has ended. Check the leaderboard below for final standings!</p>
                        </div>
                    )}

                    {/* Contest Test Area (for registered users when contest is active) */}
                    {isContestActive && contest.isUserRegistered && !contest.hasUserSubmitted && !result && (
                        <div className="glass-card" style={{ padding: "32px", marginBottom: "32px" }}>
                            {/* Stats Bar */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-around",
                                marginBottom: "24px",
                                padding: "16px",
                                background: "rgba(0, 0, 0, 0.3)",
                                borderRadius: "12px"
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#00d4ff" }}>{formatTime(timeLeft)}</div>
                                    <div style={{ color: "#6b6b80", fontSize: "0.8rem" }}>TIME LEFT</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#a855f7" }}>{wpm}</div>
                                    <div style={{ color: "#6b6b80", fontSize: "0.8rem" }}>WPM</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "#10b981" }}>{accuracy}%</div>
                                    <div style={{ color: "#6b6b80", fontSize: "0.8rem" }}>ACCURACY</div>
                                </div>
                            </div>

                            {gameState === "ready" && (
                                <div style={{ textAlign: "center", padding: "40px" }}>
                                    <p style={{ color: "#b8b8cc", marginBottom: "24px" }}>
                                        You have {Math.floor(contest.durationSeconds / 60)} minutes to complete this test.
                                        Once you start, the timer cannot be paused.
                                    </p>
                                    <button className="btn-primary pulse-glow" onClick={startTest}>
                                        🚀 Start Contest Test
                                    </button>
                                </div>
                            )}

                            {gameState === "playing" && (
                                <>
                                    <div
                                        className="typing-arena-new"
                                        onClick={() => inputRef.current?.focus({ preventScroll: true })}
                                    >
                                        <div className="typing-text">{renderedText}</div>
                                    </div>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={userInput}
                                        onChange={handleInput}
                                        className="hidden-input"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                    />
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "16px" }}>
                                        <p style={{ color: "#6b6b80", margin: 0 }}>
                                            Click the text area or just start typing...
                                        </p>
                                        <button
                                            className="btn-secondary"
                                            onClick={finishTest}
                                            style={{
                                                padding: "8px 20px",
                                                fontSize: "0.9rem",
                                                background: "rgba(239, 68, 68, 0.1)",
                                                border: "1px solid #ef4444",
                                                color: "#ef4444"
                                            }}
                                        >
                                            ⏹️ Submit Early
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Result Display */}
                    {result && (
                        <div className="glass-card" style={{ padding: "40px", marginBottom: "32px", textAlign: "center" }}>
                            {result.submissionError ? (
                                <>
                                    <h2 style={{
                                        fontSize: "2rem",
                                        color: "#ef4444",
                                        marginBottom: "24px"
                                    }}>
                                        ⚠️ Submission Failed
                                    </h2>
                                    <p style={{ color: "#b8b8cc", marginBottom: "16px" }}>
                                        {result.submissionError}
                                    </p>
                                    <p style={{ color: "#6b6b80", fontSize: "0.9rem" }}>
                                        Your test results: {result.wpm} WPM, {result.accuracy.toFixed(1)}% accuracy
                                    </p>
                                    <p style={{ color: "#f59e0b", fontSize: "0.85rem", marginTop: "16px" }}>
                                        Please contact support with your contest ID and user ID.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 style={{
                                        fontSize: "2rem",
                                        background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        marginBottom: "24px"
                                    }}>
                                        🎉 Contest Submitted!
                                    </h2>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "24px", maxWidth: "600px", margin: "0 auto" }}>
                                        <div style={{ padding: "24px", background: "rgba(0, 212, 255, 0.1)", borderRadius: "16px", border: "1px solid rgba(0, 212, 255, 0.3)" }}>
                                            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#00d4ff" }}>{result.wpm}</div>
                                            <div style={{ color: "#b8b8cc" }}>WPM</div>
                                        </div>
                                        <div style={{ padding: "24px", background: "rgba(168, 85, 247, 0.1)", borderRadius: "16px", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
                                            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#a855f7" }}>{result.accuracy.toFixed(1)}%</div>
                                            <div style={{ color: "#b8b8cc" }}>Accuracy</div>
                                        </div>
                                        <div style={{ padding: "24px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "16px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#10b981" }}>{result.performanceScore}</div>
                                            <div style={{ color: "#b8b8cc" }}>Score</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Already Submitted */}
                    {contest.hasUserSubmitted && !result && (
                        <div className="glass-card" style={{ padding: "40px", marginBottom: "32px", textAlign: "center" }}>
                            <p style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</p>
                            <h2 style={{ marginBottom: "8px" }}>Already Submitted</h2>
                            <p style={{ color: "#6b6b80" }}>You have already submitted your test for this contest.</p>
                        </div>
                    )}

                    {/* Leaderboard */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <h2 style={{ marginBottom: "24px", textAlign: "center" }}>🏆 Contest Leaderboard</h2>

                        {leaderboard.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#6b6b80" }}>No submissions yet</p>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                            <th style={{ padding: "12px", textAlign: "left", color: "#6b6b80" }}>Rank</th>
                                            <th style={{ padding: "12px", textAlign: "left", color: "#6b6b80" }}>User</th>
                                            <th style={{ padding: "12px", textAlign: "right", color: "#6b6b80" }}>WPM</th>
                                            <th style={{ padding: "12px", textAlign: "right", color: "#6b6b80" }}>Accuracy</th>
                                            <th style={{ padding: "12px", textAlign: "right", color: "#6b6b80" }}>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry, idx) => (
                                            <tr
                                                key={entry.odl || idx}
                                                style={{
                                                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                                    background: idx < 3 ? `rgba(${idx === 0 ? "255, 215, 0" : idx === 1 ? "192, 192, 192" : "205, 127, 50"}, 0.1)` : "transparent"
                                                }}
                                            >
                                                <td style={{ padding: "16px" }}>
                                                    {idx === 0 && "🥇"}
                                                    {idx === 1 && "🥈"}
                                                    {idx === 2 && "🥉"}
                                                    {idx > 2 && `#${entry.rank || idx + 1}`}
                                                </td>
                                                <td style={{ padding: "16px" }}>
                                                    {entry.displayName}
                                                    {entry.hasGiftReward && (
                                                        <span title="Gift Card Winner!" style={{ marginLeft: "8px" }}>🎁</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "16px", textAlign: "right", color: "#00d4ff", fontWeight: 600 }}>{entry.wpm}</td>
                                                <td style={{ padding: "16px", textAlign: "right", color: "#a855f7" }}>{entry.accuracy?.toFixed(1)}%</td>
                                                <td style={{ padding: "16px", textAlign: "right", color: "#10b981", fontWeight: 600 }}>{entry.performanceScore}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
