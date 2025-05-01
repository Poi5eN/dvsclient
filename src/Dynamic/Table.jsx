import React, { useState, useMemo } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { ReactInput } from "./ReactInput/ReactInput"; // Assuming this is a styled input component
import { Link } from "react-router-dom";

// --- Configuration for Status Styling (Softer Look & Better Contrast) ---
// Provides background, text color, and an optional indicator color for each status.
// Includes dark mode variants.
const statusConfig = {
  Paid: {
    bg: "bg-green-50 dark:bg-green-900/30", // Very light green background
    text: "text-green-700 dark:text-green-300", // Darker green text for contrast
    indicator: "bg-green-500", // Solid green for potential dot indicator
  },
  Unpaid: {
    bg: "bg-red-50 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    indicator: "bg-red-500",
  },
  Partial: {
    bg: "bg-yellow-50 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
    indicator: "bg-yellow-500",
  },
  // Default style for rows without a specific status or if status is unknown
  Default: {
    bg: "bg-white dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    indicator: "bg-gray-400",
  },
};

// --- Helper Function to Get Styling Classes ---
const getStatusClasses = (feeStatus) => {
  // Return the specific status config or the default if not found
  return statusConfig[feeStatus] || statusConfig.Default;
};

// --- Search Icon Component ---
// Simple SVG icon for the search input.
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-400 dark:text-gray-500" // Slightly smaller icon
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// --- The Table Component ---
const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  // Use context for the primary color (e.g., for the header background)
  const { currentColor } = useStateContext();

  // --- Memoized Filtering Logic ---
  // useMemo improves performance by only recalculating when dependencies change.
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return tBody; // No search query? Return all data.
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    // Filter rows where at least one cell (corresponding to a header) includes the search query.
    return tBody.filter((row) =>
      tHead.some((header) => {
        const cellValue = row[header.id];
        // Check if cellValue exists and can be converted to string before searching
        return cellValue != null && // Check for null or undefined
               cellValue.toString().toLowerCase().includes(lowerCaseQuery);
      })
    );
  }, [tBody, tHead, searchQuery]); // Recalculate only if these change

  return (
    // --- Outer Container ---
    // Adds padding and centers the content if the screen is wide enough.
    <div className="px-2  w-full  mx-auto"
   
    >
      {/* --- Card Container --- */}
      {/* White background, shadow, rounded corners for a card-like appearance. */}
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
       style={{borderTop:`4px solid ${currentColor}`}}>

        {/* --- Card Header (Title & Search) --- */}
        <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-lg uppercase"
          style={{color:currentColor}}
          >
         <Link to="/" className="text-xl" >🏠</Link> {title}
          </h2>
          {isSearch && (
            <div className="relative w-full sm:w-64">
              {/* Position search icon inside the input */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              {/* Using a standard input for easier styling demonstration */}
              <input
                type="text"
                placeholder="Search table..."
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                className="
                  block w-full pl-9 pr-3 py-1
                  text-sm text-slate-700 dark:text-slate-300
                  bg-white dark:bg-slate-700
                  border border-slate-300 dark:border-slate-600
                  rounded-md shadow-sm
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600
                "
              />
               {/* If your ReactInput component accepts className and applies it correctly, you can use it:
               <ReactInput
                 type="text"
                 name="searchInput"
                 placeholder="Search table..."
                 label="" // Hide label visually if placeholder is enough
                 onChange={(e) => setSearchQuery(e.target.value)}
                 value={searchQuery}
                 className="pl-9 pr-3 py-2 text-sm ..." // Add other styles as above
               />
               */}
            </div>
          )}
        </header>

        {/* --- Table Container (Scrollable) --- */}
        {/* Limits height and enables horizontal/vertical scrolling. */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-170px)]"> {/* Adjusted max-height */}
          {/* Use min-w-full to ensure table takes at least full width for scrolling */}
          <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">

            {/* --- Table Head --- */}
            {/* Sticky header using the context's currentColor */}
            <thead className="sticky top-0 z-10">
              <tr>
                {tHead.map((header) => (
                  <th
                    key={header.id}
                    scope="col" // Important for accessibility
                    className="
                      px-5 py-3 // Increased padding
                      text-left text-xs font-semibold // Adjusted font weight/size
                      text-white uppercase tracking-wider // Style for header text
                      whitespace-nowrap
                    "
                    // Apply the dynamic background color from context
                    style={{ backgroundColor: currentColor }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* --- Table Body --- */}
            {/* Apply status-based background and text colors */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => {
                  // Get the appropriate style classes based on the row's feeStatus
                  const statusClasses = getStatusClasses(row.feeStatus);

                  return (
                    <tr
                      key={index}
                      // Apply status background and a subtle hover effect
                      // The hover slightly darkens/lightens the existing background
                      className={`${statusClasses.bg} transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125`}
                    >
                      {/* {tHead.map((header) => (
                        <td
                          key={`${index}-${header.id}`}
                          className={`
                            px-5 py-3 // Match header padding
                            whitespace-nowrap text-sm // Standard text size
                            ${statusClasses.text} // Apply status-specific text color
                          `}
                        >
                        
                          {row[header.id] != null ? String(row[header.id]) : "-"}
                        </td>
                      ))} */}

{tHead.map((header) => (
                        <td
                          key={`${index}-${header.id}`}
                          className="border-b-1 px-2 py-[2px] align-middle  text-xs whitespace-nowrap text-left text-blueGray-700"
                        >
                          <p class="block text-sm font-normal leading-none text-slate-500">
                            {row[header.id]}
                          </p>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                /* --- Row for No Results --- */
                <tr>
                  <td
                    colSpan={tHead.length} // Span across all columns
                    className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
                  >
                    {/* Show different message based on whether it's no data or no search results */}
                    {searchQuery ? "No matching records found." : "No data available in table."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> {/* End Scrollable Container */}
      </div> {/* End Card Container */}
    </div> // End Outer Container
  );
};

export default Table;



// import React, { useState } from "react";
// import { useStateContext } from "../contexts/ContextProvider";
// import { ReactInput } from "./ReactInput/ReactInput";

// const bgGreenClass = "bg-green-600"; // Light green
// const bgRedClass = "bg-red-200"; // Light red
// const bgYellowClass = "bg-yellow-200"; // Light yellow

// const Table = ({ tHead, tBody, isSearch, }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();

//   const getStatusColorClass = (feeStatus) => {
//     switch (feeStatus) {
//       case "Paid":
//         return bgGreenClass;
//       case "Unpaid":
//         return bgRedClass;
//       case "Partial":
//         return bgYellowClass;
//       default:
//         return "";
//     }
//   };

//   // Search Filter Logic
//   const filteredData = tBody.filter((row) =>
//     tHead.some((header) =>
//       row[header.id]
//         ?.toString()
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase())
//     )
//   );

//   return (
//     <section className="py-1 bg-blueGray-50 ">
//       <div className="relative flex flex-col min-w-0 break-words w-full rounded">
//         {
//           isSearch && <div className="rounded-t border-0">

//                 <ReactInput
//                   type="text"
//                   name="searchInput"
//                   // required={true}
//                   label="Search here"
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   value={searchQuery}
//                 />
//           </div>
//         }
//         <div className="block w-full overflow-x-auto h-[85vh] overflow-y-auto dark:text-gray-200">
//           <table className="items-center bg-transparent w-full border-collapse ">
//             <thead className="sticky top-0 z-10">

//               <tr>
             
//                 {tHead.map((header) => (
               
//                   <th class={`px-2 text-start border-b border-slate-300 bg-white whitespace-nowrap uppercase w-[${header?.width}]`}
//                   // <th class={`px-2 py-1 text-start border-b border-slate-300 bg-slate-50 whitespace-nowrap uppercase w-${header?.width}`}
//                     // style={{ background: currentColor, color: "white", }}
//                     style={{ background: currentColor, color: "white"}}
//                   >
                 
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
          
//             <tbody >
//               {filteredData.length > 0 ? (
//                 filteredData.map((row, index) => {
//                   const rowClassName = getStatusColorClass(row.feeStatus);

//                   return (
//                     <tr key={index} className={`${rowClassName} hover:bg-gray-100 py-1`}>
                      
//                       {tHead.map((header) => (
//                         <td
//                           key={`${index}-${header.id}`}
//                           className="border-b-1 px-2 py-[2px] align-middle  text-xs whitespace-nowrap text-left text-blueGray-700"
//                         >
//                           <p class="block text-sm font-normal leading-none text-slate-500">
//                             {row[header.id]}
//                           </p>
//                         </td>
//                       ))}
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={tHead.length}
//                     className="text-center py-4 text-gray-500"
//                   >
//                     No matching records found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
          
//           </table>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default Table;
