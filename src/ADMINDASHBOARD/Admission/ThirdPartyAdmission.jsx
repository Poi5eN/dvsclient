import React, { useEffect, useState } from 'react';
import { adminapproveAdmissions, adminpendingAdmissions } from '../../Network/AdminApi';
import Table from '../../Dynamic/Table';
import Button from '../../Dynamic/utils/Button';
import { toast } from 'react-toastify';
import { useStateContext } from '../../contexts/ContextProvider';

const ThirdPartyAdmission = () => {
     const { currentColor ,setIsLoader} = useStateContext();
    const [studentDetails, setStudentDetails] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Fetch student data
    const studentData = async () => {
        setIsLoader(true);
        try {
            const response = await adminpendingAdmissions();
            if (response?.success) {
                setStudentDetails(response.data);
            } else {
                console.log('No data found');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        finally{
            setIsLoader(false);
        }
    };

    useEffect(() => {
        studentData();
    }, []);

    // Handle select all checkbox
    const handleSelectAllChange = () => {
        if (!selectAll) {
            // Select all students
            const allStudentIds = studentDetails.map((student) => student._id);
            setSelectedStudent(allStudentIds);
        } else {
            // Unselect all students
            setSelectedStudent([]);
        }
        setSelectAll(!selectAll);
    };

    // Handle individual checkbox selection
    const handleCheckboxChange = (studentId) => {
        setSelectedStudent((prevSelected) =>
            prevSelected.includes(studentId)
                ? prevSelected.filter((id) => id !== studentId) // Unselect
                : [...prevSelected, studentId] // Select
        );
    };

    // Update select all status when selected students change
    useEffect(() => {
        setSelectAll(studentDetails.length > 0 && selectedStudent.length === studentDetails.length);
    }, [studentDetails, selectedStudent]);

    // Approve selected students
    const handleApproved = async () => {
        if (selectedStudent.length === 0) {
            toast.warn('Please select at least one student');
            return;
        }

        const payload = { studentIds: selectedStudent };
        setIsLoader(true)

        try {
            const response = await adminapproveAdmissions(payload);
            if (response?.success) {
                toast.success(response?.message);
                studentData(); // Refresh list
            } else {
                toast.error(response?.message);
            }
        } catch (error) {
            console.error('Error approving students:', error);
        }
        finally{
            setIsLoader(false)
        }
    };

    // Table Headers
    const THEAD = [
        {
            id: 'select',
            label: (
                <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
            ),
        },
        { id: 'SN', label: 'S No.' },
        { id: 'admissionNumber', label: 'Admission No' },
        { id: 'fullName', label: 'Name' },
        { id: 'guardianName', label: 'Father Name' },
        { id: 'gender', label: 'Gender' },
        { id: 'class', label: 'Class' },
        { id: 'approvalStatus', label: 'Status' },
        { id: 'contact', label: 'Contact' },
        { id: 'amount', label: 'Reg. Fee' },
    ];

    // Table Body
    const tBody = studentDetails.map((val, ind) => ({
        select: (
            <input
                type="checkbox"
                checked={selectedStudent.includes(val._id)}
                onChange={() => handleCheckboxChange(val._id)}
            />
        ),
        SN: ind + 1,
        admissionNumber: <span className="text-red-700 font-semibold">{val.admissionNumber}</span>,
        fullName: val.fullName,
        guardianName: val.guardianName,
        gender: val.gender,
        class: val.class,
        approvalStatus: val.approvalStatus,
        contact: val.contact,
        amount: val.amount,
    }));

    return (
        <>
            <div className="w-full flex justify-end p-2">
                <Button onClick={handleApproved} name="Approve" />
            </div>
            <Table isSearch={true} tHead={THEAD} tBody={tBody} />
        </>
    );
};

export default ThirdPartyAdmission;






// import React, { useEffect, useState } from 'react'
// import { adminapproveAdmissions, adminpendingAdmissions, adminThirdPartystudents } from '../../Network/AdminApi'
// import Table from '../../Dynamic/Table'
// import { AiFillEye } from 'react-icons/ai'
// import Button from '../../Dynamic/utils/Button'
// import { toast } from 'react-toastify'

// const ThirdPartyAdmission = () => {
//     const [studentDetails, setStudentDetails] = useState([])
//     const [selectedStudent, setSelectedStudent] = useState([]);
//     const [selectAll, setSelectAll] = useState(false);


//     const studentData = async () => {
//         try {
//             const response = await adminpendingAdmissions()

//             if (response?.success) {
//                 setStudentDetails(response.data)
//             }
//             else {
//                 console.log("No data found")
//             }
//         } catch (error) {

//         }
//     }
//     useEffect(() => {

//         studentData()
//     }, [])


//     const handleSelectAllChange = () => {
//         setSelectAll(!selectAll);

//         if (!selectAll) {
//             // Select all
//             const allAdmissionnNumbers = studentDetails?.map((student) => student.admissionNumber);
//             setSelectedStudent(allAdmissionnNumbers);
//         } else {
//             // Unselect all
//             setSelectedStudent([]);
//         }
//     };

//     const THEAD = [
//         {
//             id: "select", label: (
//                 <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={handleSelectAllChange}
//                 />
//             )
//         }, // New column for checkbox
//         { id: "SN", label: "S No." },
//         { id: "admissionNumber", label: "Admission No" },
//         { id: "fullName", label: "Name" },
//         { id: "guardianName", label: "Father Name" },
//         { id: "gender", label: "Gender" },
//         { id: "class", label: "Class" },
//         { id: "approvalStatus", label: "Status" },
//         { id: "contact", label: "Contact" },
//         { id: "amount", label: "Reg. Fee" },
//         { id: "action", label: "Action" },
//     ];

//     const handleCheckboxChange = (admissionNumber) => {
//         setSelectedStudent((prevSelected) => {
//             if (prevSelected.includes(admissionNumber)) {
//                 return prevSelected.filter((regNum) => regNum !== admissionNumber); // Unselect
//             } else {
//                 return [...prevSelected, admissionNumber]; // Select
//             }
//         });
//     };
//     useEffect(() => {
//         if (studentDetails?.length > 0) {
//             setSelectAll(selectedStudent.length === studentDetails?.length);
//         } else {
//             setSelectAll(false);
//         }
//     }, [studentDetails, selectedStudent]);
//     const tBody = studentDetails?.map((val, ind) => ({
//         select: (
//             <input
//                 type="checkbox"
//                 checked={selectedStudent.includes(val._id)}
//                 onChange={() => handleCheckboxChange(val._id)}
//             />
//         ),
//         "SN": ind + 1,
//         admissionNumber: <span className="text-red-700 font-semibold">{val.admissionNumber}</span>,
//         fullName: val.fullName,
//         guardianName: val.guardianName,
//         gender: val.gender,
//         class: val.class,
//         approvalStatus: val.approvalStatus,
//         contact: val.contact,
//         amount: val.amount,
//         feeStatus: val.feeStatus,
//         // action: <span onClick={() => setSelectedRegistration(val)} className="cursor-pointer">
//         //     <AiFillEye className="text-[25px] text-green-700" />
//         // </span>
//     }));

//     const handleApproved = async () => {
//         if (selectedStudent?.length <= 0) {
//             toast.warn("please Select student atleast one student")
//             return
//         }
//         const payload = {
//             studentIds: selectedStudent
//         }
//         console.log("payload", payload)
//         try {
//             const response = await adminapproveAdmissions(payload)
//             console.log("response adminapproveAdmissions", response)
//             if (response?.success) {
//                 studentData()
//                 toast.success(response?.message)

//             }
//             else {
//                 toast.error(response?.message)
//             }
//         } catch (error) {

//         }
//         console.log("first selectedStudent", selectedStudent)
//     }
//     return (
//         <>
//             <div className='w-full flex justify-end p-2'>
//                 <Button
//                     onClick={handleApproved}
//                     name="Approved" />
//             </div>
//             <Table
//                 isSearch={true}
//                 tHead={THEAD}
//                 tBody={tBody} />

//         </>
//     )
// }

// export default ThirdPartyAdmission