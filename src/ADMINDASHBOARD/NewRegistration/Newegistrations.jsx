import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";

import NoDataFound from "../../NoDataFound.jsx";

import RegForm from "./RegForm.jsx";

import { toast } from "react-toastify";
import { StudentDeleteRegistrations, StudentgetRegistrations, StudentApproveAdmissions } from "../../Network/AdminApi.js"; // Import your Approve Admissions API
import { useReactToPrint } from 'react-to-print';
import { Modal } from "@mui/material";

import { Box } from "@mui/material";
import { AiFillDelete, AiFillEye } from 'react-icons/ai';
import Button from "../../Dynamic/utils/Button.jsx";

import Table from "../../Dynamic/Table.jsx";
import Breadcrumbs from "../../components/Breadcrumbs .jsx";
import moment from "moment";
import { handleShareRegistration } from "../../Dynamic/utils/Message.jsx";
const uploadPDF = async (pdfBlob) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate a successful upload and return a dummy URL
            const dummyURL = "https://example.com/your-uploaded-pdf.pdf"; // Replace with your URL
            resolve(dummyURL);
        }, 1500); // Simulate upload delay
    });
};

const MobileRegistrationCard = ({ student, onClose, handleDelete }) => {
    const user = JSON.parse(localStorage.getItem("user"))
    const componentPDF = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: `Registration_${student.studentFullName}`,
        onAfterPrint: () => toast.success("PDF Downloaded Successfully!"),
    });

    return (
        <Modal
            open={true}
            onClose={onClose}
            aria-labelledby="mobile-registration-modal"
            aria-describedby="mobile-registration-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%', // Mobile ke liye width 90% rakhi hai
                    maxWidth: 350, // Maximum width ko aur chhota kiya
                    bgcolor: 'background.paper',
                    border: '1px solid #000', // Border thickness reduced
                    boxShadow: 24,
                    p: 1, // Padding aur bhi reduce kiya
                    overflowY: 'auto', // Scrolling enable hai
                    maxHeight: '90vh', // Maximum height to fit within the screen
                }}
            >
                <div ref={componentPDF} 
                // style={{ width: "100%" }}
                >
                    <div className="max-w-lg mx-auto p-1 border border-black bg-yellow-100 mt-2">
                        <div 
                        className="relative"
                        >

                            <div className="absolute top-0 left-0 flex justify-between h-[60px] w-[60px] object-cover">
                                <img
                                    className="w-full h-full"
                                    src={user?.image?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"}
                                    alt="school logo"
                                />
                            </div>

                            <div className="absolute top-0 right-0 text-sm">
                                <span>Reg.No. {student?.registrationNumber}</span>
                            </div>
                        </div>
                        <div className="text-center font-bold text-md mb-2 w-[60%] mx-auto mt-4">
                            {user?.schoolName}
                            <p className="text-xs text-gray-700">{user?.address}</p>
                            <p className="text-xs text-gray-700">Mobile No. : {user?.contact || "N/A"}</p>
                            <div className="text-center text-xs mb-2">Registration Receipt</div>
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-between border-b-1 border-black border-dashed text-xs">
                            <span>Reg. Date : {moment(student?.createdAt ).format("DD-MMM-YYYY")||"N/A"} </span>
                                <span>Session : 2024-25</span>
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1 text-xs">
                            <span>Student's Name : {student?.studentFullName}</span>
                            <span>Guardian's Name : {student?.guardianName}</span>
                            <span>Email: {student?.studentEmail}</span>
                            <span>Gender: {student?.gender}</span>
                            <span>Class : {student?.registerClass}</span>
                            <span>Mob : {student?.mobileNumber}</span>
                            <span>Address : {student?.studentAddress}</span>
                        </div>

                        {/* Payment Details Table */}
                        <div className="my-2">
                            <table className="w-full mb-2 text-xs">
                                <thead>
                                    <tr>
                                        <th className="border border-black p-1">Sr. No.</th>
                                        <th className="border border-black p-1">Particulars</th>
                                        <th className="border border-black p-1">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-black p-1 text-center">1</td>
                                        <td className="border border-black p-1 text-center">
                                            Registration Fee
                                        </td>
                                        <td className="border border-black p-1 text-center">
                                            {student?.amount}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mb-2 text-xs">
                            <span>{student?.amount}/-</span>
                        </div>

                        {/* Signatures */}
                        <div className="flex justify-between mb-2 my-4 text-xs">
                            <span>Signature of Centre Head</span>
                            <span>Signature of Student</span>
                        </div>

                        {/* Footer Note */}
                        <div className="text-center text-[10px]">
                            All above mentioned Amount once paid are non-refundable in any case
                            whatsoever.
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-2 flex justify-between gap-3">
                    <Button name="Print" onClick={handlePrint} width="full" />
                    <Button name="Share " onClick={()=> handleShareRegistration(student, user)} width="full" />
                    {/* <Button name="Share " onClick={()=>handleWhatsAppSharePDF(student)} width="full" /> */}
                    <Button name="Close" onClick={onClose} width="full" color="#607093" />
                </div>
            </Box>
        </Modal>
    );
};

const Newegistrations = () => {
   const [reload,setReload]=useState(false)

    const { currentColor, setIsLoader } = useStateContext();
    const [registrationData, setRegistrationData] = useState([]);
    const isMobile = window.innerWidth <= 768;
    const tableRef = useRef();
    const [selectedRegistration, setSelectedRegistration] = useState(null); // For mobile modal

    // NEW: State to hold selected registration numbers
    const [selectedRegistrations, setSelectedRegistrations] = useState([]);

    // NEW: State to track if all are selected
    const [selectAll, setSelectAll] = useState(false);

    const getREg = async () => {
        setIsLoader(true)
       try {
        const response = await StudentgetRegistrations();

        if (response.success) {
            setIsLoader(false)
            setRegistrationData([]);
            setRegistrationData(response?.data || []);
           
        } else {

            toast.error(response.message)
           
        }
        
       } catch (error) {
        console.log("error",error)
       }
       finally{
        setIsLoader(false)
    }
    };

    const handleSelectAllChange = () => {
        setSelectAll(!selectAll);

        if (!selectAll) {
            // Select all
            const allRegistrationNumbers = registrationData?.map((student) => student.registrationNumber);
            setSelectedRegistrations(allRegistrationNumbers);
        } else {
            // Unselect all
            setSelectedRegistrations([]);
        }
    };

    const THEAD = [
        {
            id: "select", label: (
                <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            )
        }, // New column for checkbox
        { id: "SN", label: "S No." },
        { id: "registrationNumber", label: "Registration No" },
        { id: "studentFullName", label: "Name" },
        { id: "fatherName", label: "Father Name" },
        { id: "gender", label: "Gender" },
        { id: "registerClass", label: "Class" },
        { id: "mobileNumber", label: "Contact" },
        { id: "amount", label: "Reg. Fee" },
        { id: "action", label: "Action" },
    ];

    const handleCheckboxChange = (registrationNumber) => {
        setSelectedRegistrations((prevSelected) => {
            if (prevSelected.includes(registrationNumber)) {
                return prevSelected.filter((regNum) => regNum !== registrationNumber); // Unselect
            } else {
                return [...prevSelected, registrationNumber]; // Select
            }
        });
    };

    const tBody = registrationData?.map((val, ind) => ({
        select: (
            <input
                type="checkbox"
                checked={selectedRegistrations.includes(val.registrationNumber)}
                onChange={() => handleCheckboxChange(val.registrationNumber)}
            />
        ),
        "SN": ind + 1,
        registrationNumber: <span className="text-red-700 font-semibold">{val.registrationNumber}</span>,
        studentFullName: val.studentFullName,
        fatherName: val.fatherName,
        gender: val.gender,
        registerClass: val.registerClass,
        mobileNumber: val.mobileNumber,
        amount: val.amount,
        feeStatus: val.feeStatus,
        action: <span onClick={() => setSelectedRegistration(val)} className="cursor-pointer">
            <AiFillEye className="text-[25px] text-green-700" />
        </span>
    }));

    useEffect(() => {
        getREg();
    }, [reload]);

    // Update selectAll when registrationData or selectedRegistrations changes
    useEffect(() => {
        if (registrationData?.length > 0) {
            setSelectAll(selectedRegistrations.length === registrationData?.length);
        } else {
            setSelectAll(false);
        }
    }, [registrationData, selectedRegistrations]);

    // const handlePrint = useReactToPrint({
    //     content: () => tableRef.current,
    // });

    const handleDelete = async (registrationNumber) => {
        const ConfirmToast = ({ closeToast }) => (
            <div style={{ marginTop: '100px' }}>
                <p>Are you sure you want to delete this student?</p>
                <button
                    className="text-red-700 font-bold text-xl"
                    onClick={async () => {
                        try {
                            // setLoading(true);
                            setIsLoader(true)
                            const response = await StudentDeleteRegistrations(registrationNumber);
                          
                            if (response) {
                                setIsLoader(false)
                                // setLoading(false);
                                getREg();
                            }
                        } catch (error) {
                            console.log(error);
                        } finally {
                            closeToast(); // Close the toast after the operation
                        }
                    }}
                    style={{ marginRight: "10px" }}
                >
                    Yes
                </button>
                <button onClick={closeToast} className="text-green-800 text-xl">
                    No
                </button>
            </div>
        );

        toast(<ConfirmToast />);
    };

    const handleApproveAdmissions = async () => {
        if (selectedRegistrations.length === 0) {
            toast.warn("Please select at least one registration to approve.");
            return;
        }

        const payload = {
            students: registrationData
                .filter(student => selectedRegistrations.includes(student.registrationNumber))
                .map(student => ({
                    registrationNumber: student.registrationNumber,
                    studentFullName: student.studentFullName,
                    guardianName: student.guardianName,
                    gender: student.gender,
                    registerClass: student.registerClass,
                    mobileNumber: student.mobileNumber,
                    amount: student.amount,
                    studentEmail: student.studentEmail,
                    studentAddress: student.studentAddress,
                    // Add other student details here as needed
                })),
        };
    };

    const renderMobileCards = () => {
        return (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {registrationData?.map((student, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105 cursor-pointer"
                    >
                        <div className="absolute top-2 right-2 flex space-x-2 gap-2">
                            <input
                                type="checkbox"
                                checked={selectedRegistrations.includes(student.registrationNumber)}
                                onChange={() => handleCheckboxChange(student.registrationNumber)}
                            />
                            <span onClick={() => setSelectedRegistration(student)}>
                                <AiFillEye className="text-[25px] text-green-700" />
                            </span>
                            <span onClick={() => handleDelete(student.registrationNumber)}>
                                <AiFillDelete className="text-[25px] text-red-800" />
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {student.studentFullName}
                        </h3>
                        <p>
                            <strong>Reg No:</strong> {student.registrationNumber}
                        </p>
                        <p>
                            <strong>Guardian Name:</strong> {student.guardianName}
                        </p>
                        <p>
                            <strong>Email:</strong> {student.studentEmail}
                        </p>
                        <p>
                            <strong>Class:</strong>{student.registerClass}
                        </p>
                        <p>
                            <strong>Mobile:</strong>{student.mobileNumber}
                        </p>
                        <p>
                            <strong>Address:</strong>{student.studentAddress}
                        </p>
                    </div>
                ))}
            </div>
        );
    };
    const BreadItem=[
        {
          title:"Registration",
          link:"/registration"
        }
      ]
    return (
        <div className="">
              
            {/* <Breadcrumbs BreadItem={BreadItem} />
             */}
            <div className="flex gap-1 md:flex-row ">
                <div className="mb-1 md:mb-0">
                    <RegForm setReload={setReload} reload={reload} />
                </div>
                <div className="">
                <Button
                name="Approve Admissions"
                onClick={handleApproveAdmissions}
                width="fit-content"
                color="green"
            />
                </div>
            </div>

            {/* Approve Admissions Button */}
            
            

            <div ref={tableRef}>
                {isMobile ? (
                    <>
                        {registrationData && registrationData?.length > 0 ? (
                            renderMobileCards()
                        ) : (
                            <NoDataFound />
                        )}

                    </>
                ) : (
                    registrationData && registrationData?.length > 0 ? (
                        <Table
                            isSearch={true}
                            tHead={THEAD}
                            tBody={tBody} />

                    ) : (
                        <NoDataFound />
                    )
                )}
                {selectedRegistration && (
                    <MobileRegistrationCard
                        student={selectedRegistration}
                        onClose={() => setSelectedRegistration(null)}
                        handleDelete={handleDelete}
                    />
                )}
            </div>

        </div>
    );
};

export default Newegistrations;

