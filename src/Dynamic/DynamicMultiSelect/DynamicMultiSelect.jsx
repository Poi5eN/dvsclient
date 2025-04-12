// import React from "react";
// import { MultiSelect } from "primereact/multiselect";
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Choose your theme
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';
// // Add primeflex if you use its classes like w-full
// // import 'primeflex/primeflex.css';

// const DynamicMultiSelect = (props) => {
//   const {
//     dynamicOptions,
//     value,
//     // Rename the prop from parent for clarity inside this component
//     onChange: parentOnChange,
//     placeholderName,
//     requiredClassName,
//     disabled,
//     name, // Keep name if needed for form identification
//     respclass // Class for the outer div
//   } = props;

//   // --- Truncate and Item Template (No changes needed here) ---
//    const isMobile = window.innerWidth <= 768;
//    const truncate = (str, maxLength = 20) => { // Default maxLength
//     // Ensure str is a string before trying to access length or substring
//      if (typeof str !== 'string') return str;
//      if (str.length > maxLength) {
//        return isMobile ? str : str.substring(0, maxLength) + "...";
//      }
//      return str;
//    };

//    const itemTemplate = (option) => {
//      // Make sure option and option.name exist before truncating
//      return <div>{option ? truncate(option.name) : ''}</div>;
//    };
//   // --- End Truncate and Item Template ---


//   // Internal handler for PrimeReact's onChange event
//   const handlePrimeChange = (event) => {
//     // 'event.value' contains the array of the *full* selected option objects
//     const selectedOptionsArray = event.value;

//     // Call the parent's onChange handler, passing ONLY the array of selected options
//     if (parentOnChange) {
//       parentOnChange(selectedOptionsArray);
//     }
//   };

//   return (
//     <div className={respclass || ""}> {/* Use respclass or default */}
//       <div className="form-controls mb-2">
//         <MultiSelect
//           filter
//           value={value} // Expects an array of FULL option objects from dynamicOptions
//           onChange={handlePrimeChange} // Use the wrapper handler
//           options={dynamicOptions} // Array of FULL option objects
//           optionLabel="name" // Tells MultiSelect to display the 'name' property
//           // IMPORTANT: DO NOT set optionValue if you want value/onChange to use full objects
//           // optionValue="code" // <--- REMOVE or COMMENT OUT this line if present
//           placeholder={placeholderName || "Select..."}
//           maxSelectedLabels={3}
//           // Use w-full for PrimeFlex or Tailwind for full width
//           className={`w-full ${requiredClassName ? "required-fields" : ""}`}
//           // name={name} // Include if required for form libraries
//           itemTemplate={itemTemplate}
//           disabled={disabled}
//           display="chip" // Optional: Show selections as chips
//           // panelClassName="your-custom-panel-class" // Optional: for dropdown styling
//         />
//       </div>
//     </div>
//   );
// };

// export default DynamicMultiSelect;


// // import React from "react";
// // import { MultiSelect } from "primereact/multiselect";

// // const DynamicMultiSelect = (props) => {
// //   const {
// //     respclass,
// //     dynamicOptions,
// //     value,
// //     handleChange,
// //     name,
// //     placeholderName,
// //     requiredClassName,
// //     disabled,
// //   } = props;
// //   const isMobile = window.innerWidth <= 768;


// //   const truncate = (str, maxLength) => {
// //     if (str?.length > maxLength) {
// //       return isMobile ? str : str?.substring(0, maxLength) + "...";
// //     }
// //     return str;
// //   };

// //   const itemTemplate = (option) => {
// //     return <div>{truncate(option.name, 20)}</div>;
// //   };

// //   return (
// //     <div className={respclass}>
// //       <div className="form-controls mb-2">

// //         <MultiSelect
// //           filter
// //           value={value}
// //           onChange={handleChange} // Passing the field name and value
// //           options={dynamicOptions}
// //           optionLabel="name"
// //           placeholder={placeholderName}
// //           maxSelectedLabels={3}
// //           className={`multiselect ${requiredClassName ? "required-fields" : ""}`}
// //           name={name}
// //           closeIcon
// //           itemTemplate={itemTemplate}
// //           disabled={disabled}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default DynamicMultiSelect;



// // import React from 'react';
// // import { MultiSelect } from 'primereact/multiselect';

// // function DynamicMultiSelect({
// //     value,
// //     onChange,
// //     options,
// //     optionLabel,
// //     placeholder = "Select...",
// //     className
// // }) {
// //     return (
// //         <div className={`dynamic-multiselect-container ${className}`}>
// //             <MultiSelect
// //                 value={value}
// //                 onChange={onChange}
// //                 options={options}
// //                 optionLabel={optionLabel}
// //                 placeholder={placeholder}
// //                 maxSelectedLabels={3}
// //                 className="w-full md:w-20rem"
// //             />
// //         </div>
// //     );
// // }
// // export default DynamicMultiSelect;