import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getContests, registerForContest, getCompletedContests } from "@/lib/api";
import { isAuthenticated, getUser, logout } from "@/lib/auth";

export default function Contests() {
    const [contests, setContests] = useState([]);
    const [completedContests, setCompletedContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [registering, setRegistering] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            setUser(getUser());
        }
        loadContests();
    }, []);

    const loadContests = async () => {
        try {
            const userId = isAuthenticated() ? getUser()?.userId : null;
            const [activeContests, pastContests] = await Promise.all([
                getContests(userId),
                getCompletedContests()
            ]);
            setContests(activeContests);
            setCompletedContests(pastContests);
        } catch (error) {
            console.error("Failed to load contests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (contestId) => {
        if (!user) {
            // Redirect to login page if user is not logged in
            router.push('/login?redirect=/contest');
            return;
        }

        setRegistering(contestId);
        try {
            await registerForContest(contestId, user.userId);
            // Reload contests to update registration status
            loadContests();
        } catch (error) {
            console.error("Failed to register:", error);
            alert("Failed to register for contest");
        } finally {
            setRegistering(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "UPCOMING": return "#f59e0b";
            case "LIVE": return "#10b981";
            case "COMPLETED": return "#6b7280";
            default: return "#6b7280";
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "UPCOMING": return "🕐 Upcoming";
            case "LIVE": return "🔴 Live Now";
            case "COMPLETED": return "✅ Completed";
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getTimeRemaining = (startTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const diff = start - now;

        if (diff <= 0) return "Starting now";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    return (
        <>
            <Head>
                <title>Contests - TyperPro</title>
                <meta name="description" content="Compete in typing contests and win rewards" />
            </Head>

            <div className="test-page">
                {/* Navigation */}
                <nav className="test-nav">
                    <Link href="/" className="logo">TyperPro</Link>
                    <div className="nav-links">
                        <Link href="/">Home</Link>
                        <Link href="/test">Practice</Link>
                        <Link href="/contest" className="active">Contests</Link>
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
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <h1 style={{
                            fontSize: "2.5rem",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "16px"
                        }}>
                            🏆 Typing Contests
                        </h1>
                        <p style={{ color: "#b8b8cc", fontSize: "1.1rem" }}>
                            Compete with others, showcase your skills, and win exciting rewards!
                        </p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={{ textAlign: "center", padding: "60px" }}>
                            <div className="spinner" style={{ margin: "0 auto" }}></div>
                            <p style={{ color: "#6b6b80", marginTop: "16px" }}>Loading contests...</p>
                        </div>
                    )}

                    {/* No Contests */}
                    {!loading && contests.length === 0 && (
                        <div className="glass-card" style={{ textAlign: "center", padding: "60px" }}>
                            <p style={{ fontSize: "3rem", marginBottom: "16px" }}>🎯</p>
                            <h2 style={{ color: "#b8b8cc", marginBottom: "8px" }}>No Contests Yet</h2>
                            <p style={{ color: "#6b6b80" }}>Stay tuned! New contests coming soon.</p>
                        </div>
                    )}

                    {/* Contest Cards */}
                    <div style={{ display: "grid", gap: "24px" }}>
                        {contests.map((contest) => (
                            <div
                                key={contest.id}
                                className="glass-card"
                                style={{
                                    padding: "32px",
                                    borderLeft: `4px solid ${getStatusColor(contest.status)}`,
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    flexWrap: "wrap",
                                    gap: "16px"
                                }}>
                                    {/* Contest Info */}
                                    <div style={{ flex: 1, minWidth: "280px" }}>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            marginBottom: "12px"
                                        }}>
                                            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{contest.title}</h2>
                                            <span style={{
                                                padding: "4px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                                background: `${getStatusColor(contest.status)}20`,
                                                color: getStatusColor(contest.status),
                                            }}>
                                                {getStatusBadge(contest.status)}
                                            </span>
                                        </div>

                                        {contest.description && (
                                            <p style={{ color: "#b8b8cc", marginBottom: "16px" }}>
                                                {contest.description}
                                            </p>
                                        )}

                                        <div style={{
                                            display: "flex",
                                            gap: "24px",
                                            flexWrap: "wrap",
                                            color: "#6b6b80",
                                            fontSize: "0.9rem"
                                        }}>
                                            <div>
                                                <span style={{ color: "#a855f7" }}>⚡</span> {contest.difficulty}
                                            </div>
                                            <div>
                                                <span style={{ color: "#00d4ff" }}>⏱</span> {Math.floor(contest.durationSeconds / 60)} min
                                            </div>
                                            <div>
                                                <span style={{ color: "#10b981" }}>👥</span> {contest.registeredParticipants} registered
                                            </div>
                                        </div>

                                        <div style={{
                                            marginTop: "12px",
                                            fontSize: "0.85rem",
                                            color: "#6b6b80"
                                        }}>
                                            {contest.status === "UPCOMING" && (
                                                <span>Starts: {formatDate(contest.startTime)} ({getTimeRemaining(contest.startTime)})</span>
                                            )}
                                            {contest.status === "LIVE" && (
                                                <span>Ends: {formatDate(contest.endTime)}</span>
                                            )}
                                            {contest.status === "COMPLETED" && (
                                                <span>Ended: {formatDate(contest.endTime)}</span>
                                            )}
                                        </div>

                                        {/* Prizes Section */}
                                        <div style={{
                                            marginTop: "16px",
                                            display: "flex",
                                            gap: "12px",
                                            flexWrap: "wrap"
                                        }}>
                                            <div style={{
                                                padding: "8px 14px",
                                                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 180, 0, 0.2))",
                                                border: "1px solid rgba(255, 215, 0, 0.3)",
                                                borderRadius: "8px",
                                                fontSize: "0.8rem"
                                            }}>
                                                <span style={{ color: "#ffd700", fontWeight: 600 }}>🥇 1st:</span>
                                                <span style={{ color: "#e0e0e0", marginLeft: "4px" }}>{contest.firstPrize || "₹1000"}</span>
                                            </div>
                                            <div style={{
                                                padding: "8px 14px",
                                                background: "linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(150, 150, 150, 0.2))",
                                                border: "1px solid rgba(192, 192, 192, 0.3)",
                                                borderRadius: "8px",
                                                fontSize: "0.8rem"
                                            }}>
                                                <span style={{ color: "#c0c0c0", fontWeight: 600 }}>🥈 2nd:</span>
                                                <span style={{ color: "#e0e0e0", marginLeft: "4px" }}>{contest.secondPrize || "₹500"}</span>
                                            </div>
                                            <div style={{
                                                padding: "8px 14px",
                                                background: "linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(180, 100, 40, 0.2))",
                                                border: "1px solid rgba(205, 127, 50, 0.3)",
                                                borderRadius: "8px",
                                                fontSize: "0.8rem"
                                            }}>
                                                <span style={{ color: "#cd7f32", fontWeight: 600 }}>🥉 3rd:</span>
                                                <span style={{ color: "#e0e0e0", marginLeft: "4px" }}>{contest.thirdPrize || "₹250"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "12px",
                                        alignItems: "flex-end"
                                    }}>
                                        {/* Determine real-time status based on current time */}
                                        {(() => {
                                            const now = new Date();
                                            const startTime = new Date(contest.startTime);
                                            const endTime = new Date(contest.endTime);
                                            const isLiveByTime = now >= startTime && now < endTime;
                                            const isCompletedByTime = now >= endTime;
                                            const isUpcomingByTime = now < startTime;

                                            // Show Start button if contest is LIVE or if startTime has passed
                                            if ((contest.status === "LIVE" || isLiveByTime) && contest.isUserRegistered && !contest.hasUserSubmitted) {
                                                return (
                                                    <Link href={`/contest/${contest.id}`}>
                                                        <button className="btn-primary pulse-glow">
                                                            🎯 Start Contest
                                                        </button>
                                                    </Link>
                                                );
                                            }

                                            // Show Submitted badge if already submitted
                                            if ((contest.status === "LIVE" || isLiveByTime) && contest.hasUserSubmitted) {
                                                return (
                                                    <span style={{
                                                        padding: "12px 24px",
                                                        background: "rgba(16, 185, 129, 0.2)",
                                                        border: "1px solid #10b981",
                                                        borderRadius: "50px",
                                                        color: "#10b981",
                                                        fontWeight: 600
                                                    }}>
                                                        ✓ Submitted
                                                    </span>
                                                );
                                            }

                                            // Show Registered badge for upcoming contests
                                            if (isUpcomingByTime && contest.isUserRegistered) {
                                                return (
                                                    <span style={{
                                                        padding: "12px 24px",
                                                        background: "rgba(16, 185, 129, 0.2)",
                                                        border: "1px solid #10b981",
                                                        borderRadius: "50px",
                                                        color: "#10b981",
                                                        fontWeight: 600
                                                    }}>
                                                        ✓ Registered
                                                    </span>
                                                );
                                            }

                                            // Show Register button for upcoming contests
                                            if (isUpcomingByTime && !contest.isUserRegistered) {
                                                return (
                                                    <button
                                                        className="btn-primary"
                                                        onClick={() => handleRegister(contest.id)}
                                                        disabled={registering === contest.id}
                                                    >
                                                        {registering === contest.id ? "Registering..." : "Register Now"}
                                                    </button>
                                                );
                                            }

                                            // Show View Results for completed contests
                                            if (contest.status === "COMPLETED" || isCompletedByTime) {
                                                return (
                                                    <Link href={`/contest/${contest.id}`}>
                                                        <button className="btn-secondary">
                                                            View Results
                                                        </button>
                                                    </Link>
                                                );
                                            }

                                            return null;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Past Contests Section */}
                    {completedContests.length > 0 && (
                        <div style={{ marginTop: "60px" }}>
                            <h2 style={{
                                fontSize: "1.8rem",
                                fontWeight: 700,
                                marginBottom: "24px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            }}>
                                <span style={{
                                    background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}>
                                    📜 Past Contests
                                </span>
                            </h2>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                                gap: "20px"
                            }}>
                                {completedContests.map((contest) => (
                                    <div
                                        key={contest.id}
                                        className="glass-card"
                                        style={{
                                            padding: "24px",
                                            borderLeft: "4px solid #6b7280",
                                            transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#f59e0b";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "#6b7280";
                                        }}
                                    >
                                        {/* Contest Header */}
                                        <div style={{ marginBottom: "16px" }}>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: "8px"
                                            }}>
                                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
                                                    {contest.title}
                                                </h3>
                                                <span style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    background: "rgba(107, 114, 128, 0.2)",
                                                    color: "#6b7280",
                                                }}>
                                                    ✅ Completed
                                                </span>
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                gap: "16px",
                                                fontSize: "0.85rem",
                                                color: "#6b6b80",
                                            }}>
                                                <span>⚡ {contest.difficulty}</span>
                                                <span>⏱ {Math.floor(contest.durationSeconds / 60)} min</span>
                                                <span>👥 {contest.participantCount} participants</span>
                                            </div>
                                        </div>

                                        {/* Winner Info */}
                                        {contest.winnerName && (
                                            <div style={{
                                                padding: "16px",
                                                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(245, 158, 11, 0.15))",
                                                borderRadius: "12px",
                                                marginBottom: "16px",
                                                border: "1px solid rgba(255, 215, 0, 0.2)"
                                            }}>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    marginBottom: "8px"
                                                }}>
                                                    <span style={{ fontSize: "1.5rem" }}>🥇</span>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: "#ffd700" }}>
                                                            {contest.winnerName}
                                                        </div>
                                                        <div style={{ fontSize: "0.8rem", color: "#b8b8cc" }}>
                                                            Champion
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: "flex",
                                                    gap: "24px",
                                                    fontSize: "0.9rem",
                                                }}>
                                                    <span>
                                                        <strong style={{ color: "#00d4ff" }}>{contest.winnerWpm}</strong> WPM
                                                    </span>
                                                    <span>
                                                        <strong style={{ color: "#10b981" }}>{contest.winnerAccuracy?.toFixed(1)}%</strong> accuracy
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}>
                                            <span style={{ fontSize: "0.85rem", color: "#6b6b80" }}>
                                                📅 {new Date(contest.endTime).toLocaleDateString()}
                                            </span>
                                            <Link href={`/contest/${contest.id}`}>
                                                <button className="btn-secondary" style={{
                                                    padding: "8px 16px",
                                                    fontSize: "0.85rem"
                                                }}>
                                                    View Leaderboard
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
