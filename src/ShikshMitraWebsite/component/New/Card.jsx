import React from 'react';
import { motion } from 'framer-motion';
import image from '../../assets/geniusedusoft-banner-3.webp';

const Card = () => {
  return (
    <div className="px-4 py-12 bg-white">
      
      <div className="flex flex-col lg:flex-row-reverse max-w-6xl mx-auto items-center">
        
        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          className="w-full lg:w-1/2 h-64 lg:h-[450px] rounded-xl overflow-hidden"
        >
          <img
            src={image}
            alt="School ERP Banner"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Text Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className="w-full lg:w-1/2 px-6 py-10 lg:py-0 lg:px-12"
        >
          <h2 className="text-2xl font-bold uppercase lg:text-4xl text-[#ee582c]">
            Leading School ERP
          </h2>
          <p className="mt-4 text-gray-700">
            Welcome to School ERP! We are a leading company in the market,
            delivering top-tier global services to our valued clients. Our
            dedicated team ensures continuous support and guidance, helping
            clients gain a deeper understanding of our products and services.
            Driven by passion and enthusiasm, our young team embraces
            challenges on the journey to success.
          </p>
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="inline-block w-full text-center text-lg font-medium text-white bg-[#ee582c] py-4 px-10 mt-8 hover:bg-[#2fa7db] hover:shadow-xl transition duration-300 md:w-48"
          >
            Read More
          </motion.a>
        </motion.div>

      </div>
    </div>
  );
};

export default Card;



// import React from 'react';
// import { motion } from 'framer-motion';
// import image from '../../assets/geniusedusoft-banner-3.webp';

// const Card = () => {
//   return (
//     <div className="px-4 py-12 bg-white">
//       <div 
//       className="relative flex flex-col items-center mx-auto lg:flex-row-reverse lg:max-w-5xl xl:max-w-6xl"
//       >

//         <motion.div
//           initial={{ opacity: 0, x: 100 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           viewport={{ once: true, amount: 0.3 }}
//           className="w-full h-64 lg:w-1/2 lg:h-auto"
//         >
//           <img
//             className="h-full w-full object-cover rounded-lg "
//             src={image}
//             alt="Winding mountain road"
//           />
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 100 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.2 }}
//           viewport={{ once: true, amount: 0.3 }}
//           // className="max-w-lg overflow-hidden md:max-w-2xl md:z-10 md:absolute md:top-0 md:mt-48 lg:w-3/5 lg:left-0 lg:mt-20 lg:ml-20 xl:mt-24 xl:ml-12"
//         >
//           <div className="flex flex-col p-12 md:px-16">
//             <h2 className="text-2xl font-bold uppercase lg:text-4xl text-[#ee582c]">
//               Leading School ERP
//             </h2>
//             <p className="mt-4 text-gray-700">
//               Welcome to School ERP! We are a leading company in the market,
//               delivering top-tier global services to our valued clients. Our
//               dedicated team ensures continuous support and guidance, helping
//               clients gain a deeper understanding of our products and services.
//               Driven by passion and enthusiasm, our young team embraces
//               challenges on the journey to success.
//             </p>
//             <motion.a
//               href="#"
//               whileHover={{ scale: 1.05 }}
//               className="inline-block w-full text-center text-lg font-medium text-white bg-[#ee582c] border-2 border-gray-600 py-4 px-10 mt-8 hover:bg-[#2fa7db] hover:shadow-xl transition duration-300 md:w-48"
//             >
//               Read More
//             </motion.a>
//           </div>
//         </motion.div>

//       </div>
//     </div>
//   );
// };

// export default Card;



// import React from 'react';
// import { motion } from 'framer-motion';
// import image from '../../assets/7040910.jpg';

// const Card = () => {
//   return (
//     <div className="px-4 py-12 bg-white">
//       <div className="relative flex flex-col items-center mx-auto lg:flex-row-reverse lg:max-w-5xl xl:max-w-6xl">

//         <motion.div
//           initial={{ opacity: 0, x: 100 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="w-full h-64 lg:w-1/2 lg:h-auto"
//         >
//           <img
//             className="h-full w-full object-cover rounded-lg shadow-lg"
//             src={image}
//             alt="Winding mountain road"
//           />
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 100 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1, delay: 0.2 }}
//           className="max-w-lg bg-white rounded-xl overflow-hidden md:max-w-2xl md:z-10 md:shadow-lg md:absolute md:top-0 md:mt-48 lg:w-3/5 lg:left-0 lg:mt-20 lg:ml-20 xl:mt-24 xl:ml-12"
//         >
//           <div className="flex flex-col p-12 md:px-16">
//             <h2 className="text-2xl font-bold uppercase lg:text-4xl text-[#ee582c]">
//               Leading School ERP
//             </h2>
//             <p className="mt-4 text-gray-700">
//               Welcome to School ERP! We are a leading company in the market,
//               delivering top-tier global services to our valued clients. Our
//               dedicated team ensures continuous support and guidance, helping
//               clients gain a deeper understanding of our products and services.
//               Driven by passion and enthusiasm, our young team embraces
//               challenges on the journey to success.
//             </p>
//             <motion.a
//               href="#"
//               whileHover={{ scale: 1.05 }}
//               className="inline-block w-full text-center text-lg font-medium text-white bg-[#ee582c] border-2 border-gray-600 py-4 px-10 mt-8 hover:bg-[#2fa7db] hover:shadow-xl transition duration-300 md:w-48"
//             >
//               Read More
//             </motion.a>
//           </div>
//         </motion.div>

//       </div>
//     </div>
//   );
// };

// export default Card;



// import React from 'react'
// import image from '../../assets/7040910.jpg'
// const Card = () => {
//   return (
//     <div>
//       <div class="relative flex flex-col items-center mx-auto lg:flex-row-reverse lg:max-w-5xl lg:mt-12 xl:max-w-6xl">

// <div class="w-full h-64 lg:w-1/2 lg:h-auto">
//     <img class="h-full w-full object-cover" src={image} alt="Winding mountain road"/>
// </div>

// <div
//     class="max-w-lg bg-white md:max-w-2xl md:z-10 md:shadow-lg md:absolute md:top-0 md:mt-48 lg:w-3/5 lg:left-0 lg:mt-20 lg:ml-20 xl:mt-24 xl:ml-12">
//     <div class="flex flex-col p-12 md:px-16">
//         <h2 class="text-2xl font-medium uppercase  lg:text-4xl text-[#ee582c]">Leading School ERP </h2>
//         <p class="mt-4">
//         Welcome to School ERP! We are a leading company in the market, delivering top-tier global services to our valued clients. Our dedicated team ensures continuous support and guidance, helping clients gain a deeper understanding of our products and services. Driven by passion and enthusiasm, our young team embraces challenges on the journey to success.
//         </p>
//         <div class="mt-8">
//             <a href="#"
//                 class="inline-block w-full text-center text-lg font-medium text-gray-100 bg-[#ee582c]   border-solid border-2 border-gray-600 py-4 px-10 hover:bg-[#2fa7db] hover:shadow-md md:w-48">Read
//                 More</a>
//         </div>
//     </div>
// </div>

// </div>
//     </div>
//   )
// }

// export default Card
