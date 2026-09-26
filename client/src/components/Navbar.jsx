import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar(props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="icons">
        <img src="/notification.svg" alt="Notification" />
        <img src="/mail.svg" alt="Mail" />
        <div className="user-dropdown" ref={dropdownRef}>
          <img src="/user.svg" alt="User" onClick={toggleDropdown} />
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile">Profile</Link>
              <Link to="/achievements">Achievements</Link>
              <Link to="/settings">Settings</Link>
              <Link to="/account">Account</Link>
              <button onClick={props.logout}>Log Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;