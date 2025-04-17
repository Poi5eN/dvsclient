import React, { useCallback, useEffect, useState } from 'react';
import {
    ActiveStudents,
    AdminGetAllClasses,
    editBulkstudentparent, // Use your actual API function

} from '../../../Network/AdminApi';
import Table from '../../../Dynamic/Table';
import Button from '../../../Dynamic/utils/Button';
import { toast } from 'react-toastify';
import { useStateContext } from '../../../contexts/ContextProvider';
import { ReactSelect } from '../../../Dynamic/ReactSelect/ReactSelect';
import moment from 'moment';

const BulkEdit = () => {
    const { currentColor, setIsLoader } = useStateContext();
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [studentDetails, setStudentDetails] = useState([]); // Holds all fetched students
    const [selectedStudentIds, setSelectedStudentIds] = useState([]); // Stores only IDs of selected students
    const [selectAll, setSelectAll] = useState(false);
    const [getClass, setGetClass] = useState([]);
    const [edit, setEdit] = useState(false); // Controls edit mode
    const [availableSections, setAvailableSections] = useState([]);
    const [editFormData, setEditFormData] = useState({}); // Stores changes: { studentId: { field: value, ... } }

    const [filterValues, setFilterValues] = useState({
        class: "",
        section: "",
    });

    // Fetch all active students
    const fetchStudentData = useCallback(async (cls = filterValues.class, sec = filterValues.section) => {
        setIsLoader(true);
        try {
            // Pass filters to API if supported, otherwise filter client-side later
            const response = await ActiveStudents(/* { class: cls, section: sec } */);
            if (response?.success && response?.students?.data) {
                const students = response.students.data.map(s => ({ ...s, id: s.studentId })).reverse();
                setStudentDetails(students);
                // Always filter locally after fetch to ensure consistency
                filterStudents(cls, sec, students);
                console.log("Active students fetched:", students);
            } else {
                toast.error("Could not fetch students or no students found.");
                setStudentDetails([]);
                setFilteredStudents([]);
            }
        } catch (error) {
            console.error('Error fetching active students:', error);
            toast.error('Error fetching active students.');
            setStudentDetails([]);
            setFilteredStudents([]);
        } finally {
            setIsLoader(false);
        }
    }, [setIsLoader, filterValues.class, filterValues.section]); // Keep dependencies

    // Fetch all classes
    const fetchAllClasses = useCallback(async () => {
        setIsLoader(true);
        try {
            const response = await AdminGetAllClasses();
            if (response?.success) {
                setGetClass(response.classes || []);
            } else {
                toast.error("Error: Could not fetch classes.");
            }
        } catch (error) {
            toast.error("Error fetching classes");
            console.error("Error fetching classes:", error);
        } finally {
            setIsLoader(false);
        }
    }, [setIsLoader]);

    useEffect(() => {
        fetchStudentData(); // Fetch initial data
        fetchAllClasses();
    }, []); // Run only on mount

    // Filter students based on class and section (using the full list)
    const filterStudents = (cls, sec, studentsToFilter = studentDetails) => {
        console.log("Filtering with:", cls, sec);
        let filtered = studentsToFilter;
        if (cls) {
            filtered = filtered.filter((student) => student.class === cls);
        }
        if (sec) {
            filtered = filtered.filter((student) => student.section === sec);
        }

        setFilteredStudents(filtered);

        // Reset selection *only if filter criteria actually changed* causing a re-filter
        // This prevents selection reset if fetchStudentData calls filterStudents with same values
        // Check if filterValues state already matches cls and sec
        if (filterValues.class !== cls || filterValues.section !== sec) {
             setSelectedStudentIds([]);
             setSelectAll(false);
             setEditFormData({}); // Clear any pending edits if filter changes
             setEdit(false); // Exit edit mode if filter changes
        }

    };

    // Handle class/section filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilterValues = {
            ...filterValues,
            [name]: value
        };

        let targetClass = newFilterValues.class;
        let targetSection = newFilterValues.section;

        if (name === "class") {
            const classObj = getClass.find((cls) => cls.className === value);
            const sections = classObj?.sections || [];
            setAvailableSections(sections);
            // Reset section if class changes and selected section is not valid
            if (value && !sections.includes(filterValues.section)) {
                targetSection = ""; // Reset section
                newFilterValues.section = "";
            }
        }
        setFilterValues(newFilterValues); // Update state first
        filterStudents(targetClass, targetSection); // Then filter
    };

    // Handle Select All checkbox
    const handleSelectAllChange = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedStudentIds(newSelectAll ? filteredStudents.map(s => s.studentId) : []);
        if (!newSelectAll) {
             setEditFormData({});
        }
    };

    // Handle individual row checkbox change - CORRECTED
    const handleCheckboxChange = (studentId) => { // Expects ID now
        setSelectedStudentIds(prev => {
            const isCurrentlySelected = prev.includes(studentId);
            if (isCurrentlySelected) {
                return prev.filter(id => id !== studentId); // Remove ID
            } else {
                return [...prev, studentId]; // Add ID
            }
        });
        // Uncheck "Select All" if we are deselecting an item
        if (selectedStudentIds.includes(studentId)) {
             setSelectAll(false);
        }
        // Optional: Check if all are now selected to update SelectAll state
        // else {
        //     if (selectedStudentIds.length + 1 === filteredStudents.length) {
        //         setSelectAll(true);
        //     }
        // }
    };

    // Enter edit mode
    const handleEditClick = () => {
        if (selectedStudentIds.length === 0) {
            toast.warn("Please select at least one student to edit.");
            return;
        }
        const initialEditData = {};
        selectedStudentIds.forEach(id => {
            const student = studentDetails.find(s => s.studentId === id);
            if (student) {
                // Populate with fields intended for editing
                initialEditData[id] = {
                    admissionNumber: student.admissionNumber,
                    studentName: student.studentName,
                    fatherName: student.fatherName,
                    address: student.address || "",
                    // === Add other fields from student object that should be editable ===
                    // email: student.email || "",
                    // dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "", // Format for date input
                    // motherName: student.motherName || "",
                    // mobileNumber: student.mobileNumber || ""
                };
            }
        });
        setEditFormData(initialEditData);
        setEdit(true);
        setSelectAll(false); // Keep this potentially? Or allow selectAll in edit mode? Disabling seems safer.
    };

    // Handle changes in input fields during edit mode
    const handleFieldChange = (studentId, fieldName, value) => {
        setEditFormData(prev => ({
            ...prev,
            [studentId]: {
                ...(prev[studentId] || {}),
                [fieldName]: value
            }
        }));
    };

    // Save changes - CORRECTED PAYLOAD CONSTRUCTION
    const handleSave = async () => {
        if (selectedStudentIds.length === 0) {
            toast.warn("No students selected to save.");
            return;
        }

        // Construct the payload based on the API requirement (editBulkstudentparent)
        // The API expects an object like { updates: [ { studentId: '...', fields: { ... } }, ... ] }
        const updatesPayload = selectedStudentIds
            .map(studentId => {
                const originalStudent = studentDetails.find(s => s.studentId === studentId);
                const editedStudentData = editFormData[studentId];

                if (!editedStudentData || !originalStudent) {
                    console.warn(`Skipping student ID ${studentId}: No edit data or original student found.`);
                    return null; // Skip if data is missing
                }

                // --- Important: Determine which fields actually changed ---
                const changedFields = {};
                let hasChanged = false;
                for (const key in editedStudentData) {
                    // Check if the key exists in the original student data and if the value differs
                    // Use String comparison for robustness, handle null/undefined appropriately
                    if (String(editedStudentData[key] ?? '') !== String(originalStudent[key] ?? '')) {
                        changedFields[key] = editedStudentData[key]; // Add the changed field
                        hasChanged = true;
                    }
                }

                // Only include students with actual changes if required by API or for efficiency
                // If the API can handle empty 'fields', you could remove the 'hasChanged' check.
                if (hasChanged) {
                    return {
                        studentId: studentId, // The API likely needs the student's studentId
                        fields: changedFields // Send only the changed fields
                        // Alternatively, send all editable fields: fields: editFormData[id]
                    };
                } else {
                    return null; // No changes for this student
                }
            })
            .filter(update => update !== null); // Filter out null entries (students with no changes)


        if (updatesPayload.length === 0) {
            toast.info("No changes detected for the selected students.");
            setEdit(false); // Still exit edit mode
            setEditFormData({});
            return;
        }

        const finalPayload = { updates: updatesPayload };
        console.log("Sending Payload:", JSON.stringify(finalPayload, null, 2)); // Log the payload

        setIsLoader(true);
        try {
            const response = await editBulkstudentparent(finalPayload); // Call the correct API function

            if (response?.success) {
                toast.success(response?.message || "Students updated successfully!");
                setEdit(false);
                setSelectedStudentIds([]);
                setSelectAll(false);
                setEditFormData({});
                await fetchStudentData(filterValues.class, filterValues.section); // Refetch data with current filters
            } else {
                 // Attempt to parse backend error message if available
                let errorMessage = "Failed to update students.";
                if (response?.message) {
                    errorMessage = response.message;
                } else if (response?.error) {
                    // Check for nested error messages if your API sends them
                    errorMessage = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
                }
                toast.error(errorMessage);
                console.error("API Error Response:", response);
            }
        } catch (error) {
            console.error("Error updating students:", error);
            toast.error("An error occurred while saving changes.");
        } finally {
            setIsLoader(false);
        }
    };

    // Cancel editing - CORRECTED
    const handleCancel = () => {
        setEdit(false);
        setEditFormData({}); // Clear pending edits
        // Optionally reset selection?
        // setSelectedStudentIds([]);
        // setSelectAll(false);
        toast.info("Edit cancelled.");
    };


    // Options for ReactSelect
    const dynamicOptions = getClass.map(cls => ({
        label: cls.className,
        value: cls.className
    }));

    const dynamicSection = availableSections.map(item => ({
        label: item,
        value: item
    }));

    // Define Table Headers - Add more as needed
    const THEAD = [
        { id: 'select', label: !edit ? <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} /> : '#' }, // Changed label in edit mode
        { id: 'SN', label: '#' },
        { id: 'admissionNo', label: 'Adm No' },
        { id: 'name', label: 'Name' },
        { id: 'fatherName', label: "Father" },
        { id: 'motherName', label: "Mother" },
        { id: 'rollNo', label: "Roll" },
        { id: 'email', label: "Email" },
        { id: 'dateOfBirth', label: "DOB" },
        { id: 'contact', label: "Contact" },
        { id: 'class', label: 'Class' },
        { id: 'section', label: 'Sec' },
        { id: "address", label: "Address" },
        // Add other headers matching fields in handleEditClick and handleFieldChange
        // { id: "email", label: "Email" },
        // { id: "dateOfBirth", label: "DOB" },
        // { id: "motherName", label: "Mother's Name" },
        // { id: "mobileNumber", label: "Mobile" },
    ];

    // Generate Table Body Data - CORRECTED CHECKBOX ONCHANGE
    const tBody = filteredStudents?.map((student, index) => {
        const isSelected = selectedStudentIds.includes(student.studentId);
        const canEdit = edit && isSelected;
        const currentEditData = editFormData[student.studentId] || {};

        return {
            id: student.studentId, // Key for React
            select: (
                <input
                    type="checkbox"
                    checked={isSelected}
                    // *** CORRECTED: Pass student.studentId ***
                    onChange={() => handleCheckboxChange(student.studentId)}
                    disabled={edit} // Disable checkbox itself while editing rows
                />
            ),
            SN: index + 1,
            admissionNo: canEdit ? (
                <input
                    type="text"
                    className="border p-1 w-[70px] bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.admissionNumber ?? student.admissionNumber ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'admissionNumber', e.target.value)}
                />
            ) : (
                student.admissionNumber
            ),
            name: canEdit ? (
                <input
                    type="text"
                    className="border p-1 w-[100px] bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.studentName ?? student.studentName ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'studentName', e.target.value)}
                />
            ) : (
                student.studentName
            ),
            fatherName: canEdit ? (
                <input
                    type="text"
                    className="border p-1 w-[100px] bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.fatherName ?? student.fatherName ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'fatherName', e.target.value)}
                />
            ) : (
                student.fatherName
            ),
            motherName: canEdit ? (
                <input
                    type="text"
                    className="border p-1 w-[100px] bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.motherName ?? student.motherName ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'motherName', e.target.value)}
                />
            ) : (
                student.motherName
            ),
            rollNo: canEdit ? (
                <input
                    type="text"
                    className="border p-1 w-[50px] bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.rollNo ?? student.rollNo ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'rollNo', e.target.value)}
                />
            ) : (
                student.rollNo
            ),
            email: canEdit ? (
                <input
                    type="text"
                    className="border p-1  bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.email ?? student.email ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'email', e.target.value)}
                />
            ) : (
                student.email
            ),
            dateOfBirth: canEdit ? (
                <input
                    type="date"
                    className="border p-1 w-[120px] bg-gray-300 dark:bg-gray-700 rounded"
                    value={
                        currentEditData.dateOfBirth ??
                        (student.dateOfBirth ? moment(student.dateOfBirth).format("YYYY-MM-DD") : '')
                    }
                    onChange={(e) =>
                        handleFieldChange(student.studentId, 'dateOfBirth', e.target.value)
                    }
                />
            ) : (
                moment(student.dateOfBirth).format("YYYY-MM-DD")
            ),
            contact: canEdit ? (
                <input
                    type="number"
                    className="border p-1 w-[120px] bg-gray-300 dark:bg-gray-700 rounded"
                    // value={
                    //     currentEditData.contact ??
                    //     (student.contact ? moment(student.contact).format("YYYY-MM-DD") : '')
                    // }
                    value={currentEditData.contact ?? student.contact ?? ''}
                    onChange={(e) =>
                        handleFieldChange(student.studentId, 'contact', e.target.value)
                    }
                />
            ) : (
               (student.contact || "N/A")
            ),

            class: `${student.class}`, // Not editable
            // section: student.section, // Not editable
            section: canEdit ? (
                <input
                    type="text"
                    className="border p-1 w-full bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.section ?? student.section ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'section', e.target.value)}
                />
            ) : (
                student.section || 'N/A'
            ),
            address: canEdit ? (
                <input
                    type="text"
                    className="border p-1 w-full bg-gray-300 dark:bg-gray-700 rounded"
                    value={currentEditData.address ?? student.address ?? ''}
                    onChange={(e) => handleFieldChange(student.studentId, 'address', e.target.value)}
                />
            ) : (
                student.address || 'N/A'
            ),
             // Add other editable fields here, matching THEAD and handleEditClick
            // email: canEdit ? ( <input type="email" ... value={currentEditData.email ?? student.email ?? ''} onChange={(e) => handleFieldChange(student.studentId, 'email', e.target.value)} /> ) : ( student.email || 'N/A' ),
            // dateOfBirth: canEdit ? ( <input type="date" ... value={currentEditData.dateOfBirth ?? (student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '')} onChange={(e) => handleFieldChange(student.studentId, 'dateOfBirth', e.target.value)} /> ) : ( student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A' ),
            // motherName: canEdit ? ( <input type="text" ... value={currentEditData.motherName ?? student.motherName ?? ''} onChange={(e) => handleFieldChange(student.studentId, 'motherName', e.target.value)} /> ) : ( student.motherName || 'N/A' ),
            // mobileNumber: canEdit ? ( <input type="tel" ... value={currentEditData.mobileNumber ?? student.mobileNumber ?? ''} onChange={(e) => handleFieldChange(student.studentId, 'mobileNumber', e.target.value)} /> ) : ( student.mobileNumber || 'N/A' ),
        };
    });


    return (
        <div className="m-2 p-2  bg-white dark:bg-secondary-dark-bg rounded-3xl">
           <h1 className="text-2xl font-semibold dark:text-gray-200" style={{ color: currentColor }}>Bulk Student Editor</h1>
            <div className="flex flex-wrap gap-4 ">
                {/* Filters */}
                {/* <div className="flex-1 "> */}
                    <ReactSelect
                        name="class"
                        label="Filter by Class"
                        value={filterValues.class}
                        handleChange={handleFilterChange}
                        dynamicOptions={dynamicOptions}
                        placeholder="Select Class"
                         isDisabled={edit}
                    />
                {/* </div>
                 <div className="flex-1 min-w-[150px]"> */}
                    <ReactSelect
                        name="section"
                        label="Filter by Section"
                        value={filterValues.section}
                        handleChange={handleFilterChange}
                        dynamicOptions={dynamicSection}
                         isDisabled={!filterValues.class || edit}
                        placeholder="Select Section"
                    />
                {/* </div> */}

                {/* Action Buttons - CORRECTED COLORS */}
                 {/* <div className="flex gap-2 items-center flex-wrap"> */}
                    {!edit ? (
                         <Button
                            name="Edit Selected"
                            onClick={handleEditClick}
                            color={currentColor} // Text color white
                            bgColor={currentColor} // Background color from context
                            borderRadius="10px"
                            disabled={selectedStudentIds.length === 0}
                         />
                    ) : (
                        <>
                            <Button
                                name="Save Changes"
                                color="green" // Text color white
                                bgColor="green" // Background color green
                                borderRadius="10px"
                                onClick={handleSave}
                             />
                            <Button
                                name="Cancel"
                                color="gray" // Text color white
                                bgColor="gray" // Background color gray
                                borderRadius="10px"
                                onClick={handleCancel}
                            />
                        </>
                    )}
                 {/* </div> */}
            </div>

            {/* Table */}
             <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                 <Table
                     tHead={THEAD}
                     tBody={tBody}
                     isSearch={false}
                 />
            </div>
             {filteredStudents.length === 0 && !edit && (
                 <p className="text-center mt-4 dark:text-gray-400">No students match the current filter, or data is loading.</p>
             )}
             {filteredStudents.length > 0 && selectedStudentIds.length === 0 && !edit && (
                 <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">Select students using the checkboxes to enable editing.</p>
             )}
              {edit && (
                 <p className="text-center mt-4 text-sm text-blue-600 dark:text-blue-400">Edit mode active. Modify selected student details and click 'Save Changes'.</p>
             )}
        </div>
    );
};

export default BulkEdit;

// import React, { useCallback, useEffect, useState } from 'react';
// import {
//     ActiveStudents,
//     AdminGetAllClasses,
//     editBulkstudentparent,

// } from '../../../Network/AdminApi'; // Assuming ActiveStudents returns necessary fields like address, admissionNumber etc.
// import Table from '../../../Dynamic/Table';
// import Button from '../../../Dynamic/utils/Button';
// import { toast } from 'react-toastify';
// import { useStateContext } from '../../../contexts/ContextProvider';
// import { ReactSelect } from '../../../Dynamic/ReactSelect/ReactSelect';
// const BulkEdit = () => {
//     const { currentColor, setIsLoader } = useStateContext();
//     const [filteredStudents, setFilteredStudents] = useState([]);
//     const [studentDetails, setStudentDetails] = useState([]); // Holds all fetched students
//     const [selectedStudentIds, setSelectedStudentIds] = useState([]); // Stores only IDs of selected students
//     const [selectAll, setSelectAll] = useState(false);
//     const [getClass, setGetClass] = useState([]);
//     const [edit, setEdit] = useState(false); // Controls edit mode
//     const [availableSections, setAvailableSections] = useState([]);
//     const [editFormData, setEditFormData] = useState({}); // Stores changes: { studentId: { field: value, ... } }

//     const [filterValues, setFilterValues] = useState({
//         class: "",
//         section: "",
//     });

//     // Fetch all active students
//     const fetchStudentData = useCallback(async () => {
//         setIsLoader(true);
//         try {
//             const response = await ActiveStudents(); // Make sure this API returns all needed fields
//             if (response?.success && response?.students?.data) {
//                 const students = response.students.data.map(s => ({ ...s, id: s.studentId })).reverse(); // Add 'id' if needed by Table, ensure studentId exists
//                 setStudentDetails(students);
//                 // Apply initial filter if values are set, otherwise show all
//                 filterStudents(filterValues.class, filterValues.section, students);
//                 console.log("Active students fetched:", students);
//             } else {
//                 toast.error("Could not fetch students or no students found.");
//                 setStudentDetails([]);
//                 setFilteredStudents([]);
//             }
//         } catch (error) {
//             console.error('Error fetching active students:', error);
//             toast.error('Error fetching active students.');
//             setStudentDetails([]);
//             setFilteredStudents([]);
//         } finally {
//             setIsLoader(false);
//         }
//     }, [setIsLoader, filterValues.class, filterValues.section]); // Add filterValues dependency if filtering should happen on fetch

//     // Fetch all classes
//     const fetchAllClasses = useCallback(async () => {
//         setIsLoader(true);
//         try {
//             const response = await AdminGetAllClasses();
//             if (response?.success) {
//                 setGetClass(response.classes || []);
//             } else {
//                 toast.error("Error: Could not fetch classes.");
//             }
//         } catch (error) {
//             toast.error("Error fetching classes");
//             console.error("Error fetching classes:", error);
//         } finally {
//             setIsLoader(false); // Ensure loader stops even on error
//         }
//     }, [setIsLoader]);

//     useEffect(() => {
//         fetchStudentData();
//         fetchAllClasses();
//     }, []); // Fetch on initial mount

//     // Filter students based on class and section
//     const filterStudents = (cls, sec, studentsToFilter = studentDetails) => {
//         if (!cls && !sec) {
//             setFilteredStudents(studentsToFilter); // Show all if no filters
//             return;
//         }
//         const filtered = studentsToFilter.filter((student) => {
//             const matchClass = cls ? student.class === cls : true;
//             const matchSection = sec ? student.section === sec : true;
//             return matchClass && matchSection;
//         });
//         setFilteredStudents(filtered);
//         // Reset selection when filter changes
//         setSelectedStudentIds([]);
//         setSelectAll(false);
//         setEditFormData({}); // Clear any pending edits if filter changes
//         setEdit(false); // Exit edit mode if filter changes
//     };

//     // Handle class/section filter changes
//     const handleFilterChange = (e) => {
//         const { name, value } = e.target; // Assuming ReactSelect passes event-like structure or adapt if needed
//         const newFilterValues = {
//             ...filterValues,
//             [name]: value
//         };
//         setFilterValues(newFilterValues);

//         if (name === "class") {
//             const classObj = getClass.find((cls) => cls.className === value);
//             setAvailableSections(classObj?.sections || []);
//             // Reset section if class changes and selected section is not valid
//             if (value && classObj && !classObj.sections.includes(filterValues.section)) {
//                newFilterValues.section = ""; // Reset section if it's not in the new class
//                setFilterValues(prev => ({ ...prev, section: "" })); // Update state immediately
//             }
//             filterStudents(value, newFilterValues.section); // Use updated section value
//         } else if (name === "section") {
//             filterStudents(filterValues.class, value);
//         }
//     };

//     // Handle Select All checkbox
//     const handleSelectAllChange = () => {
//         const newSelectAll = !selectAll;
//         setSelectAll(newSelectAll);
//         setSelectedStudentIds(newSelectAll ? filteredStudents.map(s => s.studentId) : []);
//         if (!newSelectAll) {
//             // Optionally clear edit form data if deselecting all
//              setEditFormData({});
//         }
//     };

//     // Handle individual row checkbox change
//     const handleCheckboxChange = (studentId) => {
//         setSelectedStudentIds(prev =>
//             prev.includes(studentId)
//                 ? prev.filter(id => id !== studentId)
//                 : [...prev, studentId]
//         );
//         // Uncheck "Select All" if any individual box is unchecked
//         if (selectedStudentIds.includes(studentId)) {
//              setSelectAll(false);
//         }
     
//     };

//     // Enter edit mode
//     const handleEditClick = () => {
//         if (selectedStudentIds.length === 0) {
//             toast.warn("Please select at least one student to edit.");
//             return;
//         }
//         // Pre-populate editFormData with current data for selected students
//         const initialEditData = {};
//         selectedStudentIds.forEach(id => {
//             const student = studentDetails.find(s => s.studentId === id); // Find from original details
//             if (student) {
//                 // Add only the fields you want to be editable
//                 initialEditData[id] = {
//                     admissionNumber: student.admissionNumber,
//                     studentName: student.studentName,
//                     fatherName: student.fatherName,
//                     address: student.address || "", // Ensure address exists or default to empty string
//                     // Add other editable fields here...
//                     // Example: mobileNumber: student.mobileNumber || ""
//                 };
//             }
//         });
//         setEditFormData(initialEditData);
//         setEdit(true);
//         setSelectAll(false); // Disable select all in edit mode for clarity
//     };

//     // Handle changes in input fields during edit mode
//     const handleFieldChange = (studentId, fieldName, value) => {
//         setEditFormData(prev => ({
//             ...prev,
//             [studentId]: {
//                 ...(prev[studentId] || {}), // Keep existing edits for this student
//                 [fieldName]: value
//             }
//         }));
//     };

//     // Save changes
//     console.log("selectedStudentIds",selectedStudentIds)
//     const handleSave = async () => {
//         if (selectedStudentIds.length === 0) {
//             toast.warn("No students selected.");
//             return;
//         }

//         const payload={
//             updates:  selectedStudentIds.map((val,ind)=>({
//                 studentId:val?.studentId,
//                 "fields": {
//                         "studentName": "vicky kumar",
//                         "class": "II",
//                         "section": "A",
//                         "admissionNumber": "1234",
//                         "email": "vickykumar8826110175@gmail.com",
//                         "dateOfBirth": "1989-08-27T00:00:00.000Z",
//                         "motherName": "mrs nn"
//                     }
//             }))
//         }


//         if (payload.length === 0) {
//             toast.info("No changes detected for the selected students.");
//             setEdit(false); // Still exit edit mode
//             setEditFormData({});
//             return;
//         }

//         setIsLoader(true);
//         try {
//             // **** Replace with your actual bulk update API call ****
//             const response = await editBulkstudentparent(payload);

//             if (response?.success) {
//                 toast.success(response?.message || "Students updated successfully!");
//                 setEdit(false);
//                 setSelectedStudentIds([]); // Clear selection after successful save
//                 setSelectAll(false);
//                 setEditFormData({});
//                 await fetchStudentData(); // Refetch data to show updated values
//             } else {
//                 toast.error(response?.message || "Failed to update students.");
//             }
//         } catch (error) {
//             console.error("Error updating students:", error);
//             toast.error("An error occurred while saving changes.");
//         } finally {
//             setIsLoader(false);
//         }
//     };

//     // Cancel editing
//     const handleCancel = () => {
//         setEdit(false);
    
//         toast.info("Edit cancelled.");
//     };


//     // Options for ReactSelect
//     const dynamicOptions = getClass.map(cls => ({
//         label: cls.className,
//         value: cls.className
//     }));

//     const dynamicSection = availableSections.map(item => ({
//         label: item,
//         value: item
//     }));

//     // Define Table Headers
//     const THEAD = [
//         // Conditionally render Select All checkbox only when not editing
//         { id: 'select', label: !edit ? <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} /> : 'Select' },
//         { id: 'SN', label: 'S No.' },
//         { id: 'admissionNo', label: 'Adm No' },
//         { id: 'name', label: 'Name' },
//         { id: 'fatherName', label: "Father's Name" },
//         { id: 'class', label: 'Class' },
//         { id: 'section', label: 'Section' },
//         { id: "address", label: "Address" },
//         // Add other headers for fields you fetch and might want to edit
//         // { id: "mobileNumber", label: "Mobile" },
//     ];

//     // Generate Table Body Data
//     const tBody = filteredStudents?.map((student, index) => {
//         const isSelected = selectedStudentIds.includes(student.studentId);
//         const canEdit = edit && isSelected;
//         const currentEditData = editFormData[student.studentId] || {}; // Get edited data or empty object

//         return {
//             id: student.studentId, // Ensure each row has a unique id for React/Table component
//             select: (
//                 <input
//                     type="checkbox"
//                     checked={isSelected}
//                     onChange={() => handleCheckboxChange(student)}
//                     disabled={edit} // Disable checkbox while in edit mode
//                 />
//             ),
//             SN: index + 1,
//             admissionNo: canEdit ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-full bg-white dark:bg-gray-700" // Added background for visibility
//                     value={currentEditData.admissionNumber ?? student.admissionNumber} // Use edited value or fallback to original
//                     onChange={(e) => handleFieldChange(student.studentId, 'admissionNumber', e.target.value)}
//                 />
//             ) : (
//                 student.admissionNumber
//             ),
//             name: canEdit ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-full bg-white dark:bg-gray-700"
//                     value={currentEditData.studentName ?? student.studentName}
//                     onChange={(e) => handleFieldChange(student.studentId, 'studentName', e.target.value)}
//                 />
//             ) : (
//                 student.studentName
//             ),
//             fatherName: canEdit ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-full bg-white dark:bg-gray-700"
//                     value={currentEditData.fatherName ?? student.fatherName}
//                     onChange={(e) => handleFieldChange(student.studentId, 'fatherName', e.target.value)}
//                 />
//             ) : (
//                 student.fatherName
//             ),
//             class: student.class, // Not editable
//             section: student.section, // Not editable
//             address: canEdit ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-full bg-white dark:bg-gray-700"
//                     value={currentEditData.address ?? (student.address || '')} // Use edited value or fallback
//                     onChange={(e) => handleFieldChange(student.studentId, 'address', e.target.value)}
//                 />
//             ) : (
//                 student.address || 'N/A' // Display N/A if address is null/undefined
//             ),
//             // Add other fields similarly...
//             // mobileNumber: canEdit ? (
//             //     <input ... />
//             // ) : (
//             //     student.mobileNumber || 'N/A'
//             // ),
//         };
//     });


//     return (
//         <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
//            <h1 className="text-2xl font-semibold mb-6 dark:text-gray-200" style={{ color: currentColor }}>Bulk Student Editor</h1>
//             <div className="flex flex-wrap gap-4 mb-6 items-end">
//                 {/* Filters */}
//                 <div className="flex-1 min-w-[150px]">
//                     <ReactSelect
//                         name="class"
//                         label="Filter by Class"
//                         value={filterValues.class}
//                         handleChange={handleFilterChange} // Pass the correct handler
//                         dynamicOptions={dynamicOptions}
//                         placeholder="Select Class"
//                          isDisabled={edit} // Disable filters when editing
//                     />
//                 </div>
//                  <div className="flex-1 min-w-[150px]">
//                     <ReactSelect
//                         name="section"
//                         label="Filter by Section"
//                         value={filterValues.section}
//                         handleChange={handleFilterChange} // Pass the correct handler
//                         dynamicOptions={dynamicSection}
//                          isDisabled={!filterValues.class || edit} // Disable if no class selected or if editing
//                         placeholder="Select Section"
//                     />
//                 </div>

//                 {/* Action Buttons */}
//                  <div className="flex gap-2 items-center flex-wrap">
//                     {!edit ? (
//                          <Button
//                             name="Edit Selected"
//                             onClick={handleEditClick}
//                             color={currentColor}
//                             bgColor={currentColor}
//                             borderRadius="10px"
//                             disabled={selectedStudentIds.length === 0} // Disable if no students selected
//                          />
//                     ) : (
//                         <>
//                             <Button
//                                 name="Save Changes"
//                                 color="green"
//                                 bgColor="green" // Use a distinct color for save
//                                 borderRadius="10px"
//                                 onClick={handleSave}
//                              />
//                             <Button
//                                 name="Cancel"
//                                 color="gray"
//                                 bgColor="gray" // Use gray or red for cancel
//                                 borderRadius="10px"
//                                 onClick={handleCancel}
//                             />
//                         </>
//                     )}
//                  </div>
//             </div>

//             {/* Table */}
//              <div className="overflow-x-auto">
//                  <Table
//                      tHead={THEAD}
//                      tBody={tBody}
//                      isSearch={false} // Disable default table search if needed
//                  />
//             </div>
//              {filteredStudents.length === 0 && !edit && (
//                  <p className="text-center mt-4 dark:text-gray-400">No students match the current filter.</p>
//              )}
//         </div>
//     );
// };

// export default BulkEdit;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// import Table from "../../../Dynamic/Table";
// import Button from "../../../Dynamic/utils/Button";
// import { AdminGetAllClasses, feesaddPastDues, getAllStudents, PastDues } from "../../../Network/AdminApi";

// import { useStateContext } from "../../../contexts/ContextProvider";
// import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";

// function BulkEdit() {
//   const session =JSON.parse(localStorage.getItem("session"))
// const {  setIsLoader} = useStateContext();
//   const [addDues, setAddDues] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]); // Now an array of objects
//   const [allSelect, setAllSelect] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");
//     const [selectedSection, setSelectedSection] = useState(null); // Store selected section object { value: string, label: string } | null
//     const [availableSections, setAvailableSections] = useState([]);
//    const getAllStudent = async () => {
//       setIsLoader(true)
//       try {
//         const response = await getAllStudents();
//         if (response?.success) {
//           setIsLoader(false)
//           setSubmittedData(response?.students?.data);
          
//           // setSubmittedData(filterApproved);
//           // setFilteredData(filterApproved);
//         } else {
//           toast.error(response?.message);
//         }
//       } catch (error) {
//         console.log("error", error);
//       }
//     };

//     useEffect(()=>{
//       getAllStudent()
//       getAllClass()
//     },[])
//       const getAllClass = async () => {
//         setIsLoader(true)
//         try {
    
//           const response = await AdminGetAllClasses()
//           if (response?.success) {
//             setIsLoader(false)
//             let classes = response.classes;
           
//             setGetClass(classes.sort((a, b) => a - b));
//           }
//         } catch (error) {
//           console.log("error")
//         }
//       }
    
//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };
//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value); // Update the selectedSection state
//   };
//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   const filteredData = submittedData?.filter((item) => {
//     if (selectedClass === "All") {
//       if (selectedStatus === "All") {
//         return true;
//       } else {
//         return item.feeStatus === selectedStatus;
//       }
//     } else {
//       if (selectedStatus === "All") {
//         return item.class === selectedClass;
//       } else {
//         return item.class === selectedClass && item.feeStatus === selectedStatus;
//       }
//     }
//   });

//   const handleRowSelect = (row) => {
//     setSelectedRows((prevSelectedRows) => {
//       const isSelected = prevSelectedRows.some(
//         (item) => item.admissionNumber === row.admissionNumber
//       );

//       if (isSelected) {
//         return prevSelectedRows?.filter((item) => item.admissionNumber !== row.admissionNumber);
//       } else {
//         return [...prevSelectedRows, row];
//       }
//     });
//   };

//   const handleAllSelect = () => {
//     if (allSelect) {
//       setSelectedRows([]); // Deselect all
//     } else {
//       setSelectedRows(filteredData); // Select all filtered rows
//     }
//     setAllSelect(!allSelect);
//   };

//   const handleTotalDuesChange = (e, admissionNumber) => {
//     const newAmount = e.target.value;

//     setSelectedRows((prevSelectedRows) =>
//       prevSelectedRows.map((row) =>
//         row.admissionNumber === admissionNumber ? { ...row, totalDues: newAmount } : row
//       )
//     );
//   };

//   const tHead = [
//     {
//       id: "select",
//       label: (
//         <input type="checkbox" onChange={handleAllSelect} checked={allSelect} />
//       ),
//     },
//     { id: "admissionNo", label: "Admission No" },
//     { id: "name", label: "Name" },
//     { id: "fatherName", label: "Father Name" },
//     { id: "class", label: "Class" },
//     { id: "totalDues", label: "Total Dues" },
//   ];

//   const tBody = filteredData?.map((val) => ({
//     select: (
//       <input
//         type="checkbox"
//         checked={selectedRows.some((row) => row.admissionNumber === val.admissionNumber)}
//         onChange={() => handleRowSelect(val)}
//       />
//     ),
//     admissionNo: val.admissionNumber,
//     name: val.studentName,
//     fatherName: val.fatherName,
//     class: val.class,
//     totalDues: addDues ? (
//       <input
//       type="number"
//         className="border-none outline "
//         value={
//           selectedRows.find((row) => row.admissionNumber === val.admissionNumber)?.totalDues || ""
//         }
//         onChange={(e) => handleTotalDuesChange(e, val.admissionNumber)}
//       />
//     ) : (
//       val.totalDues
//     ),
//   }));

//   const handleAddFee = async () => {
//     setAddDues(true);

   
//   };

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));
//   const DynamicSection = availableSections?.map((item) => ({
//     label: item,
//     value: item,
//   }));
//   const handleSave = async() => {
//     if (selectedRows.length === 0) {
//       toast.warn("No students selected.");
//       return;
//     }
//     setIsLoader(true)
//     const payload = {
//       students: selectedRows.map((val) => ({
//         studentId: val?.studentId,
//         pastDuesAmount: Number(val?.totalDues),
//         session: session,
//       })),
//     };
//     try {
//       const response = await PastDues(payload);
//       if (response?.success) {
//         setIsLoader(false)
//         toast.success(response?.message);
       
//         setSelectedRows([]);
//         setAllSelect(false);
//         setAddDues(false);
//       }
//       else{
//         setIsLoader(false)
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("Error", error);
//       setIsLoader(false)
//     }
 
//   };

//   return (
//     <div className="relative p-2">
//       <div className="flex gap-2">
//          <ReactSelect
//                     name="studentClass"
//                     value={selectedClass}
//                     handleChange={handleClassChange}
//                     label="Select a Class"
//                     dynamicOptions={dynamicOptions}
//                   />
//                   <ReactSelect
//                     name="studentSection"
//                     value={selectedSection} // Use selectedSection state
//                     handleChange={handleSectionChange} // Use the handleSectionChange function
//                     label="Select a Section"
//                     dynamicOptions={DynamicSection}
//                   />
//       <select
//             name="studentClass"
//             className=" border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7"
//             value={selectedClass}
//             onChange={handleClassChange}
//           >
//             <option value="All">All Classes</option>
//             {getClass?.map((cls, index) => (
//               <option key={index} value={cls.className}>
//                 {cls?.className}
//               </option>
//             ))}
//           </select>
//         <Button name="Add Dues Fees" onClick={handleAddFee} />
//         {addDues && (
//           <div className="flex gap-3">
//             <Button name="Save" color="green" onClick={handleSave} />
//             <Button name="Cancel" color="gray" onClick={() => setAddDues(false)} />
//           </div>
//         )}
//       </div>
//         <Table tHead={tHead} tBody={tBody} />
   
//     </div>
//   );
// }

// export default BulkEdit;

