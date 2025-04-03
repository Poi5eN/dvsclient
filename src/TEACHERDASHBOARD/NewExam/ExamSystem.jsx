import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router

const BookingTrendCard = ({ title, value, link, color, trendingUp }) => {
    return (
        <Link to={link} className={`block rounded-lg shadow-md p-4 relative h-full ${color} hover:shadow-xl transition-shadow`}>
           
                <div className="absolute top-2 right-2 rounded-full bg-green-200 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                </div>
           
            <h3 className="text-lg md:text-[16px] font-semibold mb-2 text-white">{title}</h3>
           
        </Link>
    );
};


const BookingTrendDashboard = () => {
    return (
        <div className="container mx-auto p-2">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BookingTrendCard
                    title="Exam"
                    value="5"
                    link="/teacher/exams"
                    color="bg-blue-600"

                />
                 {/* <BookingTrendCard
                    title="Admit Card"
                    value="185"
                    link="/teacher/admitcard"
                    color="bg-[#033E3E]"
                  
                 />
               <BookingTrendCard
                    title="Report Card"
                    value="57"
                    link="/teacher/reportscard"
                    color="bg-[#CA762B]"
                /> */}
               <BookingTrendCard
                   title="Allot Marks"
                   value="57"
                    link="/teacher/allotmaks"
                   color="bg-[#F75D59]"
                />
        
            </div>
        </div>
    );
};

export default BookingTrendDashboard;





// import React from 'react';

// const BookingTrendCard = ({ title, value, previousValue, percentageChange, color, trendingUp }) => {
//   return (
//     <div className={`rounded-lg shadow-md p-4 relative h-full ${color}`}>
//       {trendingUp ? (
//         <div className="absolute top-1 right-2 rounded-full bg-green-200 p-1">
//          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-4 h-4">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
//         </svg>
//         </div>
//       ) : (
//         <div className="absolute top-1 right-2 rounded-full bg-red-200 p-1">
//          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="red" className="w-4 h-4">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
//         </svg>
//         </div>
//       )}
//       <h3 className="text-lg font-semibold mb-2">{title}</h3>
//       {/* <p className="text-2xl font-bold">{value}</p> */}
//       <div className="flex justify-between">
//       {/* <p className="text-gray-600">{previousValue}</p>
//        <p className="text-green-500 font-medium">{value}</p> */}
//        </div>
//     </div>
//   );
// };


// const BookingTrendDashboard = () => {
//   return (
//     <div className="container mx-auto p-2">
//       {/* <h2 className="text-2xl font-bold mb-4">Booking Trend</h2> */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <BookingTrendCard
//           title="Exam"
//           value="5"
//          Link="/Exam"
//           color="bg-blue-100"
//         //    trendingUp={false}
//         />
//       <BookingTrendCard
//           title="Admit Card"
//           value="185"
//           previousValue=""
//             Link="/AdmitCard"
//           percentageChange="370.00"
//           color="bg-orange-100"
//           trendingUp={true}
//         />
//           <BookingTrendCard
//           title="Report Card"
//           value="57"
//             Link="/ReportCard"
//           previousValue="8"
//           percentageChange="712.50"
//           color="bg-red-100"
//           trendingUp={true}
//         />
//           <BookingTrendCard
//           title="Allot Marks"
//           value="57"
//             Link="/AllotMarks"
//           previousValue="8"
//           percentageChange="712.50"
//           color="bg-red-100"
//           trendingUp={true}
//         />
        

//       </div>
//     </div>
//   );
// };

// export default BookingTrendDashboard;