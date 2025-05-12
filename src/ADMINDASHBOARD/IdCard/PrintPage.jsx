import StudentCard from "./StudentCard";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import '../../App.css'
import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { toast } from "react-toastify";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import Button from "../../Dynamic/utils/Button";
import { useStateContext } from "../../contexts/ContextProvider";

const PrintPage = () => {
    const { setIsLoader } = useStateContext();
     const session = JSON.parse(localStorage.getItem("session"));
       const [selectedClass, setSelectedClass] = useState("");
         const [selectedSection, setSelectedSection] = useState("");
           const [studentData, setStudentData] = useState([]);
             const [classData, setClassData] = useState([]);
             const [filteredStudentData, setFilteredStudentData] = useState([]);
const [imageFilter, setImageFilter] = useState("all");

  const printRef = useRef();
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

    const fetchAllClasses = useCallback(async () => {
        try {
            const response = await AdminGetAllClasses();
            if (response?.success) {
                setClassData(response.classes || []);
            } else {
                toast.error(response?.message || "Failed to fetch classes.");
                setClassData([]);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
            toast.error("An error occurred while fetching classes.");
            setClassData([]);
        }
    }, []);


   const fetchAllStudents = useCallback(async () => {
          if (!session) {
              toast.error("Session information is missing.");
              setStudentData([]); setFilteredStudentData([]); 
            //   setIsLoadingData(false);
               return;
          }
setIsLoader(true)
          try {
              const response = await ActiveStudents(session);
              if (response?.success && response.students?.data) {
                  setStudentData(response.students.data || []);
              } else {
                  toast.error(response?.message || "Failed to fetch students or data format incorrect.");
                  setStudentData([]);
                  
              }
          } catch (error) {
              console.error("Error fetching students:", error);
              toast.error("An error occurred while fetching students.");
              setStudentData([]);

          } finally {
            //   setIsLoadingData(false);
            setIsLoader(false)
          }
      }, [session]);
      useEffect(()=>{
fetchAllStudents()
fetchAllClasses()
      },[])

       const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
          const sectionOptions = useMemo(() => {
              const selectedClassObj = classData.find(cls => cls.className === selectedClass);
              return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
          }, [classData, selectedClass]);
       useEffect(() => {
              
      
              let filtered = studentData;
              if (selectedClass) {
                  filtered = filtered.filter(s => s.class === selectedClass);
              }
              if (selectedSection) {
                  filtered = filtered.filter(s => (s.section || null) === selectedSection);
              }
               if (imageFilter === "with") {
    filtered = filtered.filter(s => !!s.studentImage?.url ); // Assuming 'photo' is the image field
  } else if (imageFilter === "without") {
    filtered = filtered.filter(s => !s.studentImage?.url );
  }

  setFilteredStudentData(filtered);
              setFilteredStudentData(filtered);
          }, [selectedClass, selectedSection, studentData,imageFilter]);

 const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
        setSelectedSection("");
    };
    const handleSectionChange = (e) => setSelectedSection(e.target.value);

  // Break students into chunks of 10
  const chunkedStudents = [];
  for (let i = 0; i < filteredStudentData.length; i += 10) {
    chunkedStudents.push(filteredStudentData.slice(i, i + 10));
  }

  return (
   <>
        <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID CARD" />
    <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2">
 <ReactSelect
                                    name="class"
                                    value={selectedClass}
                                    handleChange={handleClassChange}
                                    label="Class"
                                    dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
                                    placeholder="Select Class"
                                    // isDisabled={isLoadingData}
                                />
                           
                                <ReactSelect
                                    name="section"
                                    value={selectedSection}
                                    handleChange={handleSectionChange}
                                    label="Section"
                                    dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
                                    disabled={!selectedClass || sectionOptions.length === 0 }
                                    placeholder="Select Section"
                                />
                                <ReactSelect
  name="imageFilter"
  value={imageFilter}
  handleChange={(e) => setImageFilter(e.target.value)}
  label="Image Filter"
  dynamicOptions={[
    { label: "All Students", value: "all" },
    { label: "With Image", value: "with" },
    { label: "Without Image", value: "without" },
  ]}
  placeholder="Select Image Filter"
/>

<Button name="Print" color="green" onClick={handlePrint} />
<span>{filteredStudentData?.length}</span>

                                 
    </div>
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-6">

       
     

      <div ref={printRef}>
        {chunkedStudents.map((group, pageIndex) => (
          <div
            key={pageIndex}
            className="print-page w-[1123px] h-[794px] bg-white grid grid-cols-5 gap-x-2 p-5"
            //  className={`print-page w-[1123px] h-[794px] grid grid-cols-5 gap-x-2 p-5 ${pageIndex !== chunkedStudents.length - 1 ? 'break-after-page' : ''}`}
          >
            {group.map((student, index) => (
                 <div className="student-card" key={index}>
      <StudentCard student={student} />
    </div>
            //   <StudentCard key={index} student={student} />
            ))}
          </div>
        ))}
      </div>
    </div>
   </>
  );
};

export default PrintPage;

// import StudentCard from "./StudentCard";
// import React, { useRef } from "react";
// import '../../App.css'
// const PrintPage = () => {

//   const printRef = useRef();

//   const handlePrint = () => {
//     const printContents = printRef.current.innerHTML;
//     const originalContents = document.body.innerHTML;

//     document.body.innerHTML = printContents;
//     window.print();
//     document.body.innerHTML = originalContents;
//     window.location.reload(); // optional: reload page after print
//   };



//     const students = [
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   {
//     name: "Kajal Kumari",
//     class: "I-A",
//     fatherName: "Raj",
//     phone: "+919333333333",
//     address: "Delhi",
//     photo: "/students/kajal.jpg",
//   },
//   // ...9 more
// ];

//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen py-6">
//       <button
//         // onClick={() => window.print()}
//          onClick={handlePrint}
//         className="mb-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 print:hidden"
//       >
//         Print ID Cards
//       </button>
// <div 
//  ref={printRef}
// // className="print-page bg-white p-2 grid grid-cols-5 gap-x-2 gap-y-[4px]"
// className="print-page w-[1123px] h-[794px] bg-white flexcard grid grid-cols-5 gap-x-2 gap-y-[4px] p-5"
// >
//     {students.map((student, index) => (
//       <StudentCard key={index} student={student} />
//     ))}
//   </div>
//       {/* <div className="w-[1123px] h-[794px] bg-white p-2 grid grid-cols-5 gap-x-2 gap-y-[4px] print:block print:bg-white">
//         {students.map((student, index) => (
//           <StudentCard key={index} student={student} />
//         ))}
//       </div> */}
//     </div>
//   );
// };

// export default PrintPage;





// // pages/PrintPage.jsx
// import StudentCard from "./StudentCard";

// const students = Array.from({ length: 10 }, (_, i) => ({
//   name: `Student ${i + 1}`,
//   class: "10th",
//   roll: `R-${i + 1}`,
//   school: "ABC Public School",
//   photo: "https://via.placeholder.com/150",
// }));

// const PrintPage = () => {
//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen py-6">
//       {/* 🖨️ Print Button */}
//       <button
//         onClick={() => window.print()}
//         className="mb-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 print:hidden"
//       >
//         Print ID Cards
//       </button>

//       {/* 📄 A4 Printable Area */}
//       {/* <div className="w-[794px] h-[1123px] bg-white p-4 grid grid-cols-2 gap-4 print:bg-white print:block ">
//         {students.map((student, index) => (
//           <StudentCard key={index} student={student} />
//         ))}
//       </div> */}
//        <div className="w-[794px] h-[1123px] bg-white p-4 grid grid-cols-2 gap-x-4 gap-y-[4px] print:bg-white print:block">
//     {students.map((student, index) => (
//       <StudentCard key={index} student={student} />
//     ))}
//   </div>
//     </div>
//   );
// };

// export default PrintPage;






// // pages/PrintPage.jsx
// import StudentCard from "@/components/StudentCard";

// const students = Array.from({ length: 10 }, (_, i) => ({
//   name: `Student ${i + 1}`,
//   class: "10th",
//   roll: `R-${i + 1}`,
//   school: "ABC Public School",
//   photo: "https://via.placeholder.com/150", // Replace with real photo or base64
// }));

// const PrintPage = () => {
//   return (
//     <div className="w-[794px] h-[1123px] bg-white p-4 grid grid-cols-2 gap-4 mx-auto print:block print:bg-white">
//       {students.map((student, index) => (
//         <StudentCard key={index} student={student} />
//       ))}
//     </div>
//   );
// };

// export default PrintPage;
