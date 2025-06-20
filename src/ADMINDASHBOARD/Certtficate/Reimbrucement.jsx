import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
import { useReactToPrint } from "react-to-print";
import '../../App.css';
import {
    TextField, Typography, Box, CircularProgress,
    Paper, Grid
} from "@mui/material";
import bg from "../../ShikshMitraWebsite/assets/Certificate/Reimbrucement.jpg"; // YOUR BACKGROUND IMAGE
import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi";
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
const today_date=moment(new Date()).format("DD-MM-YYYY");
const actualAmt=tuitionFee *12;

    // Ensure `bg` is correctly imported. If it's undefined, background won't show.
    // console.log("DEBUG: Imported background image 'bg':", bg); 

    const reimbursementTemplate = useMemo(() => `
    <div style='background-color: #ffffff; background-image: url(${bg}); background-position: center top; background-repeat: no-repeat; width: ${PAGE_WIDTH_MM}mm; height: ${PAGE_HEIGHT_MM}mm; position: relative; background-size: contain; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; padding: 20mm;'>
      
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
                                label="Filter by Class (for Student List)"
                                value={selectedClassForFilter}
                                // value={classOptionsForFilter.find(opt => opt.value === selectedClassForFilter) || null}
                               handleChange={handleClassChange}
                                dynamicOptions={classOptionsForFilter}
                                placeholder="Select Class to Filter Students"
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
//     Button, TextField, Typography, Box, CircularProgress,
//     Paper, Grid // Added Grid for layout
// } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/assets/Certificate/Reimbrucement.png"; // YOUR BACKGROUND IMAGE
// import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi"; // getIDcarddesign removed as not used
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// // A4 Dimensions
// const PAGE_WIDTH_MM = 210;
// const PAGE_HEIGHT_MM = 297;

// const calculateLayoutConstants = () => {
//     return {
//         pageStyleSize: `A4 portrait`,
//         marginMM: 0, // No margin for full page background
//         itemWidthMM: PAGE_WIDTH_MM,
//         itemHeightMM: PAGE_HEIGHT_MM,
//         previewAspectRatio: `${PAGE_WIDTH_MM} / ${PAGE_HEIGHT_MM}`,
//     };
// };

// const Reimbrucement = () => {
//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const layoutConstants = useMemo(() => calculateLayoutConstants(), []);

//     // --- State for Reimbursement Inputs ---
//     const [admissionNo, setAdmissionNo] = useState(""); // Defaulting to empty
//     const [studentName, setStudentName] = useState("");
//     const [fatherName, setFatherName] = useState(""); // New state for Father's Name
//     const [classNameDisplay, setClassNameDisplay] = useState(""); // New state for Class Name
//     const [sectionDisplay, setSectionDisplay] = useState(""); // New state for Section

//     const [tuitionFee, setTuitionFee] = useState("1000"); // Default, will be overridden by student selection
//     const [admissionFee, setAdmissionFee] = useState("5000");
//     const [annualFee, setAnnualFee] = useState("1500");
//     const [inventoryFee, setInventoryFee] = useState("1000");
//     const [miscFee1, setMiscFee1] = useState("");
//     const [miscFee2, setMiscFee2] = useState("");
//     const [otherFee, setOtherFee] = useState("");
//     const [totalFee, setTotalFee] = useState(0);

//     // --- State for student pre-fill ---
//     const [allStudents, setAllStudents] = useState([]);
//     const [allClasses, setAllClasses] = useState([]);
//     const [selectedClassForFilter, setSelectedClassForFilter] = useState("");
//     const [selectedStudentIdForPrefill, setSelectedStudentIdForPrefill] = useState("");
//     const [isStudentDataLoading, setIsStudentDataLoading] = useState(false);

//     // --- Reimbursement Slip Template ---
//     const reimbursementTemplate = useMemo(() => `
//   <div style='background-color: #ffffff; background-image: url(\${backgroundImage}); background-position: center top; background-repeat: no-repeat; width: ${PAGE_WIDTH_MM}mm; height: ${PAGE_HEIGHT_MM}mm; position: relative; background-size: contain; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; padding: 20mm;'>
      
//   <!-- Student and Fee Details Container -->
//   <div style="position: relative; font-size: 12pt; padding-left: 15mm; padding-right: 15mm; height: 100%;">
//     <span style="position: absolute; top: 48mm; left: 52mm; font-weight: bold;">\${studentName_display}</span>
//     <span style="position: absolute; top: 55mm; left: 52mm; font-weight: bold;">\${fatherName_display}</span>
//     <span style="position: absolute; top: 60mm; left: 52mm; font-weight: bold;">\${className_display}-\${section_display}</span>

//     <!-- Divider -->
//     <div style="position: absolute; top: 30mm; left: 0; width: 100%; height: 1px; background-color: #eee;"></div>

//     <!-- Fees -->
//     <span style="position: absolute; top: 40mm; left: 0;">Tuition Fee:</span>
//     <span style="position: absolute; top: 40mm; right: 0;">\${tuitionFee_display}</span>

//     <span style="position: absolute; top: 50mm; left: 0;">Admission Fee:</span>
//     <span style="position: absolute; top: 50mm; right: 0;">\${admissionFee_display}</span>

//     <span style="position: absolute; top: 60mm; left: 0;">Annual Fee:</span>
//     <span style="position: absolute; top: 60mm; right: 0;">\${annualFee_display}</span>

//     <span style="position: absolute; top: 70mm; left: 0;">Inventory Fee:</span>
//     <span style="position: absolute; top: 70mm; right: 0;">\${inventoryFee_display}</span>

//     <!-- Total -->
//     <div style="position: absolute; top: 80mm; left: 0; width: 100%; height: 2px; background-color: #333;"></div>
//     <span style="position: absolute; top: 85mm; left: 0; font-weight: bold;">Total:</span>
//     <span style="position: absolute; top: 85mm; right: 0; font-weight: bold;">\${totalFee_display}</span>
//   </div>
// </div>

//     `, [PAGE_WIDTH_MM, PAGE_HEIGHT_MM]);

//     // --- Calculate Total Fee ---
//     useEffect(() => {
//         const fees = [
//             tuitionFee, admissionFee, annualFee, inventoryFee,
//             miscFee1, miscFee2, otherFee
//         ].map(fee => parseFloat(fee) || 0);
//         const sum = fees.reduce((acc, val) => acc + val, 0);
//         setTotalFee(sum);
//     }, [tuitionFee, admissionFee, annualFee, inventoryFee, miscFee1, miscFee2, otherFee]);

//     // --- Data Fetching for Pre-fill ---
//     const fetchStudentDataForPrefill = useCallback(async () => {
//         if (!session) return;
//         setIsStudentDataLoading(true);
//         try {
//             const [classRes, studentRes] = await Promise.all([
//                 AdminGetAllClasses(),
//                 ActiveStudents(session) // Ensure this API returns fatherName and baseMonthlyFee for students
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

//     // --- Handle Student Selection for Pre-fill ---
//     const handleStudentSelectForPrefill = useCallback((selectedOption) => {
        
//         const studentId = selectedOption ? selectedOption?.target?.value : "";
//         setSelectedStudentIdForPrefill(studentId);
//         const student = allStudents.find(s => s.studentId === studentId);

//         if (student) {
//             setAdmissionNo(student.admissionNumber || "");
//             setStudentName(student.studentName || "");
//             setFatherName(student.fatherName || ""); // Pre-fill father's name
//             setClassNameDisplay(student.class || "");   // Pre-fill class name (assuming student.class is the name)
//             setSectionDisplay(student.section || ""); // Pre-fill section

//             // Calculate and pre-fill Tuition Fee (Annual = Monthly * 12)
//             // IMPORTANT: Assumes student object has 'baseMonthlyFee' property
//             const monthlyFee = parseFloat(student.baseMonthlyFee || 0);
//             if (monthlyFee > 0) {
//                 setTuitionFee((monthlyFee * 12).toString());
//             } else {
//                 setTuitionFee("1000"); // Default if no baseMonthlyFee found
//             }
//         } else {
//             // "Enter Manually / Clear" selected or selection cleared
//             setAdmissionNo("");
//             setStudentName("");
//             setFatherName("");
//             setClassNameDisplay("");
//             setSectionDisplay("");
//             setTuitionFee("1000"); // Reset tuition fee to default
//         }
//     }, [allStudents]); // Removed setTuitionFee from dependencies, it's being set
    
//     // Auto-fill student details if admissionNo is typed manually
//     useEffect(() => {
//         // Only run if admissionNo is typed and no student is actively selected from dropdown
//         // Or if dropdown selection is cleared and admissionNo changes
//         if (!selectedStudentIdForPrefill && admissionNo) {
//             const studentByAdmNo = allStudents.find(s => s.admissionNumber === admissionNo);
//             if (studentByAdmNo) {
//                 setStudentName(studentByAdmNo.studentName || "");
//                 setFatherName(studentByAdmNo.fatherName || "");
//                 setClassNameDisplay(studentByAdmNo.class || "");
//                 setSectionDisplay(studentByAdmNo.section || "");
//                 // Note: Tuition fee is NOT set here to allow manual fee entry if Adm.No. is typed
//             } else {
//                 setStudentName(""); // Clear if no matching student
//                 setFatherName("");
//                 setClassNameDisplay("");
//                 setSectionDisplay("");
//             }
//         } else if (!selectedStudentIdForPrefill && !admissionNo) {
//             // If admissionNo is cleared manually and no student is selected from dropdown
//             setStudentName("");
//             setFatherName("");
//             setClassNameDisplay("");
//             setSectionDisplay("");
//         }
//         // If selectedStudentIdForPrefill is set, handleStudentSelectForPrefill handles these fields.
//     }, [admissionNo, allStudents, selectedStudentIdForPrefill]);


//     // --- Placeholder Replacement ---
//     const replacePlaceholders = useCallback((template, data) => {
//         if (!template) return `<div>Error: Template is missing.</div>`;
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 return String(data[cleanKey] ?? '');
//             });
//         } catch (error) {
//             console.error(`Error rendering template:`, error);
//             return `<div>Template Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []);

//     // --- Data for Template ---
//     const getReimbursementDataForTemplate = useCallback(() => {
//         const schoolDetails = session || {};
//         return {
//             backgroundImage: bg,
//             admNo_display: admissionNo,
//             studentName_display: studentName || (admissionNo ? "N/A" : ""),
//             fatherName_display: fatherName || (admissionNo ? "N/A" : ""), // Add father's name to template data
//             className_display: classNameDisplay || (admissionNo ? "N/A" : ""), // Add class to template data
//             section_display: sectionDisplay || (admissionNo ? "N/A" : ""),   // Add section to template data
//             tuitionFee_display: parseFloat(tuitionFee) || "0.00",
//             admissionFee_display: parseFloat(admissionFee) || "0.00",
//             annualFee_display: parseFloat(annualFee) || "0.00",
//             inventoryFee_display: parseFloat(inventoryFee) || "0.00",
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
//     }, [admissionNo, studentName, fatherName, classNameDisplay, sectionDisplay, // Added new states
//         tuitionFee, admissionFee, annualFee, inventoryFee, miscFee1, miscFee2, otherFee, totalFee, session, bg]);


//     const renderSlipForPrint = useCallback(() => {
//         return replacePlaceholders(reimbursementTemplate, getReimbursementDataForTemplate());
//     }, [reimbursementTemplate, getReimbursementDataForTemplate, replacePlaceholders]);

//     // --- Print Handler ---
//     const printRef = React.useRef(); // Create a ref for the preview content
//     const handlePrint = useReactToPrint({
//         content: () => {
//             if (!admissionNo && totalFee === 0) {
//                 toast.warn("Please enter some details before printing.");
//                 return null;
//             }
//             // Temporarily create the content for printing
//             // This ensures the background image is correctly processed by useReactToPrint
//             const printContainer = document.createElement('div');
//             printContainer.innerHTML = renderSlipForPrint();
//             // The first child of printContainer is the actual slip div with the background
//             return printContainer.firstChild;
//         },
//         documentTitle: `Reimbursement_Slip_${admissionNo || 'Custom'}_${moment().format('YYYYMMDD_HHmm')}`,
//         onBeforeGetContent: () => setIsLoader(true),
//         onAfterPrint: () => { setIsLoader(false); toast.success(`Reimbursement slip prepared!`); },
//         pageStyle: `
//           @page {
//             size: ${layoutConstants.pageStyleSize}; 
//             margin: ${layoutConstants.marginMM}mm;
//           }
//           @media print {
//             body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//             html, body {
//                 width: ${PAGE_WIDTH_MM}mm;
//                 height: ${PAGE_HEIGHT_MM}mm;
//                 margin: 0 !important;
//                 padding: 0 !important;
//                 overflow: hidden;
//             }
//             /* Target the specific div for printing */
//             div[style*="background-image"] { /* Or a more specific selector if needed */
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


//     return (
//         <>
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Reimbursement Slip (A4)" />
//             <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Paper elevation={2} className="no-print" sx={{ p: 2, mb: 3 }}>
//                     <Typography variant="h6" gutterBottom>Enter Reimbursement Details</Typography>
//                     <Grid container spacing={2}>
//                         <Grid item xs={12} md={4}>
//                            <ReactSelect
//                                 label="Filter by Class (for Student List)"
//                                 value={classOptionsForFilter.find(opt => opt.value === selectedClassForFilter) || null} // ensure value prop is object or null
//                                 handleChange={(selectedOption) => setSelectedClassForFilter(selectedOption ? selectedOption.value : "")}
//                                 dynamicOptions={classOptionsForFilter}
//                                 placeholder="Select Class to Filter Students"
//                                 isDisabled={isStudentDataLoading}
//                             />
//                         </Grid>
//                         <Grid item xs={12} md={8}>
//                              <ReactSelect
//                                 label="Select Student to Pre-fill (Optional)"
//                                 value={studentOptionsForPrefill.find(opt => opt.value === selectedStudentIdForPrefill) || null}
//                                 handleChange={handleStudentSelectForPrefill} // Already a callback
//                                 dynamicOptions={[{label: "Enter Manually / Clear", value:""}, ...studentOptionsForPrefill]}
//                                 placeholder="Search and Select Student..."
//                                 isClearable
//                                 isDisabled={isStudentDataLoading || !allStudents.length}
//                             />
//                         </Grid>

                       

//                         <Grid item xs={12}><hr style={{marginBlock: '10px'}}/></Grid>

//                         <Grid item xs={6} md={3}><TextField fullWidth label="Tuition Fee" variant="outlined" size="small" type="number" value={tuitionFee} onChange={e => setTuitionFee(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={3}><TextField fullWidth label="Admission Fee" variant="outlined" size="small" type="number" value={admissionFee} onChange={e => setAdmissionFee(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={3}><TextField fullWidth label="Annual Fee" variant="outlined" size="small" type="number" value={annualFee} onChange={e => setAnnualFee(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={3}><TextField fullWidth label="Inventory Fee" variant="outlined" size="small" type="number" value={inventoryFee} onChange={e => setInventoryFee(e.target.value)} /></Grid>
                        
//                         <Grid item xs={6} md={4}><TextField fullWidth label="Miscellaneous Fee 1" variant="outlined" size="small" type="number" value={miscFee1} onChange={e => setMiscFee1(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={4}><TextField fullWidth label="Miscellaneous Fee 2" variant="outlined" size="small" type="number" value={miscFee2} onChange={e => setMiscFee2(e.target.value)} /></Grid>
//                         <Grid item xs={12} md={4}><TextField fullWidth label="Other Fee" variant="outlined" size="small" type="number" value={otherFee} onChange={e => setOtherFee(e.target.value)} /></Grid>

//                         <Grid item xs={12}>
//                             <Typography variant="h6" sx={{ textAlign: 'right', mt: 1 }}>
//                                 Total: {totalFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </Typography>
//                         </Grid>
//                         <Grid item xs={12}>
//                             <Button fullWidth variant="contained" onClick={handlePrint} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={isLoader}>
//                                 {isLoader ? <CircularProgress size={20} color="inherit" /> : `Preview & Print Reimbursement Slip`}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </Paper>

//                 <Typography variant="h6" gutterBottom className="screen-only" sx={{ mt: 3, mb: 1 }}>
//                     Live Preview
//                 </Typography>
//                 <div ref={printRef} className="screen-only screen-a4-pages-container" style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
//                     {(isLoader && !admissionNo && totalFee === 0 && !selectedStudentIdForPrefill) ? (
//                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', p: 3 }}>
//                             <CircularProgress size={30} /><Typography sx={{ ml: 2 }}>Preparing...</Typography>
//                         </Box>
//                     ) : (
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
//                     overflow: hidden; /* Changed from auto to hidden for better preview fidelity */
//                 }
//             `}</style>
//         </>
//     );
// };

// export default Reimbrucement;


// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import '../../App.css';
// import {
//     Button, TextField, Typography, Box, CircularProgress,
//     Paper, Grid // Added Grid for layout
// } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/assets/Certificate/Reimbrucement.png"; // YOUR BACKGROUND IMAGE
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Kept for potential pre-fill
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Kept for potential pre-fill
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// // A4 Dimensions
// const PAGE_WIDTH_MM = 210;
// const PAGE_HEIGHT_MM = 297;

// const calculateLayoutConstants = () => {
//     return {
//         pageStyleSize: `A4 portrait`,
//         marginMM: 0, // No margin for full page background
//         itemWidthMM: PAGE_WIDTH_MM,
//         itemHeightMM: PAGE_HEIGHT_MM,
//         previewAspectRatio: `${PAGE_WIDTH_MM} / ${PAGE_HEIGHT_MM}`,
//     };
// };

// const Reimbrucement = () => {
//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const layoutConstants = useMemo(() => calculateLayoutConstants(), []);

//     // --- State for Reimbursement Inputs ---
//     const [admissionNo, setAdmissionNo] = useState("202513"); // From your image
//     const [studentName, setStudentName] = useState(""); // To display if Adm. No. matches a student
//     const [tuitionFee, setTuitionFee] = useState("1000");
//     const [admissionFee, setAdmissionFee] = useState("5000");
//     const [annualFee, setAnnualFee] = useState("1500");
//     const [inventoryFee, setInventoryFee] = useState("1000");
//     const [miscFee1, setMiscFee1] = useState(""); // New field 1
//     const [miscFee2, setMiscFee2] = useState(""); // New field 2
//     const [otherFee, setOtherFee] = useState("");   // New field 3 (making it 7 fee inputs total)
//     const [totalFee, setTotalFee] = useState(0);

//     // --- State for student pre-fill (optional) ---
//     const [allStudents, setAllStudents] = useState([]);
//     const [allClasses, setAllClasses] = useState([]);
//     const [selectedClassForFilter, setSelectedClassForFilter] = useState("");
//     const [selectedStudentIdForPrefill, setSelectedStudentIdForPrefill] = useState("");
//     const [isStudentDataLoading, setIsStudentDataLoading] = useState(false);

//     // --- Reimbursement Slip Template ---
//     const reimbursementTemplate = useMemo(() => `
//     <div style='background-color: #ffffff; background-image: url(\${backgroundImage}); background-position: center top; background-repeat: no-repeat; width: ${PAGE_WIDTH_MM}mm; height: ${PAGE_HEIGHT_MM}mm; position: relative; background-size: contain; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; padding: 20mm;'>
      
  

//       <!-- Student and Fee Details -->
//       <div style='font-size: 12pt; padding-left: 15mm; padding-right: 15mm;'>
//         <table style='width: 100%; border-collapse: collapse;'>
//           <tr><td style='padding: 4mm 0; width: 40%;'><strong>Admission No.:</strong></td><td style='padding: 4mm 0;'>\${admNo_display}</td></tr>
//           <tr><td style='padding: 4mm 0;'><strong>Student Name:</strong></td><td style='padding: 4mm 0;'>\${studentName_display}</td></tr>
//           <tr><td style='padding: 4mm 0; border-bottom: 1px solid #eee;' colspan='2'></td></tr>
          
//           <tr><td style='padding: 4mm 0;'>Tuition Fee:</td><td style='padding: 4mm 0; text-align: right;'>\${tuitionFee_display}</td></tr>
//           <tr><td style='padding: 4mm 0;'>Admission Fee:</td><td style='padding: 4mm 0; text-align: right;'>\${admissionFee_display}</td></tr>
//           <tr><td style='padding: 4mm 0;'>Annual Fee:</td><td style='padding: 4mm 0; text-align: right;'>\${annualFee_display}</td></tr>
//           <tr><td style='padding: 4mm 0;'>Inventory Fee:</td><td style='padding: 4mm 0; text-align: right;'>\${inventoryFee_display}</td></tr>
//           \${miscFee1_display ? "<tr><td style='padding: 4mm 0;'>Miscellaneous Fee 1:</td><td style='padding: 4mm 0; text-align: right;'>" + \`\${miscFee1_display}\` + "</td></tr>" : ""}
//           \${miscFee2_display ? "<tr><td style='padding: 4mm 0;'>Miscellaneous Fee 2:</td><td style='padding: 4mm 0; text-align: right;'>" + \`\${miscFee2_display}\` + "</td></tr>" : ""}
//           \${otherFee_display ? "<tr><td style='padding: 4mm 0;'>Other Fee:</td><td style='padding: 4mm 0; text-align: right;'>" + \`\${otherFee_display}\` + "</td></tr>" : ""}
          
//           <tr><td style='padding: 6mm 0; border-top: 2px solid #333; font-weight: bold;'>Total:</td><td style='padding: 6mm 0; text-align: right; border-top: 2px solid #333; font-weight: bold;'>\${totalFee_display}</td></tr>
//         </table>
//       </div>

    
//     </div>
//     `, [PAGE_WIDTH_MM, PAGE_HEIGHT_MM]); // Dependencies for width/height if they were dynamic

//     // --- Calculate Total Fee ---
//     useEffect(() => {
//         const fees = [
//             tuitionFee, admissionFee, annualFee, inventoryFee,
//             miscFee1, miscFee2, otherFee
//         ].map(fee => parseFloat(fee) || 0);
//         const sum = fees.reduce((acc, val) => acc + val, 0);
//         setTotalFee(sum);
//     }, [tuitionFee, admissionFee, annualFee, inventoryFee, miscFee1, miscFee2, otherFee]);

//     // --- Data Fetching for Pre-fill (Optional) ---
//     const fetchStudentDataForPrefill = useCallback(async () => {
//         if (!session) return;
//         setIsStudentDataLoading(true);
//         try {
//             const [classRes, studentRes] = await Promise.all([
//                 AdminGetAllClasses(),
//                 ActiveStudents(session)
//             ]);
//             if (classRes?.success) setAllClasses(classRes.classes || []);
//             if (studentRes?.success && studentRes.students?.data) setAllStudents(studentRes.students.data || []);
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

//     // --- Handle Student Selection for Pre-fill ---
//     const handleStudentSelectForPrefill = (selectedOption) => {
//         const studentId = selectedOption ? selectedOption.value : "";
//         setSelectedStudentIdForPrefill(studentId);
//         const student = allStudents.find(s => s._id === studentId);
//         if (student) {
//             setAdmissionNo(student.admissionNumber || "");
//             setStudentName(student.studentName || "");
//             // You could also pre-fill fees if they are part of student data
//         } else {
//             // If "All" or cleared, reset only if you want
//             // setAdmissionNo(""); // Or keep manually entered
//             // setStudentName("");
//         }
//     };
    
//     // Find student name if admissionNo is typed manually
//     useEffect(() => {
//         const student = allStudents.find(s => s.admissionNumber === admissionNo);
//         if (student) {
//             setStudentName(student.studentName || "");
//         } else {
//             setStudentName(""); // Clear if no matching student
//         }
//     }, [admissionNo, allStudents]);


//     // --- Placeholder Replacement ---
//     const replacePlaceholders = useCallback((template, data) => {
//         if (!template) return `<div>Error: Template is missing.</div>`;
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 return String(data[cleanKey] ?? ''); // Handle null/undefined gracefully
//             });
//         } catch (error) {
//             console.error(`Error rendering template:`, error);
//             return `<div>Template Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []);

//     // --- Data for Template ---
//     const getReimbursementDataForTemplate = useCallback(() => {
//         // Fetch school details from localStorage or a config
//         const schoolDetails = session || {}; // Assuming session has schoolName etc.

//         return {
//             backgroundImage: bg, // The imported background image
//             admNo_display: admissionNo,
//             studentName_display: studentName || (admissionNo ? "N/A" : ""), // Show N/A if admNo exists but no name found
//             tuitionFee_display: parseFloat(tuitionFee) || "0.00",
//             admissionFee_display: parseFloat(admissionFee) || "0.00",
//             annualFee_display: parseFloat(annualFee) || "0.00",
//             inventoryFee_display: parseFloat(inventoryFee) || "0.00",
//             miscFee1_display: miscFee1 ? (parseFloat(miscFee1) || "0.00") : "",
//             miscFee2_display: miscFee2 ? (parseFloat(miscFee2) || "0.00") : "",
//             otherFee_display: otherFee ? (parseFloat(otherFee) || "0.00") : "",
//             totalFee_display: totalFee.toFixed(2),
//             schoolFullName: schoolDetails.schoolName || "Your School/College Name",
//             schoolAddress: schoolDetails.schoolAddress || "123 Education Lane, Knowledge City",
//             schoolPhone: schoolDetails.schoolPhone || "555-1234",
//             schoolEmail: schoolDetails.schoolEmail || "contact@school.com",
//             sessionName: schoolDetails.name || moment().format("YYYY") + "-" + moment().add(1, 'year').format("YY"), // Example session
//             currentDate: moment().format("DD-MMM-YYYY"),
//         };
//     }, [admissionNo, studentName, tuitionFee, admissionFee, annualFee, inventoryFee, miscFee1, miscFee2, otherFee, totalFee, session, bg]);


//     const renderSlipForPrint = useCallback(() => {
//         return replacePlaceholders(reimbursementTemplate, getReimbursementDataForTemplate());
//     }, [reimbursementTemplate, getReimbursementDataForTemplate, replacePlaceholders]);

//     // --- Print Handler ---
//     const handlePrint = useReactToPrint({
//         content: () => {
//             if (!admissionNo && totalFee === 0) { // Basic validation
//                 toast.warn("Please enter some details before printing.");
//                 return null;
//             }
//             setIsLoader(true);
//             const printContainer = document.createElement('div');
//             const slipHtml = renderSlipForPrint();
//             printContainer.innerHTML = slipHtml;
//             return printContainer;
//         },
//         documentTitle: `Reimbursement_Slip_${admissionNo || 'Custom'}_${moment().format('YYYYMMDD_HHmm')}`,
//         onAfterPrint: () => { setIsLoader(false); toast.success(`Reimbursement slip prepared!`); },
//         pageStyle: `
//           @page {
//             size: ${layoutConstants.pageStyleSize}; 
//             margin: ${layoutConstants.marginMM}mm;
//           }
//           @media print {
//             body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//             /* Ensure the single div inside printContainer takes full page */
//             div > div { 
//                 width: ${PAGE_WIDTH_MM}mm !important; 
//                 height: ${PAGE_HEIGHT_MM}mm !important;
//                 box-sizing: border-box !important; 
//                 overflow: hidden !important; 
//                 display: block !important;
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
//         return studentsToList.map(s => ({ label: `${s.studentName} (Adm: ${s.admissionNumber}, Cls: ${s.class}${s.section ? '-'+s.section : ''})`, value: s._id }));
//     }, [allStudents, selectedClassForFilter]);

//     const classOptionsForFilter = useMemo(() => {
//         return [{ label: "All Classes", value: "" }, ...allClasses.map(c => ({ label: c.className, value: c.className }))]
//     }, [allClasses]);


//     return (
//         <>
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Reimbursement Slip (A4)" />
//             <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Paper elevation={2} className="no-print" sx={{ p: 2, mb: 3 }}>
//                     <Typography variant="h6" gutterBottom>Enter Reimbursement Details</Typography>
//                     <Grid container spacing={2}>
//                         {/* Optional: Student Selector for Prefill */}
//                         <Grid item xs={12} md={4}>
//                            <ReactSelect
//                                 label="Filter by Class (for Student List)"
//                                 value={selectedClassForFilter}
//                                 handleChange={(e) => setSelectedClassForFilter(e.target.value)}
//                                 dynamicOptions={classOptionsForFilter}
//                                 placeholder="Select Class to Filter Students"
//                                 isDisabled={isStudentDataLoading}
//                             />
//                         </Grid>
//                         <Grid item xs={12} md={8}>
//                              <ReactSelect
//                                 label="Select Student to Pre-fill Adm.No & Name (Optional)"
//                                 value={studentOptionsForPrefill.find(opt => opt.value === selectedStudentIdForPrefill) || null}
//                                 handleChange={handleStudentSelectForPrefill}
//                                 dynamicOptions={[{label: "Enter Manually / Clear", value:""}, ...studentOptionsForPrefill]}
//                                 placeholder="Search and Select Student..."
//                                 isClearable
//                                 isDisabled={isStudentDataLoading}
//                             />
//                         </Grid>


//                         <Grid item xs={12} md={4}>
//                             <TextField fullWidth label="Admission No." variant="outlined" size="small" value={admissionNo} onChange={e => setAdmissionNo(e.target.value)} />
//                         </Grid>
//                         <Grid item xs={12} md={8}>
//                             <TextField fullWidth label="Student Name (Auto-filled if Adm.No. matches)" variant="outlined" size="small" value={studentName} InputProps={{ readOnly: true }} />
//                         </Grid>
//                         <Grid item xs={12}><hr/></Grid>

//                         <Grid item xs={6} md={3}><TextField fullWidth label="Tuition Fee" variant="outlined" size="small" type="number" value={tuitionFee} onChange={e => setTuitionFee(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={3}><TextField fullWidth label="Admission Fee" variant="outlined" size="small" type="number" value={admissionFee} onChange={e => setAdmissionFee(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={3}><TextField fullWidth label="Annual Fee" variant="outlined" size="small" type="number" value={annualFee} onChange={e => setAnnualFee(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={3}><TextField fullWidth label="Inventory Fee" variant="outlined" size="small" type="number" value={inventoryFee} onChange={e => setInventoryFee(e.target.value)} /></Grid>
                        
//                         <Grid item xs={6} md={4}><TextField fullWidth label="Miscellaneous Fee 1" variant="outlined" size="small" type="number" value={miscFee1} onChange={e => setMiscFee1(e.target.value)} /></Grid>
//                         <Grid item xs={6} md={4}><TextField fullWidth label="Miscellaneous Fee 2" variant="outlined" size="small" type="number" value={miscFee2} onChange={e => setMiscFee2(e.target.value)} /></Grid>
//                         <Grid item xs={12} md={4}><TextField fullWidth label="Other Fee" variant="outlined" size="small" type="number" value={otherFee} onChange={e => setOtherFee(e.target.value)} /></Grid>

//                         <Grid item xs={12}>
//                             <Typography variant="h6" sx={{ textAlign: 'right', mt: 1 }}>
//                                 Total: {totalFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                             </Typography>
//                         </Grid>
//                         <Grid item xs={12}>
//                             <Button fullWidth variant="contained" onClick={handlePrint} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={isLoader}>
//                                 {isLoader ? <CircularProgress size={20} color="inherit" /> : `Preview & Print Reimbursement Slip`}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </Paper>

//                 <Typography variant="h6" gutterBottom className="screen-only" sx={{ mt: 3, mb: 1 }}>
//                     Live Preview
//                 </Typography>
//                 <div className="screen-only screen-a4-pages-container" style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
//                     {(isLoader && !admissionNo && totalFee === 0) ? ( // Only show loader if actively printing and form was empty
//                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', p: 3 }}>
//                             <CircularProgress size={30} /><Typography sx={{ ml: 2 }}>Preparing...</Typography>
//                         </Box>
//                     ) : (
//                         <Paper elevation={3} className="screen-a4-page" style={{
//                             width: `min(100%, ${layoutConstants.itemWidthMM}mm)`, // Show preview at actual A4 width or screen width
//                             maxWidth: `${layoutConstants.itemWidthMM}mm`, // Ensure it doesn't exceed A4 width
//                             height: `${layoutConstants.itemHeightMM}mm`, // Fixed height for A4
//                             aspectRatio: layoutConstants.previewAspectRatio,
//                             margin: '0 auto' // Center the preview
//                         }}>
//                             <div className="screen-slip-layout-area" style={{ transform: 'scale(1)', width: '100%', height: '100%'}}> {/* Scale slightly for better view */}
//                                  <div dangerouslySetInnerHTML={{ __html: renderSlipForPrint() }} />
//                             </div>
//                         </Paper>
//                     )}
//                 </div>
//             </Box>

//             {/* Global Styles for Preview - Simplified */}
//             <style jsx global>{`
//                 .screen-a4-pages-container { 
//                     margin-top:10px; 
//                     border:1px solid #e0e0e0; 
//                     padding:15px; 
//                     background-color:#e9ecef; 
//                     display: flex; /* Keep flex for centering */
//                     flex-wrap: wrap;
//                     gap: 15px; 
//                     min-height: 300px; /* Taller min-height for A4 */
//                 }
//                 .screen-a4-page { 
//                     background-color:white; 
//                     border:1px solid #ccc; 
//                     box-sizing:border-box; 
//                     overflow: hidden; /* Important: content within will be clipped to A4 */
//                     /* width, height, aspectRatio are set inline */
//                 }
//                 .screen-slip-layout-area { /* Area where the slip HTML is injected */
//                     width:100% !important; 
//                     height:100% !important;
//                     box-sizing:border-box !important; 
//                     overflow:hidden; /* Clips the content to the aspect ratio */
//                 }
//                 /* This is the div rendered from your HTML template string */
//                 .screen-slip-layout-area > div {
//                     width: ${PAGE_WIDTH_MM}mm !important; 
//                     height: ${PAGE_HEIGHT_MM}mm !important; 
//                     box-sizing:border-box !important;
//                     overflow: auto; /* Allow scrolling within the previewed slip if content overflows design */
//                 }
//             `}</style>
//         </>
//     );
// };

// export default Reimbrucement;






// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import '../../App.css'; 
// import {
//     Button, TextField, Typography, Box, CircularProgress,
//     Checkbox, FormControlLabel,
//     List, ListItem, ListItemText, Paper, Divider
// } from "@mui/material"; // Added List components
// import bg from "../../ShikshMitraWebsite/assets/Certificate/Reimbrucement.png"
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";


// const CARD_WIDTH_MM = 210;
// const CARD_HEIGHT_MM = 297;

// // Helper to chunk array (not directly used for preview pagination anymore, but good utility)
// const chunkArray = (array, size) => {
//     if (size <= 0) return [array];
//     const chunked_arr = [];
//     let index = 0;
//     while (index < array.length) {
//         chunked_arr.push(array.slice(index, size + index));
//         index += size;
//     }
//     return chunked_arr;
// };

// // Layout constants remain focused on the single A4 portrait item
// const calculateLayoutConstants = () => {
//     const orientation = 'portrait';
//     const marginMM = 0;
//     const pagePhysicalWidth = 210;
//     const pagePhysicalHeight = 297;
//     const pageContentWidth = pagePhysicalWidth - (2 * marginMM);
//     const pageContentHeight = pagePhysicalHeight - (2 * marginMM);

//     return {
//         orientation,
//         pageStyleSize: `A4 ${orientation}`,
//         marginMM,
//         itemWidthMM: pageContentWidth,
//         itemHeightMM: pageContentHeight,
//         previewAspectRatio: `${pagePhysicalWidth} / ${pagePhysicalHeight}`,
//     };
// };


// const Reimbrucement = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null);
//     const [studentData, setStudentData] = useState([]);
//     const [classData, setClassData] = useState([]);
//     const [filteredStudentData, setFilteredStudentData] = useState([]);
//     const [filterName, setFilterName] = useState("");
//     const [selectedClass, setSelectedClass] = useState("");
//     const [selectedSection, setSelectedSection] = useState("");
//     const [isLoadingData, setIsLoadingData] = useState(true);
//     const [printMode, setPrintMode] = useState('front');
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     // componentRef not used for react-to-print's content directly anymore

//     // --- Dynamic Layout Constants ---
//     const layoutConstants = useMemo(() => calculateLayoutConstants(), []);


//     // --- Default Templates (Ensure these are designed for 210mm x 297mm) ---
//     const [defaultFrontTemplate] = useState(`
//     <div style='background-color: #ffffff; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
//       <div style='position: relative; z-index: 2; padding: 15mm;'>
//           <div style='text-align: center; margin-top: 20mm; margin-bottom: 15mm;'><h3 style='margin: 0; font-size: 28pt; color: #333;'>\${schoolFullName || "SCHOOL NAME HERE"}</h3><p style='margin: 5mm 0; font-size: 20pt; color: #666;'>Session: \${session}</p><h4 style='margin: 10mm 0 5mm 0; font-size: 22pt; color: #444;'>STUDENT IDENTITY CARD</h4></div>
//           <div style='display:flex; flex-direction:row; margin-top:10mm; align-items:flex-start;'>
//             <div style='margin-right: 15mm; text-align:center;'>
//                 <img src='\${studentImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}' style='width: 50mm; height: 60mm; border: 2px solid #aaa; border-radius: 4px; object-fit: cover; margin-bottom:5mm;' alt="Photo"/>
//                 <img src='\${principalSignature || "https://via.placeholder.com/150x50.png?text=Principal+Signature"}' style='width: 40mm; height: auto; margin-top:10mm;' alt="Principal Signature"/>
//                 <p style='font-size:10pt; margin-top:1mm;'>Principal</p>
//             </div>
//             <div style='font-size: 14pt; flex-grow:1;'>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Student's Name:</strong> <span style='text-align:right;'>\${name}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Father's Name:</strong> <span style='text-align:right;'>\${father_name}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Mother's Name:</strong> <span style='text-align:right;'>\${mother_name}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Class:</strong> <span style='text-align:right;'>\${class}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Roll No:</strong> <span style='text-align:right;'>\${rollNo}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Admission No:</strong> <span style='text-align:right;'>\${admissionNumber}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Date of Birth:</strong> <span style='text-align:right;'>\${dob}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Contact No:</strong> <span style='text-align:right;'>\${mobile}</span></p>
//                 <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Address:</strong> <span style='text-align:right; max-width:60%; word-break:break-word;'>\${address}</span></p>
//             </div>
//           </div>
//           <div style='text-align: center; font-size: 10pt; color: #777; margin-top: auto; padding-top:20mm; bottom: 10mm; width:100%; position:absolute; left:0;'>
//             <p style='margin:1mm 0;'>\${schoolAddress || "School Address Line 1, City, State - Pincode"}</p>
//             <p style='margin:1mm 0;'>Phone: \${schoolPhone || "XXX-XXXXXXX"} | Email: \${schoolEmail || "info@school.com"}</p>
//           </div>
//       </div>
//     </div>
//     `);



//     // --- Data Fetching and Processing Callbacks (Core logic unchanged) ---
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
//         } catch (error) { console.error("Error decoding base64 string:", error, "Input:", encoded); return null; }
//     }, []);

//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 setIdCardData(response.designFormats[0]);
//             } else {
//                 setIdCardData(null);
//                 if(response && !response.success) toast.warn("Custom template not found or error: " + (response.message || "Using default."));
//             }
//         } catch (error) { console.error("Error fetching ID card design:", error); toast.error("Could not load custom template. Using default."); setIdCardData(null); }
//     }, []);

//     const fetchAllClasses = useCallback(async () => {
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) setClassData(response.classes || []);
//             else { toast.error(response?.message || "Failed to fetch classes."); setClassData([]); }
//         } catch (error) { console.error("Error fetching classes:", error); toast.error("An error occurred while fetching classes."); setClassData([]); }
//     }, []);

//     const fetchAllStudents = useCallback(async () => {
//         if (!session) { toast.error("Session information is missing."); setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return; }
//         setIsLoadingData(true);
//         try {
//             const response = await ActiveStudents(session);
//             if (response?.success && response.students?.data) setStudentData(response.students.data || []);
//             else { toast.error(response?.message || "Failed to fetch students."); setStudentData([]); }
//         } catch (error) { console.error("Error fetching students:", error); toast.error("An error occurred while fetching students."); setStudentData([]); }
//         finally { setIsLoadingData(false); }
//     }, [session]);

//     useEffect(() => { Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]); }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//     useEffect(() => {
//         if (isLoadingData) return;
//         let filtered = studentData;
//         if (selectedClass) filtered = filtered.filter(s => s.class === selectedClass);
//         if (selectedSection) filtered = filtered.filter(s => (s.section || null) === selectedSection);
//         if (filterName) {
//             const lowerCaseFilter = filterName.toLowerCase().trim();
//             filtered = filtered.filter(s =>
//                 s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//                 s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
//             );
//         }
//         setFilteredStudentData(filtered);
//         // Do NOT reset selectedStudentIds here, so selections persist across minor filter text changes
//         // Only reset if class/section changes or explicitly cleared.
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);
    
//     // Reset selections if class or section changes
//     useEffect(() => {
//         setSelectedStudentIds(new Set());
//     }, [selectedClass, selectedSection]);


//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); /* setSelectedStudentIds(new Set()); Already handled by useEffect */};
//     const handleSectionChange = (e) => setSelectedSection(e.target.value); /* setSelectedStudentIds(new Set()); Already handled by useEffect */

//     const handleSelectAllChange = (event) => {
//         if (event.target.checked) {
//             setSelectedStudentIds(new Set(filteredStudentData.map(s => s._id).filter(Boolean)));
//         } else {
//             setSelectedStudentIds(new Set());
//         }
//     };
//     const handleSelectSingleChange = (event, studentId) => {
//         if (!studentId) return;
//         setSelectedStudentIds(prev => {
//             const newSet = new Set(prev);
//             if (event.target.checked) newSet.add(studentId);
//             else newSet.delete(studentId);
//             return newSet;
//         });
//     };

//     const decodedApiFrontTemplate = useMemo(() => idCardData?.frontTemplate ? decodeBase64(idCardData.frontTemplate) : null, [idCardData, decodeBase64]);
 
//     const frontTemplateToUse = bg;

    
//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         if (!template) return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:12pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>Missing Template for ${cardSide}</div>`;
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 let value = data;
//                 // Basic dot notation access (e.g., student.name), not deep nesting.
//                 if (cleanKey.includes('.')) {
//                     const keys = cleanKey.split('.');
//                     value = keys.reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : undefined, data);
//                 } else {
//                     value = data[cleanKey];
//                 }

//                 if (value === undefined || value === null || value === '') {
//                     const lowerKey = cleanKey.toLowerCase();
//                     if (lowerKey.includes('image') && (lowerKey.includes('student') || lowerKey.includes('father') || lowerKey.includes('mother') || lowerKey.includes('guardian') || lowerKey.includes('background') || lowerKey.includes('signature'))) {
//                         return "https://via.placeholder.com/150x150.png?text=No+Image"; // Generic placeholder
//                     }
//                 }
//                 return String(value ?? '');
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:12pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); 

//     const getStudentTemplateData = useCallback((student) => ({
//         backgroundImageFront: idCardData?.frontImage?.url || "", 
//         backgroundImageBack: idCardData?.backImage?.url || "",
//         studentImage: student?.studentImage?.url,
//         name: student?.studentName?.toUpperCase() || 'N/A',
//         dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//         class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//         section: student?.section || 'N/A',
//         gender: student?.gender || 'N/A',
//         contact: student?.contact || 'N/A', 
//         transport: student?.transport || 'N/A',
//         father_name: student?.fatherName?.toUpperCase() || 'N/A',
//         mother_name: student?.motherName?.toUpperCase() || 'N/A',
//         mobile: student?.contact || student?.parentContact || 'N/A', 
//         address: student?.address || 'N/A',
//         session: student?.sessionName || session?.name || 'N/A', 
//         admissionNumber: student?.admissionNumber || 'N/A',
//         fatherImage: student?.fatherImage?.url,
//         motherImage: student?.motherImage?.url,
//         guardianImage: student?.guardianImage?.url,
//         guardianname: student?.guardianName || 'N/A',
//         parentContact: student?.parentContact || 'N/A', 
//         rollNo: student?.rollNo || 'N/A',
//         // School specific details (ideally from context or settings)
//         schoolFullName: idCardData?.schoolName || session?.schoolName || "YOUR SCHOOL NAME",
//         schoolAddress: idCardData?.schoolAddress || session?.schoolAddress || "School Address, City, Pincode",
//         schoolPhone: idCardData?.schoolPhone || session?.schoolPhone || "000-0000000",
//         schoolEmail: idCardData?.schoolEmail || session?.schoolEmail || "info@yourschool.com",
//         principalSignature: idCardData?.principalSignatureImage?.url || "", 
//         issueDate: moment().format("DD MMMM YYYY"),
//         validityDate: moment().add(1, 'year').format("DD MMMM YYYY"),
//         bloodGroup: student?.bloodGroup || 'N/A', // Example: Add student.bloodGroup to your data
//         allergies: student?.allergies || 'None Reported', // Example: Add student.allergies
//     }), [idCardData, session]);

//     const renderFrontTemplate = useCallback((s) => replacePlaceholders(frontTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageFront}, 'Front'), [getStudentTemplateData, frontTemplateToUse, replacePlaceholders]);
//     // const renderBackTemplate = useCallback((s) => replacePlaceholders(backTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageBack}, 'Back'), [getStudentTemplateData, backTemplateToUse, replacePlaceholders]);

//     const studentsToPrint = useMemo(() => {
//         // Important: Ensure student objects are complete for studentsToPrint
//         return filteredStudentData.filter(s => s?._id && selectedStudentIds.has(s._id));
//     }, [filteredStudentData, selectedStudentIds]);


//     const generatePDF = useReactToPrint({
//         content: () => {
//             if (studentsToPrint.length === 0) {
//                 toast.warn("No students selected to print.");
//                 return null; // Prevent print dialog if nothing is selected
//             }
//             setIsLoader(true);
//             const printContainer = document.createElement('div');
//             studentsToPrint.forEach((student) => {
//                 if (printMode === 'front' || printMode === 'both') {
//                     const frontHtml = renderFrontTemplate(student);
//                     const pageWrapperForFront = document.createElement('div');
//                     pageWrapperForFront.className = 'print-page-wrapper';
//                     pageWrapperForFront.innerHTML = frontHtml;
//                     printContainer.appendChild(pageWrapperForFront);
//                 }
               
//             });
//             return printContainer;
//         },
//         documentTitle: `Student_Items_${printMode}_${selectedClass||'All'}_${selectedSection||'All'}_${moment().format('YYYYMMDD_HHmm')}`,
//         onAfterPrint: () => { setIsLoader(false); if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length * (printMode === 'both' ? 2 : 1)} page(s) prepared!`); },
//         pageStyle: `
//           @page {
//             size: A4 portrait; 
//             margin: ${layoutConstants.marginMM}mm;
//           }
//           @media print {
//             body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//             .print-page-wrapper { page-break-after: always !important; line-height: 1; }
//             .print-page-wrapper > div { 
//                 width: ${CARD_WIDTH_MM}mm !important; height: ${CARD_HEIGHT_MM}mm !important;
//                 box-sizing: border-box !important; overflow: hidden !important; display: block !important;
//                 background-color: transparent !important;
//             }
//             .print-page-wrapper:last-child { page-break-after: avoid !important; }
//             .no-print, .screen-only { display: none !important; }
//           }
//         `,
//     });

//     const classOptions = useMemo(() => classData.map(c => ({ label: c.className, value: c.className })), [classData]);
//     const sectionOptions = useMemo(() => (classData.find(c => c.className === selectedClass)?.sections || []).map(s => ({ label: s, value: s })), [classData, selectedClass]);
//     const isSelectAllChecked = useMemo(() => filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length, [filteredStudentData, selectedStudentIds]);

//     return (
//         <>
//          <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Print Full Page Student Items (A4)"/>
//             <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 {/* Filter Bar */}
//                 <Paper elevation={2} className="no-print" sx={{ p: 2, mb: 2 }}>
//                     <Typography variant="h6" gutterBottom>Filter Students</Typography>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
//                         <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData}/>
//                         <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section"/>
//                         <TextField fullWidth label="Filter by Name / Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}/>
                        
//                         <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
//                             <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}>
//                                 {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
//                             </Button>
//                         </Box>
//                     </div>
//                 </Paper>
                       
//                 {/* Student Selection List */}
//                 <Paper elevation={2} className="no-print" sx={{ mb: 2 }}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
//                         {!isLoadingData && filteredStudentData.length > 0 && (
//                             <FormControlLabel
//                                 control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange}/>}
//                                 label={`Select All (${filteredStudentData.length} found)`}
//                                 sx={{ mr: 'auto' }}
//                             />
//                         )}
//                         <Typography variant="caption">{selectedStudentIds.size} student(s) selected</Typography>
//                     </Box>
//                     {isLoadingData && (
//                         <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%', p:3 }}>
//                             <CircularProgress size={25} /><Typography sx={{ml:2}}>Loading Student List...</Typography>
//                         </Box>
//                     )}
//                     {!isLoadingData && filteredStudentData.length === 0 && (
//                         <Typography sx={{textAlign:'center', width:'100%', color:'text.secondary', p:3}}>
//                             {studentData.length > 0 ? "No students match current filters." : "No active students found."}
//                         </Typography>
//                     )}
//                     {!isLoadingData && filteredStudentData.length > 0 && (
//                         <List dense sx={{ maxHeight: '300px', overflowY: 'auto', p:0 }}>
//                             {filteredStudentData.map((student, index) => (
//                                 <React.Fragment key={student._id}>
//                                     <ListItem
//                                         secondaryAction={
//                                             <Checkbox
//                                                 edge="end"
//                                                 onChange={(e) => handleSelectSingleChange(e, student._id)}
//                                                 checked={selectedStudentIds.has(student._id)}
//                                             />
//                                         }
//                                         disablePadding
//                                     >
//                                         <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl:2, pr:1, py:0.5, cursor:'pointer' }} onClick={(e) => {
//                                             // Allow clicking row to toggle checkbox if not clicking checkbox itself
//                                             if (e.target.type !== 'checkbox') {
//                                                 handleSelectSingleChange({ target: { checked: !selectedStudentIds.has(student._id) } }, student._id)
//                                             }
//                                         }}>
//                                             <img 
//                                                 src={student?.studentImage?.url || "https://via.placeholder.com/40?text=S"} 
//                                                 alt="S" 
//                                                 style={{width:32, height:32, borderRadius:'50%', marginRight:12, objectFit:'cover'}}
//                                             />
//                                             <ListItemText 
//                                                 primaryTypographyProps={{ variant: 'body2', noWrap: true }} 
//                                                 secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
//                                                 primary={student.studentName || 'N/A'} 
//                                                 secondary={`Adm: ${student.admissionNumber || 'N/A'} | Class: ${student.class || 'N/A'}${student.section ? `-${student.section}` : ''} | Roll: ${student.rollNo || 'N/A'}`} 
//                                             />
//                                         </Box>
//                                     </ListItem>
//                                     {index < filteredStudentData.length - 1 && <Divider component="li" />}
//                                 </React.Fragment>
//                             ))}
//                         </List>
//                     )}
//                 </Paper>


//                 {/* Preview Area for SELECTED students */}
//                 <Typography variant="h6" gutterBottom className="screen-only" sx={{mt: 3, mb:1}}>
//                     Preview of Selected Items ({studentsToPrint.length})
//                 </Typography>
//                 <div className="screen-only screen-a4-pages-container">
//                     {studentsToPrint.length === 0 && !isLoadingData && (
//                         <Typography sx={{textAlign:'center',width:'100%',fontStyle:'italic', color:'text.secondary', p:3}}>
//                             Select students from the list above to preview their items here.
//                         </Typography>
//                     )}
//                     {isLoadingData && studentsToPrint.length > 0 && ( /* Should not happen if selection tied to filtered data */
//                          <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%', p:3 }}>
//                             <CircularProgress size={25} /><Typography sx={{ml:2}}>Loading Preview...</Typography>
//                         </Box>
//                     )}
                    
//                     {studentsToPrint.map((student) => {
//                         if (!student || !student._id) return null; // Should be filtered by studentsToPrint already

//                         return (
//                             <Paper elevation={3} key={`preview-page-${student._id}`} className="screen-a4-page" style={{ 
//                                 width: `min(100%, ${layoutConstants.itemWidthMM / 2}mm)`, // Show previews smaller, e.g., half A4 width
//                                 aspectRatio: layoutConstants.previewAspectRatio 
//                             }}>
//                                 <Box sx={{p:0.5, borderBottom: '1px solid #eee', mb:0.5, backgroundColor: '#f0f0f0', textAlign:'center' }}>
//                                   <Typography variant="caption" sx={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis', fontWeight:'bold'}}>
//                                       {student.studentName || 'N/A'} (Adm: {student.admissionNumber || 'N/A'})
//                                   </Typography>
//                                 </Box>
//                                 <div className={`screen-id-card-layout-area`}>
//                                     <Box className="student-preview-wrapper-in-a4">
//                                         {printMode === 'front' && (<div className="id-card-preview" style={{border:'1px dashed #ccc'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/>)}
                                        
//                                     </Box>
//                                 </div>
//                             </Paper>
//                         );
//                     })}
//                 </div>
//             </Box>
//             {/* Global Styles for Preview */}
//             <style jsx global>{`
//                 .screen-a4-pages-container { 
//                     margin-top:10px; 
//                     border:1px solid #e0e0e0; 
//                     padding:15px; 
//                     background-color:#e9ecef; 
//                     display: flex;
//                     flex-wrap: wrap;
//                     gap: 15px; /* Gap between preview items */
//                     justify-content: center; /* Center preview items if they don't fill the row */
//                     min-height: 150px; /* Ensure container has some height even when empty */
//                 }
//                 .screen-a4-page { /* This is the container for one student's preview */
//                     background-color:white; 
//                     border:1px solid #ccc; 
//                     /* padding is handled by layoutConstants.marginMM which is 0 */
//                     box-sizing:border-box; 
//                     overflow: hidden; 
//                     display: flex;
//                     flex-direction: column;
//                     /* width and aspectRatio set inline for responsiveness */
//                 }
//                 .screen-id-card-layout-area { /* Area where the card HTML is injected */
//                     flex-grow: 1; 
//                     display:flex !important; 
//                     flex-direction:column !important; 
//                     justify-content:center !important; 
//                     align-items:center !important; 
//                     width:100% !important; 
//                     box-sizing:border-box !important; 
//                     overflow:hidden; /* Clips the content to the aspect ratio */
//                 }
//                 .student-preview-wrapper-in-a4 { /* Wrapper for the actual card content */
//                     width: 100%; 
//                     height: 100%; 
//                     box-sizing:border-box; 
//                     display:flex; 
//                     flex-direction:column; 
//                     align-items:center;
//                     justify-content:center; 
//                 }
//                 /* This is the div rendered from your HTML template string, scaled for preview */
//                 .id-card-preview { 
//                     width: 100% !important; 
//                     height: 100% !important; 
//                     /* Actual size is CARD_WIDTH_MM x CARD_HEIGHT_MM, this scales it down for preview */
//                     /* The scaling is implicitly handled by the parent's (.screen-a4-page) dimensions and aspect ratio */
//                     transform: scale(0.96); /* Make it slightly smaller than its container to see borders */
//                     transform-origin: center center;
//                     overflow:auto; /* Allows scrolling within the previewed card if content is larger */
//                     box-sizing:border-box !important; 
//                     background-color:#fff; 
//                 }
//                 /* For 'both' mode in preview, stack front and back */
//                 .student-preview-wrapper-in-a4 > div > .id-card-preview { /* Targets the direct children in 'both' mode's div */
//                      height: calc(50% - 1mm) !important; /* Each takes half height, adjust for gap */
//                      width: 100% !important;
//                      overflow: auto; /* Scroll individually if needed */
//                 }
//                  .student-preview-wrapper-in-a4 > div > .id-card-preview:only-child { /* If only front or only back */
//                      height: 100% !important; 
//                  }
//             `}</style>
//         </>
//     );
// };

// export default Reimbrucement;


