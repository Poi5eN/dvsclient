import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './getCroppedImg';

// Modal component (as before)
const Modal = ({ isOpen, setIsOpen, title, children, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                    <div className="mt-2 px-7 py-3">
                        {children}
                    </div>
                    <div className="items-center px-4 py-3">
                        <button
                            className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 mr-2"
                            onClick={onSave} // Call the onSave function
                        >
                            Save
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function Thirdparty() {
    // Initial array of 10 student data objects
    const initialStudents = Array(10).fill({
        photo: 'https://via.placeholder.com/150', // Default placeholder image
        name: 'John Doe',
        class: '10th',
        rollNo: '12345',
        admissionNo: '67890',
        fatherName: 'Mr. Smith',
        mobileNo: '9876543210',
        address: '123 Main Street, Anytown',
        guardianName: '',
        remarks: '',
        transport: '',
        motherName: '',
        motherPhoto: null,
        fatherPhoto: null,
        guardianPhoto: null,
    });

    const [students, setStudents] = useState(initialStudents);

    // State for the modal
    const [modalOpen, setModalOpen] = useState(false);

    // State to track the currently editing student index
    const [editingIndex, setEditingIndex] = useState(null);

    // State for the image cropping
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [croppedImageSource, setCroppedImageSource] = useState(null); // Use this for the Cropper

    // New State added to identify the current Photo being changed
    const [currentPhotoField, setCurrentPhotoField] = useState(null);

    // Wrap state updates with useCallback
    const setStudentsCallback = useCallback(setStudents, []);
    const setCroppedImageSourceCallback = useCallback(setCroppedImageSource, []);
    const setCurrentPhotoFieldCallback = useCallback(setCurrentPhotoField, []);

    // Function to handle input field changes (for the currently edited student)
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setStudentsCallback(prevStudents =>
            prevStudents.map((student, index) =>
                index === editingIndex ? { ...student, [name]: value } : student
            )
        );
    }, [editingIndex, setStudentsCallback]);

    // Function to handle photo input changes (for the currently edited student)
    const handlePhotoChange = useCallback((e, photoField) => {
        const { files } = e.target;
        setCurrentPhotoFieldCallback(photoField);
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setCroppedImageSourceCallback(reader.result);
            };
            reader.readAsDataURL(files[0]);
        }
    }, [setCroppedImageSourceCallback, setCurrentPhotoFieldCallback]);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            if (!croppedImageSource || !croppedAreaPixels) {
                console.error("Cannot crop image: imageSrc or croppedAreaPixels is missing.");
                return;
            }

            const croppedImageURL = await getCroppedImg(croppedImageSource, croppedAreaPixels);

            setCroppedImageSourceCallback(null); // Hide the Cropper
            setStudentsCallback(prevStudents =>
                prevStudents.map((student, index) =>
                    index === editingIndex ? { ...student, [currentPhotoField]: croppedImageURL } : student
                )
            );
            setCurrentPhotoFieldCallback(null);
        } catch (error) {
            console.error("Error cropping image:", error);
        }
    }, [croppedAreaPixels, croppedImageSource, editingIndex, currentPhotoField, setStudentsCallback, setCurrentPhotoFieldCallback, setCroppedImageSourceCallback]);

    // Function to open the modal and set the editing index
    const handleAddClick = useCallback((index) => {
        setEditingIndex(index);
        setModalOpen(true);
    }, []);

    // Function to save the changes and close the modal
    const handleSaveClick = useCallback(() => {
        setModalOpen(false);
        setEditingIndex(null);

        //persist the data to state
        console.log("Saved students data:", students);
    }, [students]);

    return (
        <div className="container mx-auto p-4">
            {students.map((student, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center">
                {/* Student Photo */}
              
            
                {/* Student Information */}
                <div>
                    <div className="mb-2">
                        <p className="text-gray-700 font-semibold">Name: {student.name}</p>
                        <p className="text-gray-700">Class: {student.class}</p>
                        <p className="text-gray-700">Roll No: {student.rollNo}</p>
                        <p className="text-gray-700">Adm No: {student.admissionNo}</p>
                        <p className="text-gray-700">Father Name: {student.fatherName}</p>
                        <p className="text-gray-700">Mobile No: {student.mobileNo}</p>
                        <p className="text-gray-700">Address: {student.address}</p>
                    </div>
            
                    {/* "Add" Button */}
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={() => handleAddClick(index)} // Open modal for this student
                    >
                        Add More Info
                    </button>
                </div>
                <div className="mr-4"> {/* Add margin to separate image and details */}
                    <img src={student.photo} alt="Student" className="rounded-sm w-24 h-24 object-cover" /> {/* w-24 = 6rem = 96px (close to 100px), h-24 for square */}
                </div>
            </div>
                // <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4">
                //     {/* Student Photo */}
                //     <div className="flex justify-center mb-4">
                //         <img src={student.photo} alt="Student" className="rounded-full w-32 h-32 object-cover" />
                //     </div>

                //     {/* Student Information */}
                //     <div className="mb-2">
                //         <p className="text-gray-700 font-semibold">Name: {student.name}</p>
                //         <p className="text-gray-700">Class: {student.class}</p>
                //         <p className="text-gray-700">Roll No: {student.rollNo}</p>
                //         <p className="text-gray-700">Admission No: {student.admissionNo}</p>
                //         <p className="text-gray-700">Father Name: {student.fatherName}</p>
                //         <p className="text-gray-700">Mobile No: {student.mobileNo}</p>
                //         <p className="text-gray-700">Address: {student.address}</p>
                //     </div>

                //     {/* "Add" Button */}
                //     <button
                //         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                //         type="button"
                //         onClick={() => handleAddClick(index)} // Open modal for this student
                //     >
                //         Add/Edit
                //     </button>
                // </div>
            ))}

            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                setIsOpen={setModalOpen}
                title="Additional Information"
                onSave={handleSaveClick} // Pass the save function
            >
                {/* Content of the modal (additional fields) */}
                {editingIndex !== null && (
                    <div className="mt-4">
                        {croppedImageSource ? (
                            <div className='relative w-full aspect-square'>
                                <Cropper
                                    image={croppedImageSource}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
                                    <button
                                        onClick={() => setCroppedImageSource(null)}
                                        className='bg-red-500 text-white py-2 px-4 rounded'>
                                        Cancel Crop
                                    </button>
                                    <button
                                        onClick={showCroppedImage}
                                        className='bg-blue-500 text-white py-2 px-4 rounded'>
                                        Crop Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Guardian Name */}
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianName">
                                        Guardian Name:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="guardianName"
                                        name="guardianName"
                                        type="text"
                                        placeholder="Guardian Name"
                                        value={students[editingIndex].guardianName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Remarks */}
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="remarks">
                                        Remarks:
                                    </label>
                                    <textarea
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="remarks"
                                        name="remarks"
                                        placeholder="Remarks"
                                        value={students[editingIndex].remarks}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Transport */}
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="transport">
                                        Transport:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="transport"
                                        name="transport"
                                        type="text"
                                        placeholder="Transport"
                                        value={students[editingIndex].transport}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Mother Name */}
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherName">
                                        Mother Name:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="motherName"
                                        name="motherName"
                                        type="text"
                                        placeholder="Mother Name"
                                        value={students[editingIndex].motherName}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Mother Photo */}
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motherPhoto">
                                        Mother Photo:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="motherPhoto"
                                        name="motherPhoto"
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Use the camera to capture
                                        onChange={(e) => handlePhotoChange(e, 'motherPhoto')}
                                    />
                                    {students[editingIndex].motherPhoto && (
                                        <img
                                            src={students[editingIndex].motherPhoto}
                                            alt="Mother"
                                            className="rounded-sm w-20 h-20 object-cover mt-2"
                                        />
                                    )}
                                </div>

                                {/* Father Photo */}
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fatherPhoto">
                                        Father Photo:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="fatherPhoto"
                                        name="fatherPhoto"
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Use the camera to capture
                                        onChange={(e) => handlePhotoChange(e, 'fatherPhoto')}
                                    />
                                    {students[editingIndex].fatherPhoto && (
                                        <img
                                            src={students[editingIndex].fatherPhoto}
                                            alt="Father"
                                            className="rounded-sm w-20 h-20 object-cover mt-2"
                                        />
                                    )}
                                </div>

                                {/* Guardian Photo */}
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardianPhoto">
                                        Guardian Photo:
                                    </label>
                                    <input
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        id="guardianPhoto"
                                        name="guardianPhoto"
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Use the camera to capture
                                        onChange={(e) => handlePhotoChange(e, 'guardianPhoto')}
                                    />
                                    {students[editingIndex].guardianPhoto && (
                                        <img
                                            src={students[editingIndex].guardianPhoto}
                                            alt="Guardian"
                                            className="rounded-sm w-20 h-20 object-cover mt-2"
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Thirdparty;

