import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const API_URL =
  "https://o41h3b0aw4.execute-api.ap-south-1.amazonaws.com/prod/registrations";

function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError("");

      const session = await fetchAuthSession();

const idToken = session.tokens?.idToken?.toString();

if (!idToken) {
  throw new Error("Admin session expired. Please login again.");
}

const response = await fetch(API_URL, {
  headers: {
    Authorization: `Bearer ${idToken}`,
  },
});
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch registrations");
      }

      setRegistrations(data.registrations || []);
    } catch (err) {
      setError(err.message || "Unable to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        registration.studentName?.toLowerCase().includes(searchText) ||
        registration.studentId?.toLowerCase().includes(searchText) ||
        registration.email?.toLowerCase().includes(searchText);

      const matchesEvent =
        eventFilter === "All Events" ||
        registration.eventName === eventFilter;

      return matchesSearch && matchesEvent;
    });
  }, [registrations, search, eventFilter]);

  const stats = {
    total: registrations.length,
    workshop: registrations.filter(
      (item) => item.eventName === "Tech Workshop 2026"
    ).length,
    career: registrations.filter(
      (item) => item.eventName === "Career Fair 2026"
    ).length,
    hackathon: registrations.filter(
      (item) => item.eventName === "Hackathon 2026"
    ).length,
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    return new Date(timestamp).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-container">

        <header className="admin-header">
          <div>
            <p className="admin-label">EVENTHUB ADMIN</p>
            <h1>Registration Dashboard</h1>
            <p>
              Manage and monitor student registrations across all college
              events.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={fetchRegistrations}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </header>

        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div>
              <p>Total Registrations</p>
              <h2>{stats.total}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💻</span>
            <div>
              <p>Tech Workshop</p>
              <h2>{stats.workshop}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💼</span>
            <div>
              <p>Career Fair</p>
              <h2>{stats.career}</h2>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🚀</span>
            <div>
              <p>Hackathon</p>
              <h2>{stats.hackathon}</h2>
            </div>
          </div>

        </section>
      
                <section className="analytics-section">
          <div className="analytics-header">
            <div>
              <span className="section-label">INSIGHTS</span>
              <h2>Registration Analytics</h2>
              <p>Event-wise registration overview</p>
            </div>
          </div>

          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-card-top">
                <span>Tech Workshop</span>
                <strong>{stats.workshop}</strong>
              </div>

              <div className="analytics-bar">
                <div
                  className="analytics-fill workshop-fill"
                  style={{
                    width: `${stats.total ? (stats.workshop / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>

              <small>
                {stats.total
                  ? Math.round((stats.workshop / stats.total) * 100)
                  : 0}
                % of registrations
              </small>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-top">
                <span>Career Fair</span>
                <strong>{stats.career}</strong>
              </div>

              <div className="analytics-bar">
                <div
                  className="analytics-fill career-fill"
                  style={{
                    width: `${stats.total ? (stats.career / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>

              <small>
                {stats.total
                  ? Math.round((stats.career / stats.total) * 100)
                  : 0}
                % of registrations
              </small>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-top">
                <span>Hackathon</span>
                <strong>{stats.hackathon}</strong>
              </div>

              <div className="analytics-bar">
                <div
                  className="analytics-fill hackathon-fill"
                  style={{
                    width: `${stats.total ? (stats.hackathon / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>

              <small>
                {stats.total
                  ? Math.round((stats.hackathon / stats.total) * 100)
                  : 0}
                % of registrations
              </small>
            </div>
          </div>
        </section>

        <section className="registration-panel">

          <div className="panel-header">
            <div>
              <h2>Student Registrations</h2>
              <p>
                Showing {filteredRegistrations.length} of{" "}
                {registrations.length} registrations
              </p>
            </div>

            <div className="filters">

              <input
                type="text"
                placeholder="Search name, ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
              >
                <option>All Events</option>
                <option>Tech Workshop 2026</option>
                <option>Career Fair 2026</option>
                <option>Hackathon 2026</option>
              </select>

            </div>
          </div>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="admin-loading">
              Loading registrations...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <span>📭</span>
              <h3>No registrations found</h3>
              <p>Try changing your search or event filter.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="registration-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Registered At</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegistrations.map((registration) => (
                    <tr
                      key={registration.registrationId}
                      className="registration-row"
                      onClick={() => setSelectedRegistration(registration)}
                    >

                      <td>
                        <strong>{registration.studentName}</strong>
                      </td>

                      <td>
                        {registration.studentId}
                      </td>

                      <td>
                        {registration.email}
                      </td>

                      <td>
                        <span className="event-badge">
                          {registration.eventName}
                        </span>
                      </td>

                      <td>
                        {formatDate(registration.timestamp)}
                      </td>

                      <td>
                        <span className="status-badge">
                          {registration.status || "Registered"}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </section>

        {selectedRegistration && (
          <div
            className="details-overlay"
            onClick={() => setSelectedRegistration(null)}
          >
            <div
              className="details-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="details-modal-header">
                <div>
                  <span className="section-label">REGISTRATION</span>
                  <h2>Registration Details</h2>
                </div>

                <button
                  type="button"
                  className="details-close-button"
                  onClick={() => setSelectedRegistration(null)}
                  aria-label="Close registration details"
                >
                  ×
                </button>
              </div>

              <div className="details-grid">
                <div className="details-item">
                  <span>Student Name</span>
                  <strong>{selectedRegistration.studentName || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Student ID</span>
                  <strong>{selectedRegistration.studentId || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Email</span>
                  <strong>{selectedRegistration.email || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Event</span>
                  <strong>{selectedRegistration.eventName || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Registration ID</span>
                  <strong>{selectedRegistration.registrationId || "-"}</strong>
                </div>

                <div className="details-item">
                  <span>Registered At</span>
                  <strong>{formatDate(selectedRegistration.timestamp)}</strong>
                </div>

                <div className="details-item">
                  <span>Status</span>
                  <strong>
                    {selectedRegistration.status || "Registered"}
                  </strong>
                </div>
              </div>

              <div className="details-modal-footer">
                <button
                  type="button"
                  className="details-close-action"
                  onClick={() => setSelectedRegistration(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
