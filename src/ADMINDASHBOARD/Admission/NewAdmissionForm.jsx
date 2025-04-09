import React, { useState, useMemo } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Link } from "react-router-dom";
import axios from "axios";

import Compressor from "compressorjs";
const initialData = {
  studentFullName: "vicky",
  studentEmail: "vicky@gmail.com",
  studentGender: "Male",
  studentDateOfBirth: "12/03/2020",
  studentPassword: "1234566",

  studentAddress: "delhi",
  studentCountry: "delgi",
  studentContact: "123456789",
  // nationality: "",
  studentJoiningDate: "2024-07-17",
  parentContact: "65289877",
  // religion: "",
  studentClass: "1",
  studentSection: "A",
  fatherName: "father",
  motherName: "mother",
  parentQualification: "BA",
  parentEmail: "parennnt@gmail.com",
  parentPassword: "123456",
  parentsIncome: "10lpa",
};

const Admission_form = () => {
  const schoolName = sessionStorage.getItem("schoolName");
  const SchoolImage = sessionStorage.getItem("image");
  const SchoolEmail = sessionStorage.getItem("email");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const schoolContact = sessionStorage.getItem("contact");
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState(initialData);
  const [studentImage, setStudentImage] = useState(null);
  const [parentImage, setParentImage] = useState(null);

  // const handleStudentImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setStudentImage(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleParentImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setParentImage(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const compressImage = (file, callback) => {
    new Compressor(file, {
      quality: 0.6,
      success(result) {
        callback(result);
      },
      error(err) {
        console.error(err.message);
      },
    });
  };

  const handleStudentImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedFile) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setStudentImage(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  };

  const handleParentImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedFile) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setParentImage(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      });
    }
  };

  // const handleStudentImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     compressImage(file, (compressedFile) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         setStudentImage(reader.result);
  //       };
  //       reader.readAsDataURL(compressedFile);
  //     });
  //   }
  // };

  // const handleParentImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     compressImage(file, (compressedFile) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         setParentImage(reader.result);
  //       };
  //       reader.readAsDataURL(compressedFile);
  //     });
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "studentImage" && key !== "parentImage") {
        formDataToSend.append(key, String(value));
      }
    });

    // Append the actual file objects
    if (studentImage) {
      formDataToSend.append("studentImage", studentImage);
    }
    if (parentImage) {
      formDataToSend.append("parentImage", parentImage);
    }

    try {
      const response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/adminRoute/createStudentParent",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Form submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     const formDataToSend = new FormData();
  //     Object.entries(formData).forEach(([key, value]) => {
  //       if (key !== "studentImage" && key !== "parentImage") {
  //         formDataToSend.append(key, String(value));
  //       }
  //     });

  //     formDataToSend.append("studentImage", formData.studentImage);
  //     formDataToSend.append("parentImage", formData.parentImage);

  //     // const payload = {
  //     //   ...formData,
  //     //   studentImage,
  //     //   parentImage,
  //     // };
  //     // console.log("firstpayload",payload)
  //     try {
  //       console.log("firstpayload click",)
  //      await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/createStudentParent", formDataToSend,
  //         {
  //           withCredentials: true,
  //           headers: {
  //             Authorization: `Bearer ${authToken}`,
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       ).then((response)=>(
  // console.log("response",response)
  //       )).catch((error)=>(
  //         console.log("error",error)

  //       ));

  //     } catch (error) {
  //       console.error("Error submitting form:", error);
  //     }
  //   };

  const parentsIncome = useMemo(
    () => [
      "less than 2 LPA",
      "less than 3 LPA",
      "less than 5 LPA",
      "less than 10 LPA",
    ],
    []
  );

  const studentSection = useMemo(() => ["A", "B", "C", "D", "E"], []);

  const classes = useMemo(
    () => [
      "Nursery",
      "UKG",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ],
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const payload = {
  //     ...formData,
  //     studentImage,
  //     parentImage,
  //   };

  //   console.log("payload", payload);

  //   try {
  //     const response = await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/createStudentParent", payload);
  //     console.log("Form submitted successfully:", response.data);
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //   }
  // };

  return (
    <>
      <div className="md:h-screen">
        <Link
          to="/admin/admission"
          className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
          style={{ border: `2px solid ${currentColor} `, color: currentColor }}
        >
          Back
        </Link>
        <h1
          className="text-2xl font-bold mb-4 uppercase text-center hover-text"
          style={{ color: currentColor }}
        >
          Admission Form
        </h1>
        <div
        
          className="dark:text-white dark:bg-secondary-dark-bg inset-4 border-2 border-black md:w-10/12 w-full mx-auto bg-cover bg-center bg-no-repeat md:p-5 mt-3"
        >
          <div class="flex  inset-0 rounded-md z-50">
            <div class="text-center mb-5">
              <img
                src={SchoolImage}
                alt="Citi Ford School Logo"
                class="md:w-36 md:h-36 h-20 w-20 mx-auto rounded-full"
              />
            </div>
            <div class="md:w-7/12 w-10/12">
              <h1 class="md:text-3xl text-lg font-bold mb-2 text-center text-gray-800 dark:text-white">
                {schoolName}
              </h1>
              <div class="text- leading-5 ">
                <span class="block text-center mb-1  ">{schoolAddress}</span>

                <span class="block text-center mb-1">
                  Email:- {SchoolEmail}
                  <br />
                  Contact :- {schoolContact}
                </span>
              </div>
            </div>
          </div>
          <center>
            <h3 class="text-red-700 font-bold underline">[ENGLISH MEDIUM]</h3>
          </center>
          <center>
            <span class="text-[12px ]">Session : 2024-25</span>
          </center>
          <div class=" m-5 rounded-md flex justify-between">
            {/* <div class="flex flex-col justify-between">
              <span class="border border-black w-52 p-2 mb-4">
                Admission No:-
               
              </span>
              <span class="border bg-green-800 text-white p-2">
                APPLICATION FORM RECEIPT
              </span>
            </div> */}
            </div>
            <form className="p-5" onSubmit={handleSubmit}>
           <div class="border border-black w-36 h-36 flex items-center justify-center">
              <div className="relative w-14 h-14 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden bg-gray-50 dark:bg-secondary-dark-bg">
                {studentImage ? (
                  <img
                    src={studentImage}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    No Image
                  </span>
                )}
                <input
                  type="file"
                  id="student-photo"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleStudentImageChange}
                />
              </div>
            </div>
          
          <div className="dark:text-white">
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Name of Student :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                  {/* {studentData.fullName} */}
                  <input
                    type="text"
                    id="studentFullName"
                    name="studentFullName"
                    className="h-10  mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded outline-none"
                    value={formData.studentFullName}
                    onChange={handleChange}
                  />
                </td>
              </tr>
            </div>
            <div className="">
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Gender :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.gender} */}
                    <label className="mr-4 gap-2">
                      M
                      <input
                        type="radio"
                        name="studentGender"
                        value="Male"
                        checked={formData.studentGender === "Male"}
                        onChange={handleChange}
                        className="ml-2"
                      />
                    </label>
                    <label className="mr-4 gap-2">
                      F
                      <input
                        type="radio"
                        name="studentGender"
                        value="Female"
                        checked={formData.studentGender === "Female"}
                        onChange={handleChange}
                        className="ml-2"
                      />
                    </label>
                    <label className="mr-4 gap-2">
                      O
                      <input
                        type="radio"
                        name="studentGender"
                        value="Other"
                        checked={formData.studentGender === "Other"}
                        onChange={handleChange}
                        className="ml-2"
                      />
                    </label>
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Email :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.email} */}
                    <input
                      id="studentEmail"
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleChange}
                      type="text"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Student Password
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.email} */}
                    <input
                      id="studentPassword"
                      name="studentPassword"
                      value={formData.studentPassword}
                      onChange={handleChange}
                      type="password"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Date of Birth :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {formattedDate} */}
                    <input
                      id="studentDateOfBirth"
                      name="studentDateOfBirth"
                      value={formData.studentDateOfBirth}
                      onChange={handleChange}
                      type="date"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    studentJoiningDate :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {formattedDate} */}
                    <input
                      id="studentJoiningDate"
                      name="studentJoiningDate"
                      value={formData.studentJoiningDate}
                      onChange={handleChange}
                      type="date"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Name of Father :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.fatherName} */}
                    <input
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      type="text"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Name of Mother :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.motherName} */}
                    <input
                      id="motherName"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      type="text"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Occupation Father :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.fatherName} */}
                    <input
                      id="parentQualification"
                      name="parentQualification"
                      value={formData.parentQualification}
                      onChange={handleChange}
                      type="text"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Address :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.address},{studentData.city},{studentData.state},{studentData.pincode} */}
                    <input
                      id="studentAddress"
                      name="studentAddress"
                      value={formData.studentAddress}
                      onChange={handleChange}
                      type="text"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    student Phone No
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.contact} */}
                    <input
                      id="studentContact"
                      name="studentContact"
                      value={formData.studentContact}
                      onChange={handleChange}
                      type="number"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Parent's Email
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.contact} */}
                    <input
                      id="parentEmail"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      type="text"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Parent Password
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.contact} */}
                    <input
                      id="parentPassword"
                      name="parentPassword"
                      value={formData.parentPassword}
                      onChange={handleChange}
                      type="text"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Parent's Income
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.contact} */}
                    <select
                      name="parentsIncome"
                      id="parentsIncome"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                      value={formData.parentsIncome}
                      onChange={handleChange}
                    >
                      {parentsIncome.map((incom) => (
                        <option key={incom} value={incom}>
                          {incom}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    parentContact.
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.contact} */}
                    <input
                      id="parentContact"
                      name="parentContact"
                      value={formData.parentContact}
                      onChange={handleChange}
                      type="number"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                    />
                  </td>
                </tr>
              </div>
              <div className="mb-3 flex w-full">
                <tr class=" ">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Nationality :
                  </th>
                  <td class="px-6  border-b-2 border-dashed w-full">
                    {/* {studentData.country} */}
                  </td>
                </tr>
                <tr class="ml-20">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Religion :
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.religion} */}
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Class in which admission sought
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.class}-{studentData.section} */}
                    <select
                      name="studentClass"
                      id="studentClass"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                      value={formData.studentClass}
                      onChange={handleChange}
                    >
                      {classes.map((clsName) => (
                        <option key={clsName} value={clsName}>
                          {clsName}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              </div>
              <div className="mb-3">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    Class Section in which admission sought
                  </th>
                  <td class="px-6 border-b-2 border-dashed w-full">
                    {/* {studentData.class}-{studentData.section} */}
                    <select
                      name="studentSection"
                      id="studentSection"
                      className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                      value={formData.studentSection}
                      onChange={handleChange}
                    >
                      {studentSection.map((clsName) => (
                        <option key={clsName} value={clsName}>
                          {clsName}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden bg-gray-50 dark:bg-secondary-dark-bg">
                {parentImage ? (
                  <img
                    src={parentImage}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    No Image
                  </span>
                )}
                <input
                  type="file"
                  id="parent-photo"
                  className=" inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleParentImageChange}
                />
              </div>
              <div className=" flex justify-start mt-4 ">
                <tr class="">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
                  >
                    Date :{/* {studentData.joiningDate} */}
                  </th>
                </tr>
              </div>
              <div className=" flex justify-end ">
                <tr class="mt-10">
                  <th
                    scope="row"
                    class="px-6 font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
                  >
                    Principal
                  </th>
                </tr>
              </div>
            </div>
          </div>
          <div className="text-right">
              <button
                type="submit"
                style={{
                  border: `2px solid ${currentColor}`,
                  color: currentColor,
                }}
                className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
              >
                Submit
              </button>
              <Link
                to="/admin/admission"
                className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
                style={{
                  border: `2px solid ${currentColor}`,
                  color: currentColor,
                }}
              >
                Back
              </Link>
            </div>
           </form>
        </div>
        {/* <div className="bg-gray-50 dark:text-white dark:bg-secondary-dark-bg">
          <form className="p-5" onSubmit={handleSubmit}>
            <div className="gap-2 grid md:grid-cols-4">
              <div className="flex flex-col">
                <label htmlFor="studentFullName">Student Name</label>
                <input
                  type="text"
                  id="studentFullName"
                  name="studentFullName"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                  value={formData.studentFullName}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentGender">studentGender</label>
                <div className="flex justify-center items-center h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded">
                  <label className="mr-4 gap-2">
                    M
                    <input
                      type="radio"
                      name="studentGender"
                      value="Male"
                      checked={formData.studentGender === "Male"}
                      onChange={handleChange}
                      className="ml-2"
                    />
                  </label>
                  <label className="mr-4 gap-2">
                    F
                    <input
                      type="radio"
                      name="studentGender"
                      value="Female"
                      checked={formData.studentGender === "Female"}
                      onChange={handleChange}
                      className="ml-2"
                    />
                  </label>
                  <label className="mr-4 gap-2">
                    O
                    <input
                      type="radio"
                      name="studentGender"
                      value="Other"
                      checked={formData.studentGender === "Other"}
                      onChange={handleChange}
                      className="ml-2"
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentEmail">Student Email</label>
                <input
                  id="studentEmail"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="studentDateOfBirth">Student DOB</label>
                <input
                  id="studentDateOfBirth"
                  name="studentDateOfBirth"
                  value={formData.studentDateOfBirth}
                  onChange={handleChange}
                  type="date"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentJoiningDate">studentJoiningDate</label>
                <input
                  id="studentJoiningDate"
                  name="studentJoiningDate"
                  value={formData.studentJoiningDate}
                  onChange={handleChange}
                  type="date"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentPassword">Student Password</label>
                <input
                  id="studentPassword"
                  name="studentPassword"
                  value={formData.studentPassword}
                  onChange={handleChange}
                  type="password"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentAddress">studentAddress</label>
                <input
                  id="studentAddress"
                  name="studentAddress"
                  value={formData.studentAddress}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="studentCountry">studentCountry</label>
                <input
                  id="studentCountry"
                  name="studentCountry"
                  value={formData.studentCountry}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentContact">student Phone No.</label>
                <input
                  id="studentContact"
                  name="studentContact"
                  value={formData.studentContact}
                  onChange={handleChange}
                  type="number"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentContact">parentContact.</label>
                <input
                  id="parentContact"
                  name="parentContact"
                  value={formData.parentContact}
                  onChange={handleChange}
                  type="number"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="studentClass">Class</label>
                <select
                  name="studentClass"
                  id="studentClass"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                  value={formData.studentClass}
                  onChange={handleChange}
                >
                  {classes.map((clsName) => (
                    <option key={clsName} value={clsName}>
                      {clsName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="studentSection">studentSection</label>
                <select
                  name="studentSection"
                  id="studentSection"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                  value={formData.studentSection}
                  onChange={handleChange}
                >
                  {studentSection.map((clsName) => (
                    <option key={clsName} value={clsName}>
                      {clsName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="fatherName">Father's Name</label>
                <input
                  id="fatherName"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="motherName">Mother's Name</label>
                <input
                  id="motherName"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="parentQualification">Parent's Occupation</label>
                <input
                  id="parentQualification"
                  name="parentQualification"
                  value={formData.parentQualification}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="parentEmail">Parent's Email</label>
                <input
                  id="parentEmail"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="parentPassword">Password</label>
                <input
                  id="parentPassword"
                  name="parentPassword"
                  value={formData.parentPassword}
                  onChange={handleChange}
                  type="text"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="parentsIncome">Parent's Income</label>
                <select
                  name="parentsIncome"
                  id="parentsIncome"
                  className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
                  value={formData.parentsIncome}
                  onChange={handleChange}
                >
                  {parentsIncome.map((incom) => (
                    <option key={incom} value={incom}>
                      {incom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-6 mt-3">
              <div className="flex flex-col items-center">
                <label
                  htmlFor="student-photo"
                  className="mb-2 text-gray-700 dark:text-white"
                >
                  Student's Photo
                </label>
                <div className="relative w-14 h-14 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden bg-gray-50 dark:bg-secondary-dark-bg">
                  {studentImage ? (
                    <img
                      src={studentImage}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      No Image
                    </span>
                  )}
                  <input
                    type="file"
                    id="student-photo"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleStudentImageChange}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <label
                  htmlFor="parent-photo"
                  className="mb-2 text-gray-700 dark:text-white"
                >
                  Parent's Photo
                </label>
                <div className="relative w-14 h-14 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden bg-gray-50 dark:bg-secondary-dark-bg">
                  {parentImage ? (
                    <img
                      src={parentImage}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      No Image
                    </span>
                  )}
                  <input
                    type="file"
                    id="parent-photo"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleParentImageChange}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <button
                type="submit"
                style={{
                  border: `2px solid ${currentColor}`,
                  color: currentColor,
                }}
                className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
              >
                Submit
              </button>
              <Link
                to="/admin/admission"
                className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
                style={{
                  border: `2px solid ${currentColor}`,
                  color: currentColor,
                }}
              >
                Back
              </Link>
            </div>
          </form>
        </div> */}
      </div>
    </>
  );
};

export default Admission_form;

// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import Cookies from "js-cookie";
// import Compressor from 'compressorjs';
// const initialData = {
//   studentFullName: "vicky",
//   studentEmail: "vicky@gmail.com",
//   studentGender: "Male",
//   studentDateOfBirth: "12/03/2020",
//   studentPassword: "1234566",

//   studentAddress: "delhi",
//   studentCountry: "delgi",
//   studentContact: "123456789",
//   // nationality: "",
//   studentJoiningDate:"2024-07-17",
//   parentContact:"65289877",
//   // religion: "",
//   studentClass: "1",
//   studentSection: "A",
//   fatherName: "father",
//   motherName: "mother",
//   parentQualification: "BA",
//   parentEmail: "parennnt@gmail.com",
//   parentPassword: "123456",
//   parentsIncome: "10lpa",
// };

// const Admission_form = () => {
//   const authToken = Cookies.get("token");
//   const { currentColor } = useStateContext();
//   const [formData, setFormData] = useState(initialData);
//   const [studentImage, setStudentImage] = useState(null);
//   const [parentImage, setParentImage] = useState(null);

//   // const handleStudentImageChange = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     const reader = new FileReader();
//   //     reader.onloadend = () => {
//   //       setStudentImage(reader.result);
//   //     };
//   //     reader.readAsDataURL(file);
//   //   }
//   // };

//   // const handleParentImageChange = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     const reader = new FileReader();
//   //     reader.onloadend = () => {
//   //       setParentImage(reader.result);
//   //     };
//   //     reader.readAsDataURL(file);
//   //   }
//   // };

//   const compressImage = (file, callback) => {
//     new Compressor(file, {
//       quality: 0.6,
//       success(result) {
//         callback(result);
//       },
//       error(err) {
//         console.error(err.message);
//       },
//     });
//   };

//   const handleStudentImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       compressImage(file, (compressedFile) => {
//         setStudentImage(compressedFile);
//       });
//     }
//   };

//   const handleParentImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       compressImage(file, (compressedFile) => {
//         setParentImage(compressedFile);
//       });
//     }
//   };

//   // const handleStudentImageChange = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     compressImage(file, (compressedFile) => {
//   //       const reader = new FileReader();
//   //       reader.onloadend = () => {
//   //         setStudentImage(reader.result);
//   //       };
//   //       reader.readAsDataURL(compressedFile);
//   //     });
//   //   }
//   // };

//   // const handleParentImageChange = (e) => {
//   //   const file = e.target.files[0];
//   //   if (file) {
//   //     compressImage(file, (compressedFile) => {
//   //       const reader = new FileReader();
//   //       reader.onloadend = () => {
//   //         setParentImage(reader.result);
//   //       };
//   //       reader.readAsDataURL(compressedFile);
//   //     });
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (key !== "studentImage" && key !== "parentImage") {
//         formDataToSend.append(key, String(value));
//       }
//     });

//     // Append the actual file objects
//     if (studentImage) {
//       formDataToSend.append("studentImage", studentImage);
//     }
//     if (parentImage) {
//       formDataToSend.append("parentImage", parentImage);
//     }

//     try {
//       const response = await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/createStudentParent", formDataToSend, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       console.log("Form submitted successfully:", response.data);
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     const formDataToSend = new FormData();
// //     Object.entries(formData).forEach(([key, value]) => {
// //       if (key !== "studentImage" && key !== "parentImage") {
// //         formDataToSend.append(key, String(value));
// //       }
// //     });

// //     formDataToSend.append("studentImage", formData.studentImage);
// //     formDataToSend.append("parentImage", formData.parentImage);

// //     // const payload = {
// //     //   ...formData,
// //     //   studentImage,
// //     //   parentImage,
// //     // };
// //     // console.log("firstpayload",payload)
// //     try {
// //       console.log("firstpayload click",)
// //      await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/createStudentParent", formDataToSend,
// //         {
// //           withCredentials: true,
// //           headers: {
// //             Authorization: `Bearer ${authToken}`,
// //             "Content-Type": "multipart/form-data",
// //           },
// //         }
// //       ).then((response)=>(
// // console.log("response",response)
// //       )).catch((error)=>(
// //         console.log("error",error)

// //       ));

// //     } catch (error) {
// //       console.error("Error submitting form:", error);
// //     }
// //   };

//   const parentsIncome = useMemo(() => [
//     "less than 2 LPA",
//     "less than 3 LPA",
//     "less than 5 LPA",
//     "less than 10 LPA",
//   ], []);

//   const studentSection = useMemo(() => ["A", "B", "C", "D", "E"], []);

//   const classes = useMemo(() => [
//     "Nursery",
//     "UKG",
//     "1",
//     "2",
//     "3",
//     "4",
//     "5",
//     "6",
//     "7",
//     "8",
//     "9",
//     "10",
//     "11",
//     "12",
//   ], []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();

//   //   const payload = {
//   //     ...formData,
//   //     studentImage,
//   //     parentImage,
//   //   };

//   //   console.log("payload", payload);

//   //   try {
//   //     const response = await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/createStudentParent", payload);
//   //     console.log("Form submitted successfully:", response.data);
//   //   } catch (error) {
//   //     console.error("Error submitting form:", error);
//   //   }
//   // };

//   return (
//     <>
//       <div className="md:h-screen">
//         <Link
//           to="/admin/admission"
//           className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
//           style={{ border: `2px solid ${currentColor} `, color: currentColor }}
//         >
//           Back
//         </Link>
//         <h1
//           className="text-2xl font-bold mb-4 uppercase text-center hover-text"
//           style={{ color: currentColor }}
//         >
//           Admission Form
//         </h1>
//         <div className="bg-gray-50 dark:text-white dark:bg-secondary-dark-bg">
//           <form className="p-5" onSubmit={handleSubmit}>
//             <div className="gap-2 grid md:grid-cols-4">
//               <div className="flex flex-col">
//                 <label htmlFor="studentFullName">Student Name</label>
//                 <input
//                   type="text"
//                   id="studentFullName"
//                   name="studentFullName"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                   value={formData.studentFullName}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentGender">studentGender</label>
//                 <div className="flex justify-center items-center h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded">
//                   <label className="mr-4 gap-2">
//                     M
//                     <input
//                       type="radio"
//                       name="studentGender"
//                       value="Male"
//                       checked={formData.studentGender === "Male"}
//                       onChange={handleChange}
//                       className="ml-2"
//                     />
//                   </label>
//                   <label className="mr-4 gap-2">
//                     F
//                     <input
//                       type="radio"
//                       name="studentGender"
//                       value="Female"
//                       checked={formData.studentGender === "Female"}
//                       onChange={handleChange}
//                       className="ml-2"
//                     />
//                   </label>
//                   <label className="mr-4 gap-2">
//                     O
//                     <input
//                       type="radio"
//                       name="studentGender"
//                       value="Other"
//                       checked={formData.studentGender === "Other"}
//                       onChange={handleChange}
//                       className="ml-2"
//                     />
//                   </label>
//                 </div>
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentEmail">Student Email</label>
//                 <input
//                   id="studentEmail"
//                   name="studentEmail"
//                   value={formData.studentEmail}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               {/* <div className="flex flex-col">
//                 <label htmlFor="studentRollNo">Student RollNo</label>
//                 <input
//                   id="studentRollNo"
//                   name="studentRollNo"
//                   value={formData.studentRollNo}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div> */}
//               <div className="flex flex-col">
//                 <label htmlFor="studentDateOfBirth">Student DOB</label>
//                 <input
//                   id="studentDateOfBirth"
//                   name="studentDateOfBirth"
//                   value={formData.studentDateOfBirth}
//                   onChange={handleChange}
//                   type="date"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentJoiningDate">studentJoiningDate</label>
//                 <input
//                   id="studentJoiningDate"
//                   name="studentJoiningDate"
//                   value={formData.studentJoiningDate}
//                   onChange={handleChange}
//                   type="date"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentPassword">Student Password</label>
//                 <input
//                   id="studentPassword"
//                   name="studentPassword"
//                   value={formData.studentPassword}
//                   onChange={handleChange}
//                   type="password"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentAddress">studentAddress</label>
//                 <input
//                   id="studentAddress"
//                   name="studentAddress"
//                   value={formData.studentAddress}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               {/* <div className="flex flex-col">
//                 <label htmlFor="studentAddress">studentSubject</label>
//                 <input
//                   id="studentSubject"
//                   name="studentSubject"
//                   value={formData.studentSubject}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div> */}
//               <div className="flex flex-col">
//                 <label htmlFor="studentCountry">studentCountry</label>
//                 <input
//                   id="studentCountry"
//                   name="studentCountry"
//                   value={formData.studentCountry}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentContact">student Phone No.</label>
//                 <input
//                   id="studentContact"
//                   name="studentContact"
//                   value={formData.studentContact}
//                   onChange={handleChange}
//                   type="number"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentContact">parentContact.</label>
//                 <input
//                   id="parentContact"
//                   name="parentContact"
//                   value={formData.parentContact}
//                   onChange={handleChange}
//                   type="number"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label htmlFor="studentClass">Class</label>
//                 <select
//                   name="studentClass"
//                   id="studentClass"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                   value={formData.studentClass}
//                   onChange={handleChange}
//                 >
//                   {classes.map((clsName) => (
//                     <option key={clsName} value={clsName}>
//                       {clsName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="studentSection">studentSection</label>
//                 <select
//                   name="studentSection"
//                   id="studentSection"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                   value={formData.studentSection}
//                   onChange={handleChange}
//                 >
//                   {studentSection.map((clsName) => (
//                     <option key={clsName} value={clsName}>
//                       {clsName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="fatherName">Father's Name</label>
//                 <input
//                   id="fatherName"
//                   name="fatherName"
//                   value={formData.fatherName}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="motherName">Mother's Name</label>
//                 <input
//                   id="motherName"
//                   name="motherName"
//                   value={formData.motherName}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="parentQualification">Parent's Occupation</label>
//                 <input
//                   id="parentQualification"
//                   name="parentQualification"
//                   value={formData.parentQualification}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="parentEmail">Parent's Email</label>
//                 <input
//                   id="parentEmail"
//                   name="parentEmail"
//                   value={formData.parentEmail}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="parentPassword">Password</label>
//                 <input
//                   id="parentPassword"
//                   name="parentPassword"
//                   value={formData.parentPassword}
//                   onChange={handleChange}
//                   type="text"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                 />
//               </div>
//               <div className="flex flex-col">
//                 <label htmlFor="parentsIncome">Parent's Income</label>
//                 <select
//                   name="parentsIncome"
//                   id="parentsIncome"
//                   className="h-10 border mt-1 px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg rounded"
//                   value={formData.parentsIncome}
//                   onChange={handleChange}
//                 >
//                   {parentsIncome.map((incom) => (
//                     <option key={incom} value={incom}>
//                       {incom}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <div className="flex gap-6 mt-3">
//               <div className="flex flex-col items-center">
//                 <label
//                   htmlFor="student-photo"
//                   className="mb-2 text-gray-700 dark:text-white"
//                 >
//                   Student's Photo
//                 </label>
//                 <div className="relative w-14 h-14 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden bg-gray-50 dark:bg-secondary-dark-bg">
//                   {studentImage ? (
//                     <img
//                       src={studentImage}
//                       alt="Selected"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-gray-400 dark:text-gray-500">
//                       No Image
//                     </span>
//                   )}
//                   <input
//                     type="file"
//                     id="student-photo"
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                     accept="image/*"
//                     onChange={handleStudentImageChange}
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-col items-center">
//                 <label
//                   htmlFor="parent-photo"
//                   className="mb-2 text-gray-700 dark:text-white"
//                 >
//                   Parent's Photo
//                 </label>
//                 <div className="relative w-14 h-14 flex items-center justify-center border border-gray-300 rounded-full overflow-hidden bg-gray-50 dark:bg-secondary-dark-bg">
//                   {parentImage ? (
//                     <img
//                       src={parentImage}
//                       alt="Selected"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <span className="text-gray-400 dark:text-gray-500">
//                       No Image
//                     </span>
//                   )}
//                   <input
//                     type="file"
//                     id="parent-photo"
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                     accept="image/*"
//                     onChange={handleParentImageChange}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <button
//                 type="submit"
//                 style={{
//                   border: `2px solid ${currentColor}`,
//                   color: currentColor,
//                 }}
//                 className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
//               >
//                 Submit
//               </button>
//               <Link
//                 to="/admin/admission"
//                 className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2"
//                 style={{
//                   border: `2px solid ${currentColor}`,
//                   color: currentColor,
//                 }}
//               >
//                 Back
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Admission_form;
