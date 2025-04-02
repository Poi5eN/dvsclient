import React, { useState, useEffect, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { getStudentData_TeacherColumns } from "../../Dynamic/utils/TableUtils";
import NoDataFound from "../../NoDataFound";
import DynamicDataTable from "../../Dynamic/DynamicDataTable";
import { getAllStudents } from "../../Network/TeacherApi";
import { toast } from "react-toastify";

function Create_Student() {
    const { currentColor,setIsLoader  } = useStateContext();
    const [submittedData, setSubmittedData] = useState([]);
    const tableRef = useRef(); // Ref for printing
    const isMobile = window.innerWidth <= 768;
    const user = JSON.parse(localStorage.getItem("user"));
     const param = {
            class: user?.classTeacher,
            section: user?.section
        }
        const allStudent = async () => {
            setIsLoader(true)
            try {
                const response = await getAllStudents(param);
    
                if (response?.success) {
                    setIsLoader(false)
                    setSubmittedData(response?.students?.data);
                } else {
                    toast.error(response?.message);
    
                }
            } catch (error) {
                console.log("error", error);
    
            }
            finally {
                setIsLoader(false)
            }
        };
          useEffect(() => {
            allStudent();
        }, []);
    


     const renderMobileStudentCards = () => {
         return (
             <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {submittedData.map((student, index) => (
                     <div key={index} className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105">
                            <img
                            src={student?.image?.url}
                            alt="Student"
                             className="absolute top-2 right-2 h-8 w-8 rounded-full object-cover"
                          />
                            <h3 className="text-lg font-semibold mb-2">{student.studentName}</h3>
                            <p><strong>Roll No:</strong> {student.rollNo}</p>
                            <p><strong>Adm No:</strong> {student.admissionNumber}</p>
                           
                            <p><strong>Father's Name:</strong> {student.fatherName}</p>
                            <p><strong>Mother's Name:</strong> {student.motherName}</p>
                            <p><strong>Contact:</strong> {student.contact}</p>
                        </div>
                    ))}
            </div>
        );
    };

    return (
        <div className="">
          <h1 className="text-xl text-center font-bold uppercase" 
          style={{color:currentColor}}
          >Student</h1>
            {/* <Heading2 title={"Students"} /> */}
             {/* <Button name="Print" onClick={handlePrint}  /> */}
            <div ref={tableRef}>
            {isMobile ? (
                   submittedData.length > 0 ? (
                    renderMobileStudentCards()
                    ) : (
                       <NoDataFound />
                     )
               ) : (
                    <>
                      {submittedData.length > 0 ? (
                            <DynamicDataTable
                                data={submittedData}
                                columns={getStudentData_TeacherColumns()}
                                className="w-full overflow-auto"
                                itemsPerPage={15}
                            />
                         ) : (
                            <NoDataFound />
                         )}
                    </>
                )}
          </div>
        </div>
    );
}

export default Create_Student;


