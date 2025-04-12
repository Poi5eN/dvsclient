import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Pdf2 = (
    data,
    columns,
   
    overallTotalDuesSum = 0,
    filename = 'fee-data.pdf' // Keep filename for context, though not directly used by output method
) => {
    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : [data];
    if (!dataArray || dataArray.length === 0) {
        console.error("PDF generate karne ke liye data nahi hai.");
        alert("PDF generate karne ke liye data nahi hai.");
        return;
    }
    if (!dataArray[0] || typeof dataArray[0] !== 'object') {
        console.error("Data array mein valid objects nahi hain ya format galat hai.");
        return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // === Main Table Title ===
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Student Dues Fee Receipt Details", 14, 15);
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
    doc.text(`Total Dues Amount:`, xPosLabel, currentY);
    doc.text(` ${overallTotalDuesSum}`, xPosValue, currentY, { align: 'right' });
    doc.setFont(undefined, 'normal');
    currentY += lineSpacing * 1.5;

    let finalPageNumber = doc.internal.getNumberOfPages();
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text('Page ' + finalPageNumber, summaryMarginLeft, summaryPageHeight - footerMargin);
    const dateTextFooter = 'Generated on: ' + new Date().toLocaleDateString('en-IN');
    const dateTextWidthFooter = doc.getStringUnitWidth(dateTextFooter) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(dateTextFooter, summaryPageWidth - summaryMarginRight - dateTextWidthFooter, summaryPageHeight - footerMargin);

    try {
        doc.output('dataurlnewwindow'); // Instead of doc.save()
        console.log(`PDF opened for preview/print.`);
    } catch (error) {
        console.error("PDF generation or preview failed:", error);
       
    }
};

export default Pdf2;
