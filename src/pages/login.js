import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login, signup, isAuthenticated, getUser } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        displayName: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect if already authenticated
        if (isAuthenticated()) {
            const redirect = router.query.redirect || '/';
            router.push(redirect);
        }
    }, [router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let response;

            if (mode === 'signup') {
                if (!formData.displayName.trim()) {
                    formData.displayName = formData.username;
                }
                response = await signup(formData.username, formData.password, formData.displayName);
            } else {
                response = await login(formData.username, formData.password);
            }

            if (response.success) {
                // Redirect to specified page or home
                const redirect = router.query.redirect || '/';
                router.push(redirect);
            } else {
                setError(response.message || 'An error occurred');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestMode = () => {
        router.push('/test');
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
        setFormData({ username: '', password: '', displayName: '' });
    };

    return (
        <>
            <Head>
                <title>{mode === 'login' ? 'Login' : 'Sign Up'} - TyperPro Typing Test</title>
                <meta name="description" content="Login or create an account to save your typing test progress, track your WPM improvement, and compete on leaderboards." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="noindex, follow" />

                {/* Canonical URL */}
                <link rel="canonical" href="https://typer.examsofbharat.com/login" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://typer.examsofbharat.com/login" />
                <meta property="og:title" content="Login - TyperPro" />
                <meta property="og:description" content="Sign in to track your typing progress and compete on global leaderboards." />
                <meta property="og:site_name" content="TyperPro" />
            </Head>

            <div className="auth-page">
                {/* Navigation */}
                <nav className="test-nav">
                    <Link href="/" className="logo">
                        TyperPro
                    </Link>
                    <div className="nav-links">
                        <Link href="/">Home</Link>
                        <Link href="/test">Practice</Link>
                        <Link href="/leaderboard">Leaderboard</Link>
                    </div>
                </nav>

                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h1 className="auth-title">
                                {mode === 'login' ? '👋 Welcome Back' : '🚀 Join TyperPro'}
                            </h1>
                            <p className="auth-subtitle">
                                {mode === 'login'
                                    ? 'Sign in to track your progress'
                                    : 'Create an account to save your scores'}
                            </p>
                        </div>

                        {/* Mode Tabs */}
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                                onClick={() => setMode('login')}
                            >
                                Login
                            </button>
                            <button
                                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                                onClick={() => setMode('signup')}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="auth-error">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="auth-form">
                            {mode === 'signup' && (
                                <div className="form-group">
                                    <label htmlFor="displayName">Display Name</label>
                                    <input
                                        type="text"
                                        id="displayName"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleInputChange}
                                        placeholder="How should we call you?"
                                        autoComplete="name"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter your username"
                                    required
                                    minLength={3}
                                    autoComplete="username"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    required
                                    minLength={6}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary auth-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading-spinner"></span>
                                ) : mode === 'login' ? (
                                    '🔐 Sign In'
                                ) : (
                                    '✨ Create Account'
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        {/* Guest Mode */}
                        <button
                            className="btn-secondary auth-guest"
                            onClick={handleGuestMode}
                        >
                            👤 Continue as Guest
                        </button>

                        {/* Switch Mode Link */}
                        <p className="auth-switch">
                            {mode === 'login' ? (
                                <>Don't have an account? <button onClick={switchMode}>Sign Up</button></>
                            ) : (
                                <>Already have an account? <button onClick={switchMode}>Login</button></>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
