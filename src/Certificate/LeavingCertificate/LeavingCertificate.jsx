import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useStateContext } from "../../contexts/ContextProvider";
import Loading from "../../Loading";
import SomthingwentWrong from "../../SomthingwentWrong";
import useCustomQuery from "../../useCustomQuery";
import { useReactToPrint } from "react-to-print";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};



const LeavingCertificate = () => {
  const { currentColor } = useStateContext();
  const [filterName, setFilterName] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filteredStudentData, setFilterdStudentData] = useState([]);
  const componentPDF = useRef();
  // console.log("firstfilteredStudentData", filteredStudentData);
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    onBeforeGetContent: () => {
      document.title = ` SCHOOL LEAVING CERTIFICATE`;
    },
    onAfterPrint: () => {
      alert("modalData saved in PDF");
      setTimeout(() => {
        document.title = "OriginalTitle";
      }, 100);
    },
  });

  const [examData, setExamData] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const [studentData, setStudentData] = useState([]);

  const {
    queryData: admitCard,
    loading: admitCardLoading,
    error: admitCardError,
  } = useCustomQuery(
    "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
  );

  const {
    queryData: allExam,
    loading: allExamLoading,
    error: allExamError,
  } = useCustomQuery(
    "https://eserver-i5sm.onrender.com/api/v1/exam/getAllExams"
  );

  useEffect(() => {
    if (admitCard) {
      setStudentData(admitCard.allStudent);
      setFilterdStudentData(admitCard.allStudent);
    }
  }, [admitCard]);
  useEffect(() => {
    if (allExam) {
      setExamData(allExam.examData);
    
    }
  }, [allExam]);

  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
  };




  const handleFilterbyname = (e) => {
    const value = e.target.value;
    setFilterName(value);
    filterStudents(filterClass, value);
  };
  const handleFilterByClass = (e) => {
    let value = e.target.value;
    setFilterClass(value);
    filterStudents(value, filterName);
  };
  const filterStudents = (filterClass, nameFilter) => {
    let filteredData = studentData;

    if (filterClass) {
      filteredData = filteredData.filter((student) =>
        student.class.includes(filterClass.toLowerCase())
      );
    }
    // if (nameFilter) {
    //   filteredData = filteredData.filter((student) =>
    //     student.fullName.includes(nameFilter.toLowerCase())
    //   );
    // }
    if (nameFilter) {
      const nameFilterRegex = new RegExp(nameFilter, 'i'); // 'i' makes it case-insensitive
      filteredData = filteredData.filter((student) =>
        nameFilterRegex.test(student.fullName)
      );
    }
    setFilterdStudentData(filteredData);
   
  };



  const schoolName = sessionStorage.getItem("schoolName");
  const SchoolImage = sessionStorage.getItem("image");
  const SchoolEmail = sessionStorage.getItem("email");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const schoolContact = sessionStorage.getItem("contact");

  if (admitCardLoading) {
    return <Loading />;
  }

  if (admitCardError) {
    return <SomthingwentWrong />;
  }
  if (allExamLoading) {
    return <Loading />;
  }

  if (allExamError) {
    return <SomthingwentWrong />;
  }
  return (
    <>
      <div className="">
        <div className="mb-5">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                variant="standard"
                sx={{ m: 1, minWidth: 80, width: "100%" }}
              >
                <InputLabel id="demo-simple-select-standard-label">
                  Select Exam
                </InputLabel>
                <Select
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={selectedExam}
                  onChange={handleExamChange}
                  label="Select Exam"
                >
                  {examData.map((exam) => (
                    <MenuItem key={exam._id} value={exam.examName}>
                      {exam.examName} - class:{exam.className}
                      {exam.section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="filled-basic"
                label="searchBy class"
                variant="filled"
                type="text"
                onChange={handleFilterByClass}
                value={filterClass}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                id="filled-basic"
                label="filterBy Name"
                variant="filled"
                type="text"
                onChange={handleFilterbyname}
                value={filterName}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <Button
                variant="contained"
                onClick={generatePDF}
                style={{ backgroundColor: currentColor, width: "100%" }}
                className="h-12"
              >
                Download
              </Button>
            </Grid>
          </Grid>
        </div>
        {/* <h2 class="mt-6 text-2xl text-red-600">Leaving Certificate</h2> */}
        {
            filteredStudentData.map((student,index)=>(
                <div class="overflow-x-auto m-10 border-2 p-5" ref={componentPDF}>
                <div class="flex  inset-0 rounded-md z-50">
                  <div class="text-center mb-5">
                    <img
                      src={SchoolImage}
                      alt="Citi Ford School Logo"
                      class="w-36 h-36 mx-auto rounded-full"
                    />
                  </div>
                  <div class="w-7/12">
                    <h1 class="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">
                      {schoolName}
                    </h1>
                    <div class="text- leading-5 ">
                      <span class="block text-center mb-1 ">{schoolAddress}</span>
      
                      <span class="block text-center mb-1">
                        Email:- {SchoolEmail}
                        <br />
                        Contact :- {schoolContact}
                      </span>
                    </div>
                    <center>
          <h3 class="text-red-700 font-bold underline">[ SCHOOL LEAVING CERTIFICATE ]</h3>
        </center>
                  </div>
                </div>
                <div className="">
                  <table class="w-full text-sm text-left text-gray-500  ">
                    <tbody>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900   "
                        >
                          1. Student's Name
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2 ">
                          {student.fullName}
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          2. Sather's Name
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                        {student.fatherName}
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          3. Mother's Name
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                        {student.motherName}
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          4. Sex
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                        {student.gender}
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          5. Nationality
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                          rajah.armsdivong@yahoo.com
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          6. Date of birth
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                         {student.dateOfBirth}
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          7. Date of first admission width class
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                          
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          8. Date Of widithdrawal
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                         
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          9. Class in which the student last studied/studying
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                         
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          10. Whether qualified for pramotion to higher class if so ,
                          to class (in word)
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                         
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          11. Month upto which dive student has paid school dues
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                         
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          12. general Conduct
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                         
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          13. Date of application for Certificate
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                          
                        </div>
                      </div>
                      <div class="bg-white grid grid-cols-3 gap-4 ">
                        <div
                         
                          class="px-4  py-2   font-medium text-gray-900  "
                        >
                          14. Date of issue of Certificate
                        </div>
                        <div class="px-6  py-2  border-b-2 border-dashed font-medium border-slate-500 col-span-2">
                         
                        </div>
                      </div>
                    </tbody>
                  </table>
                  <div className="flex justify-between mt-5">
                    <div>
                      <p>
                        Date: <span className="font-bold underline">30/10/2012</span>
                      </p>
                    </div>
                    <div className="text-center">
                      <p>Signature of Headmaster/Headmistress</p>
                      <div className="w-32 border-b border-black mx-auto mt-7"></div>
                      <p className="mt-2">and official stamp</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
        }
       
      </div>
    </>
  );
};

export default LeavingCertificate;
