import React from "react";
import "./Input.css";
import { useStateContext } from "../contexts/ContextProvider";
const Selector = ({ label, name, required, options }) => {
  const { currentColor } = useStateContext();
  return (
    <div className="flex flex-col space-y-1">
      <div class="material-textfield">
        <select
       
          className="input_text w-full"
          style={{
            outline: "none",
            border: `1px solid ${currentColor}`,
          }}
          onFocus={(e) => (e.target.style.borderColor = currentColor)}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          name={name}
          required={required}
        >
            
          {options?.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>
        <label
          style={{
            color: currentColor,
            transition: "color 0.9s, transform 0.9s",
          }}
          className="input_label"
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default Selector;
