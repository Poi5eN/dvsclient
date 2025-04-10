import React from "react";
import { Calendar } from "primereact/calendar";

function DatePicker({
  name,
  className,
  respclass,
  id,
  placeholder,
  lable,
  value,
  handleChange,
  tabIndex,
  inputClassName,
  removeFormGroupClass,
  maxDate,
  minDate,
  disable,
  viewDate,
  dateFormat
}) {
  return (
    <>
      <div className={respclass} style={{ position: "relative" }}>
        {/* <FloatLabel>  */}
        <div className={removeFormGroupClass ? "" : "form-group"}>
          <Calendar
            inputId={id}
            // id={id}
            showIcon
            placeholder={placeholder}
            className={className}
            dateFormat={dateFormat?dateFormat:"dd-M-yy"}
            view={viewDate?viewDate:"date"} 
            value={value?value:null}
            name={name}
            maxDate={maxDate}
            minDate={minDate}
            disabled={disable}
            onChange={handleChange}
            // onChange={(e) => handleChange(name, e.target.value)}
            wrapperclassname="datepicker"
            inputClassName={inputClassName}
            tabIndex={tabIndex ? tabIndex : "-1"}
            // disabledDates={}
            // disabledDays={}

          />
          {/* <label htmlFor="birth_date">Birt h Date</label> */}
          {lable && (
            <label
              htmlFor={id}
              className="labelPicker lable truncate "
              style={{ fontSize: "5px !important" }}
            >
              {lable}
            </label>
          )}
        </div>
        {/* </FloatLabel> */}
      </div>
    </>
  );
}

export default DatePicker;




// import React, { useState, useEffect } from "react";
// import {
//   Input,
//   Popover,
//   PopoverHandler,
//   PopoverContent,
// } from "@material-tailwind/react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

// export default function ReactDatePicker({ label, value, onChange }) {
//   const [date, setDate] = useState(value ? new Date(value) : null);

//   useEffect(() => {
//     if (value) {
//       setDate(new Date(value));
//     } else {
//       setDate(null);
//     }
//   }, [value]);

//   const handleDateSelect = (selectedDate) => {
//     setDate(selectedDate);
//     if (onChange) {
//       onChange(selectedDate);
//     }
//   };

//   return (
//     <div tabIndex="999999" >
//       <Popover placement="bottom"
//       style={{zIndex:"20000000000"}}
//       >
//         <PopoverHandler tabIndex="1000000"
//         style={{zIndex:"20000000000"}}
//         >
//           <Input
//           style={{zIndex:"20000000000"}}
//             label={label || "Select a Date"}
//             onChange={() => null}
//             value={date ? format(date, "dd-MMM-yyyy") : ""}
//             readOnly
//             tabIndex="1000000"
//           />
//         </PopoverHandler>
//         <PopoverContent tabIndex="1000000"
//         style={{zIndex:"20000000000"}}
//         >
//           <DayPicker
//           style={{zIndex:"20000000000"}}
//             mode="single"
//             selected={date}
//             onSelect={handleDateSelect}
//             showOutsideDays
//             className="border-0"
//             classNames={{
//               caption: "flex justify-center py-2 mb-4 relative items-center",
//               caption_label: "text-sm font-medium text-gray-900",
//               nav: "flex items-center",
//               nav_button:
//                 "h-6 w-6 bg-transparent hover:bg-blue-gray-50 p-1 rounded-md transition-colors duration-300",
//               nav_button_previous: "absolute left-1.5",
//               nav_button_next: "absolute right-1.5",
//               table: "w-full border-collapse",
//               head_row: "flex font-medium text-gray-900",
//               head_cell: "m-0.5 w-9 font-normal text-sm",
//               row: "flex w-full mt-2",
//               cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative focus-within:relative focus-within:z-20",
//               day: "h-9 w-9 p-0 font-normal",
//               day_selected:
//                 "rounded-md bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white",
//               day_today: "rounded-md bg-gray-200 text-gray-900",
//               day_outside: "text-gray-500 opacity-50",
//               day_disabled: "text-gray-500 opacity-50",
//               day_hidden: "invisible",
//             }}
//             components={{
//               IconLeft: ({ ...props }) => (
//                 <ChevronLeftIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//               IconRight: ({ ...props }) => (
//                 <ChevronRightIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//             }}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }



// import React, { useState, useEffect } from "react";
// import {
//   Input,
//   Popover,
//   PopoverHandler,
//   PopoverContent,
// } from "@material-tailwind/react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

// export default function ReactDatePicker({ label, value, onChange }) {
//   const [date, setDate] = useState(value ? new Date(value) : null);  // Initialize with prop value

//   useEffect(() => {
//     if (value) {
//       setDate(new Date(value)); // Update state when prop changes
//     } else {
//         setDate(null);
//     }
//   }, [value]);

//   const handleDateSelect = (selectedDate) => {
//     setDate(selectedDate);
//     if (onChange) {
//       onChange(selectedDate); // Call the parent's onChange handler
//     }
//   };

//   return (
//     <div tabIndex="100">
//       <Popover placement="bottom" style={{zIndex:"100000000"}}>
//         <PopoverHandler style={{zIndex:"100000000"}}>
//           <Input
//             label={label || "Select a Date"} // Use prop or default label
//             onChange={() => null}
//             value={date ? format(date, "dd-MMM-yyyy") : ""}
//             readOnly // Prevent direct input
//             style={{zIndex:"100000000"}}
//           />
//         </PopoverHandler>
//         <PopoverContent style={{zIndex:"101000000"}}>
//           <DayPicker
//           style={{zIndex:"100000000"}}
//             mode="single"
//             selected={date}
//             onSelect={handleDateSelect}
//             showOutsideDays
//             className="border-0"
//             classNames={{
//                 tabIndex:"1000000",
//               caption: "flex justify-center py-2 mb-4 relative items-center",
//               caption_label: "text-sm font-medium text-gray-900",
//               nav: "flex items-center",
//               nav_button:
//                 "h-6 w-6 bg-transparent hover:bg-blue-gray-50 p-1 rounded-md transition-colors duration-300",
//               nav_button_previous: "absolute left-1.5",
//               nav_button_next: "absolute right-1.5",
//               table: "w-full border-collapse",
//               head_row: "flex font-medium text-gray-900",
//               head_cell: "m-0.5 w-9 font-normal text-sm",
//               row: "flex w-full mt-2",
//               cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-900/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-gray-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
//               day: "h-9 w-9 p-0 font-normal",
//               day_range_end: "day-range-end",
//               day_selected:
//                 "rounded-md bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white",
//               day_today: "rounded-md bg-gray-200 text-gray-900",
//               day_outside:
//                 "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-500 aria-selected:text-gray-900 aria-selected:bg-opacity-10",
//               day_disabled: "text-gray-500 opacity-50",
//               day_hidden: "invisible",
//             }}
//             components={{
//               IconLeft: ({ ...props }) => (
//                 <ChevronLeftIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//               IconRight: ({ ...props }) => (
//                 <ChevronRightIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//             }}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }




// import React, { useState, useEffect } from "react";
// import {
//   Input,
//   Popover,
//   PopoverHandler,
//   PopoverContent,
// } from "@material-tailwind/react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

// export default function ReactDatePicker({ label, value, onChange }) {
//   const [date, setDate] = useState(value ? new Date(value) : null);  // Initialize with prop value

//   useEffect(() => {
//     if (value) {
//       setDate(new Date(value)); // Update state when prop changes
//     } else {
//         setDate(null);
//     }
//   }, [value]);

//   const handleDateSelect = (selectedDate) => {
//     setDate(selectedDate);
//     if (onChange) {
//       onChange(selectedDate); // Call the parent's onChange handler
//     }
//   };

//   return (
//     <div>
//       <Popover placement="bottom" style={{zIndex:"100"}}>
//         <PopoverHandler>
//           <Input
//             label={label || "Select a Date"} // Use prop or default label
//             onChange={() => null}
//             value={date ? format(date, "dd-MMM-yyyy") : ""}
//             readOnly // Prevent direct input
//           />
//         </PopoverHandler>
//         <PopoverContent style={{zIndex:"101"}}>
//           <DayPicker
//             mode="single"
//             selected={date}
//             onSelect={handleDateSelect}
//             showOutsideDays
//             className="border-0"
//             classNames={{
//               caption: "flex justify-center py-2 mb-4 relative items-center",
//               caption_label: "text-sm font-medium text-gray-900",
//               nav: "flex items-center",
//               nav_button:
//                 "h-6 w-6 bg-transparent hover:bg-blue-gray-50 p-1 rounded-md transition-colors duration-300",
//               nav_button_previous: "absolute left-1.5",
//               nav_button_next: "absolute right-1.5",
//               table: "w-full border-collapse",
//               head_row: "flex font-medium text-gray-900",
//               head_cell: "m-0.5 w-9 font-normal text-sm",
//               row: "flex w-full mt-2",
//               cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-900/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-gray-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
//               day: "h-9 w-9 p-0 font-normal",
//               day_range_end: "day-range-end",
//               day_selected:
//                 "rounded-md bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white",
//               day_today: "rounded-md bg-gray-200 text-gray-900",
//               day_outside:
//                 "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-500 aria-selected:text-gray-900 aria-selected:bg-opacity-10",
//               day_disabled: "text-gray-500 opacity-50",
//               day_hidden: "invisible",
//             }}
//             components={{
//               IconLeft: ({ ...props }) => (
//                 <ChevronLeftIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//               IconRight: ({ ...props }) => (
//                 <ChevronRightIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//             }}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }





// import React, { useState, useEffect } from "react";
// import {
//   Input,
//   Popover,
//   PopoverHandler,
//   PopoverContent,
// } from "@material-tailwind/react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

// export default function ReactDatePicker({ label, value, onChange }) {
//   const [date, setDate] = useState(value ? new Date(value) : null);  // Initialize with prop value

//   useEffect(() => {
//     if (value) {
//       setDate(new Date(value)); // Update state when prop changes
//     } else {
//         setDate(null);
//     }
//   }, [value]);

//   const handleDateSelect = (selectedDate) => {
//     setDate(selectedDate);
//     if (onChange) {
//       onChange(selectedDate); // Call the parent's onChange handler
//     }
//   };

//   return (
//     <div>
//       <Popover placement="bottom"
//        style={{zIndex:"9999999999"}}
//       >
//         <PopoverHandler>
//           <Input
//             label={label || "Select a Date"} // Use prop or default label
//             onChange={() => null}
//             value={date ? format(date, "dd-MMM-yyyy") : ""}
//             readOnly // Prevent direct input
//           />
//         </PopoverHandler>
//         <PopoverContent>
//           <DayPicker
         
//             mode="single"
//             selected={date}
//             onSelect={handleDateSelect}
//             showOutsideDays
//             className="border-0"
//             classNames={{
//               caption: "flex justify-center py-2 mb-4 relative items-center",
//               caption_label: "text-sm font-medium text-gray-900",
//               nav: "flex items-center",
//               nav_button:
//                 "h-6 w-6 bg-transparent hover:bg-blue-gray-50 p-1 rounded-md transition-colors duration-300",
//               nav_button_previous: "absolute left-1.5",
//               nav_button_next: "absolute right-1.5",
//               table: "w-full border-collapse",
//               head_row: "flex font-medium text-gray-900",
//               head_cell: "m-0.5 w-9 font-normal text-sm",
//               row: "flex w-full mt-2",
//               cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-900/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-gray-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-[99999]",
//               day: "h-9 w-9 p-0 font-normal",
//               day_range_end: "day-range-end",
//               day_selected:
//                 "rounded-md bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white",
//               day_today: "rounded-md bg-gray-200 text-gray-900",
//               day_outside:
//                 "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-500 aria-selected:text-gray-900 aria-selected:bg-opacity-10",
//               day_disabled: "text-gray-500 opacity-50",
//               day_hidden: "invisible",
//             }}
//             components={{
//               IconLeft: ({ ...props }) => (
//                 <ChevronLeftIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//               IconRight: ({ ...props }) => (
//                 <ChevronRightIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//             }}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }


// import React, { useState } from "react";
// import {
//   Input,
//   Popover,
//   PopoverHandler,
//   PopoverContent,
// } from "@material-tailwind/react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
// import moment from "moment/moment";
 
// export default function ReactDatePicker() {
//   const [date, setDate] =useState(new Date());
 
//   return (
//     <div
//     //  className="p-24"
//      >
//       <Popover placement="bottom">
//         <PopoverHandler>
//           <Input
//             label="Select a Date"
//             onChange={() => null}
//             value={date ? format(date, 'dd-MMM-yyyy') : ''}
//           />
//         </PopoverHandler>
//         <PopoverContent>
//           <DayPicker
//             mode="single"
//             selected={date}
//             onSelect={setDate}
//             showOutsideDays
//             className="border-0"
//             classNames={{
//               caption: "flex justify-center py-2 mb-4 relative items-center",
//               caption_label: "text-sm font-medium text-gray-900",
//               nav: "flex items-center",
//               nav_button:
//                 "h-6 w-6 bg-transparent hover:bg-blue-gray-50 p-1 rounded-md transition-colors duration-300",
//               nav_button_previous: "absolute left-1.5",
//               nav_button_next: "absolute right-1.5",
//               table: "w-full border-collapse",
//               head_row: "flex font-medium text-gray-900",
//               head_cell: "m-0.5 w-9 font-normal text-sm",
//               row: "flex w-full mt-2",
//               cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-900/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-gray-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
//               day: "h-9 w-9 p-0 font-normal",
//               day_range_end: "day-range-end",
//               day_selected:
//                 "rounded-md bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white",
//               day_today: "rounded-md bg-gray-200 text-gray-900",
//               day_outside:
//                 "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-500 aria-selected:text-gray-900 aria-selected:bg-opacity-10",
//               day_disabled: "text-gray-500 opacity-50",
//               day_hidden: "invisible",
//             }}
//             components={{
//               IconLeft: ({ ...props }) => (
//                 <ChevronLeftIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//               IconRight: ({ ...props }) => (
//                 <ChevronRightIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//             }}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }


// import React, { useState } from "react";
// import {
//   Input,
//   Popover,
//   PopoverHandler,
//   PopoverContent,
// } from "@material-tailwind/react";
// import { format } from "date-fns";
// import { DayPicker } from "react-day-picker";
// import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
 
// export default function ReactDatePicker() {
//   const [date, setDate] =useState(new Date())
 
//   return (
//     <div className="p-24">
//       <Popover placement="bottom">
//         <PopoverHandler>
//           <Input
//             label="Select a Date"
//             onChange={() => null}
//             value={date ? format(date, "PPP") : ""}
//           />
//         </PopoverHandler>
//         <PopoverContent>
//           <DayPicker
//             mode="single"
//             selected={date}
//             onSelect={setDate}
//             showOutsideDays
//             className="border-0"
//             classNames={{
//               caption: "flex justify-center py-2 mb-4 relative items-center",
//               caption_label: "text-sm font-medium text-gray-900",
//               nav: "flex items-center",
//               nav_button:
//                 "h-6 w-6 bg-transparent hover:bg-blue-gray-50 p-1 rounded-md transition-colors duration-300",
//               nav_button_previous: "absolute left-1.5",
//               nav_button_next: "absolute right-1.5",
//               table: "w-full border-collapse",
//               head_row: "flex font-medium text-gray-900",
//               head_cell: "m-0.5 w-9 font-normal text-sm",
//               row: "flex w-full mt-2",
//               cell: "text-gray-600 rounded-md h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-900/20 [&:has([aria-selected].day-outside)]:text-white [&:has([aria-selected])]:bg-gray-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
//               day: "h-9 w-9 p-0 font-normal",
//               day_range_end: "day-range-end",
//               day_selected:
//                 "rounded-md bg-gray-900 text-white hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white",
//               day_today: "rounded-md bg-gray-200 text-gray-900",
//               day_outside:
//                 "day-outside text-gray-500 opacity-50 aria-selected:bg-gray-500 aria-selected:text-gray-900 aria-selected:bg-opacity-10",
//               day_disabled: "text-gray-500 opacity-50",
//               day_hidden: "invisible",
//             }}
//             components={{
//               IconLeft: ({ ...props }) => (
//                 <ChevronLeftIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//               IconRight: ({ ...props }) => (
//                 <ChevronRightIcon {...props} className="h-4 w-4 stroke-2" />
//               ),
//             }}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// }

// import React, { useState } from 'react'

// const DatePicker = () => {
//     const [startDate, setStartDate] = useState(new Date());
//   return (
//     <div>

//     </div>
//   )
// }

// export default DatePicker