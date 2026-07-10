import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Simple structural placeholders since UI pages are not generated yet
const LandingDashboard = () => (
  <div className="card">
    <h2>Welcome to AI Smart Tourism Management System</h2>
    <p>Select your portal to begin:</p>
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
      <Link to="/tourist" className="btn btn-primary">Tourist Portal</Link>
      <Link to="/hotel-owner" className="btn btn-secondary">Hotel Owner Portal</Link>
      <Link to="/admin" className="btn btn-danger">Admin Portal</Link>
    </div>
  </div>
);

const TouristDashboard = () => (
  <div className="card">
    <h2>Tourist Portal</h2>
    <p>Explore destinations, generate itineraries, and book hotels.</p>
    <Link to="/" className="btn">Back to Selection</Link>
  </div>
);

const HotelOwnerDashboard = () => (
  <div className="card">
    <h2>Hotel Owner Portal</h2>
    <p>Manage bookings, hotel profiles, and customer services.</p>
    <Link to="/" className="btn">Back to Selection</Link>
  </div>
);

const AdminDashboard = () => (
  <div className="card">
    <h2>Tourism Authority Admin Portal</h2>
    <p>Manage destinations, monitor statistics, and handle approvals.</p>
    <Link to="/" className="btn">Back to Selection</Link>
  </div>
);

const NotFound = () => (
  <div className="card">
    <h2>404 - Not Found</h2>
    <p>The requested portal does not exist.</p>
    <Link to="/" className="btn">Return Home</Link>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>AI Smart Tourism Management System</h1>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<LandingDashboard />} />
            <Route path="/tourist" element={<TouristDashboard />} />
            <Route path="/hotel-owner" element={<HotelOwnerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} AI Smart Tourism Management System. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
