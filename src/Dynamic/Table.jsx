import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { ReactInput } from "./ReactInput/ReactInput";

const bgGreenClass = "bg-green-600"; // Light green
const bgRedClass = "bg-red-200"; // Light red
const bgYellowClass = "bg-yellow-200"; // Light yellow

const Table = ({ tHead, tBody, isSearch, }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { currentColor } = useStateContext();

  const getStatusColorClass = (feeStatus) => {
    switch (feeStatus) {
      case "Paid":
        return bgGreenClass;
      case "Unpaid":
        return bgRedClass;
      case "Partial":
        return bgYellowClass;
      default:
        return "";
    }
  };

  // Search Filter Logic
  const filteredData = tBody.filter((row) =>
    tHead.some((header) =>
      row[header.id]
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  return (
    <section className="py-1 bg-blueGray-50 ">
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded">
        {
          isSearch && <div className="rounded-t border-0">

                <ReactInput
                  type="text"
                  name="searchInput"
                  // required={true}
                  label="Search here"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
          </div>
        }
        <div className="block w-full overflow-x-auto h-[72vh] overflow-y-auto dark:text-gray-200">
          <table className="items-center bg-transparent w-full border-collapse ">
            <thead className="sticky top-0 z-10">

              <tr>
             
                {tHead.map((header) => (
               
                  <th class={`px-2 py-1 text-start border-b border-slate-300 bg-slate-50 whitespace-nowrap uppercase w-[${header?.width}]`}
                  // <th class={`px-2 py-1 text-start border-b border-slate-300 bg-slate-50 whitespace-nowrap uppercase w-${header?.width}`}
                    // style={{ background: currentColor, color: "white", }}
                    style={{ background: currentColor, color: "white"}}
                  >
                    {console.log("first",header?.width)}
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
          
            <tbody >
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => {
                  const rowClassName = getStatusColorClass(row.feeStatus);

                  return (
                    <tr key={index} className={`${rowClassName} hover:bg-[#26aae2ad]`}>
                      
                      {tHead.map((header) => (
                        <td
                          key={`${index}-${header.id}`}
                          className="border px-2 py-1 align-middle  text-xs whitespace-nowrap text-left text-blueGray-700"
                        >
                          <p class="block text-sm font-normal leading-none text-slate-500">
                            {row[header.id]}
                          </p>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={tHead.length}
                    className="text-center py-4 text-gray-500"
                  >
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          
          </table>
        </div>

      </div>
    </section>
  );
};

export default Table;
