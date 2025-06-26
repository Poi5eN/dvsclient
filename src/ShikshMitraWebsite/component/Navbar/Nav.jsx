import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { ThemeContext } from "../../../contexts/ThemeContext";
import Whitelogo from "../../digitalvidya.png";

const Nav = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ y: { duration: 0.7 } }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-8 py-2 flex items-center justify-between">
          <Link to="/">
            <img src={Whitelogo} alt="Logo" className="h-14" />
          </Link>
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Home</Link>
            <Link to="/feature" className="text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Features</Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">About</Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Contact</Link>
            <Link to="/blog" className="text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Blog</Link>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {theme === 'light' ? <FiMoon className="text-gray-700" /> : <FiSun className="text-yellow-400" />}
            </motion.button>
            <Link to="/login" className="bg-[#ee5828] text-white px-5 py-2 rounded-lg hover:bg-[#2fa7db]">Login</Link>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
              {isOpen ? 'X' : '☰'}
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 px-2 pt-2 pb-3">
            <Link to="/" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Home</Link>
            <Link to="/feature" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Features</Link>
            <Link to="/about" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">About</Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Contact</Link>
            <Link to="/blog" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-[#ee5828]">Blog</Link>
            <Link to="/login" className="block px-3 py-2 bg-[#ee5828] text-white rounded-md hover:bg-[#2fa7db]">Login</Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Nav;