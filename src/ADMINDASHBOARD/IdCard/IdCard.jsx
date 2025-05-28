import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
import { useReactToPrint } from "react-to-print";
import '../../App.css'; // Assuming this is still needed
import {
    Button, TextField, Typography, Box, CircularProgress,
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

// Helper to chunk array for paged preview
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

// Helper function to calculate layout parameters - ALWAYS LANDSCAPE
const calculateLayoutConstants = (printMode) => { // Removed orientation parameter
    const orientation = 'landscape'; // Hardcoded
    const marginMM = 5;
    const colGapMM = 1.75; 
    const rowGapMM = 5;

    const pageStyleSize = 'A4 landscape'; // Hardcoded
    const pagePhysicalWidth = 297;
    const pagePhysicalHeight = 210;
    const pageContentWidth = pagePhysicalWidth - (2 * marginMM); // 287mm
    const pageContentHeight = pagePhysicalHeight - (2 * marginMM); // 200mm

    const cardsPerRow = 5; // Fixed 5 card SLOTS horizontally for landscape
    let rowsOfItems;
    
    if (printMode === 'both') {
        // For pairs, 1 row of pairs fits in landscape.
        rowsOfItems = 1; 
    } else {
        // For single cards, 2 rows fit in landscape.
        rowsOfItems = 2;
    }

    const printAreaActualWidth = (cardsPerRow * CARD_WIDTH_MM) + ((cardsPerRow - 1) * colGapMM);
    const itemsPerPage = cardsPerRow * rowsOfItems;
    const justifyContentPrint = 'flex-start'; // Always start for landscape

    return {
        orientation, 
        pageStyleSize,
        marginMM,
        colGapMM,
        rowGapMM,
        cardsPerRow,
        rowsOfItems,
        printAreaActualWidth,
        itemsPerPage,
        previewAspectRatio: `${pagePhysicalWidth} / ${pagePhysicalHeight}`,
        justifyContentPrint,
    };
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
    const [photoFilter, setPhotoFilter] = useState('all'); // 'all', 'with_photo', 'without_photo'


    // --- Context and Refs ---
    const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
    const { currentColor, setIsLoader, isLoader } = useStateContext();
    const componentRef = useRef();

    // --- Dynamic Layout Constants ---
    const layoutConstants = useMemo(() => {
        return calculateLayoutConstants(printMode); 
    }, [printMode]); 

    // --- Default Templates (Unchanged) ---
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
                const filterStudent=response.students?.data?.filter((val)=>val?.isPrinted===false);
                setStudentData(filterStudent || []);
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
        if (selectedClass) filtered = filtered.filter(s => s.class === selectedClass);
        if (selectedSection) filtered = filtered.filter(s => (s.section || null) === selectedSection);
        if (filterName) {
            const lowerCaseFilter = filterName.toLowerCase().trim();
            filtered = filtered.filter(s =>
                s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
                s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
            );
        }
        // Apply photo filter
        if (photoFilter === 'with_photo') {
            filtered = filtered.filter(s => s.studentImage && s.studentImage.url && s.studentImage.url.trim() !== "");
        } else if (photoFilter === 'without_photo') {
            filtered = filtered.filter(s => !s.studentImage || !s.studentImage.url || s.studentImage.url.trim() === "");
        }

        setFilteredStudentData(filtered);
        // setSelectedStudentIds(new Set());
    }, [selectedClass, selectedSection, filterName, studentData, isLoadingData, photoFilter]); // Added photoFilter

    const handleFilterByNameChange = (e) => setFilterName(e.target.value);
    const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
    const handleSectionChange = (e) => setSelectedSection(e.target.value);
    const handlePrintModeChange = (e) => setPrintMode(e.target.value);
    const handlePhotoFilterChange = (e) => setPhotoFilter(e.target.value);


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
    const decodedApiBackTemplate = useMemo(() => idCardData?.backTemplate ? decodeBase64(idCardData.backTemplate) : null, [idCardData, decodeBase64]);
    const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
    const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;
    
    const replacePlaceholders = useCallback((template, data, cardSide) => {
        if (!template) return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>Missing Template</div>`;
        let renderedHtml = template;
        try {
            renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
                const cleanKey = key.trim();
                const keys = cleanKey.split('.');
                let value = data;
                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) value = value[k];
                    else { value = data[cleanKey]; break; }
                }
                if (value === undefined || value === null || value === '') {
                    const lowerKey = cleanKey.toLowerCase();
                    if (lowerKey.includes('studentimage') || lowerKey.includes('fatherimage') || lowerKey.includes('motherimage') || lowerKey.includes('guardianimage')) return "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg";
                }
                return String(value ?? '');
            });
        } catch (error) {
            console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
            return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>${cardSide} Render Error</div>`;
        }
        return renderedHtml;
    }, []); 

    const getStudentTemplateData = useCallback((student) => ({
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
        session: student?.sessionName || session?.name || '', 
        admissionNumber: student?.admissionNumber || '',
        fatherImage: student?.fatherImage?.url,
        motherImage: student?.motherImage?.url,
        guardianImage: student?.guardianImage?.url,
        guardianname: student?.guardianName || '',
        parentContact: student?.parentContact || '',
        rollNo: student?.rollNo || '',
    }), [idCardData, session]);

    const renderFrontTemplate = useCallback((s) => replacePlaceholders(frontTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageFront}, 'Front'), [getStudentTemplateData, frontTemplateToUse, replacePlaceholders]);
    const renderBackTemplate = useCallback((s) => replacePlaceholders(backTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageBack}, 'Back'), [getStudentTemplateData, backTemplateToUse, replacePlaceholders]);

    const studentsToPrint = useMemo(() => filteredStudentData.filter(s => s?._id && selectedStudentIds.has(s._id)), [filteredStudentData, selectedStudentIds]);

    const generatePDF = useReactToPrint({
        content: () => {
            setIsLoader(true);
            const printContainer = document.createElement('div');
            printContainer.className = 'id-card-print-area';
            if (printMode === 'back') printContainer.classList.add('print-rtl');

            studentsToPrint.forEach((student, index) => {
                let itemElement;
                if (printMode === 'front') {
                    itemElement = document.createElement('div');
                    itemElement.className = `id-card single-card-print card-${student._id}-front`;
                    itemElement.innerHTML = renderFrontTemplate(student);
                } else if (printMode === 'back') {
                    itemElement = document.createElement('div');
                    itemElement.className = `id-card single-card-print card-${student._id}-back`;
                    itemElement.innerHTML = renderBackTemplate(student);
                } else {
                    itemElement = document.createElement('div');
                    itemElement.className = `id-card-pair pair-${student._id}`;
                    const frontDiv = document.createElement('div');
                    frontDiv.className = 'id-card id-card-front';
                    frontDiv.innerHTML = renderFrontTemplate(student);
                    const backDiv = document.createElement('div');
                    backDiv.className = 'id-card id-card-back';
                    backDiv.innerHTML = renderBackTemplate(student);
                    itemElement.appendChild(frontDiv); itemElement.appendChild(backDiv);
                }
                if (index > 0 && layoutConstants.itemsPerPage > 0 && index % layoutConstants.itemsPerPage === 0) {
                    const pageBreak = document.createElement('div');
                    pageBreak.style.pageBreakBefore = 'always';
                    printContainer.appendChild(pageBreak);
                }
                printContainer.appendChild(itemElement);
            });
            if (studentsToPrint.length === 0) {
                 const msgDiv = document.createElement('div');
                 msgDiv.innerText = "No students selected.";
                 msgDiv.style.textAlign = 'center'; msgDiv.style.width = '100%'; msgDiv.style.marginTop = '20px';
                 printContainer.appendChild(msgDiv);
            }
            return printContainer;
        },
        documentTitle: `ID_Cards_${printMode}_${selectedClass||'All'}_${selectedSection||'All'}_${moment().format('YYYYMMDD')}`,
        onAfterPrint: () => { setIsLoader(false); if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length} ID Card(s) prepared!`); },
        pageStyle: `
          @page {
            size: A4 landscape; /* HARDCODED to landscape */
            margin: ${layoutConstants.marginMM}mm;
          }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .id-card-print-area {
              display: flex !important; flex-wrap: wrap !important; flex-direction: row !important;
              justify-content: ${layoutConstants.justifyContentPrint} !important; 
              align-items: flex-start !important; align-content: flex-start !important;
              width: ${layoutConstants.printAreaActualWidth}mm !important;
              column-gap: ${layoutConstants.colGapMM}mm !important; /* Use colGapMM from constants */
              row-gap: ${layoutConstants.rowGapMM}mm !important;
              box-sizing: border-box !important;
              margin: 0 auto !important; 
            }
            .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }
            .id-card-pair, .single-card-print {
                page-break-inside: avoid !important; display: block !important; 
                width: ${CARD_WIDTH_MM}mm !important;
                margin: 0 !important; padding: 0 !important; border: none !important;
                box-sizing: border-box !important;
            }
            .id-card-pair { height: auto !important; }
            .single-card-print { height: ${CARD_HEIGHT_MM}mm !important; overflow: hidden !important; }
            .id-card-pair .id-card-front { margin-bottom: 1mm !important; }
            .id-card {
                width: ${CARD_WIDTH_MM}mm !important; height: ${CARD_HEIGHT_MM}mm !important;
                overflow: hidden !important; border: none !important; 
                box-sizing: border-box !important; display: block !important; 
                background-color: transparent !important;
            }
            .no-print, .screen-only { display: none !important; }
          }
        `,
    });

    const classOptions = useMemo(() => classData.map(c => ({ label: c.className, value: c.className })), [classData]);
    const sectionOptions = useMemo(() => (classData.find(c => c.className === selectedClass)?.sections || []).map(s => ({ label: s, value: s })), [classData, selectedClass]);
    const isSelectAllChecked = useMemo(() => filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
    const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
    const pagedFilteredStudents = useMemo(() => chunkArray(filteredStudentData, layoutConstants.itemsPerPage > 0 ? layoutConstants.itemsPerPage : 1), [filteredStudentData, layoutConstants.itemsPerPage]);

    return (
        <>
         <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID Cards (Landscape Only)"/>
            <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
                <div className="no-print bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 items-center mb-3"> {/* Changed to lg:grid-cols-6 */}
                    <Box> <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData}/> </Box>
                    <Box> <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section"/> </Box>
                    <Box> <TextField fullWidth label="Filter by Name / Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}/> </Box>
                    <Box> 
                        <FormControl fullWidth size="small" disabled={isLoadingData}>
                            <InputLabel>Photo Status</InputLabel>
                            <Select
                                value={photoFilter}
                                label="Photo Status"
                                onChange={handlePhotoFilterChange}
                            >
                                <MenuItem value={'all'}>All Students</MenuItem>
                                <MenuItem value={'with_photo'}>With Photo</MenuItem>
                                <MenuItem value={'without_photo'}>Without Photo</MenuItem>
                            </Select>
                        </FormControl> 
                    </Box>
                    <Box> <FormControl fullWidth size="small" disabled={isLoadingData}> <InputLabel>Print Sides</InputLabel> <Select value={printMode} label="Print Sides" onChange={handlePrintModeChange}> <MenuItem value={'both'}>Both Sides</MenuItem> <MenuItem value={'front'}>Front Only</MenuItem> <MenuItem value={'back'}>Back Only</MenuItem> </Select> </FormControl> </Box>
                    <Box> <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}> {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`} </Button> </Box>
                </div>
                       
                <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                    {!isLoadingData && filteredStudentData.length > 0 && (<FormControlLabel control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange}/>} label={`Select All (${filteredStudentData.length} shown, ${layoutConstants.itemsPerPage > 0 ? layoutConstants.itemsPerPage : 'N/A'} per page)`} sx={{ width: '100%' }}/>)}
                    {isLoadingData && (<Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%' }}> <CircularProgress size={25} /><Typography sx={{ml:2}}>Loading...</Typography> </Box>)}
                    {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (<Typography sx={{textAlign:'center', width:'100%', color:'text.secondary'}}>No students match filters.</Typography>)}
                    {!isLoadingData && studentData.length === 0 && (<Typography sx={{textAlign:'center', width:'100%', color:'text.secondary'}}>No active students found.</Typography>)}
                </Box>

                <div className="screen-only screen-a4-pages-container">
                    {!isLoadingData && pagedFilteredStudents.length === 0 && filteredStudentData.length > 0 && (<Typography sx={{textAlign:'center',width:'100%',fontStyle:'italic'}}>No students selected for preview.</Typography>)}
                    {pagedFilteredStudents.map((pageStudents, pageIndex) => (
                        <div key={`page-${pageIndex}`} className="screen-a4-page" style={{ aspectRatio: layoutConstants.previewAspectRatio }}>
                            <div className={`screen-id-card-layout-area ${printMode === 'back' ? 'preview-rtl' : ''}`}>
                                {pageStudents.map((student) => {
                                    if (!student || !student._id) return null;
                                    const isSelected = selectedStudentIds.has(student._id);
                                    return (
                                        <Box key={student._id} className="student-preview-wrapper-in-a4" sx={{ border: isSelected ? `2px solid ${currentColor}` : `1px solid transparent`, backgroundColor: isSelected ? '#e6f7ff' : 'transparent' }}>
                                            <FormControlLabel control={<Checkbox size="small" checked={isSelected} onChange={(e) => handleSelectSingleChange(e, student._id)}/>} label={`${student.studentName||'Unknown'}`} sx={{width:'100%',alignSelf:'flex-start',mb:0.5,fontSize:'0.75rem',mr:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}/>
                                            {printMode === 'front' && (<div className="id-card" style={{border:'1px dashed #ccc'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/>)}
                                            {printMode === 'back' && (<div className="id-card" style={{border:'1px dashed #aaa'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/>)}
                                            {printMode === 'both' && (<div style={{display:'flex',flexDirection:'column',gap:'2mm'}}> <div className="id-card id-card-front" style={{border:'1px dashed #ccc'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/> <div className="id-card id-card-back" style={{border:'1px dashed #aaa'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/> </div>)}
                                        </Box>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </Box>
            <style jsx global>{`
                .screen-a4-pages-container { margin-top:20px; border:1px solid #e0e0e0; padding:15px; background-color:#f0f0f0; }
                .screen-a4-page { background-color:white; border:1px solid #bdbdbd; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin:0 auto 20px auto; padding:${layoutConstants.marginMM}mm; box-sizing:border-box; max-width:297mm; width:100%; overflow:hidden; }
                .screen-id-card-layout-area { display:flex !important; flex-wrap:wrap !important; flex-direction:row !important; justify-content:${layoutConstants.justifyContentPrint} !important; align-content:flex-start !important; align-items:flex-start !important; width:100% !important; height:100% !important; column-gap:${layoutConstants.colGapMM}mm !important; row-gap:${layoutConstants.rowGapMM}mm !important; box-sizing:border-box !important; overflow:hidden; }
                .screen-id-card-layout-area.preview-rtl { flex-direction:row-reverse !important; }
                .student-preview-wrapper-in-a4 { width:${CARD_WIDTH_MM}mm; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; padding:2px; }
                .student-preview-wrapper-in-a4 .id-card { width:${CARD_WIDTH_MM}mm !important; height:${CARD_HEIGHT_MM}mm !important; overflow:hidden !important; box-sizing:border-box !important; background-color:#fff; }
                .student-preview-wrapper-in-a4 .id-card-front { margin-bottom:1mm; }
            `}</style>
        </>
    );
};

export default IdCard;



// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import '../../App.css'; // Assuming this is still needed
// import {
//     Button, TextField, Typography, Box, CircularProgress,
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

// // Helper to chunk array for paged preview
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

// // Helper function to calculate layout parameters - ALWAYS LANDSCAPE
// const calculateLayoutConstants = (printMode) => { // Removed orientation parameter
//     const orientation = 'landscape'; // Hardcoded
//     const marginMM = 5;
//     const colGapMM = 1.75; // You had 5px in pageStyle, let's stick to mm for consistency
//     const rowGapMM = 5;

//     const pageStyleSize = 'A4 landscape'; // Hardcoded
//     const pagePhysicalWidth = 297;
//     const pagePhysicalHeight = 210;
//     const pageContentWidth = pagePhysicalWidth - (2 * marginMM); // 287mm
//     const pageContentHeight = pagePhysicalHeight - (2 * marginMM); // 200mm

//     const cardsPerRow = 5; // Fixed 5 card SLOTS horizontally for landscape
//     let rowsOfItems;
    
//     if (printMode === 'both') {
//         // For pairs, 1 row of pairs fits in landscape.
//         rowsOfItems = 1; 
//     } else {
//         // For single cards, 2 rows fit in landscape.
//         rowsOfItems = 2;
//     }

//     const printAreaActualWidth = (cardsPerRow * CARD_WIDTH_MM) + ((cardsPerRow - 1) * colGapMM);
//     const itemsPerPage = cardsPerRow * rowsOfItems;
//     const justifyContentPrint = 'flex-start'; // Always start for landscape

//     return {
//         orientation, // Still useful for preview aspect ratio if kept
//         pageStyleSize,
//         marginMM,
//         colGapMM,
//         rowGapMM,
//         cardsPerRow,
//         rowsOfItems,
//         printAreaActualWidth,
//         itemsPerPage,
//         previewAspectRatio: `${pagePhysicalWidth} / ${pagePhysicalHeight}`,
//         justifyContentPrint,
//     };
// };


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
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
//     // const [printOrientation, setPrintOrientation] = useState('landscape'); // REMOVED

//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const componentRef = useRef();

//     // --- Dynamic Layout Constants ---
//     const layoutConstants = useMemo(() => {
//         return calculateLayoutConstants(printMode); // Pass only printMode
//     }, [printMode]); // Dependency only on printMode

//     // --- Default Templates (Unchanged) ---
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
    
//     // --- Data Fetching and Processing Callbacks (Unchanged) ---
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

//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 setIdCardData(response.designFormats[0]);
//             } else {
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
//                 const filterStudent=response.students?.data?.filter((val)=>val?.isPrinted===false);
//                 console.log("filterStudentanand",filterStudent)
//                 setStudentData(filterStudent || []);
//                 // setStudentData(response.students.data || []);
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

//     useEffect(() => {
//         Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]);
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

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
//         setSelectedStudentIds(new Set());
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);
//     // const handlePrintOrientationChange = (e) => setPrintOrientation(e.target.value); // REMOVED

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
//     const decodedApiBackTemplate = useMemo(() => idCardData?.backTemplate ? decodeBase64(idCardData.backTemplate) : null, [idCardData, decodeBase64]);
//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;
    
//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         if (!template) return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>Missing Template</div>`;
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 const keys = cleanKey.split('.');
//                 let value = data;
//                 for (const k of keys) {
//                     if (value && typeof value === 'object' && k in value) value = value[k];
//                     else { value = data[cleanKey]; break; }
//                 }
//                 if (value === undefined || value === null || value === '') {
//                     const lowerKey = cleanKey.toLowerCase();
//                     if (lowerKey.includes('studentimage') || lowerKey.includes('fatherimage') || lowerKey.includes('motherimage') || lowerKey.includes('guardianimage')) return "https://i.pinimg.com/736x/7c/cb/01/7ccb010d8fddc4bcd84587ef3c34d100.jpg";
//                 }
//                 return String(value ?? '');
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             return `<div style='width:${CARD_WIDTH_MM}mm;height:${CARD_HEIGHT_MM}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;page-break-inside:avoid;box-sizing:border-box;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); 

//     const getStudentTemplateData = useCallback((student) => ({
//         backgroundImageFront: idCardData?.frontImage?.url || "",
//         backgroundImageBack: idCardData?.backImage?.url || "",
//         studentImage: student?.studentImage?.url,
//         name: student?.studentName?.toUpperCase() || '',
//         dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
//         class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
//         section: student?.section || '',
//         gender: student?.gender || '',
//         contact: student?.contact || '',
//         transport: student?.transport || '',
//         father_name: student?.fatherName?.toUpperCase() || '',
//         mother_name: student?.motherName?.toUpperCase() || '',
//         mobile: student?.contact || student?.parentContact || '',
//         address: student?.address || '',
//         session: student?.sessionName || session?.name || '', 
//         admissionNumber: student?.admissionNumber || '',
//         fatherImage: student?.fatherImage?.url,
//         motherImage: student?.motherImage?.url,
//         guardianImage: student?.guardianImage?.url,
//         guardianname: student?.guardianName || '',
//         parentContact: student?.parentContact || '',
//         rollNo: student?.rollNo || '',
//     }), [idCardData, session]);

//     const renderFrontTemplate = useCallback((s) => replacePlaceholders(frontTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageFront}, 'Front'), [getStudentTemplateData, frontTemplateToUse, replacePlaceholders]);
//     const renderBackTemplate = useCallback((s) => replacePlaceholders(backTemplateToUse, {...getStudentTemplateData(s), backgroundImage: getStudentTemplateData(s).backgroundImageBack}, 'Back'), [getStudentTemplateData, backTemplateToUse, replacePlaceholders]);

//     const studentsToPrint = useMemo(() => filteredStudentData.filter(s => s?._id && selectedStudentIds.has(s._id)), [filteredStudentData, selectedStudentIds]);

//     const generatePDF = useReactToPrint({
//         content: () => {
//             setIsLoader(true);
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area';
//             if (printMode === 'back') printContainer.classList.add('print-rtl');

//             studentsToPrint.forEach((student, index) => {
//                 let itemElement;
//                 if (printMode === 'front') {
//                     itemElement = document.createElement('div');
//                     itemElement.className = `id-card single-card-print card-${student._id}-front`;
//                     itemElement.innerHTML = renderFrontTemplate(student);
//                 } else if (printMode === 'back') {
//                     itemElement = document.createElement('div');
//                     itemElement.className = `id-card single-card-print card-${student._id}-back`;
//                     itemElement.innerHTML = renderBackTemplate(student);
//                 } else {
//                     itemElement = document.createElement('div');
//                     itemElement.className = `id-card-pair pair-${student._id}`;
//                     const frontDiv = document.createElement('div');
//                     frontDiv.className = 'id-card id-card-front';
//                     frontDiv.innerHTML = renderFrontTemplate(student);
//                     const backDiv = document.createElement('div');
//                     backDiv.className = 'id-card id-card-back';
//                     backDiv.innerHTML = renderBackTemplate(student);
//                     itemElement.appendChild(frontDiv); itemElement.appendChild(backDiv);
//                 }
//                 if (index > 0 && layoutConstants.itemsPerPage > 0 && index % layoutConstants.itemsPerPage === 0) {
//                     const pageBreak = document.createElement('div');
//                     pageBreak.style.pageBreakBefore = 'always';
//                     printContainer.appendChild(pageBreak);
//                 }
//                 printContainer.appendChild(itemElement);
//             });
//             if (studentsToPrint.length === 0) {
//                  const msgDiv = document.createElement('div');
//                  msgDiv.innerText = "No students selected.";
//                  msgDiv.style.textAlign = 'center'; msgDiv.style.width = '100%'; msgDiv.style.marginTop = '20px';
//                  printContainer.appendChild(msgDiv);
//             }
//             return printContainer;
//         },
//         documentTitle: `ID_Cards_${printMode}_${selectedClass||'All'}_${selectedSection||'All'}_${moment().format('YYYYMMDD')}`,
//         onAfterPrint: () => { setIsLoader(false); if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length} ID Card(s) prepared!`); },
//         pageStyle: `
//           @page {
//             size: A4 landscape; /* HARDCODED to landscape */
//             margin: ${layoutConstants.marginMM}mm;
//           }
//           @media print {
//             body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//             .id-card-print-area {
//               display: flex !important; flex-wrap: wrap !important; flex-direction: row !important;
//               justify-content: ${layoutConstants.justifyContentPrint} !important; 
//               align-items: flex-start !important; align-content: flex-start !important;
//               width: ${layoutConstants.printAreaActualWidth}mm !important;
//               column-gap:5px !important; /* Use colGapMM from constants */
//               row-gap: ${layoutConstants.rowGapMM}mm !important;
//               box-sizing: border-box !important;
//               margin: 0 auto !important; 
//             }
//             .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }
//             .id-card-pair, .single-card-print {
//                 page-break-inside: avoid !important; display: block !important; 
//                 width: ${CARD_WIDTH_MM}mm !important;
//                 margin: 0 !important; padding: 0 !important; border: none !important;
//                 box-sizing: border-box !important;
//             }
//             .id-card-pair { height: auto !important; }
//             .single-card-print { height: ${CARD_HEIGHT_MM}mm !important; overflow: hidden !important; }
//             .id-card-pair .id-card-front { margin-bottom: 1mm !important; }
//             .id-card {
//                 width: ${CARD_WIDTH_MM}mm !important; height: ${CARD_HEIGHT_MM}mm !important;
//                 overflow: hidden !important; border: none !important; 
//                 box-sizing: border-box !important; display: block !important; 
//                 background-color: transparent !important;
//             }
//             .no-print, .screen-only { display: none !important; }
//           }
//         `,
//     });

//     const classOptions = useMemo(() => classData.map(c => ({ label: c.className, value: c.className })), [classData]);
//     const sectionOptions = useMemo(() => (classData.find(c => c.className === selectedClass)?.sections || []).map(s => ({ label: s, value: s })), [classData, selectedClass]);
//     const isSelectAllChecked = useMemo(() => filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
//     const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
//     const pagedFilteredStudents = useMemo(() => chunkArray(filteredStudentData, layoutConstants.itemsPerPage > 0 ? layoutConstants.itemsPerPage : 1), [filteredStudentData, layoutConstants.itemsPerPage]);

//     return (
//         <>
//          <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID Cards (Landscape Only)"/>
//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 {/* Reduced filter bar size as orientation is removed */}
//                 <div className="no-print bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 items-center mb-3">
//                     <Box> <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData}/> </Box>
//                     <Box> <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section"/> </Box>
//                     <Box> <TextField fullWidth label="Filter by Name / Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}/> </Box>
//                     <Box> <FormControl fullWidth size="small" disabled={isLoadingData}> <InputLabel>Print Sides</InputLabel> <Select value={printMode} label="Print Sides" onChange={handlePrintModeChange}> <MenuItem value={'both'}>Both Sides</MenuItem> <MenuItem value={'front'}>Front Only</MenuItem> <MenuItem value={'back'}>Back Only</MenuItem> </Select> </FormControl> </Box>
//                     {/* Orientation Select REMOVED */}
//                     <Box> <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}> {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`} </Button> </Box>
//                 </div>
                       
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center' }}>
//                     {!isLoadingData && filteredStudentData.length > 0 && (<FormControlLabel control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange}/>} label={`Select All (${filteredStudentData.length} shown, ${layoutConstants.itemsPerPage > 0 ? layoutConstants.itemsPerPage : 'N/A'} per page)`} sx={{ width: '100%' }}/>)}
//                     {isLoadingData && (<Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', width:'100%' }}> <CircularProgress size={25} /><Typography sx={{ml:2}}>Loading...</Typography> </Box>)}
//                     {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (<Typography sx={{textAlign:'center', width:'100%', color:'text.secondary'}}>No students match filters.</Typography>)}
//                     {!isLoadingData && studentData.length === 0 && (<Typography sx={{textAlign:'center', width:'100%', color:'text.secondary'}}>No active students found.</Typography>)}
//                 </Box>

//                 <div className="screen-only screen-a4-pages-container">
//                     {!isLoadingData && pagedFilteredStudents.length === 0 && filteredStudentData.length > 0 && (<Typography sx={{textAlign:'center',width:'100%',fontStyle:'italic'}}>No students selected for preview.</Typography>)}
//                     {pagedFilteredStudents.map((pageStudents, pageIndex) => (
//                         <div key={`page-${pageIndex}`} className="screen-a4-page" style={{ aspectRatio: layoutConstants.previewAspectRatio }}> {/* Still uses aspect ratio from constants */}
//                             <div className={`screen-id-card-layout-area ${printMode === 'back' ? 'preview-rtl' : ''}`}>
//                                 {pageStudents.map((student) => {
//                                     if (!student || !student._id) return null;
//                                     const isSelected = selectedStudentIds.has(student._id);
//                                     return (
//                                         <Box key={student._id} className="student-preview-wrapper-in-a4" sx={{ border: isSelected ? `2px solid ${currentColor}` : `1px solid transparent`, backgroundColor: isSelected ? '#e6f7ff' : 'transparent' }}>
//                                             <FormControlLabel control={<Checkbox size="small" checked={isSelected} onChange={(e) => handleSelectSingleChange(e, student._id)}/>} label={`${student.studentName||'Unknown'}`} sx={{width:'100%',alignSelf:'flex-start',mb:0.5,fontSize:'0.75rem',mr:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}/>
//                                             {printMode === 'front' && (<div className="id-card" style={{border:'1px dashed #ccc'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/>)}
//                                             {printMode === 'back' && (<div className="id-card" style={{border:'1px dashed #aaa'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/>)}
//                                             {printMode === 'both' && (<div style={{display:'flex',flexDirection:'column',gap:'2mm'}}> <div className="id-card id-card-front" style={{border:'1px dashed #ccc'}} dangerouslySetInnerHTML={{__html:renderFrontTemplate(student)}}/> <div className="id-card id-card-back" style={{border:'1px dashed #aaa'}} dangerouslySetInnerHTML={{__html:renderBackTemplate(student)}}/> </div>)}
//                                         </Box>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </Box>
//             {/* Global styles remain largely the same, ensuring preview matches landscape */}
//             <style jsx global>{`
//                 .screen-a4-pages-container { margin-top:20px; border:1px solid #e0e0e0; padding:15px; background-color:#f0f0f0; }
//                 .screen-a4-page { background-color:white; border:1px solid #bdbdbd; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin:0 auto 20px auto; padding:${layoutConstants.marginMM}mm; box-sizing:border-box; max-width:297mm; width:100%; overflow:hidden; }
//                 .screen-id-card-layout-area { display:flex !important; flex-wrap:wrap !important; flex-direction:row !important; justify-content:${layoutConstants.justifyContentPrint} !important; align-content:flex-start !important; align-items:flex-start !important; width:100% !important; height:100% !important; column-gap:${layoutConstants.colGapMM}mm !important; row-gap:${layoutConstants.rowGapMM}mm !important; box-sizing:border-box !important; overflow:hidden; }
//                 .screen-id-card-layout-area.preview-rtl { flex-direction:row-reverse !important; }
//                 .student-preview-wrapper-in-a4 { width:${CARD_WIDTH_MM}mm; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; padding:2px; }
//                 .student-preview-wrapper-in-a4 .id-card { width:${CARD_WIDTH_MM}mm !important; height:${CARD_HEIGHT_MM}mm !important; overflow:hidden !important; box-sizing:border-box !important; background-color:#fff; }
//                 .student-preview-wrapper-in-a4 .id-card-front { margin-bottom:1mm; }
//             `}</style>
//         </>
//     );
// };

// export default IdCard;
