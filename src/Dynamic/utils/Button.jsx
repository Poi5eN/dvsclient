import React from 'react'
import { useStateContext } from '../../contexts/ContextProvider';

const Button = ({ onClick, name, type, loading, width ,color,Icon,disabled}) => {
   const {  setIsLoader,currentColor } = useStateContext();
    return (
      <div className='inline-block items-center '>
          <button
disabled={disabled}
        style={{background:color?color:currentColor,display:""}}
        type={type}
        onClick={onClick}
        className={` w-${width} px-4  text-center h-[23px] items-center flex justify-center  gap-2 whitespace-nowrap rounded text-[11px] font-medium tracking-wide text-white transition duration-300 hover:bg-emerald-600 focus:bg-emerald-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none`}>
       {
        Icon && <span>{Icon}</span>
       }
        
        <span className='uppercase leading-[2]'>{`${name}`}</span>

      </button>
      </div>
        
    )
}

export default Button