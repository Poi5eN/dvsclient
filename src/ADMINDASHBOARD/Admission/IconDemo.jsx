// IconDemo.js
import React, { useState } from "react";
import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// Make sure the path is correct

export default function IconDemo() {
    const [formData, setFormData] = useState({
        fromDate: null,
    });

    // Revised handler to work with the structure needed for the state update
    const handleStateUpdateForDate = (dateValue, name) => {
        console.log(`Updating state for ${name}:`, dateValue); // For debugging
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: dateValue, // Update the state with the received date object (or null)
        }));
    };

    return (
        <div className="card flex flex-wrap gap-3 p-fluid">
            <DatePicker
                className="custom-calendar"
                placeholder="" // Can be left empty, DatePicker default is DD/MM/YYYY
                label={"From Date"} // Corrected typo
                respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
                name="fromDate"
                id="fromDate"
                value={formData?.fromDate}
                // Pass an arrow function to adapt PrimeReact's onChange event
                // PrimeReact's event 'e' has the date in 'e.value'
                handleChange={(e) => handleStateUpdateForDate(e.value, "fromDate")}
                // showaTime // Pass prop
                hourFormat="12" // Pass prop
                // removed duplicate/incorrect handleChange props
            />
        </div>
    );
}



// import React, { useState } from "react";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";


// export default function IconDemo() {
//     const [formData, setFormData] = useState(
//         {
//             fromDate: null, 
//         }
//     );

//     const handleDateChange = (date, name) => {
//         // The 'date' parameter is typically the Date object from the picker
//         setFormData((prevFormData) => ({
//             ...prevFormData,
//             [name]: date, // Update the state with the received date object
//         }));
//     };
//     return (
//         <div className="card flex flex-wrap gap-3 p-fluid">
//               <DatePicker
//           className="custom-calendar"
//           placeholder=""
//           lable=  {("FromDate") }
//           respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
//           name="fromDate"
//           id="fromDate"
//           // value={values?.fromDate}
//           handleChange={handleDateChange}
//           value={formData?.fromDate}
//           showTime
//           hourFormat="12"
//           // handleChange={handleChange}
//           // handleChange={(date) => handleChange(date, "fromDate")}
//         />
//         </div>
//     )
// }
        