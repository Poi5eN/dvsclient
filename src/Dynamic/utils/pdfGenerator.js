import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates a PDF document with a table and a summary page, then opens
 * it in a new browser window/tab for previewing or printing.
 * @param {Array<Object>} data - The array of data objects for the table body.
 * @param {Array<Object>} columns - The column definitions for the table.
 * @param {number|string} overallTotalPaid - The pre-calculated overall total paid amount.
 * @param {number|string} overallTotalDuesSum - The pre-calculated sum of the 'totalDues' field from records.
 * @param {number|string} cashPayment - The pre-calculated total paid via cash.
 * @param {number|string} onlinePayment - The pre-calculated total paid via online methods.
 * @param {number|string} bankPayment - The pre-calculated total paid via bank methods.
 * @param {string} [filename='fee-data.pdf'] - Optional: Can influence the suggested filename if saved from preview.
 */
const generatePdf = (
    data,
    columns,
    overallTotalPaid = 0,
    overallTotalDuesSum = 0,
    cashPayment = 0,
    onlinePayment = 0,
    bankPayment = 0,
    filename = 'fee-data.pdf' // Keep filename for context, though not directly used by output method
) => {
    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : [data];

    // === Data Validation ===
    if (!dataArray || dataArray.length === 0) {
        console.error("PDF generate karne ke liye data nahi hai.");
        alert("PDF generate karne ke liye data nahi hai.");
        return;
    }
    if (!dataArray[0] || typeof dataArray[0] !== 'object') {
        console.error("Data array mein valid objects nahi hain ya format galat hai.");
        alert("Data format sahi nahi hai. Objects ka array hona chahiye.");
        return;
    }

    // === Helper to Parse and Format Currency ===
    const parseAndFormat = (value, label = "value") => {
        let numericValue = 0;
        const parsedValue = parseFloat(value);
        // Keep console logs for debugging if needed
        // console.log(`[generatePdf] Received ${label}:`, value, "Type:", typeof value);
        // console.log(`[generatePdf] Parsed ${label}:`, parsedValue);
        if (!isNaN(parsedValue)) {
            numericValue = parsedValue;
        } else {
            // console.warn(`[generatePdf] Could not parse ${label} '${value}'. Using 0.`);
        }
        const formattedValue = numericValue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        // console.log(`[generatePdf] Formatted ${label}:`, formattedValue);
        return formattedValue;
    };

    // --- Format all passed-in totals ---
    const formattedTotalPaid = parseAndFormat(overallTotalPaid, "overallTotalPaid");
    const formattedTotalDues = parseAndFormat(overallTotalDuesSum, "overallTotalDuesSum");
    const formattedCashPayment = parseAndFormat(cashPayment, "cashPayment");
    const formattedOnlinePayment = parseAndFormat(onlinePayment, "onlinePayment");
    const formattedBankPayment = parseAndFormat(bankPayment, "bankPayment");

    // === PDF Document Setup ===
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // === Main Table Title ===
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Student Fee Receipt Details", 14, 15);
    doc.setFont(undefined, 'normal');

    // === AutoTable Configuration ===
    const tableSettings = { /* ... same as before ... */ };
    // Copy the settings from your previous version here:
    tableSettings.columns = columns;
    tableSettings.body = dataArray;
    tableSettings.startY = 20;
    tableSettings.theme = 'grid';
    tableSettings.headStyles = { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' };
    tableSettings.bodyStyles = { textColor: [44, 62, 80], valign: 'middle' };
    tableSettings.alternateRowStyles = { fillColor: [236, 240, 241] };
    tableSettings.styles = { fontSize: 9, cellPadding: 3, overflow: 'linebreak' };
    tableSettings.didParseCell = function (hookData) {
        // Date Formatting
        if (hookData.column.dataKey === 'date' && hookData.cell.raw) {
            try {
                const formattedDate = new Date(hookData.cell.raw).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                hookData.cell.text = [formattedDate];
            } catch (e) { hookData.cell.text = [String(hookData.cell.raw)]; }
        }
        // Number Formatting
        const numericKeys = ['totalAmountPaid', 'totalDues', 'totalFeeAmount'];
        if (numericKeys.includes(hookData.column.dataKey)) {
            const numValue = parseFloat(hookData.cell.raw);
            if (typeof hookData.cell.raw === 'number' || !isNaN(numValue)) {
                 hookData.cell.text = [(isNaN(numValue)? 0 : numValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })];
            } else {
                 hookData.cell.text = [String(hookData.cell.raw)];
            }
        }
    };
    tableSettings.didDrawPage = function (hookData) {
        let pageNumber = doc.internal.getNumberOfPages();
        doc.setFontSize(8); doc.setTextColor(100);
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const footerMargin = 10;
        doc.text('Page ' + pageNumber, hookData.settings.margin.left, pageHeight - footerMargin);
        const dateText = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
        const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        doc.text(dateText, pageWidth - hookData.settings.margin.right - dateTextWidth, pageHeight - footerMargin);
    };


    // === Generate the Table ===
    doc.autoTable(tableSettings);

    // === Add Summary Page ===
    doc.addPage();

    // Get dimensions and define margins/spacing
    const summaryPageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const summaryPageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const summaryMarginLeft = 20;
    const summaryMarginRight = 20;
    const summaryMarginTop = 20;
    const footerMargin = 10;
    const lineSpacing = 7;

    // --- Summary Title ---
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Payment Summary", summaryPageWidth / 2, summaryMarginTop, { align: 'center' });

    // --- Summary Content (Left Aligned Labels, Right Aligned Values) ---
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const xPosLabel = summaryMarginLeft;
    const xPosValue = summaryPageWidth - summaryMarginRight;
    let currentY = summaryMarginTop + 15;

    // Overall Total Paid
    doc.setFont(undefined, 'bold');
    doc.text(`Total Amount Paid:`, xPosLabel, currentY);
    doc.text(` ${formattedTotalPaid}`, xPosValue, currentY, { align: 'right' });
    doc.setFont(undefined, 'normal');
    currentY += lineSpacing * 1.5;

    // Payment Mode Breakdown Title
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text(`Breakdown by Payment Mode:`, xPosLabel, currentY);
    doc.setFontSize(12); doc.setFont(undefined, 'normal');
    currentY += lineSpacing;

    // Cash Payment
    doc.text(`Cash Payments:`, xPosLabel, currentY);
    doc.text(` ${formattedCashPayment}`, xPosValue, currentY, { align: 'right' });
    currentY += lineSpacing;

    // Online Payment
    doc.text(`Online Payments:`, xPosLabel, currentY);
    doc.text(` ${formattedOnlinePayment}`, xPosValue, currentY, { align: 'right' });
    currentY += lineSpacing;

    // Bank Payment
    doc.text(`Bank Payments:`, xPosLabel, currentY);
    doc.text(` ${formattedBankPayment}`, xPosValue, currentY, { align: 'right' });
    currentY += lineSpacing * 1.5;

    // Overall Total Dues Sum
    doc.setFont(undefined, 'bold');
    doc.text(`Total Dues Sum (All Records):`, xPosLabel, currentY);
    doc.text(` ${formattedTotalDues}`, xPosValue, currentY, { align: 'right' });
    doc.setFont(undefined, 'normal');

    // === Add Footer to Summary Page (Manually) ===
    let finalPageNumber = doc.internal.getNumberOfPages();
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text('Page ' + finalPageNumber, summaryMarginLeft, summaryPageHeight - footerMargin);
    const dateTextFooter = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
    const dateTextWidthFooter = doc.getStringUnitWidth(dateTextFooter) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(dateTextFooter, summaryPageWidth - summaryMarginRight - dateTextWidthFooter, summaryPageHeight - footerMargin);

    // === Open PDF in New Window/Tab for Print/Preview ===
    // --- THIS IS THE KEY CHANGE ---
    try {
        doc.output('dataurlnewwindow'); // Instead of doc.save()
        console.log(`PDF opened for preview/print.`);
    } catch (error) {
        console.error("PDF generation or preview failed:", error);
        alert("PDF ko generate karne ya preview karne mein error aayi. Details ke liye console check karein.");
    }
};

export default generatePdf;


// print Option..................................................................................................


// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// /**
//  * Generates a PDF document with a table and a summary page showing various totals.
//  * @param {Array<Object>} data - The array of data objects for the table body.
//  * @param {Array<Object>} columns - The column definitions for the table.
//  * @param {number|string} overallTotalPaid - The pre-calculated overall total paid amount.
//  * @param {number|string} overallTotalDuesSum - The pre-calculated sum of the 'totalDues' field from records.
//  * @param {number|string} cashPayment - The pre-calculated total paid via cash.
//  * @param {number|string} onlinePayment - The pre-calculated total paid via online methods.
//  * @param {number|string} bankPayment - The pre-calculated total paid via bank methods.
//  * @param {string} [filename='fee-data.pdf'] - The desired filename for the downloaded PDF.
//  */
// const generatePdf = (
//     data,
//     columns,
//     overallTotalPaid = 0,
//     overallTotalDuesSum = 0,
//     cashPayment = 0, // Renamed to camelCase
//     onlinePayment = 0,// Renamed to camelCase
//     bankPayment = 0,  // Renamed to camelCase
//     filename = 'fee-data.pdf'
// ) => {
//     // Ensure data is an array
//     const dataArray = Array.isArray(data) ? data : [data];

//     // === Data Validation ===
//     if (!dataArray || dataArray.length === 0) { /* ... error handling ... */ return; }
//     if (!dataArray[0] || typeof dataArray[0] !== 'object') { /* ... error handling ... */ return; }

//     // === Helper to Parse and Format Currency ===
//     const parseAndFormat = (value, label = "value") => {
//         let numericValue = 0;
//         const parsedValue = parseFloat(value);
//         console.log(`[generatePdf] Received ${label}:`, value, "Type:", typeof value);
//         console.log(`[generatePdf] Parsed ${label}:`, parsedValue);
//         if (!isNaN(parsedValue)) {
//             numericValue = parsedValue;
//         } else {
//             console.warn(`[generatePdf] Could not parse ${label} '${value}'. Using 0.`);
//         }
//         const formattedValue = numericValue.toLocaleString('en-IN', {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });
//         console.log(`[generatePdf] Formatted ${label}:`, formattedValue);
//         return formattedValue; // Return only the formatted string
//     };

//     // --- Format all passed-in totals ---
//     const formattedTotalPaid = parseAndFormat(overallTotalPaid, "overallTotalPaid");
//     const formattedTotalDues = parseAndFormat(overallTotalDuesSum, "overallTotalDuesSum");
//     const formattedCashPayment = parseAndFormat(cashPayment, "cashPayment");
//     const formattedOnlinePayment = parseAndFormat(onlinePayment, "onlinePayment");
//     const formattedBankPayment = parseAndFormat(bankPayment, "bankPayment");
//     // Note: You could also calculate and format an "Other" category if needed

//     // === PDF Document Setup ===
//     const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

//     // === Main Table Title ===
//     doc.setFontSize(14);
//     doc.setFont(undefined, 'bold');
//     doc.text("Student Fee Receipt Details", 14, 15);
//     doc.setFont(undefined, 'normal');

//     // === AutoTable Configuration ===
//     const tableSettings = {
//         columns: columns,
//         body: dataArray,
//         startY: 20,
//         theme: 'grid',
//         headStyles: { /* ... */ },
//         bodyStyles: { /* ... */ },
//         alternateRowStyles: { /* ... */ },
//         styles: { /* ... */ },
//         didParseCell: function (hookData) { /* ... formatting logic ... */ },
//         didDrawPage: function (hookData) { /* ... footer logic ... */ }
//     };
//     // Apply existing styles and hooks
//     tableSettings.headStyles = { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' };
//     tableSettings.bodyStyles = { textColor: [44, 62, 80], valign: 'middle' };
//     tableSettings.alternateRowStyles = { fillColor: [236, 240, 241] };
//     tableSettings.styles = { fontSize: 9, cellPadding: 3, overflow: 'linebreak' };
//     tableSettings.didParseCell = function (hookData) {
//         // Date Formatting
//         if (hookData.column.dataKey === 'date' && hookData.cell.raw) {
//             try {
//                 const formattedDate = new Date(hookData.cell.raw).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
//                 hookData.cell.text = [formattedDate];
//             } catch (e) { hookData.cell.text = [String(hookData.cell.raw)]; }
//         }
//         // Number Formatting
//         const numericKeys = ['totalAmountPaid', 'totalDues', 'totalFeeAmount'];
//         if (numericKeys.includes(hookData.column.dataKey)) {
//             const numValue = parseFloat(hookData.cell.raw);
//             if (typeof hookData.cell.raw === 'number' || !isNaN(numValue)) {
//                  hookData.cell.text = [(isNaN(numValue)? 0 : numValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })];
//             } else {
//                  hookData.cell.text = [String(hookData.cell.raw)]; // Display non-numbers as is
//             }
//         }
//     };
//     tableSettings.didDrawPage = function (hookData) {
//         let pageNumber = doc.internal.getNumberOfPages();
//         doc.setFontSize(8); doc.setTextColor(100);
//         const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//         const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
//         const footerMargin = 10;
//         doc.text('Page ' + pageNumber, hookData.settings.margin.left, pageHeight - footerMargin);
//         const dateText = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//         const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//         doc.text(dateText, pageWidth - hookData.settings.margin.right - dateTextWidth, pageHeight - footerMargin);
//     };

//     // === Generate the Table ===
//     doc.autoTable(tableSettings);

//     // === Add Summary Page ===
//     doc.addPage();

//     // Get dimensions and define margins/spacing
//     const summaryPageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
//     const summaryPageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//     const summaryMarginLeft = 20;
//     const summaryMarginRight = 20;
//     const summaryMarginTop = 20;
//     const footerMargin = 10;
//     const lineSpacing = 7; // Adjusted spacing

//     // --- Summary Title ---
//     doc.setFontSize(16);
//     doc.setFont(undefined, 'bold');
//     doc.text("Payment Summary", summaryPageWidth / 2, summaryMarginTop, { align: 'center' });

//     // --- Summary Content (Left Aligned Labels, Right Aligned Values) ---
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'normal');

//     // Define positions
//     const xPosLabel = summaryMarginLeft;
//     const xPosValue = summaryPageWidth - summaryMarginRight; // Position for right-aligned values
//     let currentY = summaryMarginTop + 15; // Starting Y position below title

//     // Overall Total Paid
//     doc.setFont(undefined, 'bold'); // Make totals bold
//     doc.text(`Total Amount Paid:`, xPosLabel, currentY);
//     doc.text(` ${formattedTotalPaid}`, xPosValue, currentY, { align: 'right' });
//     doc.setFont(undefined, 'normal'); // Reset font style
//     currentY += lineSpacing * 1.5; // Extra space after overall total

//     // Payment Mode Breakdown Title
//     doc.setFontSize(11); // Slightly smaller for breakdown title
//     doc.setFont(undefined, 'bold');
//     doc.text(`Breakdown by Payment Mode:`, xPosLabel, currentY);
//     doc.setFontSize(12); // Reset font size
//     doc.setFont(undefined, 'normal');
//     currentY += lineSpacing;

//     // Cash Payment
//     doc.text(`Cash Payments:`, xPosLabel, currentY);
//     doc.text(`${formattedCashPayment}`, xPosValue, currentY, { align: 'right' });
//     currentY += lineSpacing;

//     // Online Payment
//     doc.text(`Online Payments:`, xPosLabel, currentY);
//     doc.text(`${formattedOnlinePayment}`, xPosValue, currentY, { align: 'right' });
//     currentY += lineSpacing;

//     // Bank Payment
//     doc.text(`Bank Payments:`, xPosLabel, currentY);
//     doc.text(`${formattedBankPayment}`, xPosValue, currentY, { align: 'right' });
//     currentY += lineSpacing * 1.5; // Extra space before dues

//     // Overall Total Dues Sum
//     doc.setFont(undefined, 'bold'); // Make dues bold
//     doc.text(`Total Dues Sum (All Records):`, xPosLabel, currentY); // Clarified label
//     doc.text(`${formattedTotalDues}`, xPosValue, currentY, { align: 'right' });
//     doc.setFont(undefined, 'normal');

//     // === Add Footer to Summary Page (Manually) ===
//     let finalPageNumber = doc.internal.getNumberOfPages();
//     doc.setFontSize(8); doc.setTextColor(100);
//     doc.text('Page ' + finalPageNumber, summaryMarginLeft, summaryPageHeight - footerMargin);
//     const dateTextFooter = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//     const dateTextWidthFooter = doc.getStringUnitWidth(dateTextFooter) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//     doc.text(dateTextFooter, summaryPageWidth - summaryMarginRight - dateTextWidthFooter, summaryPageHeight - footerMargin);

//     // === Save the PDF ===
//     try {
//         doc.save(filename);
//         console.log(`PDF "${filename}" generated successfully.`);
//     } catch (error) { /* ... error handling ... */ }
// };

// export default generatePdf;



// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// /**
//  * Generates a PDF document with a table and a summary page showing total paid and total dues.
//  * @param {Array<Object>} data - The array of data objects for the table body.
//  * @param {Array<Object>} columns - The column definitions for the table (e.g., [{ header: 'Name', dataKey: 'name' }]).
//  * @param {number|string} overallTotalPaid - The pre-calculated total paid amount.
//  * @param {number|string} overallTotalDuesSum - The pre-calculated total dues amount.
//  * @param {string} [filename='fee-data.pdf'] - The desired filename for the downloaded PDF.
//  */
// const generatePdf = (data, columns, overallTotalPaid = 0, overallTotalDuesSum = 0,cashpayment=0,onlinepayment=0,bankpayment=0,filename = 'fee-data.pdf') => {
//     // Ensure data is an array, even if a single object is passed
//     const dataArray = Array.isArray(data) ? data : [data];

//     // === Data Validation ===
//     if (!dataArray || dataArray.length === 0) {
//         console.error("PDF generate karne ke liye data nahi hai.");
//         alert("PDF generate karne ke liye data nahi hai.");
//         return; // Stop execution if no data
//     }

//     // Basic check for valid objects in the data array
//     if (!dataArray[0] || typeof dataArray[0] !== 'object') {
//         console.error("Data array mein valid objects nahi hain ya format galat hai.");
//         alert("Data format sahi nahi hai. Objects ka array hona chahiye.");
//         return; // Stop execution if data format is wrong
//     }

//     // === Handle and Format Passed-in Totals ===
//     // --- Total Paid ---
//     let paidAmountForSummary = 0;
//     const parsedPaidAmount = parseFloat(overallTotalPaid);
//     console.log("[generatePdf] Received overallTotalPaid:", overallTotalPaid, "Type:", typeof overallTotalPaid);
//     console.log("[generatePdf] Parsed Paid Amount:", parsedPaidAmount);
//     if (!isNaN(parsedPaidAmount)) {
//         paidAmountForSummary = parsedPaidAmount;
//     } else {
//         console.warn(`[generatePdf] Could not parse paid amount '${overallTotalPaid}'. Using 0.`);
//     }
//     const formattedTotalPaid = paidAmountForSummary.toLocaleString('en-IN', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });
//     console.log("[generatePdf] Formatted Paid Amount:", formattedTotalPaid);

//     // --- Total Dues ---
//     let duesAmountForSummary = 0;
//     const parsedDuesAmount = parseFloat(overallTotalDuesSum);
//     console.log("[generatePdf] Received overallTotalDuesSum:", overallTotalDuesSum, "Type:", typeof overallTotalDuesSum);
//     console.log("[generatePdf] Parsed Dues Amount:", parsedDuesAmount);
//     if (!isNaN(parsedDuesAmount)) {
//         duesAmountForSummary = parsedDuesAmount;
//     } else {
//         console.warn(`[generatePdf] Could not parse dues amount '${overallTotalDuesSum}'. Using 0.`);
//     }
//     const formattedTotalDues = duesAmountForSummary.toLocaleString('en-IN', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });
//     console.log("[generatePdf] Formatted Dues Amount:", formattedTotalDues);


//     // === PDF Document Setup ===
//     const doc = new jsPDF({
//         orientation: 'landscape', // 'l' or 'landscape'
//         unit: 'mm',               // Measurement unit
//         format: 'a4'              // Page size
//     });

//     // === Main Table Title ===
//     doc.setFontSize(14);
//     doc.setFont(undefined, 'bold');
//     doc.text("Student Fee Receipt Details", 14, 15); // Positioned slightly from top-left
//     doc.setFont(undefined, 'normal'); // Reset font style for subsequent text

//     // === AutoTable Configuration ===
//     const tableSettings = {
//         columns: columns,
//         body: dataArray,          // Use the validated and normalized dataArray
//         startY: 20,               // Start table below the title
//         theme: 'grid',            // Table appearance theme
//         headStyles: {
//             fillColor: [41, 128, 185], // Header background color (a shade of blue)
//             textColor: [255, 255, 255], // Header text color (white)
//             fontStyle: 'bold',        // Make header text bold
//             halign: 'center'           // Center align header text horizontally
//         },
//         bodyStyles: {
//             textColor: [44, 62, 80],   // Body text color (dark grey)
//             valign: 'middle'           // Vertically align cell content in the middle
//         },
//         alternateRowStyles: {
//             fillColor: [236, 240, 241] // Alternate row background color (light grey)
//         },
//         styles: {
//             fontSize: 9,               // Font size for table content
//             cellPadding: 3,            // Padding within cells
//             overflow: 'linebreak'      // Wrap text within cells if it overflows
//         },
//         // --- Cell Hook: Format specific cell data ---
//         didParseCell: function (hookData) {
//             // Format Date cells
//             if (hookData.column.dataKey === 'date' && hookData.cell.raw) {
//                 try {
//                     // Format date to DD/MM/YYYY for Indian locale
//                     const formattedDate = new Date(hookData.cell.raw).toLocaleDateString('en-IN', {
//                         day: '2-digit', month: '2-digit', year: 'numeric'
//                     });
//                     hookData.cell.text = [formattedDate]; // autoTable expects text as an array
//                 } catch (e) {
//                     console.warn(`Date format karne mein error (${hookData.cell.raw}):`, e);
//                     // Fallback to original string if formatting fails
//                     hookData.cell.text = hookData.cell.text || [String(hookData.cell.raw)];
//                 }
//             }

//             // Format numeric columns (like Paid, Dues, Fee) in the main table if desired
//             const numericKeys = ['totalAmountPaid', 'totalDues', 'totalFeeAmount'];
//             // Check if the dataKey is in our list AND if the raw value is actually a number
//             if (numericKeys.includes(hookData.column.dataKey) && typeof hookData.cell.raw === 'number') {
//                  hookData.cell.text = [hookData.cell.raw.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })];
//             }
//             // Handle cases where the raw value might be null or not a number but should be displayed (e.g., as 0.00 or '-')
//             else if (numericKeys.includes(hookData.column.dataKey) && (hookData.cell.raw === null || typeof hookData.cell.raw !== 'number')) {
//                  // Optionally display '0.00' or '-' for non-numeric/null values in these columns
//                  // hookData.cell.text = ['0.00'];
//                  // Or just let it display whatever the raw value is (like null or 'abc')
//                  hookData.cell.text = [String(hookData.cell.raw)]; // Ensure it's a string array
//             }
//         },
//         // --- Page Hook: Add footer to each table page ---
//         didDrawPage: function (hookData) {
//             let pageNumber = doc.internal.getNumberOfPages();
//             doc.setFontSize(8);
//             doc.setTextColor(100); // Set footer text color (grey)

//             const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//             const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
//             const footerMargin = 10; // 10mm from bottom edge

//             // Page Number (Left Aligned)
//             doc.text('Page ' + pageNumber, hookData.settings.margin.left, pageHeight - footerMargin);

//             // Generation Date (Right Aligned)
//             const dateText = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//             // Calculate text width to right-align it correctly
//             const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//             doc.text(dateText, pageWidth - hookData.settings.margin.right - dateTextWidth, pageHeight - footerMargin);
//         }
//     };

//     // === Generate the Table ===
//     doc.autoTable(tableSettings);

//     // === Add Summary Page ===
//     doc.addPage(); // Add a new blank page after the table is drawn

//     // Get dimensions and define margins for the summary page
//     const summaryPageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
//     const summaryPageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//     const summaryMarginLeft = 20;
//     const summaryMarginRight = 20;
//     const summaryMarginTop = 20;
//     const footerMargin = 10; // Consistent footer margin from bottom
//     const lineSpacing = 8;    // Vertical space between summary lines

//     // --- Summary Title ---
//     doc.setFontSize(16);
//     doc.setFont(undefined, 'bold');
//     doc.text("Payment Summary", summaryPageWidth / 2, summaryMarginTop, { align: 'center' });

//     // --- Summary Content ---
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'normal');

//     // Define text strings
//     const paidAmtText = `Total Amount Paid (All Records): ₹ ${formattedTotalPaid}`;
//     const duesAmtText = `Total Amount Dues (All Records): ₹ ${formattedTotalDues}`;

//     // Define positions for the lines
//     const yPosPaid = summaryMarginTop + 20;         // Y position for the first line
//     const yPosDues = yPosPaid + lineSpacing;        // Y position for the second line
//     const xPosCenter = summaryPageWidth / 2;        // X position for centering

//     // Draw the text lines with correct arguments: text, x, y, options
//     doc.text(paidAmtText, xPosCenter, yPosPaid, { align: 'center' });
//     doc.text(duesAmtText, xPosCenter, yPosDues, { align: 'center' }); // Corrected call

//     // === Add Footer to Summary Page (Manually) ===
//     // The didDrawPage hook doesn't apply to manually added pages
//     let finalPageNumber = doc.internal.getNumberOfPages();
//     doc.setFontSize(8);
//     doc.setTextColor(100);

//     // Page Number (Left Aligned)
//     doc.text('Page ' + finalPageNumber, summaryMarginLeft, summaryPageHeight - footerMargin);

//     // Generation Date (Right Aligned)
//     const dateTextFooter = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//     const dateTextWidthFooter = doc.getStringUnitWidth(dateTextFooter) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//     doc.text(dateTextFooter, summaryPageWidth - summaryMarginRight - dateTextWidthFooter, summaryPageHeight - footerMargin);

//     // === Save the PDF ===
//     try {
//         doc.save(filename);
//         console.log(`PDF "${filename}" generated successfully.`);
//     } catch (error) {
//         console.error("PDF save karne mein error:", error);
//         alert("PDF ko save karne mein error aayi. Details ke liye console check karein.");
//     }
// };

// export default generatePdf;


// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// /**
//  * Generates a PDF document with a table and a summary page.
//  * @param {Array<Object>} data - The array of data objects for the table body.
//  * @param {Array<Object>} columns - The column definitions for the table (e.g., [{ header: 'Name', dataKey: 'name' }]).
//  * @param {number|string} overallTotalPaid - The pre-calculated total amount to display on the summary page. Should be a number or a string representing a number.
//  * @param {string} [filename='table-data.pdf'] - The desired filename for the downloaded PDF.
//  */
// const generatePdf = (data, columns, overallTotalPaid = 0,dues=0, filename = 'fee-data.pdf') => {
//     // Ensure data is an array, even if a single object is passed
//     const dataArray = Array.isArray(data) ? data : [data];

//     // === Data Validation ===
//     if (!dataArray || dataArray.length === 0) {
//         console.error("PDF generate karne ke liye data nahi hai.");
//         alert("PDF generate karne ke liye data nahi hai.");
//         return; // Stop execution if no data
//     }

//     // Basic check for valid objects in the data array
//     if (!dataArray[0] || typeof dataArray[0] !== 'object') {
//         console.error("Data array mein valid objects nahi hain ya format galat hai.");
//         alert("Data format sahi nahi hai. Objects ka array hona chahiye.");
//         return; // Stop execution if data format is wrong
//     }

//     const paidAmount = parseFloat(overallTotalPaid);
//     const paiddues = parseFloat(dues);

//     const formattedTotalPaid = paidAmount.toLocaleString('en-IN', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });

//     const formattedTotaldues = paiddues.toLocaleString('en-IN', {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2
//     });

//     // === PDF Document Setup ===
//     const doc = new jsPDF({
//         orientation: 'landscape', // 'l' or 'landscape'
//         unit: 'mm',               // Measurement unit
//         format: 'a4'              // Page size
//     });

//     // === Main Table Title ===
//     doc.setFontSize(14);
//     doc.setFont(undefined, 'bold');
//     doc.text("Student Fee Receipt Details", 14, 15); // Positioned slightly from top-left
//     doc.setFont(undefined, 'normal'); // Reset font style for subsequent text

//     // === AutoTable Configuration ===
//     const tableSettings = {
//         columns: columns,
//         body: dataArray,          // Use the validated and normalized dataArray
//         startY: 20,               // Start table below the title
//         theme: 'grid',            // Table appearance theme
//         headStyles: {
//             fillColor: [41, 128, 185], // Header background color (a shade of blue)
//             textColor: [255, 255, 255], // Header text color (white)
//             fontStyle: 'bold',        // Make header text bold
//             halign: 'center'           // Center align header text horizontally
//         },
//         bodyStyles: {
//             textColor: [44, 62, 80],   // Body text color (dark grey)
//             valign: 'middle'           // Vertically align cell content in the middle
//         },
//         alternateRowStyles: {
//             fillColor: [236, 240, 241] // Alternate row background color (light grey)
//         },
//         styles: {
//             fontSize: 9,               // Font size for table content
//             cellPadding: 3,            // Padding within cells
//             overflow: 'linebreak'      // Wrap text within cells if it overflows
//         },
//         // --- Cell Hook: Format specific cell data ---
//         didParseCell: function (hookData) {
//             // Format Date cells
//             if (hookData.column.dataKey === 'date' && hookData.cell.raw) {
//                 try {
//                     // Format date to DD/MM/YYYY for Indian locale
//                     const formattedDate = new Date(hookData.cell.raw).toLocaleDateString('en-IN', {
//                         day: '2-digit', month: '2-digit', year: 'numeric'
//                     });
//                     hookData.cell.text = [formattedDate]; // autoTable expects text as an array
//                 } catch (e) {
//                     console.warn(`Date format karne mein error (${hookData.cell.raw}):`, e);
//                     // Fallback to original string if formatting fails
//                     hookData.cell.text = hookData.cell.text || [String(hookData.cell.raw)];
//                 }
//             }

//             // Format numeric columns (like Paid, Dues, Fee) in the main table if desired
//             const numericKeys = ['totalAmountPaid', 'totalDues', 'totalFeeAmount'];
//             if (numericKeys.includes(hookData.column.dataKey) && typeof hookData.cell.raw === 'number') {
//                 hookData.cell.text = [hookData.cell.raw.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })];
//             }
//         },
//         // --- Page Hook: Add footer to each table page ---
//         didDrawPage: function (hookData) {
//             let pageNumber = doc.internal.getNumberOfPages();
//             doc.setFontSize(8);
//             doc.setTextColor(100); // Set footer text color (grey)

//             const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//             const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
//             const footerMargin = 10; // 10mm from bottom edge

//             // Page Number (Left Aligned)
//             doc.text('Page ' + pageNumber, hookData.settings.margin.left, pageHeight - footerMargin);

//             // Generation Date (Right Aligned)
//             const dateText = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//             // Calculate text width to right-align it correctly
//             const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//             doc.text(dateText, pageWidth - hookData.settings.margin.right - dateTextWidth, pageHeight - footerMargin);
//         }
//     };

//     // === Generate the Table ===
//     doc.autoTable(tableSettings);

//     // === Add Summary Page ===
//     doc.addPage(); // Add a new blank page after the table is drawn

//     // Get dimensions and define margins for the summary page
//     const summaryPageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
//     const summaryPageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//     const summaryMarginLeft = 20;
//     const summaryMarginRight = 20;
//     const summaryMarginTop = 20;
//     const footerMargin = 10; // Consistent footer margin from bottom

//     // --- Summary Title ---
//     doc.setFontSize(16);
//     doc.setFont(undefined, 'bold');
//     doc.text("Payment Summary", summaryPageWidth / 2, summaryMarginTop, { align: 'center' });

//     // --- Summary Content ---
//     doc.setFontSize(12);
//     doc.setFont(undefined, 'normal');
//     // Use the pre-formatted total passed from the parent
//     const paidAmt = `Total Amount Paid (All Records): ₹ ${formattedTotalPaid}`; // Added Rupee symbol
//     const duesAmt = `Total Amount Dues (All Records): ₹ ${formattedTotaldues}`; // Added Rupee symbol
//     doc.text(paidAmt, summaryPageWidth / 2, summaryMarginTop + 20, { align: 'center' }); // Center the text
//     doc.text(duesAmt,  summaryMarginTop + 20, { align: 'center' }); // Center the text

//     // === Add Footer to Summary Page (Manually) ===
//     // The didDrawPage hook doesn't apply to manually added pages
//     let finalPageNumber = doc.internal.getNumberOfPages();
//     doc.setFontSize(8);
//     doc.setTextColor(100);

//     // Page Number (Left Aligned)
//     doc.text('Page ' + finalPageNumber, summaryMarginLeft, summaryPageHeight - footerMargin);

//     // Generation Date (Right Aligned)
//     const dateTextFooter = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//     const dateTextWidthFooter = doc.getStringUnitWidth(dateTextFooter) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//     doc.text(dateTextFooter, summaryPageWidth - summaryMarginRight - dateTextWidthFooter, summaryPageHeight - footerMargin);

//     // === Save the PDF ===
//     try {
//         doc.save(filename);
//         console.log(`PDF "${filename}" generated successfully.`);
//     } catch (error) {
//         console.error("PDF save karne mein error:", error);
//         alert("PDF ko save karne mein error aayi. Details ke liye console check karein.");
//     }
// };

// export default generatePdf;


// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// const generatePdf = (data,columns, filename = 'table-data.pdf') => {
//   // Ensure data is an array, even if a single object is passed
//   const dataArray = Array.isArray(data) ? data : [data];

//   if (!dataArray || dataArray.length === 0) {
//     console.error("PDF generate karne ke liye data nahi hai.");
//     alert("PDF generate karne ke liye data nahi hai.");
//     return;
//   }

//   if (!dataArray[0]) {
//     console.error("Data array mein valid objects nahi hain.");
//     alert("Data format sahi nahi hai.");
//     return;
//   }

//   const doc = new jsPDF({
//     orientation: 'landscape', // 'l' ya 'landscape' set karein
//     unit: 'mm',               // Units (pt, mm, cm, in) - mm use karna accha rehta hai
//     format: 'a4'              // Page size (a3, a4, a5, letter, legal) - default a4 hota hai
//   });
//  doc.text("Student Fee Receipt", 14, 15);
//  doc.autoTable({
//     columns: columns,
//     body: data,
//     startY: 20, 
//     theme: 'grid',
//     headStyles: {
//       fillColor: [41, 128, 185],
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       halign: 'center'
//     },
//     bodyStyles: {
//       textColor: [44, 62, 80],
//       valign: 'middle'
//     },
//     alternateRowStyles: {
//       fillColor: [236, 240, 241]
//     },
   
//     styles: {
//       fontSize: 9,
//       cellPadding: 3,
//       overflow: 'linebreak' // Important for content wrapping
//     },
//     didParseCell: function (data) {
//       if (data.column.dataKey === 'date' && data.cell.raw) {
//         try {
//           const formattedDate = new Date(data.cell.raw).toLocaleDateString('en-IN', {
//             day: '2-digit', month: '2-digit', year: 'numeric'
//           });
//           data.cell.text = [formattedDate];
//         } catch (e) {
//           console.warn(`Date format karne mein error (${data.cell.raw}):`, e);
//           data.cell.text = [String(data.cell.raw)];
//         }
//       }
//        if ((data.column.dataKey === 'totalAmountPaid' || data.column.dataKey === 'totalDues') && typeof data.cell.raw === 'number') {
        
//        }
//     },

//      didDrawPage: function (data) {
//        let pageCount = doc.internal.getNumberOfPages();
//        doc.setFontSize(8);
//        doc.setTextColor(100);

//        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
//        doc.text('Page ' + pageCount, data.settings.margin.left, pageHeight - 10); // 10mm from bottom
//        const dateText = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//        const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//        doc.text(dateText, pageWidth - data.settings.margin.right - dateTextWidth, pageHeight - 10); // 10mm from bottom
//     }

//   });

//   // PDF ko save karein
//   doc.save(filename);
// };

// export default generatePdf;

// // src/pdfGenerator.js
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// const generatePdf = (data, filename = 'table-data.pdf') => {
//   // Ensure data is an array, even if a single object is passed
//   const dataArray = Array.isArray(data) ? data : [data];

//   if (!dataArray || dataArray.length === 0) {
//     console.error("PDF generate karne ke liye data nahi hai.");
//     alert("PDF generate karne ke liye data nahi hai.");
//     return;
//   }

//   // Check if the first object exists
//   if (!dataArray[0]) {
//     console.error("Data array mein valid objects nahi hain.");
//     alert("Data format sahi nahi hai.");
//     return;
//   }

//   // --- jsPDF Instance for LANDSCAPE ---
//   // Constructor mein options object pass karein
//   const doc = new jsPDF({
//     orientation: 'landscape', // 'l' ya 'landscape' set karein
//     unit: 'mm',               // Units (pt, mm, cm, in) - mm use karna accha rehta hai
//     format: 'a4'              // Page size (a3, a4, a5, letter, legal) - default a4 hota hai
//   });

//   // --- Column Configuration (Same as before) ---
//   const columns = [
//     { header: 'Rcpt No.', dataKey: 'feeReceiptNumber' },
//     { header: 'Date', dataKey: 'date' },
//     { header: 'Admission No.', dataKey: 'admissionNumber' },
//     { header: 'Student', dataKey: 'studentName' },
//     { header: 'Father Name', dataKey: 'fatherName' },
//     { header: 'Class', dataKey: 'studentClass' },
//     { header: 'Mode', dataKey: 'paymentMode' },
//     { header: 'TID', dataKey: 'transactionId' },
//     { header: 'Month', dataKey: 'month' },
//     { header: 'Dues', dataKey: 'dues' },
//     { header: 'Fee', dataKey: 'totalFeeAmount' },
//     { header: 'Paid Amt.', dataKey: 'totalAmountPaid' },
//     { header: 'Status', dataKey: 'status' },
//     // { header: 'Remark', dataKey: 'remark' },
//   ];

//   // Document mein title add karein (Position adjust kar sakte hain agar zaroori ho)
//   // 14mm left se, 15mm top se theek hona chahiye landscape mein bhi
//   doc.text("Student Fee Receipt", 14, 15);

//   // autoTable function ka istemaal karein
//   doc.autoTable({
//     columns: columns,
//     body: dataArray,
//     startY: 20, // Table start position (20mm from top)

//     // --- Styling Options (Same as before) ---
//     theme: 'grid',
//     headStyles: {
//       fillColor: [41, 128, 185],
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       halign: 'center'
//     },
//     bodyStyles: {
//       textColor: [44, 62, 80],
//       valign: 'middle'
//     },
//     alternateRowStyles: {
//       fillColor: [236, 240, 241]
//     },
//     columnStyles: {
//         feeReceiptNumber: { fontStyle: 'bold', halign: 'left' },
//         date: { fontStyle: 'bold', halign: 'left' },
//         admissionNumber: { fontStyle: 'bold', halign: 'left' },
//       studentName: { halign: 'left', cellWidth: 'auto' }, // Allow auto width for name
//       fatherName: { halign: 'left', cellWidth: 'auto' },
//       studentClass: { halign: 'center' },
//       paymentMode: { halign: 'center' },
//       transactionId: { halign: 'center' },
//       month: { halign: 'center' },
//       dues: { halign: 'center' },
//       totalFeeAmount: { halign: 'center' },
//       totalAmountPaid: { halign: 'center' },
//      // Allow auto width

//     },
//     styles: {
//       fontSize: 9,
//       cellPadding: 3,
//       overflow: 'linebreak' // Important for content wrapping
//     },

//     // --- Hook for Custom Formatting (Same as before) ---
//     didParseCell: function (data) {
//       if (data.column.dataKey === 'date' && data.cell.raw) {
//         try {
//           const formattedDate = new Date(data.cell.raw).toLocaleDateString('en-IN', {
//             day: '2-digit', month: '2-digit', year: 'numeric'
//           });
//           data.cell.text = [formattedDate];
//         } catch (e) {
//           console.warn(`Date format karne mein error (${data.cell.raw}):`, e);
//           data.cell.text = [String(data.cell.raw)];
//         }
//       }
//        // Optional: Number formatting
//        if ((data.column.dataKey === 'totalAmountPaid' || data.column.dataKey === 'totalDues') && typeof data.cell.raw === 'number') {
//             // data.cell.text = [data.cell.raw.toFixed(2)]; // Format to 2 decimal places
//        }
//     },

//      // --- Footer Hook (Adapts to Landscape) ---
//      didDrawPage: function (data) {
//        let pageCount = doc.internal.getNumberOfPages();
//        doc.setFontSize(8);
//        doc.setTextColor(100);

//        // Get page dimensions dynamically
//        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
//        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

//        // Page Number (Left Aligned)
//        doc.text('Page ' + pageCount, data.settings.margin.left, pageHeight - 10); // 10mm from bottom

//        // Generated Date (Right Aligned)
//        const dateText = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
//         // Calculate text width to position it correctly from the right edge
//        const dateTextWidth = doc.getStringUnitWidth(dateText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
//        doc.text(dateText, pageWidth - data.settings.margin.right - dateTextWidth, pageHeight - 10); // 10mm from bottom
//     }

//   });

//   // PDF ko save karein
//   doc.save(filename);
// };

// export default generatePdf;



// // src/pdfGenerator.js
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// const generatePdf = (data, filename = 'table-data.pdf') => {
//   // Ensure data is an array, even if a single object is passed
//   const dataArray = Array.isArray(data) ? data : [data];

//   if (!dataArray || dataArray.length === 0) {
//     console.error("PDF generate karne ke liye data nahi hai.");
//     alert("PDF generate karne ke liye data nahi hai.");
//     return;
//   }

//   // Check if the first object exists (needed for keys if not using predefined columns)
//   if (!dataArray[0]) {
//     console.error("Data array mein valid objects nahi hain.");
//     alert("Data format sahi nahi hai.");
//     return;
//   }

//   const doc = new jsPDF();

//   // --- Column Configuration ---
//   // Yahan define karein ki kaun se columns chahiye aur unke headers kya honge
//   // 'header' -> PDF table mein dikhne wala naam
//   // 'dataKey' -> Aapke JSON data object mein field ka naam (key)
//   const columns = [
//     { header: 'Admission No.', dataKey: 'admissionNumber' },
//     { header: 'Student Name', dataKey: 'studentName' },
//     { header: 'Class', dataKey: 'studentClass' },
//     { header: 'Father Name', dataKey: 'fatherName' },
//     { header: 'Receipt No.', dataKey: 'feeReceiptNumber' },
//     { header: 'Payment Mode', dataKey: 'paymentMode' },
//     { header: 'Amount Paid', dataKey: 'totalAmountPaid' },
//     { header: 'Dues', dataKey: 'totalDues' },
//     { header: 'Payment Date', dataKey: 'date' },
//     // { header: 'Remark', dataKey: 'remark' }, // Agar remark chahiye toh uncomment karein
//     // Aap aur columns add ya remove kar sakte hain is list se
//   ];

//   // Document mein title add karein
//   doc.text("Student Fee Receipt", 14, 15); // Title change kar diya

//   // autoTable function ka istemaal karein
//   doc.autoTable({
//     // Column definition pass karein
//     columns: columns,
//     // Poora data array pass karein, autoTable dataKey se values nikal lega
//     body: dataArray,
//     startY: 20, // Table kahan se start hoga

//     // --- Styling Options ---
//     theme: 'grid',
//     headStyles: {
//       fillColor: [41, 128, 185], // Header color badal diya (Blue)
//       textColor: [255, 255, 255],
//       fontStyle: 'bold',
//       halign: 'center'
//     },
//     bodyStyles: {
//       textColor: [44, 62, 80], // Darker text
//       valign: 'middle'
//     },
//     alternateRowStyles: {
//       fillColor: [236, 240, 241] // Lighter alternate row color
//     },
//     // Column styles ab dataKey se define karein (zyada reliable)
//     columnStyles: {
//       admissionNumber: { fontStyle: 'bold', halign: 'left' },
//       studentName: { halign: 'left' },
//       studentClass: { halign: 'center' },
//       fatherName: { halign: 'left' },
//       feeReceiptNumber: { halign: 'center' },
//       paymentMode: { halign: 'center' },
//       totalAmountPaid: { halign: 'right' }, // Amounts ko right align karna accha rehta hai
//       totalDues: { halign: 'right' },
//       date: { halign: 'center' } // Date column ko center align
//     },
//     styles: {
//       fontSize: 9, // Thoda chhota font size
//       cellPadding: 3,
//       overflow: 'linebreak' // Agar content zyada hai toh line break karega
//     },

//     // --- Hook for Custom Formatting (e.g., Date) ---
//     didParseCell: function (data) {
//       // Date column ko format karein
//       if (data.column.dataKey === 'date' && data.cell.raw) {
//         try {
//           // Date object banakar usse readable format mein convert karein
//           // Adjust format as needed (e.g., 'en-GB' for DD/MM/YYYY)
//           const formattedDate = new Date(data.cell.raw).toLocaleDateString('en-IN', {
//              day: '2-digit',
//              month: '2-digit',
//              year: 'numeric'
//           });
//           data.cell.text = [formattedDate]; // Text ko array mein wrap karna zaroori hai
//         } catch (e) {
//           console.warn(`Date format karne mein error (${data.cell.raw}):`, e);
//           // Agar error aaye toh original value string mein dikha do
//            data.cell.text = [String(data.cell.raw)];
//         }
//       }

//       // Optional: Numbers ko format karna (e.g., currency)
//       if ((data.column.dataKey === 'totalAmountPaid' || data.column.dataKey === 'totalDues') && typeof data.cell.raw === 'number') {
//            // Example: Add currency symbol (₹)
//            // data.cell.text = ['₹ ' + data.cell.raw.toFixed(2)];
//            // Ya sirf decimal places fix karna hai
//            // data.cell.text = [data.cell.raw.toFixed(2)];
//            // Abhi ke liye default number hi rakhte hain
//       }
//     },

//      // Optional: Footer add karna har page par
//      didDrawPage: function (data) {
//        let pageCount = doc.internal.getNumberOfPages();
//        doc.setFontSize(8);
//        doc.setTextColor(100); // Gray color for footer
//        doc.text('Page ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
//        doc.text('Generated on: ' + new Date().toLocaleDateString('en-IN'), doc.internal.pageSize.width - data.settings.margin.right - 40, doc.internal.pageSize.height - 10); // Right aligned date
//     }

//   });

//   // PDF ko save karein
//   doc.save(filename);
// };

// export default generatePdf;



// // src/pdfGenerator.js
// import jsPDF from 'jspdf';
// import 'jspdf-autotable'; // Yeh import zaroori hai autoTable ko jsPDF instance par attach karne ke liye

// const generatePdf = (data, filename = 'table-data.pdf') => {
//   if (!data || data.length === 0) {
//     console.error("PDF generate karne ke liye data nahi hai.");
//     alert("PDF generate karne ke liye data nahi hai.");
//     return;
//   }

//   // Data check ke baad hi jsPDF instance banayein
//   if (!data[0]) {
//      console.error("Pehla data object maujood nahi hai, columns nahi mil sakte.");
//      alert("Data format sahi nahi hai.");
//      return;
//   }

//   const doc = new jsPDF();

//   // Table ke liye columns (headers) define karein
//   const tableColumn = Object.keys(data[0]);

//   // Table ke liye rows define karein
//   const tableRows = data.map(item => {
//     // Ensure all values are strings or numbers, handle null/undefined
//     return tableColumn.map(col => {
//        const value = item[col];
//        return value === null || value === undefined ? '' : String(value);
//     });
//   });

//   // Document mein title add karein
//   doc.text("Dynamic Table Report", 14, 15);

//   // autoTable function ka istemaal karein table banane ke liye styling ke saath
//   doc.autoTable({
//     head: [tableColumn], // Header row
//     body: tableRows,     // Data rows
//     startY: 20,          // Table kahan se start hoga (Y-coordinate)

//     // --- Styling Options Shuru ---

//     // 1. Theme istemaal karein (optional)
//     theme: 'grid', // 'striped', 'grid', 'plain' mein se choose karein

//     // 2. Header ke liye Styles
//     headStyles: {
//       fillColor: [22, 160, 133], // Header ka background color (RGB format)
//       textColor: [255, 255, 255], // Header ka text color (Safed)
//       fontStyle: 'bold',       // Header ka font style (Bold)
//       halign: 'center'          // Header text ka horizontal alignment (Center)
//     },

//     // 3. Body ke liye common Styles (optional)
//     bodyStyles: {
//       // fillColor: [245, 245, 245], // Agar sabhi body rows ka background same rakhna hai
//       textColor: [50, 50, 50],    // Body text ka color (Dark Gray)
//       valign: 'middle'          // Vertical alignment
//     },

//     // 4. Alternate Rows ke liye Styles (Zebra striping)
//     alternateRowStyles: {
//       fillColor: [240, 240, 240] // Halki gray alternate rows ke liye
//     },

//     // 5. Specific Column ke liye Styles (optional)
//     columnStyles: {
//       // Pehle column ('0' index) ke liye specific style
//       0: {
//          fontStyle: 'bold',    // Pehle column ko bold karein
//          // cellWidth: 40,    // Agar specific width deni hai
//          halign: 'left'       // Left align karein
//       },
   
//       1: { halign: 'center' }, // Doosre column ko center align karein
//       [tableColumn.length - 1]: { // Last column ko right align karein
//           halign: 'right'
//       }
//     },

//     // 6. General Styles (sabhi cells ke liye default) (optional)
//     styles: {
//       fontSize: 10,
//       cellPadding: 4, // Cells ke andar padding
      
//     },

//   });

//   // PDF ko save karein
//   doc.save(filename);
// };

// export default generatePdf;


// // src/pdfGenerator.js
// import jsPDF from 'jspdf';
// import 'jspdf-autotable'; // Yeh import zaroori hai autoTable ko jsPDF instance par attach karne ke liye

// const generatePdf = (data, filename = 'table-data.pdf') => {
//   if (!data || data.length === 0) {
//     console.error("PDF generate karne ke liye data nahi hai.");
//     alert("PDF generate karne ke liye data nahi hai.");
//     return;
//   }

//   const doc = new jsPDF();

//   // Table ke liye columns (headers) define karein
//   const tableColumn = Object.keys(data[0]);

//   // Table ke liye rows define karein
//   // `data` (array of objects) ko array of arrays mein convert karein
//   const tableRows = data.map(item => {
//     return tableColumn.map(col => item[col]);
//   });

//   // Document mein title add karein (Optional)
//   doc.text("Dynamic Table Report", 14, 15);

//   // autoTable function ka istemaal karein table banane ke liye
//   doc.autoTable({
//     head: [tableColumn], // Header row
//     body: tableRows,     // Data rows
//     startY: 20,          // Table kahan se start hoga (Y-coordinate)
//   });

//   // PDF ko save karein
//   doc.save(filename);
// };

// export default generatePdf;