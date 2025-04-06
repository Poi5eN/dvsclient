// import React from 'react';

// // Helper function to format currency (optional, adjust as needed)
// const formatCurrency = (amount) => {
//   // Example: Indian Rupees. Modify for your currency.
//   return `₹${amount.toLocaleString('en-IN')}`;
// };

// const MonthFeeCard = ({ monthData }) => {
//   const { month, regularFee, additionalFees } = monthData;

//   // Helper function to get status styling
//   const getStatusClass = (status) => {
//     // Only need 'Paid' style now for additional fees, but keep for regular fee
//     return status === 'Paid'
//       ? 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400'
//       : 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400';
//   };

//   // --- START: Filter paid additional fees ---
//   // Filter the additional fees array to only include items with status 'Paid'.
//   // Use optional chaining (?.) and nullish coalescing (|| []) for safety if additionalFees might be null/undefined.
//   const paidAdditionalFees = additionalFees?.filter(fee => fee.status === 'Paid') || [];
//   // --- END: Filter paid additional fees ---


//   return (
//     <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex flex-col h-full">
//       {/* Month Header */}
//       <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-2">
//         {month}
//       </h3>

//       {/* Regular Fee Section (Remains the same) */}
//       <div className="mb-3">
//         <div className="flex justify-between items-center mb-1">
//           <span className="font-medium text-gray-700">Regular Fee</span>
//           <span className={getStatusClass(regularFee.status)}>
//             {regularFee.status}
//           </span>
//         </div>
//         <div className="text-sm text-gray-600">
//           Amount: {formatCurrency(regularFee.amount)}
//           {regularFee.status !== 'Paid' && regularFee.due > 0 && (
//              <span className="text-red-600 ml-2">(Due: {formatCurrency(regularFee.due)})</span>
//           )}
//         </div>
//       </div>

//       {/* --- START: Updated Additional Fees Section --- */}
//       {/* Only render this section if there are actually PAID additional fees */}
//       {paidAdditionalFees.length > 0 && (
//         <div className="mt-2 pt-2 border-t border-gray-200">
//           {/* You might want to adjust the heading for clarity */}
//           <h4 className="font-medium text-gray-700 mb-2 text-sm">Additional Fees (Paid)</h4>
//           <ul className="space-y-2">
//             {/* Map over the FILTERED array */}
//             {paidAdditionalFees.map((fee, index) => (
//               <li key={index} className="text-sm">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">
//                     {fee.name} <span className="text-xs text-gray-400">({fee.feeType})</span>
//                   </span>
//                   {/* Status will always be 'Paid' here, but we can still show the green badge */}
//                   <span className={getStatusClass(fee.status)}>
//                     {fee.status}
//                   </span>
//                 </div>
//                 <div className="text-xs text-gray-500 mt-0.5">
//                    Amount: {formatCurrency(fee.amount)}
//                    {/* No need to show 'Due' amount since these are already paid */}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//       {/* --- END: Updated Additional Fees Section --- */}

//       {/* Flex grow remains the same */}
//       <div className="flex-grow"></div>
//     </div>
//   );
// };

// export default MonthFeeCard;





import React from 'react';

// Helper function to format currency (optional, adjust as needed)
const formatCurrency = (amount) => {
  // Example: Indian Rupees. Modify for your currency.
  return `₹${amount.toLocaleString('en-IN')}`;
};

const MonthFeeCard = ({ monthData }) => {
  const { month, regularFee, additionalFees } = monthData;

  // Helper function to get status styling
  const getStatusClass = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400'
      : 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex flex-col h-full"> {/* Added h-full for consistent height in grid */}
      {/* Month Header */}
      <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-2">
        {month}
      </h3>

      {/* Regular Fee Section */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-gray-700">Regular Fee</span>
          <span className={getStatusClass(regularFee.status)}>
            {regularFee.status}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Amount: {formatCurrency(regularFee.amount)}
          {regularFee.status !== 'Paid' && regularFee.due > 0 && (
             <span className="text-red-600 ml-2">(Due: {formatCurrency(regularFee.due)})</span>
          )}
        </div>
      </div>

      {/* Additional Fees Section */}
      {additionalFees && additionalFees.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2 text-sm">Additional Fees</h4>
          <ul className="space-y-2">
            {additionalFees.map((fee, index) => (
              <li key={index} className="text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {fee.name} <span className="text-xs text-gray-400">({fee.feeType})</span>
                  </span>
                  <span className={getStatusClass(fee.status)}>
                    {fee.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                   Amount: {formatCurrency(fee.amount)}
                   {fee.status !== 'Paid' && fee.due > 0 && (
                      <span className="text-red-600 ml-2">(Due: {formatCurrency(fee.due)})</span>
                   )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
       {/* Add an empty div to push content up if card heights vary slightly due to content */}
      <div className="flex-grow"></div>
    </div>
  );
};

export default MonthFeeCard;