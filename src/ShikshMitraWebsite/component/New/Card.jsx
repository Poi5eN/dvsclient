import React from 'react'
import image from '../../assets/7040910.jpg'
const Card = () => {
  return (
    <div>
      <div class="relative flex flex-col items-center mx-auto lg:flex-row-reverse lg:max-w-5xl lg:mt-12 xl:max-w-6xl">

<div class="w-full h-64 lg:w-1/2 lg:h-auto">
    <img class="h-full w-full object-cover" src={image} alt="Winding mountain road"/>
</div>

<div
    class="max-w-lg bg-white md:max-w-2xl md:z-10 md:shadow-lg md:absolute md:top-0 md:mt-48 lg:w-3/5 lg:left-0 lg:mt-20 lg:ml-20 xl:mt-24 xl:ml-12">
    <div class="flex flex-col p-12 md:px-16">
        <h2 class="text-2xl font-medium uppercase  lg:text-4xl text-[#ee582c]">Leading School ERP </h2>
        <p class="mt-4">
        Welcome to School ERP! We are a leading company in the market, delivering top-tier global services to our valued clients. Our dedicated team ensures continuous support and guidance, helping clients gain a deeper understanding of our products and services. Driven by passion and enthusiasm, our young team embraces challenges on the journey to success.
        </p>
        <div class="mt-8">
            <a href="#"
                class="inline-block w-full text-center text-lg font-medium text-gray-100 bg-[#ee582c]   border-solid border-2 border-gray-600 py-4 px-10 hover:bg-[#2fa7db] hover:shadow-md md:w-48">Read
                More</a>
        </div>
    </div>
</div>

</div>
    </div>
  )
}

export default Card
