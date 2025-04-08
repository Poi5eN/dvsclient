import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from 'react-to-print';
import "./FeeReceiptPDF.css"; // Keep for base styling & other print styles if needed
import moment from "moment";
import { FaPrint, FaFileAlt } from "react-icons/fa"; // Added File icon variation
import Button from "../../Dynamic/utils/Button";
import { useStateContext } from "../../contexts/ContextProvider";
import Table from "../../Dynamic/Table";

// --- PrintableReceipt remains the same ---
const PrintableReceipt = React.forwardRef(({ dataToPrint }, ref) => {
    if (!dataToPrint || dataToPrint.length === 0) {
        return null;
    }

    const THEAD = [
        { id: "SN", label: "#" },
        { id: "Receipt", label: "RcpNo." },
        { id: "date", label: "Date" },
        { id: "Adm", label: "Adm.No." },
        { id: "Name", label: "Name" },
        { id: "father", label: "Father" },
        { id: "ClassName", label: "Class" },
        { id: "mode", label: "Mode" },
        { id: "tid", label: "TID" },
        { id: "month", label: "Month" },
        { id: "pdues", label: "Dues" },
        { id: "fee", label: "Fee" },
        { id: "paid", label: "Paid " },
        { id: "status", label: "Status" },
      
    ];

    const tBody = dataToPrint?.map((val, ind) => ({
        "SN": ind + 1,
        Receipt: val.feeReceiptNumber,
        date:  moment(val.date).format("DD-MM-YYYY"),
        Adm: val.admissionNumber,
        Name: val.studentName,
        father: val.fatherName,
        ClassName: val.studentClass,
        mode: val.paymentMode,
        tid: val.transactionId,
        month: val.regularFees?.map((val)=>val?.month),
        pdues: val.dues,
        fee: val.totalFeeAmount,
        paid: val.totalAmountPaid,
        status: val.regularFees?.map((val)=>val?.status),
     
    }));

    return (
        <div ref={ref}
          >
            <h2 className="fee-receipt-pdf-title">Fee Receipt : {moment(Date.now()).format("DD-MMM-YYYY")}</h2>
            <Table tHead={THEAD} tBody={tBody} />
        </div>
    );
});

function FeeReceiptPDF({ details }) {
    const { setIsLoader } = useStateContext();
    const [dataToPrint, setDataToPrint] = useState([]);
    const [isPreparingPrint, setIsPreparingPrint] = useState(false);
    const [printOrientation, setPrintOrientation] = useState('portrait'); // 'portrait' or 'landscape'
    const componentToPrintRef = useRef(null);
    const styleTagRef = useRef(null); 
    const managePrintStyle = (orientation) => {
        // Remove existing dynamic style tag if it exists
        if (styleTagRef.current) {
            styleTagRef.current.remove();
            styleTagRef.current = null;
        }

        // Create new style tag
        const style = document.createElement('style');
        style.id = 'dynamic-print-orientation'; // Assign an ID for easy removal
        
        style.innerHTML = `@page { size: ${orientation};margin:2px; }`; // Dynamic orientation
        // style.innerHTML = `@page { size: ${orientation}; margin: 15mm; }`; // Dynamic orientation
        // Append to head
        document.head.appendChild(style);
        styleTagRef.current = style; // Store reference
    };

    const removePrintStyle = () => {
        if (styleTagRef.current) {
            styleTagRef.current.remove();
            styleTagRef.current = null;
        }
    };

    // --- Configure useReactToPrint ---
    const handlePrint = useReactToPrint({
        content: () => componentToPrintRef.current,
        documentTitle: `Fee_Receipt_${moment().format('YYYY-MM-DD')}`,

        // Inject the style BEFORE getting content
        onBeforeGetContent: () => {
            console.log(`Preparing content for printing in ${printOrientation} mode...`);
            setIsPreparingPrint(true); // Indicate preparation
            return new Promise((resolve) => {
                // Set the orientation style just before content capture
                managePrintStyle(printOrientation);
                // Use a short timeout to ensure the style is applied by the browser
                setTimeout(() => {
                    resolve();
                }, 50); // Adjust timeout if needed, usually small is fine
            });
        },

        // Remove the style AFTER printing or cancelling
        onAfterPrint: () => {
            console.log("Printing finished or cancelled.");
            removePrintStyle(); // Clean up the injected style
            setIsPreparingPrint(false);
            setDataToPrint([]);
        },

        // Remove the style on ERROR as well
        onPrintError: (error) => {
            console.error("Error during printing:", error);
            removePrintStyle(); // Clean up on error too
            alert("Failed to initiate print. Please try again.");
            setIsPreparingPrint(false);
            setDataToPrint([]);
        },

         // --- Optional: You could also use onBeforePrint ---
         // onBeforePrint: () => {
         //    console.log(`Opening print dialog in ${printOrientation} mode...`);
         //    managePrintStyle(printOrientation); // Could also inject here
         //    return Promise.resolve();
         // },
    });

    // --- Trigger print when data is ready ---
    // We no longer need useEffect to trigger handlePrint,
    // because handlePrint itself is now called directly by button clicks.
    // useEffect(() => {
    //      if (isPreparingPrint && dataToPrint.length > 0 && componentToPrintRef.current) {
    //         handlePrint(); // This is handled differently now
    //     }
    // }, [isPreparingPrint, dataToPrint, handlePrint]); // Dependency array needs handlePrint if used


    // --- Function to set data and trigger print process ---
    const prepareAndPrint = (data, orientation = 'portrait') => { // Accept orientation
        if (!data || data.length === 0) {
            alert("No data available to print/save.");
            return;
        }
        if (isPreparingPrint) {
            console.log("Already preparing print, please wait.");
            return; // Prevent multiple clicks while busy
        }

        console.log(`Setting orientation to: ${orientation}`);
        setPrintOrientation(orientation); // 1. Set the desired orientation STATE
        setDataToPrint(data);           // 2. Set the data

        // 3. IMPORTANT: Trigger handlePrint directly AFTER state updates are likely processed.
        // Using a microtask (Promise.resolve().then()) or setTimeout ensures
        // that the state updates have been processed before handlePrint reads them,
        // especially for setting the correct printOrientation in onBeforeGetContent.
        // Or, we can rely on onBeforeGetContent reading the *latest* state, which usually works.
        // Let's call handlePrint directly here. The hooks within handlePrint will manage the style.

        // We need the component to render with the new data *before* handlePrint is called.
        // A short timeout helps ensure PrintableReceipt has the data.
        setTimeout(() => {
            if (componentToPrintRef.current) {
                 handlePrint(); // 4. Call the actual print trigger function
            } else {
                console.error("Printable component ref not ready.");
                 // Maybe set isPreparingPrint back to false here if ref is null?
                 // Or handle this state more robustly.
            }
        }, 0); // Small delay to allow state update and re-render
    };

    // --- Button Click Handlers ---
    const handlePrintClickAllPortrait = () => {
        console.log("Preparing ALL data for PORTRAIT print:", details);
        prepareAndPrint(details, 'portrait');
    };

    const handlePrintClickAllLandscape = () => {
        console.log("Preparing ALL data for LANDSCAPE print:", details);
        prepareAndPrint(details, 'landscape');
    };

    const handlePrintClickCurrentDatePortrait = () => {
        const currentDate = moment().format('YYYY-MM-DD');
        const filteredDetails = details.filter(item => moment(item.date).format('YYYY-MM-DD') === currentDate);
        console.log("Preparing TODAY's data for PORTRAIT print:", filteredDetails);
        prepareAndPrint(filteredDetails, 'portrait');
    };

     const handlePrintClickCurrentDateLandscape = () => {
        const currentDate = moment().format('YYYY-MM-DD');
        const filteredDetails = details.filter(item => moment(item.date).format('YYYY-MM-DD') === currentDate);
        console.log("Preparing TODAY's data for LANDSCAPE print:", filteredDetails);
        prepareAndPrint(filteredDetails, 'landscape');
    };

    // --- Style for the hidden component ---
    const hiddenPrintComponentStyle = {
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: 'auto', // Let content dictate width initially
        height: 'auto',
        overflow: 'visible',
        background: '#fff', // Ensure background for accurate print preview
    };

    return (
        <div 
        className="fee-receipt-pdf-container no-print"
        > {/* Added no-print class */}
            <div 
            className="flex flex-wrap justify-end w-full gap-2 "
            >
                 {/* Added mb-4 for spacing */}
                {/* Print All Buttons */}
                {/* <Button
                    color="blue"
                    name={"Print All (Portrait)"}
                    Icon={<FaPrint />}
                    onClick={handlePrintClickAllPortrait}
                    disabled={isPreparingPrint}
                /> */}
                 <Button
                    color="blue" // Maybe slightly different color?
                    name={"Print"}
                    Icon={<FaFileAlt />} // Different icon?
                    onClick={handlePrintClickAllLandscape}
                    disabled={isPreparingPrint}
                />

                {/* Print Today Buttons */}
                {/* <Button
                    color="teal"
                    name={"Print Today (Portrait)"}
                    Icon={<FaPrint />}
                    onClick={handlePrintClickCurrentDatePortrait}
                    disabled={isPreparingPrint}
                /> */}
                 <Button
                    color="teal"
                    name={"Print Today"}
                    Icon={<FaFileAlt />} // Different icon?
                    onClick={handlePrintClickCurrentDateLandscape}
                    disabled={isPreparingPrint}
                />
            </div>

            {/* Hidden component area for printing */}
            {/* Keep this rendered conditionally ONLY when data is ready,
                to ensure the ref is attached to the correct content */}
            {dataToPrint.length > 0 && (
                 <div
                  style={hiddenPrintComponentStyle}>
                    {/* Pass orientation if PrintableReceipt needs it for styling */}
                    {/* <PrintableReceipt ref={componentToPrintRef} dataToPrint={dataToPrint} printOrientation={printOrientation} /> */}
                    <PrintableReceipt ref={componentToPrintRef} dataToPrint={dataToPrint} />
                 </div>
            )}

             {/* Optional: Show a loading indicator */}
             {/* {isPreparingPrint && <div 
             className="text-center p-4">Preparing print preview...</div>} */}

        </div>
    );
}

export default FeeReceiptPDF;




// import React, { useRef, useState, useEffect } from "react";
// import { useReactToPrint } from 'react-to-print';
// import "./FeeReceiptPDF.css"; // Keep your CSS for styling the receipt
// import moment from "moment";
// import { FaPrint } from "react-icons/fa"; // Changed icon to Print (more appropriate)
// import Button from "../../Dynamic/utils/Button";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Table from "../../Dynamic/Table";
// const PrintableReceipt = React.forwardRef(({ dataToPrint }, ref) => {
//     if (!dataToPrint || dataToPrint.length === 0) {
//         return null; // Don't render anything if no data
//     }

//     const THEAD = [
       
//         { id: "SN", label: "#" },
//         { id: "Adm", label: "Adm. No." },
//         { id: "Name", label: "Name" },
//         { id: "ClassName", label: "Class" },
//         { id: "Receipt", label: "Receipt No." },
//         { id: "Amount", label: "Amount" },
//         { id: "Paid", label: "Paid" },
//         { id: "Dues", label: "Dues" },
//         { id: "Date", label: "Date" },
//     ];

//       const tBody = dataToPrint?.map((val, ind) => ({
            
//             "SN": ind + 1,
//             Adm: val.admissionNumber,
//             Name: val.studentName,
//             ClassName: val.studentClass,
//             Receipt: val.feeReceiptNumber,
//             Amount: val.totalFeeAmount,
//             Paid: val.totalAmountPaid,
//             Dues: val.totalDues,
//             Date: moment(val.date).format("DD-MM-YYYY"),
           
//         }));
        
//     return (
//         <div ref={ref} className="fee-receipt-pdf-content" style={{ padding: '15px', background: '#fff' }}> {/* Add some padding if needed */}
//              <h2 className="fee-receipt-pdf-title">Fee Receipt : {moment(Date.now()).format("DD-MMM-YYYY")}</h2>
//              <Table
//                             // isSearch={true}
//                             tHead={THEAD}
//                             tBody={tBody} />
             
//         </div>
//     );
// });
// function FeeReceiptPDF({ details }) {
//     const { setIsLoader } = useStateContext(); // Keep context if needed elsewhere
//     const [dataToPrint, setDataToPrint] = useState([]);
//     const [isPreparingPrint, setIsPreparingPrint] = useState(false);
//     const componentToPrintRef = useRef(null); // Ref for the printable component
//     const handlePrint = useReactToPrint({
//         content: () => componentToPrintRef.current, // Get content from the ref
//         documentTitle: `Fee_Receipt_${moment().format('YYYY-MM-DD')}`, // Set document title for saving
//         onBeforeGetContent: () => {
//             console.log("Preparing content for printing...");
//             return Promise.resolve();
//         },
//         onAfterPrint: () => {
//             console.log("Printing finished or cancelled.");
//             setIsPreparingPrint(false);
//             setDataToPrint([]); // Clear the data
//         },
//         onPrintError: (error) => {
//             console.error("Error during printing:", error);
//             alert("Failed to initiate print. Please try again.");
//             setIsPreparingPrint(false);
//             setDataToPrint([]);
//             // setIsLoader(false);
//         },
    
//     });
//     useEffect(() => {
//           if (isPreparingPrint && dataToPrint.length > 0 && componentToPrintRef.current) {
//              handlePrint(); // Call the print function provided by the hook
//         } }, [isPreparingPrint, dataToPrint]); // Re-run effect when these change

//     const prepareAndPrint = (data) => {
//         if (!data || data.length === 0) {
//             alert("No data available to print/save.");
//             return;
//         }
//         setDataToPrint(data);       // 1. Set the data
//         setIsPreparingPrint(true);  // 2. Set state to trigger useEffect -> handlePrint
//     };

//     const handlePrintClickAll = () => {
//         console.log("Preparing ALL data for print:", details);
//         prepareAndPrint(details);
//     };

//     const handlePrintClickCurrentDate = () => {
//         const currentDate = moment().format('YYYY-MM-DD');
//         const filteredDetails = details.filter(item => {
//             const itemDate = moment(item.date).format('YYYY-MM-DD');
//             return itemDate === currentDate;
//         });
//         console.log("Preparing TODAY's data for print:", filteredDetails);
//         prepareAndPrint(filteredDetails);
//     };
//      const hiddenPrintComponentStyle = {
//         position: 'absolute',
//         left: '-9999px', // Move off-screen
//         top: 'auto',
//         width: '210mm',   // Optional: Set a width hint if needed for layout
//         height: 'auto',
//         overflow: 'visible',
//     };

//     return (
//         <div className="fee-receipt-pdf-container">
//             <div className="flex justify-end w-full gap-2">
//                 <Button
//                     color="blue"
//                     name={"Print"}
//                     Icon={<FaPrint />} // Use Print icon
//                     onClick={handlePrintClickAll}
//                     disabled={isPreparingPrint} // Disable while preparing
//                 />
//                 <Button
//                     color="teal"
//                     name={"Print Today"}
//                     Icon={<FaPrint />} // Use Print icon
//                     onClick={handlePrintClickCurrentDate}
//                     disabled={isPreparingPrint} // Disable while preparing
//                 />
//             </div>
//             {isPreparingPrint && dataToPrint.length > 0 && (
//                  <div style={hiddenPrintComponentStyle}>
//                     <PrintableReceipt ref={componentToPrintRef} dataToPrint={dataToPrint} />
//                  </div>
//             )}

//         </div>
//     );
// }

// export default FeeReceiptPDF;


// import React, { useRef, useState, useEffect } from "react";
// import { useReactToPrint } from 'react-to-print';
// import "./FeeReceiptPDF.css"; // Keep your CSS for styling the receipt
// import moment from "moment";
// import { FaPrint } from "react-icons/fa"; // Changed icon to Print (more appropriate)
// import Button from "../../Dynamic/utils/Button";
// import { useStateContext } from "../../contexts/ContextProvider";
// const PrintableReceipt = React.forwardRef(({ dataToPrint }, ref) => {
//     if (!dataToPrint || dataToPrint.length === 0) {
//         return null; // Don't render anything if no data
//     }

//     return (
//         <div ref={ref} className="fee-receipt-pdf-content" style={{ padding: '15px', background: '#fff' }}> {/* Add some padding if needed */}
//              <h2 className="fee-receipt-pdf-title">Fee Receipt : {moment(Date.now()).format("DD-MMM-YYYY")}</h2>
//              <table className="fee-receipt-pdf-table">
//                 <thead>
//                     <tr>
//                         <th className="fee-receipt-pdf-th">S No.</th>
//                         <th className="fee-receipt-pdf-th">Adm. No</th>
//                         <th className="fee-receipt-pdf-th">Name</th>
//                         <th className="fee-receipt-pdf-th">Class</th>
//                         <th className="fee-receipt-pdf-th">Receipt No.</th>
//                         <th className="fee-receipt-pdf-th">Amount</th>
//                         <th className="fee-receipt-pdf-th">Paid</th>
//                         <th className="fee-receipt-pdf-th">Dues</th>
//                         <th className="fee-receipt-pdf-th">Date</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {dataToPrint.map((item, index) => (
//                         <tr key={index} className="fee-receipt-pdf-tr">
//                             <td className="fee-receipt-pdf-td">{index + 1}</td>
//                             <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
//                             <td className="fee-receipt-pdf-td">{item.studentName}</td>
//                             <td className="fee-receipt-pdf-td">{item.studentClass}</td>
//                             <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
//                             <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
//                             <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
//                             <td className="fee-receipt-pdf-td">{item.totalDues}</td>
//                             <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// });
// function FeeReceiptPDF({ details }) {
//     const { setIsLoader } = useStateContext(); // Keep context if needed elsewhere
//     const [dataToPrint, setDataToPrint] = useState([]);
//     // State to indicate if we are preparing the data *before* triggering print
//     const [isPreparingPrint, setIsPreparingPrint] = useState(false);
//     const componentToPrintRef = useRef(null); // Ref for the printable component
//     const handlePrint = useReactToPrint({
//         content: () => componentToPrintRef.current, // Get content from the ref
//         documentTitle: `Fee_Receipt_${moment().format('YYYY-MM-DD')}`, // Set document title for saving
//         onBeforeGetContent: () => {
//             console.log("Preparing content for printing...");
//             return Promise.resolve();
//         },
//         onAfterPrint: () => {
//             console.log("Printing finished or cancelled.");
//             setIsPreparingPrint(false);
//             setDataToPrint([]); // Clear the data
//         },
//         onPrintError: (error) => {
//             console.error("Error during printing:", error);
//             alert("Failed to initiate print. Please try again.");
//             setIsPreparingPrint(false);
//             setDataToPrint([]);
//             // setIsLoader(false);
//         },
    
//     });
//     useEffect(() => {
//           if (isPreparingPrint && dataToPrint.length > 0 && componentToPrintRef.current) {
//              handlePrint(); // Call the print function provided by the hook
//         } }, [isPreparingPrint, dataToPrint]); // Re-run effect when these change

//     // --- Button Click Handlers ---
//     const prepareAndPrint = (data) => {
//         if (!data || data.length === 0) {
//             alert("No data available to print/save.");
//             return;
//         }
//         // setIsLoader(true); // Optional: Show a general loading indicator
//         setDataToPrint(data);       // 1. Set the data
//         setIsPreparingPrint(true);  // 2. Set state to trigger useEffect -> handlePrint
//     };

//     const handlePrintClickAll = () => {
//         console.log("Preparing ALL data for print:", details);
//         prepareAndPrint(details);
//     };

//     const handlePrintClickCurrentDate = () => {
//         const currentDate = moment().format('YYYY-MM-DD');
//         const filteredDetails = details.filter(item => {
//             const itemDate = moment(item.date).format('YYYY-MM-DD');
//             return itemDate === currentDate;
//         });
//         console.log("Preparing TODAY's data for print:", filteredDetails);
//         prepareAndPrint(filteredDetails);
//     };
//      const hiddenPrintComponentStyle = {
//         position: 'absolute',
//         left: '-9999px', // Move off-screen
//         top: 'auto',
//         width: '210mm',   // Optional: Set a width hint if needed for layout
//         height: 'auto',
//         overflow: 'visible',
//     };

//     return (
//         <div className="fee-receipt-pdf-container">
//             {/* Buttons remain visible */}
//             <div className="flex justify-end w-full gap-5">
//                 <Button
//                     color="blue"
//                     name={isPreparingPrint ? "Preparing..." : "Print/Save All"}
//                     Icon={<FaPrint />} // Use Print icon
//                     onClick={handlePrintClickAll}
//                     disabled={isPreparingPrint} // Disable while preparing
//                 />
//                 <Button
//                     color="teal"
//                     name={isPreparingPrint ? "Preparing..." : "Print/Save Today"}
//                     Icon={<FaPrint />} // Use Print icon
//                     onClick={handlePrintClickCurrentDate}
//                     disabled={isPreparingPrint} // Disable while preparing
//                 />
//             </div>
//             {isPreparingPrint && dataToPrint.length > 0 && (
//                  <div style={hiddenPrintComponentStyle}>
//                     <PrintableReceipt ref={componentToPrintRef} dataToPrint={dataToPrint} />
//                  </div>
//             )}

//         </div>
//     );
// }

// export default FeeReceiptPDF;



// import React, { useRef, useState } from "react";
// // Import new libraries
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// // Your existing imports
// import "./FeeReceiptPDF.css";
// import moment from "moment";
// import { FaDownload } from "react-icons/fa"; // Changed icon to Download
// import Button from "../../Dynamic/utils/Button";
// import { useStateContext } from "../../contexts/ContextProvider";

// function FeeReceiptPDF({ details }) {
//     const { setIsLoader } = useStateContext();
//     // State to hold the specific data set that needs printing/downloading
//     const [dataToPrint, setDataToPrint] = useState([]);
//     // State to indicate if PDF generation is in progress
//     const [isGenerating, setIsGenerating] = useState(false);
//     // Ref for the component to capture
//     const componentPDF = useRef();

//     // --- CSS for Off-Screen Positioning ---
//     // Keep the element in the DOM but visually hidden and positioned off-screen
//     const offScreenStyle = {
//         position: 'absolute',
//         left: '-9999px', // Move far off the left side
//         top: 'auto',     // Avoid potential top positioning conflicts
//         width: '210mm',  // Explicitly set a width (like A4) helps html2canvas
//         height: 'auto',  // Allow height to adjust to content
//         overflow: 'visible', // Ensure content isn't clipped
//         background: '#fff', // Ensure a background for capture if needed
//         // padding: '15px'     // Add padding like a real page if needed for capture
//     };

//     // --- Function to Generate and Download PDF ---
//     const generateAndDownloadPdf = () => {
//         const input = componentPDF.current;
//         if (!input) {
//             console.error("Content element ref is not available.");
//             setIsGenerating(false);
//             setDataToPrint([]); // Clear data if element is missing
//             return;
//         }

//         console.log("Attempting to capture element:", input);
//         // Ensure data is populated before capturing
//         if (dataToPrint.length === 0) {
//              console.log("No data to print, skipping PDF generation.");
//              setIsGenerating(false);
//              return;
//         }

//         // Options for html2canvas (scale increases resolution)
//         const canvasOptions = {
//             scale: 2, // Higher scale for better quality
//             useCORS: true, // If you have external images/resources
//             logging: true, // Enable logging for debugging
//             width: input.scrollWidth, // Try to capture based on content scroll width
//             height: input.scrollHeight // Try to capture based on content scroll height
//         };

//         html2canvas(input, canvasOptions)
//             .then((canvas) => {
//                 console.log("Canvas generated successfully");
//                 const imgData = canvas.toDataURL('image/png');

//                 // Calculate PDF dimensions (A4 size: 210mm x 297mm)
//                 const pdf = new jsPDF({
//                     orientation: 'p', // portrait
//                     unit: 'mm', // millimeters
//                     format: 'a4'
//                 });

//                 const pdfWidth = pdf.internal.pageSize.getWidth();
//                 const pdfHeight = pdf.internal.pageSize.getHeight();
//                 const canvasWidth = canvas.width;
//                 const canvasHeight = canvas.height;

//                 // Calculate the aspect ratio
//                 const ratio = Math.min(pdfWidth / (canvasWidth / canvasOptions.scale), pdfHeight / (canvasHeight / canvasOptions.scale));
//                  // Adjust width/height based on scale used for canvas
//                 const imgWidth = (canvasWidth / canvasOptions.scale) * ratio * 0.95; // Use 95% width for margin
//                 const imgHeight = (canvasHeight / canvasOptions.scale) * ratio * 0.95;


//                 // Center the image (optional) - add some margin top
//                  const xPos = (pdfWidth - imgWidth) / 2;
//                  const yPos = 10; // 10mm margin from top


//                 // Add the image to the PDF
//                 pdf.addImage(imgData, 'PNG', xPos, yPos, imgWidth, imgHeight);

//                 // Define filename
//                 const filename = `Fee_Receipt_${moment().format('YYYY-MM-DD_HHmm')}.pdf`;

//                 // Trigger direct download
//                 pdf.save(filename);

//                 console.log("PDF download initiated.");
//                 alert("PDF Download Started!");

//             })
//             .catch((error) => {
//                 console.error("Error generating PDF: ", error);
//                 alert("Failed to generate PDF. Check console for errors.");
//             })
//             .finally(() => {
//                 // Reset state regardless of success or failure
//                 setIsGenerating(false);
//                 setDataToPrint([]); // Clear the data after attempt
//             });
//     };

//     // --- Button Click Handlers ---
//     const handleGenerateClickAll = () => {
//         if (!details || details.length === 0) {
//             alert("No data available to download.");
//             return;
//         }
//         // setIsLoader(true)
//         console.log("Setting data for ALL:", details);
//         setIsGenerating(true); // Set loading state
//         setDataToPrint(details); // Update the data state

//         // Use setTimeout to allow React to re-render the hidden div with new data
//         // before we attempt to capture it with html2canvas.
//         setTimeout(() => {
//             generateAndDownloadPdf();
//             // setIsLoader(false)
//         }, 100); // Small delay (adjust if needed)
//     };

//     const handleGenerateClickCurrentDate = () => {
//         const currentDate = moment().format('YYYY-MM-DD');
//         const filteredDetails = details.filter(item => {
//             const itemDate = moment(item.date).format('YYYY-MM-DD');
//             return itemDate === currentDate;
//         });

//         if (filteredDetails.length === 0) {
//             alert("No data found for the current date.");
//             return;
//         }
//         console.log("Setting data for TODAY:", filteredDetails);
//         setIsGenerating(true); // Set loading state
//         setDataToPrint(filteredDetails); // Update the data state

//         // Use setTimeout for the same reason as above
//         setTimeout(() => {
//             generateAndDownloadPdf();
//         }, 100); // Small delay (adjust if needed)
//     };

//     return (
//         <div className="fee-receipt-pdf-container">
//             {/* Buttons remain visible */}
//             <div className="flex justify-end w-full gap-5">
//                 <Button
//                     color="blue" // Changed color slightly
//                     name={isGenerating ? "Generating..." : "Download"}
//                     Icon={<FaDownload />}
//                     onClick={handleGenerateClickAll}
//                     disabled={isGenerating} // Disable button while generating
//                 />
//                 <Button
//                     color="teal" // Changed color slightly
//                     name={isGenerating ? "Generating..." : "Download Today"}
//                     Icon={<FaDownload />}
//                     onClick={handleGenerateClickCurrentDate}
//                     disabled={isGenerating} // Disable button while generating
//                 />
//             </div>
//             {isGenerating && dataToPrint.length > 0 && (
//                 <div
//                     ref={componentPDF}
//                     className="fee-receipt-pdf-content" // Keep existing class
//                     style={offScreenStyle} // Apply the off-screen style
//                 >
//                     <h2 className="fee-receipt-pdf-title">Fee Receipt : {moment(Date.now()).format("DD-MMM-YYYY")}</h2>
                   
//                     <table className="fee-receipt-pdf-table">
//                         <thead>
//                             <tr>
//                                 <th className="fee-receipt-pdf-th">S No.</th>
//                                 <th className="fee-receipt-pdf-th">Adm. No</th>
//                                 {/* ... other headers ... */}
//                                  <th className="fee-receipt-pdf-th">Name</th>
//                                 <th className="fee-receipt-pdf-th">Class</th>
//                                 <th className="fee-receipt-pdf-th">Receipt No.</th>
//                                 <th className="fee-receipt-pdf-th">Amount</th>
//                                 <th className="fee-receipt-pdf-th">Paid</th>
//                                 <th className="fee-receipt-pdf-th">Dues</th>
//                                 <th className="fee-receipt-pdf-th">Date</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {dataToPrint.map((item, index) => (
//                                 <tr key={index} className="fee-receipt-pdf-tr">
//                                     <td className="fee-receipt-pdf-td">{index + 1}</td>
//                                     <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
//                                     <td className="fee-receipt-pdf-td">{item.studentName}</td>
//                                     <td className="fee-receipt-pdf-td">{item.studentClass}</td>
//                                     <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalDues}</td>
//                                     <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default FeeReceiptPDF;



// import React, { useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import "./FeeReceiptPDF.css";
// import moment from "moment";
// import { FaFilePdf } from "react-icons/fa";
// import Button from "../../Dynamic/utils/Button";

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

//     const handleGenerateClickAll = () => {
//         setShowContent(true);    // Show the content when the button is clicked
//         setTimeout(() => { // added setTimeout
//             generatePDF();
//         }, 0);

//     };

//     const handleGenerateClickCurrentDate = () => {
//         // Filter details for the current date
//         const currentDate = moment().format('YYYY-MM-DD');
//         const filteredDetails = details.filter(item => {
//             const itemDate = moment(item.date).format('YYYY-MM-DD');
//             return itemDate === currentDate;
//         });

//         if (filteredDetails.length === 0) {
//             alert("No data found for the current date.");
//             return;
//         }

//         setShowContent(true);    // Show the content when the button is clicked
//         setTimeout(() => { // added setTimeout
//             generatePDF();
//         }, 0);

//     };

//     return (
//         <div className="fee-receipt-pdf-container">
//             <div className="flex justify-end w-full gap-5">
//                <Button
//              color="green"
//               name="Print"
//               Icon={<FaFilePdf/>}
//                  onClick={handleGenerateClickAll} 
//                  >
                
//                 </Button>
//                 <Button
//                  color="green"
//                  name="Today"
//                  Icon={<FaFilePdf/>}
//                 onClick={handleGenerateClickCurrentDate}
             
//                  >
               
//                 </Button>
//             </div>

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
//                         {showContent && details.filter(item => moment(item.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).length > 0 ? (
//                             details.filter(item => moment(item.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).map((item, index) => (
//                                 <tr key={index} className="fee-receipt-pdf-tr">
//                                     <td className="fee-receipt-pdf-td">{index + 1}</td>
//                                     <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
//                                     <td className="fee-receipt-pdf-td">{item.studentName}</td>
//                                     <td className="fee-receipt-pdf-td">{item.studentClass}</td>
//                                     <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalDues}</td>
//                                     <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
//                                 </tr>
//                             ))
//                         ) : (
//                             details.map((item, index) => (
//                                 <tr key={index} className="fee-receipt-pdf-tr">
//                                     <td className="fee-receipt-pdf-td">{index + 1}</td>
//                                     <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
//                                     <td className="fee-receipt-pdf-td">{item.studentName}</td>
//                                     <td className="fee-receipt-pdf-td">{item.studentClass}</td>
//                                     <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
//                                     <td className="fee-receipt-pdf-td">{item.totalDues}</td>
//                                     <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }

// export default FeeReceiptPDF;

