import React from "react";

import { Outlet } from "react-router-dom";
import Nav from "./component/Navbar/Nav";
import Footer from "./component/Footer/Footer";

function LandingPage() {
  return (
    <div className="overflow-hidden">
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
}
export default LandingPage;
