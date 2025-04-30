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

// --- Constants ---
const CARD_WIDTH_MM = 54;
const CARD_HEIGHT_MM = 86;
const ITEMS_PER_PRINT_PAGE = 10; // Max items (single cards or pairs) per printed page

const IdCard = () => {
    // --- State Variables ---
    const [idCardData, setIdCardData] = useState(null); // Holds fetched template design
    const [studentData, setStudentData] = useState([]); // All active students
    const [classData, setClassData] = useState([]); // All classes for filtering
    const [filteredStudentData, setFilteredStudentData] = useState([]); // Students matching filters
    const [filterName, setFilterName] = useState(""); // Name/Adm No filter input
    const [selectedClass, setSelectedClass] = useState(""); // Selected class filter
    const [selectedSection, setSelectedSection] = useState(""); // Selected section filter
    const [isLoadingData, setIsLoadingData] = useState(true); // Loading state for initial data fetch
    const [printMode, setPrintMode] = useState('both'); // 'front', 'back', or 'both'
    const [selectedStudentIds, setSelectedStudentIds] = useState(new Set()); // IDs of students checked for printing

    // --- Context and Refs ---
    const session = useMemo(() => JSON.parse(localStorage.getItem("session")), []); // Get session data once
    const { currentColor, setIsLoader, isLoader } = useStateContext(); // Context for theme color and print loading state
    const componentRef = useRef(); // Optional ref for the entire component

    // --- Default Templates (Fallbacks if API fails or no template exists) ---
    const [defaultFrontTemplate] = useState(`
    <div style='background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
      <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
      <div style='position: relative; z-index: 2; padding: 5px;'>
          <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'><h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3><p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p></div>
          <div style='margin: 0 auto; margin-top: 5px; width: 30mm; height: 35mm; border: 1px solid #aaa; border-radius: 4px; overflow: hidden; background-color: #eee; display: flex; justify-content: center; align-items: center;'><img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/></div>
          <div style='margin-top: 8mm; padding-left: 2mm; padding-right: 2mm;'>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>CLASS<span style="float: right;">: \${class}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span></p>
            <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>DOB<span style="float: right;">: \${dob}</span></p>
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
            <div><img src='\${fatherImage}' alt="Father" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Father</p></div>
            <div><img src='\${motherImage}' alt="Mother" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Mother</p></div>
            <div><img src='\${guardianImage}' alt="Guardian" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/><p style='font-size: 6pt; margin: 0; font-weight: bold;'>Guardian</p></div>
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

    // --- Helper Functions ---
    const decodeBase64 = useCallback((encoded) => {
        try {
            if (!encoded || typeof encoded !== 'string') { return null; }
            let cleanEncoded = encoded;
            // Attempt to fix potential double encoding or extra quotes
            if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
                cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
            }
            cleanEncoded = cleanEncoded.replace(/\\"/g, '"'); // Handle escaped quotes

            const binaryString = window.atob(cleanEncoded);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch (error) {
            console.error("Error decoding base64 string:", error);
            return null; // Return null indicating failure
        }
    }, []);

    // --- API Fetching ---
    const fetchTemplate = useCallback(async () => {
        try {
            const response = await getIDcarddesign();
            if (response?.success && response?.designFormats?.length > 0) {
                setIdCardData(response.designFormats[0]);
            } else {
                console.warn("No custom ID card design found. Using default.");
                setIdCardData(null); // Use null to signify using default
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
    }, [session]); // Dependency: session

    // --- Effects ---
    // Initial data fetch on component mount
    useEffect(() => {
        Promise.all([fetchTemplate(), fetchAllClasses(), fetchAllStudents()]);
    }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

    // Apply filters whenever filter criteria or base student data changes
    useEffect(() => {
        if (isLoadingData) return; // Wait for initial load

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
        // Reset selections when filters change to avoid confusion
        setSelectedStudentIds(new Set());
    }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

    // --- Event Handlers ---
    const handleFilterByNameChange = (e) => setFilterName(e.target.value);
    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
        setSelectedSection(""); // Reset section when class changes
    };
    const handleSectionChange = (e) => setSelectedSection(e.target.value);
    const handlePrintModeChange = (e) => setPrintMode(e.target.value);

    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            // Select only students currently visible in the filtered list who have an ID
            const allFilteredIds = new Set(filteredStudentData.map(student => student._id).filter(Boolean));
            setSelectedStudentIds(allFilteredIds);
        } else {
            setSelectedStudentIds(new Set());
        }
    };

    const handleSelectSingleChange = (event, studentId) => {
        if (!studentId) return; // Ignore if ID is missing
        const isChecked = event.target.checked;
        setSelectedStudentIds(prevSelectedIds => {
            const newSelectedIds = new Set(prevSelectedIds); // Clone the set
            if (isChecked) {
                newSelectedIds.add(studentId);
            } else {
                newSelectedIds.delete(studentId);
            }
            return newSelectedIds;
        });
    };

    // --- Template Rendering Logic ---
    // Memoize decoded templates to avoid decoding on every render
    const decodedApiFrontTemplate = useMemo(() => {
        if (!idCardData?.frontTemplate) return null;
        return decodeBase64(idCardData.frontTemplate);
    }, [idCardData, decodeBase64]);

    const decodedApiBackTemplate = useMemo(() => {
        if (!idCardData?.backTemplate) return null;
        return decodeBase64(idCardData.backTemplate);
    }, [idCardData, decodeBase64]);

    // Determine which template to use (API or default)
    const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
    const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

    // Function to replace placeholders in a template string
    const replacePlaceholders = useCallback((template, data, cardSide) => {
        if (!template) {
             console.error(`Template for ${cardSide} side is missing or invalid.`);
             return `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>Missing Template</div>`;
        }
        let renderedHtml = template;
        try {
            // Regex to find placeholders like ${key}, ${ key }, ${key.nested}, etc.
            renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
                const cleanKey = key.trim();
                const keys = cleanKey.split('.');
                let value = data;

                // Traverse nested keys if needed (e.g., studentImage.url)
                for (const k of keys) {
                    if (value && typeof value === 'object' && k in value) {
                        value = value[k];
                    } else {
                        // If path breaks, check top-level key as a fallback
                        value = data.hasOwnProperty(cleanKey) ? data[cleanKey] : undefined;
                        break;
                    }
                }

                // Gracefully handle missing image URLs with placeholders
                if (value === undefined || value === null || value === '') {
                    const lowerKey = cleanKey.toLowerCase();
                    if (lowerKey.includes('studentimage')) return "https://via.placeholder.com/85x95.png?text=No+Image";
                    if (lowerKey.includes('fatherimage') || lowerKey.includes('motherimage') || lowerKey.includes('guardianimage')) return "https://via.placeholder.com/60x70.png?text=N/A";
                }

                // Return the value found, or an empty string if null/undefined
                return String(value ?? '');
            });
        } catch (error) {
            console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
            renderedHtml = `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
        }
        return renderedHtml;
    }, []); 
    const renderFrontTemplate = useCallback((student) => {
    console.log("student",student)

        const data = {
            backgroundImage: idCardData?.frontImage?.url || "", // Use API background or empty
            studentImage: student?.studentImage?.url, // Placeholder handled by replacePlaceholders
            name: student?.studentName?.toUpperCase() || '',
            dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
            class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
            section: student?.section || '',
            gender: student?.gender || '',
            contact: student?.contact || '',
            transport: student?.transport || '',
            father_name: student?.fatherName?.toUpperCase() || '',
            mother_name: student?.motherName?.toUpperCase() || '',
            mobile: student?.contact || student?.parentContact || '', // Prioritize student contact
            address: student?.address || '',
            session: student?.session || session?.name || '', // Use student session or fallback to current
            admissionNumber: student?.admissionNumber || '',
            backgroundImage: idCardData?.backImage?.url || "", // Use API background or empty
            fatherImage: student?.fatherImage?.url, // Placeholder handled by replacePlaceholders
            motherImage: student?.motherImage?.url, // Placeholder handled by replacePlaceholders
            guardianImage: student?.guardianImage?.url, // Placeholder handled by replacePlaceholders
            session: student?.session || session?.name || '', // Use student session or fallback
            admissionNumber: student?.admissionNumber || '',
            guardianname: student?.guardianName || '',
            parentContact: student?.parentContact || '', // Primary contact on back might be parent
            address: student?.address || '', // Address might be relevant on back too
          };
          return replacePlaceholders(frontTemplateToUse, data, 'Front');
    }, [idCardData, frontTemplateToUse, replacePlaceholders, session]);

    const renderBackTemplate = useCallback((student) => {
        const data = {
            backgroundImage: idCardData?.backImage?.url || "", // Use API background or empty
            fatherImage: student?.fatherImage?.url, // Placeholder handled by replacePlaceholders
            motherImage: student?.motherImage?.url, // Placeholder handled by replacePlaceholders
            guardianImage: student?.guardianImage?.url, // Placeholder handled by replacePlaceholders
            session: student?.session || session?.name || '', // Use student session or fallback
            admissionNumber: student?.admissionNumber || '',
            guardianname: student?.guardianName || '',
            parentContact: student?.parentContact || '', // Primary contact on back might be parent
            address: student?.address || '', // Address might be relevant on back too
            studentImage: student?.studentImage?.url, // Placeholder handled by replacePlaceholders
            name: student?.studentName?.toUpperCase() || '',
            dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : '',
            class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : '',
            section: student?.section || '',
            gender: student?.gender || '',
            contact: student?.contact || '',
            transport: student?.transport || '',
            father_name: student?.fatherName?.toUpperCase() || '',
            mother_name: student?.motherName?.toUpperCase() || '',
            mobile: student?.contact || student?.parentContact || '', // Prioritize student contact
            address: student?.address || '',
            session: student?.session || session?.name || '', // Use student session or fallback to current
            admissionNumber: student?.admissionNumber || '',
          };
          return replacePlaceholders(backTemplateToUse, data, 'Back');
    }, [idCardData, backTemplateToUse, replacePlaceholders, session]);

    // --- Students to Print Calculation ---
    // Memoize the list of students to be printed based on selection
    const studentsToPrint = useMemo(() => {
        // Filter the currently *filtered* list to include only those whose IDs are selected
        return filteredStudentData.filter(student => student?._id && selectedStudentIds.has(student._id));
    }, [filteredStudentData, selectedStudentIds]);

    // --- Printing Hook Setup ---
    const generatePDF = useReactToPrint({
        // Dynamically generate the content to be printed
        content: () => {
            setIsLoader(true); // Show loading indicator during generation
            const printContainer = document.createElement('div');
            printContainer.className = 'id-card-print-area'; // Base class for print layout

            // Add 'print-rtl' class if printing back side only for RTL layout
            if (printMode === 'back') {
                printContainer.classList.add('print-rtl');
            }

            // Iterate over only the selected students
            studentsToPrint.forEach((student, index) => {
                const studentKey = student._id; // Use unique ID
                let itemElement; // Holds the DOM element for the current student item

                // Create the appropriate element (single card or pair) based on printMode
                if (printMode === 'front') {
                    const cardDiv = document.createElement('div');
                    // Apply classes for styling and targeting if needed
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
                    pairDiv.className = `id-card-pair pair-${studentKey}`; // Container for front/back

                    const frontDiv = document.createElement('div');
                    frontDiv.className = 'id-card id-card-front'; // Class for potential front-specific styles
                    frontDiv.innerHTML = renderFrontTemplate(student);

                    const backDiv = document.createElement('div');
                    backDiv.className = 'id-card id-card-back'; // Class for potential back-specific styles
                    backDiv.innerHTML = renderBackTemplate(student);

                    pairDiv.appendChild(frontDiv);
                    pairDiv.appendChild(backDiv);
                    itemElement = pairDiv;
                }

                // --- Page Break Logic ---
                // Add CSS to force a page break after every N items, except the very last item
                if ((index + 1) % ITEMS_PER_PRINT_PAGE === 0 && index < studentsToPrint.length - 1) {
                    itemElement.style.pageBreakAfter = 'always';
                }
                // --- End Page Break Logic ---

                printContainer.appendChild(itemElement); // Add the student's card/pair to the print container
            });

            // Handle case where no students were selected for printing
            if (studentsToPrint.length === 0) {
                 const messageDiv = document.createElement('div');
                 messageDiv.innerText = "No students selected for printing.";
                 messageDiv.style.width = '100%';
                 messageDiv.style.textAlign = 'center';
                 messageDiv.style.marginTop = '20px';
                 messageDiv.style.pageBreakInside = 'avoid'; // Prevent message splitting
                 printContainer.appendChild(messageDiv);
             }

            return printContainer; // Return the fully constructed DOM element for printing
        },
        documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
        // Trigger loading state changes before/after print dialog interaction
        onBeforeGetContent: () => Promise.resolve(), // Already handling loader in content()
        onAfterPrint: () => {
            setIsLoader(false); // Turn off loading indicator
            if (studentsToPrint.length > 0) {
                toast.success(`${studentsToPrint.length} ID Card(s) prepared!`);
            }
            // Optionally, you could add a toast if printing was cancelled or empty:
            // else { toast.info("Printing cancelled or no students selected."); }
        },
        // Define the CSS styles specifically for the print media
        pageStyle: `
          @page {
            size: A4 landscape; /* Set page orientation */
            margin: 10mm; /* Define page margins */
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important; /* Force printing of background colors/images in Chrome/Safari */
              print-color-adjust: exact !important; /* Standard property for background printing */
            }

            /* --- Layout Container --- */
            /* Default LTR layout */
            .id-card-print-area {
              display: flex !important; /* Use flexbox for layout */
              flex-wrap: wrap !important; /* Allow items to wrap to the next line */
              flex-direction: row !important; /* Default direction: Left-to-Right */
              justify-content: flex-start !important; /* Align items starting from the left */
              align-items: flex-start !important; /* Align items to the top of the container */
              width: 277mm !important; /* Printable width: A4 landscape (297mm) - 2*margin (10mm) */
              column-gap: 1.75mm !important; /* Horizontal gap between columns (adjust based on item count) */
              row-gap: 5mm !important; /* Vertical gap between rows */
            }

            /* RTL layout override for 'Back Only' printing */
            .id-card-print-area.print-rtl {
              flex-direction: row-reverse !important; /* Change flow direction to Right-to-Left */
              /* justify-content: flex-start; still works correctly, aligning items to the right edge in RTL */
            }

            /* --- Individual Item Containers (Pair or Single Card) --- */
            .id-card-pair, .single-card-print {
                page-break-inside: avoid !important; /* CRITICAL: Prevent items from being split across page breaks */
                display: block !important; /* Ensure items behave as blocks in the flex layout */
                width: ${CARD_WIDTH_MM}mm !important; /* Set the fixed width of each item */
                margin: 0 !important; /* Use gap for spacing, not margin */
                padding: 0 !important;
                border: none !important; /* Remove borders for final print */
                box-sizing: border-box !important; /* Include padding/border in width/height */
                /* page-break-after is applied dynamically via JS */
            }
            .id-card-pair { height: auto !important; } /* Pair height depends on its content (front + back + gap) */
            .single-card-print { height: ${CARD_HEIGHT_MM}mm !important; overflow: hidden !important; } /* Single card has fixed height */

            /* Small gap between front and back cards within a pair */
            .id-card-pair .id-card-front { margin-bottom: 1mm !important; }

            /* --- Actual Card Content Divs --- */
             .id-card {
                width: ${CARD_WIDTH_MM}mm !important; /* Ensure inner divs also have correct dimensions */
                height: ${CARD_HEIGHT_MM}mm !important;
                overflow: hidden !important; /* Hide content that exceeds card boundaries */
                border: none !important;
                box-sizing: border-box !important;
                display: block !important;
                background-color: transparent !important; /* Allow template background images/colors to show */
             }

            /* --- Hide Screen-Only Elements --- */
            .no-print, .screen-only { display: none !important; }
          }
        `,
    });

    // --- Options for Select Components ---
    // Memoize options to prevent recalculation on every render
    const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);

    const sectionOptions = useMemo(() => {
        const selectedClassObj = classData.find(cls => cls.className === selectedClass);
        // Ensure sections exist and map them, otherwise return empty array
        return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
    }, [classData, selectedClass]);

    // --- Selection State Calculation ---
    // Determine if the "Select All" checkbox should be checked or indeterminate
    const isSelectAllChecked = useMemo(() => filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length, [filteredStudentData, selectedStudentIds]);
    const isSelectAllIndeterminate = useMemo(() => selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length, [filteredStudentData, selectedStudentIds]);

    // --- JSX ---
    return (
        <>
        <h2 className="py-1">
        Generate Student ID Cards
        </h2>
            <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
                {/* Page Title */}
                {/* <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Generate Student ID Cards
                </Typography> */}

                {/* Filter Controls Area */}
                <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Class Filter */}
                        <Grid item xs={12} sm={6} md={3} lg={2}>
                            <ReactSelect
                                name="class"
                                value={selectedClass}
                                handleChange={handleClassChange}
                                label="Class"
                                dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
                                placeholder="Select Class"
                                isDisabled={isLoadingData} // Disable while loading initial data
                            />
                        </Grid>
                        {/* Section Filter */}
                        <Grid item xs={12} sm={6} md={3} lg={2}>
                            <ReactSelect
                                name="section"
                                value={selectedSection}
                                handleChange={handleSectionChange}
                                label="Section"
                                dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
                                // Disable if no class selected, no sections available, or loading
                                disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData}
                                placeholder="Select Section"
                            />
                        </Grid>
                        {/* Name/Adm No Filter */}
                        <Grid item xs={12} sm={6} md={3} lg={3}>
                            <TextField
                                fullWidth
                                id="filter-name"
                                label="Filter by Name / Adm. No."
                                variant="outlined"
                                onChange={handleFilterByNameChange}
                                value={filterName}
                                size="small" // Match height of ReactSelect if needed
                                disabled={isLoadingData}
                            />
                        </Grid>
                        {/* Print Mode Selector */}
                        <Grid item xs={6} sm={3} md={3} lg={2}>
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
                        </Grid>
                        {/* Print Button */}
                        <Grid item xs={6} sm={3} md={12} lg={3}> {/* Spans full width on medium */}
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={generatePDF}
                                style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} // Consistent height
                                // Disable if nothing selected, or initial loading, or print prep ongoing
                                disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader}
                                startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null} // Show spinner when printing
                            >
                                {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {/* Select All / Loading Indicator / Info Message Area */}
                <Box className="no-print" sx={{ mb: 2, minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                    {/* Show Select All only when not loading and there are filter results */}
                    {!isLoadingData && filteredStudentData.length > 0 && (
                        <FormControlLabel
                            control={<Checkbox
                                checked={isSelectAllChecked}
                                indeterminate={isSelectAllIndeterminate}
                                onChange={handleSelectAllChange}
                            />}
                            label={`Select All (${filteredStudentData.length} shown)`}
                            sx={{ width: '100%' }} // Take full width for alignment
                        />
                    )}
                    {/* Show loading indicator during initial data fetch */}
                    {isLoadingData && (
                         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                             <CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography>
                         </Box>
                    )}
                    {/* Show message if filters result in no students */}
                    {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (
                         <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
                            No students match the current filters.
                         </Typography>
                    )}
                    {/* Show message if no student data was loaded at all */}
                    {!isLoadingData && studentData.length === 0 && (
                         <Typography sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
                            No active students found. Please check student records.
                         </Typography>
                    )}
                </Box>

                {/* On-Screen Preview Area (This section is HIDDEN during printing) */}
                {/* It uses the 'screen-only' class and print content is generated separately */}
                <div>
                    <Box
                        className="screen-only"
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '15px', // Visual spacing for the preview grid
                            // Conditional layout for the PREVIEW only
                            flexDirection: printMode === 'back' ? 'row-reverse' : 'row',
                            justifyContent: 'flex-start',
                        }}
                    >
                        {/* Only map and display previews if not loading and students exist in filtered list */}
                        {!isLoadingData && filteredStudentData.length > 0 && (
                            filteredStudentData.map((student) => {
                                // Basic check for essential student data for preview key/label
                                if (!student || !student._id) {
                                    console.warn("Skipping student preview due to missing ID:", student);
                                    return null; // Don't render preview for invalid student data
                                }
                                const studentKey = student._id;
                                const isSelected = selectedStudentIds.has(studentKey);

                                return (
                                    // Container for each student's preview (checkbox + card(s))
                                    <Box key={studentKey} sx={{
                                        border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd', // Highlight selected
                                        borderRadius: '4px',
                                        padding: '5px',
                                        backgroundColor: isSelected ? '#e6f7ff' : '#fff', // Light blue background if selected
                                        display: 'inline-flex', // Allows checkbox and card stack vertically
                                        flexDirection: 'column',
                                        alignItems: 'center', // Center the card(s) below the checkbox
                                        width: 'auto', // Fit content naturally
                                        minWidth: `calc(${CARD_WIDTH_MM}mm + 10px)`, // Ensure minimum width
                                        pageBreakInside: 'avoid', // Hint for screen rendering (less critical)
                                    }}>
                                        {/* Checkbox with student name/ID */}
                                        <FormControlLabel
                                            control={ <Checkbox
                                                size="small"
                                                checked={isSelected}
                                                onChange={(e) => handleSelectSingleChange(e, studentKey)}
                                            /> }
                                            // Display name and admission number, with fallbacks
                                            label={`${student.studentName || 'Unknown Name'} (${student.admissionNumber || 'No ID'})`}
                                            sx={{ width: '100%', alignSelf: 'flex-start', mb: 0.5, fontSize: '0.8rem', mr: 0 }} // Align left
                                        />

                                        {/* Conditional display of front/back/both previews */}
                                        {printMode === 'front' && (
                                            <div
                                                className="id-card" // Use class for potential shared preview styles
                                                style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
                                                dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
                                        )}
                                        {printMode === 'back' && (
                                            <div
                                                className="id-card"
                                                style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
                                                dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
                                        )}
                                        {printMode === 'both' && (
                                            // Container to stack front and back previews vertically
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
                                                <div
                                                    className="id-card id-card-front"
                                                    style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
                                                    dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
                                                <div
                                                    className="id-card id-card-back"
                                                    style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
                                                    dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
                                            </div>
                                        )}
                                    </Box>
                                );
                            })
                        )}
                        {/* Loading/No Results messages are shown in the dedicated area above the preview */}
                    </Box>
                </div>
            </Box>
        </>
    );
};

export default IdCard;

