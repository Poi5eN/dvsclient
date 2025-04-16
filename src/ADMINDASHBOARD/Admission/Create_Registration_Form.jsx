import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./index.css";
import "../../../src/index.css";
import Switch from "@mui/material/Switch";
import "../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../contexts/ContextProvider";
import NoDataFound from "../../NoDataFound";
import { FormControlLabel } from "@mui/material";
import BulkAdmission from "./BulkAdmission";
import Button from "../../Dynamic/utils/Button";
import Table from "../../Dynamic/Table";
import { MdLocalPrintshop } from "react-icons/md";
import moment from "moment/moment";
import Modal from "../../Dynamic/Modal";
import Loading from "../../Loading";
import { AdminGetAllClasses, createStudentParent, GetAdmissions } from "../../Network/AdminApi";
import AdmissionPrint from "./AdmissionPrint"; // Import the component
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import Breadcrumbs from "../../components/Breadcrumbs ";
import AdmissionForm from "../../ShikshMitraWebsite/component/LoginPage/AdmissionForm";

function Create_Registration_Form() {
  const [refreshRegistrations,setRefreshRegistrations]=useState(false)
  const user = JSON.parse(localStorage.getItem("user"))
  const {  setIsLoader } = useStateContext();
  const [viewAdmision, setViewAdmision] = useState(false);
  const [sibling, setsibling] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState([]);
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState(""); // New state for selected section
  const [availableSections, setAvailableSections] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectStudent, setSelectStudent] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [whatsAppMsg, setWhatsAppMsg] = useState("");
  const [payload, setPayload] = useState({
    studentFullName: "",
    admissionNumber: "",
    studentContact: "",
    studentAddress: "",
    guardian_name: "",
    studentDateOfBirth: "",
    studentGender: "",
    studentClass: "",
    studentSection: "",
    studentImage: null, // CHANGED:  Initialize as null, not ""
    fatherName: "",
    motherName: "",
    parentAdmissionNumber: ""
  });

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

const newAdmission=async()=>{
    setIsLoader(true)
    try {
      const response= await GetAdmissions()
      if(response?.success){
        setIsLoader(false)
        setSubmittedData(response?.newAdmissions?.data?.reverse());
      }
      else{
        toast.error(response?.message)
        setIsLoader(false)
      }
    } catch (error) {
      console.log("error",error)
      setIsLoader(false)
    }
    finally{
      
    }
  }

  useEffect(() => {
    newAdmission();
  }, [refreshRegistrations]);

  const handleSubmit = async (e) => {

    const generateEmail = (name, contact) => {
      let emailPrefix = name.toLowerCase();
      emailPrefix = emailPrefix.replace(/[^a-z0-9]/g, "");
      const email = `${emailPrefix}${contact}@gmail.com`;
      return email;
    };
    const studentEmail = generateEmail(payload.studentFullName, payload.studentContact);
    const parentEmail = generateEmail(payload.fatherName, payload.studentContact);

    if (!selectedClass) {
      toast.warn("Please Select Class")
      return
    }
    if (!selectedSection) {
      toast.warn("Please Select Section")
      return
    }
    setIsLoader(true)
    e.preventDefault();
    const payloadData = {
      studentFullName: payload.studentFullName.charAt(0).toUpperCase() + payload.studentFullName.slice(1),
      studentEmail: studentEmail,
      studentPassword: payload.studentContact,
      studentDateOfBirth: payload.studentDateOfBirth ? moment(payload.studentDateOfBirth).format("DD MMMM YYYY") : "",
      studentGender: payload.studentGender ||"",
      studentJoiningDate: moment(Date.now()).format("DD MMMM YYYY") ||"",
      studentAddress: payload.studentAddress.charAt(0).toUpperCase() + payload.studentAddress.slice(1) ||"",
      studentContact: payload.studentContact ||"",
      studentClass: selectedClass ||"",
      studentSection: selectedSection ||"", // Use the selectedSection state
      fatherName:  payload.fatherName.charAt(0).toUpperCase() + payload.fatherName.slice(1) ||"",
      motherName:  payload.motherName.charAt(0).toUpperCase() + payload.motherName.slice(1) ||"",
      parentEmail: parentEmail ||"",
      parentPassword: payload.studentContact ||"",
      parentContact: payload.studentContact ||"",
      admissionNumber: "" ||"",
      parentAdmissionNumber: payload?.parentAdmissionNumber ||"",
      studentImage: payload.studentImage ||"",
    };

    const formDataToSend = new FormData();
    Object.entries(payloadData).forEach(([key, value]) => {
     
      if (key === "studentImage" && value) {
        formDataToSend.append(key, value);  // Append the file object directly
      } else {
        formDataToSend.append(key, String(value)); //convert all other values to string
      }

    });

    try {
      const response = await createStudentParent(formDataToSend)
      if (response?.success) {
        newAdmission()
        setWhatsAppMsg(response);
        setIsModalOpen(true);
        setIsLoader(false)
        toast.success(response?.message)
        toggleModal();
        setPayload({})
        setLoading(false);
        setModalOpen(false);
        setSelectedClass("");
        setSelectedSection("");
      }
      else {
        toast.error(response?.message)
        // setLoading(false);
        setIsLoader(false)
      }
    } catch (error) {
      console.log("error", error)
      setIsLoader(false)
      
    } finally {
      setIsLoader(false)
    }

  };

  const sendWhatsAppMessage = (val) => { // Add phoneNumber as an argument
    // Build the "card" as a string (styled with bold and monospace)
    const receiptCard = `
    ------------------------------------
        ✨ *Admission Receipt* ✨
    ------------------------------------
    *Admission No:* \`${val?.student?.admissionNumber}\`
    *Name:* \`${val?.student?.studentName}\`
    *Class:* \`${val?.student?.class}\`
    *Father Name:* \`${val.fatherName}\`
    ------------------------------------
                *Thank you!* 🙏
   Welcome To Our Family ${user?.schoolName}
    ------------------------------------
    `;
    const message = `*${user?.schoolName}*\n${user?.address}\n${user?.contact}\n${receiptCard}`; // Add intro text
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${val?.student?.contact}?text=${encodedMessage}`;
    window.open(whatsappURL, "_blank");
  };

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    const selectedClassObj = getClass?.find(
      (cls) => cls.className === selectedClassName
    );

    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections);

    } else {
      setAvailableSections([]);
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value); // Update the selectedSection state
  };

  const handleFilterClassChange = (e) => {
    setFilterClass(e.target.value);
  };

  const getAllClass = async () => {
    // setIsLoader(true)
    try {

      const response = await AdminGetAllClasses()
      if (response?.success) {
        // setIsLoader(false)
        let classes = response.classes;
        setGetClass(classes.sort((a, b) => a - b));
      }
    } catch (error) {
      console.log("error")
    }
  }

  useEffect(() => {
    getAllClass()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPayload({
        ...payload,
        studentImage: file,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload(() => ({
      ...payload,
      [name]: value,
    }));
  };

  const filteredData = filterClass
    ? submittedData?.filter((item) => item.class === filterClass)
    : submittedData;

  const handlePrintClick = (studentData) => {
    setViewAdmision(true)
    setSelectStudent(studentData);
   
  };

  const THEAD = [
    { id: "SN", label: "S No.", width: "2%" },
    { id: "image", label: "Photo", width: "2%" },
    { id: "admissionNo", label: "Adm No.", width: "2%"  },
    { id: "name", label: "Name", width: "20%"  },
    { id: "fatherName", label: "Father Name", width: "20%"  },
    { id: "class", label: "Class", width: "5%"  },
    { id: "contact", label: "Contact" , width: "20%" },
    { id: "action", label: "Action",width: "2", width: "2%"   },
  ];

  const tBody = filteredData?.map((val, ind) => ({
    SN: ind + 1,
    image: <img
      src={val?.studentImage?.url || "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"}
      alt="avatar"
      class="relative inline-block object-cover object-center w-6 h-6 rounded-lg"
    />,
    admissionNo: (
      <span className="text-green-800 font-semibold">{val.admissionNumber}</span>
    ),
    name: val.studentName,
    fatherName: val.fatherName,
    class: val.class,
    contact: val.contact,
    feeStatus: val.feeStatus,
    action: (<>
      <span onClick={() => handlePrintClick(val)} className="cursor-pointer">
        <MdLocalPrintshop className="text-[25px] text-green-700" />
      </span>

    </>
    ),
  }));

  if (loading) {
    return <Loading />;
  }

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item,
  }));

  const BreadItem = [
    {
      title: "Admission",
      link: "/admission"
    }
  ]
  return (
    <div 
    className=""
    >
      {/* <Breadcrumbs BreadItem={BreadItem} /> */}
      <div className="flex flex-wrap md:flex-row gap-1">
        <Button name="New Admission" onClick={toggleModal} />
        <BulkAdmission setRefreshRegistrations={setRefreshRegistrations} />
        <ReactSelect
          name="filterClass"
          value={filterClass}
          handleChange={handleFilterClassChange}
          label="Select Class"
          dynamicOptions={[
            { label: "All Classes", value: "" }, // Default Option
            ...(getClass?.map((cls) => ({
              label: cls.className, // What is displayed
              value: cls.className, // The actual value
            })) || []), // Ensure it doesn't break if `getClass` is undefined
          ]}
        />
        {
          filteredData?.length>0 && <span className="text-green-700 text-[18px] font-bold">COUNT = {filteredData?.length} 
          </span>
        }

      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create"} maxWidth="500px">
        <form onSubmit={handleSubmit} className="p-3">
          <div
            className=" mt-2 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 w-full gap-3 px-1 mx-auto bg-white rounded-md "
          >
            <ReactInput
              // resPClass="grid grid-cols-2 md:grid-cols-5"
              type="text"
              name="studentFullName"
              required={true}
              label="Student's Name"
              onChange={handleChange}
              value={payload.studentFullName}
            />

            <ReactInput
              type="number"
              maxLength="10"
              name="studentContact"
              required={true}
              label="Contact"
              onChange={handleChange}
              value={payload.studentContact}
            />

           
            
            <ReactSelect
              name="studentGender"
              value={payload?.studentGender}
              handleChange={handleChange}
              label="Gender"
              dynamicOptions={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />
            <ReactInput
              type="date"
              name="studentDateOfBirth"
              // required={true}
              label="DOB"
              onChange={handleChange}
              value={payload?.studentDateOfBirth}
            />

            
            <ReactSelect
              required={true}
              name="studentClass"
              value={selectedClass}
              handleChange={handleClassChange}
              label="Select a Class"
              dynamicOptions={dynamicOptions}
            />
            <ReactSelect
             required={true}
              name="studentSection"
              value={selectedSection} // Use selectedSection state
              handleChange={handleSectionChange} // Use the handleSectionChange function
              label="Select a Section"
              dynamicOptions={DynamicSection}
            />
           
           <ReactInput
              type="text"
              name="studentAddress"
              required={false}
              label="Student Address"
              onChange={handleChange}
              value={payload.studentAddress}
            />
           <ReactInput
              type="text"
              name="city"
              required={false}
              label="City"
              onChange={handleChange}
              value={payload.city}
            />
           <ReactInput
              type="text"
              name="pincode"
              required={false}
              label="Pincode"
              onChange={handleChange}
              value={payload.pincode}
            />
           <ReactInput
              type="text"
              name="state"
              required={false}
              label="State"
              onChange={handleChange}
              value={payload.state}
            />
           <ReactInput
              type="text"
              name="country"
              required={false}
              label="Country"
              onChange={handleChange}
              value={payload.country}
            />
           <ReactInput
              type="text"
              name="caste"
              required={false}
              label="Caste"
              onChange={handleChange}
              value={payload.caste}
            />
           <ReactInput
              type="text"
              name="religion"
              required={false}
              label="Religion"
              onChange={handleChange}
              value={payload.religion}
            />
           <ReactInput
              type="text"
              name="nationality"
              required={false}
              label="Nationality"
              onChange={handleChange}
              value={payload.nationality}
            />
            <ReactInput
              type="file"
              name="studentImage"
              accept="image/*"
              required={false}
              label="Student Image"
              onChange={handleImageChange}


            />
            {payload.studentImage && (
              <img
                src={URL.createObjectURL(payload.studentImage)}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-md"
              />
            )}

          </div>
          <div className="flex flex-row gap-10 justify-center text-center">
            <span className="text-xl text-blue-900">Parent Details</span>
            <FormControlLabel
              control={<Switch onClick={() => setsibling(!sibling)} />}
              label="Sibling"
            />
          </div>
          {sibling ? (
            <div
            
            className=" mt-2 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 w-full gap-3 px-1 mx-auto bg-white rounded-md "
         
            //  className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-1 mx-auto bg-white rounded-md "
             >

              <ReactInput
                type="text"
                name="fatherName"
                required={true}
                label="Father Name"
                onChange={handleChange}
                value={payload.fatherName}
              />

              <ReactInput
                type="text"
                name="motherName"
                required={false}
                label="Mother Name"
                onChange={handleChange}
                value={payload.motherName}
              />
            </div>
          ) : (
            <div className="">
              <div className="px-5 md:max-w-[25%] w-full text-center ">

                <ReactInput
                  type="text"
                  name="parentAdmissionNumber"
                  required={true}
                  label="Parent's Admission Number"
                  onChange={handleChange}
                  value={payload.parentAdmissionNumber}
                />
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-2 py-2 px-1">
            <Button
              name="Submit"
              type="submit"
              loading={loading}
              width="full"
            />
            <Button
              name="Cancel"
              color="gray"
              loading={loading}
              width="full"
              onClick={toggleModal}
            />
          </div>
        </form>
      </Modal>

      <div
        style={{
          display: "none",
        }}
      >
        <div id="printContent">
          <AdmissionPrint student={selectStudent} />
        </div>
      </div>

      {filteredData?.length > 0 ? (
      <div className="mt-1">
          <Table tHead={THEAD} tBody={tBody} isSearch={true} />
        </div>
      ) : (
        <NoDataFound />
      )}
      <Modal
        setIsOpen={() => setIsModalOpen(false)}
        isOpen={isModalOpen} title={"Addmission Successfully!"} maxWidth="100px">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>Do you want to send this</p>
          <p> message to this number?</p>
          <span className="text-indigo-800">{whatsAppMsg?.student?.contact}</span>
          <span></span>
          <div className="mt-4 flex justify-end space-x-4">

            <button
              onClick={() => sendWhatsAppMessage(whatsAppMsg)}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              OK
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        setIsOpen={() => setViewAdmision(false)}
        isOpen={viewAdmision} title={"Addmission details pdf"} maxWidth="100px">
        <AdmissionForm selectStudent={selectStudent} />
      </Modal>
    </div>
  );
}

export default Create_Registration_Form;

