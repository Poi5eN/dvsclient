import React from "react";
import "./Spinner.css"; // You can style the spinner in a separate CSS file

function Spinner() {
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
    </div>
  );
}

export default Spinner;
