import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axios from "axios";

const Lectures = () => {
const authToken = localStorage.getItem("token");

  const { currentColor } = useStateContext();
  const [timetable, setTimetable] = useState([
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ]);
  const [teacherid, setTeacherId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [dependency, setDependency] = useState(false);

  const handleCellChange = (dayIndex, periodIndex, value) => {
    const updatedTimetable = [...timetable];
    updatedTimetable[dayIndex][periodIndex] = value;
    setTimetable(updatedTimetable);

    // console.log("P2 Time Table", timetable);
  };

  const data = JSON.parse(sessionStorage.response);
  // console.log(data);
  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/timeTable/getClassTimeTable?className=${data.class}&section=${data.section}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((res) => {
        if (res.data.timeTable && res.data.timeTable.length > 0) {
          const timetableId = res.data.timeTable[0]._id;
          // console.log("Timetable ID:", timetableId);
          setTeacherId(timetableId);
        } else {
          console.log("timeTable is empty or undefined.");
        }

        const fetchedTimetable = res.data.timeTable[0]; // Assuming there's only one item in the array

        const updatedTimetable = [];

        // Define the order of days and periods
        const daysOfWeek = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        const periods = [
          "period1",
          "period2",
          "period3",
          "period4",
          "period5",
          "period6",
          "period7",
          "period8",
        ];

        // Iterate through days and periods to build the updatedTimetable array
        daysOfWeek.forEach((day) => {
          const daySchedule = [];
          periods.forEach((period) => {
            daySchedule.push(fetchedTimetable[day][period]);
          });
          updatedTimetable.push(daySchedule);
        });

        setTimetable(updatedTimetable);
        // console.log("Updated Timetable", updatedTimetable);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [dependency]);

  return (
    <div className="container mx-auto p-4">
      <h1
        className="text-4xl font-bold mb-4 uppercase text-center dark:text-white  hover-text "
        style={{ color: currentColor }}
      >
        School Dashboard
      </h1>
      <table className="table-auto w-full border p-2">
        <thead>
          <tr
            style={{ background: currentColor }}
            className="bg-cyan-700  text-white "
          >
            <th className="border px-2 py-2"></th>
            <th className="border px-2 py-2">Period 1</th>
            <th className="border px-2 py-2">Period 2</th>
            <th className="border px-2 py-2">Period 3</th>
            <th className="border px-2 py-2">Period 4</th>
            <th className="border px-2 py-2">Period 5</th>
            <th className="border px-2 py-2">Period 6</th>
            <th className="border px-2 py-2">Period 7</th>
            <th className="border px-2 py-2">Period 8</th>
          </tr>
        </thead>
        <tbody className="dark:text-white dark:bg-secondary-dark-bg text-gray-800">
          {timetable.map((day, dayIndex) => (
            <tr key={dayIndex} className="border">
              <td className="text-left px-2 py-2 font-semibold border">
                {
                  [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ][dayIndex]
                }
              </td>
              {day.map((subject, periodIndex) => (
                <td key={periodIndex} className="px-2 py-2 border text-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) =>
                        handleCellChange(dayIndex, periodIndex, e.target.value)
                      }
                      className="border border-gray-400 p-2 w-full"
                    />
                  ) : (
                    <span>{subject}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Lectures;
