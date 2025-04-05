import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import "./FeeReceiptPDF.css";
import moment from "moment";
import Button from "../../Dynamic/utils/Button";

function DuesPDF({ tBody }) {
    console.log("tBody",tBody)
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

   

    return (
        <div className="fee-receipt-pdf-container">
            {/* <div className="flex justify-end w-full gap-1"> */}
                <Button onClick={handleGenerateClickAll} 
                // className="fee-receipt-pdf-button"
                name="PDF Download "
                >
                    
                </Button>
                {/* <button onClick={handleGenerateClickCurrentDate} className="fee-receipt-pdf-button">
                    PDF Download (Current Date)
                </button> */}
            {/* </div> */}

            <div
                ref={componentPDF}
                className="fee-receipt-pdf-content"
                style={{ display: showContent ? "block" : "none" }} // Use state for visibility
            >
                <h2 className="fee-receipt-pdf-title">Fee Receipt :{moment(Date.now()).format("DD-MMM-YYYY")}</h2>
                <table className="fee-receipt-pdf-table p-2">
                    <thead>
                        <tr>
                            <th className="fee-receipt-pdf-th">S No.</th>
                            <th className="fee-receipt-pdf-th">Adm. No</th>
                            <th className="fee-receipt-pdf-th">Name</th>
                            <th className="fee-receipt-pdf-th">Class</th>
                            <th className="fee-receipt-pdf-th">Father Name</th>
                            <th className="fee-receipt-pdf-th">Contact</th>
                            <th className="fee-receipt-pdf-th">Fee Status</th>
                            <th className="fee-receipt-pdf-th">Total Dues</th>
                            {/* <th className="fee-receipt-pdf-th">Date</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Render either all details or filtered details based on showContent */}
                        {showContent && tBody.filter(item => moment(item.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).length > 0 ? (
                            tBody.filter(item => moment(item.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')).map((item, index) => (
                                <tr key={index} className="fee-receipt-pdf-tr">
                                    <td className="fee-receipt-pdf-td">{index + 1}</td>
                                    <td className="fee-receipt-pdf-td">{item.admissionNo}</td>
                                    <td className="fee-receipt-pdf-td">{item.studentName}</td>
                                    <td className="fee-receipt-pdf-td">{item.class}</td>
                                    <td className="fee-receipt-pdf-td">{item.fatherName}</td>
                                    <td className="fee-receipt-pdf-td">{item.contact}</td>
                                    <td className="fee-receipt-pdf-td">{item.feeStatus}</td>
                                    <td className="fee-receipt-pdf-td">{item.totalDues}</td>
                                    {/* <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td> */}
                                </tr>
                            ))
                        ) : (""
                            // tBody.map((item, index) => (
                            //     <tr key={index} className="fee-receipt-pdf-tr">
                            //         <td className="fee-receipt-pdf-td">{index + 1}</td>
                            //         <td className="fee-receipt-pdf-td">{item.admissionNumber}</td>
                            //         <td className="fee-receipt-pdf-td">{item.studentName}</td>
                            //         <td className="fee-receipt-pdf-td">{item.studentClass}</td>
                            //         <td className="fee-receipt-pdf-td">{item.feeReceiptNumber}</td>
                            //         <td className="fee-receipt-pdf-td">{item.totalFeeAmount}</td>
                            //         <td className="fee-receipt-pdf-td">{item.totalAmountPaid}</td>
                            //         <td className="fee-receipt-pdf-td">{item.totalDues}</td>
                            //         <td className="fee-receipt-pdf-td">{moment(item.date).format("DD-MMM-YYYY")}</td>
                            //     </tr>
                            // ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DuesPDF;

