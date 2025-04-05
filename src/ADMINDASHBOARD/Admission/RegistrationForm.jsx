import React, { useState } from 'react';
import Create_Registration_Form from './Create_Registration_Form';
import ThirdPartyAdmission from './ThirdPartyAdmission';

const RegistrationForm = () => {
  const [activeComponent, setActiveComponent] = useState('create'); // 'create' or 'thirdParty'

  const handleCreateClick = () => {
    setActiveComponent('create');
  };

  const handleThirdPartyClick = () => {
    setActiveComponent('thirdParty');
  };

  return (
    <div>
      <div>
        <button onClick={handleCreateClick} disabled={activeComponent === 'create'}>
          Create Registration
        </button>
        <button onClick={handleThirdPartyClick} disabled={activeComponent === 'thirdParty'}>
          Third Party Admission cvvf
        </button>
      </div>

      {activeComponent === 'create' && <Create_Registration_Form />}
      {activeComponent === 'thirdParty' && <ThirdPartyAdmission />}
    </div>
  );
};

export default RegistrationForm;

// import React from 'react'
// import Create_Registration_Form from './Create_Registration_Form'
// import ThirdPartyAdmission from './ThirdPartyAdmission'

// const RegistrationForm = () => {
//   return (
//     <div>
//       <Create_Registration_Form/>
//       <ThirdPartyAdmission/>
//     </div>
//   )
// }

// export default RegistrationForm
