import React, { useRef } from 'react';
import { Box, Button } from '@mui/material';
import ReactToPrint from 'react-to-print';

// Your constants...
const CARD_WIDTH_MM = 54;
const CARD_HEIGHT_MM = 86;
const A4_WIDTH_MM = 297;
const A4_HEIGHT_MM = 210;
const PAGE_MARGIN_MM = 5;
const PREVIEW_SCALE_FACTOR = 0.75;
const mmToPx = (mm) => mm * 3.7795275591;

const A4SheetPreview = ({
    studentsOnPage,
    printMode,
    renderFrontTemplate,
    renderBackTemplate,
    rowGapMm,
    columnGapMm,
}) => {
    const componentRef = useRef();

    const scaledPageMargin = mmToPx(PAGE_MARGIN_MM) * PREVIEW_SCALE_FACTOR;
    const scaledCardWidth = mmToPx(CARD_WIDTH_MM) * PREVIEW_SCALE_FACTOR;
    const scaledCardHeight = mmToPx(CARD_HEIGHT_MM) * PREVIEW_SCALE_FACTOR;
    const scaledRowGap = mmToPx(rowGapMm) * PREVIEW_SCALE_FACTOR;
    const scaledColumnGap = mmToPx(columnGapMm) * PREVIEW_SCALE_FACTOR;

    const scaledPairHeight = printMode === 'both'
        ? (mmToPx(CARD_HEIGHT_MM * 2 + 1) * PREVIEW_SCALE_FACTOR)
        : scaledCardHeight;

    return (
        <Box sx={{ textAlign: 'center' }}>
            <ReactToPrint
                trigger={() => (
                    <Button variant="contained" sx={{ mb: 2 }}>
                        Print All Pages
                    </Button>
                )}
                content={() => componentRef.current}
                documentTitle="ID Cards Print"
                // pageStyle={`
                //     @page {
                //         size: A4 landscape;
                //         // margin: ${PAGE_MARGIN_MM}mm;
                //     }
                //     body {
                //         -webkit-print-color-adjust: exact !important;
                //         print-color-adjust: exact !important;
                //         margin: 0;
                //     }
                // `}
                pageStyle={`
    @page {
        size: 297mm 210mm;
        margin: ${PAGE_MARGIN_MM}mm;
    }
    body {
        margin: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        overflow: hidden !important;
    }
    .a4-sheet-preview {
        width: 297mm !important;
        height: 210mm !important;
        overflow: hidden !important;
        page-break-after: avoid !important;
    }
`}

            />

            <Box
                ref={componentRef}
                className="a4-sheet-preview"
                sx={{
                    width: mmToPx(A4_WIDTH_MM) * PREVIEW_SCALE_FACTOR + 'px',
                    minHeight: mmToPx(A4_HEIGHT_MM) * PREVIEW_SCALE_FACTOR + 'px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    // margin: '0 auto',
                    // padding: scaledPageMargin + 'px',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                }}
            >
                <Box
                    className="printable-area-preview"
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        flexDirection: printMode === 'back' ? 'row-reverse' : 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        width: '100%',
                        gap: `${scaledRowGap}px ${scaledColumnGap}px`,
                        overflow: 'hidden',
                    }}
                >
                    {studentsOnPage.map((student, index) => {
                        const studentKey = student._id || `student-${index}`;
                        let itemContent;
                        let cardWrapperStyle = {};

                        if (printMode === 'front') {
                            itemContent = renderFrontTemplate(student);
                            cardWrapperStyle = {
                                width: `${mmToPx(CARD_WIDTH_MM)}px`,
                                height: `${mmToPx(CARD_HEIGHT_MM)}px`,
                            };
                        } else if (printMode === 'back') {
                            itemContent = renderBackTemplate(student);
                            cardWrapperStyle = {
                                width: `${mmToPx(CARD_WIDTH_MM)}px`,
                                height: `${mmToPx(CARD_HEIGHT_MM)}px`,
                            };
                        } else {
                            itemContent = `
                                <div style="margin-bottom: ${mmToPx(1)}px; width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px;">
                                    ${renderFrontTemplate(student)}
                                </div>
                                <div style="width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px;">
                                    ${renderBackTemplate(student)}
                                </div>
                            `;
                            cardWrapperStyle = {
                                width: `${mmToPx(CARD_WIDTH_MM)}px`,
                                height: `${mmToPx(CARD_HEIGHT_MM * 2 + 1)}px`,
                                display: 'flex',
                                flexDirection: 'column',
                            };
                        }

                        return (
                            <Box
                                key={studentKey}
                                sx={{
                                    width: scaledCardWidth + 'px',
                                    height: scaledPairHeight + 'px',
                                    boxSizing: 'border-box',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        ...cardWrapperStyle,
                                        transform: `scale(${PREVIEW_SCALE_FACTOR})`,
                                        transformOrigin: 'top left',
                                        boxSizing: 'border-box',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: itemContent }}
                                />
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};

export default A4SheetPreview;




// import React, { useRef } from 'react';
// import { Box, Button } from '@mui/material';
// import ReactToPrint from 'react-to-print';

// // Your constants...
// const CARD_WIDTH_MM = 54;
// const CARD_HEIGHT_MM = 86;
// const A4_WIDTH_MM = 297;
// const A4_HEIGHT_MM = 210;
// const PAGE_MARGIN_MM = 5;
// const PREVIEW_SCALE_FACTOR = 0.75;
// const mmToPx = (mm) => mm * 3.7795275591;

// const A4SheetPreview = ({
//     studentsOnPage,
//     printMode,
//     renderFrontTemplate,
//     renderBackTemplate,
//     rowGapMm,
//     columnGapMm,
// }) => {
//     const componentRef = useRef();

//     const scaledPageMargin = mmToPx(PAGE_MARGIN_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledCardWidth = mmToPx(CARD_WIDTH_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledCardHeight = mmToPx(CARD_HEIGHT_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledRowGap = mmToPx(rowGapMm) * PREVIEW_SCALE_FACTOR;
//     const scaledColumnGap = mmToPx(columnGapMm) * PREVIEW_SCALE_FACTOR;

//     const scaledPairHeight = printMode === 'both'
//         ? (mmToPx(CARD_HEIGHT_MM * 2 + 1) * PREVIEW_SCALE_FACTOR)
//         : scaledCardHeight;

//     return (
//         <Box sx={{ textAlign: 'center' }}>
//             <ReactToPrint
//                 trigger={() => (
//                     <Button variant="contained" sx={{ mb: 2 }}>
//                         Print All Pages
//                     </Button>
//                 )}
//                 content={() => componentRef.current}
//                 documentTitle="ID Cards Print"
//                 pageStyle={`
//                     @page {
//                         size: A4 landscape;
//                         margin: ${PAGE_MARGIN_MM}mm;
//                     }
//                     body {
//                         -webkit-print-color-adjust: exact !important;
//                         print-color-adjust: exact !important;
//                         margin: 0;
//                     }
//                 `}
//             />

//             <Box
//                 ref={componentRef}
//                 className="a4-sheet-preview"
//                 sx={{
//                     width: mmToPx(A4_WIDTH_MM) * PREVIEW_SCALE_FACTOR + 'px',
//                     minHeight: mmToPx(A4_HEIGHT_MM) * PREVIEW_SCALE_FACTOR + 'px',
//                     backgroundColor: 'white',
//                     border: '1px solid #ccc',
//                     boxShadow: '0 0 10px rgba(0,0,0,0.1)',
//                     margin: '0 auto',
//                     padding: scaledPageMargin + 'px',
//                     boxSizing: 'border-box',
//                     overflow: 'hidden',
//                 }}
//             >
//                 <Box
//                     className="printable-area-preview"
//                     sx={{
//                         display: 'flex',
//                         flexWrap: 'wrap',
//                         flexDirection: printMode === 'back' ? 'row-reverse' : 'row',
//                         justifyContent: 'flex-start',
//                         alignItems: 'flex-start',
//                         width: '100%',
//                         gap: `${scaledRowGap}px ${scaledColumnGap}px`,
//                         overflow: 'hidden',
//                     }}
//                 >
//                     {studentsOnPage.map((student, index) => {
//                         const studentKey = student._id || `student-${index}`;
//                         let itemContent;
//                         let cardWrapperStyle = {};

//                         if (printMode === 'front') {
//                             itemContent = renderFrontTemplate(student);
//                             cardWrapperStyle = {
//                                 width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                                 height: `${mmToPx(CARD_HEIGHT_MM)}px`,
//                             };
//                         } else if (printMode === 'back') {
//                             itemContent = renderBackTemplate(student);
//                             cardWrapperStyle = {
//                                 width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                                 height: `${mmToPx(CARD_HEIGHT_MM)}px`,
//                             };
//                         } else {
//                             itemContent = `
//                                 <div style="margin-bottom: ${mmToPx(1)}px; width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px;">
//                                     ${renderFrontTemplate(student)}
//                                 </div>
//                                 <div style="width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px;">
//                                     ${renderBackTemplate(student)}
//                                 </div>
//                             `;
//                             cardWrapperStyle = {
//                                 width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                                 height: `${mmToPx(CARD_HEIGHT_MM * 2 + 1)}px`,
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                             };
//                         }

//                         return (
//                             <Box
//                                 key={studentKey}
//                                 sx={{
//                                     width: scaledCardWidth + 'px',
//                                     height: scaledPairHeight + 'px',
//                                     boxSizing: 'border-box',
//                                     overflow: 'hidden',
//                                 }}
//                             >
//                                 <div
//                                     style={{
//                                         ...cardWrapperStyle,
//                                         transform: `scale(${PREVIEW_SCALE_FACTOR})`,
//                                         transformOrigin: 'top left',
//                                         boxSizing: 'border-box',
//                                     }}
//                                     dangerouslySetInnerHTML={{ __html: itemContent }}
//                                 />
//                             </Box>
//                         );
//                     })}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default A4SheetPreview;




// import React, { useRef } from 'react';
// import { Box, Button } from '@mui/material';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// // --- Constants ---
// const CARD_WIDTH_MM = 54;
// const CARD_HEIGHT_MM = 86;
// const A4_WIDTH_MM = 297;
// const A4_HEIGHT_MM = 210;
// const PAGE_MARGIN_MM = 5;
// const PREVIEW_SCALE_FACTOR = 0.75;
// const mmToPx = (mm) => mm * 3.7795275591;

// const A4SheetPreview = ({
//     studentsOnPage,
//     printMode,
//     renderFrontTemplate,
//     renderBackTemplate,
//     rowGapMm,
//     columnGapMm,
// }) => {
//     const previewRef = useRef(null);

//     const scaledPageMargin = mmToPx(PAGE_MARGIN_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledCardWidth = mmToPx(CARD_WIDTH_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledCardHeight = mmToPx(CARD_HEIGHT_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledRowGap = mmToPx(rowGapMm) * PREVIEW_SCALE_FACTOR;
//     const scaledColumnGap = mmToPx(columnGapMm) * PREVIEW_SCALE_FACTOR;

//     const scaledPairHeight = printMode === 'both'
//         ? (mmToPx(CARD_HEIGHT_MM * 2 + 1) * PREVIEW_SCALE_FACTOR)
//         : scaledCardHeight;

//     const handleDownloadPdf = async () => {
//         const input = previewRef.current;

//         const canvas = await html2canvas(input, {
//             scale: 2, // Higher scale for better resolution
//             useCORS: true,
//         });

//         const imgData = canvas.toDataURL('image/png');
//         const pdf = new jsPDF('landscape', 'mm', 'a4');
//         const imgProps = pdf.getImageProperties(imgData);

//         const pdfWidth = A4_WIDTH_MM;
//         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//         pdf.save('id-cards-preview.pdf');
//     };

//     return (
//         <Box sx={{ textAlign: 'center' }}>
//             <Button variant="contained" onClick={handleDownloadPdf} sx={{ mb: 2 }}>
//                 Download PDF
//             </Button>

//             <Box
//                 ref={previewRef}
//                 className="a4-sheet-preview"
//                 sx={{
//                     width: mmToPx(A4_WIDTH_MM) * PREVIEW_SCALE_FACTOR + 'px',
//                     height: mmToPx(A4_HEIGHT_MM) * PREVIEW_SCALE_FACTOR + 'px',
//                     backgroundColor: 'white',
//                     border: '1px solid #ccc',
//                     boxShadow: '0 0 10px rgba(0,0,0,0.1)',
//                     margin: '0 auto',
//                     padding: scaledPageMargin + 'px',
//                     boxSizing: 'border-box',
//                     overflow: 'hidden',
//                 }}
//             >
//                 <Box
//                     className="printable-area-preview"
//                     sx={{
//                         display: 'flex',
//                         flexWrap: 'wrap',
//                         flexDirection: printMode === 'back' ? 'row-reverse' : 'row',
//                         justifyContent: 'flex-start',
//                         alignItems: 'flex-start',
//                         width: '100%',
//                         height: '100%',
//                         gap: `${scaledRowGap}px ${scaledColumnGap}px`,
//                         overflow: 'hidden',
//                     }}
//                 >
//                     {studentsOnPage.map((student, index) => {
//                         const studentKey = student._id || `student-${index}`;
//                         let itemContent;
//                         let cardWrapperStyle = {};

//                         if (printMode === 'front') {
//                             itemContent = renderFrontTemplate(student);
//                             cardWrapperStyle = {
//                                 width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                                 height: `${mmToPx(CARD_HEIGHT_MM)}px`,
//                             };
//                         } else if (printMode === 'back') {
//                             itemContent = renderBackTemplate(student);
//                             cardWrapperStyle = {
//                                 width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                                 height: `${mmToPx(CARD_HEIGHT_MM)}px`,
//                             };
//                         } else {
//                             itemContent = `
//                                 <div style="margin-bottom: ${mmToPx(1)}px; width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px;">
//                                     ${renderFrontTemplate(student)}
//                                 </div>
//                                 <div style="width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px;">
//                                     ${renderBackTemplate(student)}
//                                 </div>
//                             `;
//                             cardWrapperStyle = {
//                                 width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                                 height: `${mmToPx(CARD_HEIGHT_MM * 2 + 1)}px`,
//                                 display: 'flex',
//                                 flexDirection: 'column',
//                             };
//                         }

//                         return (
//                             <Box
//                                 key={studentKey}
//                                 sx={{
//                                     width: scaledCardWidth + 'px',
//                                     height: scaledPairHeight + 'px',
//                                     boxSizing: 'border-box',
//                                     overflow: 'hidden',
//                                 }}
//                             >
//                                 <div
//                                     style={{
//                                         ...cardWrapperStyle,
//                                         transform: `scale(${PREVIEW_SCALE_FACTOR})`,
//                                         transformOrigin: 'top left',
//                                         boxSizing: 'border-box',
//                                     }}
//                                     dangerouslySetInnerHTML={{ __html: itemContent }}
//                                 />
//                             </Box>
//                         );
//                     })}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default A4SheetPreview;



// // src/components/PrintPreview/A4SheetPreview.js
// import React from 'react';
// import { Box } from '@mui/material';

// // --- Constants ---
// const CARD_WIDTH_MM = 54;
// const CARD_HEIGHT_MM = 86;

// // A4 Dimensions in mm (Landscape)
// const A4_WIDTH_MM = 297;
// const A4_HEIGHT_MM = 210;
// const PAGE_MARGIN_MM = 5; // Same as your @page margin

// // We need a scale factor to make A4 fit on screen.
// // You can adjust this scale factor to make the preview larger or smaller.
// const PREVIEW_SCALE_FACTOR = 0.75; // Example: 75% of actual size for preview

// const mmToPx = (mm) => mm * 3.7795275591; // Standard 96 DPI conversion (1mm ~ 3.78px)

// const A4SheetPreview = ({
//     studentsOnPage,
//     printMode,
//     renderFrontTemplate,
//     renderBackTemplate,
//     // itemsPerRow, // This can be calculated or implicitly handled by flex-wrap
//     rowGapMm,
//     columnGapMm,
// }) => {
//     const scaledPageMargin = mmToPx(PAGE_MARGIN_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledCardWidth = mmToPx(CARD_WIDTH_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledCardHeight = mmToPx(CARD_HEIGHT_MM) * PREVIEW_SCALE_FACTOR;
//     const scaledRowGap = mmToPx(rowGapMm) * PREVIEW_SCALE_FACTOR;
//     const scaledColumnGap = mmToPx(columnGapMm) * PREVIEW_SCALE_FACTOR;

//     // Calculate the height of a pair for 'both' mode
//     const scaledPairHeight = printMode === 'both'
//         ? (mmToPx(CARD_HEIGHT_MM * 2 + 1) * PREVIEW_SCALE_FACTOR) // 1mm gap between front/back
//         : scaledCardHeight;

//     return (
//         <Box
//             className="a4-sheet-preview"
//             sx={{
//                 width: mmToPx(A4_WIDTH_MM) * PREVIEW_SCALE_FACTOR + 'px',
//                 height: mmToPx(A4_HEIGHT_MM) * PREVIEW_SCALE_FACTOR + 'px',
//                 backgroundColor: 'white',
//                 border: '1px solid #ccc',
//                 boxShadow: '0 0 10px rgba(0,0,0,0.1)',
//                 margin: '20px auto', // Center the sheet
//                 padding: scaledPageMargin + 'px',
//                 boxSizing: 'border-box',
//                 overflow: 'hidden',
//             }}
//         >
//             <Box
//                 className="printable-area-preview"
//                 sx={{
//                     display: 'flex',
//                     flexWrap: 'wrap',
//                     flexDirection: printMode === 'back' ? 'row-reverse' : 'row',
//                     justifyContent: 'flex-start',
//                     alignItems: 'flex-start',
//                     width: '100%',
//                     height: '100%',
//                     gap: `${scaledRowGap}px ${scaledColumnGap}px`,
//                     overflow: 'hidden',
//                 }}
//             >
//                 {studentsOnPage.map((student, index) => {
//                     const studentKey = student._id || `student-${index}`;
//                     let itemContent;
//                     let cardWrapperStyle = {}; // To hold scaled dimensions

//                     if (printMode === 'front') {
//                         itemContent = renderFrontTemplate(student);
//                         cardWrapperStyle = {
//                             width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                             height: `${mmToPx(CARD_HEIGHT_MM)}px`,
//                         };
//                     } else if (printMode === 'back') {
//                         itemContent = renderBackTemplate(student);
//                         cardWrapperStyle = {
//                             width: `${mmToPx(CARD_WIDTH_MM)}px`,
//                             height: `${mmToPx(CARD_HEIGHT_MM)}px`,
//                         };
//                     } else { // 'both'
//                         itemContent = `
//                             <div style="margin-bottom: ${mmToPx(1)}px; width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px; overflow: hidden; box-sizing: border-box;">
//                                 ${renderFrontTemplate(student)}
//                             </div>
//                             <div style="width: ${mmToPx(CARD_WIDTH_MM)}px; height: ${mmToPx(CARD_HEIGHT_MM)}px; overflow: hidden; box-sizing: border-box;">
//                                 ${renderBackTemplate(student)}
//                             </div>
//                         `;
//                         cardWrapperStyle = {
//                             width: `${mmToPx(CARD_WIDTH_MM)}px`, // Width remains card width
//                             height: `${mmToPx(CARD_HEIGHT_MM * 2 + 1)}px`, // Height is for the pair
//                             display: 'flex',
//                             flexDirection: 'column',
//                         };
//                     }

//                     return (
//                         <Box
//                             key={studentKey}
//                             className="preview-id-card-item-outer" // Outer container for scaled item
//                             sx={{
//                                 width: printMode === 'both' ? scaledCardWidth + 'px' : scaledCardWidth + 'px',
//                                 height: scaledPairHeight + 'px',
//                                 boxSizing: 'border-box',
//                                 overflow: 'hidden', // Clip content that overflows scaled container
//                                 // border: '1px dotted blue', // For debugging layout of scaled item
//                             }}
//                         >
//                             <div // This div will be scaled
//                                 style={{
//                                     ...cardWrapperStyle, // Apply original dimensions here
//                                     transform: `scale(${PREVIEW_SCALE_FACTOR})`,
//                                     transformOrigin: 'top left',
//                                     boxSizing: 'border-box',
//                                     // border: '1px solid red', // For debugging unscaled content
//                                 }}
//                                 dangerouslySetInnerHTML={{ __html: itemContent }}
//                             />
//                         </Box>
//                     );
//                 })}
//             </Box>
//         </Box>
//     );
// };

// export default A4SheetPreview;