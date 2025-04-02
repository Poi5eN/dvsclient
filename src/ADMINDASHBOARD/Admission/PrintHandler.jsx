import React, { useCallback } from "react";

const PrintHandler = () => {
  const handlePrint = useCallback((printContent) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
          <head>
           
            <style>
              body {
                font-family: Arial, sans-serif;
              }
              .a4 {
                width: 210mm;
                height: 297mm;
                margin: 0 auto;
                background-color: white;
              }
              .content {
                border: 1px solid #ccc;
                margin: 10px;
              }
              .p-12 {
                padding: 48px;
              }
              .relative {
                position: relative;
              }
              .absolute {
                position: absolute;
              }
              .left-5 {
                left: 1.25rem;
              }
              .mx-auto {
                margin-left: auto;
                margin-right: auto;
              }
              .rounded-full {
                border-radius: 9999px;
              }
              .flex {
                display: flex;
              }
              .justify-center {
                justify-content: center;
              }
              .items-center {
                align-items: center;
              }
              .w-full {
                width: 100%;
              }
              .h-full {
                height: 100%;
              }
              .object-contain {
                object-fit: contain;
              }
              .text-center {
                text-align: center;
              }
              .text-lg {
                font-size: 1.125rem;
                line-height: 1.75rem;
              }
              .font-bold {
                font-weight: 700;
              }
              .text-gray-800 {
                color: #1f2937;
              }
              .dark\\:text-white {
                color: white;
              }
              .text-red-700 {
                color: #b91c1c;
              }
              .underline {
                text-decoration: underline;
              }
              .text-\\[12px\\] {
                font-size: 0.75rem;
              }
              .justify-between {
                justify-content: space-between;
              }
              .flex-col {
                flex-direction: column;
              }
              .w-52 {
                width: 13rem;
              }
              .p-2 {
                padding: 0.5rem;
              }
              .mb-4 {
                margin-bottom: 1rem;
              }
              .bg-green-800 {
                background-color: #166534;
              }
              .text-white {
                color: white;
              }
              .w-36 {
                width: 9rem;
              }
              .h-36 {
                height: 9rem;
              }
              .text-\\[16px\\] {
                font-size: 1rem;
                line-height: 1.5rem;
              }
              .mb-3 {
                margin-bottom: 0.75rem;
              }
              .font-semibold {
                font-weight: 600;
              }
            //   .text-gray-900 {
            //     color: #111827;
            //   }
            //   .dark\\:text-white {
            //     color: white;
            //   }
              .whitespace-nowrap {
                white-space: nowrap;
              }
              .border-b-2 {
                border-bottom-width: 2px;
              }
              .border-dashed {
                border-style: dashed;
              }
              .w-full {
                width: 100%;
              }
            //   .text-blue-800 {
            //     color: #1e3a8a;
            //   }
              /* Add any other Tailwind-specific or custom styles needed for printing */
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, []);

  return { handlePrint };
};

export default PrintHandler;
