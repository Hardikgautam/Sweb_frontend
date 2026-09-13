// main.jsx — React entry point
// Mounts the App component and imports global styles.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';   // ← imports variables.css + resets
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
