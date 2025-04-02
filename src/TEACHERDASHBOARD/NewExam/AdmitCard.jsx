
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider";
import { MdDownload } from "react-icons/md";
import axios from "axios";


const AdmitCard = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedAllStudent, setSelectedAllStudent] = useState(false);
    const { currentColor } = useStateContext();
    const [loading, setLoading] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [examData, setExamData] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState("");
    const [resultPublishDate, setResultPublishDate] = useState(null);
    const schoolImage = sessionStorage.getItem("schoolImage");
    const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
    const componentPDF = useRef();
    const allStudentsPDF = useRef();
    const authToken = localStorage.getItem("token");

    const generatePDF = useReactToPrint({
        content: () =>
            selectedAllStudent ? allStudentsPDF.current : componentPDF.current,
        documentTitle: `${
            selectedAllStudent
                ? "All_Students_Admit_Card"
                : selectedStudent?.fullName || "Student"
        }_Admit_Card`,
        onAfterPrint: () => alert("Downloaded successfully"),
    });

    const getResult = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "https://dvsserver.onrender.com/api/v1/exam/getExams",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            setLoading(false);
            setExamData(response.data.exams);
        } catch (error) {
            console.error("Error fetching exams:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getResult();
    }, []);

    useEffect(() => {
        setLoading(true);
        const students = JSON.parse(localStorage.getItem("studentsData"));
        if (students) {
            setLoading(false);
            setAllStudents(students || []);
        }
    }, []);

    const handleTermChange = (event) => {
        setSelectedTerm(event.target.value);
        const selectedExam = examData.find(
            (exam) => exam._id === event.target.value
        );
        if (selectedExam) {
            setResultPublishDate(selectedExam.resultPublishDate);
        } else {
            setResultPublishDate(null);
        }
    };

     const getDay = (date) => {
        return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatIssueDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(":");
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderExamTable = () => {
        if (!examData || examData.length === 0) {
            return <p>No exams scheduled.</p>;
        }

        const filteredExams = selectedTerm
            ? examData.filter((exam) => exam._id === selectedTerm)
            : examData;

        return filteredExams.map((exam) => (
            <div className="mb-4 border-2" key={exam._id}>
                <h4 className="font-bold text-lg p-2">{exam.name}</h4>
                <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
                    <thead>
                        <tr className="">
                            <th className="border border-gray-300 p-2">Subject</th>
                            <th className="border border-gray-300 p-2">
                                Examination Date
                            </th>
                            <th className="border border-gray-300 p-2">Day</th>
                            <th className="border border-gray-300 p-2">Timing</th>
                            <th className="border border-gray-300 p-2">
                                Checked By
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {exam?.subjects?.map((subject) => (
                            <tr key={subject._id}>
                                <td className="border border-gray-300 p-2">
                                    {subject.name}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {formatDate(subject.examDate)}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {getDay(subject.examDate)}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    {formatTime(subject.startTime)} to{" "}
                                    {formatTime(subject.endTime)}
                                </td>
                                <td className="border border-gray-300 p-2">
                                    ....................
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ));
    };

    const handleStudentChange = (e) => {
        if (e.target.value === "all") {
            setSelectedAllStudent(true);
            setSelectedStudent(null);
        } else {
            setSelectedAllStudent(false);
            const selected = allStudents.find(
                (student) => student?._id === e.target.value
            );
            setSelectedStudent(selected);
        }
    };

    return (
        <div>
            <div
                className="rounded-tl-lg mt-12 sm:mt-12 md:mt-0 w-full rounded-tr-lg border flex justify-between text-white py-2 px-2"
                style={{
                    background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
                }}
            >
                <p className="text-lg">Admit Card</p>
                <MdDownload
                    onClick={generatePDF}
                    className="text-2xl cursor-pointer"
                />
            </div>
            <div className="flex w-full flex-col sm:flex-row gap-2 p-2">
                <div className="w-full sm:w-auto">
                    <select
                        className="p-2 border rounded w-full sm:w-auto"
                        onChange={handleStudentChange}
                    >
                        <option value="">Select a student</option>
                        <option value="all">All Students</option>
                        {allStudents.map((student) => (
                            <option key={student?._id} value={student?._id}>
                                {student?.fullName} - Class {student?.class}{" "}
                                {student?.section} (Roll No: {student?.rollNo})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-auto">
                    <select
                        className="p-2 border rounded w-full sm:w-auto"
                        value={selectedTerm}
                        onChange={handleTermChange}
                    >
                        <option value="">All terms</option>
                        {examData.map((exam) => (
                            <option key={exam?._id} value={exam?._id}>
                                {exam?.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
             <div className="w-full flex justify-center overflow-x-auto">
                <div className="a4">
                    {selectedAllStudent ? (
                        <div ref={allStudentsPDF} className="">
                            {allStudents.map((student) => (
                                <div className="p-4 sm:p-12" key={student?._id}>
                                    <div className="bg-white border-2 rounded-md p-4 sm:p-6 max-w-4xl mx-auto mb-6">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap">
                                            <div className="h-[50px] w-[50px] sm:h-[70px] sm:w-[70px]">
                                                <img
                                                    src={schoolImage}
                                                    alt="School Logo"
                                                    className="w-full object-contain"
                                                />
                                            </div>
                                            <div className="text-center flex-1">
                                                <h1 className="text-red-600 font-bold text-xl sm:text-3xl">
                                                    {SchoolDetails?.schoolName}
                                                </h1>
                                                <p className="text-blue-600 text-sm sm:text-xl">
                                                    {SchoolDetails?.address}
                                                </p>
                                                <p className="text-green-600 text-xs sm:text-sm font-bold">
                                                    {SchoolDetails?.email}
                                                </p>
                                                <p className="text-green-600 text-xs sm:text-sm font-bold">
                                                    {SchoolDetails?.contact}
                                                </p>
                                            </div>
                                            <div className="w-[50px] sm:w-[70px]"></div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 border p-2 mb-1">
                                            <div>
                                                <table className=" text-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td className="font-semibold py-1 whitespace-nowrap">
                                                                Admission No. :
                                                            </td>
                                                            <td className="whitespace-nowrap text-blue-700 font-semibold">
                                                                {student?.admissionNumber || "N/A"}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-1 whitespace-nowrap">
                                                                Student's Name :
                                                            </td>
                                                            <td className="whitespace-nowrap">
                                                                {student?.fullName || "N/A"}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-1 whitespace-nowrap">
                                                                Father's Name :
                                                            </td>
                                                            <td className="whitespace-nowrap">
                                                                {student?.fatherName || "N/A"}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-1 whitespace-nowrap">
                                                                Mother's Name :
                                                            </td>
                                                            <td className="whitespace-nowrap">
                                                                {student?.motherName || "N/A"}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div>
                                                <table className="ml-3 text-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td className="font-semibold py-1 whitespace-nowrap">
                                                                Class :
                                                            </td>
                                                            <td>
                                                                {student?.class || "N/A"}-
                                                                {student?.section || ""}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-1 whitespace-nowrap">
                                                                Roll No. :
                                                            </td>
                                                            <td className="whitespace-nowrap">
                                                                {student?.rollNo || "N/A"}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="font-semibold py-1">
                                                                DOB :
                                                            </td>
                                                            <td>
                                                                {student?.dateOfBirth
                                                                    ? new Date(
                                                                        student.dateOfBirth
                                                                    ).toLocaleDateString(
                                                                        "en-GB",
                                                                        {
                                                                            day: "2-digit",
                                                                            month: "2-digit",
                                                                            year: "numeric",
                                                                        }
                                                                    )
                                                                    : "N/A"}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex justify-end ">
                                                <img
                                                    src={
                                                        student?.image?.url ||
                                                        "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                                                    }
                                                    alt="Student"
                                                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-300 "
                                                />
                                            </div>
                                        </div>
                                        {renderExamTable()}

                                        <div className="mb-4 mt-4 text-[10px] sm:text-[12px]">
                                            <h4 className="font-semibold mb-1 ">
                                                General/Exam Instructions for Students
                                            </h4>
                                            <ol className="list-decimal pl-5">
                                                <li>
                                                    Check the exam timetable carefully.
                                                </li>
                                                <li>
                                                    Students must bring their own lunch to
                                                    school.
                                                </li>
                                                <li>
                                                    Students must bring their own{" "}
                                                    <span className="font-semibold">
                                                        Admit Card
                                                    </span>
                                                    ' and show it to the invigilator(s) on
                                                    duty and should preserve it for future
                                                    requirements.
                                                </li>
                                                <li>
                                                    Mobile Phone, Calculator, Digital Watch or
                                                    any Electronic Device is{" "}
                                                    <span className="font-semibold">
                                                        NOT ALLOWED
                                                    </span>
                                                    .
                                                </li>
                                                <li>
                                                    Arrive at the School at least 15 minutes
                                                    before the start of the examination.
                                                </li>
                                                <li>
                                                    Student is barred from entering the
                                                    examination hall 15 minutes after the
                                                    written examination starts.
                                                </li>
                                                <li>
                                                    Ensure that you use the washroom before
                                                    arriving for your exam as you will not be
                                                    permitted to leave during the first hour.
                                                </li>
                                                <li>
                                                    Normally, you are required to answer
                                                    questions using blue or black ink. Make
                                                    sure you bring some spare pens with you.
                                                </li>
                                                <li>
                                                    Keep your eyes on your own paper. Remember,
                                                    copying is cheating!
                                                </li>
                                                <li>
                                                    You must remain silent until after you have
                                                    exited the school building.
                                                </li>
                                            </ol>
                                        </div>

                                        <div className="flex justify-between mt-6 text-xs sm:text-sm flex-wrap">
                                            <div className="text-center">
                                                <p className="font-semibold">
                                                    Date of Issue
                                                </p>
                                                <p className="border-t pt-1">
                                                    {formatIssueDate(
                                                        resultPublishDate
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold">
                                                    Signature of the Guardian
                                                </p>
                                                <p className="border-t pt-1">
                                                    ............................
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold">
                                                    Class Teacher
                                                </p>
                                                <p className="border-t pt-1">
                                                    ............................
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold">
                                                    Principal
                                                </p>
                                                 <p className="border-t pt-1">{SchoolDetails?.fullName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div ref={componentPDF} className="p-4 sm:p-12">
                            <div className="bg-white border-2 rounded-md p-4 sm:p-6 max-w-4xl mx-auto mb-6">
                                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap">
                                    <div className="h-[50px] w-[50px] sm:h-[70px] sm:w-[70px]">
                                        <img
                                            src={schoolImage}
                                            alt="School Logo"
                                            className="w-full object-contain"
                                        />
                                    </div>
                                     <div className="text-center flex-1">
                                        <h1 className="text-red-600 font-bold text-xl sm:text-3xl">
                                            {SchoolDetails?.schoolName}
                                        </h1>
                                        <p className="text-blue-600 text-sm sm:text-xl">
                                            {SchoolDetails?.address}
                                        </p>
                                        <p className="text-green-600 text-xs sm:text-sm font-bold">
                                            {SchoolDetails?.email}
                                        </p>
                                        <p className="text-green-600 text-xs sm:text-sm font-bold">
                                            {SchoolDetails?.contact}
                                        </p>
                                    </div>
                                    <div className="w-[50px] sm:w-[70px]"></div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 border p-2 mb-1">
                                    <div>
                                        <table className=" text-sm">
                                            <tbody>
                                                <tr>
                                                    <td className="font-semibold py-1 whitespace-nowrap">
                                                        Admission No. :
                                                    </td>
                                                    <td className="whitespace-nowrap text-blue-700 font-semibold">
                                                        {selectedStudent?.admissionNumber ||
                                                            "N/A"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold py-1 whitespace-nowrap">
                                                        Student's Name :
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        {selectedStudent?.fullName ||
                                                            "N/A"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold py-1 whitespace-nowrap">
                                                        Father's Name :
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        {selectedStudent?.fatherName ||
                                                            "N/A"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold py-1 whitespace-nowrap">
                                                        Mother's Name :
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        {selectedStudent?.motherName ||
                                                            "N/A"}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div>
                                        <table className="ml-3 text-sm">
                                            <tbody>
                                                <tr>
                                                    <td className="font-semibold py-1 whitespace-nowrap">
                                                        Class :
                                                    </td>
                                                    <td>
                                                        {selectedStudent?.class ||
                                                            "N/A"}-
                                                        {selectedStudent?.section || ""}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold py-1 whitespace-nowrap">
                                                        Roll No. :
                                                    </td>
                                                    <td className="whitespace-nowrap">
                                                        {selectedStudent?.rollNo ||
                                                            "N/A"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold py-1">
                                                        DOB :
                                                    </td>
                                                    <td>
                                                        {selectedStudent?.dateOfBirth
                                                            ? new Date(
                                                                selectedStudent.dateOfBirth
                                                            ).toLocaleDateString(
                                                                "en-GB",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                }
                                                            )
                                                            : "N/A"}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end ">
                                        <img
                                            src={
                                                selectedStudent?.image?.url ||
                                                "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                                            }
                                            alt="Student"
                                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-300 "
                                        />
                                    </div>
                                </div>

                                {renderExamTable()}

                                <div className="mb-4 mt-4 text-[10px] sm:text-[12px]">
                                    <h4 className="font-semibold mb-1 ">
                                        General/Exam Instructions for Students
                                    </h4>
                                    <ol className="list-decimal pl-5">
                                        <li>
                                            Check the exam timetable carefully.
                                        </li>
                                        <li>
                                            Students must bring their own lunch to
                                            school.
                                        </li>
                                        <li>
                                            Students must bring their own '
                                            <span className="font-semibold">
                                                Admit Card
                                            </span>
                                            ' and show it to the invigilator(s) on
                                            duty and should preserve it for future
                                            requirements.
                                        </li>
                                        <li>
                                            Mobile Phone, Calculator, Digital Watch or
                                            any Electronic Device is{" "}
                                            <span className="font-semibold">
                                                NOT ALLOWED
                                            </span>
                                            .
                                        </li>
                                        <li>
                                            Arrive at the School at least 15 minutes
                                            before the start of the examination.
                                        </li>
                                        <li>
                                            Student is barred from entering the
                                            examination hall 15 minutes after the
                                            written examination starts.
                                        </li>
                                        <li>
                                            Ensure that you use the washroom before
                                            arriving for your exam as you will not be
                                            permitted to leave during the first hour.
                                        </li>
                                        <li>
                                            Normally, you are required to answer
                                            questions using blue or black ink. Make
                                            sure you bring some spare pens with you.
                                        </li>
                                        <li>
                                            Keep your eyes on your own paper. Remember,
                                            copying is cheating!
                                        </li>
                                        <li>
                                            You must remain silent until after you have
                                            exited the school building.
                                        </li>
                                    </ol>
                                </div>

                                <div className="flex justify-between mt-6 text-xs sm:text-sm flex-wrap">
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            Date of Issue
                                        </p>
                                        <p className="border-t pt-1">
                                            {formatIssueDate(resultPublishDate)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            Signature of the Guardian
                                        </p>
                                        <p className="border-t pt-1">
                                            ............................
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            Class Teacher
                                        </p>
                                        <p className="border-t pt-1">
                                            ............................
                                        </p>
                                    </div>
                                     <div className="text-center">
                                         <p className="font-semibold">Principal</p>
                                           <p className="border-t pt-1">{SchoolDetails?.fullName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};

export default AdmitCard;


