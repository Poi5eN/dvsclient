import axios from "axios";


// const baseURL = "https://dvsserver.onrender.com/api/v1/" || process.env.REACT_APP_API_BASE_URL;
const baseURL = "https://dvsserver.onrender.com/api/v1/" || process.env.REACT_APP_API_BASE_URL;
// const baseURL = "https://dvsserver.onrender.com/api/v1/" || process.env.REACT_APP_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let globalErrorFlag = false;

// Debounce function to prevent multiple error notifications
export const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Logout function: clears storage and redirects to login
const logOut = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/login";
};

// Global error notifier with debounce
const globalErrorNotifier = debounce(() => {
  globalErrorFlag = false;
  logOut();
}, 1000);

// Main API Request Function
const makeApiRequest = async (url, options, header) => {
  const { method, payloadData } = options;
  const lowerCaseMethod = method.toLowerCase();

  // ✅ Fetch latest token from localStorage
  const authToken = localStorage.getItem("token");

  // Automatically decide content type: JSON for objects, FormData for uploads
  const contentType = header || (payloadData instanceof FormData ? "multipart/form-data" : "application/json");

  const headers = {
    "Content-Type": contentType,
    Authorization: authToken ? `Bearer ${authToken}` : undefined,
  };

  const fullURL = `${baseURL}${url}`;

  try {
    let response;

    // Dynamically handle all HTTP methods
    switch (lowerCaseMethod) {
      case "get":
        response = await axiosInstance.get(fullURL, { headers });
        break;
      case "post":
        response = await axiosInstance.post(fullURL, payloadData, { headers });
        break;
      case "put":
        response = await axiosInstance.put(fullURL, payloadData, { headers });
        break;
      case "patch":
        response = await axiosInstance.patch(fullURL, payloadData, { headers });
        break;
      case "delete":
        response = await axiosInstance.delete(fullURL, { headers });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (error) {
    console.error("API Error:", error);

    if (error.response && error.response.status === 401) {
      if (!globalErrorFlag) {
        globalErrorFlag = true;
        globalErrorNotifier();
      }
    }

    return error.response?.data || { success: false, message: "Network problem,Please Refresh The Page " };
  }
};

export default makeApiRequest;



// import axios from "axios";
// import Cookies from 'js-cookie';

// const authToken = Cookies.get('token');
// const baseURL = "https://dvsserver.onrender.com/api/v1/" || process.env.REACT_APP_API_BASE_URL;

// const axiosInstance = axios.create({
//   baseURL: baseURL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// let globalErrorFlag = false;

// // Debounce function to prevent multiple error notifications
// export const debounce = (func, wait) => {
//   let timeout;
//   return function (...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(this, args), wait);
//   };
// };

// // Global error notifier with debounce
// const globalErrorNotifier = debounce((message) => {
//   globalErrorFlag = false;
//   logOut();
// }, 1000);

// // Logout function: clears storage and redirects to login
// const logOut = () => {
//   localStorage.clear();
//   window.location.href = "/login";
// };

// // Main API Request Function
// const makeApiRequest = async (url, options, header) => {
//   const { method, payloadData } = options;
//   const lowerCaseMethod = method.toLowerCase();

//   // Automatically decide content type: JSON for objects, FormData for uploads
//   const contentType = header || (payloadData instanceof FormData ? "multipart/form-data" : "application/json");

//   const headers = {
//     "Content-Type": contentType,
//     Authorization: authToken ? `Bearer ${authToken}` : undefined,
//   };

//   const fullURL = `${baseURL}${url}`;

//   try {
//     let response; 

//     // Dynamically handle all HTTP methods
//     switch (lowerCaseMethod) {
//       case "get":
//         response = await axiosInstance.get(fullURL, { headers });
//         break;
//       case "post":
//         response = await axiosInstance.post(fullURL, payloadData, { headers });
//         break;
//       case "put":
//         response = await axiosInstance.put(fullURL, payloadData, { headers });
//         break;
//       case "patch":
//         response = await axiosInstance.patch(fullURL, payloadData, { headers });
//         break;
//       case "delete":
//         response = await axiosInstance.delete(fullURL, { headers });
//         break;
//       default:
//         throw new Error(`Unsupported method: ${method}`);
//     }

//     return response.data;
//   } catch (error) {
//     console.error("API Error:", error);

//     if (
//       error.response &&
//       (error.response.status === 401 || error.response.statusText === "Please authenticate")
//     ) {
//       if (!globalErrorFlag) {
//         globalErrorFlag = true;
//         globalErrorNotifier(error.response.statusText);
//       }
//     }
//     return error.response;
//   }
// };

// export default makeApiRequest;





// import axios from "axios";
// import Cookies from 'js-cookie';
// const authToken = Cookies.get('token');
// // import { notify } from "../utils/utils";
// // import { useLocalStorage } from "../utils/hooks/useLocalStorage";
// // const baseurl = import.meta.env.VITE_APP_REACT_APP_BASE_URL;
// const baseURL =   "https://dvsserver.onrender.com/api/v1/" || process.env.REACT_APP_API_BASE_URL ;

// const axiosInstance = axios.create({
//   baseURL: baseURL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// let globalErrorFlag = false;

// export const debounce = (func, wait) => {
//   let timeout;
//   return function (...args) {
//     const context = this;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), wait);
//   };
//   // return (...args) => {
//   //   clearTimeout(timeout);
//   //   timeout = setTimeout(() => func.apply(this, args), wait);
//   // };
// };

// const globalErrorNotifier = debounce((message) => {
//   // notify(message, "error");
//   globalErrorFlag = false;
//   logOut();
// }, 1000);

// const logOut = () => {
//   localStorage.clear();
//   window.location.href = "/login";
 
// };

// const makeApiRequest = async (url, options, header) => {
  
  
//   const { method, payloadData } = options;
//   const lowerCaseMethod = method.toLowerCase();

//   const headers = {
//     // "Content-Type": header ? header : "multipart/form-data",
//     "Content-Type": header ? header : "application/json",
//     Authorization: authToken && `Bearer ${authToken}`,
//   };

//   const fullURL = `${baseURL}${url}`;

//   try {
//     let response; // Declare response here
//     if (lowerCaseMethod === 'get') {
//         response = await axiosInstance.get(fullURL, { headers }); // No payload for GET
//     } else if (lowerCaseMethod === 'post') {
//         response = await axiosInstance.post(fullURL, payloadData, { headers }); // Pass payload as data
//     } else if (lowerCaseMethod === 'put') {
//         response = await axiosInstance.put(fullURL, payloadData, { headers }); // Pass payload as data
//     }
//      else if (lowerCaseMethod === 'patch') {
//         response = await axiosInstance.patch(fullURL, payloadData, { headers }); // Pass payload as data
//     }
//      else if (lowerCaseMethod === 'delete') {
//         response = await axiosInstance.delete(fullURL, { headers }); //Usually delete don't need payload
//     }
//     else {
//         throw new Error(`Unsupported method: ${method}`);
//     }
    
//     return response.data;
//   } catch (error) {
//     console.log("API error", error) //ADDED
//     if (
//       (error.response && error.response.status === 401) ||
//       error.response.statusText === "Please authenticate"
//     ) {
//       if (!globalErrorFlag) {
//         globalErrorFlag = true;
//         globalErrorNotifier(error.response.statusText);
//       }
//       // logOut();
//     }
//     // notify(error?.response?.message,"error")
//     return error.response;
//   }
// };

// export default makeApiRequest;

