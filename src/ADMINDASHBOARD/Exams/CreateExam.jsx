import React, { useEffect, useState } from "react";
import moment from "moment";
import { Box, IconButton } from "@mui/material";
import Select from "react-select";
import DeleteIcon from '@mui/icons-material/Delete';
import BoltIcon from '@mui/icons-material/Bolt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// ... (other imports remain the same)
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import Buttons from "../../Dynamic/utils/Button";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { AdminGetAllClasses, createExam, updateExams } from "../../Network/AdminApi";
// import { AdminGetAllClasses } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import ViewExam from "./AllExams/ViewExam";
import { useStateContext } from "../../contexts/ContextProvider";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import DatePicker from "../../Dynamic/DatePicker/DatePicker";
import TimePicker from "../../Dynamic/TimePicker/TimePicker";


const initialFormData = {
  name: "", examType: "", classNames: [], sections: [], term: "",
  startDate: new Date(), endDate: new Date(), resultPublishDate: new Date(),
  subjects: [],
};

const defaultAssessment = {
  name: "", totalMarks: "100", passingMarks: "33", startTime: new Date(), endTime: new Date(), examDate: new Date(),
  // name: "", totalMarks: "100", passingMarks: "33", startTime: null, endTime: null, examDate: null,
};

const CreateExam = () => {
  const { setIsLoader } = useStateContext();
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  const [masterAssessments, setMasterAssessments] = useState([defaultAssessment]);

  const [isEdit, setIsEdit] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loader, setLoader] = useState(false);

  // --- MODIFICATION 1: Change state to handle multiple open subjects ---
  const [openSubjects, setOpenSubjects] = useState(new Set());


  // --- MODIFICATION 2: Update toggle handler to work with a Set ---
  const handleToggleSubject = (sIndex) => {
    setOpenSubjects(prevOpenSubjects => {
      const newOpenSubjects = new Set(prevOpenSubjects);
      if (newOpenSubjects.has(sIndex)) {
        newOpenSubjects.delete(sIndex);
      } else {
        newOpenSubjects.add(sIndex);
      }
      return newOpenSubjects;
    });
  };

  // --- MODIFICATION 3: New handler to toggle all accordions ---
  const handleToggleAllSubjects = () => {
    // If all are open, close all. Otherwise, open all.
    const areAllOpen = openSubjects.size === formData.subjects.length;
    if (areAllOpen) {
      setOpenSubjects(new Set()); // Close all
    } else {
      const allIndices = new Set(formData.subjects.map((_, index) => index));
      setOpenSubjects(allIndices); // Open all
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedClass(null);
    setSelectedSections([]);
    setSelectedSubjects([]);
    setAvailableSections([]);
    setAvailableSubjectsForClass([]);
    setMasterAssessments([defaultAssessment]);
    setIsEdit(false);
    setEditingExamId(null);
    setOpenSubjects(new Set()); // Reset accordion state
  };
  
  // ... (All other handlers like handleInputChange, handleMasterAssessmentChange, etc. remain UNCHANGED) ...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" || name === "examType") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTermChange = (option) => {
    setFormData({ ...formData, term: option ? option?.target.value : "" });
  };

  const handleTopLevelDateChange = (dateValue, name) => {
    setFormData((prev) => ({ ...prev, [name]: dateValue }));
  };

  const handleAssessmentFieldChange = (value, name, sIndex, aIndex) => {
    let processedValue = value;
    if (name === "name" && typeof value === 'string') {
        processedValue = value.toUpperCase();
    }
    setFormData((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[sIndex].assessments[aIndex] = {
          ...updatedSubjects[sIndex].assessments[aIndex],
          [name]: processedValue,
      };
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleMasterAssessmentChange = (value, name, masterIndex) => {
    let processedValue = value;
    if (name === "name" && typeof value === 'string') {
        processedValue = value.toUpperCase();
    }
    setMasterAssessments(prev => prev.map((ass, i) => 
        i === masterIndex ? { ...ass, [name]: processedValue } : ass
    ));
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, sIndex) => {
        if (subject.assessments[masterIndex]) {
          const updatedAssessments = [...subject.assessments];
          let updatedValue = processedValue;
          if (name === 'examDate') {
            updatedValue = value ? moment(value).add(sIndex, 'days').toDate() : null;
          }
          updatedAssessments[masterIndex] = {
            ...updatedAssessments[masterIndex],
            [name]: updatedValue,
          };
          return { ...subject, assessments: updatedAssessments };
        }
        return subject;
      })
    }));
  };
  
  const addMasterAssessmentRow = () => {
    const baseDate = masterAssessments[0]?.examDate;
    setMasterAssessments(prev => [...prev, defaultAssessment]);
    setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.map((subject, sIndex) => {
            const subjectDate = baseDate 
                ? moment(baseDate).add(sIndex, 'days').toDate() 
                : null;
            const newAssessment = { ...defaultAssessment, examDate: subjectDate };
            return { ...subject, assessments: [...subject.assessments, newAssessment] };
        })
    }));
  };

  const removeMasterAssessmentRow = (masterIndex) => {
    setMasterAssessments(prev => prev.filter((_, i) => i !== masterIndex));
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(subject => ({
        ...subject,
        assessments: subject.assessments.filter((_, aIndex) => aIndex !== masterIndex)
      }))
    }));
  };

  const getAllClass = async () => {
    try {
      setIsLoader(true);
      const response = await AdminGetAllClasses();
      if (response?.success) {
        setAvailableClasses(response.classes.map((item) => ({
          value: item._id, label: item.className, sections: item.sections, subjects: item.subjects,
        })));
      } else { toast.error("Failed to fetch class list."); }
    } catch (error) { console.log("error", error); } 
    finally { setIsLoader(false); }
  };

  useEffect(() => { getAllClass(); }, []);
  
  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setSelectedSections([]);
    if (selectedOption) {
      setAvailableSections(selectedOption.sections.map((s) => ({ value: s, label: s })));
      const allSubjects = selectedOption.subjects.map((s) => ({ value: s, label: s }));
      setAvailableSubjectsForClass(allSubjects);
      handleSubjectsSelect(allSubjects);
    } else {
      setAvailableSections([]);
      setAvailableSubjectsForClass([]);
      handleSubjectsSelect([]);
    }
    setFormData((prev) => ({ ...prev, classNames: selectedOption ? [selectedOption.label] : [], sections: [] }));
  };

  const handleSectionSelect = (selectedOptions) => {
    setSelectedSections(selectedOptions);
    const sectionValues = selectedOptions ? selectedOptions.map((o) => o.value) : [];
    setFormData((prev) => ({ ...prev, sections: sectionValues }));
  };


  const handleSubjectsSelect = (selectedOptions) => {
    setSelectedSubjects(selectedOptions);
    const newSubjects = selectedOptions.map((option, sIndex) => {
      const existingSubject = formData.subjects.find((s) => s.name === option.value);
      if (existingSubject) return existingSubject;
      const baseDate = masterAssessments[0]?.examDate;
      const assessments = masterAssessments.map(() => {
        const subjectDate = baseDate 
            ? moment(baseDate).add(sIndex, 'days').toDate() 
            : null;
        return { ...defaultAssessment, examDate: subjectDate };
      });
      return { name: option.value, assessments };
    });
    setFormData((prev) => ({ ...prev, subjects: newSubjects }));

    // --- MODIFICATION 4: Set all subjects to be open by default ---
    const allIndices = new Set(newSubjects.map((_, index) => index));
    setOpenSubjects(allIndices);
  };

  const removeAssessment = (subjectIndex, assessmentIndex) => {
    setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.map((s, i) => 
            i === subjectIndex 
                ? { ...s, assessments: s.assessments.filter((_, a) => a !== assessmentIndex) } 
                : s
        )
    }));
  };

  // ... (handleSubmit remains unchanged) ...
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoader(true);
    setLoader(true);
    try {
      const payload = JSON.parse(JSON.stringify(formData));
      payload.name = payload.name.toUpperCase();
      payload.examType = payload.examType.toUpperCase();
      payload.term = payload.term.toUpperCase();
      payload.startDate = payload.startDate ? moment(payload.startDate).format("YYYY-MM-DD") : "";
      payload.endDate = payload.endDate ? moment(payload.endDate).format("YYYY-MM-DD") : "";
      payload.resultPublishDate = payload.resultPublishDate ? moment(payload.resultPublishDate).format("YYYY-MM-DD") : "";
      payload.subjects.forEach(subject => {
        subject.assessments.forEach(assessment => {
          assessment.name = assessment.name.toUpperCase();
          assessment.startTime = assessment.startTime ? moment(assessment.startTime).format("hh:mm A") : "";
          assessment.endTime = assessment.endTime ? moment(assessment.endTime).format("hh:mm A") : "";
          assessment.examDate = assessment.examDate ? moment(assessment.examDate).format("YYYY-MM-DD") : "";
        });
      });
      const response = isEdit ? await updateExams(editingExamId, payload) : await createExam(payload);
      if (response.success) {
        toast.success(`Exam ${isEdit ? 'updated' : 'created'} successfully!`);
        resetForm();
      } else {
        toast.error(response?.message || `Failed to ${isEdit ? 'update' : 'create'} exam.`);
      }
    } catch (error) {
      toast.error("An error occurred.");
      console.log("error", error);
    } finally {
      setIsLoader(false);
      setLoader(false);
    }
  };


  const handleEdit = (data) => {
    debugger
    window.scrollTo(0, 0); 
    setIsEdit(true);
    setEditingExamId(data.examId); 
    const cls = availableClasses.find((c) => c.label === data.classNames[0]);
    if (cls) {
      setSelectedClass(cls);
      setAvailableSections(cls.sections.map(s => ({ value: s, label: s })));
      setAvailableSubjectsForClass(cls.subjects.map(s => ({ value: s, label:s })));
    }
    setSelectedSections(data.sections.map(s => ({ value: s, label: s })));
    setSelectedSubjects(data.subjects.map(s => ({ label: s.name, value: s.name })));
    const subjectsWithDateObjects = data.subjects.map(subject => ({
      ...subject,
      assessments: subject.assessments.map(ass => ({
        ...ass,
        examDate: ass.examDate ? moment(ass.examDate, "YYYY-MM-DD").toDate() : null,
        startTime: ass.startTime ? moment(ass.startTime, "hh:mm A").toDate() : null,
        endTime: ass.endTime ? moment(ass.endTime, "hh:mm A").toDate() : null,
      }))
    }));
    if (subjectsWithDateObjects.length > 0 && subjectsWithDateObjects[0].assessments.length > 0) {
        setMasterAssessments(subjectsWithDateObjects[0].assessments);
    }
    setFormData({
      ...data,
      startDate: data.startDate ? moment(data.startDate, "YYYY-MM-DD").toDate() : null,
      endDate: data.endDate ? moment(data.endDate, "YYYY-MM-DD").toDate() : null,
      resultPublishDate: data.resultPublishDate ? moment(data.resultPublishDate, "YYYY-MM-DD").toDate() : null,
      subjects: subjectsWithDateObjects,
    });
    // --- MODIFICATION 5: Set all subjects to be open on edit ---
    const allIndices = new Set(subjectsWithDateObjects.map((_, index) => index));
    setOpenSubjects(allIndices);
  };

  const handleCancel = () => { resetForm(); };


  return (
    <div>
      <PageHeaderWithBreadcrumb
        breadcrumbItems={BreadcrumbList.admission}
        title={isEdit ? "Edit Exam" : "Create Exam"}
      />
      <div className="bg-white px-4 md:pb-6 pt-2 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
            {/* ... (Section 1 and Section 2 JSX remains unchanged) ... */}
            <div
            //  className="border-b border-gray-200 pb-6 mb-6"
             >
                {/* <h2 className="text-lg font-semibold text-gray-700 mb-4">Exam Details</h2> */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <ReactInput type="text" name="name" required onChange={handleInputChange} value={formData.name} label="Exam Name" />
                    <ReactInput type="text" name="examType" required onChange={handleInputChange} value={formData.examType} label="Exam Type"/>
                    <ReactSelect name="term" value={formData.term} handleChange={handleTermChange} label="TERMS"
                        dynamicOptions={[{ label: "TERM 1", value: "TERM 1" },{ label: "TERM 2", value: "TERM 2" },{ label: "TERM 3", value: "TERM 3" }]}
                    />             
                    <DatePicker label={"Start Date"} name="startDate" value={formData.startDate} handleChange={(e) => handleTopLevelDateChange(e.target.value, "startDate")}/>          
                    <DatePicker label={"End Date"} name="endDate" value={formData.endDate} handleChange={(e) => handleTopLevelDateChange(e.target.value, "endDate")}/>
                    <DatePicker label={"Result Publish Date"} name="resultPublishDate" value={formData.resultPublishDate} handleChange={(e) => handleTopLevelDateChange(e.target.value, "resultPublishDate")}/>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ">
                    <Select options={availableClasses} value={selectedClass} onChange={handleClassSelect} placeholder="Select a Class" isSearchable isClearable isDisabled={isEdit}/>
                    <Select options={availableSections} value={selectedSections} onChange={handleSectionSelect} placeholder="Select Sections" isMulti isSearchable isDisabled={!selectedClass}/>
                    <Select options={availableSubjectsForClass} value={selectedSubjects} onChange={handleSubjectsSelect} placeholder="Select Subjects" isMulti isSearchable isDisabled={!selectedClass}/>
                </div>
            </div>

            {formData.subjects.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-2 mb-4 mt-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <BoltIcon className="text-yellow-500" />
                        Bulk Edit Assessments
                    </h3>
                    <Buttons name={"Add Another Assessment"} color="blue" variant="outlined" disabled={loader} onClick={addMasterAssessmentRow} />
                </div>
                
                <div className="">
                {masterAssessments.map((masterAss, masterIndex) => (
                    <div key={masterIndex}
                     className="grid grid-cols-2 md:grid-cols-7 gap-2 p-1 bg-white border-b border-dashed border-gray-300 rounded-lg"
                    //  className="flex flex-wrap items-end gap-3 p-3 bg-white border border-dashed border-gray-300 rounded-lg"
                     >
                        <ReactInput type="text" name="name" onChange={(e) => handleMasterAssessmentChange(e.target.value, e.target.name, masterIndex)} value={masterAss.name} label="Assessment Name"/>
                        <ReactInput type="number" name="totalMarks" onChange={(e) => handleMasterAssessmentChange(e.target.value, e.target.name, masterIndex)} value={masterAss.totalMarks} label="Total Marks"/>
                        <ReactInput type="number" name="passingMarks" onChange={(e) => handleMasterAssessmentChange(e.target.value, e.target.name, masterIndex)} value={masterAss.passingMarks} label="Passing Marks"/>
                        <DatePicker  label={"Date"} name="examDate" value={masterAss.examDate} handleChange={(e) => handleMasterAssessmentChange(e.target.value, "examDate", masterIndex)}/>
                        <div className="max-w-[140px]"><TimePicker label={"Start Time"} name="startTime" value={masterAss.startTime} handleChange={(e) => handleMasterAssessmentChange(e.target.value, "startTime", masterIndex)}/></div>
                        <div className="max-w-[140px]"><TimePicker label={"End Time"} name="endTime" value={masterAss.endTime} handleChange={(e) => handleMasterAssessmentChange(e.target.value, "endTime", masterIndex)}/></div>
                        <div>
                          {masterAssessments.length > 1 && (
                            <IconButton color="error" className="mb-1" onClick={() => removeMasterAssessmentRow(masterIndex)} title="Remove this bulk row">
                                <DeleteIcon />
                            </IconButton>
                        )}
                        </div>
                    </div>
                ))}
                </div>
                </div>
            )}
            

            {/* --- Section 3: Individual Subject Details (Accordion) --- */}
            {formData.subjects.length > 0 && (
                <div className="">
                    {/* --- MODIFICATION 6: Add Toggle All button --- */}
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold text-gray-700">Subject-wise Schedule</h2>
                        <button
                            type="button"
                            onClick={handleToggleAllSubjects}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            {openSubjects.size === formData.subjects.length ? 'Collapse All' : 'Expand All'}
                        </button>
                    </div>

                    {formData.subjects.map((subject, sIndex) => (
                    <div key={sIndex} className="border border-gray-200 rounded-lg overflow-hidden my-1">
                        <button
                            type="button"
                            className="w-full flex justify-between items-center p-1 bg-gray-50 hover:bg-gray-100 transition-colors"
                            onClick={() => handleToggleSubject(sIndex)}
                        >
                            <span className="text-md font-medium text-gray-800 pl-3">{subject.name}</span>
                            {/* --- MODIFICATION 7: Check if index is in the Set --- */}
                            {openSubjects.has(sIndex) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </button>
                    
                        {/* --- MODIFICATION 8: Check if index is in the Set --- */}
                        {openSubjects.has(sIndex) && (
                            <div className="px-4  bg-white">
                                {subject.assessments.map((ass, aIndex) => (
                                // <div className="flex flex-wrap items-end gap-3 p-3 border-b border-gray-200 last:border-b-0" key={aIndex}>
                                <div className="grid grid-cols-2 md:grid-cols-7 gap-3 py-2 border-b border-gray-200 last:border-b-0" key={aIndex}>
                                    <ReactInput type="text" name="name" required onChange={(e) => handleAssessmentFieldChange(e.target.value, e.target.name, sIndex, aIndex)} value={ass.name} label="Assessment Name"/>
                                    <ReactInput type="number" name="totalMarks" required onChange={(e) => handleAssessmentFieldChange(e.target.value, e.target.name, sIndex, aIndex)} value={ass.totalMarks} label="Total Marks"/>
                                    <ReactInput type="number" name="passingMarks" required onChange={(e) => handleAssessmentFieldChange(e.target.value, e.target.name, sIndex, aIndex)} value={ass.passingMarks} label="Passing Marks"/>
                                    <DatePicker label={"Date"} name="examDate" value={ass.examDate} handleChange={(e) => handleAssessmentFieldChange(e.target.value, "examDate", sIndex, aIndex)}/>
                                    <div className="max-w-[140px]"><TimePicker label={"Start Time"} name="startTime" value={ass.startTime} handleChange={(e) => handleAssessmentFieldChange(e.target.value, "startTime", sIndex, aIndex)}/></div>
                                    <div className="max-w-[140px]"><TimePicker label={"End Time"} name="endTime" value={ass.endTime} handleChange={(e) => handleAssessmentFieldChange(e.target.value, "endTime", sIndex, aIndex)}/></div>
                                    <IconButton color="error" className="mb-1" onClick={() => removeAssessment(sIndex, aIndex)} title="Remove this assessment"><DeleteIcon fontSize="small" /></IconButton>
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                    ))}
                </div>
            )}
          
          {/* ... (Form Actions remain unchanged) ... */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, pt: 2, borderTop: '1px solid #e5e7eb' }}>
            {isEdit ? (
              <>
                <Buttons name={"Update Exam"} type="submit" color="blue" disabled={loader} />
                <Buttons name={"Cancel"} type="button" color="gray" onClick={handleCancel} />
              </>
            ) : (
              <Buttons name={"Create Exam"} type="submit" color="blue" disabled={loader} />
            )}
          </Box>
        </form>
      </div>

      <div className="mt-8">
        <ViewExam onEdit={handleEdit} loader={loader}/>
      </div>
    </div>
  );
};

export default CreateExam;



// import React, { useEffect, useState } from "react";
// import moment from "moment";
// import { Box, Typography, Grid, Button, IconButton } from "@mui/material";
// import Select from "react-select";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import AddIcon from "@mui/icons-material/Add";
// import DeleteIcon from '@mui/icons-material/Delete';
// import Buttons from "../../Dynamic/utils/Button";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// // Corrected import: 'updateExam' instead of 'AdminUpdateExam'
// import { AdminGetAllClasses, createExam, updateExam } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import ViewExam from "./AllExams/ViewExam";
// import { useStateContext } from "../../contexts/ContextProvider";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import TimePicker from "../../Dynamic/TimePicker/TimePicker";

// // Define the initial state outside the component to avoid re-creation on renders
// const initialFormData = {
//   name: "",
//   examType: "",
//   classNames: [],
//   sections: [],
//   term: "",
//   startDate: new Date(),
//   endDate: new Date(),
//   resultPublishDate: new Date(),
//   subjects: [],
// };

// const CreateExam = () => {
//   const { setIsLoader } = useStateContext();
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedSections, setSelectedSections] = useState([]);
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
//   const [selectedSubjects, setSelectedSubjects] = useState([]);

//   const [isEdit, setIsEdit] = useState(false);
//   const [editingExamId, setEditingExamId] = useState(null); // State to hold the ID of the exam being edited
//   const [formData, setFormData] = useState(initialFormData);
//   const [loader, setLoader] = useState(false);

//   // --- FORM RESET FUNCTION ---
//   const resetForm = () => {
//     setFormData(initialFormData);
//     setSelectedClass(null);
//     setSelectedSections([]);
//     setSelectedSubjects([]);
//     setAvailableSections([]);
//     setAvailableSubjectsForClass([]);
//     setIsEdit(false);
//     setEditingExamId(null);
//   };

//   // Handler for simple top-level inputs
//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleTermChange = (option) => {
//     setFormData({ ...formData, term: option ? option.value : "" });
//   };

//   // Handler for top-level date fields
//   const handleTopLevelDateChange = (dateValue, name) => {
//     setFormData((prev) => ({ ...prev, [name]: dateValue }));
//   };

//   // Handler for nested assessment fields
//   const handleAssessmentFieldChange = (value, name, sIndex, aIndex) => {
//     setFormData((prev) => {
//       const updatedSubjects = prev.subjects.map((subject, subjectIndex) => {
//         if (sIndex === subjectIndex) {
//           const updatedAssessments = subject.assessments.map((assessment, assessmentIndex) => {
//             if (aIndex === assessmentIndex) {
//               return { ...assessment, [name]: value };
//             }
//             return assessment;
//           });
//           return { ...subject, assessments: updatedAssessments };
//         }
//         return subject;
//       });
//       return { ...prev, subjects: updatedSubjects };
//     });
//   };

//   const removeSubject = (index) => {
//     // Also remove from the selectedSubjects dropdown state
//     const subjectToRemove = formData.subjects[index];
//     setSelectedSubjects(prev => prev.filter(s => s.value !== subjectToRemove.name));

//     setFormData({
//       ...formData,
//       subjects: formData.subjects.filter((_, i) => i !== index),
//     });
//   };

//   const getAllClass = async () => {
//     try {
//       setIsLoader(true);
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         let classes = response.classes.map((item) => ({
//           value: item._id,
//           label: item.className,
//           sections: item.sections,
//           subjects: item.subjects,
//         }));
//         setAvailableClasses(classes);
//       } else {
//         toast.error("Failed to fetch class list.");
//         setAvailableClasses([]);
//       }
//     } catch (error) {
//       console.log("error", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   useEffect(() => {
//     getAllClass();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);
//     // Reset downstream selections
//     setSelectedSections([]);
//     setSelectedSubjects([]);
    
//     setFormData((prevData) => ({
//       ...prevData,
//       classNames: selectedOption ? [selectedOption.label] : [],
//       sections: [],
//       subjects: [],
//     }));
    
//     if (selectedOption) {
//       setAvailableSections(selectedOption.sections.map((section) => ({ value: section, label: section })));
//       setAvailableSubjectsForClass(selectedOption.subjects.map((subject) => ({ value: subject, label: subject })));
//     } else {
//       setAvailableSections([]);
//       setAvailableSubjectsForClass([]);
//     }
//   };

//   const handleSectionSelect = (selectedOptions) => {
//     setSelectedSections(selectedOptions);
//     const selectedSectionValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
//     setFormData((prevData) => ({ ...prevData, sections: selectedSectionValues }));
//   };

//   const addAssessment = (subjectIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments.push({
//       name: "", totalMarks: "", passingMarks: "", startTime: null, endTime: null, examDate: null,
//     });
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const removeAssessment = (subjectIndex, assessmentIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments = newSubjects[subjectIndex].assessments.filter((_, i) => i !== assessmentIndex);
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const handleSubjectsSelect = (selectedOptions) => {
//     setSelectedSubjects(selectedOptions);
//     const newSubjects = selectedOptions.map((option) => {
//       const existingSubject = formData.subjects.find((s) => s.name === option.value);
//       return existingSubject || { name: option.value, assessments: [] };
//     });
//     setFormData((prevData) => ({ ...prevData, subjects: newSubjects }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);
//     setLoader(true);
    
//     try {
//       // Create a deep copy and format dates/times for the API
//       const transformedSubjects = JSON.parse(JSON.stringify(formData.subjects));
//       transformedSubjects.forEach(subject => {
//         subject.assessments.forEach(assessment => {
//           assessment.startTime = assessment.startTime ? moment(assessment.startTime).format("hh:mm A") : "";
//           assessment.endTime = assessment.endTime ? moment(assessment.endTime).format("hh:mm A") : "";
//           assessment.examDate = assessment.examDate ? moment(assessment.examDate).format("YYYY-MM-DD") : "";
//         });
//       });

//       const apiPayload = {
//         ...formData,
//         startDate: formData.startDate ? moment(formData.startDate).format("YYYY-MM-DD") : "",
//         endDate: formData.endDate ? moment(formData.endDate).format("YYYY-MM-DD") : "",
//         resultPublishDate: formData.resultPublishDate ? moment(formData.resultPublishDate).format("YYYY-MM-DD") : "",
//         subjects: transformedSubjects,
//       };

//       let response;
//       if (isEdit) {
//         // --- UPDATE LOGIC ---
//         // Corrected function call to 'updateExam'
//         response = await updateExam(editingExamId, apiPayload);
//         if (response.success) {
//           toast.success("Exam updated successfully!");
//           resetForm(); // Reset form after successful update
//         } else {
//           toast.error(response?.message || "Failed to update exam.");
//         }
//       } else {
//         // --- CREATE LOGIC ---
//         response = await createExam(apiPayload);
//         if (response.success) {
//           toast.success("Exam created successfully!");
//           resetForm(); // Reset form after successful creation
//         } else {
//           toast.error(response?.message || "Failed to create exam.");
//         }
//       }
//     } catch (error) {
//       toast.error("An error occurred.");
//       console.log("error", error);
//     } finally {
//       setIsLoader(false);
//       setLoader(false);
//     }
//   };

//   const handleEdit = (data) => {
//     window.scrollTo(0, 0); // Scroll to top to see the form
//     setIsEdit(true);
//     setEditingExamId(data._id); // Store the exam ID

//     // Find the full class object to set in the react-select state
//     const cls = availableClasses.find((c) => c.label === data.classNames[0]);
//     setSelectedClass(cls);

//     if (cls) {
//       // Populate available sections and subjects for the selected class
//       setAvailableSections(cls.sections.map(s => ({ value: s, label: s })));
//       setAvailableSubjectsForClass(cls.subjects.map(s => ({ value: s, label: s })));
//     }
    
//     // Populate selected sections and subjects for react-select
//     setSelectedSections(data.sections.map(s => ({ value: s, label: s })));
//     const subs = data.subjects.map(s => ({ label: s.name, value: s.name }));
//     setSelectedSubjects(subs);

//     // Deep copy and parse dates/times back to Date objects for the pickers
//     const subjectsWithDateObjects = data.subjects.map(subject => ({
//       ...subject,
//       assessments: subject.assessments.map(ass => ({
//         ...ass,
//         // IMPORTANT: Convert string dates/times from API back to Date objects
//         examDate: ass.examDate ? moment(ass.examDate, "YYYY-MM-DD").toDate() : null,
//         startTime: ass.startTime ? moment(ass.startTime, "hh:mm A").toDate() : null,
//         endTime: ass.endTime ? moment(ass.endTime, "hh:mm A").toDate() : null,
//       }))
//     }));

//     setFormData({
//       ...data,
//       // IMPORTANT: Convert top-level string dates from API back to Date objects
//       startDate: data.startDate ? moment(data.startDate, "YYYY-MM-DD").toDate() : null,
//       endDate: data.endDate ? moment(data.endDate, "YYYY-MM-DD").toDate() : null,
//       resultPublishDate: data.resultPublishDate ? moment(data.resultPublishDate, "YYYY-MM-DD").toDate() : null,
//       subjects: subjectsWithDateObjects,
//     });
//   };

//   const handleCancel = () => {
//     resetForm();
//   };

//   return (
//     <div className="">
//       <PageHeaderWithBreadcrumb
//         breadcrumbItems={BreadcrumbList.admission}
//         title={isEdit ? "Edit Exam" : "Create Exam"}
//       />
//       <div className="bg-white p-4 pt-2 rounded-lg shadow border border-gray-200">
//         <form onSubmit={handleSubmit}>
//           <div className="flex flex-wrap gap-4 gap-y-3">
//             <ReactInput type="text" name="name" required onChange={handleInputChange} value={formData.name} label="Exam Name" />
//             <ReactInput type="text" name="examType" required onChange={handleInputChange} value={formData.examType} label="Exam Type"/>
//             {/* <ReactSelect
//                 name="term"
//                 value={formData.term ? { label: formData.term, value: formData.term } : null}
//                 handleChange={handleTermChange}
//                 label="TERMS"
//                 options={[
//                   { label: "TERM 1", value: "TERM 1" },
//                   { label: "TERM 2", value: "TERM 2" },
//                   { label: "TERM 3", value: "TERM 3" },
//                 ]}
//               /> */}
//                <ReactSelect
//               name="term"
//               value={formData?.term}
//               // value={{ label: formData.term, value: formData.term }}
//               handleChange={handleInputChange}
//               // handleChange={(e) => setFormData({ ...formData, term: e.value })}
//               label="TERMS"
//               dynamicOptions={[
//                 { label: "TERM 1", value: "TERM 1" },
//                 { label: "TERM 2", value: "TERM 2" },
//                 { label: "TERM 3", value: "TERM 3" },
//               ]}
//             />
//             <DatePicker label={"Start Date"} name="startDate" value={formData.startDate} handleChange={(e) => handleTopLevelDateChange(e.value, "startDate")}/>
//             <DatePicker label={"End Date"} name="endDate" value={formData.endDate} handleChange={(e) => handleTopLevelDateChange(e.value, "endDate")}/>
//             <DatePicker label={"Result Publish Date"} name="resultPublishDate" value={formData.resultPublishDate} handleChange={(e) => handleTopLevelDateChange(e.value, "resultPublishDate")}/>
//           </div>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//             <div>
//               <label className="text-sm font-medium text-gray-700 block mb-1">Select Class</label>
//               <Select options={availableClasses} value={selectedClass} onChange={handleClassSelect} placeholder="Select a Class" isSearchable isClearable isDisabled={isEdit}/>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700 block mb-1">Select Sections</label>
//               <Select options={availableSections} value={selectedSections} onChange={handleSectionSelect} placeholder="Select Sections" isMulti isSearchable isDisabled={!selectedClass}/>
//             </div>
//             <div className="md:col-span-2 lg:col-span-1">
//               <label className="text-sm font-medium text-gray-700 block mb-1">Select Subjects</label>
//               <Select options={availableSubjectsForClass} value={selectedSubjects} onChange={handleSubjectsSelect} placeholder="Select Subjects" isMulti isSearchable isDisabled={!selectedClass}/>
//             </div>
//           </div>
          
//           {formData.subjects.map((subject, sIndex) => (
//             <Box key={sIndex} mt={2} p={2} border={1} borderColor="grey.300" borderRadius={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <Typography variant="h6">{subject.name}</Typography>
//                 </Grid>
//                 <Grid item xs={2} container justifyContent="flex-end">
//                   <IconButton color="error" onClick={() => removeSubject(sIndex)}>
//                     <DeleteIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>
//               {subject.assessments.map((ass, aIndex) => (
//                 <div className="flex flex-wrap items-center gap-3 mt-2 px-3 py-2 border border-dashed border-gray-300 rounded-md" key={aIndex}>
//                   <ReactInput type="text" name="name" required onChange={(e) => handleAssessmentFieldChange(e.target.value, e.target.name, sIndex, aIndex)} value={ass.name} label="Assessment Name"/>
//                   <ReactInput type="number" name="totalMarks" required onChange={(e) => handleAssessmentFieldChange(e.target.value, e.target.name, sIndex, aIndex)} value={ass.totalMarks} label="Total Marks"/>
//                   <ReactInput type="number" name="passingMarks" required onChange={(e) => handleAssessmentFieldChange(e.target.value, e.target.name, sIndex, aIndex)} value={ass.passingMarks} label="Passing Marks"/>
//                   <DatePicker label={"Date"} name="examDate" value={ass.examDate} handleChange={(e) => handleAssessmentFieldChange(e.value, "examDate", sIndex, aIndex)}/>
//                   <TimePicker label={"Start Time"} name="startTime" value={ass.startTime} respclass="max-w-[120px]" handleChange={(e) => handleAssessmentFieldChange(e.value, "startTime", sIndex, aIndex)}/>
//                   <TimePicker label={"End Time"} name="endTime" value={ass.endTime} respclass="max-w-[120px]" handleChange={(e) => handleAssessmentFieldChange(e.value, "endTime", sIndex, aIndex)}/>
//                   <IconButton color="error" sx={{ alignSelf: "center", mt: 2 }} onClick={() => removeAssessment(sIndex, aIndex)}>
//                     <DeleteIcon />
//                   </IconButton>
//                 </div>
//               ))}
//               <Button startIcon={<AddIcon />} variant="outlined" color="primary" size="small" sx={{ mt: 2 }} onClick={() => addAssessment(sIndex)}>
//                 Add Assessment
//               </Button>
//             </Box>
//           ))}
          
//           <div className="w-full flex justify-end gap-3 mt-4">
//             {isEdit ? (
//               <>
//                 <Buttons name={"Update Exam"} type="submit" color="blue" disabled={loader} />
//                 <Buttons name={"Cancel"} type="button" color="gray" onClick={handleCancel} />
//               </>
//             ) : (
//               <Buttons name={"Create Exam"} type="submit" color="blue" disabled={loader} />
//             )}
//           </div>
//         </form>
//       </div>
//       <ViewExam onEdit={handleEdit} loader={loader}/>
//     </div>
//   );
// };

// export default CreateExam;



// import React, { useEffect, useState } from "react";
// import moment from "moment";
// import { Box, Typography, Grid, Button, IconButton } from "@mui/material";
// import Select from "react-select";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Buttons from "../../Dynamic/utils/Button";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { AdminGetAllClasses, createExam } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import ViewExam from "./AllExams/ViewExam";
// import { useStateContext } from "../../contexts/ContextProvider";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import TimePicker from "../../Dynamic/TimePicker/TimePicker";

// const CreateExam = () => {
//   const { setIsLoader } = useStateContext();
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedSections, setSelectedSections] = useState([]);
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
//   const [selectedSubjects, setSelectedSubjects] = useState([]);
//   const [isEdit, setIsEdit] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     examType: "",
//     classNames: [],
//     sections: [],
//     term: "",
//     startDate: "",
//     endDate: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
//   const [loader, setLoader] = useState(false);

//   // Handler for simple top-level inputs
//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handler for top-level date fields like startDate, endDate, etc.
//   const handleTopLevelDateChange = (dateValue, name) => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: dateValue,
//     }));
//   };

//   // A single, robust handler for ALL field changes within a nested assessment.
//   const handleAssessmentFieldChange = (value, name, sIndex, aIndex) => {
//     setFormData((prev) => {
//       const updatedSubjects = prev.subjects.map((subject, subjectIndex) => {
//         if (sIndex === subjectIndex) {
//           const updatedAssessments = subject.assessments.map(
//             (assessment, assessmentIndex) => {
//               if (aIndex === assessmentIndex) {
//                 return { ...assessment, [name]: value };
//               }
//               return assessment;
//             }
//           );
//           return { ...subject, assessments: updatedAssessments };
//         }
//         return subject;
//       });
//       return { ...prev, subjects: updatedSubjects };
//     });
//   };

//   const removeSubject = (index) => {
//     setFormData({
//       ...formData,
//       subjects: formData.subjects.filter((_, i) => i !== index),
//     });
//   };

//   const getAllClass = async () => {
//     try {
//       setIsLoader(true);
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         let classes = response.classes.map((item) => ({
//           value: item._id,
//           label: item.className,
//           sections: item.sections,
//           subjects: item.subjects,
//         }));
//         setAvailableClasses(classes);
//       } else {
//         toast.error("Failed to fetch class list.");
//         setAvailableClasses([]);
//       }
//     } catch (error) {
//       console.log("error", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   useEffect(() => {
//     getAllClass();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);
//     setSelectedSections([]);
//     setSelectedSubjects([]);
//     setFormData((prevData) => ({
//       ...prevData,
//       classNames: selectedOption ? [selectedOption.label] : [],
//       sections: [],
//       subjects: [],
//     }));
//     if (selectedOption) {
//       setAvailableSections(
//         selectedOption.sections.map((section) => ({
//           value: section,
//           label: section,
//         }))
//       );
//       setAvailableSubjectsForClass(
//         selectedOption.subjects.map((subject) => ({
//           value: subject,
//           label: subject,
//         }))
//       );
//     } else {
//       setAvailableSections([]);
//       setAvailableSubjectsForClass([]);
//     }
//   };

//   const handleSectionSelect = (selectedOptions) => {
//     setSelectedSections(selectedOptions);
//     const selectedSectionValues = selectedOptions
//       ? selectedOptions.map((option) => option.value)
//       : [];
//     setFormData((prevData) => ({
//       ...prevData,
//       sections: selectedSectionValues,
//     }));
//   };

//   const addAssessment = (subjectIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments.push({
//       name: "",
//       totalMarks: "",
//       passingMarks: "",
//       startTime: "",
//       endDate:"",
//       endTime: "",
//       examDate: "",
//     });
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const removeAssessment = (subjectIndex, assessmentIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments = newSubjects[
//       subjectIndex
//     ].assessments.filter((_, i) => i !== assessmentIndex);
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const handleSubjectsSelect = (selectedOptions) => {
//     setSelectedSubjects(selectedOptions);
//     const newSubjects = selectedOptions.map((option) => {
//       const existingSubject = formData.subjects.find(
//         (s) => s.name === option.value
//       );
//       return existingSubject || { name: option.value, assessments: [] };
//     });
//     setFormData((prevData) => ({ ...prevData, subjects: newSubjects }));
//   };

//   // --- START: UPDATED SUBMIT HANDLER ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);
//     setLoader(true);
//     try {
//       // Create a deep copy of the subjects to avoid mutating the original state
//       const transformedSubjects = JSON.parse(JSON.stringify(formData.subjects));

//       // Iterate over the copied subjects and assessments to format the fields
//       transformedSubjects.forEach(subject => {
//         subject.assessments.forEach(assessment => {
//           // Format startTime and endTime using moment
//           // e.g., "06:40 pm"
//           assessment.startTime = assessment.startTime
//             ? moment(assessment.startTime).format("hh:mm a")
//             : "";
            
//           assessment.endTime = assessment.endTime
//             ? moment(assessment.endTime).format("hh:mm a")
//             : "";

//           // Format examDate using moment
//           // e.g., "17-06-2025"
//           assessment.examDate = assessment.examDate
//             ? moment(assessment.examDate).format("DD-MM-YYYY")
//             : "";
//         });
//       });

//       // Create the final payload with the transformed data
//       const apiPayload = {
//         name: formData.name,
//         examType: formData.examType,
//         classNames: formData.classNames,
//         sections: formData.sections,
//         term: formData.term,
//         // The top-level dates can also be formatted if needed
//         startDate: formData.startDate ? moment(formData.startDate).format("DD-MM-YYYY") : "",
//         endDate: formData.endDate ? moment(formData.endDate).format("DD-MM-YYYY") : "",
//         resultPublishDate: formData.resultPublishDate ? moment(formData.resultPublishDate).format("DD-MM-YYYY") : "",
//         subjects: transformedSubjects, // Use the new array with formatted fields
//       };

//       console.log("Payload being sent to API:", apiPayload); // Very useful for debugging

//       const response = await createExam(apiPayload);

//       if (response.success) {
//         toast.success("Exam created successfully!");
//         // Optionally reset form here
//       } else {
//         toast.error(response?.message || "Failed to create exam.");
//       }
//     } catch (error)
//     {
//       toast.error("An error occurred while creating the exam.");
//       console.log("error", error);
//     } finally {
//       setIsLoader(false);
//       setLoader(false);
//     }
//   };
//   // --- END: UPDATED SUBMIT HANDLER ---
//   console.log("formData",formData)
//   console.log("formData",selectedClass)
// const handleEdit=(data)=>{
//   setIsEdit(true)
//   console.log("data",data)
//   setFormData((preV)=>({
// ...preV,
// name:data?.name,
// examType:data?.examType,
// term:data?.term,
// // startDate:moment("2025-06-17").format("DD-MM-YYYY"),
// // endDate:moment("2025-06-17").format("DD-MM-YYYY"),
//  startDate: new Date(data?.startDate),
//     endDate: new Date(data?.endDate),
//     resultPublishDate: new Date(data?.resultPublishDate),
//     // classNames:[data?.classNames[0]]
//     subjects:data?.subjects
//   }))
//   let cls=availableClasses?.find((val)=>val?.label===data?.classNames[0])
//  let sub=data?.subjects?.map((val)=>({
//   label:val?.name,
//   value:val?.name
//  }))
//  console.log("sub",sub)
//   setSelectedClass(cls)
//   // selectedSubjects(sub)
//   setSelectedSections(data?.sections.map((val)=>({
//     label:val,
//     value:val

//   })))
// }
// console.log("section",selectedSections)
// console.log("selectedSubjects",selectedSubjects)
// const handleCencel=()=>{
//   // setIsEdit(false)
//   setFormData({})
// }
//   return (
//     <div className="">
//       <PageHeaderWithBreadcrumb
//         breadcrumbItems={BreadcrumbList.admission}
//         title="Create Exam"
//       />
//       <div className="bg-white p-1 pt-2 rounded-lg shadow border border-gray-200">
//         <form onSubmit={handleSubmit}>
//           <div className="flex flex-wrap gap-4 gap-y-3">
//             <ReactInput
//               type="text"
//               name="name"
//               required
//               onChange={handleInputChange}
//               value={formData.name}
//               label="Exam Name"
//             />
//             <ReactInput
//               type="text"
//               name="examType"
//               required
//               onChange={handleInputChange}
//               value={formData.examType}
//               label="Exam Type"
//             />
//             <ReactSelect
//               name="term"
//               value={formData?.term}
//               // value={{ label: formData.term, value: formData.term }}
//               handleChange={handleInputChange}
//               // handleChange={(e) => setFormData({ ...formData, term: e.value })}
//               label="TERMS"
//               dynamicOptions={[
//                 { label: "TERM 1", value: "TERM 1" },
//                 { label: "TERM 2", value: "TERM 2" },
//                 { label: "TERM 3", value: "TERM 3" },
//               ]}
//             />
//             <DatePicker
//               label={"Start Date"}
//               respclass={"max-w-[167px]"}
//               name="startDate"
//               value={formData?.startDate}
//               handleChange={(e) => handleTopLevelDateChange(e.value, "startDate")}
//             />
//             <DatePicker
//               label={"End Date"}
//               respclass={"max-w-[167px]"}
//               name="endDate"
//               value={formData?.endDate}
//               handleChange={(e) => handleTopLevelDateChange(e.value, "endDate")}
//             />
//             <DatePicker
//               label={"Result Publish Date"}
//               respclass={"max-w-[167px]"}
//               name="resultPublishDate"
//               value={formData?.resultPublishDate}
//               handleChange={(e) =>
//                 handleTopLevelDateChange(e.value, "resultPublishDate")
//               }
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div>
//               <label className="text-sm font-medium text-gray-700 block mb-1">
//                 Select Class
//               </label>
//               <Select
//                 options={availableClasses}
//                 value={selectedClass}
//                 onChange={handleClassSelect}
//                 placeholder="Select a Class"
//                 isSearchable
//                 isClearable
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700 block mb-1">
//                 Select Sections
//               </label>
//               <Select
//                 options={availableSections}
//                 value={selectedSections}
//                 onChange={handleSectionSelect}
//                 placeholder="Select Sections"
//                 isMulti
//                 isSearchable
//                 isDisabled={!selectedClass}
//               />
//             </div>
//             <div className="md:col-span-2 lg:col-span-1">
//               <label className="text-sm font-medium text-gray-700 block mb-1">
//                 Select Subjects
//               </label>
//               <Select
//                 options={availableSubjectsForClass}
//                 value={selectedSubjects}
//                 onChange={handleSubjectsSelect}
//                 placeholder="Select Subjects"
//                 isMulti
//                 isSearchable
//                 isDisabled={!selectedClass}
//               />
//             </div>
//           </div>

//           {/* {formData.subjects.length > 0 && (
//             <Typography variant="h5" mt={4} mb={2}>
//               Subjects Details
//             </Typography>
//           )} */}

//           {formData.subjects.map((subject, sIndex) => (
//             <Box
//               key={sIndex}
//               mt={2}
//               p={1}
//               border={1}
//               borderColor="grey.300"
//               borderRadius={2}
//             >
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <Typography variant="h6">{subject.name}</Typography>
//                 </Grid>
//                 <Grid item xs={2} container justifyContent="flex-end">
//                   {/* <IconButton
//                     color="error"
//                     onClick={() => removeSubject(sIndex)}
//                   > */}
//                     <DeleteIcon  onClick={() => removeSubject(sIndex)} />
//                   {/* </IconButton> */}
//                 </Grid>
//               </Grid>

//               {subject.assessments.map((ass, aIndex) => (
//                 <div
//                   className="flex flex-wrap items-center gap-3  px-3 py-1 border border-dashed border-gray-300 rounded-md"
//                   key={aIndex}
//                 >
//                   <ReactInput
//                     type="text"
//                     name="name"
//                     required
//                     onChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.target.value,
//                         e.target.name,
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                     value={ass.name}
//                     label="Assessment Name"
//                   />
//                   <ReactInput
//                     type="number"
//                     name="totalMarks"
//                     required
//                     onChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.target.value,
//                         e.target.name,
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                     value={ass.totalMarks}
//                     label="Total Marks"
//                   />
//                   <ReactInput
//                     type="number"
//                     name="passingMarks"
//                     required
//                     onChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.target.value,
//                         e.target.name,
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                     value={ass.passingMarks}
//                     label="Passing Marks"
//                   />
//                   <DatePicker
//                     label={"Date"}
//                     respclass={"max-w-[167px]"}
//                     name="examDate"
//                     value={ass?.examDate}
//                     handleChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.value,
//                         "examDate",
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                   />
//                   <TimePicker
//                     label={"Start Time"}
//                     id="startTime"
//                     name="startTime"
//                     value={ass?.startTime}
//                     respclass="max-w-[120px]"
//                     handleChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.value,
//                         "startTime",
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                   />
//                   <TimePicker
//                     label={"End Time"}
//                     id="endTime"
//                     name="endTime"
//                     value={ass?.endTime}
//                     respclass="max-w-[120px]"
//                     handleChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.value,
//                         "endTime",
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                   />
//                   {/* <IconButton
//                     color="error"
//                     sx={{ alignSelf: "center", mt: 2 }}
//                     onClick={() => removeAssessment(sIndex, aIndex)}
//                   > */}
//                     <DeleteIcon   onClick={() => removeAssessment(sIndex, aIndex)} />
//                   {/* </IconButton> */}
//                 </div>
//               ))}

//               {/* <Button
//                 startIcon={<AddIcon />}
//                 variant="outlined"
//                 color="primary"
//                 size="small"
//                 sx={{ mt: 2 }}
//                 onClick={() => addAssessment(sIndex)}
//               >
//                 Add Assessment
//               </Button> */}
//                 <Buttons name="Add Assessment"  onClick={() => addAssessment(sIndex)} />
            
//             </Box>
//           ))}
// <div className="w-full flex justify-end mt-1">
//   {
//    !isEdit  ? <Buttons name={"Create Exam"}   type="submit" color="blue"  onClick={(sIndex) => addAssessment(sIndex)} />
//    :(
//     <div className=""><Buttons name={"Update Exam"}   type="submit" color="blue"  onClick={(sIndex) => addAssessment(sIndex)} />
//    <Buttons name={"Cancel"}   type="submit" color="gray"  onClick={handleCencel} />

//     </div>
//    )
//   }
//    </div>
//           {/* <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ mt: 4, py: 1.5 }}
//             disabled={loader}
//           >
//             {loader ? "Creating Exam..." : "Create Exam"}
//           </Button> */}
//         </form>
//       </div>
//       <ViewExam onEdit={handleEdit}/>
//     </div>
//   );
// };

// export default CreateExam;




// import React, { useEffect, useState } from "react";
// import { Box, Typography, Grid, Button, IconButton } from "@mui/material";
// import Select from "react-select";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { AdminGetAllClasses, createExam } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import ViewExam from "./AllExams/ViewExam";
// import { useStateContext } from "../../contexts/ContextProvider";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import TimePicker from "../../Dynamic/TimePicker/TimePicker";

// const CreateExam = () => {
//   const { setIsLoader } = useStateContext();
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedSections, setSelectedSections] = useState([]);
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
//   const [selectedSubjects, setSelectedSubjects] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     examType: "",
//     classNames: [],
//     sections: [],
//     term: "",
//     startDate: "",
//     endDate: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
//   const [loader, setLoader] = useState(false);

//   // --- START: CORRECTED STATE HANDLERS ---

//   // Handler for simple top-level inputs
//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handler for top-level date fields like startDate, endDate, etc.
//   const handleTopLevelDateChange = (dateValue, name) => {
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: dateValue,
//     }));
//   };

//   // A single, robust handler for ALL field changes within a nested assessment.
//   // This replaces handleAssessmentChange, handleDateCange, and handleDateTimeChange.
//   const handleAssessmentFieldChange = (value, name, sIndex, aIndex) => {
//     setFormData((prev) => {
//       // Map over subjects to create a new array, avoiding direct state mutation
//       const updatedSubjects = prev.subjects.map((subject, subjectIndex) => {
//         if (sIndex === subjectIndex) {
//           // If this is the subject we want to update, map over its assessments
//           const updatedAssessments = subject.assessments.map(
//             (assessment, assessmentIndex) => {
//               if (aIndex === assessmentIndex) {
//                 // If this is the assessment we want to update, return a new object with the changed field
//                 return { ...assessment, [name]: value };
//               }
//               return assessment; // Otherwise, return the assessment as is
//             }
//           );
//           // Return a new subject object with the updated assessments array
//           return { ...subject, assessments: updatedAssessments };
//         }
//         return subject; // Otherwise, return the subject as is
//       });
//       // Return the new state object with the updated subjects array
//       return { ...prev, subjects: updatedSubjects };
//     });
//   };

//   // --- END: CORRECTED STATE HANDLERS ---

//   const removeSubject = (index) => {
//     setFormData({
//       ...formData,
//       subjects: formData.subjects.filter((_, i) => i !== index),
//     });
//   };

//   const getAllClass = async () => {
//     try {
//       setIsLoader(true);
//       const response = await AdminGetAllClasses();

//       if (response?.success) {
//         let classes = response.classes.map((item) => ({
//           value: item._id,
//           label: item.className,
//           sections: item.sections,
//           subjects: item.subjects,
//         }));
//         setAvailableClasses(classes);
//       } else {
//         toast.error("Failed to fetch class list.");
//         setAvailableClasses([]);
//       }
//     } catch (error) {
//       console.log("error", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   useEffect(() => {
//     getAllClass();
//      // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);
//     setSelectedSections([]); // Reset sections when class changes
//     setSelectedSubjects([]); // Reset subjects when class changes

//     setFormData((prevData) => ({
//       ...prevData,
//       classNames: selectedOption ? [selectedOption.label] : [],
//       sections: [], // Reset sections in form data
//       subjects: [], // Reset subjects in form data
//     }));

//     if (selectedOption) {
//       setAvailableSections(
//         selectedOption.sections.map((section) => ({
//           value: section,
//           label: section,
//         }))
//       );
//       setAvailableSubjectsForClass(
//         selectedOption.subjects.map((subject) => ({
//           value: subject,
//           label: subject,
//         }))
//       );
//     } else {
//       setAvailableSections([]);
//       setAvailableSubjectsForClass([]);
//     }
//   };

//   const handleSectionSelect = (selectedOptions) => {
//     setSelectedSections(selectedOptions);
//     const selectedSectionValues = selectedOptions
//       ? selectedOptions.map((option) => option.value)
//       : [];
//     setFormData((prevData) => ({
//       ...prevData,
//       sections: selectedSectionValues,
//     }));
//   };

//   const addAssessment = (subjectIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments.push({
//       name: "",
//       totalMarks: "",
//       passingMarks: "",
//       startTime: "",
//       endTime: "",
//       examDate: "",
//     });
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const removeAssessment = (subjectIndex, assessmentIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments = newSubjects[
//       subjectIndex
//     ].assessments.filter((_, i) => i !== assessmentIndex);
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const handleSubjectsSelect = (selectedOptions) => {
//     setSelectedSubjects(selectedOptions);
//     const newSubjects = selectedOptions.map((option) => {
//       // Try to find the subject in the old state to preserve its assessments
//       const existingSubject = formData.subjects.find(
//         (s) => s.name === option.value
//       );
//       return (
//         existingSubject || {
//           name: option.value,
//           assessments: [],
//         }
//       );
//     });
//     setFormData((prevData) => ({ ...prevData, subjects: newSubjects }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);
//     setLoader(true);
//     try {
//       const payload = {
//         name: formData.name,
//         examType: formData.examType,
//         classNames: formData.classNames,
//         sections: formData.sections,
//         term: formData.term,
//         subjects: formData.subjects,
//         startDate: formData.startDate,
//         endDate: formData.endDate,
//         resultPublishDate: formData.resultPublishDate,
//       };

//       const response = await createExam(payload);

//       if (response.success) {
//         toast.success("Exam created successfully!");
//         // Optionally reset form here
//       } else {
//         toast.error(response?.message || "Failed to create exam.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while creating the exam.");
//       console.log("error", error);
//     } finally {
//       setIsLoader(false);
//       setLoader(false);
//     }
//   };

//   return (
//     <div className="">
//       <PageHeaderWithBreadcrumb
//         breadcrumbItems={BreadcrumbList.admission}
//         title="Create Exam"
//       />
//       <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//         <form onSubmit={handleSubmit}>
//           <div className="flex flex-wrap gap-4 gap-y-3">
//             <ReactInput
//               type="text"
//               name="name"
//               required
//               onChange={handleInputChange}
//               value={formData.name}
//               label="Exam Name"
//             />
//             <ReactInput
//               type="text"
//               name="examType"
//               required
//               onChange={handleInputChange}
//               value={formData.examType}
//               label="Exam Type"
//             />
//             <ReactSelect
//               name="term"
//               value={{ label: formData.term, value: formData.term }}
//               handleChange={(e) => setFormData({ ...formData, term: e.value })}
//               label="TERMS"
//               dynamicOptions={[
//                 { label: "TERM 1", value: "TERM 1" },
//                 { label: "TERM 2", value: "TERM 2" },
//                 { label: "TERM 3", value: "TERM 3" },
//               ]}
//             />
//             <DatePicker
//               label={"Start Date"}
//               respclass={"max-w-[167px]"}
//               name="startDate"
//               value={formData?.startDate}
//               handleChange={(e) => handleTopLevelDateChange(e.value, "startDate")}
//             />
//             <DatePicker
//               label={"End Date"}
//               respclass={"max-w-[167px]"}
//               name="endDate"
//               value={formData?.endDate}
//               handleChange={(e) => handleTopLevelDateChange(e.value, "endDate")}
//             />
//             <DatePicker
//               label={"Result Publish Date"}
//               respclass={"max-w-[167px]"}
//               name="resultPublishDate"
//               value={formData?.resultPublishDate}
//               handleChange={(e) =>
//                 handleTopLevelDateChange(e.value, "resultPublishDate")
//               }
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//             <div>
//               <label className="text-sm font-medium text-gray-700 block mb-1">
//                 Select Class
//               </label>
//               <Select
//                 options={availableClasses}
//                 value={selectedClass}
//                 onChange={handleClassSelect}
//                 placeholder="Select a Class"
//                 isSearchable
//                 isClearable
//               />
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700 block mb-1">
//                 Select Sections
//               </label>
//               <Select
//                 options={availableSections}
//                 value={selectedSections}
//                 onChange={handleSectionSelect}
//                 placeholder="Select Sections"
//                 isMulti
//                 isSearchable
//                 isDisabled={!selectedClass}
//               />
//             </div>
//             <div className="md:col-span-2 lg:col-span-1">
//               <label className="text-sm font-medium text-gray-700 block mb-1">
//                 Select Subjects
//               </label>
//               <Select
//                 options={availableSubjectsForClass}
//                 value={selectedSubjects}
//                 onChange={handleSubjectsSelect}
//                 placeholder="Select Subjects"
//                 isMulti
//                 isSearchable
//                 isDisabled={!selectedClass}
//               />
//             </div>
//           </div>

//           {formData.subjects.length > 0 && (
//             <Typography variant="h5" mt={4} mb={2}>
//               Subjects Details
//             </Typography>
//           )}

//           {formData.subjects.map((subject, sIndex) => (
//             <Box
//               key={sIndex}
//               mt={2}
//               p={3}
//               border={1}
//               borderColor="grey.300"
//               borderRadius={2}
//             >
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <Typography variant="h6">{subject.name}</Typography>
//                 </Grid>
//                 <Grid item xs={2} container justifyContent="flex-end">
//                   <IconButton
//                     color="error"
//                     onClick={() => removeSubject(sIndex)}
//                   >
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>

//               {subject.assessments.map((ass, aIndex) => (
//                 <div
//                   className="flex flex-wrap items-center gap-3 mt-4 p-3 border border-dashed border-gray-300 rounded-md"
//                   key={aIndex}
//                 >
//                   <ReactInput
//                     type="text"
//                     name="name"
//                     required
//                     onChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.target.value,
//                         e.target.name,
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                     value={ass.name}
//                     label="Assessment Name"
//                   />
//                   <ReactInput
//                     type="number"
//                     name="totalMarks"
//                     required
//                     onChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.target.value,
//                         e.target.name,
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                     value={ass.totalMarks}
//                     label="Total Marks"
//                   />
//                   <ReactInput
//                     type="number"
//                     name="passingMarks"
//                     required
//                     onChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.target.value,
//                         e.target.name,
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                     value={ass.passingMarks}
//                     label="Passing Marks"
//                   />
//                   <DatePicker
//                     label={"Date"}
//                     respclass={"max-w-[167px]"}
//                     name="examDate"
//                     value={ass?.examDate}
//                     handleChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.value,
//                         "examDate",
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                   />
//                   <TimePicker
//                     label={"Start Time"}
//                     id="startTime"
//                     name="startTime"
//                     value={ass?.startTime}
//                     respclass="max-w-[120px]"
//                     handleChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.value,
//                         "startTime",
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                   />
//                   <TimePicker
//                     label={"End Time"}
//                     id="endTime"
//                     name="endTime"
//                     value={ass?.endTime}
//                     respclass="max-w-[120px]"
//                     handleChange={(e) =>
//                       handleAssessmentFieldChange(
//                         e.value,
//                         "endTime",
//                         sIndex,
//                         aIndex
//                       )
//                     }
//                   />
//                   <IconButton
//                     color="error"
//                     sx={{ alignSelf: "center", mt: 2 }}
//                     onClick={() => removeAssessment(sIndex, aIndex)}
//                   >
//                     <RemoveIcon />
//                   </IconButton>
//                 </div>
//               ))}

//               <Button
//                 startIcon={<AddIcon />}
//                 variant="outlined"
//                 color="primary"
//                 size="small"
//                 sx={{ mt: 2 }}
//                 onClick={() => addAssessment(sIndex)}
//               >
//                 Add Assessment
//               </Button>
//             </Box>
//           ))}

//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ mt: 4, py: 1.5 }}
//             disabled={loader}
//           >
//             {loader ? "Creating Exam..." : "Create Exam"}
//           </Button>
//         </form>
//       </div>
//       <ViewExam />
//     </div>
//   );
// };

// export default CreateExam;


// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Grid,
//   Button,
//   IconButton,
// } from "@mui/material";
// import Select from "react-select";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { AdminGetAllClasses, createExam } from "../../Network/AdminApi";
// import { toast } from "react-toastify"; // Import toast
// import ViewExam from "./AllExams/ViewExam";
// import { useStateContext } from "../../contexts/ContextProvider";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import TimePicker from "../../Dynamic/TimePicker/TimePicker";

// const CreateExam = () => {
  
//   const { currentColor,setIsLoader } = useStateContext();
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedSections, setSelectedSections] = useState([]);
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState(
//     []
//   );
//   const [selectedSubjects, setSelectedSubjects] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     examType: "",
//     classNames: [],
//     sections: [],
//     term: "",
//     startDate: "",
//     endDate: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
//   const [loader, setLoader] = useState(false);

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleDateCange = (value, name, sIndex, aIndex) => {
//   const updatedSubjects = [...formData.subjects];
//   updatedSubjects[sIndex].assessments[aIndex][name] = value;
//   setFormData(updatedSubjects);
// };

//   //   const handleDateCange = (dateValue, name) => {
//   //   setFormData((prevFormData) => ({
//   //     ...prevFormData,
//   //     [name]: dateValue,
//   //   }));
//   // };
//   const removeSubject = (index) => {
//     setFormData({
//       ...formData,
//       subjects: formData.subjects.filter((_, i) => i !== index),
//     });
//   };

//   const getAllClass = async () => {
//     try {
//       setIsLoader(true)
//       const response = await AdminGetAllClasses();

//       if (response?.success) {
//         let classes = response.classes.map((item) => ({
//           value: item._id,
//           label: item.className,
//           sections: item.sections,
//           subjects: item.subjects,
//         }));
//         setAvailableClasses(classes);
//         setIsLoader(false)
//       } else {

//         toast.error("Failed to fetch class list.");
//         setAvailableClasses([]);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//     finally{
//       setIsLoader(false)
//     }
//   };

//   useEffect(() => {
//     getAllClass();
//   }, []);

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);

//     setFormData((prevData) => ({
//       ...prevData,
//       classNames: selectedOption ? [selectedOption.label] : [], // Changed from className to classNames and ensured it's an array
//     }));

//     if (selectedOption && selectedOption.sections) {
//       setAvailableSections(
//         selectedOption.sections.map((section) => ({
//           value: section,
//           label: section,
//         }))
//       );
//     } else {
//       setAvailableSections([]);
//     }

//     if (selectedOption && selectedOption.subjects) {
//       const subjectsOptions = selectedOption.subjects.map((subject) => ({
//         value: subject,
//         label: subject,
//       }));
//       setAvailableSubjectsForClass(subjectsOptions);
//     } else {
//       setAvailableSubjectsForClass([]);
//     }
//   };

//   const handleSectionSelect = (selectedOptions) => {
//     setSelectedSections(selectedOptions);

//     const selectedSectionValues = selectedOptions
//       ? selectedOptions.map((option) => option.value)
//       : [];

//     setFormData((prevData) => ({
//       ...prevData,
//       sections: selectedSectionValues,
//     }));
//   };

//   const addAssessment = (subjectIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments.push({ name: "", totalMarks: "", passingMarks: "", startTime: "", endTime: "" ,examDate:""}); //added passingMarks, startTime and endTime
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const removeAssessment = (subjectIndex, assessmentIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments = newSubjects[
//       subjectIndex
//     ].assessments.filter((_, i) => i !== assessmentIndex);
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const handleAssessmentChange = (subjectIndex, assessmentIndex, e) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments[assessmentIndex][e.target.name] =
//       e.target.value;
//     setFormData({ ...formData, subjects: newSubjects });
//   };
//   //   const handleDateTimeChange = (e) => {
//   //   const { name, value } = e.target;
//   //   setFormData({
//   //     ...formData,
//   //     [name]: value,
//   //   });
//   // };

//   const handleDateTimeChange = (value, name, sIndex, aIndex) => {
//   const updatedSubjects = [...formData.subjects];
//   updatedSubjects[sIndex].assessments[aIndex][name] = value;
//   setFormData(updatedSubjects);
// };

//   const handleSubjectsSelect = (selectedOptions) => {
//     setSelectedSubjects(selectedOptions);

//     const newSubjects = selectedOptions.map((option) => ({
//       name: option.value,
//       assessments: [],
//     }));

//     setFormData((prevData) => {
//       // Create a map of existing subject names to their data
//       const existingSubjectsMap = prevData.subjects.reduce((acc, subject) => {
//         acc[subject.name] = subject;
//         return acc;
//       }, {});

//       // Merge the new subjects with the existing subject data
//       const mergedSubjects = newSubjects.map((newSubject) => {
//         // Check if the subject already exists
//         if (existingSubjectsMap[newSubject.name]) {
//           // If it exists, keep its assessments
//           return {
//             ...newSubject,
//             assessments: existingSubjectsMap[newSubject.name].assessments,
//           };
//         } else {
//           // If it doesn't exist, keep newSubject.assessments = []
//           return newSubject; //return { name: newSubject.name, assessments: [] };
//         }
//       });

//       return { ...prevData, subjects: mergedSubjects };
//     });
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true)

//     try {
//       const payload = {
//         name: formData.name,
//         examType: formData.examType,
//         classNames: formData.classNames,
//         sections: formData.sections,
//         term: formData.term,
//         subjects: formData.subjects,
//         startDate: formData.startDate,
//         endDate: formData.endDate,
//         resultPublishDate: formData.resultPublishDate,
//       };
      
//       const response = await createExam(payload);
      
//       if (response.success) {
//         setIsLoader(false);
//         toast.success("Exam created successfully!");
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     } finally {
//       setIsLoader(false); // Ensure loader is disabled after the API call completes
//     }
//   };

//   return (
//     <div className="" >
//        <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title=" Create Exam"/>
//        <div
//        className="bg-white p-2 rounded-lg shadow border border-gray-200">
      
       
//         <form onSubmit={handleSubmit}>
//           <div className="flex  flex-wrap gap-2 gap-y-3">
//             <ReactInput
//               type="text"
//               name="name"
//               required
//               onChange={handleInputChange}
//               value={formData.name}
//               label="Exam Name"
//             />
//             <ReactInput
//               type="text"
//               name="examType"
//               required
//               onChange={handleInputChange}
//               value={formData.examType}
//               label="Exam Type"
//             />
//             <ReactSelect
//               name="term"
//               value={formData?.term}
//               handleChange={handleInputChange}
//               label="TERMS"
//               dynamicOptions={[
//                 { label: "TERM 1", value: "TERM 1" },
//                 { label: "TERM 2", value: "TERM 2" },
//                 { label: "TERM 3", value: "TERM 3" },
//               ]}
//             />
//           {/* </div>

//           <div className="flex gap-2 mt-3 flex-wrap"> */}
//             <DatePicker
//                           className="custom-calendar"
//                           placeholder=""
//                           label={"Start Date"}
//                           respclass={"max-w-[167px]"}
//                           name="startDate"
//                           id="startDate"
//                           value={formData?.startDate}
//                           handleChange={(e) => handleDateCange(e.value, "startDate")}
//                           hourFormat="12"
//                         />
          
//             <DatePicker
//                           className="custom-calendar"
//                           placeholder=""
//                           label={"End Date"}
//                           // respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
//                            respclass={"max-w-[167px]"}
//                           name="endDate"
//                           id="endDate"
//                           value={formData?.endDate}
//                           handleChange={(e) => handleDateCange(e.value, "endDate")}
//                           hourFormat="12"
//                         />
//                           <DatePicker
//                           className="custom-calendar"
//                           placeholder=""
//                           label={"Result Publish Date"}
//                           // respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
//                            respclass={"max-w-[167px]"}
//                           name="resultPublishDate"
//                           id="resultPublishDate"
//                           value={formData?.resultPublishDate}
//                           handleChange={(e) => handleDateCange(e.value, "resultPublishDate")}
//                           hourFormat="12"
//                         />
//             {/* <ReactInput
//               type="date"
//               name="startDate"
//               required
//               onChange={handleInputChange}
//               value={formData.startDate}
//               label="Start Date"
//             />
//             <ReactInput
//               type="date"
//               name="endDate"
//               required
//               onChange={handleInputChange}
//               value={formData.endDate}
//               label="End Date"
//             />
//             <ReactInput
//               type="date"
//               name="resultPublishDate"
//               required
//               onChange={handleInputChange}
//               value={formData.resultPublishDate}
//               label="Result Publish Date"
//             /> */}
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
//             <div className="gap-3 w-full">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-sm font-bold text-gray-800">
//                   Select Class
//                 </h3>
//               </div>

//               <Select
//                 options={availableClasses}
//                 value={selectedClass}
//                 onChange={handleClassSelect}
//                 placeholder="Select a Class"
//                 isSearchable
//                 menuPlacement="auto"
//                 menuPosition="fixed"
//                 isClearable
//                 styles={{
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     outline: "none",
//                     borderRadius: "0.25rem",
//                     "&:hover": {
//                       borderColor: state.isFocused
//                         ? "rgba(0, 0, 0, 0.2)"
//                         : baseStyles.borderColor,
//                     },
//                   }),
//                   menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
//                 }}
//               />
//             </div>

//             <div className="w-full">
//               <div className="flex justify-between items-center ">
//                 <h3 className="text-sm font-bold text-gray-800">
//                   Select Sections
//                 </h3>
//               </div>
//               <Select
//                 options={availableSections}
//                 value={selectedSections}
//                 onChange={handleSectionSelect}
//                 placeholder="Select Sections"
//                 isMulti
//                 isSearchable
//                 menuPlacement="auto"
//                 menuPosition="fixed"
//                 styles={{
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     outline: "none",
//                     borderRadius: "0.25rem",
//                     "&:hover": {
//                       borderColor: state.isFocused
//                         ? "rgba(0, 0, 0, 0.2)"
//                         : baseStyles.borderColor,
//                     },
//                   }),
//                   menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
//                 }}
//               />
//             </div>
//           </div>

//           <div>
//             <div className="flex justify-between items-center">
//               <h3 className="text-sm font-bold text-gray-800">
//                 Select Subjects
//               </h3>
//             </div>

//             <Select
//               options={availableSubjectsForClass}
//               value={selectedSubjects}
//               onChange={handleSubjectsSelect}
//               placeholder="Select Subjects"
//               isMulti
//               isSearchable
//               menuPlacement="auto"
//               menuPosition="fixed"
//               styles={{
//                 control: (baseStyles, state) => ({
//                   ...baseStyles,
//                   boxShadow: state.isFocused
//                     ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                     : baseStyles.boxShadow,
//                   // border: "none",
//                   outline: "none",
//                   borderRadius: "0.25rem",
//                   "&:hover": {
//                     borderColor: state.isFocused
//                       ? "rgba(0, 0, 0, 0.2)"
//                       : baseStyles.borderColor,
//                   },
//                 }),
//                 menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }), // Ensure menu overlays other content
//               }}
//             />
//           </div>

//           <Typography variant="h5" mt={3}>
//             Subjects
//           </Typography>
//           {formData.subjects.map((subject, sIndex) => (
//             <Box key={sIndex} mt={2} p={2} border={1} borderRadius={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <Typography variant="h6">{subject.name}</Typography>
//                 </Grid>
//                 <Grid item xs={2}>
//                   <IconButton
//                     color="error"
//                     onClick={() => removeSubject(sIndex)}
//                   >
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>

//               {subject.assessments.map((ass, aIndex) => (
//                 <div className="flex gap-3" key={aIndex}>
//                   <ReactInput
//                     type="text"
//                     name="name"
//                     required
//                     onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                     value={ass.name}
//                     label="Name"
//                   />

//                   <ReactInput
//                     type="number"
//                     name="totalMarks"
//                     required
//                     onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                     value={ass.totalMarks}
//                     label="Total Marks"
//                   />
//                    <ReactInput
//                     type="number"
//                     name="passingMarks"
//                     required
//                     onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                     value={ass.passingMarks}
//                     label="Passing Marks"
//                   />
//                      <DatePicker
//                           className="custom-calendar"
//                           placeholder=""
//                           label={"Date"}
//                           // respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
//                            respclass={"max-w-[167px]"}
//                           name="examDate"
//                           id="examDate"
//                           value={ass?.examDate}
//                           // handleChange={(e) => handleDateCange(e.value, "examDate")}
//                           handleChange={(e) =>
//     handleDateCange(e.value, "examDate", sIndex, aIndex)
//   }
//                           hourFormat="12"
//                         />
//                   <TimePicker
//                    placeholderName="Time"
//             label={("Start Time")}
//             id="startTime"
//             name="startTime"
//             value={ass?.startTime}
//             respclass="max-w-[100px]"
//              handleChange={(e) =>
//     handleDateTimeChange(e.value, "startTime", sIndex, aIndex)
//   }
//             // handleChange={handleDateTimeChange}
//             // handleChange={(e) => handleDateTimeChange(e.value, "startTime")}
//                   />
//                   <TimePicker
//                    placeholderName="Time"
//             label={("End Time")}
//             id="endTime"
//             name="endTime"
//             value={ass?.endTime}
//             respclass="max-w-[100px]"
//              handleChange={(e) =>
//     handleDateTimeChange(e.value, "endTime", sIndex, aIndex)
//   }
//             // handleChange={(e) => handleDateTimeChange(e.value, "endTime")}
//             // handleChange={handleDateTimeChange}
//                   />
//                    {/* <ReactInput
//                     type="datetime-local"
//                     name="startTime"
//                     required
//                     onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                     value={ass.startTime}
//                     label="Start Time"
//                   />
//                      <ReactInput
//                     type="datetime-local"
//                     name="endTime"
//                     required
//                     onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                     value={ass.endTime}
//                     label="End Time"
//                   /> */}

//                   <IconButton
//                     color="error"
//                     onClick={() => removeAssessment(sIndex, aIndex)}
//                   >
//                     <RemoveIcon />
//                   </IconButton>
//                 </div>
//               ))}

//               <Button
//                 startIcon={<AddIcon />}
//                 variant="outlined"
//                 color="primary"
//                 size="small"
//                 sx={{ mt: 1 }}
//                 onClick={() => addAssessment(sIndex)}
//               >
//                 Add Assessment
//               </Button>
//             </Box>
//           ))}

//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ mt: 3 }}
//             disabled={loader}
//           >
//             {loader ? "Creating Exam..." : "Create Exam"}
//           </Button>
//         </form>
//       </div>
//       <ViewExam/>
//     </div>
//   );
// };

// export default CreateExam;


