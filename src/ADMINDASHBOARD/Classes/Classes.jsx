import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaEdit } from "react-icons/fa";
import { AdminGetAllClasses, createClass, deleteClassebyID } from "../../Network/AdminApi";
import Table from "../../Dynamic/Table";
import Modal from "../../Dynamic/Modal";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { Link } from "react-router-dom";
import Button from "../../Dynamic/utils/Button";

function Classes() {
  const { currentColor, setIsLoader } = useStateContext();
  const [formData, setFormData] = useState({
    className: "NURSERY",
    subjects: ["HINDI", "ENGLISH", "MATHS"],
    sections: ["A"],
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };


  const getclasses = async () => {
    setIsLoader(true)
    try {

      const response = await AdminGetAllClasses()
      if (response?.success) {

        setSubmittedData(response?.classes);
      }
      else {
        toast.error(response?.error)
      }

    } catch (error) {
      console.log("error", error)
    }
    finally {
      setIsLoader(false)
    }
  };

  useEffect(() => {
    getclasses()
  }, [])


  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(() => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoader(true)

      // Ensure subjects and sections are arrays before converting to strings
      const formattedFormData = {
        ...formData,
        subjects: Array.isArray(formData.subjects)
          ? formData.subjects.join(",")
          : formData.subjects,
        sections: Array.isArray(formData.sections)
          ? formData.sections.join(",")
          : formData.sections,
      };

      const response = await createClass(formattedFormData)
    
      if (response?.success) {
        setIsLoader(false)
        toast.success(response?.message)
        setIsOpen(false);
        getclasses()
      }
      else{
        toast.error(response?.message)
      }

    } catch (error) {
      console.error("Error:", error);

    }
    finally {
      setIsLoader(false)
    }
  };

  const handleDelete = async (classId) => {
    try {
      const response = await deleteClassebyID(classId);
      if (response?.success) {
        toast.success(response?.message);
        getclasses()
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "class", label: "Class", width: "7" },
    { id: "section", label: "section", width: "7" },
    { id: "subject", label: "Subject" },
    { id: "action", label: "Action" },
  ];
 
  const tBody = submittedData.map((val, ind) => ({
    SN: ind + 1,
    class: val?.className,
    section: val.sections?.map((item) => <span>{item},</span>),
    subject: val.subjects?.map((item) => <span>{item},</span>),
   action: (<div className="flex gap-5">
      <Link to={`/admin/classes/edit-classes/${val?.classId}`}>
        <FaEdit className="text-[20px] text-yellow-800" />
      </Link>
      {/* <span onClick={() => handleDelete(val?.classId)} className="cursor-pointer">
        <MdDelete className="text-[20px] text-red-700" />
      </span> */}

    </div>
    ),
  }));
  return (
    <>
      {/* <h1
        className="text-xl font-bold mb-4 uppercase text-center hover-text"
        style={{ color: currentColor }}
      >
        Class
      </h1> */}
      <Button
        onClick={toggleModal}
        name="Add Class"
        // variant="contained"
        // style={{ color: "white", backgroundColor: currentColor }}
      >
        
      </Button>
      <Modal
        setIsOpen={() => setIsOpen(false)}
        isOpen={isOpen} title={"Create Class"} maxWidth="100px">
        <div className=" px-4 py-2 text-center gap-y-3 ">
          <div className="my-2">
          <ReactSelect
            name="className"
            value={formData?.className}
            handleChange={handleFieldChange}
            label="class"
            dynamicOptions={[
              { label: "KG", value: "KG" },
              { label: "Extra class", value: "Extra class" },
              { label: "NURSERY", value: "NURSERY" },
              { label: "LKG", value: "LKG" },
              { label: "UKG", value: "UKG" },
              { label: "I", value: "I" },
              { label: "II", value: "II" },
              { label: "III", value: "III" },
              { label: "IV", value: "IV" },
              { label: "V", value: "V" },
              { label: "VI", value: "VI" },
              { label: "VII", value: "VII" },
              { label: "VIII", value: "VIII" },
              { label: "IX", value: "IX" },
              { label: "X", value: "X" },
              { label: "XI", value: "XI" },
              { label: "XII", value: "XII" },
            ]}
          />
          </div>
        <div className="my-5">
        <ReactInput
            type="text"
            name="subjects"
            // required={true}
            label="Subjects"
            onChange={handleFieldChange}
            value={Array.isArray(formData.subjects)
              ? formData.subjects.join(",")
              : formData.subjects}
          />
        </div>
          <ReactInput
            type="text"
            name="sections"
            // required={true}
            label="Sections"
            onChange={handleFieldChange}
            value={Array.isArray(formData.sections)
              ? formData.sections.join(",")
              : formData.sections}
          />
          <div className="flex items-center gap-5  border-t border-gray-200 rounded-b dark:border-gray-600">
            <Button
              // type="submit"
              name="Submit"
              // // variant="contained"
              onClick={handleSubmit}
              // // style={{
              // //   backgroundColor: currentColor,
              // //   color: "white",
              // //   width: "100%",
              // }}
            > 

            </Button>
            <Button
              // variant="contained"
              onClick={toggleModal}
              // style={{
              //   backgroundColor: "#616161",
              //   color: "white",
              //   width: "100%",
              // }}
              name="Cancel"
            >
              
            </Button>
          </div>
        </div>
      </Modal>

      <div>
        <Table tHead={THEAD} tBody={tBody} />

      </div>
    </>
  );
}

export default Classes;
