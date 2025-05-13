


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
import StudentCard from "./StudentCardFront";

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

const NewID = () => {
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


      const chunkedStudents = [];
  for (let i = 0; i < studentData.length; i += 10) {
    chunkedStudents.push(studentData.slice(i, i + 10));
  }
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
                                                chunkedStudents.map((group, pageIndex) => (
                                                          <div
                                                            key={pageIndex}
                                                            className="print-page w-[1123px] h-[794px] bg-white grid grid-cols-5 gap-x-2 gap-y-[4px] p-5"
                                                          >
                                                            {group.map((student, index) => (
                                                              <StudentCard key={index} student={student} />
                                                            ))}
                                                          </div>
                                                        ))
                                                // <div
                                                //     className="id-card"
                                                //     style={{ border: '1px dashed #ccc' }} // Preview border
                                                //     dangerouslySetInnerHTML={{ __html: renderFrontTemplate(student) }} />
                                            )
                                            
                                            
                                            }
                                            {/* {printMode === 'back' && (
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
                                            )} */}
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

export default NewID;
