import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
const user = JSON.parse(localStorage.getItem("user"))
export const handleShareRegistration = async (student) => {
    try {
      toast.success("Message Send successfully!");
  
      const receiptCard = `
  -------------------------------------------
      ✨ *Registration Receipt* ✨
  -------------------------------------------
  *Registration No:* \`${student?.registrationNumber}\`
  *Name:* \`${student?.studentFullName}\`
  *Father's Name:* \`${student?.fatherName}\`
  *Gender:* \`${student?.gender}\`
  *Class:* \`${student?.registerClass}\`
  *Mobile Number:* \`${student?.mobileNumber}\`
  *Address:* \`${student?.studentAddress}\`
  *Receipt No:* \`${student?.registrationNumber}\`
  -------------------------------------------
             *Thank you!* 🙏
         Welcome To Our Family
          ${user?.schoolName}
          ${user?.address}
          ${user?.contact ?? ""}

  `;
  
      const encodedMessage = encodeURIComponent(receiptCard);
      const whatsappURL = `https://wa.me/91${student?.mobileNumber}?text=${encodedMessage}`;
      window.open(whatsappURL);
    //   window.open(whatsappURL, "_blank");
  
    } catch (error) {
      console.error("Error generating or sharing message:", error);
      toast.error("Error sharing message.");
    }
  };
  
export const FeeReceipt = async (fee) => {
    console.log("fee",fee)
    try {
      toast.success("Message Send successfully!");
      const receiptCard = `
  -------------------------------------------
       ✨ *Fee Receipt* ✨
  -------------------------------------------
  *Admission No:* \`${fee.admissionNumber?fee.admissionNumber:""}\`
  *Name:* \`${fee.studentName}\`
  *Class:* \`${fee.studentClass}\`
  *Receipt No:* \`${fee.feeReceiptNumber}\`
  *Pay Date:* \`${format(parseISO(fee.date), "dd/MM/yyyy")}\`
  *Total Amount Paid:* \`₹${fee.totalAmountPaid}\`
  *Month:* \`${fee.regularFees?.map((val)=>val?.month)}\`
  *Dues:* \`₹${fee.dues}\`
  *Remarks:* _${fee.remark || 'N/A'}_
  -------------------------------------------
             *Thank you!* 🙏
         Welcome To Our Family
          ${user?.schoolName}
          ${user?.address}
          ${user?.contact ?? ""}
 If there are any issues, please contact the accountant.

  `;
  
      const encodedMessage = encodeURIComponent(receiptCard);
      const whatsappURL = `https://wa.me/91${fee?.parentContact}?text=${encodedMessage}`;
      window.open(whatsappURL);
    //   window.open(whatsappURL, "_blank");
  
    } catch (error) {
      console.error("Error generating or sharing message:", error);
      toast.error("Error sharing message.");
    }
  };
  
  export const FeeResponseSibling = async (fees) => {
  try {
    console.log("fee", fees);
    toast.success("Message sent successfully!");

    let fullMessage = "";

    fees.forEach((fee) => {
      const receiptCard = `
-------------------------------------------
       ✨ *Fee Receipt* ✨
-------------------------------------------
*Admission No:* \`${fee.admissionNumber}\`
*Name:* \`${fee.studentName}\`
*Class:* \`${fee.studentClass}\`
*Contact:* \`${fee.parentContact}\`
*Receipt No:* \`${fee.feeReceiptNumber}\`

*Total Amount Paid:* \`₹${fee.totalAmountPaid}\`
*Month:* \`${fee.regularFees.map((val) => val.month).join(", ")}\`
*Dues Remaining:* \`₹${fee.dues}\`
*Remarks:* _${fee.paymentMessage || "N/A"}_
-------------------------------------------
         *Thank you!* 🙏
     Welcome To Our Family
     ${user?.schoolName || "Our School"}
     ${user?.address || ""}
     ${user?.contact || ""}
If there are any issues, please contact the accountant.

`;

      fullMessage += receiptCard + "\n\n";
    });

    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappURL = `https://wa.me/91${fees[0].parentContact}?text=${encodedMessage}`;
    window.open(whatsappURL);
  } catch (error) {
    console.error("Error generating or sharing message:", error);
    toast.error("Error sharing message.");
  }
};

// export const FeeResponseSibling = async (fee) => {
//     console.log("fee",fee)
//     try {
//       toast.success("Message Send successfully!");
//       const receiptCard = `
//   -------------------------------------------
//        ✨ *Fee Receipt* ✨
//   -------------------------------------------
//   *Admission No:* \`${fee.studentAdmissionNumber?fee.studentAdmissionNumber:""}\`
//   *Name:* \`${fee.studentName}\`
//   *Class:* \`${fee?.feeReceipt?.studentClass}\`
//   *Contact:* \`${fee?.feeReceipt?.parentContact}\`
//   *Receipt No:* \`${fee.unifiedReceiptNumber}\`

//   *Total Amount Paid:* \`₹${fee?.feeReceipt?.totalAmountPaid}\`
//   *Month:* \`${fee?.feeReceipt?.regularFees?.map((val)=>val?.month)}\`
//   *Dues:* \`₹${fee?.feeReceipt?.dues}\`
//   *Remarks:* _${fee?.feeReceipt?.paymentMessage|| 'N/A'}_
//   -------------------------------------------
//              *Thank you!* 🙏
//          Welcome To Our Family
//           ${user?.schoolName}
//           ${user?.address}
//           ${user?.contact ?? ""}
//  If there are any issues, please contact the accountant.

//   `;
  
//       const encodedMessage = encodeURIComponent(receiptCard);
//       const whatsappURL = `https://wa.me/91${fee?.parentContact}?text=${encodedMessage}`;
//       window.open(whatsappURL);
//     //   window.open(whatsappURL, "_blank");
  
//     } catch (error) {
//       console.error("Error generating or sharing message:", error);
//       toast.error("Error sharing message.");
//     }
//   };
export const FeeResponse = async (fee) => {
    console.log("fee",fee)
    try {
      toast.success("Message Send successfully!");
      const receiptCard = `
  -------------------------------------------
       ✨ *Fee Receipt* ✨
  -------------------------------------------
  *Admission No:* \`${fee.studentAdmissionNumber?fee.studentAdmissionNumber:""}\`
  *Name:* \`${fee.studentName}\`
  *Class:* \`${fee?.feeReceipt?.studentClass}\`
  *Contact:* \`${fee?.feeReceipt?.parentContact}\`
  *Receipt No:* \`${fee.feeReceiptNumber}\`

  *Total Amount Paid:* \`₹${fee?.feeReceipt?.totalAmountPaid}\`
  *Month:* \`${fee?.feeReceipt?.regularFees?.map((val)=>val?.month)}\`
  *Dues:* \`₹${fee?.feeReceipt?.dues}\`
  *Remarks:* _${fee?.feeReceipt?.paymentMessage|| 'N/A'}_
  -------------------------------------------
             *Thank you!* 🙏
         Welcome To Our Family
          ${user?.schoolName}
          ${user?.address}
          ${user?.contact ?? ""}
 If there are any issues, please contact the accountant.

  `;
  
      const encodedMessage = encodeURIComponent(receiptCard);
      const whatsappURL = `https://wa.me/91${fee?.parentContact}?text=${encodedMessage}`;
      window.open(whatsappURL);
    //   window.open(whatsappURL, "_blank");
  
    } catch (error) {
      console.error("Error generating or sharing message:", error);
      toast.error("Error sharing message.");
    }
  };
  

// export const FeeReceipt = async (fee, user) => {
//     try {
//       const receiptCard = `
//   -------------------------------------------
//        ✨ *Fee Receipt* ✨
//   -------------------------------------------
//   *Admission No:* \`${fee.admissionNumber}\`
//   *Name:* \`${fee.studentName}\`
//   *Class:* \`${fee.studentClass}\`
//   *Receipt No:* \`${fee.feeReceiptNumber}\`
//   *Pay Date:* \`${format(parseISO(fee.date), "dd/MM/yyyy")}\`
//   *Total Amount Paid:* \`₹${fee.totalAmountPaid}\`
//   *Month:* \`${fee.regularFees?.map((val) => val?.month).join(", ")}\`
//   *Dues:* \`₹${fee.dues}\`
//   *Remarks:* _${fee.remark || 'N/A'}_
//   -------------------------------------------
//              *Thank you!* 🙏
//          Welcome To Our Family
//           ${user?.schoolName}
//           ${user?.address}
//           ${user?.contact ?? ""}
//   If there are any issues, please contact the accountant.
//   `;
//       const encodedMessage = encodeURIComponent(receiptCard);
//       const whatsappURL = `https://wa.me/91${"9873998919"}?text=${encodedMessage}`;
//       const win = window.open(whatsappURL, "_blank");
      
  
//       // Optional fallback for slow network or popup blocked
//       setTimeout(() => {
//         if (!win || win.closed || typeof win.closed === "undefined") {
//           toast.info("If WhatsApp did not open, please check popup settings or open WhatsApp manually.");
//         }
//       }, 2000);
  
//       toast.success("Message sent successfully!");
  
//     } catch (error) {
//       console.error("Error generating or sharing message:", error);
//       toast.error("Error sharing message.");
//     }
//   };
  



// import { toast } from 'react-toastify';
// export const handleShareRegistration = async (student, user) => {
//     try {
//         toast.success("Message Send successfully!");
//         const receiptCard = `
// -------------------------------------------
//     ✨ *Registration Receipt* ✨
// -------------------------------------------
// *Registration No:* \`${student?.registrationNumber}\`
// *Name:* \`${student?.studentFullName}\`
// *Father's Name:* \`${student?.fatherName}\`
// *Gender:* \`${student?.gender}\`
// *Class:* \`${student?.registerClass}\`
// *Mobile Number:* \`${student?.mobileNumber}\`
// *Address:* \`${student?.studentAddress}\`
// *Receipt No:* \`${student?.registrationNumber}\`
// -------------------------------------------
//            *Thank you!* 🙏
//        Welcome To Our Family
//         ${user?.schoolName}
//         ${user?.address}
//         ${user?.contact?user?.contact:""}
// `;

//         const message = `${receiptCard}`
//         const encodedMessage = encodeURIComponent(message);
//         const whatsappURL = `https://wa.me/91${student?.mobileNumber}?text=${encodedMessage}`;
//         window.open(whatsappURL, '_blank');

//     } catch (error) {
//         console.error("Error generating or sharing PDF:", error);
//         toast.error("Error sharing PDF.");
//     }
// };


// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { toast } from 'react-toastify';

// /**
//  * Generates a PDF and shares it via WhatsApp for a given student.
//  * @param {Object} student - Student details.
//  * @param {Object} user - User/school details.
//  * @param {Ref} componentRef - React ref of the component to convert to PDF.
//  * @param {Function} uploadPDF - Function to upload PDF and return a URL (optional).
//  */
// export const handleWhatsAppSharePDF = async (student, user, componentRef, uploadPDF = null) => {
//     const element = componentRef.current;

//     if (!element) {
//         console.error("Component not found for PDF generation.");
//         toast.error("Failed to generate PDF for sharing.");
//         return;
//     }

//     try {
//         // Uncomment if you plan to include PDF sharing via URL
//         // const canvas = await html2canvas(element, {
//         //     useCORS: true,
//         //     scale: 2,
//         // });
//         // const imgData = canvas.toDataURL('image/png');
//         // const pdf = new jsPDF('p', 'mm', 'a4');
//         // const imgWidth = 210;
//         // const imgHeight = (canvas.height * imgWidth) / canvas.width;
//         // pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
//         // const pdfBlob = pdf.output('blob');

//         // if (uploadPDF) {
//         //     toast.info("Uploading PDF...");
//         //     const pdfURL = await uploadPDF(pdfBlob);
//         //     if (!pdfURL) {
//         //         toast.error("Failed to upload PDF.");
//         //         return;
//         //     }
//         //     // Include the PDF URL in message if needed
//         // }

//         toast.success("Message Send successfully!");

//         const receiptCard = `
// -------------------------------------------
//     ✨ *Registration Receipt* ✨
// -------------------------------------------
// *Registration No:* \`${student?.registrationNumber}\`
// *Name:* \`${student?.studentFullName}\`
// *Father's Name:* \`${student?.fatherName}\`
// *Gender:* \`${student?.gender}\`
// *Class:* \`${student?.registerClass}\`
// *Mobile Number:* \`${student?.mobileNumber}\`
// *Address:* \`${student?.studentAddress}\`
// *Receipt No:* \`${student?.registrationNumber}\`
// -------------------------------------------
//             *Thank you!* 🙏
//        Welcome To Our Family
//         ${user?.schoolName}
//         ${user?.address}
//         ${user?.contact}
// -------------------------------------------
// `;

//         const message = `
// *${user?.schoolName}*
// ${user?.address}\n
// ${user?.contact}\n
// ${receiptCard}`;

//         const encodedMessage = encodeURIComponent(message);
//         const whatsappURL = `https://wa.me/91${student?.mobileNumber}?text=${encodedMessage}`;
//         window.open(whatsappURL, '_blank');

//     } catch (error) {
//         console.error("Error generating or sharing PDF:", error);
//         toast.error("Error sharing PDF.");
//     }
// };
