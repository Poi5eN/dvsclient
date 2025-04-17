import React, { useState, useEffect, useCallback } from "react";
import AllPhotos from "../AllPhotos";
import { thirdpartyclasses } from "../../Network/ThirdPartyApi";
import { useStateContext } from "../../contexts/ContextProvider";
import { debounce } from "lodash";

const ThirdpartPhotos = () => {
  const SchoolID = localStorage.getItem("SchoolID");
  const { currentColor } = useStateContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch classes
  const Getclasses = async () => {
    try {
      if (!SchoolID) return;
      const response = await thirdpartyclasses(SchoolID);
      if (response.success) {
        let classes = response.classList;
        setGetClass([
          { className: "all", sections: "" },
          ...classes.sort((a, b) => a - b),
        ]);
      } else {
        console.log("error", response?.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    Getclasses();
  }, [SchoolID]);

  // Handle class change
  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    setSelectedSection("");

    if (selectedClassName === "all") {
      setAvailableSections([]);
    } else {
      const selectedClassObj = getClass?.find(
        (cls) => cls.className === selectedClassName
      );
      if (selectedClassObj) {
        setAvailableSections(selectedClassObj.sections.split(", "));
      } else {
        setAvailableSections([]);
      }
    }
  };

  // Handle section change
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setIsSearching(false);
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setIsSearching(true);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-4 mb-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-6">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Search by Name or Photo No..."
              onChange={handleSearchChange}
              className="w-full py-2 px-4 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 shadow-sm placeholder-gray-500"
            />
            {isSearching && (
              <img
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2xqb3U3dHVuZjFmZTFxZzZmc3F6enQ5Zm8yZGVlOHE5bnh1NjV0aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/6vLWUMTS0GmgDknE86/giphy.gif"
                alt="Dancing Mickey Mouse"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6"
              />
            )}
          </div>
          <select
            name="photoClass"
            className="w-full sm:w-1/4 py-2 px-4 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 shadow-sm"
            style={{
              borderColor: selectedClass ? currentColor : "#d1d5db",
            }}
            onFocus={(e) => (e.target.style.borderColor = currentColor)}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            value={selectedClass}
            onChange={handleClassChange}
          >
            <option value="" disabled>
              Select Class
            </option>
            {getClass?.map((cls, index) => (
              <option
                key={index}
                value={cls.className}
                className="text-gray-800 bg-white"
              >
                {cls?.className === "all" ? "All Classes" : cls?.className}
              </option>
            ))}
          </select>
          <select
            name="photoSection"
            className="w-full sm:w-1/4 py-2 px-4 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 shadow-sm"
            style={{
              borderColor: selectedSection ? currentColor : "#d1d5db",
            }}
            onFocus={(e) => (e.target.style.borderColor = currentColor)}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            value={selectedSection}
            onChange={handleSectionChange}
            disabled={!selectedClass || selectedClass === "all"}
          >
            <option value="" disabled>
              Select Section
            </option>
            {availableSections?.map((item, index) => (
              <option
                key={index}
                value={item}
                className="text-gray-800 bg-white"
              >
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AllPhotos
        externalSearchTerm={searchTerm}
        externalSelectedClass={selectedClass}
        externalSelectedSection={selectedSection}
      />
    </div>
  );
};

export default ThirdpartPhotos;
