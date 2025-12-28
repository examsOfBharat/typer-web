import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { isAuthenticated, getUser, logout } from "@/lib/auth";
import { getContests, getCompletedContests } from "@/lib/api";


export default function Home() {
  const [typingText, setTypingText] = useState("");
  const [stats, setStats] = useState({ wpm: 0, tests: 0, users: 0 });
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [registeredContests, setRegisteredContests] = useState([]);
  const [completedContests, setCompletedContests] = useState([]);
  const fullText = "Master Your Typing Skills";

  // Check auth status on mount
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    setRegisteredContests([]);
  };

  // Fetch registered contests for logged-in users
  useEffect(() => {
    const fetchRegisteredContests = async () => {
      if (isLoggedIn && user?.userId) {
        try {
          const contests = await getContests(user.userId);
          // Filter to only show contests user is registered for
          const registered = contests.filter(c => c.isUserRegistered && c.status !== 'COMPLETED');
          setRegisteredContests(registered);
        } catch (error) {
          console.error('Failed to fetch contests:', error);
        }
      }
    };
    fetchRegisteredContests();
  }, [isLoggedIn, user]);

  // Fetch completed contests on mount (for everyone)
  useEffect(() => {
    const fetchCompletedContests = async () => {
      try {
        const contests = await getCompletedContests();
        setCompletedContests(contests);
      } catch (error) {
        console.error('Failed to fetch completed contests:', error);
      }
    };
    fetchCompletedContests();
  }, []);

  // Typing animation effect
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypingText(fullText.substring(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Animated stats counter
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setStats({
          wpm: Math.round(120 * easeOut),
          tests: Math.round(50000 * easeOut),
          users: Math.round(10000 * easeOut),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    };

    animateStats();
  }, []);

  const features = [
    {
      icon: "⚡",
      title: "Real-time WPM",
      description:
        "Track your words per minute with instant visual feedback as you type.",
    },
    {
      icon: "🎯",
      title: "Accuracy Tracking",
      description:
        "Monitor your precision with detailed error analysis and correction tips.",
    },
    {
      icon: "🏆",
      title: "Leaderboards",
      description:
        "Compete with students worldwide and climb the global rankings.",
    },
    {
      icon: "📈",
      title: "Progress Stats",
      description:
        "View your improvement over time with detailed performance analytics.",
    },
  ];

  return (
    <>
      <Head>
        <title>TyperPro - Free Online Typing Test | Improve Speed & Accuracy</title>
        <meta
          name="description"
          content="Master your typing skills with TyperPro - the free online typing test. Track WPM, accuracy, compete on global leaderboards. Perfect for students, professionals, and competitive typists."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="typing test, typing speed test, WPM test, free typing test, online typing test, typing practice, improve typing speed, typing accuracy, keyboard test, touch typing, typing games, typing tutor" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://typer.examsofbharat.com/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://typer.examsofbharat.com/" />
        <meta property="og:title" content="TyperPro - Free Online Typing Test | Master Your Typing Skills" />
        <meta property="og:description" content="Improve your typing speed and accuracy with TyperPro. Track WPM, compete globally, and become a typing master with our engaging typing tests." />
        <meta property="og:image" content="https://typer.examsofbharat.com/og-image.png" />
        <meta property="og:site_name" content="TyperPro" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://typer.examsofbharat.com/" />
        <meta name="twitter:title" content="TyperPro - Free Online Typing Test" />
        <meta name="twitter:description" content="Master your typing skills with real-time WPM tracking, accuracy analysis, and global leaderboards." />
        <meta name="twitter:image" content="https://typer.examsofbharat.com/og-image.png" />

        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "TyperPro",
              "url": "https://typer.examsofbharat.com",
              "description": "Free online typing test to improve your typing speed and accuracy",
              "publisher": {
                "@type": "Organization",
                "name": "ExamsOfBharat",
                "url": "https://examsofbharat.com"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://typer.examsofbharat.com/test",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "TyperPro",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "10000"
              }
            })
          }}
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)",
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
            background: "rgba(10, 10, 15, 0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #00d4ff, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TyperPro
          </div>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <Link
              href="/"
              className="nav-link active"
              style={{ textDecoration: "none", color: "#00d4ff" }}
            >
              Home
            </Link>
            <Link
              href="/test"
              className="nav-link"
              style={{ textDecoration: "none", color: "#b8b8cc" }}
            >
              Practice
            </Link>
            <Link
              href="/leaderboard"
              className="nav-link"
              style={{ textDecoration: "none", color: "#b8b8cc" }}
            >
              Leaderboard
            </Link>
            <Link
              href="/contest"
              className="nav-link"
              style={{ textDecoration: "none", color: "#b8b8cc" }}
            >
              Contests
            </Link>
            {isLoggedIn && user && (
              <Link
                href="/dashboard"
                className="nav-link"
                style={{ textDecoration: "none", color: "#b8b8cc" }}
              >
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
                <button className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.9rem" }}>Login</button>
              </Link>
            )}
          </div>
        </nav>

        {/* Personalized Welcome Section for Logged-in Users - Shows at TOP */}
        {isLoggedIn && user && (
          <section
            style={{
              padding: "120px 20px 40px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: "40px",
                borderLeft: "4px solid #00d4ff",
              }}
            >
              {/* Greeting */}
              <div style={{ marginBottom: "32px" }}>
                <h2
                  style={{
                    fontSize: "2rem",
                    marginBottom: "8px",
                  }}
                >
                  Welcome back,{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #00d4ff, #a855f7)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {user.displayName}!
                  </span>
                </h2>
                <p style={{ color: "#b8b8cc" }}>
                  Ready to improve your typing skills today?
                </p>
              </div>

              {/* Registered Contests */}
              {registeredContests.length > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "#b8b8cc" }}>
                    🎯 Your Upcoming Contests
                  </h3>
                  <div style={{ display: "grid", gap: "16px" }}>
                    {registeredContests.map((contest) => {
                      const now = new Date();
                      const start = new Date(contest.startTime);
                      const diff = start - now;
                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      const isLive = contest.status === 'LIVE';

                      return (
                        <div
                          key={contest.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "20px 24px",
                            background: isLive ? "rgba(16, 185, 129, 0.1)" : "rgba(0, 0, 0, 0.3)",
                            borderRadius: "12px",
                            border: isLive ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.1)",
                            flexWrap: "wrap",
                            gap: "16px",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                              {contest.title}
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#6b6b80" }}>
                              ⚡ {contest.difficulty} • ⏱ {Math.floor(contest.durationSeconds / 60)} min
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            {isLive ? (
                              <>
                                <span
                                  style={{
                                    padding: "6px 16px",
                                    borderRadius: "20px",
                                    background: "rgba(16, 185, 129, 0.2)",
                                    color: "#10b981",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  🔴 Live Now!
                                </span>
                                <Link href={`/contest/${contest.id}`}>
                                  <button className="btn-primary" style={{ padding: "10px 20px" }}>
                                    Join Now
                                  </button>
                                </Link>
                              </>
                            ) : (
                              <span
                                style={{
                                  padding: "6px 16px",
                                  borderRadius: "20px",
                                  background: "rgba(245, 158, 11, 0.2)",
                                  color: "#f59e0b",
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                }}
                              >
                                🕐 Starts in {days > 0 ? `${days}d ` : ""}{hours > 0 ? `${hours}h ` : ""}{minutes}m
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/test">
                  <button className="btn-primary">
                    ⌨️ Start Practice
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="btn-secondary">
                    📊 View Dashboard
                  </button>
                </Link>
                <Link href="/contest">
                  <button className="btn-secondary">
                    🏆 Browse Contests
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "120px 20px 60px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Animated Background Orbs */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "10%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              right: "10%",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
              filter: "blur(40px)",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          />

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              marginBottom: "24px",
              lineHeight: 1.1,
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(135deg, #00d4ff, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {typingText}
            </span>
            <span
              style={{
                display: "inline-block",
                width: "4px",
                height: "clamp(2rem, 5vw, 3.5rem)",
                background: "#00d4ff",
                marginLeft: "8px",
                verticalAlign: "middle",
                animation: "blink 1s infinite",
              }}
            />
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "#b8b8cc",
              maxWidth: "600px",
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            Join thousands of students improving their typing speed with our
            engaging, game-like experience. Track your progress, compete
            globally, and become a typing master.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/test">
              <button className="btn-primary" style={{ fontSize: "1.1rem" }}>
                Start Typing Test
              </button>
            </Link>
            <Link href="/leaderboard">
              <button className="btn-secondary" style={{ fontSize: "1.1rem" }}>
                View Leaderboard
              </button>
            </Link>
          </div>

          {/* Live Stats */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "80px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "#00d4ff",
                }}
              >
                {stats.wpm}+
              </div>
              <div style={{ color: "#6b6b80", fontSize: "0.9rem" }}>
                Avg. WPM
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "#a855f7",
                }}
              >
                {stats.tests.toLocaleString()}+
              </div>
              <div style={{ color: "#6b6b80", fontSize: "0.9rem" }}>
                Tests Taken
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "#ec4899",
                }}
              >
                {stats.users.toLocaleString()}+
              </div>
              <div style={{ color: "#6b6b80", fontSize: "0.9rem" }}>
                Active Users
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          style={{
            padding: "80px 20px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "60px",
            }}
          >
            Why Choose{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #00d4ff, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TyperPro
            </span>
            ?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card"
                style={{
                  padding: "32px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "#00d4ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: "#b8b8cc", lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Past Contests Section */}
        {completedContests.length > 0 && (
          <section
            style={{
              padding: "80px 20px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              🏆{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Past Contests
              </span>
            </h2>
            <p
              style={{
                color: "#b8b8cc",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              See how top typists performed in recent competitions
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {completedContests.map((contest) => (
                <div
                  key={contest.id}
                  className="glass-card"
                  style={{
                    padding: "24px",
                    borderLeft: "4px solid #f59e0b",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#ec4899";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#f59e0b";
                  }}
                >
                  {/* Contest Header */}
                  <div style={{ marginBottom: "16px" }}>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        marginBottom: "8px",
                      }}
                    >
                      {contest.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        fontSize: "0.85rem",
                        color: "#6b6b80",
                      }}
                    >
                      <span>⚡ {contest.difficulty}</span>
                      <span>⏱ {Math.floor(contest.durationSeconds / 60)} min</span>
                      <span>👥 {contest.participantCount} participants</span>
                    </div>
                  </div>

                  {/* Winner Info */}
                  {contest.winnerName && (
                    <div
                      style={{
                        padding: "16px",
                        background: "rgba(245, 158, 11, 0.1)",
                        borderRadius: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>🥇</span>
                        <div>
                          <div style={{ fontWeight: 600, color: "#f59e0b" }}>
                            {contest.winnerName}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#b8b8cc" }}>
                            Champion
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          fontSize: "0.9rem",
                        }}
                      >
                        <span>
                          <strong style={{ color: "#00d4ff" }}>{contest.winnerWpm}</strong> WPM
                        </span>
                        <span>
                          <strong style={{ color: "#10b981" }}>{contest.winnerAccuracy?.toFixed(1)}%</strong> accuracy
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contest Date & Leaderboard Link */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "#6b6b80" }}>
                      📅 {new Date(contest.endTime).toLocaleDateString()}
                    </span>
                    <Link href={`/contest/${contest.id}`}>
                      <button
                        className="btn-secondary"
                        style={{
                          padding: "8px 16px",
                          fontSize: "0.85rem",
                        }}
                      >
                        View Leaderboard
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Link */}
            <div style={{ textAlign: "center", marginTop: "32px" }}>
              <Link href="/contest">
                <button className="btn-secondary">
                  View All Contests →
                </button>
              </Link>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section
          style={{
            padding: "100px 20px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              padding: "60px 40px",
              background:
                "linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(168, 85, 247, 0.1))",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              Ready to Improve Your Skills?
            </h2>
            <p
              style={{
                color: "#b8b8cc",
                marginBottom: "32px",
                fontSize: "1.1rem",
              }}
            >
              Start your typing journey today. No registration required.
            </p>
            <Link href="/test">
              <button
                className="btn-primary pulse-glow"
                style={{ fontSize: "1.2rem", padding: "18px 40px" }}
              >
                Take the Test Now
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: "40px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "16px",
              background:
                "linear-gradient(135deg, #00d4ff, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TyperPro
          </div>
          <p style={{ color: "#6b6b80", fontSize: "0.9rem" }}>
            © 2024 TyperPro by ExamsOfBharat. All rights reserved.
          </p>
        </footer>

        <style jsx>{`
          @keyframes blink {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
          }
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>
      </div>
    </>
  );
}
