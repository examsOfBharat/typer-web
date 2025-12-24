import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

// Mock leaderboard data for demo
const MOCK_LEADERBOARD = [
    { rank: 1, username: "SpeedTyper_Pro", wpm: 142, accuracy: 98, tests: 156 },
    { rank: 2, username: "KeyboardNinja", wpm: 138, accuracy: 97, tests: 203 },
    { rank: 3, username: "TypeMaster_X", wpm: 135, accuracy: 99, tests: 89 },
    { rank: 4, username: "FlashFingers", wpm: 128, accuracy: 96, tests: 312 },
    { rank: 5, username: "SwiftKeys", wpm: 124, accuracy: 95, tests: 178 },
    { rank: 6, username: "RapidTypist", wpm: 121, accuracy: 94, tests: 245 },
    { rank: 7, username: "KeyStroke_King", wpm: 118, accuracy: 97, tests: 134 },
    { rank: 8, username: "TypeRacer2024", wpm: 115, accuracy: 93, tests: 267 },
    { rank: 9, username: "WordsPerMin", wpm: 112, accuracy: 95, tests: 198 },
    { rank: 10, username: "FastFingers_22", wpm: 108, accuracy: 92, tests: 423 },
];

const getRankStyle = (rank) => {
    if (rank === 1) return { background: "linear-gradient(135deg, #ffd700, #ffb800)", icon: "🥇" };
    if (rank === 2) return { background: "linear-gradient(135deg, #c0c0c0, #a8a8a8)", icon: "🥈" };
    if (rank === 3) return { background: "linear-gradient(135deg, #cd7f32, #b8702d)", icon: "🥉" };
    return { background: "linear-gradient(135deg, #00d4ff, #a855f7)", icon: null };
};

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        // Simulate API loading
        const timer = setTimeout(() => {
            setLeaderboard(MOCK_LEADERBOARD);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    const filteredLeaderboard = filter === "all"
        ? leaderboard
        : leaderboard.filter((_, i) => i < 5);

    return (
        <>
            <Head>
                <title>Typing Leaderboard - Top Typists & Global Rankings | TyperPro</title>
                <meta
                    name="description"
                    content="View the global typing leaderboard. See top typists ranked by WPM and accuracy. Compete to climb the rankings and become a typing champion!"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="keywords" content="typing leaderboard, top typists, fastest typers, WPM rankings, typing competition, typing champions" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://typer.examsofbharat.com/leaderboard" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://typer.examsofbharat.com/leaderboard" />
                <meta property="og:title" content="Typing Leaderboard - Top Typists | TyperPro" />
                <meta property="og:description" content="See who has the fastest typing speed. Global rankings updated in real-time." />
                <meta property="og:image" content="https://typer.examsofbharat.com/og-image.png" />
                <meta property="og:site_name" content="TyperPro" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Typing Leaderboard - TyperPro" />
                <meta name="twitter:description" content="View global typing rankings and compete with the best typists." />
                <meta name="twitter:image" content="https://typer.examsofbharat.com/og-image.png" />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "name": "TyperPro Typing Leaderboard",
                            "description": "Global leaderboard of top typists",
                            "url": "https://typer.examsofbharat.com/leaderboard",
                            "numberOfItems": 10,
                            "itemListOrder": "https://schema.org/ItemListOrderDescending"
                        })
                    }}
                />
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
                    <div style={{ display: "flex", gap: "24px" }}>
                        <Link href="/" style={{ textDecoration: "none", color: "#b8b8cc" }}>
                            Home
                        </Link>
                        <Link href="/test" style={{ textDecoration: "none", color: "#b8b8cc" }}>
                            Practice
                        </Link>
                        <Link href="/leaderboard" style={{ textDecoration: "none", color: "#00d4ff" }}>
                            Leaderboard
                        </Link>
                    </div>
                </nav>

                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
                            🏆 Global Leaderboard
                        </h1>
                        <p style={{ color: "#b8b8cc" }}>
                            Top performers from around the world
                        </p>
                    </div>

                    {/* Filter Buttons */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "12px",
                            marginBottom: "32px",
                        }}
                    >
                        <button
                            className={`difficulty-btn ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All Time
                        </button>
                        <button
                            className={`difficulty-btn ${filter === "top5" ? "active" : ""}`}
                            onClick={() => setFilter("top5")}
                        >
                            Top 5
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

                    {/* Leaderboard Table */}
                    {!loading && (
                        <div
                            className="glass-card"
                            style={{
                                overflow: "hidden",
                            }}
                        >
                            {/* Table Header */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "80px 1fr 100px 100px 100px",
                                    padding: "20px 24px",
                                    background: "rgba(0, 212, 255, 0.1)",
                                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                                    fontWeight: 600,
                                    color: "#b8b8cc",
                                    fontSize: "0.9rem",
                                }}
                            >
                                <div>Rank</div>
                                <div>Player</div>
                                <div style={{ textAlign: "center" }}>WPM</div>
                                <div style={{ textAlign: "center" }}>Accuracy</div>
                                <div style={{ textAlign: "center" }}>Tests</div>
                            </div>

                            {/* Table Rows */}
                            {filteredLeaderboard.map((player, index) => {
                                const rankStyle = getRankStyle(player.rank);
                                return (
                                    <div
                                        key={player.rank}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "80px 1fr 100px 100px 100px",
                                            padding: "20px 24px",
                                            borderBottom:
                                                index < filteredLeaderboard.length - 1
                                                    ? "1px solid rgba(255, 255, 255, 0.05)"
                                                    : "none",
                                            transition: "all 0.3s ease",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(0, 212, 255, 0.05)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        {/* Rank */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            {rankStyle.icon ? (
                                                <span style={{ fontSize: "1.5rem" }}>{rankStyle.icon}</span>
                                            ) : (
                                                <span
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        borderRadius: "50%",
                                                        background: rankStyle.background,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontWeight: 700,
                                                        fontSize: "0.85rem",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    {player.rank}
                                                </span>
                                            )}
                                        </div>

                                        {/* Username */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                fontWeight: 500,
                                                color: player.rank <= 3 ? "#fff" : "#b8b8cc",
                                            }}
                                        >
                                            {player.username}
                                        </div>

                                        {/* WPM */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 700,
                                                fontSize: "1.1rem",
                                                color: "#00d4ff",
                                            }}
                                        >
                                            {player.wpm}
                                        </div>

                                        {/* Accuracy */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color:
                                                    player.accuracy >= 95
                                                        ? "#10b981"
                                                        : player.accuracy >= 90
                                                            ? "#f59e0b"
                                                            : "#ef4444",
                                            }}
                                        >
                                            {player.accuracy}%
                                        </div>

                                        {/* Tests */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#6b6b80",
                                            }}
                                        >
                                            {player.tests}
                                        </div>
                                    </div>
                                );
                            })}
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
                        <Link href="/test">
                            <button className="btn-primary pulse-glow">
                                Take the Challenge
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
