import React, { useEffect, useRef } from "react";

const VerticalMarquee = ({ children, duration = 2, height = 130 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    // Duplicate content to make the scroll seamless
    if (container.children.length > 0) {
      const clone = container.cloneNode(true);
      container.parentElement.appendChild(clone);
      clone.classList.add("absolute", "top-full", "left-0", "w-full");
    }
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div
        ref={containerRef}
        className="animate-scroll-up flex flex-col w-full"
        style={{
          animation: `scroll-up ${duration * children.length}s linear infinite`,
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default VerticalMarquee;
