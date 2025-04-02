import React from "react";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import { Calendar } from "primereact/calendar";
import { useStateContext } from "../contexts/ContextProvider";
import { Button } from "primereact/button";

function DatePicker({
  name,
  className,
  respclass,
  id,
  placeholder,
  label,
  value,
  handleChange,
  tabIndex,
  inputClassName,
  removeFormGroupClass,
  maxDate,
  minDate,
  disable
}) {
  const { currentColor } = useStateContext();
  return (
    <div className={respclass} style={{ position: "relative" }}>
      <div className={removeFormGroupClass ? "" : "form-group"}>
        <Calendar
          inputId={id}
          showIcon={true}
          placeholder={placeholder}
          className={`${className} p-inputtext p-component`}
          dateFormat="dd-M-yy"
          value={value ? value : null}
          name={name}
          maxDate={maxDate}
          minDate={minDate}
          disabled={disable}
          onChange={handleChange}
          wrapperClassName="datepicker"
          inputClassName={`${inputClassName} w-full p-2 border `}
          tabIndex={tabIndex ? tabIndex : "-1"}
          iconClassName="pi pi-calendar" // PrimeIcon class
        />
        {/* {label && ( */}
          <label
            htmlFor={id}
            className="label truncate text-sm text-black p-3 bg-red-700"
            style={{ fontSize: "10px !important", background: currentColor }}
          >
            {label} webhjwhcjbhc
          </label>
        {/* )} */}
        {/* <Button label={"cal"} className="bg-red-600 p-3"/> */}
      </div>
    </div>
  );
}

export default DatePicker;
