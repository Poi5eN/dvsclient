// hooks/UseCountUp.js
import { useEffect, useState } from "react";

const UseCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    if (!end || isNaN(end)) return;

    const incrementTime = Math.floor(duration / end);
    const counter = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(counter);
    }, incrementTime);

    return () => clearInterval(counter);
  }, [end, duration]);

  return count;
};

export default UseCountUp;
