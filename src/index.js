import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ContextProvider } from "./contexts/ContextProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const Root = () => {
  return (
    <React.StrictMode>
        
      <ContextProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ToastContainer />
      </ContextProvider>
    </React.StrictMode>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));