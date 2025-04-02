import React, { useState } from 'react';
import Create_Registration_Form from './Create_Registration_Form';
import ThirdPartyAdmission from './ThirdPartyAdmission';
import Button from '../../Dynamic/utils/Button';

const Registration = () => {
  const [activeComponent, setActiveComponent] = useState('create'); // 'create' or 'thirdParty'

  const handleCreateClick = () => {
    setActiveComponent('create');
  };

  const handleThirdPartyClick = () => {
    setActiveComponent('thirdParty');
  };

  return (
    <div>
  <div className="flex justify-end w-full relative right-2 mt-1">
    {activeComponent === 'thirdParty' ? (
      <Button onClick={handleCreateClick} name="Admin Admission" />
    ) : (
      <Button onClick={handleThirdPartyClick} name="Third Party Admission" />
    )}
  </div>

  {activeComponent === 'create' && <Create_Registration_Form />}
  {activeComponent === 'thirdParty' && <ThirdPartyAdmission />}
</div>

    // <div 
    // // className='relative'
    // >
    //   <div 
    //   className='absolute right-5'
    //   >
    //     {
    //       activeComponent === 'thirdParty' ? ( 
    //          <Button onClick={handleCreateClick}  name="Admin Admission"/>
       
    //       ):( 
    //         <Button onClick={handleThirdPartyClick} name="Third Party Admission"/>
    //        )
    //     }
    //   </div>

    //   {activeComponent === 'create' && <Create_Registration_Form />}
    //   {activeComponent === 'thirdParty' && <ThirdPartyAdmission />}
    // </div>
  );
};

export default Registration;




// import React from 'react'
// import Create_Registration_Form from './Create_Registration_Form'

// const Registration = () => {
//   return (
//     <div>
//   <Create_Registration_Form/>

//     </div>
//   )
// }

// export default Registration