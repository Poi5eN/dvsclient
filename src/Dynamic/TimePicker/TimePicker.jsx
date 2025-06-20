// Picker.js
import React from "react";
import { Calendar } from "primereact/calendar";
import './Time.css'
function TimePicker(props)
    {
    //  respclass,
    // placeholderName,
    // value,
    // handleChange,
    // name,
    // lable,
    // id,
    // className,
    // disable,
    // removeFormControl,
    // removeFormGroupClass,
//   name,
//   className,
//   respclass,
//   id,
//   placeholder,
//   label, // Corrected typo
//   value,
//   handleChange, // This prop will receive the event object from PrimeReact's Calendar
//   tabIndex,
//   inputClassName,
//   removeFormGroupClass,
//   maxDate,
//   minDate,
//   disabled, // Changed from 'disable' for consistency
//   viewDate,
//   handleSelect,
//   showTime,   // Make sure to accept these props
//   hourFormat, // Make sure to accept these props
//   keepInvalid = false // Optional: Controls behavior on invalid manual input blur
// }) 
 const {
    respclass,
    placeholderName,
    value,
    handleChange,
    name,
    label,
    id,
    className,
    disable,
    removeFormControl,
    removeFormGroupClass
  } = props;
// {
  // PrimeReact expects this format for display
//   const primeDateFormat = "dd/mm/yy"; // Use for display formatting

  // Removed handleManualInput function

  return (
    <div className={respclass} style={{ position: "relative" }}>
      <div className={removeFormGroupClass ? "" : "form-group"}>
         <Calendar
          id="calendar-timeonly"
          style={{ width: "100%" }}
          wrapperclassname="datepicker"
          className={className}
          value={value}
          onChange={handleChange}
          timeOnly
          showTime
          inputMode="text"
          hourFormat="12"
          placeholder={placeholderName}
          disabled={disable}
          name={name}
          autoHide={true} 
          // disabled
        />

        {label && ( // Corrected typo
          <label
            htmlFor={id}
            className="labelPicker label truncate" // Corrected typo
            // style={{ fontSize: "5px !important" }} // NB: 5px font size is extremely small
          >
            {label}
          </label>
        )}
      </div>
    </div>
  );
}

export default TimePicker;