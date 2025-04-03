import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import "./FeeReceiptPDF.css";
import moment from "moment";
import { FaFilePdf } from "react-icons/fa";
import Button from "../../Dynamic/utils/Button";

function FeeReceiptPDF({ details }) {
    const [showContent, setShowContent] = useState(false); // State to control visibility
    const componentPDF = useRef();

    const generatePDF = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: `Fee Receipt ${moment(Date.now()).format('YYYY-MM-DD')}`,
        onAfterPrint: () => {
            alert("Downloaded");
            setShowContent(false);  // Hide the content after printing
        },
    });

    const handleGenerateClickAll = () => {
        setShowContent(true);    // Show the content when the button is clicked
        setTimeout(() => { // added setTimeout
            generatePDF();
        }, 0);

    };

    const handleGenerateClickCurrentDate = () => {
        // Filter details for the current date
        const currentDate = moment().format('YYYY-MM-DD');
        const filteredDetails = details.filter(item => {
            const itemDate = moment(item.date).format('YYYY-MM-DD');
            return itemDate === currentDate;
        });

        if (filteredDetails.length === 0) {
            alert("No data found for the current date.");
            return;
        }

        setShowContent(true);    // Show the content when the button is clicked
        setTimeout(() => { // added setTimeout
            generatePDF();
        }, 0);

    };

    return (
        <div className="fee-receipt-pdf-container">
            <div className="flex justify-end w-full gap-5">
               <Button
            //    style={{background:"green"}}
                            // variant="contained"
                             color="green"
              name="All"
              Icon={<FaFilePdf/>}
                 onClick={handleGenerateClickAll} 
                //  className="fee-receipt-pdf-button flex"
                 >
                  {/* <span>All</span>  */}
                </Button>
                <Button
                 color="green"
                 name="Today"
                 Icon={<FaFilePdf/>}
                            //  variant="contained"
               
                onClick={handleGenerateClickCurrentDate}
                //  className="fee-receipt-pdf-button flex "
                 >
                {/* <FaFilePdf/><span>Today</span> */}
                </Button>
            </div>

            <div
                ref={componentPDF}
                className="fee-receipt-pdf-content"
                style={{ display: showContent ? "block" : "none" }} // Use state for visibility
            >
                <h2 className="fee-receipt-pdf-title">Fee Receipt :{moment(Date.now()).format("DD-MMM-YYYY")}</h2>
                <table className="fee-receipt-pdf-table">
                    <thead>
                        <tr>
                            <th className="fee-receipt-pdf-th">S No.</th>
                            <th className="fee-receipt-pdf-th">Adm. No</th>
                            <th className="fee-receipt-pdf-th">Name</th>
                            <th className="fee-receipt-pdf-th">Class</th>
                            <th className="fee-receipt-pdf-th">Receipt No.</th>
                            <th className="fee-receipt-pdf-th">Amount</th>
                            <th className="fee-receipt-pdf-th">Paid</th>
                            <th className="fee-receipt-pdf-th">Dues</th>
                            <th className="fee-receipt-pdf-th">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Render either all details or filtered details based on showContent */}
                        {showContent && details.filter(item => moment(item.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).length > 0 ? (
                            details.filter(item => moment(item.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).map((item, index) => (
                                <tr key={index} className="fee-receipt-pdf-tr">
                                    <td className="fee-receipt-pdf-td">{index + 1}</td>
                                    <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
                                    <td className="fee-receipt-pdf-td">{item.studentName}</td>
                                    <td className="fee-receipt-pdf-td">{item.studentClass}</td>
                                    <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
                                    <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
                                    <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
                                    <td className="fee-receipt-pdf-td">{item.totalDues}</td>
                                    <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
                                </tr>
                            ))
                        ) : (
                            details.map((item, index) => (
                                <tr key={index} className="fee-receipt-pdf-tr">
                                    <td className="fee-receipt-pdf-td">{index + 1}</td>
                                    <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
                                    <td className="fee-receipt-pdf-td">{item.studentName}</td>
                                    <td className="fee-receipt-pdf-td">{item.studentClass}</td>
                                    <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
                                    <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
                                    <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
                                    <td className="fee-receipt-pdf-td">{item.totalDues}</td>
                                    <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FeeReceiptPDF;


// import React, { useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import "./FeeReceiptPDF.css";
// import moment from "moment";

// function FeeReceiptPDF({ details }) {
//     const [showContent, setShowContent] = useState(false); // State to control visibility
//     const componentPDF = useRef();

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `Fee Receipt ${moment(Date.now()).format('YYYY-MM-DD')}`,
//         onAfterPrint: () => {
//             alert("Downloaded");
//             setShowContent(false);  // Hide the content after printing
//         },
//     });

//     const handleGenerateClick = () => {
//       // Filter details for the current date
//       const currentDate = moment().format('YYYY-MM-DD');
//       const filteredDetails = details.filter(item => {
//           const itemDate = moment(item.date).format('YYYY-MM-DD');
//           return itemDate === currentDate;
//       });

//       if (filteredDetails.length === 0) {
//           alert("No data found for the current date.");
//           return;
//       }

//         setShowContent(true);    // Show the content when the button is clicked
//         setTimeout(() => { // added setTimeout
//             generatePDF();
//         }, 0);

//     };

//     return (
//         <div className="fee-receipt-pdf-container">
//            <div className="flex justify-end w-full">
//            <button onClick={handleGenerateClick} className="fee-receipt-pdf-button">
//                  PDF Download (Current Date)
//             </button>
//            </div>

//             <div
//                 ref={componentPDF}
//                 className="fee-receipt-pdf-content"
//                 style={{ display: showContent ? "block" : "none" }} // Use state for visibility
//             >
//                 <h2 className="fee-receipt-pdf-title">Fee Receipt :{moment(Date.now()).format("DD-MMM-YYYY")}</h2>
//                 <table className="fee-receipt-pdf-table">
//                     <thead>
//                         <tr>
//                             <th className="fee-receipt-pdf-th">S No.</th>
//                             <th className="fee-receipt-pdf-th">Adm. No</th>
//                             <th className="fee-receipt-pdf-th">Name</th>
//                             <th className="fee-receipt-pdf-th">Class</th>
//                             <th className="fee-receipt-pdf-th">Receipt No.</th>
//                             <th className="fee-receipt-pdf-th">Amount</th>
//                             <th className="fee-receipt-pdf-th">Paid</th>
//                             <th className="fee-receipt-pdf-th">Dues</th>
//                             <th className="fee-receipt-pdf-th">Date</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                        {/* Render only the filtered details */}
//                         {details.filter(item => moment(item.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).map((item, index) => (
//                             <tr key={index} className="fee-receipt-pdf-tr">
//                                 <td className="fee-receipt-pdf-td">{index + 1}</td>
//                                 <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
//                                 <td className="fee-receipt-pdf-td">{item.studentName}</td>
//                                 <td className="fee-receipt-pdf-td">{item.studentClass}</td>
//                                 <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalDues}</td>
//                                 <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
                               
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// export default FeeReceiptPDF;


// import React, { useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import "./FeeReceiptPDF.css";
// import moment from "moment";

// function FeeReceiptPDF({ details }) {
//     const [showContent, setShowContent] = useState(false); // State to control visibility
//     const componentPDF = useRef();

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `Fee Receipt ${moment(Date.now()).format('YYYY-MM-DD')}`,
//         onAfterPrint: () => {
//             alert("Downloaded");
//             setShowContent(false);  // Hide the content after printing
//         },
//     });

//     const handleGenerateClick = () => {
//         setShowContent(true);    // Show the content when the button is clicked
//         setTimeout(() => { // added setTimeout
//             generatePDF();
//         }, 0);

//     };

//     return (
//         <div className="fee-receipt-pdf-container">
//            <div className="flex justify-end w-full">
//            <button onClick={handleGenerateClick} className="fee-receipt-pdf-button">
//                  PDF Download
//             </button>
//            </div>

//             <div
//                 ref={componentPDF}
//                 className="fee-receipt-pdf-content"
//                 style={{ display: showContent ? "block" : "none" }} // Use state for visibility
//             >
//                 <h2 className="fee-receipt-pdf-title">Fee Receipt :{moment(Date.now()).format("DD-MMM-YYYY")}</h2>
//                 <table className="fee-receipt-pdf-table">
//                     <thead>
//                         <tr>
//                             <th className="fee-receipt-pdf-th">S No.</th>
//                             <th className="fee-receipt-pdf-th">Adm. No</th>
//                             <th className="fee-receipt-pdf-th">Name</th>
//                             <th className="fee-receipt-pdf-th">Class</th>
//                             <th className="fee-receipt-pdf-th">Receipt No.</th>
//                             <th className="fee-receipt-pdf-th">Amount</th>
//                             <th className="fee-receipt-pdf-th">Paid</th>
//                             <th className="fee-receipt-pdf-th">Dues</th>
//                             <th className="fee-receipt-pdf-th">Date</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {details.map((item, index) => (
//                             <tr key={index} className="fee-receipt-pdf-tr">
//                                 <td className="fee-receipt-pdf-td">{index + 1}</td>
//                                 <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
//                                 <td className="fee-receipt-pdf-td">{item.studentName}</td>
//                                 <td className="fee-receipt-pdf-td">{item.studentClass}</td>
//                                 <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalDues}</td>
//                                 <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
                               
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// export default FeeReceiptPDF;



// import React, { useRef } from "react";
// import { useReactToPrint } from "react-to-print";
// import "./FeeReceiptPDF.css"; // Import your CSS file

// function FeeReceiptPDF({ details }) {
//     console.log("details", details);

//     const componentPDF = useRef(); // Ref for the PDF content
//     const generatePDF = useReactToPrint({

//         content: () => componentPDF.current,
//         documentTitle: `Fee Receipt`,
//         onAfterPrint: () => alert("Downloaded"),
//     });

//     return (
//         <div className="fee-receipt-pdf-container">
//             <button onClick={generatePDF} className="fee-receipt-pdf-button">
//                 Generate PDF
//             </button>

//             <div ref={componentPDF} className="fee-receipt-pdf-content "
//             style={{display:"none"}}
//             >
//                 <h2 className="fee-receipt-pdf-title">Fee Receipt</h2>

//                 <table className="fee-receipt-pdf-table">
//                     <thead>
//                         <tr>
//                             <th className="fee-receipt-pdf-th">S No.</th>
//                             <th className="fee-receipt-pdf-th">Adm. No</th>
//                             <th className="fee-receipt-pdf-th">Name</th>
//                             <th className="fee-receipt-pdf-th">Class</th>
//                             <th className="fee-receipt-pdf-th">Receipt No.</th>
//                             <th className="fee-receipt-pdf-th">Total Fee Amount</th>
//                             <th className="fee-receipt-pdf-th">Paid Amount</th>
//                             <th className="fee-receipt-pdf-th">Dues</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {details.map((item, index) => (
//                             <tr key={index} className="fee-receipt-pdf-tr">
//                                 <td className="fee-receipt-pdf-td">{index + 1}</td>
//                                 <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
//                                 <td className="fee-receipt-pdf-td">{item.studentName}</td>
//                                 <td className="fee-receipt-pdf-td">{item.studentClass}</td>
//                                 <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
//                                 <td className="fee-receipt-pdf-td">{item.totalDues}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// export default FeeReceiptPDF;



// import React, {  useRef } from "react";

// import { useReactToPrint } from "react-to-print";
// import Table from "../../Dynamic/Table";

// function FeeReceiptPDF({details}) {
  
//   console.log("details",details)
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `,Admission form`,
//     onAfterPrint: () => alert("Downloaded"),
//   });
//   const THEAD = [
//     { id: "SN", label: "S No." },
//     { id: "Adm. No", label: "Adm. No" },
//     { id: "Name", label: "Name" },
//     { id: "Class", label: "Class" },
//     { id: "Receipt", label: "Receipt No." },
//     { id: "totalFeeAmount", label: "Total Fee Amount" },
//     { id: "Paid amount", label: "Paid amount" },
//     { id: "Dues", label: "Dues" },
//   ];
//   return (
//     <>
//      <div>
//      <Table tHead={THEAD} tBody={
//         details.map((item,index)=>({
          
//            "SN": index+1,
//            "Adm. No": item.admissionNumber,
//            "Name": item.studentName,
//            "Class": item.studentClass,
//            "Receipt": item.feeReceiptNumber,
//            "totalFeeAmount": item.totalFeeAmount,
//            "Paid amount": item.totalAmountPaid,
//             "Dues":item.totalDues,
//         }

//         ))
//      }  />
      
           

//         </div>
//     </>
//   );
// }

// export default FeeReceiptPDF;

