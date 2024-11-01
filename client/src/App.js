import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import './styles/Globals.css';

function App() {
  return (
      <Router>
        <div>
          <AppRoutes />
        </div>
      </Router>
  );
}

export default App;
