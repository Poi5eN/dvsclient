import React from "react";
import gaurav from "../../assets/images/Gaurav.jpeg";
import anand from "../../assets/images/annadimg.jpg";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Team = () => {
  const Team1 = [
    {
      name: "Gourav Upadhyay",
      designation: "Software Engineer ",
      img: gaurav,
      des: " Software Engineer & Team Leader orchestrating the robust development, blending frontend finesse with backend prowess to deliver innovative solutions.",
      linkedin: "https://www.linkedin.com/in/gourav-kumar-upadhyay-0731b41b4",
      github: "https://github.com/Poi5eN",
      email: "poi5en.here@gmail.com",
    },
    {
      name: "Anand Jaiswal",
      designation: "Frontend Developer",
      img: anand,
      des: " React Frontend Developer specializing in state management and component architecture for seamless user experiences.",
      linkedin: "https://www.linkedin.com/in/anandkumarjaiswal/",
      github: "https://github.com/ANAND2023?tab=repositories",
      email: "anandkumar2022bth@gmail.com",
    },

  ];
  const Team2 = [
   
  ];
  return (
    <>
      <div className="w-full space-y-3 pb-5 bg-[#1f2937]">
        <div className="pb-16">
          <div
            id="text"
            className="md:text-2xl text-center uppercase bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-500 to-[#0e7490] text-5xl font-black py-5"
          >
            OUR TEAM
          </div>
        </div>
        <div className=" md:w-[70%] mx-auto grid md:grid-cols-3 grid-cols-1 gap-2">
          {Team1.map((item, index) => (
            <div className="max-w-[280px] rounded-2xl border bg-[#263243]  text-center shadow-lg py-3">
              <img
                className="mx-auto mb-4 h-32 w-32 rounded-full shadow-lg"
                src={item.img}
                alt="profile picture"
              />
              <h1 className="text-xl font-semibold text-white">{item.name}</h1>
              <h2 className="font-semibold text-slate-500">
                {item.designation}
              </h2>
              <span className="flex justify-center gap-2">
                <a href={item.linkedin} target="_blank">
                  <FaLinkedin className="text-2xl text-[#0a66c2]" />
                </a>
                <a href={item.github} target="_blank">
                  <FaGithub className="text-2xl text-[#0a66c2]" />
                </a>
              </span>
              <p className="mt-5 text-sm font-normal text-white">{item.des}</p>
              <a href={`mailto:${item.email}`} target="_blank">
                <button className="mt-2 rounded-3xl border border-solid border-gray-300 px-8 py-2 font-semibold uppercase tracking-wide text-white hover:bg-cyan-700 hover:text-white">
                  Contact
                </button>
              </a>
            </div>
          ))}
        </div>
        <div className=" w-[90%] mx-auto grid md:grid-cols-4 grid-cols-1 gap-4">
          {Team2.map((item, index) => (
            <div className="max-w-[280px] rounded-2xl border bg-[#263243]  text-center shadow-lg py-3">
              <img
                className="mx-auto mb-4 h-32 w-32 rounded-full shadow-lg"
                src={item.img}
                alt="profile picture"
              />
              <h1 className="text-xl font-semibold text-white">{item.name}</h1>
              <h2 className="font-semibold text-slate-500">
                {item.designation}
              </h2>
              <span className="flex justify-center gap-2">
                <a href={item.linkedin} target="_blank">
                  <FaLinkedin className="text-2xl text-[#0a66c2]" />
                </a>
                <a href={item.github} target="_blank">
                  <FaGithub className="text-2xl text-[#0a66c2]" />
                </a>
              </span>
              <p className="mt-5 text-sm font-normal text-white">{item.des}</p>
              <a href={`mailto:${item.email}`} target="_blank">
                <button className="mt-2 rounded-3xl border border-solid border-gray-300 px-8 py-2 font-semibold uppercase tracking-wide text-white hover:bg-cyan-700 hover:text-white">
                  Contact
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Team;
