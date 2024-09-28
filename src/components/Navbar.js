import React from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-white font-bold text-xl">MyApp</a>
        <div>
          {isAuthenticated ? (
            <>
              <button onClick={logout} className="text-white">Logout</button>
            </>
          ) : (
            <>
              <a href="/login" className="text-white">Login</a>
              <a href="/register" className="ml-4 text-white">Register</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
