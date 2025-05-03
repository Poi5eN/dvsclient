import React from 'react';
import { Link } from 'react-router-dom'; // Or your router's Link component
import LightenColor from './LightenColor';
import { useStateContext } from '../contexts/ContextProvider';

// Assume HomeIcon is defined as above

const PageHeaderWithBreadcrumb = ({breadcrumbItems = [],  title = "Patient Issue Management" }) => {
   const {  setIsLoader,currentColor } = useStateContext();

  const lighterCol = LightenColor(currentColor, 0.9); // 30% lighter
  return (
    <div className="bg-white p-2 rounded-lg shadow border border-gray-200"
    style={{ background: lighterCol ,borderTop:`3px solid ${currentColor}`}}
    >
        {/* <LightenColor style={{ color: lighterCol }}/> */}
     <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-gray-500 ">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">/</span>}
            {item.href ? (
             <> 
              <Link
                to={item.href}
                className="hover:text-blue-600 transition-colors duration-150 flex items-center"
              >
                {index === 0 && (
                    <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                )}
                <span>{item.label}</span>
              </Link>
             
             </>
            ) : (
              <span className="font-medium text-gray-600">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      <span>  / </span><span className="font-medium text-gray-600">{title}</span>
      </nav>
      {/* <h1 className="text-base font-semibold text-gray-800">
        {title}
      </h1> */}
    </div>
  );
};



export default PageHeaderWithBreadcrumb; // Export if it's in its own file