import QRCode from "react-qr-code";
import { useState } from "react";
import { motion } from "framer-motion";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import "./App.css";

const API_URL =
  "https://ophqjqinza.execute-api.ap-south-1.amazonaws.com/prod/registrations";

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

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
  const [showAdmin, setShowAdmin] = useState(false);
const [adminLoggedIn, setAdminLoggedIn] = useState(false);  
const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
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
      setRegistrationId(data.registrationId);

      setFormData({
        studentName: "",
        studentEmail: "",
        studentId: "",
        eventName: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRPass = () => {
    const svg = document.querySelector(".qr-code-container svg");

    if (!svg || !registrationId) {
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${registrationId}-QR-Pass.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const scrollToRegister = () => {
    document
      .getElementById("register")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (showAdmin && !adminLoggedIn) {
  return (
    <>
      <AdminLogin
        onLogin={() => setAdminLoggedIn(true)}
      />

      <button
        className="back-home-button"
        onClick={() => setShowAdmin(false)}
      >
        ← Back to EventHub
      </button>
    </>
  );
}

if (showAdmin && adminLoggedIn) {
  return (
    <>
      <AdminDashboard />

      <button
        className="back-home-button"
        onClick={() => {
          setAdminLoggedIn(false);
          setShowAdmin(false);
        }}
      >
        ← Back to EventHub
      </button>
    </>
  );
}

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
          <button type="button" className="nav-admin-link" onClick={() => setShowAdmin(true)}>Admin</button>
        </div>

        <motion.button
          className="nav-button"
          onClick={scrollToRegister}
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Register Now
        </motion.button>
      </nav>

      {/* Hero */}
      <section id="home" className="hero-section">
        <motion.div
          className="hero-content"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
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
            <motion.button
              className="primary-button"
              onClick={scrollToRegister}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Events →
            </motion.button>

            <motion.a
              href="#events"
              className="secondary-button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              View Upcoming Events
            </motion.a>
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
        </motion.div>

        <motion.div
          className="hero-visual"
          variants={fadeRight}
          initial="hidden"
          animate="visible"
        >
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
        </motion.div>
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
            <motion.div
              className="event-card"
              key={event.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.2 },
              }}
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
            </motion.div>
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
          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <div>⚡</div>
            <h3>Quick Registration</h3>
            <p>
              Register for your favourite event through a simple
              and easy form.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <div>📩</div>
            <h3>Instant Confirmation</h3>
            <p>
              Your registration is securely stored and confirmation
              is sent through email.
            </p>
          </motion.div>

          <motion.div
            className="feature-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <div>☁️</div>
            <h3>Cloud Powered</h3>
            <p>
              Built using AWS serverless technologies for a reliable
              registration experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="register-section">
        <motion.div
          className="register-intro"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
        >
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
        </motion.div>

        <motion.div
          className="registration-card"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: "easeOut",
          }}
        >
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
              name="studentEmail"
              value={formData.studentEmail}
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

          {message && registrationId && (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
            >
              <div className="success-icon">✓</div>

              <strong>{message}</strong>

              <p>
                Your Registration ID:
                <br />
                <b>{registrationId}</b>
              </p>

              <motion.div
                className="qr-pass"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2,
                }}
              >
                <div className="qr-code-container">
                  <QRCode
                    value={registrationId}
                    size={180}
                    level="M"
                  />
                </div>

                <h3>Event QR Pass</h3>

                <p className="qr-instruction">
                  Show this QR code at the event check-in.
                </p>
              </motion.div>
            </motion.div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.7,
          ease: "easeOut",
        }}
      >
        <div className="footer-logo">
          Event<span>Hub</span>
        </div>

        <p>
          AWS-powered Event Registration Portal
        </p>

        <span>
          © 2026 EventHub. Built for college events.
        </span>
      </motion.footer>

    </div>
  );
}

export default App;
