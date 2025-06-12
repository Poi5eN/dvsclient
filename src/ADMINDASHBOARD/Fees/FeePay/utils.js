import axios from "axios";
import { toast } from "react-toastify";

export const fetchAdditionalFeesForClass = async (className, authToken) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BASE_URL || "https://api.digitalvidyasaarthi.in"}/api/v1/adminRoute/fees/?additional=true&className=${className}`,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    if (response?.data?.success) {
      const filteredFees = response.data.data.filter((fee) => fee.className === className);
      return filteredFees.map((fee) => ({
        label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
        value: fee.amount,
        name: fee.name,
        type: fee.feeType,
        id: fee._id,
      }));
    } else {
      toast.error(`Failed to fetch additional fees for class ${className}.`);
      return [];
    }
  } catch (error) {
    toast.error(`Error fetching additional fees for class ${className}: ${error.message}`);
    return [];
  }
};