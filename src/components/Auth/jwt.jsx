import { jwtDecode } from "jwt-decode";

function isTokenExpired() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found in localStorage.");
    return true;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (!decodedToken.exp || isNaN(decodedToken.exp)) {
      console.warn("Token does not have a valid expiration time.");
      return true;
    }

    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error.message);
    return true;
  }
}

export default isTokenExpired;




// import { jwtDecode } from "jwt-decode";

// function isTokenExpired() {
//   const token = localStorage.getItem("token");
//   if (!token) return true;

//   try {
//     const decodedToken = jwtDecode(token);
//     const currentTime = Math.floor(Date.now() / 1000);
// console.log("currentTime",currentTime)
//     if (!decodedToken.exp || isNaN(decodedToken.exp)) {
//       console.warn("Token does not have a valid expiration time.");
//       return true;
//     }

//     return decodedToken.exp < currentTime; // Check if expired
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true;
//   }
// }

// export default isTokenExpired;




// import { jwtDecode } from "jwt-decode";

// function isTokenExpired() {
//   const token = localStorage.getItem("token");
//   if (!token) return true; // Token nahi hai, to expired samjho

//   try {
//     const decodedToken = jwtDecode(token);
//     const currentTime = Math.floor(Date.now() / 1000); // Ek hi baar calculate karo

//     // exp check: Undefined ya NaN ho to expired treat karo
//     if (!decodedToken.exp || isNaN(decodedToken.exp)) {
//       console.warn("Token does not have a valid expiration time.");
//       return true;
//     }

//     return decodedToken.exp < currentTime; // Token expired check
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true; // Invalid token ko expired treat karo
//   }
// }

// export default isTokenExpired;





// import { jwtDecode } from "jwt-decode";

// function isTokenExpired() {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     return true; // No token, consider it expired
//   }

//   try {
//     const decodedToken = jwtDecode(token);
//     const currentTime = Math.floor(Date.now() /1000); // Convert to seconds
//     return decodedToken.exp < currentTime;
//   } catch (error) {
//     // Handle invalid token format (not a JWT, etc.)
//     console.error("Error decoding token:", error);
//     return true; // Treat as expired for safety
//   }
// }
// export default isTokenExpired;



// import jwt_decode from "jwt-decode";

// function isTokenExpired() {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     return true; // No token, consider it expired
//   }

//   try {
//     const decodedToken = jwt_decode(token);
//     const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
//     return decodedToken.exp < currentTime;
//   } catch (error) {
//     // Handle invalid token format (not a JWT, etc.)
//     console.error("Error decoding token:", error);
//     return true; // Treat as expired for safety
//   }
// }
// export default isTokenExpired;