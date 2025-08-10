import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
import { useReactToPrint } from "react-to-print";
import '../../App.css';
import {
    Button, TextField, Typography, Box, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
} from "@mui/material";
import { ActiveStudents, AdminGetAllClasses, getdesignbonafideCertificate } from "../../Network/AdminApi"; // Adjust path if needed
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
import { toast } from "react-toastify";
import moment from "moment";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb"; // Adjust path if needed
import BreadcrumbList from "../../Dynamic/BreadcrumbList"; // Adjust path if needed

// --- A4 Dimensions & Margin (Constants) ---
const A4_MARGIN_MM = 0; // Margin for printing

// --- Fallback Card Dimensions (if parsing fails) ---
const FALLBACK_CARD_WIDTH_MM = 210; // Defaulting to A4 width for bonafide
const FALLBACK_CARD_HEIGHT_MM = 297; // Defaulting to A4 height for bonafide

// Default placeholder image string
const DEFAULT_PLACEHOLDER_IMAGE_SRC = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgcIBwgHBwcHBwoICAcHBw8ICQYKFREWFhURExMYHSggGBolGxMTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0NFQ8QDi0ZFRkrKysrKzc3Ky0rKysrLisrKzcrKysrKystKy0tKystKysrKysrKystKysrKysrKysrK//AABEIASsAqAMBEQACEQEDEQH/xAAYAAEBAQEBAAAAAAAAAAAAAAAAAQIDB//EABsQAQEAAwEBAQAAAAAAAAAAAAABAhEhQQMx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAGREBAQEAAwAAAAAAAAAAAAAAAAERAiFB/9oADAMBAAIRAxEAPwD3EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEtRFVQAAAAAAAAAAAAAAAAAAE9QVQAAAAAAAAAAAAAAAAAABlkaaAAAAAAAAAAAAAAAAAEiQVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAACoCgACeoKoAAAAAAAAAAAAAAAAAAAICgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAAAEiQVQAAAAABEQ2KqgAAAAAAAACUFAAAAAABKiJbqUDDqpGhoAAAAAAAAAAAAAAAAAQYzm5pYzWsZqHqxRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEt0gxfpN6Ws7talRpdgqgAAAAAAAAAAAAAAADGe7OEZrnj8+9OVOMzt1s4y0zjLvoOjQAAAAAAAAAAAAAAAAmkwxVAEiQVQAAAAAAAAAAQFAAAAAAEqUSfqDTQAAAAAAAAAAAAAAAAAAlShAVQAAAAB//2Q==";


const Bonafide = () => {
    // --- State Variables ---
    const [idCardData, setIdCardData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [classData, setClassData] = useState([]);
    const [filteredStudentData, setFilteredStudentData] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
    const [actualCardDimensions, setActualCardDimensions] = useState({
        width: FALLBACK_CARD_WIDTH_MM,
        height: FALLBACK_CARD_HEIGHT_MM,
        parsedSuccessfully: false,
    });
    const [photoFilter, setPhotoFilter] = useState('all'); // 'all', 'with_photo', 'without_photo'

    // --- Context and Refs ---
    const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
    const { currentColor, setIsLoader, isLoader } = useStateContext();
    const printContentRef = useRef();

    // --- Default Template ---
    const [defaultFrontTemplate] = useState(`
    <div style='width: 297mm; height: 210mm; background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat; position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
        <div style='margin-left: 10px; margin-top: 80px; width: 85px; height: 95px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute; background-color: #eee;'>
            <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student"/>
        </div>
        <div style='position: absolute; left: 10px; top: 70px; width: calc(54mm - 6px); font-family: sans-serif; '>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:blue; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
        </div>
        <div style='position: absolute; left: 113px; top: 85px; width: calc(54mm - 6px); font-family: sans-serif; '>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>NAME<span style="margin-left: 16px; font-weight: bold;">: \${name}</span></p>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>CLASS<span style="margin-left: 13px; font-weight: bold;">: \${class}</span></p>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>F.NAME<span style="margin-left: 9px; font-weight: bold;">: \${father_name}</span></p>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>Roll No.<span style="margin-left: 9px; font-weight: bold;">: \${rollNo}</span></p>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
            <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
        </div>
    </div>
    `);

    // --- Helper Functions ---
    const decodeBase64 = useCallback((encoded) => {
        try {
            if (!encoded || typeof encoded !== 'string') return null;
            let cleanEncoded = encoded.replace(/^"|"$/g, '').replace(/\\"/g, '"');
            return new TextDecoder('utf-8').decode(Uint8Array.from(atob(cleanEncoded), c => c.charCodeAt(0)));
        } catch (error) {
            console.error("Error decoding base64 string:", error, "Input:", encoded);
            return `<div style='border:1px solid red; padding:10px; color:red;'>Template Decode Error</div>`;
        }
    }, []);

    const parseCardDimensions = useCallback((templateString) => {
        if (!templateString || typeof templateString !== 'string') return null;
        const styleMatch = templateString.match(/<div[^>]*style=['"]([^'"]*)['"]/im);
        if (!styleMatch?.[1]) return null;
        const widthMatch = styleMatch[1].match(/width:\s*(\d+(\.\d+)?)\s*mm/i);
        const heightMatch = styleMatch[1].match(/height:\s*(\d+(\.\d+)?)\s*mm/i);
        if (widthMatch?.[1] && heightMatch?.[1]) {
            return { width: parseFloat(widthMatch[1]), height: parseFloat(heightMatch[1]) };
        }
        return null;
    }, []);

    // --- API Fetching ---
    const fetchTemplateAndData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            // Fetch Template
            const templateResponse = await getdesignbonafideCertificate();
            setIdCardData(templateResponse?.success && templateResponse?.designFormats?.length > 0 ? templateResponse.designFormats[0] : null);

            // Fetch Classes
            const classResponse = await AdminGetAllClasses();
            setClassData(classResponse?.success ? (classResponse.classes || []) : []);
            if (!classResponse?.success) toast.error(classResponse?.message || "Failed to fetch classes.");

            // Fetch Students
            if (session) {
                const studentResponse = await ActiveStudents(session);
                setStudentData(studentResponse?.success ? (studentResponse.students?.data || []) : []);
                if (!studentResponse?.success) toast.error(studentResponse?.message || "Failed to fetch students.");
            } else {
                toast.error("Session missing.");
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("An error occurred while loading data.");
        } finally {
            setIsLoadingData(false);
        }
    }, [session]);

    // --- Effects ---
    useEffect(() => { fetchTemplateAndData(); }, [fetchTemplateAndData]);

    const decodedApiFrontTemplate = useMemo(() => idCardData?.frontTemplate ? decodeBase64(idCardData.frontTemplate) : null, [idCardData, decodeBase64]);

    useEffect(() => {
        const templateToParse = decodedApiFrontTemplate || defaultFrontTemplate;
        const parsedDims = parseCardDimensions(templateToParse);
        setActualCardDimensions(parsedDims ?
            { ...parsedDims, parsedSuccessfully: true } :
            { width: FALLBACK_CARD_WIDTH_MM, height: FALLBACK_CARD_HEIGHT_MM, parsedSuccessfully: false }
        );
    }, [decodedApiFrontTemplate, defaultFrontTemplate, parseCardDimensions]);

    useEffect(() => {
        if (isLoadingData) return;
        let filtered = [...studentData];
        if (selectedClass) filtered = filtered.filter(s => s.class === selectedClass);
        if (selectedClass && selectedSection) filtered = filtered.filter(s => (s.section || '') === selectedSection);
        if (filterName) {
            const lower = filterName.toLowerCase().trim();
            if (lower) filtered = filtered.filter(s => s.studentName?.toLowerCase().includes(lower) || s.admissionNumber?.toString().toLowerCase().includes(lower));
        }
        if (photoFilter === 'with_photo') {
            filtered = filtered.filter(s => s.studentImage?.url && s.studentImage.url.trim() !== "" && s.studentImage.url !== DEFAULT_PLACEHOLDER_IMAGE_SRC);
        } else if (photoFilter === 'without_photo') {
            filtered = filtered.filter(s => !s.studentImage?.url || s.studentImage.url.trim() === "" || s.studentImage.url === DEFAULT_PLACEHOLDER_IMAGE_SRC);
        }
        setFilteredStudentData(filtered);
        setSelectedStudentIds(new Set());
    }, [selectedClass, selectedSection, filterName, studentData, isLoadingData, photoFilter]);

    // --- Event Handlers ---
    const handleFilterByNameChange = (e) => setFilterName(e.target.value);
    const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
    const handleSectionChange = (e) => setSelectedSection(e.target.value);
    const handlePhotoFilterChange = (e) => setPhotoFilter(e.target.value);
    const handleSelectAllChange = (event) => setSelectedStudentIds(event.target.checked ? new Set(filteredStudentData.filter(s => s._id).map(s => s._id)) : new Set());
    const handleSelectSingleChange = (event, studentId) => {
        if (!studentId) return;
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (event.target.checked) newSet.add(studentId); else newSet.delete(studentId);
            return newSet;
        });
    };

    // --- Template Rendering ---
    const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;

    const renderFrontTemplate = useCallback((student) => {
        if (!student) return frontTemplateToUse; // Return base template for placeholder
        const data = {
            backgroundImage: idCardData?.frontImage?.url || "",
            studentImage: student.studentImage?.url || DEFAULT_PLACEHOLDER_IMAGE_SRC,
            name: student?.studentName?.toUpperCase() || '',
            dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
            class: student?.class || '',
            section: student?.section || '',
            rollNo: student?.rollNo || '',
            admissionNumber: student?.admissionNumber || '',
            father_name: student?.fatherName?.toUpperCase() || '',
            mobile: student?.contact || student?.parentContact || '',
            address: student?.address || '',
            session: student?.session || session?.name || '',
        };
        return frontTemplateToUse.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
            const value = key.trim().split('.').reduce((obj, part) => obj && obj[part], data);
            return value !== undefined && value !== null ? String(value) : '';
        });
    }, [frontTemplateToUse, idCardData, session]);

    const studentsToPrint = useMemo(() => filteredStudentData.filter(s => s?._id && selectedStudentIds.has(s._id)), [filteredStudentData, selectedStudentIds]);

    const dynamicPageStyle = useMemo(() => `
        @page { 
            size: A4 landscape; 
            margin: ${A4_MARGIN_MM}mm; 
        }
        @media print { 
            html, body { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
            } 
            .no-print, .screen-only { display: none !important; } 
            .id-card-print-area {
                display: flex !important;
                flex-wrap: wrap !important;
                align-content: flex-start !important;
            }
            .print-item {
                page-break-inside: avoid !important;
                padding: 1mm; /* Gutter space for cutting */
                box-sizing: border-box;
            }
        }
    `, []);

    const generatePDF = useReactToPrint({
        content: () => {
            if (studentsToPrint.length === 0) { toast.info("No students selected."); return null; }
            setIsLoader(true);
            
            const printContainer = document.createElement('div');
            printContainer.className = 'id-card-print-area';
            printContentRef.current = printContainer;

            studentsToPrint.forEach(student => {
                const itemWrapper = document.createElement('div');
                itemWrapper.className = 'print-item';
                itemWrapper.innerHTML = renderFrontTemplate(student);
                printContainer.appendChild(itemWrapper);
            });
            return printContentRef.current;
        },
        documentTitle: `Bonafide_${selectedClass || 'All'}_${moment().format('YYYYMMDD')}`,
        onAfterPrint: () => { setIsLoader(false); if (studentsToPrint.length > 0) toast.success(`${studentsToPrint.length} items sent to printer!`); printContentRef.current = null; },
        onPrintError: (e) => { setIsLoader(false); toast.error("Printing failed."); console.error("Print Error:", e); printContentRef.current = null; },
        pageStyle: dynamicPageStyle,
    });

    const classOptions = useMemo(() => classData.map(c => ({ label: c.className, value: c.className })), [classData]);
    const sectionOptions = useMemo(() => selectedClass ? (classData.find(c => c.className === selectedClass)?.sections?.map(s => ({ label: s, value: s })) || []) : [], [classData, selectedClass]);
    const numFilteredStudentsWithId = useMemo(() => filteredStudentData.filter(s => s._id).length, [filteredStudentData]);
    const isSelectAllChecked = useMemo(() => numFilteredStudentsWithId > 0 && selectedStudentIds.size === numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);
    const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < numFilteredStudentsWithId, [numFilteredStudentsWithId, selectedStudentIds]);

    return (
        <>
            <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Generate Student Bonafide Certificate" />
            <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
                <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
                        <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData} />
                        <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder={!selectedClass ? "Class First" : "Section"} />
                        <TextField fullWidth id="filter-name" label="Filter Name/Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }} InputLabelProps={{ shrink: true }} />
                        {/* <FormControl fullWidth size="small" disabled={isLoadingData}>
                            <InputLabel>Photo Status</InputLabel>
                            <Select value={photoFilter} label="Photo Status" onChange={handlePhotoFilterChange}>
                                <MenuItem value={'all'}>All Students</MenuItem>
                                <MenuItem value={'with_photo'}>With Photo</MenuItem>
                                <MenuItem value={'without_photo'}>Without Photo</MenuItem>
                            </Select>
                        </FormControl> */}
                        <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}>{isLoader ? "Preparing..." : `Print (${selectedStudentIds.size})`}</Button>
                    </div>
                    {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, fontStyle: 'italic' }}>
                        Printing is set to A4 Landscape. Items will print at their actual size ({actualCardDimensions.width}mm x {actualCardDimensions.height}mm) and wrap onto the page.
                        {!actualCardDimensions.parsedSuccessfully && <span style={{ color: 'red', fontWeight: 'bold' }}> Warning: Using fallback dimensions. Check print preview.</span>}
                    </Typography> */}
                </Box>
                <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                    {isLoadingData && (<Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}><CircularProgress size={25} /><Typography sx={{ ml: 1 }}>Loading Students...</Typography></Box>)}
                    {!isLoadingData && numFilteredStudentsWithId > 0 && (<FormControlLabel control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange} />} label={`Select All (${numFilteredStudentsWithId})`} sx={{ mr: 'auto' }} />)}
                    {!isLoadingData && filteredStudentData.length === 0 && (<Typography sx={{ width: '100%', textAlign: 'center', color: 'text.secondary' }}>No students found matching the criteria.</Typography>)}
                </Box>

                <Box className="screen-only" sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'flex-start' }}>
                    {!isLoadingData && filteredStudentData.map((student) => {
                        const studentKey = student._id || student.admissionNumber || Math.random();
                        const isSelectable = !!student._id;
                        const isSelected = isSelectable && selectedStudentIds.has(studentKey);
                        
                        return (<Box key={studentKey} sx={{ border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd', borderRadius: '4px', p: 0.5, bgcolor: isSelected ? '#e6f7ff' : '#fff', opacity: isSelectable ? 1 : 0.6, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.2s ease', height: 'fit-content' }}>
                            <FormControlLabel 
                                control={<Checkbox size="small" checked={isSelected} onChange={(e) => handleSelectSingleChange(e, studentKey)} disabled={!isSelectable}/>} 
                                label={
                                    <Typography variant="body2" fontSize="0.8rem" noWrap textOverflow="ellipsis" maxWidth={`${actualCardDimensions.width}mm`}>
                                        {student.studentName || 'N/A'} ({student.admissionNumber || 'N/A'})
                                    </Typography>
                                } 
                                sx={{ width: '100%', mb: 0.5, mr: 0 }} 
                            />
                             {!isSelectable && <Typography variant="caption" color="error" sx={{ mb: 0.5 }}>Cannot select (Missing ID)</Typography>}
                            <div 
                                style={{ border: '1px dashed #ccc', width: `${actualCardDimensions.width}mm`, height: `${actualCardDimensions.height}mm`, overflow: 'hidden', boxSizing: 'border-box' }} 
                                dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} 
                            />
                        </Box>);
                    })}
                </Box>
            </Box>
        </>
    );
};

export default Bonafide;


// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import '../../App.css';
// import {
//     Button, TextField, Typography, Box, CircularProgress,
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getdesignbonafideCertificate } from "../../Network/AdminApi"; // Adjust path if needed
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
// const FALLBACK_CARD_WIDTH_MM = 210; // Default if template is 54x86
// const FALLBACK_CARD_HEIGHT_MM = 297;
// // const FALLBACK_CARD_WIDTH_MM = 54; // Default if template is 54x86
// // const FALLBACK_CARD_HEIGHT_MM = 86;

// // Default placeholder image string (ensure it matches what's used if you want to specifically exclude it)
// const DEFAULT_PLACEHOLDER_IMAGE_SRC = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgcIBwgHBwcHBwoICAcHBw8ICQYKFREWFhURExMYHSggGBolGxMTITEhJSkrLi4uFx8zODMsNygtLisBCgoKDQ0NFQ8QDi0ZFRkrKysrKzc3Ky0rKysrLisrKzcrKysrKystKy0tKystKysrKysrKystKysrKysrKysrK//AABEIASsAqAMBEQACEQEDEQH/xAAYAAEBAQEBAAAAAAAAAAAAAAAAAQIDB//EABsQAQEAAwEBAQAAAAAAAAAAAAABAhEhQQMx/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAGREBAQEAAwAAAAAAAAAAAAAAAAERAiFB/9oADAMBAAIRAxEAPwD3EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEtRFVQAAAAAAAAAAAAAAAAAAE9QVQAAAAAAAAAAAAAAAAAABlkaaAAAAAAAAAAAAAAAAAEiQVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAACoCgACeoKoAAAAAAAAAAAAAAAAAAAICgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARBVAAAAAAAAAAAAAAAAAAAEiQVQAAAAABEQ2KqgAAAAAAAACUFAAAAAABKiJbqUDDqpGhoAAAAAAAAAAAAAAAAAQYzm5pYzWsZqHqxRQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEt0gxfpN6Ws7talRpdgqgAAAAAAAAAAAAAAADGe7OEZrnj8+9OVOMzt1s4y0zjLvoOjQAAAAAAAAAAAAAAAAmkwxVAEiQVQAAAAAAAAAAQFAAAAAAEqUSfqDTQAAAAAAAAAAAAAAAAAAlShAVQAAAAB//2Q==";


// const Bonafide = () => {
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
//     const [photoFilter, setPhotoFilter] = useState('all'); // 'all', 'with_photo', 'without_photo'


//     // --- Context and Refs ---
//     const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []);
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const componentRef = useRef();
//     const printContentRef = useRef();

//     // --- Default Templates ---
//     const [defaultFrontTemplate] = useState(`
//     <div style='width: 297mm; height: 210mm; background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat; position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
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
//             const response = await getdesignbonafideCertificate();
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
//             if(response?.success){
//                  const filterStudent=response.students?.data?.filter((val)=>val?.isPrinted===false);
//                 setStudentData(filterStudent || []);
//             }
//             else{
//                 toast.error(response?.message || "Failed to fetch students.");
//                 setStudentData([]); // Ensure studentData is an empty array on failure
//             }
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
//         if (defaultFrontTemplate.includes("width: 971mm") && defaultFrontTemplate.includes("height: 210mm")) { newFallbackWidth = 297; newFallbackHeight = 210; }
//         else if (defaultFrontTemplate.includes("width: 297mm") && defaultFrontTemplate.includes("height: 210mm")) { newFallbackWidth = 297; newFallbackHeight = 210; }
//         if (templateToParse) {
//             const parsedDims = parseCardDimensions(templateToParse);
//             setActualCardDimensions(parsedDims ? { ...parsedDims, parsedSuccessfully: true } : { width: newFallbackWidth, height: newFallbackHeight, parsedSuccessfully: false });
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

//         // Apply photo filter
//         if (photoFilter === 'with_photo') {
//             filtered = filtered.filter(s => s.studentImage && s.studentImage.url && s.studentImage.url.trim() !== "" && s.studentImage.url !== DEFAULT_PLACEHOLDER_IMAGE_SRC);
//         } else if (photoFilter === 'without_photo') {
//             filtered = filtered.filter(s => !s.studentImage || !s.studentImage.url || s.studentImage.url.trim() === "" || s.studentImage.url === DEFAULT_PLACEHOLDER_IMAGE_SRC);
//         }

//         setFilteredStudentData(filtered); 
//         setSelectedStudentIds(new Set());
//      }, [selectedClass, selectedSection, filterName, studentData, isLoadingData, photoFilter]); // Added photoFilter

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);
//     const handleOrientationChange = (e) => setPrintOrientation(e.target.value);
//     const handlePhotoFilterChange = (e) => setPhotoFilter(e.target.value); // New handler
//     const handleSelectAllChange = (event) => { setSelectedStudentIds(event.target.checked ? new Set(filteredStudentData.filter(s => s._id).map(s => s._id)) : new Set()); };
//     const handleSelectSingleChange = (event, studentId) => { if (!studentId) return; setSelectedStudentIds(prev => { const n = new Set(prev); if (event.target.checked) n.add(studentId); else n.delete(studentId); return n; }); };

//     // --- Template Rendering Logic ---
//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
  

//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         const cardWidth = actualCardDimensions.width; const cardHeight = actualCardDimensions.height;
//         if (!template) return `<div style='width:${cardWidth}mm;height:${cardHeight}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;box-sizing:border-box;background-color:#ffebee;'>Missing ${cardSide} Template</div>`;
//         let html = template;
//         try {
//             html = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const k = key.trim(); let v = data;
//                 if (k.includes('.')) v = k.split('.').reduce((o, i) => (o && o[i] !== undefined) ? o[i] : undefined, data); else v = data.hasOwnProperty(k) ? data[k] : undefined;
//                 if (v === undefined || v === null || v === '') { 
//                     const lk = k.toLowerCase(); 
//                     if (lk.includes('image')) { // Simplified placeholder for any image type if not found
//                         if (lk === 'studentimage' || lk === 'fatherimage' || lk === 'motherimage' || lk === 'guardianimage') {
//                             return DEFAULT_PLACEHOLDER_IMAGE_SRC; // Use consistent placeholder
//                         }
//                         return `https://via.placeholder.com/60x70.png?text=${lk.replace('image','').toUpperCase() || 'N/A'}`;
//                     }
//                     return ''; 
//                 }
//                 return String(v);
//             });
//         } catch (e) { html = `<div style='width:${cardWidth}mm;height:${cardHeight}mm;border:1px solid red;display:flex;align-items:center;justify-content:center;font-size:8pt;color:red;box-sizing:border-box;background-color:#ffebee;'>${cardSide} Render Error</div>`; }
//         return html;
//      }, [actualCardDimensions]);

//     const renderCommonTemplate = (student, template, side) => {
//         if (!student) return replacePlaceholders(template, {}, side);
//         const data = {
//              backgroundImage: idCardData?.[`${side.toLowerCase()}Image`]?.url || "", 
//              studentImage: student.studentImage?.url || DEFAULT_PLACEHOLDER_IMAGE_SRC, 
//              name: student?.studentName?.toUpperCase() || '',
//              dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '', 
//              class: student?.class || '',
//              section: student?.section || '', gender: student?.gender || '', contact: student?.contact || '', 
//              transport: student?.transport || '', rollNo: student?.rollNo || '', 
//              admissionNumber: student?.admissionNumber || '', 
//              father_name: student?.fatherName?.toUpperCase() || '', 
//              mother_name: student?.motherName?.toUpperCase() || '',
//              guardianname: student?.guardianName || '', 
//              mobile: student?.contact || student?.parentContact || '', 
//              parentContact: student?.parentContact || '', 
//              address: student?.address || '',
//              session: student?.session || session?.name || '', 
//              fatherImage: student.fatherImage?.url || DEFAULT_PLACEHOLDER_IMAGE_SRC, 
//              motherImage: student.motherImage?.url || DEFAULT_PLACEHOLDER_IMAGE_SRC, 
//              guardianImage: student.guardianImage?.url || DEFAULT_PLACEHOLDER_IMAGE_SRC,
//          };
//         return replacePlaceholders(template, data, side);
//     };
//     const renderFrontTemplate = useCallback((s) => renderCommonTemplate(s, frontTemplateToUse, 'Front'), [idCardData, frontTemplateToUse, replacePlaceholders, session, renderCommonTemplate]);
 
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
//             min-height: ${printableHeightMM.toFixed(2)}mm !important;
//             box-sizing: border-box !important; 
//             overflow: visible !important; 
//             align-content: flex-start !important; 
//           }
//           .id-card-print-area.print-rtl { flex-direction: row-reverse !important; }
//           .print-item { 
//             width: ${cellWidthMM.toFixed(2)}mm !important; height: ${cellHeightMM.toFixed(2)}mm !important; 
//             display: flex !important; justify-content: center !important; align-items: center !important; 
//             box-sizing: border-box !important; overflow: hidden !important; page-break-inside: avoid !important; 
//             padding: 0.5mm !important; 
//           }
//           .print-item > div {
//             max-width: 100% !important; max-height: 100% !important; 
//             margin: 0 !important; box-sizing: border-box !important; 
//           }
//           .print-item > .card-pair-wrapper { 
//             display: flex !important; flex-direction: column !important; 
//             justify-content: center !important; align-items: center !important; 
//             width: 100%; height: 100%; gap: 0.2mm; 
//           }
//           .print-item > .card-pair-wrapper > div { 
//             max-width: 100% !important; 
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
//             setIsLoader(true); const ITEMS_PER_PAGE = 10; // This constant should match the layout logic (numCols * numRows)
//             const printContainer = document.createElement('div'); printContainer.className = 'id-card-print-area';
//             if (printMode === 'back' && (printOrientation === 'landscape' || printOrientation === 'portrait')) printContainer.classList.add('print-rtl');
//             printContentRef.current = printContainer;

//             studentsToPrint.forEach((student, index) => {
//                 if (!student || !student._id) return;
//                 const itemElement = document.createElement('div'); itemElement.className = `print-item item-${student._id}`;
//                 let contentForCell;
//                 if (printMode === 'front') { const d = document.createElement('div'); d.innerHTML = renderFrontTemplate(student).trim(); contentForCell = d.firstChild; }
//                 else { contentForCell = document.createElement('div'); contentForCell.className = 'card-pair-wrapper';
//                     const f = document.createElement('div'); f.innerHTML = renderFrontTemplate(student).trim(); if (f.firstChild) contentForCell.appendChild(f.firstChild);
//                 }
//                 if (contentForCell) itemElement.appendChild(contentForCell); else itemElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;border:1px solid red;font-size:7pt;">Err</div>`;
//                 // Page break logic: Check if this is the last item on a page (excluding the very last item of all)
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
//                     {/* Adjusted grid for the new filter: lg:grid-cols-7 */}
//                     <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
//                         <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData} />
//                         <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder={!selectedClass ? "Class First" : "Section"} />
//                         <TextField fullWidth id="filter-name" label="Filter Name/Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' } }} InputLabelProps={{ shrink: true }} />
//                         {/* New Photo Filter */}
//                         <FormControl fullWidth size="small" disabled={isLoadingData}>
//                             <InputLabel>Photo Status</InputLabel>
//                             <Select value={photoFilter} label="Photo Status" onChange={handlePhotoFilterChange}>
//                                 <MenuItem value={'all'}>All Students</MenuItem>
//                                 <MenuItem value={'with_photo'}>With Photo</MenuItem>
//                                 <MenuItem value={'without_photo'}>Without Photo</MenuItem>
//                             </Select>
//                         </FormControl>
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
//                             </Box>);
//                         })}
//                     </Box>
//                 </Box>
//             </Box>
//         </>
//     );
// };

// export default Bonafide;