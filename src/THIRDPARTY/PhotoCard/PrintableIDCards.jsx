// src/components/PrintableIDCards.js
import React from 'react';
import moment from 'moment';

const printStyles = `
  // Default/Screen styles for the header
  .school-print-header {
    text-align: center;
    padding: 10px 0;
    margin-bottom: 15px;
  }

  .school-print-header h2 {
    margin: 0;
    font-size: 1.8em;
    font-weight: bold;
    color: #333;
  }

  @media print {
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: A4 portrait;
      margin: 7mm; /* Page margins */
    }

    .school-print-header {
      position: fixed !important;
      top: 0 !important; /* Aligns to the top of the page's printable area */
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      padding: 3mm 0 !important; /* Vertical padding for the header itself */
      background-color: white !important;
      z-index: 1000 !important;
      border-bottom: 0.5px solid #555 !important;
      text-align: center;
    }

    .school-print-header h2 {
      font-size: 14pt !important;
      font-weight: bold !important;
      color: #000 !important;
      margin: 0 !important;
      line-height: 1.2 !important;
    }

    /* Container for each "page" of ID cards */
    .print-page-container {
      page-break-after: always !important; /* Force new page after this container */
      padding-top: 16mm !important; /* MUST be >= header height + desired space. (Header padding 3mm*2 + h2 font ~5mm + ~5mm buffer) */
      box-sizing: border-box !important;
      width: 100% !important;
      /* height: calc(297mm - 14mm - 16mm); /* Optional: A4 height - (top+bottom margins) - header_padding_top_for_content */
                          /* This helps visualize, but content flow is usually better */
    }

    /* Prevent page break after the very last page container */
    .print-page-container:last-child {
      page-break-after: avoid !important;
    }

    /* Grid that holds the ID cards ON A SINGLE PAGE */
    .printable-id-cards-grid {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 1mm !important; /* Gap between cards */
      width: 100% !important;
      box-sizing: border-box !important;
    }

    .print-id-card {
      border: 0.5px solid #777 !important;
      border-radius: 3px !important;
      padding: 1mm 1.5mm !important;
      box-sizing: border-box !important;
      background-color: #fff !important;
      color: #000 !important;
      display: flex !important;
      align-items: flex-start !important;
      overflow: hidden !important; /* Changed from visible to hidden to help contain */
      page-break-inside: avoid !important;
      height: auto; /* Let content determine height, or set a fixed height if all cards must be identical */
      /* min-height: 40mm; /* Example fixed height if needed */
    }

    .print-card-details-section {
      flex-grow: 1 !important;
      line-height: 1.2 !important;
      padding-right: 1mm; /* Space between details and image section */
    }

    .print-card-details-section p {
      margin: 0.5mm 0 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      font-size: 16px !important;
    }
    
    .print-card-details-section .detail-label {
      color: #333 !important;
      font-weight: normal !important; /* Ensuring labels are not bold by default */
    }

    .print-card-details-section .detail-value {
      color: #000 !important;
      margin-left: 0.5mm !important; /* Explicit margin instead of ml-1 */
    }

    .print-card-details-section .detail-value-bold {
      font-weight: bold !important;
      color: #000 !important;
    }
    
    .print-card-details-section .label-bold { /* If a label itself needs to be bold */
      font-weight: bold !important;
      color: #111 !important;
    }

    .detail-photoid {
      font-size: 7pt !important; 
      color: #007bff !important; 
      text-align: center !important; 
      display: block !important; 
      margin-top: 0.5mm !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .print-card-image-section {
      flex-shrink: 0 !important;
      width: 14mm !important; 
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      /* height: 100%; Ensure this doesn't cause issues with flex-start on parent */
    }

    .print-student-photo-wrapper {
      width: 13mm !important;
      height: 15mm !important; 
      border: 0.5px solid #000 !important;
      border-radius: 1px !important;
      overflow: hidden !important;
      background-color: #f0f0f0 !important;
      margin-bottom: 0.5mm; 
    }

    .print-student-photo {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      display: block !important;
    }

    /* Action Tag styles (if used) */
    .print-action-tag-container {
      position: absolute !important; /* Relative to print-card-image-section if it's positioned */
                                     /* Or relative to print-id-card if that's positioned */
      top: -1mm !important; 
      right: 0mm !important;
      z-index: 1 !important;
    }

    .print-action-tag {
      color: white !important;
      font-size: 3.5pt !important; 
      line-height: 1 !important;
      font-weight: 500 !important;
      padding: 0.4mm 0.8mm !important;
      border-radius: 1px !important;
      box-shadow: 0px 0.5px 1px rgba(0,0,0,0.2) !important;
      white-space: nowrap !important;
    }
    .print-action-tag.admin { background-color: #f0592e !important; }
    .print-action-tag.tparty { background-color: #2fa7db !important; }
  }
`;
  const user = JSON.parse(localStorage.getItem("user"))
  const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"))

const schoolName=user?.schoolName?user?.schoolName:SchoolDetails?.schoolName
const PrintableIDCards = React.forwardRef(({ students, schoolDetails }, ref) => {
  if (!students || students.length === 0) {
    return <div ref={ref}><p>No student data to print.</p></div>;
  }

  const STUDENTS_PER_PAGE = 12;

  const chunkArray = (array, size) => {
    const chunkedArr = [];
    let index = 0;
    while (index < array.length) {
      chunkedArr.push(array.slice(index, size + index));
      index += size;
    }
    return chunkedArr;
  };

  const pagedStudents = chunkArray(students, STUDENTS_PER_PAGE);

  return (
    <div ref={ref}>
      <style>{printStyles}</style>
      
      {/* School Name Header - Fixed for print, normal flow for screen */}
      <div className="school-print-header">
        <h2>{schoolName || "School Name"}</h2>
      </div>
      
      {/* This outer wrapper is mainly for structure; print-page-container handles page breaks */}
      <div className="all-print-pages-wrapper"> 
        {pagedStudents.map((studentPage, pageIndex) => (
          <div key={`page-${pageIndex}`} className="print-page-container">
            <div className="printable-id-cards-grid">
              {studentPage.map((student, studentIndexOnPage) => (
                <div key={student.studentId || `student-print-${pageIndex}-${studentIndexOnPage}`} className="print-id-card">
                  <div className="print-card-details-section">
                    <p>
                      <span className="detail-label">Name: </span>
                      <span className="detail-value detail-value-bold">{student?.studentName || ''}</span>
                    </p>
                    <p>
                      <span className="detail-label">Class: </span>
                      <span className="detail-value">
                        {student?.class && student?.section ? `${student.class}-${student.section}` : ""}
                      </span>
                    </p>
                    <p>
                      <span className="detail-label">DOB: </span>
                      <span className="detail-value">
                        {student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YY") : ""}
                      </span>
                    </p>
                    <p>
                      <span className="detail-label">Phone: </span>
                      <span className="detail-value">{student?.phone || ''}</span>
                    </p>
                    <p>
                      <span className="detail-label">Father: </span>
                      <span className="detail-value">{student?.udisePlusDetails?.father_name || ''}</span>
                    </p>
                    <p>
                      <span className="detail-label">Mother: </span>
                      <span className="detail-value">{student?.udisePlusDetails?.mother_name || ''}</span>
                    </p>
                    <p>
                      <span className="detail-label">Address: </span>
                      <span className="detail-value">{student?.address || ''}</span>
                    </p>
                    {/* Empty p for spacing if needed, or adjust card height/min-height
                    <p>
                      <span className="detail-label"></span>
                      <span className="detail-value"></span>
                    </p> */}
                  </div>

                  <div className="print-card-image-section">
                    <div className="print-student-photo-wrapper">
                      <img
                        src={student?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
                        alt={`${student?.studentName || 'Student'} photo`}
                        className="print-student-photo"
                        onError={(e) => { 
                          e.target.onerror = null; // Prevents infinite loop if placeholder also fails
                          e.target.src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
                        }}
                      />
                    </div>
                    {/* Example for action tag, if you have such data in student object
                    {student?.tagType && (
                      <div className="print-action-tag-container">
                        <span className={`print-action-tag ${student.tagType.toLowerCase()}`}>
                          {student.tagType.toUpperCase()}
                        </span>
                      </div>
                    )} */}
                    <span className="detail-photoid">{student?.photoNo || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default PrintableIDCards;


// // src/components/PrintableIDCards.js
// import React from 'react';
// import moment from 'moment';

// const printStyles = `
//   @media print {
//     body {
//       margin: 0 !important;
//       padding: 0 !important;
//       background-color: white !important;
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//     }

//     @page {
//       size: A4 portrait;
//       margin: 7mm;
//     }

//     .printable-container {
//       display: grid !important;
//       grid-template-columns: repeat(2, 1fr) !important;
//       gap: 1mm !important;
//       width: 100% !important;
//       box-sizing: border-box !important;
//       margin-top:10px
//     }

//     .print-id-card {
//       border: 0.5px solid #777 !important;
//       border-radius: 3px !important;
//       padding: 1mm 1.5mm !important;
//       box-sizing: border-box !important;
//       background-color: #fff !important;
//       color: #000 !important;
//       display: flex !important;
//       align-items: flex-start !important;
  
   
//       overflow: visible !important;
//       page-break-inside: avoid !important;
//     }

//     .print-card-details-section {
//       flex-grow: 1 !important;
     
//       line-height: 1.2 !important;
//     }

//     .print-card-details-section p {
//       margin: 0.5mm 0 !important;
//       white-space: nowrap !important;
//       overflow: hidden !important;
//       text-overflow: ellipsis !important;
//        font-size: 14px !important;
//     }

//     .print-card-details-section .detail-label {
//       color: #333 !important;
//     }

//     .print-card-details-section .detail-value {
//       color: #000 !important;
//     }

//     .print-card-details-section .detail-value-bold {
//       font-weight: bold !important;
//       color: #000 !important;
//     }

//     .print-card-details-section .label-bold {
//       font-weight: bold !important;
//       color: #111 !important;
//     }

//     .detail-photoid {
//       font-size: 10px;
//       color: blue;
//     }

//     .print-card-image-section {
//       flex-shrink: 0 !important;
//       width: 14mm !important;
//       height: 100%;
//       position: relative !important;
   
//     }

//     .print-student-photo-wrapper {
//       width: 13mm !important;
//       height: 15mm !important;
//       border: 0.5px solid #000 !important;
//       border-radius: 1px !important;
//       overflow: hidden !important;
//       background-color: #f0f0f0 !important;
//     }

//     .print-student-photo {
//       width: 100% !important;
//       height: 100% !important;
//       object-fit: cover !important;
//       display: block !important;
//     }

//     .print-action-tag-container {
//       position: absolute !important;
//       top: -1mm !important;
//       right: -1.5mm !important;
//       z-index: 1 !important;
//     }
//      .school-print-header {
//   position: fixed;
//   top: ;
//   left: 0;
//   right: 0;
//   text-align: center;
//   font-size: 10px;
//   font-weight: bold;
//   color: #000;
 
//   z-index: 10;

// }



//     .print-action-tag {
//       color: white !important;
//       font-size: 3.5pt !important;
//       line-height: 1 !important;
//       font-weight: 500 !important;
//       padding: 0.4mm 0.8mm !important;
//       border-radius: 1px !important;
//       box-shadow: 0px 0.5px 1px rgba(0,0,0,0.2) !important;
//       white-space: nowrap !important;
//     }

//     .print-action-tag.admin {
//       background-color: #f0592e !important;
//     }

//     .print-action-tag.tparty {
//       background-color: #2fa7db !important;
//     }
//   }
// `;

// const PrintableIDCards = React.forwardRef(({ students, schoolDetails }, ref) => {
//   if (!students || students.length === 0) {
//     return <div ref={ref}><p>No student data to print.</p></div>;
//   }

//   return (
//     <div ref={ref}>
//       <style>{printStyles}</style>
//   {/* School Name */}
//   <div className="school-print-header">
//     <h2>{schoolDetails?.name || "School Name"}</h2>
//   </div>
//       <div className="printable-container">
        
//         {students.map((student, index) => (
//           <div key={student.studentId || `student-print-${index}`} className="print-id-card">
//             {/* Left: Student Details */}
//             <div className="print-card-details-section">
//               <p>
//                 <span className="detail-label">Name:</span>
//                 <span className="detail-value detail-value-bold ml-1">{student?.studentName}</span>
//               </p>
//               <p>
//                 <span className="detail-label">Class:</span>
//                 <span className="detail-value ml-1">
//                   {student?.class && student?.section ? `${student.class}-${student.section}` : ""}
//                 </span>
//               </p>
//                <p>
//                 <span className="detail-label">DOB:</span>
//                 <span className="detail-value ml-1">
//                   {student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YY") : ""}
//                 </span>
//               </p>
//               <p>
//                 <span className="detail-label">Phone:</span>
//                 <span className="detail-value ml-1">{student?.phone || ''}</span>
//               </p>
//               <p>
//                 <span className="detail-label">Father Name:</span>
//                 <span className="detail-value ml-1">{student?.udisePlusDetails?.father_name}</span>
//               </p>
//               <p>
//                 <span className="detail-label">Mother Name:</span>
//                 <span className="detail-value ml-1">{student?.udisePlusDetails?.mother_name || ''}</span>
//               </p>

//               <p>
//                 <span className="detail-label">Address:</span>
//                 <span className="detail-value ml-1">{student?.address || ''}</span>
//               </p>
//               <p>
//                 <span className="detail-label"></span>
//                 <span className="detail-value ml-1"></span>
//               </p>
//             </div>

//             {/* Right: Image and Tag */}
//             <div className="print-card-image-section">
//               <div className="print-student-photo-wrapper">
//                 <img
//                   src={student?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
//                   alt={`${student?.studentName || 'Student'}`}
//                   className="print-student-photo"
//                 />
//               </div>
//               <span className="detail-photoid">{student?.photoNo}</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// export default PrintableIDCards;






// // src/components/PrintableIDCards.js
// import React from 'react';
// import moment from 'moment';

// const printStyles = `
//   @media print {
//     body {
//       margin: 0 !important;
//       padding: 0 !important;
//       background-color: white !important;
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//     }

//     @page {
//       size: A4 portrait;
//       margin: 7mm; /* Slightly adjusted margin for better fit, test this */
//     }

//     .printable-container {
//       display: grid !important;
//       grid-template-columns: repeat(4, 1fr) !important;
//       /* 
//         A4 width ~210mm. Page margin 7mm*2 = 14mm. Printable width ~196mm.
//         Card width ~45mm. 4*45mm = 180mm. Remaining for gaps: 196-180 = 16mm.
//         3 gaps: 16mm / 3 = ~5.3mm. Let's use 4.5mm or 5mm.
//       */
//       gap: 3.5mm !important; /* Space between cards, test for best fit */
//       width: 100% !important; 
//       box-sizing: border-box !important;
//     }

//     .print-id-card {
//       border: 0.5px solid #777 !important; /* Slightly softer border */
//       border-radius: 3px !important; /* Match screen card rounding */
//       padding: 1mm 1.5mm  !important; /* Overall padding inside card */
//       box-sizing: border-box !important;
//       background-color: #fff !important;
//       color: #000 !important;
//       display: flex !important; /* Key for side-by-side layout */
//       align-items: flex-start !important; /* Align items to the top */
//       /*
//         Printable Width (210mm - 2*7mm margin) = 196mm
//         Width for 4 cards + 3 gaps: (196mm - 3*4.5mm_gap) / 4_cards = (196 - 13.5) / 4 = 182.5 / 4 = ~45.6mm per card

//         Printable Height (297mm - 2*7mm margin) = 283mm
//         Height for 5 cards + 4 gaps: (283mm - 4*4.5mm_gap) / 5_cards = (283 - 18) / 5 = 265 / 5 = ~53mm per card
//       */
//       width: 45.5mm !important;  /* Test and adjust this */
     
//       overflow: visible !important; /* Allow tag to overhang slightly, but be careful */
//       page-break-inside: avoid !important;
//     }

//     .print-card-details-section {
//       flex-grow: 1 !important;
     
//       font-size: 4.5pt !important; /* Base font size for details */
//       line-height: 1.2 !important;
//     }

//     .print-card-details-section p {
//       margin: 0.3mm 0 !important;
//       white-space: nowrap !important;
//       overflow: hidden !important;
//       text-overflow: ellipsis !important;
//     }
    
//     .print-card-details-section .detail-label {
//       /* font-weight: normal; Default, can be overridden */
//       color: #333 !important;
//     }
//     .print-card-details-section .detail-value {
//       /* font-weight: normal; Default, can be overridden */
//        color: #000 !important;
//     }
//     .print-card-details-section .detail-value-bold {
//       font-weight: bold !important;
//       color: #000 !important;
//     }
//      .print-card-details-section .label-bold {
//       font-weight: bold !important;
//       color: #111 !important;
//     }
//       .detail-photoid{
//       font-size:10px;
//       color:blue

//       }


//     .print-card-image-section {
//       flex-shrink: 0 !important;
//       width: 16mm !important; /* Approximate width for image column */
//       height: 100%; /* Take full height of card if needed */
//       position: relative !important; /* For positioning the tag */
//       right:-4.1mm
//     }
    
//     .print-student-photo-wrapper {
//       width: 13mm !important;  /* Image width */
//       height: 15mm !important; /* Image height, adjust for aspect ratio */
//       border: 0.5px solid #000 !important; /* Black border like screen */
//       border-radius: 1px !important; /* Slight rounding */
//       overflow: hidden !important;
//       background-color: #f0f0f0 !important; /* Placeholder bg */
//     }

//     .print-student-photo {
//       width: 100% !important;
//       height: 100% !important;
//       object-fit: cover !important;
//       display: block !important;
//     }

//     .print-action-tag-container {
//       position: absolute !important;
//       top: -1mm !important;    /* Adjust for overhang */
//       right: -1.5mm !important; /* Adjust for overhang */
//       z-index: 1 !important;
//     }

//     .print-action-tag {
//       color: white !important;
//       font-size: 3.5pt !important; /* Very small tag text */
//       line-height: 1 !important;
//       font-weight: 500 !important; /* medium */
//       padding: 0.4mm 0.8mm !important; /* Tiny padding */
//       border-radius: 1px !important;
//       box-shadow: 0px 0.5px 1px rgba(0,0,0,0.2) !important;
//       white-space: nowrap !important;
//     }
//     .print-action-tag.admin {
//       background-color: #f0592e !important; /* Admin color */
//     }
//     .print-action-tag.tparty {
//       background-color: #2fa7db !important; /* T-Party color */
//     }
//   }
// `;

// const PrintableIDCards = React.forwardRef(({ students, schoolDetails }, ref) => {
//   if (!students || students.length === 0) {
//     return <div ref={ref}><p>No student data to print.</p></div>;
//   }

//   return (
//     <div ref={ref}>
//       <style>{printStyles}</style> 
      
//       <div className="printable-container">
//         {students.map((student, index) => (
//           <div key={student.studentId || `student-print-${index}`} className="print-id-card">
//             {/* Left: Student Details */}
//             <div className="print-card-details-section">
//               {/* <p>
//                 <span className="detail-label label-bold">Photo No:</span>
//                 <span className="detail-value ml-1">{student?.photoNo }</span>
//               </p> */}
//               <p>
//                 <span className="detail-label">Name:</span>
//                 <span className="detail-value detail-value-bold ml-1">{student?.studentName }</span>
//               </p>
//               <p>
//                 <span className="detail-label">Class:</span>
//                 <span className="detail-value ml-1">{student?.class && student?.section ? `${student.class}-${student.section}` : ""}</span>
//               </p>
//               <p>
//                 <span className="detail-label">Father Name:</span>
//                 <span className="detail-value ml-1">{student?.udisePlusDetails?.father_name }</span>
//               </p>
//               <p>
//                 <span className="detail-label">Mother  Name:</span>
//                 <span className="detail-value ml-1"></span>
//               </p>
//               <p>
//                 <span className="detail-label">DOB:</span>
//                 <span className="detail-value ml-1">{student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YY") : ""}</span>
//               </p>
//               <p>
//                 <span className="detail-label">Phone:</span>
//                 <span className="detail-value ml-1"></span>
//               </p>
//               <p>
//                 <span className="detail-label">Address:</span>
//                 <span className="detail-value ml-1"></span>
//               </p>
//             </div>

//             {/* Right: Image and Tag */}
//             <div className="print-card-image-section">
//               <div className="print-student-photo-wrapper">
//                 <img
//                   src={student?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
//                   alt={`${student?.studentName || 'Student'}`}
//                   className="print-student-photo"
//                 />
//               </div>
//              <span className="detail-photoid">{student?.photoNo }</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// export default PrintableIDCards;


// // src/components/PrintableIDCards.js
// import React from 'react';
// import moment from 'moment';

// const printStyles = `
//   @media print {
//     body {
//       margin: 0 !important; /* Use !important to override other body margins */
//       padding: 0 !important;
//       background-color: white !important;
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//     }

//     /* This class would be applied to the parent of PrintableIDCards if needed, */
//     /* but react-to-print typically isolates the printed component. */
//     /* For elements outside the printed component, you'd still use .no-print in a global CSS. */
//     .no-print-from-jsx, .no-print-from-jsx * {
//         display: none !important;
//     }

//     @page {
//       size: A4 portrait;
//       margin: 8mm; /* Adjust page margins if needed */
//     }

//     .printable-container {
//       display: grid !important; /* Use !important if there's any chance of override */
//       grid-template-columns: repeat(4, 1fr) !important;
//       gap: 3mm !important;
//       width: 100% !important; 
//       box-sizing: border-box !important;
//     }

//     .print-id-card {
//       border: 0.5px solid #555 !important;
//       padding: 2mm !important;
//       box-sizing: border-box !important;
//       background-color: #fff !important;
//       color: #000 !important;
//       display: flex !important;
//       flex-direction: column !important;
//       width: 46mm !important;  
//       height: 53mm !important; 
//       overflow: hidden !important;
//       page-break-inside: avoid !important;
//       text-align: center !important;
//     }

//     .print-id-card-header {
//       width: 100% !important;
//       margin-bottom: 1.5mm !important;
//       display: flex !important;
//       flex-direction: column !important;
//       align-items: center !important;
//     }

//     .print-school-logo {
//       max-width: 80% !important;
//       max-height: 10mm !important;
//       object-fit: contain !important;
//       margin-bottom: 1mm !important;
//     }

//     .print-school-name {
//       font-size: 6pt !important;
//       font-weight: bold !important;
//       margin: 0 !important;
//       line-height: 1.1 !important;
//       color: #000 !important;
//     }
    
//     .print-id-card-body {
//       display: flex !important;
//       flex-direction: column !important;
//       align-items: center !important;    
//       width: 100% !important;
//       margin-bottom: 1mm !important;
//       gap: 1mm !important;
//       flex-grow: 1 !important; 
//     }

//     .print-student-photo-container {
//       /* No specific styles needed if photo directly in body */
//     }

//     .print-student-photo {
//       width: 18mm !important; 
//       height: 22mm !important;
//       object-fit: cover !important;
//       border: 0.5px solid #ccc !important;
//       display: block !important;
//       margin: 0 auto 1mm auto !important;
//     }
    
//     .print-student-details {
//       text-align: center !important; 
//       font-size: 5pt !important; 
//       width: 100% !important;
//       line-height: 1.1 !important; 
//       color: #000 !important;
//     }

//     .print-student-details p {
//       margin: 0.5mm 0 !important;
//       white-space: nowrap !important; 
//       overflow: hidden !important;
//       text-overflow: ellipsis !important; 
//     }

//     .print-student-details p strong {
//       font-weight: 600 !important; 
//     }
    
//     .print-id-card-footer {
//       width: 100% !important;
//       font-size: 4pt !important; 
//       color: #333 !important;
//       border-top: 0.5px dashed #ccc !important;
//       padding-top: 1mm !important;
//       margin-top: auto !important;
//       line-height: 1 !important;
//     }
//     .print-school-address {
//       font-size: 4pt !important;
//       margin: 0 !important;
//       white-space: nowrap !important;
//       overflow: hidden !important;
//       text-overflow: ellipsis !important;
//     }

//     a, a:visited {
//       color: inherit !important;
//       text-decoration: none !important;
//     }
//   }
// `;

// const PrintableIDCards = React.forwardRef(({ students, schoolDetails }, ref) => {
//   if (!students || students.length === 0) {
//     return <div ref={ref}><p>No student data to print.</p></div>;
//   }

//   return (
//     <div ref={ref}>
//       {/* Embed the print styles directly here */}
//       <style>{printStyles}</style> 
      
//       <div className="printable-container">
//         {students.map((student, index) => (
//           <div key={student.studentId || `student-print-${index}`} className="print-id-card">
//             <div className="print-id-card-header">
//               {schoolDetails?.schoolLogo && (
//                 <img 
//                   src={schoolDetails.schoolLogo} 
//                   alt="School Logo" 
//                   className="print-school-logo" 
//                 />
//               )}
//               <h3 className="print-school-name">
//                 {schoolDetails?.name || 'School Name'}
//               </h3>
//             </div>
//             <div className="print-id-card-body">
//               <div className="print-student-photo-container">
//                 <img
//                   src={student?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
//                   alt={`${student?.studentName || 'Student'}`}
//                   className="print-student-photo"
//                 />
//               </div>
//               <div className="print-student-details">
//                 <p><strong>Photo No:</strong> {student?.photoNo || ''}</p>
//                 <p><strong>Name:</strong> {student?.studentName || ''}</p>
//                 <p><strong>Class:</strong> {student?.class && student?.section ? `${student.class}-${student.section}` : ''}</p>
//                 <p><strong>Father:</strong> {student?.udisePlusDetails?.father_name || ''}</p>
//                 <p><strong>DOB:</strong> {student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YY") : ''}</p>
//               </div>
//             </div>
//             <div className="print-id-card-footer">
//               <p className="print-school-address">{schoolDetails?.address || 'School Address'}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// export default PrintableIDCards;


// // src/components/PrintableIDCards.js
// import React from 'react';
// import moment from 'moment';

// const PrintableIDCards = React.forwardRef(({ students, schoolDetails }, ref) => {
//   if (!students || students.length === 0) {
//     return <div ref={ref}><p>No student data to print.</p></div>;
//   }

//   return (
//     <div ref={ref} className="printable-container">
//       {students.map((student, index) => (
//         <div key={student.studentId || `student-print-${index}`} className="print-id-card">
//           <div className="print-id-card-header">
//             {schoolDetails?.schoolLogo && (
//               <img 
//                 src={schoolDetails.schoolLogo} 
//                 alt="School Logo" 
//                 className="print-school-logo" 
//               />
//             )}
//             <h3 className="print-school-name">
//               {schoolDetails?.name || 'School Name'}
//             </h3>
//           </div>
//           <div className="print-id-card-body">
//             <div className="print-student-photo-container">
//               <img
//                 src={student?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
//                 alt={`${student?.studentName || 'Student'}`}
//                 className="print-student-photo"
//               />
//             </div>
//             <div className="print-student-details">
//               <p><strong>Photo No:</strong> {student?.photoNo || ''}</p>
//               <p><strong>Name:</strong> {student?.studentName || ''}</p>
//               <p><strong>Class:</strong> {student?.class && student?.section ? `${student.class}-${student.section}` : ''}</p>
//               <p><strong>Father:</strong> {student?.udisePlusDetails?.father_name || ''}</p>
//               <p><strong>DOB:</strong> {student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YY") : ''}</p> {/* Shortened DOB format */}
//             </div>
//           </div>
//           <div className="print-id-card-footer">
//             <p className="print-school-address">{schoolDetails?.address || 'School Address'}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// });

// export default PrintableIDCards;




// // ./PrintableIDCards.js
// import React from 'react';
// import moment from 'moment';

// // Define approximate A4 dimensions in pixels for 96 DPI (common screen DPI)
// // A4: 210mm x 297mm. 1 inch = 25.4mm.
// // Width: (210 / 25.4) * 96 = ~794px
// // Height: (297 / 25.4) * 96 = ~1123px

// // Card dimensions (example: 2 cards across, 4 down)
// // Card width could be ~ (794px / 2) - margins = ~350px
// // Card height could be ~ (1123px / 4) - margins = ~250px
// // These are rough estimates; precise layout often requires trial and error with print preview.

// const PrintableIDCards = React.forwardRef(({ students, schoolDetails }, ref) => {
//   if (!students || students.length === 0) {
//     return <div ref={ref}><p>No student data to print.</p></div>;
//   }

//   return (
//     <div ref={ref} className="printable-container">
//       {students.map((student, index) => (
//         <div key={index} className="print-id-card">
//           <div className="print-id-card-header">
//             {schoolDetails?.schoolLogo && (
//               <img 
//                 src={schoolDetails.schoolLogo} 
//                 alt="School Logo" 
//                 className="print-school-logo" 
//               />
//             )}
//             <h3 className="print-school-name">
//               {schoolDetails?.name || 'School Name Here'}
//             </h3>
//           </div>
//           <div className="print-id-card-body">
//             <div className="print-student-photo-container">
//               <img
//                 src={student?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
//                 alt={`${student?.studentName || 'Student'}`}
//                 className="print-student-photo"
//               />
//             </div>
//             <div className="print-student-details">
//               <p><strong>Photo No:</strong> {student?.photoNo || ''}</p>
//               <p><strong>Name:</strong> {student?.studentName || ''}</p>
//               <p><strong>Class:</strong> {student?.class && student?.section ? `${student.class}-${student.section}` : ''}</p>
//               <p><strong>Father:</strong> {student?.udisePlusDetails?.father_name || ''}</p>
//               <p><strong>DOB:</strong> {student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MMM-YYYY") : ''}</p>
//             </div>
//           </div>
//           <div className="print-id-card-footer">
//             {/* Add any footer info like "Valid for AY 2024-25" or school address */}
//             <p className="print-school-address">{schoolDetails?.address || 'School Address Here'}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// });

// export default PrintableIDCards;