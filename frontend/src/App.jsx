import { useState } from "react";
import "./App.css";

const API_URL =
  "https://o41h3b0aw4.execute-api.ap-south-1.amazonaws.com/prod/registrations";

const events = [
  {
    title: "Tech Workshop 2026",
    description: "Learn practical technology skills from industry experts.",
    icon: "💻",
  },
  {
    title: "Career Fair 2026",
    description: "Connect with companies and explore exciting career opportunities.",
    icon: "🚀",
  },
  {
    title: "Hackathon 2026",
    description: "Build innovative solutions, collaborate and compete with teams.",
    icon: "⚡",
  },
];

function App() {
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    studentId: "",
    eventName: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registrationId, setRegistrationId] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");
    setRegistrationId("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setMessage(data.message);
      setRegistrationId(data.registration.registrationId);

      setFormData({
        studentName: "",
        email: "",
        studentId: "",
        eventName: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const scrollToRegister = () => {
    document
      .getElementById("register")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app">

      {/* Floating background shapes */}
      <div className="background-shapes">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">E</span>
          <span>Event<span>Hub</span></span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#events">Events</a>
          <a href="#about">About</a>
          <a href="#register">Register</a>
          <a href="#admin">Admin</a>
        </div>

        <button className="nav-button" onClick={scrollToRegister}>
          Register Now
        </button>
      </nav>

      {/* Hero */}
      <section id="home" className="hero-section">
        <div className="hero-content">

          <div className="hero-badge">
            ✦ College Events 2026
          </div>

          <h1>
            Discover.
            <br />
            <span>Register.</span>
            <br />
            Participate.
          </h1>

          <p>
            Explore exciting college events, connect with people,
            learn new skills and create unforgettable experiences.
          </p>

          <div className="hero-buttons">
            <button className="primary-button" onClick={scrollToRegister}>
              Explore Events →
            </button>

            <a href="#events" className="secondary-button">
              View Upcoming Events
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>03</strong>
              <span>Events</span>
            </div>

            <div>
              <strong>2026</strong>
              <span>Season</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>Opportunities</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card main-card">
            <div className="floating-icon">🎓</div>

            <div className="event-preview">
              <span>UPCOMING EVENT</span>
              <h3>Hackathon 2026</h3>
              <p>Build • Innovate • Collaborate</p>

              <div className="preview-bottom">
                <span>⚡ Technology</span>
                <span>2026</span>
              </div>
            </div>
          </div>

          <div className="mini-card card-one">
            💻
            <span>Tech Workshop</span>
          </div>

          <div className="mini-card card-two">
            🚀
            <span>Career Fair</span>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="events-section">
        <div className="section-heading">
          <span>WHAT'S HAPPENING</span>
          <h2>Explore Our Events</h2>
          <p>
            Choose an event that matches your interests and register in
            just a few clicks.
          </p>
        </div>

        <div className="event-grid">
          {events.map((event, index) => (
            <div
              className="event-card"
              key={event.title}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="event-icon">{event.icon}</div>

              <span className="event-number">
                0{index + 1}
              </span>

              <h3>{event.title}</h3>

              <p>{event.description}</p>

              <button onClick={scrollToRegister}>
                Register for Event →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="about" className="features-section">
        <div className="section-heading light-heading">
          <span>WHY EVENTHUB?</span>
          <h2>Everything You Need</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div>⚡</div>
            <h3>Quick Registration</h3>
            <p>
              Register for your favourite event through a simple
              and easy form.
            </p>
          </div>

          <div className="feature-card">
            <div>📩</div>
            <h3>Instant Confirmation</h3>
            <p>
              Your registration is securely stored and confirmation
              is sent through email.
            </p>
          </div>

          <div className="feature-card">
            <div>☁️</div>
            <h3>Cloud Powered</h3>
            <p>
              Built using AWS serverless technologies for a reliable
              registration experience.
            </p>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="register-section">
        <div className="register-intro">
          <span>READY TO JOIN?</span>
          <h2>Reserve Your Spot</h2>
          <p>
            Fill in your details and become part of our upcoming
            events.
          </p>

          <div className="register-points">
            <div>✓ Simple registration</div>
            <div>✓ Secure cloud storage</div>
            <div>✓ Email confirmation</div>
          </div>
        </div>

        <div className="registration-card">
          <h3>Student Registration</h3>
          <p>Enter your details below</p>

          <form onSubmit={handleSubmit}>

            <label>Student Name</label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <label>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Example: CSE001"
              required
            />

            <label>Select Event</label>
            <select
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
            >
              <option value="">Choose an event</option>

              {events.map((event) => (
                <option key={event.title} value={event.title}>
                  {event.title}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Complete Registration →"}
            </button>
          </form>

          {message && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <strong>{message}</strong>
              <p>
                Your Registration ID:
                <br />
                <b>{registrationId}</b>
              </p>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          Event<span>Hub</span>
        </div>

        <p>
          AWS-powered Event Registration Portal
        </p>

        <span>
          © 2026 EventHub. Built for college events.
        </span>
      </footer>

    </div>
  );
}

export default App;
