import React, { useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import { toast } from "react-toastify";
import AOS from "aos";
import * as XLSX from "xlsx";
import "aos/dist/aos.css";
import Button from "../../Dynamic/utils/Button.jsx";
import Modal from "../../Dynamic/Modal.jsx";
import { admissionbulk } from "../../Network/AdminApi.js";

AOS.init();

const BulkAdmission = ({ refreshRegistrations }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentColor } = useStateContext();
  const [file, setFile] = useState(null);
  const [credentialsModal, setCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const submit = async () => {
    if (!file) {
      toast.error("Please select a file before submitting.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const payload = { students: worksheet };
        const response = await admissionbulk(payload);

        if (response.success) {
          toast.success(response.message);
          setGeneratedCredentials(response.generatedCredentials || []);
          setCredentialsModal(true);
          setModalOpen(false);
          // refreshRegistrations(); // Uncomment if needed
        } else {
          toast.error(response.message);
        }

        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((err) => toast.error(`${err.studentEmail}: ${err.error}`));
        }
      } catch (error) {
        console.error("Error processing file", error);
        toast.error("An error occurred while processing the file.");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <Button name="Bulk Admission" onClick={() => setModalOpen(true)} />
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Bulk Admission">
        <div className="grid md:grid-cols-1 grid-cols-1 gap-2 p-5 bg-gray-50">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="h-10 border mt-1 rounded px-4 bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
          />
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
            <Button loading={loading} type="submit" name="Submit" width="full" onClick={submit} />
            <Button name="Cancel" onClick={() => setModalOpen(false)} width="full" color="gray" />
          </div>
        </div>
      </Modal>

      <Modal isOpen={credentialsModal} setIsOpen={setCredentialsModal} title="Generated Credentials">
        <div className="p-5 max-h-96 overflow-y-auto">
          {generatedCredentials.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-secondary-dark-bg">
                  <th className="border p-2">Student Name</th>
                  <th className="border p-2">Student Email</th>
                  <th className="border p-2">Student Password</th>
                  <th className="border p-2">Parent Email</th>
                  <th className="border p-2">Parent Password</th>
                  <th className="border p-2">Parent Admission No.</th>
                </tr>
              </thead>
              <tbody>
                {generatedCredentials.map((cred, index) => (
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                    <td className="border p-2">{cred.studentName}</td>
                    <td className="border p-2">{cred.studentEmail}</td>
                    <td className="border p-2">{cred.studentPassword}</td>
                    <td className="border p-2">{cred.parentEmail}</td>
                    <td className="border p-2">{cred.parentPassword}</td>
                    <td className="border p-2">{cred.parentAdmissionNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No credentials generated.</p>
          )}
          <div className="mt-4 flex justify-center">
            <Button name="Close" onClick={() => setCredentialsModal(false)} width="full" color="gray" />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BulkAdmission;


// import React, { useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import { toast } from "react-toastify";
// import AOS from "aos";
// import * as XLSX from "xlsx";
// import "aos/dist/aos.css";
// import Button from "../../Dynamic/utils/Button.jsx";
// import Modal from "../../Dynamic/Modal.jsx";
// import { admissionbulk } from "../../Network/AdminApi.js";

// AOS.init();

// const authToken = localStorage.getItem("token");

// const BulkAdmission = ({ refreshRegistrations }) => {
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { currentColor } = useStateContext();
//   const [file, setFile] = useState(null);
//   const handleFileUpload = (e) => {
//     const uploadedFile = e.target.files[0];
//     setFile(uploadedFile);
//   };
//   const [isOpen, setIsOpen] = useState(false);

 
//   const submit=async()=>{
//     const reader = new FileReader();
//       reader.onload = async (e) => {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//         const payload={
//           students:worksheet
//         }
//       // }
//     try {
//       const response =await admissionbulk(payload)
//       if(response?.message){
//         toast.success(response?.message)
//         setIsOpen(false);
//           setModalOpen(false);
//       }
//       else{
//         toast.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//   }
//   }
//   return (
//     <>
//       <Button
//         name="Bulk Admission"
//         onClick={() => setModalOpen(true)}
//         //  onClick={toggleModal}
//       />

//       <Modal
//         isOpen={modalOpen}
//         setIsOpen={setModalOpen}
//         title={`Bulk Admission`}
//       >
//         <div className="grid md:grid-cols-1 grid-cols-1 gap-2 p-5 bg-gray-50">
       
//             <input
//               type="file"
//               onChange={handleFileUpload}
//               accept=".xlsx, .xls"
//               className="h-10  border mt-1 rounded px-4  bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//             />
        
//           <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
//             <Button
//               loading={loading}
//               type="submit"
//               name="Submit"
//               width="full"
//               // onClick={processFile}
//               onClick={submit}
//             />
            
//             <Button
//               name="Cancel"
//               onClick={() => setModalOpen(false)}
//               width="full"
//               color="gray"
//             />
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// };

// export default BulkAdmission;
