// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Button from "../../Dynamic/utils/Button";
// import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";

// const ClassExemption = () => {
//   const { setIsLoader } = useStateContext();
//   const session = JSON.parse(localStorage.getItem("session"));
//   const authToken = localStorage.getItem("token");
//   const [classes, setClasses] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [regularFeeMonths, setRegularFeeMonths] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [availableAdditionalFees, setAvailableAdditionalFees] = useState([]);

//   const allMonths = [
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//     "January",
//     "February",
//     "March",
//   ];

//   // Fetch classes
//   const fetchClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await axios.get(
//         `${
//           process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//         }/api/v1/adminRoute/studentparent?status=active&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         const uniqueClasses = [
//           ...new Set(
//             response.data.students.data.map((student) => student.class)
//           ),
//         ];
//         setClasses(uniqueClasses);
//       } else {
//         toast.error("Failed to fetch classes");
//       }
//     } catch (error) {
//       toast.error(`Error fetching classes: ${error.message}`);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader, session, authToken]);

//   // Fetch sections and fees when class is selected
//   const fetchClassDetails = useCallback(
//     async (className) => {
//       setIsLoader(true);
//       try {
//         // Fetch sections
//         const studentsResponse = await axios.get(
//           `${
//             process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//           }/api/v1/adminRoute/studentparent?status=active&session=${session}`,
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         if (studentsResponse.data.success) {
//           const classStudents = studentsResponse.data.students.data.filter(
//             (student) => student.class === className
//           );
//           const uniqueSections = [
//             ...new Set(classStudents.map((student) => student.section)),
//           ].filter(Boolean);
//           setSections(["All Sections", ...uniqueSections]);
//         }

//         // Fetch fee structure
//         const feesResponse = await axios.get(
//           `${
//             process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//           }/api/v1/adminRoute/fees/?className=${className}`,
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         if (feesResponse.data.success) {
//           const fees = feesResponse.data.data.filter((fee) => !fee.studentId); // Class-level fees only
//           const regularFee = fees.find((fee) => !fee.additional);
//           const additionalFees = fees.filter((fee) => fee.additional);

//           // Set regular fee months (assuming all months are applicable)
//           setRegularFeeMonths(
//             allMonths.map((month) => ({
//               name: `${month}`,
//               code: month,
//               selected: false, // Initialize with selected: false
//             }))
//           );

//           // Set additional fee options
//           const addFeeOptions = additionalFees.map((fee) => ({
//             label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
//             name: fee.name,
//             code: fee._id,
//             type: fee.feeType,
//             frequency: fee.frequency,
//             amount: fee.amount,
//           }));
//           setAvailableAdditionalFees(addFeeOptions);
//         }
//       } catch (error) {
//         toast.error(`Error fetching class details: ${error.message}`);
//       } finally {
//         setIsLoader(false);
//       }
//     },
//     [setIsLoader, session, authToken]
//   );

//   useEffect(() => {
//     fetchClasses();
//   }, [fetchClasses]);

//   const handleClassChange = (e) => {
//     const className = e.target.value;
//     setSelectedClass(className);
//     setSelectedSection("");
//     setSelectedAdditionalFees([]);
//     if (className) {
//       fetchClassDetails(className);
//     } else {
//       setSections([]);
//       setRegularFeeMonths([]);
//       setAvailableAdditionalFees([]);
//     }
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };

//   const handleMonthMultiSelectChange = (_, selectedOptions) => {
//     const options = Array.isArray(selectedOptions) ? selectedOptions : [];
//     setRegularFeeMonths((prev) =>
//       prev.map((opt) => ({
//         ...opt,
//         selected: options.some((sel) => sel.code === opt.code),
//       }))
//     );
//   };

//   const handleAdditionalFeeChange = (_, selectedOptions) => {
//     const options = Array.isArray(selectedOptions) ? selectedOptions : [];
//     setSelectedAdditionalFees(
//       options.map((opt) => {
//         const fee = availableAdditionalFees.find((f) => f.code === opt.code);
//         return {
//           code: opt.code,
//           name: fee.name,
//           type: fee.type,
//           frequency: fee.frequency,
//           amount: fee.amount,
//           months:
//             fee.frequency === "monthly"
//               ? regularFeeMonths.filter((m) => m.selected).map((m) => m.code)
//               : [],
//         };
//       })
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedClass) {
//       toast.error("Please select a class");
//       return;
//     }

//     const exemptions = [];

//     // Regular fees
//     const selectedMonths = regularFeeMonths
//       .filter((m) => m.selected)
//       .map((m) => m.code);
//     if (selectedMonths.length > 0) {
//       exemptions.push({
//         feeType: "regular",
//         months: selectedMonths,
//       });
//     }

//     // Additional fees
//     selectedAdditionalFees.forEach((fee) => {
//       exemptions.push({
//         feeType: "additional",
//         name: fee.name,
//         months:
//           fee.frequency === "monthly" && fee.months.length > 0
//             ? fee.months
//             : undefined,
//       });
//     });

//     if (exemptions.length === 0) {
//       toast.error("Please select at least one fee to exempt");
//       return;
//     }

//     const payload = {
//       schoolId: JSON.parse(localStorage.getItem("user"))?.schoolId,
//       className: selectedClass,
//       section: selectedSection === "All Sections" ? undefined : selectedSection,
//       exemptions,
//     };

//     setIsLoader(true);
//     try {
//       const response = await axios.post(
//         `${
//           process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//         }/api/v1/fees/exemption`,
//         payload,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         toast.success(response.data.message);
//         // Reset form
//         setSelectedClass("");
//         setSelectedSection("");
//         setRegularFeeMonths([]);
//         setSelectedAdditionalFees([]);
//         setAvailableAdditionalFees([]);
//       } else {
//         toast.error(response.data.message || "Failed to apply exemptions");
//       }
//     } catch (error) {
//       toast.error(
//         `Error applying exemptions: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   return (
//     <div className="px-4 pb-2 min-h-screen bg-gray-100">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6 pt-4 border-t border-gray-200">
//           Create Class-Wide Fee Exemption
//         </h1>
//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Select Class (*)
//               </label>
//               <select
//                 value={selectedClass}
//                 onChange={handleClassChange}
//                 className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
//               >
//                 <option value="">-- Select Class --</option>
//                 {classes.map((cls) => (
//                   <option key={cls} value={cls}>
//                     {cls}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {sections.length > 0 && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Select Section
//                 </label>
//                 <select
//                   value={selectedSection}
//                   onChange={handleSectionChange}
//                   className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
//                 >
//                   <option value="">-- Select Section --</option>
//                   {sections.map((sec) => (
//                     <option key={sec} value={sec}>
//                       {sec}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>

//           {selectedClass && (
//             <div className="space-y-6">
//               <div className="border rounded-md p-4 bg-gray-50">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Regular Fee Months to Exempt
//                 </label>
//                 <DynamicMultiSelect
//                   name="regularFeeMonths"
//                   searchable={false}
//                   placeholderName="Select month(s) to exempt..."
//                   dynamicOptions={regularFeeMonths.map((m) => ({
//                     name: m.name,
//                     code: m.code,
//                   }))}
//                   handleChange={handleMonthMultiSelectChange}
//                   value={regularFeeMonths
//                     .filter((m) => m.selected)
//                     .map((m) => ({ name: m.name, code: m.code }))}
//                   containerClassName="w-full"
//                   menuClassName="w-full min-w-[200px]"
//                 />
//               </div>

//               {availableAdditionalFees.length > 0 && (
//                 <div className="border rounded-md p-4 bg-gray-50">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Additional Fees to Exempt
//                   </label>
//                   <DynamicMultiSelect
//                     name="additionalFees"
//                     searchable={true}
//                     placeholderName="Select additional fee(s) to exempt..."
//                     dynamicOptions={availableAdditionalFees.map((fee) => ({
//                       name: fee.label,
//                       code: fee.code,
//                     }))}
//                     handleChange={handleAdditionalFeeChange}
//                     value={selectedAdditionalFees.map((fee) => ({
//                       name: `${fee.name} (${fee.type}) - ₹${fee.amount}`,
//                       code: fee.code,
//                     }))}
//                     containerClassName="w-full"
//                     menuClassName="w-full min-w-[200px]"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Monthly fees will use selected months; one-time fees apply
//                     fully.
//                   </p>
//                 </div>
//               )}

//               <div className="flex justify-end pt-4 border-t">
//                 <Button
//                   name="Apply Exemptions"
//                   onClick={handleSubmit}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClassExemption;
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import Button from "../../Dynamic/utils/Button";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";

// Function to decode JWT token and extract schoolId
const getSchoolIdFromToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.user?.schoolId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};


const ClassExemption = () => {
  const { setIsLoader } = useStateContext();
  const session = JSON.parse(localStorage.getItem("session"));
  const authToken = localStorage.getItem("token");
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    regularFees: [],
    additionalFees: [],
  });
  const [regularFeeOptions, setRegularFeeOptions] = useState([]);
  const [additionalFeeOptions, setAdditionalFeeOptions] = useState({
    monthly: [],
    oneTime: [],
  });

  const allMonths = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  // Fetch classes and sections
  useEffect(() => {
    const fetchClassesAndSections = async () => {
      setIsLoader(true);
      try {
        const response = await axios.get(
          `${
            process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
          }/api/v1/adminRoute/students/active`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          const students = response.data.students.data;
          const uniqueClasses = [...new Set(students.map((s) => s.class))].sort();
          setClasses(uniqueClasses);
          setSections(
            [...new Set(students.map((s) => s.section).filter(Boolean))].sort()
          );
        }
      } catch (error) {
        toast.error("Failed to fetch classes and sections: " + error.message);
      } finally {
        setIsLoader(false);
      }
    };
    fetchClassesAndSections();
  }, [authToken, setIsLoader]);

  // Fetch fee options
  useEffect(() => {
    const fetchFeeOptions = async () => {
      if (!formData.className) return;
      setIsLoader(true);
      try {
        const [regularRes, additionalRes] = await Promise.all([
          axios.get(
            `${
              process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
            }/api/v1/adminRoute/fees/?additional=false&className=${
              formData.className
            }`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
              withCredentials: true,
            }
          ),
          axios.get(
            `${
              process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
            }/api/v1/adminRoute/fees/?additional=true&className=${
              formData.className
            }`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
              withCredentials: true,
            }
          ),
        ]);

        if (regularRes.data.success) {
          const regularAmount = regularRes.data.data[0]?.amount || 0;
          setRegularFeeOptions(
            allMonths.map((month) => ({
              name: `${month} - ₹${regularAmount}`,
              code: month,
            }))
          );
        }

        if (additionalRes.data.success) {
          const fees = additionalRes.data.data.filter(
            (f) => f.className === formData.className
          );
          const monthlyFees = fees.filter((f) => f.frequency === "monthly");
          const oneTimeFees = fees.filter((f) => f.frequency === "one-time");
          setAdditionalFeeOptions({
            monthly: monthlyFees.map((fee) => ({
              name: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
              code: fee._id,
              frequency: fee.frequency,
              amount: fee.amount,
            })),
            oneTime: oneTimeFees.map((fee) => ({
              name: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
              code: fee._id,
              frequency: fee.frequency,
              amount: fee.amount,
            })),
          });
        }
      } catch (error) {
        toast.error("Failed to fetch fee options: " + error.message);
      } finally {
        setIsLoader(false);
      }
    };
    fetchFeeOptions();
  }, [formData.className, authToken, setIsLoader]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "className") {
      setFormData((prev) => ({
        ...prev,
        section: "",
        regularFees: [],
        additionalFees: [],
      }));
    }
  };

  const handleRegularFeeChange = (name, selectedOptions) => {
    const months = selectedOptions.map((opt) => opt.code);
    setFormData((prev) => ({ ...prev, regularFees: months }));
  };

  const handleAdditionalFeeChange = (name, selectedOptions) => {
    const additionalFees = selectedOptions.map((opt) => {
      const fee = [...additionalFeeOptions.monthly, ...additionalFeeOptions.oneTime].find(
        (f) => f.code === opt.code
      );
      return fee.frequency === "monthly"
        ? { name: fee.name.split(" (")[0], months: formData.regularFees }
        : { name: fee.name.split(" (")[0] };
    });
    setFormData((prev) => ({ ...prev, additionalFees }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.className ||
      (formData.regularFees.length === 0 && formData.additionalFees.length === 0)
    ) {
      toast.error("Please select a class and at least one fee to exempt");
      return;
    }

    const schoolId = getSchoolIdFromToken(authToken);
    if (!schoolId) {
      toast.error("Unable to retrieve schoolId from token");
      return;
    }

    const payload = {
      schoolId,
      session,
      className: formData.className,
      section: formData.section || undefined,
      regularFees: formData.regularFees,
      additionalFees: formData.additionalFees,
    };

    setIsLoader(true);
    try {
      const response = await axios.post(
        `${
          process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
        }/api/v1/fees/exemption`,
        payload,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success(
          response.data.message || "Exemptions applied successfully!"
        );
        setFormData({
          className: "",
          section: "",
          regularFees: [],
          additionalFees: [],
        });
      } else {
        toast.error(response.data.message || "Failed to apply exemptions");
      }
    } catch (error) {
      toast.error("Error applying exemptions: " + error.message);
    } finally {
      setIsLoader(false);
    }
  };

  return (
    <div className="px-4 pb-2 min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 pt-4">
          Exempt Fees for Class/Section
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class (*)
            </label>
            <select
              value={formData.className}
              onChange={(e) => handleInputChange("className", e.target.value)}
              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={formData.section}
              onChange={(e) => handleInputChange("section", e.target.value)}
              className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              disabled={!formData.className}
            >
              <option value="">All Sections</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
          {formData.className && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Fees to Exempt
                </label>
                <DynamicMultiSelect
                  name="regularFees"
                  searchable={false}
                  placeholderName="Select month(s) to exempt..."
                  dynamicOptions={regularFeeOptions}
                  handleChange={handleRegularFeeChange}
                  value={formData.regularFees.map((month) => ({
                    name: regularFeeOptions.find((opt) => opt.code === month)?.name,
                    code: month,
                  }))}
                  containerClassName="w-full"
                  menuClassName="w-full min-w-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Additional Fees to Exempt
                </label>
                <DynamicMultiSelect
                  name="monthlyAdditionalFees"
                  searchable={true}
                  placeholderName="Select monthly additional fee(s) to exempt..."
                  dynamicOptions={additionalFeeOptions.monthly || []}
                  handleChange={(name, selectedOptions) => {
                    const selected = selectedOptions.map((opt) => ({
                      name: additionalFeeOptions.monthly
                        .find((f) => f.code === opt.code)
                        .name.split(" (")[0],
                      months: formData.regularFees,
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      additionalFees: [
                        ...selected,
                        ...prev.additionalFees.filter((f) => !f.months),
                      ],
                    }));
                  }}
                  value={formData.additionalFees
                    .filter((f) => f.months)
                    .map((f) => ({
                      name: `${f.name} (Monthly)`,
                      code: additionalFeeOptions.monthly.find((opt) =>
                        opt.name.startsWith(f.name)
                      )?.code,
                    }))}
                  containerClassName="w-full"
                  menuClassName="w-full min-w-[200px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  One-Time Additional Fees to Exempt
                </label>
                <DynamicMultiSelect
                  name="oneTimeAdditionalFees"
                  searchable={true}
                  placeholderName="Select one-time additional fee(s) to exempt..."
                  dynamicOptions={additionalFeeOptions.oneTime || []}
                  handleChange={(name, selectedOptions) => {
                    const selected = selectedOptions.map((opt) => ({
                      name: additionalFeeOptions.oneTime
                        .find((f) => f.code === opt.code)
                        .name.split(" (")[0],
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      additionalFees: [
                        ...prev.additionalFees.filter((f) => f.months),
                        ...selected,
                      ],
                    }));
                  }}
                  value={formData.additionalFees
                    .filter((f) => !f.months)
                    .map((f) => ({
                      name: `${f.name} (One-Time)`,
                      code: additionalFeeOptions.oneTime.find((opt) =>
                        opt.name.startsWith(f.name)
                      )?.code,
                    }))}
                  containerClassName="w-full"
                  menuClassName="w-full min-w-[200px]"
                />
              </div>
            </>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              name="Apply Exemptions"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassExemption;