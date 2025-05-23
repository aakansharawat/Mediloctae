import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import LoginSignupPage from './components/LoginSignupPage';
import Dashboard from './components/Dashboard';
import SearchPage from './components/SearchPage';
import AdminPage from './components/AdminPage';
import './App.css';

function App() {
  // Force a re-render when auth changes
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  
  // Check authentication on page load
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const role = localStorage.getItem('userRole') || 'customer';
      
      setIsLoggedIn(loggedIn);
      setUserRole(role);
      
      console.log("Auth state changed: ", { loggedIn, role });
    };
    
    // Check immediately
    checkAuth();
    
    // Set up interval to check auth regularly
    const interval = setInterval(checkAuth, 1000);
    
    // Add event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Function to determine where to redirect based on auth state
  const getLoginRedirect = () => {
    if (!isLoggedIn) return "/login";
    return userRole === 'customer' ? "/dashboard/search" : "/dashboard/admin";
  };

  // Clear any cache issues by forcing localStorage checks
  const clearCache = () => {
    const currentLogin = localStorage.getItem('isLoggedIn');
    localStorage.setItem('isLoggedIn', currentLogin);
  };
  
  // Call clearCache on mount to ensure fresh state
  useEffect(() => {
    clearCache();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isLoggedIn ? <Navigate to={getLoginRedirect()} /> : <LoginSignupPage isLogin={true} />} />
        <Route path="/signup" element={isLoggedIn ? <Navigate to={getLoginRedirect()} /> : <LoginSignupPage isLogin={false} />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard/search" element={isLoggedIn ? <SearchPage /> : <Navigate to="/login" />} />
        <Route path="/dashboard/admin" element={isLoggedIn ? <AdminPage /> : <Navigate to="/login" />} />
        
        {/* Default routes */}
        <Route path="/" element={<Navigate to={getLoginRedirect()} />} />
        <Route path="*" element={<Navigate to={getLoginRedirect()} />} />
      </Routes>
    </Router>
  );
}

export default App;
