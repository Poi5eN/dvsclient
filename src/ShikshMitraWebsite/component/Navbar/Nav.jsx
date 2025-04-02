import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Whitelogo from "../../digitalvidya.png";
import { motion } from "framer-motion";

// import "./Nav.css";

const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
    
    };

    const handleResize = () => {
     
   
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);



  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isScrollingDown = currentScrollPos > prevScrollPos;

      setIsVisible(isScrollingDown ? false : true);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ y: { duration: 0.7 } }}
      style={{
        position: "fixed",
        top: 0,
        // top: "15px",
        left: 0,
        right: 0,
        zIndex: 999,
      }}
      className="w-fulll nav-font "
    >
      <nav 
      // className="relative  overflow-hidden rounded-xl border border-blue-500/20"
      className="relative  overflow-hidden border bg-white"
      >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 backdrop-blur-md"></div>
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute h-4 w-4 rounded-full bg-blue-400/10 animate-float top-4 left-[10%]"></div>
        <div className="absolute h-3 w-3 rounded-full bg-blue-400/10 animate-float top-8 left-[20%] [animation-delay:0.5s]"></div>
        <div className="absolute h-5 w-5 rounded-full bg-blue-400/10 animate-float top-6 left-[80%] [animation-delay:1s]"></div>
        <div className="absolute h-6 w-6 rounded-full bg-blue-400/10 animate-float top-2 left-[60%] [animation-delay:1.5s]"></div>
      </div> */}

      <div
       className="relative px-4 sm:px-8 py-2"
      //  className="relative px-4 sm:px-8 py-4"
       >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg blur group-hover:blur-md transition-all duration-300"></div> */}
             <Link to="/">
             <img src={Whitelogo} alt="" className='h-14' />
             </Link>
              {/* <svg
                className="relative w-8 sm:w-10 h-8 sm:h-10 text-white transform group-hover:scale-110 transition-transform duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.755 9.755 0 016.116-3.985z" />
              </svg> */}
            </div>
            {/* <span className="text-xl sm:text-2xl font-bold text-white">OceanUI</span> */}
          </div>

          <div className="hidden md:flex items-center space-x-10">
          <Link to="/" className="relative group">
              <span className="text-[#2fa7db] group-hover:text-[#ee5828] transition-colors duration-300">Home</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/20 group-hover:w-full transition-all duration-500 delay-100"></div>
            </Link>
               
            <Link to="/feature" className="relative group">
              <span className="text-[#2fa7db] group-hover:text-[#ee5828] transition-colors duration-300">Features</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/20 group-hover:w-full transition-all duration-500 delay-100"></div>
            </Link>
            <Link to="/about" className="relative group">
              <span className="text-[#2fa7db] group-hover:text-[#ee5828] transition-colors duration-300">About</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/20 group-hover:w-full transition-all duration-500 delay-100"></div>
            </Link>
            <Link to="/contact" className="relative group">
              <span className="text-[#2fa7db] group-hover:text-[#ee5828] transition-colors duration-300">Contact</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300"></div>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/20 group-hover:w-full transition-all duration-500 delay-100"></div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="hidden sm:flex relative group">
              <div className="absolute -inset-0.5 bg-[#ee5828] rounded-lg  group-hover:opacity-100 transition duration-200"></div>
              {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ee5828] to-cyan-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200"></div> */}
              <div className="relative px-5 sm:px-7 py-2 sm:py-3  rounded-lg leading-none flex items-center">
              {/* <div className="relative px-5 sm:px-7 py-2 sm:py-3 bg-blue-950 rounded-lg leading-none flex items-center"> */}
                <div className="flex items-center space-x-2">
                  <span className="text-white group-hover:text-white transition duration-200">Login</span>
                  <svg
                    className="w-5 h-5 text-white group-hover:text-white transform group-hover:translate-x-1 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative group"
              aria-label="Toggle mobile menu"
            >
              <div className="absolute -inset-0.5 bg-[#ee5828] group-hover:opacity-100 transition duration-200"></div>
              {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded blur opacity-60 group-hover:opacity-100 transition duration-200"></div> */}
              <div className="relative p-2 bg-blue-950 rounded leading-none">
                {!isOpen ? (
                  <svg
                    className="w-6 h-6 text-blue-200 group-hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-blue-200 group-hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>


        {isOpen && (
          <div
            className="relative mt-4 md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1  backdrop-blur-sm rounded-lg border border-blue-500/10">
            {/* <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-900/50 backdrop-blur-sm rounded-lg border border-blue-500/10"> */}
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-[#2fa7db] hover:text-white hover:bg-blue-800/50 transition-all duration-200">
                Home
              </Link>
              <Link to="/feature" className="px-3 py-2 rounded-md text-base font-medium text-[#2fa7db] hover:text-white hover:bg-blue-800/50 transition-all duration-200">
                Features
              </Link>
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-[#2fa7db] hover:text-white hover:bg-blue-800/50 transition-all duration-200">
                About
              </Link>
              <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-[#2fa7db] hover:text-white hover:bg-blue-800/50 transition-all duration-200">
                Contact
              </Link>
              <div className="px-3 py-2">
                <button className="w-full relative group">
                  <div className="absolute -inset-0.5 bg-[#ee5828]  rounded-lg  transition duration-200"></div>
                  {/* <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200"></div> */}
                  <div className="relative px-4 py-2 bg-blue-950 rounded-lg leading-none flex items-center justify-center">
                   <Link to="/login">
                    <span className=" text-white transition duration-200">Login</span>
                    </Link>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
   
      {/* <div className="nav-font  w-[95%] mx-auto flex justify-around  items-center  px-3   ">
        <Link to="/">
          <div className="h-[80px] ">
            <img
              src={Whitelogo}
              alt="Logo"
              className=" w-full h-full  cursor-pointer  rounded-sm"
            />
          </div>
        </Link>

        {isMobile ? (
          <div className="flex items-center   duration-1000">
            <button
              className="text-black font-extrabold focus:outline-none"
              onClick={handleMobileMenuToggle}
            >
              <FaBars className="text-2xl text-white" />
            </button>
            {isMobileMenuOpen && (
              <div className="fixed top-0 left-0 h-full w-full bg-black text-gray-100 p-4 space-y-6 shadow-lg flex flex-col items-center duration-1000">
                <button
                  className=" focus:outline-none self-end duration-1000"
                  onClick={handleMobileMenuToggle}
                >
                  <FiX className="text-3xl mr-[70px] font-bold mt-4" />
                </button>
                <Link
                  onClick={handleMobileMenuToggle}
                  to="/"
                  className={`hover_animation cursor-pointer  hover:duration-700  p-1 rounded-md ${
                    isScrolled ? "" : ""
                  }`}
                >
                  Home
                </Link>
                <Link
                  onClick={handleMobileMenuToggle}
                  to="/services"
                  className={`hover_animation cursor-pointer   hover:duration-700    p-1 rounded-md ${
                    isScrolled ? "" : ""
                  }`}
                >
                  SERVICES
                </Link>

                <Link
                  to="/screenshot"
                  onClick={handleMobileMenuToggle}
                  className={` hover_animation cursor-pointer   hover:duration-700    p-1 rounded-md  ${
                    isScrolled ? "" : ""
                  }`}
                >
                  SCREENSHOT
                </Link>
                <Link
                  to="/contact"
                  onClick={handleMobileMenuToggle}
                  className={` hover_animation cursor-pointer   hover:duration-700    p-1 rounded-md  ${
                    isScrolled ? "" : ""
                  }`}
                >
                  CONTACT
                </Link>
                <Link
                  to="/about"
                  onClick={handleMobileMenuToggle}
                  className={` hover_animation cursor-pointer   hover:duration-700    p-1 rounded-md  ${
                    isScrolled ? "" : ""
                  }`}
                >
                  ABOUT
                </Link>
                <Link
                  to="/demo"
                  onClick={handleMobileMenuToggle}
                  className={` hover_animation cursor-pointer   hover:duration-700    p-1 rounded-md  ${
                    isScrolled ? "" : ""
                  }`}
                >
                  DEMO
                </Link>
                <Link
                  to="/login"
                  onClick={handleMobileMenuToggle}
                  className={`  group  sm:block bg-cyan-700 text-[13px]  px-4 py-3 rounded-lg `}
                >
                  LOGIN
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`z-50 nav-font    mx-auto bg-[#192a3a] px-10   space-x-10  rounded-lg p-1  text-black" `}
          >
            <Link
              to="/"
              onClick={scrollToTop}
              className={`hover_animation nav-font  text-[13px] text-gray-100  cursor-pointer hover:text-gray-100 hover:duration-700    p-1 rounded-md ${
                isScrolled ? "" : ""
              }`}
            >
              HOME
            </Link>
            <Link
              to="/services"
              onClick={scrollToTop}
              className={`hover_animation nav-font  text-[13px] cursor-pointer text-gray-100 hover:text-gray-100 hover:duration-700    p-1 rounded-md ${
                isScrolled ? "text-white" : ""
              }`}
            >
              SERVICES
            </Link>

            <Link
              to="/screenshot"
              onClick={scrollToTop}
              className={` hover_animation nav-font text-gray-100   text-[13px] cursor-pointer  hover:text-gray-100 hover:duration-700    p-1 rounded-md  ${
                isScrolled ? "text-white" : ""
              }`}
            >
              SCREENSHOT
            </Link>
            <Link
              to="/contact"
              onClick={scrollToTop}
              className={` hover_animation nav-font text-gray-100   text-[13px] cursor-pointer  hover:text-gray-100 hover:duration-700    p-1 rounded-md  ${
                isScrolled ? "text-white" : ""
              }`}
            >
              CONTACT
            </Link>
            <Link
              to="/about"
              onClick={scrollToTop}
              className={` hover_animation text-gray-100 nav-font  text-[13px] cursor-pointer  hover:text-gray-100 hover:duration-700    p-1 rounded-md  ${
                isScrolled ? "text-white" : ""
              }`}
            >
              ABOUT
            </Link>
            <Link
              to="/demo"
              onClick={scrollToTop}
              className={` hover_animation nav-font text-gray-100 bg-[#29435b] px-3 py-2 rounded-lg  text-[13px] cursor-pointer  hover:text-gray-100 hover:duration-700  ${
                isScrolled ? "text-white" : ""
              }`}
            >
              DEMO
            </Link>
          </div>
        )}

        {isMobileMenuOpen && isMobile && (
          <div className="flex items-center ml-auto">
            <div className="mr-4"></div>
            <div></div>
          </div>
        )}
        {!isMobile && (
          <Link to="/login">
            <div className="relative text-white group hidden sm:block bg-cyan-700 text-[13px]  px-4 py-3 rounded-lg">
              LOGIN
            </div>
          </Link>
        )}
      </div> */}
    </motion.nav>
  );
};

export default Nav;
