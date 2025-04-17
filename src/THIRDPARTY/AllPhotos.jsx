import React, { useState, useCallback, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import PhotoDynamicFormFields from "./PhotoDynamicFormFields";
import {
  thirdpartyphotorecords,
  thirdpartyclasses,
} from "../Network/ThirdPartyApi";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import { useStateContext } from "../contexts/ContextProvider";

function AllPhotos({
  externalSearchTerm = "",
  externalSelectedClass = "",
  externalSelectedSection = "",
}) {
  const SchoolID = localStorage.getItem("SchoolID");
  const [reRender, setReRender] = useState(false);
  const { currentColor, setIsLoader, schoolDetails } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(externalSelectedClass);
  const [selectedSection, setSelectedSection] = useState(
    externalSelectedSection
  );
  const [availableSections, setAvailableSections] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);

  const handleEditClick = useCallback((photoData) => {
    setPhoto(photoData);
    setModalOpen(true);
  }, []);

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

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const Getclasses = async () => {
    try {
      if (!SchoolID) return;
      const response = await thirdpartyclasses(SchoolID);
      if (response.success) {
        let classes = response.classList;
        localStorage.setItem(
          "classes",
          JSON.stringify(classes.sort((a, b) => a - b))
        );
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

  const getPhotos = async () => {
    if (!SchoolID) return;
    setIsLoader(true);
    try {
      const response = await thirdpartyphotorecords(SchoolID);
      if (response.success) {
        setAllPhotos(response?.data);
        setFilteredPhotos(response?.data);
        setIsLoader(false);
      }
    } catch (error) {
      console.log("error", error);
      setIsLoader(false);
    }
  };

  useEffect(() => {
    getPhotos();
    Getclasses();
  }, [SchoolID, reRender]);

  // Sync external props with internal state
  useEffect(() => {
    setSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  useEffect(() => {
    setSelectedClass(externalSelectedClass);
    setSelectedSection(externalSelectedSection);

    if (externalSelectedClass && externalSelectedClass !== "all") {
      const selectedClassObj = getClass?.find(
        (cls) => cls.className === externalSelectedClass
      );
      if (selectedClassObj) {
        setAvailableSections(selectedClassObj.sections.split(", "));
      } else {
        setAvailableSections([]);
      }
    } else {
      setAvailableSections([]);
    }
  }, [externalSelectedClass, externalSelectedSection, getClass]);

  useEffect(() => {
    let filtered = [...allPhotos];

    if (selectedClass && selectedClass !== "all") {
      filtered = filtered.filter((photo) => photo.class === selectedClass);
    }

    if (selectedSection) {
      filtered = filtered.filter((photo) => photo.section === selectedSection);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((photo) => {
        return (
          photo.studentName?.toLowerCase().includes(lowerCaseSearchTerm) ||
          photo.photoNo?.toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
    }

    setFilteredPhotos(filtered);
  }, [selectedClass, selectedSection, allPhotos, searchTerm]);

  if (!SchoolID) {
    return (
      <div className="text-center mt-10 text-red-500 font-semibold">
        Please Select School
      </div>
    );
  }

  return (
    <>
      {filteredPhotos?.length > 0 ? (
        <>
          <div
            className="bg-gray-800 py-[1px] fixed top-0 w-full z-10"
            style={{ background: "#2fa7db" }}
          >
            <div className="flex justify-around max-w-md mx-auto gap-1">
              <input
                type="text"
                placeholder="Search by Name or Photo No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#2fa7db] text-[#f0592e] border border-white rounded-md px-2 outline-none w-[40vw]"
              />
              <div className="flex flex-col space-y-1">
                <select
                  name="photoClass"
                  className="w-full border-1 bg-gray-800 border-white text-white outline-none py-[3px] bg-inherit"
                  onFocus={(e) => (e.target.style.borderColor = currentColor)}
                  onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                  value={selectedClass}
                  onChange={handleClassChange}
                  required
                >
                  <option value="" disabled>
                    Class
                  </option>
                  {getClass?.map((cls, index) => (
                    <option
                      key={index}
                      value={cls.className}
                      className="text-white bg-gray-800"
                    >
                      {cls?.className === "all"
                        ? "All Classes"
                        : cls?.className}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col space-y-1 mt-[2px]">
                <select
                  name="photoSection"
                  className="w-full border-1 border-white text-white outline-none py-[3px] bg-inherit"
                  onFocus={(e) => (e.target.style.borderColor = currentColor)}
                  onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                  value={selectedSection}
                  onChange={handleSectionChange}
                  required
                  disabled={!selectedClass || selectedClass === "all"}
                >
                  <option value="" disabled>
                    Section
                  </option>
                  {availableSections?.map((item, index) => (
                    <option
                      key={index}
                      value={item}
                      className="text-white bg-gray-800"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="container mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-10">
            {filteredPhotos.map((val, index) => (
              <div
                key={index}
                className="bg-white relative shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] rounded-lg p-4 mb-2 flex items-center justify-between transform hover:scale-105 transition-transform duration-300"
              >
                <div className="text-gray-700 font-semibold text-sm absolute top-2 right-2 gap-2">
                  <div className="flex justify-center items-center gap-3">
                    <p>
                      <span className="bg-indigo-500 text-[8px] px-1 rounded-md shadow-md text-white">
                        T-Party
                      </span>
                    </p>
                    <button
                      className="text-blue-500 hover:text-blue-700 focus:outline-none"
                      onClick={() => handleEditClick(val)}
                    >
                      <FaEdit size={20} />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="mb-1">
                    <p className="text-gray-700 font-semibold text-sm">
                      Name: {val?.studentName || "N/A"}
                    </p>
                    <p className="text-gray-700 text-[12px]">
                      Photo No:{" "}
                      <span className="text-indigo-600 font-bold">
                        {val?.photoNo}
                      </span>
                    </p>
                    <p className="text-gray-700 text-[12px]">
                      Class: {val?.class || "N/A"}-{val?.section || "N/A"}
                    </p>
                    <p className="text-gray-700 text-[12px]">
                      Created: {moment(val?.createdAt).format("DD-MMM-YYYY")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center border">
                  <div className="border-1 border-indigo-400 p-[1px] w-[67px] h-[67px]">
                    <img
                      src={
                        val?.studentImage?.url ||
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"
                      }
                      alt="photo"
                      className="rounded-sm w-16 h-16 object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: { xs: "90%", sm: "80%", md: "50%" },
                  maxWidth: "600px",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  borderRadius: 2,
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Edit Photo</Typography>
                  <IconButton onClick={() => setModalOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <PhotoDynamicFormFields
                  photoData={photo}
                  buttonLabel="Update"
                  setIsOpen={setModalOpen}
                  setReRender={setReRender}
                />
              </Box>
            </Modal>
          </div>
        </>
      ) : (
        <div className="text-center mt-10 text-red-500 font-semibold">
          No Photos
        </div>
      )}
    </>
  );
}

export default AllPhotos;
