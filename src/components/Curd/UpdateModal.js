
import Modal from 'react-modal';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { handleChange } from './FormHelpers';

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
const UpdateModal = (props) => {
    const { isOpen, onRequestClose } = props;
    const { id } = useParams();
    const navigate = useNavigate();
  
    const [inputData, setInputData] = useState({
      name: "",
      email: "",
    });
  
    useEffect(() => {
      axios.get(`http://localhost:3030/users/${id}`)
        .then((res) => setInputData(res.data))
        .catch((err) => console.log(err));
    }, [id]);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      axios.put(`http://localhost:3030/users/${id}`, inputData) // Use axios.put for updating
        .then((res) => {
          alert("Data updated successfully!");
          navigate("/allstudent");
        })
        .catch((err) => console.log(err));
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

export default UpdateModal;

