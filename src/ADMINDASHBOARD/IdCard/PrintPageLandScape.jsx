// PrintPageLandScape.js
import StudentCardFront from "./StudentCardFront";
import StudentCardBack from "./StudentCardBack";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import '../../App.css'; // Ensure this exists and doesn't conflict heavily
import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { toast } from "react-toastify";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import Button from "../../Dynamic/utils/Button";
import { useStateContext } from "../../contexts/ContextProvider";

const PrintPageLandScape = () => {
  const { setIsLoader } = useStateContext();
  const session = JSON.parse(localStorage.getItem("session"));
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [filteredStudentData, setFilteredStudentData] = useState([]);
  const [imageFilter, setImageFilter] = useState("all");

  const [idCardDesign, setIdCardDesign] = useState(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [selectedTemplateView, setSelectedTemplateView] = useState("front");

  const printRef = useRef();

  const handlePrint = () => {
    // ... (handlePrint logic - unchanged from previous version) ...
    if (!idCardDesign) {
      toast.warn("ID card template is not loaded yet. Please wait.");
      return;
    }
    if (filteredStudentData.length === 0) {
      toast.info("No students to print.");
      return;
    }

    const printContainerNode = printRef.current;
    if (!printContainerNode) {
      toast.error("Printable content not found.");
      return;
    }

    const criticalPrintCSS = `
      body { /* Styles for the iframe body */
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .print-page-landscape { /* Each sheet of paper - A4 Portrait */
        width: 210mm; 
        min-height: 297mm; 
        padding: 5mm;
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(2, 1fr); /* 2 cards across */
        grid-auto-rows: 54mm; /* Each card row height */
        gap: 5mm; 
        page-break-after: always; 
      }

      .student-card-landscape { /* Container for ONE student's card */
        width: 85.6mm;  /* CR80 card width */
        height: 54mm;   /* CR80 card height (for one side) */
        border: 0.2mm solid #eee; 
        overflow: hidden; 
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important;
        display: flex; 
        flex-direction: column; 
      }

      .student-card-landscape > div:not(.both-wrapper) {
        width: 100% !important; height: 100% !important; box-sizing: border-box !important; overflow: hidden !important; 
      }
      .student-card-landscape > div:not(.both-wrapper) > * { 
        width: 100% !important; height: 100% !important; box-sizing: border-box !important; overflow: hidden !important; 
      }

      .student-card-landscape > .both-wrapper { 
        width: 100%; height: 100%; display: flex; flex-direction: column; gap: 0mm; box-sizing: border-box; overflow: hidden;
      }
      .student-card-landscape > .both-wrapper > div { 
        width: 100% !important; flex: 1; min-height: 0; box-sizing: border-box !important; overflow: hidden !important;
      }
      .student-card-landscape > .both-wrapper > div > * { 
        width: 100% !important; height: 100% !important; box-sizing: border-box !important; overflow: hidden !important; 
      }

      img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }

      @page { size: A4 portrait; margin: 0mm; }
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0'; 
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden'; 
    iframe.style.overflow = 'hidden';  
    iframe.setAttribute('title', 'Print Content');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Print ID Cards</title>
          <style type="text/css">
            ${criticalPrintCSS}
          </style>
        </head>
        <body>
          ${printContainerNode.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus(); 

    setTimeout(() => {
      try {
        const printed = iframe.contentWindow.document.execCommand('print', false, null);
        if (!printed) { 
          iframe.contentWindow.print();
        }
      } catch (e) { 
        console.error("Error using execCommand('print'):", e);
        iframe.contentWindow.print();
      } finally {
         setTimeout(() => { if (iframe.parentNode) { iframe.parentNode.removeChild(iframe); }}, 3000);
      }
    }, 500);
  };

  const fetchIdCardTemplate = useCallback(async () => {
    // ... (fetchIdCardTemplate logic - unchanged)
    setIsLoadingTemplate(true);
    try {
      const response = await getIDcarddesign();
      if (response?.success && response?.designFormats?.length > 0) {
        setIdCardDesign(response.designFormats[0]);
      } else {
        toast.warn("No custom ID card template found.");
        setIdCardDesign(null);
      }
    } catch (error) {
      toast.error("Could not load custom ID card template.");
      setIdCardDesign(null);
    } finally {
      setIsLoadingTemplate(false);
    }
  }, [setIsLoadingTemplate]);

  const fetchAllClasses = useCallback(async () => {
    // ... (fetchAllClasses logic - unchanged)
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
    // ... (fetchAllStudents logic - unchanged)
    if (!session) {
      toast.error("Session information is missing.");
      setStudentData([]);
      setFilteredStudentData([]);
      return;
    }
    setIsLoader(true);
    try {
      const response = await ActiveStudents(session);
      if (response?.success && response.students?.data) {
        setStudentData(response.students.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch students.");
        setStudentData([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("An error occurred while fetching students.");
      setStudentData([]);
    } finally {
      setIsLoader(false);
    }
  }, [session, setIsLoader]);

  useEffect(() => {
    fetchIdCardTemplate();
    fetchAllStudents();
    fetchAllClasses();
  }, [fetchIdCardTemplate, fetchAllStudents, fetchAllClasses]);

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
      filtered = filtered.filter(s => !!s.studentImage?.url);
    } else if (imageFilter === "without") {
      filtered = filtered.filter(s => !s.studentImage?.url);
    }
    setFilteredStudentData(filtered);
  }, [selectedClass, selectedSection, studentData, imageFilter]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedSection("");
  };
  const handleSectionChange = (e) => setSelectedSection(e.target.value);
  const handleTemplateViewChange = (e) => setSelectedTemplateView(e.target.value);

  const cardsPerPageForPrint = 10; 
  const chunkedStudentsForPrint = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < filteredStudentData.length; i += cardsPerPageForPrint) {
      chunks.push(filteredStudentData.slice(i, i + cardsPerPageForPrint));
    }
    return chunks;
  }, [filteredStudentData, cardsPerPageForPrint]);

  const templateViewOptions = [
    { label: "Front Template", value: "front" },
    { label: "Back Template", value: "back" },
    { label: "Both Templates", value: "both" },
  ];

  return (
    <>
      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID CARD PORTRAIT PRINT " />
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-4 items-end mb-4">
        {/* ... (Filter ReactSelect components - unchanged) ... */}
         <ReactSelect
          name="class"
          value={selectedClass}
          handleChange={handleClassChange}
          label="Class"
          dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
          placeholder="Select Class"
        />
        <ReactSelect
          name="section"
          value={selectedSection}
          handleChange={handleSectionChange}
          label="Section"
          dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
          disabled={!selectedClass || sectionOptions.length === 0}
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
          placeholder="Filter by Image"
        />
        <ReactSelect
          name="templateView"
          value={selectedTemplateView}
          handleChange={handleTemplateViewChange}
          label="Template View"
          dynamicOptions={templateViewOptions}
          placeholder="Select View"
        />
        
        <Button 
            name="Print ID Cards" 
            color="green" 
            onClick={handlePrint} 
            disabled={isLoadingTemplate || !idCardDesign || filteredStudentData.length === 0}
        />
        <div className="text-sm text-gray-700">
            {filteredStudentData?.length} Students selected.
            {isLoadingTemplate && <span className="ml-2 text-orange-500">Loading Template...</span>}
            {!isLoadingTemplate && !idCardDesign && <span className="ml-2 text-red-500">Template not found!</span>}
        </div>
      </div>

      {/* HIDDEN PRINT AREA - Content for the iframe, visually hidden but in DOM */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none', overflow: 'hidden', width: '1px', height: '1px' }}>
        <div ref={printRef}>
          {chunkedStudentsForPrint.map((group, pageIndex) => (
            <div
              key={`print-page-${pageIndex}`}
              className="print-page-landscape" 
            >
              {group.map((student) => (
                <div
                  className="student-card-landscape" 
                  key={`print-card-${student.admissionNumber || student._id || Math.random()}`}
                >
                  {selectedTemplateView === "front" && idCardDesign && (
                    <StudentCardFront student={student} idCardTemplate={idCardDesign} />
                  )}
                  {selectedTemplateView === "back" && idCardDesign && (
                    <StudentCardBack student={student} idCardTemplate={idCardDesign} />
                  )}
                  {selectedTemplateView === "both" && idCardDesign && (
                    <div className="both-wrapper"> 
                      <StudentCardFront student={student} idCardTemplate={idCardDesign} />
                      <StudentCardBack student={student} idCardTemplate={idCardDesign} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* VISIBLE UI PREVIEW AREA - NOW SHOWS ALL FILTERED CARDS */}
      {!isLoadingTemplate && idCardDesign && filteredStudentData.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
        
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2">
            {/* MODIFIED: Map through all filteredStudentData for preview */}
            {filteredStudentData.map((student) => ( 
               <div
                className="shadow-xl rounded-lg overflow-hidden border border-gray-300 bg-white transform transition-all hover:scale-105"
                // style={{ width: '214px', height: '135px' }} 
                key={`preview-${student.admissionNumber || student._id}`}
              >
                <div className="w-full h-full"> 
                  {selectedTemplateView === "front" && <StudentCardFront student={student} idCardTemplate={idCardDesign} />}
                  {selectedTemplateView === "back" && <StudentCardBack student={student} idCardTemplate={idCardDesign} />}
                  {selectedTemplateView === "both" && (
                    <div className="flex flex-col h-full"> 
                       <div className="flex-1 overflow-hidden border-b border-gray-200"> 
                         <StudentCardFront student={student} idCardTemplate={idCardDesign} />
                       </div>
                       <div className="flex-1 overflow-hidden">
                         <StudentCardBack student={student} idCardTemplate={idCardDesign} />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
       {!isLoadingTemplate && idCardDesign && filteredStudentData.length === 0 && (
        <div className="mt-6 p-6 border rounded-lg bg-gray-50 text-center text-gray-700">
          <p className="text-lg">No students match the current filter criteria to preview or print.</p>
        </div>
      )}
      {!isLoadingTemplate && !idCardDesign && (
         <div className="mt-6 p-6 border rounded-lg bg-red-50 text-center text-red-700">
          <p className="text-lg font-semibold">ID Card Template Not Loaded!</p>
          <p>Cannot display preview or print ID cards.</p>
        </div>
      )}
    </>
  );
};

export default PrintPageLandScape;

// // PrintPage.js
// import StudentCardFront from "./StudentCardFront"; // Assuming it's in the same folder or adjust path
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import '../../App.css';
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Added getIDcarddesign
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import Button from "../../Dynamic/utils/Button";
// import { useStateContext } from "../../contexts/ContextProvider";
// import StudentCardBack from "./StudentCardBack";

// const PrintPageLandScape = () => {
//   const { setIsLoader } = useStateContext();
//   const session = JSON.parse(localStorage.getItem("session"));
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [imageFilter, setImageFilter] = useState("all");

//   const [idCardDesign, setIdCardDesign] = useState(null); // State for the fetched ID card design
//   const [isLoadingTemplate, setIsLoadingTemplate] = useState(true); // Loading state for template

//   // New state for selecting template view (front, back, or both)
//   const [selectedTemplateView, setSelectedTemplateView] = useState("front"); // Default to "back"

//   const printRef = useRef();

//   const handlePrint = () => {
//     if (!idCardDesign) {
//       toast.warn("ID card template is not loaded yet. Please wait.");
//       return;
//     }
//     if (filteredStudentData.length === 0) {
//       toast.info("No students to print.");
//       return;
//     }
//     const printContents = printRef.current.innerHTML;
//     const originalContents = document.body.innerHTML;
//     document.body.innerHTML = printContents;
//     window.print();
//     document.body.innerHTML = originalContents;
//     window.location.reload(); // Consider if reload is always necessary or if state can be reset
//   };

//   const fetchIdCardTemplate = useCallback(async () => {
//     setIsLoadingTemplate(true);
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         setIdCardDesign(response.designFormats[0]);
//         toast.success("ID card template loaded.");
//       } else {
//         console.warn("No custom ID card design found. Using default or none.");
//         toast.warn("No custom ID card template found.");
//         setIdCardDesign(null); // Ensure it's null if not found
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design:", error);
//       toast.error("Could not load custom ID card template.");
//       setIdCardDesign(null);
//     } finally {
//       setIsLoadingTemplate(false);
//     }
//   }, []);

//   const fetchAllClasses = useCallback(async () => {
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//         setClassData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("An error occurred while fetching classes.");
//       setClassData([]);
//     }
//   }, []);

//   const fetchAllStudents = useCallback(async () => {
//     if (!session) {
//       toast.error("Session information is missing.");
//       setStudentData([]);
//       setFilteredStudentData([]);
//       return;
//     }
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success && response.students?.data) {
//         setStudentData(response.students.data || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//         setStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//       setStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [session, setIsLoader]);

//   useEffect(() => {
//     fetchIdCardTemplate();
//     fetchAllStudents();
//     fetchAllClasses();
//   }, [fetchIdCardTemplate, fetchAllStudents, fetchAllClasses]);

//   const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//   const sectionOptions = useMemo(() => {
//     const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//     return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//   }, [classData, selectedClass]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(s => s.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter(s => (s.section || null) === selectedSection);
//     }
//     if (imageFilter === "with") {
//       filtered = filtered.filter(s => !!s.studentImage?.url);
//     } else if (imageFilter === "without") {
//       filtered = filtered.filter(s => !s.studentImage?.url);
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, studentData, imageFilter]);

//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);
//   const handleTemplateViewChange = (e) => setSelectedTemplateView(e.target.value);

//   const chunkedStudents = useMemo(() => {
//     const chunks = [];
//     for (let i = 0; i < filteredStudentData.length; i += 10) {
//       chunks.push(filteredStudentData.slice(i, i + 10));
//     }
//     return chunks;
//   }, [filteredStudentData]);

//   const templateViewOptions = [
//     { label: "Front Template", value: "front" },
//     { label: "Back Template", value: "back" },
//     { label: "Both Templates", value: "both" },
//   ];

//   return (
//     <>
//       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID CARD" />
//       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2">
//         <ReactSelect
//           name="class"
//           value={selectedClass}
//           handleChange={handleClassChange}
//           label="Class"
//           dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//           placeholder="Select Class"
//         />
//         <ReactSelect
//           name="section"
//           value={selectedSection}
//           handleChange={handleSectionChange}
//           label="Section"
//           dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//           disabled={!selectedClass || sectionOptions.length === 0}
//           placeholder="Select Section"
//         />
//         <ReactSelect
//           name="imageFilter"
//           value={imageFilter}
//           handleChange={(e) => setImageFilter(e.target.value)}
//           label="Image Filter"
//           dynamicOptions={[
//             { label: "All Students", value: "all" },
//             { label: "With Image", value: "with" },
//             { label: "Without Image", value: "without" },
//           ]}
//           placeholder="Select Image Filter"
//         />
//         {/* New Dropdown for Template View */}
//         <ReactSelect
//           name="templateView"
//           value={selectedTemplateView}
//           handleChange={handleTemplateViewChange}
//           label="Template View"
//           dynamicOptions={templateViewOptions}
//           placeholder="Select Template View"
//         />
        
//         <Button 
//             name="Print" 
//             color="green" 
//             onClick={handlePrint} 
//             disabled={isLoadingTemplate || !idCardDesign || filteredStudentData.length === 0}
//         />
//         <span>{filteredStudentData?.length} Students</span>
//         {isLoadingTemplate && <span className="ml-2 text-sm text-gray-500">Loading ID Card Template...</span>}
//         {!isLoadingTemplate && !idCardDesign && <span className="ml-2 text-sm text-red-500">ID Card Template not found.</span>}
//       </div>

//       <div className="flex flex-col items-center bg-gray-100 min-h-screen py-6">
//         <div ref={printRef}>
//           {isLoadingTemplate ? (
//             <p>Loading ID card template...</p>
//           ) : !idCardDesign ? (
//             <p>Cannot display ID cards: Template not available.</p>
//           ) : chunkedStudents.length === 0 && !isLoadingTemplate ? (
//              <p>No students match the current filter criteria.</p>
//           ) : (
//             chunkedStudents.map((group, pageIndex) => (
//               <div
//                 key={pageIndex}
//                 className="print-page-landscape w-[794px] h-[1123px] bg-white grid grid-cols-2 gap-x-2 p-5" // Consider grid-rows-2 if fixed 10 per page
//                 // className="print-page w-[1123px] h-[794px] bg-white grid grid-cols-5 gap-x-2 p-5" // Consider grid-rows-2 if fixed 10 per page
//               >
//                 {group.map((student) => (
//                   <div className="student-card-landscape flex flex-col" key={student.admissionNumber || student._id || Math.random()}>
//                     {selectedTemplateView === "front" && idCardDesign && (
//                       <StudentCardFront student={student} idCardTemplate={idCardDesign} />
//                     )}
//                     {selectedTemplateView === "back" && idCardDesign && (
//                       <StudentCardBack student={student} idCardTemplate={idCardDesign} />
//                     )}
//                     {selectedTemplateView === "both" && idCardDesign && (
//                       // MODIFIED LINE: Added flex flex-col to make gap-2 work
//                       <div className="flex flex-col gap-2"> 
//                         <StudentCardFront student={student} idCardTemplate={idCardDesign} />
//                         <StudentCardBack student={student} idCardTemplate={idCardDesign} />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PrintPageLandScape;






// // PrintPage.js
// import StudentCardFront from "./StudentCardFront"; // Assuming it's in the same folder or adjust path
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import '../../App.css';
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Added getIDcarddesign
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import Button from "../../Dynamic/utils/Button";
// import { useStateContext } from "../../contexts/ContextProvider";
// import moment from "moment"; // moment is used in StudentCardFront, ensure it's available or pass formatted date
// import StudentCardBack from "./StudentCardBack";

// const PrintPage = () => {
//   const { setIsLoader } = useStateContext();
//   const session = JSON.parse(localStorage.getItem("session"));
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [imageFilter, setImageFilter] = useState("all");

//   const [idCardDesign, setIdCardDesign] = useState(null); // State for the fetched ID card design
//   const [isLoadingTemplate, setIsLoadingTemplate] = useState(true); // Loading state for template

//   // New state for selecting template view (front, back, or both)
//   const [selectedTemplateView, setSelectedTemplateView] = useState("back"); // Default to "back"

//   const printRef = useRef();

//   const handlePrint = () => {
//     if (!idCardDesign) {
//       toast.warn("ID card template is not loaded yet. Please wait.");
//       return;
//     }
//     if (filteredStudentData.length === 0) {
//       toast.info("No students to print.");
//       return;
//     }
//     const printContents = printRef.current.innerHTML;
//     const originalContents = document.body.innerHTML;
//     document.body.innerHTML = printContents;
//     window.print();
//     document.body.innerHTML = originalContents;
//     window.location.reload(); // Consider if reload is always necessary or if state can be reset
//   };

//   const fetchIdCardTemplate = useCallback(async () => {
//     setIsLoadingTemplate(true);
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         setIdCardDesign(response.designFormats[0]);
//         toast.success("ID card template loaded.");
//       } else {
//         console.warn("No custom ID card design found. Using default or none.");
//         toast.warn("No custom ID card template found.");
//         setIdCardDesign(null); // Ensure it's null if not found
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design:", error);
//       toast.error("Could not load custom ID card template.");
//       setIdCardDesign(null);
//     } finally {
//       setIsLoadingTemplate(false);
//     }
//   }, []);

//   const fetchAllClasses = useCallback(async () => {
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//         setClassData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("An error occurred while fetching classes.");
//       setClassData([]);
//     }
//   }, []);

//   const fetchAllStudents = useCallback(async () => {
//     if (!session) {
//       toast.error("Session information is missing.");
//       setStudentData([]);
//       setFilteredStudentData([]);
//       return;
//     }
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success && response.students?.data) {
//         setStudentData(response.students.data || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//         setStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//       setStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [session, setIsLoader]);

//   useEffect(() => {
//     fetchIdCardTemplate();
//     fetchAllStudents();
//     fetchAllClasses();
//   }, [fetchIdCardTemplate, fetchAllStudents, fetchAllClasses]);

//   const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//   const sectionOptions = useMemo(() => {
//     const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//     return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//   }, [classData, selectedClass]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(s => s.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter(s => (s.section || null) === selectedSection);
//     }
//     if (imageFilter === "with") {
//       filtered = filtered.filter(s => !!s.studentImage?.url);
//     } else if (imageFilter === "without") {
//       filtered = filtered.filter(s => !s.studentImage?.url);
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, studentData, imageFilter]);

//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);
//   const handleTemplateViewChange = (e) => setSelectedTemplateView(e.target.value);

//   const chunkedStudents = useMemo(() => {
//     const chunks = [];
//     for (let i = 0; i < filteredStudentData.length; i += 10) {
//       chunks.push(filteredStudentData.slice(i, i + 10));
//     }
//     return chunks;
//   }, [filteredStudentData]);

//   const templateViewOptions = [
//     { label: "Front Template", value: "front" },
//     { label: "Back Template", value: "back" },
//     { label: "Both Templates", value: "both" },
//   ];

//   return (
//     <>
//       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID CARD" />
//       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2">
//         <ReactSelect
//           name="class"
//           value={selectedClass}
//           handleChange={handleClassChange}
//           label="Class"
//           dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//           placeholder="Select Class"
//         />
//         <ReactSelect
//           name="section"
//           value={selectedSection}
//           handleChange={handleSectionChange}
//           label="Section"
//           dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//           disabled={!selectedClass || sectionOptions.length === 0}
//           placeholder="Select Section"
//         />
//         <ReactSelect
//           name="imageFilter"
//           value={imageFilter}
//           handleChange={(e) => setImageFilter(e.target.value)}
//           label="Image Filter"
//           dynamicOptions={[
//             { label: "All Students", value: "all" },
//             { label: "With Image", value: "with" },
//             { label: "Without Image", value: "without" },
//           ]}
//           placeholder="Select Image Filter"
//         />
//         {/* New Dropdown for Template View */}
//         <ReactSelect
//           name="templateView"
//           value={selectedTemplateView}
//           handleChange={handleTemplateViewChange}
//           label="Template View"
//           dynamicOptions={templateViewOptions}
//           placeholder="Select Template View"
//         />
        
//         <Button 
//             name="Print" 
//             color="green" 
//             onClick={handlePrint} 
//             disabled={isLoadingTemplate || !idCardDesign || filteredStudentData.length === 0}
//         />
//         <span>{filteredStudentData?.length} Students</span>
//         {isLoadingTemplate && <span className="ml-2 text-sm text-gray-500">Loading ID Card Template...</span>}
//         {!isLoadingTemplate && !idCardDesign && <span className="ml-2 text-sm text-red-500">ID Card Template not found.</span>}
//       </div>

//       <div className="flex flex-col items-center bg-gray-100 min-h-screen py-6">
//         <div ref={printRef}>
//           {isLoadingTemplate ? (
//             <p>Loading ID card template...</p>
//           ) : !idCardDesign ? (
//             <p>Cannot display ID cards: Template not available.</p>
//           ) : chunkedStudents.length === 0 && !isLoadingTemplate ? (
//              <p>No students match the current filter criteria.</p>
//           ) : (
//             chunkedStudents.map((group, pageIndex) => (
//               <div
//                 key={pageIndex}
//                 className="print-page w-[1123px] h-[794px] bg-white grid grid-cols-5 gap-x-2 p-5" // Consider grid-rows-2 if fixed 10 per page
//               >
//                 {group.map((student) => (
//                   <div className="student-card flex flex-col" key={student.admissionNumber || student._id || Math.random()}> {/* Added flex flex-col for "both" case */}
//                     {selectedTemplateView === "front" && idCardDesign && (
//                       <StudentCardFront student={student} idCardTemplate={idCardDesign} />
//                     )}
//                     {selectedTemplateView === "back" && idCardDesign && (
//                       <StudentCardBack student={student} idCardTemplate={idCardDesign} />
//                     )}
//                     {selectedTemplateView === "both" && idCardDesign && (
//                       <div className="gap-2">
//                         <StudentCardFront student={student} idCardTemplate={idCardDesign} />
//                         <StudentCardBack student={student} idCardTemplate={idCardDesign} />
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PrintPage;


// // PrintPage.js
// import StudentCardFront from "./StudentCardFront"; // Assuming it's in the same folder or adjust path
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import '../../App.css';
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Added getIDcarddesign
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import Button from "../../Dynamic/utils/Button";
// import { useStateContext } from "../../contexts/ContextProvider";
// import moment from "moment"; // moment is used in StudentCardFront, ensure it's available or pass formatted date
// import StudentCardBack from "./StudentCardBack";

// const PrintPage = () => {
//   const { setIsLoader } = useStateContext();
//   const session = JSON.parse(localStorage.getItem("session"));
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [imageFilter, setImageFilter] = useState("all");

//   const [idCardDesign, setIdCardDesign] = useState(null); // State for the fetched ID card design
//   const [isLoadingTemplate, setIsLoadingTemplate] = useState(true); // Loading state for template

//   const printRef = useRef();

//   const handlePrint = () => {
//     if (!idCardDesign) {
//       toast.warn("ID card template is not loaded yet. Please wait.");
//       return;
//     }
//     if (filteredStudentData.length === 0) {
//       toast.info("No students to print.");
//       return;
//     }
//     const printContents = printRef.current.innerHTML;
//     const originalContents = document.body.innerHTML;
//     document.body.innerHTML = printContents;
//     window.print();
//     document.body.innerHTML = originalContents;
//     window.location.reload(); // Consider if reload is always necessary or if state can be reset
//   };

//   const fetchIdCardTemplate = useCallback(async () => {
//     setIsLoadingTemplate(true);
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         setIdCardDesign(response.designFormats[0]);
//         toast.success("ID card template loaded.");
//       } else {
//         console.warn("No custom ID card design found. Using default or none.");
//         toast.warn("No custom ID card template found.");
//         setIdCardDesign(null); // Ensure it's null if not found
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design:", error);
//       toast.error("Could not load custom ID card template.");
//       setIdCardDesign(null);
//     } finally {
//       setIsLoadingTemplate(false);
//     }
//   }, []);

//   const fetchAllClasses = useCallback(async () => {
//     // ... (your existing fetchAllClasses logic)
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//         setClassData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("An error occurred while fetching classes.");
//       setClassData([]);
//     }
//   }, []);

//   const fetchAllStudents = useCallback(async () => {
//     if (!session) {
//       toast.error("Session information is missing.");
//       setStudentData([]); 
//       setFilteredStudentData([]);
//       return;
//     }
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success && response.students?.data) {
//         setStudentData(response.students.data || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//         setStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//       setStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [session, setIsLoader]); // Added setIsLoader dependency

//   useEffect(() => {
//     fetchIdCardTemplate(); // Fetch template on mount
//     fetchAllStudents();
//     fetchAllClasses();
//   }, [fetchIdCardTemplate, fetchAllStudents, fetchAllClasses]); // Added fetchIdCardTemplate

//   const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//   const sectionOptions = useMemo(() => {
//     const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//     return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//   }, [classData, selectedClass]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(s => s.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter(s => (s.section || null) === selectedSection);
//     }
//     if (imageFilter === "with") {
//       filtered = filtered.filter(s => !!s.studentImage?.url);
//     } else if (imageFilter === "without") {
//       filtered = filtered.filter(s => !s.studentImage?.url);
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, studentData, imageFilter]);

//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   const chunkedStudents = useMemo(() => {
//     const chunks = [];
//     for (let i = 0; i < filteredStudentData.length; i += 10) {
//       chunks.push(filteredStudentData.slice(i, i + 10));
//     }
//     return chunks;
//   }, [filteredStudentData]);

//   return (
//     <>
//       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID CARD" />
//       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2">
//         <ReactSelect
//           name="class"
//           value={selectedClass}
//           handleChange={handleClassChange}
//           label="Class"
//           dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//           placeholder="Select Class"
//         />
//         <ReactSelect
//           name="section"
//           value={selectedSection}
//           handleChange={handleSectionChange}
//           label="Section"
//           dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//           disabled={!selectedClass || sectionOptions.length === 0}
//           placeholder="Select Section"
//         />
//         <ReactSelect
//           name="imageFilter"
//           value={imageFilter}
//           handleChange={(e) => setImageFilter(e.target.value)}
//           label="Image Filter"
//           dynamicOptions={[
//             { label: "All Students", value: "all" },
//             { label: "With Image", value: "with" },
//             { label: "Without Image", value: "without" },
//           ]}
//           placeholder="Select Image Filter"
//         />

//         <Button 
//             name="Print" 
//             color="green" 
//             onClick={handlePrint} 
//             disabled={isLoadingTemplate || !idCardDesign || filteredStudentData.length === 0} // Disable print if template loading/not loaded or no students
//         />
//         <span>{filteredStudentData?.length} Students</span>
//         {isLoadingTemplate && <span className="ml-2 text-sm text-gray-500">Loading ID Card Template...</span>}
//         {!isLoadingTemplate && !idCardDesign && <span className="ml-2 text-sm text-red-500">ID Card Template not found.</span>}
//       </div>

//       <div className="flex flex-col items-center bg-gray-100 min-h-screen py-6">
//         <div ref={printRef}>
//           {isLoadingTemplate ? (
//             <p>Loading ID card template...</p>
//           ) : !idCardDesign ? (
//             <p>Cannot display ID cards: Template not available.</p>
//           ) : chunkedStudents.length === 0 && !isLoadingTemplate ? (
//              <p>No students match the current filter criteria.</p>
//           ) : (
//             chunkedStudents.map((group, pageIndex) => (
//               <div
//                 key={pageIndex}
//                 className="print-page w-[1123px] h-[794px] bg-white grid grid-cols-5 gap-x-2 p-5"
//               >
//                 {group.map((student) => ( // Removed index from key as student.admissionNumber or another unique ID is better if available
//                   <div className="student-card" key={student.admissionNumber || student._id || Math.random()}> {/* Use a more stable key */}
//                     <StudentCardBack student={student} idCardTemplate={idCardDesign} />
//                     {/* <StudentCardFront student={student} idCardTemplate={idCardDesign} /> */}
//                   </div>
//                 ))}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PrintPage;





// import StudentCardFront from "./StudentCardFront";
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import '../../App.css'
// import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import Button from "../../Dynamic/utils/Button";
// import { useStateContext } from "../../contexts/ContextProvider";

// const PrintPage = () => {
//   const { setIsLoader } = useStateContext();
//   const session = JSON.parse(localStorage.getItem("session"));
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [imageFilter, setImageFilter] = useState("all");

//   const printRef = useRef();
//   const handlePrint = () => {
//     const printContents = printRef.current.innerHTML;
//     const originalContents = document.body.innerHTML;
//     document.body.innerHTML = printContents;
//     window.print();
//     document.body.innerHTML = originalContents;
//     window.location.reload();
//   };

//   const fetchAllClasses = useCallback(async () => {
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//         setClassData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("An error occurred while fetching classes.");
//       setClassData([]);
//     }
//   }, []);


//   const fetchAllStudents = useCallback(async () => {
//     if (!session) {
//       toast.error("Session information is missing.");
//       setStudentData([]); setFilteredStudentData([]);
//       //   setIsLoadingData(false);
//       return;
//     }
//     setIsLoader(true)
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success && response.students?.data) {
//         setStudentData(response.students.data || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//         setStudentData([]);

//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//       setStudentData([]);

//     } finally {
//       //   setIsLoadingData(false);
//       setIsLoader(false)
//     }
//   }, [session]);
//   useEffect(() => {
//     fetchAllStudents()
//     fetchAllClasses()
//   }, [])

//   const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//   const sectionOptions = useMemo(() => {
//     const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//     return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//   }, [classData, selectedClass]);
//   useEffect(() => {


//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(s => s.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter(s => (s.section || null) === selectedSection);
//     }
//     if (imageFilter === "with") {
//       filtered = filtered.filter(s => !!s.studentImage?.url); // Assuming 'photo' is the image field
//     } else if (imageFilter === "without") {
//       filtered = filtered.filter(s => !s.studentImage?.url);
//     }

//     setFilteredStudentData(filtered);
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, studentData, imageFilter]);

//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   // Break students into chunks of 10
//   const chunkedStudents = [];
//   for (let i = 0; i < filteredStudentData.length; i += 10) {
//     chunkedStudents.push(filteredStudentData.slice(i, i + 10));
//   }

//   return (
//     <>
//       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID CARD" />
//       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2">
//         <ReactSelect
//           name="class"
//           value={selectedClass}
//           handleChange={handleClassChange}
//           label="Class"
//           dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//           placeholder="Select Class"
//         // isDisabled={isLoadingData}
//         />

//         <ReactSelect
//           name="section"
//           value={selectedSection}
//           handleChange={handleSectionChange}
//           label="Section"
//           dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//           disabled={!selectedClass || sectionOptions.length === 0}
//           placeholder="Select Section"
//         />
//         <ReactSelect
//           name="imageFilter"
//           value={imageFilter}
//           handleChange={(e) => setImageFilter(e.target.value)}
//           label="Image Filter"
//           dynamicOptions={[
//             { label: "All Students", value: "all" },
//             { label: "With Image", value: "with" },
//             { label: "Without Image", value: "without" },
//           ]}
//           placeholder="Select Image Filter"
//         />

//         <Button name="Print" color="green" onClick={handlePrint} />
//         <span>{filteredStudentData?.length}</span>


//       </div>
//       <div className="flex flex-col items-center bg-gray-100 min-h-screen py-6">




//         <div ref={printRef}>
//           {chunkedStudents.map((group, pageIndex) => (
//             <div
//               key={pageIndex}
//               className="print-page w-[1123px] h-[794px] bg-white grid grid-cols-5 gap-x-2 p-5"
//             //  className={`print-page w-[1123px] h-[794px] grid grid-cols-5 gap-x-2 p-5 ${pageIndex !== chunkedStudents.length - 1 ? 'break-after-page' : ''}`}
//             >
//               {group.map((student, index) => (
//                 <div className="student-card" key={index}>
//                   <StudentCardFront student={student} />
//                 </div>
//                 //   <StudentCard key={index} student={student} />
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PrintPage;

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
