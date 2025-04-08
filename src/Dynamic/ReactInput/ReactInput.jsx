import './Index.css';

export function ReactInput({
  label,
  name,
  required,
  type = "text",
  maxLength,
  disabled,
  onChange,
  value = "",
  readOnly,
  placeholder,
}) {
  return (
    <div className="containerr inline-block mr-1">
      <div className="did-floating-label-content ">
        <input
          className={`did-floating-input ${value ? "has-value" : ""} ${required ?"border-b-[#ff0000] ":""}`}
          readOnly={readOnly}
          value={value}
          type={type}
          name={name}
          required={required}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
          id={name}
          placeholder={placeholder}
        />
        <label className="did-floating-label">{label}</label>
      </div>
    </div>
  );
}


// import { Input } from "@material-tailwind/react";
 
// export function ReactInput({
//     label,
//     name,
//     required,
//     type,
//     maxLength,
//     disabled,
//     required_field,
//     onChange,

//     staticwidth,
//     id,
//     placeholder,
//     // value = "" 
//     readOnly,
//     resPClass,
//    value
//   }) {
//   return (
//     // <div className="inline-block">
//       <div
//     //  className="w-72"
//     // className="md:w-60"
    
//   // className={`${resPClass} `}
//   // className="grid grid-cols-2 md:grid-cols-5 gap-4 "
//      >
//       <Input
//       readOnly={readOnly}
//       // value={value || ""} 
//       value={value}
//       label={label}
//        type={type}
//        name={name}
//        required={required}
//        onChange={onChange}
//        // max={10}
//        // min={3}
//        maxLength={maxLength}
//        disabled={disabled ? disabled : false}
//        id={name}
//        placeholder={placeholder}
//        className={`grid-cols-2  ${required ? '!border-b-red-500 !border-b-2 focus:!border-b-red-500 focus:outline-none' : 'focus:outline-none'}`} // Add class to style the bottom border
//        />
//     </div>
//     // </div>
//   );
// }


// import React from "react";
// import { useStateContext } from "../contexts/ContextProvider";
// const Input = ({
//   label,
//   name,
//   required,
//   type,
//   maxLength,
//   disabled,
//   required_field,
//   onChange,
//   staticwidth,
//   id,
//   placeholder
// }) => {
//   const { currentColor } = useStateContext();
//   // console.log("width",staticwidth)
//   return (

//     // <div class="relative bg-inherit">
//     //   <input
//     //    type="text"
//     //     id="username"
//     //      name="username"
//     //     class="peer bg-transparent h-10 w-72 rounded-lg text-gray-200 placeholder-transparent ring-2 px-2 ring-gray-500 focus:ring-sky-600 focus:outline-none focus:border-rose-600"
//     //     placeholder="Type inside me"
//     //   />
//     //   <label 
//     //   for="username"
//     //    class="absolute cursor-text left-0 -top-3 text-sm text-gray-500 bg-inherit mx-1 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-sky-600 peer-focus:text-sm transition-all">
//     //     Type inside me</label>
//     // </div>
   

//  <div class="relative bg-inherit mt-[2px]">
//       <input
//         className={`peer bg-transparent h-8 w-full  text-black placeholder-transparent ring-1 px-2  outline-none  ${
//         // className={`peer bg-transparent h-10 w-full  text-black placeholder-transparent ring-1 px-2 ring-gray-500  outline-none  ${
//           required_field ? "border-b-2 border-b-red-600" : ""
//         }`}
//         // onFocus={(e) => (e.target.style.borderColor = currentColor)}
//         // onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//         // placeholder=" "
//         type={type}
//         name={name}
//         required={required}
//         onChange={onChange}
//         // max={10}
//         // min={3}
//         maxLength={maxLength}
//         disabled={disabled ? disabled : false}
//         id={name}
//         placeholder={placeholder}
        
//       />
     
//       <label 
//       for={name}
//        class="absolute cursor-text left-0 -top-3 text-sm text-gray-500 bg-inherit mx-1 px-1 peer-placeholder-shown:text-[10px] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-[5.6px] peer-focus:-top-3 peer-focus:text-black peer-focus:text-[10px] transition-all"
//       //  class="absolute cursor-text left-0 -top-3 text-sm text-black bg-inherit mx-1 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-sky-600 peer-focus:text-sm transition-all"
//        >
//       {placeholder}
//       </label>
//     </div> 
//   );
// };

// export default Input;