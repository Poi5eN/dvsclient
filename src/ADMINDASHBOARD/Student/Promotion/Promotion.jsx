import React, { useCallback, useEffect, useState } from 'react';
import {
  ActiveStudents,
  adminapproveAdmissions,
  AdminGetAllClasses,
  promotionOfStudent
} from '../../../Network/AdminApi';
import Table from '../../../Dynamic/Table';
import Button from '../../../Dynamic/utils/Button';
import { toast } from 'react-toastify';
import { useStateContext } from '../../../contexts/ContextProvider';
import { ReactSelect } from '../../../Dynamic/ReactSelect/ReactSelect';

const Promotion = () => {
  const { currentColor, setIsLoader } = useStateContext();
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [studentDetails, setStudentDetails] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  // State separation for clarity
  const [fromClass, setFromClass] = useState(null);
  const [fromSection, setFromSection] = useState(null);
  const [toClass, setToClass] = useState(null);
  const [toSection, setToSection] = useState(null);
  const [values,setValues]=useState(
    {
      toClass:"",
      toSection:"",
      fromClass:"",
      fromSection:""
    }
  )
console.log("toSection",toSection)
  const studentData = async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      if (response?.success) {
        setStudentDetails(response?.students?.data?.reverse());
      } else {
        console.log('No data found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoader(false);
    }
  };

  const fetchAllClasses = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        setGetClass(response.classes || []);
      } else {
        toast.error(response?.message || "Failed to fetch classes.");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("An error occurred while fetching classes.");
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]);

  useEffect(() => {
    studentData();
    fetchAllClasses();
  }, []);


  const filterStudents = (cls, sec) => {
    const filtered = studentDetails.filter((student) => {
      const matchClass = cls ? student.class === cls : true;
      const matchSection = sec ? student.section === sec : true;
      return matchClass && matchSection;
    });
    setFilteredStudents(filtered);
  };
  
  const handleFromClassChange = (e) => {
    const selected = e.target.value;
    setValues((prev)=>({
...prev,
fromClass:selected
    }))
    setFromClass(selected);
    const classObj = getClass.find((cls) => cls.className === selected);
    setAvailableSections(classObj?.sections || []);
    filterStudents(selected, fromSection);
  };
  
  const handleFromSectionChange = (e) => {
    console.log("first e",e)
    const selected = e.target.value;
    // setFromSection(selected);
    // filterStudents(fromClass, selected);
    setValues((prev)=>({
      ...prev,
      fromSection:selected
          }))
  };
  

  // const handleFromSectionChange = (e) => setFromSection(e.target.value);

  const handleToClassChange = (e) => {
    const selected = e.target.value;
    setToClass(selected);
    setValues((prev)=>({
      ...prev,
      toClass:selected
          }))
    const classObj = getClass.find((cls) => cls.className === selected);
    setAvailableSections(classObj?.sections || []);
  };

  const handleToSectionChange = (e) =>{
    const selected = e.target.value;
    // console.log("first",name,value)
    setValues((prev)=>({
      ...prev,
    toSection:selected
          }))
    // setToSection(e.target.value)
  };


  const handleSelectAllChange = () => {
    if (!selectAll) {
      const allStudentIds = studentDetails.map((student) => student._id);
      setSelectedStudent(allStudentIds);
    } else {
      setSelectedStudent([]);
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudent((prevSelected) =>
      prevSelected.includes(studentId)
        ? prevSelected.filter((id) => id !== studentId)
        : [...prevSelected, studentId]
    );
  };

  useEffect(() => {
    setSelectAll(
      studentDetails.length > 0 &&
        selectedStudent.length === studentDetails.length
    );
  }, [studentDetails, selectedStudent]);



  const handlePromoteClick = async () => {
    if (selectedStudent.length === 0) {
      toast.error("No students selected for promotion");
      return;
    }

    if (!values?.toClass || !values?.toSection) {
      toast.error("Please select both class and section for promotion");
      return;
    }
    setIsLoader(true)
    const dataToUpdate = {
      students: selectedStudent,
      promotedClass: values?.toClass,
      promotedSection:values?.toSection
    };

    try {
      const response = await promotionOfStudent(dataToUpdate);
      if (response?.success) {
        toast.success(response?.message);
        studentData();
        setValues({})

        setFilteredStudents([])
        setIsLoader(false)
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Student promotion failed");
      console.error("Promotion Failed:", error);
    }
  };

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className
  }));

  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item
  }));

  const THEAD = [
    {
      id: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAllChange}
        />
      )
    },
    { id: 'SN', label: 'S No.' },
    { id: 'admissionNumber', label: 'Admission No' },
    { id: 'fullName', label: 'Name' },
    { id: 'guardianName', label: 'Father Name' },
    { id: 'gender', label: 'Gender' },
    { id: 'class', label: 'Class' },
    { id: 'section', label: 'Section' },
    { id: 'contact', label: 'Contact' },
   
  ];

  // const filteredStudents = studentDetails.filter(student =>
  //   (!fromClass || student.class === fromClass) &&
  //   (!fromSection || student.section === fromSection)
  // );

  const tBody = filteredStudents.map((val, ind) => ({
    select: (
      <input
        type="checkbox"
        checked={selectedStudent.includes(val._id)}
        onChange={() => handleCheckboxChange(val._id)}
      />
    ),
    SN: ind + 1,
    admissionNumber: (
      <span className="text-red-700 font-semibold">
        {val.admissionNumber}
      </span>
    ),
    fullName: val.studentName,
    guardianName: val.fatherName,
    gender: val.gender,
    class: val.class,
    section: val.section,

    contact: val.contact,

  }));

  return (
    <>
     
      <div className="flex flex-wrap gap-8 mt-4">
        <div>
          <span className="font-semibold">From</span>
          <ReactSelect
            name="fromClass"
            label="Select a Class"
            value={values?.fromClass}
            // value={fromClass}
            handleChange={(e)=>handleFromClassChange(e)}
            dynamicOptions={dynamicOptions}
          />

          <ReactSelect
  name="fromSection"
  label="Section"
  value={values?.fromSection}  // 👈 Fix here
  // value={DynamicSection.find(opt => opt.value === fromSection)}  // 👈 Fix here
  handleChange={(e) => handleFromSectionChange(e)}
  dynamicOptions={DynamicSection}
/>
        </div>
        <div>
          <span className="font-semibold">To</span>
          <ReactSelect
            name="toClass"
            label="Select a Class"
            value={values?.toClass}
            // value={toClass}
            handleChange={handleToClassChange}
            dynamicOptions={dynamicOptions}
          />
          <ReactSelect
            name="toSection"
            label="Section"
            value={values?.toSection}
            handleChange={(e)=>handleToSectionChange(e)}
            dynamicOptions={DynamicSection}
          />
           <Button color="Green" name="Promote" onClick={handlePromoteClick} />
        </div>
       
      </div>
      <Table isSearch={false} tHead={THEAD} tBody={tBody} />
    </>
  );
};

export default Promotion;

