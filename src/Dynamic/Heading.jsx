import React from 'react'
import { useStateContext } from '../contexts/ContextProvider';

const Heading = ({Name}) => {
    const { currentColor } = useStateContext();
  return (
    <h1
    className="text-xl font-bold  uppercase text-center  hover-text "
    style={{ color: currentColor }}
  >
   {Name}
  </h1>
  )
}

export default Heading