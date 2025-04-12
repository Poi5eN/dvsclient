import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StaticReceipt = () => {
  const receiptRef = useRef(null);

  const user = {
    image: { url: 'https://via.placeholder.com/100' }, // Replace with local or CORS-compliant image
    schoolName: 'Green Valley High School',
    address: '123 Park Lane, New Delhi',
    contact: '011-12345678',
  };

  const modalData = {
    feeReceiptNumber: 'RCPT123456',
    studentName: 'Aryan Sharma',
    studentClass: '10-B',
    transactionId: 'TXN987654321',
    admissionNumber: 'ADM1001',
    paymentMode: 'Cash',
    totalFeeAmount: 15000,
    concessionFee: 1000,
    totalAmountPaid: 14000,
    totalDues: 1000,
    remark: 'Paid partially due to concession',
    regularFees: [
      { month: 'April', paidAmount: 5000, dueAmount: 0, status: 'Paid' },
      { month: 'May', paidAmount: 4000, dueAmount: 1000, status: 'Partial' },
    ],
    additionalFees: [
      { name: 'Sports Fee', month: 'April', paidAmount: 3000, dueAmount: 0, status: 'Paid' },
      { name: 'Lab Fee', month: 'May', paidAmount: 2000, dueAmount: 0, status: 'Paid' },
    ],
  };

  const date = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const toWords = (num) => {
    return 'Fourteen Thousand Rupees'; // Replace with real converter if needed
  };

  const handleDownloadPdf = () => {
    const input = receiptRef.current;
    if (!input) {
      alert("Receipt not found.");
      return;
    }

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`FeeReceipt-${modalData.feeReceiptNumber}-${modalData.studentName.replace(/\s+/g, '_')}.pdf`);
    }).catch((error) => {
      console.error("PDF Error:", error);
      alert("Error generating PDF.");
    });
  };

  return (
    <div>
      <button onClick={handleDownloadPdf} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
        Download Receipt PDF
      </button>

      <div ref={receiptRef} className="w-[400px] p-4 bg-white border border-black text-black text-sm">
        <div className="flex justify-between items-center mb-2">
          <img src={user.image.url} alt="logo" className="h-12 w-12 rounded-full object-cover" crossOrigin="anonymous" />
          <div className="text-center flex-grow">
            <h1 className="font-bold text-base">{user.schoolName}</h1>
            <p className="text-xs">Address: {user.address}</p>
            <p className="text-xs">Contact: {user.contact}</p>
          </div>
        </div>

        <div className="bg-gray-300 text-center border-b-2 border-red-500 py-1 mb-2">
          <h3 className="font-bold text-sm">Fee Receipt</h3>
        </div>

        <div className="flex justify-between text-xs mb-2">
          <div>
            <p>Rec.No.: <strong>{modalData.feeReceiptNumber}</strong></p>
            <p>Name: <strong>{modalData.studentName}</strong></p>
            <p>Class: <strong>{modalData.studentClass}</strong></p>
            <p>Txn ID: <strong>{modalData.transactionId}</strong></p>
          </div>
          <div className="text-right">
            <p>Date: <strong>{date()}</strong></p>
            <p>Adm No: <strong>{modalData.admissionNumber}</strong></p>
            <p>Mode: <strong>{modalData.paymentMode}</strong></p>
          </div>
        </div>

        {(modalData.regularFees.length || modalData.additionalFees.length) ? (
          <table className="w-full text-xs border border-black mb-2">
            <thead>
              <tr>
                <th className="border border-black">Particulars</th>
                <th className="border border-black">Month</th>
                <th className="border border-black text-right">Amount</th>
                <th className="border border-black text-right">Dues</th>
                <th className="border border-black text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {modalData.regularFees.map((f, i) => (
                <tr key={i}>
                  <td className="border border-black">Tuition Fee</td>
                  <td className="border border-black">{f.month}</td>
                  <td className="border border-black text-right">₹ {f.paidAmount}</td>
                  <td className="border border-black text-right">₹ {f.dueAmount}</td>
                  <td className="border border-black text-center">{f.status}</td>
                </tr>
              ))}
              {modalData.additionalFees.map((f, i) => (
                <tr key={i + 'a'}>
                  <td className="border border-black">{f.name}</td>
                  <td className="border border-black">{f.month}</td>
                  <td className="border border-black text-right">₹ {f.paidAmount}</td>
                  <td className="border border-black text-right">₹ {f.dueAmount}</td>
                  <td className="border border-black text-center">{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-center">No Fee Details Found</p>}

        <table className="w-full text-xs border border-black mb-2">
          <tbody>
            <tr>
              <td className="border border-black">Total Fee Amount</td>
              <td className="border border-black text-right">₹ {modalData.totalFeeAmount}</td>
            </tr>
            <tr>
              <td className="border border-black">Concession</td>
              <td className="border border-black text-right">₹ {modalData.concessionFee}</td>
            </tr>
            <tr>
              <td className="border border-black font-semibold">Paid Amount</td>
              <td className="border border-black text-right font-semibold">₹ {modalData.totalAmountPaid}</td>
            </tr>
            <tr>
              <td className="border border-black">Total Dues</td>
              <td className="border border-black text-right text-red-600 font-semibold">₹ {modalData.totalDues}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-2 text-xs">
          <p className="font-bold">In Words: {toWords(modalData.totalAmountPaid)} ONLY</p>
          <p>Remarks: <strong>{modalData.remark}</strong></p>
          <div className="flex justify-between mt-4">
            <div>Fee Collected By: ____________</div>
            <div>Authorized Signatory</div>
          </div>
        </div>

        <div className="text-[10px] border-t border-black pt-2">
          <p className="font-bold">Note:</p>
          <ol className="list-decimal ml-4">
            <li>Cheque subject to realization. ₹500 fine for dishonour.</li>
            <li>Keep this receipt safe for future reference.</li>
            <li>Check entries. Contact school office if needed.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StaticReceipt;




// import React, { useRef } from 'react';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas'; // Import html2canvas

// const StaticReceipt = () => {
//   const user = {
//     image: { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s' },
//     schoolName: 'Green Valley High School',
//     address: '123 Park Lane, New Delhi',
//     contact: '011-12345678',
//   };

//   const modalData = {
//     feeReceiptNumber: 'RCPT123456',
//     studentName: 'Aryan Sharma',
//     studentClass: '10-B',
//     transactionId: 'TXN987654321',
//     admissionNumber: 'ADM1001',
//     paymentMode: 'Cash',
//     totalFeeAmount: 15000,
//     concessionFee: 1000,
//     totalAmountPaid: 14000,
//     totalDues: 1000,
//     remark: 'Paid partially due to concession',
//     regularFees: [
//       { month: 'April', paidAmount: 5000, dueAmount: 0, status: 'Paid' },
//       { month: 'May', paidAmount: 4000, dueAmount: 1000, status: 'Partial' },
//     ],
//     additionalFees: [
//       { name: 'Sports Fee', month: 'April', paidAmount: 3000, dueAmount: 0, status: 'Paid' },
//       { name: 'Lab Fee', month: 'May', paidAmount: 2000, dueAmount: 0, status: 'Paid' },
//     ],
//   };

//   const date = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); // Consistent date format

//   const toWords = (num) => {
//     // Basic number-to-words function (replace with a robust library if needed for production)
//     const a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
//     const b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
//     const numberToWords = (n) => {
//         if ((n = n.toString()).length > 9) return 'overflow';
//         const numArr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
//         if (!numArr) return;
//         let str = '';
//         str += (numArr[1] != 0) ? (a[Number(numArr[1])] || b[numArr[1][0]] + ' ' + a[numArr[1][1]]) + 'crore ' : '';
//         str += (numArr[2] != 0) ? (a[Number(numArr[2])] || b[numArr[2][0]] + ' ' + a[numArr[2][1]]) + 'lakh ' : '';
//         str += (numArr[3] != 0) ? (a[Number(numArr[3])] || b[numArr[3][0]] + ' ' + a[numArr[3][1]]) + 'thousand ' : '';
//         str += (numArr[4] != 0) ? (a[Number(numArr[4])] || b[numArr[4][0]] + ' ' + a[numArr[4][1]]) + 'hundred ' : '';
//         str += (numArr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(numArr[5])] || b[numArr[5][0]] + ' ' + a[numArr[5][1]]) : '';
//         return str.trim();
//     }
//     const amountInWords = numberToWords(num);
//     return amountInWords ? amountInWords.toUpperCase() + ' Rupees' : 'Zero Rupees'; // Capitalize and add Rupees
//   };

//   // --- PDF Download Logic ---
//   const receiptRef = useRef(null); // Create a ref for the receipt container

//   const handleDownloadPdf = () => {
//     const input = receiptRef.current; // Get the DOM node
//     if (!input) {
//         console.error("Receipt element not found for PDF generation.");
//         alert("Could not generate PDF. Receipt element missing.");
//         return;
//     }

//     // Options for html2canvas (optional, adjust for quality/scale)
//     const canvasOptions = {
//         scale: 2, // Increase scale for better resolution
//         useCORS: true // Important if the logo image is from another domain
//     };

//     html2canvas(input, canvasOptions).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');

//       // Calculate PDF dimensions
//       // Using A4 dimensions in 'mm' (landscape: 297x210, portrait: 210x297)
//       // We'll use portrait A4 for a typical receipt
//       const pdfWidth = 210;
//       const pdfHeight = 297;

//       // Calculate image dimensions to fit PDF, maintaining aspect ratio
//       const imgProps = canvas; // html2canvas returns a canvas element
//       const imgWidth = imgProps.width;
//       const imgHeight = imgProps.height;
//       const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

//       // Center the image on the PDF page (optional)
//       const imgX = (pdfWidth - imgWidth * ratio) / 2;
//       const imgY = 10; // Add some top margin

//       const pdf = new jsPDF({
//           orientation: 'portrait', // or 'landscape'
//           unit: 'mm',
//           format: 'a4'
//       });

//       // Add the image to the PDF
//       // Use scaled dimensions, adjust imgY for top margin
//       pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

//       // Construct filename
//       const filename = `FeeReceipt-${modalData.feeReceiptNumber}-${modalData.studentName.replace(/\s+/g, '_')}.pdf`;
//       pdf.save(filename); // Trigger download
//     }).catch(err => {
//         console.error("Error generating PDF:", err);
//         alert("Failed to generate PDF. Check console for details.");
//     });
//   };
//   // --- End PDF Download Logic ---


//   return (
//     <div>
//       {/* Add a button to trigger the download */}
//       <button
//         onClick={handleDownloadPdf}
//         className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
//       >
//         Download Receipt PDF
//       </button>

//       {/* *** Add the ref to the main container div for the receipt *** */}
//       <div ref={receiptRef} className="w-[400px] pe-[15px] p-2 border-black border rounded-sm dark:text-black bg-white"> {/* Ensure background is white for capture */}
//         {/* ... rest of your existing StaticReceipt JSX ... */}

//         <div className="flex justify-between items-center mb-2"> {/* Use items-center for vertical alignment */}
//             <div className="h-auto w-[60px]"> {/* Slightly larger container for logo */}
//                 <img
//                 className="h-12 w-12 rounded-full object-contain" // Use object-contain
//                 src={user?.image?.url}
//                 alt="logo"
//                 crossOrigin="anonymous" // Add crossOrigin if logo is from another domain
//                 />
//             </div>
//             <div className="text-center flex-grow"> {/* Allow text div to grow */}
//                 <h1 className="font-bold text-[16px] leading-tight">{user.schoolName}</h1>
//                 <p className="text-[10px] leading-tight"><span className="font-semibold">Address:</span> {user.address}</p>
//                 <p className="text-[10px] leading-tight"><span className="font-semibold">Contact:</span> {user.contact}</p>
//             </div>
//             <div className="w-[60px]"></div> {/* Spacer to help centering */}
//         </div>

//         <div className="bg-gray-200 text-center border-b-2 border-red-500 my-1 py-0.5">
//           <h3 className="font-bold text-[12px] scale-110">Fee Receipt</h3> {/* Adjusted title */}
//         </div>

//         <div className="flex justify-between text-[10px] mb-1"> {/* Smaller font size */}
//           <div>
//             <div className="">Rec.No.: <strong>{modalData.feeReceiptNumber}</strong></div>
//             <div className="">Name: <strong>{modalData.studentName}</strong></div>
//             <div className="">Class: <strong>{modalData.studentClass}</strong></div>
//             {modalData.transactionId && modalData.transactionId.length > 1 && ( // Check if exists and not empty string
//               <div className="">Txn ID: <strong>{modalData.transactionId}</strong></div>
//             )}
//           </div>
//           <div className='text-right'> {/* Align right */}
//             <div className="">Date: <strong>{date()}</strong></div>
//             <div className="">Adm No: <strong>{modalData.admissionNumber}</strong></div>
//             <div className="">Mode: <strong>{modalData.paymentMode}</strong></div>
//           </div>
//         </div>

//         {(modalData.regularFees.length > 0 || modalData.additionalFees.length > 0) ? (
//           <table className="min-w-full leading-normal border-collapse border border-black mb-1">
//             <thead>
//               <tr>
//                 <th className="border border-black px-1 py-0.5 text-[10px] text-left">Particulars</th>
//                 <th className="border border-black px-1 py-0.5 text-[10px] text-left">Month</th>
//                 <th className="border border-black px-1 py-0.5 text-[10px] text-right">Amount</th>
//                 <th className="border border-black px-1 py-0.5 text-[10px] text-right">Dues</th>
//                 <th className="border border-black px-1 py-0.5 text-[10px] text-center">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {modalData.regularFees.map((addFee, i) => (
//                 <tr key={`reg-${i}`}>
//                   <td className="border border-black px-1 py-0.5 text-[10px]">Tuition Fee</td> {/* Be specific */}
//                   <td className="border border-black px-1 py-0.5 text-[10px]">{addFee.month}</td>
//                   <td className="border border-black px-1 py-0.5 text-[10px] text-right">{addFee.paidAmount?.toFixed(2)}</td>
//                   <td className="border border-black px-1 py-0.5 text-[10px] text-right">{addFee.dueAmount?.toFixed(2)}</td>
//                   <td className="border border-black px-1 py-0.5 text-[10px] text-center">{addFee.status}</td>
//                 </tr>
//               ))}
//               {modalData.additionalFees.map((addFee, i) => (
//                 <tr key={`add-${i}`}>
//                   <td className="border border-black px-1 py-0.5 text-[10px]">{addFee.name}</td>
//                   <td className="border border-black px-1 py-0.5 text-[10px]">{addFee.month || '-'}</td> {/* Handle missing month */}
//                   <td className="border border-black px-1 py-0.5 text-[10px] text-right">{addFee.paidAmount?.toFixed(2)}</td>
//                   <td className="border border-black px-1 py-0.5 text-[10px] text-right">{addFee.dueAmount?.toFixed(2)}</td>
//                   <td className="border border-black px-1 py-0.5 text-[10px] text-center">{addFee.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div className="text-center text-[10px] my-2">No Fee Details Found</div>
//         )}

//         <div className="mt-1">
//           <table className="w-full border border-collapse border-black text-[10px]">
//             <tbody>
//               <tr>
//                 <td className="border border-black px-1 py-0.5 w-3/5">Total Fee Amount</td>
//                 <td className="border border-black px-1 py-0.5 text-right">₹ {modalData.totalFeeAmount?.toFixed(2)}</td>
//               </tr>
//               <tr>
//                 <td className="border border-black px-1 py-0.5">Concession Amount</td>
//                 <td className="border border-black px-1 py-0.5 text-right">₹ {modalData.concessionFee?.toFixed(2)}</td>
//               </tr>
//               <tr>
//                 <td className="border border-black px-1 py-0.5 font-semibold">Paid Amount</td>
//                 <td className="border border-black px-1 py-0.5 text-right font-semibold">₹ {modalData.totalAmountPaid?.toFixed(2)}</td>
//               </tr>
//               <tr>
//                 <td className="border border-black px-1 py-0.5">Total Dues</td>
//                 <td className="border border-black px-1 py-0.5 text-right text-red-600 font-semibold">₹ {modalData.totalDues?.toFixed(2)}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <div className="border-black p-1 border my-1">
//           <p className="text-[9px] font-bold">In Words: {toWords(modalData.totalAmountPaid)} ONLY</p>
//           {modalData.remark && <p className="text-[9px] mt-1">Remarks: <strong>{modalData.remark}</strong></p> }
//           <div className="flex justify-between text-[9px] mt-4">
//             <div>Fee Collected By: ................</div>
//             <div className='text-right'>Authorised Signatory</div>
//           </div>
//         </div>

//         <div className="text-[8px] border border-black p-1 mt-1">
//           <p className="font-bold">Note:</p>
//           <ol className="list-decimal ml-3">
//             <li>Cheque payments are subject to realization. A fee may apply for dishonoured cheques.</li>
//             <li>Keep this receipt safely for future reference.</li>
//             <li>Verify all entries carefully. Contact accounts office for discrepancies.</li>
//           </ol>
//         </div>

//       </div> {/* End of receipt container */}
//     </div>
//   );
// };

// export default StaticReceipt;


// import React from 'react';

// const StaticReceipt = () => {
//   const user = {
//     image: { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s' },
//     schoolName: 'Green Valley High School',
//     address: '123 Park Lane, New Delhi',
//     contact: '011-12345678',
//   };

//   const modalData = {
//     feeReceiptNumber: 'RCPT123456',
//     studentName: 'Aryan Sharma',
//     studentClass: '10-B',
//     transactionId: 'TXN987654321',
//     admissionNumber: 'ADM1001',
//     paymentMode: 'Cash',
//     totalFeeAmount: 15000,
//     concessionFee: 1000,
//     totalAmountPaid: 14000,
//     totalDues: 1000,
//     remark: 'Paid partially due to concession',
//     regularFees: [
//       {
//         month: 'April',
//         paidAmount: 5000,
//         dueAmount: 0,
//         status: 'Paid',
//       },
//       {
//         month: 'May',
//         paidAmount: 4000,
//         dueAmount: 1000,
//         status: 'Partial',
//       },
//     ],
//     additionalFees: [
//       {
//         name: 'Sports Fee',
//         month: 'April',
//         paidAmount: 3000,
//         dueAmount: 0,
//         status: 'Paid',
//       },
//       {
//         name: 'Lab Fee',
//         month: 'May',
//         paidAmount: 2000,
//         dueAmount: 0,
//         status: 'Paid',
//       },
//     ],
//   };

//   const date = () => new Date().toLocaleDateString();

//   const Repees = () => modalData.totalAmountPaid;

//   const toWords = (amount) => {
//     return `Fourteen Thousand Rupees`; // Customize with real logic if needed
//   };

//   return (
//     <div>
//       <div className="w-[400px] pe-[15px] p-2 border-black border-1 rounded-sm dark:text-white">
//         <div className="flex justify-between">
//           <div className="h-auto w-[150px]">
//             <img
//               className="h-12 w-12 rounded-full"
//               src={user?.image?.url}
//               alt="logo"
//             />
//           </div>
//           <div className="text-center">
//             <h1 className="font-bold whitespace-nowrap text-[17px]">{user.schoolName}</h1>
//             <p className="text-sm"><span className="font-semibold">Address </span>: {user.address}</p>
//             <p className="text-sm"><span className="font-semibold">Contact </span>: {user.contact}</p>
//           </div>
//         </div>

//         <div className="bg-gray-300 text-center border-b-2 border-red-500">
//           <h3 className="font-bold text-[13px] scale-125">Fee receipt :</h3>
//         </div>

//         <div className="flex justify-between text-[12px]">
//           <div>
//             <div className="text-[14px]">Rec.No.: <strong>{modalData.feeReceiptNumber}</strong></div>
//             <div className="text-[14px]">Name: <strong>{modalData.studentName}</strong></div>
//             <div className="text-[14px]">Class: <strong>{modalData.studentClass}</strong></div>
//             <div className="text-[14px]">S/D. of: <strong>......</strong></div>
//             {modalData.transactionId.length > 4 && (
//               <div className="text-[14px]">checkBook/transactionId: <strong>{modalData.transactionId}</strong></div>
//             )}
//           </div>
//           <div>
//             <div className="text-[14px]">Date: <strong>{date()}</strong></div>
//             <div className="text-[14px]">Adm No: <strong>{modalData.admissionNumber}</strong></div>
//             <div className="text-[14px]">Mode: <strong>{modalData.paymentMode}</strong></div>
//           </div>
//         </div>

//         {(modalData.regularFees.length > 0 || modalData.additionalFees.length > 0) ? (
//           <table className="min-w-full leading-normal">
//             <thead>
//               <tr>
//                 <th className="border border-black pl-2 text-[14px]">Name</th>
//                 <th className="border border-black pl-2 text-[14px]">Month</th>
//                 <th className="border border-black pl-2 text-[14px]">Amount</th>
//                 <th className="border border-black pl-2 text-[14px]">Dues</th>
//                 <th className="border border-black pl-2 text-[14px]">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {modalData.regularFees.map((addFee, i) => (
//                 <tr key={`reg-${i}`}>
//                   <td className="border border-black pl-2 text-[14px]">FEE</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.month}</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.paidAmount}</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.dueAmount}</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.status}</td>
//                 </tr>
//               ))}
//               {modalData.additionalFees.map((addFee, i) => (
//                 <tr key={`add-${i}`}>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.name}</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.month}</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.paidAmount}</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.dueAmount}</td>
//                   <td className="border border-black pl-2 text-[14px]">{addFee.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <h1 className="text-center">No Fee</h1>
//         )}

//         <div className="mt-1">
//           <table className="w-full border border-black text-[14px]">
//             <tbody>
//               <tr>
//                 <td className="border border-black pl-2">Total Fee Amount.</td>
//                 <td className="border border-black pl-2">₹ {modalData.totalFeeAmount}</td>
//               </tr>
//               <tr>
//                 <td className="border border-black pl-2">Concession Amount</td>
//                 <td className="border border-black pl-2">₹ {modalData.concessionFee}</td>
//               </tr>
//               <tr>
//                 <td className="border border-black pl-2">Paid Amount</td>
//                 <td className="border border-black pl-2">₹ {modalData.totalAmountPaid}</td>
//               </tr>
//               <tr>
//                 <td className="border border-black pl-2">Total Dues</td>
//                 <td className="border border-black pl-2 text-red-600">₹ {modalData.totalDues}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <div className="border-black p-2 border-1 my-2">
//           <p className="text-[14px] font-bold">Rupees {toWords(Repees()).toUpperCase()} ONLY</p>
//           <p className="text-[14px]">Remarks: <strong>{modalData.remark}</strong></p>
//           <div className="flex justify-between text-[14px]">
//             <div>Fee Collected: ................</div>
//             <div>Authorised sign</div>
//           </div>
//         </div>

//         <div className="text-[10px] border-1 border-black p-2">
//           <p className="font-bold">Note:</p>
//           <ol className="list-decimal ml-5">
//             <li>Cheque is subject to the realization. Rs.500/- Extra will be charged in case of cheque dishonour.</li>
//             <li>Fee receipt and Fee card both should be kept in safe place for future.</li>
//             <li>Please check the entry made by fee clerk in fee Card and fee Receipt</li>
//           </ol>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaticReceipt;
