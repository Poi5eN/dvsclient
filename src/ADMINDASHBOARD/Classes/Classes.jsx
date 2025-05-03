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
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";

function Classes() {
  const { currentColor, setIsLoader } = useStateContext();
  const [formData, setFormData] = useState({
    className: "NUR",
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
      else {
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
      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="All Class" />
      <div
        className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2"

      >
        <Button
          onClick={toggleModal}
          name="Add Class"

        >

        </Button>
      </div>
      <Modal
        setIsOpen={() => setIsOpen(false)}
        isOpen={isOpen} title={"Create Class"} maxWidth="100px">
        <div className=" px-4 py-2 text-center gap-y-3 w-full flex flex-wrap">

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

        </div>
        <div className="mt-2 flex justify-end m-2 gap-5  border-t border-gray-200 rounded-b dark:border-gray-600">
          <Button
            // type="submit"
            name="Submit"
            // // variant="contained"
            onClick={handleSubmit}

          >

          </Button>
          <Button
            onClick={toggleModal}
            name="Cancel"
            color="gray"
          >
          </Button>
        </div>
      </Modal>

      <div>
        <Table tHead={THEAD} tBody={tBody} />

      </div>
    </>
  );
}

export default Classes;
