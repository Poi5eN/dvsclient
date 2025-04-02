import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
 
export function TabsDefault({ Titletabs }) {

  return (
    <Tabs
      value="html"
      style={{
        background: "white",
        zIndex: "1 !important", // Decreased z-index to 1 (or even lower if needed)
        position: "relative", // Added position relative
      }}
    >
      <TabsHeader>
        {Titletabs.map(({ label, value, color, url }) => (
          <Tab
            key={value}
            value={value}
            style={{
              background: color,
              borderRadius: "10px",
              marginLeft: "10px",
              zIndex: "inherit", // Added to individual tabs
              position: "relative",// Add relative positioning
              wordWrap: "break-word",  // Allow long words to wrap
              overflowWrap: "break-word"  // Alternative for wordWrap
            }}
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {Titletabs.map(({ value, desc }) => (
          <TabPanel key={value} value={value}>
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}



// import {
//     Tabs,
//     TabsHeader,
//     TabsBody,
//     Tab,
//     TabPanel,
//   } from "@material-tailwind/react";
   
//   export function TabsDefault({Titletabs}) {
//     // const data = [
//     //   {
//     //     label: "HTML",
//     //     value: "html",
//     //     color: "red",
//     //     desc: `It really matters and then like it really doesn't matter.
//     //     What matters is the people who are sparked by it. And the people 
//     //     who are like offended by it, it doesn't matter.`,
//     //   },
//   // ]
   
//     return (
//       <Tabs value="html"
//       style={{background:"white",zIndex:"99"
//       }}
//       >
//         <TabsHeader>
//           {Titletabs.map(({ label, value,color,url }) => (
//             <Tab key={value} value={value}
            
//             style={{background:color ,borderRadius:"10px",marginLeft:"10px"}}
//             >
//               {label}
//             </Tab>
//           ))}
//         </TabsHeader>
//         <TabsBody>
//           {Titletabs.map(({ value, desc }) => (
//             <TabPanel key={value} value={value}>
//               {desc}
//             </TabPanel>
//           ))}
//         </TabsBody>
//       </Tabs>
//     );
//   }