import React, { useState, useEffect } from 'react';
import axios from 'axios';


const API_GET_DATA = "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllNotice";


const ParentNotice = () => {
  const authToken = localStorage.getItem("token");
  const [notice, setNotices] = useState([]);
  

  
      useEffect(() => {
            // GET Request to fetch existing notices
            axios.get(API_GET_DATA,{
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              }
            })
              .then((response) => {
                console.log('yes', response.data)
                const { allNotice } = response.data
                console.log("getData--->", allNotice);
                setNotices(allNotice);
              })
              .catch((error) => {
                console.error('Error fetching notices:', error);
              });
          }, []);


          
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div className=' p-3'>
        {/* <h3>hello</h3> */}
        {/* <h1 className='text-4xl font-bold text-center mb-4'>Notice Board</h1> */}
        
    
    {
      notice.map((item, index) => (
       
        <div className="py-2 px-4 text-black   bg-white rounded-lg shadow-lg mb-3">
          <div className="wrapper" key={index}> 
            <h2 className="text-xl text-red-500 font-medium leading-2xl mb-4 text-left">{item.title}</h2>
            <p className="text-base text-left">
              
              {isExpanded ? item.content : item.content.substring(0, 150)}
              {item.content.length > 200 && !isExpanded && <span>...</span>}
            </p>

            {item.file && (
              <a
                href={item.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-left"
              >
                View 
              </a>
            )}
            
            {/* <p className="mt-3">
              <button className="btn btn-primary text-black hover:opacity-75 transition duration-250" onClick={toggleContent}>
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            </p> */}
          </div>
        </div>
     
        )

      )
    }


</div>
 </>
  );
};

export default ParentNotice;