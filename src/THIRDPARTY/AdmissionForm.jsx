import React from 'react';

import DynamicFormFileds from '../Dynamic/Form/Admission/DynamicFormFields';
import { useStateContext } from '../contexts/ContextProvider';

function AdmissionForm({ onClose }) {
  const { currentColor,setIsLoader, } = useStateContext();
  const SchoolID = localStorage.getItem("SchoolID");
  if (!SchoolID) {
    return <div className="text-center mt-10 text-red-500 font-semibold">Please Select School</div>;
  }
    return (
        <>
           <DynamicFormFileds 
            buttonLabel={'Save'}
       
              />
         
        </>
    );
}

export default AdmissionForm;
