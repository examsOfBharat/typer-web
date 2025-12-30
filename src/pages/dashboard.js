import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { isAuthenticated, getUser, logout } from "@/lib/auth";
import { useRouter } from "next/router";

import { API_BASE_URL } from '@/lib/api';

export default function Dashboard() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [claimedRewards, setClaimedRewards] = useState({}); // { rewardId: { voucherCode, voucherPin } }
    const [claimingReward, setClaimingReward] = useState(null); // rewardId being claimed

    useEffect(() => {
        setMounted(true);
        const authenticated = isAuthenticated();
        setIsLoggedIn(authenticated);

        if (!authenticated) {
            router.push('/login');
            return;
        }

        const userData = getUser();
        setUser(userData);

        if (userData?.userId) {
            fetchDashboard(userData.userId);
        }
    }, [router]);

    const fetchDashboard = async (userId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/typer/dashboard/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const data = await response.json();
            setDashboard(data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async (rewardId) => {
        try {
            setClaimingReward(rewardId);
            const response = await fetch(
                `${API_BASE_URL}/typer/rewards/${rewardId}/claim?userId=${user.userId}`,
                { method: 'POST' }
            );
            if (!response.ok) {
                throw new Error('Failed to claim reward');
            }
            const data = await response.json();
            if (data.success) {
                setClaimedRewards(prev => ({
                    ...prev,
                    [rewardId]: {
                        voucherCode: data.voucherCode,
                        voucherPin: data.voucherPin
                    }
                }));
                // Update the reward status in dashboard state
                setDashboard(prev => ({
                    ...prev,
                    earnedRewards: prev.earnedRewards.map(r =>
                        r.id === rewardId ? { ...r, status: 'CLAIMED' } : r
                    )
                }));
            }
        } catch (err) {
            console.error('Claim reward error:', err);
            alert('Failed to claim reward. Please try again.');
        } finally {
            setClaimingReward(null);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!mounted) return null;

    if (!isLoggedIn) {
        return null;
    }

    return (
        <>
            <Head>
                <title>My Dashboard - Typing Stats & Progress | TyperPro</title>
                <meta name="description" content="View your typing performance dashboard. Track WPM improvement, accuracy stats, and practice history." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="test-page">
                {/* Navigation */}
                <nav className="test-nav">
                    <Link href="/" className="logo">
                        TyperPro
                    </Link>
                    <div className="nav-links">
                        <Link href="/">Home</Link>
                        <Link href="/test">Practice</Link>
                        <Link href="/contest">Contests</Link>
                        <Link href="/leaderboard">Leaderboard</Link>
                        <Link href="/dashboard" className="active">Dashboard</Link>
                        {user && (
                            <div className="user-badge">
                                <span className="avatar">{user.displayName?.charAt(0).toUpperCase()}</span>
                                <span>{user.displayName}</span>
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </div>
                        )}
                    </div>
                </nav>

                <main className="dashboard-main">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Loading your dashboard...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>⚠️ {error}</p>
                            <button onClick={() => fetchDashboard(user?.userId)}>Retry</button>
                        </div>
                    ) : dashboard ? (
                        <>
                            {/* Hero Section with Score */}
                            <section className="hero-section" style={{ position: "relative" }}>
                                {/* Global Points Badge - Top Right Corner */}
                                <div
                                    title="Points: Practice (max 5 pts based on score) + Contest (from competitions). Higher points = higher rank!"
                                    style={{
                                        position: "absolute",
                                        top: "16px",
                                        right: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "8px 16px",
                                        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 212, 255, 0.2))",
                                        borderRadius: "50px",
                                        border: "1px solid rgba(168, 85, 247, 0.3)",
                                        cursor: "help"
                                    }}>
                                    <span style={{ fontSize: "1.2rem" }}>🏆</span>
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontSize: "1rem", fontWeight: "700", color: "#a855f7" }}>
                                            {dashboard.totalPoints || 0} pts
                                        </div>
                                        <div style={{ fontSize: "0.65rem", color: "#6b6b80" }}>
                                            {dashboard.globalRank ? `Rank #${dashboard.globalRank}` : "Global Points"}
                                        </div>
                                    </div>
                                </div>

                                <div className="score-card">
                                    <div className="score-ring">
                                        <svg viewBox="0 0 120 120">
                                            <circle className="ring-bg" cx="60" cy="60" r="52" />
                                            <circle
                                                className="ring-progress"
                                                cx="60"
                                                cy="60"
                                                r="52"
                                                style={{
                                                    strokeDasharray: `${(dashboard.finalScore / 100) * 327} 327`,
                                                    stroke: dashboard.performanceRating === 'Below Average'
                                                        ? "#f97316"  // Orange
                                                        : dashboard.performanceRating === 'Average'
                                                            ? "#eab308"  // Yellow
                                                            : dashboard.performanceRating === 'Good'
                                                                ? "#22c55e"  // Green
                                                                : dashboard.performanceRating === 'Very Good'
                                                                    ? "#3b82f6"  // Blue
                                                                    : "#a855f7"  // Purple for Awesome
                                                }}
                                            />
                                        </svg>
                                        <div className="score-value">
                                            <span className="score-number" style={{
                                                background: dashboard.performanceRating === 'Below Average'
                                                    ? "linear-gradient(135deg, #f97316, #fb923c)"
                                                    : dashboard.performanceRating === 'Average'
                                                        ? "linear-gradient(135deg, #eab308, #facc15)"
                                                        : dashboard.performanceRating === 'Good'
                                                            ? "linear-gradient(135deg, #22c55e, #4ade80)"
                                                            : dashboard.performanceRating === 'Very Good'
                                                                ? "linear-gradient(135deg, #3b82f6, #60a5fa)"
                                                                : "linear-gradient(135deg, #a855f7, #c084fc)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                backgroundClip: "text"
                                            }}>{dashboard.finalScore}</span>
                                            <span className="score-max">/100</span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                        <h2 className="performance-rating">{dashboard.performanceRating}</h2>
                                        <span
                                            className="info-tooltip"
                                            title="Score is calculated from: WPM (40%), Accuracy (35%), Consistency (15%), Practice Volume (10%)"
                                            style={{
                                                cursor: "help",
                                                fontSize: "0.9rem",
                                                color: "rgba(255,255,255,0.5)",
                                                border: "1px solid rgba(255,255,255,0.3)",
                                                borderRadius: "50%",
                                                width: "18px",
                                                height: "18px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >?</span>
                                    </div>
                                    <p className="member-since">Member since {new Date(dashboard.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                </div>

                                <div className="welcome-text">
                                    <h1>Welcome back, <span className="highlight">{dashboard.displayName}</span>! 👋</h1>
                                    <p className="trend-text">
                                        {dashboard.improvementTrend === 'improving' ? '📈 You\'re improving!' :
                                            dashboard.improvementTrend === 'declining' ? '📉 Keep practicing!' :
                                                '📊 Staying consistent!'}
                                        {dashboard.improvementRate !== 0 && (
                                            <span className={`trend-badge ${dashboard.improvementTrend}`}>
                                                {dashboard.improvementRate > 0 ? '+' : ''}{dashboard.improvementRate}%
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </section>

                            {/* Metrics Grid */}
                            <section className="metrics-section">
                                <div className="metrics-grid">
                                    <div className="metric-card wpm">
                                        <div className="metric-icon">⚡</div>
                                        <div className="metric-content">
                                            <span className="metric-value">{dashboard.averageWpm}</span>
                                            <span className="metric-label">Avg WPM</span>
                                        </div>
                                        <div className="metric-best">Best: {dashboard.bestWpm}</div>
                                    </div>

                                    <div className="metric-card accuracy">
                                        <div className="metric-icon">🎯</div>
                                        <div className="metric-content">
                                            <span className="metric-value">{dashboard.averageAccuracy}%</span>
                                            <span className="metric-label">Avg Accuracy</span>
                                        </div>
                                        <div className="metric-best">Best: {dashboard.bestAccuracy}%</div>
                                    </div>

                                    <div className="metric-card tests">
                                        <div className="metric-icon">📝</div>
                                        <div className="metric-content">
                                            <span className="metric-value">{dashboard.totalTests}</span>
                                            <span className="metric-label">Tests Completed</span>
                                        </div>
                                        <div className="metric-best">{dashboard.totalPracticeMinutes} mins practiced</div>
                                    </div>

                                    <div className="metric-card streak">
                                        <div className="metric-icon">🔥</div>
                                        <div className="metric-content">
                                            <span className="metric-value">{dashboard.currentStreak}</span>
                                            <span className="metric-label">Current Streak</span>
                                        </div>
                                        <div className="metric-best">Longest: {dashboard.longestStreak} days</div>
                                    </div>
                                </div>
                            </section>

                            {/* Global Ranking Points */}
                            <section className="ranking-section" style={{
                                marginTop: "32px",
                                padding: "24px",
                                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1))",
                                borderRadius: "16px",
                                border: "1px solid rgba(168, 85, 247, 0.2)"
                            }}>
                                <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    🏆 Global Ranking
                                    {dashboard.globalRank && (
                                        <span style={{
                                            marginLeft: "auto",
                                            padding: "4px 12px",
                                            background: "rgba(168, 85, 247, 0.2)",
                                            borderRadius: "20px",
                                            color: "#a855f7",
                                            fontSize: "0.9rem"
                                        }}>
                                            Rank #{dashboard.globalRank}
                                        </span>
                                    )}
                                </h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" }}>
                                    <div style={{
                                        padding: "20px",
                                        background: "rgba(0, 0, 0, 0.3)",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        border: "1px solid rgba(16, 185, 129, 0.3)"
                                    }}>
                                        <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>
                                            {dashboard.practicePoints || 0}
                                        </div>
                                        <div style={{ color: "#b8b8cc", fontSize: "0.85rem" }}>Practice Points</div>
                                        <div style={{ color: "#6b6b80", fontSize: "0.75rem", marginTop: "4px" }}>Max: 5</div>
                                    </div>
                                    <div style={{
                                        padding: "20px",
                                        background: "rgba(0, 0, 0, 0.3)",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        border: "1px solid rgba(0, 212, 255, 0.3)"
                                    }}>
                                        <div style={{ fontSize: "2rem", fontWeight: "700", color: "#00d4ff" }}>
                                            {dashboard.contestPoints || 0}
                                        </div>
                                        <div style={{ color: "#b8b8cc", fontSize: "0.85rem" }}>Contest Points</div>
                                        <div style={{ color: "#6b6b80", fontSize: "0.75rem", marginTop: "4px" }}>From competitions</div>
                                    </div>
                                    <div style={{
                                        padding: "20px",
                                        background: "rgba(168, 85, 247, 0.1)",
                                        borderRadius: "12px",
                                        textAlign: "center",
                                        border: "1px solid rgba(168, 85, 247, 0.3)"
                                    }}>
                                        <div style={{ fontSize: "2rem", fontWeight: "700", color: "#a855f7" }}>
                                            {dashboard.totalPoints || 0}
                                        </div>
                                        <div style={{ color: "#b8b8cc", fontSize: "0.85rem" }}>Total Points</div>
                                        <div style={{ color: "#6b6b80", fontSize: "0.75rem", marginTop: "4px" }}>Combined score</div>
                                    </div>
                                </div>
                                {(!dashboard.globalRank || dashboard.totalPoints === 0) && (
                                    <p style={{ color: "#6b6b80", fontSize: "0.85rem", marginTop: "16px", textAlign: "center" }}>
                                        Complete more practice tests to earn points and appear on the global leaderboard!
                                    </p>
                                )}
                            </section>

                            {/* Earned Rewards Section */}
                            {dashboard.earnedRewards && dashboard.earnedRewards.length > 0 && (
                                <section style={{
                                    marginTop: "32px",
                                    padding: "24px",
                                    background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(245, 158, 11, 0.1))",
                                    borderRadius: "16px",
                                    border: "1px solid rgba(255, 215, 0, 0.3)"
                                }}>
                                    <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        🎁 Earned Rewards
                                        <span style={{
                                            marginLeft: "auto",
                                            padding: "4px 12px",
                                            background: "rgba(255, 215, 0, 0.2)",
                                            borderRadius: "20px",
                                            color: "#fbbf24",
                                            fontSize: "0.9rem"
                                        }}>
                                            {dashboard.earnedRewards.length} Gift Card{dashboard.earnedRewards.length > 1 ? 's' : ''}
                                        </span>
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {dashboard.earnedRewards.map((reward, index) => (
                                            <div key={reward.id || index} style={{
                                                padding: "20px",
                                                background: "rgba(0, 0, 0, 0.3)",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(255, 215, 0, 0.2)"
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                            <span style={{ fontSize: "1.2rem" }}>
                                                                {reward.rank === 1 ? "🥇" : reward.rank === 2 ? "🥈" : "🥉"}
                                                            </span>
                                                            <span style={{ fontWeight: "600", color: "#fbbf24" }}>
                                                                #{reward.rank} Place
                                                            </span>
                                                        </div>
                                                        <div style={{ color: "#b8b8cc", fontSize: "0.95rem" }}>
                                                            {reward.contestTitle}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ fontWeight: "700", fontSize: "1.25rem", color: "#10b981" }}>
                                                            {reward.rewardType && `${reward.rewardType} `}
                                                            {reward.rewardAmount && `₹${reward.rewardAmount}`}
                                                        </div>
                                                        <div style={{ color: "#6b6b80", fontSize: "0.8rem", marginTop: "4px" }}>
                                                            {reward.status === "ACTIVE" && !claimedRewards[reward.id] ? "✅ Ready to claim" :
                                                                reward.status === "CLAIMED" || claimedRewards[reward.id] ? "📦 Claimed" : "⏳ Pending"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Show Claim Button for ACTIVE rewards that haven't been claimed yet */}
                                                {reward.status === "ACTIVE" && !claimedRewards[reward.id] && (
                                                    <div style={{ marginTop: "16px" }}>
                                                        <div style={{
                                                            padding: "12px",
                                                            background: "rgba(0, 0, 0, 0.3)",
                                                            borderRadius: "8px",
                                                            border: "1px dashed rgba(255, 215, 0, 0.4)",
                                                            marginBottom: "12px"
                                                        }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                                                <div>
                                                                    <div style={{ color: "#6b6b80", fontSize: "0.75rem", marginBottom: "4px" }}>Voucher Code</div>
                                                                    <div style={{ fontFamily: "monospace", fontWeight: "600", color: "#6b6b80" }}>
                                                                        ••••••••••••
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div style={{ color: "#6b6b80", fontSize: "0.75rem", marginBottom: "4px" }}>PIN</div>
                                                                    <div style={{ fontFamily: "monospace", fontWeight: "600", color: "#6b6b80" }}>
                                                                        ••••
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleClaimReward(reward.id)}
                                                            disabled={claimingReward === reward.id}
                                                            style={{
                                                                width: "100%",
                                                                padding: "12px 24px",
                                                                background: claimingReward === reward.id
                                                                    ? "rgba(255, 215, 0, 0.2)"
                                                                    : "linear-gradient(135deg, #fbbf24, #f59e0b)",
                                                                border: "none",
                                                                borderRadius: "8px",
                                                                color: claimingReward === reward.id ? "#fbbf24" : "#000",
                                                                fontSize: "1rem",
                                                                fontWeight: "700",
                                                                cursor: claimingReward === reward.id ? "not-allowed" : "pointer",
                                                                transition: "all 0.3s ease"
                                                            }}
                                                        >
                                                            {claimingReward === reward.id ? "🔄 Claiming..." : "🎁 Claim Gift Card"}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Show revealed voucher details for CLAIMED status or after claiming */}
                                                {(reward.status === "CLAIMED" || claimedRewards[reward.id]) && (
                                                    <div style={{
                                                        marginTop: "16px",
                                                        padding: "12px",
                                                        background: "rgba(16, 185, 129, 0.1)",
                                                        borderRadius: "8px",
                                                        border: "1px solid rgba(16, 185, 129, 0.3)"
                                                    }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                                                            <div>
                                                                <div style={{ color: "#6b6b80", fontSize: "0.75rem", marginBottom: "4px" }}>Voucher Code</div>
                                                                <div style={{ fontFamily: "monospace", fontWeight: "600", color: "#10b981" }}>
                                                                    {claimedRewards[reward.id]?.voucherCode || reward.voucherCode}
                                                                </div>
                                                            </div>
                                                            {(claimedRewards[reward.id]?.voucherPin || reward.voucherPin) && (
                                                                <div>
                                                                    <div style={{ color: "#6b6b80", fontSize: "0.75rem", marginBottom: "4px" }}>PIN</div>
                                                                    <div style={{ fontFamily: "monospace", fontWeight: "600", color: "#10b981" }}>
                                                                        {claimedRewards[reward.id]?.voucherPin || reward.voucherPin}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Weekly Progress - Line Chart */}
                            {dashboard.weeklyProgress && dashboard.weeklyProgress.length > 0 && (
                                <section className="progress-section">
                                    <h3>📊 Weekly Progress</h3>
                                    <div style={{ position: "relative", height: "250px", padding: "20px 0" }}>
                                        {/* SVG Line Chart */}
                                        <svg
                                            viewBox="0 0 500 200"
                                            style={{ width: "100%", height: "200px" }}
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Gradient fill under the line */}
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#667eea" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
                                                </linearGradient>
                                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#667eea" />
                                                    <stop offset="100%" stopColor="#a855f7" />
                                                </linearGradient>
                                            </defs>

                                            {/* Grid lines */}
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <line
                                                    key={i}
                                                    x1="40" y1={40 + i * 35}
                                                    x2="480" y2={40 + i * 35}
                                                    stroke="rgba(255,255,255,0.1)"
                                                    strokeWidth="1"
                                                />
                                            ))}

                                            {/* Y-axis labels */}
                                            {[100, 75, 50, 25, 0].map((val, i) => (
                                                <text
                                                    key={val}
                                                    x="30" y={45 + i * 35}
                                                    fontSize="10"
                                                    fill="rgba(255,255,255,0.5)"
                                                    textAnchor="end"
                                                >{val}</text>
                                            ))}

                                            {/* Area fill under line */}
                                            <path
                                                d={`M 40 ${180 - (dashboard.weeklyProgress[0]?.avgWpm || 0) * 1.4} ` +
                                                    dashboard.weeklyProgress.map((week, i) => {
                                                        const x = 40 + (i * (440 / Math.max(dashboard.weeklyProgress.length - 1, 1)));
                                                        const y = 180 - Math.min(week.avgWpm, 100) * 1.4;
                                                        return `L ${x} ${y}`;
                                                    }).join(' ') +
                                                    ` L ${40 + (440 / Math.max(dashboard.weeklyProgress.length - 1, 1)) * (dashboard.weeklyProgress.length - 1)} 180 L 40 180 Z`
                                                }
                                                fill="url(#chartGradient)"
                                            />

                                            {/* Line */}
                                            <path
                                                d={dashboard.weeklyProgress.map((week, i) => {
                                                    const x = 40 + (i * (440 / Math.max(dashboard.weeklyProgress.length - 1, 1)));
                                                    const y = 180 - Math.min(week.avgWpm, 100) * 1.4;
                                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                                }).join(' ')}
                                                fill="none"
                                                stroke="url(#lineGradient)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />

                                            {/* Data points */}
                                            {dashboard.weeklyProgress.map((week, i) => {
                                                const x = 40 + (i * (440 / Math.max(dashboard.weeklyProgress.length - 1, 1)));
                                                const y = 180 - Math.min(week.avgWpm, 100) * 1.4;
                                                return (
                                                    <g key={i}>
                                                        <circle
                                                            cx={x} cy={y} r="6"
                                                            fill="#1a1a2e"
                                                            stroke="url(#lineGradient)"
                                                            strokeWidth="2"
                                                        />
                                                        <circle cx={x} cy={y} r="3" fill="#667eea" />
                                                    </g>
                                                );
                                            })}

                                            {/* X-axis labels */}
                                            {dashboard.weeklyProgress.map((week, i) => {
                                                const x = 40 + (i * (440 / Math.max(dashboard.weeklyProgress.length - 1, 1)));
                                                return (
                                                    <text
                                                        key={i}
                                                        x={x} y="198"
                                                        fontSize="9"
                                                        fill="rgba(255,255,255,0.5)"
                                                        textAnchor="middle"
                                                    >{week.week}</text>
                                                );
                                            })}
                                        </svg>

                                        {/* Legend */}
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: "24px",
                                            marginTop: "16px",
                                            fontSize: "0.85rem",
                                            color: "rgba(255,255,255,0.6)"
                                        }}>
                                            <span>📈 WPM Progress</span>
                                            <span>•</span>
                                            <span>Tests: {dashboard.weeklyProgress.reduce((sum, w) => sum + w.testCount, 0)}</span>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Difficulty Breakdown */}
                            {dashboard.difficultyStats && Object.keys(dashboard.difficultyStats).length > 0 && (
                                <section className="difficulty-section">
                                    <h3>🎮 Performance by Difficulty</h3>
                                    <div className="difficulty-grid">
                                        {Object.entries(dashboard.difficultyStats).map(([level, stats]) => (
                                            <div key={level} className={`difficulty-card ${level.toLowerCase()}`}>
                                                <div className="diff-header">
                                                    <span className="diff-icon">
                                                        {level === 'EASY' ? '🌱' : level === 'MEDIUM' ? '🔥' : level === 'HARD' ? '⚡' : '💎'}
                                                    </span>
                                                    <span className="diff-name">{level}</span>
                                                </div>
                                                <div className="diff-stats">
                                                    <div className="diff-stat">
                                                        <span className="stat-value">{stats.averageWpm}</span>
                                                        <span className="stat-label">Avg WPM</span>
                                                    </div>
                                                    <div className="diff-stat">
                                                        <span className="stat-value">{stats.averageAccuracy}%</span>
                                                        <span className="stat-label">Accuracy</span>
                                                    </div>
                                                    <div className="diff-stat">
                                                        <span className="stat-value">{stats.testCount}</span>
                                                        <span className="stat-label">Tests</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Recent Tests */}
                            {dashboard.recentTests && dashboard.recentTests.length > 0 && (
                                <section className="recent-section">
                                    <h3>📋 Recent Tests</h3>
                                    <div className="recent-list">
                                        {dashboard.recentTests.slice(0, 5).map((test, index) => (
                                            <div key={test.testId || index} className="recent-item">
                                                <div className="recent-info">
                                                    <span className="recent-difficulty">{test.difficulty}</span>
                                                    <span className="recent-date">
                                                        {new Date(test.testDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="recent-stats">
                                                    <span className="recent-wpm">{test.wpm} WPM</span>
                                                    <span className="recent-accuracy">{test.accuracy}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* CTA Section */}
                            <section className="cta-section">
                                <Link href="/test" className="cta-button">
                                    <span>🚀</span> Start Practicing
                                </Link>
                            </section>
                        </>
                    ) : (
                        <div className="empty-state">
                            <h2>No Data Yet</h2>
                            <p>Complete some typing tests to see your dashboard!</p>
                            <Link href="/test" className="cta-button">Start Your First Test</Link>
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                .dashboard-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
                    color: #fff;
                }

                .dashboard-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: inherit;
                }

                .logo-icon {
                    font-size: 1.5rem;
                }

                .logo-text {
                    font-size: 1.25rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .nav-link {
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    transition: color 0.3s;
                }

                .nav-link:hover, .nav-link.active {
                    color: #667eea;
                }

                .user-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid rgba(0, 212, 255, 0.3);
                    border-radius: 50px;
                    padding: 8px 16px;
                    font-size: 0.9rem;
                    color: #00d4ff;
                }

                .user-badge .avatar {
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #00d4ff, #a855f7);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    color: #ffffff;
                    font-weight: 700;
                }

                .logout-btn {
                    background: none;
                    border: none;
                    color: #6b6b80;
                    cursor: pointer;
                    padding: 4px 8px;
                    font-size: 0.85rem;
                    transition: color 0.3s ease;
                }

                .logout-btn:hover {
                    color: #ef4444;
                }

                .dashboard-main {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }

                .loading-state, .error-state, .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(102, 126, 234, 0.3);
                    border-top-color: #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Hero Section */
                .hero-section {
                    display: flex;
                    align-items: center;
                    gap: 3rem;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 2rem;
                }

                .score-card {
                    text-align: center;
                    flex-shrink: 0;
                }

                .score-ring {
                    width: 150px;
                    height: 150px;
                    position: relative;
                    margin: 0 auto 1rem;
                }

                .score-ring svg {
                    transform: rotate(-90deg);
                    width: 100%;
                    height: 100%;
                }

                .ring-bg {
                    fill: none;
                    stroke: rgba(255, 255, 255, 0.1);
                    stroke-width: 8;
                }

                .ring-progress {
                    fill: none;
                    stroke: url(#gradient);
                    stroke-width: 8;
                    stroke-linecap: round;
                    transition: stroke-dasharray 1s ease;
                }

                .score-value {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .score-number {
                    display: inline;
                    font-size: 2.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .score-max {
                    display: inline;
                    font-size: 1rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.5);
                }

                .score-badge {
                    display: block;
                    font-size: 1.5rem;
                }

                .performance-rating {
                    font-size: 1.25rem;
                    color: #667eea;
                    margin: 0.5rem 0;
                }

                .member-since {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.875rem;
                }

                .welcome-text {
                    flex: 1;
                }

                .welcome-text h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .highlight {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .trend-text {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1.125rem;
                }

                .trend-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    margin-left: 0.5rem;
                }

                .trend-badge.improving {
                    background: rgba(100, 255, 100, 0.2);
                    color: #4ade80;
                }

                .trend-badge.declining {
                    background: rgba(255, 100, 100, 0.2);
                    color: #ff6b6b;
                }

                .trend-badge.stable {
                    background: rgba(255, 200, 100, 0.2);
                    color: #fbbf24;
                }

                /* Metrics Grid */
                .metrics-section {
                    margin-bottom: 2rem;
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.5rem;
                }

                .metric-card {
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .metric-card.wpm { border-left: 4px solid #667eea; }
                .metric-card.accuracy { border-left: 4px solid #4ade80; }
                .metric-card.tests { border-left: 4px solid #fbbf24; }
                .metric-card.streak { border-left: 4px solid #f97316; }

                .metric-icon {
                    font-size: 2rem;
                }

                .metric-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .metric-value {
                    font-size: 2rem;
                    font-weight: 700;
                    line-height: 1;
                }

                .metric-label {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.875rem;
                    margin-top: 4px;
                }

                .metric-best {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.75rem;
                    margin-top: auto;
                }

                /* Progress Section */
                .progress-section, .difficulty-section, .recent-section {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .progress-section h3, .difficulty-section h3, .recent-section h3 {
                    margin-bottom: 1.5rem;
                    font-size: 1.125rem;
                }

                .progress-chart {
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-end;
                    height: 200px;
                    gap: 1rem;
                }

                .week-bar {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    max-width: 80px;
                }

                .bar-container {
                    width: 100%;
                    height: 150px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                }

                .bar-fill {
                    width: 100%;
                    background: linear-gradient(180deg, #667eea, #764ba2);
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 0.5rem;
                    transition: height 0.5s ease;
                }

                .bar-value {
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .week-label {
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .test-count {
                    font-size: 0.625rem;
                    color: rgba(255, 255, 255, 0.4);
                }

                /* Difficulty Grid */
                .difficulty-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                }

                .difficulty-card {
                    padding: 1rem;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                }

                .difficulty-card.easy { border: 1px solid rgba(74, 222, 128, 0.3); }
                .difficulty-card.medium { border: 1px solid rgba(251, 191, 36, 0.3); }
                .difficulty-card.hard { border: 1px solid rgba(249, 115, 22, 0.3); }
                .difficulty-card.expert { border: 1px solid rgba(139, 92, 246, 0.3); }

                .diff-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .diff-icon {
                    font-size: 1.25rem;
                }

                .diff-name {
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .diff-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0.5rem;
                    text-align: center;
                }

                .diff-stat .stat-value {
                    display: block;
                    font-weight: 600;
                    font-size: 1rem;
                }

                .diff-stat .stat-label {
                    font-size: 0.625rem;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Recent Tests */
                .recent-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .recent-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                }

                .recent-info {
                    display: flex;
                    gap: 1rem;
                }

                .recent-difficulty {
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .recent-date {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.875rem;
                }

                .recent-stats {
                    display: flex;
                    gap: 1.5rem;
                }

                .recent-wpm {
                    color: #667eea;
                    font-weight: 600;
                }

                .recent-accuracy {
                    color: #4ade80;
                }

                /* CTA Section */
                .cta-section {
                    text-align: center;
                    padding: 2rem;
                }

                .cta-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1.125rem;
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hero-section {
                        flex-direction: column;
                        text-align: center;
                    }

                    .welcome-text h1 {
                        font-size: 1.5rem;
                    }

                    .dashboard-nav {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .nav-links {
                        flex-wrap: wrap;
                }

            `}</style>
        </>
    );
}
