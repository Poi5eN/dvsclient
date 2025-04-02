// import * as React from 'react';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';

// export default function BasicTextFields() {
//   return (
//     <Box
//       component="form"
//       noValidate
//       autoComplete="off"
//       className="flex flex-col gap-8" // Added flex for layout
//     >
//       <TextField
//         id="outlined-basic"
//         label="Outlined"
//         variant="outlined"
//         className="w-full h-12  p-2 border-2 border-gray-300  focus:outline-none focus:border-blue-500 "
//          //added tailwind classes here
//       />
//         <TextField
//           id="outlined-basic-custom"
//           label="Custom Style"
//           variant="outlined"
//           className="w-2/4  h-10 px-4 border-4 border-red-500 rounded-lg m-2 focus:outline-none focus:border-green-500"
//         />
//     </Box>
//   );
// }

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';

// export default function BasicTextFields() {
//   return (
//     <Box
//       component="form"
//       sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
//       noValidate
//       autoComplete="off"
//     >
//       <TextField id="outlined-basic" label="Outlined" variant="outlined" />
     
//     </Box>
//   );
// }

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';

// export default function BasicTextFields() {
//   return (
//     <Box
//       component="form"
//       sx={{
//         '& > :not(style)': {
//         //   m: 0.5,  // margin kam kiya
//         //   width: '15ch', // width kam ki
//         //   padding: '10px' // padding kam ki
//         }
//       }}
//       noValidate
//       autoComplete="off"
//     >
//       <TextField id="outlined-basic" label="Outlined" variant="outlined" />
//     </Box>
//   );
// }

import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function StyledTextFields() {
  return (
    <Box
      component="form"
      className="flex flex-col p-4 m-2 border border-gray-300" //tailwind classes added to box
    //   className="flex flex-col p-4 m-2 border border-gray-300" //tailwind classes added to box
      noValidate
      autoComplete="off"
    >
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        className="w-full h-12 p-0 m-1 border border-blue-500" //tailwind classes added to textfield
      />
    </Box>
  );
}