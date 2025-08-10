import React, { useEffect, useState } from "react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import { FaPlusCircle, FaTrashAlt, FaCopy, FaClipboardList, FaUsers, FaBook, FaEdit, FaCog } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Modal from "react-modal";
import Buttons from "../../Dynamic/utils/Button";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { AdminGetAllClasses, createExam, updateExam } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import ViewExam from "./AllExams/ViewExam";
import { useStateContext } from "../../contexts/ContextProvider";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import DatePicker from "../../Dynamic/DatePicker/DatePicker";
import TimePicker from "../../Dynamic/TimePicker/TimePicker";
import Switch from "react-switch";

// Bind modal to app element for accessibility
Modal.setAppElement("#root");

// REPLACE the existing ResizeObserver suppression code (lines ~14-80) with this:

// Complete ResizeObserver error suppression - Enhanced version
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function(...args) {
  const message = args.join(' ').toLowerCase();
  if (message.includes('resizeobserver') || 
      message.includes('resize observer') || 
      message.includes('undelivered notifications') ||
      message.includes('loop completed') ||
      message.includes('loop limit exceeded')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ').toLowerCase();
  if (message.includes('resizeobserver') || 
      message.includes('resize observer') || 
      message.includes('undelivered notifications') ||
      message.includes('loop completed') ||
      message.includes('loop limit exceeded')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Enhanced error event handling
const suppressResizeObserverErrors = (event) => {
  const message = (event.message || event.error?.message || '').toLowerCase();
  if (message.includes('resizeobserver') || 
      message.includes('resize observer') || 
      message.includes('undelivered notifications') ||
      message.includes('loop completed') ||
      message.includes('loop limit exceeded')) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
};

const suppressResizeObserverRejections = (event) => {
  const message = (event.reason?.message || event.reason?.toString?.() || '').toLowerCase();
  if (message.includes('resizeobserver') || 
      message.includes('resize observer') || 
      message.includes('undelivered notifications') ||
      message.includes('loop completed') ||
      message.includes('loop limit exceeded')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
};

// Remove any existing listeners and add new ones
window.removeEventListener('error', suppressResizeObserverErrors, true);
window.removeEventListener('unhandledrejection', suppressResizeObserverRejections, true);
window.addEventListener('error', suppressResizeObserverErrors, true);
window.addEventListener('unhandledrejection', suppressResizeObserverRejections, true);

// Complete ResizeObserver override with multiple fallback mechanisms
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class extends OriginalResizeObserver {
  constructor(callback) {
    super((entries, observer) => {
      // Multiple async layers to prevent any errors from bubbling up
      const safeCallback = () => {
        try {
          callback(entries, observer);
        } catch (error) {
          // Completely suppress all callback errors
        }
      };

      // Use multiple async mechanisms
      try {
        requestIdleCallback(() => {
          try {
            requestAnimationFrame(() => {
              try {
                setTimeout(safeCallback, 0);
              } catch (e) {
                // Suppress setTimeout errors
              }
            });
          } catch (e) {
            // Suppress requestAnimationFrame errors
          }
        });
      } catch (e) {
        // Fallback if requestIdleCallback is not available
        try {
          requestAnimationFrame(() => {
            try {
              setTimeout(safeCallback, 0);
            } catch (e) {
              // Suppress errors
            }
          });
        } catch (e) {
          // Final fallback
          try {
            setTimeout(safeCallback, 0);
          } catch (e) {
            // Suppress all errors
          }
        }
      }
    });
  }

  observe(target, options) {
    try {
      return super.observe(target, options);
    } catch (error) {
      // Suppress observe errors
    }
  }

  unobserve(target) {
    try {
      return super.unobserve(target);
    } catch (error) {
      // Suppress unobserve errors
    }
  }

  disconnect() {
    try {
      return super.disconnect();
    } catch (error) {
      // Suppress disconnect errors
    }
  }
};

// Override requestIdleCallback if not available
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(callback) {
    return setTimeout(callback, 1);
  };
}

// Define the initial state outside the component
const initialFormData = {
  name: "",
  className: "",
  examType: "",
  classNames: [],
  sections: [],
  term: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  resultPublishDate: new Date(),
  subjects: [],
};

const CreateExam = () => {
  const { setIsLoader, currentMode, currentColor } = useStateContext();
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loader, setLoader] = useState(false);
  const [showForms, setShowForms] = useState(() => JSON.parse(localStorage.getItem('ShowForms')) || true);
  const [showExamList, setShowExamList] = useState(() => JSON.parse(localStorage.getItem('ShowExamList')) || false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [commonTotalMarks, setCommonTotalMarks] = useState("");
  const [commonPassingMarks, setCommonPassingMarks] = useState("");

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('ShowForms', JSON.stringify(showForms));
    localStorage.setItem('showExamList', JSON.stringify(showExamList));
  }, [showForms, showExamList]);

 // Cleanup
useEffect(() => {
  return () => {
    window.ResizeObserver = OriginalResizeObserver;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  };
}, []);

  // Apply common marks to all assessments
  const applyCommonMarks = (field, value) => {
    setFormData((prev) => {
      const updatedSubjects = prev.subjects.map((subject) => ({
        ...subject,
        assessments: subject.assessments.map((assessment) => ({
          ...assessment,
          [field]: value || assessment[field], // Preserve existing value if common value is cleared
        })),
      }));
      return { ...prev, subjects: updatedSubjects };
    });
  };

  // Handle common marks input changes
  const handleCommonMarksChange = (e, field) => {
    const value = e.target.value;
    if (field === "totalMarks") {
      setCommonTotalMarks(value);
      applyCommonMarks("totalMarks", value);
    } else {
      setCommonPassingMarks(value);
      applyCommonMarks("passingMarks", value);
    }
  };

  // --- FORM RESET ---
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedClass(null);
    setSelectedSections([]);
    setSelectedSubjects([]);
    setAvailableSections([]);
    setAvailableSubjectsForClass([]);
    setIsEdit(false);
    setEditingExamId(null);
    setCommonTotalMarks("");
    setCommonPassingMarks("");
  };

  // Handler for simple top-level inputs
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTermChange = (option) => {
    console.log("Term selected:", option); // Debug log
    setFormData({ ...formData, term: option ? option.value : "" });
  };

  // Handler for top-level date fields
  const handleTopLevelDateChange = (dateValue, name) => {
    setFormData((prev) => ({ ...prev, [name]: dateValue }));
  };

  // Handler for nested assessment fields
  const handleAssessmentFieldChange = (value, name, sIndex, aIndex) => {
    setFormData((prev) => {
      const updatedSubjects = prev.subjects.map((subject, subjectIndex) => {
        if (sIndex === subjectIndex) {
          const updatedAssessments = subject.assessments.map((assessment, assessmentIndex) => {
            if (aIndex === assessmentIndex) {
              return { ...assessment, [name]: value };
            }
            return assessment;
          });
          return { ...subject, assessments: updatedAssessments };
        }
        return subject;
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const removeSubject = (index) => {
    const subjectToRemove = formData.subjects[index];
    setSelectedSubjects((prev) => prev.filter((s) => s.value !== subjectToRemove.name));

    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const getAllClass = async () => {
    try {
      setIsLoader(true);
      const response = await AdminGetAllClasses();
      if (response?.success) {
        let classes = response.classes.map((item) => ({
          value: item._id,
          label: item.className,
          sections: item.sections,
          subjects: item.subjects,
        }));
        setAvailableClasses(classes);
      } else {
        toast.error("Failed to fetch class list.");
        setAvailableClasses([]);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    getAllClass();
  }, []);

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);
    setSelectedSections(selectedOption ? selectedOption.sections.map((section) => ({ value: section, label: section })) : []);
    setSelectedSubjects(selectedOption ? selectedOption.subjects.map((subject) => ({ value: subject, label: subject })) : []);

    setFormData((prevData) => ({
      ...prevData,
      classNames: selectedOption ? [selectedOption.label] : [],
      sections: selectedOption ? selectedOption.sections : [],
      subjects: selectedOption ? selectedOption.subjects.map((subject) => ({
        name: subject,
        assessments: [{ name: "PT-1", totalMarks: commonTotalMarks || 100, passingMarks: commonPassingMarks || 33, startTime: new Date(), endTime: new Date(), examDate: new Date() }],
      })) : [],
    }));

    if (selectedOption) {
      setAvailableSections(selectedOption.sections.map((section) => ({ value: section, label: section })));
      setAvailableSubjectsForClass(selectedOption.subjects.map((subject) => ({ value: subject, label: subject })));
    } else {
      setAvailableSections([]);
      setAvailableSubjectsForClass([]);
    }
  };

  const handleSectionSelect = (selectedOptions) => {
    setSelectedSections(selectedOptions);
    const selectedSectionValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setFormData((prevData) => ({ ...prevData, sections: selectedSectionValues }));
  };

  const addAssessment = (subjectIndex) => {
    const newSubjects = [...formData.subjects];
    newSubjects[subjectIndex].assessments.push({
      name: `PT-${newSubjects[subjectIndex].assessments.length + 1}`,
      totalMarks: commonTotalMarks || 100,
      passingMarks: commonPassingMarks || 33,
      startTime: new Date(),
      endTime: new Date(),
      examDate: new Date(),
    });
    setFormData({ ...formData, subjects: newSubjects });
  };

  const duplicateAssessment = (subjectIndex, assessmentIndex) => {
  const newSubjects = [...formData.subjects];
  const assessmentToCopy = newSubjects[subjectIndex].assessments[assessmentIndex];
  
  // Create a deep copy of the assessment with a new name
  const duplicatedAssessment = {
    ...assessmentToCopy,
    name: `${assessmentToCopy.name}`,
    // Ensure date objects are properly copied
    startTime: assessmentToCopy.startTime ? new Date(assessmentToCopy.startTime) : new Date(),
    endTime: assessmentToCopy.endTime ? new Date(assessmentToCopy.endTime) : new Date(),
    examDate: assessmentToCopy.examDate ? new Date(assessmentToCopy.examDate) : new Date(),
  };
  
  newSubjects[subjectIndex].assessments.push(duplicatedAssessment);
  setFormData({ ...formData, subjects: newSubjects });
};

  const removeAssessment = (subjectIndex, assessmentIndex) => {
    const newSubjects = [...formData.subjects];
    newSubjects[subjectIndex].assessments = newSubjects[subjectIndex].assessments.filter((_, i) => i !== assessmentIndex);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubjectsSelect = (selectedOptions) => {
    setSelectedSubjects(selectedOptions);
    const newSubjects = selectedOptions.map((option) => {
      const existingSubject = formData.subjects.find((s) => s.name === option.value);
      return existingSubject || { name: option.value, assessments: [{ name: "PT-1", totalMarks: commonTotalMarks || 100, passingMarks: commonPassingMarks || 33, startTime: new Date(), endTime: new Date(), examDate: new Date() }] };
    });
    setFormData((prevData) => ({ ...prevData, subjects: newSubjects }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoader(true);
    setLoader(true);

    try {
      const transformedSubjects = JSON.parse(JSON.stringify(formData.subjects));
      transformedSubjects.forEach(subject => {
        subject.assessments.forEach(assessment => {
          assessment.startTime = assessment.startTime ? moment(assessment.startTime).format("hh:mm a") : "";
          assessment.endTime = assessment.endTime ? moment(assessment.endTime).format("hh:mm a") : "";
          assessment.examDate = assessment.examDate ? moment(assessment.examDate).format("DD-MM-YYYY") : "";
        });
      });

      const apiPayload = {
        ...formData,
        startDate: formData.startDate ? moment(formData.startDate).format("DD-MM-YYYY") : "",
        endDate: formData.endDate ? moment(formData.endDate).format("DD-MM-YYYY") : "",
        resultPublishDate: formData.resultPublishDate ? moment(formData.resultPublishDate).format("DD-MM-YYYY") : "",
        subjects: transformedSubjects,
      };

      let response;
      if (isEdit) {
        response = await updateExam(editingExamId, apiPayload);
        if (response.success) {
          toast.success("Exam updated successfully!");
          resetForm();
        } else {
          toast.error(response?.message || "Failed to update exam.");
        }
      } else {
        response = await createExam(apiPayload);
        if (response.success) {
          toast.success("Exam created successfully!");
          resetForm();
        } else {
          toast.error(response?.message || "Failed to create exam.");
        }
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
    window.scrollTo(0, 0);
    setIsEdit(true);
    setEditingExamId(data.examId);

    const cls = availableClasses.find((c) => data.classNames.includes(c.label));
    setSelectedClass(cls);

    if (cls) {
      setAvailableSections(cls.sections.map(s => ({ value: s, label: s })));
      setAvailableSubjectsForClass(cls.sections.map(s => ({ value: s, label: s })));
    }

    setSelectedSections(data.sections.map(s => ({ value: s, label: s })));
    const subs = data.subjects.map(s => ({ label: s.name, value: s.name }));
    setSelectedSubjects(subs);

    const subjectsWithDateObjects = data.subjects.map(subject => ({
      ...subject,
      assessments: subject.assessments.map(ass => ({
        ...ass,
        examDate: ass.examDate ? moment(ass.examDate, "DD-MM-YYYY").toDate() : null,
        startTime: ass.startTime ? moment(ass.startTime, "hh:mm a").toDate() : null,
        endTime: ass.endTime ? moment(ass.endTime, "hh:mm a").toDate() : null,
      }))
    }));

    setFormData({
      ...data,
      startDate: data.startDate ? moment(data.startDate, "DD-MM-YYYY").toDate() : null,
      endDate: data.endDate ? moment(data.endDate, "DD-MM-YYYY").toDate() : null,
      resultPublishDate: data.resultPublishDate ? moment(data.resultPublishDate, "DD-MM-YYYY").toDate() : null,
      subjects: subjectsWithDateObjects,
      term: data.term || "",
    });
  };

  const handleCancel = () => {
    resetForm();
  };

  const termOptions = [
    { label: "TERM 1", value: "TERM 1" },
    { label: "TERM 2", value: "TERM 2" },
    { label: "TERM 3", value: "TERM 3" },
    { label: "TERM 4", value: "TERM 4" },
  ];

  return (
    <div className={`min-h-screen p-6 ${currentMode === "Dark" ? "bg-dark text-light" : "bg-gradient-to-b from-gray-200 to-gray-400"}`}>
      <PageHeaderWithBreadcrumb
        breadcrumbItems={BreadcrumbList.admission}
        title={isEdit ? "Edit Your Exam" : "Create a New Exam"}
      />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold uppercase" style={{ color: currentMode === "Dark" ? "#FBBF24" : "#4F46E5" }}>Create Examination Forms</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForms(!showForms)}
            className={`px-4 py-2 rounded-lg flex items-center ${currentMode === "Dark" ? "bg-gray-600 text-light" : "bg-gray-500 text-white"} hover:opacity-80 transition-all`}
          >
            <FaEdit className="mr-2" />
            {showForms ? "Hide Forms" : "Show Forms"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSettingsModalOpen(true)}
            className={`px-4 py-2 rounded-lg flex items-center ${currentMode === "Dark" ? "bg-gray-600 text-light" : "bg-gray-500 text-white"} hover:opacity-80 transition-all`}
          >
            <FaCog className="mr-2" />
            Settings
          </motion.button>
        </div>
      </div>
      {showForms && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`p-8 rounded-2xl shadow-2xl ${currentMode === "Dark" ? "bg-gray-800 text-light" : "bg-white"} w-full md:w-[95%] lg:w-[95%] xl:w-[95%] mx-auto`}
        >
          <form onSubmit={handleSubmit}>
            <h2 className="text-base font-bold mb-6 flex items-center" style={{ color: currentMode === "Dark" ? "#FBBF24" : "#4F46E5" }}>
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <FaClipboardList className="mr-3" />
              </motion.span>
              Exam Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <ReactInput
                  type="text"
                  name="name"
                  required
                  onChange={handleInputChange}
                  value={formData.name}
                  placeholder={"e.g. Midterm Exam"}
                  label="Exam Name"
                  className={`w-full p-3 rounded-lg border-2 ${currentMode === "Dark" ? "border-gray-600 bg-gray-700 placeholder-gray-400 text-light" : "border-gray-300 bg-white"} focus:ring-4 focus:ring-blue-300 transition-all`}
                  data-tooltip-id="exam-name"
                />
                <Tooltip id="exam-name" content="Give your exam a fun name!" />
              </div>
              <div>
                <ReactInput
                  type="text"
                  name="examType"
                  required
                  onChange={handleInputChange}
                  value={formData.examType}
                  placeholder={"e.g. Final, Midterm, Quiz"}
                  label="Exam Type"
                  className={`w-full p-3 rounded-md border-1 ${currentMode === "Dark" ? "border-gray-600 bg-gray-700 placeholder-gray-400 text-light-dark" : "border-gray-300 bg-white"} focus:ring-4 focus:ring-blue-300 transition-all`}
                  data-tooltip-id="exam-type"
                />
                <Tooltip id="exam-type" content="Is it a Final, Midterm, or Quiz?" />
              </div>
              <div>
                <label className={`text-sm font-bold ${currentMode === "Dark" ? "text-light" : "text-gray-700"} mb-1 block`}>Term</label>
                <Select
                  name="term"
                  value={termOptions.find(option => option.value === formData.term) || null}
                  onChange={handleTermChange}
                  options={termOptions}
                  placeholder="Select Term"
                  isSearchable
                  isClearable
                  className={`w-full ${currentMode === "Dark" ? "bg-gray-700 text-light" : "bg-white"}`}
                  data-tooltip-id="term"
                />
                <Tooltip id="term" content="Choose the term for this exam!" />
              </div>
              <div>
                <DatePicker
                  label="Start Date"
                  name="startDate"
                  value={formData.startDate}
                  handleChange={(e) => handleTopLevelDateChange(e.value, "startDate")}
                  className={`w-full ${currentMode === "Dark" ? "bg-gray-700 text-light border-gray-600" : "bg-white border-gray-300"}`}
                  data-tooltip-id="start-date"
                />
                <Tooltip id="start-date" content="When does the exam start?" />
              </div>
              <div>
                <DatePicker
                  label="End Date"
                  name="endDate"
                  value={formData.endDate}
                  handleChange={(e) => handleTopLevelDateChange(e.value, "endDate")}
                  className={`w-full ${currentMode === "Dark" ? "bg-gray-700 text-light border-gray-600" : "bg-white border-gray-300"}`}
                  data-tooltip-id="end-date"
                />
                <Tooltip id="end-date" content="When does the exam end?" />
              </div>
              <div>
                <DatePicker
                  label="Result Publish Date"
                  name="resultPublishDate"
                  value={formData.resultPublishDate}
                  handleChange={(e) => handleTopLevelDateChange(e.value, "resultPublishDate")}
                  className={`w-full ${currentMode === "Dark" ? "bg-gray-700 text-light border-gray-600" : "bg-white border-gray-300"}`}
                  data-tooltip-id="result-date"
                />
                <Tooltip id="result-date" content="When will results be out?" />
              </div>
            </div>

            <h2 className="text-base font-bold mt-8 mb-4 flex items-center" style={{ color: currentMode === "Dark" ? "#FBBF24" : "#4F46E5" }}>
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <FaUsers className="mr-3" />
              </motion.span>
              Class & Sections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`text-sm font-bold ${currentMode === "Dark" ? "text-light" : "text-gray-700"} mb-1 block`}>Select Class</label>
                <Select
                  options={availableClasses}
                  value={selectedClass}
                  onChange={handleClassSelect}
                  placeholder="Select a Class"
                  isSearchable
                  isClearable
                  isDisabled={isEdit}
                  className={`w-full ${currentMode === "Dark" ? "bg-gray-700 text-light" : "bg-white"}`}
                  data-tooltip-id="select-class"
                />
                <Tooltip id="select-class" content="Pick a class for the exam!" />
              </div>
              <div>
                <label className={`text-sm font-bold ${currentMode === "Dark" ? "text-light" : "text-gray-700"} mb-1 block`}>Select Sections</label>
                <Select
                  options={availableSections}
                  value={selectedSections}
                  onChange={handleSectionSelect}
                  placeholder="Select Sections"
                  isMulti
                  isSearchable
                  isDisabled={!selectedClass}
                  className={`w-full ${currentMode === "Dark" ? "bg-gray-700 text-light" : "bg-white"}`}
                  data-tooltip-id="select-sections"
                />
                <Tooltip id="select-sections" content="Choose sections for this class!" />
              </div>
            </div>

            <h2 className="text-base font-bold mt-8 mb-4 flex items-center" style={{ color: currentMode === "Dark" ? "#FBBF24" : "#4F46E5" }}>
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <FaBook className="mr-3" />
              </motion.span>
              Subjects & Assessments
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <label className={`text-sm font-bold ${currentMode === "Dark" ? "text-light" : "text-gray-700"} mb-1 block`}>Select Subjects</label>
                <Select
                  options={availableSubjectsForClass}
                  value={selectedSubjects}
                  onChange={handleSubjectsSelect}
                  placeholder="Select Subjects"
                  isMulti
                  isSearchable
                  isDisabled={!selectedClass}
                  className={`w-full ${currentMode === "Dark" ? "bg-gray-700 text-light" : "bg-white"}`}
                  data-tooltip-id="select-subjects"
                />
                <Tooltip id="select-subjects" content="Add subjects for the exam!" />
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <ReactInput
                  type="number"
                  name="commonTotalMarks"
                  value={commonTotalMarks}
                  onChange={(e) => handleCommonMarksChange(e, "totalMarks")}
                  label="Total Marks(C)"
                  className={`w-full md:w-[120px] p-3 rounded-lg border-2 ${currentMode === "Dark" ? "border-gray-600 bg-gray-700 text-violet-400" : "border-gray-300 bg-white text-violet-600"} focus:ring-4 focus:ring-violet-300 transition-all`}
                  data-tooltip-id="common-total-marks"
                />
                <Tooltip id="common-total-marks" content="Set total marks for all assessments" />
                <ReactInput
                  type="number"
                  name="commonPassingMarks"
                  value={commonPassingMarks}
                  onChange={(e) => handleCommonMarksChange(e, "passingMarks")}
                  label="Passing Marks(C)"
                  className={`w-full md:w-[120px] p-3 rounded-lg border-2 ${currentMode === "Dark" ? "border-gray-600 bg-gray-700 text-violet-400" : "border-gray-300 bg-white text-violet-600"} focus:ring-4 focus:ring-violet-300 transition-all`}
                  data-tooltip-id="common-passing-marks"
                />
                <Tooltip id="common-passing-marks" content="Set passing marks for all assessments" />
              </div>
            </div>
            <AnimatePresence>
              {formData.subjects.map((subject, sIndex) => (
                <motion.div
                  key={sIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`p-6 rounded-lg shadow-md mt-4 ${currentMode === "Dark" ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xl font-bold ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`}>{subject.name}</h3>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeSubject(sIndex)}
                      className="text-red-500 hover:text-red-700"
                      data-tooltip-id={`remove-subject-${sIndex}`}
                    >
                      <FaTrashAlt size={18} />
                    </motion.button>
                    <Tooltip id={`remove-subject-${sIndex}`} content="Remove this subject" />
                  </div>
                  <AnimatePresence>
                    {subject.assessments.map((ass, aIndex) => (
                      <motion.div
                        key={aIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`flex flex-wrap items-center gap-4 mt-3 p-4 rounded-md ${currentMode === "Dark" ? "bg-gray-800" : "bg-white"} shadow-sm`}
                      >
                        <ReactInput
                          type="text"
                          name="name"
                          required
                          onChange={(e) => handleAssessmentFieldChange(e.target.value, "name", sIndex, aIndex)}
                          value={ass.name}
                          label="Assessment Name"
                          className={`flex-1 min-w-[150px] p-3 rounded-lg border-2 ${currentMode === "Dark" ? "border-gray-600 bg-gray-700 text-light" : "border-gray-300 bg-white"} focus:ring-4 focus:ring-blue-300`}
                        />
                        <ReactInput
                          type="number"
                          name="totalMarks"
                          required
                          onChange={(e) => handleAssessmentFieldChange(e.target.value, "totalMarks", sIndex, aIndex)}
                          value={ass.totalMarks}
                          label="Total Marks"
                          className={`flex-1 min-w-[120px] p-3 rounded-lg border-2 ${currentMode === "Dark" ? "border-gray-600 bg-gray-700 text-violet-400" : "border-gray-300 bg-white text-violet-600"} focus:ring-4 focus:ring-violet-300`}
                        />
                        <ReactInput
                          type="number"
                          name="passingMarks"
                          required
                          onChange={(e) => handleAssessmentFieldChange(e.target.value, "passingMarks", sIndex, aIndex)}
                          value={ass.passingMarks}
                          label="Passing Marks"
                          className={`flex-1 min-w-[120px] p-3 rounded-lg border-2 ${currentMode === "Dark" ? "border-gray-600 bg-gray-700 text-violet-400" : "border-gray-300 bg-white text-violet-600"} focus:ring-4 focus:ring-violet-300`}
                        />
                        <DatePicker
                          label="Date"
                          name="examDate"
                          value={ass.examDate}
                          handleChange={(e) => handleAssessmentFieldChange(e.value, "examDate", sIndex, aIndex)}
                          className={`flex-1 min-w-[150px] ${currentMode === "Dark" ? "bg-gray-700 text-light border-gray-600" : "bg-white border-gray-300"}`}
                        />
                        <TimePicker
                          label="Start Time"
                          name="startTime"
                          value={ass.startTime}
                          handleChange={(e) => handleAssessmentFieldChange(e.value, "startTime", sIndex, aIndex)}
                          className={`flex-1 min-w-[120px] ${currentMode === "Dark" ? "bg-gray-700 text-light border-gray-600" : "bg-white border-gray-300"}`}
                        />
                        <TimePicker
                          label="End Time"
                          name="endTime"
                          value={ass.endTime}
                          handleChange={(e) => handleAssessmentFieldChange(e.value, "endTime", sIndex, aIndex)}
                          className={`flex-1 min-w-[120px] ${currentMode === "Dark" ? "bg-gray-700 text-light border-gray-600" : "bg-white border-gray-300"}`}
                        />
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeAssessment(sIndex, aIndex)}
                          className="text-red-500 hover:bg-red-50"
                          data-tooltip-id={`remove-assessment-${sIndex}-${aIndex}`}
                        >
                          <FaTrashAlt size={16} />
                        </motion.button>
                        <Tooltip id={`remove-assessment-${sIndex}-${aIndex}`} content="Remove this assessment" />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => duplicateAssessment(sIndex, aIndex)}
                          className={`flex items-center px-4 py-2 rounded-lg ${currentMode === "Dark" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"} transition-all`}
                          data-tooltip-id="duplicate-assessment"
                        >
                          <FaCopy />
                        </motion.button>
                        <Tooltip id="duplicate-assessment" content="Duplicate this assessment!" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => addAssessment(sIndex)}
                    className={`mt-4 flex items-center px-4 py-2 rounded-lg ${currentMode === "Dark" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"} transition-all`}
                    data-tooltip-id={`add-assessment-${sIndex}`}
                  >
                    <FaPlusCircle className="mr-2" /> Add Assessment
                  </motion.button>
                  <Tooltip id={`add-assessment-${sIndex}`} content="Add a new assessment for this subject" />
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="flex justify-end gap-4 mt-8">
              {isEdit ? (
                <>
                  <Buttons
                    name="Update Exam"
                    type="submit"
                    color="blue"
                    disabled={loader}
                    className={`px-6 py-3 rounded-lg shadow-lg ${currentMode === "Dark" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"} transition-all`}
                    data-tooltip-id="update-exam"
                  />
                  <Tooltip id="update-exam" content="Save your changes!" />
                  <Buttons
                    name="Cancel"
                    type="button"
                    color="gray"
                    onClick={handleCancel}
                    className={`px-6 py-3 rounded-lg shadow-lg ${currentMode === "Dark" ? "bg-gray-600 text-light hover:bg-gray-700" : "bg-gray-500 text-white hover:bg-gray-600"} transition-all`}
                    data-tooltip-id="cancel"
                  />
                  <Tooltip id="cancel" content="Discard changes and reset" />
                </>
              ) : (
                <Buttons
                  name="Create Exam"
                  type="submit"
                  color="blue"
                  disabled={loader}
                  className={`px-6 py-3 rounded-lg shadow-lg ${currentMode === "Dark" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 text-white hover:bg-blue-700"} transition-all`}
                  data-tooltip-id="create-exam"
                />
              )}
              <Tooltip id="create-exam" content="Create a new exam adventure!" />
            </div>
          </form>
        </motion.div>
      )}
      <Modal
        isOpen={settingsModalOpen}
        onRequestClose={() => setSettingsModalOpen(false)}
        className={`modal-content w-full max-w-md mx-4 p-6 rounded-2xl ${currentMode === "Dark" ? "bg-gray-800 text-light" : "bg-white"}`}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        contentLabel="Settings Modal"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className={`text-2xl font-bold mb-4 ${currentMode === "Dark" ? "text-accent" : "text-blue-600"}`}>Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>Show Form by Default</span>
              <Switch
                onChange={() => setShowForms(!showForms)}
                checked={showForms}
                onColor="#4F46E5"
                offColor="#D1D5DB"
                checkedIcon={false}
                uncheckedIcon={false}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>Show Exam List by Default</span>
              <Switch
                onChange={() => setShowExamList(!showExamList)}
                checked={showExamList}
                onColor="#4F46E5"
                offColor="#D1D5DB"
                checkedIcon={false}
                uncheckedIcon={false}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSettingsModalOpen(false)}
              className={`px-4 py-2 rounded-lg ${currentMode === "Dark" ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-500 text-white hover:bg-gray-600"} transition-colors`}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </Modal>
      <ViewExam onEdit={handleEdit} loader={loader} showExamList={showExamList} setShowExamList={setShowExamList} />
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


