




import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useStateContext } from "../contexts/ContextProvider";
import { CiEdit } from "react-icons/ci";
import { TiDelete } from "react-icons/ti";
import { GrFormView } from "react-icons/gr";
import Button from "../Dynamic/utils/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Lottie from "react-lottie";
import animationData from "../assets/Notice.json";

import "swiper/css";
import "swiper/css/pagination";
import "@tailwindcss/line-clamp"; // make sure this plugin is installed & enabled

Modal.setAppElement("#root");

const API_BASE_URL = "https://dvsserver.onrender.com/api/v1/adminRoute/notice";
const API_EDIT = "https://dvsserver.onrender.com/api/v1/adminRoute/notice/";
const API_DELETE = "https://dvsserver.onrender.com/api/v1/adminRoute/notice";
const API_GET_DATA = "https://dvsserver.onrender.com/api/v1/adminRoute/notice";

const TeacherNotice = () => {
  const [loading, setLoading] = useState(false);
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();

  const [notice, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [editingNotice, setEditingNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const handleEditNotice = (index) => {
    setEditingNotice(index);
    setIsModalOpen(true);
    const item = notice[index];
    setNewNotice({
      title: item?.title || "",
      content: item?.content || "",
      image: item?.image || null,
    });
  };

  const handleViewNotice = (index) => {
    const item = notice[index];
    setNewNotice({
      title: item?.title || "",
      content: item?.content || "",
      image: item?.image || null,
    });
    setViewModalOpen(true);
  };

  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", newNotice.title);
    formData.append("content", newNotice.content);
    if (newNotice.image) {
      formData.append("image", newNotice.image);
    }

    const request =
      editingNotice !== null
        ? axios.put(API_EDIT + notice[editingNotice].noticeId, formData, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          })
        : axios.post(API_BASE_URL, formData, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          });

    request
      .then(() => {
        setShouldFetchData((prev) => !prev);
        setIsModalOpen(false);
        setNewNotice({ title: "", content: "", image: null });
      })
      .catch((error) => {
        console.error("Error saving notice:", error);
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteNotice = (index) => {
    const noticeId = notice[index].noticeId;
    axios
      .delete(`${API_DELETE}/${noticeId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => {
        setNotices((prev) => prev.filter((_, i) => i !== index));
      })
      .catch((error) => {
        console.error("Error deleting notice:", error);
      });
  };

  useEffect(() => {
    axios
      .get(API_GET_DATA, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        setNotices(res.data?.notices || []);
      })
      .catch((error) => {
        console.error("Error fetching notices:", error);
      });
  }, [shouldFetchData]);

  return (
    <div className="relative w-full h-full flex flex-col rounded-lg dark:text-white dark:bg-secondary-dark-bg px-4 py-2 overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        <Button
          name="Create"
          onClick={() => {
            setIsModalOpen(true);
            setEditingNotice(null);
          }}
        />
        <span className="text-xl font-bold text-[#33ace0]">NOTICE</span>
      </div>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onRequestClose={() => setViewModalOpen(false)}
        className="w-[95%] sm:w-[600px] md:w-[700px] max-h-[85vh] overflow-y-auto dark:text-white bg-gray-100 dark:bg-secondary-dark-bg p-6 rounded-xl shadow-2xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-[9998]"
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: currentColor }}
        >
          Full Notice
        </h2>
        <div className="space-y-4">
          <h3 className="font-bold text-lg">{newNotice.title}</h3>
          <p className="whitespace-pre-wrap text-sm">{newNotice.content}</p>
          {newNotice.image && (
            <div className="mt-2">
              <img
                src={
                  typeof newNotice.image === "string"
                    ? newNotice.image
                    : URL.createObjectURL(newNotice.image)
                }
                alt="notice"
                className="w-full h-auto rounded"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setEditingNotice(null);
        }}
        className="w-[95%] sm:w-[600px] md:w-[700px] max-h-[85vh] overflow-y-auto dark:text-white bg-gray-100 dark:bg-secondary-dark-bg p-6 rounded-xl shadow-2xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-[9998]"
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: currentColor }}
        >
          {editingNotice !== null ? "Edit Notice" : "Create Notice"}
        </h2>
        <form className="space-y-4" onSubmit={handleNoticeSubmit}>
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 border border-gray-300 rounded dark:text-white dark:bg-secondary-dark-bg"
            value={newNotice.title}
            onChange={(e) =>
              setNewNotice({ ...newNotice, title: e.target.value })
            }
          />
          <textarea
            placeholder="Content"
            className="w-full p-2 border border-gray-300 rounded dark:text-white dark:bg-secondary-dark-bg"
            value={newNotice.content}
            onChange={(e) =>
              setNewNotice({ ...newNotice, content: e.target.value })
            }
          />
          <input
            type="file"
            onChange={(e) =>
              setNewNotice({ ...newNotice, image: e.target.files[0] })
            }
            className="dark:text-white"
          />
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
            <Button
              loading={loading}
              name={editingNotice !== null ? "Save" : "Add"}
              onClick={handleNoticeSubmit}
              width="full"
            />
            <Button
              name="Cancel"
              onClick={() => setIsModalOpen(false)}
              width="full"
            />
          </div>
        </form>
      </Modal>

      {/* Swiper Section */}
      <div className="flex-grow w-full h-full relative z-10">
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop
          className="w-full h-full"
        >
          {notice.map((noticeItem, index) => (
            <SwiperSlide
              key={index}
              className="flex items-center justify-center"
            >
              <div className="relative w-full h-full max-w-3xl flex flex-col justify-center items-center bg-white dark:text-white dark:bg-secondary-dark-bg p-4 sm:p-6 rounded-lg border shadow-md mx-auto transition-all">
                <div className="absolute top-6 right-4 z-20 flex gap-3 text-lg">
                  <GrFormView
                    className="cursor-pointer text-blue-500 hover:scale-110 transition"
                    onClick={() => handleViewNotice(index)}
                  />
                  <CiEdit
                    className="cursor-pointer text-green-600 hover:scale-110 transition"
                    onClick={() => handleEditNotice(index)}
                  />
                  <TiDelete
                    className="cursor-pointer text-red-500 hover:scale-110 transition"
                    onClick={() => handleDeleteNotice(index)}
                  />
                </div>
                <p
                  className="uppercase font-bold text-xs mb-1"
                  style={{ color: currentColor }}
                >
                  {noticeItem.role}
                </p>
                <h3 className="text-lg font-semibold text-center line-clamp-1">
                  {noticeItem.title}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 text-center max-w-md line-clamp-2">
                  {noticeItem.content}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Speaker Animation (hidden on mobile) */}
      <div className="absolute bottom-8 left-8 z-[999] hidden md:block">
        <Lottie
          options={{ animationData, loop: true, autoplay: true }}
          height={100}
          width={100}
        />
      </div>
    </div>
  );
};

export default TeacherNotice;