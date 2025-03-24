import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import Token from "./Token";

function App() {
  return (
    <Router>
      <div>
        <Token />
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
