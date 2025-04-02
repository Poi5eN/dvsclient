import React from 'react'
import { TabsDefault } from '../../Dynamic/TabsDefault'
import DuesFees from "./DuesFees";
import NewCheckFee2 from "./CreateFees";
import ClasswiseFee from "./ClassWise/ClasswiseFee";
import AdditionalFee from "./Additional/AdditionalFee";
import AddDues from "./AddDues";
const Fees = () => {
  const Titletabs = [
    {
      label: "Fees Payment",
      value: "payment",
      color:"#e91e63",
      desc: <NewCheckFee2/>
    },
    {
      label: "Dues",
      value: "dues",
      color:"#8e24aa",
      desc: <DuesFees/>
    },
    {
      label: "Create  Fees",
      value: "class",
      color:"#1e88e5",
      desc: <ClasswiseFee/>,
    },
    {
      label: "Additional  Fees",
      value: "additional",
      color:"#00838f",
      desc: <AdditionalFee/>,
    },
    {
      label: "Add Dues",
      value: "addDues",
      color:"#f9a825",
      desc: <AddDues/>,
    },
    // {
    //   label: "HTML",
    //   value: "html",
    //   desc: `It really matters and then like it really doesn't matter.
    //   What matters is the people who are sparked by it. And the people 
    //   who are like offended by it, it doesn't matter.`,
    // },
  ]
  return (
    <div className='bg-white'>
      <TabsDefault Titletabs={Titletabs}/>
    </div>
  )
}

export default Fees


// import React, { useState } from "react";
// import { FaUserPlus, FaBook, FaFileInvoice, FaGraduationCap } from 'react-icons/fa'; // React Icons
// import { IconContext } from "react-icons";
// import NewCheckFee2 from "./NewCheckFee2";
// import ClasswiseFee from "./ClassWise/ClasswiseFee";
// import AdditionalFee from "./Additional/AdditionalFee";
// import DuesFees from "./DuesFees";
// import AddDues from "./AddDues";


// const ExamFee = () => <div>Details about Exam Fee</div>;
// // const LibraryFee = () => <div>Details about Library Fee</div>;
// // const SportsFee = () => <div>Details about Sports Fee</div>;

// const Fees = () => {
//   const [activeTab, setActiveTab] = useState("Admission");

//   const tabs = [
//     { id: "payment", label: "Fees Payment", icon: FaUserPlus, color: "bg-green-500" },
//     { id: "dues", label: "Dues Balance", icon: FaGraduationCap, color: "bg-red-500" },
//     // { id: "Create", label: "Create fees", icon: FaFileInvoice, color: "bg-yellow-500" },
//     { id: "class", label: "Create  Fees", icon: FaFileInvoice, color: "bg-pink-500" },
//     { id: "additional", label: "Additional Fees", icon: FaFileInvoice, color: "bg-yellow-500" },
//     { id: "addDues", label: "Add Dues", icon: FaBook, color: "bg-purple-500" },
//     // { id: "Sports", label: "Sports Fee", icon: FaFootballBall, color: "bg-blue-500" },
//   ];

//   const renderComponent = () => {
//     switch (activeTab) {
//       case "payment":
//         return <NewCheckFee2 />;
//       case "dues":
//         return <DuesFees />;
//       case "Create":
//         return <ExamFee />;
//       case "class":
//         return <ClasswiseFee />;
//       case "additional":
//         return <AdditionalFee />;
//       case "addDues":
//         return <AddDues />;
//     //   case "Sports":
//     //     return <SportsFee />;
//       default:
//         return <NewCheckFee2 />;
//     }
//   };

//   return (
//     <div>
//       <IconContext.Provider value={{ size: '1.5em', color: 'white' }}>  {/* Icon color white */}
//         <div className="flex flex-wrap gap-2 justify-center mb-4">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               className={`flex flex-col items-center justify-center p-3 rounded-xl  shadow-md transition-colors duration-200  ${
//             //   className={`flex flex-col items-center justify-center p-3 rounded-xl w-20 h-20 shadow-md transition-colors duration-200  ${
//                 activeTab === tab.id
//                   ? `${tab.color} text-white`  // Use tab-specific color when active
//                   : `${tab.color} opacity-70 hover:opacity-100 text-white`  // Default color and opacity
//               }`}
//               onClick={() => setActiveTab(tab.id)}
//               aria-label={tab.label}
//             >
//               <tab.icon className="mb-1" />
//               <span className="text-xs">{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </IconContext.Provider>
//       <div className="p-1 border rounded">{renderComponent()}</div>
//     </div>
//   );
// };

// export default Fees;



// import React, { useState } from "react";
// import { FaUserPlus, FaBook, FaFootballBall, FaFileInvoice, FaGraduationCap } from 'react-icons/fa'; // React Icons
// import { IconContext } from "react-icons";

// const AdmissionFee = () => <div>Details about Admission Fee</div>;
// const TuitionFee = () => <div>Details about Tuition Fee</div>;
// const ExamFee = () => <div>Details about Exam Fee</div>;
// const LibraryFee = () => <div>Details about Library Fee</div>;
// const SportsFee = () => <div>Details about Sports Fee</div>;

// const Fees = () => {
//   const [activeTab, setActiveTab] = useState("Admission");

//   const tabs = [
//     { id: "Admission", label: "Admission Fee", icon: FaUserPlus, color: "bg-green-500" },
//     { id: "Tuition", label: "Tuition Fee", icon: FaGraduationCap, color: "bg-red-500" },
//     { id: "Exam", label: "Exam Fee", icon: FaFileInvoice, color: "bg-yellow-500" },
//     { id: "Library", label: "Library Fee", icon: FaBook, color: "bg-purple-500" },
//     { id: "Sports", label: "Sports Fee", icon: FaFootballBall, color: "bg-blue-500" },
//   ];

//   const renderComponent = () => {
//     switch (activeTab) {
//       case "Admission":
//         return <AdmissionFee />;
//       case "Tuition":
//         return <TuitionFee />;
//       case "Exam":
//         return <ExamFee />;
//       case "Library":
//         return <LibraryFee />;
//       case "Sports":
//         return <SportsFee />;
//       default:
//         return <AdmissionFee />;
//     }
//   };

//   return (
//     <div>
//       <IconContext.Provider value={{ size: '1.5em', color: 'white' }}>  {/* Icon color white */}
//         <div className="flex flex-wrap gap-2 justify-center mb-4">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               className={`flex flex-col items-center justify-center p-3 rounded-full w-20 h-20 shadow-md transition-colors duration-200 ${
//                 activeTab === tab.id
//                   ? `${tab.color} text-white`  // Use tab-specific color
//                   : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//               }`}
//               onClick={() => setActiveTab(tab.id)}
//               aria-label={tab.label}
//             >
//               <tab.icon className="mb-1" />
//               <span className="text-xs">{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </IconContext.Provider>
//       <div className="p-4 border rounded">{renderComponent()}</div>
//     </div>
//   );
// };

// export default Fees;




// import React, { useState } from "react";
// import { FaUserPlus, FaBook, FaFootballBall, FaFileInvoice, FaGraduationCap } from 'react-icons/fa'; // React Icons
// import { IconContext } from "react-icons";

// const AdmissionFee = () => <div>Details about Admission Fee</div>;
// const TuitionFee = () => <div>Details about Tuition Fee</div>;
// const ExamFee = () => <div>Details about Exam Fee</div>;
// const LibraryFee = () => <div>Details about Library Fee</div>;
// const SportsFee = () => <div>Details about Sports Fee</div>;

// const Fees = () => {
//   const [activeTab, setActiveTab] = useState("Admission");

//   const tabs = [
//     { id: "Admission", label: "Admission Fee", icon: FaUserPlus },
//     { id: "Tuition", label: "Tuition Fee", icon: FaGraduationCap },
//     { id: "Exam", label: "Exam Fee", icon: FaFileInvoice },
//     { id: "Library", label: "Library Fee", icon: FaBook },
//     { id: "Sports", label: "Sports Fee", icon: FaFootballBall },
//   ];

//   const renderComponent = () => {
//     switch (activeTab) {
//       case "Admission":
//         return <AdmissionFee />;
//       case "Tuition":
//         return <TuitionFee />;
//       case "Exam":
//         return <ExamFee />;
//       case "Library":
//         return <LibraryFee />;
//       case "Sports":
//         return <SportsFee />;
//       default:
//         return <AdmissionFee />;
//     }
//   };

//   return (
//     <div>
//       <IconContext.Provider value={{ size: '1.5em', color: 'currentColor' }}>
//         <div className="flex flex-wrap gap-2 justify-center mb-4">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               className={`flex flex-col items-center justify-center p-3 rounded-full w-20 h-20 shadow-md transition-colors duration-200 ${
//                 activeTab === tab.id
//                   ? "bg-blue-500 text-white"
//                   : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//               }`}
//               onClick={() => setActiveTab(tab.id)}
//               aria-label={tab.label}
//             >
//               <tab.icon className="mb-1" />
//               <span className="text-xs">{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </IconContext.Provider>
//       <div className="p-4 border rounded">{renderComponent()}</div>
//     </div>
//   );
// };

// export default Fees;


// import React, { useState } from "react";

// const AdmissionFee = () => <div>Details about Admission Fee</div>;
// const TuitionFee = () => <div>Details about Tuition Fee</div>;
// const ExamFee = () => <div>Details about Exam Fee</div>;
// const LibraryFee = () => <div>Details about Library Fee</div>;
// const SportsFee = () => <div>Details about Sports Fee</div>;

// const Fees = () => {
//   const [activeTab, setActiveTab] = useState("Admission");

//   const tabs = [
//     { id: "Admission", label: "Admission Fee" },
//     { id: "Tuition", label: "Tuition Fee" },
//     { id: "Exam", label: "Exam Fee" },
//     { id: "Library", label: "Library Fee" },
//     { id: "Sports", label: "Sports Fee" },
//   ];

//   const renderComponent = () => {
//     switch (activeTab) {
//       case "Admission":
//         return <AdmissionFee />;
//       case "Tuition":
//         return <TuitionFee />;
//       case "Exam":
//         return <ExamFee />;
//       case "Library":
//         return <LibraryFee />;
//       case "Sports":
//         return <SportsFee />;
//       default:
//         return <AdmissionFee />;
//     }
//   };

//   return (
//     <div>
//       <div className="flex gap-2 mb-4">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`px-4 py-2 border rounded ${
//               activeTab === tab.id ? "bg-blue-500 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>
//       <div className="p-4 border rounded">{renderComponent()}</div>
//     </div>
//   );
// };

// export default Fees;





// import React, { useState } from "react";

// const Tab1 = () => <div>Content for Tab 1</div>;
// const Tab2 = () => <div>Content for Tab 2</div>;
// const Tab3 = () => <div>Content for Tab 3</div>;
// const Tab4 = () => <div>Content for Tab 4</div>;
// const Tab5 = () => <div>Content for Tab 5</div>;

// const Fees = () => {
//   const [activeTab, setActiveTab] = useState(1);
//  const tabs = [a, b, c, d, e];
//   const renderComponent = () => {
//     switch (activeTab) {
//       case a:
//         return <Tab1 />;
//       case b:
//         return <Tab2 />;
//       case c:
//         return <Tab3 />;
//       case d:
//         return <Tab4 />;
//       case e:
//         return <Tab5 />;
//       default:
//         return <Tab1 />;
//     }
//   };

//   return (
//     <div>
//       <div className="flex gap-2 mb-4">
//         {tabs?.map((num) => (
//           <button
//             key={num}
//             className={`px-4 py-2 border rounded ${
//               activeTab === num ? "bg-blue-500 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setActiveTab(num)}
//           >
//             Tab {num}
//           </button>
//         ))}
//       </div>
//       <div className="p-4 border rounded">{renderComponent()}</div>
//     </div>
//   );
// };

// export default Fees;
