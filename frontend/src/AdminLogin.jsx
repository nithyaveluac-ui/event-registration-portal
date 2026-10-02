import { useState } from "react";
import { signIn, getCurrentUser } from "aws-amplify/auth";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      try {
        await getCurrentUser();

        onLogin();
        return;
      } catch {
        // No active Cognito session.
        // Continue with normal login.
      }
      const { isSignedIn } = await signIn({
        username: email.trim(),
        password,
      });

      if (isSignedIn) {
        onLogin();
      }
    } catch (err) {
      console.error(err);

      if (err.name === "NotAuthorizedException") {
        setError("Invalid email or password.");
      } else if (err.name === "UserNotFoundException") {
        setError("Admin account not found.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* Animated background */}
      <div className="login-background">
        <div className="login-orb orb-one"></div>
        <div className="login-orb orb-two"></div>
        <div className="login-orb orb-three"></div>
      </div>

      {/* Top branding */}
      <div className="admin-login-brand">
        <div className="admin-logo">
          <span>E</span>
        </div>

        <div>
          <strong>Event<span>Hub</span></strong>
          <small>ADMIN PORTAL</small>
        </div>
      </div>

      {/* Login Card */}
      <div className="admin-login-card">

        <div className="login-card-header">
          <div className="security-icon">
            🔐
          </div>

          <span className="secure-label">
            SECURE ACCESS
          </span>

          <h1>Welcome Back</h1>

          <p>
            Sign in to manage events, registrations
            and student participation.
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="login-field">
            <label>Email Address</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error">
              <span>⚠</span>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="admin-signin-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-security-note">
          <span>🛡</span>
          <div>
            <strong>Protected Admin Area</strong>
            <small>Secure authentication powered by AWS Cognito</small>
          </div>
        </div>

      </div>

      <p className="admin-login-footer">
        © 2026 EventHub · College Event Management Platform
      </p>

    </div>
  );
}

export default AdminLogin;
