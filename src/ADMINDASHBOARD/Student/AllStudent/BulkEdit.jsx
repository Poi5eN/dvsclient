// import React, { useCallback, useEffect, useState } from 'react';
// import {
//     ActiveStudents,
//     AdminGetAllClasses,
//     editBulkstudentparent, // Use your actual API function

// } from '../../../Network/AdminApi';
// import Table from '../../../Dynamic/Table';
// import Button from '../../../Dynamic/utils/Button';
// import { toast } from 'react-toastify';
// import { useStateContext } from '../../../contexts/ContextProvider';
// import { ReactSelect } from '../../../Dynamic/ReactSelect/ReactSelect';
// import moment from 'moment';
// import DatePicker from '../../../Dynamic/DatePicker/DatePicker'; // Keep if needed for DOB

// const BulkEdit = () => {
//     const session = JSON.parse(localStorage.getItem("session"))
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

//     // --- Gender Options ---
//     const genderOptions = [
//         { value: 'Male', label: 'Male' },
//         { value: 'Female', label: 'Female' },
//         { value: 'Other', label: 'Other' },
//     ];

//     // Fetch all active students
//     const fetchStudentData = useCallback(async (cls = filterValues.class, sec = filterValues.section) => {
//         setIsLoader(true);
//         try {
//             const response = await ActiveStudents(session);
//             if (response?.success && response?.students?.data) {
//                 // Ensure studentId is present and consistent
//                 const students = response.students.data.map(s => ({
//                     ...s,
//                     id: s.studentId, // Ensure 'id' for Table component if needed
//                     studentId: s.studentId // Explicitly keep studentId
//                 })).reverse();
//                 setStudentDetails(students);
//                 filterStudents(cls, sec, students); // Filter locally
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
//     }, [setIsLoader, filterValues.class, filterValues.section]); // Keep dependencies

//     // Fetch all classes
//     const fetchAllClasses = useCallback(async () => {
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
//         }
//     }, []); // Removed setIsLoader dependency as it's not strictly needed here

//     useEffect(() => {
//         fetchStudentData();
//         fetchAllClasses();
//     }, []); // Run only on mount

//     // Filter students based on class and section
//     const filterStudents = (cls, sec, studentsToFilter = studentDetails) => {
//         console.log("Filtering with:", cls, sec);
//         let filtered = studentsToFilter;
//         if (cls) {
//             filtered = filtered.filter((student) => student.class === cls);
//         }
//         if (sec) {
//             filtered = filtered.filter((student) => student.section === sec);
//         }

//         setFilteredStudents(filtered);

//         if (filterValues.class !== cls || filterValues.section !== sec) {
//              setSelectedStudentIds([]);
//              setSelectAll(false);
//              setEditFormData({});
//              setEdit(false);
//         }
//     };

//     // Handle class/section filter changes
//     const handleFilterChange = (e) => {
//         const { name, value } = e.target;
//         let newFilterValues = { ...filterValues, [name]: value };
//         let targetClass = newFilterValues.class;
//         let targetSection = newFilterValues.section;

//         if (name === "class") {
//             const classObj = getClass.find((cls) => cls.className === value);
//             const sections = classObj?.sections || [];
//             setAvailableSections(sections);
//             if (value && !sections.includes(filterValues.section)) {
//                 targetSection = "";
//                 newFilterValues.section = "";
//             }
//              // If class is cleared, clear sections too
//              if (!value) {
//                 targetSection = "";
//                 newFilterValues.section = "";
//                 setAvailableSections([]);
//              }
//         }

//         setFilterValues(newFilterValues);
//         filterStudents(targetClass, targetSection);
//     };

//     // Handle Select All checkbox
//     const handleSelectAllChange = () => {
//         const newSelectAll = !selectAll;
//         setSelectAll(newSelectAll);
//         setSelectedStudentIds(newSelectAll ? filteredStudents.map(s => s.studentId) : []);
//         if (!newSelectAll) {
//              setEditFormData({});
//         }
//     };

//     // Handle individual row checkbox change
//     const handleCheckboxChange = (studentId) => {
//         setSelectedStudentIds(prev => {
//             const isCurrentlySelected = prev.includes(studentId);
//             if (isCurrentlySelected) {
//                 return prev.filter(id => id !== studentId);
//             } else {
//                 return [...prev, studentId];
//             }
//         });
//         // Adjust SelectAll state
//         if (selectedStudentIds.includes(studentId)) {
//             setSelectAll(false);
//         } else {
//             // Check if adding this one makes all selected
//             if (selectedStudentIds.length + 1 === filteredStudents.length && filteredStudents.length > 0) {
//                  setSelectAll(true);
//             }
//         }
//     };


//     // Enter edit mode
//     const handleEditClick = () => {
//         if (selectedStudentIds.length === 0) {
//             toast.warn("Please select at least one student to edit.");
//             return;
//         }
//         const initialEditData = {};
//         selectedStudentIds.forEach(id => {
//             const student = studentDetails.find(s => s.studentId === id);
//             if (student) {
//                 // Pre-populate edit form data with original values for selected students
//                 initialEditData[id] = {
//                     admissionNumber: student.admissionNumber,
//                     studentName: student.studentName,
//                     fatherName: student.fatherName,
//                     motherName: student.motherName, // Add other editable fields
//                     rollNo: student.rollNo,
//                     email: student.email,
//                     dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "", // Format for date input
//                     gender: student.gender,
//                     contact: student.contact,
//                     address: student.address || "",
//                     section: student.section, // Make section editable if needed
//                     // Add other fields as needed
//                 };
//             }
//         });
//         setEditFormData(initialEditData);
//         setEdit(true);
//         // It might be less confusing to disable selectAll checkbox in edit mode
//         // setSelectAll(false); // Optional: Reset selectAll when entering edit mode
//     };

//     // Handle changes in *individual* input fields during edit mode
//     const handleFieldChange = (studentId, fieldName, value) => {
//         setEditFormData(prev => ({
//             ...prev,
//             [studentId]: {
//                 ...(prev[studentId] || {}), // Ensure studentId entry exists
//                 [fieldName]: value
//             }
//         }));
//     };

//     // --- Handler for the GLOBAL Gender Dropdown ---
//     const handleGlobalGenderChange = (selectedOption) => {
//         const newGender = selectedOption ? selectedOption.value : null; // Get the value ('Male', 'Female', etc.)
//         if (!newGender) return; // Do nothing if cleared or invalid

//         // Update editFormData for all selected students
//         setEditFormData(prevData => {
//             const newData = { ...prevData };
//             selectedStudentIds.forEach(id => {
//                 newData[id] = {
//                     ...(newData[id] || {}), // Preserve other edits for this student
//                     gender: newGender // Set the new gender
//                 };
//             });
//             return newData;
//         });
//         toast.info(`Set gender to ${newGender} for ${selectedStudentIds.length} selected students.`);
//     };

//     // Save changes
//     const handleSave = async () => {
//         if (selectedStudentIds.length === 0) {
//             toast.warn("No students selected to save.");
//             return;
//         }

//         const updatesPayload = selectedStudentIds
//             .map(studentId => {
//                 const originalStudent = studentDetails.find(s => s.studentId === studentId);
//                 const editedStudentData = editFormData[studentId];

//                 if (!editedStudentData || !originalStudent) {
//                     console.warn(`Skipping student ID ${studentId}: No edit data or original student found.`);
//                     return null;
//                 }

//                 const changedFields = {};
//                 let hasChanged = false;
//                 // Compare all keys present in editFormData for the student
//                 for (const key in editedStudentData) {
//                     // Normalize undefined/null/empty string for comparison, convert dates if necessary
//                     let originalValue = originalStudent[key];
//                     let editedValue = editedStudentData[key];

//                      // Special handling for dates if needed (compare ISO strings or timestamps)
//                      if (key === 'dateOfBirth') {
//                         const originalDate = originalValue ? moment(originalValue).format('YYYY-MM-DD') : '';
//                         const editedDate = editedValue ? moment(editedValue).format('YYYY-MM-DD') : '';
//                          if (editedDate !== originalDate) {
//                              changedFields[key] = editedValue ? new Date(editedValue).toISOString() : null; // Send ISO format or null
//                              hasChanged = true;
//                          }
//                      }
//                      // General comparison for other fields
//                      else if (String(editedValue ?? '') !== String(originalValue ?? '')) {
//                         changedFields[key] = editedValue;
//                         hasChanged = true;
//                     }
//                 }

//                 if (hasChanged) {
//                     return {
//                         studentId: studentId,
//                         fields: changedFields
//                     };
//                 } else {
//                     return null;
//                 }
//             })
//             .filter(update => update !== null);


//         if (updatesPayload.length === 0) {
//             toast.info("No changes detected for the selected students.");
//             setEdit(false);
//             setEditFormData({});
//             // Optionally reset selection
//             // setSelectedStudentIds([]);
//             // setSelectAll(false);
//             return;
//         }

//         const finalPayload = { updates: updatesPayload };
//         console.log("Sending Payload:", JSON.stringify(finalPayload, null, 2));

//         setIsLoader(true);
//         try {
//             const response = await editBulkstudentparent(finalPayload);

//             if (response?.success) {
//                 toast.success(response?.message || "Students updated successfully!");
//                 setEdit(false);
//                 setSelectedStudentIds([]);
//                 setSelectAll(false);
//                 setEditFormData({});
//                 await fetchStudentData(filterValues.class, filterValues.section); // Refetch
//             } else {
//                 let errorMessage = "Failed to update students.";
//                 if (response?.message) errorMessage = response.message;
//                 else if (response?.error) errorMessage = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
//                 toast.error(errorMessage);
//                 console.error("API Error Response:", response);
//             }
//         } catch (error) {
//             console.error("Error updating students:", error);
//             toast.error(`An error occurred while saving changes: ${error.message || 'Unknown error'}`);
//         } finally {
//             setIsLoader(false);
//         }
//     };

//     // Cancel editing
//     const handleCancel = () => {
//         setEdit(false);
//         setEditFormData({}); // Clear pending edits
//         // Optionally reset selection
//         // setSelectedStudentIds([]);
//         // setSelectAll(false);
//         toast.info("Edit cancelled.");
//     };


//     // Options for ReactSelect (Classes & Sections)
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
//         { id: 'select', label: !edit ? <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} disabled={filteredStudents.length === 0} /> : 'Sel' }, // 'Sel' indicates selection status in edit mode
//         { id: 'SN', label: '#' },
//         { id: 'admissionNo', label: 'Adm No' },
//         { id: 'name', label: 'Name' },
//         { id: 'fatherName', label: "Father" },
//         { id: 'motherName', label: "Mother" },
//         { id: 'rollNo', label: "Roll" },
//         { id: 'email', label: "Email" },
//         { id: 'dateOfBirth', label: "DOB" },
//         { id: 'gender', label: "Gender" }, // Keep header
//         { id: 'contact', label: "Contact" },
//         { id: 'class', label: 'Class' },
//         { id: 'section', label: 'Sec' },
//         { id: "address", label: "Address" },
//     ];

//     // Generate Table Body Data
//     const tBody = filteredStudents?.map((student, index) => {
//         const isSelected = selectedStudentIds.includes(student.studentId);
//         // Row is editable only if edit mode is on AND this student is selected
//         const canEditRow = edit && isSelected;
//         const currentEditData = editFormData[student.studentId] || {}; // Get edits for this student or empty obj

//         return {
//             id: student.studentId, // Key for React
//             select: (
//                 // Show selection status in edit mode, checkbox otherwise
//                 edit ? (isSelected ? '✔️' : '❌') : (
//                     <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={() => handleCheckboxChange(student.studentId)}
//                     />
//                 )
//             ),
//             SN: index + 1,
//             admissionNo: canEditRow ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-[70px] bg-gray-200 dark:bg-gray-600 rounded text-xs" // Slightly different bg for edit
//                     value={currentEditData.admissionNumber ?? ''} // Use ?? '' to handle null/undefined from initial load
//                     onChange={(e) => handleFieldChange(student.studentId, 'admissionNumber', e.target.value)}
//                 />
//             ) : (
//                 student.admissionNumber
//             ),
//             name: canEditRow ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-[100px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.studentName ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'studentName', e.target.value)}
//                 />
//             ) : (
//                 student.studentName
//             ),
//             fatherName: canEditRow ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-[100px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.fatherName ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'fatherName', e.target.value)}
//                 />
//             ) : (
//                 student.fatherName
//             ),
//             motherName: canEditRow ? (
//                 <input
//                     type="text"
//                     className="border p-1 w-[100px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.motherName ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'motherName', e.target.value)}
//                 />
//             ) : (
//                 student.motherName
//             ),
//             rollNo: canEditRow ? (
//                 <input
//                     type="text" // Keep as text even if numbers expected, easier validation later if needed
//                     className="border p-1 w-[50px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.rollNo ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'rollNo', e.target.value)}
//                 />
//             ) : (
//                 student.rollNo
//             ),
//             email: canEditRow ? (
//                 <input
//                     type="email" // Use email type for basic browser validation
//                     className="border p-1 min-w-[150px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.email ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'email', e.target.value)}
//                 />
//             ) : (
//                 student.email
//             ),
//             dateOfBirth: canEditRow ? (
//                  <input
//                     type="date" // Use standard date input
//                     className="border p-1 w-[130px] bg-gray-200 dark:bg-gray-600 rounded text-xs custom-calendar" // Added custom-calendar class if needed
//                     value={currentEditData.dateOfBirth ?? ''} // Value should be 'YYYY-MM-DD'
//                     onChange={(e) => handleFieldChange(student.studentId, 'dateOfBirth', e.target.value)}
//                  />
//                 // Or keep DatePicker if you prefer its styling/features
//                 // <DatePicker
//                 //     className="custom-calendar border p-1 w-[130px] bg-gray-200 dark:bg-gray-600 rounded text-xs" // Apply styling classes
//                 //     placeholder=""
//                 //     name="dateOfBirth"
//                 //     id={`dob-${student.studentId}`} // Unique ID
//                 //     value={currentEditData.dateOfBirth ? new Date(currentEditData.dateOfBirth) : null}
//                 //     handleChange={(date) => handleFieldChange(student.studentId, 'dateOfBirth', date ? date.toISOString().split('T')[0] : '')} // Pass YYYY-MM-DD string
//                 //     dateFormat="yyyy-MM-dd" // Set display/parse format if DatePicker supports it
//                 // />
//             ) : (
//                 student.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : "N/A"
//             ),
//             // --- GENDER: Updated to show input field or dropdown in edit mode ---
//             gender: canEditRow ? (
//                 <ReactSelect
//                     name={`gender-${student.studentId}`}
//                     value={genderOptions.find(opt => opt.value === (currentEditData.gender || student.gender)) || null}
//                     handleChange={(selectedOption) => handleFieldChange(student.studentId, 'gender', selectedOption ? selectedOption.value : '')}
//                     dynamicOptions={genderOptions}
//                     placeholder="Gender"
//                     className="w-[100px]"
//                     styles={{
//                         control: (provided) => ({
//                             ...provided,
//                             minHeight: '30px',
//                             height: '30px'
//                         }),
//                         valueContainer: (provided) => ({
//                             ...provided,
//                             height: '30px',
//                             padding: '0 6px'
//                         }),
//                         input: (provided) => ({
//                             ...provided,
//                             margin: '0px',
//                         }),
//                         indicatorsContainer: (provided) => ({
//                             ...provided,
//                             height: '30px',
//                         }),
//                     }}
//                 />
//             ) : (
//                (student.gender || "N/A")
//             ),
//             contact: canEditRow ? (
//                 <input
//                     type="text" // Use text, handle potential non-numeric chars if needed
//                     className="border p-1 w-[100px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.contact ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'contact', e.target.value)}
//                 />
//             ) : (
//                (student.contact || "N/A")
//             ),
//             class: `${student.class}`, // Not editable in this view
//             section: canEditRow ? ( // Allow editing section if desired
//                 <input
//                     type="text"
//                     className="border p-1 w-[50px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.section ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'section', e.target.value)}
//                 />
//             ) : (
//                 student.section || 'N/A'
//             ),
//             address: canEditRow ? (
//                 <input
//                     type="text"
//                     className="border p-1 min-w-[150px] bg-gray-200 dark:bg-gray-600 rounded text-xs"
//                     value={currentEditData.address ?? ''}
//                     onChange={(e) => handleFieldChange(student.studentId, 'address', e.target.value)}
//                 />
//             ) : (
//                 student.address || 'N/A'
//             ),
//         };
//     });


//     return (
//         <div className="m-2 p-4 bg-white dark:bg-secondary-dark-bg rounded-xl shadow-md">
//            <h1 className="text-xl font-semibold dark:text-gray-200 mb-4" style={{ color: currentColor }}>Bulk Student Editor</h1>

//             {/* Filters and Action Buttons Container */}
//             <div className="flex flex-wrap items-end gap-4 mb-4">
//                 {/* Filters */}
//                 <div className="flex-shrink-0 w-full sm:w-auto">
//                      <ReactSelect
//                         name="class"
//                         label="Filter by Class"
//                         // Ensure value is handled correctly for ReactSelect (needs object or primitive)
//                         value={dynamicOptions.find(opt => opt.value === filterValues.class) || null}
//                         handleChange={(selectedOption) => handleFilterChange({ target: { name: 'class', value: selectedOption ? selectedOption.value : '' } })}
//                         dynamicOptions={dynamicOptions} // Pass options prop
//                         placeholder="Select Class"
//                         isDisabled={edit}
//                         className="min-w-[180px]" // Add class for width control
//                      />
//                  </div>
//                  <div className="flex-shrink-0 w-full sm:w-auto">
//                     <ReactSelect
//                         name="section"
//                         label="Filter by Section"
//                         // Ensure value is handled correctly for ReactSelect
//                         value={dynamicSection.find(opt => opt.value === filterValues.section) || null}
//                         handleChange={(selectedOption) => handleFilterChange({ target: { name: 'section', value: selectedOption ? selectedOption.value : '' } })}
//                         dynamicOptions={dynamicSection} // Pass options prop
//                         isDisabled={!filterValues.class || edit}
//                         placeholder="Select Section"
//                         className="min-w-[150px]" // Add class for width control
//                     />
//                  </div>

//                  {/* Action Buttons / Edit Controls */}
//                  <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
//                     {!edit ? (
//                          <Button
//                             name="Edit Selected"
//                             onClick={handleEditClick}
//                             // color="white" // Text color white
//                             color={currentColor} // Background color from context
//                             borderRadius="10px"
//                             disabled={selectedStudentIds.length === 0}
//                             title={selectedStudentIds.length === 0 ? "Select students first" : "Edit selected rows"}
//                             customClass="px-4 py-2 text-sm" // Adjust padding/text size
//                          />
//                     ) : (
//                         <>
//                              {/* --- Global Gender Editor --- */}
//                              <div className="flex-shrink-0 w-full sm:w-auto">
//                                 <ReactSelect
//                                     name="globalGender"
//                                     label="Set Gender (All Selected)"
//                                     // Value doesn't need to be tied to state, we just need onChange
//                                     dynamicOptions={genderOptions}
//                                     handleChange={handleGlobalGenderChange} // Use the new handler
//                                     placeholder="Change Gender..."
//                                     isClearable={true} // Allow clearing selection
//                                     className="min-w-[180px]" // Width control
//                                 />
//                             </div>

//                             <Button
//                                 name="Save Changes"
//                                 // color="white" // Text color white
//                                 color="green" // Background color green
//                                 borderRadius="10px"
//                                 onClick={handleSave}
//                                 customClass="px-4 py-2 text-sm"
//                              />
//                             <Button
//                                 name="Cancel"
//                                 // color="white" // Text color white
//                                 color="gray" // Background color gray
//                                 borderRadius="10px"
//                                 onClick={handleCancel}
//                                 customClass="px-4 py-2 text-sm"
//                             />
//                         </>
//                     )}
//                  </div>
//             </div>

//              <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
//                  <Table
//                      tHead={THEAD}
//                      tBody={tBody}
//                      isSearch={false} // Keep internal search off if using external filters
//                  />
//             </div>

//             {/* Footer Messages */}
//              <div className="text-center mt-4 text-sm">
//                  {filteredStudents.length === 0 && !edit && (
//                      <p className="text-gray-500 dark:text-gray-400">No students match the current filter, or data is loading.</p>
//                  )}
//                  {filteredStudents.length > 0 && selectedStudentIds.length === 0 && !edit && (
//                      <p className="text-gray-500 dark:text-gray-400">Select students using the checkboxes to enable editing.</p>
//                  )}
//                  {edit && selectedStudentIds.length > 0 && (
//                      <p className="text-blue-600 dark:text-blue-400">
//                          Edit mode active for {selectedStudentIds.length} student(s). Modify details below or use global controls, then Save or Cancel.
//                      </p>
//                  )}
//                   {edit && selectedStudentIds.length === 0 && (
//                      <p className="text-orange-600 dark:text-orange-400">
//                          Edit mode active, but no students are currently selected. Select students first (Cancel edit mode to enable selection).
//                      </p>
//                  )}
//             </div>
//         </div>
//     );
// };

// export default BulkEdit;



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
import DatePicker from '../../../Dynamic/DatePicker/DatePicker';
import PageHeaderWithBreadcrumb from '../../../Dynamic/PageHeaderWithBreadcrumb';
import BreadcrumbList from '../../../Dynamic/BreadcrumbList';

const BulkEdit = () => {
    const session=JSON.parse(localStorage.getItem("session"))
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
            const response = await ActiveStudents(session);
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
        // setIsLoader(true);
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
            // setIsLoader(false);
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
       
    ];

    // Generate Table Body Data - CORRECTED CHECKBOX ONCHANGE
    const tBody = filteredStudents?.map((student, index) => {
        const isSelected = selectedStudentIds.includes(student.studentId);
        const canEdit = edit && isSelected;
        const currentEditData = editFormData[student.studentId] || {};
        { console.log("abc",currentEditData)}
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
                 <DatePicker
                                            className="custom-calendar"
                                            placeholder="" 
                                            // label={"DOB"}
                                            respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
                                            name="dateOfBirth"
                                            id="dateOfBirth"
                                            value={
                                                currentEditData.dateOfBirth
                                                  ? new Date(currentEditData.dateOfBirth)
                                                  : student.dateOfBirth
                                                  ? new Date(student.dateOfBirth)
                                                  : null
                                              }
                                           
                                            handleChange={(e) =>handleFieldChange(student.studentId, 'dateOfBirth', e.target.value)}
                                           
                                            hourFormat="12"
                                        />
            ) : (
                moment(student.dateOfBirth).format("DD-MM-YYYY")
            ),
           
           
            contact: canEdit ? (
                <input
                    type="number"
                    className="border p-1 w-[120px] bg-gray-300 dark:bg-gray-700 rounded"
                   
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
            ),};
    });


    return (
        <div className="">
             <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Bulk Student Editor"/>
           {/* <h1 className="text-2xl font-semibold dark:text-gray-200" style={{ color: currentColor }}>Bulk Student Editor</h1> */}
            <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap gap-4 ">
              
                    <ReactSelect
                        name="class"
                        label="Filter by Class"
                        value={filterValues.class}
                        handleChange={handleFilterChange}
                        dynamicOptions={dynamicOptions}
                        placeholder="Select Class"
                         isDisabled={edit}
                    />
               
                    <ReactSelect
                        name="section"
                        label="Filter by Section"
                        value={filterValues.section}
                        handleChange={handleFilterChange}
                        dynamicOptions={dynamicSection}
                         isDisabled={!filterValues.class || edit}
                        placeholder="Select Section"
                    />
                
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
               
            </div>

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
