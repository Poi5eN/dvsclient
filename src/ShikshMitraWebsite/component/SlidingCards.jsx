import React from 'react';
import '../../App.css'; // Ensure you have styles for slider in App.css
import togore from '../assets/school logo.jpg'
import spl from '../assets/clients/Spl.jpg'
import bk from '../assets/clients/BK.jpg'
import Vidyamandir from '../assets/clients/Vidyamandir.jpg'
import dbs from '../assets/clients/dbs.jpg'
import murari from '../assets/clients/murari.jpg'
import omshree from '../assets/clients/omshree.jpg'
import pine from '../assets/clients/pine.jpg'
import sbc from '../assets/clients/sbc.jpg'
const slidesData = [
  { id: 1, schoolName: "Tagore Convent School", logo: togore },
  { id: 2, schoolName: "S.P.L High School", logo: spl },
  { id: 3, schoolName: "B.K International School", logo: bk },
  { id: 4, schoolName: "S.S Vidya Mandir School", logo: Vidyamandir },
  { id: 5, schoolName: "Digital Brand School", logo: dbs },
  { id: 6, schoolName: "Murari Lal Public School", logo: murari },
  { id: 7, schoolName: "Om Shri Saraswati VidyaPeeth", logo: omshree },
  { id: 8, schoolName: "Pine Hills Play School", logo: pine },
  { id: 9, schoolName: "S.B.C Public School", logo: sbc },
 
];

const SlidingCards = () => {
  // Duplicating for infinite scroll illusion
  const repeatedSlides = [...slidesData, ...slidesData];

  return (
    <div className="container mx-auto px-4 sm:px-12 py-8">
         <div className="text-center text-2xl md:text-3xl font-bold text-[#ee582c] mb-8 ">
        Our Clients
      </div>
      <div className="slider">
        <div className="slide-track py-6">
          {repeatedSlides.map((slide, idx) => (
            <div
              key={idx}
              className="slide flex flex-col items-center justify-center text-white text-center  rounded-lg shadow-lg px-4 py-10 mx-2"
            >
              <img
                src={slide.logo}
                alt={`${slide.schoolName} logo`}
                className="mb-2 h-32 bg-white p-1 object-contain"
              />
              <h3 className="font-semibold text-[#29abe2]">{slide.schoolName}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidingCards;



// import React, { useState } from 'react';
// import '../../App.css'
// const cardsData = [
//   { id: 1, title: "Card One", content: "This is the first card." },
//   { id: 2, title: "Card Two", content: "This is the second card." },
//   { id: 3, title: "Card Three", content: "This is the third card." },
//   { id: 4, title: "Card Four", content: "This is the fourth card." },
// ];

// const SlidingCards = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const slideLeft = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex === 0 ? cardsData.length - 1 : prevIndex - 1
//     );
//   };

//   const slideRight = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex === cardsData.length - 1 ? 0 : prevIndex + 1
//     );
//   };

//   return (
//     <div class="container mx-auto px-4 sm:px-12 py-8">
//     <div class="slider">
//       <div class="slide-track">
//         <div class="slide bg-red-500">1</div>
//         <div class="slide bg-purple-500">2</div>
//         <div class="slide bg-blue-500">3</div>
//         <div class="slide bg-indigo-500">4</div>
//         <div class="slide bg-pink-500">5</div>
//         <div class="slide bg-green-500">6</div>
//         <div class="slide bg-yellow-500">7</div>
//         <div class="slide bg-red-500">8</div>
//         <div class="slide bg-gray-500 text-white">9</div>
//         <div class="slide bg-blue-800">0</div>
       
//         <div class="slide bg-red-500">1</div>
//         <div class="slide bg-purple-500">2</div>
//         <div class="slide bg-blue-500">3</div>
//         <div class="slide bg-indigo-500">4</div>
//         <div class="slide bg-pink-500">5</div>
//         <div class="slide bg-green-500">6</div>
//         <div class="slide bg-yellow-500">7</div>
//         <div class="slide bg-red-500">8</div>
//         <div class="slide bg-gray-500 text-white">9</div>
//         <div class="slide bg-blue-800">0</div>
//       </div>
//     </div>
//   </div>
//   );
// };

// export default SlidingCards;
