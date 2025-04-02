import React from "react";
import { useStateContext } from "../contexts/ContextProvider";

const SelectInput = ({
  label,
  name,
  required,
  value,
  onChange,
  options,
  disabled,
}) => {
  const { currentColor } = useStateContext();

  return (
    <div className="relative w-full max-w-xl pt-2 px-1">
      <select
        className={`peer transition-all px-5 py-2 text-lg text-gray-600 bg-white border border-gray-800 outline-none w-full appearance-none focus:ring-2 focus:ring-${currentColor} ${
          value === "" ? "text-gray-400" : "text-black"
        }`}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={(e) => (e.target.style.borderColor = currentColor)}
        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
      >
        <option value="" disabled>
          Select a {label}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        className={`absolute left-5 bg-white px-1 text-sm transition-all ${
          value === ""
            ? "top-3 text-lg text-gray-400"
            : "-top-3.5 text-sm text-gray-600"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default SelectInput;

