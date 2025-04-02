import React from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import excel from '../../../Icone/excel.png'
const ExportToExcel = ({ data, fileName = "ExportedData" }) => {
  const handleExportToExcel = () => {
    if (data.length === 0) {
      toast.error("No data available to export!");
      return;
    }

    // Convert JSON data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Export workbook to Excel file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    toast.success("Excel file downloaded successfully!");
  };

  return (
   
     <img src={excel} alt=""  className="h-6 cursor-pointer"  onClick={handleExportToExcel}   />
  );
};

export default ExportToExcel;
