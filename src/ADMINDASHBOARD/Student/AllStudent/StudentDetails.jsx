import React from "react";
import { MdArrowBack } from "react-icons/md";
import moment from "moment"; // Import moment for date formatting

const StudentDetails = ({ student, onBack }) => {

    // Helper function for consistent date formatting
    const formatDate = (dateString, inputFormat = null) => {
        // Check if the dateString is valid before formatting
        // If an inputFormat is provided (like for joiningDate), use it.
        const date = inputFormat ? moment(dateString, inputFormat) : moment(dateString);
        return date.isValid() ? date.format("DD MMM YYYY") : "N/A";
    };

    // Helper function to display fields safely and consistently
    const displayField = (label, value) => (
        <div className="flex flex-wrap py-1.5 border-b border-gray-200 last:border-b-0">
            <strong className="w-full sm:w-2/5 md:w-1/3 text-sm font-medium text-gray-600">{label}:</strong>
            <span className="w-full sm:w-3/5 md:w-2/3 text-sm text-gray-800 break-words">{value || "N/A"}</span>
        </div>
    );

    // Helper function to display an image with a label
    const displayImageField = (label, imageUrl, altTextBase) => {
        const defaultImage = "https://via.placeholder.com/80?text=No+Image";
        return (
            <div className="text-center mb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
                <img
                    src={imageUrl || defaultImage}
                    alt={`${label} for ${altTextBase}`}
                    className="w-20 h-20 object-cover rounded-md border border-gray-300 inline-block shadow-sm" // Smaller images
                />
            </div>
        );
    }


    // Basic check if student data is provided
    if (!student) {
        return (
            <div className="p-4 text-center text-red-500">
                Student data is not available.
                 <button
                     onClick={onBack} // Allow going back even if data is missing
                     className="mt-4 flex items-center justify-center mx-auto text-blue-600 hover:text-blue-800"
                 >
                     <MdArrowBack className="mr-2" /> Back to List
                 </button>
            </div>
        );
    }

    // Construct full address string safely
    const fullAddress = [
        student.address,
        student.city,
        student.state,
        student.country,
        student.pincode,
    ].filter(Boolean).join(', ') || "N/A"; // Join non-empty parts

    return (
        // Container with padding, rounded corners, shadow for better visual separation
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-6xl mx-auto my-4"> {/* Increased max-width */}

            {/* Back Button */}
            <button
                onClick={onBack} // Use the onBack prop here
                className="flex items-center mb-4 sm:mb-6 text-blue-600 hover:text-blue-800 transition duration-150"
            >
                <MdArrowBack className="mr-2" /> Back to List
            </button>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10"> {/* Changed breakpoint to lg for wider layout */}

                {/* Left Section - Student Image & Basic Info */}
                <div className="w-full lg:w-1/4 flex flex-col items-center text-center pt-4"> {/* Adjusted width */}
                    <img
                        src={student.studentImage?.url || "https://via.placeholder.com/150?text=No+Image"} // Placeholder
                        alt={`Photo of ${student.studentName || 'student'}`} // Improved alt text
                        className="w-40 h-40 object-cover rounded-full border-4 border-gray-200 shadow-lg mb-4" // Adjusted size
                    />
                    <h2 className="text-xl font-semibold text-gray-800">{student.studentName || 'N/A'}</h2>
                    <p className="text-sm text-gray-500 mt-1">Admission No: {student.admissionNumber || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Roll No: {student.rollNo || 'N/A'}</p>
                    <p className={`text-sm font-medium mt-2 ${student.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                        Status: {student.status === 'active' ? 'Active' : 'Inactive'}
                    </p>
                     {/* Display Student Image Separately if needed, or keep as main profile pic */}
                     {/* {displayImageField("Student Image", student.studentImage?.url, student.studentName)} */}
                </div>

                {/* Right Section - Detailed Information in Tabs or Sections */}
                <div className="flex-1 lg:w-3/4"> {/* Adjusted width */}

                     {/* Section 1: Student Information */}
                     <div className="mb-6">
                         <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                             Student Information
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6"> {/* Grid layout for better alignment */}
                             <div className="space-y-1">
                                {displayField("Class", `${student.class || 'N/A'} ${student.section ? `- ${student.section}` : ''}`)}
                                {displayField("Email", student.email)}
                                {displayField("Gender", student.gender)}
                                {displayField("Date of Birth", formatDate(student.dateOfBirth))}
                                {/* Explicitly provide input format for non-standard date strings */}
                                {displayField("Joining Date", formatDate(student.joiningDate, "DD MMMM YYYY"))}
                                {displayField("Contact Number", student.contact)}
                                {displayField("Alternate Contact", student.alternateContact)} {/* If available */}
                             </div>
                             <div className="space-y-1">
                                {displayField("Religion", student.religion)}
                                {displayField("Caste", student.caste)}
                                {displayField("Nationality", student.nationality)}
                                {displayField("Transport Required", student.transport ? student.transport.charAt(0).toUpperCase() + student.transport.slice(1) : "N/A")}
                                {displayField("Full Address", fullAddress)}
                                {/* Display individual address parts if preferred */}
                                {/* {displayField("Address", student.address)}
                                {displayField("City", student.city)}
                                {displayField("State", student.state)}
                                {displayField("Country", student.country)}
                                {displayField("Pincode", student.pincode)} */}
                             </div>
                         </div>
                    </div>

                    {/* Section 2: Parent & Guardian Information */}
                    <div>
                         <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                             Parent & Guardian Information
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-4">
                            <div className="space-y-1">
                                {displayField("Father's Name", student.fatherName)}
                                {displayField("Mother's Name", student.motherName)}
                                {/* {displayField("Guardian's Name", student.guardianName)}  Add if available */}
                                {displayField("Parent ID", student.parentId)} {/* Or Parent Admission No */}
                                {displayField("Parent Contact", student.parentContact)} {/* If available */}
                                {displayField("Parent Email", student.parentEmail)} {/* If available */}
                            </div>
                         </div>
                         {/* Parent/Guardian Images */}
                         <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                            {displayImageField("Father Image", student.fatherImage?.url, student.studentName)}
                            {displayImageField("Mother Image", student.motherImage?.url, student.studentName)}
                            {displayImageField("Guardian Image", student.guardianImage?.url, student.studentName)}
                         </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StudentDetails;




// import React from "react";
// import { MdArrowBack } from "react-icons/md";
// import moment from "moment"; // Import moment for date formatting

// // Accept 'onBack' prop instead of 'setViewStudent'
// const StudentDetails = ({ student, onBack }) => {

//     // Helper function for consistent date formatting
//     const formatDate = (dateString) => {
//         // Check if the dateString is valid before formatting
//         return dateString ? moment(dateString).format("DD MMM YYYY") : "N/A";
//     };

//     // Helper function to display fields safely and consistently
//     const displayField = (label, value) => (
//         <div className="flex flex-wrap py-1 border-b border-gray-200 last:border-b-0">
//             <strong className="w-full sm:w-1/3 text-sm font-medium text-gray-600">{label}:</strong>
//             <span className="w-full sm:w-2/3 text-sm text-gray-800">{value || "N/A"}</span>
//         </div>
//     );


//     // Basic check if student data is provided
//     if (!student) {
//         return (
//             <div className="p-4 text-center text-red-500">
//                 Student data is not available.
//                  <button
//                      onClick={onBack} // Allow going back even if data is missing
//                      className="mt-4 flex items-center justify-center mx-auto text-blue-600 hover:text-blue-800"
//                  >
//                      <MdArrowBack className="mr-2" /> Back to List
//                  </button>
//             </div>
//         );
//     }

//     return (
//         // Container with padding, rounded corners, shadow for better visual separation
//         <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-5xl mx-auto my-4">

//             {/* Back Button */}
//             <button
//                 onClick={onBack} // Use the onBack prop here
//                 className="flex items-center mb-4 sm:mb-6 text-blue-600 hover:text-blue-800 transition duration-150"
//             >
//                 <MdArrowBack className="mr-2" /> Back to List
//             </button>

//             <div className="flex flex-col md:flex-row gap-6 lg:gap-8">

//                 {/* Left Section - Image & Basic Info */}
//                 <div className="w-full md:w-1/3 flex flex-col items-center text-center pt-4">
//                     <img
//                         src={student.studentImage?.url || "https://via.placeholder.com/150?text=No+Image"} // Placeholder
//                         alt={`Photo of ${student.studentName || 'student'}`} // Improved alt text
//                         className="w-36 h-36 md:w-48 md:h-48 object-cover rounded-full border-4 border-gray-200 shadow-lg mb-4" // Slightly larger image
//                     />
//                     <h2 className="text-xl font-semibold text-gray-800">{student.studentName || 'N/A'}</h2>
//                     <p className="text-sm text-gray-500">Admission No: {student.admissionNumber || 'N/A'}</p>
//                     <p className={`text-sm font-medium mt-1 ${student.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
//                         Status: {student.status === 'active' ? 'Active' : 'Inactive'}
//                     </p>
//                 </div>

//                 {/* Right Section - Detailed Information */}
//                 <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
//                         Student Information
//                     </h3>
//                     <div className="space-y-1"> {/* Minimal space between items */}
//                         {displayField("Class", `${student.class || 'N/A'} - ${student.section || 'N/A'}`)}
//                         {displayField("Email", student.email)}
//                         {displayField("Gender", student.gender)}
//                         {displayField("Date of Birth", formatDate(student.dateOfBirth))}
//                         {displayField("Joining Date", formatDate(student.joiningDate))}
//                         {displayField("Contact Number", student.contact)}
//                         {displayField("Alternate Contact", student.alternateContact)} {/* Optional */}
//                         {displayField("Father's Name", student.fatherName)}
//                         {displayField("Mother's Name", student.motherName)} {/* Optional */}
//                         {displayField("Address", student.address)} {/* Optional */}
//                         {/* Add any other relevant fields here using displayField */}
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default StudentDetails;


// import React from "react";
// import { MdArrowBack } from "react-icons/md";

// const StudentDetails = ({ student, setViewStudent }) => {
//   return (
//     <div className="flex h-screen">
//       {/* Left Section - List View */}
//       <div className="w-1/2 p-4 bg-gray-100 overflow-auto">
//         <button onClick={() => setViewStudent(null)} className="flex items-center mb-4 text-blue-600">
//           <MdArrowBack className="mr-2" /> Back
//         </button>
//         <h2 className="text-xl font-bold">Student Details</h2>
//         <div className="mt-4">
//           <p><strong>Name:</strong> {student.studentName}</p>
//           <p><strong>Email:</strong> {student.email}</p>
//           <p><strong>Father's Name:</strong> {student.fatherName}</p>
//           <p><strong>Class:</strong> {student.class} - {student.section}</p>
//           <p><strong>Gender:</strong> {student.gender}</p>
//           <p><strong>DOB:</strong> {student.dateOfBirth}</p>
//           <p><strong>Contact:</strong> {student.contact}</p>
//           <p><strong>Status:</strong> {student.status}</p>
//           <p><strong>Admission No:</strong> {student.admissionNumber}</p>
//           <p><strong>Joining Date:</strong> {student.joiningDate}</p>
//         </div>
//       </div>

//       {/* Right Section - Image View */}
//       <div className="w-1/2 flex flex-col items-center justify-center">
//         <img src={student.studentImage?.url || "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"} 
//           alt="Student" className="w-48 h-48 object-cover rounded-full border" />
//       </div>
//     </div>
//   );
// };

// export default StudentDetails;
