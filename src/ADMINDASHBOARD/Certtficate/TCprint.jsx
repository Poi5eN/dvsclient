import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
import { useReactToPrint } from "react-to-print";
import '../../App.css'; 
import {
    Button, TextField, Typography, Box, CircularProgress,
    Checkbox, FormControlLabel,
    List, ListItem, ListItemText, Paper, Divider
} from "@mui/material"; // Added List components
import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
import { toast } from "react-toastify";
import moment from "moment";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";


const CARD_WIDTH_MM = 210;
const CARD_HEIGHT_MM = 297;

// Helper to chunk array (not directly used for preview pagination anymore, but good utility)
const chunkArray = (array, size) => {
    if (size <= 0) return [array];
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
        chunked_arr.push(array.slice(index, size + index));
        index += size;
    }
    return chunked_arr;
};

// Layout constants remain focused on the single A4 portrait item
const calculateLayoutConstants = () => {
    const orientation = 'portrait';
    const marginMM = 0;
    const pagePhysicalWidth = 210;
    const pagePhysicalHeight = 297;
    const pageContentWidth = pagePhysicalWidth - (2 * marginMM);
    const pageContentHeight = pagePhysicalHeight - (2 * marginMM);

    return {
        orientation,
        pageStyleSize: `A4 ${orientation}`,
        marginMM,
        itemWidthMM: pageContentWidth,
        itemHeightMM: pageContentHeight,
        previewAspectRatio: `${pagePhysicalWidth} / ${pagePhysicalHeight}`,
    };
};


const TCprint = () => {
    // --- State Variables ---
    const [idCardData, setIdCardData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [classData, setClassData] = useState([]);
    const [filteredStudentData, setFilteredStudentData] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [printMode, setPrintMode] = useState('front');
    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

    // --- Context and Refs ---
    const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
    const { currentColor, setIsLoader, isLoader } = useStateContext();
    // componentRef not used for react-to-print's content directly anymore

    // --- Dynamic Layout Constants ---
    const layoutConstants = useMemo(() => calculateLayoutConstants(), []);


    // --- Default Templates (Ensure these are designed for 210mm x 297mm) ---
    const [defaultFrontTemplate] = useState(`
    <div style='background-color: #ffffff; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
      <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
      <div style='position: relative; z-index: 2; padding: 15mm;'>
          <div style='text-align: center; margin-top: 20mm; margin-bottom: 15mm;'><h3 style='margin: 0; font-size: 28pt; color: #333;'>\${schoolFullName || "SCHOOL NAME HERE"}</h3><p style='margin: 5mm 0; font-size: 20pt; color: #666;'>Session: \${session}</p><h4 style='margin: 10mm 0 5mm 0; font-size: 22pt; color: #444;'>STUDENT IDENTITY CARD</h4></div>
          <div style='display:flex; flex-direction:row; margin-top:10mm; align-items:flex-start;'>
            <div style='margin-right: 15mm; text-align:center;'>
                <img src='\${studentImage || "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg"}' style='width: 50mm; height: 60mm; border: 2px solid #aaa; border-radius: 4px; object-fit: cover; margin-bottom:5mm;' alt="Photo"/>
                <img src='\${principalSignature || "https://via.placeholder.com/150x50.png?text=Principal+Signature"}' style='width: 40mm; height: auto; margin-top:10mm;' alt="Principal Signature"/>
                <p style='font-size:10pt; margin-top:1mm;'>Principal</p>
            </div>
            <div style='font-size: 14pt; flex-grow:1;'>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Student's Name:</strong> <span style='text-align:right;'>\${name}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Father's Name:</strong> <span style='text-align:right;'>\${father_name}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Mother's Name:</strong> <span style='text-align:right;'>\${mother_name}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Class:</strong> <span style='text-align:right;'>\${class}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Roll No:</strong> <span style='text-align:right;'>\${rollNo}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Admission No:</strong> <span style='text-align:right;'>\${admissionNumber}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Date of Birth:</strong> <span style='text-align:right;'>\${dob}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Contact No:</strong> <span style='text-align:right;'>\${mobile}</span></p>
                <p style='margin: 3mm 0; display:flex; justify-content:space-between;'><strong>Address:</strong> <span style='text-align:right; max-width:60%; word-break:break-word;'>\${address}</span></p>
            </div>
          </div>
          <div style='text-align: center; font-size: 10pt; color: #777; margin-top: auto; padding-top:20mm; bottom: 10mm; width:100%; position:absolute; left:0;'>
            <p style='margin:1mm 0;'>\${schoolAddress || "School Address Line 1, City, State - Pincode"}</p>
            <p style='margin:1mm 0;'>Phone: \${schoolPhone || "XXX-XXXXXXX"} | Email: \${schoolEmail || "info@school.com"}</p>
          </div>
      </div>
    </div>
    `);



    // --- Data Fetching and Processing Callbacks (Core logic unchanged) ---
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
        } catch (error) { console.error("Error decoding base64 string:", error, "Input:", encoded); return null; }
    }, []);

    const fetchTemplate = useCallback(async () => {
        try {
            const response = await getIDcarddesign();
            if (response?.success && response?.designFormats?.length > 0) {
                setIdCardData(response.designFormats[0]);
            } else {
                setIdCardData(null);
                if(response && !response.success) toast.warn("Custom template not found or error: " + (response.message || "Using default."));
            }
        } catch (error) { console.error("Error fetching ID card design:", error); toast.error("Could not load custom template. Using default."); setIdCardData(null); }
    }, []);

    const fetchAllClasses = useCallback(async () => {
        try {
            const response = await AdminGetAllClasses();
            if (response?.success) setClassData(response.classes || []);
            else { toast.error(response?.message || "Failed to fetch classes."); setClassData([]); }
        } catch (error) { console.error("Error fetching classes:", error); toast.error("An error occurred while fetching classes."); setClassData([]); }
    }, []);

    const fetchAllStudents = useCallback(async () => {
        if (!session) { toast.error("Session information is missing."); setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return; }
        setIsLoadingData(true);
        try {
            const response = await ActiveStudents(session);
            if (response?.success && response.students?.data) setStudentData(response.students.data || []);
            else { toast.error(response?.message || "Failed to fetch students."); setStudentData([]); }
        } catch (error) { console.error("Error fetching students:", error); toast.error("An error occurred while fetching students."); setStudentData([]); }
        finally { setIsLoadingData(false); }
    }, [session]);

    useEffect(() => { Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]); }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

    useEffect(() => {
        if (isLoadingData) return;
        let filtered = studentData;
        if (selectedClass) filtered = filtered.filter(s => s.class === selectedClass);
        if (selectedSection) filtered = filtered.filter(s => (s.section || null) === selectedSection);
        if (filterName) {
            const lowerCaseFilter = filterName.toLowerCase().trim();
            filtered = filtered.filter(s =>
                s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
                s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
            );
        }
        setFilteredStudentData(filtered);
        // Do NOT reset selectedStudentIds here, so selections persist across minor filter text changes
        // Only reset if class/section changes or explicitly cleared.
    }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);
    
    // Reset selections if class or section changes
    useEffect(() => {
        setSelectedStudentIds(new Set());
    }, [selectedClass, selectedSection]);


    const handleFilterByNameChange = (e) => setFilterName(e.target.value);
    const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); /* setSelectedStudentIds(new Set()); Already handled by useEffect */};
    const handleSectionChange = (e) => setSelectedSection(e.target.value); /* setSelectedStudentIds(new Set()); Already handled by useEffect */
    const handlePrintModeChange = (e) => setPrintMode(e.target.value);

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            setSelectedStudentIds(new Set(filteredStudentData.map(s => s._id).filter(Boolean)));
        } else {
            setSelectedStudentIds(new Set());
        }
    };
    const handleSelectSingleChange = (event, studentId) => {
        if (!studentId) return;
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (event.target.checked) newSet.add(studentId);
            else newSet.delete(studentId);
            return newSet;
        });
    };

    const decodedApiFrontTemplate = useMemo(() => idCardData?.frontTemplate ? decodeBase64(idCardData.frontTemplate) : null, [idCardData, decodeBase64]);
 
    const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;

    
    const replacePlaceholders = useCallback((template, data, cardSide) => {
        if (!template) return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:12pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>Missing Template for ${cardSide}</div>`;
        let renderedHtml = template;
        try {
            renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
                const cleanKey = key.trim();
                let value = data;
                // Basic dot notation access (e.g., student.name), not deep nesting.
                if (cleanKey.includes('.')) {
                    const keys = cleanKey.split('.');
                    value = keys.reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : undefined, data);
                } else {
                    value = data[cleanKey];
                }

                if (value === undefined || value === null || value === '') {
                    const lowerKey = cleanKey.toLowerCase();
                    if (lowerKey.includes('image') && (lowerKey.includes('student') || lowerKey.includes('father') || lowerKey.includes('mother') || lowerKey.includes('guardian') || lowerKey.includes('background') || lowerKey.includes('signature'))) {
                        return "https://via.placeholder.com/150x150.png?text=No+Image"; // Generic placeholder
                    }
                }
                return String(value ?? '');
            });
        } catch (error) {
            console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
            return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:12pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>${cardSide} Render Error</div>`;
        }
        return renderedHtml;
    }, []); 

    const getStudentTemplateData = useCallback((student) => ({
        backgroundImageFront: idCardData?.frontImage?.url || "", 
        backgroundImageBack: idCardData?.backImage?.url || "",
        studentImage: student?.studentImage?.url,
        name: student?.studentName?.toUpperCase() || 'N/A',
        dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
        class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
        section: student?.section || 'N/A',
        gender: student?.gender || 'N/A',
        contact: student?.contact || 'N/A', 
        transport: student?.transport || 'N/A',
        father_name: student?.fatherName?.toUpperCase() || 'N/A',
        mother_name: student?.motherName?.toUpperCase() || 'N/A',
        mobile: student?.contact || student?.parentContact || 'N/A', 
        address: student?.address || 'N/A',
        session: student?.sessionName || session?.name || 'N/A', 
        admissionNumber: student?.admissionNumber || 'N/A',
        fatherImage: student?.fatherImage?.url,
        motherImage: student?.motherImage?.url,
        guardianImage: student?.guardianImage?.url,
        guardianname: student?.guardianName || 'N/A',
        parentContact: student?.parentContact || 'N/A', 
        rollNo: student?.rollNo || 'N/A',
        // School specific details (ideally from context or settings)
        schoolFullName: idCardData?.schoolName || session?.schoolName || "YOUR SCHOOL NAME",
        schoolAddress: idCardData?.schoolAddress || session?.schoolAddress || "School Address, City, Pincode",
        schoolPhone: idCardData?.schoolPhone || session?.schoolPhone || "000-0000000",
        schoolEmail: idCardData?.schoolEmail || session?.schoolEmail || "info@yourschool.com",
        principalSignature: idCardData?.principalSignatureImage?.url || "", 
        issueDate: moment().format("DD MMMM YYYY"),
        validityDate: moment().add(1, 'year').format("DD MMMM YYYY"),
        bloodGroup: student?.bloodGroup || 'N/A', // Example: Add student.bloodGroup to your data
        allergies: student?.allergies || 'None Reported', // Example: Add student.allergies
    }), [idCardData, session]);

    const renderFrontTemplate = useCallback((s) => replacePlaceholders(frontTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageFront}, 'Front'), [getStudentTemplateData, frontTemplateToUse, replacePlaceholders]);
    // const renderBackTemplate = useCallback((s) => replacePlaceholders(backTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageBack}, 'Back'), [getStudentTemplateData, backTemplateToUse, replacePlaceholders]);

    const studentsToPrint = useMemo(() => {
        // Important: Ensure student objects are complete for studentsToPrint
        return filteredStudentData.filter(s => s?._id && selectedStudentIds.has(s._id));
    }, [filteredStudentData, selectedStudentIds]);


    const generatePDF = useReactToPrint({
        content: () => {
            if (studentsToPrint.length === 0) {
                toast.warn("No students selected to print.");
                return null; // Prevent print dialog if nothing is selected
            }
            setIsLoader(true);
            const printContainer = document.createElement('div');
            studentsToPrint.forEach((student) => {
                if (printMode === 'front' || printMode === 'both') {
                    const frontHtml = renderFrontTemplate(student);
                    const pageWrapperForFront = document.createElement('div');
                    pageWrapperForFront.className = 'print-page-wrapper';
                    pageWrapperForFront.innerHTML = frontHtml;
                    printContainer.appendChild(pageWrapperForFront);
                }
                // if (printMode === 'back' || printMode === 'both') {
                //     const backHtml = renderBackTemplate(student);
                //     const pageWrapperForBack = document.createElement('div');
                //     pageWrapperForBack.className = 'print-page-wrapper';
                //     pageWrapperForBack.innerHTML = backHtml;
                //     printContainer.appendChild(pageWrapperForBack);
                // }
            });
            return printContainer;
        },
        documentTitle: `Student_Items_${printMode}_${selectedClass||'All'}_${selectedSection||'All'}_${moment().format('YYYYMMDD_HHmm')}`,
        onAfterPrint: () => { setIsLoader(false); if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length * (printMode === 'both' ? 2 : 1)} page(s) prepared!`); },
        pageStyle: `
          @page {
            size: A4 portrait; 
            margin: ${layoutConstants.marginMM}mm;
          }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .print-page-wrapper { page-break-after: always !important; line-height: 1; }
            .print-page-wrapper > div { 
                width: ${CARD_WIDTH_MM}mm !important; height: ${CARD_HEIGHT_MM}mm !important;
                box-sizing: border-box !important; overflow: hidden !important; display: block !important;
                background-color: transparent !important;
            }
            .print-page-wrapper:last-child { page-break-after: avoid !important; }
            .no-print, .screen-only { display: none !important; }
          }
        `,
    });

    const classOptions = useMemo(() => classData.map(c => ({ label: c.className, value: c.className })), [classData]);
    const sectionOptions = useMemo(() => (classData.find(c => c.className === selectedClass)?.sections || []).map(s => ({ label: s, value: s })), [classData, selectedClass]);
    const isSelectAllChecked = useMemo(() => filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
    const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length, [filteredStudentData, selectedStudentIds]);

    return (
        <>
         <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Print Full Page Student Items (A4)"/>
            <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
                {/* Filter Bar */}
                <Paper elevation={2} className="no-print" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Filter Students</Typography>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
                        <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData}/>
                        <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section"/>
                        <TextField fullWidth label="Filter by Name / Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}/>
                        {/* <FormControl fullWidth size="small" disabled={isLoadingData}>
                            <InputLabel>Print Sides</InputLabel>
                            <Select value={printMode} label="Print Sides" onChange={handlePrintModeChange}>
                                <MenuItem value={'both'}>Both Sides</MenuItem>
                                <MenuItem value={'front'}>Front Only</MenuItem>
                                <MenuItem value={'back'}>Back Only</MenuItem>
                            </Select>
                        </FormControl> */}
                        <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
                            <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}>
                                {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
                            </Button>
                        </Box>
                    </div>
                </Paper>
                       
                {/* Student Selection List */}
                <Paper elevation={2} className="no-print" sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
                        {!isLoadingData && filteredStudentData.length > 0 && (
                            <FormControlLabel
                                control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange}/>}
                                label={`Select All (${filteredStudentData.length} found)`}
                                sx={{ mr: 'auto' }}
                            />
                        )}
                        <Typography variant="caption">{selectedStudentIds.size} student(s) selected</Typography>
                    </Box>
                    {isLoadingData && (
                        <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%', p:3 }}>
                            <CircularProgress size={25} /><Typography sx={{ml:2}}>Loading Student List...</Typography>
                        </Box>
                    )}
                    {!isLoadingData && filteredStudentData.length === 0 && (
                        <Typography sx={{textAlign:'center', width:'100%', color:'text.secondary', p:3}}>
                            {studentData.length > 0 ? "No students match current filters." : "No active students found."}
                        </Typography>
                    )}
                    {!isLoadingData && filteredStudentData.length > 0 && (
                        <List dense sx={{ maxHeight: '300px', overflowY: 'auto', p:0 }}>
                            {filteredStudentData.map((student, index) => (
                                <React.Fragment key={student._id}>
                                    <ListItem
                                        secondaryAction={
                                            <Checkbox
                                                edge="end"
                                                onChange={(e) => handleSelectSingleChange(e, student._id)}
                                                checked={selectedStudentIds.has(student._id)}
                                            />
                                        }
                                        disablePadding
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl:2, pr:1, py:0.5, cursor:'pointer' }} onClick={(e) => {
                                            // Allow clicking row to toggle checkbox if not clicking checkbox itself
                                            if (e.target.type !== 'checkbox') {
                                                handleSelectSingleChange({ target: { checked: !selectedStudentIds.has(student._id) } }, student._id)
                                            }
                                        }}>
                                            <img 
                                                src={student?.studentImage?.url || "https://via.placeholder.com/40?text=S"} 
                                                alt="S" 
                                                style={{width:32, height:32, borderRadius:'50%', marginRight:12, objectFit:'cover'}}
                                            />
                                            <ListItemText 
                                                primaryTypographyProps={{ variant: 'body2', noWrap: true }} 
                                                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                                                primary={student.studentName || 'N/A'} 
                                                secondary={`Adm: ${student.admissionNumber || 'N/A'} | Class: ${student.class || 'N/A'}${student.section ? `-${student.section}` : ''} | Roll: ${student.rollNo || 'N/A'}`} 
                                            />
                                        </Box>
                                    </ListItem>
                                    {index < filteredStudentData.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>


                {/* Preview Area for SELECTED students */}
                <Typography variant="h6" gutterBottom className="screen-only" sx={{mt: 3, mb:1}}>
                    Preview of Selected Items ({studentsToPrint.length})
                </Typography>
                <div className="screen-only screen-a4-pages-container">
                    {studentsToPrint.length === 0 && !isLoadingData && (
                        <Typography sx={{textAlign:'center',width:'100%',fontStyle:'italic', color:'text.secondary', p:3}}>
                            Select students from the list above to preview their items here.
                        </Typography>
                    )}
                    {isLoadingData && studentsToPrint.length > 0 && ( /* Should not happen if selection tied to filtered data */
                         <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%', p:3 }}>
                            <CircularProgress size={25} /><Typography sx={{ml:2}}>Loading Preview...</Typography>
                        </Box>
                    )}
                    
                    {studentsToPrint.map((student) => {
                        if (!student || !student._id) return null; // Should be filtered by studentsToPrint already

                        return (
                            <Paper elevation={3} key={`preview-page-${student._id}`} className="screen-a4-page" style={{ 
                                width: `min(100%, ${layoutConstants.itemWidthMM / 2}mm)`, // Show previews smaller, e.g., half A4 width
                                aspectRatio: layoutConstants.previewAspectRatio 
                            }}>
                                <Box sx={{p:0.5, borderBottom: '1px solid #eee', mb:0.5, backgroundColor: '#f0f0f0', textAlign:'center' }}>
                                  <Typography variant="caption" sx={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis', fontWeight:'bold'}}>
                                      {student.studentName || 'N/A'} (Adm: {student.admissionNumber || 'N/A'})
                                  </Typography>
                                </Box>
                                <div className={`screen-id-card-layout-area`}>
                                    <Box className="student-preview-wrapper-in-a4">
                                        {printMode === 'front' && (<div className="id-card-preview" style={{border:'1px dashed #ccc'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/>)}
                                        {/* {printMode === 'back' && (<div className="id-card-preview" style={{border:'1px dashed #aaa'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/>)} */}
                                        {/* {printMode === 'both' && (
                                            <div style={{display:'flex',flexDirection:'column',width:'100%',height:'100%', overflowY:'auto', gap:'2mm'}}>
                                                <div className="id-card-preview id-card-front-preview" style={{border:'1px dashed #ccc'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/>
                                                <div className="id-card-preview id-card-back-preview" style={{border:'1px dashed #aaa'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/>
                                            </div>
                                        )} */}
                                    </Box>
                                </div>
                            </Paper>
                        );
                    })}
                </div>
            </Box>
            {/* Global Styles for Preview */}
            <style jsx global>{`
                .screen-a4-pages-container { 
                    margin-top:10px; 
                    border:1px solid #e0e0e0; 
                    padding:15px; 
                    background-color:#e9ecef; 
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px; /* Gap between preview items */
                    justify-content: center; /* Center preview items if they don't fill the row */
                    min-height: 150px; /* Ensure container has some height even when empty */
                }
                .screen-a4-page { /* This is the container for one student's preview */
                    background-color:white; 
                    border:1px solid #ccc; 
                    /* padding is handled by layoutConstants.marginMM which is 0 */
                    box-sizing:border-box; 
                    overflow: hidden; 
                    display: flex;
                    flex-direction: column;
                    /* width and aspectRatio set inline for responsiveness */
                }
                .screen-id-card-layout-area { /* Area where the card HTML is injected */
                    flex-grow: 1; 
                    display:flex !important; 
                    flex-direction:column !important; 
                    justify-content:center !important; 
                    align-items:center !important; 
                    width:100% !important; 
                    box-sizing:border-box !important; 
                    overflow:hidden; /* Clips the content to the aspect ratio */
                }
                .student-preview-wrapper-in-a4 { /* Wrapper for the actual card content */
                    width: 100%; 
                    height: 100%; 
                    box-sizing:border-box; 
                    display:flex; 
                    flex-direction:column; 
                    align-items:center;
                    justify-content:center; 
                }
                /* This is the div rendered from your HTML template string, scaled for preview */
                .id-card-preview { 
                    width: 100% !important; 
                    height: 100% !important; 
                    /* Actual size is CARD_WIDTH_MM x CARD_HEIGHT_MM, this scales it down for preview */
                    /* The scaling is implicitly handled by the parent's (.screen-a4-page) dimensions and aspect ratio */
                    transform: scale(0.96); /* Make it slightly smaller than its container to see borders */
                    transform-origin: center center;
                    overflow:auto; /* Allows scrolling within the previewed card if content is larger */
                    box-sizing:border-box !important; 
                    background-color:#fff; 
                }
                /* For 'both' mode in preview, stack front and back */
                .student-preview-wrapper-in-a4 > div > .id-card-preview { /* Targets the direct children in 'both' mode's div */
                     height: calc(50% - 1mm) !important; /* Each takes half height, adjust for gap */
                     width: 100% !important;
                     overflow: auto; /* Scroll individually if needed */
                }
                 .student-preview-wrapper-in-a4 > div > .id-card-preview:only-child { /* If only front or only back */
                     height: 100% !important; 
                 }
            `}</style>
        </>
    );
};

export default TCprint;


