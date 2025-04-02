
import axios from "axios";
import { notify } from "../utils/utils";
import { useLocalStorage } from "../utils/hooks/useLocalStorage";
const baseurl = import.meta.env.VITE_APP_REACT_APP_BASE_URL;

const axiosInstance = axios.create({
  baseURL: baseurl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let globalErrorFlag = false;

export const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
  // return (...args) => {
  //   clearTimeout(timeout);
  //   timeout = setTimeout(() => func.apply(this, args), wait);
  // };
};

const globalErrorNotifier = debounce((message) => {
  notify(message, "error");
  globalErrorFlag = false;
  logOut();
}, 1000);

const logOut = () => {
  localStorage.clear();
  window.location.href = "/login";
  notify("Please authenticate", "error");
};

const makeApiRequest = async (url, options, header) => {
  const localData = useLocalStorage("token", "get");
  const validUser = useLocalStorage("userData", "get");
  const { method, data } = options;
  const lowerCaseMethod = method.toLowerCase();

  const headers = {
    "Content-Type": header ? header : "application/json",
    Authorization: localData && Bearer `${localData}`,
  };

  const parameterChecker = () => {
    const symbol = url.includes("?") ? "&" : "?";
    return symbol;
  };

  const finalUrl = validUser
    ? `${url}${parameterChecker()}userValidateID=${validUser?.userValidateID}`
    : url;

  try {
    const response = await axiosInstance({
      method: lowerCaseMethod,
      url: finalUrl,
      ...(data && { data }),
      headers,
    });
    return response.data;
  } catch (error) {
    if (
      (error.response && error.response.status === 401) ||
      error.response.statusText === "Please authenticate"
    ) {
      if (!globalErrorFlag) {
        globalErrorFlag = true;
        globalErrorNotifier(error.response.statusText);
      }
      // logOut();
    }
    notify(error?.response?.message,"error")
    return error.response;
  }
};

export default makeApiRequest;