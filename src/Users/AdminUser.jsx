import React, { useEffect, useState } from "react";
import Button from "../Dynamic/utils/Button";
import { ReactInput } from "../Dynamic/ReactInput/ReactInput";
import { useStateContext } from "../contexts/ContextProvider";
import { updateAdmin,getAdminInfo } from "../Network/AdminApi";
import { toast } from "react-toastify";
import PageHeaderWithBreadcrumb from "../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../Dynamic/BreadcrumbList";

function AdminUser() {
  const { setIsLoader } = useStateContext();
 const [isEdit, setIsEdit]=useState(true)
const user=JSON.parse(localStorage.getItem("user"))
  const [values, setValues] = useState({
    name: "",
    email: "",
    currentpassword: "",
    newpassword: "",
    contact: "",
    schoolName: "",
    address: "",
    logoImage: null,
    image: null,
    Sign: null,
    feeMessage: "",
    admissionMessage: "",
    registrationMessage: "",
    state: "",
    city: "",
    pincode: "",
    SchoolCode:"",
  });

  const getAdminData=async()=>{
    try {
      const response=await getAdminInfo()
      if(response?.success){
        const user=response?.admin
       
        setValues((preV)=>(
          {
            ...preV,
            address:user?.address,
            email:user?.email,
            name: user?.fullName,
            password: user?.newPassword,
            contact: user?.contact,
            schoolName: user?.schoolName,
            logoImage: user?.image?.url,
            feeMessage:user?.feeMessage,
            admissionMessage: user?.admissionMessage,
            registrationMessage: user?.registrationMessage,
            state:user?.schoolState,
            city: user?.schoolCity,
            pincode:user?.pincode,
          }
        ))
      }
    } catch (error) {
      console.log("error",error)
    }
  }

  useEffect(()=>{
if(user){
  setValues((preV)=>(
    {
      ...preV,
      address:user?.address,
      email:user?.email,
      name: user?.fullName,
      password: user?.newPassword,
      contact: user?.contact,
      schoolName: user?.schoolName,
      logoImage: user?.image?.url,
      feeMessage:user?.feeMessage,
      admissionMessage: user?.admissionMessage,
      registrationMessage: user?.registrationMessage,
      state:user?.schoolState,
      city: user?.schoolCity,
      pincode:user?.pincode,
    }
  ))
}
  },[])

  const handleSubmit = async () => {
    debugger
    setIsLoader(true);
const payload={
  email:values?.email|| "",
  schoolName:values?.schoolName|| "",
  fullName:values?.name|| "",
  contact:values?.contact|| "",
  address:values?.address|| "",
  pincode:values?.pincode|| "",
  schoolState:values?.state|| "",
  schoolCity:values?.city|| "",
  admissionMessage:values?.admissionMessage|| "",
  registrationMessage:values?.registrationMessage|| "",
  feeMessage:values?.feeMessage || "",
  newPassword:values?.newpassword|| "",
  currentPassword:values?.currentpassword || "",
  logoImage:values?.logoImage,
  image:values?.image,
}
    const formDataToSend = new FormData();
Object.entries(payload).forEach(([key, value]) => {
  if ((key === "logoImage" || key === "image") && value) {
    formDataToSend.append(key, value);
  } else {
    formDataToSend.append(key, String(value ?? ""));
  }
});
    // Object.entries(payload).forEach(([key, value]) => {
    //   if (key === "logoImage" && value) {
    //     formDataToSend.append(key, value);
    //   } else {
    //     formDataToSend.append(key, String(value));
    //   }
    // });

    try {

      const response = await updateAdmin(formDataToSend)
      if(response?.success){
        setIsEdit(true)
        getAdminData()
        toast?.success(response?.message)
      }
      else{
        toast?.error(response?.message)
      }
      console.log("response",response)
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoader(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues({ ...values, logoImage: file });
    }
  };
  const handleImageChangeADmin = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValues({ ...values, image: file });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleClick=(props)=>{
   
setIsEdit(false)
if(props==="Update"){
  handleSubmit()

}
  }
  return (
    <div className="">
      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Admin Details"/>
      {/* <h1 className="text-xl text-center">Admin Details</h1> */}
     
      <div
        className="bg-white p-2 rounded-lg shadow border border-gray-200 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 px-1 ">
         <ReactInput
    type="text"
    name="name"
    required={false}
    label="Name"
    onChange={handleChange}
    value={values.name}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="SchoolCode"
    required={false}
    label="School Code"
    onChange={handleChange}
    value={values.SchoolCode}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="email"
    required={false}
    label="Email"
    onChange={handleChange}
    value={values.email}
    disabled={isEdit}
  />

{!isEdit &&

(<>
  <ReactInput
  type="text"
  name="currentpassword"
  required={false}
  label="Current Password"
  onChange={handleChange}
  value={values.currentpassword}
  disabled={isEdit}
/>
<ReactInput
  type="text"
  name="newpassword"
  required={false}
  label="New Password"
  onChange={handleChange}
  value={values.newpassword}
  disabled={isEdit}
/>
</>
)}
 
  <ReactInput
    type="text"
    name="contact"
    required={false}
    label="Contact"
    onChange={handleChange}
    value={values.contact}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="alternateNo."
    required={false}
    label="Alt Number"
    onChange={handleChange}
    value={values["alternateNo."]}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="schoolName"
    required={false}
    label="School Name"
    onChange={handleChange}
    value={values.schoolName}
    disabled={isEdit}
  />
  
  <ReactInput
    type="text"
    name="feeMessage"
    required={false}
    label="Fee Message"
    onChange={handleChange}
    value={values.feeMessage}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="admissionMessage"
    required={false}
    label="Admission Message"
    onChange={handleChange}
    value={values.admissionMessage}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="registrationMessage"
    required={false}
    label="Registration Message"
    onChange={handleChange}
    value={values.registrationMessage}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="address"
    required={false}
    label="Address"
    onChange={handleChange}
    value={values.address}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="state"
    required={false}
    label="State"
    onChange={handleChange}
    value={values.state}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="city"
    required={false}
    label="City"
    onChange={handleChange}
    value={values.city}
    disabled={isEdit}
  />
  <ReactInput
    type="text"
    name="pincode"
    required={false}
    label="Pincode"
    onChange={handleChange}
    value={values.pincode}
    disabled={isEdit}
  />
  <ReactInput
    type="file"
    name="logoImage"
    accept="image/*"
    label="Shooo logo"
    onChange={handleImageChange}
  />
  {values.logoImage && (
    <img
      src={user?.logoImage?.url}
      alt="Logo Preview"
      className="w-10 h-10 object-cover rounded-md"
    />
  )}
  <ReactInput
    type="file"
    name="image"
    accept="image/*"
    label="Admin Photo"
    onChange={handleImageChangeADmin}
  />
  {values.image && (
    <img
      src={user?.image?.url}
      alt="Logo Preview"
      className="w-10 h-10 object-cover rounded-md"
    />
  )}
  {/* <ReactInput
    type="file"
    name="Sign"
    accept="image/*"
    label="Principal Sign"
    onChange={handleImageChange}
  /> */}
  {/* {values.Sign && (
    <img
      src={user?.Sign?.url}
      alt="Logo Preview"
      className="w-10 h-10 object-cover rounded-md"
    />
  )} */}
{/* </div> */}


        <div className="mt-4 flex justify-center gap-2">
          <Button name={isEdit?"Edit":"Update"}
         
            width="full" onClick={()=>handleClick(isEdit?"Edit":"Update")} />
          {!isEdit && <Button name="Cancel" color="gray" width="full"  onClick={()=>setIsEdit(true)}/>}
        </div>
      </div>
    </div>
  );
}

export default AdminUser;

