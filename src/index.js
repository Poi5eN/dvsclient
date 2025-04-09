import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ContextProvider } from "./contexts/ContextProvider";
// import { ChakraProvider } from "@chakra-ui/react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const theme = createTheme();

const Root = () => {
  return (
    <React.StrictMode>
      <ContextProvider>
        <BrowserRouter>
          {/* <ChakraProvider> */}
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          {/* </ChakraProvider> */}
        </BrowserRouter>
        <ToastContainer />
      </ContextProvider>
    </React.StrictMode>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));
