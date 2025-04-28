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
        const data = {
            backgroundImage: idCardData?.frontImage?.url || "", // Use API background or empty
            studentImage: student?.studentImage?.url, // Placeholder handled by replacePlaceholders
            name: student?.studentName?.toUpperCase() || 'N/A',
            dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
            class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
            section: student?.section || '',
            father_name: student?.fatherName?.toUpperCase() || 'N/A',
            mother_name: student?.motherName?.toUpperCase() || 'N/A',
            mobile: student?.contact || student?.parentContact || 'N/A', // Prioritize student contact
            address: student?.address || 'N/A',
            session: student?.session || session?.name || 'N/A', // Use student session or fallback to current
            admissionNumber: student?.admissionNumber || 'N/A',
          };
          return replacePlaceholders(frontTemplateToUse, data, 'Front');
    }, [idCardData, frontTemplateToUse, replacePlaceholders, session]);

    const renderBackTemplate = useCallback((student) => {
        const data = {
            backgroundImage: idCardData?.backImage?.url || "", // Use API background or empty
            fatherImage: student?.fatherImage?.url, // Placeholder handled by replacePlaceholders
            motherImage: student?.motherImage?.url, // Placeholder handled by replacePlaceholders
            guardianImage: student?.guardianImage?.url, // Placeholder handled by replacePlaceholders
            session: student?.session || session?.name || 'N/A', // Use student session or fallback
            admissionNumber: student?.admissionNumber || 'N/A',
            guardianname: student?.guardianName || 'N/A',
            parentContact: student?.parentContact || 'N/A', // Primary contact on back might be parent
            address: student?.address || 'N/A', // Address might be relevant on back too
            // Include other fields if they are part of the back template design
            // dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
            // name: student?.studentName || 'N/A',
            // class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
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

// // --- Constants for dimensions ---
// const CARD_WIDTH_MM = 54;
// const CARD_HEIGHT_MM = 86;
// const ITEMS_PER_PRINT_PAGE = 10; // Define items per page for printing

// const IdCard = () => {
//     // --- State Variables ---
//     const [idCardData, setIdCardData] = useState(null);
//     const [studentData, setStudentData] = useState([]);
//     const [classData, setClassData] = useState([]);
//     const [filteredStudentData, setFilteredStudentData] = useState([]);
//     const [filterName, setFilterName] = useState("");
//     const [selectedClass, setSelectedClass] = useState("");
//     const [selectedSection, setSelectedSection] = useState("");
//     const [isLoadingData, setIsLoadingData] = useState(true); // For initial data load
//     const [printMode, setPrintMode] = useState('both');
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

//     // --- Context and Refs ---
//     const session = JSON.parse(localStorage.getItem("session"));
//     const { currentColor, setIsLoader, isLoader } = useStateContext(); // isLoader for print preparation
//     const componentRef = useRef(); // Ref for the overall component structure (optional)

//     // --- Default Templates ---
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
//             // Attempt to fix potential double encoding or extra quotes
//             let cleanEncoded = encoded;
//             if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
//                 cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
//             }
//             cleanEncoded = cleanEncoded.replace(/\\"/g, '"'); // Handle escaped quotes if JSON stringified

//             const binaryString = window.atob(cleanEncoded);
//             const bytes = new Uint8Array(binaryString.length);
//             for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//             const decoder = new TextDecoder('utf-8');
//             return decoder.decode(bytes);
//         } catch (error) {
//             console.error("Error decoding base64:", encoded, error); // Log the problematic string
//             return null; // Return null or a default error string
//         }
//     }, []);

//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => {
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 setIdCardData(response.designFormats[0]);
//             } else {
//                 console.warn("No custom ID card design found or response format incorrect. Using default.");
//                 setIdCardData(null);
//             }
//         } catch (error) {
//             console.error("Error fetching ID card design:", error);
//             toast.error("Could not load custom ID card template.");
//             setIdCardData(null);
//         }
//        }, []); // No dependencies needed if API call doesn't depend on component state

//     const fetchAllClasses = useCallback(async () => {
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//               setClassData(response.classes || []);
//             } else {
//               toast.error(response?.message || "Failed to fetch classes.");
//               setClassData([]);
//             }
//           } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error("An error occurred while fetching classes.");
//             setClassData([]);
//           }
//     }, []); // No dependencies needed

//     const fetchAllStudents = useCallback(async () => {
//         if (!session) {
//             toast.error("Session information is missing.");
//             setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return;
//         }
//         setIsLoadingData(true);
//         try {
//           const response = await ActiveStudents(session);
//           if (response?.success && response.students?.data) {
//             setStudentData(response.students.data || []);
//           } else {
//              toast.error(response?.message || "Failed to fetch students or unexpected format.");
//              setStudentData([]); setFilteredStudentData([]);
//           }
//         } catch (error) {
//           console.error("Error fetching students:", error);
//           toast.error("An error occurred while fetching students.");
//           setStudentData([]); setFilteredStudentData([]);
//         } finally {
//              setIsLoadingData(false);
//         }
//     }, [session]); // Depends only on session

//     // --- Effects ---
//     useEffect(() => { // Initial data fetch
//         // No need to set isLoadingData here, fetchAllStudents handles it
//         Promise.all([ fetchTemplate(), fetchAllClasses(), fetchAllStudents() ]);
//         // No cleanup needed for these promises
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]); // Dependencies for initial load

//     useEffect(() => { // Filtering Logic
//         if (isLoadingData) return; // Don't filter until initial load is complete

//         let filtered = studentData;
//         if (selectedClass) { filtered = filtered.filter(s => s.class === selectedClass); }
//         if (selectedSection) { filtered = filtered.filter(s => (s.section || null) === selectedSection); }
//         if (filterName) {
//           const lowerCaseFilter = filterName.toLowerCase().trim();
//           filtered = filtered.filter(s =>
//             s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//             s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
//           );
//         }
//         setFilteredStudentData(filtered);
//         // Reset selection when filters change for clarity
//         setSelectedStudentIds(new Set());
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]); // React to filter changes

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);

//     const handleSelectAllChange = (event) => {
//         if (event.target.checked) {
//             const allFilteredIds = new Set(filteredStudentData.map(student => student._id).filter(id => !!id)); // Ensure IDs exist
//             setSelectedStudentIds(allFilteredIds);
//         } else {
//             setSelectedStudentIds(new Set());
//         }
//     };

//     const handleSelectSingleChange = (event, studentId) => {
//         if (!studentId) return; // Safety check
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

//     // --- Template Rendering Logic (Memoized Templates) ---
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

//     // --- Template Rendering Functions ---
//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         if (!template) {
//              console.error(`Template for ${cardSide} is missing.`);
//              return `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>Missing Template</div>`;
//         }
//         let renderedHtml = template;
//         try {
//             // Regex to find placeholders like ${key}, ${ key }, ${key.nested}
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 const keys = cleanKey.split('.');
//                 let value = data;
//                 for (const k of keys) {
//                     if (value && typeof value === 'object' && k in value) {
//                         value = value[k];
//                     } else {
//                         // If path breaks or key doesn't exist at top level
//                         value = data.hasOwnProperty(cleanKey) ? data[cleanKey] : undefined; // Check top level as fallback
//                         break;
//                     }
//                 }

//                 // Handle common missing image URLs gracefully within the replacement
//                 if (value === undefined || value === null || value === '') {
//                     if (cleanKey === 'studentImage' || cleanKey === 'studentImage.url') return "https://via.placeholder.com/85x95.png?text=No+Image";
//                     if (cleanKey.includes('fatherImage') || cleanKey.includes('motherImage') || cleanKey.includes('guardianImage')) return "https://via.placeholder.com/60x70.png?text=N/A";
//                 }

//                 return String(value ?? ''); // Return empty string for null/undefined
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             renderedHtml = `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); // No dependencies needed as it's pure logic on inputs

//     const renderFrontTemplate = useCallback((student) => {
//         const data = {
//             backgroundImage: idCardData?.frontImage?.url || "",
//             studentImage: student?.studentImage?.url, // Placeholder handled by replacePlaceholders
//             name: student?.studentName?.toUpperCase() || 'N/A',
//             dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//             class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//             section: student?.section || '',
//             father_name: student?.fatherName?.toUpperCase() || 'N/A',
//             mother_name: student?.motherName?.toUpperCase() || 'N/A',
//             mobile: student?.contact || student?.parentContact || 'N/A',
//             address: student?.address || 'N/A',
//             session: student?.session || session?.name || 'N/A',
//             admissionNumber: student?.admissionNumber || 'N/A',
//           };
//           return replacePlaceholders(frontTemplateToUse, data, 'Front');
//     }, [idCardData, frontTemplateToUse, replacePlaceholders, session]); // Depends on template, session

//     const renderBackTemplate = useCallback((student) => {
//         const data = {
//             backgroundImage: idCardData?.backImage?.url || "",
//             fatherImage: student?.fatherImage?.url, // Placeholder handled by replacePlaceholders
//             motherImage: student?.motherImage?.url, // Placeholder handled by replacePlaceholders
//             guardianImage: student?.guardianImage?.url, // Placeholder handled by replacePlaceholders
//             session: student?.session || session?.name || 'N/A',
//             admissionNumber: student?.admissionNumber || 'N/A',
//             guardianname: student?.guardianName || 'N/A',
//             parentContact: student?.parentContact || 'N/A',
//             address: student?.address || 'N/A',
//             // Add other fields if needed on the back, e.g.:
//             // dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//             // name: student?.studentName || 'N/A',
//             // class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//           };
//           return replacePlaceholders(backTemplateToUse, data, 'Back');
//     }, [idCardData, backTemplateToUse, replacePlaceholders, session]); // Depends on template, session


//     // --- Students to Print Calculation ---
//     const studentsToPrint = useMemo(() => {
//         // Ensure students have an _id before filtering
//         return filteredStudentData.filter(student => student?._id && selectedStudentIds.has(student._id));
//     }, [filteredStudentData, selectedStudentIds]);

//     // --- Printing ---
//     const generatePDF = useReactToPrint({
//         content: () => {
//             setIsLoader(true); // Indicate print preparation
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area'; // Base class for flex layout

//             studentsToPrint.forEach((student, index) => {
//                 const studentKey = student._id;
//                 let itemElement; // Will hold the div for this student (single or pair)

//                 if (printMode === 'front') {
//                     const cardDiv = document.createElement('div');
//                     cardDiv.className = `id-card single-card-print card-${studentKey}-front`;
//                     cardDiv.innerHTML = renderFrontTemplate(student);
//                     itemElement = cardDiv;
//                 } else if (printMode === 'back') {
//                     const cardDiv = document.createElement('div');
//                     cardDiv.className = `id-card single-card-print card-${studentKey}-back`;
//                     cardDiv.innerHTML = renderBackTemplate(student);
//                     itemElement = cardDiv;
//                 } else { // 'both'
//                     const pairDiv = document.createElement('div');
//                     pairDiv.className = `id-card-pair pair-${studentKey}`;
//                     const frontDiv = document.createElement('div');
//                     frontDiv.className = 'id-card id-card-front';
//                     frontDiv.innerHTML = renderFrontTemplate(student);
//                     const backDiv = document.createElement('div');
//                     backDiv.className = 'id-card id-card-back';
//                     backDiv.innerHTML = renderBackTemplate(student);
//                     pairDiv.appendChild(frontDiv);
//                     pairDiv.appendChild(backDiv);
//                     itemElement = pairDiv;
//                 }

//                 // --- Add Page Break Logic ---
//                 // Add page break *after* every ITEMS_PER_PRINT_PAGE item, except the last one
//                 if ((index + 1) % ITEMS_PER_PRINT_PAGE === 0 && index < studentsToPrint.length - 1) {
//                     itemElement.style.pageBreakAfter = 'always';
//                 }
//                 // --- End Page Break Logic ---

//                 printContainer.appendChild(itemElement);
//             });

//             // Optional: Add message if no students were selected
//             if (studentsToPrint.length === 0) {
//                  const messageDiv = document.createElement('div');
//                  messageDiv.innerText = "No students selected for printing.";
//                  messageDiv.style.width = '100%';
//                  messageDiv.style.textAlign = 'center';
//                  messageDiv.style.marginTop = '20px';
//                  messageDiv.style.pageBreakInside = 'avoid'; // Avoid breaking message itself
//                  printContainer.appendChild(messageDiv);
//              }

//             return printContainer; // Return the populated container for printing
//         },
//         documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onBeforeGetContent: () => Promise.resolve(), // Loader is handled in content()
//         onAfterPrint: () => {
//             setIsLoader(false); // Stop print preparation indicator
//             if (studentsToPrint.length > 0) {
//                 toast.success(`${studentsToPrint.length} ID Card(s) prepared!`);
//             } else {
//                 // Optionally, don't show toast if nothing was printed,
//                 // or keep the info toast if preferred.
//                 // toast.info("Printing cancelled or no students were selected.");
//             }
//         },
//         pageStyle: `
//           @page {
//             size: A4 landscape;
//             margin: 10mm; /* Adjust margin as needed */
//           }
//           @media print {
//             body {
//               -webkit-print-color-adjust: exact !important; /* Ensure backgrounds and colors print */
//               print-color-adjust: exact !important;
//             }
//             .id-card-print-area {
//               display: flex !important;
//               flex-wrap: wrap !important;
//               flex-direction: row !important; /* Ensure LTR flow */
//               justify-content: flex-start !important; /* Align items to the start */
//               align-items: flex-start !important; /* Align items to the top */
//               width: 277mm !important; /* A4 landscape width (297mm) - 2 * margin (10mm) */
//               /* Adjust gaps based on ITEMS_PER_PRINT_PAGE (e.g., 5 columns for 10 items) */
//               column-gap: 1.75mm !important; /* (277 - 5 * 54) / 4 */
//               row-gap: 5mm !important; /* Vertical gap between rows */
//             }

//             /* Styling for the container of each item (pair or single card) */
//             .id-card-pair, .single-card-print {
//                 page-break-inside: avoid !important; /* Critical: Prevent item from splitting across pages */
//                 display: block !important; /* Treat as block for layout */
//                 width: ${CARD_WIDTH_MM}mm !important;
//                 margin: 0 !important; /* Use gap for spacing */
//                 padding: 0 !important;
//                 border: none !important; /* No borders in print */
//                 box-sizing: border-box !important;
//                 /* page-break-after is applied dynamically via JS */
//             }
//             .id-card-pair { height: auto !important; } /* Height determined by content */
//             .single-card-print { height: ${CARD_HEIGHT_MM}mm !important; overflow: hidden !important;}

//             /* Gap between front and back within a pair */
//             .id-card-pair .id-card-front { margin-bottom: 1mm !important; }

//             /* Base styles for the actual front/back card divs */
//              .id-card {
//                 width: ${CARD_WIDTH_MM}mm !important;
//                 height: ${CARD_HEIGHT_MM}mm !important;
//                 overflow: hidden !important;
//                 border: none !important; /* No border */
//                 box-sizing: border-box !important;
//                 display: block !important;
//                 background-color: transparent !important; /* Allow template background */
//              }

//             /* Hide elements not meant for printing */
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
//     const isSelectAllChecked = filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length;
//     const isSelectAllIndeterminate = selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length;

//     // --- JSX ---
//     return (
//         <>
//             {/* Optional: Add ref to the outermost element if needed */}
//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//                     Generate Student ID Cards
//                 </Typography>

//                 {/* Filter Controls Area */}
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                      <Grid container spacing={2} alignItems="center">
//                         {/* Class Filter */}
//                         <Grid item xs={12} sm={6} md={3} lg={2}>
//                             <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData} />
//                         </Grid>
//                         {/* Section Filter */}
//                         <Grid item xs={12} sm={6} md={3} lg={2}>
//                              <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section" />
//                         </Grid>
//                         {/* Name/Adm No Filter */}
//                         <Grid item xs={12} sm={6} md={3} lg={3}>
//                             <TextField fullWidth id="filter-name" label="Filter by Name / Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}/>
//                         </Grid>
//                         {/* Print Mode */}
//                         <Grid item xs={6} sm={3} md={3} lg={2}>
//                             <FormControl fullWidth size="small" disabled={isLoadingData}>
//                                 <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
//                                 <Select labelId="print-mode-select-label" id="print-mode-select" value={printMode} label="Print Sides" onChange={handlePrintModeChange} >
//                                     <MenuItem value={'both'}>Both Sides</MenuItem>
//                                     <MenuItem value={'front'}>Front Only</MenuItem>
//                                     <MenuItem value={'back'}>Back Only</MenuItem>
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         {/* Print Button */}
//                         <Grid item xs={6} sm={3} md={12} lg={3}> {/* Adjust grid layout */}
//                             <Button
//                                 fullWidth
//                                 variant="contained"
//                                 onClick={generatePDF}
//                                 style={{ backgroundColor: currentColor, color: 'white', height: '40px' }}
//                                 // Disable if no students selected, or during initial load, or during print preparation
//                                 disabled={selectedStudentIds.size === 0 || isLoadingData || isLoader}
//                                 startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}
//                             >
//                                 {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </Box>

//                 {/* Select All / Loading Indicator Area */}
//                 <Box className="no-print" sx={{ mb: 2, minHeight: '40px' /* Reserve space */ }}>
//                     {/* Show Select All only when not loading and there are results */}
//                     { !isLoadingData && filteredStudentData.length > 0 && (
//                         <FormControlLabel
//                             control={<Checkbox
//                                 checked={isSelectAllChecked}
//                                 indeterminate={isSelectAllIndeterminate}
//                                 onChange={handleSelectAllChange}
//                                 disabled={isLoadingData} // Should be false here, but keep for safety
//                             />}
//                             label={`Select All (${filteredStudentData.length} shown)`}
//                             sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1, width: '100%' }}
//                         />
//                     )}
//                     {/* Show loading indicator for initial data fetch */}
//                      {isLoadingData && (
//                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', py: 1 }}>
//                              <CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography>
//                          </Box>
//                      )}
//                      {/* Show message if filtering resulted in no students */}
//                      {!isLoadingData && filteredStudentData.length === 0 && studentData.length > 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', py:1, color: 'text.secondary' }}>
//                             No students match the current filters.
//                          </Typography>
//                      )}
//                      {/* Show message if there was no student data initially */}
//                      {!isLoadingData && studentData.length === 0 && (
//                          <Typography sx={{ textAlign: 'center', width: '100%', py:1, color: 'text.secondary' }}>
//                             No active students found.
//                          </Typography>
//                      )}
//                 </Box>

//                 {/* On-Screen Preview Area - This is NOT what gets printed */}
//                 {/* Print content is generated dynamically in generatePDF */}
//                 <div>
//                     <Box
//                         className="screen-only" // Explicitly hide this entire section from printing
//                         sx={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             gap: '15px', // Visual gap for screen preview
//                             flexDirection: printMode === 'back' ? 'row-reverse' : 'row', // RTL preview for back only
//                             justifyContent: 'flex-start', // Align previews
//                         }}
//                     >
//                         {/* Only map and display previews if not loading and students exist */}
//                         {!isLoadingData && filteredStudentData.length > 0 && (
//                             filteredStudentData.map((student) => {
//                                 // Ensure student and _id exist before rendering
//                                 if (!student || !student._id) {
//                                     console.warn("Skipping student preview due to missing data:", student);
//                                     return null;
//                                 }
//                                 const studentKey = student._id;
//                                 const isSelected = selectedStudentIds.has(studentKey);

//                                 return (
//                                     // Container for checkbox + card(s) preview
//                                     <Box key={studentKey} sx={{
//                                         border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd',
//                                         borderRadius: '4px',
//                                         padding: '5px',
//                                         backgroundColor: isSelected ? '#eaf8ff' : '#fff', // Lighter blue for selected
//                                         display: 'inline-flex', // Arrange items side-by-side if needed, but column is used
//                                         flexDirection: 'column', // Stack checkbox and card(s)
//                                         alignItems: 'center', // Center card(s) below checkbox
//                                         width: 'auto', // Fit content width
//                                         // Avoid breaking within the preview block itself (less critical for screen)
//                                         pageBreakInside: 'avoid',
//                                     }}>
//                                         {/* Checkbox and Student Name/ID */}
//                                         <FormControlLabel
//                                             control={ <Checkbox
//                                                 size="small"
//                                                 checked={isSelected}
//                                                 onChange={(e) => handleSelectSingleChange(e, studentKey)}
//                                                 disabled={isLoadingData} // Should be false here
//                                             /> }
//                                             label={`${student.studentName || 'Unknown'} (${student.admissionNumber || 'N/A'})`}
//                                             sx={{ alignSelf: 'flex-start', mb: 0.5, fontSize: '0.8rem', mr: 0 }} // Align left, reduce margin
//                                         />

//                                         {/* Conditional Card Previews based on selected printMode */}
//                                         {printMode === 'front' && (
//                                             <div
//                                                 className="id-card" // Use class for potential base styles if needed
//                                                 style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }} // Dashed border for preview
//                                                 dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
//                                         )}
//                                         {printMode === 'back' && (
//                                             <div
//                                                 className="id-card"
//                                                 style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm`, overflow: 'hidden' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
//                                         )}
//                                         {printMode === 'both' && (
//                                             // Container for front/back pair preview
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
//                                                 <div
//                                                     className="id-card id-card-front" // Add classes if specific front/back preview styles needed
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
//                         {/* Note: Loading/No Results messages are now handled above the preview area */}
//                     </Box>
//                 </div>
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

// // --- Constants for dimensions ---
// const CARD_WIDTH_MM = 54;
// const CARD_HEIGHT_MM = 86;

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

//     // --- Context and Refs ---
//     const session = JSON.parse(localStorage.getItem("session"));
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const componentRef = useRef(); // Ref for the entire component structure

//     // --- Default Templates ---
//     const [defaultFrontTemplate] = useState(/* Paste your default front template string here */ `
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
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>PHONE<span style="float: right;">: \${mobile}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span></p>
//           </div>
//       </div>
//     </div>
//     `);
//     const [defaultBackTemplate] = useState(/* Paste your default back template string here */ `
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
//           if (!encoded || typeof encoded !== 'string') { return null; }
//           const binaryString = window.atob(encoded);
//           const bytes = new Uint8Array(binaryString.length);
//           for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//           const decoder = new TextDecoder('utf-8');
//           return decoder.decode(bytes);
//         } catch (error) {
//           console.error("Error decoding base64:", error);
//           return null;
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
//        }, []);
//     const fetchAllClasses = useCallback(async () => {
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//               setClassData(response.classes || []);
//             } else {
//               toast.error(response?.message || "Failed to fetch classes.");
//               setClassData([]);
//             }
//           } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error("An error occurred while fetching classes.");
//             setClassData([]);
//           }
//     }, []);
//     const fetchAllStudents = useCallback(async () => {
//         if (!session) {
//             toast.error("Session information is missing.");
//             setStudentData([]); setFilteredStudentData([]); setIsLoadingData(false); return; // Ensure loading stops
//         }
//         setIsLoadingData(true); // Set loading true at the start
//         try {
//           // Removed setIsLoader(true) here, rely on isLoadingData
//           const response = await ActiveStudents(session);
//           if (response?.success) {
//             const students = response.students?.data || [];
//             setStudentData(students);
//             // Filtering will happen in the useEffect below
//           } else {
//              toast.error(response?.message || "Failed to fetch students.");
//              setStudentData([]); setFilteredStudentData([]);
//           }
//         } catch (error) {
//           console.error("Error fetching students:", error);
//           toast.error("An error occurred while fetching students.");
//           setStudentData([]); setFilteredStudentData([]);
//         } finally {
//              // Removed setIsLoader(false) here, rely on isLoadingData
//              setIsLoadingData(false); // Set loading false at the end
//         }
//     }, [session]); // Removed setIsLoader dependency

//     // --- Effects ---
//     useEffect(() => { // Initial data fetch
//         const loadInitialData = async () => {
//           // setIsLoadingData(true); // Already handled in fetchAllStudents
//           await Promise.all([ fetchTemplate(), fetchAllClasses(), fetchAllStudents() ]);
//           // setIsLoadingData(false); // Already handled in fetchAllStudents
//         };
//         loadInitialData();
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//     useEffect(() => { // Filtering Logic
//         if (isLoadingData) return;

//         let filtered = studentData;
//         if (selectedClass) { filtered = filtered.filter(s => s.class === selectedClass); }
//         if (selectedSection) { filtered = filtered.filter(s => (s.section || null) === selectedSection); }
//         if (filterName) {
//           const lowerCaseFilter = filterName.toLowerCase().trim();
//           filtered = filtered.filter(s =>
//             s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//             s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
//           );
//         }
//         setFilteredStudentData(filtered);
//         setSelectedStudentIds(new Set()); // Reset selection when filters change
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);
//     const handleSelectAllChange = (event) => {
//         if (event.target.checked) {
//             const allFilteredIds = new Set(filteredStudentData.map(student => student._id));
//             setSelectedStudentIds(allFilteredIds);
//         } else {
//             setSelectedStudentIds(new Set());
//         }
//     };
//     const handleSelectSingleChange = (event, studentId) => {
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

//     // --- Template Rendering Logic (Memoized Templates) ---
//     const decodedApiFrontTemplate = useMemo(() => { // CORRECTED
//         if (!idCardData?.frontTemplate) return null;
//         const decoded = decodeBase64(idCardData.frontTemplate);
//         if (!decoded) return null;
//         try { if (decoded.startsWith('"') && decoded.endsWith('"')) { const parsed = JSON.parse(decoded); if (typeof parsed === 'string') return parsed; } } catch (e) { /* Ignore */ }
//         return decoded;
//     }, [idCardData, decodeBase64]);

//     const decodedApiBackTemplate = useMemo(() => { // CORRECTED
//         if (!idCardData?.backTemplate) return null;
//         const decoded = decodeBase64(idCardData.backTemplate);
//          if (!decoded) return null;
//          try { if (decoded.startsWith('"') && decoded.endsWith('"')) { const parsed = JSON.parse(decoded); if (typeof parsed === 'string') return parsed; } } catch (e) { /* Ignore */ }
//         return decoded;
//     }, [idCardData, decodeBase64]);

//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     // --- Template Rendering Functions ---
//     const replacePlaceholders = useCallback((template, data, cardSide) => {
//         let renderedHtml = template;
//         try {
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 const keys = cleanKey.split('.');
//                 let value = data;
//                 for (const k of keys) {
//                     if (value && typeof value === 'object' && k in value) {
//                         value = value[k];
//                     } else {
//                         value = undefined;
//                         break;
//                     }
//                 }
//                 // Handle common missing image URLs gracefully
//                 if ((cleanKey.endsWith('Image') || cleanKey.endsWith('Image.url')) && !value) {
//                     if(cleanKey === 'studentImage') return "https://via.placeholder.com/85x95.png?text=No+Image";
//                     if(cleanKey === 'fatherImage' || cleanKey === 'motherImage' || cleanKey === 'guardianImage') return "https://via.placeholder.com/60x70.png?text=N/A";
//                 }
//                 return String(value ?? ''); // Return empty string for null/undefined/missing
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             renderedHtml = `<div style='width: ${CARD_WIDTH_MM}mm; height: ${CARD_HEIGHT_MM}mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); // No dependencies needed as it's pure logic on inputs

//     const renderFrontTemplate = useCallback((student) => {
//         const data = {
//             backgroundImage: idCardData?.frontImage?.url || "",
//             studentImage: student?.studentImage?.url, // Let replacePlaceholders handle default
//             name: student?.studentName?.toUpperCase() || 'N/A',
//             dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//             class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//             section: student?.section || '',
//             father_name: student?.fatherName?.toUpperCase() || 'N/A',
//             mother_name: student?.motherName?.toUpperCase() || 'N/A',
//             mobile: student?.contact || student?.parentContact || 'N/A',
//             address: student?.address || 'N/A',
//             session: student?.session || session?.name || 'N/A',
//             admissionNumber: student?.admissionNumber || 'N/A',
//           };
//           return replacePlaceholders(frontTemplateToUse, data, 'Front');
//     }, [idCardData, frontTemplateToUse, replacePlaceholders, session]);

//     const renderBackTemplate = useCallback((student) => {
//         const data = {
//             backgroundImage: idCardData?.backImage?.url || "",
//             fatherImage: student?.fatherImage?.url, // Let replacePlaceholders handle default
//             motherImage: student?.motherImage?.url, // Let replacePlaceholders handle default
//             guardianImage: student?.guardianImage?.url, // Let replacePlaceholders handle default
//             session: student?.session || session?.name || 'N/A',
//             admissionNumber: student?.admissionNumber || 'N/A',
//             guardianname: student?.guardianName || 'N/A',
//             parentContact: student?.parentContact || 'N/A',
//             address: student?.address || 'N/A',
//             dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//             name: student?.studentName || 'N/A',
//             class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//           };
//           return replacePlaceholders(backTemplateToUse, data, 'Back');
//     }, [idCardData, backTemplateToUse, replacePlaceholders, session]);


//     // --- Students to Print Calculation ---
//     const studentsToPrint = useMemo(() => { // CORRECTED - already correct
//         return filteredStudentData.filter(student => selectedStudentIds.has(student._id));
//     }, [filteredStudentData, selectedStudentIds]);

//     // --- Printing ---
//     const generatePDF = useReactToPrint({
//         content: () => {
//             setIsLoader(true); // Use context loader for print preparation indication
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area';

//             studentsToPrint.forEach(student => {
//                 const studentKey = student._id;
//                 if (printMode === 'front') {
//                     const cardDiv = document.createElement('div');
//                     cardDiv.className = `id-card single-card-print card-${studentKey}-front`;
//                     cardDiv.innerHTML = renderFrontTemplate(student);
//                     printContainer.appendChild(cardDiv);
//                 } else if (printMode === 'back') {
//                     const cardDiv = document.createElement('div');
//                     cardDiv.className = `id-card single-card-print card-${studentKey}-back`;
//                     cardDiv.innerHTML = renderBackTemplate(student);
//                     printContainer.appendChild(cardDiv);
//                 } else {
//                     const pairDiv = document.createElement('div');
//                     pairDiv.className = `id-card-pair pair-${studentKey}`;
//                     const frontDiv = document.createElement('div');
//                     frontDiv.className = 'id-card id-card-front';
//                     frontDiv.innerHTML = renderFrontTemplate(student);
//                     const backDiv = document.createElement('div');
//                     backDiv.className = 'id-card id-card-back';
//                     backDiv.innerHTML = renderBackTemplate(student);
//                     pairDiv.appendChild(frontDiv);
//                     pairDiv.appendChild(backDiv);
//                     printContainer.appendChild(pairDiv);
//                 }
//             });
//             if (studentsToPrint.length === 0) { /* Add message if needed */ }
//             return printContainer;
//         },
//         documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onBeforeGetContent: () => Promise.resolve(),
//         onAfterPrint: () => {
//             setIsLoader(false); // Stop context loader
//             if (studentsToPrint.length > 0) {
//                 toast.success(`${studentsToPrint.length} ID Card(s) prepared!`);
//             } else {
//                 toast.info("Printing cancelled or no students were selected.");
//             }
//         },
//         pageStyle: `
//           @page { size: A4 landscape; margin: 10mm; }
//           @media print {
//             body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//             .id-card-print-area { display: flex !important; flex-wrap: wrap !important; flex-direction: row !important; justify-content: flex-start !important; align-items: flex-start !important; width: 277mm !important; column-gap: 1.75mm !important; row-gap: 5mm !important; }
//             .id-card-pair { display: block !important; width: ${CARD_WIDTH_MM}mm !important; height: auto !important; page-break-inside: avoid !important; margin: 0 !important; padding: 0 !important; border: none !important; box-sizing: border-box !important; }
//             .id-card-pair .id-card-front { margin-bottom: 1mm !important; }
//             .single-card-print { display: block !important; width: ${CARD_WIDTH_MM}mm !important; height: ${CARD_HEIGHT_MM}mm !important; page-break-inside: avoid !important; margin: 0 !important; border: none !important; box-sizing: border-box !important; overflow: hidden !important; }
//             .id-card { width: ${CARD_WIDTH_MM}mm !important; height: ${CARD_HEIGHT_MM}mm !important; overflow: hidden !important; border: none !important; box-sizing: border-box !important; page-break-inside: avoid !important; display: block !important; background-color: transparent !important; }
//             .no-print, .screen-only { display: none !important; }
//           }
//         `,
//     });

//     // --- Options for Select Components ---
//     const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]); // CORRECTED

//     const sectionOptions = useMemo(() => { // CORRECTED
//         const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//         return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//     }, [classData, selectedClass]);

//     // --- Selection State Calculation ---
//     const isSelectAllChecked = filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length;
//     const isSelectAllIndeterminate = selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length;

//     // --- JSX ---
//     return (
//         <>
//             <Box ref={componentRef} sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//                     Generate Student ID Cards
//                 </Typography>

//                 {/* Filter Controls Area */}
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                      <Grid container spacing={2} alignItems="center">
//                         <Grid item xs={12} sm={6} md={3} lg={2}>
//                             <ReactSelect name="class" value={selectedClass} handleChange={handleClassChange} label="Class" dynamicOptions={[{ label: "All", value: "" }, ...classOptions]} placeholder="Select Class" isDisabled={isLoadingData} />
//                         </Grid>
//                         <Grid item xs={12} sm={6} md={3} lg={2}>
//                              <ReactSelect name="section" value={selectedSection} handleChange={handleSectionChange} label="Section" dynamicOptions={[{ label: "All", value: "" }, ...sectionOptions]} disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section" />
//                         </Grid>
//                         <Grid item xs={12} sm={6} md={3} lg={3}>
//                             <TextField fullWidth id="filter-name" label="Filter by Name / Adm. No." variant="outlined" onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}/>
//                         </Grid>
//                         <Grid item xs={6} sm={3} md={3} lg={2}>
//                             <FormControl fullWidth size="small" disabled={isLoadingData}>
//                                 <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
//                                 <Select labelId="print-mode-select-label" id="print-mode-select" value={printMode} label="Print Sides" onChange={handlePrintModeChange} >
//                                     <MenuItem value={'both'}>Both Sides</MenuItem>
//                                     <MenuItem value={'front'}>Front Only</MenuItem>
//                                     <MenuItem value={'back'}>Back Only</MenuItem>
//                                 </Select>
//                             </FormControl>
//                         </Grid>
//                         <Grid item xs={6} sm={3} md={12} lg={3}>
//                             <Button fullWidth variant="contained" onClick={generatePDF} style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} disabled={selectedStudentIds.size === 0 || isLoader || isLoadingData} startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null} >
//                                 {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </Box>

//                 {/* Select All / Student Preview Area Header */}
//                 <Box className="no-print" sx={{ mb: 2 }}>
//                     { !isLoadingData && filteredStudentData.length > 0 && ( // Check loading state here too
//                         <FormControlLabel control={<Checkbox checked={isSelectAllChecked} indeterminate={isSelectAllIndeterminate} onChange={handleSelectAllChange} disabled={isLoadingData} />}
//                             label={`Select All (${filteredStudentData.length} shown)`}
//                             sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1, width: '100%' }}
//                         />
//                     )}
//                      {/* Show loading indicator here if preferred */}
//                      {isLoadingData && (
//                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '50px' }}>
//                              <CircularProgress size={25} /><Typography sx={{ ml: 2 }}>Loading students...</Typography>
//                          </Box>
//                      )}
//                 </Box>

//                 {/* On-Screen Preview Area */}
//                 <div>
//                     <Box
//                         className="screen-only"
//                         sx={{
//                             display: 'flex', flexWrap: 'wrap', gap: '15px',
//                             flexDirection: printMode === 'back' ? 'row-reverse' : 'row', // Right-to-left preview for back only
//                             justifyContent: 'flex-start',
//                         }}
//                     >
//                         {/* --- Show Loading state OR No Results OR Student Cards --- */}
//                         {isLoadingData ? (
//                            /* Optionally keep a loading indicator here as well, or rely on the one above */
//                            <Box sx={{ width: '100%', textAlign: 'center', py: 5 }}>
//                                <CircularProgress />
//                            </Box>
//                         ) : filteredStudentData.length > 0 ? (
//                             filteredStudentData.map((student) => {
//                                 const studentKey = student._id;
//                                 const isSelected = selectedStudentIds.has(studentKey);
//                                 return (
//                                     <Box key={studentKey} sx={{ border: isSelected ? `2px solid ${currentColor}`: '1px solid #ddd', borderRadius: '4px', padding: '5px', backgroundColor: isSelected ? '#f0f8ff': '#fff', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 'auto', pageBreakInside: 'avoid', }}>
//                                         <FormControlLabel control={ <Checkbox size="small" checked={isSelected} onChange={(e) => handleSelectSingleChange(e, studentKey)} disabled={isLoadingData} /> } label={`${student.studentName} (${student.admissionNumber})`} sx={{ alignSelf: 'flex-start', mb: 0.5, fontSize: '0.8rem' }} />
//                                         {/* Card Previews */}
//                                         {printMode === 'front' && ( <div className="id-card" style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm` }} dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} /> )}
//                                         {printMode === 'back' && ( <div className="id-card" style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm` }} dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} /> )}
//                                         {printMode === 'both' && (
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
//                                                 <div className="id-card id-card-front" style={{ border: '1px dashed #ccc', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm` }} dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
//                                                 <div className="id-card id-card-back" style={{ border: '1px dashed #aaa', width: `${CARD_WIDTH_MM}mm`, height: `${CARD_HEIGHT_MM}mm` }} dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }} />
//                                             </div>
//                                         )}
//                                     </Box>
//                                 );
//                             })
//                         ) : (
//                             <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5, color: 'text.secondary' }}>
//                                 {studentData.length > 0 ? "No students match the current filters." : "No active students found."}
//                             </Typography>
//                         )}
//                     </Box>
//                 </div>
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
//     FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel // Added Checkbox components
// } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";

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
//     const [printMode, setPrintMode] = useState('both'); // 'front', 'back', 'both'
//     const [selectedStudentIds, setSelectedStudentIds] = useState(new Set()); // <<--- New State for selected IDs (using Set for efficiency)

//     // --- Context and Refs ---
//     const session = JSON.parse(localStorage.getItem("session"));
//     const { currentColor, setIsLoader, isLoader } = useStateContext();
//     const componentPDF = useRef(); // Ref for the on-screen preview area

//     // --- Default Templates (Fallbacks) ---
//     // Default Front Template (Unchanged)
//     const [defaultFrontTemplate] = useState(`
//     <div style='background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; width: 54mm; height: 86mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'><h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3><p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p></div>
//           <div style='margin: 0 auto; margin-top: 5px; width: 30mm; height: 35mm; border: 1px solid #aaa; border-radius: 4px; overflow: hidden; background-color: #eee; display: flex; justify-content: center; align-items: center;'><img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/></div>
//           <div style='margin-top: 8mm; padding-left: 2mm; padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>CLASS<span style="float: right;">: \${class}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>DOB<span style="float: right;">: \${dob}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>PHONE<span style="float: right;">: \${mobile}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span></p>
//           </div>
//       </div>
//     </div>
//     `);
//     // Default Back Template (Unchanged)
//     const [defaultBackTemplate] = useState(`
//     <div style='background-color: #e0e0e0; background-position: center; background-repeat: no-repeat; width: 54mm; height: 86mm; position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
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
//     const decodeBase64 = useCallback((encoded) => { /* ... no changes needed ... */
//         try {
//           if (!encoded || typeof encoded !== 'string') { return null; }
//           const binaryString = window.atob(encoded);
//           const bytes = new Uint8Array(binaryString.length);
//           for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//           const decoder = new TextDecoder('utf-8');
//           return decoder.decode(bytes);
//         } catch (error) {
//           console.error("Error decoding base64:", error);
//           return null;
//         }
//     }, []);

//     // --- API Fetching ---
//     const fetchTemplate = useCallback(async () => { /* ... no changes needed ... */
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
//        }, []);
//     const fetchAllClasses = useCallback(async () => { /* ... no changes needed ... */
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//               setClassData(response.classes || []);
//             } else {
//               toast.error(response?.message || "Failed to fetch classes.");
//               setClassData([]);
//             }
//           } catch (error) {
//             console.error("Error fetching classes:", error);
//             toast.error("An error occurred while fetching classes.");
//             setClassData([]);
//           }
//     }, []);
//     const fetchAllStudents = useCallback(async () => { /* ... no changes needed ... */
//         if (!session) {
//             toast.error("Session information is missing.");
//             setStudentData([]); setFilteredStudentData([]); return;
//         }
//         try {
//           setIsLoader(true); // Show loader during student fetch
//           const response = await ActiveStudents(session);
//           if (response?.success) {
//             const students = response.students?.data || [];
//             setStudentData(students);
//             // Initial filter application - no need to set filteredStudentData here, the filter effect will handle it
//           } else {
//              toast.error(response?.message || "Failed to fetch students.");
//              setStudentData([]); setFilteredStudentData([]);
//           }
//         } catch (error) {
//           console.error("Error fetching students:", error);
//           toast.error("An error occurred while fetching students.");
//           setStudentData([]); setFilteredStudentData([]);
//         } finally {
//             setIsLoader(false); // Hide loader after fetch
//         }
//     }, [session, setIsLoader]); // Added setIsLoader

//     // --- Effects ---
//     useEffect(() => { // Initial data fetch
//         const loadInitialData = async () => {
//           setIsLoadingData(true);
//           await Promise.all([ fetchTemplate(), fetchAllClasses(), fetchAllStudents() ]);
//           setIsLoadingData(false);
//         };
//         loadInitialData();
//     }, [fetchTemplate, fetchAllClasses, fetchAllStudents]); // Dependencies remain the same

//     useEffect(() => { // Filtering Logic
//         if (isLoadingData) return; // Don't filter while initial data is loading

//         let filtered = studentData;
//         if (selectedClass) { filtered = filtered.filter(s => s.class === selectedClass); }
//         if (selectedSection) { filtered = filtered.filter(s => (s.section || null) === selectedSection); } // Handle null sections
//         if (filterName) {
//           const lowerCaseFilter = filterName.toLowerCase().trim();
//           filtered = filtered.filter(s =>
//             s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//             s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
//           );
//         }
//         setFilteredStudentData(filtered);
//         setSelectedStudentIds(new Set()); // <<--- Reset selection when filters change
//     }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]); // Dependencies remain the same

//     // --- Event Handlers ---
//     const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//     const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//     const handleSectionChange = (e) => setSelectedSection(e.target.value);
//     const handlePrintModeChange = (e) => setPrintMode(e.target.value);

//     // --- Selection Handlers ---
//     const handleSelectAllChange = (event) => {
//         if (event.target.checked) {
//             // Select all *filtered* students
//             const allFilteredIds = new Set(filteredStudentData.map(student => student._id));
//             setSelectedStudentIds(allFilteredIds);
//         } else {
//             // Deselect all
//             setSelectedStudentIds(new Set());
//         }
//     };

//     const handleSelectSingleChange = (event, studentId) => {
//         const isChecked = event.target.checked;
//         setSelectedStudentIds(prevSelectedIds => {
//             const newSelectedIds = new Set(prevSelectedIds); // Create a copy
//             if (isChecked) {
//                 newSelectedIds.add(studentId);
//             } else {
//                 newSelectedIds.delete(studentId);
//             }
//             return newSelectedIds;
//         });
//     };

//     // --- Template Rendering Logic (Memoized Templates) ---
//     const decodedApiFrontTemplate = useMemo(() => { /* ... no changes needed ... */
//         if (!idCardData?.frontTemplate) return null;
//         const decoded = decodeBase64(idCardData.frontTemplate);
//         if (!decoded) return null;
//         try { if (decoded.startsWith('"') && decoded.endsWith('"')) { const parsed = JSON.parse(decoded); if (typeof parsed === 'string') return parsed; } } catch (e) { /* Ignore */ }
//         return decoded;
//     }, [idCardData, decodeBase64]);
//     const decodedApiBackTemplate = useMemo(() => { /* ... no changes needed ... */
//         if (!idCardData?.backTemplate) return null;
//         const decoded = decodeBase64(idCardData.backTemplate);
//          if (!decoded) return null;
//          try { if (decoded.startsWith('"') && decoded.endsWith('"')) { const parsed = JSON.parse(decoded); if (typeof parsed === 'string') return parsed; } } catch (e) { /* Ignore */ }
//         return decoded;
//     }, [idCardData, decodeBase64]);

//     const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//     const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//     // --- Template Rendering Functions ---
//     const replacePlaceholders = useCallback((template, data, cardSide) => { /* ... no changes needed ... */
//         let renderedHtml = template;
//         try {
//             // More robust placeholder replacement, handles missing keys gracefully
//             renderedHtml = template.replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
//                 const cleanKey = key.trim();
//                 // Handle nested keys if necessary (e.g., studentImage.url) - basic implementation
//                 const keys = cleanKey.split('.');
//                 let value = data;
//                 for (const k of keys) {
//                     if (value && typeof value === 'object' && k in value) {
//                         value = value[k];
//                     } else {
//                         value = undefined; // Key not found or path broken
//                         break;
//                     }
//                 }
//                 return String(value ?? ''); // Return empty string for null/undefined/missing
//             });
//         } catch (error) {
//             console.error(`Error rendering ${cardSide} template for student:`, data?.admissionNumber, error);
//             renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
//         }
//         return renderedHtml;
//     }, []); // No dependencies needed as it's pure logic on inputs

//     const renderFrontTemplate = useCallback((student) => { /* ... no changes needed ... */
//         const data = {
//             backgroundImage: idCardData?.frontImage?.url || "",
//             studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Image",
//             name: student?.studentName?.toUpperCase() || 'N/A',
//             dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//             class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//             section: student?.section || '',
//             father_name: student?.fatherName?.toUpperCase() || 'N/A',
//             mother_name: student?.motherName?.toUpperCase() || 'N/A',
//             mobile: student?.contact || student?.parentContact || 'N/A',
//             address: student?.address || 'N/A',
//             session: student?.session || session?.name || 'N/A', // Use current session if student session missing
//             admissionNumber: student?.admissionNumber || 'N/A',
//           };
//           return replacePlaceholders(frontTemplateToUse, data, 'Front');
//     }, [idCardData, frontTemplateToUse, replacePlaceholders, session]); // Added session dependency

//     const renderBackTemplate = useCallback((student) => { /* ... no changes needed ... */
//         const placeholderPersonImage = "https://via.placeholder.com/60x70.png?text=N/A";
//         const data = {
//             backgroundImage: idCardData?.backImage?.url || "",
//             fatherImage: student?.fatherImage?.url || placeholderPersonImage,
//             motherImage: student?.motherImage?.url || placeholderPersonImage,
//             guardianImage: student?.guardianImage?.url || placeholderPersonImage,
//             session: student?.session || session?.name || 'N/A', // Use current session if student session missing
//             admissionNumber: student?.admissionNumber || 'N/A',
//             guardianname: student?.guardianName || 'N/A',
//             parentContact: student?.parentContact || 'N/A',
//             address: student?.address || 'N/A',
//             dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//             name: student?.studentName || 'N/A',
//             class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//           };
//           return replacePlaceholders(backTemplateToUse, data, 'Back');
//     }, [idCardData, backTemplateToUse, replacePlaceholders, session]); // Added session dependency


//     // --- Students to Print Calculation ---
//     const studentsToPrint = useMemo(() => {
//         // Return only the students whose IDs are in the selectedStudentIds set
//         return filteredStudentData.filter(student => selectedStudentIds.has(student._id));
//     }, [filteredStudentData, selectedStudentIds]);

//     // --- Printing ---
//     const generatePDF = useReactToPrint({
//         // --- Use a function to dynamically generate content based on selected students ---
//         content: () => {
//             setIsLoader(true); // Show loader just before content generation
//             const printContainer = document.createElement('div');
//             printContainer.className = 'id-card-print-area'; // Apply print layout class

//             studentsToPrint.forEach(student => {
//                 const studentKey = student._id; // Use the actual ID

//                 if (printMode === 'front') {
//                     const cardDiv = document.createElement('div');
//                     cardDiv.className = 'id-card single-card-print'; // Use single-card style
//                     cardDiv.innerHTML = renderFrontTemplate(student);
//                     printContainer.appendChild(cardDiv);
//                 } else if (printMode === 'back') {
//                     const cardDiv = document.createElement('div');
//                     cardDiv.className = 'id-card single-card-print'; // Use single-card style
//                     cardDiv.innerHTML = renderBackTemplate(student);
//                     printContainer.appendChild(cardDiv);
//                 } else { // 'both'
//                     const pairDiv = document.createElement('div');
//                     pairDiv.className = 'id-card-pair'; // Wrapper for front/back pair
//                     const frontDiv = document.createElement('div');
//                     frontDiv.className = 'id-card id-card-front';
//                     frontDiv.innerHTML = renderFrontTemplate(student);
//                     const backDiv = document.createElement('div');
//                     backDiv.className = 'id-card id-card-back';
//                     backDiv.innerHTML = renderBackTemplate(student);
//                     pairDiv.appendChild(frontDiv);
//                     pairDiv.appendChild(backDiv);
//                     printContainer.appendChild(pairDiv);
//                 }
//             });

//             // If no students are selected, add a message (optional, print dialog might be empty anyway)
//             if (studentsToPrint.length === 0) {
//                 const messageDiv = document.createElement('div');
//                 messageDiv.innerText = "No students selected for printing.";
//                 messageDiv.style.width = '100%';
//                 messageDiv.style.textAlign = 'center';
//                 messageDiv.style.marginTop = '20px';
//                 printContainer.appendChild(messageDiv);
//             }

//             return printContainer; // Return the dynamically created container
//         },
//         documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`,
//         onBeforeGetContent: () => {
//             // setIsLoader(true) is now in the content function to be closer to the actual work
//             return Promise.resolve();
//         },
//         onAfterPrint: () => {
//             setIsLoader(false); // Hide loader after printing attempt
//             if (studentsToPrint.length > 0) {
//                 toast.success(`${studentsToPrint.length} ID Card(s) prepared!`);
//             } else {
//                 toast.info("Printing cancelled or no students were selected.");
//             }
//         },
//         // --- Updated pageStyle (minor adjustment for clarity) ---
//         pageStyle: `
//           @page {
//             size: A4 landscape; /* Always landscape for consistency */
//             margin: 10mm; /* Standard A4 margin */
//           }
//           @media print {
//             body {
//               -webkit-print-color-adjust: exact !important;
//               print-color-adjust: exact !important;
//             }
//             .id-card-print-area { /* Container for all items */
//               display: flex !important;
//               flex-wrap: wrap !important;
//               justify-content: flex-start !important; /* Align items to start */
//               align-items: flex-start !important; /* Align items to top */
//               width: 277mm !important; /* Printable width (A4 landscape width - 2*margin) */
//               /* Gap calculation: (PrintableWidth - NumColumns * ItemWidth) / (NumColumns - 1) */
//               /* Assuming 5 columns: (277 - 5 * 54) / 4 = 7 / 4 = 1.75mm */
//               /* Assuming 4 columns: (277 - 4 * 54) / 3 = 61 / 3 ~= 20.3mm */
//               /* Let's stick to 5 columns if possible */
//               column-gap: 1.75mm !important; /* Horizontal gap between items */
//               row-gap: 5mm !important; /* Vertical gap between rows */
//             }

//             /* Item Styling: Pair (for 'both' mode) */
//             .id-card-pair {
//                display: block !important; /* Stack front/back internally */
//                width: 54mm !important;
//                height: auto !important; /* Height is sum of cards + gap */
//                page-break-inside: avoid !important;
//                margin: 0 !important; /* Use gap for spacing */
//                padding: 0 !important;
//                border: none !important;
//                box-sizing: border-box !important;
//             }
//              /* Add vertical gap within the pair */
//              .id-card-pair .id-card-front {
//                 margin-bottom: 1mm !important; /* Small gap between front and back */
//             }

//             /* Item Styling: Single Card (for 'front' or 'back' mode) */
//             .single-card-print {
//                 display: block !important; /* Acts as a single block in the flex layout */
//                 width: 54mm !important;
//                 height: 86mm !important;   /* Explicit height */
//                 page-break-inside: avoid !important;
//                 margin: 0 !important; /* Use gap for spacing */
//                 border: none !important;
//                 box-sizing: border-box !important;
//                 overflow: hidden !important;
//             }

//              /* Base styles for ALL individual cards (nested or single) */
//              .id-card {
//                 width: 54mm !important;
//                 height: 86mm !important;
//                 overflow: hidden !important;
//                 border: none !important; /* Remove borders for print */
//                 box-sizing: border-box !important;
//                 page-break-inside: avoid !important;
//                 display: block !important;
//                 background-color: transparent !important; /* Ensure template background shows */
//              }

//             /* Hide non-printing elements */
//             .no-print { display: none !important; }
//             .screen-only { display: none !important; }
//           }
//         `,
//     });


//     // --- Options for Select Components ---
//     const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//     const sectionOptions = useMemo(() => {
//         const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//         return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//     }, [classData, selectedClass]);

//     // Determine if "Select All" should be checked
//     const isSelectAllChecked = filteredStudentData.length > 0 && selectedStudentIds.size === filteredStudentData.length;
//     // Determine if "Select All" should be indeterminate
//     const isSelectAllIndeterminate = selectedStudentIds.size > 0 && selectedStudentIds.size < filteredStudentData.length;

//     // --- JSX ---
//     return (
//         <>
//             <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//                 <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//                     Generate Student ID Cards
//                 </Typography>

//                 {/* Filter Controls Area */}
//                 <Box className="no-print" sx={{ borderBottom: '1px solid #eee', pb: 2, mb: 2 }}>
//                     <Grid container spacing={2} alignItems="center">
//                         {/* Class Filter */}
//                         <Grid item xs={12} sm={6} md={3} lg={2}>
//                             <ReactSelect
//                                 name="class" value={selectedClass} handleChange={handleClassChange} label="Class"
//                                 dynamicOptions={[{ label: "All", value: "" }, ...classOptions]} placeholder="Select Class"
//                                 isDisabled={isLoadingData}
//                             />
//                         </Grid>
//                         {/* Section Filter */}
//                         <Grid item xs={12} sm={6} md={3} lg={2}>
//                             <ReactSelect
//                                 name="section" value={selectedSection} handleChange={handleSectionChange} label="Section"
//                                 dynamicOptions={[{ label: "All", value: "" }, ...sectionOptions]}
//                                 disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section"
//                             />
//                         </Grid>
//                         {/* Name Filter */}
//                         <Grid item xs={12} sm={6} md={3} lg={3}>
//                             <TextField fullWidth id="filter-name" label="Filter by Name / Adm. No." variant="outlined"
//                                 onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}
//                             />
//                         </Grid>
//                         {/* Print Mode Selector */}
//                         <Grid item xs={6} sm={3} md={3} lg={2}>
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
//                         </Grid>
//                         {/* Print Button */}
//                         <Grid item xs={6} sm={3} md={12} lg={3}> {/* Adjusted grid for responsiveness */}
//                             <Button fullWidth variant="contained" onClick={generatePDF}
//                                 style={{ backgroundColor: currentColor, color: 'white', height: '40px' }}
//                                 disabled={selectedStudentIds.size === 0 || isLoader || isLoadingData} // Disable if nothing selected or loading
//                                 startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}
//                             >
//                                 {isLoader ? "Preparing..." : `Print Selected (${selectedStudentIds.size})`} {/* Show selected count */}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </Box>

//                 {/* Select All / Student Preview Area */}
//                 <Box className="no-print" sx={{ mb: 2 }}>
//                      {/* Add Select All Checkbox only if there are students to show */}
//                     {filteredStudentData.length > 0 && !isLoadingData && (
//                          <FormControlLabel
//                             control={
//                                 <Checkbox
//                                     checked={isSelectAllChecked}
//                                     indeterminate={isSelectAllIndeterminate}
//                                     onChange={handleSelectAllChange}
//                                     disabled={isLoadingData}
//                                 />
//                             }
//                             label={`Select All (${filteredStudentData.length} shown)`}
//                             sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 1, width: '100%' }}
//                         />
//                     )}
//                 </Box>

//                 {/* On-Screen Preview Area (still uses componentPDF ref for structure) */}
//                 <div ref={componentPDF} style={{ marginTop: '10px' }}>
//                     <Box
//                         className="screen-only" // Hide this specific layout from print, print uses dynamically generated content
//                         sx={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             gap: '15px', // Spacing for on-screen preview
//                             justifyContent: 'flex-start',
//                         }}
//                     >
//                         {isLoadingData ? (
//                             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '200px' }}>
//                                 <CircularProgress /><Typography sx={{ ml: 2 }}>Loading data...</Typography>
//                             </Box>
//                         ) : filteredStudentData.length > 0 ? (
//                             filteredStudentData.map((student) => {
//                                 const studentKey = student._id; // Use MongoDB ID as key
//                                 const isSelected = selectedStudentIds.has(studentKey);

//                                 return (
//                                     <Box key={studentKey} sx={{
//                                         border: isSelected ? `2px solid ${currentColor}` : '1px solid #ddd', // Highlight selected
//                                         borderRadius: '4px',
//                                         padding: '5px',
//                                         backgroundColor: isSelected ? '#f0f8ff' : '#fff', // Subtle background for selected
//                                         display: 'inline-flex', // Use inline-flex for checkbox and card(s)
//                                         flexDirection: 'column', // Stack checkbox above card(s)
//                                         alignItems: 'center',
//                                         width: 'auto', // Fit content
//                                         pageBreakInside: 'avoid', // Prevent breaking within a student's block on screen (less critical here)
//                                     }}>
//                                         <FormControlLabel
//                                             control={
//                                                 <Checkbox
//                                                     size="small"
//                                                     checked={isSelected}
//                                                     onChange={(e) => handleSelectSingleChange(e, studentKey)}
//                                                     disabled={isLoadingData}
//                                                 />
//                                             }
//                                             label={`${student.studentName} (${student.admissionNumber})`}
//                                             sx={{ alignSelf: 'flex-start', mb: 0.5, fontSize: '0.8rem' }} // Align checkbox left
//                                         />

//                                         {/* Render card previews based on printMode for consistency */}
//                                         {printMode === 'front' && (
//                                             <div
//                                                 className="id-card" // Use base class for styling
//                                                 style={{ border: '1px dashed #ccc' }} // On-screen border
//                                                 dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }}
//                                             />
//                                         )}
//                                         {printMode === 'back' && (
//                                              <div
//                                                 className="id-card"
//                                                 style={{ border: '1px dashed #aaa' }}
//                                                 dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }}
//                                             />
//                                         )}
//                                         {printMode === 'both' && (
//                                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2mm' }}>
//                                                 <div
//                                                     className="id-card id-card-front"
//                                                     style={{ border: '1px dashed #ccc' }}
//                                                     dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }}
//                                                 />
//                                                 <div
//                                                     className="id-card id-card-back"
//                                                     style={{ border: '1px dashed #aaa' }}
//                                                     dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }}
//                                                 />
//                                             </div>
//                                         )}
//                                     </Box>
//                                 );
//                             })
//                         ) : (
//                             <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5, color: 'text.secondary' }}>
//                                 {studentData.length > 0 ? "No students match the current filters." : "No active students found."}
//                             </Typography>
//                         )}
//                     </Box>
//                 </div>

//                  {/* Hidden Div for Actual Print Content - Not strictly needed anymore as content is generated dynamically */}
//                  {/* <div ref={printContentRef} style={{ display: 'none' }}></div> */}

//             </Box>
//         </>
//     );
// };

// export default IdCard;





// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material"; // Added Select components
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";

// const IdCard = () => {
//   // --- State Variables ---
//   const [idCardData, setIdCardData] = useState(null);
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [isLoadingData, setIsLoadingData] = useState(true);
//   const [printMode, setPrintMode] = useState('both'); // 'front', 'back', 'both' <<--- New State

//   // --- Context and Refs ---
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { currentColor, setIsLoader, isLoader } = useStateContext();
//   const componentPDF = useRef();

//   // --- Default Templates (Fallbacks) ---
//   const [defaultFrontTemplate] = useState(`
//     <div style='background-color: #f0f0f0; background-position: center; background-repeat: no-repeat; width: 54mm; height: 86mm; position: relative; background-size: cover; border: 1px solid #ccc; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box;'>
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>
//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'><h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3><p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p></div>
//           <div style='margin: 0 auto; margin-top: 5px; width: 30mm; height: 35mm; border: 1px solid #aaa; border-radius: 4px; overflow: hidden; background-color: #eee; display: flex; justify-content: center; align-items: center;'><img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/></div>
//           <div style='margin-top: 8mm; padding-left: 2mm; padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>CLASS<span style="float: right;">: \${class}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>DOB<span style="float: right;">: \${dob}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>PHONE<span style="float: right;">: \${mobile}</span></p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span></p>
//           </div>
//       </div>
//     </div>
//   `);
//   const [defaultBackTemplate] = useState(`
//     <div style='background-color: #e0e0e0; background-position: center; background-repeat: no-repeat; width: 54mm; height: 86mm; position: relative; background-size: cover; border: 1px solid #bbb; font-family: Arial, sans-serif; overflow: hidden; page-break-inside: avoid; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 5mm;'>
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
//   `);

//   // --- Helper Functions ---
//   const decodeBase64 = useCallback((encoded) => {
//     try {
//       if (!encoded || typeof encoded !== 'string') { return null; }
//       const binaryString = window.atob(encoded);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//       const decoder = new TextDecoder('utf-8');
//       return decoder.decode(bytes);
//     } catch (error) {
//       console.error("Error decoding base64:", error);
//       return null;
//     }
//   }, []);

//   // --- API Fetching ---
//   const fetchTemplate = useCallback(async () => { /* ... no changes needed */
//     try {
//         const response = await getIDcarddesign();
//         if (response?.success && response?.designFormats?.length > 0) {
//             setIdCardData(response.designFormats[0]);
//         } else {
//             console.warn("No custom ID card design found. Using default.");
//             setIdCardData(null);
//         }
//     } catch (error) {
//         console.error("Error fetching ID card design:", error);
//         toast.error("Could not load custom ID card template.");
//         setIdCardData(null);
//     }
//    }, []);
//   const fetchAllClasses = useCallback(async () => { /* ... no changes needed */
//     try {
//         const response = await AdminGetAllClasses();
//         if (response?.success) {
//           setClassData(response.classes || []);
//         } else {
//           toast.error(response?.message || "Failed to fetch classes.");
//           setClassData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching classes:", error);
//         toast.error("An error occurred while fetching classes.");
//         setClassData([]);
//       }
//   }, []);
//   const fetchAllStudents = useCallback(async () => { /* ... no changes needed */
//     if (!session) {
//         toast.error("Session information is missing.");
//         setStudentData([]); setFilteredStudentData([]); return;
//     }
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success) {
//         const students = response.students?.data || [];
//         setStudentData(students); setFilteredStudentData(students);
//       } else {
//          toast.error(response?.message || "Failed to fetch students.");
//          setStudentData([]); setFilteredStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//       setStudentData([]); setFilteredStudentData([]);
//     }
//   }, [session]);

//   // --- Effects ---
//   useEffect(() => { // Initial data fetch
//     const loadInitialData = async () => {
//       setIsLoadingData(true);
//       await Promise.all([ fetchTemplate(), fetchAllClasses(), fetchAllStudents() ]);
//       setIsLoadingData(false);
//     };
//     loadInitialData();
//   }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//   useEffect(() => { // Filtering
//     if (isLoadingData) return;
//     let filtered = studentData;
//     if (selectedClass) { filtered = filtered.filter(s => s.class === selectedClass); }
//     if (selectedSection) { filtered = filtered.filter(s => (s.section || null) === selectedSection); }
//     if (filterName) {
//       const lowerCaseFilter = filterName.toLowerCase().trim();
//       filtered = filtered.filter(s =>
//         s.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//         s.admissionNumber?.toLowerCase().includes(lowerCaseFilter)
//       );
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]);

//   // --- Event Handlers ---
//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//   const handleClassChange = (e) => { setSelectedClass(e.target.value); setSelectedSection(""); };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);
//   const handlePrintModeChange = (e) => setPrintMode(e.target.value); // <<--- New Handler

//   // --- Printing ---
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID_Cards_${printMode}_${selectedClass || 'All'}_${selectedSection || 'All'}_${moment().format('YYYYMMDD')}`, // Added printMode to title
//     onBeforeGetContent: () => { setIsLoader(true); return Promise.resolve(); },
//     onAfterPrint: () => { setIsLoader(false); toast.success("ID Cards prepared!"); },
//     // --- Updated pageStyle ---
//     pageStyle: `
//       @page {
//         size: A4 landscape; /* Always landscape for consistency */
//         margin: 10mm;
//       }
//       @media print {
//         body {
//           -webkit-print-color-adjust: exact !important;
//           print-color-adjust: exact !important;
//         }
//         .id-card-print-area { /* Container for all items */
//           display: flex !important;
//           flex-wrap: wrap !important;
//           justify-content: flex-start !important;
//           align-items: flex-start !important;
//           width: 277mm !important; /* Printable width */
//           /* Gap for 5 columns */
//           /* Col Gap = (277 - 5 * 54) / 4 = 1.75mm */
//           /* Row Gap (can vary based on item height) - let's use 10mm */
//           gap: 10mm 1.75mm !important;
//         }

//         /* Item Styling: Pair (for 'both' mode) */
//         .id-card-pair {
//            display: block !important; /* Stack front/back internally */
//            width: 54mm !important;
//            height: auto !important; /* Height is sum of cards + gap */
//            page-break-inside: avoid !important;
//            margin: 0 !important;
//            padding: 0 !important;
//            border: none !important;
//            box-sizing: border-box !important;
//         }
//          /* Add vertical gap within the pair */
//          .id-card-pair .id-card-front {
//             margin-bottom: 1mm !important;
//         }

//         /* Item Styling: Single Card (for 'front' or 'back' mode) */
//         .single-card-print {
//             display: block !important; /* Acts as a single block in the flex layout */
//             width: 54mm !important;
//             height: 86mm !important;   /* Explicit height */
//             page-break-inside: avoid !important;
//             margin: 0 !important;
//             border: none !important;
//             box-sizing: border-box !important;
//             overflow: hidden !important;
//         }

//          /* Base styles for ALL individual cards (nested or single) */
//          .id-card {
//             width: 54mm !important;
//             height: 86mm !important;
//             overflow: hidden !important;
//             border: none !important;
//             box-sizing: border-box !important;
//             page-break-inside: avoid !important;
//             display: block !important;
//          }

//         /* Hide non-printing elements */
//         .no-print {
//             display: none !important;
//         }
//       }
//     `,
//   });

//   // --- Template Rendering Logic ---
//   const decodedApiFrontTemplate = useMemo(() => { /* ... no changes needed ... */
//     if (!idCardData?.frontTemplate) return null;
//     const decoded = decodeBase64(idCardData.frontTemplate);
//     if (!decoded) return null;
//     try { // Optional JSON parse
//         if (decoded.startsWith('"') && decoded.endsWith('"')) {
//             const parsed = JSON.parse(decoded);
//             if (typeof parsed === 'string') return parsed;
//         }
//     } catch (e) { /* Ignore */ }
//     return decoded;
//   }, [idCardData, decodeBase64]);
//   const decodedApiBackTemplate = useMemo(() => { /* ... no changes needed ... */
//     if (!idCardData?.backTemplate) return null;
//     const decoded = decodeBase64(idCardData.backTemplate);
//      if (!decoded) return null;
//      try { // Optional JSON parse
//          if (decoded.startsWith('"') && decoded.endsWith('"')) {
//              const parsed = JSON.parse(decoded);
//              if (typeof parsed === 'string') return parsed;
//          }
//      } catch (e) { /* Ignore */ }
//     return decoded;
//   }, [idCardData, decodeBase64]);

//   const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//   const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//   // --- Template Rendering Functions ---
//   const replacePlaceholders = (template, data, cardSide) => { /* ... no changes needed ... */
//     let renderedHtml = template;
//     try {
//         renderedHtml = template.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//             const cleanKey = key.trim();
//             return String(data[cleanKey] ?? ''); // Return empty string for null/undefined/missing
//         });
//     } catch (error) {
//         console.error(`Error rendering ${cardSide} template:`, error);
//         renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Render Error</div>`;
//     }
//     return renderedHtml;
//   };

//   const renderFrontTemplate = useCallback((student) => { /* ... no changes needed ... */
//     const data = {
//         backgroundImage: idCardData?.frontImage?.url || "",
//         studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Image",
//         name: student?.studentName?.toUpperCase() || 'N/A',
//         dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//         class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//         section: student?.section || '',
//         father_name: student?.fatherName?.toUpperCase() || 'N/A',
//         mother_name: student?.motherName?.toUpperCase() || 'N/A',
//         mobile: student?.contact || student?.parentContact || 'N/A',
//         address: student?.address || 'N/A',
//         session: student?.session || 'N/A',
//         admissionNumber: student?.admissionNumber || 'N/A',
//       };
//       return replacePlaceholders(frontTemplateToUse, data, 'Front');
//   }, [idCardData, frontTemplateToUse, replacePlaceholders]); // Added replacePlaceholders dependency

//   const renderBackTemplate = useCallback((student) => { /* ... no changes needed ... */
//     const placeholderPersonImage = "https://via.placeholder.com/60x70.png?text=N/A";
//     const data = {
//         backgroundImage: idCardData?.backImage?.url || "",
//         fatherImage: student?.fatherImage?.url || placeholderPersonImage,
//         motherImage: student?.motherImage?.url || placeholderPersonImage,
//         guardianImage: student?.guardianImage?.url || placeholderPersonImage,
//         session: student?.session || 'N/A',
//         admissionNumber: student?.admissionNumber || 'N/A',
//         guardianname: student?.guardianName || 'N/A',
//         parentContact: student?.parentContact || 'N/A',
//         address: student?.address || 'N/A',
//         dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//         name: student?.studentName || 'N/A',
//         class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//       };
//       return replacePlaceholders(backTemplateToUse, data, 'Back');
//   }, [idCardData, backTemplateToUse, replacePlaceholders]); // Added replacePlaceholders dependency


//   // --- Options for Select Components ---
//   const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//   const sectionOptions = useMemo(() => {
//       const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//       return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//   }, [classData, selectedClass]);

//   // --- JSX ---
//   return (
//     <>
//       <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//         <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//           Generate Student ID Cards
//         </Typography>

//         {/* Filter Controls Area */}
//         <Box className="no-print">
//           <Grid container spacing={2} sx={{ marginBottom: 3 }} alignItems="center"> {/* Use alignItems */}
//             {/* Class Filter */}
//             <Grid item xs={6} sm={4} md={2}>
//               <ReactSelect
//                 name="class" value={selectedClass} handleChange={handleClassChange} label="Class"
//                 dynamicOptions={[{ label: "All", value: "" }, ...classOptions]} placeholder="Select Class"
//                 isDisabled={isLoadingData}
//               />
//             </Grid>
//             {/* Section Filter */}
//             <Grid item xs={6} sm={4} md={2}>
//               <ReactSelect
//                 name="section" value={selectedSection} handleChange={handleSectionChange} label="Section"
//                 dynamicOptions={[{ label: "All", value: "" }, ...sectionOptions]}
//                 disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} placeholder="Select Section"
//               />
//             </Grid>
//              {/* Name Filter */}
//             <Grid item xs={12} sm={4} md={3}>
//               <TextField fullWidth id="filter-name" label="Filter by Name / Adm. No." variant="outlined"
//                 onChange={handleFilterByNameChange} value={filterName} size="small" disabled={isLoadingData}
//               />
//             </Grid>
//              {/* Print Mode Selector <<--- NEW SELECTOR */}
//             <Grid item xs={6} sm={6} md={2}>
//                 <FormControl fullWidth size="small" disabled={isLoadingData}>
//                     <InputLabel id="print-mode-select-label">Print Sides</InputLabel>
//                     <Select
//                         labelId="print-mode-select-label"
//                         id="print-mode-select"
//                         value={printMode}
//                         label="Print Sides"
//                         onChange={handlePrintModeChange}
//                     >
//                         <MenuItem value={'both'}>Both Sides</MenuItem>
//                         <MenuItem value={'front'}>Front Only</MenuItem>
//                         <MenuItem value={'back'}>Back Only</MenuItem>
//                     </Select>
//                 </FormControl>
//             </Grid>
//             {/* Print Button */}
//             <Grid item xs={6} sm={6} md={3}>
//               <Button fullWidth variant="contained" onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, color: 'white', height: '40px' }} // Fixed height
//                 disabled={filteredStudentData.length === 0 || isLoader || isLoadingData}
//                 startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null}
//               >
//                 {isLoader ? "Preparing..." : `Print (${filteredStudentData.length})`}
//               </Button>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Printable Area */}
//         <div ref={componentPDF} style={{ marginTop: '20px' }}>
//           <div className="id-card-print-area" style={{ /* On-screen styles are minimal */ }}>
//             {isLoadingData ? (
//                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '200px' }}>
//                  <CircularProgress /><Typography sx={{ ml: 2 }}>Loading data...</Typography>
//                </Box>
//             ) : filteredStudentData.length > 0 ? (
//               // --- Conditional Rendering based on printMode ---
//               filteredStudentData.map((student) => {
//                   const studentKey = student?._id || student?.studentId || Math.random(); // Ensure a key

//                   if (printMode === 'front') {
//                       return (
//                           <div key={`${studentKey}-front`}
//                                className="id-card single-card-print" // Use single-card style for layout
//                                style={{ border: '1px dashed #ccc' }} // Optional on-screen border
//                                dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }}
//                           />
//                       );
//                   } else if (printMode === 'back') {
//                       return (
//                           <div key={`${studentKey}-back`}
//                                className="id-card single-card-print" // Use single-card style for layout
//                                style={{ border: '1px dashed #aaa' }} // Optional on-screen border
//                                dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }}
//                           />
//                       );
//                   } else { // printMode === 'both'
//                       return (
//                           <div key={studentKey} className="id-card-pair" style={{ // Pair wrapper
//                               display: 'inline-block', width: '54mm', marginBottom: '10mm', marginRight: '5mm', verticalAlign: 'top'
//                            }}>
//                               {/* Front Card within Pair */}
//                               <div className="id-card id-card-front"
//                                    style={{ border: '1px dashed #ccc', marginBottom: '2mm' /* On-screen gap */ }}
//                                    dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }}
//                               />
//                               {/* Back Card within Pair */}
//                               <div className="id-card id-card-back"
//                                    style={{ border: '1px dashed #aaa' }}
//                                    dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }}
//                               />
//                           </div>
//                       );
//                   }
//               })
//               // --- End Conditional Rendering ---
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5, color: 'text.secondary' }}>
//                 {studentData.length > 0 ? "No students match the current filters." : "No active students found."}
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>
//     </>
//   );
// };

// export default IdCard;




// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box, CircularProgress } from "@mui/material"; // Added CircularProgress
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";

// const IdCard = () => {
//   // --- State Variables ---
//   const [idCardData, setIdCardData] = useState(null); // Stores the fetched design format object
//   const [studentData, setStudentData] = useState([]); // Raw list of all students
//   const [classData, setClassData] = useState([]); // List of classes and sections
//   const [filteredStudentData, setFilteredStudentData] = useState([]); // Students matching current filters
//   const [filterName, setFilterName] = useState(""); // State for name filter input
//   const [selectedClass, setSelectedClass] = useState(""); // State for selected class filter
//   const [selectedSection, setSelectedSection] = useState(""); // State for selected section filter
//   const [isLoadingData, setIsLoadingData] = useState(true); // Combined loading state for initial fetches

//   // --- Context and Refs ---
//   const session = JSON.parse(localStorage.getItem("session")); // Assuming session is stored in localStorage
//   const { currentColor, setIsLoader, isLoader } = useStateContext(); // Use isLoader from context for print/global loading
//   const componentPDF = useRef(); // Ref for the printable area DOM node

//   // --- Default Templates (Fallbacks if API data is missing or invalid) ---
//   const [defaultFrontTemplate] = useState(`
//     <div style='background-color: #f0f0f0;
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size: cover;
//                 border: 1px solid #ccc;
//                 font-family: Arial, sans-serif;
//                 overflow: hidden;
//                 page-break-inside: avoid;
//                 box-sizing: border-box;'>

//       {/* Optional: Default Background Image Layer */}
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>

//       {/* Content Layer */}
//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'>
//              <h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3>
//              <p style='margin: 2px 0; font-size: 6pt; color: #666;'>Session: \${session}</p>
//           </div>

//           <div style='margin: 0 auto;
//                       margin-top: 5px;
//                       width: 30mm;
//                       height: 35mm;
//                       border: 1px solid #aaa;
//                       border-radius: 4px;
//                       overflow: hidden;
//                       background-color: #eee;
//                       display: flex;
//                       justify-content: center;
//                       align-items: center;'>
//             <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/>
//           </div>

//           <div style='margin-top: 8mm;
//                       padding-left: 2mm;
//                       padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${name}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               CLASS<span style="float: right;">: \${class}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               F.NAME<span style="float: right; max-width: 65%; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span>
//             </p>
//              <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               DOB<span style="float: right;">: \${dob}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               PHONE<span style="float: right;">: \${mobile}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>
//               ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal; word-break: break-word;">: \${address}</span>
//             </p>
//           </div>
//       </div>
//     </div>
//   `);

//   const [defaultBackTemplate] = useState(`
//     <div style='background-color: #e0e0e0;
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size: cover;
//                 border: 1px solid #bbb;
//                 font-family: Arial, sans-serif;
//                 overflow: hidden;
//                 page-break-inside: avoid;
//                 box-sizing: border-box;
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: space-between;
//                 padding: 5mm;'>

//       {/* Optional: Default Background Image Layer */}
//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1; opacity: 0.5;'></div>

//       {/* Content Layer */}
//       <div style='position: relative; z-index: 2;'>
//         <h4 style='text-align: center; margin: 0 0 5mm 0; font-size: 8pt;'>Parent/Guardian Info</h4>
//         <div style='display: flex; justify-content: space-around; text-align: center; margin-bottom: 5mm;'>
//             <div>
//                 <img src='\${fatherImage}' alt="Father" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/>
//                 <p style='font-size: 6pt; margin: 0; font-weight: bold;'>Father</p>
//             </div>
//             <div>
//                 <img src='\${motherImage}' alt="Mother" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/>
//                 <p style='font-size: 6pt; margin: 0; font-weight: bold;'>Mother</p>
//             </div>
//             <div>
//                 <img src='\${guardianImage}' alt="Guardian" style='width: 18mm; height: 22mm; object-fit: cover; border: 1px solid #ccc; margin-bottom: 1mm; background-color: #f9f9f9;'/>
//                 <p style='font-size: 6pt; margin: 0; font-weight: bold;'>Guardian</p>
//             </div>
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
//   `);


//   // --- Helper Functions ---

//   // Improved Base64 Decoder
//   const decodeBase64 = useCallback((encoded) => {
//     try {
//       if (!encoded || typeof encoded !== 'string') {
//         console.warn("decodeBase64: Input is not a valid string.", encoded);
//         return null;
//       }
//       // Standard Base64 decoding
//       const binaryString = window.atob(encoded);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }
//       // Decode using UTF-8
//       const decoder = new TextDecoder('utf-8');
//       return decoder.decode(bytes);
//     } catch (error) {
//       console.error("Error decoding base64 string:", error, "Input:", encoded ? encoded.substring(0, 50) + '...' : 'undefined/null');
//       // Don't toast error here, let the calling function decide based on context
//       return null; // Indicate failure
//     }
//   }, []);


//   // --- API Fetching ---
//   const fetchTemplate = useCallback(async () => {
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         console.log("Fetched ID card design raw data:", response.designFormats[0]);
//         setIdCardData(response.designFormats[0]); // Store the first design format found
//       } else {
//         console.warn("No ID card design found in API response or response unsuccessful. Using default templates.");
//         toast.info("Using default ID card template."); // Inform user
//         setIdCardData(null); // Ensure it's null if fetch fails
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design:", error);
//       toast.error("Could not load custom ID card template. Using default.");
//       setIdCardData(null);
//     }
//   }, []); // No dependencies needed here unless getIDcarddesign needs session/schoolId

//   const fetchAllClasses = useCallback(async () => {
//     // No need for setIsLoader here, managed by initial loading state
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//         setClassData([]); // Ensure it's an empty array on failure
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("An error occurred while fetching classes.");
//       setClassData([]);
//     }
//   }, []); // No dependencies needed

//   const fetchAllStudents = useCallback(async () => {
//     // No need for setIsLoader here, managed by initial loading state
//     if (!session) {
//         toast.error("Session information is missing. Cannot fetch students.");
//         setStudentData([]);
//         setFilteredStudentData([]);
//         return;
//     }
//     try {
//       const response = await ActiveStudents(session); // Pass session if required by API
//       if (response?.success) {
//         const students = response.students?.data || [];
//         setStudentData(students);
//         setFilteredStudentData(students); // Initially show all students
//       } else {
//          toast.error(response?.message || "Failed to fetch students.");
//          setStudentData([]);
//          setFilteredStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     }
//   }, [session]); // Add session as dependency

//   // --- Effects ---

//   // Initial data fetch on component mount
//   useEffect(() => {
//     const loadInitialData = async () => {
//       setIsLoadingData(true);
//       // Fetch all data concurrently
//       await Promise.all([
//         fetchTemplate(),
//         fetchAllClasses(),
//         fetchAllStudents()
//       ]);
//       setIsLoadingData(false);
//     };
//     loadInitialData();
//   }, [fetchTemplate, fetchAllClasses, fetchAllStudents]); // Run only once on mount

//   // Filter students whenever filters or the base student data change
//   useEffect(() => {
//     // Avoid filtering when data is still loading initially
//     if (isLoadingData) return;

//     let filtered = studentData;

//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }

//     if (selectedSection) {
//       // Be careful with section comparison (e.g., null/undefined vs empty string)
//       filtered = filtered.filter(student => (student.section || null) === selectedSection);
//     }

//     if (filterName) {
//       const lowerCaseFilter = filterName.toLowerCase().trim();
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilter) ||
//         student.admissionNumber?.toLowerCase().includes(lowerCaseFilter) // Optional: Filter by admission number too
//       );
//     }

//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData, isLoadingData]); // Rerun when these change

//   // --- Event Handlers ---
//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);

//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection(""); // Reset section when class changes
//   };

//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   // --- Printing ---
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID_Cards_${selectedClass || 'AllClasses'}_${selectedSection || 'AllSections'}_${moment().format('YYYYMMDD')}`,
//     onBeforeGetContent: () => {
//       setIsLoader(true); // Use context loader for print process
//       return Promise.resolve(); // Required for async operations before print
//     },
//     onAfterPrint: () => {
//         setIsLoader(false);
//         toast.success("ID Cards prepared for printing/download!");
//     },
//     pageStyle: `
//       @page {
//         size: A4 portrait; /* Or landscape */
//         margin: 10mm; /* Adjust margins for your layout */
//       }
//       @media print {
//         body {
//           -webkit-print-color-adjust: exact !important; /* Force background colors/images */
//           print-color-adjust: exact !important;
//         }
//         .id-card-print-area { /* Container for all pairs */
//           display: flex !important;
//           flex-wrap: wrap !important;
//           gap: 5mm 2mm !important; /* Row gap and column gap between pairs */
//           justify-content: flex-start !important;
//         }
//         .id-card-pair { /* Wrapper for one student's front/back */
//            display: flex !important; /* Keep front/back side-by-side */
//            gap: 1mm !important; /* Minimal gap between front/back */
//            page-break-inside: avoid !important; /* CRUCIAL: Try to keep pair on same page */
//            margin: 0 !important; /* Reset margins */
//            padding: 0 !important;
//            border: none !important;
//         }
//         .id-card { /* Individual card (front or back) */
//           display: inline-block !important; /* Treat as block for layout */
//           vertical-align: top !important;
//           border: none !important; /* Hide screen borders */
//           width: 54mm !important; /* MUST match template dimensions */
//           height: 86mm !important; /* MUST match template dimensions */
//           overflow: hidden !important; /* Clip content */
//           box-sizing: border-box !important;
//           page-break-inside: avoid !important; /* Should be redundant due to pair rule, but safe */
//         }
//         /* Hide filter controls etc. during print */
//         .no-print {
//             display: none !important;
//         }
//       }
//     `,
//   });

//   // --- Template Rendering Logic ---

//   // Decode API templates using useMemo for caching
//   const decodedApiFrontTemplate = useMemo(() => {
//       if (idCardData?.frontTemplate) {
//           const decoded = decodeBase64(idCardData.frontTemplate);
//           if (decoded) {
//               // Optional: Attempt JSON parsing if templates are stored as JSON strings within Base64
//               try {
//                   if (decoded.startsWith('"') && decoded.endsWith('"')) {
//                       const parsed = JSON.parse(decoded);
//                       if (typeof parsed === 'string') {
//                           console.log("Decoded and JSON.parsed Front template.");
//                           return parsed; // Use the inner HTML string
//                       }
//                   }
//               } catch (e) { /* Ignore parse error, use decoded string */ }
//               console.log("Using decoded Front template (not JSON parsed).");
//               return decoded; // Use the directly decoded string
//           }
//            console.warn("Failed to decode Front template from API.");
//       }
//       return null; // Return null if no template or decoding failed
//   }, [idCardData, decodeBase64]);

//   const decodedApiBackTemplate = useMemo(() => {
//     if (idCardData?.backTemplate) {
//         const decoded = decodeBase64(idCardData.backTemplate);
//         if (decoded) {
//              // Optional: JSON parsing attempt
//             try {
//                 if (decoded.startsWith('"') && decoded.endsWith('"')) {
//                     const parsed = JSON.parse(decoded);
//                     if (typeof parsed === 'string') {
//                         console.log("Decoded and JSON.parsed Back template.");
//                         return parsed;
//                     }
//                 }
//             } catch (e) { /* Ignore */ }
//             console.log("Using decoded Back template (not JSON parsed).");
//             return decoded;
//         }
//         console.warn("Failed to decode Back template from API.");
//     }
//     return null;
//   }, [idCardData, decodeBase64]);

//   // Select the final templates to use (API version or default fallback)
//   const frontTemplateToUse = decodedApiFrontTemplate || defaultFrontTemplate;
//   const backTemplateToUse = decodedApiBackTemplate || defaultBackTemplate;

//   // --- Template Rendering Functions ---

//   // Centralized function to replace placeholders
//   const replacePlaceholders = (template, data, cardSide) => {
//       let renderedHtml = template;
//       try {
//           renderedHtml = template.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//               const cleanKey = key.trim();
//               if (data.hasOwnProperty(cleanKey)) {
//                   // Return value, ensuring null/undefined become empty string
//                   return String(data[cleanKey] ?? '');
//               } else {
//                   // Log missing placeholder only once per key per side maybe? Or just ignore.
//                   // console.warn(`Placeholder \${${cleanKey}} not found in ${cardSide} data.`);
//                   return ''; // Return empty string for missing keys
//               }
//           });
//       } catch (error) {
//           console.error(`Error during ${cardSide} template placeholder replacement:`, error);
//           // Return an error message div matching card dimensions
//           renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid; box-sizing: border-box;'>${cardSide} Template Error</div>`;
//       }
//       return renderedHtml;
//   };

//   // Renders the FRONT card using the selected template
//   const renderFrontTemplate = useCallback((student) => {
//     const data = {
//       backgroundImage: idCardData?.frontImage?.url || "", // Use FRONT background image URL
//       studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Image",
//       name: student?.studentName?.toUpperCase() || 'N/A',
//       dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//       class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//       section: student?.section || '',
//       father_name: student?.fatherName?.toUpperCase() || 'N/A',
//       mother_name: student?.motherName?.toUpperCase() || 'N/A', // Added mother's name
//       mobile: student?.contact || student?.parentContact || 'N/A', // Prioritize student contact, fallback to parent
//       address: student?.address || 'N/A',
//       session: student?.session || 'N/A',
//       admissionNumber: student?.admissionNumber || 'N/A',
//       // Add any other placeholders relevant for the front card based on templates
//     };
//     return replacePlaceholders(frontTemplateToUse, data, 'Front');
//   }, [idCardData, frontTemplateToUse]); // Depends on fetched data and selected template

//   // Renders the BACK card using the selected template
//   const renderBackTemplate = useCallback((student) => {
//       const placeholderPersonImage = "https://via.placeholder.com/60x70.png?text=N/A"; // Generic placeholder
//       const data = {
//         backgroundImage: idCardData?.backImage?.url || "", // Use BACK background image URL
//         // Include details often found on the back
//         fatherImage: student?.fatherImage?.url || placeholderPersonImage,
//         motherImage: student?.motherImage?.url || placeholderPersonImage,
//         guardianImage: student?.guardianImage?.url || placeholderPersonImage,
//         session: student?.session || 'N/A',
//         admissionNumber: student?.admissionNumber || 'N/A',
//         guardianname: student?.guardianName || 'N/A',
//         parentContact: student?.parentContact || 'N/A', // Parent contact often on back
//         address: student?.address || 'N/A', // Address might be repeated or more detailed
//         dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A', // DOB might be on back too
//          // Add other placeholders like emergency contact, blood group, etc. if needed
//          name: student?.studentName || 'N/A', // Name might be repeated
//          class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A', // Class might be repeated
//       };
//       return replacePlaceholders(backTemplateToUse, data, 'Back');
//   }, [idCardData, backTemplateToUse]); // Depends on fetched data and selected template


//   // --- Options for Select Components ---
//   const classOptions = useMemo(() => classData.map(cls => ({ label: cls.className, value: cls.className })), [classData]);
//   const sectionOptions = useMemo(() => {
//       const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//       return selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];
//   }, [classData, selectedClass]);

//   // --- JSX ---
//   return (
//     <>
//       <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//         <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//           Generate Student ID Cards
//         </Typography>

//         {/* Filter Controls Area */}
//         <Box className="no-print"> {/* Add no-print class to hide filters during printing */}
//           <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//             <Grid item xs={12} sm={6} md={3}>
//               <ReactSelect
//                 name="class"
//                 value={selectedClass}
//                 handleChange={handleClassChange}
//                 label="Select Class"
//                 dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} // Add "All Classes" option
//                 placeholder="Filter by Class"
//                 isDisabled={isLoadingData} // Disable while loading
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <ReactSelect
//                 name="section"
//                 value={selectedSection}
//                 handleChange={handleSectionChange}
//                 label="Select Section"
//                 dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} // Add "All Sections" option
//                 disabled={!selectedClass || sectionOptions.length === 0 || isLoadingData} // Disable if no class selected or loading
//                 placeholder="Filter by Section"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <TextField
//                 id="filter-name"
//                 label="Filter by Name / Adm. No."
//                 variant="outlined"
//                 onChange={handleFilterByNameChange}
//                 value={filterName}
//                 fullWidth
//                 size="small" // Match ReactSelect height better
//                 disabled={isLoadingData} // Disable while loading
//                  sx={{ height: '100%' }} // Ensure consistent height if needed
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
//               <Button
//                 variant="contained"
//                 onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, color: 'white' }}
//                 fullWidth
//                 disabled={filteredStudentData.length === 0 || isLoader || isLoadingData} // Disable if no students, or printing, or loading
//                 sx={{ height: '40px' }} // Fixed height for button
//                 startIcon={isLoader ? <CircularProgress size={20} color="inherit" /> : null} // Show spinner when printing
//               >
//                 {isLoader ? "Printing..." : `Print IDs (${filteredStudentData.length})`}
//               </Button>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Printable Area - This div's content will be printed */}
//         <div ref={componentPDF} style={{ marginTop: '20px' }}>
//           <div className="id-card-print-area" style={{ /* On-screen styles are minimal, print styles handle layout */ }}>
//             {isLoadingData ? (
//                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
//                  <CircularProgress />
//                  <Typography sx={{ ml: 2 }}>Loading student data...</Typography>
//                </Box>
//             ) : filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student) => (
//                 // --- Wrapper for Front & Back Pair ---
//                 <div key={student?._id || student?.studentId} className="id-card-pair" style={{
//                     display: 'inline-flex', // Use inline-flex for on-screen wrapping with gap
//                     gap: '1mm', // On-screen gap between front and back
//                     marginBottom: '10mm', // On-screen gap between rows
//                     verticalAlign: 'top',
                    
//                     marginRight:"10px"// Align pairs nicely if they wrap
//                     // Print styles handle the rest
//                 }}>
//                    {/* --- Front Card --- */}
//                    <div
//                      className="id-card id-card-front"
//                      style={{
//                          border: '1px dashed #ccc', // Optional on-screen border
//                          width: '54mm',
//                          height: '86mm',
//                          overflow: 'hidden'
//                      }}
//                      dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }}
//                    />

//                    {/* --- Back Card --- */}
//                    <div
//                      className="id-card id-card-back"
//                      style={{
//                          border: '1px dashed #aaa', // Optional on-screen border
//                          width: '54mm',
//                          height: '86mm',
//                          overflow: 'hidden'
//                      }}
//                      dangerouslySetInnerHTML={{ __html: renderBackTemplate(student) }}
//                    />
//                 </div>
//                 // --- End Wrapper ---
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5, color: 'text.secondary' }}>
//                 {studentData.length > 0 ? "No students match the current filters." : "No active students found."}
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>
//     </>
//   );
// };

// export default IdCard;


// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"; // Added useMemo
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";

// const IdCard = () => {
//   // --- State Variables ---
//   const [idCardData, setIdCardData] = useState(null);
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");

//   // --- Context and Refs ---
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { currentColor, setIsLoader } = useStateContext();
//   const componentPDF = useRef();

//   // --- Default Template (Fallback) ---
//   const [defaultTemplate] = useState(`
//     <div style='background-color: #f0f0f0;
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size: cover;
//                 border: 1px solid #ccc;
//                 font-family: Arial, sans-serif;
//                 overflow: hidden;
//                 page-break-inside: avoid;
//                 box-sizing: border-box;'>

//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>

//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'>
//              <h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3>
//           </div>

//           <div style='margin: 0 auto;
//                       margin-top: 5px;
//                       width: 30mm;
//                       height: 35mm;
//                       border: 1px solid #aaa;
//                       border-radius: 4px;
//                       overflow: hidden;
//                       background-color: #eee;
//                       display: flex;
//                       justify-content: center;
//                       align-items: center;'>
//             <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/>
//           </div>

//           <div style='margin-top: 8mm;
//                       padding-left: 2mm;
//                       padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               NAME<span style="float: right;">: \${name}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               CLASS<span style="float: right;">: \${class}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               F.NAME<span style="float: right;">: \${father_name}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               PHONE<span style="float: right;">: \${mobile}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>
//               ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal;">: \${address}</span>
//             </p>
//           </div>
//       </div>
//     </div>
//   `);

//   // --- Helper Functions ---

//   // Improved Base64 Decoder (using useCallback for stability if passed as prop/dependency)
//   const decodeBase64 = useCallback((encoded) => {
//     try {
//       if (!encoded || typeof encoded !== 'string') {
//         return null;
//       }
//       const binaryString = window.atob(encoded);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }
//       const decoder = new TextDecoder('utf-8');
//       return decoder.decode(bytes);
//     } catch (error) {
//       console.error("Error decoding base64 string:", error, "Input:", encoded ? encoded.substring(0, 50) + '...' : 'undefined');
//       toast.error("Failed to decode custom ID card template.");
//       return null;
//     }
//   }, []);


//   // --- API Fetching ---
//   const fetchTemplate = useCallback(async () => {
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         console.log("Fetched ID card design raw data:", response.designFormats[0]); // Log raw fetched data
//         setIdCardData(response.designFormats[0]);
//       } else {
//         console.warn("No ID card design found in API response or response unsuccessful.");
//         setIdCardData(null);
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design:", error);
//       toast.error("Could not load custom ID card template.");
//       setIdCardData(null);
//     }
//   }, []);

//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("An error occurred while fetching classes.");
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   const fetchAllStudents = useCallback(async () => {
  
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success) {
//         const students = response.students?.data || [];
//         setStudentData(students);
//         setFilteredStudentData(students);
//       } else {
//          toast.error(response?.message || "Failed to fetch students.");
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//     } finally {
//       setIsLoader(false);
//     }
//   }, [session, setIsLoader]);

//   // --- Effects ---

//   // Initial data fetch
//   useEffect(() => {
//     fetchTemplate();
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//   // Filter students when filters or student data change
//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter(student => (student.section || "") === selectedSection);
//     }
//     if (filterName) {
//       const lowerCaseFilter = filterName.toLowerCase().trim();
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilter)
//       );
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData]);

//   // --- Event Handlers ---
//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);

//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };

//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   // --- Printing ---
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID_Cards_${selectedClass || 'AllClasses'}_${selectedSection || 'AllSections'}`,
//     onBeforeGetContent: () => setIsLoader(true),
//     onAfterPrint: () => {
//         setIsLoader(false);
//         toast.success("ID Cards prepared for printing!");
//     },
//     pageStyle: `
//       @page {
//         size: A4 portrait;
//         margin: 15mm;
//       }
//       @media print {
//         body {
//           -webkit-print-color-adjust: exact;
//           print-color-adjust: exact;
//         }
//         .id-card-container {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 5mm;
//           justify-content: flex-start;
//         }
//         .id-card {
//           page-break-inside: avoid !important;
//           display: inline-block;
//           vertical-align: top;
//           border: none !important;
//         }
//       }
//     `,
//   });

//   // --- Template Rendering Logic ---

//   // Decode the API template and attempt to parse if needed
//   const decodedApiTemplate = useMemo(() => { // Changed from React.useMemo to useMemo
//       if (idCardData?.frontTemplate) {
//           console.log("Attempting to decode API template...");
//           const decoded = decodeBase64(idCardData.frontTemplate);
//           if (decoded) {
//               // *** ATTEMPT JSON PARSING FOR DOUBLE-ESCAPED STRINGS ***
//               try {
//                   // Check if it looks like a JSON string (starts/ends with quotes)
//                   if (decoded.startsWith('"') && decoded.endsWith('"')) {
//                       const parsed = JSON.parse(decoded);
//                       // Ensure the parsed result is the actual HTML string
//                       if (typeof parsed === 'string') {
//                           console.log("Successfully JSON.parsed the decoded template.");
//                           return parsed; // Use the inner HTML string
//                       } else {
//                          console.warn("JSON.parsed result was not a string, using decoded value.");
//                          return decoded; // Parsed something else, use original decoded
//                       }
//                   }
//                   // If not JSON-like, return the decoded string as is
//                   console.log("Decoded template does not appear JSON-encoded, using as is.");
//                   return decoded;
//               } catch (e) {
//                   console.warn("Decoded template was not valid JSON, using as-is.", e);
//                   return decoded; // Fallback to the raw decoded string on parse error
//               }
//           } else {
//              console.log("Decoding returned null.");
//           }
//       }
//       console.log("No API frontTemplate found or idCardData is null.");
//       return null; // Return null if no template or decoding failed
//   }, [idCardData, decodeBase64]); // Dependencies: idCardData, decodeBase64

//   // Select the template to use (Parsed/Decoded API template or default)
//   const templateToUse = decodedApiTemplate || defaultTemplate;
//   // const templateToUse = decodedApiTemplate || defaultTemplate;

//   // Function to replace placeholders in the chosen template
//   const renderTemplate = (template, student) => {
//     const data = {
//       backgroundImage: idCardData?.frontImage?.url || "",
//       studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Image",
//       name: student?.studentName?.toUpperCase() || 'N/A',
//         dob:   moment(student?.dateOfBirth).format("DD-MM-YYYY")|| 'N/A',
//       class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//       father_name: student?.fatherName?.toUpperCase() || 'N/A',
//       mobile: student?.contact || 'N/A',
//       address: student?.address || 'N/A'
//     };

//     let renderedHtml = template; // Should be clean HTML string now
//     try {
//       // Replace placeholders like ${key}
//       renderedHtml = template.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//         const cleanKey = key.trim();
//         if (data.hasOwnProperty(cleanKey)) {
//           return String(data[cleanKey] ?? '');
//         } else {
//           // console.warn(`Placeholder \${${cleanKey}} not found in data for student ${student?.studentName}`);
//           return ''; // Return empty for missing keys
//         }
//       });
//     } catch (error) {
//       console.error("Error during template placeholder replacement:", error);
//       renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid;'>Template Error</div>`;
//     }
//     // console.log(`Final HTML for ${student?.studentName}:`, renderedHtml.substring(0,100) + '...'); // Log start of final HTML
//     return renderedHtml;
//   };

//   // --- Options for Select Components ---
//   const classOptions = classData.map(cls => ({ label: cls.className, value: cls.className }));
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];

//   // --- JSX ---
//   return (
//     <>
//       <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//         <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//           Generate Student ID Cards
//         </Typography>

//         {/* Filter Controls */}
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//               placeholder="Filter by Class"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//               disabled={!selectedClass || sectionOptions.length === 0}
//               placeholder="Filter by Section"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//               size="small"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor, color: 'white' }}
//               fullWidth
//               disabled={filteredStudentData.length === 0 || setIsLoader.isLoading}
//               sx={{ height: '100%', maxHeight: '40px' }}
//             >
//               Download / Print IDs
//             </Button>
//           </Grid>
//         </Grid>

//         {/* Printable Area */}
//         <div ref={componentPDF} style={{ marginTop: '20px' }}>
//           {/* Container for cards with print styles applied via useReactToPrint */}
//           <div className="id-card-container" style={{
//               display: 'flex',
//               flexWrap: 'wrap',
//               gap: '15px', // On-screen gap
//               padding: '10px'
//           }}>
//             {filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student, index) => (
//                 <div
//                   key={student?._id || index}
//                   className="id-card" // Class for print styling and targeting
//                   style={{ border: '1px dashed #eee' }} // Optional on-screen border
//                   dangerouslySetInnerHTML={{ __html: renderTemplate(templateToUse, student) }}
//                 />
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5, color: 'text.secondary' }}>
//                 {studentData.length === 0 && !setIsLoader.isLoading ? "No students found in the system." :
//                  !setIsLoader.isLoading ? "No students match the current filters." : "Loading students..."}
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>
//     </>
//   );
// };

// export default IdCard;

// import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"; // Added useMemo
// import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path if needed
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi"; // Adjust path if needed
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Adjust path if needed
// import { toast } from "react-toastify";
// import moment from "moment";

// const IdCard = () => {
//   // --- State Variables ---
//   const [idCardData, setIdCardData] = useState(null);
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");

//   // --- Context and Refs ---
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { currentColor, setIsLoader } = useStateContext();
//   const componentPDF = useRef();

//   // --- Default Template (Fallback) ---
//   const [defaultTemplate] = useState(`
//     <div style='background-color: #f0f0f0;
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size: cover;
//                 border: 1px solid #ccc;
//                 font-family: Arial, sans-serif;
//                 overflow: hidden;
//                 page-break-inside: avoid;
//                 box-sizing: border-box;'>

//       <div style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url(\${backgroundImage}); background-size: cover; background-position: center; z-index: 1;'></div>

//       <div style='position: relative; z-index: 2; padding: 5px;'>
//           <div style='text-align: center; margin-top: 10px; margin-bottom: 5px;'>
//              <h3 style='margin: 0; font-size: 8pt; color: #333;'>SCHOOL NAME HERE</h3>
//           </div>

//           <div style='margin: 0 auto;
//                       margin-top: 5px;
//                       width: 30mm;
//                       height: 35mm;
//                       border: 1px solid #aaa;
//                       border-radius: 4px;
//                       overflow: hidden;
//                       background-color: #eee;
//                       display: flex;
//                       justify-content: center;
//                       align-items: center;'>
//             <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Photo"/>
//           </div>

//           <div style='margin-top: 8mm;
//                       padding-left: 2mm;
//                       padding-right: 2mm;'>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               NAME<span style="float: right;">: \${name}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               CLASS<span style="float: right;">: \${class}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               F.NAME<span style="float: right;">: \${father_name}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//               PHONE<span style="float: right;">: \${mobile}</span>
//             </p>
//             <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: #000; font-weight: bold; line-height: 1.2;'>
//               ADDR.<span style="float: right; width: 70%; text-align: right; white-space: normal;">: \${address}</span>
//             </p>
//           </div>
//       </div>
//     </div>
//   `);

//   // --- Helper Functions ---

//   // Improved Base64 Decoder (using useCallback for stability if passed as prop/dependency)
//   const decodeBase64 = useCallback((encoded) => {
//     try {
//       if (!encoded || typeof encoded !== 'string') {
//         return null;
//       }
//       const binaryString = window.atob(encoded);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }
//       const decoder = new TextDecoder('utf-8');
//       return decoder.decode(bytes);
//     } catch (error) {
//       console.error("Error decoding base64 string:", error, "Input:", encoded ? encoded.substring(0, 50) + '...' : 'undefined');
//       toast.error("Failed to decode custom ID card template.");
//       return null;
//     }
//   }, []);


//   // --- API Fetching ---
//   const fetchTemplate = useCallback(async () => {
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         console.log("Fetched ID card design raw data:", response.designFormats[0]); // Log raw fetched data
//         setIdCardData(response.designFormats[0]);
//       } else {
//         console.warn("No ID card design found in API response or response unsuccessful.");
//         setIdCardData(null);
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design:", error);
//       toast.error("Could not load custom ID card template.");
//       setIdCardData(null);
//     }
//   }, []);

//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("An error occurred while fetching classes.");
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   const fetchAllStudents = useCallback(async () => {
  
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success) {
//         const students = response.students?.data || [];
//         setStudentData(students);
//         setFilteredStudentData(students);
//       } else {
//          toast.error(response?.message || "Failed to fetch students.");
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("An error occurred while fetching students.");
//     } finally {
//       setIsLoader(false);
//     }
//   }, [session, setIsLoader]);

//   // --- Effects ---

//   // Initial data fetch
//   useEffect(() => {
//     fetchTemplate();
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchTemplate, fetchAllClasses, fetchAllStudents]);

//   // Filter students when filters or student data change
//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter(student => (student.section || "") === selectedSection);
//     }
//     if (filterName) {
//       const lowerCaseFilter = filterName.toLowerCase().trim();
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilter)
//       );
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData]);

//   // --- Event Handlers ---
//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);

//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };

//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   // --- Printing ---
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID_Cards_${selectedClass || 'AllClasses'}_${selectedSection || 'AllSections'}`,
//     onBeforeGetContent: () => setIsLoader(true),
//     onAfterPrint: () => {
//         setIsLoader(false);
//         toast.success("ID Cards prepared for printing!");
//     },
//     pageStyle: `
//       @page {
//         size: A4 portrait;
//         margin: 15mm;
//       }
//       @media print {
//         body {
//           -webkit-print-color-adjust: exact;
//           print-color-adjust: exact;
//         }
//         .id-card-container {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 5mm;
//           justify-content: flex-start;
//         }
//         .id-card {
//           page-break-inside: avoid !important;
//           display: inline-block;
//           vertical-align: top;
//           border: none !important;
//         }
//       }
//     `,
//   });

//   // --- Template Rendering Logic ---

//   // Decode the API template and attempt to parse if needed
//   const decodedApiTemplate = useMemo(() => { // Changed from React.useMemo to useMemo
//       if (idCardData?.frontTemplate) {
//           console.log("Attempting to decode API template...");
//           const decoded = decodeBase64(idCardData.frontTemplate);
//           if (decoded) {
//               // *** ATTEMPT JSON PARSING FOR DOUBLE-ESCAPED STRINGS ***
//               try {
//                   // Check if it looks like a JSON string (starts/ends with quotes)
//                   if (decoded.startsWith('"') && decoded.endsWith('"')) {
//                       const parsed = JSON.parse(decoded);
//                       // Ensure the parsed result is the actual HTML string
//                       if (typeof parsed === 'string') {
//                           console.log("Successfully JSON.parsed the decoded template.");
//                           return parsed; // Use the inner HTML string
//                       } else {
//                          console.warn("JSON.parsed result was not a string, using decoded value.");
//                          return decoded; // Parsed something else, use original decoded
//                       }
//                   }
//                   // If not JSON-like, return the decoded string as is
//                   console.log("Decoded template does not appear JSON-encoded, using as is.");
//                   return decoded;
//               } catch (e) {
//                   console.warn("Decoded template was not valid JSON, using as-is.", e);
//                   return decoded; // Fallback to the raw decoded string on parse error
//               }
//           } else {
//              console.log("Decoding returned null.");
//           }
//       }
//       console.log("No API frontTemplate found or idCardData is null.");
//       return null; // Return null if no template or decoding failed
//   }, [idCardData, decodeBase64]); // Dependencies: idCardData, decodeBase64

//   // Select the template to use (Parsed/Decoded API template or default)
//   const templateToUse = decodedApiTemplate || defaultTemplate;
//   // const templateToUse = decodedApiTemplate || defaultTemplate;

//   // Function to replace placeholders in the chosen template
//   const renderTemplate = (template, student) => {
//     const data = {
//       backgroundImage: idCardData?.frontImage?.url || "",
//       studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Image",
//       name: student?.studentName?.toUpperCase() || 'N/A',
//         dob:   moment(student?.dateOfBirth).format("DD-MM-YYYY")|| 'N/A',
//       class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//       father_name: student?.fatherName?.toUpperCase() || 'N/A',
//       mobile: student?.contact || 'N/A',
//       address: student?.address || 'N/A'
//     };

//     let renderedHtml = template; // Should be clean HTML string now
//     try {
//       // Replace placeholders like ${key}
//       renderedHtml = template.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//         const cleanKey = key.trim();
//         if (data.hasOwnProperty(cleanKey)) {
//           return String(data[cleanKey] ?? '');
//         } else {
//           // console.warn(`Placeholder \${${cleanKey}} not found in data for student ${student?.studentName}`);
//           return ''; // Return empty for missing keys
//         }
//       });
//     } catch (error) {
//       console.error("Error during template placeholder replacement:", error);
//       renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid;'>Template Error</div>`;
//     }
//     // console.log(`Final HTML for ${student?.studentName}:`, renderedHtml.substring(0,100) + '...'); // Log start of final HTML
//     return renderedHtml;
//   };

//   // --- Options for Select Components ---
//   const classOptions = classData.map(cls => ({ label: cls.className, value: cls.className }));
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];

//   // --- JSX ---
//   return (
//     <>
//       <Box sx={{ padding: 2, backgroundColor: '#fff', borderRadius: 1, boxShadow: 1 }}>
//         <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
//           Generate Student ID Cards
//         </Typography>

//         {/* Filter Controls */}
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//               placeholder="Filter by Class"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//               disabled={!selectedClass || sectionOptions.length === 0}
//               placeholder="Filter by Section"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//               size="small"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor, color: 'white' }}
//               fullWidth
//               disabled={filteredStudentData.length === 0 || setIsLoader.isLoading}
//               sx={{ height: '100%', maxHeight: '40px' }}
//             >
//               Download / Print IDs
//             </Button>
//           </Grid>
//         </Grid>

//         {/* Printable Area */}
//         <div ref={componentPDF} style={{ marginTop: '20px' }}>
//           {/* Container for cards with print styles applied via useReactToPrint */}
//           <div className="id-card-container" style={{
//               display: 'flex',
//               flexWrap: 'wrap',
//               gap: '15px', // On-screen gap
//               padding: '10px'
//           }}>
//             {filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student, index) => (
//                 <div
//                   key={student?._id || index}
//                   className="id-card" // Class for print styling and targeting
//                   style={{ border: '1px dashed #eee' }} // Optional on-screen border
//                   dangerouslySetInnerHTML={{ __html: renderTemplate(templateToUse, student) }}
//                 />
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5, color: 'text.secondary' }}>
//                 {studentData.length === 0 && !setIsLoader.isLoading ? "No students found in the system." :
//                  !setIsLoader.isLoading ? "No students match the current filters." : "Loading students..."}
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>
//     </>
//   );
// };

// export default IdCard;


// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";

// const IdCard = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { currentColor, setIsLoader } = useStateContext();

//   const [idCardData, setIdCardData] = useState();
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const componentPDF = useRef();

//   const [defaultTemplate] = useState(`
//     <div style='background-image:url(\${backgroundImage});
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size:cover;
//                 border:1px solid'>
      
//       <div style='margin-left: 40px;
//                   margin-top: 82px;
//                   width: 85px;
//                   height: 95px;
//                   border: 0.5px solid #ff0000;
//                   border-radius: 4px;
//                   overflow:hidden;
//                   position:absolute;
//                   background-color: #eee;'> 
//         <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student Photo"/>
//       </div>
    
//       <div style='position: absolute; left: 3px; top: 190px; width: calc(100% - 6px);'> 
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'> 
//           NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase;'>
//           Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   const fetchTemplate = async () => {
//     try {
//       const response = await getIDcarddesign();
//       if (response?.success && response?.designFormats?.length > 0) {
//         setIdCardData(response.designFormats[0]);
//         console.log("response.designFormats[0]",response.designFormats[0])
//       } else {
//         toast.error("No ID card design found");
//       }
//     } catch (error) {
//       console.error("Error fetching ID card design", error);
//       toast.error("Failed to load ID card template");
//     }
//   };

//   useEffect(() => {
//     fetchTemplate();
//   }, []);

//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setClassData(response.classes || []);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error fetching classes");
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success) {
//         const students = response.students?.data || [];
//         setStudentData(students);
//         setFilteredStudentData(students);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error fetching students");
//     } finally {
//       setIsLoader(false);
//     }
//   }, [session, setIsLoader]);

//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter(student => student.section === selectedSection);
//     }
//     if (filterName) {
//       const lower = filterName.toLowerCase();
//       filtered = filtered.filter(student => student.studentName?.toLowerCase().includes(lower));
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData]);

//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`,
//     onAfterPrint: () => toast.success("PDF Generated Successfully!")
//   });

//   const cleanTemplate = (text) => {
//     if (!text) return "";
//     return text.replace(/\\n/g, "")
//                .replace(/\\"/g, '"')
//                .replace(/\\\\/g, '\\');
//   };
// console.log("idCardData.content",idCardData)
// console.log("cleanTemplate",cleanTemplate)
//   const renderTemplate = (template, student) => {
//     const data = {
//       backgroundImage: idCardData?.frontImage?.url,
//       studentImage: student.studentImage?.url || "https://via.placeholder.com/85x95?text=No+Image",
//       name: student.studentName || '',
//       class: `${student.class}${student.section ? ` - ${student.section}` : ''}`,
//       father_name: student.fatherName || '',
//       mobile: student.contact ? `+91${student.contact}` : 'N/A',
//       address: student.address || ''
//     };
//     return template.replace(/\$\{(.*?)\}/g, (_, key) => data[key.trim()] || '');
//   };

//   const templateToUse = idCardData?.frontTemplate ? cleanTemplate(idCardData.frontTemplate) : defaultTemplate;

//   const classOptions = classData.map(cls => ({ label: cls.className, value: cls.className }));
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];

//   return (
//     <>
//       <Box sx={{ padding: 2 }}>
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//               placeholder="Select Class"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//               disabled={!selectedClass}
//               placeholder="Select Section"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }}
//               fullWidth
//               disabled={filteredStudentData.length === 0}
//               sx={{ height: '100%' }}
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap gap-4">
//             {filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index}
//                   className="id-card"
//                   dangerouslySetInnerHTML={{ __html: renderTemplate(templateToUse, student) }}
//                 />
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5 }}>
//                 No students found matching the criteria.
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>

//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape;
//             margin-top: 20px;
//           }
//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding: 10px;
//           }
//           .id-card {
//             page-break-inside: avoid;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default IdCard;





// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { ActiveStudents, AdminGetAllClasses, getIDcarddesign } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";

// const IdCard = () => {
//   const session=JSON.parse(localStorage.getItem("session"))
//   const [idCardData,setIdCardData]=useState()
//   const { currentColor, setIsLoader } = useStateContext();
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const componentPDF = useRef();
//   const base64Text = idCardData?.content;
//   let decoded = atob(base64Text);
// // Clean up the result
// decoded = decoded.replace(/\\n/g, "").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
// console.log("decoded",decoded)
//   // Template for front side
//   const [frontTemplate] = useState(`
//     <div style='background-image:url(\${backgroundImage});
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size:cover;
//                 border:1px solid'>
      
//       <div style='margin-left: 40px;
//                   margin-top: 82px;
//                   width: 85px;
//                   height: 95px;
//                   border: 0.5px solid #ff0000;
//                   border-radius: 4px;
//                   overflow:hidden;
//                   position:absolute;
//                   background-color: #eee;'> 
//         <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student Photo"/>
//       </div>
    
//       <div style='position: absolute; left: 3px; top: 190px; width: calc(100% - 6px);'> 
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'> 
//           NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase;'>
//           Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   const getTemplate=async()=>{
//     try {
//       const response=await getIDcarddesign()
//       if(response?.success){
//         console.log("response",response)
//         let responsedata=response?.designFormats[0]
//         console.log("responsedata",responsedata)
//         setIdCardData(responsedata)
//       }
//     } catch (error) {
      
//     }
//   }
//   useEffect(()=>{
//     getTemplate()
//   },[])
//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success && Array.isArray(response.classes)) {
//         setClassData(response.classes);
//       } else {
//         toast.error("Failed to fetch classes or invalid format");
//         setClassData([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching classes");
//       setClassData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success && Array.isArray(response?.students?.data)) {
//         setStudentData(response?.students?.data);
//         setFilteredStudentData(response?.students?.data);
//       } else {
//         toast.error("Failed to fetch students or invalid format");
//         setStudentData([]);
//         setFilteredStudentData([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching students");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) filtered = filtered.filter(student => student.class === selectedClass);
//     if (selectedSection) filtered = filtered.filter(student => student.section === selectedSection);
//     if (filterName) {
//       const lower = filterName.toLowerCase();
//       filtered = filtered.filter(student => student.studentName?.toLowerCase().includes(lower));
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData]);

//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   const classOptions = classData.map(cls => ({ label: cls.className, value: cls.className }));
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`,
//     onAfterPrint: () => toast.success("PDF Generated/Printed Successfully!")
//   });

//   const renderTemplate = (template, student) => {
//     const data = {
//       backgroundImage: idCardData?.backgroundImage?.url,
//       // backgroundImage: bg,
//       studentImage: student.studentImage?.url || "https://via.placeholder.com/85x95?text=No+Image",
//       name: student.studentName || '',
//       class: `${student.class}${student.section ? ` - ${student.section}` : ''}`,
//       father_name: student.fatherName || '',
//       mobile: student.contact ? `+91${student.contact}` : 'N/A',
//       address: student.address || ''
//     };
//     return template.replace(/\$\{(.*?)\}/g, (_, key) => data[key.trim()] || '');
//   };

//   return (
//     <>
//       <Box sx={{ padding: 2 }}>
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//               placeholder="Select Class"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//               disabled={!selectedClass || sectionOptions.length === 0}
//               placeholder="Select Section"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }}
//               fullWidth
//               disabled={filteredStudentData.length === 0}
//               sx={{ height: '100%' }}
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap gap-4">
//           {/* <div className="id-card-container flex flex-wrap justify-center gap-4"> */}
//             {filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index}
//                   className="id-card"
//                   // dangerouslySetInnerHTML={{ __html: renderTemplate(idCardData?., student) }}
//                   dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }}
//                 />
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5 }}>
//                 No students found matching the criteria.
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>

//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape;
//             margin-top: 20px;
//           }
//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding: 10px;
//           }
//           .id-card {
//             page-break-inside: avoid;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default IdCard;






// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Assuming ContextProvider provides setIsLoader and currentColor
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material"; // Added Typography and Box for better layout
// import bg from "../../ShikshMitraWebsite/kushidcrad.jpeg"; // Ensure this path is correct
// // import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg"; // Ensure this path is correct
// import { ActiveStudents, AdminGetAllClasses, getAllStudents } from "../../Network/AdminApi"; // Ensure these API functions are correct
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Ensure this component exists and works as expected
// import { toast } from "react-toastify";
// import moment from "moment/moment";

// const IdCard = () => {
//   // Use context state
//   const session=JSON.parse(localStorage.getItem("session"))
//   const { currentColor, setIsLoader } = useStateContext();

//   // State for data
//   const [studentData, setStudentData] = useState([]); // Full list of students
//   const [classData, setClassData] = useState([]); // Fetched class data (class name, sections, etc.)
//   const [filteredStudentData, setFilteredStudentData] = useState([]); // Students to display/print

//   // State for filters
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");

//   // Ref for printing
//   const componentPDF = useRef();

//   // --- Data Fetching ---

//   // Fetch Class Data
//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success && Array.isArray(response.classes)) {
//         // Use 'className' based on your provided structure
//         setClassData(response.classes);
//       } else {
//         toast.error("Failed to fetch classes or invalid format");
//         setClassData([]); // Ensure it's an array even on failure
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("Error fetching classes");
//       setClassData([]); // Ensure it's an array on error
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]); // Dependency on setIsLoader

//   // Fetch Student Data
//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       if (response?.success && Array.isArray(response?.students?.data)) {
//         setStudentData(response?.students?.data);
//         setFilteredStudentData(response?.students?.data); // Initially show all
//       } else {
//         toast.error("Failed to fetch students or invalid format");
//         setStudentData([]);
//         setFilteredStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("Error fetching students");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]); // Dependency on setIsLoader

//   // Initial data fetching on component mount
//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]); // Add fetch functions as dependencies

//   // --- Filtering Logic ---

//   // Filter students whenever dependencies change
//   useEffect(() => {
//     console.log("studentData",studentData)
//     let filtered = studentData;

//     // Filter by Class
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }

//     // Filter by Section (only if a class is selected)
//     if (selectedClass && selectedSection) {
//       filtered = filtered.filter(student => student.section === selectedSection);
//     }

//     // Filter by Name
//     if (filterName) {
//       const lowerCaseFilterName = filterName.toLowerCase();
//       // Use studentName as per your data structure
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilterName)
//       );
//     }
// // console.log("filtered",filtered)
//     setFilteredStudentData(filtered);

//   }, [selectedClass, selectedSection, filterName, studentData]); // Dependencies for filtering

//   // --- Event Handlers ---

//   const handleFilterByNameChange = (e) => {
//     setFilterName(e.target.value);
//   };

//   const handleClassChange = (e) => {
//     const newClass = e.target.value;
//     setSelectedClass(newClass);
//     setSelectedSection(""); // Reset section when class changes
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };

//   // --- Dropdown Options ---

//   // Prepare class options for ReactSelect
//   const classOptions = classData.map(cls => ({
//     label: cls.className, // Use className from your data structure
//     value: cls.className,
//   }));

//   // Prepare section options based on selected class
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({
//     label: sec,
//     value: sec,
//   })) || [];

//   // --- PDF Generation ---

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`, // Dynamic title
//     onBeforeGetContent: () => {
//       // Optional: Add any temporary changes needed just before printing
//       return Promise.resolve();
//     },
//     onAfterPrint: () => {
//       toast.success("PDF Generated/Printed Successfully!");
//     },
//     // Consider adding error handling if useReactToPrint supports it
//   });


//   return (
//     <>
//       <Box sx={{ padding: 2 }}> {/* Add some padding around the controls */}
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>

//         {/* Filter Controls */}
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           {/* Class Select */}
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} // Add "All" option
//               placeholder="Select Class" // Add placeholder
//             />
//           </Grid>

//           {/* Section Select */}
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} // Add "All" option
//               disabled={!selectedClass || sectionOptions.length === 0} // Disable if no class or no sections
//               placeholder="Select Section" // Add placeholder
//             />
//           </Grid>

//           {/* Name Filter */}
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined" // Using outlined for consistency, change if needed
//               type="text"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>

//           {/* Download Button */}
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }} // Use context color
//               fullWidth
//               disabled={filteredStudentData.length === 0} // Disable if no data to print
//               sx={{ height: '100%' }} // Make button height match textfield/select
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         {/* ID Card Display Area */}
//         {/* Important: Wrap the content to be printed in the ref element */}
//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap justify-center gap-4 sm:gap-2 md:gap-3 lg:gap-4">
//             {filteredStudentData.length > 0 ? (
//                filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index} // Use a unique key like student._id
//                   className="id-card"
//                   style={{
//                     backgroundImage: `url(${bg})`,
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     width: "54mm", // Standard ID card width
//                     height: "86mm", // Standard ID card height
//                     position: "relative",
//                     backgroundSize: "cover",
//                     border: "1px solid #ccc", // Light border for visibility
//                     overflow: "hidden", // Hide content overflowing the card boundaries
//                      pageBreakInside: "avoid", // Try to keep card on one page when printing
//                   }}
//                 >
//                   {/* Student Image */}
//                    <div
//                       style={{
//                           position: "absolute",
//                           // Adjust positioning based on your background image (bg) template
//                           left: "66px", // Example value, adjust as needed
//                           top: "105px",  // Example value, adjust as needed
//                           width: "85px",  // Example value, adjust as needed
//                           height: "95px", // Example value, adjust as needed
//                           border: "0.5px solid #ff0000", // Example border, adjust style/color
//                           borderRadius: "4px",
//                           overflow: "hidden",
//                       }}
//                   >
//                       <img
//                           src={student.studentImage?.url || '/path/to/default/avatar.png'} // Provide a fallback image
//                           alt={`${student.studentName} profile`}
//                           style={{ width: "100%", height: "100%", objectFit: 'cover' }} // Use objectFit
//                           // onError={(e) => e.target.src='/path/to/default/avatar.png'} // Handle broken images
//                       />
//                   </div>


//                   {/* Student Details */}
//                   {/* Adjust top/left positioning based on your background image template */}
//                   {/* <div style={{ position: "absolute", left: "13px", top: "230px", width: "calc(100% - 10px)", paddingRight: "5px" }}>
                    
//                     <p style={idCardTextStyle}>
//                       NAME <span style={idCardValueStyle}>: {student.studentName?.slice(0, 18)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       CLASS <span style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       F.NAME <span style={idCardValueStyle}>: {student.fatherName?.slice(0, 15)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       PHONE <span style={idCardValueStyle}>: {student.contact ? `+91${student.contact}` : 'N/A'}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       ADDRESS <span style={idCardValueStyle}>: {student.address?.slice(0, 25)}</span>
//                     </p>
                    
//                 </div> */}
//                 <table style={{
//   position: "absolute",
//   left: "10px",
//   top: "212px",
//   width: "calc(100% - 10px)",
//   paddingRight: "5px",
//   fontSize: "12px",
//   textTransform: "uppercase",
//   fontWeight: "bold",
//   lineHeight: "1.1",
//   fontFamily: "Arial, sans-serif"
// }}>
//   <tbody>
//     <tr>
//       <td style={idCardTextStyle}>Name</td>
//       <td style={idCardValueStyle}>: {student.studentName}</td>
//     </tr>
//     <tr>
//       <td style={idCardTextStyle}>Class</td>
//       <td style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</td>
//     </tr>
//     <tr>
//       <td style={idCardTextStyle}>F.Name</td>
//       <td style={idCardValueStyle}>: {student.fatherName}</td>
//     </tr>
//     <tr>
//       <td style={idCardTextStyle}>DOB</td>
//       <td style={idCardValueStyle}>: {moment(student.dateOfBirth).format("DD/MM/YYYY")}</td>
//     </tr>
//     <tr>
//       <td style={idCardTextStyle}>Phone</td>
//       <td style={idCardValueStyle}>: {student.contact ? `${student.contact}` : 'N/A'}</td>
//     </tr>
//     <tr>
//       <td style={idCardTextStyle}>Address</td>
//       <td style={idCardValueStyle}>: {student.address}</td>
//     </tr>
//   </tbody>
// </table>


//                 </div>
//               ))
//             ) : (
//                 <Typography sx={{textAlign: 'center', width: '100%', marginTop: 5}}>
//                     No students found matching the criteria.
//                 </Typography>
//             )}
//           </div>
//         </div> {/* End of ref={componentPDF} */}
//       </Box> {/* End of outer padding Box */}

//       {/* Print-specific CSS (can be kept as is or moved to a global CSS file) */}
//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape; /* Landscape layout */
//             margin-top: 20px; /* Minimal margin for better spacing */
//           }

//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding:10px
//           }

//           .id-card {
//             page-break-inside: avoid; /* Prevents breaking the card */
//           }

//           .page-break {
//             page-break-after: always; /* Forces page break after 10 cards */
//           }
//         }
//       `}</style>

//     </>
//   );
// };

// Helper function for consistent text styling on the ID card
// const idCardTextStyle = {
//   fontSize: "12px",
//   textTransform: "uppercase",
//   // color: "white", // Adjust color based on your background
//   fontWeight: "bold",
//   margin: "2px 0", // Adjust vertical spacing
//   lineHeight: "1.1",
//   whiteSpace: "wrap", // Prevent wrapping for labels
//   // whiteSpace: "nowrap", // Prevent wrapping for labels
//   overflow: "hidden",
//   textOverflow: "ellipsis", // Add ellipsis if text is too long
// };

// const idCardValueStyle = {
  
//   marginLeft: "4px", // Space between label and value
//   // fontWeight: "normal", // Value might not need to be bold
//   fontWeight: "Bold", // Value might not need to be bold
//   // Allow value to wrap if needed, or use slice as done in the component
//   fontFamily: "Arial, sans-serif", 
  
// };

// const idCardTextStyle = {
//   fontSize: "8px",
//   textTransform: "uppercase",
//   fontWeight: "bold",
//   // margin: "2px 0",
//   lineHeight: "1.1",
//   whiteSpace: "nowrap",
//   overflow: "hidden",
//   textOverflow: "ellipsis",
//   verticalAlign: "top"
// };

// const idCardValueStyle = {
//   fontWeight: "bold",
//   fontSize: "8px",
//   fontFamily: "Arial, sans-serif",
//   // paddingLeft: "4px",
//   display: "inline-block",
//   verticalAlign: "top",
//   maxWidth: "120px", // optional
//   wordWrap: "break-word",
//   whiteSpace: "normal", // allow wrapping
// };


// export default IdCard;






// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";

// const IdCard = () => {
//   const { currentColor, setIsLoader } = useStateContext();
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const componentPDF = useRef();

//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success && Array.isArray(response.classes)) {
//         setClassData(response.classes);
//       } else {
//         toast.error("Failed to fetch classes or invalid format");
//         setClassData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("Error fetching classes");
//       setClassData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       if (response?.success && Array.isArray(response?.students?.data)) {
//         setStudentData(response?.students?.data);
//         setFilteredStudentData(response?.students?.data);
//       } else {
//         toast.error("Failed to fetch students or invalid format");
//         setStudentData([]);
//         setFilteredStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("Error fetching students");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }
//     if (selectedClass && selectedSection) {
//       filtered = filtered.filter(student => student.section === selectedSection);
//     }
//     if (filterName) {
//       const lowerCaseFilterName = filterName.toLowerCase();
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilterName)
//       );
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData]);

//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   const classOptions = classData.map(cls => ({
//     label: cls.className,
//     value: cls.className,
//   }));

//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({
//     label: sec,
//     value: sec,
//   })) || [];

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`,
//     onAfterPrint: () => {
//       toast.success("PDF Generated/Printed Successfully!");
//     }
//   });

//   return (
//     <>
//       <Box sx={{ padding: 2 }}>
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>

//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//               placeholder="Select Class"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//               disabled={!selectedClass || sectionOptions.length === 0}
//               placeholder="Select Section"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined"
//               type="text"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }}
//               fullWidth
//               disabled={filteredStudentData.length === 0}
//               sx={{ height: '100%' }}
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap justify-center gap-4 sm:gap-2 md:gap-3 lg:gap-4">
//             {filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index}
//                   className="id-card"
//                   style={{
//                     backgroundImage: `url(${bg})`,
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     width: "54mm",
//                     height: "86mm",
//                     position: "relative",
//                     backgroundSize: "cover",
//                     border: "1px solid #ccc",
//                     overflow: "hidden",
//                     pageBreakInside: "avoid",
//                   }}
//                 >
//                   <div
//                     style={{
//                       position: "absolute",
//                       left: "40px",
//                       top: "92px",
//                       width: "85px",
//                       height: "95px",
//                       border: "0.5px solid #ff0000",
//                       borderRadius: "4px",
//                       overflow: "hidden",
//                     }}
//                   >
//                     <img
//                       src={student.studentImage?.url || '/path/to/default/avatar.png'}
//                       alt={`${student.studentName} profile`}
//                       style={{ width: "100%", height: "100%", objectFit: 'cover' }}
//                     />
//                   </div>

//                   <div style={{ position: "absolute", left: "5px", top: "190px", width: "calc(100% - 10px)", paddingRight: "5px" }}>
//                     <p style={idCardTextStyle}>
//                       NAME <span style={idCardValueStyle}>: {student.studentName?.slice(0, 18)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       CLASS <span style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       F.NAME <span style={idCardValueStyle}>: {student.fatherName?.slice(0, 15)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       PHONE <span style={idCardValueStyle}>: {student.contact ? `+91${student.contact}` : 'N/A'}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       ADDRESS <span style={idCardValueStyle}>: {student.address?.slice(0, 25)}</span>
//                     </p>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5 }}>
//                 No students found matching the criteria.
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>

//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape;
//             margin-top: 20px;
//           }
//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding: 10px;
//           }
//           .id-card {
//             page-break-inside: avoid;
//           }
//           .page-break {
//             page-break-after: always;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// const idCardTextStyle = {
//   fontSize: "6pt",
//   textTransform: "uppercase",
//   color: "white",
//   fontWeight: "bold",
//   margin: "2px 0",
//   lineHeight: "1.1",
//   whiteSpace: "nowrap",
//   overflow: "hidden",
//   textOverflow: "ellipsis",
// };

// const idCardValueStyle = {
//   marginLeft: "4px",
//   fontWeight: "normal",
// };

// export default IdCard;


// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Assuming ContextProvider provides setIsLoader and currentColor
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material"; // Added Typography and Box for better layout
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg"; // Ensure this path is correct
// import { ActiveStudents, AdminGetAllClasses, getAllStudents } from "../../Network/AdminApi"; // Ensure these API functions are correct
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Ensure this component exists and works as expected
// import { toast } from "react-toastify";

// const IdCard = () => {
//   // Use context state
//   const { currentColor, setIsLoader } = useStateContext();

//   // State for data
//   const [studentData, setStudentData] = useState([]); // Full list of students
//   const [classData, setClassData] = useState([]); // Fetched class data (class name, sections, etc.)
//   const [filteredStudentData, setFilteredStudentData] = useState([]); // Students to display/print

//   // State for filters
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");

//   // Ref for printing
//   const componentPDF = useRef();

//   // --- Data Fetching ---

//   // Fetch Class Data
//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success && Array.isArray(response.classes)) {
//         // Use 'className' based on your provided structure
//         setClassData(response.classes);
//       } else {
//         toast.error("Failed to fetch classes or invalid format");
//         setClassData([]); // Ensure it's an array even on failure
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("Error fetching classes");
//       setClassData([]); // Ensure it's an array on error
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]); // Dependency on setIsLoader

//   // Fetch Student Data
//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       if (response?.success && Array.isArray(response?.students?.data)) {
//         setStudentData(response?.students?.data);
//         setFilteredStudentData(response?.students?.data); // Initially show all
//       } else {
//         toast.error("Failed to fetch students or invalid format");
//         setStudentData([]);
//         setFilteredStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("Error fetching students");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]); // Dependency on setIsLoader

//   // Initial data fetching on component mount
//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]); // Add fetch functions as dependencies

//   // --- Filtering Logic ---

//   // Filter students whenever dependencies change
//   useEffect(() => {
//     console.log("studentData",studentData)
//     let filtered = studentData;

//     // Filter by Class
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }

//     // Filter by Section (only if a class is selected)
//     if (selectedClass && selectedSection) {
//       filtered = filtered.filter(student => student.section === selectedSection);
//     }

//     // Filter by Name
//     if (filterName) {
//       const lowerCaseFilterName = filterName.toLowerCase();
//       // Use studentName as per your data structure
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilterName)
//       );
//     }
// console.log("filtered",filtered)
//     setFilteredStudentData(filtered);

//   }, [selectedClass, selectedSection, filterName, studentData]); // Dependencies for filtering

//   // --- Event Handlers ---

//   const handleFilterByNameChange = (e) => {
//     setFilterName(e.target.value);
//   };

//   const handleClassChange = (e) => {
//     const newClass = e.target.value;
//     setSelectedClass(newClass);
//     setSelectedSection(""); // Reset section when class changes
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };

//   // --- Dropdown Options ---

//   // Prepare class options for ReactSelect
//   const classOptions = classData.map(cls => ({
//     label: cls.className, // Use className from your data structure
//     value: cls.className,
//   }));

//   // Prepare section options based on selected class
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({
//     label: sec,
//     value: sec,
//   })) || [];

//   // --- PDF Generation ---

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`, // Dynamic title
//     onBeforeGetContent: () => {
//       // Optional: Add any temporary changes needed just before printing
//       return Promise.resolve();
//     },
//     onAfterPrint: () => {
//       toast.success("PDF Generated/Printed Successfully!");
//     },
//     // Consider adding error handling if useReactToPrint supports it
//   });


//   return (
//     <>
//       <Box sx={{ padding: 2 }}> {/* Add some padding around the controls */}
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>

//         {/* Filter Controls */}
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           {/* Class Select */}
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} // Add "All" option
//               placeholder="Select Class" // Add placeholder
//             />
//           </Grid>

//           {/* Section Select */}
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} // Add "All" option
//               disabled={!selectedClass || sectionOptions.length === 0} // Disable if no class or no sections
//               placeholder="Select Section" // Add placeholder
//             />
//           </Grid>

//           {/* Name Filter */}
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined" // Using outlined for consistency, change if needed
//               type="text"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>

//           {/* Download Button */}
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }} // Use context color
//               fullWidth
//               disabled={filteredStudentData.length === 0} // Disable if no data to print
//               sx={{ height: '100%' }} // Make button height match textfield/select
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         {/* ID Card Display Area */}
//         {/* Important: Wrap the content to be printed in the ref element */}
//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap justify-center gap-4 sm:gap-2 md:gap-3 lg:gap-4">
//             {filteredStudentData.length > 0 ? (
//                filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index} // Use a unique key like student._id
//                   className="id-card"
//                   style={{
//                     backgroundImage: `url(${bg})`,
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     width: "54mm", // Standard ID card width
//                     height: "86mm", // Standard ID card height
//                     position: "relative",
//                     backgroundSize: "cover",
//                     border: "1px solid #ccc", // Light border for visibility
//                     overflow: "hidden", // Hide content overflowing the card boundaries
//                      pageBreakInside: "avoid", // Try to keep card on one page when printing
//                   }}
//                 >
//                   {/* Student Image */}
//                    <div
//                       style={{
//                           position: "absolute",
//                           // Adjust positioning based on your background image (bg) template
//                           left: "40px", // Example value, adjust as needed
//                           top: "92px",  // Example value, adjust as needed
//                           width: "85px",  // Example value, adjust as needed
//                           height: "95px", // Example value, adjust as needed
//                           border: "0.5px solid #ff0000", // Example border, adjust style/color
//                           borderRadius: "4px",
//                           overflow: "hidden",
//                       }}
//                   >
//                       <img
//                           src={student.studentImage?.url || '/path/to/default/avatar.png'} // Provide a fallback image
//                           alt={`${student.studentName} profile`}
//                           style={{ width: "100%", height: "100%", objectFit: 'cover' }} // Use objectFit
//                           // onError={(e) => e.target.src='/path/to/default/avatar.png'} // Handle broken images
//                       />
//                   </div>


//                   {/* Student Details */}
//                   {/* Adjust top/left positioning based on your background image template */}
//                   <div style={{ position: "absolute", left: "5px", top: "190px", width: "calc(100% - 10px)", paddingRight: "5px" }}>
//                     {/* Use studentName from API data */}
//                     <p style={idCardTextStyle}>
//                       NAME <span style={idCardValueStyle}>: {student.studentName?.slice(0, 18)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       CLASS <span style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       F.NAME <span style={idCardValueStyle}>: {student.fatherName?.slice(0, 15)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       PHONE <span style={idCardValueStyle}>: {student.contact ? `+91${student.contact}` : 'N/A'}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       ADDRESS <span style={idCardValueStyle}>: {student.address?.slice(0, 25)}</span>
//                     </p>
                    
//                   </div>

//                 </div>
//               ))
//             ) : (
//                 <Typography sx={{textAlign: 'center', width: '100%', marginTop: 5}}>
//                     No students found matching the criteria.
//                 </Typography>
//             )}
//           </div>
//         </div> {/* End of ref={componentPDF} */}
//       </Box> {/* End of outer padding Box */}

//       {/* Print-specific CSS (can be kept as is or moved to a global CSS file) */}
//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape; /* Landscape layout */
//             margin-top: 20px; /* Minimal margin for better spacing */
//           }

//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding:10px
//           }

//           .id-card {
//             page-break-inside: avoid; /* Prevents breaking the card */
//           }

//           .page-break {
//             page-break-after: always; /* Forces page break after 10 cards */
//           }
//         }
//       `}</style>

//     </>
//   );
// };

// // Helper function for consistent text styling on the ID card
// const idCardTextStyle = {
//   fontSize: "6pt",
//   textTransform: "uppercase",
//   color: "white", // Adjust color based on your background
//   fontWeight: "bold",
//   margin: "2px 0", // Adjust vertical spacing
//   lineHeight: "1.1",
//   whiteSpace: "nowrap", // Prevent wrapping for labels
//   overflow: "hidden",
//   textOverflow: "ellipsis", // Add ellipsis if text is too long
// };

// const idCardValueStyle = {
//   marginLeft: "4px", // Space between label and value
//   fontWeight: "normal", // Value might not need to be bold
//   // Allow value to wrap if needed, or use slice as done in the component
// };


// export default IdCard;



// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { ActiveStudents, AdminGetAllClasses, getAllStudents } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";

// const IdCard = () => {
//   const { currentColor, setIsLoader,classes } = useStateContext();
//   const [filterName, setFilterName] = useState("");
//   const [filterClass, setFilterClass] = useState("");
//     const [getClass, setGetClass] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const componentPDF = useRef();

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `All ID Cards`;
//     },
//     onAfterPrint: () => {
//       alert("PDF Downloaded Successfully!");
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });

//   const [studentData, setStudentData] = useState([]);
// console.log("studentData",studentData)
//     const fetchAllClasses = useCallback(async () => {
//       setIsLoader(true);
//       try {
//         const response = await AdminGetAllClasses();
//         if (response?.success) {
//           setGetClass(response.classes || []);
//         } else {
//           toast.error("Failed to fetch classes");
//         }
//       } catch (error) {
//         toast.error("Error fetching classes");
//       } finally {
//         setIsLoader(false);
//       }
//     }, [setIsLoader]);
  
 
//   const allStudent = async () => {
//    try {
//     setIsLoader(true)
//     const response = await ActiveStudents();
//     if (response?.success) {
//       setIsLoader(false)
//       setStudentData(response?.students?.data);
//       setFilteredStudentData(response.allStudent);
//     }
//     else{
//       setIsLoader(false)
//     }
//    } catch (error) {
//     console.log("error",error)
//    }
//   };

//   useEffect(() => {
//     allStudent();
//     fetchAllClasses()
//   }, []);

//   const handleFilterByName = (e) => {
//     const value = e.target.value;
//     setFilterName(value);
//     filterStudents(filterClass, value);
//   };

//   const handleFilterByClass = (e) => {
//     const value = e.target.value;
//     setFilterClass(value);
//     filterStudents(value, filterName);
//   };

//   const filterStudents = (filterClass, nameFilter) => {
//     let filteredData = studentData;

//     if (filterClass) {
//       filteredData = filteredData.filter((student) =>
//         student.class.includes(filterClass.toLowerCase())
//       );
//     }

//     if (nameFilter) {
//       filteredData = filteredData.filter((student) =>
//         student.fullName.toLowerCase().includes(nameFilter.toLowerCase())
//       );
//     }

//     setFilteredStudentData(filteredData);
//   };


//   const [values, setValues] = useState({
//     class: "",
//     section: "",
//   });

//   // Handle Class Change
//   const handleClassChange = (e) => {
//     const selectedClass = e.target.value;
//     setValues((prev) => ({
//       ...prev,
//       class: selectedClass,
//       section: "",
//     }));
//   };

//   // Handle Section Change
//   const handleSectionChange = (e) => {
//     setValues((prev) => ({
//       ...prev,
//       section: e.target.value,
//     }));
//   };

//   // Get sections based on selected class
//   const selectedClassObj = getClass?.find((cls) => cls.class === values.class);
//   const sections = selectedClassObj?.section || [];

//   return (
//     <>

//       <div>
//         <ReactSelect
//                       name="class"
//                       value={values?.class}
//                       handleChange={handleClassChange}
//                       label="class"
//                       dynamicOptions={classes?.map((val)=>({label:val?.class,value:val?.class}))}
                   
//                     />
//         <ReactSelect
//                       name="section"
//                       value={values?.section}
//                       handleChange={handleSectionChange}
//                       label="Section"
//                       dynamicOptions={sections?.map((val)=>({label:val,value:val}))}
                   
//                     />
//       <label htmlFor="classes">Select Class:</label>
//       <select id="classes" value={values.class} onChange={handleSectionChange}>
//         <option value="">Select Class</option>
//         {classes?.map((val, index) => (
//           <option key={index} value={val.class}>
//             {val.class}
//           </option>
//         ))}
//       </select>

//       {/* Section Dropdown */}
//       <label htmlFor="sections">Select Section:</label>
//       <select
//         id="sections"
//         value={values.section}
//         onChange={handleSectionChange}
//         disabled={!sections.length}
//       >
//         <option value="">Select Section</option>
//         {sections?.map((sec, index) => (
//           <option key={index} value={sec}>
//             {sec}
//           </option>
//         ))}
//       </select>

//       <p>
//         Selected Class: {values.class || "None"}, Selected Section:{" "}
//         {values.section || "None"}
//       </p>
// {/* 
// <label htmlFor="classes">Select Class:</label>
//       <select id="classes" value={values?.class} onChange={handleChange}>
//         <option value="">Select Class</option>
//         {classes.map((val, index) => (
//           <option key={index} value={val?.class}>
//             {val?.class}
//           </option>
//         ))}
//       </select> */}
//         <div className="mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filter-class"
//                 label="Search by Class"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByClass}
//                 value={filterClass}
//                 fullWidth
//               />
//             </Grid>

//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filter-name"
//                 label="Filter by Name"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByName}
//                 value={filterName}
//                 fullWidth
//               />
//             </Grid>

//             <Grid item xs={12} sm={12} md={4}>
//               <Button
//                 variant="contained"
//                 onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, width: "100%" }}
//               >
//                 Download PDF
//               </Button>
//             </Grid>
//           </Grid>
//         </div>

//         <div className="id-card-container  flex flex-wrap justify-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" ref={componentPDF}>
//           {filteredStudentData?.map((student, index) => (
//             <div
//               key={index}
//               className="id-card"
//               style={{
//                 backgroundImage: `url(${bg})`,
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//                 width: "54mm",
//                 height: "86mm",
//                 position: "relative",
//                 backgroundSize: "cover",
//                 border: "1px solid",
//               }}
//             >
//               <div
//                 style={{
//                   marginLeft: "40px",
//                   marginTop: "92px",
//                   width: "85px",
//                   height: "95px",
//                   border: "0.5px solid #ff0000",
//                   borderRadius: "4px",
//                   overflow: "hidden",
//                   position: "absolute",
//                 }}
//               >
//                 <img
//                   src={student.studentImage?.url}
//                   alt="Profile"
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>

//               <div
//                 style={{
//                   marginLeft: "40px",
//                   marginTop: "92px",
//                   width: "85px",
//                   height: "95px",
//                   border: "0.5px solid #ff0000",
//                   borderRadius: "4px",
//                   overflow: "hidden",
//                   position: "absolute",
//                 }}
//               >
//                 <img
//                   src={student.studentImage?.url}
//                   alt="Profile"
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>

//               <div style={{ position: "absolute", left: "3px", top: "190px" }}>
//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "8px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   NAME{" "}
//                   <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fullName?.slice(0, 15)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   CLASS{" "}
//                   <span style={{ marginLeft: "13px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.class}-{student.section}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   F.Name{" "}
//                   <span style={{ marginLeft: "9px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fatherName?.slice(0, 10)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Phone{" "}
//                   <span style={{ marginLeft: "12px", fontWeight: "bold" }}>
//                     {" "}
//                     : +91{student.contact}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Address{" "}
//                   <span style={{ marginLeft: "1px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.address}{" "}
//                   </span>
//                 </p>
//               </div>
//               {/* Page Break after every 10 items */}
//               {(index + 1) % 10 === 0 && <div className="page-break" />}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Print-specific CSS */}
//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape; /* Landscape layout */
//             margin: 10mm; /* Minimal margin for better spacing */
//           }

//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 5px;
//             padding:10px
//           }

//           .id-card {
//             page-break-inside: avoid; /* Prevents breaking the card */
//           }

//           .page-break {
//             page-break-after: always; /* Forces page break after 10 cards */
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default IdCard;



// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { getAllStudents } from "../../Network/AdminApi";
// const IdCard = () => {
//   const { currentColor } = useStateContext();
//   const [filterName, setFilterName] = useState("");
//   const [filterClass, setFilterClass] = useState("");
//   const [filteredStudentData, setFilterdStudentData] = useState([]);
//   const componentPDF = useRef();
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `All ID Card`;
//     },
//     onAfterPrint: () => {
//       alert("modalData saved in PDF");
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });

//   const [studentData, setStudentData] = useState([]);
//   const allStudent = async () => {
//     const response = await getAllStudents();
//     if (response?.success) {
//       setStudentData(response?.allStudent);
//       setFilterdStudentData(response.allStudent);
//     }
    
//   };
//   useEffect(() => {
//     allStudent();
//   }, []);

//   const handleFilterbyname = (e) => {
//     const value = e.target.value;
//     setFilterName(value);
//     filterStudents(filterClass, value);
//   };

//   const handleFilterByClass = (e) => {
//     let value = e.target.value;
//     setFilterClass(value);
//     filterStudents(value, filterName);
//   };

//   const filterStudents = (filterClass, nameFilter) => {
//     let filteredData = studentData;

//     if (filterClass) {
//       filteredData = filteredData.filter((student) =>
//         student.class.includes(filterClass.toLowerCase())
//       );
//     }
//     if (nameFilter) {
//       filteredData = filteredData.filter((student) =>
//         student.fullName.toLowerCase().includes(nameFilter)
//       );
//     }
//     setFilterdStudentData(filteredData);
//   };

//   return (
//     <>
//       <div className="">
//         <div className="mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filled-basic"
//                 label="searchBy class"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByClass}
//                 value={filterClass}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filled-basic"
//                 label="filterBy Name"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterbyname}
//                 value={filterName}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={12} md={4}>
//               <Button
//                 variant="contained"
//                 onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, width: "100%" }}
//                 className="h-12"
//               >
//                 Download
//               </Button>
//             </Grid>
//           </Grid>
//         </div>

//         <div className="w-full flex flex-wrap gap-2" ref={componentPDF}>
//           {filteredStudentData.map((student, index) => (
//             <div
//               style={{
//                 backgroundImage: `url(${bg})`,
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//                 width: "54mm",
//                 height: "86mm",
//                 position: "relative",
//                 backgroundSize: "cover",
//                 border: "1px solid",
//               }}
//             >
//               <div
//                 style={{
//                   marginLeft: "40px",
//                   marginTop: "92px",
//                   width: "85px",
//                   height: "95px",
//                   border: "0.5px solid #ff0000",
//                   borderRadius: "4px",
//                   overflow: "hidden",
//                   position: "absolute",
//                 }}
//               >
//                 <img
//                   src={student.studentImage?.url}
//                   alt="Profile"
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>

//               <div style={{ position: "absolute", left: "3px", top: "190px" }}>
//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "8px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   NAME{" "}
//                   <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fullName?.slice(0, 15)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   CLASS{" "}
//                   <span style={{ marginLeft: "13px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.class}-{student.section}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   F.Name{" "}
//                   <span style={{ marginLeft: "9px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fatherName?.slice(0, 10)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Phone{" "}
//                   <span style={{ marginLeft: "12px", fontWeight: "bold" }}>
//                     {" "}
//                     : +91{student.contact}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Address{" "}
//                   <span style={{ marginLeft: "1px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.address}{" "}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default IdCard;
