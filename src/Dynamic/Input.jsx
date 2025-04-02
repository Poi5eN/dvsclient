import React from "react";
import { useStateContext } from "../contexts/ContextProvider";
const Input = ({
  label,
  name,
  required,
  type,
  maxLength,
  disabled,
  required_field,
  onChange,
  staticwidth,
  id,
  placeholder
}) => {
  const { currentColor } = useStateContext();
  // console.log("width",staticwidth)
  return (

    // <div class="relative bg-inherit">
    //   <input
    //    type="text"
    //     id="username"
    //      name="username"
    //     class="peer bg-transparent h-10 w-72 rounded-lg text-gray-200 placeholder-transparent ring-2 px-2 ring-gray-500 focus:ring-sky-600 focus:outline-none focus:border-rose-600"
    //     placeholder="Type inside me"
    //   />
    //   <label 
    //   for="username"
    //    class="absolute cursor-text left-0 -top-3 text-sm text-gray-500 bg-inherit mx-1 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-sky-600 peer-focus:text-sm transition-all">
    //     Type inside me</label>
    // </div>
   

 <div class="relative bg-inherit mt-[2px]">
      <input
        className={`peer bg-transparent h-8 w-full  text-black placeholder-transparent ring-1 px-2  outline-none  ${
        // className={`peer bg-transparent h-10 w-full  text-black placeholder-transparent ring-1 px-2 ring-gray-500  outline-none  ${
          required_field ? "border-b-2 border-b-red-600" : ""
        }`}
        // onFocus={(e) => (e.target.style.borderColor = currentColor)}
        // onBlur={(e) => (e.target.style.borderColor = "#ccc")}
        // placeholder=" "
        type={type}
        name={name}
        required={required}
        onChange={onChange}
        // max={10}
        // min={3}
        maxLength={maxLength}
        disabled={disabled ? disabled : false}
        id={name}
        placeholder={placeholder}
        
      />
     
      <label 
      for={name}
       class="absolute cursor-text left-0 -top-3 text-sm text-gray-500 bg-inherit mx-1 px-1 peer-placeholder-shown:text-[10px] peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-[5.6px] peer-focus:-top-3 peer-focus:text-black peer-focus:text-[10px] transition-all"
      //  class="absolute cursor-text left-0 -top-3 text-sm text-black bg-inherit mx-1 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-sky-600 peer-focus:text-sm transition-all"
       >
      {placeholder}
      </label>
    </div> 
  );
};

export default Input;
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
//         className={`peer bg-transparent h-8 w-full  text-black placeholder-transparent ring-1 px-2 ring-gray-500  outline-none  ${
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
//   staticwidth
// }) => {
//   const { currentColor } = useStateContext();
//   // console.log("width",staticwidth)
//   return (
//     <div class={`relative  max-w-xl pt-2 px-1 w-[${staticwidth}]`}>
//       <input
//         className={`peer transition-all px-5 py-1  text-lg text-gray-600 bg-white  border border-gray-800 outline-none select-all  ${
//           required_field ? "border-b-2 border-b-red-600" : ""
//         }`}
//         onFocus={(e) => (e.target.style.borderColor = currentColor)}
//         onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//         placeholder=" "
//         type={type}
//         name={name}
//         required={required}
//         onChange={onChange}
//         max={10}
//         min={3}
//         maxLength={maxLength}
//         disabled={disabled ? disabled : false}
//       />
//       <label className="z-2 text-gray-500 pointer-events-none absolute left-5 inset-y-0 h-fit flex items-center select-none transition-all text-sm peer-focus:text-sm peer-placeholder-shown:text-md px-1 peer-focus:px-1 peer-placeholder-shown:px-0 bg-white peer-focus:bg-white peer-placeholder-shown:bg-transparent m-0 peer-focus:m-0 peer-placeholder-shown:m-auto -translate-y-1/2 peer-focus:-translate-y-1/2 peer-placeholder-shown:translate-y-0">
//         {label}
//       </label>
//     </div>
//   );
// };

// export default Input;
