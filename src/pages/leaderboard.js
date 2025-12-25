import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getLeaderboard, getGlobalLeaderboard, getContests } from "@/lib/api";
import { isAuthenticated, getUser, logout } from "@/lib/auth";

const getRankStyle = (rank) => {
    if (rank === 1) return { background: "linear-gradient(135deg, #ffd700, #ffb800)", icon: "🥇" };
    if (rank === 2) return { background: "linear-gradient(135deg, #c0c0c0, #a8a8a8)", icon: "🥈" };
    if (rank === 3) return { background: "linear-gradient(135deg, #cd7f32, #b8702d)", icon: "🥉" };
    return { background: "linear-gradient(135deg, #00d4ff, #a855f7)", icon: null };
};

export default function Leaderboard() {
    const [activeTab, setActiveTab] = useState("global"); // global, practice, contest
    const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
    const [practiceLeaderboard, setPracticeLeaderboard] = useState([]);
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
        setUser(getUser());
        loadData();
    }, []);

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setUser(null);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            // Load global leaderboard
            const global = await getGlobalLeaderboard();
            setGlobalLeaderboard(global);

            // Load practice (WPM-based) leaderboard
            const practice = await getLeaderboard(50);
            setPracticeLeaderboard(practice);

            // Load completed contests for contest leaderboard dropdown
            const allContests = await getContests();
            const completed = allContests.filter(c => c.status === "COMPLETED");
            setContests(completed);
        } catch (error) {
            console.error("Failed to load leaderboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Typing Leaderboard - Top Typists & Global Rankings | TyperPro</title>
                <meta
                    name="description"
                    content="View the global typing leaderboard. See top typists ranked by WPM and accuracy. Compete to climb the rankings and become a typing champion!"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="canonical" href="https://typer.examsofbharat.com/leaderboard" />
            </Head>

            <div
                style={{
                    minHeight: "100vh",
                    background:
                        "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)",
                    padding: "100px 20px 40px",
                }}
            >
                {/* Navigation */}
                <nav
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: "20px 40px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(10, 10, 15, 0.9)",
                        backdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        zIndex: 100,
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            textDecoration: "none",
                            background: "linear-gradient(135deg, #00d4ff, #a855f7, #ec4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        TyperPro
                    </Link>
                    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                        <Link href="/" style={{ textDecoration: "none", color: "#b8b8cc" }}>
                            Home
                        </Link>
                        <Link href="/test" style={{ textDecoration: "none", color: "#b8b8cc" }}>
                            Practice
                        </Link>
                        <Link href="/contest" style={{ textDecoration: "none", color: "#b8b8cc" }}>
                            Contests
                        </Link>
                        <Link href="/leaderboard" style={{ textDecoration: "none", color: "#00d4ff" }}>
                            Leaderboard
                        </Link>
                        {isLoggedIn && user && (
                            <Link href="/dashboard" style={{ textDecoration: "none", color: "#b8b8cc" }}>
                                Dashboard
                            </Link>
                        )}
                        {isLoggedIn && user ? (
                            <div className="user-badge">
                                <span className="avatar">{user.displayName?.charAt(0).toUpperCase()}</span>
                                <span>{user.displayName}</span>
                                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <button className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.9rem" }}>Login</button>
                            </Link>
                        )}
                    </div>
                </nav>

                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    {/* Page Header */}
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h1
                            style={{
                                fontSize: "2.5rem",
                                fontWeight: 700,
                                marginBottom: "16px",
                                background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            🏆 Leaderboards
                        </h1>
                        <p style={{ color: "#b8b8cc" }}>
                            Track your ranking and compete with the best typists!
                        </p>
                    </div>

                    {/* Tab Buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "12px",
                            marginBottom: "32px",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            className={`difficulty-btn ${activeTab === "global" ? "active" : ""}`}
                            onClick={() => setActiveTab("global")}
                        >
                            🌍 Global Ranking
                        </button>
                        <button
                            className={`difficulty-btn ${activeTab === "practice" ? "active" : ""}`}
                            onClick={() => setActiveTab("practice")}
                        >
                            ⌨️ Practice (WPM)
                        </button>
                        <button
                            className={`difficulty-btn ${activeTab === "contest" ? "active" : ""}`}
                            onClick={() => setActiveTab("contest")}
                        >
                            🎯 Contests
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "60px",
                            }}
                        >
                            <div className="spinner" />
                            <p style={{ color: "#b8b8cc", marginTop: "20px" }}>
                                Loading leaderboard...
                            </p>
                        </div>
                    )}

                    {/* Global Leaderboard */}
                    {!loading && activeTab === "global" && (
                        <div className="glass-card" style={{ overflow: "hidden" }}>
                            <div style={{
                                padding: "16px 24px",
                                background: "rgba(168, 85, 247, 0.1)",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            }}>
                                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Global Ranking (Practice + Contest Points)</h2>
                            </div>

                            {globalLeaderboard.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#6b6b80" }}>
                                    No rankings yet. Complete practice tests or contests to appear!
                                </div>
                            ) : (
                                <>
                                    {/* Table Header */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "60px 1fr 100px 100px 100px",
                                            padding: "16px 24px",
                                            background: "rgba(0, 212, 255, 0.05)",
                                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                                            fontWeight: 600,
                                            color: "#b8b8cc",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <div>Rank</div>
                                        <div>Player</div>
                                        <div style={{ textAlign: "center" }}>Practice</div>
                                        <div style={{ textAlign: "center" }}>Contest</div>
                                        <div style={{ textAlign: "center" }}>Total</div>
                                    </div>

                                    {/* Table Rows */}
                                    {globalLeaderboard.map((entry, index) => {
                                        const rankStyle = getRankStyle(entry.rank || index + 1);
                                        return (
                                            <div
                                                key={entry.odl || index}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "60px 1fr 100px 100px 100px",
                                                    padding: "16px 24px",
                                                    borderBottom: index < globalLeaderboard.length - 1
                                                        ? "1px solid rgba(255, 255, 255, 0.05)"
                                                        : "none",
                                                    transition: "background 0.2s",
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 212, 255, 0.05)"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {rankStyle.icon ? (
                                                        <span style={{ fontSize: "1.3rem" }}>{rankStyle.icon}</span>
                                                    ) : (
                                                        <span style={{
                                                            width: "28px",
                                                            height: "28px",
                                                            borderRadius: "50%",
                                                            background: rankStyle.background,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 700,
                                                            fontSize: "0.8rem",
                                                            color: "#fff",
                                                        }}>
                                                            {entry.rank || index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", fontWeight: 500 }}>
                                                    {entry.displayName}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#00d4ff" }}>
                                                    {entry.practicePoints}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}>
                                                    {entry.contestPoints}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#10b981" }}>
                                                    {entry.totalPoints}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}

                    {/* Practice (WPM) Leaderboard */}
                    {!loading && activeTab === "practice" && (
                        <div className="glass-card" style={{ overflow: "hidden" }}>
                            <div style={{
                                padding: "16px 24px",
                                background: "rgba(0, 212, 255, 0.1)",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            }}>
                                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Practice Leaderboard (By WPM)</h2>
                            </div>

                            {practiceLeaderboard.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#6b6b80" }}>
                                    No practice tests yet. Be the first!
                                </div>
                            ) : (
                                <>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "60px 1fr 100px 100px",
                                            padding: "16px 24px",
                                            background: "rgba(0, 212, 255, 0.05)",
                                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                                            fontWeight: 600,
                                            color: "#b8b8cc",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <div>Rank</div>
                                        <div>Player</div>
                                        <div style={{ textAlign: "center" }}>WPM</div>
                                        <div style={{ textAlign: "center" }}>Accuracy</div>
                                    </div>

                                    {practiceLeaderboard.map((entry, index) => {
                                        const rankStyle = getRankStyle(index + 1);
                                        return (
                                            <div
                                                key={entry.userId || index}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "60px 1fr 100px 100px",
                                                    padding: "16px 24px",
                                                    borderBottom: index < practiceLeaderboard.length - 1
                                                        ? "1px solid rgba(255, 255, 255, 0.05)"
                                                        : "none",
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0, 212, 255, 0.05)"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                            >
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {rankStyle.icon ? (
                                                        <span style={{ fontSize: "1.3rem" }}>{rankStyle.icon}</span>
                                                    ) : (
                                                        <span style={{
                                                            width: "28px",
                                                            height: "28px",
                                                            borderRadius: "50%",
                                                            background: rankStyle.background,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: 700,
                                                            fontSize: "0.8rem",
                                                            color: "#fff",
                                                        }}>
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", fontWeight: 500 }}>
                                                    {entry.displayName || entry.username || "Anonymous"}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#00d4ff" }}>
                                                    {entry.wpm}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: entry.accuracy >= 95 ? "#10b981" : "#f59e0b" }}>
                                                    {entry.accuracy?.toFixed(1)}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}

                    {/* Contest Leaderboard */}
                    {!loading && activeTab === "contest" && (
                        <div className="glass-card" style={{ overflow: "hidden" }}>
                            <div style={{
                                padding: "16px 24px",
                                background: "rgba(16, 185, 129, 0.1)",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            }}>
                                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Contest Leaderboards</h2>
                            </div>

                            {contests.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: "#6b6b80" }}>
                                    No completed contests yet. Stay tuned!
                                </div>
                            ) : (
                                <div style={{ padding: "24px" }}>
                                    <p style={{ color: "#b8b8cc", marginBottom: "16px" }}>
                                        Select a contest to view its leaderboard:
                                    </p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {contests.map(contest => (
                                            <Link key={contest.id} href={`/contest/${contest.id}`}>
                                                <div
                                                    style={{
                                                        padding: "16px 24px",
                                                        background: "rgba(0, 0, 0, 0.3)",
                                                        borderRadius: "12px",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        cursor: "pointer",
                                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                                        transition: "all 0.2s",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = "#10b981";
                                                        e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                                                        e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
                                                    }}
                                                >
                                                    <div>
                                                        <h3 style={{ margin: 0, marginBottom: "4px" }}>{contest.title}</h3>
                                                        <span style={{ color: "#6b6b80", fontSize: "0.85rem" }}>
                                                            {contest.registeredParticipants} participants
                                                        </span>
                                                    </div>
                                                    <span style={{ color: "#10b981" }}>View →</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CTA Section */}
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "48px",
                        }}
                    >
                        <p style={{ color: "#b8b8cc", marginBottom: "24px" }}>
                            Think you can make it to the top?
                        </p>
                        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                            <Link href="/test">
                                <button className="btn-primary">
                                    Practice Now
                                </button>
                            </Link>
                            <Link href="/contest">
                                <button className="btn-secondary">
                                    Join a Contest
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
