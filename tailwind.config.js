
const withMT = require("@material-tailwind/react/utils/withMT");
 
module.exports =withMT ({
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    // fontFamily: {
    //   display: ['Open Sans', 'sans-serif'],
    //   body: ['Open Sans', 'sans-serif'],
    // },
    extend: {
      keyframes: {
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(0.5deg)' },
          '75%': { transform: 'rotate(-0.5deg)' },
        }
      },
      animation: {
        tilt: 'tilt 10s infinite linear',
      }
    },

    extend: {
      extend: {
      keyframes: {
        wave: {
          to: {
            "margin-left": "-51%"
          }
        }
      }
    },
    animation: {
      wave: "wave 1.5s ease-in-out infinite"
    },
      fontSize: {
        14: '14px',
      },
      backgroundColor: {
        'main-bg': '#FAFBFB',
        'main-dark-bg': '#20232A',
        'secondary-dark-bg': '#33373E',
        'light-gray': '#F7F7F7',
        'half-transparent': 'rgba(0, 0, 0, 0.5)',
      },
      borderWidth: {
        1: '1px',
      },
      borderColor: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      width: {
        400: '400px',
        760: '760px',
        780: '780px',
        800: '800px',
        1000: '1000px',
        1200: '1200px',
        1400: '1400px',
      },
      height: {
        80: '80px',
      },
      minHeight: {
        590: '590px',
      },
      backgroundImage: {
        'hero-pattern':
          "url('https://i.ibb.co/MkvLDfb/Rectangle-4389.png')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp')
    // require('tailwind-scrollbar'),
  ],
});


// const withMT = require("@material-tailwind/react/utils/withMT");
 
// module.exports = withMT({
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// });




// // HTML CSS JSResult Skip Results Iframe
// // Configure Tailwind with custom animations
// tailwind.config = {
//   theme: {
//     extend: {
//       keyframes: {
//         tilt: {
//           '0%, 50%, 100%': { transform: 'rotate(0deg)' },
//           '25%': { transform: 'rotate(0.5deg)' },
//           '75%': { transform: 'rotate(-0.5deg)' },
//         }
//       },
//       animation: {
//         tilt: 'tilt 10s infinite linear',
//       }
//     }
//   }
// }

// // Initialize Lucide icons
// lucide.createIcons();