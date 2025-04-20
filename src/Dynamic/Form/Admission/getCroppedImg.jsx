// const createImage = (url) =>
//   new Promise((resolve, reject) => {
//     const image = new Image();
//     image.addEventListener('load', () => {
//       console.log("Image loaded successfully");
//       resolve(image);
//     });
//     image.addEventListener('error', (error) => {
//       console.error("Error loading image:", error);
//       reject(error);
//     });
//     image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
//     image.src = url;
//   });

// async function getCroppedImg(imageSrc, croppedAreaPixels) {
//   try {
//     if (!imageSrc) {
//       console.error("imageSrc is missing");
//       return null;
//     }

//     if (!croppedAreaPixels || typeof croppedAreaPixels !== 'object' || !croppedAreaPixels.width || !croppedAreaPixels.height) {
//       console.error("croppedAreaPixels is invalid:", croppedAreaPixels);
//       return null;
//     }

//     const image = await createImage(imageSrc);
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');

//     // set canvas devicePixelRatio to 1 to make image look sharper
//     const dpr = window.devicePixelRatio || 1;
//     canvas.width = croppedAreaPixels.width * dpr;
//     canvas.height = croppedAreaPixels.height * dpr;
//     ctx.scale(dpr, dpr);

//     // Debugging: Log the values before drawing
//     console.log("Drawing image:", {
//       image,
//       croppedAreaPixels,
//       dpr,
//       canvasWidth: canvas.width,
//       canvasHeight: canvas.height
//     });

//     ctx.drawImage(
//       image,
//       croppedAreaPixels.x,
//       croppedAreaPixels.y,
//       croppedAreaPixels.width,
//       croppedAreaPixels.height,
//       0,
//       0,
//       croppedAreaPixels.width,
//       croppedAreaPixels.height
//     );

//     return new Promise((resolve, reject) => {
//       canvas.toBlob(blob => {
//         if (!blob) {
//           console.error('Canvas is empty. Cropping may have failed.');
//           reject(new Error('Canvas is empty'));
//           return;
//         }
//         resolve(URL.createObjectURL(blob));
//       }, 'image/jpeg');
//     });

//   } catch (error) {
//     console.error("Error in getCroppedImg:", error);
//     return null; // Return null in case of error
//   }
// }

// export default getCroppedImg;




// const createImage = (url) =>
//     new Promise((resolve, reject) => {
//       const image = new Image();
//       image.addEventListener('load', () => {
//         console.log("Image loaded successfully");
//         resolve(image);
//       });
//       image.addEventListener('error', (error) => {
//         console.error("Error loading image:", error);
//         reject(error);
//       });
//       image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
//       image.src = url;
//     });
  
//   async function getCroppedImg(imageSrc, croppedAreaPixels) {
//     try {
//       if (!imageSrc) {
//         console.error("imageSrc is missing");
//         return null;
//       }
  
//       if (!croppedAreaPixels || typeof croppedAreaPixels !== 'object' || !croppedAreaPixels.width || !croppedAreaPixels.height) {
//         console.error("croppedAreaPixels is invalid:", croppedAreaPixels);
//         return null;
//       }
  
//       const image = await createImage(imageSrc);
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
  
//       // set canvas devicePixelRatio to 1 to make image look sharper
//       const dpr = window.devicePixelRatio || 1;
//       canvas.width = croppedAreaPixels.width * dpr;
//       canvas.height = croppedAreaPixels.height * dpr;
//       ctx.scale(dpr, dpr);
  
//       // Debugging: Log the values before drawing
//       console.log("Drawing image:", {
//         image,
//         croppedAreaPixels,
//         dpr,
//         canvasWidth: canvas.width,
//         canvasHeight: canvas.height
//       });
  
//       ctx.drawImage(
//         image,
//         croppedAreaPixels.x,
//         croppedAreaPixels.y,
//         croppedAreaPixels.width,
//         croppedAreaPixels.height,
//         0,
//         0,
//         croppedAreaPixels.width,
//         croppedAreaPixels.height
//       );
  
//       return new Promise((resolve, reject) => {
//         canvas.toBlob(blob => {
//           if (!blob) {
//             console.error('Canvas is empty. Cropping may have failed.');
//             reject(new Error('Canvas is empty'));
//             return;
//           }
//           resolve(URL.createObjectURL(blob));
//         }, 'image/jpeg');
//       });
  
//     } catch (error) {
//       console.error("Error in getCroppedImg:", error);
//       return null; // Return null in case of error
//     }
//   }
  
//   export default getCroppedImg;

// Assume this is in its own file, e.g., getCroppedImg.js

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      console.log("Image loaded successfully for cropping");
      resolve(image);
    });
    image.addEventListener('error', (error) => {
      console.error("Error loading image for cropping:", error, "URL:", url);
      reject(new Error('Could not load image for cropping.')); // More informative error
    });
    // IMPORTANT: Set crossOrigin *before* setting src for external URLs or data URLs from different origins (like webcam captures)
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Creates a cropped image as a Data URL.
 * @param {string} imageSrc - The source image URL (can be data URL or web URL).
 * @param {object} croppedAreaPixels - The pixel coordinates { x, y, width, height }.
 * @param {number} [rotation=0] - Rotation angle (currently unused in this basic version, but kept for potential future use).
 * @returns {Promise<string|null>} A Promise that resolves with the cropped image as a Data URL (e.g., 'data:image/jpeg;base64,...') or null on error.
 */
async function getCroppedImg(imageSrc, croppedAreaPixels, rotation = 0) { // Added rotation param back for compatibility if needed, though not used here
  try {
    if (!imageSrc) {
      console.error("getCroppedImg Error: imageSrc is missing");
      throw new Error("Image source is missing.");
    }

    if (!croppedAreaPixels || typeof croppedAreaPixels !== 'object' || !croppedAreaPixels.width || !croppedAreaPixels.height) {
      console.error("getCroppedImg Error: croppedAreaPixels is invalid:", croppedAreaPixels);
      throw new Error("Invalid cropping area provided.");
    }

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error("getCroppedImg Error: Failed to get 2D context from canvas.");
        throw new Error("Could not get canvas context.");
    }

    // Adjust canvas size for device pixel ratio if needed (optional but can improve sharpness on high-DPI screens)
    // const dpr = window.devicePixelRatio || 1;
    // canvas.width = croppedAreaPixels.width * dpr;
    // canvas.height = croppedAreaPixels.height * dpr;
    // ctx.scale(dpr, dpr);
    // --- OR simpler version ---
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;


    // TODO: Add rotation logic here if needed using ctx.translate, ctx.rotate
    // For now, assuming rotation = 0

    // Draw the cropped image area onto the canvas
    ctx.drawImage(
      image,
      croppedAreaPixels.x, // Source X
      croppedAreaPixels.y, // Source Y
      croppedAreaPixels.width,  // Source Width
      croppedAreaPixels.height, // Source Height
      0, // Destination X
      0, // Destination Y
      croppedAreaPixels.width,  // Destination Width
      croppedAreaPixels.height  // Destination Height
    );

    // --- *** THE KEY CHANGE IS HERE *** ---
    // Convert the canvas content to a Data URL (Base64 encoded).
    // Use 'image/jpeg' for smaller file size, 'image/png' if transparency is needed.
    // The second argument (0.9) is the quality for JPEG (0 to 1).
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use 90% quality JPEG

    // Basic check if the generated data URL is valid
     if (!dataUrl || dataUrl === 'data:,') {
         console.error('getCroppedImg Error: Canvas toDataURL returned empty or invalid data.');
         throw new Error('Failed to generate cropped image data from canvas.');
     }

    console.log("getCroppedImg successful, returning Data URL (first 100 chars):", dataUrl.substring(0, 100));
    return dataUrl; // Resolve the promise with the Data URL string

  } catch (error) {
    console.error("Error caught within getCroppedImg:", error);
    // toast.error(`Cropping failed: ${error.message}`); // Maybe add user feedback here?
    return null; // Return null to indicate failure
  }
}

export default getCroppedImg; // Make sure this is exported if it's in its own file