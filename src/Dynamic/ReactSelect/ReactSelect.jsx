import React from "react";
import "./Index.css";

export function ReactSelect({
  label,
  dynamicOptions,
  value,
  handleChange,
  name,
  required,
}) {
  // Custom event handler to normalize React event
  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;

    handleChange({
      target: {
        name: name,
        value: selectedValue,
      },
    });
  };

  return (
    <div className="did-floating-label-content inline-block px-1 min-w-[170px] ">
      <select
        className={`did-floating-select ${value ? "has-value" : ""}`}
        name={name}
        value={value}
        onChange={handleSelectChange}
        required={required}
        style={{ borderBottom: required? "1px solid red" : "" }}
      >
        <option value="" disabled>
          {label}
        </option>
        {dynamicOptions?.map((option, index) => (
          <option key={index} value={option?.value}>
            {option?.label}
          </option>
        ))}
      </select>

      <label className="did-floating-label">{label}</label>
    </div>
  );
}



// import React from "react";
// import './index.css'
// export function ReactSelect({ label, dynamicOptions, value, handleChange, name,required }) {

//   const handleSelectChange = (selectedValue) => {
//     const event = {
//       target: {
//         name: name,
//         value: selectedValue, 
//       },
//     };

//     handleChange(event); 
//   };

//   return (
//     <div class="did-floating-label-content"
   
//      >
      
//       <select class="did-floating-select" 
//         label={label}
//         value={value}
//         name={name}
//         onChange={handleSelectChange}
//         style={{ borderBottom: required ? "2px solid red" : "" }}

//       >
//         {dynamicOptions?.map((option, index) => (
//            <option key={index} value={option?.value}>
//             {option?.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }


// <div class="did-floating-label-content">
//   <select class="did-floating-select" onclick="this.setAttribute('value', this.value);" onchange="this.setAttribute('value', this.value);" value="">
//     <option value=""></option>
//     <option value="1">Alabama</option>
//     <option value="2">Boston</option>
//     <option value="3">Ohaio</option>
//     <option value="4">New York</option>
//     <option value="5">Washington</option>
//   </select>
//   <label class="did-floating-label">Select</label>
// </div>
// import React, { useState } from "react";
// import { Select, Option } from "@material-tailwind/react";

// export function ReactSelect({ label, dynamicOptions, value, handleChange, name,required }) {

//   const handleSelectChange = (selectedValue) => {
//     // Create a synthetic event object that mimics a standard HTML select event
//     const event = {
//       target: {
//         name: name, // Use the name prop passed to the component
//         value: selectedValue, // The selected value from the Select component
//       },
//     };

//     handleChange(event); // Call the parent's handleChange function with the synthetic event
//   };

//   return (
//     <div
//     //  className="w-72 "
//     //  className="md:max-w-60"
//     // style={{width:"150px"}}
//      >
      
//       <Select
//       // style={{width:"50px"}}
//         label={label}
//         value={value}
//         name={name}
//         onChange={handleSelectChange}
//         style={{ borderBottom: required ? "2px solid red" : "" }}

//       >
//         {dynamicOptions?.map((option, index) => (
//           <Option key={index} value={option?.value}>
//             {option?.label}
//           </Option>
//         ))}
//       </Select>
//     </div>
//   );
// }


// import React, { useState } from "react";
// import { Select, Option } from "@material-tailwind/react";

// export function ReactSelect({ label, dynamicOptions,value,handleChange,name }) {
  

//   return (
//     <div className="w-72 ">
//       <Select
//         label={label}
//         value={value}
//         name={name}
//         // value={selectedValue}
//         onChange={handleChange}
//         // onChange={(value) => setSelectedValue(value)}
//       >
//         {dynamicOptions?.map((option, index) => (
//           <Option key={index} value={option?.value}>
//             {option?.label}
//           </Option>
//         ))}
//       </Select>
//     </div>
//   );
// }

// import { Select, Option } from "@material-tailwind/react";

// export function ReactSelect({ label, options }) {
//   return (
//     // <div className="w-72 my-4">
//     //   <Select label={label}>
//     //     {options.map((option, index) => (
//     //       <Option key={index}
//     //       value={option.value}
//     //       >{option.label}</Option>
//     //     ))}
//     //   </Select>
//     // </div>
//     <div className="w-72 my-4">
//     <Select label={label}>
//       {options.map((option, index) => (
//         <Option key={index}>{option.label}</Option>
//       ))}
//     </Select>
//   </div>
//   );
// }


// import { Select, Option } from "@material-tailwind/react";
 
// export function ReactSelect() {
//   return (
//     <div className="w-72">
//       <Select label="Select Version">
//         <Option>Material Tailwind HTML</Option>
//         <Option>Material Tailwind React</Option>
//         <Option>Material Tailwind Vue</Option>
//         <Option>Material Tailwind Angular</Option>
//         <Option>Material Tailwind Svelte</Option>
//       </Select>
//     </div>
//   );
// }