import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:3030/users/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  return (
    <>
    <Link className='absolute right-10' to='/allstudent'>Back</Link>
      <h1>User Details</h1>
      <p>Name: {data.name}</p>
      <p>Email: {data.email}</p>
      {/* Add other fields as needed */}



      <div className=" w-full  flex items-center justify-center">
      <div className="bg-white gap-2 p-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px]">
          <div className="w-[300px]  bg-[#01a9ac]  p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <div className=" flex justify-center mt-4">
              <img
                className="w-[150px] h-[150px] rounded-full"
                src="https://cdn.pixabay.com/photo/2017/09/21/19/06/woman-2773007_1280.jpg"
                alt="Image"
              />
            </div>
            <div className="p-8">
              <h2 className="text-center text-lg text-white  ">{data.name}</h2>
              <h2 className="text-center text-white">+9112345678</h2>
              <hr />
              <p className="text-white">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Expedita dolor fugiat voluptas.
              </p>
              <div className="flex justify-center mt-3 ">
                <button className=" bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                  <svg
                    className="fill-current w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                  </svg>
                  <span className="">Download</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-[300px] border-1 rounded-md border-[#01a9ac] p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <h1 className="text-center mb-3">Contact Details</h1>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Email :</h2>
              <span className="font-semibold text-[#01a9ac] text-[12px]  ">
              {data.email}
              </span>
            </div>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Roll No. :</h2>
              <span className="font-semibold text-[#01a9ac]">1001</span>
            </div>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Class :</h2>
              <span className="font-semibold text-[#01a9ac]">10th</span>
            </div>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Section :</h2>
              <span className="font-semibold text-[#01a9ac]">A</span>
            </div>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Subject :</h2>
              <span className="font-semibold text-[#01a9ac]">Hind,Eng</span>
            </div>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">DOB :</h2>
              <span className="font-semibold text-[#01a9ac]">17-05-200</span>
            </div>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px] ">Joinin Date :</h2>
              <span className="font-semibold text-[#01a9ac]">12-sep-2023</span>
            </div>

            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Gender :</h2>
              <span className="font-semibold text-[#01a9ac]">Male</span>
            </div>
          </div>
        </div>
      </div>

      <div className=" w-full  flex items-center justify-center">
        <div className="bg-white gap-2 rounded-lg mt-5 p-8 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px]">
        <div className="w-[300px] border-1 rounded-md border-[#01a9ac] p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <div className="flex justify-between">
              <div>
                <img
                  className="w-[80px] h-[80px] rounded-full"
                  src="https://cdn.pixabay.com/photo/2017/09/21/19/06/woman-2773007_1280.jpg"
                  alt="school logo"
                />
              </div>
              <h2>IDENTITY CARD </h2>
            </div>

            <div>
              <h1 className="text-center text-2xl font-bold text-[#01a9ac]">Model School</h1>
            </div>
            <div className="text-center rounded-sm bg-[#01a9acc2]">
              <h3 className="text-white">Lorem ipsum dolor, sit amet consectetur adipisicing.</h3>
            </div>
            <div className="flex  mt-5">
              <img
                className="w-[110px] h-[140px] rounded-sm"
                src="https://cdn.pixabay.com/photo/2017/09/21/19/06/woman-2773007_1280.jpg"
                alt=""
              />

              <div className=" ml-3">
                <div className="">
                  <h2 className="w-[100px] text-[13px] leading-3">Name :</h2>
                  <span className="font-semibold  text-[14px] my-0 text-[#01a9ac]">
              
                  {data.name}
                  </span>
                </div>
                <div className="my-1">
                  <h2 className="w-[100px] text-[13px] leading-3 ">
                    F/Name :
                  </h2>
                  <span className="font-semibold text-[14px] text-[#01a9ac]">Raj</span>
                </div>
                <div className="flex">
                  <h2 className="w-[60px]">Class. :</h2>
                  <span className="text-[#01a9ac] ">2th - C</span>
                </div>
                <div className="flex ">
                  <h2 className="w-[60px] ">DOB. :</h2>
                  <span className="text-[#01a9ac]">20.05.2000</span>
                </div>
              </div>
            </div>

            <div className="p-2">
              <h2>Address : </h2>
              <span>Lorem ipsum dolor sit, amet consectetur adipisicing.</span>
            </div>
          </div>
          <div className="w-[300px] border-1 rounded-md border-[#01a9ac] p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <h1 className="text-center mb-3">Contact Details</h1>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Email :</h2>
              <span className="font-semibold text-[#01a9ac]   ">
              {data.email}
              </span>
            </div>
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Roll No. :</h2>
              <span className="font-semibold text-[#01a9ac]">1001</span>
            </div>
          
           
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Subject :</h2>
              <span className="font-semibold text-[#01a9ac]">Hind,Eng</span>
            </div>
           
            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px] ">Joinin Date :</h2>
              <span className="font-semibold text-[#01a9ac]">12-sep-2023</span>
            </div>

            <div className="flex justify-start gap-2 ">
              <h2 className="w-[100px]">Gender :</h2>
              <span className="font-semibold text-[#01a9ac]">Male</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default View;
