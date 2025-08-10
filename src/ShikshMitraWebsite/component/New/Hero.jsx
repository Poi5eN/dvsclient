import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import image from "../../assets/home-font.png";

const Hero = () => {
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.5 } },
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-28">
        <motion.div
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="mr-auto place-self-center lg:col-span-7"
        >
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
            <span className="text-[#2fa7db]">School Management</span> <br />
            <span className="text-[#ee582c]">Products</span> <span className="text-[#2fa7db]">brands.</span>
          </h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
            Transform your institution with an intuitive and all-in-one school management solution that simplifies operations, boosts efficiency, and elevates student success.
          </p>
          <Link to="/login" className="inline-flex bg-[#ee5828] text-white px-5 py-3 rounded-lg hover:bg-[#2fa7db]">
            Login
          </Link>
        </motion.div>
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="hidden lg:mt-0 lg:col-span-5 lg:flex"
        >
          <img src={image} alt="hero image" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;