import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { isAuthenticated, getUser, logout } from "@/lib/auth";
import { useRouter } from "next/router";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084';

export default function Dashboard() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

            <div className="dashboard-container">
                {/* Navigation */}
                <nav className="dashboard-nav">
                    <Link href="/" className="nav-logo">
                        <span className="logo-icon">⌨️</span>
                        <span className="logo-text">TyperPro</span>
                    </Link>
                    <div className="nav-links">
                        <Link href="/" className="nav-link">Home</Link>
                        <Link href="/test" className="nav-link">Practice</Link>
                        <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
                        <Link href="/dashboard" className="nav-link active">Dashboard</Link>
                        {user && (
                            <div className="user-badge">
                                <span className="user-icon">👤</span>
                                <span>{user.displayName}</span>
                            </div>
                        )}
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
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
                            <section className="hero-section">
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
                                                    strokeDasharray: `${(dashboard.finalScore / 100) * 327} 327`
                                                }}
                                            />
                                        </svg>
                                        <div className="score-value">
                                            <span className="score-number">{dashboard.finalScore}</span>
                                            <span className="score-badge">{dashboard.performanceBadge}</span>
                                        </div>
                                    </div>
                                    <h2 className="performance-rating">{dashboard.performanceRating}</h2>
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

                            {/* Weekly Progress */}
                            {dashboard.weeklyProgress && dashboard.weeklyProgress.length > 0 && (
                                <section className="progress-section">
                                    <h3>📊 Weekly Progress</h3>
                                    <div className="progress-chart">
                                        {dashboard.weeklyProgress.map((week, index) => (
                                            <div key={index} className="week-bar">
                                                <div className="bar-container">
                                                    <div
                                                        className="bar-fill"
                                                        style={{ height: `${Math.min((week.avgWpm / 100) * 100, 100)}%` }}
                                                    >
                                                        <span className="bar-value">{week.avgWpm}</span>
                                                    </div>
                                                </div>
                                                <span className="week-label">{week.week}</span>
                                                <span className="test-count">{week.testCount} tests</span>
                                            </div>
                                        ))}
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
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(102, 126, 234, 0.2);
                    border-radius: 20px;
                    border: 1px solid rgba(102, 126, 234, 0.3);
                }

                .logout-btn {
                    background: rgba(255, 100, 100, 0.2);
                    border: 1px solid rgba(255, 100, 100, 0.3);
                    color: #ff6b6b;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .logout-btn:hover {
                    background: rgba(255, 100, 100, 0.3);
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
                    display: block;
                    font-size: 2.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .score-badge {
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

                .metric-value {
                    font-size: 2rem;
                    font-weight: 700;
                }

                .metric-label {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.875rem;
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
