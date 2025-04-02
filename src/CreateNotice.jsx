import React, { useState } from "react";
import Modal from "react-modal";

// Ensure that the modal is accessible to screen readers
Modal.setAppElement("#root");

const CreateNotice = () => {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    pdfFile: null,
  });
  const [editingNotice, setEditingNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNoticeSubmit = () => {
    if (editingNotice !== null) {
      // Update an existing notice
      const updatedNotices = [...notices];
      updatedNotices[editingNotice] = newNotice;
      setNotices(updatedNotices);
      setEditingNotice(null);
    } else {
      // Create a new notice
      setNotices([...notices, newNotice]);
    }

    setNewNotice({ title: "", content: "", pdfFile: null });
    setIsModalOpen(false);
  };

  const handleEditNotice = (index) => {
    const noticeToEdit = notices[index];
    setNewNotice(noticeToEdit);
    setEditingNotice(index);
    setIsModalOpen(true);
  };

  const handleDeleteNotice = (index) => {
    const updatedNotices = [...notices];
    updatedNotices.splice(index, 1);
    setNotices(updatedNotices);
  };

  return (
    <div className=" dark:text-gray-200 dark:bg-secondary-dark-bg  p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-gray-800  dark:text-white mb-6">
        Notice Board
      </h1>

      {/* Create Notice Button */}
      <button
        onClick={() => {
          setIsModalOpen(true);
          setEditingNotice(null);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
      >
        Create Notice
      </button>

      {/* Modal for Creating/Editing Notice */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setEditingNotice(null);
        }}
        className="w-96 bg-white p-6 rounded-lg shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-5">
          {editingNotice !== null ? "Edit Notice" : "Create Notice"}
        </h2>
        <form className="space-y-4 py-2">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 border border-gray-300 rounded"
            value={newNotice.title}
            onChange={(e) =>
              setNewNotice({ ...newNotice, title: e.target.value })
            }
          />
          <textarea
            placeholder="Content"
            className="w-full p-2 border border-gray-300 rounded"
            value={newNotice.content}
            onChange={(e) =>
              setNewNotice({ ...newNotice, content: e.target.value })
            }
          />
          <input
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setNewNotice({ ...newNotice, pdfFile: e.target.files[0] })
            }
          />
          <button
            type="button"
            onClick={handleNoticeSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingNotice !== null ? "Save Changes" : "Add Notice"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(false);
              setEditingNotice(null);
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </form>
      </Modal>

      {/* Display Notices */}
      <div className=" p-3 overflow-y-auto h-[200px] rounded-md">
        <ul className="overflow-auto ">
          {notices.map((notice, index) => (
            <li key={index} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {notice.title}
              </h2>
              <p className="text-gray-600">{notice.content}</p>
              {notice.pdfFile && (
                <a
                  href={URL.createObjectURL(notice.pdfFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View PDF
                </a>
              )}
              <div className="mt-4">
                <button
                  onClick={() => handleEditNotice(index)}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNotice(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CreateNotice;
