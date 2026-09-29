import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from '../App.jsx';
import { AuthProvider } from '../auth.jsx';
import { resetDemo } from './mockApi.js';
import '../styles.css';

function DemoBanner() {
  return (
    <div className="demo-banner">
      <span>
        <strong>Preview</strong> with sample data saved in this browser. Log in as <code>demo</code> / <code>password123</code> or
        sign up.
      </span>
      <button
        className="btn-link"
        onClick={() => {
          resetDemo();
          window.location.hash = '#/';
          window.location.reload();
        }}
      >
        Reset data
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <DemoBanner />
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
