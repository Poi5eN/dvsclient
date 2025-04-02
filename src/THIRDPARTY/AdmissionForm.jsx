import React from 'react';

import DynamicFormFileds from '../Dynamic/Form/Admission/DynamicFormFields';

function AdmissionForm({ onClose }) {


    return (
        <>
           <DynamicFormFileds 
            buttonLabel={'Save'}
       
              />
         
        </>
    );
}

export default AdmissionForm;
