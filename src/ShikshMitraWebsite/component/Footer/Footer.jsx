import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import Whitelogo from '../../digitalvidya.png';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <img src={Whitelogo} alt="Logo" className="h-10 mb-4 md:mb-0" />
        <div className="flex space-x-6">
          <motion.a href="#" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="text-2xl">
            <FaFacebook />
          </motion.a>
          <motion.a href="#" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="text-2xl">
            <FaTwitter />
          </motion.a>
          <motion.a href="#" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="text-2xl">
            <FaInstagram />
          </motion.a>
        </div>
      </div>
      <div className="text-center mt-4">
        Copyright © 2025 <a href="https://edaksha.netlify.app/" className="text-[#ee5828]">DIGITALVIDYASAARTHI</a>
      </div>
    </footer>
  );
};

export default Footer;