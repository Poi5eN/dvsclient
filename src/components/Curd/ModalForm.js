import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const ModalForm = ({ isOpen, onRequestClose, onFormSubmit }) => {
  const [inputData, setInputData] = useState({
    name: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData({
      ...inputData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send data to the server
    axios.post('http://localhost:3030/users', inputData)
      .then((res) => {
        alert('Data posted successfully!');
        setInputData({ name: '', email: '' }); // Clear the form
        onRequestClose(); // Close the modal
        onFormSubmit(); // Notify the parent component to refresh the table
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={customStyles}
        contentLabel="Modal Form"
        overlayClassName="overlay"
      >
        <div>
          <h2>Submit Form</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={inputData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={inputData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </Modal>
  );
};

export default ModalForm;

