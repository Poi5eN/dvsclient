
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loading from "../../../Loading";
import useCustomQuery from "../../../useCustomQuery";
import axios from "axios";
import { useStateContext } from "../../../contexts/ContextProvider";
import DynamicDataTable from "./DataTable";

import NoDataFound from "../../../NoDataFound";
import Heading from "../../../Dynamic/Heading";
import { getParentColumns } from "../../../Dynamic/utils/TableUtils";


function CreateParents() {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [submittedData, setSubmittedData] = useState([]);
  // const { queryData: allParent, loading: parentLoading, error: parentError } =
  //   useCustomQuery(
  //     "https://dvsserver.onrender.com/api/v1/adminRoute/studentparent?fetchAllParents=true"
  //     // "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParentsWithChildren"
  //   );

  // useEffect(() => {
  //   if (allParent) {
  //     setSubmittedData(allParent?.data?.map((p) => p.parent));
  //   }
  // }, [allParent]);

  const handleDelete = (email) => {
    axios
      .put(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/deactivateParent`,
        { email },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const updatedData = submittedData?.filter((item) => item.email !== email);
        setSubmittedData(updatedData);
        toast.success("Parent data deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting Parent data:", error);
        toast.error("An error occurred while deleting the Parent data.");
      });
  };

  // if (parentLoading) {
  //   return <Loading />;
  // }

  const modifiedData = submittedData?.map((item) => ({
    ...item,
    childName: item.children.map((child) => child.fullName).join("\n"),
    childAdmissionNo: item.children
      .map((child) => child.admissionNumber)
      .join("\n"),
  }));

  return (
    <div className=" mt-12  mx-auto p-3">
    {/* <div className="md:h-screen mt-12 md:mt-1 mx-auto p-3"> */}
      <Heading Name="Parent Details" />
      {modifiedData.length > 0 ? (
        <DynamicDataTable
          data={modifiedData}
          columns={getParentColumns()}
          handleDelete={handleDelete}
          // tableHeight="40vh"
          className="w-full overflow-auto"
          itemsPerPage={15}
        />
      ) : (
        <NoDataFound />
      )}
    </div>
  );
}

export default CreateParents;
