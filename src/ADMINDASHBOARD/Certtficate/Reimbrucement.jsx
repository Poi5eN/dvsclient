import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
import { useReactToPrint } from "react-to-print";
import '../../App.css';
import {
    TextField, Typography, Box, CircularProgress,
    Paper, Grid
} from "@mui/material";
import bg from "../../ShikshMitraWebsite/assets/Certificate/Reimbrucement.jpg"; // YOUR BACKGROUND IMAGE
import { ActiveStudents, AdminGetAllClasses, getdesignReimbursement, getIDcarddesign } from "../../Network/AdminApi";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { toast } from "react-toastify";
import moment from "moment";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import Button from "../../Dynamic/utils/Button";

// A4 Dimensions
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

const calculateLayoutConstants = () => {
    return {
        pageStyleSize: `A4 portrait`,
        marginMM: 0,
        itemWidthMM: PAGE_WIDTH_MM,
        itemHeightMM: PAGE_HEIGHT_MM,
        previewAspectRatio: `${PAGE_WIDTH_MM} / ${PAGE_HEIGHT_MM}`,
    };
};

const Reimbrucement = () => {
      const user = JSON.parse(localStorage.getItem("user"))
     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"))
     const schooName=user?.schoolName?user?.schoolName:SchoolDetails?.schoolName 
    const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
    const { currentColor, setIsLoader, isLoader } = useStateContext();
    const layoutConstants = useMemo(() => calculateLayoutConstants(), []);

    const [admissionNo, setAdmissionNo] = useState("");
    const [studentName, setStudentName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [classNameDisplay, setClassNameDisplay] = useState("");
    const [sectionDisplay, setSectionDisplay] = useState("");

    const [tuitionFee, setTuitionFee] = useState("1000");
    const [admissionFee, setAdmissionFee] = useState("5000");
    const [examFee, setExamFee] = useState("1500");
    const [balance, setBalance] = useState("1000");
    const [miscFee1, setMiscFee1] = useState("");
    const [miscFee2, setMiscFee2] = useState("");
    const [otherFee, setOtherFee] = useState("");
    const [totalFee, setTotalFee] = useState(0);

    const [allStudents, setAllStudents] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [selectedClassForFilter, setSelectedClassForFilter] = useState("");
    console.log(selectedClassForFilter,"selectedClassForFilter")
    const [selectedStudentIdForPrefill, setSelectedStudentIdForPrefill] = useState("");
    const [isStudentDataLoading, setIsStudentDataLoading] = useState(false);
    const [design,setDesign]=useState()
const today_date=moment(new Date()).format("DD-MM-YYYY");
const actualAmt=tuitionFee *12;

  const fetchTemplate = useCallback(async () => {
        try {
            const response = await getdesignReimbursement();
            if (response?.success && response?.designFormats?.length > 0) {
                setDesign(response.designFormats[0]);
            } else {
                // setIdCardData(null);
            }
        } catch (error) {
            console.error("Error fetching ID card design:", error);
            toast.error("Could not load custom ID card template.");
            // setIdCardData(null);
        }
    }, []);
useEffect(()=>{
fetchTemplate()
},[])
    // Ensure `bg` is correctly imported. If it's undefined, background won't show.
    // console.log("DEBUG: Imported background image 'bg':", bg); 

    const reimbursementTemplate = useMemo(() => `
    <div style='background-color: #ffffff; background-image: url(${design?.frontImage?.url}); background-position: center top; background-repeat: no-repeat; width: ${PAGE_WIDTH_MM}mm; height: ${PAGE_HEIGHT_MM}mm; position: relative; background-size: contain; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; padding: 20mm;'>
   
      
        <!-- Student and Fee Details Container -->
        <div style="position: relative; font-size: 12pt; padding-left: 15mm; padding-right: 15mm; height: 100%;">
          <span style="position: absolute; top: 233mm; left: 23mm;  color: #0a2d4de0 !important;">\${today_date}</span>
         
          <span style="position: absolute; top: 73mm; left: 37mm; font-weight: bold; color: #0a2d4de0 !important;">\${studentName_display}</span>
          <span style="position: absolute; top: 85.5mm; left: 50mm; font-weight: bold; color: #0a2d4de0 !important;">\${fatherName_display}</span>
          <span style="position: absolute; top: 97mm; left: 35mm; font-weight: bold; color: #0a2d4de0 !important;">\${className_display}${sectionDisplay ? '-\${section_display}' : ''}</span>
      
          <!-- Divider -->
          <div style="position: absolute; top: 30mm; left: 0; width: 100%; height: 1px; background-color: #eee;"></div>
      
          <!-- Fees -->
         
          <span style="position: absolute; top: 134mm; left: 69mm;color:#18394ea6 ">\${tuitionFee_display} /Monthly </span>
          <span style="position: absolute; top: 146mm; left: 69mm;  color:#18394ea6">\${actual_Amt} (\${tuitionFee_display} x 12) </span>
      
        
          <span style="position:absolute;  top: 158mm; left:70mm; color:#18394ea6">\${admissionFee_display}</span>
     
          <span style="position: absolute; top: 170mm; left: 70mm;  color:#18394ea6">\${examFee_display}</span>
      
          
          <span style="position: absolute; top: 180mm; left: 70mm; color:#18394ea6 ">\${balance_display}</span>

    
          <span style="position: absolute; top: 190mm; left: 70.5mm; color:#18394ea6; font-weight: bold;">\${totalFee_display}</span>
        </div>
      </div>
    `, [PAGE_WIDTH_MM, PAGE_HEIGHT_MM, bg, sectionDisplay, miscFee1, miscFee2, otherFee]); // Added dependencies for conditional rendering

    useEffect(() => {
        const fees = [
            tuitionFee *12, admissionFee, examFee, balance,
            miscFee1, miscFee2, otherFee
        ].map(fee => parseFloat(fee) || 0);
        const sum = fees.reduce((acc, val) => acc + val, 0);
        setTotalFee(sum);
    }, [tuitionFee, admissionFee, examFee, balance, miscFee1, miscFee2, otherFee]);

    const fetchStudentDataForPrefill = useCallback(async () => {
        if (!session) return;
        setIsStudentDataLoading(true);
        try {
            const [classRes, studentRes] = await Promise.all([
                AdminGetAllClasses(),
                ActiveStudents(session)
            ]);
            if (classRes?.success) setAllClasses(classRes.classes || []);
            if (studentRes?.success && studentRes.students?.data) {
                setAllStudents(studentRes.students.data || []);
            } else {
                toast.error(studentRes?.message || "Could not load student data.");
            }
        } catch (error) {
            console.error("Error fetching data for prefill:", error);
            toast.error("Could not load student/class data for prefill.");
        } finally {
            setIsStudentDataLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchStudentDataForPrefill();
    }, [fetchStudentDataForPrefill]);

    const handleStudentSelectForPrefill = useCallback((selectedOption) => {
        debugger
        const studentId = selectedOption ? selectedOption?.target.value : "";
        setSelectedStudentIdForPrefill(studentId);
        const student = allStudents.find(s => s.studentId === studentId);

        if (student) {
            setAdmissionNo(student.admissionNumber || "");
            setStudentName(student.studentName || "");
            setFatherName(student.fatherName || "");
            setClassNameDisplay(student.class || "");
            setSectionDisplay(student.section || "");

            const monthlyFee = parseFloat(student.baseMonthlyFee || 0);
            if (monthlyFee > 0) {
                setTuitionFee((monthlyFee * 12).toString());
            } else {
                setTuitionFee("1000"); // Default if no baseMonthlyFee found or zero
            }
        } else {
            setAdmissionNo("");
            setStudentName("");
            setFatherName("");
            setClassNameDisplay("");
            setSectionDisplay("");
            setTuitionFee("1000"); // Reset tuition fee to default
        }
    }, [allStudents]); // Removed setters from dependencies as they are stable

    useEffect(() => {
        // Auto-fill student details if admissionNo is typed manually
        if (!selectedStudentIdForPrefill && admissionNo) {
            const studentByAdmNo = allStudents.find(s => s.admissionNumber === admissionNo);
            if (studentByAdmNo) {
                setStudentName(studentByAdmNo.studentName || "");
                setFatherName(studentByAdmNo.fatherName || "");
                setClassNameDisplay(studentByAdmNo.class || "");
                setSectionDisplay(studentByAdmNo.section || "");
                // Tuition fee is NOT set here to allow manual fee entry if Adm.No. is typed
            } else {
                setStudentName("");
                setFatherName("");
                setClassNameDisplay("");
                setSectionDisplay("");
            }
        } else if (!selectedStudentIdForPrefill && !admissionNo) {
            // If admissionNo is cleared manually and no student is selected
            setStudentName("");
            setFatherName("");
            setClassNameDisplay("");
            setSectionDisplay("");
        }
    }, [admissionNo, allStudents, selectedStudentIdForPrefill]); // Removed setters


    const replacePlaceholders = useCallback((template, data) => {
        if (!template) return `<div>Error: Template is missing.</div>`;
        let renderedHtml = template;
        try {
            renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
                const cleanKey = key.trim();
                // Ensure data[cleanKey] is not undefined before calling toString() implicitly
                return String(data[cleanKey] ?? ''); 
            });
        } catch (error){
            console.error(`Error rendering template:`, error);
            return `<div>Template Render Error</div>`;
        }
        return renderedHtml;
    }, []);

    const getReimbursementDataForTemplate = useCallback(() => {
        const schoolDetails = session || {};
        return {
            // backgroundImage: bg, // Not needed here if 'bg' is directly in template string
            admNo_display: admissionNo,
            schoo_Name: schooName,
            actual_Amt: actualAmt,
            today_date: today_date || (today_date ? "N/A" : ""),
            studentName_display: studentName || (admissionNo ? "N/A" : ""),
            fatherName_display: fatherName || (admissionNo ? "N/A" : ""),
            className_display: classNameDisplay || (admissionNo ? "N/A" : ""),
            section_display: sectionDisplay || (admissionNo ? "N/A" : ""),
            tuitionFee_display: parseFloat(tuitionFee) || "0.00",
            admissionFee_display: parseFloat(admissionFee) || "0.00",
            examFee_display: parseFloat(examFee) || "0.00",
            balance_display: parseFloat(balance) || "0.00",
            miscFee1_display: miscFee1 ? (parseFloat(miscFee1) || "0.00") : "",
            miscFee2_display: miscFee2 ? (parseFloat(miscFee2) || "0.00") : "",
            otherFee_display: otherFee ? (parseFloat(otherFee) || "0.00") : "",
            totalFee_display: totalFee.toFixed(2),
            schoolFullName: schoolDetails.schoolName || "Your School/College Name",
            schoolAddress: schoolDetails.schoolAddress || "123 Education Lane, Knowledge City",
            schoolPhone: schoolDetails.schoolPhone || "555-1234",
            schoolEmail: schoolDetails.schoolEmail || "contact@school.com",
            sessionName: schoolDetails.name || moment().format("YYYY") + "-" + moment().add(1, 'year').format("YY"),
            currentDate: moment().format("DD-MMM-YYYY"),
        };
    }, [admissionNo, studentName, fatherName, classNameDisplay, sectionDisplay,
        tuitionFee, admissionFee, examFee, balance, miscFee1, miscFee2, otherFee, totalFee, session]);


    const renderSlipForPrint = useCallback(() => {
        return replacePlaceholders(reimbursementTemplate, getReimbursementDataForTemplate());
    }, [reimbursementTemplate, getReimbursementDataForTemplate, replacePlaceholders]);

    const printRef = React.useRef();
    const handlePrint = useReactToPrint({
        content: () => {
            console.log("DEBUG PRINT: Attempting to get content for printing...");
            if (!admissionNo && !studentName && totalFee === 0) {
                toast.warn("Please enter some details before printing.");
                console.log("DEBUG PRINT: Condition not met (no details). Returning null.");
                return null;
            }

            const htmlToPrint = renderSlipForPrint();
            // console.log("DEBUG PRINT: Generated HTML for printing:", htmlToPrint); // Uncomment if needed

            if (!htmlToPrint || htmlToPrint.includes("Error: Template is missing") || htmlToPrint.includes("Template Render Error")) {
                console.error("DEBUG PRINT: Error in HTML generation. Aborting print.", htmlToPrint);
                toast.error("Could not generate slip content for printing.");
                return null;
            }
            
            const printContainer = document.createElement('div');
            printContainer.innerHTML = htmlToPrint;
            const contentElement = printContainer.firstElementChild; // Use firstElementChild

            // console.log("DEBUG PRINT: Element to be printed:", contentElement); // Uncomment if needed

            if (!contentElement || !(contentElement instanceof HTMLElement)) {
                console.error("DEBUG PRINT: No valid HTMLElement found to print. Aborting.", {htmlString: htmlToPrint, firstChild: printContainer.firstChild, firstElementChild: contentElement});
                toast.error("Critical error preparing content for print. Content might be invalid.");
                return null;
            }
            
            return contentElement;
        },
        documentTitle: `Reimbursement_Slip_${admissionNo || studentName || 'Custom'}_${moment().format('YYYYMMDD_HHmm')}`,
        onBeforeGetContent: () => {
            // console.log("DEBUG PRINT: onBeforeGetContent triggered.");
            setIsLoader(true);
            return Promise.resolve();
        },
        onAfterPrint: () => {
            // console.log("DEBUG PRINT: onAfterPrint triggered.");
            setIsLoader(false);
            toast.success(`Reimbursement slip prepared!`);
        },
        onPrintError: (errorLocation, error) => {
            console.error("DEBUG PRINT: Error during printing process:", errorLocation, error);
            setIsLoader(false);
            toast.error(`Printing failed: ${errorLocation} - ${error.message}`);
        },
        pageStyle: `
          @page {
            size: ${layoutConstants.pageStyleSize}; 
            margin: ${layoutConstants.marginMM}mm;
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            html, body {
                width: ${PAGE_WIDTH_MM}mm;
                height: ${PAGE_HEIGHT_MM}mm;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden;
            }
            /* Target the specific div for printing (the one with background) */
            /* Ensure this selector matches the root element of your reimbursementTemplate */
            div[style*="background-image"] { 
                width: ${PAGE_WIDTH_MM}mm !important; 
                height: ${PAGE_HEIGHT_MM}mm !important;
                box-sizing: border-box !important; 
                overflow: hidden !important; 
                display: block !important;
                page-break-inside: avoid !important;
            }
            .no-print, .screen-only { display: none !important; }
          }
        `,
    });
    
    const studentOptionsForPrefill = useMemo(() => {
        let studentsToList = allStudents;
        if (selectedClassForFilter) {
            studentsToList = allStudents.filter(s => s.class === selectedClassForFilter);
        }
        return studentsToList.map(s => ({ label: `${s.studentName} (Adm: ${s.admissionNumber}, Cls: ${s.class}${s.section ? '-'+s.section : ''})`, value: s.studentId }));
    }, [allStudents, selectedClassForFilter]);

    const classOptionsForFilter = useMemo(() => {
        return [{ label: "All Classes", value: "" }, ...allClasses.map(c => ({ label: c.className, value: c.className }))]
    }, [allClasses]);

    // Log the imported background image path to ensure it's correct
    useEffect(() => {
        if (bg) {
            console.log("DEBUG: Background image path (bg) is available.");
        } else {
            console.warn("DEBUG: Background image path (bg) is UNDEFINED or NULL. Background will not display.");
        }
    }, []);
 const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClassForFilter(selectedClassName);}
    return (
        <>
            <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Reimbursement Slip (A4)" />
            <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
                <Paper elevation={2} className="no-print" sx={{ p: 2, mb: 3 }}>
                   
                        <div className="grid  gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-6">
                           <ReactSelect
                                label=" Class "
                                value={selectedClassForFilter}
                                // value={classOptionsForFilter.find(opt => opt.value === selectedClassForFilter) || null}
                               handleChange={handleClassChange}
                                dynamicOptions={classOptionsForFilter}
                                placeholder="Select Class"
                                isDisabled={isStudentDataLoading}
                            />
                        
                             <ReactSelect
                                label="Select Student"
                                name="student"
                                value={selectedStudentIdForPrefill}
                                // value={studentOptionsForPrefill.find(opt => opt.value === selectedStudentIdForPrefill) || null}
                                handleChange={handleStudentSelectForPrefill}
                                dynamicOptions={[{label: "Select Student", value:""}, ...studentOptionsForPrefill]}
                                placeholder="Search and Select Student..."
                                isClearable
                                isDisabled={isStudentDataLoading || !allStudents.length}
                            />
                     
                         <ReactInput
                                      type="number" 
                                      maxLength="10"
                                      name="Tuitionfee"
                                      required={true}
                                      label="Tuition Fee"
                                     onChange={e => setTuitionFee(e.target.value)}
                                      value={tuitionFee}
                                    />
                         <ReactInput
                                      type="number" 
                                      maxLength="10"
                                      name="AdmissionFee"
                                      required={true}
                                      label="Admission Fee"
                                   onChange={e => setAdmissionFee(e.target.value)}
                                      value={admissionFee}
                                    />
                         <ReactInput
                                      type="number" 
                                      maxLength="10"
                                      name="ExamFee"
                                      required={true}
                                      label="Exam Fee"
                                   value={examFee} onChange={e => setExamFee(e.target.value)} 
                                    />
                         <ReactInput
                                      type="number" 
                                      maxLength="10"
                                      name="BalanceFee"
                                      required={true}
                                      label="Balance Fee"
                                    value={balance} onChange={e => setBalance(e.target.value)} 
                                    />
                       
                        <Button color={"green"} name="Print" onClick={handlePrint} />
                        </div>
                    
                </Paper>

             
                <div ref={printRef} className="screen-only screen-a4-pages-container" style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
                    {(!admissionNo && !studentName && totalFee === 0 && !selectedStudentIdForPrefill && !isLoader) ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', p: 3, minHeight: '200px', border: '1px dashed grey', borderRadius: '4px' }}>
                           <Typography sx={{ ml: 2, color: 'text.secondary' }}>Enter details or select a student to see preview.</Typography>
                        </Box>
                    ) : isLoader && (!admissionNo && !studentName && totalFee === 0 && !selectedStudentIdForPrefill) ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', p: 3, minHeight: '200px' }}>
                            <CircularProgress size={30} /><Typography sx={{ ml: 2 }}>Preparing Preview...</Typography>
                        </Box>
                    ): (
                        <Paper elevation={3} className="screen-a4-page" style={{
                            width: `min(100%, ${layoutConstants.itemWidthMM}mm)`,
                            maxWidth: `${layoutConstants.itemWidthMM}mm`,
                            height: `${layoutConstants.itemHeightMM}mm`, 
                            aspectRatio: layoutConstants.previewAspectRatio,
                            margin: '0 auto' 
                        }}>
                            <div className="screen-slip-layout-area" style={{ transform: 'scale(1)', width: '100%', height: '100%'}}>
                                 <div dangerouslySetInnerHTML={{ __html: renderSlipForPrint() }} />
                            </div>
                        </Paper>
                    )}
                </div>
            </Box>

            <style jsx global>{`
                .screen-a4-pages-container { 
                    margin-top:10px; 
                    border:1px solid #e0e0e0; 
                    padding:15px; 
                    background-color:#e9ecef; 
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px; 
                    min-height: 300px;
                }
                .screen-a4-page { 
                    background-color:white; 
                    border:1px solid #ccc; 
                    box-sizing:border-box; 
                    overflow: hidden;
                }
                .screen-slip-layout-area {
                    width:100% !important; 
                    height:100% !important;
                    box-sizing:border-box !important; 
                    overflow:hidden;
                }
                .screen-slip-layout-area > div { /* This is the div rendered from your HTML template string */
                    width: ${PAGE_WIDTH_MM}mm !important; 
                    height: ${PAGE_HEIGHT_MM}mm !important; 
                    box-sizing:border-box !important;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
};

export default Reimbrucement;




// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import '../../App.css';
// import {
//     TextField, Typography, Box, CircularProgress,
//     Paper, Grid
// } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/assets/Certificate/Reimbrucement.jpg"; // YOUR BACKGROUND IMAGE
// import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import Button from "../../Dynamic/utils/Button";

// // A4 Dimensions
// const PAGE_WIDTH_MM = 210;
// const PAGE_HEIGHT_MM = 297;

// const calculateLayoutConstants = () => {
//     return {
//         pageStyleSize: `A4 portrait`,
//         marginMM: 0,
//         itemWidthMM: PAGE_WIDTH_MM,
//         itemHeightMM: PAGE_HEIGHT_MM,
//         previewAspectRatio: `${PAGE_WIDTH_MM} / ${PAGE_HEIGHT_MM}`,
//     };
// };

// const Reimbrucement = () => {
//       const user = JSON.parse(localStorage.getItem("user"))
//      const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"))
//      const schooName=user?.schoolName?user?.schoolName:SchoolDetails?.schoolName 
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const layoutConstants = useMemo(() => calculateLayoutConstants(), []);

//     const [admissionNo, setAdmissionNo] = useState("");
//     const [studentName, setStudentName] = useState("");
//     const [fatherName, setFatherName] = useState("");
//     const [classNameDisplay, setClassNameDisplay] = useState("");
//     const [sectionDisplay, setSectionDisplay] = useState("");

//     const [tuitionFee, setTuitionFee] = useState("1000");
//     const [admissionFee, setAdmissionFee] = useState("5000");
//     const [examFee, setExamFee] = useState("1500");
//     const [balance, setBalance] = useState("1000");
//     const [miscFee1, setMiscFee1] = useState("");
//     const [miscFee2, setMiscFee2] = useState("");
//     const [otherFee, setOtherFee] = useState("");
//     const [totalFee, setTotalFee] = useState(0);

//     const [allStudents, setAllStudents] = useState([]);
//     const [allClasses, setAllClasses] = useState([]);
//     const [selectedClassForFilter, setSelectedClassForFilter] = useState("");
//     console.log(selectedClassForFilter,"selectedClassForFilter")
//     const [selectedStudentIdForPrefill, setSelectedStudentIdForPrefill] = useState("");
//     const [isStudentDataLoading, setIsStudentDataLoading] = useState(false);
// const today_date=moment(new Date()).format("DD-MM-YYYY");
// const actualAmt=tuitionFee *12;


//     // Ensure `bg` is correctly imported. If it's undefined, background won't show.
//     // console.log("DEBUG: Imported background image 'bg':", bg); 

//     const reimbursementTemplate = useMemo(() => `
//     <div style='background-color: #ffffff; background-image: url(${bg}); background-position: center top; background-repeat: no-repeat; width: ${PAGE_WIDTH_MM}mm; height: ${PAGE_HEIGHT_MM}mm; position: relative; background-size: contain; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; padding: 20mm;'>
      
//         <!-- Student and Fee Details Container -->
//         <div style="position: relative; font-size: 12pt; padding-left: 15mm; padding-right: 15mm; height: 100%;">
//           <span style="position: absolute; top: 233mm; left: 23mm;  color: #0a2d4de0 !important;">\${today_date}</span>
         
//           <span style="position: absolute; top: 73mm; left: 37mm; font-weight: bold; color: #0a2d4de0 !important;">\${studentName_display}</span>
//           <span style="position: absolute; top: 85.5mm; left: 50mm; font-weight: bold; color: #0a2d4de0 !important;">\${fatherName_display}</span>
//           <span style="position: absolute; top: 97mm; left: 35mm; font-weight: bold; color: #0a2d4de0 !important;">\${className_display}${sectionDisplay ? '-\${section_display}' : ''}</span>
      
//           <!-- Divider -->
//           <div style="position: absolute; top: 30mm; left: 0; width: 100%; height: 1px; background-color: #eee;"></div>
      
//           <!-- Fees -->
         
//           <span style="position: absolute; top: 134mm; left: 69mm;color:#18394ea6 ">\${tuitionFee_display} /Monthly </span>
//           <span style="position: absolute; top: 146mm; left: 69mm;  color:#18394ea6">\${actual_Amt} (\${tuitionFee_display} x 12) </span>
      
        
//           <span style="position:absolute;  top: 158mm; left:70mm; color:#18394ea6">\${admissionFee_display}</span>
     
//           <span style="position: absolute; top: 170mm; left: 70mm;  color:#18394ea6">\${examFee_display}</span>
      
          
//           <span style="position: absolute; top: 180mm; left: 70mm; color:#18394ea6 ">\${balance_display}</span>

    
//           <span style="position: absolute; top: 190mm; left: 70.5mm; color:#18394ea6; font-weight: bold;">\${totalFee_display}</span>
//         </div>
//       </div>
//     `, [PAGE_WIDTH_MM, PAGE_HEIGHT_MM, bg, sectionDisplay, miscFee1, miscFee2, otherFee]); // Added dependencies for conditional rendering

//     useEffect(() => {
//         const fees = [
//             tuitionFee *12, admissionFee, examFee, balance,
//             miscFee1, miscFee2, otherFee
//         ].map(fee => parseFloat(fee) || 0);
//         const sum = fees.reduce((acc, val) => acc + val, 0);
//         setTotalFee(sum);
//     }, [tuitionFee, admissionFee, examFee, balance, miscFee1, miscFee2, otherFee]);

//     const fetchStudentDataForPrefill = useCallback(async () => {
//         if (!session) return;
//         setIsStudentDataLoading(true);
//         try {
//             const [classRes, studentRes] = await Promise.all([
//                 AdminGetAllClasses(),
//                 ActiveStudents(session)
//             ]);
//             if (classRes?.success) setAllClasses(classRes.classes || []);
//             if (studentRes?.success && studentRes.students?.data) {
//                 setAllStudents(studentRes.students.data || []);
//             } else {
//                 toast.error(studentRes?.message || "Could not load student data.");
//             }
//         } catch (error) {
//             console.error("Error fetching data for prefill:", error);
//             toast.error("Could not load student/class data for prefill.");
//         } finally {
//             setIsStudentDataLoading(false);
//         }
//     }, [session]);

//     useEffect(() => {
//         fetchStudentDataForPrefill();
//     }, [fetchStudentDataForPrefill]);

//     const handleStudentSelectForPrefill = useCallback((selectedOption) => {
//         debugger
//         const studentId = selectedOption ? selectedOption?.target.value : "";
//         setSelectedStudentIdForPrefill(studentId);
//         const student = allStudents.find(s => s.studentId === studentId);

//         if (student) {
//             setAdmissionNo(student.admissionNumber || "");
//             setStudentName(student.studentName || "");
//             setFatherName(student.fatherName || "");
//             setClassNameDisplay(student.class || "");
//             setSectionDisplay(student.section || "");

//             const monthlyFee = parseFloat(student.baseMonthlyFee || 0);
//             if (monthlyFee > 0) {
//                 setTuitionFee((monthlyFee * 12).toString());
//             } else {
//                 setTuitionFee("1000"); // Default if no baseMonthlyFee found or zero
//             }
//         } else {
//             setAdmissionNo("");
//             setStudentName("");
//             setFatherName("");
//             setClassNameDisplay("");
//             setSectionDisplay("");
//             setTuitionFee("1000"); // Reset tuition fee to default
//         }
//     }, [allStudents]); // Removed setters from dependencies as they are stable

//     useEffect(() => {
//         // Auto-fill student details if admissionNo is typed manually
//         if (!selectedStudentIdForPrefill && admissionNo) {
//             const studentByAdmNo = allStudents.find(s => s.admissionNumber === admissionNo);
//             if (studentByAdmNo) {
//                 setStudentName(studentByAdmNo.studentName || "");
//                 setFatherName(studentByAdmNo.fatherName || "");
//                 setClassNameDisplay(studentByAdmNo.class || "");
//                 setSectionDisplay(studentByAdmNo.section || "");
//                 // Tuition fee is NOT set here to allow manual fee entry if Adm.No. is typed
//             } else {
//                 setStudentName("");
//                 setFatherName("");
//                 setClassNameDisplay("");
//                 setSectionDisplay("");
//             }
//         } else if (!selectedStudentIdForPrefill && !admissionNo) {
//             // If admissionNo is cleared manually and no student is selected
//             setStudentName("");
//             setFatherName("");
//             setClassNameDisplay("");
//             setSectionDisplay("");
//         }
//     }, [admissionNo, allStudents, selectedStudentIdForPrefill]); // Removed setters


//     const replacePlaceholders = useCallback((template, data) => {
//         if (!template) return `<div>Error: Template is missing.</div>`;
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 // Ensure data[cleanKey] is not undefined before calling toString() implicitly
//                 return String(data[cleanKey] ?? ''); 
//             });
//         } catch (error){
//             console.error(`Error rendering template:`, error);
//             return `<div>Template Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []);

//     const getReimbursementDataForTemplate = useCallback(() => {
//         const schoolDetails = session || {};
//         return {
//             // backgroundImage: bg, // Not needed here if 'bg' is directly in template string
//             admNo_display: admissionNo,
//             schoo_Name: schooName,
//             actual_Amt: actualAmt,
//             today_date: today_date || (today_date ? "N/A" : ""),
//             studentName_display: studentName || (admissionNo ? "N/A" : ""),
//             fatherName_display: fatherName || (admissionNo ? "N/A" : ""),
//             className_display: classNameDisplay || (admissionNo ? "N/A" : ""),
//             section_display: sectionDisplay || (admissionNo ? "N/A" : ""),
//             tuitionFee_display: parseFloat(tuitionFee) || "0.00",
//             admissionFee_display: parseFloat(admissionFee) || "0.00",
//             examFee_display: parseFloat(examFee) || "0.00",
//             balance_display: parseFloat(balance) || "0.00",
//             miscFee1_display: miscFee1 ? (parseFloat(miscFee1) || "0.00") : "",
//             miscFee2_display: miscFee2 ? (parseFloat(miscFee2) || "0.00") : "",
//             otherFee_display: otherFee ? (parseFloat(otherFee) || "0.00") : "",
//             totalFee_display: totalFee.toFixed(2),
//             schoolFullName: schoolDetails.schoolName || "Your School/College Name",
//             schoolAddress: schoolDetails.schoolAddress || "123 Education Lane, Knowledge City",
//             schoolPhone: schoolDetails.schoolPhone || "555-1234",
//             schoolEmail: schoolDetails.schoolEmail || "contact@school.com",
//             sessionName: schoolDetails.name || moment().format("YYYY") + "-" + moment().add(1, 'year').format("YY"),
//             currentDate: moment().format("DD-MMM-YYYY"),
//         };
//     }, [admissionNo, studentName, fatherName, classNameDisplay, sectionDisplay,
//         tuitionFee, admissionFee, examFee, balance, miscFee1, miscFee2, otherFee, totalFee, session]);


//     const renderSlipForPrint = useCallback(() => {
//         return replacePlaceholders(reimbursementTemplate, getReimbursementDataForTemplate());
//     }, [reimbursementTemplate, getReimbursementDataForTemplate, replacePlaceholders]);

//     const printRef = React.useRef();
//     const handlePrint = useReactToPrint({
//         content: () => {
//             console.log("DEBUG PRINT: Attempting to get content for printing...");
//             if (!admissionNo && !studentName && totalFee === 0) {
//                 toast.warn("Please enter some details before printing.");
//                 console.log("DEBUG PRINT: Condition not met (no details). Returning null.");
//                 return null;
//             }

//             const htmlToPrint = renderSlipForPrint();
//             // console.log("DEBUG PRINT: Generated HTML for printing:", htmlToPrint); // Uncomment if needed

//             if (!htmlToPrint || htmlToPrint.includes("Error: Template is missing") || htmlToPrint.includes("Template Render Error")) {
//                 console.error("DEBUG PRINT: Error in HTML generation. Aborting print.", htmlToPrint);
//                 toast.error("Could not generate slip content for printing.");
//                 return null;
//             }
            
//             const printContainer = document.createElement('div');
//             printContainer.innerHTML = htmlToPrint;
//             const contentElement = printContainer.firstElementChild; // Use firstElementChild

//             // console.log("DEBUG PRINT: Element to be printed:", contentElement); // Uncomment if needed

//             if (!contentElement || !(contentElement instanceof HTMLElement)) {
//                 console.error("DEBUG PRINT: No valid HTMLElement found to print. Aborting.", {htmlString: htmlToPrint, firstChild: printContainer.firstChild, firstElementChild: contentElement});
//                 toast.error("Critical error preparing content for print. Content might be invalid.");
//                 return null;
//             }
            
//             return contentElement;
//         },
//         documentTitle: `Reimbursement_Slip_${admissionNo || studentName || 'Custom'}_${moment().format('YYYYMMDD_HHmm')}`,
//         onBeforeGetContent: () => {
//             // console.log("DEBUG PRINT: onBeforeGetContent triggered.");
//             setIsLoader(true);
//             return Promise.resolve();
//         },
//         onAfterPrint: () => {
//             // console.log("DEBUG PRINT: onAfterPrint triggered.");
//             setIsLoader(false);
//             toast.success(`Reimbursement slip prepared!`);
//         },
//         onPrintError: (errorLocation, error) => {
//             console.error("DEBUG PRINT: Error during printing process:", errorLocation, error);
//             setIsLoader(false);
//             toast.error(`Printing failed: ${errorLocation} - ${error.message}`);
//         },
//         pageStyle: `
//           @page {
//             size: ${layoutConstants.pageStyleSize}; 
//             margin: ${layoutConstants.marginMM}mm;
//           }
//           @media print {
//             body { 
//               -webkit-print-color-adjust: exact !important; 
//               print-color-adjust: exact !important; 
//             }
//             html, body {
//                 width: ${PAGE_WIDTH_MM}mm;
//                 height: ${PAGE_HEIGHT_MM}mm;
//                 margin: 0 !important;
//                 padding: 0 !important;
//                 overflow: hidden;
//             }
//             /* Target the specific div for printing (the one with background) */
//             /* Ensure this selector matches the root element of your reimbursementTemplate */
//             div[style*="background-image"] { 
//                 width: ${PAGE_WIDTH_MM}mm !important; 
//                 height: ${PAGE_HEIGHT_MM}mm !important;
//                 box-sizing: border-box !important; 
//                 overflow: hidden !important; 
//                 display: block !important;
//                 page-break-inside: avoid !important;
//             }
//             .no-print, .screen-only { display: none !important; }
//           }
//         `,
//     });
    
//     const studentOptionsForPrefill = useMemo(() => {
//         let studentsToList = allStudents;
//         if (selectedClassForFilter) {
//             studentsToList = allStudents.filter(s => s.class === selectedClassForFilter);
//         }
//         return studentsToList.map(s => ({ label: `${s.studentName} (Adm: ${s.admissionNumber}, Cls: ${s.class}${s.section ? '-'+s.section : ''})`, value: s.studentId }));
//     }, [allStudents, selectedClassForFilter]);

//     const classOptionsForFilter = useMemo(() => {
//         return [{ label: "All Classes", value: "" }, ...allClasses.map(c => ({ label: c.className, value: c.className }))]
//     }, [allClasses]);

//     // Log the imported background image path to ensure it's correct
//     useEffect(() => {
//         if (bg) {
//             console.log("DEBUG: Background image path (bg) is available.");
//         } else {
//             console.warn("DEBUG: Background image path (bg) is UNDEFINED or NULL. Background will not display.");
//         }
//     }, []);
//  const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClassForFilter(selectedClassName);}
//     return (
//         <>
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Reimbursement Slip (A4)" />
//             <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Paper elevation={2} className="no-print" sx={{ p: 2, mb: 3 }}>
                   
//                         <div className="grid  gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-6">
//                            <ReactSelect
//                                 label=" Class "
//                                 value={selectedClassForFilter}
//                                 // value={classOptionsForFilter.find(opt => opt.value === selectedClassForFilter) || null}
//                                handleChange={handleClassChange}
//                                 dynamicOptions={classOptionsForFilter}
//                                 placeholder="Select Class"
//                                 isDisabled={isStudentDataLoading}
//                             />
                        
//                              <ReactSelect
//                                 label="Select Student"
//                                 name="student"
//                                 value={selectedStudentIdForPrefill}
//                                 // value={studentOptionsForPrefill.find(opt => opt.value === selectedStudentIdForPrefill) || null}
//                                 handleChange={handleStudentSelectForPrefill}
//                                 dynamicOptions={[{label: "Select Student", value:""}, ...studentOptionsForPrefill]}
//                                 placeholder="Search and Select Student..."
//                                 isClearable
//                                 isDisabled={isStudentDataLoading || !allStudents.length}
//                             />
                     
//                          <ReactInput
//                                       type="number" 
//                                       maxLength="10"
//                                       name="Tuitionfee"
//                                       required={true}
//                                       label="Tuition Fee"
//                                      onChange={e => setTuitionFee(e.target.value)}
//                                       value={tuitionFee}
//                                     />
//                          <ReactInput
//                                       type="number" 
//                                       maxLength="10"
//                                       name="AdmissionFee"
//                                       required={true}
//                                       label="Admission Fee"
//                                    onChange={e => setAdmissionFee(e.target.value)}
//                                       value={admissionFee}
//                                     />
//                          <ReactInput
//                                       type="number" 
//                                       maxLength="10"
//                                       name="ExamFee"
//                                       required={true}
//                                       label="Exam Fee"
//                                    value={examFee} onChange={e => setExamFee(e.target.value)} 
//                                     />
//                          <ReactInput
//                                       type="number" 
//                                       maxLength="10"
//                                       name="BalanceFee"
//                                       required={true}
//                                       label="Balance Fee"
//                                     value={balance} onChange={e => setBalance(e.target.value)} 
//                                     />
                       
//                         <Button color={"green"} name="Print" onClick={handlePrint} />
//                         </div>
                    
//                 </Paper>

             
//                 <div ref={printRef} className="screen-only screen-a4-pages-container" style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
//                     {(!admissionNo && !studentName && totalFee === 0 && !selectedStudentIdForPrefill && !isLoader) ? (
//                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', p: 3, minHeight: '200px', border: '1px dashed grey', borderRadius: '4px' }}>
//                            <Typography sx={{ ml: 2, color: 'text.secondary' }}>Enter details or select a student to see preview.</Typography>
//                         </Box>
//                     ) : isLoader && (!admissionNo && !studentName && totalFee === 0 && !selectedStudentIdForPrefill) ? (
//                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', p: 3, minHeight: '200px' }}>
//                             <CircularProgress size={30} /><Typography sx={{ ml: 2 }}>Preparing Preview...</Typography>
//                         </Box>
//                     ): (
//                         <Paper elevation={3} className="screen-a4-page" style={{
//                             width: `min(100%, ${layoutConstants.itemWidthMM}mm)`,
//                             maxWidth: `${layoutConstants.itemWidthMM}mm`,
//                             height: `${layoutConstants.itemHeightMM}mm`, 
//                             aspectRatio: layoutConstants.previewAspectRatio,
//                             margin: '0 auto' 
//                         }}>
//                             <div className="screen-slip-layout-area" style={{ transform: 'scale(1)', width: '100%', height: '100%'}}>
//                                  <div dangerouslySetInnerHTML={{ __html: renderSlipForPrint() }} />
//                             </div>
//                         </Paper>
//                     )}
//                 </div>
//             </Box>

//             <style jsx global>{`
//                 .screen-a4-pages-container { 
//                     margin-top:10px; 
//                     border:1px solid #e0e0e0; 
//                     padding:15px; 
//                     background-color:#e9ecef; 
//                     display: flex;
//                     flex-wrap: wrap;
//                     gap: 15px; 
//                     min-height: 300px;
//                 }
//                 .screen-a4-page { 
//                     background-color:white; 
//                     border:1px solid #ccc; 
//                     box-sizing:border-box; 
//                     overflow: hidden;
//                 }
//                 .screen-slip-layout-area {
//                     width:100% !important; 
//                     height:100% !important;
//                     box-sizing:border-box !important; 
//                     overflow:hidden;
//                 }
//                 .screen-slip-layout-area > div { /* This is the div rendered from your HTML template string */
//                     width: ${PAGE_WIDTH_MM}mm !important; 
//                     height: ${PAGE_HEIGHT_MM}mm !important; 
//                     box-sizing:border-box !important;
//                     overflow: hidden;
//                 }
//             `}</style>
//         </>
//     );
// };

// export default Reimbrucement;




