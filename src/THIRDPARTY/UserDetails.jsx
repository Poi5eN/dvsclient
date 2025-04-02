import React, { useEffect, useState } from 'react';
import { useStateContext } from '../contexts/ContextProvider';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';

const UserDetails = () => {
  const [response, setResponse] = useState(null);
const {
    currentColor,
    isFullScreen, setIsFullScreen,toggleFullScreen
  } = useStateContext();
  useEffect(() => {
    // const storedResponse = sessionStorage.getItem('response');
    const storedResponse = localStorage.getItem("user");
   
    if (storedResponse) {
      try {
        setResponse(JSON.parse(storedResponse));
      } catch (error) {
        console.error('Error parsing sessionStorage response:', error);
        sessionStorage.removeItem('response');
      }
    }
  }, []);

  if (!response) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  const { name, email, assignedSchools } = response;
  const handleLogout = () => {
    localStorage.clear();
    setTimeout(() => (window.location.href = "/login"), 100); 
   
  };
  const handleClicked=()=>{
    setIsFullScreen(!isFullScreen)
    toggleFullScreen()
  }

  return (
    <div className="h-full bg-gray-100 py-6 flex flex-col justify-center sm:py-12 ">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto ">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-[#f0592e] shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
          <div   className="py-2 text-center flex justify-center">
                       <button
                        onClick={()=>handleClicked()}
                        className="py-2 border-none"
                        style={{ color: currentColor }}
                       >
                        {isFullScreen ? <MdFullscreenExit className="text-[50px] text-[#f0592e]" title="Fullscreen Exit " /> : <MdFullscreen className="text-[50px] text-[#f0592e] " title="full screen" />}
                       </button>
                    </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                Welcome, {name}!
              </h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-4 text-base leading-6 space-y-2 text-gray-700 sm:text-lg sm:leading-7">
                <p>
                  <span className="font-medium">Name:</span> {name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {email}
                </p>
                {assignedSchools && assignedSchools.length > 0 && (
                  <p>
                    <span className="font-medium">Assigned Schools:</span>
                    {assignedSchools.map((val,ind)=>(
<>
<p>{ind+1}. {val?.schoolName}</p>
</>
                    ))}
                  </p>
                )}
              </div>
             
              <div className="pt-4 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                <button
                  onClick={handleLogout}
                  className="transition duration-200 bg-[#26aadf] hover:bg-[#f0592e] focus:bg-[#26aadf] focus:shadow-sm focus:ring-4 focus:ring-opacity-50 focus:ring-red-500 text-white w-full py-2.5 rounded-lg shadow-sm hover:shadow-md font-semibold text-center inline-block"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
