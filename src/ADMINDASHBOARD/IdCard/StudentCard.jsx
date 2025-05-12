import { useCallback, useEffect, useMemo, useState } from "react";
import { getIDcarddesign } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import moment from "moment";

const StudentCard = ({ student }) => {

  const [idCardData, setIdCardData] = useState(null);
  const fetchTemplate = useCallback(async () => {
    try {
      const response = await getIDcarddesign();
      if (response?.success && response?.designFormats?.length > 0) {
        setIdCardData(response.designFormats[0]);
      } else {
        console.warn("No custom ID card design found. Using default.");
        setIdCardData(null);
      }
    } catch (error) {
      console.error("Error fetching ID card design:", error);
      toast.error("Could not load custom ID card template.");
      setIdCardData(null);
    }
  }, []);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const decodeBase64 = useCallback((encoded) => {
    try {
      if (!encoded || typeof encoded !== 'string') return null;
      let cleanEncoded = encoded;
      if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
        cleanEncoded = cleanEncoded.slice(1, -1);
      }
      cleanEncoded = cleanEncoded.replace(/\\"/g, '"');
      const binaryString = window.atob(cleanEncoded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    } catch (error) {
      console.error("Error decoding base64 string:", error, "Input:", encoded);
      return null;
    }
  }, []);

  // 🖼️ Extract background image URL from backend
  const backgroundImageFront = idCardData?.frontImage?.url || "";

  // 🔁 Decode and inject student values into HTML template
  const decodedApiFrontTemplate = useMemo(() => {
    if (!idCardData?.frontTemplate) return null;
    let html = decodeBase64(idCardData.frontTemplate);
    if (!html) return null;

    html = html
      .replace(/\$\{name\}/g, student.studentName || "")
      .replace(/\$\{class\}/g, student.class || "")
      .replace(/\$\{father_name\}/g, student.fatherName || "")
      .replace(/\$\{mobile\}/g, student.contact || "")
      .replace(/\$\{address\}/g, student.address || "")
      .replace(/\$\{dob\}/g,moment( student.dateOfBirth).format("DD-MM-YYYY") || "")
      .replace(/\$\{studentImage\}/g, student.studentImage?.url || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgcIBwgHBwcHBwoICAcHBw8ICQYKFREWFhURExMYHSggGBolGxMTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0NFQ8QDi0ZFRkrKysrKzc3Ky0rKysrLisrKzcrKysrKystKy0tKystKysrKysrKystKysrKysrKysrK//AABEIASsAqAMBEQACEQEDEQH/xAAYAAEBAQEBAAAAAAAAAAAAAAAAAQIDB//EABsQAQEAAwEBAQAAAAAAAAAAAAABAhEhQQMx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAGREBAQEAAwAAAAAAAAAAAAAAAAERAiFB/9oADAMBAAIRAxEAPwD3EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEtRFVQAAAAAAAAAAAAAAAAAAE9QVQAAAAAAAAAAAAAAAAAABlkaaAAAAAAAAAAAAAAAAAEiQVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAACoCgACeoKoAAAAAAAAAAAAAAAAAAAICgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAAAEiQVQAAAAABEQ2KqgAAAAAAAACUFAAAAAABKiJbqUDDqpGhoAAAAAAAAAAAAAAAAAQYzm5pYzWsZqHqxRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEt0gxfpN6Ws7talRpdgqgAAAAAAAAAAAAAAADGe7OEZrnj8+9OVOMzt1s4y0zjLvoOjQAAAAAAAAAAAAAAAAmkwxVAEiQVQAAAAAAAAAAQFAAAAAAEqUSfqDTQAAAAAAAAAAAAAAAAAAlShAVQAAAAB//2Q==")
      .replace(/\$\{backgroundImage\}/g, student.backgroundImage || backgroundImageFront || "");

    return html;
  }, [idCardData, decodeBase64, student, backgroundImageFront]);

  // 🔘 If decoded template exists, render it
  if (decodedApiFrontTemplate) {
    return (
      <div
        // className=" origin-top-left"
        // className="scale-[0.72] origin-top-left"
        dangerouslySetInnerHTML={{ __html: decodedApiFrontTemplate }}
      />
    );
  }


};

export default StudentCard;

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { getIDcarddesign } from "../../Network/AdminApi";
// import { toast } from "react-toastify";

// const StudentCard = ({ student }) => {
//   const [idCardData, setIdCardData] = useState(null);

//   const fetchTemplate = useCallback(async () => {
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         setIdCardData(response.designFormats[0]);
//       } else {
//         console.warn("No custom ID card design found. Using default.");
//         setIdCardData(null);
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design:", error);
//       toast.error("Could not load custom ID card template.");
//       setIdCardData(null);
//     }
//   }, []);

//   useEffect(() => {
//     fetchTemplate();
//   }, [fetchTemplate]);

//   const decodeBase64 = useCallback((encoded) => {
//     try {
//       if (!encoded || typeof encoded !== 'string') return null;
//       let cleanEncoded = encoded;
//       if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
//         cleanEncoded = cleanEncoded.slice(1, -1);
//       }
//       cleanEncoded = cleanEncoded.replace(/\\"/g, '"');
//       const binaryString = window.atob(cleanEncoded);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }
//       const decoder = new TextDecoder('utf-8');
//       return decoder.decode(bytes);
//     } catch (error) {
//       console.error("Error decoding base64 string:", error, "Input:", encoded);
//       return null;
//     }
//   }, []);
// const backgroundImageFront= idCardData?.frontImage?.url || "";
//   const decodedApiFrontTemplate = useMemo(() => {
//     if (!idCardData?.frontTemplate) return null;
//     let html = decodeBase64(idCardData.frontTemplate);
//     if (!html) return null;

//     // Replace placeholders with actual student data
//     html = html
//       .replace(/\$\{name\}/g, student.name || "")
//       .replace(/\$\{class\}/g, student.class || "")
//       .replace(/\$\{father_name\}/g, student.fatherName || "")
//       .replace(/\$\{mobile\}/g, student.phone || "")
//       .replace(/\$\{address\}/g, student.address || "")
//       .replace(/\$\{dob\}/g, student.dob || "")
//       .replace(/\$\{studentImage\}/g, student.photo || "")
//       .replace(/\$\{backgroundImage\}/g, student.backgroundImage || ""); // optional

//     return html;
//   }, [idCardData, decodeBase64, student]);
// console.log("decodedApiFrontTemplate",decodedApiFrontTemplate)
//   // ✅ Conditional Rendering
//   if (decodedApiFrontTemplate) {
//     return (
//       <div
//         className="scale-[0.72] origin-top-left" // adjust scale to fit as needed
//         dangerouslySetInnerHTML={{ __html: decodedApiFrontTemplate }}
//       />
//     );
//   }

//   // 🟨 Default fallback UI
//   // return (
//   //   <div className="w-[204px] h-[325px] relative bg-white border shadow overflow-hidden">
//   //     <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900" />
//   //     <div className="relative z-10 text-center text-white text-xs font-bold p-1 leading-tight">
//   //       <div className="text-sm">B. K. INTERNATIONAL SCHOOL</div>
//   //       <div className="text-[10px] font-normal">
//   //         Pre-Nursery to X<sup>th</sup>, C.B.S.E Curriculum<br />
//   //         Dheeraj Nagar, Faridabad<br />
//   //         Contact: 7669483523, 7873080515
//   //       </div>
//   //     </div>

//   //     <div className="relative z-10 flex justify-between items-start px-2 pt-1">
//   //       <img
//   //         src={student.photo}
//   //         alt="Student"
//   //         className="w-[65px] h-[75px] object-cover rounded border"
//   //       />
//   //       <img
//   //         src="/logo.png"
//   //         alt="School Logo"
//   //         className="w-[45px] h-[45px] object-contain"
//   //       />
//   //     </div>

//   //     <div className="relative z-10 text-[10px] text-white px-2 mt-1 leading-snug">
//   //       <p><strong>NAME:</strong> {student.name}</p>
//   //       <p><strong>CLASS:</strong> {student.class}</p>
//   //       <p><strong>F. Name:</strong> {student.fatherName}</p>
//   //       <p><strong>Phone:</strong> {student.phone}</p>
//   //       <p><strong>Address:</strong> {student.address}</p>
//   //     </div>

//   //     <div className="absolute bottom-1 w-full text-center z-10">
//   //       <span className="text-white text-[10px] font-semibold">PRINCIPAL</span>
//   //     </div>
//   //   </div>
//   // );
// };

// export default StudentCard;





// import { useCallback, useEffect, useMemo, useState } from "react";
// import { getIDcarddesign } from "../../Network/AdminApi";

// const StudentCard = ({ student }) => {
//  const [idCardData, setIdCardData] = useState(null);

//     const fetchTemplate = useCallback(async () => {
//           try {
//               const response = await getIDcarddesign();
//               if (response?.success && response?.designFormats?.length > 0) {
//                   setIdCardData(response.designFormats[0]);
//               } else {
//                   console.warn("No custom ID card design found. Using default.");
//                   setIdCardData(null);
//               }
//           } catch (error) {
//               console.error("Error fetching ID card design:", error);
//               toast.error("Could not load custom ID card template.");
//               setIdCardData(null);
//           }
//       }, []);
//       useEffect(()=>{
// fetchTemplate()
//       },[])
//     const decodeBase64 = useCallback((encoded) => {
//         try {
//             if (!encoded || typeof encoded !== 'string') { return null; }
//             let cleanEncoded = encoded;
//             if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
//                 cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
//             }
//             cleanEncoded = cleanEncoded.replace(/\\"/g, '"');

//             const binaryString = window.atob(cleanEncoded);
//             const bytes = new Uint8Array(binaryString.length);
//             for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//             const decoder = new TextDecoder('utf-8');
//             return decoder.decode(bytes);
//         } catch (error) {
//             console.error("Error decoding base64 string:", error, "Input:", encoded);
//             return null;
//         }
//     }, []);


//         const decodedApiFrontTemplate = useMemo(() => {
//               if (!idCardData?.frontTemplate) return null;
//               return decodeBase64(idCardData.frontTemplate);
//           }, [idCardData, decodeBase64]);

//           console.log("decodedApiFrontTemplate",decodedApiFrontTemplate)
//   return (
//     <div className="w-[204px] h-[325px] relative bg-white border shadow overflow-hidden">
//       {/* Background Layer */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900">
       
//       </div>

 
//       <div className="relative z-10 text-center text-white text-xs font-bold p-1 leading-tight">
//         <div className="text-sm">B. K. INTERNATIONAL SCHOOL</div>
//         <div className="text-[10px] font-normal">
//           Pre-Nursery to X<sup>th</sup>, C.B.S.E Curriculum<br />
//           Dheeraj Nagar, Faridabad<br />
//           Contact: 7669483523, 7873080515
//         </div>
//       </div>

//       {/* Student Photo & Logo Row */}
//       <div className="relative z-10 flex justify-between items-start px-2 pt-1">
//         <img
//           src={student.photo}
//           alt="Student"
//           className="w-[65px] h-[75px] object-cover rounded border"
//         />
//         <img
//           src="/logo.png" // 🔁 Replace with your actual logo URL
//           alt="School Logo"
//           className="w-[45px] h-[45px] object-contain"
//         />
//       </div>

//       {/* Student Details */}
//       <div className="relative z-10 text-[10px] text-white px-2 mt-1 leading-snug">
//         <p><strong>NAME:</strong> {student.name}</p>
//         <p><strong>CLASS:</strong> {student.class}</p>
//         <p><strong>F. Name:</strong> {student.fatherName}</p>
//         <p><strong>Phone:</strong> {student.phone}</p>
//         <p><strong>Address:</strong> {student.address}</p>
//       </div>

//       {/* Bottom Label */}
//       <div className="absolute bottom-1 w-full text-center z-10">
//         <span className="text-white text-[10px] font-semibold">PRINCIPAL</span>
//       </div>
//     </div>
//   );
// };

// export default StudentCard;
// const StudentCard = ({ student }) => {
//   return (
//     <div className="w-[204px] h-[325px] relative bg-white border shadow overflow-hidden">
//       {/* Background Layer */}
//       <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-900">
//         {/* Optional curved design using a background image */}
//         {/* <img src="/card-bg.svg" className="w-full h-full object-cover opacity-90" /> */}
//       </div>

//       {/* School Header */}
//       <div className="relative z-10 text-center text-white text-xs font-bold p-1 leading-tight">
//         <div className="text-sm">B. K. INTERNATIONAL SCHOOL</div>
//         <div className="text-[10px] font-normal">
//           Pre-Nursery to X<sup>th</sup>, C.B.S.E Curriculum<br />
//           Dheeraj Nagar, Faridabad<br />
//           Contact: 7669483523, 7873080515
//         </div>
//       </div>

//       {/* Student Photo & Logo Row */}
//       <div className="relative z-10 flex justify-between items-start px-2 pt-1">
//         <img
//           src={student.photo}
//           alt="Student"
//           className="w-[65px] h-[75px] object-cover rounded border"
//         />
//         <img
//           src="/logo.png" // 🔁 Replace with your actual logo URL
//           alt="School Logo"
//           className="w-[45px] h-[45px] object-contain"
//         />
//       </div>

//       {/* Student Details */}
//       <div className="relative z-10 text-[10px] text-white px-2 mt-1 leading-snug">
//         <p><strong>NAME:</strong> {student.name}</p>
//         <p><strong>CLASS:</strong> {student.class}</p>
//         <p><strong>F. Name:</strong> {student.fatherName}</p>
//         <p><strong>Phone:</strong> {student.phone}</p>
//         <p><strong>Address:</strong> {student.address}</p>
//       </div>

//       {/* Bottom Label */}
//       <div className="absolute bottom-1 w-full text-center z-10">
//         <span className="text-white text-[10px] font-semibold">PRINCIPAL</span>
//       </div>
//     </div>
//   );
// };

// export default StudentCard;




// // components/StudentCard.jsx
// const StudentCard = ({ student }) => {
//   return (
//     <div className="w-[204px] h-[325px] border border-gray-700 rounded p-2 bg-white shadow " >
//       <img
//         src={student.photo}
//         alt="Student"
//         className="w-full h-[50%] object-cover rounded"
//       />
//       <div className="text-xs mt-2 leading-tight">
//         <p><span className="font-semibold">Name:</span> {student.name}</p>
//         <p><span className="font-semibold">Class:</span> {student.class}</p>
//         <p><span className="font-semibold">Roll No:</span> {student.roll}</p>
//         <p><span className="font-semibold">School:</span> {student.school}</p>
//       </div>
//     </div>
//   );
// };

// export default StudentCard;
