import logo from "./assets/sovereign-logo-transparent.png"
import { useState } from "react"
import { Eye, EyeOff, Shield, LockKeyhole } from "lucide-react"
import "./Login.css"

function Login({ onLogin }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [authMethod, setAuthMethod] = useState("")

    const handleLogin = (method = "local") => {
        if (method === "local" && (!email || !password)) {
            return
        }

        setAuthMethod(method)
        setIsAuthenticating(true)

        // Simulated authentication for frontend prototype
        setTimeout(() => {
            onLogin()
        }, 1500)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        handleLogin("local")
    }

    return (
        <div className="login-page">

            {/* Animated background */}
            <div className="login-grid"></div>
            <div className="login-noise"></div>

            <div className="orb orb-one"></div>
            <div className="orb orb-two"></div>

            {/* Decorative rings */}
            <div className="radar-ring ring-one"></div>
            <div className="radar-ring ring-two"></div>
            <div className="radar-ring ring-three"></div>

            {/* Small decorative dots */}
            <span className="tech-dot dot-one"></span>
            <span className="tech-dot dot-two"></span>
            <span className="tech-dot dot-three"></span>
            <span className="tech-dot dot-four"></span>

            {/* Main content */}
            <div className="login-container">

                {/* LEFT SIDE */}
                <div className="login-visual">

                    <div className="visual-glow"></div>

                    <div className="security-orbit orbit-outer"></div>
                    <div className="security-orbit orbit-middle"></div>
                    <div className="security-orbit orbit-inner"></div>

                    <div className="security-core">
                        <img
                            src={logo}
                            alt="Sovereign AI Workbench"
                            className="sovereign-logo"
                        />
                    </div>

                    <div className="orbit-dot orbit-dot-one"></div>
                    <div className="orbit-dot orbit-dot-two"></div>
                    <div className="orbit-dot orbit-dot-three"></div>

                    <div className="visual-label">
                        <span className="status-dot"></span>
                        LOCAL AI CORE ONLINE
                    </div>

                    <div className="visual-title">
                        <span>SOVEREIGN</span>
                        <strong>AI WORKBENCH</strong>
                    </div>

                    <p className="visual-description">
                        Secure intelligence.
                        <br />
                        Fully under your control.
                    </p>

                </div>


                {/* RIGHT SIDE LOGIN CARD */}
                <div className="login-card-wrapper">

                    <div className="login-card">

                        {/* Card top line */}
                        <div className="card-top-line"></div>

                        {/* Header */}
                        <div className="login-header">

                            <div className="mini-shield">
                                <Shield size={22} />
                            </div>

                            <div>
                                <span className="login-overline">
                                    SOVEREIGN ACCESS
                                </span>

                                <h1>SIGN IN</h1>
                            </div>

                        </div>

                        <p className="login-subtitle">
                            Access your secure local AI workspace
                        </p>


                        {/* Login form */}
                        <form onSubmit={handleSubmit}>

                            {/* Email */}
                            <div className="input-group">

                                <label>USERNAME / EMAIL</label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        <LockKeyhole size={17} />
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Enter username or email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        disabled={isAuthenticating}
                                    />

                                </div>

                            </div>


                            {/* Password */}
                            <div className="input-group">

                                <label>PASSWORD</label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        <Shield size={17} />
                                    </span>

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        disabled={isAuthenticating}
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        disabled={isAuthenticating}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>

                                </div>

                            </div>


                            {/* Remember / Forgot */}
                            <div className="login-options">

                                <label className="remember-me">
                                    <input type="checkbox" />
                                    <span></span>
                                    Remember me
                                </label>

                                <button
                                    type="button"
                                    className="forgot-password"
                                >
                                    Forgot password?
                                </button>

                            </div>


                            {/* Main login button */}
                            <button
                                type="submit"
                                className={`signin-button ${isAuthenticating ? "authenticating" : ""
                                    }`}
                                disabled={isAuthenticating}
                            >

                                {isAuthenticating && authMethod === "local" ? (
                                    <>
                                        <span className="button-loader"></span>
                                        AUTHENTICATING...
                                    </>
                                ) : (
                                    <>
                                        SIGN IN
                                        <span className="button-arrow">→</span>
                                    </>
                                )}

                            </button>

                        </form>


                        {/* Divider */}
                        <div className="login-divider">
                            <span></span>
                            <p>OR CONTINUE WITH</p>
                            <span></span>
                        </div>


                        {/* Social Login */}
                        <div className="social-login">

                            {/* Google */}
                            <button
                                className="social-button google-button"
                                onClick={() => handleLogin("google")}
                                disabled={isAuthenticating}
                            >

                                {isAuthenticating && authMethod === "google" ? (
                                    <span className="social-loader"></span>
                                ) : (
                                    <span className="google-icon">G</span>
                                )}

                                <span>Google</span>

                            </button>


                            {/* GitHub */}
                            <button
                                className="social-button github-button"
                                onClick={() => handleLogin("github")}
                                disabled={isAuthenticating}
                            >

                                {isAuthenticating && authMethod === "github" ? (
                                    <span className="social-loader"></span>
                                ) : (
                                    <svg
                                        className="github-icon"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.01c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.96.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.71 5.4-5.28 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                                    </svg>
                                )}

                                <span>GitHub</span>

                            </button>


                            {/* Microsoft */}
                            <button
                                className="social-button microsoft-button"
                                onClick={() => handleLogin("microsoft")}
                                disabled={isAuthenticating}
                            >

                                {isAuthenticating && authMethod === "microsoft" ? (
                                    <span className="social-loader"></span>
                                ) : (
                                    <span className="microsoft-icon">
                                        <i></i>
                                        <i></i>
                                        <i></i>
                                        <i></i>
                                    </span>
                                )}

                                <span>Microsoft</span>

                            </button>

                        </div>


                        {/* Security message */}
                        <div className="security-message">

                            <div className="security-message-icon">
                                <Shield size={15} />
                            </div>

                            <div>
                                <strong>SECURE LOCAL ACCESS</strong>

                                <span>
                                    Your credentials are processed locally.
                                </span>
                            </div>

                        </div>


                        <div className="no-external">
                            <span className="tiny-dot"></span>
                            NO EXTERNAL AI AUTHENTICATION REQUIRED
                        </div>


                        {/* Card corners */}
                        <span className="corner corner-tl"></span>
                        <span className="corner corner-tr"></span>
                        <span className="corner corner-bl"></span>
                        <span className="corner corner-br"></span>

                    </div>

                </div>

            </div>


            {/* Footer */}
            <div className="login-footer">
                <span>SOVEREIGN AI WORKBENCH</span>
                <span className="footer-separator">•</span>
                <span>ON-PREMISE INTELLIGENCE</span>
                <span className="footer-separator">•</span>
                <span>v1.0</span>
            </div>

        </div>
    )
}

export default Login