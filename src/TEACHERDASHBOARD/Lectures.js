import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useStateContext } from "../contexts/ContextProvider";
import { Button } from "@mui/material";



const Lectures = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [timetable, setTimetable] = useState([
    ["", "", "", "", "", "", "", ""], // Monday
    ["", "", "", "", "", "", "", ""], // Tuesday
    ["", "", "", "", "", "", "", ""], // Wednesday
    ["", "", "", "", "", "", "", ""], // Thursday
    ["", "", "", "", "", "", "", ""], // Friday
    ["", "", "", "", "", "", "", ""], // Saturday
  ]);

  const [teacherid, setTeacherId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [dependency, setDependency] = useState(false);

  const handleCellChange = (dayIndex, periodIndex, value) => {
    const updatedTimetable = [...timetable];
    updatedTimetable[dayIndex][periodIndex] = value;
    setTimetable(updatedTimetable);
  };

  const data = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get(
          `https://dvsserver.onrender.com/api/v1/timeTable/getClassTimeTable?className=${data.classTeacher}§ion=${data.section}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (response.data.timeTable && response.data.timeTable.length > 0) {
          const timetableId = response.data.timeTable[0]._id;
          console.log("Timetable ID:", timetableId);
          setTeacherId(timetableId);

          const fetchedTimetable = response.data.timeTable[0];
          const updatedTimetable = [];
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

          daysOfWeek.forEach((day) => {
            const daySchedule = [];
            periods.forEach((period) => {
              daySchedule.push(fetchedTimetable[day][period]);
            });
            updatedTimetable.push(daySchedule);
          });

          setTimetable(updatedTimetable);
          console.log("Updated Timetable", updatedTimetable);
        } else {
          console.log("timeTable is empty or undefined.");
          setTimetable([
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
          ]);
        }
      } catch (err) {
        console.log(err.message);
        console.log("Error fetching timetable");
      }
    };

    fetchTimetable();
  }, [dependency, data.classTeacher, data.section]);

  const handleSubmit = async () => {
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const formattedTimetable = daysOfWeek.reduce((result, day, dayIndex) => {
      result[day.toLowerCase()] = {
        period1: timetable[dayIndex][0],
        period2: timetable[dayIndex][1],
        period3: timetable[dayIndex][2],
        period4: timetable[dayIndex][3],
        period5: timetable[dayIndex][4],
        period6: timetable[dayIndex][5],
        period7: timetable[dayIndex][6],
        period8: timetable[dayIndex][7],
      };
      return result;
    }, {});

    console.log(formattedTimetable);

    try {
      await axios.post(
        "https://dvsserver.onrender.com/api/v1/timeTable/createClassTimeTable",
        formattedTimetable,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("Timetable submitted:", formattedTimetable);
      setIsEditing(false);
    } catch (error) {
      console.error("Error posting timetable data:", error);
    }

    setDependency(!dependency);
  };

  const handleDelete = async () => {
    const timetableId = teacherid;
    console.log(timetableId);
    try {
      await axios.delete(
        `https://dvsserver.onrender.com/api/v1/timeTable/deleteClassTimeTable/${timetableId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log("Timetable deleted successfully");
      toast("Deleted!");
      setTimetable([
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
      ]);
      setDependency(!dependency);
    } catch (error) {
      console.error("Error deleting timetable:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1
        className="text-xl font-bold mb-4 uppercase text-center hover:text-gray-700 transition-colors duration-200"
        style={{ color: currentColor }}
      >
        School Dashboard
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border p-1">
          <thead>
            <tr className="text-white" style={{ background: currentColor }}>
              <th className="border border-blue-500 px-2 py-1"></th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 1
              </th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 2
              </th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 3
              </th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 4
              </th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 5
              </th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 6
              </th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 7
              </th>
              <th className="border border-blue-500 px-2 py-1 whitespace-nowrap">
                Period 8
              </th>
            </tr>
          </thead>
          <tbody>
            {timetable.map((day, dayIndex) => (
              <tr key={dayIndex} className="border">
                <td className="text-left px-2 py-1 font-semibold border">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ][dayIndex]}
                </td>
                {day.map((subject, periodIndex) => (
                  <td key={periodIndex} className="px-1 py-1 border text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) =>
                          handleCellChange(dayIndex, periodIndex, e.target.value)
                        }
                        className="border border-gray-400 p-1 w-full"
                      />
                    ) : (
                      <span className="block truncate">{subject}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center  sm:justify-start gap-2">
        {isEditing ? (
          <Button
            variant="contained"
            style={{ backgroundColor: currentColor }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="contained"
            style={{ backgroundColor: currentColor }}
            onClick={() => setIsEditing(true)}
          >
            Create
          </Button>
        )}
        {!isEditing && (
          <Button
            variant="contained"
            style={{ backgroundColor: "gray" }}
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default Lectures;

