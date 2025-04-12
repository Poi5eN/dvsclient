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
//     return status === 'Paid'
//       ? 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400'
//       : 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400';
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex flex-col h-full"> {/* Added h-full for consistent height in grid */}
//       {/* Month Header */}
//       <h3 className="text-lg font-semibold mb-3 text-indigo-700 border-b pb-2">
//         {month}
//       </h3>

//       {/* Regular Fee Section */}
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

//       {/* Additional Fees Section */}
//       {additionalFees && additionalFees.length > 0 && (
//         <div className="mt-2 pt-2 border-t border-gray-200">
//           <h4 className="font-medium text-gray-700 mb-2 text-sm">Additional Fees</h4>
//           <ul className="space-y-2">
//             {additionalFees.map((fee, index) => (
//               <li key={index} className="text-sm">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">
//                     {fee.name} <span className="text-xs text-gray-400">({fee.feeType})</span>
//                   </span>
//                   <span className={getStatusClass(fee.status)}>
//                     {fee.status}
//                   </span>
//                 </div>
//                 <div className="text-xs text-gray-500 mt-0.5">
//                    Amount: {formatCurrency(fee.amount)}
//                    {fee.status !== 'Paid' && fee.due > 0 && (
//                       <span className="text-red-600 ml-2">(Due: {formatCurrency(fee.due)})</span>
//                    )}
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//        {/* Add an empty div to push content up if card heights vary slightly due to content */}
//       <div className="flex-grow"></div>
//     </div>
//   );
// };

// export default MonthFeeCard;

import React from 'react';

// Helper function to format currency (Using INR as default)
const formatCurrency = (amount) => {
  const numericAmount = Number(amount) || 0;
  return `₹${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format date strings (Example: DD/MM/YYYY)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'; // Handle null or undefined dates
  try {
    const date = new Date(dateString);
    // Use options for toLocaleDateString to get desired format
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options); // 'en-IN' locale often gives DD/MM/YYYY
    // Alternative formats:
    // return date.toLocaleDateString('en-GB', options); // Also often DD/MM/YYYY
    // return date.toLocaleDateString('en-US', options); // MM/DD/YYYY
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Return original string if formatting fails
  }
};


const MonthFeeCard = ({ childFeeHistory }) => {

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 flex flex-col h-full">

      {/* Changed Title to be more general for history */}
      <h3 className="text-base font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-100">
        Fee Payment History
      </h3>

      {/* Removed extra fragment and conditional rendering around the table */}
      <div className="">
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-100">
                  <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Rcpt No.</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Date</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Payment Breakdown</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Mode</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Amount Paid</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Remaining Dues</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {/* Check if feeHistory exists and is an array before mapping */}
                  {childFeeHistory?.feeStatus?.feeHistory && Array.isArray(childFeeHistory.feeStatus.feeHistory) && childFeeHistory.feeStatus.feeHistory.length > 0 ? (
                     childFeeHistory.feeStatus.feeHistory?.slice().reverse().map((history) => (
                    //   childFeeHistory.feeStatus.feeHistory?.reverse().map((history) => (
                          // Use history._id as the key
                          <tr key={history._id} className="hover:bg-gray-50">

                              {/* Cell for Receipt Number */}
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">
                                  {history.feeReceiptNumber || 'N/A'}
                              </td>

                              {/* Cell for Date - NOW CALLS DEFINED FUNCTION */}
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">
                                  {formatDate(history.date)} {/* Calls the helper function */}
                              </td>

                              {/* Cell for Payment Breakdown */}
                              <td className="px-4 py-3 text-sm text-gray-700 border-r">
                                  {/* Display Regular Fees paid in this transaction */}
                                  {history.regularFees?.map((fee, idx) => (
                                      <div key={`reg-${history._id}-${idx}`} className="text-xs mb-1">
                                          Regular: {fee.month} ({formatCurrency(fee.paidAmount)})
                                      </div>
                                  ))}
                                  {/* Display Additional Fees paid in this transaction */}
                                  {history.additionalFees?.map((fee, idx) => (
                                      <div key={`add-${history._id}-${idx}`} className="text-xs mb-1">
                                          {fee.name || 'Additional'}: ({formatCurrency(fee.paidAmount)})
                                      </div>
                                  ))}
                                  {/* Display if Past Dues were paid */}
                                  {history.pastDuesPaid > 0 && (
                                      <div className="text-xs mb-1">
                                          Past Dues Cleared: ({formatCurrency(history.pastDuesPaid)})
                                      </div>
                                  )}
                                  {/* Fallback if no breakdown */}
                                  {(history.regularFees?.length === 0 && history.additionalFees?.length === 0 && (!history.pastDuesPaid || history.pastDuesPaid === 0)) && (
                                      <span className='text-xs text-gray-400'>No specific breakdown</span>
                                  )}
                              </td>

                              {/* Cell for Payment Mode */}
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">
                                  {history.paymentMode || 'N/A'}
                                  {history.paymentMode === 'Online' && history.transactionId && history.transactionId !== 'N/A' && (
                                      <span className="block text-xs text-gray-500 truncate" title={history.transactionId}>
                                          (ID: {history.transactionId})
                                      </span>
                                  )}
                              </td>

                              {/* Cell for Total Amount Paid in this transaction */}
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right border-r">
                                  {formatCurrency(history.totalAmountPaid)}
                              </td>

                              {/* Cell for Remaining Dues after this transaction */}
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {formatCurrency(history.totalDues)}
                              </td>
                          </tr>
                      ))
                  ) : (
                       // Display a message if there's no history data
                       <tr>
                          <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                              No fee payment history found.
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MonthFeeCard;

// import React from 'react';

// // Helper function to format currency (Using INR as default)
// const formatCurrency = (amount) => {
//   const numericAmount = Number(amount) || 0;
//   return `₹${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const MonthFeeCard = ({ childFeeHistory }) => {
 

//   return (
//     <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 flex flex-col h-full">

//       <h3 className="text-base font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-100">
//         Regular Fees
//       </h3>

    
   
//         <div className="space-y-2">
//             <>
          
                                    
                                      
//                                          {
//                                           <div className="overflow-x-auto shadow rounded-lg">
//                                           <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
//                                               <thead className="bg-gray-100">
//                                                   <tr>
//                                                       {/* Added Receipt No. Header */}
//                                                       <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Rcpt No.</th>
//                                                       <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Date</th>
//                                                       {/* Renamed Header */}
//                                                       <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Payment Breakdown</th>
//                                                       {/* Added Mode Header */}
//                                                       <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Mode</th>
//                                                        {/* Renamed Header */}
//                                                       <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Amount Paid</th>
//                                                        {/* Renamed Header */}
//                                                       <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Remaining Dues</th>
//                                                   </tr>
//                                               </thead>
//                                               <tbody className="bg-white divide-y divide-gray-200">
//                                                   {/* Check if feeHistory exists and is an array before mapping */}
//                                                   {childFeeHistory?.feeStatus?.feeHistory && Array.isArray(childFeeHistory.feeStatus.feeHistory) ? (
//                                                       childFeeHistory.feeStatus.feeHistory.map((history) => (
//                                                           // Use history._id as the key
//                                                           <tr key={history._id} className="hover:bg-gray-50">
                                      
//                                                               {/* Cell for Receipt Number */}
//                                                               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">
//                                                                   {history.feeReceiptNumber || 'N/A'}
//                                                               </td>
                                      
//                                                               {/* Cell for Date */}
//                                                               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">
//                                                                   {formatDate(history.date)} {/* Assumes formatDate exists */}
//                                                               </td>
                                      
//                                                               {/* Cell for Payment Breakdown */}
//                                                               <td className="px-4 py-3 text-sm text-gray-700 border-r">
//                                                                    {/* Display Regular Fees paid in this transaction */}
//                                                                   {history.regularFees?.map((fee, idx) => (
//                                                                       <div key={`reg-${history._id}-${idx}`} className="text-xs mb-1">
//                                                                           Regular: {fee.month} ({formatCurrency(fee.paidAmount)}) {/* Show amount paid for this item */}
                                                                        
//                                                                       </div>
//                                                                   ))}
//                                                                    {/* Display Additional Fees paid in this transaction */}
//                                                                   {history.additionalFees?.map((fee, idx) => (
//                                                                       <div key={`add-${history._id}-${idx}`} className="text-xs mb-1">
//                                                                           {fee.name || 'Additional'}: ({formatCurrency(fee.paidAmount)})
                                                                          
//                                                                       </div>
//                                                                   ))}
//                                                                    {/* Display if Past Dues were paid */}
//                                                                    {history.pastDuesPaid > 0 && (
//                                                                       <div className="text-xs mb-1">
//                                                                           Past Dues Cleared: ({formatCurrency(history.pastDuesPaid)})
//                                                                       </div>
//                                                                    )}
//                                                                    {/* Fallback if no breakdown */}
//                                                                   {(history.regularFees?.length === 0 && history.additionalFees?.length === 0 && history.pastDuesPaid === 0) && (
//                                                                       <span className='text-xs text-gray-400'>No specific breakdown</span>
//                                                                   )}
//                                                               </td>
                                      
//                                                               {/* Cell for Payment Mode */}
//                                                               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">
//                                                                   {history.paymentMode || 'N/A'}
//                                                                   {history.paymentMode === 'Online' && history.transactionId && history.transactionId !== 'N/A' && (
//                                                                       <span className="block text-xs text-gray-500 truncate" title={history.transactionId}>
//                                                                           (ID: {history.transactionId})
//                                                                       </span>
//                                                                   )}
//                                                               </td>
                                      
//                                                               {/* Cell for Total Amount Paid in this transaction */}
//                                                               <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right border-r">
//                                                                   {formatCurrency(history.totalAmountPaid)} {/* Use totalAmountPaid */}
//                                                               </td>
                                      
//                                                                {/* Cell for Remaining Dues after this transaction */}
//                                                               <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
//                                                                   {formatCurrency(history.totalDues)} {/* Use totalDues */}
//                                                               </td>
//                                                           </tr>
//                                                       ))
//                                                   ) : (
//                                                        // Optional: Display a message or placeholder if there's no history data
//                                                        <tr>
//                                                           <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
//                                                               No fee payment history found.
//                                                           </td>
//                                                       </tr>
//                                                   )}
//                                               </tbody>
//                                           </table>
//                                       </div>
                                             
//                                          }
                                          
                                      
//                                   </> 
        
//         </div>

//     </div>
//   );
// };

// export default MonthFeeCard;


// import React from 'react';

// // Helper function to format currency (Using INR as default)
// const formatCurrency = (amount) => {
//   const numericAmount = Number(amount) || 0;
//   return `₹${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const MonthFeeCard = ({ data }) => {
//   // console.log("data received in MonthFeeCard:", data);

//   const getStatusClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'paid':
//         return 'bg-green-100 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded border border-green-300'; // Slightly smaller text/padding
//       case 'due':
//       case 'unpaid':
//         return 'bg-red-100 text-red-700 text-[10px] font-medium px-2 py-0.5 rounded border border-red-300'; // Slightly smaller text/padding
//       case 'partial':
//         return 'bg-yellow-100 text-yellow-700 text-[10px] font-medium px-2 py-0.5 rounded border border-yellow-300'; // Slightly smaller text/padding
//       default:
//         return 'bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded border border-gray-300'; // Slightly smaller text/padding
//     }
//   };

//   const regularFees = data?.regularFees || [];

//   return (
//     // Reduced padding (p-3), adjusted shadow (shadow-sm)
//     <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 flex flex-col h-full">

//       {/* Smaller heading font (text-base), reduced margins (mb-2 pb-1) */}
//       <h3 className="text-base font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-100">
//         Regular Fees
//       </h3>

//       {regularFees.length > 0 ? (
//         // Reduced spacing between month entries (space-y-2)
//         <div className="space-y-2">
//           {regularFees.map((feeItem) => (
//             // Smaller base font size for items (text-xs)
//             <div key={feeItem.month} className="text-xs">

//               {/* Reduced margin-bottom (mb-0.5) */}
//               <div className="flex justify-between items-center mb-0.5">
//                 {/* Slightly bolder month */}
//                 <span className="font-medium text-gray-600">{feeItem.month}</span>
//                 <span className={getStatusClass(feeItem.status)}>
//                   {feeItem.status || 'N/A'}
//                 </span>
//               </div>

//               {/* Reduced margin-bottom (mb-0.5) */}
//               <div className="flex justify-between items-center text-gray-500 mb-0.5">
//                 <span>Paid:</span>
//                 <span className="font-medium text-gray-700">
//                    {feeItem.paidAmount !== undefined && feeItem.paidAmount !== null
//                      ? formatCurrency(feeItem.paidAmount)
//                      : 'N/A'}
//                 </span>
//               </div>

//               {/* Due Amount - No margin change needed if it's the last item */}
//               {feeItem.status !== 'Paid' && feeItem.dueAmount > 0 && (
//                 <div className="flex justify-between items-center text-gray-500">
//                   <span>Due:</span>
//                   <span className="font-medium text-red-600">
//                     {formatCurrency(feeItem.dueAmount)}
//                   </span>
//                 </div>
//               )}
//                {/* Optional Total Amount - slightly smaller text */}
//                {feeItem.totalAmount && (
//                  <div className="flex justify-between items-center text-gray-400 text-[10px] mt-1 pt-1 border-t border-gray-100">
//                    <span>Total:</span>
//                    <span className="font-medium">
//                      {formatCurrency(feeItem.totalAmount)}
//                    </span>
//                  </div>
//                )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         // Adjusted padding/text size for empty state
//         <div className="text-center text-gray-500 py-2 text-xs">
//           No regular fee details.
//         </div>
//       )}

//       {regularFees.length > 0 && <div className="flex-grow"></div>}
//     </div>
//   );
// };

// export default MonthFeeCard;

// import React from 'react';

// // Helper function to format currency (optional, adjust as needed)
// // const formatCurrency = (amount) => {
// //   // Example: Indian Rupees. Modify for your currency.
// //   return `₹${amount.toLocaleString('en-IN')}`;
// // };

// const MonthFeeCard = ({ data }) => {

//  console.log("data",data);

//   // Helper function to get status styling
//   const getStatusClass = (status) => {
//     return status === 'Paid'
//       ? 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400'
//       : 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400';
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex flex-col h-full"> {/* Added h-full for consistent height in grid */}

//     <div className="mb-3"><span className="font-medium text-gray-700">Regular Fee</span>
//        {
//         data?.regularFees?.map((val)=>(
//           <>
          
          
//           <div className="flex justify-between items-center mb-1">
          
//           <span >
//             {val.month}
//           </span>
//         </div>
//         <div className="text-sm text-gray-600">
//           Paid Amount: {val?.paidAmount}
//           {val.status !== 'Paid' && (
//              <span className="text-red-600 ml-2">({val?.status})</span>
//           )}
//           <span >
//             {val.status}
//           </span>
//           <span >
//             {val.dueAmount}
//           </span>
//         </div>
//           </>
//         ))
//        }
//       </div>

//      <div className="flex-grow"></div>
//     </div>
//   );
// };

// export default MonthFeeCard;