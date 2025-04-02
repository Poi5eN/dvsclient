import React from 'react'
import { Link } from 'react-router-dom'

const Breadcrumbs  = ({BreadItem}) => {
  return (
    <nav aria-label="breadcrumb" class="w-max">
  <ol class="flex w-full flex-wrap items-center rounded-md bg-slate-50  py-1">
    <li class="flex cursor-pointer items-center text-sm text-slate-500 transition-colors duration-300 hover:text-slate-800">
      <Link to="/admin">
        <svg
        style={{color:"#e36233"}}
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
      </Link>
      {/* <span class="pointer-events-none mx-2 text-slate-800">
        /
      </span> */}
    </li>
{
    BreadItem?.map((val,ind)=>{
        return(
            <li key={ind} class=" text-[#2faadc] font-bold uppercase flex cursor-pointer items-center text-md text-slate-500 transition-colors duration-300 hover:text-slate-800">
            <span class="pointer-events-none mx-1 text-slate-800">
              /
            </span>
            <Link to={`/admin${val?.link}`}>{val?.title}</Link>
           
          </li>
        )
    })
}
    {/* <li class="flex cursor-pointer items-center text-sm text-slate-500 transition-colors duration-300 hover:text-slate-800">
      <a href="#">Components</a>
      <span class="pointer-events-none mx-2 text-slate-800">
        /
      </span>
    </li>
    <li class="flex cursor-pointer items-center text-sm text-slate-500 transition-colors duration-300 hover:text-slate-800">
      <a href="#">Breadcrumbs</a>
    </li> */}
  </ol>
</nav>
  )
}

export default Breadcrumbs 