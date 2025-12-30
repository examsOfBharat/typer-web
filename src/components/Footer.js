import Link from "next/link";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <span className="footer-logo">⌨ TyperPro</span>
                    <p className="footer-tagline">Master your typing skills</p>
                </div>
                <div className="footer-links">
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <Link href="/">Home</Link>
                        <Link href="/test">Practice</Link>
                        <Link href="/dashboard">Dashboard</Link>
                    </div>
                    <div className="footer-section">
                        <h4>Resources</h4>
                        <Link href="/leaderboard">Leaderboard</Link>
                        <a href="#">Tips & Tricks</a>
                        <a href="#">FAQ</a>
                    </div>
                    <div className="footer-section">
                        <h4>Connect</h4>
                        <a href="#">Twitter</a>
                        <a href="#">Discord</a>
                        <a href="#">GitHub</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} TyperPro. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
            </div>

            <style jsx>{`
                .site-footer {
                    margin-top: auto;
                    background: rgba(0, 0, 0, 0.3);
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 3rem 2rem 1.5rem;
                    color: #fff;
                }

                .footer-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .footer-brand {
                    max-width: 250px;
                }

                .footer-logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .footer-tagline {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }

                .footer-links {
                    display: flex;
                    gap: 4rem;
                }

                .footer-section h4 {
                    color: #fff;
                    font-size: 0.875rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .footer-section a {
                    display: block;
                    color: rgba(255, 255, 255, 0.6);
                    text-decoration: none;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                    transition: color 0.3s;
                }

                .footer-section a:hover {
                    color: #667eea;
                }

                .footer-bottom {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .footer-bottom p {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.875rem;
                    margin: 0;
                }

                .footer-bottom-links {
                    display: flex;
                    gap: 1.5rem;
                }

                .footer-bottom-links a {
                    color: rgba(255, 255, 255, 0.4);
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: color 0.3s;
                }

                .footer-bottom-links a:hover {
                    color: #667eea;
                }

                @media (max-width: 768px) {
                    .footer-content {
                        flex-direction: column;
                        text-align: center;
                        gap: 2rem;
                    }

                    .footer-brand {
                        max-width: 100%;
                    }

                    .footer-links {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .footer-bottom {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
}
