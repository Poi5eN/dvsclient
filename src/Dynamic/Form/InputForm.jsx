import React, { useState } from "react";

const InputForm = ({ fields, handleChange, handleImageChange }) => {
  const [emptyFields, setEmptyFields] = useState([]);

  const isFieldEmpty = (name) => {
    return emptyFields.includes(name);
  };

  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (name, value) => {
    const errors = { ...fieldErrors };
    const field = fields.find((field) => field.name === name);
    if (field.required && value.trim() === "") {
      errors[name] = "This field is required.";
    } else {
      delete errors[name];
    }

    setFieldErrors(errors);

    handleChange(name, value);
  };

  const useGrid = fields.length > 5;

  return (
   
    // <div className="modal-blur md:mt-0">
        <form
        className="grid md:grid-cols-4 grid-cols-1 space-x-1  dark:text-white dark:bg-secondary-dark-bg "
        encType="multipart/form-data"
      >
        {fields.map((field, index) => (
          <div
            key={index}
            className={`mb-2 dark:text-white dark:bg-secondary-dark-bg ${
              useGrid ? "" : "col-span-2"
            }`}
          >
            <label
              className="block  text-sm text-gray-600 font-bold mb-2 dark:text-white dark:bg-secondary-dark-bg"
              htmlFor={field.name}
            >
              {field.label}
            </label>

            {field.required && fieldErrors[field.name] && (
              <p className="text-red-500 text-xs ">{fieldErrors[field.name]}</p>
            )}



            {field.type === "file" ? (
              <input
                type="file"
                accept={field.accept}
                onChange={handleImageChange}
                name={field.name}
              />
            ) : field.type === "select" ? (
              <select
                // className="rounded-md w-full py-1 px-3 outline text-start outline-1"
                 className="h-10 border rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                id={field.name}
                name={field.name}
                value={field.value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
              >
                {field.selectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  className={`${
                    field.required && isFieldEmpty(field.name)
                      ? "bg-red-200"
                      : ""
                  } shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={field.value}
                  onChange={(e) =>
                    handleInputChange(field.name, e.target.value)
                  }
                />
                {field.required && fieldErrors[field.name] && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldErrors[field.name]}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </form>
  //  </div>
  );
};

export default InputForm;
