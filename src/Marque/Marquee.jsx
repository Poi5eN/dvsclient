import React, { useState, useRef, useEffect, Children } from "react";

const Marquee = ({ list, time, height, children }) => {
  const marqueeContainer = useRef(null);
  const marqueeArea = useRef(null);
  const [moveUp, setMoveUp] = useState(0);
  const [showList, setShowList] = useState(list);
  const [realTime, setRealTime] = useState(time);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const containerHeight = Math.floor(marqueeContainer.current.offsetHeight);
    const areaHeight = Math.floor(marqueeArea.current.scrollHeight);
    const copyTimes = Math.max(
      2,
      Math.ceil((containerHeight * 2) / areaHeight)
    );
    const newMoveUp = areaHeight * Math.floor(copyTimes / 2);
    const newRealTime =
      time * parseFloat((newMoveUp / containerHeight).toFixed(2));

    setMoveUp(newMoveUp);
    setRealTime(newRealTime);
  }, [time]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (marqueeArea.current) {
      const currentScroll = marqueeArea.current.scrollTop;
      marqueeArea.current.style.animationPlayState = "paused";
      setMoveUp(currentScroll); // Pause at the current scroll position
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (marqueeArea.current) {
      marqueeArea.current.style.animationPlayState = "running";
    }
  };

  return (
    <div
      ref={marqueeContainer}
      className={`relative w-full  overflow-hidden `}
      style={{ height: height }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={marqueeArea}
        className={`absolute w-full transition-all duration-[${realTime}s]`}
        style={{
          transform: `translateY(-${moveUp}px)`,
          animation: `marqueeY ${realTime}s linear infinite`,
          animationPlayState: isHovered ? "paused" : "running",
        }}
      >
        {children}
      </div>
    </div>
  );
};
export default Marquee;

// import React, { useEffect, useRef, useState } from "react";

// const Marquee = ({ children, height }) => {
//   const marqueeWrapperRef = useRef(null);
//   const marqueeContentRef = useRef(null);
//   const [animationDuration, setAnimationDuration] = useState(null);
//   const [isHovered, setIsHovered] = useState(false);

//   useEffect(() => {
//     const wrapperHeight = marqueeWrapperRef.current.offsetHeight;
//     const contentHeight = marqueeContentRef.current.scrollHeight;

//     if (contentHeight > wrapperHeight) {
//       const speed = contentHeight / wrapperHeight; // Dynamic speed calculation
//       const duration = speed * 5; // Adjust the multiplier as needed (5s per screen height)
//       setAnimationDuration(duration); // Set dynamic animation duration
//     } else {
//       setAnimationDuration(null); // No animation if content is smaller
//     }
//   }, [children]);

//   // Event handlers to manage hover state
//   const handleMouseEnter = () => {
//     setIsHovered(true);
//   };

//   const handleMouseLeave = () => {
//     setIsHovered(false);
//   };

//   return (
//     <div
//       className="marquee-wrapper"
//       style={{ height: height, overflow: "hidden" }}
//       ref={marqueeWrapperRef}
//     >
//       <div
//         className="marquee-content"
//         style={{
//           animation: animationDuration
//             ? `scroll-up ${animationDuration}s linear infinite`
//             : "none",
//           animationPlayState: isHovered ? "paused" : "running", // Pause/resume animation on hover
//         }}
//         ref={marqueeContentRef}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//       >
//         {children}
//       </div>
//     </div>
//   );
// };

// export default Marquee;
