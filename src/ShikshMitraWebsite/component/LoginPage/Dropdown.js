import React, { useState } from "react";

function Dropdown({ formdata, setformdata }) {
  const [selectedRole, setSelectedRole] = useState("admin");
  // const roleOptions = ["admin", "student", "teacher", "parent"];
  const roleOptions = ["admin", "teacher"];

  const handleRoleChange = (event) => {
    setformdata((prevdata) => {
      return {
        ...prevdata,
        Role: event.target.value,
      };
    });
  };

  return (
    <select
      id="role"
      onChange={handleRoleChange}
      value={formdata.Role}
      className="rounded-md  bg-[#183a37a1] text-white border-2 border-white text-center w-full py-2 outline-none  px-3"
    >
      {roleOptions.map((option) => (
        <option key={option} value={option}>
          {option.toUpperCase()}
        </option>
      ))}
    </select>
  );
}

export default Dropdown;
