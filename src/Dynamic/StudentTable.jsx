import React, { useState, useMemo } from "react";
import { useStateContext } from "../contexts/ContextProvider"; // Or your actual context import

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-400 dark:text-gray-500"
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

// Helper to render values, handling arrays and objects more gracefully
const renderDetailValue = (value) => {
  if (React.isValidElement(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "N/A";
    return value
      .map(item => {
        if (typeof item === 'object' && item !== null) {
          if (item.name) return item.name;
          if (item.label) return item.label;
          if (React.isValidElement(item)) return "[React Element]"; // Might need specific handling if JSX is in array
          return "[Object]";
        }
        return String(item);
      })
      .join(", ");
  }
  if (typeof value === 'object' && value !== null) {
    // For a simple object, you might want to display its keys or a summary
    // For now, a generic placeholder is safer for a truly generic component
    return "[Object]";
  }
  if (value === null || typeof value === 'undefined' || String(value).trim() === "") {
    return "N/A";
  }
  return String(value);
};

// Generic display component for "Label: Value"
const DetailItemDisplay = ({ label, value }) => (
  <div className="text-sm">
    <span className="text-sky-600 dark:text-sky-400">{label}: </span>
    <span className="font-normal text-gray-700 dark:text-gray-200 break-words">
      {renderDetailValue(value)}
    </span>
  </div>
);

const DefaultImagePlaceholder = () => (
  <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-1">
    <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight font-medium">
      NO IMAGE<br />AVAILABLE
    </span>
  </div>
);

const StudentTable = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentColor } = useStateContext(); // Ensure this provides currentColor

  const filteredData = useMemo(() => {
    if (!searchQuery) return tBody;
    const lower = searchQuery.toLowerCase();
    if (!Array.isArray(tBody)) return [];

    return tBody.filter((item) =>
      Object.entries(item).some(([key, val]) => {
        if (val === null || typeof val === 'undefined') return false;
        let searchableValue = '';
        if (React.isValidElement(val)) {
          try {
            const getText = (element) => {
              if (typeof element === 'string' || typeof element === 'number') return String(element);
              if (element.props && Array.isArray(element.props.children)) {
                return element.props.children.map(getText).join(' ');
              }
              if (element.props && element.props.children) {
                return getText(element.props.children);
              }
              return '';
            };
            searchableValue = getText(val);
          } catch (e) { searchableValue = '[ReactElementSearchError]'; }
        } else if (Array.isArray(val)) {
          searchableValue = val.map(v => {
            if (typeof v === 'object' && v !== null) return v.name || v.label || '';
            return String(v);
          }).join(' ');
        } else if (typeof val === 'object' && val !== null) {
            searchableValue = Object.values(val).filter(v => typeof v === 'string' || typeof v === 'number').join(' ');
        } else {
          searchableValue = String(val);
        }
        return searchableValue.toLowerCase().includes(lower);
      })
    );
  }, [searchQuery, tBody]);

  const validTHead = Array.isArray(tHead) ? tHead : [];

  return (
    <div className="w-full mx-auto">
      <div
        className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
        style={{ borderTop: `3px solid ${currentColor}` }}
      >
        <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2
            className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase hidden sm:block"
            style={{ color: currentColor }}
          >
            {title}
          </h2>
          {isSearch && (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <SearchIcon /> </div>
              <input
                type="text" placeholder="Search table..."
                onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery}
                className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
              />
            </div>
          )}
        </header>

        {/* TABLE view (md and up) */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
          <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="sticky top-0 z-10">
              <tr>
                {validTHead.map((header) => (
                  <th
                    key={header.id} scope="col"
                    className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                    style={{ backgroundColor: currentColor, width: header?.width ? `${header.width}%` : 'auto' }}
                  > {header.label} </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredData?.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={index} className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${index % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-[#edf0f2] dark:bg-gray-700"}`}>
                    {validTHead.map((header) => (
                      <td key={`${index}-${header.id}`} className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left ">
                        <div className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300">
                           {row[header.id]}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={validTHead.length || 1} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic">
                    {searchQuery ? "No matching records found." : "No data available in table."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CARD view for mobile (Dynamic based on tHead) */}
        <div className="md:hidden px-2 py-2 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto bg-slate-100 dark:bg-slate-800/50">
          {filteredData?.length > 0 ? (
            filteredData.map((row, index) => {
              const nameHeader = validTHead.find(h => h.id.toLowerCase().includes('name') || h.label.toLowerCase().includes('name'));
              const photoHeader = validTHead.find(h => h.id.toLowerCase().includes('photo') || h.label.toLowerCase().includes('photo') || h.id.toLowerCase().includes('image') || h.label.toLowerCase().includes('image'));
              const actionHeader = validTHead.find(h => h.id.toLowerCase().includes('action') || h.label.toLowerCase().includes('action'));

              let cardTitleValue = "N/A";
              let titleFieldId = null;

              if (nameHeader && row[nameHeader.id] !== undefined) {
                cardTitleValue = row[nameHeader.id];
                titleFieldId = nameHeader.id;
              } else {
                const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
                if (firstMeaningfulHeader && row[firstMeaningfulHeader.id] !== undefined) {
                  cardTitleValue = row[firstMeaningfulHeader.id];
                  titleFieldId = firstMeaningfulHeader.id;
                } else if (validTHead[0] && row[validTHead[0].id] !== undefined) { // Fallback to the very first column's value if no other title candidate
                  cardTitleValue = row[validTHead[0].id];
                  titleFieldId = validTHead[0].id;
                }
              }
              
              const rawPhotoValue = photoHeader ? row[photoHeader.id] : null;
              const actionValue = actionHeader ? row[actionHeader.id] : null;

              let imageSrc = null;
              let imageAlt = 'Detail image';
              if (rawPhotoValue) {
                if (React.isValidElement(rawPhotoValue) && rawPhotoValue.type === 'img' && rawPhotoValue.props.src) {
                  imageSrc = rawPhotoValue.props.src;
                  imageAlt = rawPhotoValue.props.alt || 'Detail image';
                } else if (typeof rawPhotoValue === 'string' && (rawPhotoValue.startsWith('http') || rawPhotoValue.startsWith('/') || rawPhotoValue.startsWith('data:image'))) {
                  imageSrc = rawPhotoValue; // Assumes string is a direct image URL
                }
              }

              const detailFields = validTHead.filter(header =>
                header.id !== photoHeader?.id &&
                header.id !== actionHeader?.id &&
                header.id !== titleFieldId // Exclude the field chosen as the title
              );

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex justify-between items-start mb-2  border-b border-slate-200 dark:border-slate-600">
                  {/* <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-200 dark:border-slate-600"> */}
                    <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate pr-2 flex-grow">
                      {renderDetailValue(cardTitleValue)} {/* Use renderDetailValue for consistency */}
                    </h3>
                    {actionValue && <div className="flex-shrink-0 ml-2">{actionValue}</div>}
                  </div>

                  <div className="flex">
                    <div className={`flex-grow space-y-1 ${imageSrc || photoHeader ? 'pr-3' : ''}`}>
                      {detailFields.map(header => (
                        <DetailItemDisplay
                          key={header.id}
                          label={header.label}
                          value={row[header.id]}
                        />
                      ))}
                      {detailFields.length === 0 && !(imageSrc || photoHeader) && (
                         <p className="text-xs text-slate-400 italic py-2">No additional details.</p>
                      )}
                    </div>

                    {(imageSrc || photoHeader) && ( // Render photo area if an image source exists OR a photo column is defined
                      <div className="flex-shrink-0 w-24 flex items-start justify-center pl-2">
                        {imageSrc ? (
                          <img src={imageSrc} alt={imageAlt} className="w-20 h-24 rounded-md object-cover border-2 border-cyan-400" />
                        ) : (
                          <DefaultImagePlaceholder />
                        )}
                      </div>
                    )}
                  </div>
                  {detailFields.length === 0 && !(imageSrc || photoHeader) && (
                     <p className="text-xs text-slate-400 italic py-2 text-center">Card is empty after title.</p>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
              {searchQuery ? "No matching records found." : "No data available in table."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTable;

// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider"; // Or your actual context import

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // Helper to render values, handling arrays and objects more gracefully
// const renderDetailValue = (value) => {
//   if (React.isValidElement(value)) {
//     return value;
//   }
//   if (Array.isArray(value)) {
//     if (value.length === 0) return "N/A";
//     return value
//       .map(item => {
//         if (typeof item === 'object' && item !== null) {
//           if (item.name) return item.name;
//           if (item.label) return item.label;
//           if (React.isValidElement(item)) return "[React Element]"; // Might need specific handling if JSX is in array
//           return "[Object]";
//         }
//         return String(item);
//       })
//       .join(", ");
//   }
//   if (typeof value === 'object' && value !== null) {
//     // For a simple object, you might want to display its keys or a summary
//     // For now, a generic placeholder is safer for a truly generic component
//     return "[Object]";
//   }
//   if (value === null || typeof value === 'undefined' || String(value).trim() === "") {
//     return "N/A";
//   }
//   return String(value);
// };

// // Generic display component for "Label: Value"
// const DetailItemDisplay = ({ label, value }) => (
//   <div className="text-sm">
//     <span className="text-sky-600 dark:text-sky-400">{label}: </span>
//     <span className="font-normal text-gray-700 dark:text-gray-200 break-words">
//       {renderDetailValue(value)}
//     </span>
//   </div>
// );

// const DefaultImagePlaceholder = () => (
//   <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-1">
//     <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight font-medium">
//       NO IMAGE<br />AVAILABLE
//     </span>
//   </div>
// );

// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext(); // Ensure this provides currentColor

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     if (!Array.isArray(tBody)) return [];

//     return tBody.filter((item) =>
//       Object.entries(item).some(([key, val]) => {
//         if (val === null || typeof val === 'undefined') return false;
//         let searchableValue = '';
//         if (React.isValidElement(val)) {
//           try {
//             const getText = (element) => {
//               if (typeof element === 'string' || typeof element === 'number') return String(element);
//               if (element.props && Array.isArray(element.props.children)) {
//                 return element.props.children.map(getText).join(' ');
//               }
//               if (element.props && element.props.children) {
//                 return getText(element.props.children);
//               }
//               return '';
//             };
//             searchableValue = getText(val);
//           } catch (e) { searchableValue = '[ReactElementSearchError]'; }
//         } else if (Array.isArray(val)) {
//           searchableValue = val.map(v => {
//             if (typeof v === 'object' && v !== null) return v.name || v.label || '';
//             return String(v);
//           }).join(' ');
//         } else if (typeof val === 'object' && val !== null) {
//             searchableValue = Object.values(val).filter(v => typeof v === 'string' || typeof v === 'number').join(' ');
//         } else {
//           searchableValue = String(val);
//         }
//         return searchableValue.toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   const validTHead = Array.isArray(tHead) ? tHead : [];

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <SearchIcon /> </div>
//               <input
//                 type="text" placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {validTHead.map((header) => (
//                   <th
//                     key={header.id} scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{ backgroundColor: currentColor, width: header?.width ? `${header.width}%` : 'auto' }}
//                   > {header.label} </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData.map((row, index) => (
//                   <tr key={index} className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${index % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-[#edf0f2] dark:bg-gray-700"}`}>
//                     {validTHead.map((header) => (
//                       <td key={`${index}-${header.id}`} className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left ">
//                         <div className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300">
//                            {row[header.id]}
//                         </div>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={validTHead.length || 1} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic">
//                     {searchQuery ? "No matching records found." : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile (Dynamic based on tHead) */}
//         <div className="md:hidden px-2 py-2 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto bg-slate-100 dark:bg-slate-800/50">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               const nameHeader = validTHead.find(h => h.id.toLowerCase().includes('name') || h.label.toLowerCase().includes('name'));
//               const photoHeader = validTHead.find(h => h.id.toLowerCase().includes('photo') || h.label.toLowerCase().includes('photo') || h.id.toLowerCase().includes('image') || h.label.toLowerCase().includes('image'));
//               const actionHeader = validTHead.find(h => h.id.toLowerCase().includes('action') || h.label.toLowerCase().includes('action'));

//               let cardTitleValue = "N/A";
//               let titleFieldId = null;

//               if (nameHeader && row[nameHeader.id] !== undefined) {
//                 cardTitleValue = row[nameHeader.id];
//                 titleFieldId = nameHeader.id;
//               } else {
//                 const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
//                 if (firstMeaningfulHeader && row[firstMeaningfulHeader.id] !== undefined) {
//                   cardTitleValue = row[firstMeaningfulHeader.id];
//                   titleFieldId = firstMeaningfulHeader.id;
//                 } else if (validTHead[0] && row[validTHead[0].id] !== undefined) { // Fallback to the very first column's value if no other title candidate
//                   cardTitleValue = row[validTHead[0].id];
//                   titleFieldId = validTHead[0].id;
//                 }
//               }
              
//               const rawPhotoValue = photoHeader ? row[photoHeader.id] : null;
//               const actionValue = actionHeader ? row[actionHeader.id] : null;

//               let imageSrc = null;
//               let imageAlt = 'Detail image';
//               if (rawPhotoValue) {
//                 if (React.isValidElement(rawPhotoValue) && rawPhotoValue.type === 'img' && rawPhotoValue.props.src) {
//                   imageSrc = rawPhotoValue.props.src;
//                   imageAlt = rawPhotoValue.props.alt || 'Detail image';
//                 } else if (typeof rawPhotoValue === 'string' && (rawPhotoValue.startsWith('http') || rawPhotoValue.startsWith('/') || rawPhotoValue.startsWith('data:image'))) {
//                   imageSrc = rawPhotoValue; // Assumes string is a direct image URL
//                 }
//               }

//               const detailFields = validTHead.filter(header =>
//                 header.id !== photoHeader?.id &&
//                 header.id !== actionHeader?.id &&
//                 header.id !== titleFieldId // Exclude the field chosen as the title
//               );

//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700"
//                 >
//                   <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
//                     <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate pr-2 flex-grow">
//                       {renderDetailValue(cardTitleValue)} {/* Use renderDetailValue for consistency */}
//                     </h3>
//                     {actionValue && <div className="flex-shrink-0 ml-2">{actionValue}</div>}
//                   </div>

//                   <div className="flex">
//                     <div className={`flex-grow space-y-1 ${imageSrc || photoHeader ? 'pr-3' : ''}`}>
//                       {detailFields.map(header => (
//                         <DetailItemDisplay
//                           key={header.id}
//                           label={header.label}
//                           value={row[header.id]}
//                         />
//                       ))}
//                       {detailFields.length === 0 && !(imageSrc || photoHeader) && (
//                          <p className="text-xs text-slate-400 italic py-2">No additional details.</p>
//                       )}
//                     </div>

//                     {(imageSrc || photoHeader) && ( // Render photo area if an image source exists OR a photo column is defined
//                       <div className="flex-shrink-0 w-24 flex items-start justify-center pl-2">
//                         {imageSrc ? (
//                           <img src={imageSrc} alt={imageAlt} className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400" />
//                         ) : (
//                           <DefaultImagePlaceholder />
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   {detailFields.length === 0 && !(imageSrc || photoHeader) && (
//                      <p className="text-xs text-slate-400 italic py-2 text-center">Card is empty after title.</p>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery ? "No matching records found." : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;


// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider";

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // Helper to render values, handling arrays and objects more gracefully
// const renderDetailValue = (value) => {
//   if (React.isValidElement(value)) {
//     return value; // If it's already a React element, render as is
//   }
//   if (Array.isArray(value)) {
//     if (value.length === 0) return "N/A";
//     return value
//       .map(item => {
//         if (typeof item === 'object' && item !== null) {
//           // Attempt to find a 'name' or 'label' property for display
//           if (item.name) return item.name;
//           if (item.label) return item.label;
//           return "[Object]"; // Fallback for objects in array
//         }
//         return String(item);
//       })
//       .join(", ");
//   }
//   if (typeof value === 'object' && value !== null) {
//     return "[Object]"; // Generic placeholder for non-array objects
//   }
//   if (value === null || typeof value === 'undefined' || String(value).trim() === "") {
//     return "N/A";
//   }
//   return String(value);
// };

// // Generic display component for "Label: Value"
// const DetailItemDisplay = ({ label, value }) => (
//   <div className="text-sm">
//     <span className="text-sky-600 dark:text-sky-400">{label}: </span>
//     <span className="font-normal text-gray-700 dark:text-gray-200 break-words">
//       {renderDetailValue(value)}
//     </span>
//   </div>
// );

// const DefaultImagePlaceholder = () => (
//   <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-1">
//     <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight font-medium">
//       NO IMAGE<br />AVAILABLE
//     </span>
//   </div>
// );

// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     if (!Array.isArray(tBody)) return [];

//     return tBody.filter((item) =>
//       Object.entries(item).some(([key, val]) => {
//         if (val === null || typeof val === 'undefined') return false;
//         let searchableValue = '';
//         if (React.isValidElement(val)) {
//           try {
//             const getText = (element) => {
//               if (typeof element === 'string' || typeof element === 'number') return String(element);
//               if (Array.isArray(element.props?.children)) return element.props.children.map(getText).join(' ');
//               if (element.props?.children) return getText(element.props.children);
//               return '';
//             };
//             searchableValue = getText(val);
//           } catch (e) { searchableValue = '[Object]'; }
//         } else if (Array.isArray(val)) {
//           searchableValue = val.map(v => typeof v === 'object' ? (v.name || v.label || '') : String(v)).join(' ');
//         } else if (typeof val === 'object' && val !== null) {
//             searchableValue = Object.values(val).join(' '); // Simple object search
//         }
//          else {
//           searchableValue = String(val);
//         }
//         return searchableValue.toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   const validTHead = Array.isArray(tHead) ? tHead : [];

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <SearchIcon /> </div>
//               <input
//                 type="text" placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {validTHead.map((header) => (
//                   <th
//                     key={header.id} scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{ backgroundColor: currentColor, width: header?.width ? `${header.width}%` : 'auto' }}
//                   > {header.label} </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData.map((row, index) => (
//                   <tr key={index} className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${index % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-[#edf0f2] dark:bg-gray-700"}`}>
//                     {validTHead.map((header) => (
//                       <td key={`${index}-${header.id}`} className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left ">
//                         <div className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300">
//                            {/* Directly render, assuming tBody values are prepared (JSX or simple types) */}
//                            {row[header.id]}
//                         </div>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={validTHead.length || 1} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic">
//                     {searchQuery ? "No matching records found." : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile (Dynamic based on tHead) */}
//         <div className="md:hidden px-2 py-2 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto bg-slate-100 dark:bg-slate-800/50">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               const nameHeader = validTHead.find(h => h.id.toLowerCase().includes('name') || h.label.toLowerCase().includes('name'));
//               const photoHeader = validTHead.find(h => h.id.toLowerCase().includes('photo') || h.label.toLowerCase().includes('photo') || h.id.toLowerCase().includes('image') || h.label.toLowerCase().includes('image'));
//               const actionHeader = validTHead.find(h => h.id.toLowerCase().includes('action') || h.label.toLowerCase().includes('action'));

//               let cardTitleValue = "N/A";
//               let titleFieldId = null;

//               if (nameHeader && row[nameHeader.id] !== undefined) {
//                 cardTitleValue = row[nameHeader.id];
//                 titleFieldId = nameHeader.id;
//               } else {
//                 const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
//                 if (firstMeaningfulHeader && row[firstMeaningfulHeader.id] !== undefined) {
//                   cardTitleValue = row[firstMeaningfulHeader.id];
//                   titleFieldId = firstMeaningfulHeader.id;
//                 } else if (validTHead[0] && row[validTHead[0].id] !== undefined) {
//                   cardTitleValue = row[validTHead[0].id];
//                   titleFieldId = validTHead[0].id;
//                 }
//               }
              
//               const rawPhotoValue = photoHeader ? row[photoHeader.id] : null;
//               const actionValue = actionHeader ? row[actionHeader.id] : null;

//               let imageSrc = null;
//               let imageAlt = 'Detail image';
//               if (rawPhotoValue) {
//                 if (React.isValidElement(rawPhotoValue) && rawPhotoValue.type === 'img' && rawPhotoValue.props.src) {
//                   imageSrc = rawPhotoValue.props.src;
//                   imageAlt = rawPhotoValue.props.alt || 'Detail image';
//                 } else if (typeof rawPhotoValue === 'string' && (rawPhotoValue.startsWith('http') || rawPhotoValue.startsWith('/') || rawPhotoValue.startsWith('data:image'))) {
//                   imageSrc = rawPhotoValue;
//                 }
//               }

//               const detailFields = validTHead.filter(header =>
//                 header.id !== photoHeader?.id &&
//                 header.id !== actionHeader?.id &&
//                 header.id !== titleFieldId
//               );

//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700"
//                 >
//                   <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
//                     <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate pr-2 flex-grow">
//                       {renderDetailValue(cardTitleValue)} {/* Use renderDetailValue for title too */}
//                     </h3>
//                     {actionValue && <div className="flex-shrink-0 ml-2">{actionValue}</div>}
//                   </div>

//                   <div className="flex">
//                     <div className={`flex-grow space-y-1 ${imageSrc || photoHeader ? 'pr-3' : ''}`}>
//                       {detailFields.map(header => (
//                         <DetailItemDisplay
//                           key={header.id}
//                           label={header.label}
//                           value={row[header.id]} // Pass raw value to DetailItemDisplay
//                         />
//                       ))}
//                       {detailFields.length === 0 && !(imageSrc || photoHeader) && (
//                          <p className="text-xs text-slate-400 italic py-2">No additional details.</p>
//                       )}
//                     </div>

//                     {(imageSrc || photoHeader) && (
//                       <div className="flex-shrink-0 w-24 flex items-start justify-center pl-2">
//                         {imageSrc ? (
//                           <img src={imageSrc} alt={imageAlt} className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400" />
//                         ) : (
//                           <DefaultImagePlaceholder />
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   {detailFields.length === 0 && !(imageSrc || photoHeader) && (
//                      <p className="text-xs text-slate-400 italic py-2 text-center">Card is empty after title.</p>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery ? "No matching records found." : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;


// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider";

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // --- New Helper Components for Mobile Card ---

// // For "Label: Value" on the same line
// const InfoLineDisplay = ({ label, value, valueClassName = "" }) => (
//   <div className="text-sm">
//     <span className="text-gray-500 dark:text-gray-400">{label}: </span>
//     <span className={`font-normal text-gray-700 dark:text-gray-200 break-words ${valueClassName}`}>
//     {/* <span className={`font-normal text-gray-700 dark:text-gray-200 break-words ${valueClassName}`}> */}
//       {React.isValidElement(value) ? value : (value !== null && typeof value !== 'undefined' ? String(value) : 'N/A')}
//     </span>
//   </div>
// );

// // For "Label:" on one line and "Value" on the next
// const InfoBlockDisplay = ({ label, value, valueClassName = "" }) => (
//   <div className="text-sm">
//     <p className="text-gray-500 dark:text-gray-400">{label}:</p>
//     <p className={`font-normal text-gray-700 dark:text-gray-200 break-words ${valueClassName}`}>
//       {React.isValidElement(value) ? value : (value !== null && typeof value !== 'undefined' ? String(value) : 'N/A')}
//     </p>
//   </div>
// );

// const DefaultImagePlaceholder = () => (
//   <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-gray-100 dark:bg-gray-700 p-1">
//     <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight font-medium">
//       NO IMAGE<br />AVAILABLE
//     </span>
//   </div>
// );

// // --- End Helper Components ---


// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     if (!Array.isArray(tBody)) return [];

//     return tBody.filter((item) =>
//       Object.entries(item).some(([key, val]) => {
//         if (val === null || typeof val === 'undefined') return false;
//         let searchableValue = '';
//         if (React.isValidElement(val)) {
//           try {
//             const getText = (element) => {
//               if (typeof element === 'string' || typeof element === 'number') return String(element);
//               if (Array.isArray(element.props?.children)) return element.props.children.map(getText).join(' ');
//               if (element.props?.children) return getText(element.props.children);
//               return '';
//             };
//             searchableValue = getText(val);
//           } catch (e) { searchableValue = '[Object]'; }
//         } else {
//           searchableValue = String(val);
//         }
//         return searchableValue.toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   const validTHead = Array.isArray(tHead) ? tHead : [];

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"> <SearchIcon /> </div>
//               <input
//                 type="text" placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {validTHead.map((header) => (
//                   <th
//                     key={header.id} scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{ backgroundColor: currentColor, width: header?.width ? `${header.width}%` : 'auto' }}
//                   > {header.label} </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData.map((row, index) => (
//                   <tr key={index} className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${index % 2 === 0 ? "bg-white dark:bg-slate-900/50" : "bg-[#edf0f2] dark:bg-gray-700"}`}>
//                     {validTHead.map((header) => (
//                       <td key={`${index}-${header.id}`} className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left ">
//                         <div className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300"> {row[header.id]} </div>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={validTHead.length || 1} className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic">
//                     {searchQuery ? "No matching records found." : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile (Dynamic based on tHead) */}
//         <div className="md:hidden px-2 py-2 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto bg-slate-100 dark:bg-slate-800/50">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               const nameHeader = validTHead.find(h => h.id.toLowerCase().includes('name') || h.label.toLowerCase().includes('name'));
//               const photoHeader = validTHead.find(h => h.id.toLowerCase().includes('photo') || h.label.toLowerCase().includes('photo') || h.id.toLowerCase().includes('image') || h.label.toLowerCase().includes('image'));
//               const actionHeader = validTHead.find(h => h.id.toLowerCase().includes('action') || h.label.toLowerCase().includes('action'));

//               let cardTitleValue = "N/A";
//               let titleFieldId = null;

//               if (nameHeader && row[nameHeader.id] !== undefined) {
//                 cardTitleValue = row[nameHeader.id];
//                 titleFieldId = nameHeader.id;
//               } else {
//                 const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
//                 if (firstMeaningfulHeader && row[firstMeaningfulHeader.id] !== undefined) {
//                   cardTitleValue = row[firstMeaningfulHeader.id];
//                   titleFieldId = firstMeaningfulHeader.id;
//                 } else if (validTHead[0] && row[validTHead[0].id] !== undefined) {
//                   cardTitleValue = row[validTHead[0].id];
//                   titleFieldId = validTHead[0].id;
//                 }
//               }
              
//               const rawPhotoValue = photoHeader ? row[photoHeader.id] : null;
//               const actionValue = actionHeader ? row[actionHeader.id] : null;

//               let imageSrc = null;
//               let imageAlt = 'Detail image';
//               if (rawPhotoValue) {
//                 if (React.isValidElement(rawPhotoValue) && rawPhotoValue.type === 'img' && rawPhotoValue.props.src) {
//                   imageSrc = rawPhotoValue.props.src;
//                   imageAlt = rawPhotoValue.props.alt || 'Detail image';
//                 } else if (typeof rawPhotoValue === 'string' && (rawPhotoValue.startsWith('http') || rawPhotoValue.startsWith('/') || rawPhotoValue.startsWith('data:image'))) {
//                   imageSrc = rawPhotoValue;
//                 }
//               }

//               const detailFields = validTHead.filter(header =>
//                 header.id !== photoHeader?.id &&
//                 header.id !== actionHeader?.id &&
//                 header.id !== titleFieldId
//               );

//               const blockDisplayKeywordsId = ['mobile', 'address', 'contact', 'remark', 'description'];
//               const blockDisplayKeywordsLabel = ['mobile no', 'address', 'contact', 'remarks', 'description'];
//               const idValueSpecialStyleKeywords = ['admno', 'admissionno', 'employeeid', 'empid', 'id'];


//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700"
//                 >
//                   <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
//                     <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate pr-2 flex-grow">
//                       {React.isValidElement(cardTitleValue) ? cardTitleValue : String(cardTitleValue)}
//                     </h3>
//                     {actionValue && <div className="flex-shrink-0 ml-2">{actionValue}</div>}
//                   </div>

//                   <div className="flex">
//                     <div className={`flex-grow space-y-1.5 ${imageSrc || photoHeader ? 'pr-3' : ''}`}>
//                       {detailFields.map(header => {
//                         const value = row[header.id];
//                         let displayValue = value;
//                         let valueCustomClassName = "";

//                         const headerIdLower = header.id.toLowerCase();
//                         const headerLabelLower = header.label.toLowerCase();

//                         if (idValueSpecialStyleKeywords.some(keyword => headerIdLower.includes(keyword)) && typeof value === 'string' && value.toUpperCase().startsWith('DI')) {
//                           displayValue = <span className="text-red-500 font-semibold">{value}</span>;
//                         } else if (idValueSpecialStyleKeywords.some(keyword => headerIdLower.includes(keyword))) {
//                            valueCustomClassName = "font-semibold"; // Make other IDs bold by default if not "DI"
//                         }


//                         if (blockDisplayKeywordsId.some(keyword => headerIdLower.includes(keyword)) || blockDisplayKeywordsLabel.some(keyword => headerLabelLower.includes(keyword))) {
//                           return <InfoBlockDisplay key={header.id} label={header.label} value={displayValue} valueClassName={valueCustomClassName} />;
//                         } else {
//                           return <InfoLineDisplay key={header.id} label={header.label} value={displayValue} valueClassName={valueCustomClassName} />;
//                         }
//                       })}
//                       {detailFields.length === 0 && !(imageSrc || photoHeader) && (
//                          <p className="text-xs text-slate-400 italic py-2">No additional details.</p>
//                       )}
//                     </div>

//                     {(imageSrc || photoHeader) && ( // Only render photo area if an image source exists OR a photo column is defined (to show placeholder)
//                       <div className="flex-shrink-0 w-24 flex items-start justify-center pl-2">
//                         {imageSrc ? (
//                           <img src={imageSrc} alt={imageAlt} className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400" />
//                         ) : (
//                           <DefaultImagePlaceholder />
//                         )}
//                       </div>
//                     )}
//                   </div>
//                   {detailFields.length === 0 && !(imageSrc || photoHeader) && ( // If no details AND no photo area was rendered
//                      <p className="text-xs text-slate-400 italic py-2 text-center">Card is empty after title.</p>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery ? "No matching records found." : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;



// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider"; // Assuming this provides currentColor

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // Helper component for "Label: Value" lines in the card
// const InfoLine = ({ label, value, valueClassName = "", labelClassName = "text-slate-500 dark:text-slate-400", containerClassName = "" }) => (
//   <div className={`flex justify-between items-start py-0.5 ${containerClassName}`}>
//     <span className={`text-xs font-medium ${labelClassName} whitespace-nowrap mr-2`}>{label}:</span>
//     <div className={`text-xs text-slate-700 dark:text-slate-200 text-right break-words ${valueClassName}`}>
//       {React.isValidElement(value) ? value : (value !== null && typeof value !== 'undefined' ? String(value) : 'N/A')}
//     </div>
//   </div>
// );


// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     if (!Array.isArray(tBody)) return [];

//     return tBody.filter((item) =>
//       Object.entries(item).some(([key, val]) => {
//         if (val === null || typeof val === 'undefined') return false;
//         let searchableValue = '';
//         if (React.isValidElement(val)) {
//           try {
//             const getText = (element) => {
//               if (typeof element === 'string' || typeof element === 'number') {
//                 return String(element);
//               }
//               if (Array.isArray(element.props?.children)) {
//                 return element.props.children.map(getText).join(' ');
//               }
//               if (element.props?.children) {
//                 return getText(element.props.children);
//               }
//               return '';
//             };
//             searchableValue = getText(val);
//           } catch (e) {
//             searchableValue = '[Object]';
//           }
//         } else {
//           searchableValue = String(val);
//         }
//         return searchableValue.toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   const validTHead = Array.isArray(tHead) ? tHead : [];

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <SearchIcon />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {validTHead.map((header) => (
//                   <th
//                     key={header.id}
//                     scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{
//                       backgroundColor: currentColor,
//                       width: header?.width ? `${header.width}%` : 'auto',
//                     }}
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData.map((row, index) => (
//                   <tr
//                     key={index}
//                     className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${
//                       index % 2 === 0
//                         ? "bg-white dark:bg-slate-900/50"
//                         : "bg-[#edf0f2] dark:bg-gray-700"
//                     }`}
//                   >
//                     {validTHead.map((header) => (
//                       <td
//                         key={`${index}-${header.id}`}
//                         className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left "
//                       >
//                         <div className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300">
//                             {row[header.id]}
//                         </div>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={validTHead.length || 1}
//                     className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
//                   >
//                     {searchQuery
//                       ? "No matching records found."
//                       : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile (Dynamic based on tHead) */}
//         <div className="md:hidden px-2 py-2 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto bg-slate-100 dark:bg-slate-800/50">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               const nameHeader = validTHead.find(h => h.id.toLowerCase().includes('name') || h.label.toLowerCase().includes('name'));
//               const photoHeader = validTHead.find(h => h.id.toLowerCase().includes('photo') || h.label.toLowerCase().includes('photo') || h.id.toLowerCase().includes('image') || h.label.toLowerCase().includes('image'));
//               const actionHeader = validTHead.find(h => h.id.toLowerCase().includes('action') || h.label.toLowerCase().includes('action'));

//               let cardTitleValue = "N/A";
//               if (nameHeader && row[nameHeader.id]) {
//                 cardTitleValue = row[nameHeader.id];
//               } else if (validTHead.length > 0) {
//                 const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
//                 if (firstMeaningfulHeader && row[firstMeaningfulHeader.id]) {
//                     cardTitleValue = row[firstMeaningfulHeader.id];
//                 } else if (validTHead[0] && row[validTHead[0].id]) {
//                     cardTitleValue = row[validTHead[0].id];
//                 }
//               }

//               const photoValue = photoHeader ? row[photoHeader.id] : null;
//               const actionValue = actionHeader ? row[actionHeader.id] : null;

//               const detailFields = validTHead.filter(header => {
//                 // Exclude if it was the one used as title, or if it's photo/action
//                 if (header.id === photoHeader?.id || header.id === actionHeader?.id) return false;
//                 if (nameHeader?.id === header.id && cardTitleValue === row[header.id]) return false; // if it's the name field and used as title
//                 if (!nameHeader) { // if no specific name field, check if it was the fallback title
//                     const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
//                     if (firstMeaningfulHeader?.id === header.id && cardTitleValue === row[header.id]) return false;
//                     else if (!firstMeaningfulHeader && validTHead[0]?.id === header.id && cardTitleValue === row[header.id]) return false;
//                 }
//                 return true;
//               });


//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700"
//                 >
//                   {/* Top Section: Title and Actions */}
//                   <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
//                     <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate pr-2 flex-grow">
//                       {React.isValidElement(cardTitleValue) ? cardTitleValue : String(cardTitleValue)}
//                     </h3>
//                     {actionValue && (
//                       <div className="flex-shrink-0 ml-2">
//                         {actionValue}
//                       </div>
//                     )}
//                   </div>

//                   {/* Main Content: Details on Left, Photo on Right */}
//                   <div className="flex">
//                     {/* Left Column: Details */}
//                     <div className={`flex-grow space-y-0.5 ${photoValue ? 'pr-3' : ''}`}> {/* Add padding-right if photo exists */}
//                       {detailFields.map(header => (
//                         <InfoLine
//                           key={header.id}
//                           label={header.label}
//                           value={row[header.id]}
//                         />
//                       ))}
//                       {detailFields.length === 0 && ( // Show only if no details AND no photo. If photo exists, this side might be empty, which is fine.
//                         <p className="text-xs text-slate-400 italic py-2">No additional details.</p>
//                       )}
//                     </div>

//                     {/* Right Column: Photo (if exists) */}
//                     {photoValue && (
//                       <div className="flex-shrink-0 w-16 border-red-300 h-auto max-h-24 ml-auto rounded overflow-hidden flex items-center justify-center">
//                         {/*
//                           Assuming photoValue is JSX like <img/>.
//                           Ensure its styling is appropriate. Example for img tag in tBody mapping:
//                           className="w-full h-full object-contain max-w-full max-h-full"
//                           Or if it's a simple img component, it might take the width from here.
//                           The h-auto and max-h-24 will help constrain its height while maintaining aspect ratio.
//                         */}
//                         {photoValue}
//                       </div>
//                     )}
//                   </div>
//                   {detailFields.length === 0 && !photoValue && ( // Message if card is entirely empty after title/actions
//                      <p className="text-xs text-slate-400 italic py-2 text-center">No details or photo available.</p>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery
//                 ? "No matching records found."
//                 : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;


// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider"; // Assuming this provides currentColor

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // Helper component for "Label: Value" lines in the card
// const InfoLine = ({ label, value, valueClassName = "", labelClassName = "text-slate-500 dark:text-slate-400", containerClassName = "" }) => (
//   <div className={`flex justify-between items-start py-0.5 ${containerClassName}`}>
//     <span className={`text-xs font-medium ${labelClassName} whitespace-nowrap mr-2`}>{label}:</span>
//     {/* The value part can receive simple text or complex JSX */}
//     <div className={`text-xs text-slate-700 dark:text-slate-200 text-right break-words ${valueClassName}`}>
//       {React.isValidElement(value) ? value : (value !== null && typeof value !== 'undefined' ? String(value) : 'N/A')}
//     </div>
//   </div>
// );


// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext(); // Make sure this context provides 'currentColor'

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     if (!Array.isArray(tBody)) return [];

//     return tBody.filter((item) =>
//       Object.entries(item).some(([key, val]) => {
//         if (val === null || typeof val === 'undefined') return false;

//         // Attempt to get a string representation for searching
//         let searchableValue = '';
//         if (React.isValidElement(val)) {
//           // Basic attempt to get text from simple JSX elements
//           // This is limited and might not work for complex nested JSX.
//           // For more robust search on JSX, consider searching the original data
//           // before it's transformed into JSX for `tBody`.
//           try {
//             const getText = (element) => {
//               if (typeof element === 'string' || typeof element === 'number') {
//                 return String(element);
//               }
//               if (Array.isArray(element.props?.children)) {
//                 return element.props.children.map(getText).join(' ');
//               }
//               if (element.props?.children) {
//                 return getText(element.props.children);
//               }
//               return '';
//             };
//             searchableValue = getText(val);
//           } catch (e) {
//             searchableValue = '[Object]'; // Fallback for complex JSX
//           }
//         } else {
//           searchableValue = String(val);
//         }
//         return searchableValue.toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   // Ensure tHead is an array before trying to use array methods on it
//   const validTHead = Array.isArray(tHead) ? tHead : [];

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <SearchIcon />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {validTHead.map((header) => (
//                   <th
//                     key={header.id}
//                     scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{
//                       backgroundColor: currentColor,
//                       width: header?.width ? `${header.width}%` : 'auto',
//                     }}
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData.map((row, index) => (
//                   <tr
//                     key={index}
//                     className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${
//                       index % 2 === 0
//                         ? "bg-white dark:bg-slate-900/50"
//                         : "bg-[#edf0f2] dark:bg-gray-700"
//                     }`}
//                   >
//                     {validTHead.map((header) => (
//                       <td
//                         key={`${index}-${header.id}`}
//                         className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left "
//                       >
//                         <div className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300">
//                             {row[header.id]}
//                         </div>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={validTHead.length || 1}
//                     className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
//                   >
//                     {searchQuery
//                       ? "No matching records found."
//                       : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile (Dynamic based on tHead) */}
//         <div className="md:hidden px-2 py-2 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto bg-slate-100 dark:bg-slate-800/50">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               // Identify special fields by common 'id' or 'label' patterns
//               const nameHeader = validTHead.find(h => h.id.toLowerCase().includes('name') || h.label.toLowerCase().includes('name'));
//               const photoHeader = validTHead.find(h => h.id.toLowerCase().includes('photo') || h.label.toLowerCase().includes('photo') || h.id.toLowerCase().includes('image') || h.label.toLowerCase().includes('image'));
//               const actionHeader = validTHead.find(h => h.id.toLowerCase().includes('action') || h.label.toLowerCase().includes('action'));

//               // Determine primary display name for the card title
//               let cardTitleValue = "N/A";
//               if (nameHeader && row[nameHeader.id]) {
//                 cardTitleValue = row[nameHeader.id];
//               } else if (validTHead.length > 0 && row[validTHead[0].id]) {
//                 // Fallback to the value of the first column in tHead if no 'name' field is found
//                 // Exclude photo or action if they are the first column
//                 const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
//                 if (firstMeaningfulHeader) cardTitleValue = row[firstMeaningfulHeader.id];
//                 else if (validTHead[0]) cardTitleValue = row[validTHead[0].id]; // Absolute fallback to first item
//               }


//               const photoValue = photoHeader ? row[photoHeader.id] : null;
//               const actionValue = actionHeader ? row[actionHeader.id] : null;

//               // Fields to display in the main details section (excluding those already handled)
//               const detailFields = validTHead.filter(header =>
//                 header.id !== nameHeader?.id && // Exclude if it was used as title, but it might not be the one chosen if nameHeader was empty
//                 header.id !== photoHeader?.id &&
//                 header.id !== actionHeader?.id &&
//                 (nameHeader ? row[nameHeader.id] !== row[header.id] : true) // A bit more complex: ensure we don't repeat the title field if it wasn't `nameHeader`
//               ).filter(header => {
//                  // Further refine: if cardTitleValue matches this header's row value, and it's not a special field, skip it
//                  if (row[header.id] === cardTitleValue && header.id !== photoHeader?.id && header.id !== actionHeader?.id) {
//                     // Check if cardTitleValue was derived from this specific header
//                     if (nameHeader && nameHeader.id === header.id) return true; // If it's the actual nameHeader, it might be shown if not used as title. This logic gets complex.
//                                                                                 // Simpler: always show if not photo/action and not strictly the selected title.
//                     if (!nameHeader && validTHead[0]?.id === header.id) return false; // If it was the first column fallback
//                     const firstMeaningfulHeader = validTHead.find(h => h.id !== photoHeader?.id && h.id !== actionHeader?.id);
//                     if (!nameHeader && firstMeaningfulHeader?.id === header.id) return false; // if it was first meaningful fallback
//                  }
//                  return true;
//               });


//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700"
//                 >
//                   {/* Top Section: Title and Actions */}
//                   <div className="flex justify-between items-start mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
//                     <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate pr-2 flex-grow">
//                       {React.isValidElement(cardTitleValue) ? cardTitleValue : String(cardTitleValue)}
//                     </h3>
//                     {actionValue && (
//                       <div className="flex-shrink-0 ml-2">
//                         {actionValue}
//                       </div>
//                     )}
//                   </div>

//                   {/* Main Content: Photo and Details */}
//                   <div className="flex">
                    
//                     <div className={`flex-grow space-y-0.5 ${!photoValue ? 'w-full' : ''}`}>
//                       {detailFields.map(header => (
//                         <InfoLine
//                           key={header.id}
//                           label={header.label}
//                           value={row[header.id]}
//                         />
//                       ))}
//                       {detailFields.length === 0 && !photoValue && (
//                         <p className="text-xs text-slate-400 italic py-2">No additional details available.</p>
//                       )}
//                     </div>
//                     {photoValue && (
//                       <div className="flex-shrink-0 w-16 h-16 mr-3 rounded overflow-hidden flex items-center justify-center">
//                         {/* Assuming photoValue is JSX like <img/>, ensure its styling is appropriate (e.g., w-full h-full object-cover) */}
//                         {photoValue}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery
//                 ? "No matching records found."
//                 : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;


// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider"; // Assuming this provides currentColor

// // const statusConfig = { ... }; // Kept for reference, not used by this specific card
// // const getStatusClasses = (feeStatus) => { ... }; // Kept for reference

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // Helper component for "Label: Value" lines in the card
// // Updated to better handle JSX values and general styling
// const InfoLine = ({ label, value, valueClassName = "", labelClassName = "text-slate-500 dark:text-slate-400", containerClassName = "" }) => (
//   <div className={`flex justify-between items-start py-0.5 ${containerClassName}`}>
//     <span className={`text-xs font-medium ${labelClassName} whitespace-nowrap mr-2`}>{label}:</span>
//     <div className={`text-xs text-slate-700 dark:text-slate-200 text-right break-words ${valueClassName}`}>
//       {value} {/* This can be a string, number, or JSX element */}
//     </div>
//   </div>
// );


// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     // Ensure tBody is an array before filtering
//     if (!Array.isArray(tBody)) return [];
//     return tBody.filter((item) => // Changed 'student' to 'item' for generality
//       Object.values(item).some((val) => {
//         if (val === null || typeof val === 'undefined') return false;
//         // If val is a React element, we might need a more sophisticated search,
//         // for now, convert to string, which might include object Object for complex JSX.
//         // A better approach for searching JSX would be to search the original data.
//         const stringVal = typeof val === 'object' ? JSON.stringify(val) : val.toString();
//         return stringVal.toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <SearchIcon />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {tHead?.map((header) => (
//                   <th
//                     key={header.id}
//                     scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{
//                       backgroundColor: currentColor,
//                       width: header?.width ? `${header.width}%` : 'auto', // Assuming width is a percentage
//                     }}
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData?.map((row, index) => (
//                   <tr
//                     key={index}
//                     className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${
//                       index % 2 === 0
//                         ? "bg-white dark:bg-slate-900/50"
//                         : "bg-[#edf0f2] dark:bg-gray-700"
//                     }`}
//                   >
//                     {tHead.map((header) => (
//                       <td
//                         key={`${index}-${header.id}`}
//                         className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left "
//                       >
//                         {/* Check if row[header.id] is a valid React element or renderable */}
//                         {React.isValidElement(row[header.id]) || typeof row[header.id] === 'string' || typeof row[header.id] === 'number' ? (
//                             <div className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300">
//                                 {row[header.id]}
//                             </div>
//                         ) : (
//                             <p className="block text-sm font-normal leading-none text-slate-500 italic">
//                                 Invalid data
//                             </p>
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={tHead?.length || 1}
//                     className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
//                   >
//                     {searchQuery
//                       ? "No matching records found."
//                       : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile */}
//         <div className="md:hidden px-2 py-2 space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               // Assuming `row` contains keys like: SN, photo, employeeID, name, email, class, section, contact, joiningDate, action
//               // And `row.photo`, `row.employeeID`, `row.action` can be JSX elements as per your tBody mapping.
//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-3 border border-slate-200 dark:border-slate-700"
//                 >
//                   {/* Top Section: Name and Actions */}
//                   <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-600">
//                     <h3 className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate pr-2">
//                       {row.name || "N/A"}
//                     </h3>
//                     <div className="flex-shrink-0">
//                       {row.action} {/* This is expected to be JSX (e.g., a div with icons) */}
//                     </div>
//                   </div>

//                   {/* Main Content: Photo and Details */}
//                   <div className="flex">
//                     {/* Left: Photo */}
//                     {row.photo && (
//                       <div className="flex-shrink-0 w-14 h-14 mr-3">
//                         {/* row.photo is already an <img> element or similar JSX.
//                             Ensure its internal classes make it fit this container, e.g., w-full h-full object-cover */}
//                         {row.photo}
//                       </div>
//                     )}

//                     {/* Right: Details */}
//                     <div className="flex-grow space-y-0.5">
//                       <InfoLine label="S No." value={row.SN} />
//                       {/* employeeID might already be styled (e.g., green text) from your tBody mapping */}
//                       <InfoLine label="Emp. ID" value={row.employeeID} />
//                       <InfoLine label="Email" value={row.email} />
//                       <InfoLine label="Class Teacher" value={row.class} />
//                       <InfoLine label="Section" value={row.section} />
//                       <InfoLine label="Contact" value={row.contact} />
//                       <InfoLine label="Joining Date" value={row.joiningDate} />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery
//                 ? "No matching records found."
//                 : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;



// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider";

// // const statusConfig = { ... }; // Kept for reference or other uses, but not for this specific card's bg/text
// // const getStatusClasses = (feeStatus) => { ... }; // Kept for reference

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // Icon for the edit button on the card
// const EditPencilIcon = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//         <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//     </svg>
// );

// // Helper component for "Label: Value" lines
// const InfoLine = ({ label, value, valueClassName = "", labelClassName = "", containerClassName = "" }) => (
//   <p className={`text-sm ${containerClassName}`}>
//     <span className={`text-slate-500 dark:text-slate-400 ${labelClassName}`}>{label}: </span>
//     <span className={`font-medium text-slate-700 dark:text-slate-200 ${valueClassName}`}>
//       {value}
//     </span>
//   </p>
// );

// // Helper component for "Label:" on one line and "Value" on the next
// const InfoBlock = ({ label, value, valueClassName = "", labelClassName = "", containerClassName = "" }) => (
//   <div className={containerClassName}>
//     <p className={`text-sm text-slate-500 dark:text-slate-400 ${labelClassName}`}>{label}:</p>
//     <p className={`text-sm font-medium text-slate-700 dark:text-slate-200 ${valueClassName}`}>{value}</p>
//   </div>
// );


// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     return tBody?.filter((student) =>
//       Object.values(student).some((val) => {
//         if (!val) return false;
//         return val.toString().toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <SearchIcon />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {tHead?.map((header) => (
//                   <th
//                     key={header.id}
//                     scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{
//                       backgroundColor: currentColor,
//                       width: header?.width,
//                     }}
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData?.map((row, index) => (
//                   <tr
//                     key={index}
//                     className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${
//                       index % 2 === 0
//                         ? "bg-white dark:bg-slate-900/50" // Adjusted dark mode for better contrast with dark text
//                         : "bg-[#edf0f2] dark:bg-gray-700"
//                     }`}
//                   >
//                     {tHead.map((header) => (
//                       <td
//                         key={`${index}-${header.id}`}
//                         className="px-2 py-[2px] border-b border-slate-200 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left "
//                       >
//                         <p className="block text-sm font-normal leading-none text-slate-600 dark:text-slate-300">
//                           {row[header.id]}
//                         </p>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={tHead?.length || 1}
//                     className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
//                   >
//                     {searchQuery
//                       ? "No matching records found."
//                       : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile */}
//         <div className="md:hidden px-4 py-2 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               // Adapt these keys to your actual `row` object structure, typically matching `header.id` from `tHead`
//               const name = row.name || row.studentName || "N/A";
//               const studentClass = row.class || row.className || row.classVal || "N/A";
//               const rollNo = row.rollNo || "N/A";
//               const admNo = row.admNo || "N/A";
//               const fatherName = row.fatherName || "N/A";
//               const mobileNo = row.mobileNo || "N/A";
//               const dob = row.dob || "N/A";
//               const address = row.address || "N/A";
//               // Use a real image URL from your data or a default placeholder
//               const profileImage = row.profileImage || row.avatar || "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";
//               const isAdmin = row.isAdmin || false; // Assuming an 'isAdmin' field in your row data

//               return (
//                 <div
//                   key={index}
//                   className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700"
//                 >
//                   {/* Header: Name, Admin Badge, Edit Icon */}
//                   <div className="flex justify-between items-start mb-3">
//                     <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-tight">
//                       Name: {name}
//                     </h2>
//                     <div className="flex items-center space-x-2 flex-shrink-0">
//                       {isAdmin && (
//                         <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-red-500 text-white">
//                           Admin
//                         </span>
//                       )}
//                       <button className="p-0.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500">
//                         <EditPencilIcon />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Main Content: Details and Image */}
//                   <div className="flex">
//                     {/* Left Column: Details */}
//                     <div className="flex-grow space-y-1.5 pr-2">
//                       <InfoLine label="Class" value={studentClass} />
//                       <InfoLine label="Roll No" value={rollNo} />
//                       <InfoLine
//                         label="Adm No"
//                         value={admNo}
//                         valueClassName={admNo === "DI1168" ? "text-red-500 font-semibold" : (admNo && admNo.toString().startsWith("DI") ? "font-semibold" : "")}
//                       />
//                       <InfoLine label="Father Name" value={fatherName} />
//                       <InfoBlock label="Mobile No" value={mobileNo} />
//                       <InfoLine label="DOB" value={dob} />
//                       <InfoBlock label="Address" value={address} />
//                     </div>

//                     {/* Right Column: Image */}
//                     <div className="flex-shrink-0 pl-2 sm:pl-3 self-start">
//                       <img
//                         src={profileImage}
//                         alt={name}
//                         className="w-24 h-auto max-h-28 object-contain rounded border border-cyan-400 dark:border-cyan-600 p-px bg-white" // bg-white for transparent images
//                       />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery
//                 ? "No matching records found."
//                 : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;



// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider";

// const statusConfig = {
//   Paid: {
//     bg: "bg-green-50 dark:bg-green-900/30",
//     text: "text-green-700 dark:text-green-300",
//     indicator: "bg-green-500",
//   },
//   Unpaid: {
//     bg: "bg-red-50 dark:bg-red-900/30",
//     text: "text-red-700 dark:text-red-400",
//     indicator: "bg-red-500",
//   },
//   Partial: {
//     bg: "bg-yellow-50 dark:bg-yellow-900/30",
//     text: "text-yellow-700 dark:text-yellow-400",
//     indicator: "bg-yellow-500",
//   },
//   Default: {
//     bg: "bg-white dark:bg-gray-800",
//     text: "text-gray-700 dark:text-gray-300",
//     indicator: "bg-gray-400",
//   },
// };

// const getStatusClasses = (feeStatus) => {
//   return statusConfig[feeStatus] || statusConfig.Default;
// };

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();

//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     return tBody?.filter((student) =>
//       Object.values(student).some((val) => {
//         if (!val) return false;
//         return val.toString().toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   return (
//     <div className="w-full mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <SearchIcon />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 value={searchQuery}
//                 className="block w-full pl-9 pr-3 py-1 text-sm text-slate-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600"
//               />
//             </div>
//           )}
//         </header>

//         {/* TABLE view (md and up) */}
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] hidden md:block">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10">
//               <tr>
//                 {tHead?.map((header) => (
//                   <th
//                     key={header.id}
//                     scope="col"
//                     className="py-3 px-[2px] text-start text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
//                     style={{
//                       backgroundColor: currentColor,
//                       width: header?.width,
//                     }}
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData?.map((row, index) => (
//                   <tr
//                     key={index}
//                     className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125 ${
//                       index % 2 === 0
//                         ? "bg-white"
//                         : "bg-[#edf0f2] dark:bg-gray-700"
//                     }`}
//                   >
//                     {tHead.map((header) => (
//                       <td
//                         key={`${index}-${header.id}`}
//                         className="px-2 py-[2px] border-b border-blue-800 dark:border-gray-600 align-middle text-xs whitespace-nowrap text-left text-blueGray-700"
//                       >
//                         <p className="block text-sm font-normal leading-none text-slate-500">
//                           {row[header.id]}
//                         </p>
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan={tHead.length}
//                     className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
//                   >
//                     {searchQuery
//                       ? "No matching records found."
//                       : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* CARD view for mobile */}
//         {/* <div className="md:hidden px-4 py-2 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               const statusClasses = getStatusClasses(row.feeStatus);
//               return (
//                 <div
//                   key={index}
//                   className={`rounded-md shadow-sm p-4 ${statusClasses.bg} ${statusClasses.text} border border-gray-200 dark:border-slate-600`}
//                 >
//                   {tHead.map((header) => (
//                     <div key={header.id} className="mb-1">
//                       <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
//                         {header.label}
//                       </div>
//                       <div className="text-sm font-medium">
//                         {row[header.id] ?? "—"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery
//                 ? "No matching records found."
//                 : "No data available in table."}
//             </div>
//           )}
//         </div> */}
//         <div className="md:hidden px-4 py-2 space-y-4 max-h-[calc(100vh-210px)] overflow-y-auto">
//           {filteredData?.length > 0 ? (
//             filteredData.map((row, index) => {
//               const statusClasses = getStatusClasses(row.feeStatus);
//               return (
//                 <div
//                   key={index}
//                   className={`rounded-md shadow-sm p-4 ${statusClasses.bg} ${statusClasses.text} border border-gray-200 dark:border-slate-600`}
//                 >
//                   {tHead.map((header) => (
//                     <div
//                       key={header.id}
//                       className="flex justify-between items-center py-1 border-b last:border-none"
//                     >
//                       <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
//                         {header.label}
//                       </span>
//                       <span
//                         className={`text-sm font-medium text-right ${
//                           header.id === "name"
//                             ? "text-teal-600 dark:text-teal-400"
//                             : header.id === "class"
//                             ? "text-purple-600 dark:text-purple-400"
//                             : ""
//                         }`}
//                       >
//                         {row[header.id] ?? "—"}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center text-sm text-slate-500 dark:text-slate-400 italic py-8">
//               {searchQuery
//                 ? "No matching records found."
//                 : "No data available in table."}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;

// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider";

// const statusConfig = {
//   Paid: {
//     bg: "bg-green-50 dark:bg-green-900/30",
//     text: "text-green-700 dark:text-green-300",
//     indicator: "bg-green-500",
//   },
//   Unpaid: {
//     bg: "bg-red-50 dark:bg-red-900/30",
//     text: "text-red-700 dark:text-red-400",
//     indicator: "bg-red-500",
//   },
//   Partial: {
//     bg: "bg-yellow-50 dark:bg-yellow-900/30",
//     text: "text-yellow-700 dark:text-yellow-400",
//     indicator: "bg-yellow-500",
//   },
//   // Default style for rows without a specific status or if status is unknown
//   Default: {
//     bg: "bg-white dark:bg-gray-800",
//     text: "text-gray-700 dark:text-gray-300",
//     indicator: "bg-gray-400",
//   },
// };
// const getStatusClasses = (feeStatus) => {
//   return statusConfig[feeStatus] || statusConfig.Default;
// };

// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500" // Slightly smaller icon
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { currentColor } = useStateContext();
//   const filteredData = useMemo(() => {
//     if (!searchQuery) return tBody;
//     const lower = searchQuery.toLowerCase();
//     return tBody?.filter((student) =>
//       Object.values(student).some((val) => {
//         if (!val) return false;
//         return val.toString().toLowerCase().includes(lower);
//       })
//     );
//   }, [searchQuery, tBody]);

//   return (
//     <div className="w-full  mx-auto">
//       <div
//         className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//         style={{ borderTop: `3px solid ${currentColor}` }}
//       >
//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2
//             className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//             style={{ color: currentColor }}
//           >
//             {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
//                 <SearchIcon />
//               </div>

//               <input
//                 type="text"
//                 placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 value={searchQuery}
//                 className="
//                   block w-full pl-9 pr-3 py-1
//                   text-sm text-slate-700 dark:text-slate-300
//                   bg-gray-200 dark:bg-slate-700
//                   border border-slate-300 dark:border-slate-600
//                   rounded-md shadow-sm
//                   placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none
//                   focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600
//                 "
//               />
//             </div>
//           )}
//         </header>
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)]">
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10 ">
//               <tr>
//                 {tHead?.map((header) => (
//                   <th
//                     key={header.id}
//                     scope="col" // Important for accessibility
//                     className={`
//                      py-3 px-[2px]
//                       text-start text-xs font-semibold // Adjusted font weight/size
//                       text-white uppercase tracking-wider // Style for header text
//                       whitespace-nowrap
//                     `}
//                     // Apply the dynamic background color from context
//                     style={{
//                       backgroundColor: currentColor,
//                       width: header?.width,
//                     }}
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData?.map((row, index) => {
//                   // Get the appropriate style classes based on the row's feeStatus
//                   const statusClasses = getStatusClasses(row.feeStatus);

//                   return (
//                     <tr
//                       key={index}
//                       className={`transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125
//   ${index % 2 === 0 ? "bg-white" : "bg-[#edf0f2] dark:bg-gray-700"}`}
//                     >
//                       {tHead.map((header) => (
//                         <td
//                           key={`${index}-${header.id}`}
//                           className=" px-2 py-[2px]   border-b-1 border-blue-800 dark:border-gray-600  align-middle  text-xs whitespace-nowrap text-left text-blueGray-700"
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
//                     colSpan={tHead.length} // Span across all columns
//                     className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
//                   >
//                     {searchQuery
//                       ? "No matching records found."
//                       : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Table;
// import React, { useState, useMemo } from "react";
// import { useStateContext } from "../contexts/ContextProvider";
// import { ReactInput } from "./ReactInput/ReactInput"; // Assuming this is a styled input component
// import { Link } from "react-router-dom";

// // --- Configuration for Status Styling (Softer Look & Better Contrast) ---
// // Provides background, text color, and an optional indicator color for each status.
// // Includes dark mode variants.
// const statusConfig = {
//   Paid: {
//     bg: "bg-green-50 dark:bg-green-900/30", // Very light green background
//     text: "text-green-700 dark:text-green-300", // Darker green text for contrast
//     indicator: "bg-green-500", // Solid green for potential dot indicator
//   },
//   Unpaid: {
//     bg: "bg-red-50 dark:bg-red-900/30",
//     text: "text-red-700 dark:text-red-400",
//     indicator: "bg-red-500",
//   },
//   Partial: {
//     bg: "bg-yellow-50 dark:bg-yellow-900/30",
//     text: "text-yellow-700 dark:text-yellow-400",
//     indicator: "bg-yellow-500",
//   },
//   // Default style for rows without a specific status or if status is unknown
//   Default: {
//     bg: "bg-white dark:bg-gray-800",
//     text: "text-gray-700 dark:text-gray-300",
//     indicator: "bg-gray-400",
//   },
// };

// // --- Helper Function to Get Styling Classes ---
// const getStatusClasses = (feeStatus) => {
//   // Return the specific status config or the default if not found
//   return statusConfig[feeStatus] || statusConfig.Default;
// };

// // --- Search Icon Component ---
// // Simple SVG icon for the search input.
// const SearchIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="h-4 w-4 text-gray-400 dark:text-gray-500" // Slightly smaller icon
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//     strokeWidth={2}
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//     />
//   </svg>
// );

// // --- The Table Component ---
// const Table = ({ tHead, tBody, isSearch = true, title = "Data Records" }) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   // Use context for the primary color (e.g., for the header background)
//   const { currentColor } = useStateContext();
// // const [studentList, setStudentList] = useState([]);
//   const filteredData = useMemo(() => {
//   if (!searchQuery) return tBody;

//   const lower = searchQuery.toLowerCase();

//   return tBody?.filter((student) =>
//     Object.values(student).some((val) => {
//       if (!val) return false;
//       return val.toString().toLowerCase().includes(lower);
//     })
//   );
// }, [searchQuery, tBody]);

//   // const filteredData = useMemo(() => {
//   //   if (!searchQuery) {
//   //     return tBody; // No search query? Return all data.
//   //   }
//   //   const lowerCaseQuery = searchQuery.toLowerCase();
//   //   // Filter rows where at least one cell (corresponding to a header) includes the search query.
//   //   return tBody.filter((row) =>
//   //     tHead.some((header) => {
//   //       const cellValue = row[header.id];
//   //       // Check if cellValue exists and can be converted to string before searching
//   //       return cellValue != null && // Check for null or undefined
//   //              cellValue.toString().toLowerCase().includes(lowerCaseQuery);
//   //     })
//   //   );
//   // }, [tBody, tHead, searchQuery]); // Recalculate only if these change

//   return (

//     <div className="w-full  mx-auto"

//     >

//       <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
//        style={{borderTop:`3px solid ${currentColor}`}}>

//         <header className="px-5 py-1 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm uppercase"
//           style={{color:currentColor}}

//           >

//          {title}
//           </h2>
//           {isSearch && (
//             <div className="relative w-full sm:w-64">

//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
//                 <SearchIcon />
//               </div>

//               <input
//                 type="text"
//                 placeholder="Search table..."
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 value={searchQuery}
//                 className="
//                   block w-full pl-9 pr-3 py-1
//                   text-sm text-slate-700 dark:text-slate-300
//                   bg-gray-200 dark:bg-slate-700
//                   border border-slate-300 dark:border-slate-600
//                   rounded-md shadow-sm
//                   placeholder-slate-400 dark:placeholder-slate-500 outline-none border-none
//                   focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-600
//                 "
//               />

//             </div>
//           )}
//         </header>
//         <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)]"> {/* Adjusted max-height */}
//           <table className="table-auto w-full min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead className="sticky top-0 z-10 ">
//               <tr>
//                 {tHead?.map((header) => (
//                   <th
//                     key={header.id}
//                     scope="col" // Important for accessibility
//                     className={`
//                      py-3 px-[2px]
//                       text-start text-xs font-semibold // Adjusted font weight/size
//                       text-white uppercase tracking-wider // Style for header text
//                       whitespace-nowrap
//                     `}
//                     // Apply the dynamic background color from context
//                     style={{ backgroundColor: currentColor ,width:header?.width,}}
//                   >
//                     {header.label}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
//               {filteredData?.length > 0 ? (
//                 filteredData?.map((row, index) => {
//                   console.log("row",row)
//                   // Get the appropriate style classes based on the row's feeStatus
//                   const statusClasses = getStatusClasses(row.feeStatus);

//                   return (
//                     <tr
//                       key={index}
//                       className={
//   `transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125

//   ${index % 2 === 0 ? "bg-white" : "bg-[#edf0f2] dark:bg-gray-700"}`
// }
//                       // className={`${index % 2 === 0 ? "bg-white " : "bg-gray-200 dark:bg-gray-700 "}  border-b-4 border-red-300 dark:border-gray-600 transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125`}
//                       // className={`${statusClasses.bg} transition-colors duration-150 ease-in-out hover:bg-opacity-80 hover:brightness-95 dark:hover:brightness-125`}
//                     >

// {tHead.map((header) => (
//                         <td
//                           key={`${index}-${header.id}`}
//                           className=" px-2 py-[2px]   border-b-1 border-blue-800 dark:border-gray-600  align-middle  text-xs whitespace-nowrap text-left text-blueGray-700"
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
//                 /* --- Row for No Results --- */
//                 <tr>
//                   <td
//                     colSpan={tHead.length} // Span across all columns
//                     className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic"
//                   >
//                     {/* Show different message based on whether it's no data or no search results */}
//                     {searchQuery ? "No matching records found." : "No data available in table."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div> {/* End Scrollable Container */}
//       </div> {/* End Card Container */}
//     </div> // End Outer Container
//   );
// };

// export default Table;

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
