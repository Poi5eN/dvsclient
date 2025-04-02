import React from 'react'
import { useStateContext } from '../contexts/ContextProvider';

const Heading2 = ({ children, title }) => {
  const { currentColor } = useStateContext();
  return (
    <div
      className="rounded-tl-lg rounded-tr-lg  text-lg  mb-1  md:mt-0 relative min-h-[24px]"
      style={{ borderBottom: ` solid 2px ${currentColor}` }}
    >
      {
        children
      }

      <div
        className=" dark:text-white hidden md:block lg:visible absolute text-center font-extrabold  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-current"
      >
        {title}</div>
    </div>
  )
}

export default Heading2