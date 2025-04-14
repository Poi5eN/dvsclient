import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import welcome from "../../src/ShikshMitraWebsite/assets/welcome.jpg";
import admin from '../ShikshMitraWebsite/assets/admin.png'
const Welcome = ({teacherRoleData}) => {
  const { currentColor } = useStateContext();
  const [greeting, setGreeting] = useState("Hello");
  const [dateTime, setDateTime] = useState({
    date: "",
    time: "",
  });
  const fullName = sessionStorage.getItem("fullName");
  const user=JSON.parse(localStorage.getItem("user"))
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      if (hours < 12) {
        setGreeting("Good Morning");
      } else if (hours < 18) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }

      // Format the date and time
      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setDateTime({ date: formattedDate, time: formattedTime });
    };

    // Initial update
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center justify-between text-white p-5 rounded-lg shadow-lg md:col-span-2"
      style={{
        background:currentColor
        // background: `linear-gradient(to right, ${currentColor}, ${"#ffffff"})`,
      }}
    >
      <div className="py-1">
        <p className="text-lg font-semibold">{greeting} 👋</p>
        <p className="text-sm mt-1">{dateTime.date}</p>
        {teacherRoleData &&  <p className="text-sm mt-1"> Class : {teacherRoleData.classTeacher}-{teacherRoleData.section}</p> }
        <h1 className="text-xl md:text-2xl font-bold mt-2">
          Welcome!  {user?.fullName}
        </h1>
      </div>
      <div>
        <img
          src={admin}
          alt="Illustration"
          className="h-28 w-28 object-contain"
        />
      </div>
    </div>
  );
};

export default Welcome;
