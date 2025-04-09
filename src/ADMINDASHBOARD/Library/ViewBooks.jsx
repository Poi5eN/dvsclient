// ViewProfile.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { FcLeft } from "react-icons/fc";

// import "../Dynamic/Form/FormStyle.css";

const ViewBooks = () => {
  const authToken = localStorage.getItem("token");
  const { _id } = useParams();
  console.log(_id)

  const [bookData, setBookData] = useState({});

  useEffect(() => {
    // Fetch teacher data based on the email parameter
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getAllBooks?_id=${_id}`, {withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },}
      )
      .then((response) => {
        const data = response.data.listOfAllBooks[0];
        setBookData(data);
      })
      .catch((error) => {
        console.error("Error fetching book data:", error);
      });
  }, []);

  return (
    <>



      <div className=" w-full   flex items-center justify-center pt-10 ">
        {/* <div className="bg-white   gap-2 sm:p-4 md:p-4 lg:p-4 p-2 pt-16 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px]   overflow-y-auto"> */}
          {/* <div className="w-[330px]  bg-[#01a9ac]  p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <div className="absolute bg-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-2xl">
              <Link to="/admin/books" className=" text-blue-500 text-3xl">
                <FcLeft />
              </Link>
            </div>
           
           
          </div> */}


          <div className=" bg-white border-1 rounded-md border-[#01a9ac] p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
           
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Book Name:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {bookData.bookName}
              </span>
            </div>
           
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Author Name:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {bookData.authorName}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Quantity:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px] overflow-hidden">
                {" "}
                {bookData.quantity}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Category:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px] overflow-hidden">
                {" "}
                {bookData.category}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Class Name:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px] overflow-hidden">
                {" "}
                {bookData.className}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Subject:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px] overflow-hidden">
                {" "}
                {bookData.subject}
              </span>
            </div>
           
           
          </div>
        

        </div>
      {/* </div> */}
    </>
  );
};

export default ViewBooks;
