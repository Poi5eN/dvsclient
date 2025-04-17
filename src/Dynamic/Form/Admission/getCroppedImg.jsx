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




const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => {
        console.log("Image loaded successfully");
        resolve(image);
      });
      image.addEventListener('error', (error) => {
        console.error("Error loading image:", error);
        reject(error);
      });
      image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
      image.src = url;
    });
  
  async function getCroppedImg(imageSrc, croppedAreaPixels) {
    try {
      if (!imageSrc) {
        console.error("imageSrc is missing");
        return null;
      }
  
      if (!croppedAreaPixels || typeof croppedAreaPixels !== 'object' || !croppedAreaPixels.width || !croppedAreaPixels.height) {
        console.error("croppedAreaPixels is invalid:", croppedAreaPixels);
        return null;
      }
  
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // set canvas devicePixelRatio to 1 to make image look sharper
      const dpr = window.devicePixelRatio || 1;
      canvas.width = croppedAreaPixels.width * dpr;
      canvas.height = croppedAreaPixels.height * dpr;
      ctx.scale(dpr, dpr);
  
      // Debugging: Log the values before drawing
      console.log("Drawing image:", {
        image,
        croppedAreaPixels,
        dpr,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });
  
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
  
      return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
          if (!blob) {
            console.error('Canvas is empty. Cropping may have failed.');
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(URL.createObjectURL(blob));
        }, 'image/jpeg');
      });
  
    } catch (error) {
      console.error("Error in getCroppedImg:", error);
      return null; // Return null in case of error
    }
  }
  
  export default getCroppedImg;

