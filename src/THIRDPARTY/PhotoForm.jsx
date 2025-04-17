import React from 'react';
import PhotoDynamicFormFields from './PhotoDynamicFormFields';
import { useStateContext } from '../contexts/ContextProvider';

function PhotoForm({ onClose }) {
  const { currentColor, setIsLoader } = useStateContext();
  const SchoolID = localStorage.getItem("SchoolID");
  
  if (!SchoolID) {
    return <div className="text-center mt-10 text-red-500 font-semibold">Please Select School</div>;
  }
  
  return (
    <>
      <PhotoDynamicFormFields 
        buttonLabel={'Save'}
      />
    </>
  );
}

export default PhotoForm;