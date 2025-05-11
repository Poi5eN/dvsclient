// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import {
//     Button, TextField, Typography, Box, CircularProgress,
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb"; // Adjust path if needed
// import BreadcrumbList from "../../Dynamic/BreadcrumbList"; // Adjust path if needed

// // --- A4 Dimensions & Margin (Constants) ---
// const A4_WIDTH_LANDSCAPE_MM = 297;
// const A4_HEIGHT_LANDSCAPE_MM = 210;
// const A4_WIDTH_PORTRAIT_MM = 210;
// const A4_HEIGHT_PORTRAIT_MM = 297;
// const A4_MARGIN_MM = 10; // Margin for printing

// // --- Fallback Card Dimensions (if parsing fails) ---
// const FALLBACK_CARD_WIDTH_MM = 54; // Default if template is 54x86
// const FALLBACK_CARD_HEIGHT_MM = 86;

// const IdCard = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null);
//     const [studentData, setStudentData] = useState([]);
//     const [classData, setClassData] = useState([]);
//     const [filteredStudentData, setFilteredStudentData] = useState([]);
//     const [filterName, setFilterName] = useState("");
//     const [selectedClass, setSelectedClass] = useState("");
//     const [selectedSection, setSelectedSection] = useState("");
//     const [isLoadingData, setIsLoadingData] = useState(true);
//     const [printMode, setPrintMode] = useState('both');
//     const [printOrientation, setPrintOrientation] = useState('landscape');
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
//     const [actualCardDimensions, setActualCardDimensions] = useState({
//         width: FALLBACK_CARD_WIDTH_MM,
//         height: FALLBACK_CARD_HEIGHT_MM,
//         parsedSuccessfully: false,
//     });

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const componentRef = useRef();
//     const printContentRef = useRef();

//     // --- Default Templates ---
//     const [defaultFrontTemplate] = useState(`
//     <div style='width: 86mm; height: 54mm; background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat; position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
//         <div style='margin-left: 10px; margin-top: 80px; width: 85px; height: 95px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute; background-color: #eee;'>
//             <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student"/>
//         </div>
//         <div style='position: absolute; left: 10px; top: 70px; width: calc(54mm - 6px); font-family: sans-serif; '>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:blue; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
//         </div>
//         <div style='position: absolute; left: 113px; top: 85px; width: calc(54mm - 6px); font-family: sans-serif; '>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>NAME<span style="margin-left: 16px; font-weight: bold;">: \${name}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>CLASS<span style="margin-left: 13px; font-weight: bold;">: \${class}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>F.NAME<span style="margin-left: 9px; font-weight: bold;">: \${father_name}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>Roll No.<span style="margin-left: 9px; font-weight: bold;">: \${rollNo}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
//         </div>
//     </div>
//     `);
//     const [defaultBackTemplate] = useState(`
//     <div style='width: 86mm; height: 54mm; background-color: #e0e0e0; background-position: center; background-repeat: no-repeat;position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>
//       <div style='position: relative; z-index: 2;'>
//         <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info (Example Back)</h4>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Session: \${session}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Admission No: \${admissionNumber}</p>
//       </div>
//       <div style='position: relative; z-index: 2; text-align: center; font-size: 6pt; color: #555;'>
//          <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//          <p style='margin: 0;'>[School Address/Contact Info Here]</p>
//       </div>
//     </div>
//     `);

//     // --- Helper Functions ---
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
//             return `<div style='width: ${FALLBACK_CARD_WIDTH_MM}mm; height: ${FALLBACK_CARD_HEIGHT_MM}mm; border:1px solid red; padding: 10px; color: red; font-size: 8pt;'>Error decoding template</div>`;
//         }
//     }, []);

//     const parseCardDimensions = useCallback((templateString) => {
//         if (!templateString || typeof templateString !== 'string') return null;
//         const outerDivMatch = templateString.match(/^<div[^>]*style=['"]([^'"]*)['"][^>]*>/im);
//         if (!outerDivMatch || !outerDivMatch[1]) return null;
//         const styleContent = outerDivMatch[1];
//         const widthMatch = styleContent.match(/width:\s*(\d+(\.\d+)?)\s*mm/i);
//         const heightMatch = styleContent.match(/height:\s*(\d+(\.\d+)?)\s*mm/i);
//         if (widthMatch && widthMatch[1] && heightMatch && heightMatch[1]) {
//             return { width: parseFloat(widthMatch[1]), height: parseFloat(heightMatch[1]) };
//         }
//         return null;
//     }, []);

//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             setIdCardData(response?.success && response?.designFormats?.length > 0 ? response.designFormats[0] : null);
//         } catch (error) { console.error("Error fetching ID card design:", error); toast.error("Could not load custom template."); setIdCardData(null); }
//     }, []);
//     const fetchAllClasses = useCallback(async () => { 
//         try {
//             const response = await AdminGetAllClasses();
//             setClassData(response?.success ? (response.classes || []) : []);
//             if (!response?.success) toast.error(response?.message || "Failed to fetch classes.");
//         } catch (error) { console.error("Error fetching classes:", error); toast.error("Error fetching classes."); setClassData([]); }
//     }, []);
//     const fetchAllStudents = useCallback(async () => {
//         if (!session) { toast.error("Session missing."); setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return; }
//         setIsLoadingData(true);
//         try {
//             const response = await ActiveStudents(session);
//             setStudentData(response?.success && response.students?.data ? (response.students.data || []).filter(s => s && s._id) : []);
//             if (!response?.success) toast.error(response?.message || "Failed to fetch students.");
//         } catch (error) { console.error("Error fetching students:", error); setStudentData([]); } 
//         finally { setIsLoadingData(false); }
//      }, [session]);

//     // --- Effects ---
//     useEffect(() => { Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]); }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//     const decodedApiFrontTemplate = useMemo(() => idCardData?.frontTemplate ? decodeBase64(idCardData.frontTemplate) : null, [idCardData, decodeBase64]);
//     const decodedApiBackTemplate = useMemo(() => idCardData?.backTemplate ? decodeBase64(idCardData.backTemplate) : null, [idCardData, decodeBase64]);

//     useEffect(() => {
//         const templateToParse = decodedApiFrontTemplate || defaultFrontTemplate;
//         let newFallbackWidth = FALLBACK_CARD_WIDTH_MM;
//         let newFallbackHeight = FALLBACK_CARD_HEIGHT_MM;
//         if (defaultFrontTemplate.includes("width: 54mm") && defaultFrontTemplate.includes("height: 86mm")) { newFallbackWidth = 54; newFallbackHeight = 86; }
//         else if (defaultFrontTemplate.includes("width: 86mm") && defaultFrontTemplate.includes("height: 54mm")) { newFallbackWidth = 86; newFallbackHeight = 54; }
//         if (templateToParse) {
//             const parsedDims = parseCardDimensions(templateToParse);
//             setActualCardDimensions(parsedDims ? { ...parsedDims, parsedSuccessfully: true } : { width: newFallbackWidth, height: newFallbackHeight, parsedSuccessfully: false });
//         } else {
//             setActualCardDimensions({ width: newFallbackWidth, height: newFallbackHeight, parsedSuccessfully: false });
//         }
//     }, [decodedApiFrontTemplate, defaultFrontTemplate, parseCardDimensions]);

//     useEffect(() => { 
//         if (isLoadingData) return; let filtered = [...studentData];
//         if (selectedClass) filtered = filtered.filter(s => s.class === selectedClass);
//         if (selectedClass && selectedSection) filtered = filtered.filter(s => (s.section || '') === selectedSection);
//         if (filterName) { const lower = filterName.toLowerCase().trim(); if (lower) filtered = filtered.filter(s => s.studentName?.toLowerCase().includes(lower) || s.admissionNumber?.toString().toLowerCase().includes(lower)); }
//         setFilteredStudentData(filtered); setSelectedStudentIds(new Set());
//      }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);
//     const handleOrientationChange = (e) => setPrintOrientation(e.target.value);
//     const handleSelectAllChange = (event) => { setSelectedStudentIds(event.target.checked ? new Set(filteredStudentData.filter(s => s._id).map(s => s._id)) : new Set()); };
//     const handleSelectSingleChange = (event, studentId) => { if (!studentId) return; setSelectedStudentIds(prev => { const n = new Set(prev); if (event.target.checked) n.add(studentId); else n.delete(studentId); return n; }); };

//     // --- Template Rendering Logic ---
//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         const cardWidth = actualCardDimensions.width; const cardHeight = actualCardDimensions.height;
//         if (!template) return `<div style='width:${cardWidth}mm;height:${cardHeight}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;box-sizing:border-box;background-color:#ffebee;'>Missing ${cardSide} Template</div>`;
//         let html = template;
//         try {
//             html = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const k = key.trim(); let v = data;
//                 if (k.includes('.')) v = k.split('.').reduce((o, i) => (o && o[i] !== undefined) ? o[i] : undefined, data); else v = data.hasOwnProperty(k) ? data[k] : undefined;
//                 if (v === undefined || v === null || v === '') { const lk = k.toLowerCase(); if (lk.includes('image')) return `https://via.placeholder.com/${lk==='studentimage'?'85x95':'60x70'}.png?text=${lk==='studentimage'?'No Photo':'N/A'}`; return ''; }
//                 return String(v);
//             });
//         } catch (e) { html = `<div style='width:${cardWidth}mm;height:${cardHeight}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;box-sizing:border-box;background-color:#ffebee;'>${cardSide} Render Error</div>`; }
//         return html;
//      }, [actualCardDimensions]);

//     const renderCommonTemplate = (student, template, side) => {
//         if (!student) return replacePlaceholders(template, {}, side);
//         const data = {
//              backgroundImage: idCardData?.[`${side.toLowerCase()}Image`]?.url || "", studentImage: student.studentImage?.url, name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '', class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '', gender: student?.gender || '', contact: student?.contact || '', transport: student?.transport || '', rollNo: student?.rollNo || '', 
//              admissionNumber: student?.admissionNumber || '', father_name: student?.fatherName?.toUpperCase() || '', mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '', mobile: student?.contact || student?.parentContact || '', parentContact: student?.parentContact || '', address: student?.address || '',
//              session: student?.session || session?.name || '', fatherImage: student.fatherImage?.url, motherImage: student.motherImage?.url, guardianImage: student.guardianImage?.url,
//          };
//         return replacePlaceholders(template, data, side);
//     };
//     const renderFrontTemplate = useCallback((s) => renderCommonTemplate(s, frontTemplateToUse, 'Front'), [idCardData, frontTemplateToUse, replacePlaceholders, session]);
//     const renderBackTemplate = useCallback((s) => renderCommonTemplate(s, backTemplateToUse, 'Back'), [idCardData, backTemplateToUse, replacePlaceholders, session]);

//     const studentsToPrint = useMemo(() => filteredStudentData.filter(s => s?._id && selectedStudentIds.has(s._id)), [filteredStudentData, selectedStudentIds]);

//     const dynamicPageStyle = useMemo(() => {
//         let pageSetup = '', layoutStyles = '', cardTransformStyles = '';
//         let printableWidthMM, printableHeightMM, numCols, numRows, cellWidthMM, cellHeightMM;

//         if (printOrientation === 'landscape' || printOrientation === 'landscape-rotated') {
//             printableWidthMM = A4_WIDTH_LANDSCAPE_MM - (2 * A4_MARGIN_MM); printableHeightMM = A4_HEIGHT_LANDSCAPE_MM - (2 * A4_MARGIN_MM);
//             numCols = 5; numRows = 2; pageSetup = `@page { size: A4 landscape; margin: ${A4_MARGIN_MM}mm; }`;
//         } else {
//             printableWidthMM = A4_WIDTH_PORTRAIT_MM - (2 * A4_MARGIN_MM); printableHeightMM = A4_HEIGHT_PORTRAIT_MM - (2 * A4_MARGIN_MM);
//             numCols = 2; numRows = 5; pageSetup = `@page { size: A4 portrait; margin: ${A4_MARGIN_MM}mm; }`;
//         }
//         cellWidthMM = printableWidthMM / numCols; cellHeightMM = printableHeightMM / numRows;

//         layoutStyles = `
//           .id-card-print-area { 
//             display: flex !important; flex-wrap: wrap !important; flex-direction: row !important; 
//             width: ${printableWidthMM.toFixed(2)}mm !important; 
//             /* Changed: No fixed height, allow overflow */
//             min-height: ${printableHeightMM.toFixed(2)}mm !important; /* Suggest page height */
//             box-sizing: border-box !important; 
//             overflow: visible !important; /* Allow content to flow to new pages */
//             align-content: flex-start !important; /* Important for multi-page flexbox */
//           }
//           .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }
//           .print-item { 
//             width: ${cellWidthMM.toFixed(2)}mm !important; height: ${cellHeightMM.toFixed(2)}mm !important; 
//             display: flex !important; justify-content: center !important; align-items: center !important; 
//             box-sizing: border-box !important; overflow: hidden !important; page-break-inside: avoid !important; 
//             padding: 0.5mm !important; 
//           }
//           .print-item > div { /* Targets card or pair-wrapper */
//             max-width: 100% !important; max-height: 100% !important; 
//             margin: 0 !important; box-sizing: border-box !important; 
//           }
//           .print-item > .card-pair-wrapper { 
//             display: flex !important; flex-direction: column !important; 
//             justify-content: center !important; align-items: center !important; 
//             width: 100%; height: 100%; gap: 0.2mm; 
//           }
//           .print-item > .card-pair-wrapper > div { /* Cards inside pair */
//             max-width: 100% !important; 
//             /* height: auto; // Let aspect ratio define height if pair wrapper scales correctly */
//           }
//         `;
//         if (printOrientation === 'landscape-rotated') {
//             cardTransformStyles = `.print-item > div { transform: rotate(90deg) !important; transform-origin: center center !important; }`;
//         }
//         return ` ${pageSetup} @media print { html, body { height: initial !important; overflow: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print, .screen-only { display: none !important; } ${layoutStyles} ${cardTransformStyles} }`;
//     }, [printOrientation]);

//     const generatePDF = useReactToPrint({
//         content: () => {
//             if (studentsToPrint.length === 0) { toast.info("No students selected."); setIsLoader(false); return null; }
//             setIsLoader(true); const ITEMS_PER_PAGE = 10;
//             const printContainer = document.createElement('div'); printContainer.className = 'id-card-print-area';
//             if (printMode === 'back' && (printOrientation === 'landscape' || printOrientation === 'portrait')) printContainer.classList.add('print-rtl');
//             printContentRef.current = printContainer;

//             studentsToPrint.forEach((student, index) => {
//                 if (!student || !student._id) return;
//                 const itemElement = document.createElement('div'); itemElement.className = `print-item item-${student._id}`;
//                 let contentForCell;
//                 if (printMode === 'front') { const d = document.createElement('div'); d.innerHTML = renderFrontTemplate(student).trim(); contentForCell = d.firstChild; }
//                 else if (printMode === 'back') { const d = document.createElement('div'); d.innerHTML = renderBackTemplate(student).trim(); contentForCell = d.firstChild; }
//                 else { contentForCell = document.createElement('div'); contentForCell.className = 'card-pair-wrapper';
//                     const f = document.createElement('div'); f.innerHTML = renderFrontTemplate(student).trim(); if (f.firstChild) contentForCell.appendChild(f.firstChild);
//                     const b = document.createElement('div'); b.innerHTML = renderBackTemplate(student).trim(); if (b.firstChild) contentForCell.appendChild(b.firstChild);
//                 }
//                 if (contentForCell) itemElement.appendChild(contentForCell); else itemElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;border:1px solid red;font-size:7pt;">Err</div>`;
//                 if ((index + 1) % ITEMS_PER_PAGE === 0 && index < studentsToPrint.length - 1) itemElement.style.pageBreakAfter = 'always'; else itemElement.style.pageBreakAfter = 'auto';
//                 printContainer.appendChild(itemElement);
//             });
//             return printContentRef.current;
//         },
//         documentTitle: `ID_Cards_${printMode}_${printOrientation}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onAfterPrint: () => { setIsLoader(false); if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length} cards sent to printer!`); printContentRef.current = null; },
//         onPrintError: (e) => { setIsLoader(false); toast.error("Printing failed."); console.error("Print Error:", e); printContentRef.current = null; },
//         pageStyle: dynamicPageStyle,
//     });

//     const classOptions = useMemo(() => classData.map(c => ({ label: c.className, value: c.className })), [classData]);
//     const sectionOptions = useMemo(() => selectedClass ? (classData.find(c => c.className === selectedClass)?.sections?.map(s => ({ label: s, value: s })) || []) : [], [classData, selectedClass]);
//     const numFilteredStudentsWithId = useMemo(() => filteredStudentData.filter(s => s._id).length, [filteredStudentData]);
//     const isSelectAllChecked = useMemo(() => numFilteredStudentsWithId > 0 && selectedStudentIds.size === numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);

//     return (
//         <>
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Student ID Cards"/>
//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                     <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
//                         <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData} />
//                         <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder={!selectedClass ? "Class First" : "Section"} />
//                         <TextField fullWidth id="filter-name" label="Filter Name/Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }} InputLabelProps={{ shrink: true }} />
//                         <FormControl fullWidth size="small" disabled={isLoadingData}><InputLabel>Print Sides</InputLabel><Select value={printMode} label="Print Sides" onChange={handlePrintModeChange}><MenuItem value={'both'}>Both Sides</MenuItem><MenuItem value={'front'}>Front Only</MenuItem><MenuItem value={'back'}>Back Only</MenuItem></Select></FormControl>
//                         <FormControl fullWidth size="small" disabled={isLoadingData}><InputLabel>Page Orientation</InputLabel><Select value={printOrientation} label="Page Orientation" onChange={handleOrientationChange}><MenuItem value={'landscape'}>A4 Landscape (10)</MenuItem><MenuItem value={'portrait'}>A4 Portrait (10)</MenuItem><MenuItem value={'landscape-rotated'}>A4 Landscape - Rotated (10)</MenuItem></Select></FormControl>
//                         <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}>{isLoader ? "Preparing..." : `Print (${selectedStudentIds.size})`}</Button>
//                     </div>
//                     <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontStyle: 'italic' }}>
//                         10 ID cards per A4 page. Cards scale to fit. {printOrientation === 'landscape-rotated' && " Cards rotated 90°."}
//                         {!actualCardDimensions.parsedSuccessfully && <span style={{color: 'red', fontWeight:'bold'}}> Warning: Using fallback card dimensions. Print scaling might be inaccurate.</span>}
//                     </Typography>
//                 </Box>
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
//                      {isLoadingData && (<Box sx={{ display:'flex', justifyContent:'center', width:'100%'}}><CircularProgress size={25} /><Typography sx={{ ml:1 }}>Loading...</Typography></Box>)}
//                      {!isLoadingData && numFilteredStudentsWithId > 0 && (<FormControlLabel control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange} />} label={`Select All (${numFilteredStudentsWithId})`} sx={{ mr: 'auto' }} />)}
//                      {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (<Typography sx={{ width:'100%', textAlign:'center', color:'text.secondary' }}>No students match filters.</Typography>)}
//                      {!isLoadingData && studentData.length === 0 && (<Typography sx={{ width:'100%', textAlign:'center', color:'text.secondary' }}>No active students.</Typography>)}
//                      {!isLoadingData && filteredStudentData.length > 0 && numFilteredStudentsWithId !== filteredStudentData.length && (<Typography color="warning.main" fontSize="0.8rem" ml={2}>Note: {filteredStudentData.length - numFilteredStudentsWithId} student(s) cannot be selected (missing ID).</Typography>)}
//                 </Box>
//                 <Box className="screen-only">
//                     {!isLoadingData && filteredStudentData.length > 0 && (<Typography variant="caption" color="text.secondary" sx={{ mb:1, fontStyle:'italic' }}>Screen preview uses actual dimensions. Print scales to 10/page. Use Print Preview.</Typography>)}
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'flex-start', padding: '10px 0' }}>
//                         {!isLoadingData && filteredStudentData.map((student) => {
//                             if (!student || !student._id) {
//                                 return (<Box key={student?.admissionNumber || Math.random()} sx={{ border: '1px dashed #ccc', borderRadius: '4px', p:0.5, bgcolor: '#f5f5f5', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: `${actualCardDimensions.width+2}mm`, opacity: 0.6, boxSizing:'border-box', height:'fit-content' }}>
//                                     <Typography variant="caption" color="error" fontWeight="bold">Missing ID</Typography>
//                                     <Typography variant="caption" fontSize="0.7rem">{student?.studentName||'Unknown'} ({student?.admissionNumber||'N/A'})</Typography>
//                                     <Box sx={{ width: `${actualCardDimensions.width}mm`, height: `${actualCardDimensions.height}mm`, border: '1px solid #eee', mt: 1, display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'white' }}><Typography variant="caption" color="textSecondary" fontSize="0.7rem">Preview N/A</Typography></Box>
//                                 </Box>);
//                             }
//                             const studentKey = student._id; const isSelected = selectedStudentIds.has(studentKey);
//                             return (<Box key={studentKey} sx={{ border: isSelected ? `2px solid ${currentColor}`:'1px solid #ddd', borderRadius:'4px', p:0.5, bgcolor: isSelected?'#e6f7ff':'#fff', display:'inline-flex', flexDirection:'column', alignItems:'center', minWidth:`${actualCardDimensions.width+2}mm`, boxSizing:'border-box', transition:'all 0.2s ease', height:'fit-content' }}>
//                                 <FormControlLabel control={<Checkbox size="small" checked={isSelected} onChange={(e)=>handleSelectSingleChange(e, studentKey)}/>} label={<Typography variant="body2" fontSize="0.8rem" noWrap textOverflow="ellipsis" maxWidth={`${actualCardDimensions.width}mm`}>{student.studentName||'N/A'} ({student.admissionNumber||'N/A'})</Typography>} sx={{width:'100%', mb:0.5, mr:0}}/>
//                                 {(printMode==='front'||printMode==='both') && (<div style={{border:'1px dashed #ccc', width:`${actualCardDimensions.width}mm`, height:`${actualCardDimensions.height}mm`, overflow:'hidden', marginBottom:printMode==='both'?'5px':'0', boxSizing:'border-box'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/>)}
//                                 {(printMode==='back'||printMode==='both') && (<div style={{border:'1px dashed #aaa', width:`${actualCardDimensions.width}mm`, height:`${actualCardDimensions.height}mm`, overflow:'hidden', boxSizing:'border-box'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/>)}
//                             </Box>);
//                         })}
//                     </Box>
//                 </Box>
//             </Box>
//         </>
//     );
// };

// export default IdCard;




// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import {
//     Button, TextField, Typography, Box, CircularProgress,
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb"; // Adjust path if needed
// import BreadcrumbList from "../../Dynamic/BreadcrumbList"; // Adjust path if needed

// // --- A4 Dimensions & Margin (Constants) ---
// const A4_WIDTH_LANDSCAPE_MM = 297;
// const A4_HEIGHT_LANDSCAPE_MM = 210;
// const A4_WIDTH_PORTRAIT_MM = 210;
// const A4_HEIGHT_PORTRAIT_MM = 297;
// const A4_MARGIN_MM = 10; // Margin for printing

// // --- Fallback Card Dimensions (if parsing fails) ---
// const FALLBACK_CARD_WIDTH_MM = 54; // Default if template is 54x86
// const FALLBACK_CARD_HEIGHT_MM = 86;

// const IdCard = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null);
//     const [studentData, setStudentData] = useState([]);
//     const [classData, setClassData] = useState([]);
//     const [filteredStudentData, setFilteredStudentData] = useState([]);
//     const [filterName, setFilterName] = useState("");
//     const [selectedClass, setSelectedClass] = useState("");
//     const [selectedSection, setSelectedSection] = useState("");
//     const [isLoadingData, setIsLoadingData] = useState(true);
//     const [printMode, setPrintMode] = useState('both');
//     const [printOrientation, setPrintOrientation] = useState('landscape');
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
//     const [actualCardDimensions, setActualCardDimensions] = useState({
//         width: FALLBACK_CARD_WIDTH_MM,
//         height: FALLBACK_CARD_HEIGHT_MM,
//         parsedSuccessfully: false,
//     });

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const componentRef = useRef();
//     const printContentRef = useRef();

//     // --- Default Templates ---
//     // Using the first example you provided, assuming width: 86mm, height: 54mm (landscape card)
//     const [defaultFrontTemplate] = useState(`
//     <div style='width: 86mm; height: 54mm; background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat; position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
//         <div style='margin-left: 10px; margin-top: 80px; width: 85px; height: 95px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute; background-color: #eee;'>
//             <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student"/>
//         </div>
//         <div style='position: absolute; left: 10px; top: 70px; width: calc(54mm - 6px); font-family: sans-serif; '>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:blue; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
//         </div>
//         <div style='position: absolute; left: 113px; top: 85px; width: calc(54mm - 6px); font-family: sans-serif; '>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>NAME<span style="margin-left: 16px; font-weight: bold;">: \${name}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>CLASS<span style="margin-left: 13px; font-weight: bold;">: \${class}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>F.NAME<span style="margin-left: 9px; font-weight: bold;">: \${father_name}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>Roll No.<span style="margin-left: 9px; font-weight: bold;">: \${rollNo}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
//         </div>
//     </div>
//     `);
//     // For the back template, ensure its root div also has explicit width/height matching the front's intended orientation
//     const [defaultBackTemplate] = useState(`
//     <div style='width: 86mm; height: 54mm; background-color: #e0e0e0; background-position: center; background-repeat: no-repeat;position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>
//       <div style='position: relative; z-index: 2;'>
//         <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info (Example Back)</h4>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Session: \${session}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Admission No: \${admissionNumber}</p>
//       </div>
//       <div style='position: relative; z-index: 2; text-align: center; font-size: 6pt; color: #555;'>
//          <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//          <p style='margin: 0;'>[School Address/Contact Info Here]</p>
//       </div>
//     </div>
//     `);

//     // --- Helper Functions ---
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
//             return `<div style='width: ${FALLBACK_CARD_WIDTH_MM}mm; height: ${FALLBACK_CARD_HEIGHT_MM}mm; border:1px solid red; padding: 10px; color: red; font-size: 8pt;'>Error decoding template</div>`;
//         }
//     }, []);

//     const parseCardDimensions = useCallback((templateString) => {
//         if (!templateString || typeof templateString !== 'string') {
//             return null;
//         }
//         const outerDivMatch = templateString.match(/^<div[^>]*style=['"]([^'"]*)['"][^>]*>/im);
//         if (!outerDivMatch || !outerDivMatch[1]) {
//             return null;
//         }
//         const styleContent = outerDivMatch[1];
//         const widthMatch = styleContent.match(/width:\s*(\d+(\.\d+)?)\s*mm/i);
//         const heightMatch = styleContent.match(/height:\s*(\d+(\.\d+)?)\s*mm/i);
    
//         if (widthMatch && widthMatch[1] && heightMatch && heightMatch[1]) {
//             return {
//                 width: parseFloat(widthMatch[1]),
//                 height: parseFloat(heightMatch[1])
//             };
//         }
//         return null;
//     }, []);

//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             setIdCardData(response?.success && response?.designFormats?.length > 0 ? response.designFormats[0] : null);
//         } catch (error) { console.error("Error fetching ID card design:", error); toast.error("Could not load custom template."); setIdCardData(null); }
//     }, []);
//     const fetchAllClasses = useCallback(async () => { 
//         try {
//             const response = await AdminGetAllClasses();
//             setClassData(response?.success ? (response.classes || []) : []);
//             if (!response?.success) toast.error(response?.message || "Failed to fetch classes.");
//         } catch (error) { console.error("Error fetching classes:", error); toast.error("Error fetching classes."); setClassData([]); }
//     }, []);
//     const fetchAllStudents = useCallback(async () => {
//         if (!session) { toast.error("Session missing."); setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return; }
//         setIsLoadingData(true);
//         try {
//             const response = await ActiveStudents(session);
//             setStudentData(response?.success && response.students?.data ? (response.students.data || []).filter(s => s && s._id) : []);
//             if (!response?.success) toast.error(response?.message || "Failed to fetch students.");
//         } catch (error) { console.error("Error fetching students:", error); setStudentData([]); } 
//         finally { setIsLoadingData(false); }
//      }, [session]);

//     // --- Effects ---
//     useEffect(() => { Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]); }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//     const decodedApiFrontTemplate = useMemo(() => idCardData?.frontTemplate ? decodeBase64(idCardData.frontTemplate) : null, [idCardData, decodeBase64]);
//     const decodedApiBackTemplate = useMemo(() => idCardData?.backTemplate ? decodeBase64(idCardData.backTemplate) : null, [idCardData, decodeBase64]);

//     useEffect(() => {
//         const templateToParse = decodedApiFrontTemplate || defaultFrontTemplate;
//         let newFallbackWidth = FALLBACK_CARD_WIDTH_MM;
//         let newFallbackHeight = FALLBACK_CARD_HEIGHT_MM;

//         // Check if defaultFrontTemplate matches the portrait dimensions
//         if (defaultFrontTemplate.includes("width: 54mm") && defaultFrontTemplate.includes("height: 86mm")) {
//             newFallbackWidth = 54;
//             newFallbackHeight = 86;
//         } else if (defaultFrontTemplate.includes("width: 86mm") && defaultFrontTemplate.includes("height: 54mm")) {
//             newFallbackWidth = 86;
//             newFallbackHeight = 54;
//         }


//         if (templateToParse) {
//             const parsedDims = parseCardDimensions(templateToParse);
//             if (parsedDims) {
//                 setActualCardDimensions({ ...parsedDims, parsedSuccessfully: true });
//             } else {
//                 setActualCardDimensions({ width: newFallbackWidth, height: newFallbackHeight, parsedSuccessfully: false });
//             }
//         } else {
//             setActualCardDimensions({ width: newFallbackWidth, height: newFallbackHeight, parsedSuccessfully: false });
//         }
//     }, [decodedApiFrontTemplate, defaultFrontTemplate, parseCardDimensions]);

//     useEffect(() => { 
//         if (isLoadingData) return;
//         let filtered = [...studentData];
//         if (selectedClass) filtered = filtered.filter(s => s.class === selectedClass);
//         if (selectedClass && selectedSection) filtered = filtered.filter(s => (s.section || '') === selectedSection);
//         if (filterName) {
//             const lower = filterName.toLowerCase().trim();
//             if (lower) filtered = filtered.filter(s => s.studentName?.toLowerCase().includes(lower) || s.admissionNumber?.toString().toLowerCase().includes(lower));
//         }
//         setFilteredStudentData(filtered);
//         setSelectedStudentIds(new Set());
//      }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);
//     const handleOrientationChange = (e) => setPrintOrientation(e.target.value);
//     const handleSelectAllChange = (event) => { 
//         setSelectedStudentIds(event.target.checked ? new Set(filteredStudentData.filter(s => s._id).map(s => s._id)) : new Set());
//      };
//     const handleSelectSingleChange = (event, studentId) => { 
//         if (!studentId) return;
//         setSelectedStudentIds(prev => { const n = new Set(prev); if (event.target.checked) n.add(studentId); else n.delete(studentId); return n; });
//      };

//     // --- Template Rendering Logic ---
//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         const cardWidth = actualCardDimensions.width;
//         const cardHeight = actualCardDimensions.height;
//         if (!template) {
//              return `<div style='width: ${cardWidth}mm; height: ${cardHeight}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; box-sizing: border-box; background-color: #ffebee;'>Missing ${cardSide} Template</div>`;
//         }
//         let html = template;
//         try {
//             html = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const k = key.trim();
//                 let v = data;
//                 if (k.includes('.')) v = k.split('.').reduce((o, i) => (o && o[i] !== undefined) ? o[i] : undefined, data);
//                 else v = data.hasOwnProperty(k) ? data[k] : undefined;
//                 if (v === undefined || v === null || v === '') {
//                     const lk = k.toLowerCase();
//                     if (lk.includes('image')) return `https://via.placeholder.com/${lk==='studentimage'?'85x95':'60x70'}.png?text=${lk==='studentimage'?'No Photo':'N/A'}`;
//                     return '';
//                 }
//                 return String(v);
//             });
//         } catch (e) {
//             html = `<div style='width: ${cardWidth}mm; height: ${cardHeight}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; box-sizing: border-box; background-color: #ffebee;'>${cardSide} Render Error</div>`;
//         }
//         return html;
//      }, [actualCardDimensions]);

//     const renderCommonTemplate = (student, template, side) => {
//         if (!student) return replacePlaceholders(template, {}, side);
//         const data = {
//              backgroundImage: idCardData?.[`${side.toLowerCase()}Image`]?.url || "",
//              studentImage: student.studentImage?.url, name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//              class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '', gender: student?.gender || '', contact: student?.contact || '',
//              transport: student?.transport || '', rollNo: student?.rollNo || '', admissionNumber: student?.admissionNumber || '',
//              father_name: student?.fatherName?.toUpperCase() || '', mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '', mobile: student?.contact || student?.parentContact || '',
//              parentContact: student?.parentContact || '', address: student?.address || '',
//              session: student?.session || session?.name || '', fatherImage: student.fatherImage?.url,
//              motherImage: student.motherImage?.url, guardianImage: student.guardianImage?.url,
//          };
//         return replacePlaceholders(template, data, side);
//     };
//     const renderFrontTemplate = useCallback((s) => renderCommonTemplate(s, frontTemplateToUse, 'Front'), [idCardData, frontTemplateToUse, replacePlaceholders, session]);
//     const renderBackTemplate = useCallback((s) => renderCommonTemplate(s, backTemplateToUse, 'Back'), [idCardData, backTemplateToUse, replacePlaceholders, session]);

//     const studentsToPrint = useMemo(() => filteredStudentData.filter(s => s?._id && selectedStudentIds.has(s._id)), [filteredStudentData, selectedStudentIds]);

//     const dynamicPageStyle = useMemo(() => {
//         let pageSetup = '', layoutStyles = '', cardTransformStyles = '';
//         const ITEMS_PER_PAGE = 10;
//         let printableWidthMM, printableHeightMM, numCols, numRows, cellWidthMM, cellHeightMM;

//         if (printOrientation === 'landscape' || printOrientation === 'landscape-rotated') {
//             printableWidthMM = A4_WIDTH_LANDSCAPE_MM - (2 * A4_MARGIN_MM); printableHeightMM = A4_HEIGHT_LANDSCAPE_MM - (2 * A4_MARGIN_MM);
//             numCols = 5; numRows = 2; pageSetup = `@page { size: A4 landscape; margin: ${A4_MARGIN_MM}mm; }`;
//         } else {
//             printableWidthMM = A4_WIDTH_PORTRAIT_MM - (2 * A4_MARGIN_MM); printableHeightMM = A4_HEIGHT_PORTRAIT_MM - (2 * A4_MARGIN_MM);
//             numCols = 2; numRows = 5; pageSetup = `@page { size: A4 portrait; margin: ${A4_MARGIN_MM}mm; }`;
//         }
//         cellWidthMM = printableWidthMM / numCols; cellHeightMM = printableHeightMM / numRows;

//         layoutStyles = `
//           .id-card-print-area { display: flex !important; flex-wrap: wrap !important; flex-direction: row !important; width: ${printableWidthMM.toFixed(2)}mm !important; height: ${printableHeightMM.toFixed(2)}mm !important; box-sizing: border-box !important; overflow: hidden !important; }
//           .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }
//           .print-item { width: ${cellWidthMM.toFixed(2)}mm !important; height: ${cellHeightMM.toFixed(2)}mm !important; display: flex !important; justify-content: center !important; align-items: center !important; box-sizing: border-box !important;  page-break-inside: avoid !important; padding: 0.5mm !important; }
//           .print-item > div { max-width: 100% !important; max-height: 100% !important; margin: 0 !important; box-sizing: border-box !important; }
//           .print-item > .card-pair-wrapper { display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; width: 100%; height: 100%; gap: 0.2mm; }
//           .print-item > .card-pair-wrapper > div { max-width: 100% !important; /* height: auto !important; // Let aspect ratio control */ /* Consider explicit height like calc(50% - 0.1mm) if auto causes issues */ }
//         `;
//         if (printOrientation === 'landscape-rotated') {
//             cardTransformStyles = `.print-item > div { transform: rotate(90deg) !important; transform-origin: center center !important; }`;
//         }
//         return ` ${pageSetup} @media print { html, body { height: initial !important; overflow: initial !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print, .screen-only { display: none !important; } ${layoutStyles} ${cardTransformStyles} }`;
//     }, [printOrientation]);

//     const generatePDF = useReactToPrint({
//         content: () => {
//             if (studentsToPrint.length === 0) { toast.info("No students selected."); setIsLoader(false); return null; }
//             setIsLoader(true); const ITEMS_PER_PAGE = 10;
//             const printContainer = document.createElement('div'); printContainer.className = 'id-card-print-area';
//             if (printMode === 'back' && (printOrientation === 'landscape' || printOrientation === 'portrait')) printContainer.classList.add('print-rtl');
//             printContentRef.current = printContainer;

//             studentsToPrint.forEach((student, index) => {
//                 if (!student || !student._id) return;
//                 const itemElement = document.createElement('div'); itemElement.className = `print-item item-${student._id}`;
//                 let contentForCell;
//                 if (printMode === 'front') { const d = document.createElement('div'); d.innerHTML = renderFrontTemplate(student).trim(); contentForCell = d.firstChild; }
//                 else if (printMode === 'back') { const d = document.createElement('div'); d.innerHTML = renderBackTemplate(student).trim(); contentForCell = d.firstChild; }
//                 else { contentForCell = document.createElement('div'); contentForCell.className = 'card-pair-wrapper';
//                     const f = document.createElement('div'); f.innerHTML = renderFrontTemplate(student).trim(); if (f.firstChild) contentForCell.appendChild(f.firstChild);
//                     const b = document.createElement('div'); b.innerHTML = renderBackTemplate(student).trim(); if (b.firstChild) contentForCell.appendChild(b.firstChild);
//                 }
//                 if (contentForCell) itemElement.appendChild(contentForCell); else itemElement.innerHTML = `ERR`;
//                 if ((index + 1) % ITEMS_PER_PAGE === 0 && index < studentsToPrint.length - 1) itemElement.style.pageBreakAfter = 'always'; else itemElement.style.pageBreakAfter = 'auto';
//                 printContainer.appendChild(itemElement);
//             });
//             return printContentRef.current;
//         },
//         documentTitle: `ID_Cards_${printMode}_${printOrientation}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onAfterPrint: () => { setIsLoader(false); if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length} cards sent to printer!`); printContentRef.current = null; },
//         onPrintError: (e) => { setIsLoader(false); toast.error("Printing failed."); console.error("Print Error:", e); printContentRef.current = null; },
//         pageStyle: dynamicPageStyle,
//     });

//     const classOptions = useMemo(() => classData.map(c => ({ label: c.className, value: c.className })), [classData]);
//     const sectionOptions = useMemo(() => selectedClass ? (classData.find(c => c.className === selectedClass)?.sections?.map(s => ({ label: s, value: s })) || []) : [], [classData, selectedClass]);
//     const numFilteredStudentsWithId = useMemo(() => filteredStudentData.filter(s => s._id).length, [filteredStudentData]);
//     const isSelectAllChecked = useMemo(() => numFilteredStudentsWithId > 0 && selectedStudentIds.size === numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);

//     return (
//         <>
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Student ID Cards"/>
//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                     <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
//                         <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData} />
//                         <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder={!selectedClass ? "Class First" : "Section"} />
//                         <TextField fullWidth id="filter-name" label="Filter Name/Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }} InputLabelProps={{ shrink: true }} />
//                         <FormControl fullWidth size="small" disabled={isLoadingData}><InputLabel>Print Sides</InputLabel><Select value={printMode} label="Print Sides" onChange={handlePrintModeChange}><MenuItem value={'both'}>Both Sides</MenuItem><MenuItem value={'front'}>Front Only</MenuItem><MenuItem value={'back'}>Back Only</MenuItem></Select></FormControl>
//                         <FormControl fullWidth size="small" disabled={isLoadingData}><InputLabel>Page Orientation</InputLabel><Select value={printOrientation} label="Page Orientation" onChange={handleOrientationChange}><MenuItem value={'landscape'}>A4 Landscape (10)</MenuItem><MenuItem value={'portrait'}>A4 Portrait (10)</MenuItem><MenuItem value={'landscape-rotated'}>A4 Landscape - Rotated (10)</MenuItem></Select></FormControl>
//                         <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}>{isLoader ? "Preparing..." : `Print (${selectedStudentIds.size})`}</Button>
//                     </div>
//                     <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontStyle: 'italic' }}>
//                         10 ID cards per A4 page. Cards scale to fit. {printOrientation === 'landscape-rotated' && " Cards rotated 90°."}
//                         {!actualCardDimensions.parsedSuccessfully && <span style={{color: 'red', fontWeight:'bold'}}> Warning: Using fallback card dimensions. Print scaling might be inaccurate.</span>}
//                     </Typography>
//                 </Box>
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
//                      {isLoadingData && (<Box sx={{ display:'flex', justifyContent:'center', width:'100%'}}><CircularProgress size={25} /><Typography sx={{ ml:1 }}>Loading...</Typography></Box>)}
//                      {!isLoadingData && numFilteredStudentsWithId > 0 && (<FormControlLabel control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange} />} label={`Select All (${numFilteredStudentsWithId})`} sx={{ mr: 'auto' }} />)}
//                      {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (<Typography sx={{ width:'100%', textAlign:'center', color:'text.secondary' }}>No students match filters.</Typography>)}
//                      {!isLoadingData && studentData.length === 0 && (<Typography sx={{ width:'100%', textAlign:'center', color:'text.secondary' }}>No active students.</Typography>)}
//                      {!isLoadingData && filteredStudentData.length > 0 && numFilteredStudentsWithId !== filteredStudentData.length && (<Typography color="warning.main" fontSize="0.8rem" ml={2}>Note: {filteredStudentData.length - numFilteredStudentsWithId} student(s) cannot be selected (missing ID).</Typography>)}
//                 </Box>
//                 <Box className="screen-only">
//                     {!isLoadingData && filteredStudentData.length > 0 && (<Typography variant="caption" color="text.secondary" sx={{ mb:1, fontStyle:'italic' }}>Screen preview uses actual dimensions. Print scales to 10/page. Use Print Preview.</Typography>)}
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'flex-start', padding: '10px 0' }}>
//                         {!isLoadingData && filteredStudentData.map((student) => {
//                             if (!student || !student._id) {
//                                 return (<Box key={student?.admissionNumber || Math.random()} sx={{ border: '1px dashed #ccc', borderRadius: '4px', p:0.5, bgcolor: '#f5f5f5', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: `${actualCardDimensions.width+2}mm`, opacity: 0.6, boxSizing:'border-box', height:'fit-content' }}>
//                                     <Typography variant="caption" color="error" fontWeight="bold">Missing ID</Typography>
//                                     <Typography variant="caption" fontSize="0.7rem">{student?.studentName||'Unknown'} ({student?.admissionNumber||'N/A'})</Typography>
//                                     <Box sx={{ width: `${actualCardDimensions.width}mm`, height: `${actualCardDimensions.height}mm`, border: '1px solid #eee', mt: 1, display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'white' }}><Typography variant="caption" color="textSecondary" fontSize="0.7rem">Preview N/A</Typography></Box>
//                                 </Box>);
//                             }
//                             const studentKey = student._id; const isSelected = selectedStudentIds.has(studentKey);
//                             return (<Box key={studentKey} sx={{ border: isSelected ? `2px solid ${currentColor}`:'1px solid #ddd', borderRadius:'4px', p:0.5, bgcolor: isSelected?'#e6f7ff':'#fff', display:'inline-flex', flexDirection:'column', alignItems:'center', minWidth:`${actualCardDimensions.width+2}mm`, boxSizing:'border-box', transition:'all 0.2s ease', height:'fit-content' }}>
//                                 <FormControlLabel control={<Checkbox size="small" checked={isSelected} onChange={(e)=>handleSelectSingleChange(e, studentKey)}/>} label={<Typography variant="body2" fontSize="0.8rem" noWrap textOverflow="ellipsis" maxWidth={`${actualCardDimensions.width}mm`}>{student.studentName||'N/A'} ({student.admissionNumber||'N/A'})</Typography>} sx={{width:'100%', mb:0.5, mr:0}}/>
//                                 {(printMode==='front'||printMode==='both') && (<div style={{border:'1px dashed #ccc', width:`${actualCardDimensions.width}mm`, height:`${actualCardDimensions.height}mm`, overflow:'hidden', mb:printMode==='both'?0.5:0, boxSizing:'border-box'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/>)}
//                                 {(printMode==='back'||printMode==='both') && (<div style={{border:'1px dashed #aaa', width:`${actualCardDimensions.width}mm`, height:`${actualCardDimensions.height}mm`, overflow:'hidden', boxSizing:'border-box'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/>)}
//                             </Box>);
//                         })}
//                     </Box>
//                 </Box>
//             </Box>
//         </>
//     );
// };

// export default IdCard;



// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import {
//     Button, TextField, Typography, Box, CircularProgress,
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb"; // Adjust path if needed
// import BreadcrumbList from "../../Dynamic/BreadcrumbList"; // Adjust path if needed

// // --- A4 Dimensions & Margin (Constants) ---
// const A4_WIDTH_LANDSCAPE_MM = 297;
// const A4_HEIGHT_LANDSCAPE_MM = 210;
// const A4_WIDTH_PORTRAIT_MM = 210;
// const A4_HEIGHT_PORTRAIT_MM = 297;
// const A4_MARGIN_MM = 10; // Margin for printing

// // --- Fallback Card Dimensions (if parsing fails) ---
// const FALLBACK_CARD_WIDTH_MM = 54;
// const FALLBACK_CARD_HEIGHT_MM = 86;

// const IdCard = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null);
//     const [studentData, setStudentData] = useState([]);
//     const [classData, setClassData] = useState([]);
//     const [filteredStudentData, setFilteredStudentData] = useState([]);
//     const [filterName, setFilterName] = useState("");
//     const [selectedClass, setSelectedClass] = useState("");
//     const [selectedSection, setSelectedSection] = useState("");
//     const [isLoadingData, setIsLoadingData] = useState(true);
//     const [printMode, setPrintMode] = useState('both');
//     const [printOrientation, setPrintOrientation] = useState('landscape');
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
//     const [actualCardDimensions, setActualCardDimensions] = useState({
//         width: FALLBACK_CARD_WIDTH_MM,
//         height: FALLBACK_CARD_HEIGHT_MM,
//         parsedSuccessfully: false,
//     });

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const componentRef = useRef();
//     const printContentRef = useRef();

//     // --- Default Templates ---
//     // Using the first example you provided, assuming width: 86mm, height: 54mm (landscape card)
//     const [defaultFrontTemplate] = useState(`
//     <div style='width: 86mm; height: 54mm; background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat; position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
//         <div style='margin-left: 10px; margin-top: 80px; width: 85px; height: 95px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute; background-color: #eee;'>
//             <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student"/>
//         </div>
//         <div style='position: absolute; left: 10px; top: 70px; width: calc(54mm - 6px); font-family: sans-serif; '>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:blue; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
//         </div>
//         <div style='position: absolute; left: 113px; top: 85px; width: calc(54mm - 6px); font-family: sans-serif; '>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>NAME<span style="margin-left: 16px; font-weight: bold;">: \${name}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>CLASS<span style="margin-left: 13px; font-weight: bold;">: \${class}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>F.NAME<span style="margin-left: 9px; font-weight: bold;">: \${father_name}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>Roll No.<span style="margin-left: 9px; font-weight: bold;">: \${rollNo}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
//         </div>
//     </div>
//     `);
//     // Using the second example you provided, assuming width: 54mm, height: 86mm (portrait card)
//     // For simplicity, let's assume the back template also follows the primary orientation of the front.
//     // If back can be different, the logic for `actualCardDimensions` needs to handle front/back separately.
//     const [defaultBackTemplate] = useState(`
//     <div style='width: 86mm; height: 54mm; background-color: #e0e0e0; background-position: center; background-repeat: no-repeat;position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
//       {/* ... (content from your earlier back template, adjusted for 86mm x 54mm if needed, or keep standard) ... */}
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>
//       <div style='position: relative; z-index: 2;'>
//         <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info (Example Back)</h4>
//         {/* Add other back content placeholders here */}
//         <p style='font-size: 7pt; margin: 1mm 0;'>Session: \${session}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Admission No: \${admissionNumber}</p>
//       </div>
//       <div style='position: relative; z-index: 2; text-align: center; font-size: 6pt; color: #555;'>
//          <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//          <p style='margin: 0;'>[School Address/Contact Info Here]</p>
//       </div>
//     </div>
//     `);

//     // --- Helper Functions ---
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
//             return `<div style='border:1px solid red; padding: 10px; color: red; font-size: 8pt;'>Error decoding template</div>`;
//         }
//     }, []);

//     const parseCardDimensions = useCallback((templateString) => {
//         if (!templateString || typeof templateString !== 'string') {
//             console.warn("parseCardDimensions: Invalid template string input", templateString);
//             return null;
//         }
//         // Regex to find the outermost div and its style attribute
//         const outerDivMatch = templateString.match(/^<div[^>]*style=['"]([^'"]*)['"][^>]*>/im);
//         if (!outerDivMatch || !outerDivMatch[1]) {
//             console.warn("parseCardDimensions: Could not find style attribute in the outermost div.", templateString);
//             return null;
//         }
    
//         const styleContent = outerDivMatch[1];
//         const widthMatch = styleContent.match(/width:\s*(\d+(\.\d+)?)\s*mm/i);
//         const heightMatch = styleContent.match(/height:\s*(\d+(\.\d+)?)\s*mm/i);
    
//         if (widthMatch && widthMatch[1] && heightMatch && heightMatch[1]) {
//             return {
//                 width: parseFloat(widthMatch[1]),
//                 height: parseFloat(heightMatch[1])
//             };
//         }
//         console.warn("parseCardDimensions: Could not parse width/height from style: ", styleContent);
//         return null;
//     }, []);


//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 setIdCardData(response.designFormats[0]);
//             } else {
//                 setIdCardData(null); // Explicitly null for fallback
//             }
//         } catch (error) {
//             console.error("Error fetching ID card design:", error);
//             toast.error("Could not load custom ID card template.");
//             setIdCardData(null);
//         }
//     }, []);

//     const fetchAllClasses = useCallback(async () => { 
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//                 setClassData(response.classes || []);
//             } else {
//                 toast.error(response?.message || "Failed to fetch classes.");
//                 setClassData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error("An error occurred while fetching classes.");
//             setClassData([]);
//         }
//     }, []);

//     const fetchAllStudents = useCallback(async () => {
//         if (!session) {
//             toast.error("Session information is missing. Cannot fetch students.");
//             setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return;
//         }
//         setIsLoadingData(true);
//         try {
//             const response = await ActiveStudents(session);
//             if (response?.success && response.students?.data) {
//                 const validStudents = (response.students.data || []).filter(s => s && s._id);
//                 setStudentData(validStudents);
//             } else {
//                 toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//                 setStudentData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching students:", error);
//             setStudentData([]);
//         } finally {
//             setIsLoadingData(false);
//         }
//      }, [session]);

//     // --- Effects ---
//     useEffect(() => {
//         Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]);
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//     const decodedApiFrontTemplate = useMemo(() => {
//         if (!idCardData?.frontTemplate) return null;
//         return decodeBase64(idCardData.frontTemplate);
//     }, [idCardData, decodeBase64]);

//     const decodedApiBackTemplate = useMemo(() => {
//         if (!idCardData?.backTemplate) return null;
//         return decodeBase64(idCardData.backTemplate);
//     }, [idCardData, decodeBase64]);

//     useEffect(() => {
//         const templateToParse = decodedApiFrontTemplate || defaultFrontTemplate; // Prioritize API, then default
//         if (templateToParse) {
//             const parsedDims = parseCardDimensions(templateToParse);
//             if (parsedDims) {
//                 setActualCardDimensions({ ...parsedDims, parsedSuccessfully: true });
//             } else {
//                 console.warn("Using fallback dimensions as parsing failed for primary template.");
//                 setActualCardDimensions({
//                     width: FALLBACK_CARD_WIDTH_MM,
//                     height: FALLBACK_CARD_HEIGHT_MM,
//                     parsedSuccessfully: false
//                 });
//             }
//         } else {
//             console.error("No template available (API or default) to parse dimensions.");
//             setActualCardDimensions({
//                 width: FALLBACK_CARD_WIDTH_MM,
//                 height: FALLBACK_CARD_HEIGHT_MM,
//                 parsedSuccessfully: false
//             });
//         }
//     }, [decodedApiFrontTemplate, defaultFrontTemplate, parseCardDimensions]);


//     useEffect(() => { 
//         if (isLoadingData) return;
//         let filtered = [...studentData];
//         if (selectedClass) {
//             filtered = filtered.filter(s => s.class === selectedClass);
//         }
//         if (selectedClass && selectedSection) {
//             filtered = filtered.filter(s => (s.section || '') === selectedSection);
//         }
//         if (filterName) {
//             const lowerCaseFilter = filterName.toLowerCase().trim();
//             if (lowerCaseFilter) {
//                 filtered = filtered.filter(s =>
//                     s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//                     s.admissionNumber?.toString().toLowerCase().includes(lowerCaseFilter)
//                 );
//             }
//         }
//         setFilteredStudentData(filtered);
//         setSelectedStudentIds(new Set());
//      }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);
//     const handleOrientationChange = (e) => setPrintOrientation(e.target.value);
//     const handleSelectAllChange = (event) => { 
//         if (event.target.checked) {
//             const allFilteredIdsWithId = new Set(
//                 filteredStudentData.filter(student => student._id).map(student => student._id)
//             );
//             setSelectedStudentIds(allFilteredIdsWithId);
//         } else {
//             setSelectedStudentIds(new Set());
//         }
//      };
//     const handleSelectSingleChange = (event, studentId) => { 
//         if (!studentId) return;
//         const isChecked = event.target.checked;
//         setSelectedStudentIds(prevSelectedIds => {
//             const newSelectedIds = new Set(prevSelectedIds);
//             if (isChecked) {
//                 newSelectedIds.add(studentId);
//             } else {
//                 newSelectedIds.delete(studentId);
//             }
//             return newSelectedIds;
//         });
//      };

//     // --- Template Rendering Logic ---
//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         if (!template) {
//              return `<div style='width: ${actualCardDimensions.width}mm; height: ${actualCardDimensions.height}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box; background-color: #ffebee;'>Missing ${cardSide} Template</div>`;
//         }
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 let value = data;
//                 if (cleanKey.includes('.')) {
//                      const keys = cleanKey.split('.');
//                      value = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, data);
//                 } else {
//                     value = data.hasOwnProperty(cleanKey) ? data[cleanKey] : undefined;
//                 }
//                 if (value === undefined || value === null || value === '') {
//                     const lowerKey = cleanKey.toLowerCase();
//                     if (lowerKey.includes('image')) {
//                          if (lowerKey === 'studentimage') return "https://via.placeholder.com/85x95.png?text=No+Photo";
//                          if (lowerKey === 'fatherimage' || lowerKey === 'motherimage' || lowerKey === 'guardianimage') return "https://via.placeholder.com/60x70.png?text=N/A";
//                          return "https://via.placeholder.com/50x50.png?text=Image+N/A";
//                     }
//                     return '';
//                 }
//                 return String(value);
//             });
//         } catch (error) {
//             renderedHtml = `<div style='width: ${actualCardDimensions.width}mm; height: ${actualCardDimensions.height}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box; background-color: #ffebee;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//      }, [actualCardDimensions]);

//     const renderFrontTemplate = useCallback((student) => {
//         if (!student) return replacePlaceholders(frontTemplateToUse, {}, 'Front');
//          const data = {
//              backgroundImage: idCardData?.frontImage?.url || "",
//              studentImage: student.studentImage?.url,
//              name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//              class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '',
//              gender: student?.gender || '',
//              contact: student?.contact || '',
//              transport: student?.transport || '',
//              rollNo: student?.rollNo || '',
//              admissionNumber: student?.admissionNumber || '',
//              father_name: student?.fatherName?.toUpperCase() || '',
//              mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '',
//              mobile: student?.contact || student?.parentContact || '',
//              parentContact: student?.parentContact || '',
//              address: student?.address || '',
//              session: student?.session || session?.name || '',
//              fatherImage: student.fatherImage?.url,
//              motherImage: student.motherImage?.url,
//              guardianImage: student.guardianImage?.url,
//          };
//          return replacePlaceholders(frontTemplateToUse, data, 'Front');
//     }, [idCardData, frontTemplateToUse, replacePlaceholders, session]);

//     const renderBackTemplate = useCallback((student) => {
//         if (!student) return replacePlaceholders(backTemplateToUse, {}, 'Back');
//          const data = {
//              backgroundImage: idCardData?.backImage?.url || "",
//              fatherImage: student.fatherImage?.url,
//              motherImage: student.motherImage?.url,
//              guardianImage: student.guardianImage?.url,
//              father_name: student?.fatherName?.toUpperCase() || '',
//              mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '',
//              parentContact: student?.parentContact || '',
//              studentImage: student.studentImage?.url,
//              name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//              class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '',
//              gender: student?.gender || '',
//              contact: student?.contact || '',
//              mobile: student?.contact || student?.parentContact || '',
//              transport: student?.transport || '',
//              rollNo: student?.rollNo || '',
//              admissionNumber: student?.admissionNumber || '',
//              address: student?.address || '',
//              session: student?.session || session?.name || '',
//          };
//          return replacePlaceholders(backTemplateToUse, data, 'Back');
//     }, [idCardData, backTemplateToUse, replacePlaceholders, session]);


//     // --- Students to Print Calculation ---
//     const studentsToPrint = useMemo(() => {
//         return filteredStudentData.filter(student => student?._id && selectedStudentIds.has(student._id));
//     }, [filteredStudentData, selectedStudentIds]);

//     // --- Dynamic Page Style for 10 Items ---
//     const dynamicPageStyle = useMemo(() => {
//         let pageSetup = '';
//         let layoutStyles = '';
//         let cardTransformStyles = '';

//         const ITEMS_PER_PAGE = 10;
//         let printableWidthMM, printableHeightMM, numCols, numRows, cellWidthMM, cellHeightMM;

//         if (printOrientation === 'landscape' || printOrientation === 'landscape-rotated') {
//             printableWidthMM = A4_WIDTH_LANDSCAPE_MM - (2 * A4_MARGIN_MM);
//             printableHeightMM = A4_HEIGHT_LANDSCAPE_MM - (2 * A4_MARGIN_MM);
//             numCols = 5; numRows = 2;
//             pageSetup = `@page { size: A4 landscape; margin: ${A4_MARGIN_MM}mm; }`;
//         } else { // portrait
//             printableWidthMM = A4_WIDTH_PORTRAIT_MM - (2 * A4_MARGIN_MM);
//             printableHeightMM = A4_HEIGHT_PORTRAIT_MM - (2 * A4_MARGIN_MM);
//             numCols = 2; numRows = 5;
//             pageSetup = `@page { size: A4 portrait; margin: ${A4_MARGIN_MM}mm; }`;
//         }

//         cellWidthMM = printableWidthMM / numCols;
//         cellHeightMM = printableHeightMM / numRows;

//         layoutStyles = `
//           .id-card-print-area {
//             display: flex !important; flex-wrap: wrap !important; flex-direction: row !important;
//             width: ${printableWidthMM.toFixed(2)}mm !important; height: ${printableHeightMM.toFixed(2)}mm !important;
//             box-sizing: border-box !important; overflow: hidden !important;
//           }
//           .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }
//           .print-item { /* Grid cell */
//             width: ${cellWidthMM.toFixed(2)}mm !important; height: ${cellHeightMM.toFixed(2)}mm !important;
//             display: flex !important; justify-content: center !important; align-items: center !important;
//             box-sizing: border-box !important; overflow: hidden !important; page-break-inside: avoid !important;
//           }
//           /* Target the actual card's root div or the pair wrapper */
//           .print-item > div {
//             max-width: 100% !important; max-height: 100% !important;
//             margin: 0 !important; box-sizing: border-box !important;
//             /* The template's own width/height (e.g., 86mm x 54mm) defines aspect ratio for scaling */
//             /* For 'both' mode, the .card-pair-wrapper will be this div */
//           }
//           .print-item > .card-pair-wrapper { /* Specific for 'both' mode */
//             display: flex !important; flex-direction: column !important;
//             justify-content: center !important; align-items: center !important;
//             width: 100%; height: 100%; /* Takes full cell space */
//             gap: 0.2mm; /* Minimal gap, adjust as needed */
//           }
//           /* Each card inside the pair */
//           .print-item > .card-pair-wrapper > div {
//              max-width: 100% !important; /* Card should not exceed pair wrapper's width */
//              /* max-height for each card in pair should be less than 50% of pair wrapper's height to fit both + gap.
//                 This scaling is tricky. Let's assume the template cards are designed such that
//                 when the pair wrapper is scaled to fit the cell, the inner cards look okay.
//                 Alternatively, one could try to set max-height: calc(50% - 0.1mm) or similar.
//              */
//           }
//         `;

//         if (printOrientation === 'landscape-rotated') {
//             cardTransformStyles = `
//               .print-item > div { /* Targets single card or pair wrapper */
//                 transform: rotate(90deg) !important; transform-origin: center center !important;
//               }
//             `;
//         }

//         return `
//           ${pageSetup}
//           @media print {
//             html, body { height: initial !important; overflow: initial !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//             .no-print, .screen-only { display: none !important; }
//             ${layoutStyles}
//             ${cardTransformStyles}
//           }
//         `;
//     }, [printOrientation]); // No dependency on actualCardDimensions for CSS, as scaling is via max-width/height

//     // --- Printing Hook Setup ---
//     const generatePDF = useReactToPrint({
//         content: () => {
//             if (studentsToPrint.length === 0) {
//                 toast.info("No students selected for printing."); setIsLoader(false); return null;
//             }
//             setIsLoader(true);
//             const ITEMS_PER_PAGE = 10;
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area';
//             if (printMode === 'back' && (printOrientation === 'landscape' || printOrientation === 'portrait')) {
//                  printContainer.classList.add('print-rtl');
//             }
//             printContentRef.current = printContainer;

//             studentsToPrint.forEach((student, index) => {
//                 if (!student || !student._id) return;

//                 const itemElement = document.createElement('div'); // Grid cell
//                 itemElement.className = `print-item item-${student._id}`;

//                 let contentForCell; // This will be the element (card or pair wrapper) placed in the cell

//                 if (printMode === 'front') {
//                     const tempDiv = document.createElement('div');
//                     tempDiv.innerHTML = renderFrontTemplate(student).trim();
//                     contentForCell = tempDiv.firstChild; 
//                 } else if (printMode === 'back') {
//                     const tempDiv = document.createElement('div');
//                     tempDiv.innerHTML = renderBackTemplate(student).trim();
//                     contentForCell = tempDiv.firstChild;
//                 } else { // 'both'
//                     contentForCell = document.createElement('div'); // Pair wrapper
//                     contentForCell.className = 'card-pair-wrapper';

//                     const frontTempDiv = document.createElement('div');
//                     frontTempDiv.innerHTML = renderFrontTemplate(student).trim();
//                     if (frontTempDiv.firstChild) contentForCell.appendChild(frontTempDiv.firstChild);

//                     const backTempDiv = document.createElement('div');
//                     backTempDiv.innerHTML = renderBackTemplate(student).trim();
//                     if (backTempDiv.firstChild) contentForCell.appendChild(backTempDiv.firstChild);
//                 }

//                 if (contentForCell) {
//                     itemElement.appendChild(contentForCell);
//                 } else {
//                     itemElement.innerHTML = `<div style="border:1px solid red; font-size:7pt; color:red; padding:3px; display:flex; align-items:center; justify-content:center; width:100%; height:100%;">Content Error</div>`;
//                 }

//                 if ((index + 1) % ITEMS_PER_PAGE === 0 && index < studentsToPrint.length - 1) {
//                     itemElement.style.pageBreakAfter = 'always';
//                 } else {
//                     itemElement.style.pageBreakAfter = 'auto';
//                 }
//                 printContainer.appendChild(itemElement);
//             });
//             return printContentRef.current;
//         },
//         documentTitle: `ID_Cards_${printMode}_${printOrientation}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onAfterPrint: () => {
//             setIsLoader(false);
//             if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length} ID Card item(s) sent to printer!`);
//             printContentRef.current = null;
//         },
//         onPrintError: (error) => {
//             setIsLoader(false); toast.error("Printing failed."); console.error("Printing Error:", error);
//             printContentRef.current = null;
//         },
//         pageStyle: dynamicPageStyle,
//     });

//     // --- Options for Select Components & Selection State Calculation ---
//     const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//     const sectionOptions = useMemo(() => {
//         if (!selectedClass) return [];
//         const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//         return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//     }, [classData, selectedClass]);
//     const numFilteredStudentsWithId = useMemo(() => filteredStudentData.filter(s => s._id).length, [filteredStudentData]);
//     const isSelectAllChecked = useMemo(() => numFilteredStudentsWithId > 0 && selectedStudentIds.size === numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);


//     // --- JSX ---
//     return (
//         <>
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Student ID Cards"/>
//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 {/* --- Filters --- */}
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                     <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
//                         <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData} />
//                         <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder={!selectedClass ? "Select Class First" : "Select Section"} />
//                         <TextField fullWidth id="filter-name" label="Filter by Name / Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }} InputLabelProps={{ shrink: true }} />
//                         <FormControl fullWidth size="small" disabled={isLoadingData}>
//                             <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
//                             <Select labelId="print-mode-select-label" value={printMode} label="Print Sides" onChange={handlePrintModeChange}>
//                                 <MenuItem value={'both'}>Both Sides</MenuItem>
//                                 <MenuItem value={'front'}>Front Only</MenuItem>
//                                 <MenuItem value={'back'}>Back Only</MenuItem>
//                             </Select>
//                         </FormControl>
//                         <FormControl fullWidth size="small" disabled={isLoadingData}>
//                             <InputLabel id="print-orientation-select-label">Page Orientation</InputLabel>
//                             <Select labelId="print-orientation-select-label" value={printOrientation} label="Page Orientation" onChange={handleOrientationChange}>
//                                 <MenuItem value={'landscape'}>A4 Landscape (10 cards)</MenuItem>
//                                 <MenuItem value={'portrait'}>A4 Portrait (10 cards)</MenuItem>
//                                 <MenuItem value={'landscape-rotated'}>A4 Landscape - Rotated Cards (10 cards)</MenuItem>
//                             </Select>
//                         </FormControl>
//                         <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}>
//                             {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
//                         </Button>
//                     </div>
//                     <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontStyle: 'italic' }}>
//                         All A4 page orientations will attempt to print 10 ID cards per page. Cards will be scaled to fit.
//                         {printOrientation === 'landscape-rotated' && " Cards will be rotated 90° on the page."}
//                         {!actualCardDimensions.parsedSuccessfully && <span style={{color: 'red', fontWeight:'bold'}}> Warning: Using fallback card dimensions. Print scaling might be inaccurate.</span>}
//                     </Typography>
//                 </Box>

//                 {/* --- Selection Controls / Status --- */}
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
//                      {isLoadingData && (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}><CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography></Box>)}
//                      {!isLoadingData && numFilteredStudentsWithId > 0 && (<FormControlLabel control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange} disabled={numFilteredStudentsWithId === 0} />} label={`Select All (${numFilteredStudentsWithId} shown)`} sx={{ mr: 'auto' }} />)}
//                      {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (<Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>No students match filters.</Typography>)}
//                      {!isLoadingData && studentData.length === 0 && (<Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>No active students found.</Typography>)}
//                      {!isLoadingData && filteredStudentData.length > 0 && numFilteredStudentsWithId !== filteredStudentData.length && (<Typography sx={{ textAlign: 'right', color: 'warning.main', fontSize: '0.8rem', ml: 2 }}>Note: {filteredStudentData.length - numFilteredStudentsWithId} student(s) shown cannot be selected (missing ID).</Typography>)}
//                 </Box>

//                 {/* --- On-Screen Preview --- */}
//                 <Box className="screen-only">
//                     {!isLoadingData && filteredStudentData.length > 0 && (<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>Screen preview uses actual card dimensions. Print output will scale cards to fit 10 per page. Use browser Print Preview.</Typography>)}
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'flex-start', padding: '10px 0' }}>
//                         {!isLoadingData && filteredStudentData.map((student) => {
//                             if (!student || !student._id) {
//                                 return (
//                                     <Box key={student?.admissionNumber || Math.random()} sx={{ border: '1px dashed #ccc', borderRadius: '4px', padding: '5px', backgroundColor: '#f5f5f5', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: `${actualCardDimensions.width + 2}mm`, opacity: 0.6, boxSizing: 'border-box', height: 'fit-content' }}>
//                                         <Typography variant="caption" color="error" sx={{mb: 0.5, fontWeight: 'bold'}}>Missing ID</Typography>
//                                         <Typography variant="caption" sx={{fontSize: '0.7rem'}}>{student?.studentName || 'Unknown'}</Typography>
//                                         <Typography variant="caption" sx={{fontSize: '0.7rem'}}>({student?.admissionNumber || 'N/A'})</Typography>
//                                         <Box sx={{ width: `${actualCardDimensions.width}mm`, height: `${actualCardDimensions.height}mm`, border: '1px solid #eee', mt: 1, display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'white' }}><Typography variant="caption" color="textSecondary" sx={{fontSize: '0.7rem'}}>Preview N/A</Typography></Box>
//                                     </Box>
//                                 );
//                             }
//                             const studentKey = student._id;
//                             const isSelected = selectedStudentIds.has(studentKey);
//                             return (
//                                 <Box key={studentKey} sx={{ border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd', borderRadius: '4px', padding: '5px', backgroundColor: isSelected ? '#e6f7ff' : '#fff', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', minWidth: `${actualCardDimensions.width + 2}mm`, boxSizing: 'border-box', transition: 'border-color 0.2s ease, background-color 0.2s ease', height: 'fit-content' }}>
//                                     <FormControlLabel control={<Checkbox size="small" checked={isSelected} onChange={(e) => handleSelectSingleChange(e, studentKey)} />} label={<Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: `${actualCardDimensions.width}mm` }}>{student.studentName || 'N/A'} ({student.admissionNumber || 'N/A'})</Typography>} sx={{ width: '100%', alignSelf: 'flex-start', mb: 0.5, mr: 0 }}/>
//                                     {(printMode === 'front' || printMode === 'both') && (
//                                         <div style={{ border: '1px dashed #ccc', width: `${actualCardDimensions.width}mm`, height: `${actualCardDimensions.height}mm`, overflow: 'hidden', marginBottom: printMode === 'both' ? '5px' : '0', boxSizing: 'border-box' }} dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
//                                     )}
//                                     {(printMode === 'back' || printMode === 'both') && (
//                                         <div style={{ border: '1px dashed #aaa', width: `${actualCardDimensions.width}mm`, height: `${actualCardDimensions.height}mm`, overflow: 'hidden', boxSizing: 'border-box' }} dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
//                                     )}
//                                 </Box>
//                             );
//                         })}
//                     </Box>
//                 </Box>
//             </Box>
//         </>
//     );
// };

// export default IdCard;


// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import {
//     Button, Grid, TextField, Typography, Box, CircularProgress,
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb"; // Adjust path if needed
// import BreadcrumbList from "../../Dynamic/BreadcrumbList"; // Adjust path if needed


// const A4_WIDTH_LANDSCAPE_MM = 297;
// const A4_HEIGHT_LANDSCAPE_MM = 210;
// const A4_WIDTH_PORTRAIT_MM = 210;
// const A4_HEIGHT_PORTRAIT_MM = 297;
// const A4_MARGIN_MM = 10; // Margin for printing

// const IdCard = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null); // Holds fetched template design
//     const [studentData, setStudentData] = useState([]); // All active students
//     const [classData, setClassData] = useState([]); // All classes for filtering
//     const [filteredStudentData, setFilteredStudentData] = useState([]); // Students matching filters
//     const [filterName, setFilterName] = useState(""); // Name/Adm No filter input
//     const [selectedClass, setSelectedClass] = useState(""); // Selected class filter
//     const [selectedSection, setSelectedSection] = useState(""); // Selected section filter
//     const [isLoadingData, setIsLoadingData] = useState(true); // Loading state for initial data fetch
//     const [printMode, setPrintMode] = useState('both'); // 'front', 'back', or 'both'
//     const [printOrientation, setPrintOrientation] = useState('landscape'); // 'landscape', 'portrait', 'landscape-rotated'
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set()); // IDs of students checked for printing

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []); // Get session data once
//     const { currentColor, setIsLoader, isLoader } = useStateContext(); // Context for theme color and print loading state
//     const componentRef = useRef(); // Optional ref for the entire component
//     const printContentRef = useRef(); // Ref specifically for the generated print content

//     // --- Default Templates (Fallbacks if API fails or no template exists) ---
//     const [defaultFrontTemplate] = useState(`
//     <div style='background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'><h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3><p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p></div>
//           <div style='margin: 0 auto; margin-top: 5px; width: 30mm; height: 35mm; border: 1px solid #aaa; border-radius: 4px; overflow: hidden; background-color: #eee; display: flex; justify-content: center; align-items: center;'><img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/></div>
//           <div style='margin-top: 8mm; padding-left: 2mm; padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>CLASS<span style="float: right;">: \${class}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>DOB<span style="float: right;">: \${dob}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>Roll<span style="float: right;">: \${rollNo}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>PHONE<span style="float: right;">: \${mobile}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span></p>
//           </div>
//       </div>
//     </div>
//     `);
//     const [defaultBackTemplate] = useState(`
//     <div style='background-color: #e0e0e0; background-position: center; background-repeat: no-repeat;position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>
//       <div style='position: relative; z-index: 2;'>
//         <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info</h4>
//         <div style='display: flex; justify-content: space-around; text-align: center; margin-bottom: 5mm;'>
//             <div><img src='\${fatherImage}' alt="Father" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Father</p></div>
//             <div><img src='\${motherImage}' alt="Mother" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Mother</p></div>
//             <div><img src='\${guardianImage}' alt="Guardian" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Guardian</p></div>
//         </div>
//         <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//         <p style='font-size: 7pt; margin: 1mm 0;'>Session: \${session}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Admission No: \${admissionNumber}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Guardian Name: \${guardianname}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Parent Contact: \${parentContact}</p>
//       </div>
//       <div style='position: relative; z-index: 2; text-align: center; font-size: 6pt; color: #555;'>
//          <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//          <p style='margin: 0;'>[School Address/Contact Info Here]</p>
//          <p style='margin: 0;'>If found, please return to school office.</p>
//       </div>
//     </div>
//     `);

//     // --- Helper Functions ---
//     const decodeBase64 = useCallback((encoded) => {
//         try {
//             if (!encoded || typeof encoded !== 'string') { return null; }
//             let cleanEncoded = encoded;
//             // Remove surrounding quotes if present (might come from JSON stringification)
//             if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
//                 cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
//             }
//             // Replace escaped quotes within the string
//             cleanEncoded = cleanEncoded.replace(/\\"/g, '"');

//             const binaryString = window.atob(cleanEncoded);
//             const bytes = new Uint8Array(binaryString.length);
//             for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//             const decoder = new TextDecoder('utf-8'); // Use TextDecoder for proper UTF-8 handling
//             return decoder.decode(bytes);
//         } catch (error) {
//             console.error("Error decoding base64 string:", error, "Input:", encoded); // Log the input on error
//             // Return a default error message or the fallback template structure if decoding fails
//             return `<div style='border:1px solid red; padding: 10px; color: red; font-size: 8pt;'>Error decoding template</div>`;
//         }
//     }, []);

//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 setIdCardData(response.designFormats[0]); // Assuming the first design is the active one
//                 console.log("Fetched ID card template:", response.designFormats[0]);
//             } else {
//                 console.warn("No custom ID card design found or API response format incorrect. Using default templates.");
//                 setIdCardData(null); // Ensure it's null to trigger fallback
//             }
//         } catch (error) {
//             console.error("Error fetching ID card design:", error);
//             toast.error("Could not load custom ID card template.");
//             setIdCardData(null); // Ensure fallback on error
//         }
//     }, []);

//     const fetchAllClasses = useCallback(async () => {
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//                 setClassData(response.classes || []);
//             } else {
//                 toast.error(response?.message || "Failed to fetch classes.");
//                 setClassData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error("An error occurred while fetching classes.");
//             setClassData([]);
//         }
//     }, []);

//     const fetchAllStudents = useCallback(async () => {
//         if (!session) {
//             toast.error("Session information is missing. Cannot fetch students.");
//             setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return;
//         }
//         setIsLoadingData(true);
//         try {
//             const response = await ActiveStudents(session);
//             if (response?.success && response.students?.data) {
//                 // Ensure students have an _id and required fields for safety
//                 const validStudents = (response.students.data || []).filter(s => s && s._id);
//                 if (validStudents.length !== (response.students.data || []).length) {
//                     console.warn("Some student records were missing an '_id' or were invalid and were excluded.");
//                 }
//                 setStudentData(validStudents);
//             } else {
//                 toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//                 setStudentData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching students:", error);
//             toast.error("An error occurred while fetching students.");
//             setStudentData([]);
//         } finally {
//             setIsLoadingData(false);
//         }
//     }, [session]); // Dependency on session

//     // --- Effects ---
//     useEffect(() => {
//         // Initial data fetch
//         Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]);
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]); // Re-run if fetch functions change (e.g., dependencies change)

//     useEffect(() => {
//         // Apply filters when dependencies change
//         if (isLoadingData) return; // Don't filter while loading

//         let filtered = [...studentData]; // Start with a copy of all students

//         // Apply class filter
//         if (selectedClass) {
//             filtered = filtered.filter(s => s.class === selectedClass);
//         }

//         // Apply section filter (only if a class is also selected)
//         if (selectedClass && selectedSection) {
//             // Handle potential null/undefined sections consistently
//             filtered = filtered.filter(s => (s.section || '') === selectedSection);
//         }

//         // Apply name/admission number filter
//         if (filterName) {
//             const lowerCaseFilter = filterName.toLowerCase().trim();
//             if (lowerCaseFilter) {
//                 filtered = filtered.filter(s =>
//                     s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//                     s.admissionNumber?.toString().toLowerCase().includes(lowerCaseFilter) // Ensure admissionNumber is string
//                 );
//             }
//         }

//         setFilteredStudentData(filtered);
//         setSelectedStudentIds(new Set()); // Reset selection when filters change
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => {
//         setSelectedClass(e.target.value);
//         setSelectedSection(""); // Reset section when class changes
//     };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);
//     const handleOrientationChange = (e) => setPrintOrientation(e.target.value);

//     const handleSelectAllChange = (event) => {
//         if (event.target.checked) {
//             // Select only those currently filtered students *that have an ID*
//             const allFilteredIdsWithId = new Set(
//                 filteredStudentData.filter(student => student._id).map(student => student._id)
//             );
//             setSelectedStudentIds(allFilteredIdsWithId);
//         } else {
//             setSelectedStudentIds(new Set()); // Clear selection
//         }
//     };

//     const handleSelectSingleChange = (event, studentId) => {
//         if (!studentId) return; // Should not happen if checkbox is only shown for students with ID
//         const isChecked = event.target.checked;
//         setSelectedStudentIds(prevSelectedIds => {
//             const newSelectedIds = new Set(prevSelectedIds);
//             if (isChecked) {
//                 newSelectedIds.add(studentId);
//             } else {
//                 newSelectedIds.delete(studentId);
//             }
//             return newSelectedIds;
//         });
//     };

//     // --- Template Rendering Logic ---
//     const decodedApiFrontTemplate = useMemo(() => {
//         if (!idCardData?.frontTemplate) return null;
//         return decodeBase64(idCardData.frontTemplate);
//     }, [idCardData, decodeBase64]);

//     const decodedApiBackTemplate = useMemo(() => {
//         if (!idCardData?.backTemplate) return null;
//         return decodeBase64(idCardData.backTemplate);
//     }, [idCardData, decodeBase64]);

//     // Use decoded template if available, otherwise fallback to default
//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         if (!template) {
//              console.error(`Template for ${cardSide} side is missing or invalid.`);
//              // Provide a visible error div with standard card dimensions
//              return `<div style=' border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box; background-color: #ffebee;'>Missing ${cardSide} Template</div>`;
//         }
//         let renderedHtml = template;
//         try {
//             // Regex to find placeholders like ${key} or ${object.key}
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 let value = data; // Start with the full data object

//                 // Handle nested keys like 'studentImage.url' if necessary
//                 // This simple approach might need enhancement for deeper nesting if templates use it
//                 if (cleanKey.includes('.')) {
//                      const keys = cleanKey.split('.');
//                      value = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : undefined, data);
//                 } else {
//                     // Direct key access
//                     value = data.hasOwnProperty(cleanKey) ? data[cleanKey] : undefined;
//                 }


//                 // Handle missing images or values gracefully
//                 if (value === undefined || value === null || value === '') {
//                     const lowerKey = cleanKey.toLowerCase();
//                     // Specific placeholders for images
//                     if (lowerKey.includes('image')) {
//                          // More specific checks first
//                          if (lowerKey === 'studentimage') return "https://via.placeholder.com/85x95.png?text=No+Photo";
//                          if (lowerKey === 'fatherimage' || lowerKey === 'motherimage' || lowerKey === 'guardianimage') return "https://via.placeholder.com/60x70.png?text=N/A";
//                          // Generic image placeholder if needed, otherwise empty string
//                          return "https://via.placeholder.com/50x50.png?text=Image+N/A";
//                     }
//                     // For non-image fields, return empty string or 'N/A'
//                     return ''; // Or return 'N/A' if preferred
//                 }

//                 // Ensure the value is a string before returning
//                 return String(value);
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             renderedHtml = `<div style=' border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box; background-color: #ffebee;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); // Dependencies: None, it's a pure function based on its arguments

//     const renderFrontTemplate = useCallback((student) => {
//          if (!student) return replacePlaceholders(frontTemplateToUse, {}, 'Front'); // Handle null student

//          // Prepare data object for placeholder replacement
//          const data = {
//              // Template background (might be specific to front/back in fetched data)
//              backgroundImage: idCardData?.frontImage?.url || "", // Use specific front image URL if available
//              // Student details
//              studentImage: student.studentImage?.url, // Pass URL directly, placeholder handles missing
//              name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//              class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '',
//              gender: student?.gender || '',
//              contact: student?.contact || '', // Student's own contact
//              transport: student?.transport || '',
//              rollNo: student?.rollNo || '',
//              admissionNumber: student?.admissionNumber || '',
//              // Parent/Guardian Details (often needed on front)
//              father_name: student?.fatherName?.toUpperCase() || '',
//              mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '',
//              mobile: student?.contact || student?.parentContact || '', // Prioritize student, fallback to parent
//              parentContact: student?.parentContact || '',
//              // Address
//              address: student?.address || '',
//              // Session
//              session: student?.session || session?.name || '', // Use student session, fallback to current global session
//              // Parent Images (might be used in some front designs)
//              fatherImage: student.fatherImage?.url,
//              motherImage: student.motherImage?.url,
//              guardianImage: student.guardianImage?.url,
//              // Add any other fields your template might use
//              // e.g., bloodGroup: student?.bloodGroup || '',
//          };
//          return replacePlaceholders(frontTemplateToUse, data, 'Front');
//      }, [idCardData, frontTemplateToUse, replacePlaceholders, session]); // Include session if used as fallback

//      const renderBackTemplate = useCallback((student) => {
//          if (!student) return replacePlaceholders(backTemplateToUse, {}, 'Back'); // Handle null student

//          const data = {
//              // Template background
//              backgroundImage: idCardData?.backImage?.url || "", // Use specific back image URL if available
//              // Parent Images (common on back)
//              fatherImage: student.fatherImage?.url,
//              motherImage: student.motherImage?.url,
//              guardianImage: student.guardianImage?.url,
//              // Parent/Guardian Details
//              father_name: student?.fatherName?.toUpperCase() || '',
//              mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '',
//              parentContact: student?.parentContact || '',
//              // Student Details (can also be on back)
//              studentImage: student.studentImage?.url,
//              name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//              class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '',
//              gender: student?.gender || '',
//              contact: student?.contact || '', // Student's direct contact
//              mobile: student?.contact || student?.parentContact || '', // General mobile number
//              transport: student?.transport || '',
//              rollNo: student?.rollNo || '',
//              admissionNumber: student?.admissionNumber || '',
//              // Address
//              address: student?.address || '',
//              // Session
//              session: student?.session || session?.name || '',
//               // Add any other fields your template might use
//              // e.g., emergencyContact: student?.emergencyContact || '',
//          };
//          return replacePlaceholders(backTemplateToUse, data, 'Back');
//      }, [idCardData, backTemplateToUse, replacePlaceholders, session]); // Include session if used as fallback

//     // --- Students to Print Calculation ---
//     const studentsToPrint = useMemo(() => {
//         // Filter the currently *filtered* list to include only those whose IDs are selected
//         return filteredStudentData.filter(student => student?._id && selectedStudentIds.has(student._id));
//     }, [filteredStudentData, selectedStudentIds]);

//     // --- Dynamic Page Style based on Orientation ---
//     const dynamicPageStyle = useMemo(() => {
//         let pageSetup = '';
//         let layoutStyles = '';
//         let cardStyles = ''; // Styles for the card itself (rotation etc.)

//         const basePrintStyles = `
//             html, body {
//               height: initial !important; /* Override potential weird height issues */
//               overflow: initial !important;
//               -webkit-print-color-adjust: exact !important; /* Force printing of background colors/images in Chrome/Safari */
//               print-color-adjust: exact !important; /* Standard property for background printing */
//             }
//             .no-print, .screen-only { display: none !important; } /* Hide non-print elements */

//              /* --- Individual Item Containers (Common for all layouts) --- */
//             .print-item {
//               page-break-inside: avoid !important; /* CRITICAL: Prevent items splitting across pages */
//               box-sizing: border-box !important;
//               overflow: hidden !important; /* Prevent content spill from item container */
//               border: none !important; /* No border on the container itself */
//               margin: 0 !important; /* Use gap or positioning, not margin */
//               padding: 0 !important;
//               /* Width/Height/Display depend on layout */
//             }

//             /* --- Actual Card Content Divs (Common style) --- */
//              .id-card {
               
//                 overflow: hidden !important; /* Clip content within card bounds */
//                 border: none !important; /* No borders in print */
//                 box-sizing: border-box !important;
//                 display: block !important; /* Treat as block for layout */
//                 background-color: transparent !important; /* Allow template background */
//                 page-break-inside: avoid !important; /* Redundant but safe */
//                 margin: 0 auto !important; /* Center card horizontally if container is wider */
//              }

//              /* Container for front/back pair */
//             .id-card-pair {
//                 display: flex !important;
//                 flex-direction: column !important; /* Stack front/back vertically by default */
//                 gap: 1mm !important; /* Small gap between front and back */
   
//                 height: auto !important; /* Adjusts to content height (2 cards + gap) */
//                 margin: 0 auto !important; /* Center pair horizontally if container is wider */
//                  box-sizing: border-box !important;
//             }
//         `;

//         if (printOrientation === 'landscape') {
//             const printableWidthMM = A4_WIDTH_LANDSCAPE_MM - (2 * A4_MARGIN_MM); // ~277mm
//             const printableHeightMM = A4_HEIGHT_LANDSCAPE_MM - (2 * A4_MARGIN_MM); // ~190mm
//             const itemsPerRow = 5; // floor(277 / 54)
//             const numRows = 2; // To fit 10 items
//             // Calculate gaps, ensuring they are non-negative
//             const columnGapMM = Math.max(0, (printableWidthMM - itemsPerRow ) / (itemsPerRow > 1 ? itemsPerRow - 1 : 1));
//             // Use a fixed reasonable row gap instead of trying to perfectly fill height
//             const rowGapMM = 5; // Fixed vertical gap (adjust as needed)

//             pageSetup = `
//               @page {
//                 size: A4 landscape;
//                 margin: ${A4_MARGIN_MM}mm;
//               }
//             `;
//             layoutStyles = `
//               /* Flexbox layout for standard landscape grid */
//               .id-card-print-area {
//                 display: flex !important;
//                 flex-wrap: wrap !important;
//                 flex-direction: row !important; /* Left-to-right by default */
//                 justify-content: flex-start !important;
//                 align-items: flex-start !important; /* Align items to top */
//                 align-content: flex-start !important; /* Align wrapped lines to top */
//                 width: ${printableWidthMM}mm !important;
//                 /* Height determined by content fitting within A4 height */
//                  min-height: ${printableHeightMM}mm; /* Suggest height but allow overflow if needed */
//                 column-gap: ${columnGapMM.toFixed(2)}mm !important;
//                 row-gap: ${rowGapMM.toFixed(2)}mm !important;
//                 box-sizing: border-box !important;
//                 overflow: visible !important; /* Allow content to flow to next page */
//               }
//               /* RTL override for back-only printing in grid layout */
//               .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }

//               /* Item size in grid layout */
//               .print-item {
//                  display: block !important; /* Items behave as blocks in flex flow */
                
//                  /* Height determined by content (single card or pair) */
//               }
//                .single-card-print {  } /* Fixed height for single card items */
//             `;
//         } else if (printOrientation === 'portrait') {
//             const printableWidthMM = A4_WIDTH_PORTRAIT_MM - (2 * A4_MARGIN_MM); // ~190mm
//             const printableHeightMM = A4_HEIGHT_PORTRAIT_MM - (2 * A4_MARGIN_MM); // ~277mm
//             const itemsPerRow = 3; // floor(190 / 54)
//             const numRows = 3; // floor(277 / 86) - Max rows that fit 9 cards
//             // Calculate gaps
//             const columnGapMM = Math.max(0, (printableWidthMM - itemsPerRow ) / (itemsPerRow > 1 ? itemsPerRow - 1 : 1));
//             const rowGapMM = Math.max(0, (printableHeightMM - numRows ) / (numRows > 1 ? numRows - 1 : 1)); // Approx 9.5mm

//             pageSetup = `
//               @page {
//                 size: A4 portrait;
//                 margin: ${A4_MARGIN_MM}mm;
//               }
//             `;
//             layoutStyles = `
//               /* Flexbox layout for portrait grid */
//               .id-card-print-area {
//                 display: flex !important;
//                 flex-wrap: wrap !important;
//                 flex-direction: row !important;
//                 justify-content: flex-start !important;
//                 align-items: flex-start !important;
//                 align-content: flex-start !important;
//                 width: ${printableWidthMM}mm !important;
//                 min-height: ${printableHeightMM}mm;
//                 column-gap: ${columnGapMM.toFixed(2)}mm !important;
//                 row-gap: ${rowGapMM.toFixed(2)}mm !important;
//                 box-sizing: border-box !important;
//                 overflow: visible !important;
//               }
//                /* RTL override */
//                .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }

//                /* Item size in portrait grid */
//                .print-item {
//                  display: block !important;
                
//                }
              
//             `;
//         } else if (printOrientation === 'landscape-rotated') {
//             const printableWidthMM = A4_WIDTH_LANDSCAPE_MM - (2 * A4_MARGIN_MM); // ~277mm
//             const printableHeightMM = A4_HEIGHT_LANDSCAPE_MM - (2 * A4_MARGIN_MM); // ~190mm
//             // Each item takes roughly half the page height, centered
//             const itemHeightMM = printableHeightMM / 2; // ~95mm

//             pageSetup = `
//               @page {
//                 size: A4 landscape;
//                 margin: ${A4_MARGIN_MM}mm;
//               }
//             `;
//             layoutStyles = `
//               /* Simple block flow for the main container in rotated mode */
//               .id-card-print-area {
//                 display: block !important; /* Items stack vertically */
//                 width: ${printableWidthMM}mm !important;
//                 height: ${printableHeightMM}mm !important; /* Explicit height to manage page breaks */
//                  box-sizing: border-box !important;
//                  overflow: hidden !important; /* Clip content within the page bounds */
//               }
//               /* No RTL needed for vertical block flow */

//               /* Each print item takes full width and half height, centers content */
//               .print-item {
//                  display: flex !important; /* Use flex to center the rotated card */
//                  justify-content: center !important; /* Center horizontally */
//                  align-items: center !important; /* Center vertically */
//                  width: 100% !important; /* Full printable width */
//                  height: ${itemHeightMM.toFixed(2)}mm !important; /* Half printable height */
//                  /* border: 1px dotted blue; */ /* For debugging item bounds */
//               }
//             `;
//              // Specific styles for the card elements ONLY when rotated
//             cardStyles = `
//                /* Apply rotation to the card itself or the pair container inside the print-item */
//                .print-item > .id-card,
//                .print-item > .id-card-pair {
//                   transform: rotate(90deg) !important;
//                   transform-origin: center center !important;
//                   /* Reset margin auto from base .id-card/.id-card-pair for flex centering */
//                   margin: 0 !important;
//                   /* border: 1px dashed red; */ /* For debugging card bounds */
//                }

//                /* Ensure the pair still stacks its internal items correctly relative to its *own* (now rotated) orientation */
//                /* The default flex-direction: column on .id-card-pair should still work visually correctly after rotation */
//                .id-card-pair > .id-card {
//                    /* Override the margin: auto from base .id-card style if needed */
//                    margin: 0 !important;
//                }
//             `;
//         }

//         // Combine all style parts
//         return `
//           ${pageSetup}
//           @media print {
//             ${basePrintStyles}
//             ${layoutStyles}
//             ${cardStyles} /* Apply card-specific styles (only has content in rotated mode) */
//           }
//         `;
//     }, [printOrientation]); // Recalculate when orientation changes

//     // --- Printing Hook Setup ---
//     const generatePDF = useReactToPrint({
//         content: () => {
//             if (studentsToPrint.length === 0) {
//                 toast.info("No students selected for printing.");
//                 setIsLoader(false); // Ensure loader is off if nothing to print
//                 return null; // Stop the print process
//             }
//             setIsLoader(true); // Show loading indicator during generation

//             // --- Calculate Items Per Page Based on Current Orientation ---
//             let itemsPerPage;
//             if (printOrientation === 'landscape') {
//                  itemsPerPage = 10; // 5x2 grid
//             } else if (printOrientation === 'portrait') {
//                  itemsPerPage = 9; // 3x3 grid (max fit)
//             } else if (printOrientation === 'landscape-rotated') {
//                  itemsPerPage = 2; // 2 rotated cards per page
//             } else {
//                  itemsPerPage = 10; // Default fallback (shouldn't be reached)
//                  console.warn("Unknown print orientation, defaulting to 10 items per page.");
//             }
//             console.log(`Printing with orientation: ${printOrientation}, items per page: ${itemsPerPage}`);
//             // --- End Calculation ---


//             // Create the container div for print content
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area'; // Base class for layout
//             // Add RTL class only if needed for specific modes (grid layouts)
//             if (printMode === 'back' && (printOrientation === 'landscape' || printOrientation === 'portrait')) {
//                  printContainer.classList.add('print-rtl');
//             }
//             printContentRef.current = printContainer; // Assign to ref

//             // Iterate over only the selected students
//             studentsToPrint.forEach((student, index) => {
//                 if (!student || !student._id) {
//                     console.warn("Skipping a selected student due to missing data:", student);
//                     return; // Skip iteration if essential data is missing
//                 }
//                 const studentKey = student._id;
//                 // Create the outer print item container for each student/card
//                 let itemElement = document.createElement('div');
//                 itemElement.className = `print-item item-${studentKey}`; // Common class for item container


//                 // Determine the inner content (single card div or pair div)
//                 let innerContentContainer;
//                 if (printMode === 'front') {
//                     innerContentContainer = document.createElement('div');
//                     // Add classes for styling (base card + single identifier)
//                     innerContentContainer.className = 'id-card single-card-print';
//                     innerContentContainer.innerHTML = renderFrontTemplate(student);
//                 } else if (printMode === 'back') {
//                     innerContentContainer = document.createElement('div');
//                     innerContentContainer.className = 'id-card single-card-print';
//                     innerContentContainer.innerHTML = renderBackTemplate(student);
//                 } else { // 'both' mode - Create a pair container
//                     innerContentContainer = document.createElement('div');
//                     innerContentContainer.className = 'id-card-pair'; // Class for the pair wrapper

//                     // Create front and back divs *inside* the pair container
//                     const frontDiv = document.createElement('div');
//                     frontDiv.className = 'id-card id-card-front'; // Individual card class
//                     frontDiv.innerHTML = renderFrontTemplate(student);

//                     const backDiv = document.createElement('div');
//                     backDiv.className = 'id-card id-card-back'; // Individual card class
//                     backDiv.innerHTML = renderBackTemplate(student);

//                     // Append front and back to the pair container
//                     innerContentContainer.appendChild(frontDiv);
//                     innerContentContainer.appendChild(backDiv);
//                 }

//                 // Append the inner content (card or pair) to the main item container
//                 itemElement.appendChild(innerContentContainer);

//                 // --- Page Break Logic (Using dynamic itemsPerPage) ---
//                 // Add a page break *after* this item if it's the last one on the current page
//                 // AND it's not the very last item overall.
//                 if ((index + 1) % itemsPerPage === 0 && index < studentsToPrint.length - 1) {
//                     itemElement.style.pageBreakAfter = 'always';
//                 } else {
//                     itemElement.style.pageBreakAfter = 'auto'; // Ensure it doesn't break otherwise
//                 }

//                 // Add the completed item (with its inner card/pair) to the main print container
//                 printContainer.appendChild(itemElement);
//             });

//             // Return the ref's current value (the populated container)
//              return printContentRef.current;
//         },
//         documentTitle: `ID_Cards_${printMode}_${printOrientation}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onBeforeGetContent: () => { /* Loader is set in content() */ },
//         onAfterPrint: () => {
//             setIsLoader(false);
//             if (studentsToPrint.length > 0) { // Only toast success if printing was attempted
//                 toast.success(`${studentsToPrint.length} ID Card item(s) sent to printer!`);
//             }
//             printContentRef.current = null; // Clean up ref
//         },
//         onPrintError: (error) => {
//             setIsLoader(false);
//             toast.error("Printing failed. See console for details.");
//             console.error("Printing Error:", error);
//             printContentRef.current = null; // Clean up ref
//         },
//         pageStyle: dynamicPageStyle, // Use the dynamically generated style string
//     });


//     // --- Options for Select Components ---
//     const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);

//     const sectionOptions = useMemo(() => {
//         if (!selectedClass) return []; // No class selected, no sections
//         const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//         // Ensure sections exist and map them
//         return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//     }, [classData, selectedClass]);

//     // --- Selection State Calculation ---
//     // Count how many *filtered* students actually have an ID (and can be selected)
//     const numFilteredStudentsWithId = useMemo(() => filteredStudentData.filter(s => s._id).length, [filteredStudentData]);
//     // Check if 'Select All' should be checked (all selectable filtered students are selected)
//     const isSelectAllChecked = useMemo(() => numFilteredStudentsWithId > 0 && selectedStudentIds.size === numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);
//     // Check if 'Select All' should be indeterminate (some, but not all, selectable filtered students are selected)
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);

//     // --- JSX ---
//     return (
//         <>
//             {/* Assume PageHeaderWithBreadcrumb and BreadcrumbList are correctly imported and configured */}
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Student ID Cards"/>

//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>

//                 {/* --- Filters and Print Button --- */}
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                      {/* Using Tailwind grid for responsiveness, adjust breakpoints/cols as needed */}
//                     <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
//                        {/* Class Select */}
//                         <ReactSelect
//                             name="class"
//                             value={selectedClass}
//                             handleChange={handleClassChange}
//                             label="Class"
//                             dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//                             placeholder="Select Class"
//                             isDisabled={isLoadingData}
//                         />
//                          {/* Section Select */}
//                          <ReactSelect
//                             name="section"
//                             value={selectedSection}
//                             handleChange={handleSectionChange}
//                             label="Section"
//                             dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//                             disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} // Disable if no class or no sections
//                             placeholder={!selectedClass ? "Select Class First" : "Select Section"}
//                         />
//                          {/* Name/Adm No Filter */}
//                         <TextField
//                             fullWidth
//                             id="filter-name"
//                             label="Filter by Name / Adm. No."
//                             variant="outlined"
//                             onChange={handleFilterByNameChange}
//                             value={filterName}
//                             size="small" // Match ReactSelect size
//                             disabled={isLoadingData}
//                              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }} // Span example
//                              InputLabelProps={{ shrink: true }} // Keep label floated
//                         />
//                          {/* Print Mode Select */}
//                         <FormControl fullWidth size="small" disabled={isLoadingData}>
//                             <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
//                             <Select
//                                 labelId="print-mode-select-label"
//                                 id="print-mode-select"
//                                 value={printMode}
//                                 label="Print Sides"
//                                 onChange={handlePrintModeChange}
//                             >
//                                 <MenuItem value={'both'}>Both Sides</MenuItem>
//                                 <MenuItem value={'front'}>Front Only</MenuItem>
//                                 <MenuItem value={'back'}>Back Only</MenuItem>
//                             </Select>
//                         </FormControl>
//                         {/* Orientation Selector */}
//                         <FormControl fullWidth size="small" disabled={isLoadingData}>
//                             <InputLabel id="print-orientation-select-label">Orientation</InputLabel>
//                             <Select
//                                 labelId="print-orientation-select-label"
//                                 id="print-orientation-select"
//                                 value={printOrientation}
//                                 label="Orientation"
//                                 onChange={handleOrientationChange}
//                             >
//                                 <MenuItem value={'landscape'}>Landscape (10/page)</MenuItem>
//                                 <MenuItem value={'portrait'}>Portrait (9/page)</MenuItem>
//                                 <MenuItem value={'landscape-rotated'}>Landscape Rotated (2/page)</MenuItem>
//                             </Select>
//                         </FormControl>
//                          {/* Print Button */}
//                         <Button
//                             fullWidth
//                             variant="contained"
//                             onClick={generatePDF}
//                             style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} // Match input height
//                             disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} // Disable if nothing selected or loading
//                             startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null} // Show spinner when printing
//                         >
//                             {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
//                         </Button>
//                     </div>
//                      {/* Conditional Notes based on orientation */}
//                      {printOrientation === 'portrait' && (
//                         <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
//                            Note: Portrait mode fits a maximum of 9 cards per A4 page.
//                         </Typography>
//                     )}
//                      {printOrientation === 'landscape-rotated' && (
//                         <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
//                            Note: Rotated Landscape mode fits 2 cards per A4 page, rotated 90°. Preview does not show rotation.
//                         </Typography>
//                     )}
//                 </Box>

//                 {/* --- Selection Controls / Loading / Status Messages --- */}
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
//                     {/* Show loading indicator */}
//                     {isLoadingData && (
//                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
//                              <CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography>
//                          </Box>
//                     )}
//                     {/* Show 'Select All' only if not loading and there are selectable students */}
//                     {!isLoadingData && numFilteredStudentsWithId > 0 && (
//                         <FormControlLabel
//                             control={<Checkbox
//                                 checked={isSelectAllChecked}
//                                 indeterminate={isSelectAllIndeterminate}
//                                 onChange={handleSelectAllChange}
//                                 disabled={numFilteredStudentsWithId === 0} // Disable if no selectable students
//                             />}
//                             // Label indicates how many are currently shown and selectable
//                             label={`Select All (${numFilteredStudentsWithId} shown)`}
//                             sx={{ mr: 'auto' }} // Push other messages to the right
//                         />
//                     )}
//                     {/* Message if filters result in no students */}
//                     {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
//                             No students match the current filters.
//                          </Typography>
//                     )}
//                     {/* Message if no students were loaded at all */}
//                     {!isLoadingData && studentData.length === 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
//                             No active students found. Please check student records or session settings.
//                          </Typography>
//                     )}
//                      {/* Warning if some filtered students are missing IDs */}
//                      {!isLoadingData && filteredStudentData.length > 0 && numFilteredStudentsWithId !== filteredStudentData.length && (
//                          <Typography sx={{ textAlign: 'right', color: 'warning.main', fontSize: '0.8rem', ml: 2 }}>
//                             Note: {filteredStudentData.length - numFilteredStudentsWithId} student(s) shown cannot be selected (missing ID).
//                          </Typography>
//                     )}
//                 </Box>

//                 {/* --- On-Screen Preview Area (Hidden during printing) --- */}
//                 <Box className="screen-only">
//                      {/* Add note about preview limitations */}
//                      {!isLoadingData && filteredStudentData.length > 0 && (
//                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
//                             On-screen preview shows basic layout and selected side(s). Rotation and exact print positioning may differ. Use browser Print Preview for final check.
//                          </Typography>
//                      )}
//                     <Box
//                         sx={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             gap: '15px', // Visual spacing for the preview grid
//                             flexDirection: 'row', // Always LTR for screen preview
//                             justifyContent: 'flex-start', // Align previews to the start
//                             padding: '10px 0', // Add some padding around the preview area
//                         }}
//                     >
//                         {!isLoadingData && filteredStudentData.length > 0 && (
//                             filteredStudentData.map((student) => {
//                                 // --- Preview for Students MISSING ID ---
//                                 if (!student || !student._id) {
//                                     return (
//                                         <Box key={student?.admissionNumber || Math.random()} sx={{ // Use admission number or random key
//                                              border: '1px dashed #ccc', borderRadius: '4px', padding: '5px',
//                                              backgroundColor: '#f5f5f5', display: 'inline-flex', flexDirection: 'column',
//                                              alignItems: 'center', // Ensure minimum width
//                                              opacity: 0.6, // Dim appearance
//                                              boxSizing: 'border-box',
//                                              height: 'fit-content', // Adjust height based on content
//                                         }}>
//                                             <Typography variant="caption" color="error" sx={{mb: 0.5, fontWeight: 'bold'}}>Missing ID</Typography>
//                                             <Typography variant="caption" sx={{fontSize: '0.7rem'}}>{student?.studentName || 'Unknown Name'}</Typography>
//                                             <Typography variant="caption" sx={{fontSize: '0.7rem'}}>({student?.admissionNumber || 'No Adm No'})</Typography>
//                                              {/* Placeholder card visual */}
//                                             <Box sx={{  border: '1px solid #eee', mt: 1, display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'white' }}>
//                                                 <Typography variant="caption" color="textSecondary" sx={{fontSize: '0.7rem'}}>Cannot Select/Print</Typography>
//                                             </Box>
//                                         </Box>
//                                     );
//                                 }

//                                 // --- Preview for Selectable Students ---
//                                 const studentKey = student._id;
//                                 const isSelected = selectedStudentIds.has(studentKey);

//                                 return (
//                                     <Box key={studentKey} sx={{
//                                         border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd', // Highlight if selected
//                                         borderRadius: '4px', padding: '5px',
//                                         backgroundColor: isSelected ? '#e6f7ff' : '#fff', // Background change if selected
//                                         display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                                        
//                                         pageBreakInside: 'avoid', // Hint for screen rendering
//                                         boxSizing: 'border-box',
//                                         transition: 'border-color 0.2s ease, background-color 0.2s ease', // Smooth selection feedback
//                                         height: 'fit-content',
//                                     }}>
//                                         {/* Checkbox and Name/Adm No */}
//                                         <FormControlLabel
//                                             control={ <Checkbox
//                                                 size="small"
//                                                 checked={isSelected}
//                                                 onChange={(e) => handleSelectSingleChange(e, studentKey)}
//                                             /> }
//                                             // Display name and admission number clearly
//                                             label={
//                                                 <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'  }}>
//                                                     {student.studentName || 'N/A'} ({student.admissionNumber || 'N/A'})
//                                                 </Typography>
//                                              }
//                                             sx={{ width: '100%', alignSelf: 'flex-start', mb: 0.5, mr: 0 }} // Ensure label takes full width
//                                         />

//                                         {/* Preview Card(s) - Render based on printMode */}
//                                         {/* Apply a dashed border for visual separation in preview */}
//                                         {(printMode === 'front' || printMode === 'both') && (
//                                             <div
//                                                 className="id-card-preview-front" // Use a different class if needed for preview-specific styles
//                                                 style={{ border: '1px dashed #ccc',   overflow: 'hidden', marginBottom: printMode === 'both' ? '5px' : '0' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
//                                         )}
//                                         {(printMode === 'back' || printMode === 'both') && (
//                                             <div
//                                                 className="id-card-preview-back"
//                                                 style={{ border: '1px dashed #aaa',   overflow: 'hidden' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
//                                         )}
//                                     </Box>
//                                 );
//                             })
//                         )}
//                     </Box>
//                 </Box>
//             </Box>
//         </>
//     );
// };

// export default IdCard;





// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import {
//     Button, Grid, TextField, Typography, Box, CircularProgress,
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// // --- Constants ---
// const CARD_WIDTH_MM = 54;
// const CARD_HEIGHT_MM = 86;
// const ITEMS_PER_PRINT_PAGE = 10; // Max items (single cards or pairs) per printed page

// const IdCard = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null); // Holds fetched template design
//     const [studentData, setStudentData] = useState([]); // All active students
//     const [classData, setClassData] = useState([]); // All classes for filtering
//     const [filteredStudentData, setFilteredStudentData] = useState([]); // Students matching filters
//     const [filterName, setFilterName] = useState(""); // Name/Adm No filter input
//     const [selectedClass, setSelectedClass] = useState(""); // Selected class filter
//     const [selectedSection, setSelectedSection] = useState(""); // Selected section filter
//     const [isLoadingData, setIsLoadingData] = useState(true); // Loading state for initial data fetch
//     const [printMode, setPrintMode] = useState('both'); // 'front', 'back', or 'both'
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set()); // IDs of students checked for printing

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []); // Get session data once
//     const { currentColor, setIsLoader, isLoader } = useStateContext(); // Context for theme color and print loading state
//     const componentRef = useRef(); // Optional ref for the entire component (Can be removed if only printing specific content)
//     const printContentRef = useRef(); // Ref specifically for the generated print content

//     // --- Default Templates (Fallbacks if API fails or no template exists) ---
//     const [defaultFrontTemplate] = useState(`
//     <div style='background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'><h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3><p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p></div>
//           <div style='margin: 0 auto; margin-top: 5px; width: 30mm; height: 35mm; border: 1px solid #aaa; border-radius: 4px; overflow: hidden; background-color: #eee; display: flex; justify-content: center; align-items: center;'><img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/></div>
//           <div style='margin-top: 8mm; padding-left: 2mm; padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>CLASS<span style="float: right;">: \${class}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>DOB<span style="float: right;">: \${dob}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>Roll<span style="float: right;">: \${rollNo}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>PHONE<span style="float: right;">: \${mobile}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span></p>
//           </div>
//       </div>
//     </div>
//     `);
//     const [defaultBackTemplate] = useState(`
//     <div style='background-color: #e0e0e0; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>
//       <div style='position: relative; z-index: 2;'>
//         <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info</h4>
//         <div style='display: flex; justify-content: space-around; text-align: center; margin-bottom: 5mm;'>
//             <div><img src='\${fatherImage}' alt="Father" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Father</p></div>
//             <div><img src='\${motherImage}' alt="Mother" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Mother</p></div>
//             <div><img src='\${guardianImage}' alt="Guardian" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Guardian</p></div>
//         </div>
//         <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//         <p style='font-size: 7pt; margin: 1mm 0;'>Session: \${session}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Admission No: \${admissionNumber}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Guardian Name: \${guardianname}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Parent Contact: \${parentContact}</p>
//       </div>
//       <div style='position: relative; z-index: 2; text-align: center; font-size: 6pt; color: #555;'>
//          <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//          <p style='margin: 0;'>[School Address/Contact Info Here]</p>
//          <p style='margin: 0;'>If found, please return to school office.</p>
//       </div>
//     </div>
//     `);

//     // --- Helper Functions ---
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
//             console.error("Error decoding base64 string:", error);
//             return null;
//         }
//     }, []);

//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 setIdCardData(response.designFormats[0]);
//             } else {
//                 console.warn("No custom ID card design found. Using default.");
//                 setIdCardData(null);
//             }
//         } catch (error) {
//             console.error("Error fetching ID card design:", error);
//             toast.error("Could not load custom ID card template.");
//             setIdCardData(null);
//         }
//     }, []);

//     const fetchAllClasses = useCallback(async () => {
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//                 setClassData(response.classes || []);
//             } else {
//                 toast.error(response?.message || "Failed to fetch classes.");
//                 setClassData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error("An error occurred while fetching classes.");
//             setClassData([]);
//         }
//     }, []);

//     const fetchAllStudents = useCallback(async () => {
//         if (!session) {
//             toast.error("Session information is missing.");
//             setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return;
//         }
//         setIsLoadingData(true);
//         try {
//             const response = await ActiveStudents(session);
//             if (response?.success && response.students?.data) {
//                 // Ensure students have an _id
//                 const validStudents = (response.students.data || []).filter(s => s._id);
//                 if(validStudents.length !== (response.students.data || []).length) {
//                     console.warn("Some student records were missing an '_id' and were excluded.");
//                 }
//                 setStudentData(validStudents);
//             } else {
//                 toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//                 setStudentData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching students:", error);
//             toast.error("An error occurred while fetching students.");
//             setStudentData([]);
//         } finally {
//             setIsLoadingData(false);
//         }
//     }, [session]);

//     // --- Effects ---
//     useEffect(() => {
//         Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]);
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//     useEffect(() => {
//         if (isLoadingData) return;

//         let filtered = studentData;
//         if (selectedClass) {
//             filtered = filtered.filter(s => s.class === selectedClass);
//         }
//         if (selectedSection) {
//             // Handle potential null/undefined sections consistently
//             filtered = filtered.filter(s => (s.section || '') === selectedSection);
//         }
//         if (filterName) {
//             const lowerCaseFilter = filterName.toLowerCase().trim();
//             filtered = filtered.filter(s =>
//                 s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//                 s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
//             );
//         }
//         setFilteredStudentData(filtered);
//         setSelectedStudentIds(new Set()); // Reset selection on filter change
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => {
//         setSelectedClass(e.target.value);
//         setSelectedSection("");
//     };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);

//     const handleSelectAllChange = (event) => {
//         if (event.target.checked) {
//             const allFilteredIds = new Set(filteredStudentData.map(student => student._id).filter(Boolean));
//             setSelectedStudentIds(allFilteredIds);
//         } else {
//             setSelectedStudentIds(new Set());
//         }
//     };

//     const handleSelectSingleChange = (event, studentId) => {
//         if (!studentId) return;
//         const isChecked = event.target.checked;
//         setSelectedStudentIds(prevSelectedIds => {
//             const newSelectedIds = new Set(prevSelectedIds);
//             if (isChecked) {
//                 newSelectedIds.add(studentId);
//             } else {
//                 newSelectedIds.delete(studentId);
//             }
//             return newSelectedIds;
//         });
//     };

//     // --- Template Rendering Logic ---
//     const decodedApiFrontTemplate = useMemo(() => {
//         if (!idCardData?.frontTemplate) return null;
//         return decodeBase64(idCardData.frontTemplate);
//     }, [idCardData, decodeBase64]);

//     const decodedApiBackTemplate = useMemo(() => {
//         if (!idCardData?.backTemplate) return null;
//         return decodeBase64(idCardData.backTemplate);
//     }, [idCardData, decodeBase64]);

//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         if (!template) {
//              console.error(`Template for ${cardSide} side is missing or invalid.`);
//              return `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>Missing ${cardSide} Template</div>`;
//         }
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 let value = data;

//                 // Handle nested keys like 'studentImage.url'
//                 const keys = cleanKey.split('.');
//                  for (const k of keys) {
//                      if (value && typeof value === 'object' && k in value) {
//                          value = value[k];
//                      } else {
//                          // Fallback to top-level key if nested path fails
//                          value = data.hasOwnProperty(cleanKey) ? data[cleanKey] : undefined;
//                          break;
//                      }
//                  }

//                 // Handle missing images or values gracefully
//                 if (value === undefined || value === null || value === '') {
//                     const lowerKey = cleanKey.toLowerCase();
//                     if (lowerKey.includes('image')) { // Generic image check
//                          if (lowerKey.includes('studentimage')) return "https://via.placeholder.com/85x95.png?text=No+Image";
//                          if (lowerKey.includes('fatherimage') || lowerKey.includes('motherimage') || lowerKey.includes('guardianimage')) return "https://via.placeholder.com/60x70.png?text=N/A";
//                          return ""; // Or a generic placeholder if not specific parent/student
//                     }
//                     return ''; // Return empty string for other missing non-image data
//                 }

//                 return String(value);
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             renderedHtml = `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); // Dependencies: None, it's a pure function based on its arguments

//     const renderFrontTemplate = useCallback((student) => {
//          if (!student) return replacePlaceholders(frontTemplateToUse, {}, 'Front'); // Handle null student

//          const data = {
//              // Template background (might be specific to front/back)
//              backgroundImage: idCardData?.frontImage?.url || "",
//              // Student details
//              studentImage: student.studentImage, // Pass object, placeholder logic handles missing url
//              name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//              class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '',
//              gender: student?.gender || '',
//              contact: student?.contact || '',
//              transport: student?.transport || '',
//              rollNo: student?.rollNo || '',
//              admissionNumber: student?.admissionNumber || '',
//              // Parent/Guardian Details (often needed on front)
//              father_name: student?.fatherName?.toUpperCase() || '',
//              mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '',
//              mobile: student?.contact || student?.parentContact || '', // Prioritize student, fallback to parent
//              parentContact: student?.parentContact || '',
//              // Address
//              address: student?.address || '',
//              // Session
//              session: student?.session || session?.name || '', // Use student session, fallback to current session
//              // Parent Images (might be used in some front designs)
//              fatherImage: student.fatherImage,
//              motherImage: student.motherImage,
//              guardianImage: student.guardianImage,
//          };
//          return replacePlaceholders(frontTemplateToUse, data, 'Front');
//      }, [idCardData, frontTemplateToUse, replacePlaceholders, session]); // Include session if used as fallback

//      const renderBackTemplate = useCallback((student) => {
//          if (!student) return replacePlaceholders(backTemplateToUse, {}, 'Back'); // Handle null student

//          const data = {
//               // Template background
//              backgroundImage: idCardData?.backImage?.url || "",
//              // Parent Images (common on back)
//              fatherImage: student.fatherImage,
//              motherImage: student.motherImage,
//              guardianImage: student.guardianImage,
//              // Parent/Guardian Details
//              father_name: student?.fatherName?.toUpperCase() || '',
//              mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '',
//              parentContact: student?.parentContact || '',
//              // Student Details (can also be on back)
//              studentImage: student.studentImage,
//              name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//              class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//              section: student?.section || '',
//              gender: student?.gender || '',
//              contact: student?.contact || '', // Student's direct contact
//              mobile: student?.contact || student?.parentContact || '', // General mobile number
//              transport: student?.transport || '',
//              rollNo: student?.rollNo || '',
//              admissionNumber: student?.admissionNumber || '',
//              // Address
//              address: student?.address || '',
//              // Session
//              session: student?.session || session?.name || '',
//          };
//          return replacePlaceholders(backTemplateToUse, data, 'Back');
//      }, [idCardData, backTemplateToUse, replacePlaceholders, session]); // Include session if used as fallback


//     // --- Students to Print Calculation ---
//     const studentsToPrint = useMemo(() => {
//         // Filter the currently *filtered* list to include only those whose IDs are selected
//         return filteredStudentData.filter(student => student?._id && selectedStudentIds.has(student._id));
//     }, [filteredStudentData, selectedStudentIds]);

//     // --- Printing Hook Setup ---
//     const generatePDF = useReactToPrint({
//         content: () => {
//             if (studentsToPrint.length === 0) {
//                 toast.info("No students selected for printing.");
//                 setIsLoader(false); // Ensure loader is off if nothing to print
//                 return null; // Stop the print process
//             }
//             setIsLoader(true); // Show loading indicator during generation

//             // Create the container div for print content
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area';
//             if (printMode === 'back') {
//                  printContainer.classList.add('print-rtl'); // Apply RTL class if printing back only
//             }
//             printContentRef.current = printContainer; // Assign to ref for return

//             // Iterate over only the selected students
//             studentsToPrint.forEach((student, index) => {
//                 if (!student || !student._id) {
//                     console.warn("Skipping a selected student due to missing data:", student);
//                     return; // Skip iteration if essential data is missing
//                 }
//                 const studentKey = student._id;
//                 let itemElement; // Holds the DOM element for the current student item

//                 // Create the appropriate element (single card or pair) based on printMode
//                 if (printMode === 'front') {
//                     itemElement = document.createElement('div');
//                     itemElement.className = `print-item single-card-print card-${studentKey}-front`;
//                     itemElement.innerHTML = renderFrontTemplate(student);
//                 } else if (printMode === 'back') {
//                     itemElement = document.createElement('div');
//                     itemElement.className = `print-item single-card-print card-${studentKey}-back`;
//                     itemElement.innerHTML = renderBackTemplate(student);
//                 } else { // 'both' mode
//                     itemElement = document.createElement('div');
//                     itemElement.className = `print-item id-card-pair pair-${studentKey}`; // Container for front/back

//                     const frontDiv = document.createElement('div');
//                     frontDiv.className = 'id-card id-card-front';
//                     frontDiv.innerHTML = renderFrontTemplate(student);

//                     const backDiv = document.createElement('div');
//                     backDiv.className = 'id-card id-card-back';
//                     backDiv.innerHTML = renderBackTemplate(student);

//                     itemElement.appendChild(frontDiv);
//                     itemElement.appendChild(backDiv);
//                 }

//                 // --- Page Break Logic ---
//                 // Add a page break *after* this item if it's the last one on the page
//                 // (index is 0-based, so index 9 is the 10th item)
//                 // And make sure it's not the very last item overall.
//                 if ((index + 1) % ITEMS_PER_PRINT_PAGE === 0 && index < studentsToPrint.length - 1) {
//                     itemElement.style.pageBreakAfter = 'always';
//                 } else {
//                     itemElement.style.pageBreakAfter = 'auto'; // Ensure it doesn't break if not needed
//                 }

//                 printContainer.appendChild(itemElement); // Add the student's card/pair to the print container
//             });

//             // Return the ref's current value (the populated container)
//              return printContentRef.current;
//         },
//         documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onBeforeGetContent: () => { /* Loader is set in content() */ },
//         onAfterPrint: () => {
//             setIsLoader(false);
//             if (studentsToPrint.length > 0) { // Only toast success if printing was attempted
//                 toast.success(`${studentsToPrint.length} ID Card item(s) sent to printer!`);
//             }
//             printContentRef.current = null; // Clean up ref
//         },
//         onPrintError: (error) => {
//             setIsLoader(false);
//             toast.error("Printing failed. See console for details.");
//             console.error("Printing Error:", error);
//             printContentRef.current = null; // Clean up ref
//         },
//         pageStyle: `
//           @page {
//             size: A4 landscape; /* Set page orientation */
//             margin: 10mm; /* Define page margins */
//           }
//           @media print {
//             html, body {
//               height: initial !important; /* Override potential weird height issues */
//               overflow: initial !important;
//               -webkit-print-color-adjust: exact !important; /* Force printing of background colors/images in Chrome/Safari */
//               print-color-adjust: exact !important; /* Standard property for background printing */
//             }

//             /* --- Layout Container --- */
//             .id-card-print-area {
//               display: flex !important;
//               flex-wrap: wrap !important;
//               flex-direction: row !important; /* LTR Default */
//               justify-content: flex-start !important;
//               align-items: flex-start !important;
//               align-content: flex-start !important; /* Align lines to the top */
//               width: 277mm !important; /* A4 Landscape width (297mm) - 2 * margin (10mm) */
//               /* height calculated automatically based on content and rows */
//               /* Using gap for spacing */
//               column-gap: 1.75mm !important; /* (277mm - 5 * 54mm) / 4 gaps = 1.75mm */
//               row-gap: 5mm !important; /* Vertical gap between rows */
//               box-sizing: border-box !important;
//               overflow: hidden !important; /* Prevent container overflow issues */
//             }

//             /* RTL layout override for 'Back Only' printing */
//             .id-card-print-area.print-rtl {
//               flex-direction: row-reverse !important; /* Right-to-Left */
//               /* justify-content: flex-start; is correct for RTL (starts from right) */
//             }

//             /* --- Individual Item Containers (Pair or Single Card) --- */
//             /* This is the element that gets the page-break-after style */
//             .print-item {
//               page-break-inside: avoid !important; /* CRITICAL: Prevent items splitting across pages */
//               display: block !important; /* Treat each item as a block in the flex flow */
//               width: ${CARD_WIDTH_MM}mm !important; /* Fixed width based on card */
//               margin: 0 !important; /* Use gap, not margin */
//               padding: 0 !important;
//               border: none !important;
//               box-sizing: border-box !important;
//               /* height is determined by content (single card or pair) */
//               /* page-break-after is applied dynamically via JS */
//             }

//             /* Container for front/back pair */
//             .id-card-pair {
//                 display: flex !important;
//                 flex-direction: column !important; /* Stack front/back vertically */
//                 gap: 1mm !important; /* Small gap between front and back within a pair */
//                 height: auto !important; /* Height based on two cards + gap */
//             }

//             /* Single card container has fixed height */
//             .single-card-print {
//                 height: ${CARD_HEIGHT_MM}mm !important;
//                 overflow: hidden !important; /* Clip content within the single card */
//             }


//             /* --- Actual Card Content Divs (Inside the items) --- */
//              .id-card {
//                 width: ${CARD_WIDTH_MM}mm !important;
//                 height: ${CARD_HEIGHT_MM}mm !important;
//                 overflow: hidden !important; /* Clip content */
//                 border: none !important; /* Remove preview borders */
//                 box-sizing: border-box !important;
//                 display: block !important;
//                 background-color: transparent !important; /* Allow template background */
//                 /* Template styles should handle internal layout */
//                 page-break-inside: avoid !important; /* Redundant but safe */
//              }

//             /* --- Hide Screen-Only Elements --- */
//             .no-print, .screen-only { display: none !important; }
//           }
//         `,
//     });


//     // --- Options for Select Components ---
//     const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);

//     const sectionOptions = useMemo(() => {
//         const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//         return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//     }, [classData, selectedClass]);

//     // --- Selection State Calculation ---
//     const numFilteredStudentsWithId = useMemo(() => filteredStudentData.filter(s => s._id).length, [filteredStudentData]);
//     const isSelectAllChecked = useMemo(() => numFilteredStudentsWithId > 0 && selectedStudentIds.size === numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);

//     // --- JSX ---
//     return (
//         <>
//             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Student ID Cards"/>

//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>

//                 {/* --- Filters and Print Button --- */}
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                     <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 items-end">
//                         <ReactSelect
//                             name="class"
//                             value={selectedClass}
//                             handleChange={handleClassChange}
//                             label="Class"
//                             dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//                             placeholder="Select Class"
//                             isDisabled={isLoadingData}
//                         />
//                         <ReactSelect
//                             name="section"
//                             value={selectedSection}
//                             handleChange={handleSectionChange}
//                             label="Section"
//                             dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//                             disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData}
//                             placeholder="Select Section"
//                         />
//                         <TextField
//                             fullWidth
//                             id="filter-name"
//                             label="Filter by Name / Adm. No."
//                             variant="outlined"
//                             onChange={handleFilterByNameChange}
//                             value={filterName}
//                             size="small"
//                             disabled={isLoadingData}
//                             sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }} // Span across cols on smaller screens if needed
//                         />
//                         <FormControl fullWidth size="small" disabled={isLoadingData}>
//                             <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
//                             <Select
//                                 labelId="print-mode-select-label"
//                                 id="print-mode-select"
//                                 value={printMode}
//                                 label="Print Sides"
//                                 onChange={handlePrintModeChange}
//                             >
//                                 <MenuItem value={'both'}>Both Sides</MenuItem>
//                                 <MenuItem value={'front'}>Front Only</MenuItem>
//                                 <MenuItem value={'back'}>Back Only</MenuItem>
//                             </Select>
//                         </FormControl>
//                         <Button
//                             fullWidth
//                             variant="contained"
//                             onClick={generatePDF}
//                             style={{ backgroundColor: currentColor, color: 'white', height: '40px' }}
//                             disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader}
//                             startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}
//                         >
//                             {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
//                         </Button>
//                     </div>
//                 </Box>

//                 {/* --- Selection Controls / Loading Indicator --- */}
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center' }}>
//                     {!isLoadingData && numFilteredStudentsWithId > 0 && (
//                         <FormControlLabel
//                             control={<Checkbox
//                                 checked={isSelectAllChecked}
//                                 indeterminate={isSelectAllIndeterminate}
//                                 onChange={handleSelectAllChange}
//                             />}
//                             label={`Select All (${numFilteredStudentsWithId} shown)`}
//                             sx={{ width: '100%' }}
//                         />
//                     )}
//                     {isLoadingData && (
//                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
//                              <CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography>
//                          </Box>
//                     )}
//                     {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
//                             No students match the current filters.
//                          </Typography>
//                     )}
//                     {!isLoadingData && studentData.length === 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
//                             No active students found. Please check student records.
//                          </Typography>
//                     )}
//                      {!isLoadingData && filteredStudentData.length > 0 && numFilteredStudentsWithId !== filteredStudentData.length && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', color: 'warning.main', fontSize: '0.8rem' }}>
//                             Note: Some students shown are missing IDs and cannot be selected/printed.
//                          </Typography>
//                     )}
//                 </Box>

//                 {/* --- On-Screen Preview Area (Hidden during printing via 'screen-only') --- */}
//                 <Box className="screen-only">
//                     <Box
//                         sx={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             gap: '15px', // Visual spacing for the preview grid
//                             flexDirection: 'row', // Always LTR for screen preview
//                             justifyContent: 'flex-start',
//                         }}
//                     >
//                         {!isLoadingData && filteredStudentData.length > 0 && (
//                             filteredStudentData.map((student) => {
//                                 if (!student || !student._id) {
//                                     // Optionally show a disabled preview for students without IDs
//                                     return (
//                                         <Box key={student?.admissionNumber || Math.random()} sx={{ // Use admission number or random key
//                                              border: '1px dashed #ccc', borderRadius: '4px', padding: '5px',
//                                              backgroundColor: '#f5f5f5', display: 'inline-flex', flexDirection: 'column',
//                                              alignItems: 'center', minWidth: `calc(${CARD_WIDTH_MM}mm + 10px)`, opacity: 0.6
//                                         }}>
//                                             <Typography variant="caption" color="error" sx={{mb: 0.5}}>Missing ID</Typography>
//                                             <Typography variant="caption">{student?.studentName || 'Unknown'}</Typography>
//                                             <Typography variant="caption">({student?.admissionNumber || 'No Adm No'})</Typography>
//                                              {/* Placeholder card visual */}
//                                             <Box sx={{ width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, border: '1px solid #eee', mt: 1, display:'flex', alignItems:'center', justifyContent:'center', bgcolor:'white' }}>
//                                                 <Typography variant="caption" color="textSecondary">Preview N/A</Typography>
//                                             </Box>
//                                         </Box>
//                                     );
//                                 }
//                                 const studentKey = student._id;
//                                 const isSelected = selectedStudentIds.has(studentKey);

//                                 return (
//                                     <Box key={studentKey} sx={{
//                                         border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd',
//                                         borderRadius: '4px', padding: '5px',
//                                         backgroundColor: isSelected ? '#e6f7ff' : '#fff',
//                                         display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
//                                         minWidth: `calc(${CARD_WIDTH_MM}mm + 10px)`,
//                                         pageBreakInside: 'avoid', // Hint for screen
//                                     }}>
//                                         <FormControlLabel
//                                             control={ <Checkbox
//                                                 size="small"
//                                                 checked={isSelected}
//                                                 onChange={(e) => handleSelectSingleChange(e, studentKey)}
//                                             /> }
//                                             label={`${student.studentName || 'N/A'} (${student.admissionNumber || 'N/A'})`}
//                                             sx={{ width: '100%', alignSelf: 'flex-start', mb: 0.5, fontSize: '0.8rem', mr: 0 }}
//                                         />

//                                         {/* Preview Card(s) */}
//                                         {(printMode === 'front' || printMode === 'both') && (
//                                             <div
//                                                 className="id-card"
//                                                 style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden', marginBottom: printMode === 'both' ? '5px' : '0' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
//                                         )}
//                                         {(printMode === 'back' || printMode === 'both') && (
//                                             <div
//                                                 className="id-card"
//                                                 style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
//                                         )}
//                                     </Box>
//                                 );
//                             })
//                         )}
//                     </Box>
//                 </Box>
//             </Box>
//         </>
//     );
// };

// export default IdCard;






import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
import { useReactToPrint } from "react-to-print";
import {
    Button, Grid, TextField, Typography, Box, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
} from "@mui/material";
import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
import { toast } from "react-toastify";
import moment from "moment";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// --- Constants ---
const CARD_WIDTH_MM = 54;
const CARD_HEIGHT_MM = 86;
const ITEMS_PER_PRINT_PAGE = 10; // Max items (single cards or pairs) per printed page

// Helper to chunk array for paged preview
const chunkArray = (array, size) => {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
};

const IdCard = () => {
    // --- State Variables ---
    const [idCardData, setIdCardData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [classData, setClassData] = useState([]);
    const [filteredStudentData, setFilteredStudentData] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [printMode, setPrintMode] = useState('both');
    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

    // --- Context and Refs ---
    const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
    const { currentColor, setIsLoader, isLoader } = useStateContext();
    const componentRef = useRef(); // Optional ref for the entire component

    // --- Default Templates ---
    const [defaultFrontTemplate] = useState(`
    <div style='background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
      <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
      <div style='position: relative; z-index: 2; padding: 5px;'>
          <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'><h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3><p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p></div>
          <div style='margin: 0 auto; margin-top: 5px; width: 30mm; height: 35mm; border: 1px solid #aaa; border-radius: 4px; overflow: hidden; background-color: #eee; display: flex; justify-content: center; align-items: center;'><img src='\${studentImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/></div>
          <div style='margin-top: 8mm; padding-left: 2mm; padding-right: 2mm;'>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>CLASS<span style="float: right;">: \${class}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>DOB<span style="float: right;">: \${dob}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>Roll<span style="float: right;">: \${rollNo}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>PHONE<span style="float: right;">: \${mobile}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span></p>
          </div>
      </div>
    </div>
    `);
    const [defaultBackTemplate] = useState(`
    <div style='background-color: #e0e0e0; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
      <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>
      <div style='position: relative; z-index: 2;'>
        <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info</h4>
        <div style='display: flex; justify-content: space-around; text-align: center; margin-bottom: 5mm;'>
            <div><img src='\${fatherImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}'style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Father</p></div>
            <div><img src='\${motherImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}'  style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Mother</p></div>
            <div><img src='\${guardianImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}' style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Guardian</p></div>
        </div>
        <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
        <p style='font-size: 7pt; margin: 1mm 0;'>Session: \${session}</p>
        <p style='font-size: 7pt; margin: 1mm 0;'>Admission No: \${admissionNumber}</p>
        <p style='font-size: 7pt; margin: 1mm 0;'>Guardian Name: \${guardianname}</p>
        <p style='font-size: 7pt; margin: 1mm 0;'>Parent Contact: \${parentContact}</p>
      </div>
      <div style='position: relative; z-index: 2; text-align: center; font-size: 6pt; color: #555;'>
         <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
         <p style='margin: 0;'>[School Address/Contact Info Here]</p>
         <p style='margin: 0;'>If found, please return to school office.</p>
      </div>
    </div>
    `);

    const decodeBase64 = useCallback((encoded) => {
        try {
            if (!encoded || typeof encoded !== 'string') { return null; }
            let cleanEncoded = encoded;
            if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
                cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
            }
            cleanEncoded = cleanEncoded.replace(/\\"/g, '"');

            const binaryString = window.atob(cleanEncoded);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch (error) {
            console.error("Error decoding base64 string:", error, "Input:", encoded);
            return null;
        }
    }, []);

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
            setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return;
        }
        setIsLoadingData(true);
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
            setIsLoadingData(false);
        }
    }, [session]);

    useEffect(() => {
        Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]);
    }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

    useEffect(() => {
        if (isLoadingData) return;

        let filtered = studentData;
        if (selectedClass) {
            filtered = filtered.filter(s => s.class === selectedClass);
        }
        if (selectedSection) {
            filtered = filtered.filter(s => (s.section || null) === selectedSection);
        }
        if (filterName) {
            const lowerCaseFilter = filterName.toLowerCase().trim();
            filtered = filtered.filter(s =>
                s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
                s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
            );
        }
        setFilteredStudentData(filtered);
        setSelectedStudentIds(new Set());
    }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

    const handleFilterByNameChange = (e) => setFilterName(e.target.value);
    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
        setSelectedSection("");
    };
    const handleSectionChange = (e) => setSelectedSection(e.target.value);
    const handlePrintModeChange = (e) => setPrintMode(e.target.value);

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            const allFilteredIds = new Set(filteredStudentData.map(student => student._id).filter(Boolean));
            setSelectedStudentIds(allFilteredIds);
        } else {
            setSelectedStudentIds(new Set());
        }
    };

    const handleSelectSingleChange = (event, studentId) => {
        if (!studentId) return;
        const isChecked = event.target.checked;
        setSelectedStudentIds(prevSelectedIds => {
            const newSelectedIds = new Set(prevSelectedIds);
            if (isChecked) {
                newSelectedIds.add(studentId);
            } else {
                newSelectedIds.delete(studentId);
            }
            return newSelectedIds;
        });
    };

    const decodedApiFrontTemplate = useMemo(() => {
        if (!idCardData?.frontTemplate) return null;
        return decodeBase64(idCardData.frontTemplate);
    }, [idCardData, decodeBase64]);

    const decodedApiBackTemplate = useMemo(() => {
        if (!idCardData?.backTemplate) return null;
        return decodeBase64(idCardData.backTemplate);
    }, [idCardData, decodeBase64]);

    const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
    const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;
    
    const replacePlaceholders = useCallback((template, data, cardSide) => {
        if (!template) {
             console.error(`Template for ${cardSide} side is missing or invalid.`);
             return `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>Missing Template</div>`;
        }
        let renderedHtml = template;
        try {
            renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
                const cleanKey = key.trim();
                const keys = cleanKey.split('.');
                let value = data;
                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) {
                        value = value[k];
                    } else {
                        value = data.hasOwnProperty(cleanKey) ? data[cleanKey] : undefined;
                        break;
                    }
                }
                if (value === undefined || value === null || value === '') {
                    const lowerKey = cleanKey.toLowerCase();
                    if (lowerKey.includes('studentimage')) return "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg";
                    if (lowerKey.includes('fatherimage') || lowerKey.includes('motherimage') || lowerKey.includes('guardianimage')) return "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg";
                }
                return String(value ?? '');
            });
        } catch (error) {
            console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
            renderedHtml = `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
        }
        return renderedHtml;
    }, []); 

    const getStudentTemplateData = useCallback((student) => {
        return {
            backgroundImageFront: idCardData?.frontImage?.url || "",
            backgroundImageBack: idCardData?.backImage?.url || "",
            studentImage: student?.studentImage?.url,
            name: student?.studentName?.toUpperCase() || '',
            dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
            class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
            section: student?.section || '',
            gender: student?.gender || '',
            contact: student?.contact || '',
            transport: student?.transport || '',
            father_name: student?.fatherName?.toUpperCase() || '',
            mother_name: student?.motherName?.toUpperCase() || '',
            mobile: student?.contact || student?.parentContact || '',
            address: student?.address || '',
            session: student?.sessionName || session?.name || '', // Prefer student's specific session name if available
            admissionNumber: student?.admissionNumber || '',
            fatherImage: student?.fatherImage?.url,
            motherImage: student?.motherImage?.url,
            guardianImage: student?.guardianImage?.url,
            guardianname: student?.guardianName || '',
            parentContact: student?.parentContact || '',
            rollNo: student?.rollNo || '',
        };
    }, [idCardData, session]);


    const renderFrontTemplate = useCallback((student) => {
        const data = getStudentTemplateData(student);
        data.backgroundImage = data.backgroundImageFront; // Specific for front
        return replacePlaceholders(frontTemplateToUse, data, 'Front');
    }, [getStudentTemplateData, frontTemplateToUse, replacePlaceholders]);

    const renderBackTemplate = useCallback((student) => {
        const data = getStudentTemplateData(student);
        data.backgroundImage = data.backgroundImageBack; // Specific for back
        return replacePlaceholders(backTemplateToUse, data, 'Back');
    }, [getStudentTemplateData, backTemplateToUse, replacePlaceholders]);


    const studentsToPrint = useMemo(() => {
        return filteredStudentData.filter(student => student?._id && selectedStudentIds.has(student._id));
    }, [filteredStudentData, selectedStudentIds]);

    const generatePDF = useReactToPrint({
        content: () => {
            setIsLoader(true);
            const printContainer = document.createElement('div');
            printContainer.className = 'id-card-print-area';

            if (printMode === 'back') {
                printContainer.classList.add('print-rtl');
            }

            studentsToPrint.forEach((student, index) => {
                const studentKey = student._id;
                let itemElement;

                if (printMode === 'front') {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = `id-card single-card-print card-${studentKey}-front`;
                    cardDiv.innerHTML = renderFrontTemplate(student);
                    itemElement = cardDiv;
                } else if (printMode === 'back') {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = `id-card single-card-print card-${studentKey}-back`;
                    cardDiv.innerHTML = renderBackTemplate(student);
                    itemElement = cardDiv;
                } else { // 'both' mode
                    const pairDiv = document.createElement('div');
                    pairDiv.className = `id-card-pair pair-${studentKey}`;

                    const frontDiv = document.createElement('div');
                    frontDiv.className = 'id-card id-card-front';
                    frontDiv.innerHTML = renderFrontTemplate(student);

                    const backDiv = document.createElement('div');
                    backDiv.className = 'id-card id-card-back';
                    backDiv.innerHTML = renderBackTemplate(student);

                    pairDiv.appendChild(frontDiv);
                    pairDiv.appendChild(backDiv);
                    itemElement = pairDiv;
                }
                // Apply page break *before* the item if it's the start of a new page (after the first page)
                if (index > 0 && index % ITEMS_PER_PRINT_PAGE === 0) {
                    const pageBreakDiv = document.createElement('div');
                    pageBreakDiv.style.pageBreakBefore = 'always';
                    printContainer.appendChild(pageBreakDiv);
                }
                printContainer.appendChild(itemElement);
            });

            if (studentsToPrint.length === 0) {
                 const messageDiv = document.createElement('div');
                 messageDiv.innerText = "No students selected for printing.";
                 messageDiv.style.width = '100%';
                 messageDiv.style.textAlign = 'center';
                 messageDiv.style.marginTop = '20px';
                 messageDiv.style.pageBreakInside = 'avoid';
                 printContainer.appendChild(messageDiv);
             }
            return printContainer;
        },
        documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
        onBeforeGetContent: () => Promise.resolve(),
        onAfterPrint: () => {
            setIsLoader(false);
            if (studentsToPrint.length > 0) {
                toast.success(`${studentsToPrint.length} ID Card(s) prepared!`);
            }
        },
        pageStyle: `
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .id-card-print-area {
              display: flex !important;
              flex-wrap: wrap !important;
              flex-direction: row !important;
              justify-content: flex-start !important;
              align-items: flex-start !important;
              width: 287mm !important; /* A4 landscape (297mm) - 2*5mm margin */
              column-gap: 1.75mm !important; /* (287 - 5*54) / 4 gaps = 4.25mm. Let's try to fit 5x2, so (287-(5*54))/4 = (287-270)/4 = 17/4 = 4.25mm */
                                            /* Original had 1.75mm with 277mm width. (277 - 5*54)/4 = 7/4 = 1.75mm. Let's stick to 277mm for consistency */
              width: 277mm !important; /* Adjusted for 1.75mm gap */
              row-gap: 5mm !important;
              box-sizing: border-box !important;
            }
            .id-card-print-area.print-rtl {
              flex-direction: row-reverse !important;
            }
            .id-card-pair, .single-card-print {
                page-break-inside: avoid !important;
                display: block !important;
                width: ${CARD_WIDTH_MM}mm !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-sizing: border-box !important;
            }
            .id-card-pair { height: auto !important; }
            .single-card-print { height: ${CARD_HEIGHT_MM}mm !important; overflow: hidden !important; }
            .id-card-pair .id-card-front { margin-bottom: 1mm !important; }
             .id-card {
                width: ${CARD_WIDTH_MM}mm !important;
                height: ${CARD_HEIGHT_MM}mm !important;
                overflow: hidden !important;
                border: none !important;
                box-sizing: border-box !important;
                display: block !important;
                background-color: transparent !important;
             }
            .no-print, .screen-only { display: none !important; }
          }
        `,
    });

    const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
    const sectionOptions = useMemo(() => {
        const selectedClassObj = classData.find(cls => cls.className === selectedClass);
        return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
    }, [classData, selectedClass]);

    const isSelectAllChecked = useMemo(() => filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
    const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
    
    // Chunk filtered students for A4 preview display
    const pagedFilteredStudents = useMemo(() => {
        return chunkArray(filteredStudentData, ITEMS_PER_PRINT_PAGE);
    }, [filteredStudentData]);


    return (
        <>
         <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID Cards"/>
            <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
                <div
                    className="no-print bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row gap-2 items-center mb-3"
                >
                    <Box sx={{ flex: '1 1 150px', minWidth: '150px'}}>
                        <ReactSelect
                            name="class"
                            value={selectedClass}
                            handleChange={handleClassChange}
                            label="Class"
                            dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
                            placeholder="Select Class"
                            isDisabled={isLoadingData}
                        />
                    </Box>
                    <Box sx={{ flex: '1 1 150px', minWidth: '150px'}}>
                        <ReactSelect
                            name="section"
                            value={selectedSection}
                            handleChange={handleSectionChange}
                            label="Section"
                            dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
                            disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData}
                            placeholder="Select Section"
                        />
                    </Box>
                    <Box sx={{ flex: '1 1 200px', minWidth: '200px'}}>
                        <TextField
                            fullWidth
                            id="filter-name"
                            label="Filter by Name / Adm. No."
                            variant="outlined"
                            onChange={handleFilterByNameChange}
                            value={filterName}
                            size="small"
                            disabled={isLoadingData}
                        />
                    </Box>
                    <Box sx={{ flex: '1 1 150px', minWidth: '150px'}}>
                        <FormControl fullWidth size="small" disabled={isLoadingData}>
                            <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
                            <Select
                                labelId="print-mode-select-label"
                                id="print-mode-select"
                                value={printMode}
                                label="Print Sides"
                                onChange={handlePrintModeChange}
                            >
                                <MenuItem value={'both'}>Both Sides</MenuItem>
                                <MenuItem value={'front'}>Front Only</MenuItem>
                                <MenuItem value={'back'}>Back Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ flex: '0 0 auto', minWidth: '180px' }}> {/* Adjusted flex for button */}
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={generatePDF}
                            style={{ backgroundColor: currentColor, color: 'white', height: '40px' }}
                            disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader}
                            startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
                        </Button>
                    </Box>
                </div>
                       
                <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                    {!isLoadingData && filteredStudentData.length > 0 && (
                        <FormControlLabel
                            control={<Checkbox
                                checked={isSelectAllChecked}
                                indeterminate={isSelectAllIndeterminate}
                                onChange={handleSelectAllChange}
                            />}
                            label={`Select All (${filteredStudentData.length} shown)`}
                            sx={{ width: '100%' }}
                        />
                    )}
                    {isLoadingData && (
                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                             <CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography>
                         </Box>
                    )}
                    {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (
                         <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
                            No students match the current filters.
                         </Typography>
                    )}
                    {!isLoadingData && studentData.length === 0 && (
                         <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
                            No active students found. Please check student records.
                         </Typography>
                    )}
                </Box>

                {/* On-Screen A4 Preview Area (HIDDEN during printing) */}
                <div className="screen-only screen-a4-pages-container">
                    {!isLoadingData && pagedFilteredStudents.length === 0 && filteredStudentData.length > 0 && (
                         <Typography sx={{ textAlign: 'center', width: '100%', fontStyle: 'italic' }}>
                            Select students to preview in A4 layout.
                         </Typography>
                    )}
                    {!isLoadingData && filteredStudentData.length === 0 && !isLoadingData && (
                         <Typography sx={{ textAlign: 'center', width: '100%' }}>
                             {/* Message handled by "No students match" or "No active students" above */}
                         </Typography>
                    )}

                    {pagedFilteredStudents.map((pageStudents, pageIndex) => (
                        <div key={`page-${pageIndex}`} className="screen-a4-page">
                            <div className={`screen-id-card-layout-area ${printMode === 'back' ? 'preview-rtl' : ''}`}>
                                {pageStudents.map((student) => {
                                    if (!student || !student._id) {
                                        console.warn("Skipping student preview due to missing ID:", student);
                                        return null;
                                    }
                                    const studentKey = student._id;
                                    const isSelected = selectedStudentIds.has(studentKey);

                                    return (
                                        <Box 
                                            key={studentKey} 
                                            className="student-preview-wrapper-in-a4" // Use class for A4 layout
                                            sx={{
                                                border: isSelected ? `2px solid ${currentColor}` : `1px solid transparent`, // Transparent border to maintain layout
                                                backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                                                // Other styles moved to CSS class
                                            }}
                                        >
                                            <FormControlLabel
                                                control={ <Checkbox
                                                    size="small"
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelectSingleChange(e, studentKey)}
                                                /> }
                                                label={`${student.studentName || 'Unknown'}`}
                                                sx={{ width: '100%', alignSelf: 'flex-start', mb: 0.5, fontSize: '0.75rem', mr:0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                            />

                                            {printMode === 'front' && (
                                                <div
                                                    className="id-card"
                                                    style={{ border: '1px dashed #ccc' }} // Preview border
                                                    dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
                                            )}
                                            {printMode === 'back' && (
                                                <div
                                                    className="id-card"
                                                    style={{ border: '1px dashed #aaa' }} // Preview border
                                                    dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
                                            )}
                                            {printMode === 'both' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
                                                    <div
                                                        className="id-card id-card-front"
                                                        style={{ border: '1px dashed #ccc' }} // Preview border
                                                        dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
                                                    <div
                                                        className="id-card id-card-back"
                                                        style={{ border: '1px dashed #aaa' }} // Preview border
                                                        dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
                                                </div>
                                            )}
                                        </Box>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </Box>
            <style jsx global>{`
                .screen-a4-pages-container {
                    margin-top: 20px;
                    border: 1px solid #e0e0e0;
                    padding: 15px;
                    background-color: #f0f0f0; /* Light grey background for the container of pages */
                }
                .screen-a4-page {
                    background-color: white; /* White paper */
                    border: 1px solid #bdbdbd; /* Border for the page itself */
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    margin: 0 auto 20px auto; /* Center pages and add space below */
                    padding: 5mm; /* Mimic print page margin */
                    box-sizing: border-box;
                    
                    /* A4 Landscape dimensions (297mm x 210mm) */
                    /* To make it responsive and not excessively large: */
                    max-width: 297mm; 
                    width: 100%; /* Take available width up to max-width */
                    aspect-ratio: 297 / 210; /* Maintain A4 landscape aspect ratio */
                    overflow: hidden; /* Important to contain floating elements or oversized content */
                    /* Optional: Scale down if it's still too large for comfortable viewing */
                    /* transform: scale(0.8); transform-origin: top center; margin-bottom: calc(20px * 0.8); */
                }
                .screen-id-card-layout-area {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    flex-direction: row !important;
                    justify-content: flex-start !important;
                    align-content: flex-start !important; /* Use align-content for multiple lines */
                    align-items: flex-start !important; /* Align items on the cross axis */
                    width: 100% !important; /* Fill the padded area of screen-a4-page */
                    height: 100% !important; /* Fill the padded area */
                    column-gap: 1.75mm !important; /* Same as print */
                    row-gap: 5mm !important;       /* Same as print */
                    box-sizing: border-box !important;
                    overflow: hidden; /* Hide any overflow from cards if they are slightly off */
                }
                .screen-id-card-layout-area.preview-rtl {
                    flex-direction: row-reverse !important;
                }

                .student-preview-wrapper-in-a4 {
                    width: ${CARD_WIDTH_MM}mm; /* Fixed width for grid item */
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center; /* Center card(s) below checkbox */
                    /* height will be auto based on content (checkbox + 1 or 2 cards) */
                    /* Ensure it doesn't add extra space that breaks the grid */
                    padding: 2px; /* Minimal padding for selection highlight */
                }

                .student-preview-wrapper-in-a4 .id-card {
                    /* Styles for the card divs *within* the A4 preview item */
                    width: ${CARD_WIDTH_MM}mm !important;
                    height: ${CARD_HEIGHT_MM}mm !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                    background-color: #fff; /* Ensure card background is visible */
                }
                .student-preview-wrapper-in-a4 .id-card-front { margin-bottom: 1mm; }
            `}</style>
        </>
    );
};

export default IdCard;



// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import {
//     Button, Grid, TextField, Typography, Box, CircularProgress,
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// // --- Constants ---
// const CARD_WIDTH_MM = 54;
// const CARD_HEIGHT_MM = 86;
// const ITEMS_PER_PRINT_PAGE = 10; // Max items (single cards or pairs) per printed page

// const IdCard = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null); // Holds fetched template design
//     console.log("idCardData",idCardData)
//     const [studentData, setStudentData] = useState([]); // All active students
//     const [classData, setClassData] = useState([]); // All classes for filtering
//     const [filteredStudentData, setFilteredStudentData] = useState([]); // Students matching filters
//     const [filterName, setFilterName] = useState(""); // Name/Adm No filter input
//     const [selectedClass, setSelectedClass] = useState(""); // Selected class filter
//     const [selectedSection, setSelectedSection] = useState(""); // Selected section filter
//     const [isLoadingData, setIsLoadingData] = useState(true); // Loading state for initial data fetch
//     const [printMode, setPrintMode] = useState('both'); // 'front', 'back', or 'both'
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set()); // IDs of students checked for printing

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []); // Get session data once
//     const { currentColor, setIsLoader, isLoader } = useStateContext(); // Context for theme color and print loading state
//     const componentRef = useRef(); // Optional ref for the entire component

//     // --- Default Templates (Fallbacks if API fails or no template exists) ---
//     const [defaultFrontTemplate] = useState(`
//     <div style='background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'><h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3><p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p></div>
//           <div style='margin: 0 auto; margin-top: 5px; width: 30mm; height: 35mm; border: 1px solid #aaa; border-radius: 4px; overflow: hidden; background-color: #eee; display: flex; justify-content: center; align-items: center;'><img src='\${studentImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/></div>
//           <div style='margin-top: 8mm; padding-left: 2mm; padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>CLASS<span style="float: right;">: \${class}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>DOB<span style="float: right;">: \${dob}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>Roll<span style="float: right;">: \${rollNo}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>PHONE<span style="float: right;">: \${mobile}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span></p>
//           </div>
//       </div>
//     </div>
//     `);
//     const [defaultBackTemplate] = useState(`
//     <div style='background-color: #e0e0e0; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>
//       <div style='position: relative; z-index: 2;'>
//         <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info</h4>
//         <div style='display: flex; justify-content: space-around; text-align: center; margin-bottom: 5mm;'>
//             <div><img src='\${fatherImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}'style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Father</p></div>
//             <div><img src='\${motherImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}'  style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Mother</p></div>
//             <div><img src='\${guardianImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}' style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Guardian</p></div>
//         </div>
//         <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//         <p style='font-size: 7pt; margin: 1mm 0;'>Session: \${session}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Admission No: \${admissionNumber}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Guardian Name: \${guardianname}</p>
//         <p style='font-size: 7pt; margin: 1mm 0;'>Parent Contact: \${parentContact}</p>
//       </div>
//       <div style='position: relative; z-index: 2; text-align: center; font-size: 6pt; color: #555;'>
//          <hr style='border: none; border-top: 0.5px solid #ccc; margin: 3mm 0;' />
//          <p style='margin: 0;'>[School Address/Contact Info Here]</p>
//          <p style='margin: 0;'>If found, please return to school office.</p>
//       </div>
//     </div>
//     `);

//     // --- Helper Functions ---
//     const decodeBase64 = useCallback((encoded) => {
//         try {
//             if (!encoded || typeof encoded !== 'string') { return null; }
//             let cleanEncoded = encoded;
//             // Attempt to fix potential double encoding or extra quotes
//             if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
//                 cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
//             }
//             cleanEncoded = cleanEncoded.replace(/\\"/g, '"'); // Handle escaped quotes

//             const binaryString = window.atob(cleanEncoded);
//             const bytes = new Uint8Array(binaryString.length);
//             for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//             const decoder = new TextDecoder('utf-8');
//             return decoder.decode(bytes);
//         } catch (error) {
//             console.error("Error decoding base64 string:", error);
//             return null; // Return null indicating failure
//         }
//     }, []);

//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 setIdCardData(response.designFormats[0]);
//             } else {
//                 console.warn("No custom ID card design found. Using default.");
//                 setIdCardData(null); // Use null to signify using default
//             }
//         } catch (error) {
//             console.error("Error fetching ID card design:", error);
//             toast.error("Could not load custom ID card template.");
//             setIdCardData(null);
//         }
//     }, []);

//     const fetchAllClasses = useCallback(async () => {
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//                 setClassData(response.classes || []);
//             } else {
//                 toast.error(response?.message || "Failed to fetch classes.");
//                 setClassData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error("An error occurred while fetching classes.");
//             setClassData([]);
//         }
//     }, []);

//     const fetchAllStudents = useCallback(async () => {
//         if (!session) {
//             toast.error("Session information is missing.");
//             setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return;
//         }
//         setIsLoadingData(true);
//         try {
//             const response = await ActiveStudents(session);
//             if (response?.success && response.students?.data) {
//                 setStudentData(response.students.data || []);
//             } else {
//                 toast.error(response?.message || "Failed to fetch students or data format incorrect.");
//                 setStudentData([]);
//             }
//         } catch (error) {
//             console.error("Error fetching students:", error);
//             toast.error("An error occurred while fetching students.");
//             setStudentData([]);
//         } finally {
//             setIsLoadingData(false);
//         }
//     }, [session]); // Dependency: session

//     // --- Effects ---
//     // Initial data fetch on component mount
//     useEffect(() => {
//         Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]);
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//     // Apply filters whenever filter criteria or base student data changes
//     useEffect(() => {
//         if (isLoadingData) return; // Wait for initial load

//         let filtered = studentData;
//         if (selectedClass) {
//             filtered = filtered.filter(s => s.class === selectedClass);
//         }
//         if (selectedSection) {
//             filtered = filtered.filter(s => (s.section || null) === selectedSection);
//         }
//         if (filterName) {
//             const lowerCaseFilter = filterName.toLowerCase().trim();
//             filtered = filtered.filter(s =>
//                 s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//                 s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
//             );
//         }
//         setFilteredStudentData(filtered);
//         // Reset selections when filters change to avoid confusion
//         setSelectedStudentIds(new Set());
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => {
//         setSelectedClass(e.target.value);
//         setSelectedSection(""); // Reset section when class changes
//     };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);

//     const handleSelectAllChange = (event) => {
//         if (event.target.checked) {
//             // Select only students currently visible in the filtered list who have an ID
//             const allFilteredIds = new Set(filteredStudentData.map(student => student._id).filter(Boolean));
//             setSelectedStudentIds(allFilteredIds);
//         } else {
//             setSelectedStudentIds(new Set());
//         }
//     };

//     const handleSelectSingleChange = (event, studentId) => {
//         if (!studentId) return; // Ignore if ID is missing
//         const isChecked = event.target.checked;
//         setSelectedStudentIds(prevSelectedIds => {
//             const newSelectedIds = new Set(prevSelectedIds); // Clone the set
//             if (isChecked) {
//                 newSelectedIds.add(studentId);
//             } else {
//                 newSelectedIds.delete(studentId);
//             }
//             return newSelectedIds;
//         });
//     };

//     // --- Template Rendering Logic ---
//     // Memoize decoded templates to avoid decoding on every render
//     const decodedApiFrontTemplate = useMemo(() => {
//         if (!idCardData?.frontTemplate) return null;
//         return decodeBase64(idCardData.frontTemplate);
//     }, [idCardData, decodeBase64]);

//     const decodedApiBackTemplate = useMemo(() => {
//         if (!idCardData?.backTemplate) return null;
//         return decodeBase64(idCardData.backTemplate);
//     }, [idCardData, decodeBase64]);

//     // Determine which template to use (API or default)
//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     // Function to replace placeholders in a template string
//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         if (!template) {
//              console.error(`Template for ${cardSide} side is missing or invalid.`);
//              return `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>Missing Template</div>`;
//         }
//         let renderedHtml = template;
//         try {
//             // Regex to find placeholders like ${key}, ${ key }, ${key.nested}, etc.
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 const keys = cleanKey.split('.');
//                 let value = data;

//                 // Traverse nested keys if needed (e.g., studentImage.url)
//                 for (const k of keys) {
//                     if (value && typeof value === 'object' && k in value) {
//                         value = value[k];
//                     } else {
//                         // If path breaks, check top-level key as a fallback
//                         value = data.hasOwnProperty(cleanKey) ? data[cleanKey] : undefined;
//                         break;
//                     }
//                 }

//                 // Gracefully handle missing image URLs with placeholders
//                 if (value === undefined || value === null || value === '') {
//                     const lowerKey = cleanKey.toLowerCase();
//                     if (lowerKey.includes('studentimage')) return "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg";
//                     if (lowerKey.includes('fatherimage') || lowerKey.includes('motherimage') || lowerKey.includes('guardianimage')) return "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg";
//                 }

//                 // Return the value found, or an empty string if null/undefined
//                 return String(value ?? '');
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             renderedHtml = `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); 
//     console.log("idCardData",idCardData)
//     const renderFrontTemplate = useCallback((student) => {
//     console.log("student",student)

//         const data = {
//             backgroundImage: idCardData?.frontImage?.url || "", // Use API background or empty
//             studentImage: student?.studentImage?.url, // Placeholder handled by replacePlaceholders
//             name: student?.studentName?.toUpperCase() || '',
//             dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//             class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//             section: student?.section || '',
//             gender: student?.gender || '',
//             contact: student?.contact || '',
//             transport: student?.transport || '',
//             father_name: student?.fatherName?.toUpperCase() || '',
//             mother_name: student?.motherName?.toUpperCase() || '',
//             mobile: student?.contact || student?.parentContact || '', // Prioritize student contact
//             address: student?.address || '',
//             session: student?.session || session?.name || '', // Use student session or fallback to current
//             admissionNumber: student?.admissionNumber || '',
//             fatherImage: student?.fatherImage?.url, // Placeholder handled by replacePlaceholders
//             motherImage: student?.motherImage?.url, // Placeholder handled by replacePlaceholders
//             guardianImage: student?.guardianImage?.url, // Placeholder handled by replacePlaceholders
//             session: student?.session || session?.name || '', // Use student session or fallback
//             admissionNumber: student?.admissionNumber || '',
//             guardianname: student?.guardianName || '',
//             parentContact: student?.parentContact || '', // Primary contact on back might be parent
//             address: student?.address || '', // Address might be relevant on back too
//             rollNo: student?.rollNo || '', // Address might be relevant on back too
//           };
//           return replacePlaceholders(frontTemplateToUse, data, 'Front');
//     }, [idCardData, frontTemplateToUse, replacePlaceholders, session]);

//     const renderBackTemplate = useCallback((student) => {
//         const data = {
//             backgroundImage: idCardData?.backImage?.url || "", // Use API background or empty
//             fatherImage: student?.fatherImage?.url, // Placeholder handled by replacePlaceholders
//             motherImage: student?.motherImage?.url, // Placeholder handled by replacePlaceholders
//             guardianImage: student?.guardianImage?.url, // Placeholder handled by replacePlaceholders
//             session: student?.session || session?.name || '', // Use student session or fallback
//             admissionNumber: student?.admissionNumber || '',
//             guardianname: student?.guardianName || '',
//             parentContact: student?.parentContact || '', // Primary contact on back might be parent
//             address: student?.address || '', // Address might be relevant on back too
//             studentImage: student?.studentImage?.url, // Placeholder handled by replacePlaceholders
//             name: student?.studentName?.toUpperCase() || '',
//             dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//             class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//             section: student?.section || '',
//             gender: student?.gender || '',
//             contact: student?.contact || '',
//             transport: student?.transport || '',
//             father_name: student?.fatherName?.toUpperCase() || '',
//             mother_name: student?.motherName?.toUpperCase() || '',
//             mobile: student?.contact || student?.parentContact || '', // Prioritize student contact
//             address: student?.address || '',
//             session: student?.session || session?.name || '', // Use student session or fallback to current
//             admissionNumber: student?.admissionNumber || '',
//             rollNo: student?.rollNo || '',
//           };
//           return replacePlaceholders(backTemplateToUse, data, 'Back');
//     }, [idCardData, backTemplateToUse, replacePlaceholders, session]);

//     // --- Students to Print Calculation ---
//     // Memoize the list of students to be printed based on selection
//     const studentsToPrint = useMemo(() => {
//         // Filter the currently *filtered* list to include only those whose IDs are selected
//         return filteredStudentData.filter(student => student?._id && selectedStudentIds.has(student._id));
//     }, [filteredStudentData, selectedStudentIds]);

//     // --- Printing Hook Setup ---
//     const generatePDF = useReactToPrint({
//         // Dynamically generate the content to be printed
//         content: () => {
//             setIsLoader(true); // Show loading indicator during generation
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area'; // Base class for print layout

//             // Add 'print-rtl' class if printing back side only for RTL layout
//             if (printMode === 'back') {
//                 printContainer.classList.add('print-rtl');
//             }

//             // Iterate over only the selected students
//             studentsToPrint.forEach((student, index) => {
//                 const studentKey = student._id; // Use unique ID
//                 let itemElement; // Holds the DOM element for the current student item

//                 // Create the appropriate element (single card or pair) based on printMode
//                 if (printMode === 'front') {
//                     const cardDiv = document.createElement('div');
//                     // Apply classes for styling and targeting if needed
//                     cardDiv.className = `id-card single-card-print card-${studentKey}-front`;
//                     cardDiv.innerHTML = renderFrontTemplate(student);
//                     itemElement = cardDiv;
//                 } else if (printMode === 'back') {
//                     const cardDiv = document.createElement('div');
//                     cardDiv.className = `id-card single-card-print card-${studentKey}-back`;
//                     cardDiv.innerHTML = renderBackTemplate(student);
//                     itemElement = cardDiv;
//                 } else { // 'both' mode
//                     const pairDiv = document.createElement('div');
//                     pairDiv.className = `id-card-pair pair-${studentKey}`; // Container for front/back

//                     const frontDiv = document.createElement('div');
//                     frontDiv.className = 'id-card id-card-front'; // Class for potential front-specific styles
//                     frontDiv.innerHTML = renderFrontTemplate(student);

//                     const backDiv = document.createElement('div');
//                     backDiv.className = 'id-card id-card-back'; // Class for potential back-specific styles
//                     backDiv.innerHTML = renderBackTemplate(student);

//                     pairDiv.appendChild(frontDiv);
//                     pairDiv.appendChild(backDiv);
//                     itemElement = pairDiv;
//                 }
//                 if ((index + 1) % ITEMS_PER_PRINT_PAGE === 0 && index < studentsToPrint.length - 1) {
//                     itemElement.style.pageBreakAfter = 'always';
//                 }
//                 printContainer.appendChild(itemElement); // Add the student's card/pair to the print container
//             });

//             // Handle case where no students were selected for printing
//             if (studentsToPrint.length === 0) {
//                  const messageDiv = document.createElement('div');
//                  messageDiv.innerText = "No students selected for printing.";
//                  messageDiv.style.width = '100%';
//                  messageDiv.style.textAlign = 'center';
//                  messageDiv.style.marginTop = '20px';
//                  messageDiv.style.pageBreakInside = 'avoid'; // Prevent message splitting
//                  printContainer.appendChild(messageDiv);
//              }

//             return printContainer; // Return the fully constructed DOM element for printing
//         },
//         documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         // Trigger loading state changes before/after print dialog interaction
//         onBeforeGetContent: () => Promise.resolve(), // Already handling loader in content()
//         onAfterPrint: () => {
//             setIsLoader(false); // Turn off loading indicator
//             if (studentsToPrint.length > 0) {
//                 toast.success(`${studentsToPrint.length} ID Card(s) prepared!`);
//             }
//             // Optionally, you could add a toast if printing was cancelled or empty:
//             // else { toast.info("Printing cancelled or no students selected."); }
//         },
//         // Define the CSS styles specifically for the print media
//         pageStyle: `
//           @page {
//             size: A4 landscape; /* Set page orientation */
//             margin: 5mm; /* Define page margins */
//           }
//           @media print {
//             body {
//               -webkit-print-color-adjust: exact !important; /* Force printing of background colors/images in Chrome/Safari */
//               print-color-adjust: exact !important; /* Standard property for background printing */
//             }

//             /* --- Layout Container --- */
//             /* Default LTR layout */
//             .id-card-print-area {
//               display: flex !important; /* Use flexbox for layout */
//               flex-wrap: wrap !important; /* Allow items to wrap to the next line */
//               flex-direction: row !important; /* Default direction: Left-to-Right */
//               justify-content: flex-start !important; /* Align items starting from the left */
//               align-items: flex-start !important; /* Align items to the top of the container */
//               width: 277mm !important; /* Printable width: A4 landscape (297mm) - 2*margin (10mm) */
//               column-gap: 1.75mm !important; /* Horizontal gap between columns (adjust based on item count) */
//               row-gap: 5mm !important; /* Vertical gap between rows */
//             }

//             /* RTL layout override for 'Back Only' printing */
//             .id-card-print-area.print-rtl {
//               flex-direction: row-reverse !important; /* Change flow direction to Right-to-Left */
//               /* justify-content: flex-start; still works correctly, aligning items to the right edge in RTL */
//             }

//             /* --- Individual Item Containers (Pair or Single Card) --- */
//             .id-card-pair, .single-card-print {
//                 page-break-inside: avoid !important; /* CRITICAL: Prevent items from being split across page breaks */
//                 display: block !important; /* Ensure items behave as blocks in the flex layout */
//                 width: ${CARD_WIDTH_MM}mm !important; /* Set the fixed width of each item */
//                 margin: 0 !important; /* Use gap for spacing, not margin */
//                 padding: 0 !important;
//                 border: none !important; /* Remove borders for final print */
//                 box-sizing: border-box !important; /* Include padding/border in width/height */
//                 /* page-break-after is applied dynamically via JS */
//             }
//             .id-card-pair { height: auto !important; } /* Pair height depends on its content (front + back + gap) */
//             .single-card-print { height: ${CARD_HEIGHT_MM}mm !important; overflow: hidden !important; } /* Single card has fixed height */

//             /* Small gap between front and back cards within a pair */
//             .id-card-pair .id-card-front { margin-bottom: 1mm !important; }

//             /* --- Actual Card Content Divs --- */
//              .id-card {
//                 width: ${CARD_WIDTH_MM}mm !important; /* Ensure inner divs also have correct dimensions */
//                 height: ${CARD_HEIGHT_MM}mm !important;
//                 overflow: hidden !important; /* Hide content that exceeds card boundaries */
//                 border: none !important;
//                 box-sizing: border-box !important;
//                 display: block !important;
//                 background-color: transparent !important; /* Allow template background images/colors to show */
//              }

//             /* --- Hide Screen-Only Elements --- */
//             .no-print, .screen-only { display: none !important; }
//           }
//         `,
//     });

//     // --- Options for Select Components ---
//     // Memoize options to prevent recalculation on every render
//     const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);

//     const sectionOptions = useMemo(() => {
//         const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//         // Ensure sections exist and map them, otherwise return empty array
//         return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//     }, [classData, selectedClass]);

//     // --- Selection State Calculation ---
//     // Determine if the "Select All" checkbox should be checked or indeterminate
//     const isSelectAllChecked = useMemo(() => filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length, [filteredStudentData, selectedStudentIds]);

//     // --- JSX ---
//     return (
//         <>
//          <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID Cards"/>
     
//             {/* <h2 className="py-1">
//         Generate Student ID Cards
//         </h2> */}
//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
   
//                 {/* <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                     <Grid container spacing={2} alignItems="center"> */}
//                         {/* Class Filter */}
//                         {/* <Grid item xs={12} sm={6} md={3} lg={2}> */}
//                         <div
//        className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2"
//         >

      
//                             <ReactSelect
//                                 name="class"
//                                 value={selectedClass}
//                                 handleChange={handleClassChange}
//                                 label="Class"
//                                 dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//                                 placeholder="Select Class"
//                                 isDisabled={isLoadingData} // Disable while loading initial data
//                             />
//                             <ReactSelect
//                                 name="section"
//                                 value={selectedSection}
//                                 handleChange={handleSectionChange}
//                                 label="Section"
//                                 dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//                                 // Disable if no class selected, no sections available, or loading
//                                 disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData}
//                                 placeholder="Select Section"
//                             />
                             
//                              <TextField
//                                 fullWidth
//                                 id="filter-name"
//                                 label="Filter by Name / Adm. No."
//                                 variant="outlined"
//                                 onChange={handleFilterByNameChange}
//                                 value={filterName}
//                                 size="small" // Match height of ReactSelect if needed
//                                 disabled={isLoadingData}
//                             />


//                             <FormControl fullWidth size="small" disabled={isLoadingData}>
//                                 <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
//                                 <Select
//                                     labelId="print-mode-select-label"
//                                     id="print-mode-select"
//                                     value={printMode}
//                                     label="Print Sides"
//                                     onChange={handlePrintModeChange}
//                                 >
//                                     <MenuItem value={'both'}>Both Sides</MenuItem>
//                                     <MenuItem value={'front'}>Front Only</MenuItem>
//                                     <MenuItem value={'back'}>Back Only</MenuItem>
//                                 </Select>
//                             </FormControl>
//                             <Button
//                                 fullWidth
//                                 variant="contained"
//                                 onClick={generatePDF}
//                                 style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} // Consistent height
//                                 // Disable if nothing selected, or initial loading, or print prep ongoing
//                                 disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader}
//                                 startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null} // Show spinner when printing
//                             >
//                                 {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
//                             </Button>
//                               </div>
                       
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center' }}>
//                     {/* Show Select All only when not loading and there are filter results */}
//                     {!isLoadingData && filteredStudentData.length > 0 && (
//                         <FormControlLabel
//                             control={<Checkbox
//                                 checked={isSelectAllChecked}
//                                 indeterminate={isSelectAllIndeterminate}
//                                 onChange={handleSelectAllChange}
//                             />}
//                             label={`Select All (${filteredStudentData.length} shown)`}
//                             sx={{ width: '100%' }} // Take full width for alignment
//                         />
//                     )}
//                     {/* Show loading indicator during initial data fetch */}
//                     {isLoadingData && (
//                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
//                              <CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography>
//                          </Box>
//                     )}
//                     {/* Show message if filters result in no students */}
//                     {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
//                             No students match the current filters.
//                          </Typography>
//                     )}
//                     {/* Show message if no student data was loaded at all */}
//                     {!isLoadingData && studentData.length === 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
//                             No active students found. Please check student records.
//                          </Typography>
//                     )}
//                 </Box>

//                 {/* On-Screen Preview Area (This section is HIDDEN during printing) */}
//                 {/* It uses the 'screen-only' class and print content is generated separately */}
//                 <div>
//                     <Box
//                         className="screen-only"
//                         sx={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             gap: '15px', // Visual spacing for the preview grid
//                             // Conditional layout for the PREVIEW only
//                             flexDirection: printMode === 'back' ? 'row-reverse' : 'row',
//                             justifyContent: 'flex-start',
//                         }}
//                     >
//                         {/* Only map and display previews if not loading and students exist in filtered list */}
//                         {!isLoadingData && filteredStudentData.length > 0 && (
//                             filteredStudentData.map((student) => {
//                                 // Basic check for essential student data for preview key/label
//                                 if (!student || !student._id) {
//                                     console.warn("Skipping student preview due to missing ID:", student);
//                                     return null; // Don't render preview for invalid student data
//                                 }
//                                 const studentKey = student._id;
//                                 const isSelected = selectedStudentIds.has(studentKey);

//                                 return (
//                                     // Container for each student's preview (checkbox + card(s))
//                                     <Box key={studentKey} sx={{
//                                         border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd', // Highlight selected
//                                         borderRadius: '4px',
//                                         padding: '5px',
//                                         backgroundColor: isSelected ? '#e6f7ff' : '#fff', // Light blue background if selected
//                                         display: 'inline-flex', // Allows checkbox and card stack vertically
//                                         flexDirection: 'column',
//                                         alignItems: 'center', // Center the card(s) below the checkbox
//                                         width: 'auto', // Fit content naturally
//                                         minWidth: `calc(${CARD_WIDTH_MM}mm + 10px)`, // Ensure minimum width
//                                         pageBreakInside: 'avoid', // Hint for screen rendering (less critical)
//                                     }}>
//                                         {/* Checkbox with student name/ID */}
//                                         <FormControlLabel
//                                             control={ <Checkbox
//                                                 size="small"
//                                                 checked={isSelected}
//                                                 onChange={(e) => handleSelectSingleChange(e, studentKey)}
//                                             /> }
//                                             // Display name and admission number, with fallbacks
//                                             label={`${student.studentName || 'Unknown Name'} (${student.admissionNumber || 'No ID'})`}
//                                             sx={{ width: '100%', alignSelf: 'flex-start', mb: 0.5, fontSize: '0.8rem', mr: 0 }} // Align left
//                                         />

//                                         {/* Conditional display of front/back/both previews */}
//                                         {printMode === 'front' && (
//                                             <div
//                                                 className="id-card" // Use class for potential shared preview styles
//                                                 style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
//                                         )}
//                                         {printMode === 'back' && (
//                                             <div
//                                                 className="id-card"
//                                                 style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
//                                         )}
//                                         {printMode === 'both' && (
//                                             // Container to stack front and back previews vertically
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
//                                                 <div
//                                                     className="id-card id-card-front"
//                                                     style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
//                                                     dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
//                                                 <div
//                                                     className="id-card id-card-back"
//                                                     style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
//                                                     dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
//                                             </div>
//                                         )}
//                                     </Box>
//                                 );
//                             })
//                         )}
//                         {/* Loading/No Results messages are shown in the dedicated area above the preview */}
//                     </Box>
//                 </div>
//             </Box>
//             {/* </div> */}
//         </>
//     );
// };

// export default IdCard;

