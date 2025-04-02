import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";

function Tables({
  thead,
  tbody,
  getRowClass,
  style,
  tableHeight,
  scrollView,
  getRowClick,
  WWW,
  handleClassOnRow,
}) {
  const isMobile = window.innerWidth <= 768;
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const { currentColor } = useStateContext();

  const handleRowClick = (ele, index) => {
    if (getRowClick) getRowClick(ele, index);
    setActiveRowIndex(index);
  };

  return (
    tbody?.length > 0 && (
      <div
        id="no-more-tables"
        style={style}
        className={`overflow-auto ${tableHeight} ${scrollView} custom-scrollbar`}
      >
        <div className="relative max-h-[80vh] overflow-auto">
          <table className="table-auto border-collapse w-full dark:text-white dark:bg-secondary-dark-bg">
            {/* Table Head */}
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-gray-200 md:text-[15px] border text-white" style={{ backgroundColor: currentColor }}>
                {thead?.map((headData, index) => (
                  <th
                    key={index}
                    style={{
                      width: headData?.width ? `${headData.width}%` : "auto",
                      textAlign: headData?.textAlign || "left",
                    }}
                    className={`px-2 md:py-1 font-semibold text-left ${headData?.className || ""}`}
                  >
                    {headData?.label || headData}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white md:text-[10px] lg:text-lg dark:bg-secondary-dark-bg">
              {tbody?.map((ele, index) => {
                const keys = Object.keys(ele).filter((key) => key !== "colorcode");
                const rowColor = ele.colorcode || "";

                return (
                  <tr
                    key={index}
                    className={`border ${getRowClass ? getRowClass(ele, index) : ""} ${index === activeRowIndex ? "bg-blue-200" : ""}`}
                    onClick={() => handleRowClick(ele, index)}
                    style={{ backgroundColor: rowColor }}
                  >
                    {keys?.map((bodyData, inx) => (
                      <td
                        key={inx}
                        data-title={thead[inx]?.label || thead[inx]}
                        style={{ width: WWW }}
                        className={`px-2 py-1 ${handleClassOnRow ? handleClassOnRow(ele, thead[inx]?.label || thead[inx]) : ""}`}
                      >
                        {/* {typeof ele[bodyData] === "object" && ele[bodyData] !== null ? (
                          // If value is an object, check if it has 'label', else render it
                          ele[bodyData]?.label || JSON.stringify(ele[bodyData])
                        ) : ele[bodyData] ? (
                          ele[bodyData]
                        ) : (
                          <> </>
                        )} */}
                        {typeof ele[bodyData] === "object" && ele[bodyData] !== null ? (
  ele[bodyData]?.label || "[Object]"
) : ele[bodyData] ? (
  ele[bodyData]
) : (
  <> </>
)}

                        {isMobile && <> </>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  );
}

export default Tables;



// import React, { useState } from "react";
// import { useStateContext } from "../contexts/ContextProvider";

// function Tables({
//   thead,
//   tbody,
//   getRowClass,
//   style,
//   tableHeight,
//   scrollView,
//   getRowClick,
//   WWW,
//   handleClassOnRow,
// }) {
//   const isMobile = window.innerWidth <= 768;
//   const [activeRowIndex, setActiveRowIndex] = useState(null);
//   const { currentColor } = useStateContext();
  
//   const handleRowClick = (ele, index) => {
//     getRowClick && getRowClick(ele, index);
//     setActiveRowIndex(index);
//   };

//   return (
//     tbody?.length > 0 && (
//       <div
//         id="no-more-tables"
//         style={style}
//         className={`overflow-auto ${tableHeight} ${scrollView} custom-scrollbar `}
//       >
//         <div className="relative max-h-[80vh] overflow-auto">
//           <table className="table-auto border-collapse w-full dark:text-white dark:bg-secondary-dark-bg">
//             <thead className="sticky top-0 bg-white z-10 ">
//               <tr
//                 className="bg-gray-200 md:text-[15px]  border- text-white"
//                 // className="bg-gray-200 md:text-[10px] lg:text-lg border- text-white"
//                 style={{ backgroundColor: currentColor }}
//               >
//                 {thead?.map((headData, index) => (
//                   <th
//                     key={index}
//                     style={{
//                       width: headData?.width ? headData?.width : "",
//                       textAlign: headData?.textAlign
//                         ? headData?.textAlign
//                         : "",
//                     }}
//                     className={`px-2 md:py-1  font-semibold text-left   ${
//                       headData?.className ? headData?.className : ""
//                     }`}
//                   >
//                     {headData?.name ? headData?.name : headData}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="bg-white md:text-[10px] lg:text-lg dark:bg-secondary-dark-bg">
//               {tbody?.map((ele, index) => {
//                 const keys = Object.keys(ele).filter(
//                   (key) => key !== "colorcode"
//                 );
//                 const rowColor = ele.colorcode || ""; // Use colorcode if present
//                 return (
//                   <tr
//                     key={index}
//                     className={` border ${
//                       getRowClass ? getRowClass(ele, index) : ""
//                     } ${
//                       index === activeRowIndex ? "bg-blue-200" : ""
//                     }`}
//                     onClick={() => handleRowClick(ele, index)}
//                     style={{ backgroundColor: rowColor }}
//                   >
//                     {keys?.map((bodyData, inx) => (
//                       <td
//                         key={inx}
//                         data-title={
//                           thead[inx]?.name ? thead[inx]?.name : thead[inx]
//                         }
//                         style={{ width: WWW }}
//                         className={`px-2 py-1 ${
//                           handleClassOnRow
//                             ? handleClassOnRow(
//                                 ele,
//                                 thead[inx]?.name
//                                   ? thead[inx]?.name
//                                   : thead[inx]
//                               )
//                             : ""
//                         }`}
//                       >
//                         {ele[bodyData]?.label ? (
//                           ele[bodyData]?.label
//                         ) : ele[bodyData] ? (
//                           ele[bodyData]
//                         ) : (
//                           <> </>
//                         )}
//                         {isMobile && <> </>}
//                       </td>
//                     ))}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     )
//   );
// }

// export default Tables;


// import React, { useRef, useState } from "react";
// import { useStateContext } from "../contexts/ContextProvider";

// function Tables({
//   thead,
//   tbody,
//   fs,
//   getRowClass,
//   style,
//   tableHeight,
//   scrollView,
//   getRowClick,
//   WWW,
//   handleClassOnRow,
// }) {
//   const isMobile = window.innerWidth <= 768;
//   const activeRowRef = useRef(null);
//   const { currentColor } = useStateContext();
//   // Function to handle row click
//   const handleRowClick = (rowRef, ele, index) => {
//     getRowClick && getRowClick(ele, index);

//     // Reset the previous active row style if it exists
//     if (activeRowRef.current) {
//       // Reset the previous active row to its original color
//       const originalColor = activeRowRef.current.getAttribute(
//         "data-original-color"
//       );
//       activeRowRef.current.style.backgroundColor = originalColor;
//     }

//     // Set the new active row style
//     if (rowRef) {
//       // Store the original color of the new active row
//       rowRef.setAttribute("data-original-color", rowRef.style.backgroundColor);
//       rowRef.style.backgroundColor = "lightblue";
//       activeRowRef.current = rowRef;
//     }
//   };

//   return (
//     tbody?.length > 0 && (
//       <div
//         id="no-more-tables"
//         style={style}
//         className={`overflow-auto ${tableHeight} ${scrollView} custom-scrollbar `}
//       >
//         {/* <div className="grid"> */}
//         <div className="relative max-h-[80vh] overflow-auto">
//           {/* <div className="col-span-full"> */}
//             <table className="table-auto border-collapse w-full dark:text-white dark:bg-secondary-dark-bg">
//             <thead className="sticky top-0 bg-white z-10 ">
//             {/* <thead className="sticky top-0 bg-white z-10"> */}
//               {/* <thead> */}
//                 <tr className="bg-gray-200 md:text-[10px] lg:text-lg border- text-white" 
//                  style={{ backgroundColor: currentColor }}
//                 // style={{background:currentColor}}
                
//                 >
//                   {thead?.map((headData, index) => (
//                     <th
//                       key={index}
//                       style={{
//                         width: headData?.width ? headData?.width : "",
//                         textAlign: headData?.textAlign
//                           ? headData?.textAlign
//                           : "",
//                       }}
//                       className={`px-2 md:py-1 lg:py-2 font-semibold text-left   ${
//                         headData?.className ? headData?.className : ""
//                       }`}
//                     >
//                       {headData?.name ? headData?.name : headData}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white md:text-[10px] lg:text-lg dark:bg-secondary-dark-bg">
//                 {tbody?.map((ele, index) => {
//                   const keys = Object.keys(ele).filter(
//                     (key) => key !== "colorcode"
//                   ); // Exclude colorcode
//                   const rowColor = ele.colorcode || ""; // Use colorcode if present
//                   return (
//                     <tr
//                       key={index}
//                       className={ ` border ${getRowClass ? getRowClass(ele, index) : ""}`}
//                       // style={{ backgroundColor: rowColor }}
//                       onClick={(e) =>
//                         handleRowClick(e.currentTarget, ele, index)
//                       }
//                     >
//                       {keys?.map((bodyData, inx) => (
//                         <td
//                           key={inx}
//                           data-title={
//                             thead[inx]?.name ? thead[inx]?.name : thead[inx]
//                           }
//                           style={{ width: WWW }}
//                           className={`px-2 py-1 ${
//                             handleClassOnRow
//                               ? handleClassOnRow(
//                                   ele,
//                                   thead[inx]?.name
//                                     ? thead[inx]?.name
//                                     : thead[inx]
//                                 )
//                               : ""
//                           }`}
//                         >
//                           {ele[bodyData]?.label ? (
//                             ele[bodyData]?.label
//                           ) : ele[bodyData] ? (
//                             ele[bodyData]
//                           ) : (
//                             <>&nbsp;</>
//                           )}
//                           {isMobile && <>&nbsp;</>}
//                         </td>
//                       ))}
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         {/* </div> */}
//       </div>
//     )
//   );
// }

// export default Tables;
