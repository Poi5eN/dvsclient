import React from 'react'
import { Link } from 'react-router-dom'
import image from "../../assets/home-font.png"
const Hero = () => {
  return (
    <div>
      <section class="bg-white dark:bg-gray-900">
    <div class="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-28">
        <div class="mr-auto place-self-center lg:col-span-7">
            <h1
                class="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
                <span className='text-[#2fa7db]'>School Management</span> <br/><span className='text-[#ee582c]'>Products </span><span  className='text-[#2fa7db]'> brands.</span>

               
            </h1>

            <p class="max-w-2xl mb-6 font-light  text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">Transform your institution with an intuitive and all-in-one school management solution that simplifies operations, boosts efficiency, and elevates student success.
                 </p>

            <div class="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">

                <Link to="/login" 
                
                    class="inline-flex bg-[#ee582c]  text-white items-center justify-center w-full px-5 py-3 text-sm font-medium text-center  border border-gray-200 rounded-lg sm:w-auto  focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                    
                     Login
                </Link>

                {/* <Link href="/" 
              
                    class="inline-flex bg-[#2fa7db] items-center justify-center w-full px-5 py-3 mb-2 mr-2 text-sm font-medium  text-white border border-gray-200 rounded-lg sm:w-auto focus:outline-none   focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">

                    
                   Demo
                </Link> */}

            </div>
        </div>

        <div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img src={image} alt="hero image"/>
        </div>

    </div>
</section>
    </div>
  )
}

export default Hero
