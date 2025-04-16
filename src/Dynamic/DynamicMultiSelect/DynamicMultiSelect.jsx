import React from "react";
import { MultiSelect } from "primereact/multiselect";
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Choose your theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// Add primeflex if you use its classes like w-full
// import 'primeflex/primeflex.css';

const DynamicMultiSelect = (props) => {
    const {
        respclass,
        dynamicOptions,
        value,
        handleChange,
        name,
        placeholderName,
        requiredClassName,
        disabled,
      } = props;
      const isMobile = window.innerWidth <= 768;
  // --- Truncate and Item Template (No changes needed here) ---
  const truncate = (str, maxLength) => {
    if (str?.length > maxLength) {
      return isMobile ? str : str?.substring(0, maxLength) + "...";
    }
    return str;
  };

  const itemTemplate = (option) => {
    return <div>{truncate(option.name, 20)}</div>;
  };

  return (
    <div className={respclass || ""}> {/* Use respclass or default */}
      <div className="form-controls mb-2">
      <MultiSelect
          filter
          value={value}
          onChange={(e) => handleChange(name, e.value)} // Passing the field name and value
          options={dynamicOptions}
          optionLabel="name"
          placeholder={placeholderName}
          maxSelectedLabels={3}
          className={`multiselect ${requiredClassName ? "required-fields" : ""}`}
          name={name}
          closeIcon
          itemTemplate={itemTemplate}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default DynamicMultiSelect;


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