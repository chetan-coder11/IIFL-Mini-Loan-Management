import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { username, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">💰</span>
          Mini Loan System
        </Link>
        
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="welcome-msg">Welcome, {username}!</span>
              <Link to="/create" className="btn btn-secondary">
                Create Loan
              </Link>
              <button onClick={logout} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}