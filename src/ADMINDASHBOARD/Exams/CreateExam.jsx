import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
} from "@mui/material";
import Select from "react-select";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { AdminGetAllClasses, createExam } from "../../Network/AdminApi";
import { toast } from "react-toastify"; // Import toast
import ViewExam from "./AllExams/ViewExam";
import { useStateContext } from "../../contexts/ContextProvider";

const CreateExam = () => {
  
  const { currentColor,setIsLoader } = useStateContext();
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState(
    []
  );
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    examType: "",
    classNames: [],
    sections: [],
    term: "",
    startDate: "",
    endDate: "",
    resultPublishDate: "",
    subjects: [],
  });
  const [loader, setLoader] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const removeSubject = (index) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const getAllClass = async () => {
    try {
      setIsLoader(true)
      const response = await AdminGetAllClasses();

      if (response?.success) {
        let classes = response.classes.map((item) => ({
          value: item._id,
          label: item.className,
          sections: item.sections,
          subjects: item.subjects,
        }));
        setAvailableClasses(classes);
        setIsLoader(false)
      } else {

        toast.error("Failed to fetch class list.");
        setAvailableClasses([]);
      }
    } catch (error) {
      console.log("error", error);
    }
    finally{
      setIsLoader(false)
    }
  };

  useEffect(() => {
    getAllClass();
  }, []);

  const handleClassSelect = (selectedOption) => {
    setSelectedClass(selectedOption);

    setFormData((prevData) => ({
      ...prevData,
      classNames: selectedOption ? [selectedOption.label] : [], // Changed from className to classNames and ensured it's an array
    }));

    if (selectedOption && selectedOption.sections) {
      setAvailableSections(
        selectedOption.sections.map((section) => ({
          value: section,
          label: section,
        }))
      );
    } else {
      setAvailableSections([]);
    }

    if (selectedOption && selectedOption.subjects) {
      const subjectsOptions = selectedOption.subjects.map((subject) => ({
        value: subject,
        label: subject,
      }));
      setAvailableSubjectsForClass(subjectsOptions);
    } else {
      setAvailableSubjectsForClass([]);
    }
  };

  const handleSectionSelect = (selectedOptions) => {
    setSelectedSections(selectedOptions);

    const selectedSectionValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];

    setFormData((prevData) => ({
      ...prevData,
      sections: selectedSectionValues,
    }));
  };

  const addAssessment = (subjectIndex) => {
    const newSubjects = [...formData.subjects];
    newSubjects[subjectIndex].assessments.push({ name: "", totalMarks: "", passingMarks: "", startTime: "", endTime: "" }); //added passingMarks, startTime and endTime
    setFormData({ ...formData, subjects: newSubjects });
  };

  const removeAssessment = (subjectIndex, assessmentIndex) => {
    const newSubjects = [...formData.subjects];
    newSubjects[subjectIndex].assessments = newSubjects[
      subjectIndex
    ].assessments.filter((_, i) => i !== assessmentIndex);
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleAssessmentChange = (subjectIndex, assessmentIndex, e) => {
    const newSubjects = [...formData.subjects];
    newSubjects[subjectIndex].assessments[assessmentIndex][e.target.name] =
      e.target.value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubjectsSelect = (selectedOptions) => {
    setSelectedSubjects(selectedOptions);

    const newSubjects = selectedOptions.map((option) => ({
      name: option.value,
      assessments: [],
    }));

    setFormData((prevData) => {
      // Create a map of existing subject names to their data
      const existingSubjectsMap = prevData.subjects.reduce((acc, subject) => {
        acc[subject.name] = subject;
        return acc;
      }, {});

      // Merge the new subjects with the existing subject data
      const mergedSubjects = newSubjects.map((newSubject) => {
        // Check if the subject already exists
        if (existingSubjectsMap[newSubject.name]) {
          // If it exists, keep its assessments
          return {
            ...newSubject,
            assessments: existingSubjectsMap[newSubject.name].assessments,
          };
        } else {
          // If it doesn't exist, keep newSubject.assessments = []
          return newSubject; //return { name: newSubject.name, assessments: [] };
        }
      });

      return { ...prevData, subjects: mergedSubjects };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoader(true)

    try {
      const payload = {
        name: formData.name,
        examType: formData.examType,
        classNames: formData.classNames,
        sections: formData.sections,
        term: formData.term,
        subjects: formData.subjects,
        startDate: formData.startDate,
        endDate: formData.endDate,
        resultPublishDate: formData.resultPublishDate,
      };
      
      const response = await createExam(payload);
      
      if (response.success) {
        setIsLoader(false);
        toast.success("Exam created successfully!");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoader(false); // Ensure loader is disabled after the API call completes
    }
  };

  return (
    <div className="p-6" >
      <div>
        <Typography variant="h4" gutterBottom>
          Create Exam
        </Typography>
        <form onSubmit={handleSubmit}>
          <div className="flex  flex-wrap gap-2 gap-y-3">
            <ReactInput
              type="text"
              name="name"
              required
              onChange={handleInputChange}
              value={formData.name}
              label="Exam Name"
            />
            <ReactInput
              type="text"
              name="examType"
              required
              onChange={handleInputChange}
              value={formData.examType}
              label="Exam Type"
            />
            <ReactSelect
              name="term"
              value={formData?.term}
              handleChange={handleInputChange}
              label="TERMS"
              dynamicOptions={[
                { label: "TERM 1", value: "TERM 1" },
                { label: "TERM 2", value: "TERM 2" },
                { label: "TERM 3", value: "TERM 3" },
              ]}
            />
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            <ReactInput
              type="date"
              name="startDate"
              required
              onChange={handleInputChange}
              value={formData.startDate}
              label="Start Date"
            />
            <ReactInput
              type="date"
              name="endDate"
              required
              onChange={handleInputChange}
              value={formData.endDate}
              label="End Date"
            />
            <ReactInput
              type="date"
              name="resultPublishDate"
              required
              onChange={handleInputChange}
              value={formData.resultPublishDate}
              label="Result Publish Date"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <div className="gap-3 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">
                  Select Class
                </h3>
              </div>

              <Select
                options={availableClasses}
                value={selectedClass}
                onChange={handleClassSelect}
                placeholder="Select a Class"
                isSearchable
                menuPlacement="auto"
                menuPosition="fixed"
                isClearable
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
                      : baseStyles.boxShadow,
                    outline: "none",
                    borderRadius: "0.25rem",
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "rgba(0, 0, 0, 0.2)"
                        : baseStyles.borderColor,
                    },
                  }),
                  menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
                }}
              />
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center ">
                <h3 className="text-sm font-bold text-gray-800">
                  Select Sections
                </h3>
              </div>
              <Select
                options={availableSections}
                value={selectedSections}
                onChange={handleSectionSelect}
                placeholder="Select Sections"
                isMulti
                isSearchable
                menuPlacement="auto"
                menuPosition="fixed"
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    boxShadow: state.isFocused
                      ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
                      : baseStyles.boxShadow,
                    outline: "none",
                    borderRadius: "0.25rem",
                    "&:hover": {
                      borderColor: state.isFocused
                        ? "rgba(0, 0, 0, 0.2)"
                        : baseStyles.borderColor,
                    },
                  }),
                  menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800">
                Select Subjects
              </h3>
            </div>

            <Select
              options={availableSubjectsForClass}
              value={selectedSubjects}
              onChange={handleSubjectsSelect}
              placeholder="Select Subjects"
              isMulti
              isSearchable
              menuPlacement="auto"
              menuPosition="fixed"
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  boxShadow: state.isFocused
                    ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
                    : baseStyles.boxShadow,
                  // border: "none",
                  outline: "none",
                  borderRadius: "0.25rem",
                  "&:hover": {
                    borderColor: state.isFocused
                      ? "rgba(0, 0, 0, 0.2)"
                      : baseStyles.borderColor,
                  },
                }),
                menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }), // Ensure menu overlays other content
              }}
            />
          </div>

          <Typography variant="h5" mt={3}>
            Subjects
          </Typography>
          {formData.subjects.map((subject, sIndex) => (
            <Box key={sIndex} mt={2} p={2} border={1} borderRadius={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={10}>
                  <Typography variant="h6">{subject.name}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    color="error"
                    onClick={() => removeSubject(sIndex)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>

              {subject.assessments.map((ass, aIndex) => (
                <div className="flex gap-3" key={aIndex}>
                  <ReactInput
                    type="text"
                    name="name"
                    required
                    onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
                    value={ass.name}
                    label="Assessment Name"
                  />

                  <ReactInput
                    type="number"
                    name="totalMarks"
                    required
                    onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
                    value={ass.totalMarks}
                    label="Total Marks"
                  />
                   <ReactInput
                    type="number"
                    name="passingMarks"
                    required
                    onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
                    value={ass.passingMarks}
                    label="Passing Marks"
                  />
                   <ReactInput
                    type="datetime-local"
                    name="startTime"
                    required
                    onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
                    value={ass.startTime}
                    label="Start Time"
                  />
                     <ReactInput
                    type="datetime-local"
                    name="endTime"
                    required
                    onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
                    value={ass.endTime}
                    label="End Time"
                  />

                  <IconButton
                    color="error"
                    onClick={() => removeAssessment(sIndex, aIndex)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </div>
              ))}

              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => addAssessment(sIndex)}
              >
                Add Assessment
              </Button>
            </Box>
          ))}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loader}
          >
            {loader ? "Creating Exam..." : "Create Exam"}
          </Button>
        </form>
      </div>
      <ViewExam/>
    </div>
  );
};

export default CreateExam;




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

// const CreateExam = () => {
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


//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // addSubject is removed as selection comes directly from Select component

//   const removeSubject = (index) => {
//     setFormData({
//       ...formData,
//       subjects: formData.subjects.filter((_, i) => i !== index),
//     });
//   };

//   const getAllClass = async () => {
//     try {
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
//     }
//   };

//   useEffect(() => {
//     getAllClass();
//   }, []);

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);

//     setFormData((prevData) => ({
//       ...prevData,
//       className: selectedOption?.label,
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
//     newSubjects[subjectIndex].assessments.push({ name: "", totalMarks: "" });
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
//   const handleSubmit = async(e) => {
//     e.preventDefault();
//     console.log("Form Data Submitted:", formData);
//     const payload=""
//     try {
//       const response = await createExam(payload);
//       console.log("response", response);
//       if (response.success) {
//         toast.success("Exam created successfully!");
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     } finally {
//       setLoader(false); // Ensure loader is disabled after the API call completes
//     }
 
//   };

//   return (
//     <Box display="flex"  mt={5}>
//       <Paper elevation={3} sx={{ padding: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Create Exam
//         </Typography>
//         <form onSubmit={handleSubmit}>
//           <div className="flex justify-between flex-wrap gap-2 gap-y-3">
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
//             <ReactInput
//               type="text"
//               name="term"
//               required
//               onChange={handleInputChange}
//               value={formData.term}
//               label="Term"
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
//           </div>

//           <div className="flex gap-2 mt-3 flex-wrap">
//             <ReactInput
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
//             />
//           </div>
// <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
// <div className="gap-3 w-full">
//             <div className="flex justify-between items-center">
//               <h3 className="text-sm font-bold text-gray-800">Select Class</h3>
//             </div>

//             <Select
//               options={availableClasses}
//               value={selectedClass}
//               onChange={handleClassSelect}
//               placeholder="Select a Class"
//               isSearchable
//               menuPlacement="auto"
//               menuPosition="fixed"
//               isClearable
//               styles={{
//                 control: (baseStyles, state) => ({
//                   ...baseStyles,
//                   boxShadow: state.isFocused
//                     ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                     : baseStyles.boxShadow,
//                   outline: "none",
//                   borderRadius: "0.25rem",
//                   "&:hover": {
//                     borderColor: state.isFocused
//                       ? "rgba(0, 0, 0, 0.2)"
//                       : baseStyles.borderColor,
//                   },
//                 }),
//                 menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
//               }}
//             />
//           </div>

//           <div className="w-full">
//             <div className="flex justify-between items-center ">
//               <h3 className="text-sm font-bold text-gray-800">
//                 Select Sections
//               </h3>
//             </div>
//             <Select
//               options={availableSections}
//               value={selectedSections}
//               onChange={handleSectionSelect}
//               placeholder="Select Sections"
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
//                   outline: "none",
//                   borderRadius: "0.25rem",
//                   "&:hover": {
//                     borderColor: state.isFocused
//                       ? "rgba(0, 0, 0, 0.2)"
//                       : baseStyles.borderColor,
//                   },
//                 }),
//                 menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
//               }}
//             />
//           </div>
// </div>

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
//                   <IconButton color="error" onClick={() => removeSubject(sIndex)}>
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>

//               {subject.assessments.map((ass, aIndex) => (
//                 <div className="flex gap-3"
                 
//                 >
                
//                     <ReactInput
//                       type="text"
//                       name="name"
//                       required
//                       onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                       value={ass.name}
//                       label="Assessment Name"
//                     />
                 
//                     <ReactInput
//                       type="number"
//                       name="totalMarks"
//                       required
//                       onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                       value={ass.totalMarks}
//                       label="Total Marks"
//                     />
                 
//                     <IconButton
//                       color="error"
//                       onClick={() => removeAssessment(sIndex, aIndex)}
//                     >
//                       <RemoveIcon />
//                     </IconButton>
                 
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
//           >
//             Create Exam
//           </Button>
//         </form>
//       </Paper>
//     </Box>
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
// import { AdminGetAllClasses } from "../../Network/AdminApi";

// const CreateExam = () => {
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedSections, setSelectedSections] = useState([]);
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState(
//     []
//   );  // Use this to store available subjects for the selected class
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

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Modified addSubject function
//   const addSubject = () => {
//       if (availableSubjectsForClass.length > 0) {
//           setFormData({
//               ...formData,
//               subjects: [...formData.subjects, { name: availableSubjectsForClass[0].value, assessments: [] }],
//           });
//       } else {
//           // Handle the case where no subjects are available for the selected class
//           console.warn("No subjects available for the selected class.");
//       }
//   };

//   const removeSubject = (index) => {
//     setFormData({
//       ...formData,
//       subjects: formData.subjects.filter((_, i) => i !== index),
//     });
//   };

//   const getAllClass = async () => {
//     try {
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
//     }
//   };

//   useEffect(() => {
//     getAllClass();
//   }, []);

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);

//     setFormData((prevData) => ({
//       ...prevData,
//       className: selectedOption?.label,
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


//     // Update available subjects for the selected class
//     if (selectedOption && selectedOption.subjects) {
//       const subjectsOptions = selectedOption.subjects.map((subject) => ({
//         value: subject,
//         label: subject,
//       }));
//       setAvailableSubjectsForClass(subjectsOptions);
//     } else {
//       setAvailableSubjectsForClass([]); // Reset if no class selected
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

//   const handleSubjectChange = (index, e) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[index][e.target.name] = e.target.value;
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const addAssessment = (subjectIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments.push({ name: "", totalMarks: "" });
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

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form Data Submitted:", formData);
//   };

//   return (
//     <Box display="flex" justifyContent="center" mt={5}>
//       <Paper elevation={3} sx={{ padding: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Create Exam
//         </Typography>
//         <form onSubmit={handleSubmit}>
//           <div className="flex justify-between flex-wrap gap-2 gap-y-3">
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
//             <ReactInput
//               type="text"
//               name="term"
//               required
//               onChange={handleInputChange}
//               value={formData.term}
//               label="Term"
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
//           </div>

//           <div className="">
//             <div className="flex justify-between items-center ">
//               <h3 className="text-lg font-bold text-gray-800">Select Class</h3>
//             </div>

//             <Select
//               options={availableClasses}
//               value={selectedClass}
//               onChange={handleClassSelect}
//               placeholder="Select a Class"
//               isSearchable
//               menuPlacement="auto"
//               menuPosition="fixed"
//               isClearable
//               styles={{
//                 control: (baseStyles, state) => ({
//                   ...baseStyles,
//                   boxShadow: state.isFocused
//                     ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                     : baseStyles.boxShadow,
//                   outline: "none",
//                   borderRadius: "0.25rem",
//                   "&:hover": {
//                     borderColor: state.isFocused
//                       ? "rgba(0, 0, 0, 0.2)"
//                       : baseStyles.borderColor,
//                   },
//                 }),
//                 menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
//               }}
//             />
//           </div>

//           <div className="">
//             <div className="flex justify-between items-center ">
//               <h3 className="text-lg font-bold text-gray-800">
//                 Select Sections
//               </h3>
//             </div>
//             <Select
//               options={availableSections}
//               value={selectedSections}
//               onChange={handleSectionSelect}
//               placeholder="Select Sections"
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
//                   outline: "none",
//                   borderRadius: "0.25rem",
//                   "&:hover": {
//                     borderColor: state.isFocused
//                       ? "rgba(0, 0, 0, 0.2)"
//                       : baseStyles.borderColor,
//                   },
//                 }),
//                 menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }),
//               }}
//             />
//           </div>
//           <div className="flex gap-2 mt-3 flex-wrap">
//             <ReactInput
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
//             />
//           </div>

//           <Typography variant="h5" mt={3}>
//             Subjects
//           </Typography>
//           {formData.subjects.map((subject, sIndex) => (
//             <Box key={sIndex} mt={2} p={2} border={1} borderRadius={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <ReactInput
//                     type="text"
//                     name="name"
//                     required
//                     onChange={(e) => handleSubjectChange(sIndex, e)}
//                     value={subject.name}
//                     label="Subject Name"
//                   />
//                 </Grid>
//                 <Grid item xs={2}>
//                   <IconButton color="error" onClick={() => removeSubject(sIndex)}>
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>

//               {subject.assessments.map((ass, aIndex) => (
//                 <Grid
//                   container
//                   spacing={2}
//                   key={aIndex}
//                   alignItems="center"
//                   mt={1}
//                 >
//                   <Grid item xs={5}>
//                     <ReactInput
//                       type="text"
//                       name="name"
//                       required
//                       onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                       value={ass.name}
//                       label="Assessment Name"
//                     />
//                   </Grid>
//                   <Grid item xs={5}>
//                     <ReactInput
//                       type="number"
//                       name="totalMarks"
//                       required
//                       onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                       value={ass.totalMarks}
//                       label="Total Marks"
//                     />
//                   </Grid>
//                   <Grid item xs={2}>
//                     <IconButton
//                       color="error"
//                       onClick={() => removeAssessment(sIndex, aIndex)}
//                     >
//                       <RemoveIcon />
//                     </IconButton>
//                   </Grid>
//                 </Grid>
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
//             startIcon={<AddIcon />}
//             variant="contained"
//             color="secondary"
//             sx={{ mt: 2 }}
//             onClick={addSubject}
//             disabled={availableSubjectsForClass.length === 0}  // Disable if no subjects available
//           >
//             Add Subject
//           </Button>



//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ mt: 3 }}
//           >
//             Create Exam
//           </Button>
//         </form>
//       </Paper>
//     </Box>
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
// import { AdminGetAllClasses } from "../../Network/AdminApi";
// const CreateExam = () => {
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSections, setAvailableSections] = useState([]); // sections
//   const [selectedSections, setSelectedSections] = useState([]);
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState(
//     []
//   );
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

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const addSubject = () => {
//     setFormData({
//       ...formData,
//       subjects: [...formData.subjects, { name: "", assessments: [] }],
//     });
//   };

//   const removeSubject = (index) => {
//     setFormData({
//       ...formData,
//       subjects: formData.subjects.filter((_, i) => i !== index),
//     });
//   };


  
//   const getAllClass = async () => {
//     // setIsLoader(true)
//     try {
//       const response = await AdminGetAllClasses();

//       if (response?.success) {
//         // setIsLoader(false)
//         let classes = response.classes.map((item) => ({
//           value: item._id,
//           label: item.className,
//           sections: item.sections, // Store sections here
//           subjects: item.subjects,
//         }));
//         setAvailableClasses(classes);
//       } else {
//         toast.error("Failed to fetch class list.");
//         setAvailableClasses([]);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

//   useEffect(()=>{
//     getAllClass()
//   },[])
//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);

//     // Update the form data with the selected class name
//     setFormData((prevData) => ({
//       ...prevData,
//       className: selectedOption?.label,
//     }));

//     // Set available sections based on the selected class
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

//     const subjectsString = selectedOption?.subjects;
//     const subjectsOptions = subjectsString?.map((subject) => ({
//       value: subject,
//       label: subject,
//     }));

//     setAvailableSubjectsForClass(subjectsOptions);
//   };

//   const handleSectionSelect = (selectedOptions) => {
//     setSelectedSections(selectedOptions);

//     const selectedSectionValues = selectedOptions
//       ? selectedOptions.map((option) => option.value)
//       : [];

//       setFormData((prevData) => ({
//       ...prevData,
//       sections: selectedSectionValues,
//     }));
//   };


//   const handleSubjectChange = (index, e) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[index][e.target.name] = e.target.value;
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const addAssessment = (subjectIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments.push({ name: "", totalMarks: "" });
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

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form Data Submitted:", formData);
//   };

//   return (
//     <Box display="flex" justifyContent="center" mt={5}>
//       <Paper elevation={3} sx={{ padding: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Create Exam
//         </Typography>
//         <form onSubmit={handleSubmit} >
//           {/* <Grid container spacing={2}>
//             <Grid item xs={3}> */}
//             <div className="flex justify-between flex-wrap gap-2 gap-y-3">

           
//               <ReactInput
//                 type="text"
//                 name="name"
//                 required
//                 onChange={handleInputChange}
//                 value={formData.name}
//                 label="Exam Name"
//               />
//             {/* </Grid>
//             <Grid item xs={3}> */}
//               <ReactInput
//                 type="text"
//                 name="examType"
//                 required
//                 onChange={handleInputChange}
//                 value={formData.examType}
//                 label="Exam Type"
//               />
//             {/* </Grid>
//             <Grid item xs={3}> */}
              
//             {/* </Grid>
//             <Grid item xs={12}> */}
//               <ReactInput
//                 type="text"
//                 name="term"
//                 required
//                 onChange={handleInputChange}
//                 value={formData.term}
//                 label="Term"
//               />
//                           <ReactSelect
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
//                </div>




//                <div className="">
//               <div className="flex justify-between items-center ">
//                 <h3 className="text-lg font-bold text-gray-800">
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
//                 isClearable // Allow clearing the selected class
//                 styles={{
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     // border: "none",
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

//             {/* Multiple Section Select */}
//             <div className="">
//               <div className="flex justify-between items-center ">
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Select Sections
//                 </h3>
//               </div>
//               <Select
//                 options={availableSections}
//                 value={selectedSections}
//                 onChange={handleSectionSelect}
//                 placeholder="Select Sections"
//                 isMulti // Enable multiple selection
//                 isSearchable
//                 menuPlacement="auto"
//                 menuPosition="fixed"
//                 styles={{
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     // border: "none",
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
// <div className="flex gap-2 mt-3 flex-wrap">
// <ReactInput
//                 type="date"
//                 name="startDate"
//                 required
//                 onChange={handleInputChange}
//                 value={formData.startDate}
//                 label="Start Date"
//               />
          
//               <ReactInput
//                 type="date"
//                 name="endDate"
//                 required
//                 onChange={handleInputChange}
//                 value={formData.endDate}
//                 label="End Date"
//               />
           
//               <ReactInput
//                 type="date"
//                 name="resultPublishDate"
//                 required
//                 onChange={handleInputChange}
//                 value={formData.resultPublishDate}
//                 label="Result Publish Date"
//               />
// </div>
//       <Typography variant="h5" mt={3}>
//             Subjects
//           </Typography>
//           {formData.subjects.map((subject, sIndex) => (
//             <Box key={sIndex} mt={2} p={2} border={1} borderRadius={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <ReactInput
//                     type="text"
//                     name="name"
//                     required
//                     onChange={(e) => handleSubjectChange(sIndex, e)}
//                     value={subject.name}
//                     label="Subject Name"
//                   />
//                 </Grid>
//                 <Grid item xs={2}>
//                   <IconButton color="error" onClick={() => removeSubject(sIndex)}>
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>

//               {subject.assessments.map((ass, aIndex) => (
//                 <Grid container spacing={2} key={aIndex} alignItems="center" mt={1}>
//                   <Grid item xs={5}>
//                     <ReactInput
//                       type="text"
//                       name="name"
//                       required
//                       onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                       value={ass.name}
//                       label="Assessment Name"
//                     />
//                   </Grid>
//                   <Grid item xs={5}>
//                     <ReactInput
//                       type="number"
//                       name="totalMarks"
//                       required
//                       onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)}
//                       value={ass.totalMarks}
//                       label="Total Marks"
//                     />
//                   </Grid>
//                   <Grid item xs={2}>
//                     <IconButton
//                       color="error"
//                       onClick={() => removeAssessment(sIndex, aIndex)}
//                     >
//                       <RemoveIcon />
//                     </IconButton>
//                   </Grid>
//                 </Grid>
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
//             startIcon={<AddIcon />}
//             variant="contained"
//             color="secondary"
//             sx={{ mt: 2 }}
//             onClick={addSubject}
//           >
//             Add Subject
//           </Button>

//           <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
//             Create Exam
//           </Button>
//         </form>
//       </Paper>
//     </Box>
//   );
// };

// export default CreateExam;




// import React, { useState } from "react";
// // import { createExam } from "../../services/api";
// import { AdminGetAllClasses, createExam } from "../../Network/AdminApi";
// import { 
//   TextField, Button, Box, Typography, Paper, Grid, IconButton 
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import { toast } from "react-toastify";

// const CreateExam = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     examType: "",
//     classNames: "",
//     sections: "",
//     term: "",
//     subjects: [{ name: "", assessments: [{ name: "", totalMarks: 0 }] }],
//     startDate: "",
//     endDate: "",
//     resultPublishDate: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubjectChange = (index, e) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[index][e.target.name] = e.target.value;
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const handleAssessmentChange = (subjectIndex, assIndex, e) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments[assIndex][e.target.name] = e.target.value;
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const addSubject = () => {
//     setFormData({
//       ...formData,
//       subjects: [...formData.subjects, { name: "", assessments: [{ name: "", totalMarks: 0 }] }],
//     });
//   };

//   const removeSubject = (index) => {
//     const newSubjects = formData.subjects.filter((_, i) => i !== index);
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const addAssessment = (subjectIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments.push({ name: "", totalMarks: 0 });
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const removeAssessment = (subjectIndex, assIndex) => {
//     const newSubjects = [...formData.subjects];
//     newSubjects[subjectIndex].assessments = newSubjects[subjectIndex].assessments.filter((_, i) => i !== assIndex);
//     setFormData({ ...formData, subjects: newSubjects });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // await createExam(formData);
//       const response=await createExam(formData)
//       if(response?.success){
//         toast.success(response?.message)
//       }else{
//         toast.error(response?.message)
//       }
//       alert("Exam created successfully!");
//     } catch (error) {
//       alert("Error creating exam: " + error.response.data.message);
//     }
//   };

//   return (
//     <Box display="flex" justifyContent="center" mt={5}>
//       <Paper elevation={3} sx={{ padding: 4 }}>
//         <Typography variant="h4" gutterBottom>Create Exam</Typography>
//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={2}>
//             <Grid item xs={3}>
//               <TextField fullWidth label="Exam Name" name="name" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={3}>
//               <TextField fullWidth label="Exam Type" name="examType" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={3}>
//               <TextField 
//                 fullWidth label="Class Names (comma-separated)" 
//                 name="classNames" 
//                 onChange={(e) => setFormData({ ...formData, classNames: e.target.value.split(',') })} 
//               />
//             </Grid>
//             <Grid item xs={3}>
//               <TextField 
//                 fullWidth label="Sections (comma-separated)" 
//                 name="sections" 
//                 onChange={(e) => setFormData({ ...formData, sections: e.target.value.split(',') })} 
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField fullWidth label="Term" name="term" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={4}>
//               <TextField fullWidth type="date" name="startDate" label="Start Date" InputLabelProps={{ shrink: true }} onChange={handleChange} />
//             </Grid>
//             <Grid item xs={4}>
//               <TextField fullWidth type="date" name="endDate" label="End Date" InputLabelProps={{ shrink: true }} onChange={handleChange} />
//             </Grid>
//             <Grid item xs={4}>
//               <TextField fullWidth type="date" name="resultPublishDate" label="Result Publish Date" InputLabelProps={{ shrink: true }} onChange={handleChange} />
//             </Grid>
//           </Grid>

//           <Typography variant="h5" mt={3}>Subjects</Typography>
//           {formData.subjects.map((subject, sIndex) => (
//             <Box key={sIndex} mt={2} p={2} border={1} borderRadius={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <TextField fullWidth label="Subject Name" name="name" value={subject.name} onChange={(e) => handleSubjectChange(sIndex, e)} />
//                 </Grid>
//                 <Grid item xs={2}>
//                   <IconButton color="error" onClick={() => removeSubject(sIndex)}>
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>

//               {subject.assessments.map((ass, aIndex) => (
//                 <Grid container spacing={2} key={aIndex} alignItems="center" mt={1}>
//                   <Grid item xs={5}>
//                     <TextField fullWidth label="Assessment Name" name="name" value={ass.name} onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)} />
//                   </Grid>
//                   <Grid item xs={5}>
//                     <TextField fullWidth type="number" label="Total Marks" name="totalMarks" value={ass.totalMarks} onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)} />
//                   </Grid>
//                   <Grid item xs={2}>
//                     <IconButton color="error" onClick={() => removeAssessment(sIndex, aIndex)}>
//                       <RemoveIcon />
//                     </IconButton>
//                   </Grid>
//                 </Grid>
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
//             startIcon={<AddIcon />} 
//             variant="contained" 
//             color="secondary" 
//             sx={{ mt: 2 }} 
//             onClick={addSubject}
//           >
//             Add Subject
//           </Button>

//           <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
//             Create Exam
//           </Button>
//         </form>
//       </Paper>
//     </Box>
//   );
// };

// export default CreateExam;



// import React, { useState } from 'react';
// import { createExam } from '../../services/api';

// const CreateExam = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     examType: '',
//     classNames: [''],
//     sections: [''],
//     term: '',
//     subjects: [{ name: '', assessments: [{ name: '', totalMarks: 0 }] }],
//     startDate: '',
//     endDate: '',
//     resultPublishDate: '',
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubjectChange = (index, e) => {
//     const { name, value } = e.target;
//     const subjects = [...formData.subjects];
//     subjects[index][name] = value;
//     setFormData({ ...formData, subjects });
//   };

//   const handleAssessmentChange = (subjectIndex, assIndex, e) => {
//     const { name, value } = e.target;
//     const subjects = [...formData.subjects];
//     subjects[subjectIndex].assessments[assIndex][name] = value;
//     setFormData({ ...formData, subjects });
//   };

//   const addSubject = () => {
//     setFormData({
//       ...formData,
//       subjects: [...formData.subjects, { name: '', assessments: [{ name: '', totalMarks: 0 }] }],
//     });
//   };

//   const addAssessment = (subjectIndex) => {
//     const subjects = [...formData.subjects];
//     subjects[subjectIndex].assessments.push({ name: '', totalMarks: 0 });
//     setFormData({ ...formData, subjects });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await createExam(formData);
//       alert('Exam created successfully!');
//       // console.log(response.data);
//     } catch (error) {
//       alert('Error creating exam: ' + error.response.data.message);
//     }
//   };

//   return (
//     <div className="create-exam">
//       <h2>Create Exam</h2>
//       <form onSubmit={handleSubmit}>
//         <input name="name" placeholder="Exam Name" onChange={handleChange} />
//         <input name="examType" placeholder="Exam Type" onChange={handleChange} />
//         <input name="classNames" placeholder="Class Names (comma-separated)" onChange={(e) => setFormData({ ...formData, classNames: e.target.value.split(',') })} />
//         <input name="sections" placeholder="Sections (comma-separated)" onChange={(e) => setFormData({ ...formData, sections: e.target.value.split(',') })} />
//         <input name="term" placeholder="Term" onChange={handleChange} />
//         <input type="date" name="startDate" onChange={handleChange} />
//         <input type="date" name="endDate" onChange={handleChange} />
//         <input type="date" name="resultPublishDate" onChange={handleChange} />

//         <h3>Subjects</h3>
//         {formData.subjects.map((subject, sIndex) => (
//           <div key={sIndex}>
//             <input name="name" placeholder="Subject Name" value={subject.name} onChange={(e) => handleSubjectChange(sIndex, e)} />
//             {subject.assessments.map((ass, aIndex) => (
//               <div key={aIndex}>
//                 <input name="name" placeholder="Assessment Name" value={ass.name} onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)} />
//                 <input name="totalMarks" type="number" placeholder="Total Marks" value={ass.totalMarks} onChange={(e) => handleAssessmentChange(sIndex, aIndex, e)} />
//               </div>
//             ))}
//             <button type="button" onClick={() => addAssessment(sIndex)}>Add Assessment</button>
//           </div>
//         ))}
//         <button type="button" onClick={addSubject}>Add Subject</button>
//         <button type="submit">Create Exam</button>
//       </form>
//     </div>
//   );
// };

// export default CreateExam;





// import React, { useState } from "react";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Grid,
//   IconButton,
//   Paper,
//   Alert,
// } from "@mui/material";
// import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

// const CreateExam = () => {
//   const [examData, setExamData] = useState({
//     name: "",
//     examType: "",
//     classNames: [""],
//     sections: [""],
//     term: "",
//     subjects: [
//       {
//         name: "",
//         assessments: [{ name: "", totalMarks: "", passingMarks: "", startTime: "", endTime: "" }],
//       },
//     ],
//     startDate: "",
//     endDate: "",
//     resultPublishDate: "",
//   });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setExamData({ ...examData, [name]: value });
//   };

//   const handleArrayChange = (e, index, field) => {
//     const updatedArray = [...examData[field]];
//     updatedArray[index] = e.target.value;
//     setExamData({ ...examData, [field]: updatedArray });
//   };

//   const addArrayItem = (field) => {
//     setExamData({ ...examData, [field]: [...examData[field], ""] });
//   };

//   const removeArrayItem = (index, field) => {
//     const updatedArray = examData[field].filter((_, i) => i !== index);
//     setExamData({ ...examData, [field]: updatedArray });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       const response = await axios.post(
//         "https://dvsserver.onrender.com/api/v1/exam/exams",
//         examData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         setSuccess("Exam created successfully!");
//         setExamData({
//           name: "",
//           examType: "",
//           classNames: [""],
//           sections: [""],
//           term: "",
//           subjects: [
//             { name: "", assessments: [{ name: "", totalMarks: "", passingMarks: "", startTime: "", endTime: "" }] },
//           ],
//           startDate: "",
//           endDate: "",
//           resultPublishDate: "",
//         });
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "An error occurred while creating the exam.");
//     }
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
//       <Paper elevation={3} sx={{ p: 4 }}>
//         <Typography variant="h4" gutterBottom align="center">
//           Create Exam
//         </Typography>
//         {error && <Alert severity="error">{error}</Alert>}
//         {success && <Alert severity="success">{success}</Alert>}

//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={2}>
//             {/* Exam Name */}
//             <Grid item xs={12} sm={6} md={4} lg={2.4}>
//               <TextField fullWidth label="Exam Name" name="name" value={examData.name} onChange={handleInputChange} required />
//             </Grid>

//             {/* Exam Type */}
//             <Grid item xs={12} sm={6} md={4} lg={2.4}>
//               <TextField fullWidth label="Exam Type" name="examType" value={examData.examType} onChange={handleInputChange} required />
//             </Grid>

//             {/* Term */}
//             <Grid item xs={12} sm={6} md={4} lg={2.4}>
//               <TextField fullWidth label="Term" name="term" value={examData.term} onChange={handleInputChange} required />
//             </Grid>

//             {/* Start Date */}
//             <Grid item xs={12} sm={6} md={4} lg={2.4}>
//               <TextField fullWidth label="Start Date" name="startDate" type="date" value={examData.startDate} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} />
//             </Grid>

//             {/* End Date */}
//             <Grid item xs={12} sm={6} md={4} lg={2.4}>
//               <TextField fullWidth label="End Date" name="endDate" type="date" value={examData.endDate} onChange={handleInputChange} required InputLabelProps={{ shrink: true }} />
//             </Grid>
//           </Grid>

//           {/* Class Names */}
//           <Box sx={{ mt: 3 }}>
//             <Typography variant="h6">Class Names</Typography>
//             <Grid container spacing={2}>
//               {examData.classNames.map((className, index) => (
//                 <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
//                   <TextField fullWidth label={`Class ${index + 1}`} value={className} onChange={(e) => handleArrayChange(e, index, "classNames")} required />
//                   {examData.classNames.length > 1 && (
//                     <IconButton onClick={() => removeArrayItem(index, "classNames")} color="error">
//                       <RemoveCircleOutline />
//                     </IconButton>
//                   )}
//                 </Grid>
//               ))}
//               <Grid item xs={12}>
//                 <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={() => addArrayItem("classNames")}>
//                   Add Class
//                 </Button>
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Sections */}
//           <Box sx={{ mt: 3 }}>
//             <Typography variant="h6">Sections</Typography>
//             <Grid container spacing={2}>
//               {examData.sections.map((section, index) => (
//                 <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
//                   <TextField fullWidth label={`Section ${index + 1}`} value={section} onChange={(e) => handleArrayChange(e, index, "sections")} required />
//                   {examData.sections.length > 1 && (
//                     <IconButton onClick={() => removeArrayItem(index, "sections")} color="error">
//                       <RemoveCircleOutline />
//                     </IconButton>
//                   )}
//                 </Grid>
//               ))}
//               <Grid item xs={12}>
//                 <Button variant="outlined" startIcon={<AddCircleOutline />} onClick={() => addArrayItem("sections")}>
//                   Add Section
//                 </Button>
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Submit Button */}
//           <Box sx={{ textAlign: "center", mt: 4 }}>
//             <Button type="submit" variant="contained" size="large">
//               Create Exam
//             </Button>
//           </Box>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default CreateExam;



// import React, { useState } from 'react';
// import axios from 'axios';
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Grid,
//   IconButton,
//   Paper,
//   Alert,
//   Divider,
// } from '@mui/material';
// import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';

// const CreateExam = () => {
//   const [examData, setExamData] = useState({
//     name: '',
//     examType: '',
//     classNames: [''],
//     sections: [''],
//     term: '',
//     subjects: [
//       {
//         name: '',
//         assessments: [
//           { name: '', totalMarks: '', passingMarks: '', startTime: '', endTime: '' },
//         ],
//       },
//     ],
//     startDate: '',
//     endDate: '',
//     resultPublishDate: '',
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setExamData({ ...examData, [name]: value });
//   };

//   const handleArrayChange = (e, index, field) => {
//     const updatedArray = [...examData[field]];
//     updatedArray[index] = e.target.value;
//     setExamData({ ...examData, [field]: updatedArray });
//   };

//   const addArrayItem = (field) => {
//     setExamData({ ...examData, [field]: [...examData[field], ''] });
//   };

//   const removeArrayItem = (index, field) => {
//     const updatedArray = examData[field].filter((_, i) => i !== index);
//     setExamData({ ...examData, [field]: updatedArray });
//   };

//   const handleSubjectChange = (e, subjectIndex) => {
//     const { name, value } = e.target;
//     const updatedSubjects = [...examData.subjects];
//     updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], [name]: value };
//     setExamData({ ...examData, subjects: updatedSubjects });
//   };

//   const handleAssessmentChange = (e, subjectIndex, assessmentIndex) => {
//     const { name, value } = e.target;
//     const updatedSubjects = [...examData.subjects];
//     const updatedAssessments = [...updatedSubjects[subjectIndex].assessments];
//     updatedAssessments[assessmentIndex] = { ...updatedAssessments[assessmentIndex], [name]: value };
//     updatedSubjects[subjectIndex].assessments = updatedAssessments;
//     setExamData({ ...examData, subjects: updatedSubjects });
//   };

//   const addSubject = () => {
//     setExamData({
//       ...examData,
//       subjects: [
//         ...examData.subjects,
//         { name: '', assessments: [{ name: '', totalMarks: '', passingMarks: '', startTime: '', endTime: '' }] },
//       ],
//     });
//   };

//   const addAssessment = (subjectIndex) => {
//     const updatedSubjects = [...examData.subjects];
//     updatedSubjects[subjectIndex].assessments.push({ name: '', totalMarks: '', passingMarks: '', startTime: '', endTime: '' });
//     setExamData({ ...examData, subjects: updatedSubjects });
//   };

//   const removeSubject = (subjectIndex) => {
//     const updatedSubjects = examData.subjects.filter((_, i) => i !== subjectIndex);
//     setExamData({ ...examData, subjects: updatedSubjects });
//   };

//   const removeAssessment = (subjectIndex, assessmentIndex) => {
//     const updatedSubjects = [...examData.subjects];
//     updatedSubjects[subjectIndex].assessments = updatedSubjects[subjectIndex].assessments.filter((_, i) => i !== assessmentIndex);
//     setExamData({ ...examData, subjects: updatedSubjects });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     try {
//       const response = await axios.post(
//         'https://dvsserver.onrender.com/api/v1/exam/exams',
//         examData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         setSuccess('Exam created successfully!');
//         setExamData({
//           name: '',
//           examType: '',
//           classNames: [''],
//           sections: [''],
//           term: '',
//           subjects: [
//             { name: '', assessments: [{ name: '', totalMarks: '', passingMarks: '', startTime: '', endTime: '' }] },
//           ],
//           startDate: '',
//           endDate: '',
//           resultPublishDate: '',
//         });
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'An error occurred while creating the exam.');
//     }
//   };

//   return (
//     <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
//       <Paper elevation={3} sx={{ p: 4 }}>
//         <Typography variant="h4" component="h2" gutterBottom align="center">
//           Create Exam
//         </Typography>
//         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//         {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
//         <form onSubmit={handleSubmit}>
//           {/* Exam Name */}
//           <TextField
//             fullWidth
//             label="Exam Name"
//             name="name"
//             value={examData.name}
//             onChange={handleInputChange}
//             required
//             sx={{ mb: 2 }}
//           />

//           {/* Exam Type */}
//           <TextField
//             fullWidth
//             label="Exam Type"
//             name="examType"
//             value={examData.examType}
//             onChange={handleInputChange}
//             required
//             sx={{ mb: 2 }}
//           />

//           {/* Class Names */}
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               Class Names
//             </Typography>
//             {examData.classNames.map((className, index) => (
//               <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
//                 <Grid item xs={10}>
//                   <TextField
//                     fullWidth
//                     label={`Class Name ${index + 1}`}
//                     value={className}
//                     onChange={(e) => handleArrayChange(e, index, 'classNames')}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={2}>
//                   {examData.classNames.length > 1 && (
//                     <IconButton onClick={() => removeArrayItem(index, 'classNames')} color="error">
//                       <RemoveCircleOutline />
//                     </IconButton>
//                   )}
//                 </Grid>
//               </Grid>
//             ))}
//             <Button
//               variant="outlined"
//               startIcon={<AddCircleOutline />}
//               onClick={() => addArrayItem('classNames')}
//             >
//               Add Class
//             </Button>
//           </Box>

//           {/* Sections */}
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               Sections
//             </Typography>
//             {examData.sections.map((section, index) => (
//               <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
//                 <Grid item xs={10}>
//                   <TextField
//                     fullWidth
//                     label={`Section ${index + 1}`}
//                     value={section}
//                     onChange={(e) => handleArrayChange(e, index, 'sections')}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={2}>
//                   {examData.sections.length > 1 && (
//                     <IconButton onClick={() => removeArrayItem(index, 'sections')} color="error">
//                       <RemoveCircleOutline />
//                     </IconButton>
//                   )}
//                 </Grid>
//               </Grid>
//             ))}
//             <Button
//               variant="outlined"
//               startIcon={<AddCircleOutline />}
//               onClick={() => addArrayItem('sections')}
//             >
//               Add Section
//             </Button>
//           </Box>

//           {/* Term */}
//           <TextField
//             fullWidth
//             label="Term"
//             name="term"
//             value={examData.term}
//             onChange={handleInputChange}
//             required
//             sx={{ mb: 2 }}
//           />

//           {/* Subjects */}
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="h6" gutterBottom>
//               Subjects
//             </Typography>
//             {examData.subjects.map((subject, subjectIndex) => (
//               <Paper key={subjectIndex} elevation={2} sx={{ p: 2, mb: 2 }}>
//                 <TextField
//                   fullWidth
//                   label="Subject Name"
//                   name="name"
//                   value={subject.name}
//                   onChange={(e) => handleSubjectChange(e, subjectIndex)}
//                   required
//                   sx={{ mb: 2 }}
//                 />
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   onClick={() => removeSubject(subjectIndex)}
//                   disabled={examData.subjects.length === 1}
//                   sx={{ mb: 2 }}
//                 >
//                   Remove Subject
//                 </Button>

//                 {/* Assessments */}
//                 <Box sx={{ ml: 2 }}>
//                   <Typography variant="subtitle1" gutterBottom>
//                     Assessments
//                   </Typography>
//                   {subject.assessments.map((assessment, assessmentIndex) => (
//                     <Box key={assessmentIndex} sx={{ mb: 2 }}>
//                       <TextField
//                         fullWidth
//                         label="Assessment Name"
//                         name="name"
//                         value={assessment.name}
//                         onChange={(e) => handleAssessmentChange(e, subjectIndex, assessmentIndex)}
//                         required
//                         sx={{ mb: 1 }}
//                       />
//                       <TextField
//                         fullWidth
//                         label="Total Marks"
//                         name="totalMarks"
//                         type="number"
//                         value={assessment.totalMarks}
//                         onChange={(e) => handleAssessmentChange(e, subjectIndex, assessmentIndex)}
//                         required
//                         sx={{ mb: 1 }}
//                       />
//                       <TextField
//                         fullWidth
//                         label="Passing Marks"
//                         name="passingMarks"
//                         type="number"
//                         value={assessment.passingMarks}
//                         onChange={(e) => handleAssessmentChange(e, subjectIndex, assessmentIndex)}
//                         sx={{ mb: 1 }}
//                       />
//                       <TextField
//                         fullWidth
//                         label="Start Time"
//                         name="startTime"
//                         type="datetime-local"
//                         value={assessment.startTime}
//                         onChange={(e) => handleAssessmentChange(e, subjectIndex, assessmentIndex)}
//                         InputLabelProps={{ shrink: true }}
//                         sx={{ mb: 1 }}
//                       />
//                       <TextField
//                         fullWidth
//                         label="End Time"
//                         name="endTime"
//                         type="datetime-local"
//                         value={assessment.endTime}
//                         onChange={(e) => handleAssessmentChange(e, subjectIndex, assessmentIndex)}
//                         InputLabelProps={{ shrink: true }}
//                         sx={{ mb: 1 }}
//                       />
//                       {subject.assessments.length > 1 && (
//                         <Button
//                           variant="outlined"
//                           color="error"
//                           onClick={() => removeAssessment(subjectIndex, assessmentIndex)}
//                         >
//                           Remove Assessment
//                         </Button>
//                       )}
//                     </Box>
//                   ))}
//                   <Button
//                     variant="outlined"
//                     startIcon={<AddCircleOutline />}
//                     onClick={() => addAssessment(subjectIndex)}
//                   >
//                     Add Assessment
//                   </Button>
//                 </Box>
//               </Paper>
//             ))}
//             <Button
//               variant="outlined"
//               startIcon={<AddCircleOutline />}
//               onClick={addSubject}
//             >
//               Add Subject
//             </Button>
//           </Box>

//           {/* Start Date */}
//           <TextField
//             fullWidth
//             label="Start Date"
//             name="startDate"
//             type="date"
//             value={examData.startDate}
//             onChange={handleInputChange}
//             InputLabelProps={{ shrink: true }}
//             required
//             sx={{ mb: 2 }}
//           />

//           {/* End Date */}
//           <TextField
//             fullWidth
//             label="End Date"
//             name="endDate"
//             type="date"
//             value={examData.endDate}
//             onChange={handleInputChange}
//             InputLabelProps={{ shrink: true }}
//             required
//             sx={{ mb: 2 }}
//           />

//           {/* Result Publish Date */}
//           <TextField
//             fullWidth
//             label="Result Publish Date"
//             name="resultPublishDate"
//             type="date"
//             value={examData.resultPublishDate}
//             onChange={handleInputChange}
//             InputLabelProps={{ shrink: true }}
//             required
//             sx={{ mb: 2 }}
//           />

//           {/* Submit Button */}
//           <Box sx={{ textAlign: 'center', mt: 4 }}>
//             <Button type="submit" variant="contained" size="large">
//               Create Exam
//             </Button>
//           </Box>
//         </form>
//       </Paper>
//     </Container>
//   );
// };

// export default CreateExam;




// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";

// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import Select from "react-select";
// import Heading2 from "../../Dynamic/Heading2";
// import ViewExam from "./AllExams/ViewExam";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { AdminGetAllClasses, createExam } from "../../Network/AdminApi";
// import moment from "moment";

// export default function CreateExam() {
//   const { currentColor } = useStateContext();
//   const [showForm, setShowForm] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [examId, setExamId] = useState(null);
//   const [examCreated, setExamCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loader, setLoader] = useState(false);
//   const [modalFormData, setModalFormData] = useState({
//     examName: "",
//     examType: "",
//     className: "",
//     sections: [], // Changed to an array
//     startDate: "",
//     endDate: "",
//     Grade: "",
//     term: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
// console.log("modalFormData",modalFormData)
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSections, setAvailableSections] = useState([]); // sections
//   const [selectedSections, setSelectedSections] = useState([]); // multi select section
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState(
//     []
//   );
//   const [selectedSubjects, setSelectedSubjects] = useState([]);
//   const authToken = localStorage.getItem("token");

//   useEffect(() => {
//     getAllClass();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubjectChange = (index, field, value) => {
//     setModalFormData((prevData) => {
//       const updatedSubjects = [...prevData.subjects];
//       updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//       return { ...prevData, subjects: updatedSubjects };
//     });
//   };

//   const getAllClass = async () => {
//     // setIsLoader(true)
//     try {
//       const response = await AdminGetAllClasses();

//       if (response?.success) {
//         // setIsLoader(false)
//         let classes = response.classes.map((item) => ({
//           value: item._id,
//           label: item.className,
//           sections: item.sections, // Store sections here
//           subjects: item.subjects,
//         }));
//         setAvailableClasses(classes);
//       } else {
//         toast.error("Failed to fetch class list.");
//         setAvailableClasses([]);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);

//     // Update the form data with the selected class name
//     setModalFormData((prevData) => ({
//       ...prevData,
//       className: selectedOption?.label,
//     }));

//     // Set available sections based on the selected class
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

//     const subjectsString = selectedOption?.subjects;
//     const subjectsOptions = subjectsString?.map((subject) => ({
//       value: subject,
//       label: subject,
//     }));

//     setAvailableSubjectsForClass(subjectsOptions);
//   };

//   const handleSectionSelect = (selectedOptions) => {
//     setSelectedSections(selectedOptions);

//     const selectedSectionValues = selectedOptions
//       ? selectedOptions.map((option) => option.value)
//       : [];

//     setModalFormData((prevData) => ({
//       ...prevData,
//       sections: selectedSectionValues,
//     }));
//   };

//   const handleSubjectsSelect = (selectedOptions) => {
//     setSelectedSubjects(selectedOptions);
//     const newSubjects = selectedOptions.map((subject) => ({
//       name: subject.label,
//       examDate: "",
//       startTime: "",
//       endTime: "",
//       totalMarks: "",
//       passingMarks: "",
//       selectedMonths: [],
//     }));

//     setModalFormData((prevData) => ({
//       ...prevData,
//       subjects: newSubjects,
//     }));
//   };


//   const handleSubmit = async (e) => {
// console.log("modalFormDatamodalFormData",modalFormData)

//     e.preventDefault();
//     setLoader(true);
//     if (
//       !modalFormData?.examName ||
//       !modalFormData?.examType ||
//       !modalFormData?.className ||
//       // !modalFormData?.Grade ||
//       !modalFormData?.startDate ||
//       !modalFormData?.endDate ||
//       !modalFormData?.resultPublishDate ||
//       modalFormData?.subjects?.length === 0 ||
//       modalFormData?.sections?.length === 0 // Validation for sections
//     ) {
//       toast.error(
//         "Please fill in all the required fields, select at least one subject, and select at least one section!"
//       );
//       setLoading(false);
//       setLoader(false);
//       return;
//     }
//     // const sectionsString = modalFormData?.sections.join(',');
//     let payload = {
//       name: modalFormData?.examName,
//       examType: modalFormData?.examType,
//       classNames: [modalFormData?.className],
//       // section: sectionsString, // Send the array of sections
//       sections: modalFormData?.sections, // Send the array of sections
//       gradeSystem: modalFormData?.Grade,
//       startDate: modalFormData?.startDate,
//       endDate: modalFormData?.endDate,
//       resultPublishDate: modalFormData?.resultPublishDate,
//       // subjects: modalFormData?.subjects,
//       "term": modalFormData?.term,
//       subjects: modalFormData?.subjects.map((val)=>({
        
//           "name": val?.name,
//           "assessments": [
//               {
//                   "name":val?.examName,
//                   "totalMarks": val?.totalMarks,
//                   "examDate": val?.examDate,
//                   "startTime":val?.startTime,
//                   "endTime":val?.endTime,
//                    "passingMarks": val?.passingMarks,
//               }
//           ]
      
//       })),
//     };

//     console.log("payload",payload)
//     try {
//       const response = await createExam(payload);
//       console.log("response", response);
//       if (response.success) {
//         toast.success("Exam created successfully!");
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     } finally {
//       setLoader(false); // Ensure loader is disabled after the API call completes
//     }
//   };

//   return (
//     <div className="px-5">
//       <Heading2 title={"CREATE EXAMS"}></Heading2>

//       <div className=" mx-auto  ">
//         <form onSubmit={handleSubmit}>
//           <div className=" flex flex-wrap gap-x-2 gap-y-0  mx-auto">
//             <ReactInput
//               type="text"
//               name="examName"
//               required={true}
//               onChange={handleInputChange}
//               value={modalFormData?.examName}
//               label="Exam Name"
//             />
//             <ReactInput
//               type="text"
//               name="examType"
//               required={true}
//               onChange={handleInputChange}
//               value={modalFormData?.examType}
//               label="Exam Type"
//             />
//             <ReactInput
//               type="text"
//               name="term"
//               required={true}
//               onChange={handleInputChange}
//               value={modalFormData?.term}
//               label="Term"
//             />
//             {/* <ReactSelect
//               name="examType"
//               value={modalFormData?.examType}
//               handleChange={handleInputChange}
//               label="Exam Type"
//               dynamicOptions={[
//                 { label: "TERM", value: "Term" },
//                 { label: "UNIT_TEST", value: "Unit Test" },
//                 { label: "FINAL", value: "Final" },
//                 { label: "ENTRANCE", value: "Entrance" },
//                 { label: "COMPETITIVE", value: "Competitive" },
//               ]}
//             /> */}
//             <ReactSelect
//               name="Grade"
//               value={modalFormData?.Grade}
//               handleChange={handleInputChange}
//               label="Grade"
//               dynamicOptions={[
//                 { label: "Percentage", value: "Percentage" },
//                 { label: "Grade", value: "Grade" },
//                 { label: "CGPA", value: "CGPA" },
//               ]}
//             />
//             <ReactInput
//               name="startDate"
//               type="date"
//               required={true}
//               value={modalFormData?.startDate}
//               onChange={handleInputChange}
//               label=" Start Date"
//             />
//             <ReactInput
//               name="endDate"
//               type="date"
//               required={true}
//               value={modalFormData?.endDate}
//               onChange={handleInputChange}
//               label="End Date"
//             />
//             <ReactInput
//               name="resultPublishDate"
//               type="date"
//               required={true}
//               value={modalFormData?.resultPublishDate}
//               onChange={handleInputChange}
//               label="Result Publish Date"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 bg-blue-400 gap-2 p-1">
//             <div className="">
//               <div className="flex justify-between items-center ">
//                 <h3 className="text-lg font-bold text-gray-800">
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
//                 isClearable // Allow clearing the selected class
//                 styles={{
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     border: "none",
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

//             {/* Multiple Section Select */}
//             <div className="">
//               <div className="flex justify-between items-center ">
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Select Sections
//                 </h3>
//               </div>
//               <Select
//                 options={availableSections}
//                 value={selectedSections}
//                 onChange={handleSectionSelect}
//                 placeholder="Select Sections"
//                 isMulti // Enable multiple selection
//                 isSearchable
//                 menuPlacement="auto"
//                 menuPosition="fixed"
//                 styles={{
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     border: "none",
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

//             <div>
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Select Subjects
//                 </h3>
//               </div>

//               <Select
//                 options={availableSubjectsForClass}
//                 value={selectedSubjects}
//                 onChange={handleSubjectsSelect}
//                 placeholder="Select Subjects"
//                 isMulti
//                 isSearchable
//                 menuPlacement="auto"
//                 menuPosition="fixed"
//                 styles={{
//                   // Custom Styling for react-select
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     border: "none",
//                     outline: "none",
//                     borderRadius: "0.25rem",
//                     "&:hover": {
//                       borderColor: state.isFocused
//                         ? "rgba(0, 0, 0, 0.2)"
//                         : baseStyles.borderColor,
//                     },
//                   }),
//                   menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }), // Ensure menu overlays other content
//                 }}
//               />
//             </div>
//           </div>

//           {modalFormData?.subjects?.map((subject, index) => (
//             <div
//               key={index}
//               className="mt-2 flex flex-wrap gap-3 px-2  mx-auto  rounded-md border-2 border-gray-800"
//             >
//               <div>
//                 <label className="block text-[#ec6031] text-sm font-bold mb-2">
//                   {subject?.name}
//                 </label>
//               </div>
//               <div className="w-[100px]">
//                 <label
//                   htmlFor={`examName-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   exam Name:
//                 </label>
//                 <input
//                   type="text"
//                   id={`examName-${index}`}
//                   name="examName"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "examName", e.target.value)
//                   }
//                   value={subject.examName}
//                   placeholder="examName"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"
//                 />
//               </div>

//               <div className="w-[140px]">
//                 <label
//                   htmlFor={`examDate-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Exam Date:
//                 </label>
//                 <input
//                   type="date"
//                   id={`examDate-${index}`}
//                   name="examDate"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "examDate", e.target.value)
//                   }
//                   value={subject?.examDate}
//                   placeholder="Exam Date"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"
//                 />
//               </div>

//               <div className="w-[100px]">
//                 <label
//                   htmlFor={`startTime-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Start Time:
//                 </label>
//                 <input


// type="datetime-local"
// value={moment(subject?.startTime).format("YYYY-MM-DDTHH:mm")}
// onChange={(e) =>
//   handleSubjectChange(index, "startTime", moment(e.target.value).toISOString())
// }
//                   // type="time"
//                   id={`startTime-${index}`}
//                   name="startTime"
//                   required={true}
//                   // onChange={(e) =>
//                   //   handleSubjectChange(index, "startTime", e.target.value)
//                   // }
//                   // value={subject?.startTime}
//                   placeholder="Start Time"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"
//                 />
//               </div>
//               <div className="w-[100px]">
//                 <label
//                   htmlFor={`endTime-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   End Time:
//                 </label>
//                 <input
//                 type="datetime-local"
//                 value={moment(subject?.endTime).format("YYYY-MM-DDTHH:mm")}
//                 onChange={(e) =>
//                   handleSubjectChange(index, "endTime", moment(e.target.value).toISOString())
//                 }
//                   // type="time"
//                   id={`endTime-${index}`}
//                   name="endTime"
//                   required={true}
//                   // onChange={(e) =>
//                     // handleSubjectChange(index, "endTime", e.target.value)
//                   // }
//                   // value={subject?.endTime}
//                   placeholder="End Time"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"
//                 />
//               </div>

//               <div className="w-[100px]">
//                 <label
//                   htmlFor={`totalMarks-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Total Marks:
//                 </label>
//                 <input
//                   type="number"
//                   id={`totalMarks-${index}`}
//                   name="totalMarks"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "totalMarks", e.target.value)
//                   }
//                   value={subject.totalMarks}
//                   placeholder="Total Marks"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor={`passingMarks-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Passing Marks:
//                 </label>
//                 <input
//                   type="number"
//                   id={`passingMarks-${index}`}
//                   name="passingMarks"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "passingMarks", e.target.value)
//                   }
//                   value={subject.passingMarks}
//                   placeholder="Passing Marks"
//                   className="shadow  w-[100px] appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none"
//                 />
//               </div>
//             </div>
//           ))}

//           <div className="flex items-center justify-center gap-2 mt-2">
//             <button
//               type="submit"
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               {loading
//                 ? editMode
//                   ? "Updating Exam..."
//                   : "Saving Exam..."
//                 : editMode
//                 ? "Update Exam"
//                 : "Save Exam"}
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowForm(false)}
//               className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md focus:outline-none"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//       <ViewExam loader={loader} />
//     </div>
//   );
// }



// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import axios from "axios";

// import { toast } from "react-toastify";
// import { FaPlus, FaTimesCircle } from "react-icons/fa";
// import Select from "react-select";
// import Heading2 from "../../Dynamic/Heading2";
// import ViewExam from "./AllExams/ViewExam";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { AdminGetAllClasses, createExam } from "../../Network/AdminApi";
// export default function CreateExam() {
//   const { currentColor } = useStateContext();
//   const [showForm, setShowForm] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [examId, setExamId] = useState(null);
//   const [examCreated, setExamCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loader,setLoader]=useState(false)
//   const [modalFormData, setModalFormData] = useState({
//     examName: "",
//     examType: "",
//     className: "",
//     section: "",
//     startDate: "",
//     endDate: "",
//     Grade: "",
//     resultPublishDate: "",
//     subjects: [],
//   });
//    const [availableSections, setAvailableSections] = useState([]);
//  const [selectedSection, setSelectedSection] = useState(""); 
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(null);
//   const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState(
//     []
//   );
//   const [selectedSubjects, setSelectedSubjects] = useState([]);
//   const authToken = localStorage.getItem("token");

//   useEffect(() => {
//     // if (showForm) {
//       // fetchAllClasses();
//     // }
//   }, []);
// //   }, [showForm]);

//   const handleEditExam = (exam) => {
//     console.log("exam", exam);
//     setEditMode(true);
//     setExamId(exam?._id);
//     setShowForm(true);
//     setModalFormData({
//       examName: exam?.name || "",
//       examType: exam?.examType || "",
//       className: exam?.className || "",
//       section: exam?.section || "",
//       startDate: exam?.startDate || "",
//       endDate: exam?.endDate || "",
//       Grade: exam?.gradeSystem || "",
//       resultPublishDate: exam?.resultPublishDate || "",
//       subjects:
//         exam?.subjects?.map((subject) => ({
//           name: subject?.name,
//           examDate: subject?.examDate,
//           startTime: subject?.startTime,
//           endTime: subject?.endTime,
//           totalMarks: subject?.totalMarks,
//           passingMarks: subject?.passingMarks,
//           selectedMonths: subject?.selectedMonths || [],
//         })) || [],
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setModalFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleSubjectChange = (index, field, value) => {
//     setModalFormData((prevData) => {
//       const updatedSubjects = [...prevData.subjects];
//       updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
//       return { ...prevData, subjects: updatedSubjects };
//     });
//   };

//   const getAllClass = async()=>{
//       // setIsLoader(true)
//     try {
  
//       const response =await AdminGetAllClasses()
  
//       if(response?.success){
//         // setIsLoader(false)
//         let classes = response.classes.map((item) => ({
//           value: item._id,
//           label: item.className,
//           subjects: item.subjects,
//         }));
//         setAvailableClasses(classes);
//       } else {
//         toast.error("Failed to fetch class list.");
//         setAvailableClasses([]);
//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//     }
  
//     useEffect(()=>{
//       getAllClass()
//     },[])
//   const handleClassSelect = (selectedOption) => {
//     setSelectedClass(selectedOption);
//     const subjectsString = selectedOption.subjects;
   
//     const subjectsOptions = subjectsString.map((subject) => ({
//       value: subject,
//       label: subject,
//     }));

//     setAvailableSubjectsForClass(subjectsOptions);
//     setModalFormData((prevData) => ({
//       ...prevData,
//       className: selectedOption.label,
//     }));
//   };
//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value); // Update the selectedSection state
//   };

//   const DynamicSection = availableSections?.map((item) => ({
//     label: item,
//     value: item,
//   }));
//   const handleSubjectsSelect = (selectedOptions) => {
//     setSelectedSubjects(selectedOptions);
//     const newSubjects = selectedOptions.map((subject) => ({
//       name: subject.label,
//       examDate: "",
//       startTime: "",
//       endTime: "",
//       totalMarks: "",
//       passingMarks: "",
//       selectedMonths: [],
//     }));

//     setModalFormData((prevData) => ({
//       ...prevData,
//       subjects: newSubjects,
//     }));
//   };
//   const handleOpenForm = () => {
//     setShowForm(true);
//     setEditMode(false);
//     setModalFormData({
//       examName: "",
//       examType: "",
//       className: "",
//       section: "",
//       startDate: "",
//       endDate: "",
//       Grade: "",
//       resultPublishDate: "",
//       subjects: [],
//     });
//     setSelectedSubjects([]);
//     setSelectedClass(null);
//     setAvailableSubjectsForClass([]);
//   };

//   const handleSubmit=async(e)=>{
//     e.preventDefault();
//     setLoader(true)
//     if (
//       !modalFormData?.examName ||
//       !modalFormData?.examType ||
//       !modalFormData?.className ||
//       !modalFormData?.Grade ||
//       !modalFormData?.startDate ||
//       !modalFormData?.endDate ||
//       !modalFormData?.resultPublishDate ||
//       modalFormData?.subjects?.length === 0
//     ) {
//       toast.error(
//         "Please fill in all the required fields and select at least one subject!"
//       );
//       setLoading(false);
//       setLoader(false)
//       return;
//     }
//     let payload = {
//       name: modalFormData?.examName,
//       examType: modalFormData?.examType,
//       className: modalFormData?.className,
//       // section: "A",
//       gradeSystem: modalFormData?.Grade,
//       startDate: modalFormData?.startDate,
//       endDate: modalFormData?.endDate,
//       resultPublishDate: modalFormData?.resultPublishDate,
//       subjects: modalFormData?.subjects,
//     };

//     try {
//       const response= await createExam(payload)
//       console.log("response",response)
//       if (response.success) {
//         toast.success("Exam created successfully!");
//       }
//       else{
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//   }

//   return (
//     <div className="px-5">
//       <Heading2 title={"CREATE EXAMS"}></Heading2>

//       <div className=" mx-auto  ">
//         <form onSubmit={handleSubmit}
//         //  className="space-y-4"
//          >
//         <div className=" flex flex-wrap gap-x-2 gap-y-0  mx-auto">
//         {/* <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4  gap-4 px-4 mx-auto rounded-md"> */}
//           {/* <div className="mt-2 grid  grid-cols-1 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-6  gap-3 px-2  mx-auto bg-gray-100 rounded-md "> */}
//             <ReactInput
//               type="text"
//               //  id="examName"
//               name="examName"
//               required={true}
//               onChange={handleInputChange}
//               value={modalFormData?.examName}
//               label="Exam Name"
//             />
//             <ReactSelect
//               name="examType"
//               value={modalFormData?.examType}
//               handleChange={handleInputChange}
//               label="Exam Type"
//               dynamicOptions={[
//                 { label: "TERM", value: "Term" },
//                 { label: "UNIT_TEST", value: "Unit Test" },
//                 { label: "FINAL", value: "Final" },
//                 { label: "ENTRANCE", value: "Entrance" },
//                 { label: "COMPETITIVE", value: "Competitive" },
//               ]}
//             />
//             <ReactSelect
//               name="Grade"
//               value={modalFormData?.Grade}
//               handleChange={handleInputChange}
//               label="Grade"
//               dynamicOptions={[
//                 { label: "Percentage", value: "Percentage" },
//                 { label: "Grade", value: "Grade" },
//                 { label: "CGPA", value: "CGPA" },
                
//               ]}
//             />
//             <ReactInput
//               name="startDate"
//               type="date"
//               required={true}
//               value={modalFormData?.startDate}
//               onChange={handleInputChange}
//               label=" Start Date"
            
//             />
//             <ReactInput
//               name="endDate"
//               type="date"
//               required={true}
//               value={modalFormData?.endDate}
//               onChange={handleInputChange}
//               label="End Date"
            
//             />
//             <ReactInput
//               name="resultPublishDate"
//               type="date"
//               required={true}
//               value={modalFormData?.resultPublishDate}
//               onChange={handleInputChange}
//               label="Result Publish Date"
            
//             />
          
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 bg-blue-400 gap-2 p-1">
//             <div className="">
//               <div className="flex justify-between items-center ">
//                 <h3 className="text-lg font-bold text-gray-800">
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
//                 styles={{
//                   // Custom Styling for react-select
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     border: "none",
//                     outline: "none",
//                     borderRadius: "0.25rem",
//                     "&:hover": {
//                       borderColor: state.isFocused
//                         ? "rgba(0, 0, 0, 0.2)"
//                         : baseStyles.borderColor,
//                     },
//                   }),
//                   menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }), // Ensure menu overlays other content
//                 }}
//               />
//             </div>
//             <div className="">
//               <div className="flex justify-between items-center ">
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Select section
//                 </h3>
//               </div>

//               <Select
//                 options={DynamicSection}
//                 value={selectedSection}
//                 onChange={handleClassSelect}
//                 placeholder="Select section"
//                 isSearchable
//                 menuPlacement="auto"
//                 menuPosition="fixed"
//                 styles={{
//                   // Custom Styling for react-select
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     border: "none",
//                     outline: "none",
//                     borderRadius: "0.25rem",
//                     "&:hover": {
//                       borderColor: state.isFocused
//                         ? "rgba(0, 0, 0, 0.2)"
//                         : baseStyles.borderColor,
//                     },
//                   }),
//                   menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }), // Ensure menu overlays other content
//                 }}
//               />
//             </div>

//             <div>
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Select Subjects
//                 </h3>
//               </div>

//               <Select
//                 options={availableSubjectsForClass}
//                 value={selectedSubjects}
//                 onChange={handleSubjectsSelect}
//                 placeholder="Select Subjects"
//                 isMulti
//                 isSearchable
//                 menuPlacement="auto"
//                 menuPosition="fixed"
//                 styles={{
//                   // Custom Styling for react-select
//                   control: (baseStyles, state) => ({
//                     ...baseStyles,
//                     boxShadow: state.isFocused
//                       ? "0 0 0 1px rgba(0, 0, 0, 0.1)"
//                       : baseStyles.boxShadow,
//                     border: "none",
//                     outline: "none",
//                     borderRadius: "0.25rem",
//                     "&:hover": {
//                       borderColor: state.isFocused
//                         ? "rgba(0, 0, 0, 0.2)"
//                         : baseStyles.borderColor,
//                     },
//                   }),
//                   menu: (baseStyles) => ({ ...baseStyles, zIndex: 10 }), // Ensure menu overlays other content
//                 }}
//               />
//             </div>
//           </div>

//           {modalFormData?.subjects?.map((subject, index) => (
//             <div
//               key={index}
//               className="mt-2 flex flex-wrap gap-3 px-2  mx-auto  rounded-md border-2 border-gray-800"
//               // className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto  rounded-md "
//             >
//               <div>
//                 <label className="block text-[#ec6031] text-sm font-bold mb-2">
//                   {subject?.name}
//                 </label>
//               </div>

//               <div className="w-[140px]">
//                 <label
//                   htmlFor={`examDate-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Exam Date:
//                 </label>
//                 <input
//                   type="date"
//                   id={`examDate-${index}`}
//                   name="examDate"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "examDate", e.target.value)
//                   }
//                   value={subject?.examDate}
//                   placeholder="Exam Date"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none" // Custom styling
//                 />
//               </div>

//               <div className="w-[100px]">
//                 <label
//                   htmlFor={`startTime-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Start Time:
//                 </label>
//                 <input
//                   type="time"
//                   id={`startTime-${index}`}
//                   name="startTime"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "startTime", e.target.value)
//                   }
//                   value={subject?.startTime}
//                   placeholder="Start Time"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none" // Custom styling
//                 />
//               </div>
//               <div className="w-[100px]">
//                 <label
//                   htmlFor={`endTime-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   End Time:
//                 </label>
//                 <input
//                   type="time"
//                   id={`endTime-${index}`}
//                   name="endTime"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "endTime", e.target.value)
//                   }
//                   value={subject?.endTime}
//                   placeholder="End Time"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none" // Custom styling
//                 />
//               </div>

//               <div className="w-[100px]">
//                 <label
//                   htmlFor={`totalMarks-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Total Marks:
//                 </label>
//                 <input
//                   type="number"
//                   id={`totalMarks-${index}`}
//                   name="totalMarks"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "totalMarks", e.target.value)
//                   }
//                   value={subject.totalMarks}
//                   placeholder="Total Marks"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none" // Custom styling
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor={`passingMarks-${index}`}
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                 >
//                   Passing Marks:
//                 </label>
//                 <input
                
//                   type="number"
//                   id={`passingMarks-${index}`}
//                   name="passingMarks"
//                   required={true}
//                   onChange={(e) =>
//                     handleSubjectChange(index, "passingMarks", e.target.value)
//                   }
//                   value={subject.passingMarks}
//                   placeholder="Passing Marks"
//                   className="shadow  w-[100px] appearance-none border rounded  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-none outline-none" // Custom styling
//                 />
//               </div>
//             </div>
//           ))}

//           <div className="flex items-center justify-center gap-2 mt-2">
//             <button
//               type="submit"
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               {loading
//                 ? editMode
//                   ? "Updating Exam..."
//                   : "Saving Exam..."
//                 : editMode
//                 ? "Update Exam"
//                 : "Save Exam"}
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowForm(false)}
//               className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md focus:outline-none"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//       <ViewExam loader={loader}/>
//     </div>
//   );
// }
