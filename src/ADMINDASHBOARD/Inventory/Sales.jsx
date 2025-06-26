import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import DatePicker from "../../Dynamic/DatePicker/DatePicker";
import Button from "../../Dynamic/utils/Button";
import { getsales, getSalesdues, PostSales } from "../../Network/AdminApi";
import moment from "moment";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import generatePdf from "../../Dynamic/utils/pdfGenerator";

const Sales = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [sales, setSales] = useState([]);
  const [duesSales, setDuesSales] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentDisplay, setSelectedStudentDisplay] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [paidAmount, setPaidAmount] = useState("");
  const [paidMode, setPaidMode] = useState({ label: "Cash", value: "Cash" });
  const [additionalDuePayment, setAdditionalDuePayment] = useState("");
  const [dueAmount, setDueAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);
  const [error, setError] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptHtmlContent, setReceiptHtmlContent] = useState("");
  const [selectedStudentTotalDue, setSelectedStudentTotalDue] = useState(0);
  const [selectedStudentUnpaidSales, setSelectedStudentUnpaidSales] = useState(
    []
  );
  const [dueSaleNumber, setDueSaleNumber] = useState("");
  const [duePaymentAmount, setDuePaymentAmount] = useState("");
  const [dueNewItems, setDueNewItems] = useState([]);
  const [dueSelectedItem, setDueSelectedItem] = useState("");
  const [filterData, setFilterData] = useState([]);
  const [values, setValues] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    mode: {},
  });

  const receiptModalContentRef = useRef();
  const searchContainerRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error("Authentication token not found.");
        }
        const headers = { Authorization: `Bearer ${token}` };

        const [
          studentResponse,
          itemResponse,
          bundleResponse,
          salesResponse,
          duesResponse,
        ] = await Promise.all([
          axios.get(
            "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/studentparent?fetchAllStudents=true",
            { withCredentials: true, headers }
          ),
          axios.get("https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items", {
            withCredentials: true,
            headers,
          }),
          axios.get(
            "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/bundles",
            { withCredentials: true, headers }
          ),
          axios.get("https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales", {
            withCredentials: true,
            headers,
          }),
          axios.get(
            "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/salesdues",
            { withCredentials: true, headers }
          ),
        ]);

        if (studentResponse.data.success)
          setStudents(studentResponse.data.students.data || []);
        else
          throw new Error(
            studentResponse.data.message || "Failed to fetch students"
          );
        if (itemResponse.data.success)
          setItems(itemResponse.data.listOfAllItems || []);
        else
          throw new Error(itemResponse.data.message || "Failed to fetch items");
        if (bundleResponse.data.success)
          setBundles(bundleResponse.data.data || []);
        else
          throw new Error(
            bundleResponse.data.message || "Failed to fetch bundles"
          );
        if (salesResponse.data.success)
          setSales(salesResponse.data.sales?.reverse() || []);
        else
          throw new Error(
            salesResponse.data.message || "Failed to fetch sales"
          );
        if (duesResponse.data.success)
          setDuesSales(duesResponse.data.sales?.reverse() || []);
        else
          throw new Error(duesResponse.data.message || "Failed to fetch dues");
      } catch (error) {
        console.error("Fetch data error:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch data."
        );
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAllSales = async () => {
    const payload = {
      fromDate: moment(values?.fromDate).format("YYYY-MM-DD"),
      toDate: moment(values?.toDate).format("YYYY-MM-DD"),
    };
    try {
      const response = await getsales(payload);
      if (response?.success) {
        if (response.sales?.length <= 0) {
          toast.warn("Data Not Found");
          return;
        }
        toast.success(response?.message);
        setSales(response.sales?.reverse() || []);
        setFilterData(response.sales?.reverse() || []);
      } else {
        toast.warn(response?.message);
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (selectedStudent && selectedStudent.studentId && sales.length > 0) {
      const studentId = selectedStudent.studentId;
      const unpaidSales = sales.filter(
        (s) => s.studentId === studentId && s.paymentStatus !== "paid"
      );
      const totalDue = unpaidSales.reduce(
        (sum, sale) => sum + (sale.dueAmount || 0),
        0
      );
      setSelectedStudentTotalDue(totalDue);
      setSelectedStudentUnpaidSales(unpaidSales);
    } else {
      setSelectedStudentTotalDue(0);
      setSelectedStudentUnpaidSales([]);
      setDueSaleNumber("");
    }
  }, [sales, selectedStudent]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = students
      .filter((s) => {
        const term = searchTerm.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(term) ||
          (s.admissionNumber &&
            String(s.admissionNumber).toLowerCase().includes(term)) ||
          s.studentId.toLowerCase().includes(term)
        );
      })
      .slice(0, 10);
    setSearchResults(filtered);
    setShowSuggestions(true);
  }, [searchTerm, students]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    if (showSuggestions)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    const displayName = `${student.studentName} (${student.class})${
      student.admissionNumber
        ? ` [Adm: ${student.admissionNumber}] ${student.fatherName}`
        : ""
    }`;
    setSelectedStudentDisplay(displayName);
    setSearchTerm(student.studentName);
    setShowSuggestions(false);
    setSearchResults([]);
    setDueSaleNumber("");
    setDuePaymentAmount("");
    setDueNewItems([]);
    setDueSelectedItem("");
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() === "") {
      setSelectedStudent(null);
      setSelectedStudentDisplay("");
      setSelectedStudentTotalDue(0);
      setSelectedStudentUnpaidSales([]);
      setDueSaleNumber("");
      setDuePaymentAmount("");
      setDueNewItems([]);
      setDueSelectedItem("");
    }
  };

  const itemOptions = [
    ...items.map((item) => ({
      value: `item:${item.itemId}`,
      label: `${item.itemName} - ₹${item.price.toFixed(2)}`,
    })),
    ...bundles.map((bundle) => ({
      value: `bundle:${bundle.bundleId}`,
      label: `${bundle.bundleName} - ₹${bundle.price.toFixed(2)}`,
    })),
  ];

  const handleAddItem = () => {
    if (!selectedItem) {
      toast.warn("Please select an item or bundle to add.");
      return;
    }
    const [type, id] = selectedItem.split(":");
    if (type === "item") {
      const itemToAdd = items.find((i) => i.itemId === id);
      if (itemToAdd) {
        const existingItemIndex = selectedItems.findIndex(
          (i) => i.itemId === id && !i.bundleId
        );
        if (existingItemIndex > -1) {
          handleIncreaseQuantity(id);
        } else {
          setSelectedItems([...selectedItems, { ...itemToAdd, quantity: 1 }]);
        }
      }
    } else if (type === "bundle") {
      const bundle = bundles.find((b) => b.bundleId === id);
      if (bundle) {
        const totalIndividualPrice = bundle.items.reduce((sum, bi) => {
          const item = items.find((i) => i.itemId === bi.itemId);
          return sum + (item ? item.price * bi.quantity : 0);
        }, 0);
        const allocationRatio =
          totalIndividualPrice > 0 ? bundle.price / totalIndividualPrice : 1;
        const bundleItems = bundle.items
          .map((bi) => {
            const item = items.find((i) => i.itemId === bi.itemId);
            if (!item) return null;
            const adjustedPrice = item.price * allocationRatio;
            return {
              itemId: item.itemId,
              itemName: item.itemName,
              category: item.category,
              quantity: bi.quantity,
              price: adjustedPrice,
              total: adjustedPrice * bi.quantity,
              icon: item.icon,
              color: item.color,
              bundleId: bundle.bundleId,
            };
          })
          .filter(Boolean);
        setSelectedItems([...selectedItems, ...bundleItems]);
      }
    }
    setSelectedItem("");
  };

  const handleQuantityChange = (itemId, quantityStr) => {
    const quantity = Math.max(1, parseInt(quantityStr) || 1);
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity, total: i.price * quantity } : i
      )
    );
  };

  const handleIncreaseQuantity = (itemId) => {
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId
          ? {
              ...i,
              quantity: i.quantity + 1,
              total: i.price * (i.quantity + 1),
            }
          : i
      )
    );
  };

  const handleDecreaseQuantity = (itemId) => {
    setSelectedItems(
      selectedItems
        .map((i) =>
          i.itemId === itemId && i.quantity > 1
            ? {
                ...i,
                quantity: i.quantity - 1,
                total: i.price * (i.quantity - 1),
              }
            : i
        )
        .filter((i) => !(i.itemId === itemId && i.quantity <= 1))
    );
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
  };

  const handleAddDueItem = () => {
    if (!dueSelectedItem) {
      toast.warn("Please select an item to add for dues payment.");
      return;
    }
    const itemToAdd = items.find((i) => i.itemId === dueSelectedItem);
    if (itemToAdd) {
      const existingItemIndex = dueNewItems.findIndex(
        (i) => i.itemId === dueSelectedItem
      );
      if (existingItemIndex > -1) {
        const updatedItems = dueNewItems.map((i) =>
          i.itemId === dueSelectedItem ? { ...i, quantity: i.quantity + 1 } : i
        );
        setDueNewItems(updatedItems);
      } else {
        setDueNewItems([...dueNewItems, { ...itemToAdd, quantity: 1 }]);
      }
      setDueSelectedItem("");
    }
  };

  const handleDueQuantityChange = (itemId, quantityStr) => {
    const quantity = Math.max(1, parseInt(quantityStr) || 1);
    setDueNewItems(
      dueNewItems.map((i) => (i.itemId === itemId ? { ...i, quantity } : i))
    );
  };

  const handleDueIncreaseQuantity = (itemId) => {
    setDueNewItems(
      dueNewItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const handleDueDecreaseQuantity = (itemId) => {
    setDueNewItems(
      dueNewItems
        .map((i) =>
          i.itemId === itemId && i.quantity > 1
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => !(i.itemId === itemId && i.quantity <= 1))
    );
  };

  const handleDueRemoveItem = (itemId) => {
    setDueNewItems(dueNewItems.filter((i) => i.itemId !== itemId));
  };

  useEffect(() => {
    const calculatedSubtotal = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(calculatedSubtotal);
    const paid = parseFloat(paidAmount) || 0;
    setDueAmount(Math.max(0, calculatedSubtotal - paid));
  }, [selectedItems, paidAmount]);

   const handleSubmit = async () => {
    
    if (!selectedStudent || !selectedStudent.studentId) {
      toast.error("Please search and select a student.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please add items to the sale.");
      return;
    }
    if (selectedStudentTotalDue > 0) {
      toast.info(
        `Note: This student has a previous due balance of ₹${selectedStudentTotalDue.toFixed(
          2
        )}.`
      );
    }

    const saleData = {
      studentId: selectedStudent.studentId,
      items: selectedItems.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
        bundleId: i.bundleId,
      })),
      paymentStatus:
        (parseFloat(paidAmount) || 0) >= subtotal ? "paid" : "pending",
      paidAmount: parseFloat(paidAmount) || 0,
      paymentMode: paidMode?.value,
    };

    try {
      setIsSubmitting(true);
      const response = await PostSales(saleData);
      console.log("firstresponse",response)
      if (response?.success) {
        toast.success(response?.data?.message)
        const newSale = response?.data.sale;
        const studentDetailsForReceipt = { ...selectedStudent };
        const itemsForReceipt =
          response?.receipt?.items ||
          selectedItems.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          }));

        let updatedSales = [newSale, ...sales];
        setSales(updatedSales);
        setDuesSales((prev) =>
          newSale.paymentStatus !== "paid" ? [newSale, ...prev] : prev
        );

        const studentId = selectedStudent.studentId;
        let unpaidSalesAfterSubmit = updatedSales.filter(
          (s) => s.studentId === studentId && s.paymentStatus !== "paid"
        );
        let totalDueAfterSubmit = unpaidSalesAfterSubmit.reduce(
          (sum, sale) => sum + (sale.dueAmount || 0),
          0
        );
        setSelectedStudentTotalDue(totalDueAfterSubmit);
        setSelectedStudentUnpaidSales(unpaidSalesAfterSubmit);

        if (
          parseFloat(additionalDuePayment) > 0 &&
          unpaidSalesAfterSubmit.length > 0
        ) {
          const oldestUnpaidSale = unpaidSalesAfterSubmit.sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          )[0];
          if (oldestUnpaidSale) {
            const duesData = {
              saleNumber: oldestUnpaidSale.saleNumber,
              paymentAmount: parseFloat(additionalDuePayment),
              newItems: [],
            };
            const duesResponse = await axios.post(
              "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/duesandsales",
              duesData,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (duesResponse.data.success) {
              const updatedSale = duesResponse.data.data.sale;
              updatedSales = updatedSales.map((s) =>
                s.saleNumber === updatedSale.saleNumber ? updatedSale : s
              );
              setSales(updatedSales);
              setDuesSales((prev) =>
                prev
                  .map((s) =>
                    s.saleNumber === updatedSale.saleNumber ? updatedSale : s
                  )
                  .filter((s) => s.paymentStatus !== "paid")
              );
              unpaidSalesAfterSubmit = updatedSales.filter(
                (s) => s.studentId === studentId && s.paymentStatus !== "paid"
              );
              totalDueAfterSubmit = unpaidSalesAfterSubmit.reduce(
                (sum, sale) => sum + (sale.dueAmount || 0),
                0
              );
              setSelectedStudentTotalDue(totalDueAfterSubmit);
              setSelectedStudentUnpaidSales(unpaidSalesAfterSubmit);
              toast.success("Additional dues payment processed successfully!");
            } else {
              toast.error(
                duesResponse.data.message ||
                  "Failed to process additional dues payment."
              );
            }
          }
        }

        setSelectedItems([]);
        setPaidAmount("");
        setAdditionalDuePayment("");
        setSubtotal(0);
        setDueAmount(0);
        setSearchResults([]);
        setShowSuggestions(false);

        toast.success(response.data.message || "Sale created successfully!");
        const receiptData = { ...newSale, items: itemsForReceipt };
        generateReceiptHtml(receiptData, studentDetailsForReceipt);
      } else {
        toast.error(response.message );
      }
    } catch (error) {
      // console.error("Submit sale error:", error);
      // toast.error(
      //   error.response?.data?.message ||
      //     "An error occurred while creating the sale."
      // );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayDues = async () => {
    if (!dueSaleNumber) {
      toast.error("Please select a sale to pay dues for.");
      return;
    }
    if (!duePaymentAmount && dueNewItems.length === 0) {
      toast.error("Please enter a payment amount or add new items.");
      return;
    }
    if (duePaymentAmount && parseFloat(duePaymentAmount) <= 0) {
      toast.error("Payment amount must be greater than zero.");
      return;
    }

    const duesData = {
      saleNumber: parseInt(dueSaleNumber),
      paymentAmount: parseFloat(duePaymentAmount) || 0,
      newItems: dueNewItems.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
      })),
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/duesandsales",
        duesData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        const updatedSale = response.data.data.sale;
        const updatedSales = sales.map((s) =>
          s.saleNumber === updatedSale.saleNumber ? updatedSale : s
        );
        setSales(updatedSales);
        setDuesSales((prev) =>
          prev
            .map((s) =>
              s.saleNumber === updatedSale.saleNumber ? updatedSale : s
            )
            .filter((s) => s.paymentStatus !== "paid")
        );

        const studentId = selectedStudent?.studentId;
        if (studentId) {
          const unpaidSalesAfterPayment = updatedSales.filter(
            (s) => s.studentId === studentId && s.paymentStatus !== "paid"
          );
          const totalDueAfterPayment = unpaidSalesAfterPayment.reduce(
            (sum, sale) => sum + (sale.dueAmount || 0),
            0
          );
          setSelectedStudentTotalDue(totalDueAfterPayment);
          setSelectedStudentUnpaidSales(unpaidSalesAfterPayment);
        }

        setDueSaleNumber("");
        setDuePaymentAmount("");
        setDueNewItems([]);
        setDueSelectedItem("");

        toast.success(response.data.message || "Dues paid successfully!");
        const receiptData = response.data.receipt;
        generateReceiptHtml(receiptData, selectedStudent);
      } else {
        toast.error(response.data.message || "Failed to process dues payment.");
      }
    } catch (error) {
      console.error("Pay dues error:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while processing dues payment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReceiptHtml = (receiptData, student) => {
    if (!receiptData) return;

    const studentInfo = student
      ? `${student.studentName} (${student.class} - ${student.section})${
          student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ""
        }`
      : `Student ID: ${receiptData.studentId}`;

    const paymentHistory =
      receiptData.paymentHistory?.length > 0
        ? receiptData.paymentHistory
            .map(
              (p) =>
                `<p style="margin: 2px 0; font-size: 12px;">Paid ₹${p.amount.toFixed(
                  2
                )} on ${new Date(p.date).toLocaleString()}</p>`
            )
            .join("")
        : '<p style="margin: 2px 0; font-size: 12px; color: #777;">No payments recorded.</p>';

    const receiptContent = `
      <div style="width: 320px; padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; background-color: #ffffff; border: 1px solid #eee; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h2 style="font-size: 16px; text-align: center; font-weight: 600; color: #333;">${
          user?.schoolName
        }</h2>
        <h2 style="font-size: 16px; text-align: center; font-weight: 600; color: #333;">${
          user?.contact
        }</h2>
        <h4 style="font-size: 16px; text-align: center; margin: 0 0 10px; font-weight: 600; color: #333;">INVOICE / RECEIPT</h4>
        <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0;"><strong>Student:</strong> ${studentInfo}</p>
            <p style="margin: 2px 0;"><strong>Sale Number:</strong> ${
              receiptData.saleNumber
            }</p>
            <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(
              receiptData.date
            ).toLocaleString()}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px;">
          <thead>
            <tr style="border-top: 1px dashed #aaa; border-bottom: 1px dashed #aaa;">
              <th style="padding: 6px 4px; text-align: left; font-weight: 600;">Item</th>
              <th style="padding: 6px 4px; text-align: center; font-weight: 600;">Qty</th>
              <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Price</th>
              <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(receiptData.items || [])
              .map(
                (item) => `
              <tr style="border-bottom: 1px dotted #ccc;">
                <td style="padding: 5px 4px; word-break: break-word;">${
                  item.itemName || "N/A"
                }${item.bundleId ? " (Bundle)" : ""}</td>
                <td style="padding: 5px 4px; text-align: center;">${
                  item.quantity
                }</td>
                <td style="padding: 5px 4px; text-align: right;">₹${
                  item.price?.toFixed(2) || "0.00"
                }</td>
                <td style="padding: 5px 4px; text-align: right;">₹${
                  (item.total || item.price * item.quantity).toFixed(2) ||
                  "0.00"
                }</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 12px; text-align: right; border-top: 1px dashed #aaa; padding-top: 8px;">
            <p style="margin: 3px 0; font-size: 13px;"><strong>Subtotal:</strong> ₹${receiptData.totalAmount?.toFixed(
              2
            )}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Paid:</strong> ₹${receiptData.paidAmount?.toFixed(
              2
            )}</p>
            <p style="margin: 5px 0; font-weight: bold; font-size: 14px;"><strong>Due:</strong> ₹${receiptData.dueAmount?.toFixed(
              2
            )}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: 500;">${
              receiptData.paymentStatus
            }</span></p>
        </div>
        <div style="margin-top: 10px; border-top: 1px dashed #aaa; padding-top: 8px;">
            <p style="margin: 2px 0; font-size: 13px; font-weight: 600;">Payment History:</p>
            ${paymentHistory}
        </div>
        <p style="font-size: 11px; text-align: center; margin-top: 15px; color: #777;">Thank you for your purchase!</p>
      </div>
    `;

    setReceiptHtmlContent(receiptContent);
    setShowReceiptModal(true);
  };

  const handlePrint = () => {
    const contentToPrint = receiptModalContentRef.current;
    if (!contentToPrint) {
      toast.error("Receipt content not found for printing.");
      return;
    }

    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (!printWindow) {
      toast.error(
        "Failed to open print window. Please check browser pop-up settings."
      );
      return;
    }

    printWindow.document.write("<html><head>");
    printWindow.document.write(`
        <style>
            body { margin: 0; padding: 10mm; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.4; width: 300px; }
            @page { size: auto; margin: 5mm; }
            @media print { body > div { margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; } }
            h2 { font-size: 15px; text-align: center; margin: 0 0 10px 0; font-weight: 600; color: #000; }
            p { margin: 3px 0; color: #000; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; color: #000; }
            th, td { padding: 4px 3px; border-bottom: 1px dotted #888; text-align: left; word-break: break-word; }
            th { border-top: 1px dashed #555; border-bottom: 1px dashed #555; font-weight: 600; background-color: #f0f0f0; }
            th:nth-child(2), td:nth-child(2) { text-align: center; }
            th:nth-child(3), td:nth-child(3), th:nth-child(4), td:nth-child(4) { text-align: right; }
            div[style*="text-align: right"] { margin-top: 12px; text-align: right; border-top: 1px dashed #555; padding-top: 8px; }
            div[style*="text-align: right"] p { margin: 2px 0; font-size: 12px; }
            div[style*="text-align: right"] p strong { font-weight: bold; }
            p[style*="text-align: center"] { font-size: 10px; margin-top: 15px; color: #555; }
        </style>
    `);
    printWindow.document.write("</head><body>");
    printWindow.document.write(contentToPrint.innerHTML);
    printWindow.document.write("</body></html>");

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      try {
        printWindow.print();
      } catch (e) {
        console.error("Print error:", e);
        toast.error("Could not initiate printing.");
        printWindow.close();
      }
    }, 500);
  };

  const handleDateCange = (dateValue, name) => {
    setValues((prev) => ({ ...prev, [name]: dateValue }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlsearch = () => {
    if (values?.fromDate && values?.toDate) getAllSales();
  };

  useEffect(() => {
    const filtervalue = sales.filter((val) =>
      values?.mode === "All" ? true : val?.paymentStatus === values?.mode
    );
    setFilterData(filtervalue || sales);
  }, [values?.mode]);

  const overallTotalPaid = () =>
    filterData.reduce(
      (sum, item) => sum + (parseFloat(item?.paidAmount) || 0),
      0
    );
  const overallTotalDuesSum = () =>
    filterData.reduce(
      (sum, item) => sum + (parseFloat(item?.dueAmount) || 0),
      0
    );

  const handleDownloadPdf = () => {
    const dataToExport = filterData.map((val) => {
      const student = students.find((st) => st.studentId === val.studentId);
      return {
        ...val,
        studentName: student?.studentName || "N/A",
        Class: `${student?.class} - ${student?.section}` || "N/A",
        admissionNumber: student?.admissionNumber || "N/A",
      };
    });

    const columns = [
      { header: "Rcpt.No.", dataKey: "saleNumber" },
      { header: "Date", dataKey: "date" },
      { header: "Admission No.", dataKey: "admissionNumber" },
      { header: "Student", dataKey: "studentName" },
      { header: "Class", dataKey: "Class" },
      { header: "Total Amt.", dataKey: "totalAmount" },
      { header: "Paid Amt.", dataKey: "paidAmount" },
      { header: "Dues Amt.", dataKey: "dueAmount" },
      { header: "Status", dataKey: "paymentStatus" },
    ];
    const filename = "Inventory Details";
    generatePdf(
      dataToExport,
      columns,
      overallTotalPaid(),
      overallTotalDuesSum(),
      filename
    );
  };

  const handlePrintReceipt = async (saleNumber) => {
    if (!saleNumber) {
      toast.error("Sale number is missing. Unable to fetch receipt.");
      return;
    }

    try {
      setIsFetchingReceipt(true);
      const response = await axios.get(
        `https://api.digitalvidyasaarthi.in/api/v1/adminRoute/receipts/${encodeURIComponent(
          saleNumber
        )}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.receipt) {
        const receiptDetails = response.data.receipt;
        const student = students.find(
          (s) => s.studentId === receiptDetails.studentId
        );
        generateReceiptHtml(receiptDetails, student);
        toast.success("Receipt preview ready.");
      } else {
        toast.warning(
          `Failed to fetch receipt details: ${
            response.data.message || "Not found"
          }`
        );
      }
    } catch (error) {
      console.error("Error in handlePrintReceipt:", error);
      toast.error(
        `Error fetching receipt: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsFetchingReceipt(false);
    }
  };

  if (loading && !filterData.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !filterData.length) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
        Error: {error}
      </div>
    );
  }

  const renderSalesTable = (salesData) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Adm No.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sale #
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Paid
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {salesData.length === 0 && !loading && (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-6 text-center text-sm text-gray-500 italic"
              >
                No sales records found.
              </td>
            </tr>
          )}
          {salesData.map((s) => {
            const student = students.find((st) => st.studentId === s.studentId);
            const studentDisplay = student
              ? `${student.studentName} (${student.class}-${student.section})`
              : `ID: ${s.studentId}`;
            return (
              <tr
                key={s._id || s.saleNumber}
                className={`hover:bg-gray-50/80 transition-colors duration-150 ${
                  s.paymentStatus !== "paid" ? "bg-red-50/40" : ""
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {new Date(s.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-normal text-sm text-gray-800 font-medium">
                  {student?.admissionNumber}
                </td>
                <td className="px-4 py-3 whitespace-normal text-sm text-gray-800 font-medium">
                  {studentDisplay}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-[11px]">
                  {s.saleNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  ₹{s.totalAmount?.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700 text-right">
                  ₹{s.paidAmount?.toFixed(2)}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                    s.dueAmount > 0
                      ? "text-red-700 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  ₹{s.dueAmount?.toFixed(2)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span
                    className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      s.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {s.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => handlePrintReceipt(s.saleNumber)}
                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1 mx-auto text-xs"
                    disabled={isFetchingReceipt || isSubmitting}
                    title="View & Print Receipt"
                  >
                    View / Print
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="">
      <PageHeaderWithBreadcrumb
        breadcrumbItems={BreadcrumbList.admission}
        title="Create New Sale"
      />
      <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 items-start">
            <div className="relative" ref={searchContainerRef}>
              <ReactInput
                label="Student Search"
                name="studentSearch"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Name/Adm#/ID"
                required
              />
              {selectedStudentDisplay ? (
                <span className="font-medium text-green-600">
                  Selected: {selectedStudentDisplay}
                </span>
              ) : (
                "No student selected"
              )}
              {selectedStudent && selectedStudentTotalDue > 0 && (
                <div className="p-3 border border-orange-400 bg-orange-50 rounded-md text-sm shadow-sm">
                  <p className="font-semibold text-orange-800 mb-1">
                    <span className="font-bold text-red-600">(!)</span> Previous
                    Outstanding Balance:{" "}
                    <span className="font-bold text-red-600 text-base ml-1">
                      ₹{selectedStudentTotalDue.toFixed(2)}
                    </span>
                  </p>
                  {selectedStudentUnpaidSales.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-orange-200 text-xs text-gray-700 max-h-24 overflow-y-auto">
                      <p className="font-medium mb-0.5 text-gray-600">
                        Details:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {selectedStudentUnpaidSales.map((sale) => (
                          <li key={sale._id || sale.saleNumber}>
                            {new Date(sale.date).toLocaleDateString()} - Sale #:{" "}
                            <span className="font-mono text-[11px]">
                              {sale.saleNumber}
                            </span>{" "}
                            - Due:{" "}
                            <span className="font-semibold">
                              ₹{sale.dueAmount.toFixed(2)}
                            </span>{" "}
                            ({sale.paymentStatus})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {showSuggestions && (
                <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <table className="text-sm text-left text-gray-800">
                      <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-2 py-1 text-[10px]">
                            Name
                          </th>
                          <th scope="col" className="px-2 py-1 text-[10px]">
                            Class
                          </th>
                          <th scope="col" className="px-2 py-1 text-[10px]">
                            Adm No
                          </th>
                          <th scope="col" className="px-2 py-1 text-[10px]">
                            Father
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((student) => (
                          <tr
                            key={student.studentId}
                            className="bg-white border-b last:border-b-0 hover:bg-indigo-50 cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleStudentSelect(student);
                            }}
                          >
                            <td className="px-2 py-1 text-[13px] font-bold text-gray-900 whitespace-nowrap">
                              {student.studentName}
                            </td>
                            <td className="px-2 py-1 text-[13px] text-gray-600">
                              {student.class}-{student.section}
                            </td>
                            <td className="px-2 py-1 text-[13px] text-xs text-blue-600">
                              {student.admissionNumber || "-"}
                            </td>
                            <td className="px-2 py-1 text-[13px] text-xs text-blue-600">
                              {student.fatherName || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 italic">
                      No students found matching "{searchTerm}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              New Sale Items
            </h3>
            <ReactSelect
              label="Item or Bundle"
              name="selectedItem"
              value={selectedItem}
              handleChange={(e) => setSelectedItem(e.target.value)}
              dynamicOptions={itemOptions}
            />
            <Button
              type="button"
              name="Add Item"
              onClick={handleAddItem}
              color="blue"
              disabled={!selectedItem || isSubmitting}
            />
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-5">
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-semibold text-gray-700">
                  Total:
                </span>
                <span className="text-xl font-bold text-blue-800">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-full sm:w-32">
                  <ReactInput
                    label="Amount Paid"
                    type="number"
                    name="paidAmount"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    required={false}
                  />
                </div>
                <ReactSelect
                  label="Mode"
                  name="paidMode"
                  value={paidMode}
                  handleChange={(e) => setPaidMode(e.target.value)}
                  dynamicOptions={[
                    { label: "Cash", value: "Cash" },
                    { label: "Online", value: "Online" },
                  ]}
                />
                <div className="w-full sm:w-32">
                  <ReactInput
                    label="Pay Dues"
                    type="number"
                    name="additionalDuePayment"
                    value={additionalDuePayment}
                    onChange={(e) => setAdditionalDuePayment(e.target.value)}
                    required={false}
                  />
                  {selectedStudentUnpaidSales.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Additional payment will be applied to the oldest unpaid
                      sale.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right pt-3">
              <Button
                type="button"
                onClick={handleSubmit}
                className={`inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ${
                  isSubmitting || !selectedStudent || selectedItems.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={
                  isSubmitting || !selectedStudent || selectedItems.length === 0
                }
                name={
                  isSubmitting ? "Processing..." : "Create Sale & View Receipt"
                }
              />
            </div>
          </div>

          {selectedStudent && selectedStudentUnpaidSales.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Pay Previous Dues
              </h3>
              <div className="space-y-4">
                <ReactSelect
                  label="Sale to Pay Dues For"
                  name="dueSaleNumber"
                  value={dueSaleNumber}
                  handleChange={(e) => setDueSaleNumber(e.target.value)}
                  dynamicOptions={selectedStudentUnpaidSales.map((sale) => ({
                    value: sale.saleNumber,
                    label: `Sale #${
                      sale.saleNumber
                    } - Due: ₹${sale.dueAmount.toFixed(2)} (${new Date(
                      sale.date
                    ).toLocaleDateString()})`,
                  }))}
                  required
                />
                <div className="flex items-start space-x-3">
                  <div className="flex-grow">
                    <ReactSelect
                      label="Add New Item (Optional)"
                      name="dueSelectedItem"
                      value={dueSelectedItem}
                      handleChange={(e) => setDueSelectedItem(e.target.value)}
                      dynamicOptions={itemOptions.filter(
                        (opt) => !opt.value.startsWith("bundle:")
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddDueItem}
                    color="blue"
                    disabled={!dueSelectedItem || isSubmitting}
                    name="Add Item"
                  />
                </div>
                {dueNewItems.length > 0 && (
                  <div className="border border-gray-200 rounded-md bg-white p-3">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      New Items for Dues Payment
                    </h4>
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-2 font-medium">
                            Item
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-right font-medium"
                          >
                            Price
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-center font-medium w-32"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-right font-medium"
                          >
                            Total
                          </th>
                          <th
                            scope="col"
                            className="px-1 py-2 text-center font-medium w-10"
                          ></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {dueNewItems.map((item) => (
                          <tr key={item.itemId} className="hover:bg-gray-50/80">
                            <td className="px-4 py-1.5 font-medium text-gray-900 whitespace-normal">
                              {item.itemName}
                            </td>
                            <td className="px-4 py-1.5 text-right text-gray-700">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-1.5">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() =>
                                    handleDueDecreaseQuantity(item.itemId)
                                  }
                                  className="p-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={item.quantity <= 1 || isSubmitting}
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleDueQuantityChange(
                                      item.itemId,
                                      e.target.value
                                    )
                                  }
                                  className="w-10 h-6 text-center border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                  min="1"
                                  disabled={isSubmitting}
                                  aria-label={`Quantity for ${item.itemName}`}
                                />
                                <button
                                  onClick={() =>
                                    handleDueIncreaseQuantity(item.itemId)
                                  }
                                  className="p-0.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={isSubmitting}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-1.5 text-right font-semibold text-gray-800">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="px-1 py-1.5 text-center">
                              <button
                                onClick={() => handleDueRemoveItem(item.itemId)}
                                className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full hover:bg-red-100"
                                disabled={isSubmitting}
                                aria-label="Remove item"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-full sm:w-32">
                    <ReactInput
                      label="Payment"
                      type="number"
                      name="duePaymentAmount"
                      value={duePaymentAmount}
                      onChange={(e) => setDuePaymentAmount(e.target.value)}
                      required={dueNewItems.length === 0}
                    />
                  </div>
                  <Button
                    type="button"
                    name={
                      isSubmitting ? "Processing..." : "Pay Dues & View Receipt"
                    }
                    onClick={handlePayDues}
                    className={`inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ${
                      isSubmitting || !dueSaleNumber
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isSubmitting || !dueSaleNumber}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg bg-gray-50/70 flex flex-col min-h-[300px] max-h-[500px]">
          <h3 className="text-lg font-semibold p-3 border-b border-gray-200 text-gray-700 bg-white rounded-t-lg sticky top-0 z-10">
            Shopping Cart (Current Sale)
          </h3>
          {selectedItems.length > 0 ? (
            <div className="overflow-y-auto flex-grow">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right font-medium"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-center font-medium w-32"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right font-medium"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-1 py-2 text-center font-medium w-10"
                    ></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedItems.map((item) => (
                    <tr key={item.itemId} className="hover:bg-gray-50/80">
                      <td className="px-4 py-1.5 font-medium text-gray-900 whitespace-normal">
                        {item.itemName}
                        {item.bundleId ? " (Bundle)" : ""}
                      </td>
                      <td className="px-4 py-1.5 text-right text-gray-700">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-1.5">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleDecreaseQuantity(item.itemId)}
                            className="p-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1 || isSubmitting}
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.itemId, e.target.value)
                            }
                            className="w-10 h-6 text-center border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                            min="1"
                            disabled={isSubmitting}
                            aria-label={`Quantity for ${item.itemName}`}
                          />
                          <button
                            onClick={() => handleIncreaseQuantity(item.itemId)}
                            className="p-0.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-1.5 text-right font-semibold text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.itemId)}
                          className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full hover:bg-red-100"
                          disabled={isSubmitting}
                          aria-label="Remove item"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center text-gray-500 py-10 px-4 italic">
                Cart is empty. Select items or bundles above and click "Add
                Item".
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <PageHeaderWithBreadcrumb />
        <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex gap-5 mb-4">
          <DatePicker
            className="custom-calendar"
            placeholder=""
            label="From Date"
            respclass="col-xl-2 col-md-3 col-sm-6 col-12"
            name="fromDate"
            id="fromDate"
            value={new Date(values.fromDate)}
            handleChange={(e) => handleDateCange(e.value, "fromDate")}
            hourFormat="12"
          />
          <DatePicker
            className="custom-calendar"
            placeholder=""
            label="To Date"
            respclass="col-xl-2 col-md-3 col-sm-6 col-12"
            name="toDate"
            id="toDate"
            value={new Date(values.toDate)}
            handleChange={(e) => handleDateCange(e.value, "toDate")}
            hourFormat="12"
          />
          <Button color="green" name="Search ALL Sale" onClick={handlsearch} />
          <ReactSelect
            label="Mode"
            name="mode"
            value={values?.mode}
            handleChange={(e) => handleInputChange(e)}
            dynamicOptions={[
              { label: "All", value: "All" },
              { label: "Paid", value: "paid" },
              { label: "Pending", value: "pending" },
            ]}
          />
          <Button
            name="Download Report"
            onClick={handleDownloadPdf}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded h-10"
          />
        </div>
        {loading && sales.length === 0 && (
          <p className="text-center py-4 text-gray-500">Loading history...</p>
        )}
        {error && sales.length === 0 && (
          <p className="text-center py-4 text-red-500">
            Error loading history: {error}
          </p>
        )}
        {activeTab === "all"
          ? renderSalesTable(filterData)
          : renderSalesTable(duesSales)}
      </div>

      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-white rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-800">
                Receipt Preview
              </h2>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptHtmlContent("");
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-4 md:p-6 flex-grow overflow-y-auto flex justify-center">
              {receiptHtmlContent ? (
                <div
                  ref={receiptModalContentRef}
                  dangerouslySetInnerHTML={{ __html: receiptHtmlContent }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 py-10">
                  Generating preview...
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-3 p-4 border-t border-gray-300 bg-white rounded-b-lg">
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 text-sm font-medium shadow-sm disabled:opacity-60"
                disabled={!receiptHtmlContent || isSubmitting}
              >
                🖨️ Print
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptHtmlContent("");
                }}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;






// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import Button from "../../Dynamic/utils/Button";
// import { getsales, getSalesdues, PostSales } from "../../Network/AdminApi";
// import moment from "moment";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";

// const Sales = () => {
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [students, setStudents] = useState([]);
//   const [items, setItems] = useState([]);
//   const [sales, setSales] = useState([]);
//   const [duesSales, setDuesSales] = useState([]);
//   const [activeTab, setActiveTab] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [selectedStudentDisplay, setSelectedStudentDisplay] = useState("");
//   const [selectedItem, setSelectedItem] = useState("");
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [subtotal, setSubtotal] = useState(0);
//   const [paidAmount, setPaidAmount] = useState("");
//   const [paidMode, setPaidMode] = useState({ label: "Cash", value: "Cash" });
//   const [additionalDuePayment, setAdditionalDuePayment] = useState("");
//   const [dueAmount, setDueAmount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);
//   const [error, setError] = useState(null);
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [receiptHtmlContent, setReceiptHtmlContent] = useState("");
//   const [selectedStudentTotalDue, setSelectedStudentTotalDue] = useState(0);
//   const [selectedStudentUnpaidSales, setSelectedStudentUnpaidSales] = useState(
//     []
//   );
//   const [dueSaleNumber, setDueSaleNumber] = useState("");
//   const [duePaymentAmount, setDuePaymentAmount] = useState("");
//   const [dueNewItems, setDueNewItems] = useState([]);
//   const [dueSelectedItem, setDueSelectedItem] = useState("");
//   const [filterData, setFilterData] = useState([]);
//   const [values, setValues] = useState({
//     fromDate: new Date(),
//     toDate: new Date(),
//     mode: {},
//   });

//   // Refs
//   const receiptModalContentRef = useRef();
//   const searchContainerRef = useRef();

//   // Fetch Initial Data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!token) {
//           throw new Error("Authentication token not found.");
//         }
//         const headers = { Authorization: `Bearer ${token}` };

//         const [studentResponse, itemResponse, salesResponse, duesResponse] =
//           await Promise.all([
//             axios.get(
//               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/studentparent?fetchAllStudents=true",
//               { withCredentials: true, headers }
//             ),
//             axios.get(
//               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items",
//               { withCredentials: true, headers }
//             ),
//             axios.get(
//               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
//               { withCredentials: true, headers }
//             ),
//             axios.get(
//               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/salesdues",
//               { withCredentials: true, headers }
//             ),
//           ]);

//         if (studentResponse.data.success) {
//           setStudents(studentResponse.data.students.data || []);
//         } else {
//           throw new Error(
//             studentResponse.data.message || "Failed to fetch students"
//           );
//         }
//         if (itemResponse.data.success) {
//           setItems(itemResponse.data.listOfAllItems || []);
//         } else {
//           throw new Error(itemResponse.data.message || "Failed to fetch items");
//         }
//         if (salesResponse.data.success) {
//           // setSales(salesResponse.data.sales?.reverse() || []);
//         } else {
//           throw new Error(
//             salesResponse.data.message || "Failed to fetch sales"
//           );
//         }
//         if (duesResponse.data.success) {
//           setDuesSales(duesResponse.data.sales?.reverse() || []);
//         } else {
//           throw new Error(duesResponse.data.message || "Failed to fetch dues");
//         }
//       } catch (error) {
//         console.error("Fetch data error:", error);
//         const errorMessage =
//           error.response?.data?.message ||
//           error.message ||
//           "Failed to fetch data.";
//         toast.error(errorMessage);
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const getAllSales = async () => {
//     const payload = {
//       fromDate: moment(values?.fromDate).format("YYYY-MM-DD"),
//       toDate: moment(values?.toDate).format("YYYY-MM-DD"),
//     };
//     try {
//       const response = await getsales(payload);

//       if (response?.success) {
//         if (response.sales?.length <= 0) {
//           toast.warn("Data Not Found");
//           return;
//         }
//         toast.success(response?.message);
//         setSales(response.sales?.reverse() || []);
//         setFilterData(response.sales?.reverse() || []);
//       } else {
//         toast.warn(response?.message);
//       }
//     } catch (error) {}
//   };

//   // Update unpaid sales when sales or student changes
//   useEffect(() => {
//     if (selectedStudent && selectedStudent.studentId && sales.length > 0) {
//       const studentId = selectedStudent.studentId;
//       const unpaidSales = sales.filter(
//         (s) => s.studentId === studentId && s.paymentStatus !== "paid"
//       );
//       const totalDue = unpaidSales.reduce(
//         (sum, sale) => sum + (sale.dueAmount || 0),
//         0
//       );
//       setSelectedStudentTotalDue(totalDue);
//       setSelectedStudentUnpaidSales(unpaidSales);
//     } else {
//       setSelectedStudentTotalDue(0);
//       setSelectedStudentUnpaidSales([]);
//       setDueSaleNumber("");
//     }
//   }, [sales, selectedStudent]);

//   // Student Search Logic
//   useEffect(() => {
//     if (searchTerm.trim() === "") {
//       setSearchResults([]);
//       setShowSuggestions(false);
//       return;
//     }
//     const filtered = students
//       .filter((s) => {
//         const term = searchTerm.toLowerCase();
//         const nameMatch = s.studentName.toLowerCase().includes(term);
//         const admissionMatch = s.admissionNumber
//           ? String(s.admissionNumber).toLowerCase().includes(term)
//           : false;
//         const idMatch = s.studentId.toLowerCase().includes(term);
//         return nameMatch || admissionMatch || idMatch;
//       })
//       .slice(0, 10);
//     setSearchResults(filtered);
//     setShowSuggestions(true);
//   }, [searchTerm, students]);

//   // Handle Clicking Outside Search Suggestions
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         searchContainerRef.current &&
//         !searchContainerRef.current.contains(event.target)
//       ) {
//         setShowSuggestions(false);
//       }
//     };
//     if (showSuggestions) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showSuggestions]);

//   // Handle Student Selection
//   const handleStudentSelect = (student) => {
//     setSelectedStudent(student);
//     const displayName = `${student.studentName} (${student.class})${
//       student.admissionNumber
//         ? ` [Adm: ${student.admissionNumber}] ${student.fatherName}`
//         : ""
//     }`;
//     setSelectedStudentDisplay(displayName);
//     setSearchTerm(student.studentName);
//     setShowSuggestions(false);
//     setSearchResults([]);
//     setDueSaleNumber("");
//     setDuePaymentAmount("");
//     setDueNewItems([]);
//     setDueSelectedItem("");
//   };

//   // Handle Search Input Change
//   const handleSearchChange = (e) => {
//     const newSearchTerm = e.target.value;
//     setSearchTerm(newSearchTerm);
//     if (newSearchTerm.trim() === "") {
//       setSelectedStudent(null);
//       setSelectedStudentDisplay("");
//       setSelectedStudentTotalDue(0);
//       setSelectedStudentUnpaidSales([]);
//       setDueSaleNumber("");
//       setDuePaymentAmount("");
//       setDueNewItems([]);
//       setDueSelectedItem("");
//     }
//   };

//   // Item Handling (Add, Quantity, Remove)
//   const itemOptions = items.map((item) => ({
//     value: item.itemId,
//     label: `${item.itemName} - ₹${item.price.toFixed(2)}`,
//   }));

//   const handleAddItem = () => {
//     if (!selectedItem) {
//       toast.warn("Please select an item to add.");
//       return;
//     }
//     const itemToAdd = items.find((i) => i.itemId === selectedItem);
//     if (itemToAdd) {
//       const existingItemIndex = selectedItems.findIndex(
//         (i) => i.itemId === selectedItem
//       );
//       if (existingItemIndex > -1) {
//         handleIncreaseQuantity(selectedItem);
//       } else {
//         setSelectedItems([...selectedItems, { ...itemToAdd, quantity: 1 }]);
//       }
//       setSelectedItem("");
//     }
//   };

//   const handleQuantityChange = (itemId, quantityStr) => {
//     const quantity = Math.max(1, parseInt(quantityStr) || 1);
//     setSelectedItems(
//       selectedItems.map((i) =>
//         i.itemId === itemId ? { ...i, quantity: quantity } : i
//       )
//     );
//   };

//   const handleIncreaseQuantity = (itemId) => {
//     setSelectedItems(
//       selectedItems.map((i) =>
//         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
//       )
//     );
//   };

//   const handleDecreaseQuantity = (itemId) => {
//     setSelectedItems(
//       selectedItems
//         .map((i) =>
//           i.itemId === itemId && i.quantity > 1
//             ? { ...i, quantity: i.quantity - 1 }
//             : i
//         )
//         .filter((i) => !(i.itemId === itemId && i.quantity <= 1))
//     );
//   };

//   const handleRemoveItem = (itemId) => {
//     setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
//   };

//   // Dues Payment Item Handling
//   const handleAddDueItem = () => {
//     if (!dueSelectedItem) {
//       toast.warn("Please select an item to add for dues payment.");
//       return;
//     }
//     const itemToAdd = items.find((i) => i.itemId === dueSelectedItem);
//     if (itemToAdd) {
//       const existingItemIndex = dueNewItems.findIndex(
//         (i) => i.itemId === dueSelectedItem
//       );
//       if (existingItemIndex > -1) {
//         const updatedItems = dueNewItems.map((i) =>
//           i.itemId === dueSelectedItem ? { ...i, quantity: i.quantity + 1 } : i
//         );
//         setDueNewItems(updatedItems);
//       } else {
//         setDueNewItems([...dueNewItems, { ...itemToAdd, quantity: 1 }]);
//       }
//       setDueSelectedItem("");
//     }
//   };

//   const handleDueQuantityChange = (itemId, quantityStr) => {
//     const quantity = Math.max(1, parseInt(quantityStr) || 1);
//     setDueNewItems(
//       dueNewItems.map((i) =>
//         i.itemId === itemId ? { ...i, quantity: quantity } : i
//       )
//     );
//   };

//   const handleDueIncreaseQuantity = (itemId) => {
//     setDueNewItems(
//       dueNewItems.map((i) =>
//         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
//       )
//     );
//   };

//   const handleDueDecreaseQuantity = (itemId) => {
//     setDueNewItems(
//       dueNewItems
//         .map((i) =>
//           i.itemId === itemId && i.quantity > 1
//             ? { ...i, quantity: i.quantity - 1 }
//             : i
//         )
//         .filter((i) => !(i.itemId === itemId && i.quantity <= 1))
//     );
//   };

//   const handleDueRemoveItem = (itemId) => {
//     setDueNewItems(dueNewItems.filter((i) => i.itemId !== itemId));
//   };

//   // Update Subtotal and Due Amount (Current Sale)
//   useEffect(() => {
//     const calculatedSubtotal = selectedItems.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );
//     setSubtotal(calculatedSubtotal);
//     const paid = parseFloat(paidAmount) || 0;
//     setDueAmount(Math.max(0, calculatedSubtotal - paid));
//   }, [selectedItems, paidAmount]);

//   // Handle Submit (Create Sale and Optionally Pay Dues)
//   const handleSubmit = async () => {
//     debugger;
//     if (!selectedStudent || !selectedStudent.studentId) {
//       toast.error("Please search and select a student.");
//       return;
//     }
//     if (selectedItems.length === 0) {
//       toast.error("Please add items to the sale.");
//       return;
//     }
//     if (selectedStudentTotalDue > 0) {
//       toast.info(
//         `Note: This student has a previous due balance of ₹${selectedStudentTotalDue.toFixed(
//           2
//         )}.`
//       );
//     }

//     const saleData = {
//       studentId: selectedStudent.studentId,
//       items: selectedItems.map((i) => ({
//         itemId: i.itemId,
//         quantity: i.quantity,
//       })),
//       paymentStatus:
//         (parseFloat(paidAmount) || 0) >= subtotal ? "paid" : "pending",
//       paidAmount: parseFloat(paidAmount) || 0,
//       paymentMode: paidMode?.value,
//     };
//     console.log("saleData", saleData);
//     try {
//       setIsSubmitting(true);
//       const response = await PostSales(saleData);
//       // const token = localStorage.getItem("token");
//       // const response = await axios.post(
//       //   "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
//       //   saleData,
//       //   {
//       //     withCredentials: true,
//       //     headers: { Authorization: `Bearer ${token}` },
//       //   }
//       // );
//       if (response?.success) {
//         const newSale = response?.data.sale;
//         const studentDetailsForReceipt = { ...selectedStudent };
//         const itemsForReceipt =
//           response?.receipt?.items ||
//           selectedItems.map((item) => ({
//             itemName: item.itemName,
//             quantity: item.quantity,
//             price: item.price,
//             total: item.price * item.quantity,
//           }));

//         let updatedSales = [newSale, ...sales];
//         setSales(updatedSales);
//         setDuesSales((prev) =>
//           newSale.paymentStatus !== "paid" ? [newSale, ...prev] : prev
//         );

//         const studentId = selectedStudent.studentId;
//         let unpaidSalesAfterSubmit = updatedSales.filter(
//           (s) => s.studentId === studentId && s.paymentStatus !== "paid"
//         );
//         let totalDueAfterSubmit = unpaidSalesAfterSubmit.reduce(
//           (sum, sale) => sum + (sale.dueAmount || 0),
//           0
//         );
//         setSelectedStudentTotalDue(totalDueAfterSubmit);
//         setSelectedStudentUnpaidSales(unpaidSalesAfterSubmit);

//         // Handle additional dues payment
//         if (
//           parseFloat(additionalDuePayment) > 0 &&
//           unpaidSalesAfterSubmit.length > 0
//         ) {
//           const oldestUnpaidSale = unpaidSalesAfterSubmit.sort(
//             (a, b) => new Date(a.date) - new Date(b.date)
//           )[0];
//           if (oldestUnpaidSale) {
//             const duesData = {
//               saleNumber: oldestUnpaidSale.saleNumber,
//               paymentAmount: parseFloat(additionalDuePayment),
//               newItems: [],
//             };
//             const duesResponse = await axios.post(
//               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/duesandsales",
//               duesData,
//               {
//                 withCredentials: true,
//                 headers: { Authorization: `Bearer ${token}` },
//               }
//             );
//             if (duesResponse.data.success) {
//               const updatedSale = duesResponse.data.data.sale;
//               updatedSales = updatedSales.map((s) =>
//                 s.saleNumber === updatedSale.saleNumber ? updatedSale : s
//               );
//               setSales(updatedSales);
//               setDuesSales((prev) =>
//                 prev
//                   .map((s) =>
//                     s.saleNumber === updatedSale.saleNumber ? updatedSale : s
//                   )
//                   .filter((s) => s.paymentStatus !== "paid")
//               );
//               unpaidSalesAfterSubmit = updatedSales.filter(
//                 (s) => s.studentId === studentId && s.paymentStatus !== "paid"
//               );
//               totalDueAfterSubmit = unpaidSalesAfterSubmit.reduce(
//                 (sum, sale) => sum + (sale.dueAmount || 0),
//                 0
//               );
//               setSelectedStudentTotalDue(totalDueAfterSubmit);
//               setSelectedStudentUnpaidSales(unpaidSalesAfterSubmit);
//               toast.success("Additional dues payment processed successfully!");
//             } else {
//               toast.error(
//                 duesResponse.data.message ||
//                   "Failed to process additional dues payment."
//               );
//             }
//           }
//         }

//         setSelectedItems([]);
//         setPaidAmount("");
//         setAdditionalDuePayment("");
//         setSubtotal(0);
//         setDueAmount(0);
//         setSearchResults([]);
//         setShowSuggestions(false);

//         toast.success(response.data.message || "Sale created successfully!");

//         const receiptData = {
//           ...newSale,
//           items: itemsForReceipt,
//         };
//         generateReceiptHtml(receiptData, studentDetailsForReceipt);
//       } else {
//         toast.error(response.data.message || "Failed to create sale.");
//       }
//     } catch (error) {
//       console.error("Submit sale error:", error);
//       toast.error(
//         error.response?.data?.message ||
//           "An error occurred while creating the sale."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Handle Pay Dues
//   const handlePayDues = async () => {
//     if (!dueSaleNumber) {
//       toast.error("Please select a sale to pay dues for.");
//       return;
//     }
//     if (!duePaymentAmount && dueNewItems.length === 0) {
//       toast.error("Please enter a payment amount or add new items.");
//       return;
//     }
//     if (duePaymentAmount && parseFloat(duePaymentAmount) <= 0) {
//       toast.error("Payment amount must be greater than zero.");
//       return;
//     }

//     const duesData = {
//       saleNumber: parseInt(dueSaleNumber),
//       paymentAmount: parseFloat(duePaymentAmount) || 0,
//       newItems: dueNewItems.map((i) => ({
//         itemId: i.itemId,
//         quantity: i.quantity,
//       })),
//     };

//     try {
//       setIsSubmitting(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.post(
//         "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/duesandsales",
//         duesData,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (response.data.success) {
//         const updatedSale = response.data.data.sale;
//         const updatedSales = sales.map((s) =>
//           s.saleNumber === updatedSale.saleNumber ? updatedSale : s
//         );
//         setSales(updatedSales);
//         setDuesSales((prev) =>
//           prev
//             .map((s) =>
//               s.saleNumber === updatedSale.saleNumber ? updatedSale : s
//             )
//             .filter((s) => s.paymentStatus !== "paid")
//         );

//         const studentId = selectedStudent?.studentId;
//         if (studentId) {
//           const unpaidSalesAfterPayment = updatedSales.filter(
//             (s) => s.studentId === studentId && s.paymentStatus !== "paid"
//           );
//           const totalDueAfterPayment = unpaidSalesAfterPayment.reduce(
//             (sum, sale) => sum + (sale.dueAmount || 0),
//             0
//           );
//           setSelectedStudentTotalDue(totalDueAfterPayment);
//           setSelectedStudentUnpaidSales(unpaidSalesAfterPayment);
//         }

//         setDueSaleNumber("");
//         setDuePaymentAmount("");
//         setDueNewItems([]);
//         setDueSelectedItem("");

//         toast.success(response.data.message || "Dues paid successfully!");

//         const receiptData = response.data.receipt;
//         generateReceiptHtml(receiptData, selectedStudent);
//       } else {
//         toast.error(response.data.message || "Failed to process dues payment.");
//       }
//     } catch (error) {
//       console.error("Pay dues error:", error);
//       toast.error(
//         error.response?.data?.message ||
//           "An error occurred while processing dues payment."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Receipt HTML Generation
//   const generateReceiptHtml = (receiptData, student) => {
//     if (!receiptData) return;

//     const studentInfo = student
//       ? `${student.studentName} (${student.class} - ${student.section})${
//           student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ""
//         }`
//       : `Student ID: ${receiptData.studentId}`;

//     const paymentHistory =
//       receiptData.paymentHistory?.length > 0
//         ? receiptData.paymentHistory
//             .map(
//               (p) => `
//           <p style="margin: 2px 0; font-size: 12px;">
//             Paid ₹${p.amount.toFixed(2)} on ${new Date(p.date).toLocaleString()}
//           </p>
//         `
//             )
//             .join("")
//         : '<p style="margin: 2px 0; font-size: 12px; color: #777;">No payments recorded.</p>';

//     const receiptContent = `
//       <div style="width: 320px; padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; background-color: #ffffff; border: 1px solid #eee; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
//         <h2 style="font-size: 16px; text-align: center; font-weight: 600; color: #333;">${
//           user?.schoolName
//         }</h2>
//         <h2 style="font-size: 16px; text-align: center; font-weight: 600; color: #333;">${
//           user?.contact
//         }</h2>
//         <h4 style="font-size: 16px; text-align: center; margin: 0 0 10px; font-weight: 600; color: #333;">INVOICE / RECEIPT</h4>
//         <div style="margin-bottom: 8px;">
//             <p style="margin: 2px 0;"><strong>Student:</strong> ${studentInfo}</p>
//             <p style="margin: 2px 0;"><strong>Sale Number:</strong> ${
//               receiptData.saleNumber
//             }</p>
//             <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(
//               receiptData.date
//             ).toLocaleString()}</p>
//         </div>
//         <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px;">
//           <thead>
//             <tr style="border-top: 1px dashed #aaa; border-bottom: 1px dashed #aaa;">
//               <th style="padding: 6px 4px; text-align: left; font-weight: 600;">Item</th>
//               <th style="padding: 6px 4px; text-align: center; font-weight: 600;">Qty</th>
//               <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Price</th>
//               <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${(receiptData.items || [])
//               .map(
//                 (item) => `
//               <tr style="border-bottom: 1px dotted #ccc;">
//                 <td style="padding: 5px 4px; word-break: break-word;">${
//                   item.itemName || "N/A"
//                 }</td>
//                 <td style="padding: 5px 4px; text-align: center;">${
//                   item.quantity
//                 }</td>
//                 <td style="padding: 5px 4px; text-align: right;">₹${
//                   item.price?.toFixed(2) || "0.00"
//                 }</td>
//                 <td style="padding: 5px 4px; text-align: right;">₹${
//                   (item.total || item.price * item.quantity).toFixed(2) ||
//                   "0.00"
//                 }</td>
//               </tr>
//             `
//               )
//               .join("")}
//           </tbody>
//         </table>
//         <div style="margin-top: 12px; text-align: right; border-top: 1px dashed #aaa; padding-top: 8px;">
//             <p style="margin: 3px 0; font-size: 13px;"><strong>Subtotal:</strong> ₹${receiptData.totalAmount?.toFixed(
//               2
//             )}</p>
//             <p style="margin: 3px 0; font-size: 13px;"><strong>Paid:</strong> ₹${receiptData.paidAmount?.toFixed(
//               2
//             )}</p>
//             <p style="margin: 5px 0; font-weight: bold; font-size: 14px;"><strong>Due:</strong> ₹${receiptData.dueAmount?.toFixed(
//               2
//             )}</p>
//             <p style="margin: 3px 0; font-size: 13px;"><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: 500;">${
//               receiptData.paymentStatus
//             }</span></p>
//         </div>
//         <div style="margin-top: 10px; border-top: 1px dashed #aaa; padding-top: 8px;">
//             <p style="margin: 2px 0; font-size: 13px; font-weight: 600;">Payment History:</p>
//             ${paymentHistory}
//         </div>
//         <p style="font-size: 11px; text-align: center; margin-top: 15px; color: #777;">Thank you for your purchase!</p>
//       </div>
//     `;

//     setReceiptHtmlContent(receiptContent);
//     setShowReceiptModal(true);
//   };

//   // Handle Print
//   const handlePrint = () => {
//     const contentToPrint = receiptModalContentRef.current;
//     if (!contentToPrint) {
//       toast.error("Receipt content not found for printing.");
//       return;
//     }

//     const printWindow = window.open("", "_blank", "height=600,width=800");
//     if (!printWindow) {
//       toast.error(
//         "Failed to open print window. Please check browser pop-up settings."
//       );
//       return;
//     }

//     printWindow.document.write("<html><head>");
//     printWindow.document.write(`
//         <style>
//             body {
//                 margin: 0;
//                 padding: 10mm;
//                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                 font-size: 12px;
//                 line-height: 1.4;
//                 width: 300px;
//             }
//             @page {
//                 size: auto;
//                 margin: 5mm;
//             }
//             @media print {
//                body > div {
//                   margin: 0 !important;
//                   padding: 0 !important;
//                   border: none !important;
//                   box-shadow: none !important;
//                   width: 100% !important;
//                }
//             }
//             h2 {
//                 font-size: 15px;
//                 text-align: center;
//                 margin: 0 0 10px 0;
//                 font-weight: 600;
//                 color: #000;
//             }
//             p {
//                 margin: 3px 0;
//                 color: #000;
//             }
//             table {
//                 width: 100%;
//                 border-collapse: collapse;
//                 margin: 10px 0;
//                 font-size: 11px;
//                 color: #000;
//             }
//             th, td {
//                 padding: 4px 3px;
//                 border-bottom: 1px dotted #888;
//                 text-align: left;
//                 word-break: break-word;
//             }
//             th {
//                 border-top: 1px dashed #555;
//                 border-bottom: 1px dashed #555;
//                 font-weight: 600;
//                 background-color: #f0f0f0;
//             }
//             th:nth-child(2), td:nth-child(2) { text-align: center; }
//             th:nth-child(3), td:nth-child(3),
//             th:nth-child(4), td:nth-child(4) { text-align: right; }
//             div[style*="text-align: right"] {
//                  margin-top: 12px;
//                  text-align: right;
//                  border-top: 1px dashed #555;
//                  padding-top: 8px;
//             }
//             div[style*="text-align: right"] p {
//                 margin: 2px 0;
//                 font-size: 12px;
//             }
//             div[style*="text-align: right"] p strong {
//                 font-weight: bold;
//             }
//             p[style*="text-align: center"] {
//                 font-size: 10px;
//                 margin-top: 15px;
//                 color: #555;
//             }
//         </style>
//     `);
//     printWindow.document.write("</head><body>");
//     printWindow.document.write(contentToPrint.innerHTML);
//     printWindow.document.write("</body></html>");

//     printWindow.document.close();
//     printWindow.focus();

//     setTimeout(() => {
//       try {
//         printWindow.print();
//       } catch (e) {
//         console.error("Print error:", e);
//         toast.error("Could not initiate printing.");
//         printWindow.close();
//       }
//     }, 500);
//   };

//   const handleDateCange = (dateValue, name) => {
//     setValues((prevFormData) => ({
//       ...prevFormData,
//       [name]: dateValue,
//     }));
//   };
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setValues((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handlsearch = () => {
//     if (values?.fromDate && values?.toDate) {
//       getAllSales();
//     }
//   };

//   useEffect(() => {
//     const filtervalue = sales.filter((val) =>
//       values?.mode === "All" ? true : val?.paymentStatus === values?.mode
//     );
//     // const filtervalue=sales.filter((val)=>val?.paymentStatus==values?.mode)
//     setFilterData(filtervalue || sales);
//   }, [values?.mode]);

//   const overallTotalPaid = (data) => {
//     return filterData.reduce((sum, item) => {
//       const amountPaid = parseFloat(item?.paidAmount) || 0;
//       return sum + amountPaid;
//     }, 0);
//   };

//   const overallTotalDuesSum = (data) => {
//     return data.reduce((sum, item) => {
//       const duesValue = parseFloat(item?.dueAmount) || 0;
//       return sum + duesValue;
//     }, 0);
//   };
//   const handleDownloadPdf = () => {
//     const dataToExport = filterData.map((val) => {
//       const student = students.find((st) => st.studentId === val.studentId);
//       return {
//         ...val,
//         studentName: student?.studentName || "N/A",
//         Class: `${student?.class} - ${student?.section}` || "N/A",
//         admissionNumber: student?.admissionNumber || "N/A",
//       };

//       // date: val.date ? format(parseISO(val.date), "dd/MM/yyyy") : "N/A",
//       // month: val.regularFees?.map((item) => item.month).join('\n') || 'N/A',
//       // feeStatus: val.regularFees?.map((item) => item.status).join('\n') || 'N/A'
//     });

//     console.log("dataToExport", dataToExport);
//     const columns = [
//       {
//         header: "Rcpt.No.",
//         dataKey: "saleNumber",
//       },
//       { header: "Date", dataKey: "date" },
//       { header: "Admission No.", dataKey: "admissionNumber" },
//       { header: "Student", dataKey: "studentName" },
//       { header: "Class", dataKey: "Class" },
//       { header: "Total Amt.", dataKey: "totalAmount" },
//       { header: "Paid Amt.", dataKey: "paidAmount" },
//       { header: "Dues Amt.", dataKey: "dueAmount" },
//       { header: "Status", dataKey: "paymentStatus" },
//     ];
//     const filename = "Inventry Details";
//     generatePdf(
//       dataToExport,
//       columns,
//       overallTotalPaid(filterData),
//       overallTotalDuesSum(filterData),
//       filename
//       // currentTotals.cash,
//       // currentTotals.online,
//       // currentTotals.cheque,
//       // currentTotals.card,
//       // activeTab === "single" ? "single-receipts-report.pdf" : "unified-receipts-report.pdf"
//     );
//   };
//   const handlePrintReceipt = async (saleNumber) => {
//     if (!saleNumber) {
//       toast.error("Sale number is missing. Unable to fetch receipt.");
//       return;
//     }

//     try {
//       setIsFetchingReceipt(true);
//       const token = localStorage.getItem("token");
//       const response = await axios.get(
//         `https://api.digitalvidyasaarthi.in/api/v1/adminRoute/receipts/${encodeURIComponent(
//           saleNumber
//         )}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.success && response.data.receipt) {
//         const receiptDetails = response.data.receipt;
//         const student = students.find(
//           (s) => s.studentId === receiptDetails.studentId
//         );
//         if (!student) {
//           toast.warn(
//             `Student details for ID ${receiptDetails.studentId} not found locally. Receipt may show ID only.`
//           );
//         }
//         generateReceiptHtml(receiptDetails, student);
//         toast.success("Receipt preview ready.");
//       } else {
//         toast.warning(
//           `Failed to fetch receipt details: ${
//             response.data.message || "Not found"
//           }`
//         );
//       }
//     } catch (error) {
//       console.error("Error in handlePrintReceipt:", error);
//       toast.error(
//         `Error fetching receipt: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     } finally {
//       setIsFetchingReceipt(false);
//     }
//   };

//   // Render Receipt Modal
//   const renderReceiptModal = () =>
//     showReceiptModal && (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
//         <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
//           <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-white rounded-t-lg">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Receipt Preview
//             </h2>
//             <button
//               onClick={() => {
//                 setShowReceiptModal(false);
//                 setReceiptHtmlContent("");
//               }}
//               className="text-gray-400 hover:text-gray-600"
//               aria-label="Close modal"
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M6 18L18 6M6 6l12 12"
//                 ></path>
//               </svg>
//             </button>
//           </div>
//           <div className="p-4 md:p-6 flex-grow overflow-y-auto flex justify-center">
//             {receiptHtmlContent ? (
//               <div
//                 ref={receiptModalContentRef}
//                 dangerouslySetInnerHTML={{ __html: receiptHtmlContent }}
//               />
//             ) : (
//               <div className="flex items-center justify-center h-full text-gray-500 py-10">
//                 Generating preview...
//               </div>
//             )}
//           </div>
//           <div className="flex flex-wrap justify-end gap-3 p-4 border-t border-gray-300 bg-white rounded-b-lg">
//             <button
//               onClick={handlePrint}
//               className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 text-sm font-medium shadow-sm disabled:opacity-60"
//               disabled={!receiptHtmlContent || isSubmitting}
//             >
//               🖨️ Print
//             </button>
//             <button
//               onClick={() => {
//                 setShowReceiptModal(false);
//                 setReceiptHtmlContent("");
//               }}
//               className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150 text-sm font-medium"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );

//   // Loading/Error States
//   if (loading && !filterData.length) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error && !filterData.length) {
//     return (
//       <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
//         Error: {error}
//       </div>
//     );
//   }

//   // Render Sales Table
//   const renderSalesTable = (salesData) => (
//     <div className="overflow-x-auto">
//       <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Date
//             </th>
//             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Adm No.
//             </th>
//             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Student
//             </th>
//             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Sale #
//             </th>
//             <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Total
//             </th>
//             <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Paid
//             </th>
//             <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Due
//             </th>
//             <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Status
//             </th>
//             <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//               Action
//             </th>
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-200">
//           {salesData.length === 0 && !loading && (
//             <tr>
//               <td
//                 colSpan="8"
//                 className="px-4 py-6 text-center text-sm text-gray-500 italic"
//               >
//                 No sales records found.
//               </td>
//             </tr>
//           )}
//           {salesData.map((s) => {
//             const student = students.find((st) => st.studentId === s.studentId);
//             const studentDisplay = student
//               ? `${student.studentName} (${student.class}-${student.section})`
//               : `ID: ${s.studentId}`;
//             return (
//               <tr
//                 key={s._id || s.saleNumber}
//                 className={`hover:bg-gray-50/80 transition-colors duration-150 ${
//                   s.paymentStatus !== "paid" ? "bg-red-50/40" : ""
//                 }`}
//               >
//                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                   {new Date(s.date).toLocaleDateString()}
//                 </td>
//                 <td className="px-4 py-3 whitespace-normal text-sm text-gray-800 font-medium">
//                   {student?.admissionNumber}
//                 </td>

//                 <td className="px-4 py-3 whitespace-normal text-sm text-gray-800 font-medium">
//                   {studentDisplay}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-[11px]">
//                   {s.saleNumber}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
//                   ₹{s.totalAmount?.toFixed(2)}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700 text-right">
//                   ₹{s.paidAmount?.toFixed(2)}
//                 </td>
//                 <td
//                   className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
//                     s.dueAmount > 0
//                       ? "text-red-700 font-semibold"
//                       : "text-gray-500"
//                   }`}
//                 >
//                   ₹{s.dueAmount?.toFixed(2)}
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap text-center">
//                   <span
//                     className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
//                       s.paymentStatus === "paid"
//                         ? "bg-green-100 text-green-800"
//                         : s.paymentStatus === "pending"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-yellow-100 text-yellow-800"
//                     }`}
//                   >
//                     {s.paymentStatus}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
//                   <button
//                     onClick={() => handlePrintReceipt(s.saleNumber)}
//                     className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1 mx-auto text-xs"
//                     disabled={isFetchingReceipt || isSubmitting}
//                     title="View & Print Receipt"
//                   >
//                     View / Print
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );

//   return (
//     <div className="">
//       <PageHeaderWithBreadcrumb
//         breadcrumbItems={BreadcrumbList.admission}
//         title="Create New Sale"
//       />
//       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
//         <div className="space-y-5">
//           <div className="grid grid-cols-1 gap-4 items-start">
//             <div className="relative" ref={searchContainerRef}>
//               <ReactInput
//                 label="Student Search"
//                 name="studentSearch"
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 placeholder="Name/Adm#/ID"
//                 required
//               />
//               {selectedStudentDisplay ? (
//                 <>
//                   <span className="font-medium text-green-600">
//                     Selected : {selectedStudentDisplay}{" "}
//                   </span>
//                 </>
//               ) : (
//                 "No student selected"
//               )}
//               {selectedStudent && selectedStudentTotalDue > 0 && (
//                 <div className="p-3 border border-orange-400 bg-orange-50 rounded-md text-sm shadow-sm">
//                   <p className="font-semibold text-orange-800 mb-1">
//                     <span className="font-bold text-red-600">(!)</span> Previous
//                     Outstanding Balance:{" "}
//                     <span className="font-bold text-red-600 text-base ml-1">
//                       ₹{selectedStudentTotalDue.toFixed(2)}
//                     </span>
//                   </p>
//                   {selectedStudentUnpaidSales.length > 0 && (
//                     <div className="mt-2 pt-2 border-t border-orange-200 text-xs text-gray-700 max-h-24 overflow-y-auto">
//                       <p className="font-medium mb-0.5 text-gray-600">
//                         Details:
//                       </p>
//                       <ul className="list-disc list-inside space-y-0.5 pl-1">
//                         {selectedStudentUnpaidSales.map((sale) => (
//                           <li key={sale._id || sale.saleNumber}>
//                             {new Date(sale.date).toLocaleDateString()} - Sale #:{" "}
//                             <span className="font-mono text-[11px]">
//                               {sale.saleNumber}
//                             </span>{" "}
//                             - Due:{" "}
//                             <span className="font-semibold">
//                               ₹{sale.dueAmount.toFixed(2)}
//                             </span>{" "}
//                             ({sale.paymentStatus})
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {showSuggestions && (
//                 <div className="absolute z-20  mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   {searchResults.length > 0 ? (
//                     <table className=" text-sm text-left text-gray-800">
//                       <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
//                         {" "}
//                         {/* Sticky header with background */}
//                         <tr>
//                           <th scope="col" className="px-2 py-1 text-[10px]">
//                             Name
//                           </th>
//                           <th scope="col" className="px-2 py-1 text-[10px]">
//                             Class
//                           </th>
//                           <th scope="col" className="px-2 py-1 text-[10px]">
//                             Adm No
//                           </th>
//                           <th scope="col" className="px-2 py-1 text-[10px]">
//                             Father
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {searchResults.map((student) => (
//                           <tr
//                             key={student.studentId}
//                             className="bg-white border-b last:border-b-0 hover:bg-indigo-50 cursor-pointer"
//                             onMouseDown={(e) => {
//                               e.preventDefault(); // Keep focus on the input
//                               handleStudentSelect(student);
//                             }}
//                           >
//                             <td className="px-2 py-1 text-[13px] font-bold text-gray-900 whitespace-nowrap">
//                               {student.studentName}
//                             </td>
//                             <td className="px-2 py-1 text-[13px] text-gray-600">
//                               {student.class}-{student.section}
//                             </td>
//                             <td className="px-2 py-1 text-[13px] text-xs text-blue-600">
//                               {student.admissionNumber || "-"}{" "}
//                               {/* Show dash if null/empty */}
//                             </td>
//                             <td className="px-2 py-1 text-[13px] text-xs text-blue-600">
//                               {student.fatherName || "-"}{" "}
//                               {/* Show dash if null/empty */}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="px-4 py-3 text-sm text-gray-500 italic">
//                       No students found matching "{searchTerm}".
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="border-t border-gray-200 ">
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">
//               New Sale Items
//             </h3>

//             <ReactSelect
//               label="Item"
//               name="selectedItem"
//               value={selectedItem}
//               handleChange={(e) => setSelectedItem(e.target.value)}
//               dynamicOptions={itemOptions}
//             />

//             <Button
//               type="button"
//               name="Add Item"
//               onClick={handleAddItem}
//               color="blue"
//               // className="px-4 py-2 mt-[6px] bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap disabled:opacity-50 shadow-sm transition duration-150"
//               disabled={!selectedItem || isSubmitting}
//             />

//             {/* </div> */}
//             <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-5">
//               <div className="flex items-baseline space-x-2">
//                 <span className="text-lg font-semibold text-gray-700">
//                   Total:
//                 </span>
//                 <span className="text-xl font-bold text-blue-800">
//                   ₹{subtotal.toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex items-center gap-3 flex-wrap">
//                 <div className="w-full sm:w-32">
//                   <ReactInput
//                     label="Amount Paid"
//                     type="number"
//                     name="paidAmount"
//                     value={paidAmount}
//                     onChange={(e) => setPaidAmount(e.target.value)}
//                     // placeholder="Paid Now"
//                     required={false}
//                   />
//                 </div>
//                 <ReactSelect
//                   label="mode"
//                   name="paidMode"
//                   value={paidMode}
//                   handleChange={(e) => setPaidMode(e.target.value)}
//                   dynamicOptions={[
//                     { label: "Cash", value: "Cash" },
//                     { label: "Online", value: "Online" },
//                   ]}
//                 />
//                 <div className="w-full sm:w-32">
//                   <ReactInput
//                     label="Pay Dues"
//                     type="number"
//                     name="additionalDuePayment"
//                     value={additionalDuePayment}
//                     onChange={(e) => setAdditionalDuePayment(e.target.value)}
//                     // placeholder="Pay Dues"
//                     required={false}
//                   />
//                   {selectedStudentUnpaidSales.length > 0 && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       Additional payment will be applied to the oldest unpaid
//                       sale.
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="text-right pt-3">
//               <Button
//                 type="button"
//                 onClick={handleSubmit}
//                 className={`inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ${
//                   isSubmitting || !selectedStudent || selectedItems.length === 0
//                     ? "opacity-50 cursor-not-allowed"
//                     : ""
//                 }`}
//                 disabled={
//                   isSubmitting || !selectedStudent || selectedItems.length === 0
//                 }
//                 name={
//                   isSubmitting ? "Processing..." : "Create Sale & View Receipt"
//                 }
//               />
//             </div>
//           </div>

//           {/* Dues Payment Section */}
//           {selectedStudent && selectedStudentUnpaidSales.length > 0 && (
//             <div className="border-t border-gray-200 pt-4 mt-6">
//               <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                 Pay Previous Dues
//               </h3>
//               <div className="space-y-4">
//                 <ReactSelect
//                   label="Sale to Pay Dues For"
//                   name="dueSaleNumber"
//                   value={dueSaleNumber}
//                   handleChange={(e) => setDueSaleNumber(e.target.value)}
//                   dynamicOptions={selectedStudentUnpaidSales.map((sale) => ({
//                     value: sale.saleNumber,
//                     label: `Sale #${
//                       sale.saleNumber
//                     } - Due: ₹${sale.dueAmount.toFixed(2)} (${new Date(
//                       sale.date
//                     ).toLocaleDateString()})`,
//                   }))}
//                   required
//                 />
//                 <div className="flex items-start space-x-3">
//                   <div className="flex-grow">
//                     <ReactSelect
//                       label="Add New Item (Optional)"
//                       name="dueSelectedItem"
//                       value={dueSelectedItem}
//                       handleChange={(e) => setDueSelectedItem(e.target.value)}
//                       dynamicOptions={itemOptions}
//                     />
//                   </div>
//                   <Button
//                     type="button"
//                     onClick={handleAddDueItem}
//                     colo="blue"
//                     // className="px-4 py-2 mt-[6px] bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap disabled:opacity-50 shadow-sm transition duration-150"
//                     disabled={!dueSelectedItem || isSubmitting}
//                     name={"Add Item"}
//                   />

//                   {/* </Button> */}
//                 </div>
//                 {dueNewItems.length > 0 && (
//                   <div className="border border-gray-200 rounded-md bg-white p-3">
//                     <h4 className="text-sm font-medium text-gray-600 mb-2">
//                       New Items for Dues Payment
//                     </h4>
//                     <table className="w-full text-sm text-left text-gray-600">
//                       <thead className="text-xs text-gray-700 uppercase bg-gray-100">
//                         <tr>
//                           <th scope="col" className="px-4 py-2 font-medium">
//                             Item
//                           </th>
//                           <th
//                             scope="col"
//                             className="px-4 py-2 text-right font-medium"
//                           >
//                             Price
//                           </th>
//                           <th
//                             scope="col"
//                             className="px-4 py-2 text-center font-medium w-32"
//                           >
//                             Quantity
//                           </th>
//                           <th
//                             scope="col"
//                             className="px-4 py-2 text-right font-medium"
//                           >
//                             Total
//                           </th>
//                           <th
//                             scope="col"
//                             className="px-1 py-2 text-center font-medium w-10"
//                           ></th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {dueNewItems.map((item) => (
//                           <tr key={item.itemId} className="hover:bg-gray-50/80">
//                             <td className="px-4 py-1.5 font-medium text-gray-900 whitespace-normal">
//                               {item.itemName}
//                             </td>
//                             <td className="px-4 py-1.5 text-right text-gray-700">
//                               ₹{item.price.toFixed(2)}
//                             </td>
//                             <td className="px-4 py-1.5">
//                               <div className="flex items-center justify-center space-x-1.5">
//                                 <button
//                                   onClick={() =>
//                                     handleDueDecreaseQuantity(item.itemId)
//                                   }
//                                   className="p-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
//                                   disabled={item.quantity <= 1 || isSubmitting}
//                                   aria-label="Decrease quantity"
//                                 >
//                                   -
//                                 </button>
//                                 <input
//                                   type="number"
//                                   value={item.quantity}
//                                   onChange={(e) =>
//                                     handleDueQuantityChange(
//                                       item.itemId,
//                                       e.target.value
//                                     )
//                                   }
//                                   className="w-10 h-6 text-center border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//                                   min="1"
//                                   disabled={isSubmitting}
//                                   aria-label={`Quantity for ${item.itemName}`}
//                                 />
//                                 <button
//                                   onClick={() =>
//                                     handleDueIncreaseQuantity(item.itemId)
//                                   }
//                                   className="p-0.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
//                                   disabled={isSubmitting}
//                                   aria-label="Increase quantity"
//                                 >
//                                   +
//                                 </button>
//                               </div>
//                             </td>
//                             <td className="px-4 py-1.5 text-right font-semibold text-gray-800">
//                               ₹{(item.price * item.quantity).toFixed(2)}
//                             </td>
//                             <td className="px-1 py-1.5 text-center">
//                               <button
//                                 onClick={() => handleDueRemoveItem(item.itemId)}
//                                 className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full hover:bg-red-100"
//                                 disabled={isSubmitting}
//                                 aria-label="Remove item"
//                               >
//                                 <svg
//                                   className="w-4 h-4"
//                                   fill="currentColor"
//                                   viewBox="0 0 20 20"
//                                   xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                   <path
//                                     fillRule="evenodd"
//                                     d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
//                                     clipRule="evenodd"
//                                   ></path>
//                                 </svg>
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-3">
//                   <div className="w-full sm:w-32">
//                     <ReactInput
//                       label="Payment "
//                       type="number"
//                       name="duePaymentAmount"
//                       value={duePaymentAmount}
//                       onChange={(e) => setDuePaymentAmount(e.target.value)}
//                       // placeholder="Amount to Pay"
//                       required={dueNewItems.length === 0}
//                     />
//                   </div>
//                   <Button
//                     type="button"
//                     name={
//                       isSubmitting ? "Processing..." : "Pay Dues & View Receipt"
//                     }
//                     onClick={handlePayDues}
//                     className={`inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ${
//                       isSubmitting || !dueSaleNumber
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     disabled={isSubmitting || !dueSaleNumber}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="border border-gray-200 rounded-lg bg-gray-50/70 flex flex-col min-h-[300px] max-h-[500px]">
//           <h3 className="text-lg font-semibold p-3 border-b border-gray-200 text-gray-700 bg-white rounded-t-lg sticky top-0 z-10">
//             Shopping Cart (Current Sale)
//           </h3>
//           {selectedItems.length > 0 ? (
//             <div className="overflow-y-auto flex-grow">
//               <table className="w-full text-sm text-left text-gray-600">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
//                   <tr>
//                     <th scope="col" className="px-4 py-2 font-medium">
//                       Item
//                     </th>
//                     <th
//                       scope="col"
//                       className="px-4 py-2 text-right font-medium"
//                     >
//                       Price
//                     </th>
//                     <th
//                       scope="col"
//                       className="px-4 py-2 text-center font-medium w-32"
//                     >
//                       Quantity
//                     </th>
//                     <th
//                       scope="col"
//                       className="px-4 py-2 text-right font-medium"
//                     >
//                       Total
//                     </th>
//                     <th
//                       scope="col"
//                       className="px-1 py-2 text-center font-medium w-10"
//                     ></th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {selectedItems.map((item) => (
//                     <tr key={item.itemId} className="hover:bg-gray-50/80">
//                       <td className="px-4 py-1.5 font-medium text-gray-900 whitespace-normal">
//                         {item.itemName}
//                       </td>
//                       <td className="px-4 py-1.5 text-right text-gray-700">
//                         ₹{item.price.toFixed(2)}
//                       </td>
//                       <td className="px-4 py-1.5">
//                         <div className="flex items-center justify-center space-x-1.5">
//                           <button
//                             onClick={() => handleDecreaseQuantity(item.itemId)}
//                             className="p-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
//                             disabled={item.quantity <= 1 || isSubmitting}
//                             aria-label="Decrease quantity"
//                           >
//                             -
//                           </button>
//                           <input
//                             type="number"
//                             value={item.quantity}
//                             onChange={(e) =>
//                               handleQuantityChange(item.itemId, e.target.value)
//                             }
//                             className="w-10 h-6 text-center border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
//                             min="1"
//                             disabled={isSubmitting}
//                             aria-label={`Quantity for ${item.itemName}`}
//                           />
//                           <button
//                             onClick={() => handleIncreaseQuantity(item.itemId)}
//                             className="p-0.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
//                             disabled={isSubmitting}
//                             aria-label="Increase quantity"
//                           >
//                             +
//                           </button>
//                         </div>
//                       </td>
//                       <td className="px-4 py-1.5 text-right font-semibold text-gray-800">
//                         ₹{(item.price * item.quantity).toFixed(2)}
//                       </td>
//                       <td className="px-1 py-1.5 text-center">
//                         <button
//                           onClick={() => handleRemoveItem(item.itemId)}
//                           className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full hover:bg-red-100"
//                           disabled={isSubmitting}
//                           aria-label="Remove item"
//                         >
//                           <svg
//                             className="w-4 h-4"
//                             fill="currentColor"
//                             viewBox="0 0 20 20"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
//                               clipRule="evenodd"
//                             ></path>
//                           </svg>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className="flex-grow flex items-center justify-center">
//               <div className="text-center text-gray-500 py-10 px-4 italic">
//                 Cart is empty. Select items above and click 'Add Item'.
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow-md border border-gray-200">
//         <PageHeaderWithBreadcrumb />
//         <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex gap-5 mb-4">
//           {/* <h2 className="text-xl font-semibold text-gray-800">Sales History</h2> */}
//           <DatePicker
//             className="custom-calendar"
//             placeholder=""
//             label={"From Date"}
//             respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
//             name="fromDate"
//             id="fromDate"
//             value={new Date(values.fromDate)}
//             handleChange={(e) => handleDateCange(e.value, "fromDate")}
//             hourFormat="12"
//           />
//           <DatePicker
//             className="custom-calendar"
//             placeholder=""
//             label={"To Date"}
//             respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
//             name="toDate"
//             id="toDate"
//             value={new Date(values.toDate)}
//             handleChange={(e) => handleDateCange(e.value, "toDate")}
//             hourFormat="12"
//           />
//           <Button
//             color={"green"}
//             name="Search ALL Sale"
//             onClick={handlsearch}
//           />
//           <ReactSelect
//             label="mode"
//             name="mode"
//             value={values?.mode}
//             handleChange={(e) => handleInputChange(e)}
//             dynamicOptions={[
//               { label: "All", value: "All" },
//               { label: "Paid", value: "paid" },
//               { label: "Pending", value: "pending" },
//             ]}
//           />
//           <Button
//             name="Download Report"
//             onClick={handleDownloadPdf}
//             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded h-10"
//             // icon={<FaFileAlt className="mr-2"/>} // Added margin to icon
//           />
//         </div>
//         {loading && sales.length === 0 && (
//           <p className="text-center py-4 text-gray-500">Loading history...</p>
//         )}
//         {error && sales.length === 0 && (
//           <p className="text-center py-4 text-red-500">
//             Error loading history: {error}
//           </p>
//         )}
//         {activeTab === "all"
//           ? renderSalesTable(filterData)
//           : renderSalesTable(duesSales)}
//       </div>

//       {renderReceiptModal()}
//     </div>
//   );
// };

// export default Sales;

// // import React, { useState, useEffect, useRef } from "react";
// // import axios from "axios";
// // import { toast } from "react-toastify";
// // import jsPDF from "jspdf"; // Keep import if needed later for dedicated download
// // import html2canvas from "html2canvas"; // Keep import if needed later
// // import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";

// // // --- Reusable Input Component --- (Keep as is)
// // const ReactInput = ({ label, value, onChange, placeholder, type = "text", name, required, maxLength, onFocus, onBlur }) => (
// //     <div className="relative">
// //       {/* Removed label element for cleaner look, placeholder acts as label */}
// //       <input
// //         id={name}
// //         name={name}
// //         type={type}
// //         value={value}
// //         onChange={onChange}
// //         placeholder={placeholder || label} // Use placeholder effectively
// //         required={required}
// //         maxLength={maxLength}
// //         onFocus={onFocus}
// //         onBlur={onBlur}
// //         className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm peer placeholder-transparent" // Added peer, placeholder-transparent
// //         autoComplete="off"
// //       />
// //        {/* Floating label effect */}
// //       <label
// //         htmlFor={name}
// //         className={`absolute left-3 -top-2 text-xs text-gray-500 bg-white px-1 transition-all
// //                    peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
// //                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-600
// //                    ${value ? '-top-2 text-xs' : ''} ${value ? 'text-indigo-600' : ''}
// //                    pointer-events-none`} // Added pointer-events-none
// //       >
// //         {label || placeholder} {required && '*'}
// //       </label>
// //     </div>
// //   );

// // // --- Reusable Select Component --- (Keep as is)
// // const ReactSelect = ({ label, value, handleChange, options, name, required }) => (
// //     <div className="relative">
// //       <select
// //         id={name}
// //         name={name}
// //         value={value}
// //         onChange={handleChange}
// //         required={required}
// //         className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white appearance-none peer" // Added appearance-none peer
// //       >
// //         <option value="" disabled>{`Select ${label}`}</option>
// //         {options.map(option => (
// //           <option key={option.value} value={option.value}>
// //             {option.label}
// //           </option>
// //         ))}
// //       </select>
// //        {/* Floating label */}
// //        <label
// //         htmlFor={name}
// //         className={`absolute left-3 -top-2 text-xs text-gray-500 bg-white px-1 transition-all
// //                    ${value ? '-top-2 text-xs text-indigo-600' : 'top-1.5 text-sm text-gray-400'}
// //                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-600
// //                    pointer-events-none`}
// //       >
// //         {label} {required && '*'}
// //       </label>
// //       {/* Arrow Icon */}
// //       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
// //         <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S5.11 9.581 5.11 9.163c0-.418.08-.1.406-1.615z"/></svg>
// //       </div>
// //     </div>
// //   );

// // // --- Main Sales Component ---
// // const Sales = () => {
// //   // State variables
// //   const [students, setStudents] = useState([]);
// //   const [items, setItems] = useState([]);
// //   const [sales, setSales] = useState([]); // Holds all sales history
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [searchResults, setSearchResults] = useState([]);
// //   const [showSuggestions, setShowSuggestions] = useState(false);
// //   const [selectedStudent, setSelectedStudent] = useState(null);
// //   const [selectedStudentDisplay, setSelectedStudentDisplay] = useState("");
// //   const [selectedItem, setSelectedItem] = useState("");
// //   const [selectedItems, setSelectedItems] = useState([]); // Cart items
// //   const [subtotal, setSubtotal] = useState(0); // Current sale subtotal
// //   const [paidAmount, setPaidAmount] = useState(""); // Current sale paid amount
// //   const [dueAmount, setDueAmount] = useState(0); // Current sale due amount
// //   const [loading, setLoading] = useState(true);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [showReceiptModal, setShowReceiptModal] = useState(false);
// //   const [receiptHtmlContent, setReceiptHtmlContent] = useState("");

// //   // *** NEW: State for selected student's previous due amounts ***
// //   const [selectedStudentTotalDue, setSelectedStudentTotalDue] = useState(0);
// //   const [selectedStudentUnpaidSales, setSelectedStudentUnpaidSales] = useState([]);

// //   // Refs
// //   const receiptModalContentRef = useRef();
// //   const searchContainerRef = useRef();

// //   // --- Fetch Initial Data --- (Keep as is)
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
// //         setError(null);
// //         const token = localStorage.getItem("token");
// //         if (!token) {
// //             throw new Error("Authentication token not found.");
// //         }
// //         const headers = { Authorization: `Bearer ${token}` };

// //         const [studentResponse, itemResponse, salesResponse] =
// //           await Promise.all([
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/studentparent?fetchAllStudents=true",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //               { withCredentials: true, headers }
// //             ),
// //           ]);

// //         if (studentResponse.data.success) {
// //           setStudents(studentResponse.data.students.data || []);
// //         } else {
// //           throw new Error(studentResponse.data.message || "Failed to fetch students");
// //         }
// //         if (itemResponse.data.success) {
// //           setItems(itemResponse.data.listOfAllItems || []);
// //         } else {
// //             throw new Error(itemResponse.data.message || "Failed to fetch items");
// //         }
// //         if (salesResponse.data.success) {
// //           // Ensure sales are sorted if needed, or sort later. Reverse is fine.
// //           setSales(salesResponse.data.sales?.reverse() || []);
// //         } else {
// //             throw new Error(salesResponse.data.message || "Failed to fetch sales");
// //         }

// //       } catch (error) {
// //         console.error("Fetch data error:", error);
// //         const errorMessage = error.response?.data?.message || error.message || "Failed to fetch data.";
// //         toast.error(errorMessage);
// //         setError(errorMessage);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   // --- Student Search Logic --- (Keep as is)
// //   useEffect(() => {
// //     if (searchTerm.trim() === "") {
// //       setSearchResults([]);
// //       setShowSuggestions(false);
// //       return;
// //     }
// //     const filtered = students.filter(s => {
// //         const term = searchTerm.toLowerCase();
// //         const nameMatch = s.studentName.toLowerCase().includes(term);
// //         const admissionMatch = s.admissionNumber ? String(s.admissionNumber).toLowerCase().includes(term) : false;
// //         const idMatch = s.studentId.toLowerCase().includes(term);
// //         return nameMatch || admissionMatch || idMatch;
// //     }).slice(0, 10);
// //     setSearchResults(filtered);
// //     setShowSuggestions(true);
// //   }, [searchTerm, students]);

// //   // --- Handle Clicking Outside Search Suggestions --- (Keep as is)
// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
// //         setShowSuggestions(false);
// //       }
// //     };
// //     if (showSuggestions) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     } else {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     }
// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [showSuggestions]);

// //   // --- Handle Student Selection (MODIFIED) ---
// //   const handleStudentSelect = (student) => {
// //     setSelectedStudent(student);
// //     const displayName = `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`;
// //     setSelectedStudentDisplay(displayName);
// //     setSearchTerm(student.studentName); // Update search bar
// //     setShowSuggestions(false);
// //     setSearchResults([]);

// //     // *** NEW: Calculate and set previous due amount ***
// //     if (student && student.studentId && sales.length > 0) {
// //         const studentId = student.studentId;
// //         const unpaidSales = sales.filter(s =>
// //             s.studentId === studentId &&
// //             s.paymentStatus !== 'paid' // Find 'pending' or 'partial'
// //         );

// //         const totalDue = unpaidSales.reduce((sum, sale) => sum + (sale.dueAmount || 0), 0);

// //         setSelectedStudentTotalDue(totalDue);
// //         setSelectedStudentUnpaidSales(unpaidSales); // Store details for potential display
// //     } else {
// //         // Reset if no student or no sales data
// //         setSelectedStudentTotalDue(0);
// //         setSelectedStudentUnpaidSales([]);
// //     }
// //   };

// //     // --- Handle Search Input Change (MODIFIED) ---
// //     const handleSearchChange = (e) => {
// //         const newSearchTerm = e.target.value;
// //         setSearchTerm(newSearchTerm);
// //         if (newSearchTerm.trim() === "") {
// //             setSelectedStudent(null);
// //             setSelectedStudentDisplay("");
// //             // *** NEW: Reset due amount info when search is cleared ***
// //             setSelectedStudentTotalDue(0);
// //             setSelectedStudentUnpaidSales([]);
// //         }
// //     };

// //   // --- Item Handling (Add, Quantity, Remove) --- (Keep as is)
// //   const itemOptions = items.map(item => ({
// //     value: item.itemId,
// //     label: `${item.itemName} - ₹${item.price.toFixed(2)}`
// //   }));

// //   const handleAddItem = () => {
// //     if (!selectedItem) {
// //         toast.warn("Please select an item to add.");
// //         return;
// //     }
// //     const itemToAdd = items.find((i) => i.itemId === selectedItem);
// //     if (itemToAdd) {
// //         const existingItemIndex = selectedItems.findIndex(i => i.itemId === selectedItem);
// //         if (existingItemIndex > -1) {
// //             handleIncreaseQuantity(selectedItem);
// //         } else {
// //             setSelectedItems([...selectedItems, { ...itemToAdd, quantity: 1 }]);
// //         }
// //       setSelectedItem("");
// //     }
// //   };

// //   const handleQuantityChange = (itemId, quantityStr) => {
// //     const quantity = Math.max(1, parseInt(quantityStr) || 1);
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: quantity } : i
// //       )
// //     );
// //   };

// //   const handleIncreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
// //       )
// //     );
// //   };

// //   const handleDecreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId && i.quantity > 1
// //           ? { ...i, quantity: i.quantity - 1 }
// //           : i
// //       ).filter(i => !(i.itemId === itemId && i.quantity <= 1)) // Remove if quantity would be 0
// //     );
// //   };

// //   const handleRemoveItem = (itemId) => {
// //     setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
// //   };

// //   // --- Update Subtotal and Due Amount (Current Sale) --- (Keep as is)
// //   useEffect(() => {
// //     const calculatedSubtotal = selectedItems.reduce(
// //       (sum, item) => sum + item.price * item.quantity,
// //       0
// //     );
// //     setSubtotal(calculatedSubtotal);
// //     const paid = parseFloat(paidAmount) || 0;
// //     // Ensure due amount is never negative for the *current* sale calculation
// //     setDueAmount(Math.max(0, calculatedSubtotal - paid));
// //   }, [selectedItems, paidAmount]);

// //   // --- Handle Submit --- (Keep as is, logic doesn't change)
// //   const handleSubmit = async () => {
// //     if (!selectedStudent || !selectedStudent.studentId) {
// //         toast.error("Please search and select a student.");
// //         return;
// //     }
// //     if (selectedItems.length === 0) {
// //         toast.error("Please add items to the sale.");
// //         return;
// //     }
// //     // Suggestion: Warn if there's a previous due amount?
// //     if (selectedStudentTotalDue > 0) {
// //         toast.info(`Note: This student has a previous due balance of ₹${selectedStudentTotalDue.toFixed(2)}.`);
// //     }

// //     const saleData = {
// //       studentId: selectedStudent.studentId,
// //       items: selectedItems.map((i) => ({
// //         itemId: i.itemId,
// //         quantity: i.quantity,
// //         price: i.price
// //       })),
// //       totalAmount: subtotal,
// //       paidAmount: parseFloat(paidAmount) || 0,
// //       dueAmount: dueAmount, // Current sale due
// //       paymentStatus: (parseFloat(paidAmount) || 0) >= subtotal ? "paid" : ((parseFloat(paidAmount) || 0) > 0 ? "partial" : "pending"),
// //     };

// //     try {
// //       setIsSubmitting(true);
// //       const token = localStorage.getItem("token");
// //       const response = await axios.post(
// //         "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //         saleData,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       if (response.data.success) {
// //         const newSale = response.data.data.sale;
// //         // Keep details for receipt
// //         const studentDetailsForReceipt = { ...selectedStudent };
// //         const itemsForReceipt = response.data.data.receiptItems || selectedItems.map(item => ({
// //             itemName: item.itemName,
// //             quantity: item.quantity,
// //             price: item.price,
// //             total: item.price * item.quantity
// //         }));

// //         // Add new sale to the beginning of the sales list
// //         const updatedSales = [newSale, ...sales];
// //         setSales(updatedSales);

// //         // *** IMPORTANT: Re-calculate previous due amount with the updated sales list ***
// //         const studentId = selectedStudent.studentId;
// //         const unpaidSalesAfterSubmit = updatedSales.filter(s =>
// //             s.studentId === studentId &&
// //             s.paymentStatus !== 'paid'
// //         );
// //         const totalDueAfterSubmit = unpaidSalesAfterSubmit.reduce((sum, sale) => sum + (sale.dueAmount || 0), 0);
// //         setSelectedStudentTotalDue(totalDueAfterSubmit);
// //         setSelectedStudentUnpaidSales(unpaidSalesAfterSubmit);

// //         // Clear form *after* recalculating due
// //         // setSearchTerm(student.studentName); // Keep student name for context, maybe? Or clear? User choice.
// //         // Resetting student might be better UX if they want to clear everything:
// //         // setSearchTerm("");
// //         // setSelectedStudent(null);
// //         // setSelectedStudentDisplay("");
// //         // setSelectedStudentTotalDue(0); // Reset if clearing student
// //         // setSelectedStudentUnpaidSales([]);

// //         setSelectedItems([]);
// //         setPaidAmount("");
// //         setSubtotal(0);
// //         setDueAmount(0);
// //         setSearchResults([]);
// //         setShowSuggestions(false); // Should already be false

// //         toast.success(response.data.message || "Sale created successfully!");

// //         // Generate HTML receipt for the *new* sale
// //         const receiptData = {
// //             ...newSale,
// //             items: itemsForReceipt,
// //         };
// //         generateReceiptHtml(receiptData, studentDetailsForReceipt);

// //       } else {
// //         toast.error(response.data.message || "Failed to create sale.");
// //       }
// //     } catch (error) {
// //       console.error("Submit sale error:", error);
// //       toast.error(error.response?.data?.message || "An error occurred while creating the sale.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // --- Receipt HTML Generation --- (Keep as is)
// //   const generateReceiptHtml = (receiptData, student) => {
// //     if (!receiptData) return;

// //     const studentInfo = student
// //       ? `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`
// //       : `Student ID: ${receiptData.studentId}`;

// //     const receiptContent = `
// //       <div style="width: 320px; padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; background-color: #ffffff; border: 1px solid #eee; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
// //         <h2 style="font-size: 16px; text-align: center; margin: 0 0 10px; font-weight: 600; color: #333;">INVOICE / RECEIPT</h2>
// //         <div style="margin-bottom: 8px;">
// //             <p style="margin: 2px 0;"><strong>Student:</strong> ${studentInfo}</p>
// //             <p style="margin: 2px 0;"><strong>Sale ID:</strong> ${receiptData.saleId}</p>
// //             <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(receiptData.date).toLocaleString()}</p>
// //         </div>
// //         <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px;">
// //           <thead>
// //             <tr style="border-top: 1px dashed #aaa; border-bottom: 1px dashed #aaa;">
// //               <th style="padding: 6px 4px; text-align: left; font-weight: 600;">Item</th>
// //               <th style="padding: 6px 4px; text-align: center; font-weight: 600;">Qty</th>
// //               <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Price</th>
// //               <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Total</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             ${(receiptData.items || [])
// //               .map(
// //                 (item) => `
// //               <tr style="border-bottom: 1px dotted #ccc;">
// //                 <td style="padding: 5px 4px; word-break: break-word;">${item.itemName || 'N/A'}</td>
// //                 <td style="padding: 5px 4px; text-align: center;">${item.quantity}</td>
// //                 <td style="padding: 5px 4px; text-align: right;">₹${item.price?.toFixed(2) || '0.00'}</td>
// //                 <td style="padding: 5px 4px; text-align: right;">₹${(item.price * item.quantity).toFixed(2) || '0.00'}</td>
// //               </tr>
// //             `
// //               )
// //               .join("")}
// //           </tbody>
// //         </table>
// //         <div style="margin-top: 12px; text-align: right; border-top: 1px dashed #aaa; padding-top: 8px;">
// //             <p style="margin: 3px 0; font-size: 13px;"><strong>Subtotal:</strong> ₹${receiptData.totalAmount?.toFixed(2)}</p>
// //             <p style="margin: 3px 0; font-size: 13px;"><strong>Paid:</strong> ₹${receiptData.paidAmount?.toFixed(2)}</p>
// //             <p style="margin: 5px 0; font-weight: bold; font-size: 14px;"><strong>Due:</strong> ₹${receiptData.dueAmount?.toFixed(2)}</p>
// //             <p style="margin: 3px 0; font-size: 13px;"><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: 500;">${receiptData.paymentStatus}</span></p>
// //         </div>
// //          <p style="font-size: 11px; text-align: center; margin-top: 15px; color: #777;">Thank you for your purchase!</p>
// //       </div>
// //     `;

// //     setReceiptHtmlContent(receiptContent);
// //     setShowReceiptModal(true);
// //   };

// //   // --- Handle Print --- (Keep as is)
// //   const handlePrint = () => {
// //     const contentToPrint = receiptModalContentRef.current;
// //     if (!contentToPrint) {
// //       toast.error("Receipt content not found for printing.");
// //       return;
// //     }

// //     const printWindow = window.open('', '_blank', 'height=600,width=800');
// //     if (!printWindow) {
// //         toast.error("Failed to open print window. Please check browser pop-up settings.");
// //         return;
// //     }

// //     // Write HTML structure and styles *without* the <title> tag in the head
// //     printWindow.document.write('<html><head>');
// //     // Add print-specific styles, including @page for margins
// //     printWindow.document.write(`
// //         <style>
// //             /* Apply base styles for printing */
// //             body {
// //                 margin: 0; /* Reset default body margin */
// //                 padding: 10mm; /* Add padding for content, adjust as needed */
// //                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
// //                 font-size: 12px; /* Optional: Adjust base print font size */
// //                 line-height: 1.4;
// //                 width: 300px; /* Approx width of receipt */
// //             }

// //             /* Use @page rule to suggest minimal margins to the browser */
// //             @page {
// //                 size: auto; /* Let browser decide paper size */
// //                 margin: 5mm; /* Request small margins (e.g., 5mm) */
// //             }

// //             @media print {
// //                body > div { /* Target the main receipt div */
// //                   margin: 0 !important;
// //                   padding: 0 !important;
// //                   border: none !important;
// //                   box-shadow: none !important;
// //                   width: 100% !important; /* Use full available width */
// //                }
// //             }

// //             /* Basic table/element styling for the receipt content itself */
// //             h2 {
// //                 font-size: 15px; /* Adjust for print */
// //                 text-align: center;
// //                 margin: 0 0 10px 0;
// //                 font-weight: 600;
// //                 color: #000; /* Use black for print */
// //             }
// //             p {
// //                 margin: 3px 0;
// //                 color: #000;
// //             }
// //             table {
// //                 width: 100%;
// //                 border-collapse: collapse;
// //                 margin: 10px 0;
// //                 font-size: 11px; /* Adjust for print */
// //                 color: #000;
// //             }
// //             th, td {
// //                 padding: 4px 3px;
// //                 border-bottom: 1px dotted #888; /* Use darker dotted line */
// //                 text-align: left;
// //                 word-break: break-word; /* Allow long item names to wrap */
// //             }
// //             th {
// //                 border-top: 1px dashed #555; /* Use darker dashed line */
// //                 border-bottom: 1px dashed #555;
// //                 font-weight: 600;
// //                 background-color: #f0f0f0; /* Optional subtle header background */
// //             }
// //              /* Align specific columns */
// //             th:nth-child(2), td:nth-child(2) { text-align: center; } /* Qty */
// //             th:nth-child(3), td:nth-child(3), /* Price */
// //             th:nth-child(4), td:nth-child(4) { text-align: right; } /* Total */

// //             /* Styling for the totals section */
// //             div[style*="text-align: right"] { /* Target totals div */
// //                  margin-top: 12px;
// //                  text-align: right;
// //                  border-top: 1px dashed #555;
// //                  padding-top: 8px;
// //             }
// //              div[style*="text-align: right"] p {
// //                 margin: 2px 0;
// //                 font-size: 12px; /* Adjust totals font size */
// //              }
// //              div[style*="text-align: right"] p strong {
// //                  font-weight: bold;
// //              }

// //              p[style*="text-align: center"] {
// //                  font-size: 10px;
// //                  margin-top: 15px;
// //                  color: #555;
// //              }
// //         </style>
// //     `);
// //     printWindow.document.write('</head><body>');
// //     // Write only the inner HTML of the receipt content container
// //     printWindow.document.write(contentToPrint.innerHTML);
// //     printWindow.document.write('</body></html>');

// //     printWindow.document.close(); // Crucial for some browsers
// //     printWindow.focus(); // Focus the new window

// //     setTimeout(() => {
// //          try {
// //             printWindow.print();
// //             // Optionally close after print command is issued
// //             // setTimeout(() => printWindow.close(), 1000);
// //           } catch (e) {
// //              console.error("Print error:", e);
// //              toast.error("Could not initiate printing.");
// //              printWindow.close(); // Close if print fails
// //          }
// //     }, 500); // 500ms delay, adjust if needed
// // };

// //   // --- Print Existing Receipt --- (Keep as is)
// //   const handlePrintReceipt = async (saleId) => {
// //     try {
// //       setIsFetchingReceipt(true);
// //       const token = localStorage.getItem("token");
// //       const response = await axios.get(
// //         `https://api.digitalvidyasaarthi.in/api/v1/adminRoute/receipts/${saleId}`,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       if (response.data.success && response.data.receipt) {
// //         const receiptDetails = response.data.receipt;
// //         // Find student from local state for display purposes
// //         const student = students.find(s => s.studentId === receiptDetails.studentId);
// //         if (!student) {
// //             toast.warn(`Student details for ID ${receiptDetails.studentId} not found locally. Receipt may show ID only.`);
// //         }
// //         generateReceiptHtml(receiptDetails, student); // Pass student or null
// //         toast.success("Receipt preview ready.");
// //       } else {
// //         toast.warning(`Failed to fetch receipt details: ${response.data.message || 'Not found'}`);
// //       }
// //     } catch (error) {
// //       console.error("Error in handlePrintReceipt:", error);
// //       toast.error(`Error fetching receipt: ${error.response?.data?.message || error.message}`);
// //     } finally {
// //         setIsFetchingReceipt(false);
// //     }
// //   };

// //   // --- Render Receipt Modal --- (Keep as is)
// //   const renderReceiptModal = () => (
// //     showReceiptModal && (
// //       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
// //         {/* Adjusted width, added overflow-y-auto */}
// //         <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
// //            {/* Modal Header */}
// //            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-white rounded-t-lg">
// //                 <h2 className="text-xl font-semibold text-gray-800">Receipt Preview</h2>
// //                 <button
// //                     onClick={() => {
// //                         setShowReceiptModal(false);
// //                         setReceiptHtmlContent(""); // Clear HTML on close
// //                     }}
// //                     className="text-gray-400 hover:text-gray-600"
// //                     aria-label="Close modal"
// //                 >
// //                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
// //                 </button>
// //            </div>

// //           {/* Modal Body - Scrollable Area */}
// //           {/* Centering the receipt content horizontally */}
// //           <div className="p-4 md:p-6 flex-grow overflow-y-auto flex justify-center">
// //             {receiptHtmlContent ? (
// //                 // Container for the HTML content with ref - it will be centered by the parent flex
// //                 <div ref={receiptModalContentRef} dangerouslySetInnerHTML={{ __html: receiptHtmlContent }} />
// //             ) : (
// //                 <div className="flex items-center justify-center h-full text-gray-500 py-10">Generating preview...</div>
// //             )}
// //           </div>

// //           {/* Modal Footer */}
// //           <div className="flex flex-wrap justify-end gap-3 p-4 border-t border-gray-300 bg-white rounded-b-lg">
// //             <button
// //               onClick={handlePrint}
// //               className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 text-sm font-medium shadow-sm disabled:opacity-60"
// //               disabled={!receiptHtmlContent || isSubmitting} // Disable if submitting new sale too
// //             >
// //               🖨️ Print
// //             </button>
// //             <button
// //               onClick={() => {
// //                 setShowReceiptModal(false);
// //                 setReceiptHtmlContent(""); // Clear HTML on close
// //               }}
// //               className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150 text-sm font-medium"
// //             >
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   );

// //   // --- Loading/Error States --- (Keep as is)
// //   if (loading && !sales.length) {
// //     return (
// //       <div className="flex justify-center items-center h-64">
// //         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
// //       </div>
// //     );
// //   }

// //   if (error && !sales.length) {
// //     return (
// //       <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
// //         Error: {error}
// //       </div>
// //     );
// //   }

// //   // --- Main Render --- (MODIFIED)
// //   return (
// //     <div className="px-4 md:px-6 py-2">
// //       {/* Form Section */}
// //       <div className="mb-6 ">
// //         <h1 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">Create New Sale</h1>
// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
// //             {/* Left Side: Student Search, Item Select, Totals, Submit */}
// //             <div className="space-y-5">
// //                 {/* Student Search & Display */}
// //                 <div className="grid grid-cols-1 gap-4 items-start"> {/* Changed to single column for better layout with due */}
// //                     <div className="relative" ref={searchContainerRef}>
// //                         <ReactInput
// //                             label="Student Search"
// //                             name="studentSearch"
// //                             value={searchTerm}
// //                             // Use the modified handler
// //                             onChange={handleSearchChange}
// //                             placeholder="Name/Adm#/ID"
// //                             required
// //                         />
// //                         {/* Suggestions dropdown */}
// //                         {showSuggestions && (
// //                             <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ">
// //                                 {searchResults.length > 0 ? (
// //                                     searchResults.map(student => (
// //                                         <div
// //                                             key={student.studentId}
// //                                             className="px-4 py-2 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
// //                                             onMouseDown={(e) => {
// //                                                 e.preventDefault();
// //                                                 handleStudentSelect(student);
// //                                             }}
// //                                         >
// //                                             <span className="font-medium">{student.studentName}</span>
// //                                             <span className="text-gray-600"> ({student.class}-{student.section})</span>
// //                                             {student.admissionNumber && <span className="text-xs text-blue-600 ml-2">[Adm: {student.admissionNumber}]</span>}
// //                                         </div>
// //                                     ))
// //                                 ) : (
// //                                     <div className="px-4 py-3 text-sm text-gray-500 italic">
// //                                         No students found matching "{searchTerm}".
// //                                     </div>
// //                                 )}
// //                             </div>
// //                          )}
// //                     </div>

// //                     {/* Selected Student Display & Previous Due */}
// //                     <div className="space-y-2"> {/* Container for display and due */}
// //                         <div className={`w-full px-3 py-1.5 rounded-md text-sm ${selectedStudentDisplay ? 'border border-green-400 bg-green-50 text-green-800' : 'border border-gray-300 bg-gray-50 text-gray-500 italic'}`}>
// //                             {selectedStudentDisplay ? (
// //                                 <>
// //                                 <span className="font-medium">Selected:</span> {selectedStudentDisplay}
// //                                 </>
// //                             ) : (
// //                                 'No student selected'
// //                             )}
// //                         </div>

// //                         {/* *** NEW: Previous Due Amount Display *** */}
// //                         {selectedStudent && selectedStudentTotalDue > 0 && (
// //                             <div className="p-3 border border-orange-400 bg-orange-50 rounded-md text-sm shadow-sm">
// //                                 <p className="font-semibold text-orange-800 mb-1">
// //                                     <span className="font-bold text-red-600">(!)</span> Previous Outstanding Balance: <span className="font-bold text-red-600 text-base ml-1">₹{selectedStudentTotalDue.toFixed(2)}</span>
// //                                 </p>
// //                                 {/* Optional: Display details of unpaid sales */}
// //                                 {selectedStudentUnpaidSales.length > 0 && (
// //                                     <div className="mt-2 pt-2 border-t border-orange-200 text-xs text-gray-700 max-h-24 overflow-y-auto">
// //                                         <p className="font-medium mb-0.5 text-gray-600">Details:</p>
// //                                         <ul className="list-disc list-inside space-y-0.5 pl-1">
// //                                             {selectedStudentUnpaidSales.map(sale => (
// //                                                 <li key={sale._id || sale.saleId}>
// //                                                     {new Date(sale.date).toLocaleDateString()} - Sale ID: <span className="font-mono text-[11px]">{sale.saleId}</span> - Due: <span className="font-semibold">₹{sale.dueAmount.toFixed(2)}</span> ({sale.paymentStatus})
// //                                                 </li>
// //                                             ))}
// //                                         </ul>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         )}
// //                          {selectedStudent && selectedStudentTotalDue <= 0 && (
// //                               <div className="px-3 py-1 border border-green-300 bg-green-50/80 rounded-md text-sm text-green-700">
// //                                   ✓ No previous outstanding balance found.
// //                               </div>
// //                          )}
// //                     </div>
// //                 </div>

// //                 {/* Item Selection */}
// //                 <div className="flex items-start space-x-3">
// //                     <div className="flex-grow">
// //                          <ReactSelect
// //                             label="Item"
// //                             name="selectedItem"
// //                             value={selectedItem}
// //                             handleChange={(e) => setSelectedItem(e.target.value)}
// //                             options={itemOptions}
// //                         />
// //                     </div>
// //                     <button
// //                     type="button"
// //                     onClick={handleAddItem}
// //                     className="px-4 py-1.5 mt-[6px] bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap disabled:opacity-50 shadow-sm transition duration-150"
// //                     disabled={!selectedItem || isSubmitting}
// //                     >
// //                      Add Item
// //                     </button>
// //                 </div>

// //                 {/* Totals and Payment (Current Sale) */}
// //                 <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-5">
// //                      <div className="flex items-baseline space-x-2">
// //                         <span className="text-lg font-semibold text-gray-700">Current Sale Total:</span>
// //                         <span className="text-xl font-bold text-blue-800">₹{subtotal.toFixed(2)}</span>
// //                     </div>
// //                     <div className="flex items-center gap-3 flex-wrap">
// //                         <div className="w-full sm:w-32">
// //                             <ReactInput
// //                                 label="Amount Paid (Current)"
// //                                 type="number"
// //                                 name="paidAmount"
// //                                 value={paidAmount}
// //                                 onChange={(e) => setPaidAmount(e.target.value)}
// //                                 placeholder="Paid Now"
// //                                 required={false} // Not strictly required to submit
// //                             />
// //                         </div>
// //                         {subtotal > 0 && ( // Show current due only if there's a current subtotal
// //                              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-sm ${dueAmount > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
// //                                 <span className={`font-medium ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>Due (Current Sale):</span>
// //                                 <span className={`font-bold ${dueAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{dueAmount.toFixed(2)}</span>
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>

// //                 {/* Submit Button */}
// //                 <div className="text-right pt-3">
// //                     <button
// //                     type="button"
// //                     onClick={handleSubmit}
// //                     className={`inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ${isSubmitting || !selectedStudent || selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
// //                     disabled={isSubmitting || !selectedStudent || selectedItems.length === 0}
// //                     >
// //                     {isSubmitting ? (
// //                         <>
// //                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                             </svg>
// //                             Processing...
// //                         </>
// //                     ) : 'Create Sale & View Receipt'}
// //                     </button>
// //                 </div>
// //             </div>

// //             {/* Right Side: Cart Items */}
// //             <div className="border border-gray-200 rounded-lg bg-gray-50/70 flex flex-col min-h-[300px] max-h-[500px]"> {/* Added max-h */}
// //                 <h3 className="text-lg font-semibold p-3 border-b border-gray-200 text-gray-700 bg-white rounded-t-lg sticky top-0 z-10">Shopping Cart (Current Sale)</h3>
// //                 {selectedItems.length > 0 ? (
// //                     <div className="overflow-y-auto flex-grow"> {/* Scroll within this div */}
// //                         <table className="w-full text-sm text-left text-gray-600">
// //                             {/* Keep thead sticky ONLY if parent has defined height and overflow */}
// //                             <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
// //                                 <tr>
// //                                     <th scope="col" className="px-4 py-2 font-medium">Item</th>
// //                                     <th scope="col" className="px-4 py-2 text-right font-medium">Price</th>
// //                                     <th scope="col" className="px-4 py-2 text-center font-medium w-32">Quantity</th>
// //                                     <th scope="col" className="px-4 py-2 text-right font-medium">Total</th>
// //                                     <th scope="col" className="px-1 py-2 text-center font-medium w-10"></th> {/* Action */}
// //                                 </tr>
// //                             </thead>
// //                             <tbody className="bg-white divide-y divide-gray-200">
// //                             {selectedItems.map((item) => (
// //                                 <tr key={item.itemId} className="hover:bg-gray-50/80">
// //                                     <td className="px-4 py-1.5 font-medium text-gray-900 whitespace-normal">{item.itemName}</td>
// //                                     <td className="px-4 py-1.5 text-right text-gray-700">₹{item.price.toFixed(2)}</td>
// //                                     <td className="px-4 py-1.5">
// //                                         <div className="flex items-center justify-center space-x-1.5">
// //                                             <button
// //                                                 onClick={() => handleDecreaseQuantity(item.itemId)}
// //                                                 className="p-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
// //                                                 disabled={item.quantity <= 1 || isSubmitting}
// //                                                 aria-label="Decrease quantity"
// //                                             >-</button>
// //                                             <input
// //                                                 type="number"
// //                                                 value={item.quantity}
// //                                                 onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
// //                                                 className="w-10 h-6 text-center border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
// //                                                 min="1"
// //                                                 disabled={isSubmitting}
// //                                                 aria-label={`Quantity for ${item.itemName}`}
// //                                             />
// //                                             <button
// //                                                 onClick={() => handleIncreaseQuantity(item.itemId)}
// //                                                 className="p-0.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
// //                                                 disabled={isSubmitting}
// //                                                 aria-label="Increase quantity"
// //                                             >+</button>
// //                                         </div>
// //                                     </td>
// //                                     <td className="px-4 py-1.5 text-right font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</td>
// //                                     <td className="px-1 py-1.5 text-center">
// //                                         <button
// //                                             onClick={() => handleRemoveItem(item.itemId)}
// //                                             className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full hover:bg-red-100"
// //                                             disabled={isSubmitting}
// //                                             aria-label="Remove item"
// //                                         >
// //                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
// //                                         </button>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                             </tbody>
// //                         </table>
// //                     </div>
// //                 ) : (
// //                      <div className="flex-grow flex items-center justify-center">
// //                         <div className="text-center text-gray-500 py-10 px-4 italic">
// //                             Cart is empty. Select items above and click 'Add Item'.
// //                         </div>
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //       </div>

// //       {/* Sales History Section */}
// //       <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
// //         <PageHeaderWithBreadcrumb/>
// //          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales History</h2>
// //          {/* Loading/Error messages for history */}
// //          {loading && sales.length === 0 && <p className="text-center py-4 text-gray-500">Loading history...</p>}
// //          {error && sales.length === 0 && <p className="text-center py-4 text-red-500">Error loading history: {error}</p>}
// //          {/* Optional: Indicate background refresh/update status */}
// //          {/* {loading && sales.length > 0 && <p className="text-sm text-gray-500 mb-2">Checking for updates...</p>}
// //          {error && sales.length > 0 && <p className="text-sm text-red-500 mb-2">Error checking updates: {error}</p>} */}

// //         <div className="overflow-x-auto">
// //            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
// //              <thead className="bg-gray-50">
// //                <tr>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale ID</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
// //                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
// //                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
// //                </tr>
// //              </thead>
// //              <tbody className="bg-white divide-y divide-gray-200">
// //                 {sales.length === 0 && !loading && (
// //                     <tr>
// //                         <td colSpan="8" className="px-4 py-6 text-center text-sm text-gray-500 italic">No sales records found.</td>
// //                     </tr>
// //                 )}
// //               {sales.map((s) => {
// //                  const student = students.find((st) => st.studentId === s.studentId);
// //                  const studentDisplay = student
// //                    ? `${student.studentName} (${student.class}-${student.section})`
// //                    : `ID: ${s.studentId}`;
// //                  return (
// //                    <tr key={s._id || s.saleId} className={`hover:bg-gray-50/80 transition-colors duration-150 ${s.paymentStatus !== 'paid' ? 'bg-red-50/40' : ''}`}> {/* Highlight unpaid rows */}
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(s.date).toLocaleDateString()}</td>
// //                      <td className="px-4 py-3 whitespace-normal text-sm text-gray-800 font-medium">{studentDisplay}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-[11px]">{s.saleId}</td> {/* Added Sale ID */}
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">₹{s.totalAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700 text-right">₹{s.paidAmount.toFixed(2)}</td>
// //                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${s.dueAmount > 0 ? 'text-red-700 font-semibold' : 'text-gray-500'}`}>₹{s.dueAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center">
// //                         <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
// //                             s.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
// //                             s.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
// //                             'bg-red-100 text-red-800'
// //                         }`}>
// //                             {s.paymentStatus}
// //                         </span>
// //                      </td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
// //                        <button
// //                          onClick={() => handlePrintReceipt(s.saleId)}
// //                          className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1 mx-auto text-xs"
// //                          disabled={isFetchingReceipt || isSubmitting}
// //                          title="View & Print Receipt"
// //                        >
// //                          {/* Icon can be added back if desired */}
// //                          View / Print
// //                        </button>
// //                      </td>
// //                    </tr>
// //                  );
// //                })}
// //              </tbody>
// //            </table>
// //         </div>
// //       </div>

// //       {renderReceiptModal()}
// //     </div>
// //   );
// // };

// // export default Sales;

// // import React, { useState, useEffect, useRef } from "react";
// // import axios from "axios";
// // import { toast } from "react-toastify";
// // import jsPDF from "jspdf"; // Keep import if needed later for dedicated download
// // import html2canvas from "html2canvas"; // Keep import if needed later

// // // --- Reusable Input Component --- (Keep as is)
// // const ReactInput = ({ label, value, onChange, placeholder, type = "text", name, required, maxLength, onFocus, onBlur }) => (
// //     <div className="relative">
// //       {/* Removed label element for cleaner look, placeholder acts as label */}
// //       <input
// //         id={name}
// //         name={name}
// //         type={type}
// //         value={value}
// //         onChange={onChange}
// //         placeholder={placeholder || label} // Use placeholder effectively
// //         required={required}
// //         maxLength={maxLength}
// //         onFocus={onFocus}
// //         onBlur={onBlur}
// //         className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm peer placeholder-transparent" // Added peer, placeholder-transparent
// //         autoComplete="off"
// //       />
// //        {/* Floating label effect */}
// //       <label
// //         htmlFor={name}
// //         className={`absolute left-3 -top-2 text-xs text-gray-500 bg-white px-1 transition-all
// //                    peer-placeholder-shown:top-1.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
// //                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-600
// //                    ${value ? '-top-2 text-xs' : ''} ${value ? 'text-indigo-600' : ''}
// //                    pointer-events-none`} // Added pointer-events-none
// //       >
// //         {label || placeholder} {required && '*'}
// //       </label>
// //     </div>
// //   );

// // // --- Reusable Select Component --- (Keep as is)
// // const ReactSelect = ({ label, value, handleChange, options, name, required }) => (
// //     <div className="relative">
// //       <select
// //         id={name}
// //         name={name}
// //         value={value}
// //         onChange={handleChange}
// //         required={required}
// //         className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white appearance-none peer" // Added appearance-none peer
// //       >
// //         <option value="" disabled>{`Select ${label}`}</option>
// //         {options.map(option => (
// //           <option key={option.value} value={option.value}>
// //             {option.label}
// //           </option>
// //         ))}
// //       </select>
// //        {/* Floating label */}
// //        <label
// //         htmlFor={name}
// //         className={`absolute left-3 -top-2 text-xs text-gray-500 bg-white px-1 transition-all
// //                    ${value ? '-top-2 text-xs text-indigo-600' : 'top-1.5 text-sm text-gray-400'}
// //                    peer-focus:-top-2 peer-focus:text-xs peer-focus:text-indigo-600
// //                    pointer-events-none`}
// //       >
// //         {label} {required && '*'}
// //       </label>
// //       {/* Arrow Icon */}
// //       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
// //         <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S5.11 9.581 5.11 9.163c0-.418.08-.1.406-1.615z"/></svg>
// //       </div>
// //     </div>
// //   );

// // // --- Main Sales Component ---
// // const Sales = () => {
// //   // State variables
// //   const [students, setStudents] = useState([]);
// //   const [items, setItems] = useState([]);
// //   const [sales, setSales] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [searchResults, setSearchResults] = useState([]);
// //   const [showSuggestions, setShowSuggestions] = useState(false);
// //   const [selectedStudent, setSelectedStudent] = useState(null);
// //   const [selectedStudentDisplay, setSelectedStudentDisplay] = useState("");
// //   const [selectedItem, setSelectedItem] = useState("");
// //   const [selectedItems, setSelectedItems] = useState([]);
// //   const [subtotal, setSubtotal] = useState(0);
// //   const [paidAmount, setPaidAmount] = useState("");
// //   const [dueAmount, setDueAmount] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [showReceiptModal, setShowReceiptModal] = useState(false);
// //   // *** NEW: State to hold receipt HTML ***
// //   const [receiptHtmlContent, setReceiptHtmlContent] = useState("");

// //   // Refs
// //   const receiptModalContentRef = useRef(); // Ref for the modal content area
// //   const searchContainerRef = useRef();

// //   // --- Fetch Initial Data --- (Keep as is)
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
// //         setError(null);
// //         const token = localStorage.getItem("token");
// //         if (!token) {
// //             throw new Error("Authentication token not found.");
// //         }
// //         const headers = { Authorization: `Bearer ${token}` };

// //         const [studentResponse, itemResponse, salesResponse] =
// //           await Promise.all([
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/studentparent?fetchAllStudents=true",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //               { withCredentials: true, headers }
// //             ),
// //           ]);

// //         if (studentResponse.data.success) {
// //           setStudents(studentResponse.data.students.data || []);
// //         } else {
// //           throw new Error(studentResponse.data.message || "Failed to fetch students");
// //         }
// //         if (itemResponse.data.success) {
// //           setItems(itemResponse.data.listOfAllItems || []);
// //         } else {
// //             throw new Error(itemResponse.data.message || "Failed to fetch items");
// //         }
// //         if (salesResponse.data.success) {
// //           setSales(salesResponse.data.sales?.reverse() || []); // Show latest first
// //         } else {
// //             throw new Error(salesResponse.data.message || "Failed to fetch sales");
// //         }

// //       } catch (error) {
// //         console.error("Fetch data error:", error);
// //         const errorMessage = error.response?.data?.message || error.message || "Failed to fetch data.";
// //         toast.error(errorMessage);
// //         setError(errorMessage);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   // --- Student Search Logic --- (Keep as is)
// //   useEffect(() => {
// //     if (searchTerm.trim() === "") {
// //       setSearchResults([]);
// //       setShowSuggestions(false);
// //       return;
// //     }
// //     const filtered = students.filter(s => {
// //         const term = searchTerm.toLowerCase();
// //         const nameMatch = s.studentName.toLowerCase().includes(term);
// //         const admissionMatch = s.admissionNumber ? String(s.admissionNumber).toLowerCase().includes(term) : false;
// //         const idMatch = s.studentId.toLowerCase().includes(term);
// //         return nameMatch || admissionMatch || idMatch;
// //     }).slice(0, 10);
// //     setSearchResults(filtered);
// //     setShowSuggestions(true);
// //   }, [searchTerm, students]);

// //   // --- Handle Clicking Outside Search Suggestions --- (Keep as is)
// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
// //         setShowSuggestions(false);
// //       }
// //     };
// //     if (showSuggestions) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     } else {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     }
// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [showSuggestions]);

// //   // --- Handle Student Selection --- (Keep as is)
// //   const handleStudentSelect = (student) => {
// //     debugger
// //     setSelectedStudent(student);

// //     const displayName = `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`;
// //     setSelectedStudentDisplay(displayName);
// //     setSearchTerm(student.studentName); // Update search bar
// //     setShowSuggestions(false);
// //     setSearchResults([]);

// //   };

// //   const itemOptions = items.map(item => ({
// //     value: item.itemId,
// //     label: `${item.itemName} - ₹${item.price.toFixed(2)}`
// //   }));

// //   const handleAddItem = () => {
// //     if (!selectedItem) {
// //         toast.warn("Please select an item to add.");
// //         return;
// //     }
// //     const itemToAdd = items.find((i) => i.itemId === selectedItem);
// //     if (itemToAdd) {
// //         const existingItemIndex = selectedItems.findIndex(i => i.itemId === selectedItem);
// //         if (existingItemIndex > -1) {
// //             handleIncreaseQuantity(selectedItem);
// //         } else {
// //             setSelectedItems([...selectedItems, { ...itemToAdd, quantity: 1 }]);
// //         }
// //       setSelectedItem("");
// //     }
// //   };

// //   const handleQuantityChange = (itemId, quantityStr) => {
// //     const quantity = Math.max(1, parseInt(quantityStr) || 1);
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: quantity } : i
// //       )
// //     );
// //   };

// //   const handleIncreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
// //       )
// //     );
// //   };

// //   const handleDecreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId && i.quantity > 1
// //           ? { ...i, quantity: i.quantity - 1 }
// //           : i
// //       ).filter(i => !(i.itemId === itemId && i.quantity <= 1)) // Remove if quantity would be 0
// //     );
// //   };

// //   const handleRemoveItem = (itemId) => {
// //     setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
// //   };

// //   // --- Update Subtotal and Due Amount --- (Keep as is)
// //   useEffect(() => {
// //     const calculatedSubtotal = selectedItems.reduce(
// //       (sum, item) => sum + item.price * item.quantity,
// //       0
// //     );
// //     setSubtotal(calculatedSubtotal);
// //     const paid = parseFloat(paidAmount) || 0;
// //     setDueAmount(Math.max(0, calculatedSubtotal - paid));
// //   }, [selectedItems, paidAmount]);

// //   const handleSubmit = async () => {
// //     if (!selectedStudent || !selectedStudent.studentId) {
// //         toast.error("Please search and select a student.");
// //         return;
// //     }
// //     if (selectedItems.length === 0) {
// //         toast.error("Please add items to the sale.");
// //         return;
// //     }

// //     const saleData = {
// //       studentId: selectedStudent.studentId,
// //       items: selectedItems.map((i) => ({
// //         itemId: i.itemId,
// //         quantity: i.quantity,
// //         price: i.price
// //       })),
// //       totalAmount: subtotal,
// //       paidAmount: parseFloat(paidAmount) || 0,
// //       dueAmount: dueAmount,
// //       paymentStatus: (parseFloat(paidAmount) || 0) >= subtotal ? "paid" : ((parseFloat(paidAmount) || 0) > 0 ? "partial" : "pending"),
// //     };

// //     try {
// //       setIsSubmitting(true);
// //       const token = localStorage.getItem("token");
// //       const response = await axios.post(
// //         "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //         saleData,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       if (response.data.success) {
// //         const newSale = response.data.data.sale;
// //         // Keep details for receipt
// //         const studentDetailsForReceipt = { ...selectedStudent };
// //         const itemsForReceipt = response.data.data.receiptItems || selectedItems.map(item => ({
// //             itemName: item.itemName,
// //             quantity: item.quantity,
// //             price: item.price,
// //             total: item.price * item.quantity
// //         }));

// //         setSales([newSale, ...sales]);

// //         // Clear form
// //         setSearchTerm("");
// //         setSelectedStudent(null);
// //         setSelectedStudentDisplay("");
// //         setSelectedItems([]);
// //         setPaidAmount("");
// //         setSubtotal(0);
// //         setDueAmount(0);
// //         setSearchResults([]);
// //         setShowSuggestions(false);

// //         toast.success(response.data.message || "Sale created successfully!");

// //         // *** Generate HTML receipt ***
// //         const receiptData = {
// //             ...newSale,
// //             items: itemsForReceipt,
// //         };
// //         // *** Update to call generateReceiptHtml ***
// //         generateReceiptHtml(receiptData, studentDetailsForReceipt);

// //       } else {
// //         toast.error(response.data.message || "Failed to create sale.");
// //       }
// //     } catch (error) {
// //       console.error("Submit sale error:", error);
// //       toast.error(error.response?.data?.message || "An error occurred while creating the sale.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // --- Receipt HTML Generation (Enhanced Styling) ---
// //   const generateReceiptHtml = (receiptData, student) => {
// //     if (!receiptData) return;

// //     const studentInfo = student
// //       ? `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`
// //       : `Student ID: ${receiptData.studentId}`;

// //     const receiptContent = `
// //       <div style="width: 320px; padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; background-color: #ffffff; border: 1px solid #eee; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
// //         <h2 style="font-size: 16px; text-align: center; margin: 0 0 10px; font-weight: 600; color: #333;">INVOICE / RECEIPT</h2>
// //         <div style="margin-bottom: 8px;">
// //             <p style="margin: 2px 0;"><strong>Student:</strong> ${studentInfo}</p>
// //             <p style="margin: 2px 0;"><strong>Sale ID:</strong> ${receiptData.saleId}</p>
// //             <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(receiptData.date).toLocaleString()}</p>
// //         </div>
// //         <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px;">
// //           <thead>
// //             <tr style="border-top: 1px dashed #aaa; border-bottom: 1px dashed #aaa;">
// //               <th style="padding: 6px 4px; text-align: left; font-weight: 600;">Item</th>
// //               <th style="padding: 6px 4px; text-align: center; font-weight: 600;">Qty</th>
// //               <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Price</th>
// //               <th style="padding: 6px 4px; text-align: right; font-weight: 600;">Total</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             ${(receiptData.items || [])
// //               .map(
// //                 (item) => `
// //               <tr style="border-bottom: 1px dotted #ccc;">
// //                 <td style="padding: 5px 4px; word-break: break-word;">${item.itemName || 'N/A'}</td>
// //                 <td style="padding: 5px 4px; text-align: center;">${item.quantity}</td>
// //                 <td style="padding: 5px 4px; text-align: right;">₹${item.price?.toFixed(2) || '0.00'}</td>
// //                 <td style="padding: 5px 4px; text-align: right;">₹${(item.price * item.quantity).toFixed(2) || '0.00'}</td>
// //               </tr>
// //             `
// //               )
// //               .join("")}
// //           </tbody>
// //         </table>
// //         <div style="margin-top: 12px; text-align: right; border-top: 1px dashed #aaa; padding-top: 8px;">
// //             <p style="margin: 3px 0; font-size: 13px;"><strong>Subtotal:</strong> ₹${receiptData.totalAmount?.toFixed(2)}</p>
// //             <p style="margin: 3px 0; font-size: 13px;"><strong>Paid:</strong> ₹${receiptData.paidAmount?.toFixed(2)}</p>
// //             <p style="margin: 5px 0; font-weight: bold; font-size: 14px;"><strong>Due:</strong> ₹${receiptData.dueAmount?.toFixed(2)}</p>
// //             <p style="margin: 3px 0; font-size: 13px;"><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: 500;">${receiptData.paymentStatus}</span></p>
// //         </div>
// //          <p style="font-size: 11px; text-align: center; margin-top: 15px; color: #777;">Thank you for your purchase!</p>
// //       </div>
// //     `;

// //     setReceiptHtmlContent(receiptContent);
// //     setShowReceiptModal(true);
// //   };

// //   const handlePrint = () => {
// //     const contentToPrint = receiptModalContentRef.current;
// //     if (!contentToPrint) {
// //       toast.error("Receipt content not found for printing.");
// //       return;
// //     }

// //     const printWindow = window.open('', '_blank', 'height=600,width=800');
// //     if (!printWindow) {
// //         toast.error("Failed to open print window. Please check browser pop-up settings.");
// //         return;
// //     }

// //     // Write HTML structure and styles *without* the <title> tag in the head
// //     printWindow.document.write('<html><head>');
// //     // Add print-specific styles, including @page for margins
// //     printWindow.document.write(`
// //         <style>
// //             /* Apply base styles for printing */
// //             body {
// //                 margin: 0; /* Reset default body margin */
// //                 padding: 10mm; /* Add padding for content, adjust as needed */
// //                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
// //                 font-size: 12px; /* Optional: Adjust base print font size */
// //                 line-height: 1.4;
// //             }

// //             /* Use @page rule to suggest minimal margins to the browser */
// //             /* Browsers may still add headers/footers in this margin area */
// //             @page {
// //                 size: auto; /* Let browser decide paper size */
// //                 margin: 5mm; /* Request small margins (e.g., 5mm) */
// //             }

// //             /* Hide elements not meant for printing *if* they exist in your content */
// //             @media print {
// //                /* Example: .no-print-class { display: none; } */

// //                /* Ensure the main receipt container uses full width and remove visual extras */
// //                body > div { /* Target the main receipt div */
// //                   margin: 0 !important;
// //                }
// //             }

// //             /* Basic table/element styling for the receipt content itself */
// //             /* (Ensure these match or simplify your receipt styles) */
// //             h2 {
// //                 font-size: 15px; /* Adjust for print */
// //                 text-align: center;
// //                 margin: 0 0 10px 0;
// //                 font-weight: 600;
// //                 color: #000; /* Use black for print */
// //             }
// //             p {
// //                 margin: 3px 0;
// //                 color: #000;
// //             }
// //             table {

// //                 border-collapse: collapse;

// //                 font-size: 11px; /* Adjust for print */
// //                 color: #000;
// //             }
// //             th, td {
// //                 padding: 4px 3px;
// //                 border-bottom: 1px dotted #888; /* Use darker dotted line */
// //                 text-align: left;
// //                 word-break: break-word; /* Allow long item names to wrap */
// //             }
// //             th {
// //                 border-top: 1px dashed #555; /* Use darker dashed line */
// //                 border-bottom: 1px dashed #555;
// //                 font-weight: 600;
// //                 background-color: #f0f0f0; /* Optional subtle header background */
// //             }
// //              /* Align specific columns */
// //             th:nth-child(2), td:nth-child(2) { text-align: center; } /* Qty */
// //             th:nth-child(3), td:nth-child(3), /* Price */
// //             th:nth-child(4), td:nth-child(4) { text-align: right; } /* Total */

// //             /* Styling for the totals section */
// //             div[style*="text-align: right"] { /* Target totals div */
// //                  margin-top: 12px;
// //                  text-align: right;
// //                  border-top: 1px dashed #555;
// //                  padding-top: 8px;
// //             }
// //              div[style*="text-align: right"] p {
// //                 margin: 2px 0;
// //                 font-size: 12px; /* Adjust totals font size */
// //              }
// //              div[style*="text-align: right"] p strong {
// //                  font-weight: bold;
// //              }

// //              /* Hide the final "Thank you" message if desired for print */
// //              p[style*="text-align: center"] {
// //                  /* display: none; */ /* Uncomment to hide */
// //                  font-size: 10px;
// //                  margin-top: 15px;
// //                  color: #555;
// //              }
// //         </style>
// //     `);
// //     printWindow.document.write('</head><body>');
// //     // Write only the inner HTML of the receipt content container
// //     printWindow.document.write(contentToPrint.innerHTML);
// //     printWindow.document.write('</body></html>');

// //     printWindow.document.close(); // Crucial for some browsers
// //     printWindow.focus(); // Focus the new window

// //     setTimeout(() => {
// //          try {
// //             printWindow.print();
// //           } catch (e) {
// //              console.error("Print error:", e);
// //              toast.error("Could not initiate printing.");
// //              printWindow.close(); // Close if print fails
// //          }
// //     }, 500); // 500ms delay, adjust if needed
// // };
// //   // --- Print Existing Receipt (Fetches data and generates HTML) ---
// //   const handlePrintReceipt = async (saleId) => {
// //     try {
// //       setIsFetchingReceipt(true);
// //       const token = localStorage.getItem("token");
// //       const response = await axios.get(
// //         `https://api.digitalvidyasaarthi.in/api/v1/adminRoute/receipts/${saleId}`,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       if (response.data.success && response.data.receipt) {
// //         const receiptDetails = response.data.receipt;
// //         const student = students.find(s => s.studentId === receiptDetails.studentId);
// //         if (!student) {
// //             toast.warn(`Student details for ID ${receiptDetails.studentId} not found locally. Receipt may show ID only.`);
// //         }
// //         // *** Generate HTML, not PDF ***
// //         generateReceiptHtml(receiptDetails, student); // Pass student or null
// //         toast.success("Receipt preview ready.");
// //       } else {
// //         toast.warning(`Failed to fetch receipt details: ${response.data.message || 'Not found'}`);
// //       }
// //     } catch (error) {
// //       console.error("Error in handlePrintReceipt:", error);
// //       toast.error(`Error fetching receipt: ${error.response?.data?.message || error.message}`);
// //     } finally {
// //         setIsFetchingReceipt(false);
// //     }
// //   };

// //   // --- Render Receipt Modal (Displays HTML directly) ---
// //   const renderReceiptModal = () => (
// //     showReceiptModal && (
// //       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
// //         {/* Adjusted width, added overflow-y-auto */}
// //         <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
// //            {/* Modal Header */}
// //            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-white rounded-t-lg">
// //                 <h2 className="text-xl font-semibold text-gray-800">Receipt</h2>
// //                 <button
// //                     onClick={() => {
// //                         setShowReceiptModal(false);
// //                         setReceiptHtmlContent(""); // Clear HTML on close
// //                     }}
// //                     className="text-gray-400 hover:text-gray-600"
// //                     aria-label="Close modal"
// //                 >
// //                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
// //                 </button>
// //            </div>

// //           {/* Modal Body - Scrollable Area */}
// //           <div className="p-4 md:p-6 flex-grow overflow-y-auto">
// //             {receiptHtmlContent ? (
// //                 // Container for the HTML content with ref
// //                 <div ref={receiptModalContentRef} dangerouslySetInnerHTML={{ __html: receiptHtmlContent }} />
// //             ) : (
// //                 <div className="flex items-center justify-center h-full text-gray-500 py-10">Generating preview...</div>
// //             )}
// //           </div>

// //           {/* Modal Footer */}
// //           <div className="flex flex-wrap justify-end gap-3 p-4 border-t border-gray-300 bg-white rounded-b-lg">
// //             <button
// //               onClick={handlePrint}
// //               className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 text-sm font-medium shadow-sm disabled:opacity-60"
// //               disabled={!receiptHtmlContent}
// //             >
// //               🖨️ Print
// //             </button>
// //             {/* Removed Download PDF button */}
// //             <button
// //               onClick={() => {
// //                 setShowReceiptModal(false);
// //                 setReceiptHtmlContent(""); // Clear HTML on close
// //               }}
// //               className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150 text-sm font-medium"
// //             >
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   );

// //   if (loading && !sales.length) { // Show loader only on initial load
// //     return (
// //       <div className="flex justify-center items-center h-64">
// //         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
// //       </div>
// //     );
// //   }

// //   if (error && !sales.length) { // Show error only if data fetch failed completely
// //     return (
// //       <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
// //         Error: {error}
// //       </div>
// //     );
// //   }

// //   // --- Main Render --- (Adjustments for layout and cart)
// //   return (
// //     <div className="px-4 md:px-6 py-2">
// //       {/* Form Section */}
// //       <div className="mb-6 ">
// //         <h1 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">Create New Sale</h1>
// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
// //             {/* Left Side: Student Search, Item Select, Totals, Submit */}
// //             <div className="space-y-5">
// //                 {/* Student Search & Display */}
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
// //                     <div className="relative" ref={searchContainerRef}>
// //                         <ReactInput
// //                             label="Student Search"
// //                             name="studentSearch"
// //                             value={searchTerm}
// //                             onChange={(e) => {
// //                                 setSearchTerm(e.target.value);
// //                                 if (e.target.value.trim() === "") {
// //                                     setSelectedStudent(null);
// //                                     setSelectedStudentDisplay("");
// //                                 }
// //                             }}
// //                             placeholder="Name/Adm#/ID"
// //                             required
// //                         />
// //                         {/* Suggestions dropdown - improved styling */}
// //                         {showSuggestions && (
// //                             <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ">
// //                                 {searchResults.length > 0 ? (
// //                                     searchResults.map(student => (
// //                                         <div
// //                                             key={student.studentId}
// //                                             className="px-4 py-2 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
// //                                             onMouseDown={(e) => { // Use onMouseDown for better click handling before blur
// //                                                 e.preventDefault();
// //                                                 handleStudentSelect(student);
// //                                             }}
// //                                         >
// //                                             <span className="font-medium">{student.studentName}</span>
// //                                             <span className="text-gray-600"> ({student.class}-{student.section})</span>
// //                                             {student.admissionNumber && <span className="text-xs text-blue-600 ml-2">[Adm: {student.admissionNumber}]</span>}

// //                                         </div>

// //                                     ))
// //                                 ) : (
// //                                     <div className="px-4 py-3 text-sm text-gray-500 italic">
// //                                         No students found matching "{searchTerm}".
// //                                     </div>
// //                                 )}
// //                             </div>
// //                          )}
// //                     </div>
// //                     {
// //                       // searchResults?.map(()=>)
// //                     }
// //                     {/* Selected Student Display - Improved styling */}
// //                     <div className="h-full flex items-center mt-1 sm:mt-0">
// //                         <div className={`w-full px-3 py-1.5 rounded-md text-sm ${selectedStudentDisplay ? 'border border-green-400 bg-green-50 text-green-800' : 'border border-gray-300 bg-gray-50 text-gray-500 italic'}`}>
// //                             {selectedStudentDisplay ? (
// //                                 <>
// //                                 <span className="font-medium">Selected:</span> {selectedStudentDisplay}
// //                                 </>
// //                             ) : (
// //                                 'No student selected'
// //                             )}
// //                             {
// //                               selectedStudentDisplay
// //                             }
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Item Selection */}
// //                 <div className="flex items-start space-x-3">
// //                     <div className="flex-grow">
// //                          <ReactSelect
// //                             label="Item"
// //                             name="selectedItem"
// //                             value={selectedItem}
// //                             handleChange={(e) => setSelectedItem(e.target.value)}
// //                             options={itemOptions}
// //                         />
// //                     </div>
// //                     <button
// //                     type="button"
// //                     onClick={handleAddItem}
// //                     className="px-4 py-1.5 mt-[6px] bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap disabled:opacity-50 shadow-sm transition duration-150"
// //                     disabled={!selectedItem || isSubmitting}
// //                     >
// //                      Add Item
// //                     </button>
// //                 </div>

// //                 {/* Totals and Payment */}
// //                 <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-200 pt-5">
// //                      <div className="flex items-baseline space-x-2">
// //                         <span className="text-lg font-semibold text-gray-700">Total:</span>
// //                         <span className="text-xl font-bold text-blue-800">₹{subtotal.toFixed(2)}</span>
// //                     </div>
// //                     <div className="flex items-center gap-3 flex-wrap">
// //                         <div className="w-full sm:w-32"> {/* Limit width */}
// //                             <ReactInput
// //                                 label="Amount Paid"
// //                                 type="number"
// //                                 name="paidAmount"
// //                                 value={paidAmount}
// //                                 onChange={(e) => setPaidAmount(e.target.value)}
// //                                 placeholder="Paid"
// //                                 required={false}
// //                             />
// //                         </div>
// //                         {subtotal > 0 && ( // Show Due always if there is a subtotal
// //                              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-sm ${dueAmount > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
// //                                 <span className={`font-medium ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>Due:</span>
// //                                 <span className={`font-bold ${dueAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{dueAmount.toFixed(2)}</span>
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>

// //                 {/* Submit Button */}
// //                 <div className="text-right pt-3">
// //                     <button
// //                     type="button"
// //                     onClick={handleSubmit}
// //                     className={`inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ${isSubmitting || !selectedStudent || selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
// //                     disabled={isSubmitting || !selectedStudent || selectedItems.length === 0}
// //                     >
// //                     {isSubmitting ? (
// //                         <>
// //                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                             </svg>
// //                             Processing...
// //                         </>
// //                     ) : 'Create Sale & View Receipt'}
// //                     </button>
// //                 </div>
// //             </div>

// //             {/* Right Side: Cart Items - Improved Styling */}
// //             <div className="border border-gray-200 rounded-lg bg-gray-50/70 flex flex-col min-h-[300px]">
// //                 <h3 className="text-lg font-semibold p-3 border-b border-gray-200 text-gray-700 bg-white rounded-t-lg">Shopping Cart</h3>
// //                 {selectedItems.length > 0 ? (
// //                     <div className="overflow-y-auto flex-grow"> {/* Scroll within this div */}
// //                         <table className="w-full text-sm text-left text-gray-600">
// //                             <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
// //                                 <tr>
// //                                     <th scope="col" className="px-4 py-2 font-medium">Item</th>
// //                                     <th scope="col" className="px-4 py-2 text-right font-medium">Price</th>
// //                                     <th scope="col" className="px-4 py-2 text-center font-medium w-32">Quantity</th>
// //                                     <th scope="col" className="px-4 py-2 text-right font-medium">Total</th>
// //                                     <th scope="col" className="px-1 py-2 text-center font-medium w-10"></th> {/* Action */}
// //                                 </tr>
// //                             </thead>
// //                             <tbody className="bg-white divide-y divide-gray-200">
// //                             {selectedItems.map((item) => (
// //                                 <tr key={item.itemId} className="hover:bg-gray-50/80">
// //                                     <td className="px-4 py-1.5 font-medium text-gray-900 whitespace-normal">{item.itemName}</td>
// //                                     <td className="px-4 py-1.5 text-right text-gray-700">₹{item.price.toFixed(2)}</td>
// //                                     <td className="px-4 py-1.5">
// //                                         <div className="flex items-center justify-center space-x-1.5">
// //                                             <button
// //                                                 onClick={() => handleDecreaseQuantity(item.itemId)}
// //                                                 className="p-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
// //                                                 disabled={item.quantity <= 1 || isSubmitting}
// //                                                 aria-label="Decrease quantity"
// //                                             >-</button>
// //                                             <input
// //                                                 type="number"
// //                                                 value={item.quantity}
// //                                                 onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
// //                                                 className="w-10 h-6 text-center border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
// //                                                 min="1"
// //                                                 disabled={isSubmitting}
// //                                                 aria-label={`Quantity for ${item.itemName}`}
// //                                             />
// //                                             <button
// //                                                 onClick={() => handleIncreaseQuantity(item.itemId)}
// //                                                 className="p-0.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-5 h-5 flex items-center justify-center text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
// //                                                 disabled={isSubmitting}
// //                                                 aria-label="Increase quantity"
// //                                             >+</button>
// //                                         </div>
// //                                     </td>
// //                                     <td className="px-4 py-1.5 text-right font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</td>
// //                                     <td className="px-1 py-1.5 text-center">
// //                                         <button
// //                                             onClick={() => handleRemoveItem(item.itemId)}
// //                                             className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed rounded-full hover:bg-red-100"
// //                                             disabled={isSubmitting}
// //                                             aria-label="Remove item"
// //                                         >
// //                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
// //                                         </button>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                             </tbody>
// //                         </table>
// //                     </div>
// //                 ) : (
// //                      <div className="flex-grow flex items-center justify-center">
// //                         <div className="text-center text-gray-500 py-10 px-4 italic">
// //                             Cart is empty. Select items above and click 'Add Item'.
// //                         </div>
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //       </div>

// //       {/* Sales History Section */}
// //       <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
// //          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales History</h2>
// //          {loading && sales.length === 0 && <p className="text-center py-4 text-gray-500">Loading history...</p>}
// //          {error && sales.length === 0 && <p className="text-center py-4 text-red-500">Error loading history: {error}</p>}
// //          {loading && sales.length > 0 && <p className="text-sm text-gray-500 mb-2">Checking for updates...</p>}
// //          {error && sales.length > 0 && <p className="text-sm text-red-500 mb-2">Error checking updates: {error}</p>}

// //         <div className="overflow-x-auto">
// //            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
// //              <thead className="bg-gray-50">
// //                <tr>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
// //                  <th th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
// //                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
// //                </tr>
// //              </thead>
// //              <tbody className="bg-white divide-y divide-gray-200">
// //                 {sales.length === 0 && !loading && (
// //                     <tr>
// //                         <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500 italic">No sales records found.</td>
// //                     </tr>
// //                 )}
// //               {sales.map((s) => {
// //                  const student = students.find((st) => st.studentId === s.studentId);
// //                  const studentDisplay = student
// //                    ? `${student.studentName} (${student.class}-${student.section})`
// //                    : `ID: ${s.studentId}`;
// //                  return (
// //                    <tr key={s._id || s.saleId} className="hover:bg-gray-50/80 transition-colors duration-150">
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{new Date(s.date).toLocaleDateString()}</td>
// //                      <td className="px-4 py-3 whitespace-normal text-sm text-gray-800 font-medium">{studentDisplay}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">₹{s.totalAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-700 text-right">₹{s.paidAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-700 text-right">₹{s.dueAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center">
// //                         <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
// //                             s.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
// //                             s.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
// //                             'bg-red-100 text-red-800'
// //                         }`}>
// //                             {s.paymentStatus}
// //                         </span>
// //                      </td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
// //                        <button
// //                          onClick={() => handlePrintReceipt(s.saleId)}
// //                          className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded hover:bg-indigo-50 transition-colors flex items-center gap-1 mx-auto"
// //                          disabled={isFetchingReceipt || isSubmitting}
// //                          title="View & Print Receipt"
// //                        >
// //                          {/* <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"></path></svg> */}
// //                          View 🖨️
// //                        </button>
// //                      </td>
// //                    </tr>
// //                  );
// //                })}
// //              </tbody>
// //            </table>
// //         </div>
// //       </div>

// //       {renderReceiptModal()}
// //     </div>
// //   );
// // };

// // export default Sales;

// // import React, { useState, useEffect, useRef } from "react";
// // import axios from "axios";
// // import { toast } from "react-toastify";
// // import jsPDF from "jspdf";
// // import html2canvas from "html2canvas";

// // // --- Reusable Input Component ---
// // const ReactInput = ({ label, value, onChange, placeholder, type = "text", name, required, maxLength, onFocus, onBlur }) => (
// //     <div className="relative">
// //       <input
// //         id={name}
// //         name={name}
// //         type={type}
// //         value={value}
// //         onChange={onChange}
// //         placeholder={placeholder || label}
// //         required={required}
// //         maxLength={maxLength}
// //         onFocus={onFocus}
// //         onBlur={onBlur}
// //         className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
// //         autoComplete="off"
// //       />
// //     </div>
// //   );

// // // --- Reusable Select Component ---
// // const ReactSelect = ({ label, value, handleChange, options, name, required }) => (
// //     <div className="">
// //       <select
// //         id={name}
// //         name={name}
// //         value={value}
// //         onChange={handleChange}
// //         required={required}
// //         className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
// //       >
// //         <option value="" disabled>Select {label}</option>
// //         {options.map(option => (
// //           <option key={option.value} value={option.value}>
// //             {option.label}
// //           </option>
// //         ))}
// //       </select>
// //     </div>
// //   );

// // // --- Main Sales Component ---
// // const Sales = () => {
// //   // State variables
// //   const [students, setStudents] = useState([]);
// //   const [items, setItems] = useState([]);
// //   const [sales, setSales] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [searchResults, setSearchResults] = useState([]);
// //   const [showSuggestions, setShowSuggestions] = useState(false);
// //   const [selectedStudent, setSelectedStudent] = useState(null);
// //   const [selectedStudentDisplay, setSelectedStudentDisplay] = useState("");
// //   const [selectedItem, setSelectedItem] = useState("");
// //   const [selectedItems, setSelectedItems] = useState([]);
// //   const [subtotal, setSubtotal] = useState(0);
// //   const [paidAmount, setPaidAmount] = useState("");
// //   const [dueAmount, setDueAmount] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [showReceiptModal, setShowReceiptModal] = useState(false);
// //   const [receiptPDFUrl, setReceiptPDFUrl] = useState("");

// //   // Refs
// //   const receiptRef = useRef();
// //   const searchContainerRef = useRef();

// //   // --- Fetch Initial Data ---
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
// //         setError(null);
// //         const token = localStorage.getItem("token");
// //         if (!token) {
// //             throw new Error("Authentication token not found.");
// //         }
// //         const headers = { Authorization: `Bearer ${token}` };

// //         const [studentResponse, itemResponse, salesResponse] =
// //           await Promise.all([
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/studentparent?fetchAllStudents=true",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //               { withCredentials: true, headers }
// //             ),
// //           ]);

// //         if (studentResponse.data.success) {
// //           setStudents(studentResponse.data.students.data || []);
// //         } else {
// //           throw new Error(studentResponse.data.message || "Failed to fetch students");
// //         }
// //         if (itemResponse.data.success) {
// //           setItems(itemResponse.data.listOfAllItems || []);
// //         } else {
// //             throw new Error(itemResponse.data.message || "Failed to fetch items");
// //         }
// //         if (salesResponse.data.success) {
// //           setSales(salesResponse.data.sales?.reverse() || []); // Show latest first
// //         } else {
// //             throw new Error(salesResponse.data.message || "Failed to fetch sales");
// //         }

// //       } catch (error) {
// //         console.error("Fetch data error:", error);
// //         const errorMessage = error.response?.data?.message || error.message || "Failed to fetch data.";
// //         toast.error(errorMessage);
// //         setError(errorMessage);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //    // --- Student Search Logic ---
// //    useEffect(() => {
// //     if (searchTerm.trim() === "") {
// //       setSearchResults([]);
// //       setShowSuggestions(false);
// //       return;
// //     }

// //     const filtered = students.filter(s => {
// //         const term = searchTerm.toLowerCase();
// //         const nameMatch = s.studentName.toLowerCase().includes(term);
// //         const admissionMatch = s.admissionNumber ? String(s.admissionNumber).toLowerCase().includes(term) : false;
// //         const idMatch = s.studentId.toLowerCase().includes(term);
// //         return nameMatch || admissionMatch || idMatch;
// //     }).slice(0, 10);

// //     setSearchResults(filtered);
// //     setShowSuggestions(true);

// //   }, [searchTerm, students]);

// //   // --- Handle Clicking Outside Search Suggestions ---
// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
// //         setShowSuggestions(false);
// //       }
// //     };
// //     if (showSuggestions) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     } else {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     }
// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [showSuggestions]);

// //   // --- Handle Student Selection ---
// //   const handleStudentSelect = (student) => {
// //     setSelectedStudent(student);
// //     const displayName = `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`;
// //     setSelectedStudentDisplay(displayName);
// //     setSearchTerm(student.studentName); // Update search bar
// //     setShowSuggestions(false);
// //     setSearchResults([]);
// //   };

// //   // --- Item Options for Select Dropdown ---
// //   const itemOptions = items.map(item => ({
// //     value: item.itemId,
// //     label: `${item.itemName} - ₹${item.price.toFixed(2)}`
// //   }));

// //   // --- Cart Management ---
// //   const handleAddItem = () => {
// //     if (!selectedItem) {
// //         toast.warn("Please select an item to add.");
// //         return;
// //     }
// //     const itemToAdd = items.find((i) => i.itemId === selectedItem);
// //     if (itemToAdd) {
// //         const existingItemIndex = selectedItems.findIndex(i => i.itemId === selectedItem);
// //         if (existingItemIndex > -1) {
// //             handleIncreaseQuantity(selectedItem);
// //         } else {
// //             setSelectedItems([...selectedItems, { ...itemToAdd, quantity: 1 }]);
// //         }
// //       setSelectedItem(""); // Clear selection
// //     }
// //   };

// //   const handleQuantityChange = (itemId, quantityStr) => {
// //     const quantity = Math.max(1, parseInt(quantityStr) || 1);
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: quantity } : i
// //       )
// //     );
// //   };

// //   const handleIncreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
// //       )
// //     );
// //   };

// //   const handleDecreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId && i.quantity > 1
// //           ? { ...i, quantity: i.quantity - 1 }
// //           : i
// //       ).filter(i => !(i.itemId === itemId && i.quantity <= 1)) // Remove if quantity would be 0
// //     );
// //   };

// //   const handleRemoveItem = (itemId) => {
// //     setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
// //   };

// //   // --- Update Subtotal and Due Amount ---
// //   useEffect(() => {
// //     const calculatedSubtotal = selectedItems.reduce(
// //       (sum, item) => sum + item.price * item.quantity,
// //       0
// //     );
// //     setSubtotal(calculatedSubtotal);
// //     const paid = parseFloat(paidAmount) || 0;
// //     setDueAmount(Math.max(0, calculatedSubtotal - paid));
// //   }, [selectedItems, paidAmount]);

// //   // --- Form Submission ---
// //   const handleSubmit = async () => {
// //     if (!selectedStudent || !selectedStudent.studentId) {
// //         toast.error("Please search and select a student.");
// //         return;
// //     }
// //     if (selectedItems.length === 0) {
// //         toast.error("Please add items to the sale.");
// //         return;
// //     }

// //     const saleData = {
// //       studentId: selectedStudent.studentId,
// //       items: selectedItems.map((i) => ({
// //         itemId: i.itemId,
// //         quantity: i.quantity,
// //         price: i.price
// //       })),
// //       totalAmount: subtotal,
// //       paidAmount: parseFloat(paidAmount) || 0,
// //       dueAmount: dueAmount,
// //       paymentStatus: (parseFloat(paidAmount) || 0) >= subtotal ? "paid" : ((parseFloat(paidAmount) || 0) > 0 ? "partial" : "pending"),
// //     };

// //     try {
// //       setIsSubmitting(true);
// //       const token = localStorage.getItem("token");
// //       const response = await axios.post(
// //         "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //         saleData,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       if (response.data.success) {
// //         const newSale = response.data.data.sale;
// //         // Important: Keep a reference to the student details *before* clearing state
// //         const studentDetailsForReceipt = { ...selectedStudent };
// //         const itemsForReceipt = response.data.data.receiptItems || selectedItems.map(item => ({ // Fallback
// //             itemName: item.itemName,
// //             quantity: item.quantity,
// //             price: item.price,
// //             total: item.price * item.quantity
// //         }));

// //         // Update sales list in state
// //         setSales([newSale, ...sales]);

// //         // Clear the form
// //         setSearchTerm("");
// //         setSelectedStudent(null);
// //         setSelectedStudentDisplay("");
// //         setSelectedItems([]);
// //         setPaidAmount("");
// //         setSubtotal(0);
// //         setDueAmount(0);
// //         setSearchResults([]);
// //         setShowSuggestions(false);

// //         toast.success(response.data.message || "Sale created successfully!");

// //         // Generate receipt *after* state is cleared, using the saved details
// //         const receiptData = {
// //             ...newSale,
// //             items: itemsForReceipt,
// //         };
// //         await generateReceipt(receiptData, studentDetailsForReceipt); // Pass student details

// //       } else {
// //         toast.error(response.data.message || "Failed to create sale.");
// //       }
// //     } catch (error) {
// //       console.error("Submit sale error:", error);
// //       toast.error(error.response?.data?.message || "An error occurred while creating the sale.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // --- Receipt Generation (Thermal Printer Optimized) ---
// //   const generateReceipt = async (receiptData, student) => {
// //     const input = receiptRef.current;
// //     if (!input || !receiptData) return;

// //     input.innerHTML = ""; // Clear previous content

// //     // Use student object passed in, or fallback to ID
// //     const studentInfo = student
// //       ? `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`
// //       : `Student ID: ${receiptData.studentId}`;

// //     // --- Receipt HTML Content (Styled for narrow paper) ---
// //     const receiptContent = `
// //       <div style="padding: 5px; font-family: 'Courier New', Courier, monospace; font-size: 9px; background-color: #ffffff; border: 1px solid #eee;">
// //         <h2 style="font-size: 12px; text-align: center; margin: 5px 0; font-weight: bold;">INVOICE / RECEIPT</h2>
// //         <p style="margin-bottom: 3px;"><strong>Student:</strong> ${studentInfo}</p>
// //         <p style="margin-bottom: 3px;"><strong>Sale ID:</strong> ${receiptData.saleId}</p>
// //         <p style="margin-bottom: 5px;"><strong>Date:</strong> ${new Date(receiptData.date).toLocaleString()}</p>
// //         <table style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9px;">
// //           <thead>
// //             <tr style="border-top: 1px dashed #999; border-bottom: 1px dashed #999;">
// //               <th style="padding: 3px; text-align: left;">Item</th>
// //               <th style="padding: 3px; text-align: center;">Qty</th>
// //               <th style="padding: 3px; text-align: right;">Price</th>
// //               <th style="padding: 3px; text-align: right;">Total</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             ${(receiptData.items || [])
// //               .map(
// //                 (item) => `
// //               <tr style="border-bottom: 1px dotted #eee;">
// //                 <td style="padding: 3px;">${item.itemName || 'N/A'}</td>
// //                 <td style="padding: 3px; text-align: center;">${item.quantity}</td>
// //                 <td style="padding: 3px; text-align: right;">₹${item.price?.toFixed(2)}</td>
// //                 <td style="padding: 3px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
// //               </tr>
// //             `
// //               )
// //               .join("")}
// //           </tbody>
// //         </table>
// //         <div style="margin-top: 8px; text-align: right; border-top: 1px dashed #999; padding-top: 5px;">
// //             <p style="margin-bottom: 3px;"><strong>Subtotal:</strong> ₹${receiptData.totalAmount?.toFixed(2)}</p>
// //             <p style="margin-bottom: 3px;"><strong>Paid:</strong> ₹${receiptData.paidAmount?.toFixed(2)}</p>
// //             <p style="margin-bottom: 3px; font-weight: bold;"><strong>Due:</strong> ₹${receiptData.dueAmount?.toFixed(2)}</p>
// //             <p style="margin-bottom: 3px;"><strong>Status:</strong> <span style="text-transform: capitalize;">${receiptData.paymentStatus}</span></p>
// //         </div>
// //          <p style="font-size: 8px; text-align: center; margin-top: 10px; color: #6b7280;">Thank you!</p>
// //       </div>
// //     `;
// //     input.innerHTML = receiptContent;

// //     // Allow content to render
// //     await new Promise((resolve) => setTimeout(resolve, 300));

// //     try {
// //       // --- Define Paper Size & Margins in MM ---
// //       const PAPER_WIDTH_MM = 80; // Standard thermal paper width (adjust if using 58mm)
// //       const MARGIN_MM = 3;       // Margin on each side
// //       const pdfWidthMM = PAPER_WIDTH_MM - (MARGIN_MM * 2);

// //       const canvas = await html2canvas(input, {
// //         scale: 2, // Scale 2 is usually sufficient for thermal printers
// //         useCORS: true,
// //         backgroundColor: "#ffffff",
// //       });

// //       const imgData = canvas.toDataURL("image/png");
// //       // Use jsPDF's internal method to get image properties
// //       const imgProps = jsPDF.API.getImageProperties(imgData);

// //       // Calculate the required PDF height to maintain the image's aspect ratio
// //       const pdfHeightMM = (imgProps.height * pdfWidthMM) / imgProps.width;

// //       // --- Create PDF with CUSTOM dimensions ---
// //       const pdf = new jsPDF({
// //         orientation: "portrait",
// //         unit: "mm",
// //         // Use the calculated width and height for the page format
// //         format: [PAPER_WIDTH_MM, pdfHeightMM + (MARGIN_MM * 2)] // Page height includes content height + top/bottom margins
// //       });

// //       // Add the image to the PDF, positioned with margins
// //       pdf.addImage(imgData, "PNG", MARGIN_MM, MARGIN_MM, pdfWidthMM, pdfHeightMM);

// //       // Get PDF as data URL and show modal
// //       const pdfDataUrl = pdf.output("datauristring");
// //       setReceiptPDFUrl(pdfDataUrl);
// //       setShowReceiptModal(true);

// //     } catch (canvasError) {
// //         console.error("Error generating canvas for PDF:", canvasError);
// //         toast.error("Failed to generate receipt preview.");
// //     }
// //   };

// //   // --- Print Receipt ---
// //   const handlePrint = () => {
// //     if (!receiptPDFUrl) return;

// //     const iframe = document.getElementById('receipt-preview-iframe');
// //     if (iframe && iframe.contentWindow) {
// //         try {
// //             iframe.contentWindow.focus(); // Focus on the iframe
// //             iframe.contentWindow.print(); // Trigger iframe's print dialog
// //         } catch (e) {
// //             console.error("Error printing from iframe:", e);
// //             toast.info("Direct printing failed. Please use 'Download PDF' and print manually.", { autoClose: 5000 });
// //             // Optional: Fallback to opening in a new tab if iframe print fails
// //             // window.open(receiptPDFUrl, "_blank");
// //         }
// //     } else {
// //          toast.error("Preview iframe not found. Try downloading.", { autoClose: 5000 });
// //          // Optional: Fallback if iframe doesn't exist
// //          // window.open(receiptPDFUrl, "_blank");
// //     }
// //   };

// //   // --- Download Receipt ---
// //   const handleDownload = () => {
// //     if (!receiptPDFUrl) return;
// //     const link = document.createElement("a");
// //     link.href = receiptPDFUrl;
// //     // Simple timestamped filename
// //     const filename = `receipt-${Date.now()}.pdf`;
// //     link.download = filename;
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
// //   };

// //   // --- Print Existing Receipt ---
// //   const handlePrintReceipt = async (saleId) => {
// //     try {
// //       setIsFetchingReceipt(true);
// //       const token = localStorage.getItem("token");
// //       const response = await axios.get(
// //         `https://api.digitalvidyasaarthi.in/api/v1/adminRoute/receipts/${saleId}`,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       if (response.data.success && response.data.receipt) {
// //         const receiptDetails = response.data.receipt;
// //         // Find student details locally for better display name
// //         const student = students.find(s => s.studentId === receiptDetails.studentId);
// //         if (!student) {
// //             toast.warn(`Student details for ID ${receiptDetails.studentId} not found locally. Receipt may show ID only.`);
// //         }
// //         // Generate receipt using the fetched data and potentially found student details
// //         await generateReceipt(receiptDetails, student); // Pass student or null
// //         toast.success("Receipt preview ready.");
// //       } else {
// //         toast.warning(`Failed to fetch receipt details: ${response.data.message || 'Not found'}`);
// //       }
// //     } catch (error) {
// //       console.error("Error in handlePrintReceipt:", error);
// //       toast.error(`Error fetching receipt: ${error.response?.data?.message || error.message}`);
// //     } finally {
// //         setIsFetchingReceipt(false);
// //     }
// //   };

// //   // --- Render Receipt Modal ---
// //   const renderReceiptModal = () => (
// //     showReceiptModal && (
// //       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
// //         {/* Adjusted max-w for receipt-like preview */}
// //         <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] flex flex-col">
// //           <h2 className="text-xl font-semibold mb-4 text-gray-800">Receipt Preview</h2>
// //           <div className="flex-grow overflow-hidden border border-gray-200 rounded mb-4 bg-gray-50">
// //             {receiptPDFUrl ? (
// //              <>
// //               {/* Added ID to iframe */}
// //               <iframe
// //                 id="receipt-preview-iframe"
// //                 title="Receipt PDF Preview"
// //                 src={receiptPDFUrl}
// //                 className="w-full h-full min-h-[400px]" // Adjust min-h as needed
// //                 style={{ border: 'none' }}
// //               />
// //              </>
// //             ) : (
// //                 <div className="flex items-center justify-center h-full text-gray-500">Generating preview...</div>
// //             )}
// //           </div>
// //           <div className="flex flex-wrap justify-end gap-2">
// //             <button
// //               onClick={handlePrint}
// //               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 text-sm font-medium"
// //             >
// //               Print
// //             </button>
// //             <button
// //               onClick={handleDownload}
// //               className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 text-sm font-medium"
// //             >
// //               Download PDF
// //             </button>
// //             <button
// //               onClick={() => {
// //                 setShowReceiptModal(false);
// //                 setReceiptPDFUrl(""); // Clear URL on close
// //               }}
// //               className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-150 text-sm font-medium"
// //             >
// //               Close
// //             </button>
// //           </div>
// //           {/* User guidance */}
// //            <p className="text-xs text-gray-500 mt-3 text-center">
// //                 For best results with thermal printers, use 'Download PDF' and print from your system, ensuring correct paper size (e.g., 80mm) is selected in printer settings.
// //             </p>
// //         </div>
// //       </div>
// //     )
// //   );

// //   // --- Loading and Error States ---
// //   if (loading && !sales.length) { // Show loader only on initial load
// //     return (
// //       <div className="flex justify-center items-center h-64">
// //         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
// //       </div>
// //     );
// //   }

// //   if (error && !sales.length) { // Show error only if data fetch failed completely
// //     return (
// //       <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
// //         Error: {error}
// //       </div>
// //     );
// //   }

// //   // --- Main Render ---
// //   return (
// //     <div className="px-4 md:p-6">
// //       {/* Form Section */}
// //       <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
// //             {/* Left Side: Student Search, Item Select, Totals, Submit */}
// //             <div className="space-y-4">
// //                 {/* Student Search */}
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
// //                     <div className="relative" ref={searchContainerRef}>
// //                         <ReactInput
// //                             label="Student Search"
// //                             name="studentSearch"
// //                             value={searchTerm}
// //                             onChange={(e) => {
// //                                 setSearchTerm(e.target.value);
// //                                 if (e.target.value.trim() === "") {
// //                                     setSelectedStudent(null);
// //                                     setSelectedStudentDisplay("");
// //                                 }
// //                             }}
// //                             placeholder="Search Student (Name/Adm#/ID)*"
// //                             required // Visually indicate required, actual check in handleSubmit
// //                             onFocus={() => searchTerm.trim() && searchResults.length > 0 && setShowSuggestions(true)}
// //                         />
// //                         {showSuggestions && searchResults.length > 0 && (
// //                             <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
// //                                 {searchResults.map(student => (
// //                                     <div
// //                                         key={student.studentId}
// //                                         className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
// //                                         onMouseDown={(e) => {
// //                                             e.preventDefault();
// //                                             handleStudentSelect(student);
// //                                         }}
// //                                     >
// //                                         {`${student.studentName} (${student.class}-${student.section})`}
// //                                         {student.admissionNumber && <span className="text-xs text-gray-500 ml-2">[Adm: {student.admissionNumber}]</span>}
// //                                     </div>
// //                                 ))}
// //                             </div>
// //                         )}
// //                         {showSuggestions && searchTerm.trim() && searchResults.length === 0 && (
// //                             <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-2 text-sm text-gray-500">
// //                                 No students found.
// //                             </div>
// //                         )}
// //                     </div>
// //                     {/* Selected Student Display */}
// //                     <div className="h-full flex items-center">
// //                         {selectedStudentDisplay ? (
// //                             <div className="w-full px-3 py-1 border border-green-300 bg-green-50 rounded-md text-sm text-green-800">
// //                                 <span className="font-medium">Selected:</span> {selectedStudentDisplay}
// //                             </div>
// //                         ) : (
// //                             <div className="w-full px-3 py-1 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 italic">
// //                                 No student selected
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>

// //                 {/* Item Selection */}
// //                 <div className="flex items-end space-x-2">
// //                     <div className="flex-grow">
// //                         <ReactSelect
// //                             label="Item" // Label for accessibility
// //                             name="selectedItem"
// //                             value={selectedItem}
// //                             handleChange={(e) => setSelectedItem(e.target.value)}
// //                             options={itemOptions}
// //                             required={false} // Not technically required until adding
// //                         />
// //                     </div>
// //                     <button
// //                     type="button"
// //                     onClick={handleAddItem}
// //                     className="px-4 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap disabled:opacity-50"
// //                     disabled={!selectedItem || isSubmitting}
// //                     >
// //                     Add Item
// //                     </button>
// //                 </div>

// //                 {/* Totals and Payment */}
// //                 <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4">
// //                      <div className="flex items-center space-x-2">
// //                         <span className="text-lg font-semibold text-gray-700">Total:</span>
// //                         <span className="text-lg font-bold text-blue-800">₹{subtotal.toFixed(2)}</span>
// //                     </div>
// //                     <div className="flex-grow max-w-[150px]"> {/* Limit width */}
// //                         <ReactInput
// //                             label="Amount Paid"
// //                             type="number"
// //                             name="paidAmount"
// //                             value={paidAmount}
// //                             onChange={(e) => setPaidAmount(e.target.value)}
// //                             placeholder="Paid Amt"
// //                             required={false}
// //                         />
// //                     </div>
// //                     {paidAmount > 0 && subtotal > 0 && ( // Show Due only if relevant
// //                         <div className={`flex items-center space-x-1 px-2 py-0.5 rounded ${dueAmount > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
// //                             <span className={`text-sm font-medium ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>Due:</span>
// //                             <span className={`text-sm font-bold ${dueAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{dueAmount.toFixed(2)}</span>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Submit Button */}
// //                 <div className="text-center pt-2">
// //                     <button
// //                     type="button"
// //                     onClick={handleSubmit}
// //                     className={`w-full sm:w-auto px-6 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 flex items-center justify-center mx-auto ${isSubmitting || !selectedStudent || selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
// //                     disabled={isSubmitting || !selectedStudent || selectedItems.length === 0}
// //                     >
// //                     {isSubmitting ? (
// //                         <>
// //                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                             </svg>
// //                             Processing...
// //                         </>
// //                     ) : 'Create Sale & Generate Receipt'}
// //                     </button>
// //                 </div>
// //             </div>

// //             {/* Right Side: Cart Items */}
// //             <div className="border rounded-lg p-3 bg-gray-50/50 min-h-[200px]"> {/* Added min-height */}
// //                 <h3 className="text-lg font-semibold mb-2 text-gray-700">Cart Items</h3>
// //                 {selectedItems.length > 0 ? (
// //                     <div className="overflow-x-auto max-h-[400px]"> {/* Max height for scroll */}
// //                         <table className="w-full text-sm text-left text-gray-600">
// //                             <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0"> {/* Sticky header */}
// //                             <tr>
// //                                 <th scope="col" className="px-4 py-2">Item</th>
// //                                 <th scope="col" className="px-4 py-2 text-right">Unit Price</th>
// //                                 <th scope="col" className="px-4 py-2 text-center w-32">Quantity</th> {/* Fixed width */}
// //                                 <th scope="col" className="px-4 py-2 text-right">Total</th>
// //                                 <th scope="col" className="px-4 py-2 text-center">Action</th>
// //                             </tr>
// //                             </thead>
// //                             <tbody className="bg-white divide-y divide-gray-200">
// //                             {selectedItems.map((item) => (
// //                                 <tr key={item.itemId} className="hover:bg-gray-50">
// //                                     <td className="px-4 py-1 font-medium text-gray-900 whitespace-nowrap">{item.itemName}</td>
// //                                     <td className="px-4 py-1 text-right">₹{item.price.toFixed(2)}</td>
// //                                     <td className="px-4 py-1">
// //                                         <div className="flex items-center justify-center space-x-1">
// //                                             <button
// //                                                 onClick={() => handleDecreaseQuantity(item.itemId)}
// //                                                 className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-5 h-5 flex items-center justify-center text-xs font-bold disabled:opacity-50"
// //                                                 disabled={item.quantity <= 1 || isSubmitting}
// //                                                 aria-label="Decrease quantity"
// //                                             >-</button>
// //                                             <input
// //                                                 type="number"
// //                                                 value={item.quantity}
// //                                                 onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
// //                                                 className="w-10 h-6 text-center border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
// //                                                 min="1"
// //                                                 disabled={isSubmitting}
// //                                                 aria-label={`Quantity for ${item.itemName}`}
// //                                             />
// //                                             <button
// //                                                 onClick={() => handleIncreaseQuantity(item.itemId)}
// //                                                 className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-5 h-5 flex items-center justify-center text-xs font-bold disabled:opacity-50"
// //                                                 disabled={isSubmitting}
// //                                                 aria-label="Increase quantity"
// //                                             >+</button>
// //                                         </div>
// //                                     </td>
// //                                     <td className="px-4 py-1 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
// //                                     <td className="px-4 py-1 text-center">
// //                                         <button
// //                                             onClick={() => handleRemoveItem(item.itemId)}
// //                                             className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
// //                                             disabled={isSubmitting}
// //                                             aria-label="Remove item"
// //                                         >🗑️</button>
// //                                     </td>
// //                                 </tr>
// //                             ))}
// //                             </tbody>
// //                         </table>
// //                     </div>
// //                 ) : (
// //                     <div className="text-center text-gray-500 pt-10 italic">Cart is empty. Add items using the form.</div>
// //                 )}
// //             </div>
// //         </div>
// //       </div>

// //       {/* Sales History Section */}
// //       <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
// //          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales History</h2>
// //          {loading && sales.length > 0 && <p>Loading new sales...</p>} {/* Show loading indicator for updates */}
// //          {error && sales.length > 0 && <p className="text-red-500">Error loading updates: {error}</p>} {/* Show non-blocking error */}
// //         <div className="overflow-x-auto">
// //            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
// //              <thead className="bg-gray-50">
// //                <tr>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
// //                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
// //                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
// //                </tr>
// //              </thead>
// //              <tbody className="bg-white divide-y divide-gray-200">
// //                 {sales.length === 0 && !loading && ( // Show only if not loading and no sales
// //                     <tr>
// //                         <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500 italic">No sales records found.</td>
// //                     </tr>
// //                 )}
// //                {sales.map((s) => {
// //                  // Find student details for display
// //                  const student = students.find((st) => st.studentId === s.studentId);
// //                  const studentDisplay = student
// //                    ? `${student.studentName} (${student.class}-${student.section})`
// //                    : `ID: ${s.studentId}`; // Fallback to ID
// //                  return (
// //                    <tr key={s._id || s.saleId} className="hover:bg-gray-50">
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(s.date).toLocaleDateString()}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{studentDisplay}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">₹{s.totalAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">₹{s.paidAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">₹{s.dueAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center">
// //                         <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
// //                             s.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
// //                             s.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
// //                             'bg-red-100 text-red-800'
// //                         }`}>
// //                             {s.paymentStatus}
// //                         </span>
// //                      </td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
// //                        <button
// //                          onClick={() => handlePrintReceipt(s.saleId)}
// //                          className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded hover:bg-indigo-50 transition-colors"
// //                          disabled={isFetchingReceipt || isSubmitting} // Disable while any related loading
// //                          title="View & Print Receipt"
// //                        >
// //                          📄 Print
// //                        </button>
// //                      </td>
// //                    </tr>
// //                  );
// //                })}
// //              </tbody>
// //            </table>
// //         </div>
// //       </div>

// //       {/* Hidden div for html2canvas rendering */}
// //       <div className="absolute -left-[9999px] top-0" aria-hidden="true">
// //         <div ref={receiptRef}></div>
// //       </div>

// //       {/* Receipt Modal */}
// //       {renderReceiptModal()}
// //     </div>
// //   );
// // };

// // export default Sales;

// // import React, { useState, useEffect, useRef } from "react";
// // import axios from "axios";
// // import { toast } from "react-toastify";
// // import jsPDF from "jspdf";
// // import html2canvas from "html2canvas";

// // const ReactInput = ({ label, value, onChange, placeholder, type = "text", name, required, maxLength, onFocus, onBlur }) => (
// //     <div className="relative">
// //       <input
// //         id={name}
// //         name={name}
// //         type={type}
// //         value={value}
// //         onChange={onChange}
// //         placeholder={placeholder || label}
// //         required={required}
// //         maxLength={maxLength}
// //         onFocus={onFocus} // Pass down focus/blur handlers if needed
// //         onBlur={onBlur}
// //         className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
// //         autoComplete="off" // Prevent browser autocomplete from interfering
// //       />
// //     </div>
// //   );

// // const ReactSelect = ({ label, value, handleChange, options, name, required }) => (
// //     <div className="">

// //       <select
// //         id={name}
// //         name={name}
// //         value={value}
// //         onChange={handleChange}
// //         required={required}
// //         className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
// //       >
// //         <option value="" disabled>Select {label}</option>
// //         {options.map(option => (
// //           <option key={option.value} value={option.value}>
// //             {option.label}
// //           </option>
// //         ))}
// //       </select>
// //     </div>
// //   );

// // const Sales = () => {
// //   // State variables for data
// //   const [students, setStudents] = useState([]);
// //   const [items, setItems] = useState([]);
// //   const [sales, setSales] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [searchResults, setSearchResults] = useState([]); // For suggestions list
// //   const [showSuggestions, setShowSuggestions] = useState(false); // Control visibility
// //   const [selectedStudent, setSelectedStudent] = useState(null); // Store selected student object {id, name, ...} or just ID
// //   const [selectedStudentDisplay, setSelectedStudentDisplay] = useState(""); // For showing selected student name

// //   const [selectedItem, setSelectedItem] = useState("");
// //   const [selectedItems, setSelectedItems] = useState([]);
// //   const [subtotal, setSubtotal] = useState(0);
// //   const [paidAmount, setPaidAmount] = useState("");
// //   const [dueAmount, setDueAmount] = useState(0);
// //   const [loading, setLoading] = useState(true); // Overall loading
// //   const [isSubmitting, setIsSubmitting] = useState(false); // Submission loading
// //   const [isFetchingReceipt, setIsFetchingReceipt] = useState(false); // Receipt fetch loading
// //   const [error, setError] = useState(null);
// //   const [showReceiptModal, setShowReceiptModal] = useState(false);
// //   const [receiptPDFUrl, setReceiptPDFUrl] = useState("");

// //   const receiptRef = useRef();
// //   const searchContainerRef = useRef(); // Ref for the search input + suggestions container
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       // ... (keep existing fetch logic) ...
// //       try {
// //         setLoading(true);
// //         setError(null);
// //         const token = localStorage.getItem("token");
// //         if (!token) {
// //             throw new Error("Authentication token not found.");
// //         }
// //         const headers = { Authorization: `Bearer ${token}` };

// //         const [studentResponse, itemResponse, salesResponse] =
// //           await Promise.all([
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/studentparent?fetchAllStudents=true",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items",
// //               { withCredentials: true, headers }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //               { withCredentials: true, headers }
// //             ),
// //           ]);

// //         if (studentResponse.data.success) {
// //           setStudents(studentResponse.data.students.data || []);
// //         } else {
// //           throw new Error(studentResponse.data.message || "Failed to fetch students");
// //         }
// //         if (itemResponse.data.success) {
// //           setItems(itemResponse.data.listOfAllItems || []);
// //         } else {
// //             throw new Error(itemResponse.data.message || "Failed to fetch items");
// //         }
// //         if (salesResponse.data.success) {
// //           setSales(salesResponse.data.sales?.reverse() || []);
// //         } else {
// //             throw new Error(salesResponse.data.message || "Failed to fetch sales");
// //         }

// //       } catch (error) {
// //         console.error("Fetch data error:", error);
// //         const errorMessage = error.response?.data?.message || error.message || "Failed to fetch data.";
// //         toast.error(errorMessage);
// //         setError(errorMessage);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //    // --- Student Search Logic ---
// //    useEffect(() => {
// //     if (searchTerm.trim() === "") {
// //       setSearchResults([]);
// //       setShowSuggestions(false);
// //       return;
// //     }

// //     // Filter students based on search term
// //     const filtered = students.filter(s => {
// //         const term = searchTerm.toLowerCase();
// //         const nameMatch = s.studentName.toLowerCase().includes(term);
// //         const admissionMatch = s.admissionNumber ? String(s.admissionNumber).toLowerCase().includes(term) : false;
// //         const idMatch = s.studentId.toLowerCase().includes(term);
// //         return nameMatch || admissionMatch || idMatch;
// //     }).slice(0, 10); // Limit suggestions

// //     setSearchResults(filtered);
// //     setShowSuggestions(true); // Show suggestions if search term exists

// //   }, [searchTerm, students]);

// //   // --- Handle clicking outside the search suggestions ---
// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
// //         setShowSuggestions(false);
// //       }
// //     };
// //     // Add listener when suggestions are shown
// //     if (showSuggestions) {
// //       document.addEventListener("mousedown", handleClickOutside);
// //     } else {
// //       // Clean up listener
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     }
// //     // Cleanup function on component unmount
// //     return () => {
// //       document.removeEventListener("mousedown", handleClickOutside);
// //     };
// //   }, [showSuggestions]); // Re-run when showSuggestions changes

// //   // --- Handle Student Selection from Suggestions ---
// //   const handleStudentSelect = (student) => {
// //     setSelectedStudent(student); // Store the whole student object or just ID
// //     // Display format for the selected student
// //     const displayName = `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`;
// //     setSelectedStudentDisplay(displayName);
// //     setSearchTerm(student.studentName); // Optionally update search bar for confirmation
// //     setShowSuggestions(false); // Hide suggestions
// //     setSearchResults([]); // Clear results after selection
// //   };

// //   const itemOptions = items.map(item => ({
// //     value: item.itemId,
// //     label: `${item.itemName} - ₹${item.price.toFixed(2)}` // Format price
// //   }));

// //   const handleAddItem = () => {
// //     if (!selectedItem) {
// //         toast.warn("Please select an item to add.");
// //         return;
// //     }
// //     const itemToAdd = items.find((i) => i.itemId === selectedItem);
// //     if (itemToAdd) {
// //         const existingItemIndex = selectedItems.findIndex(i => i.itemId === selectedItem);
// //         if (existingItemIndex > -1) {
// //             handleIncreaseQuantity(selectedItem);
// //         } else {
// //             setSelectedItems([...selectedItems, { ...itemToAdd, quantity: 1 }]);
// //         }
// //       setSelectedItem(""); // Clear item selection after adding
// //     }
// //   };

// //   const handleQuantityChange = (itemId, quantityStr) => {
// //     const quantity = Math.max(1, parseInt(quantityStr) || 1);
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: quantity } : i
// //       )
// //     );
// //   };

// //   const handleIncreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
// //       )
// //     );
// //   };

// //   const handleDecreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId && i.quantity > 1
// //           ? { ...i, quantity: i.quantity - 1 }
// //           : i
// //       ).filter(i => !(i.itemId === itemId && i.quantity <= 1))
// //     );
// //   };

// //   const handleRemoveItem = (itemId) => {
// //     setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
// //   };

// //   // Update subtotal and due amount
// //   useEffect(() => {
// //     const calculatedSubtotal = selectedItems.reduce(
// //       (sum, item) => sum + item.price * item.quantity,
// //       0
// //     );
// //     setSubtotal(calculatedSubtotal);
// //     const paid = parseFloat(paidAmount) || 0;
// //     setDueAmount(Math.max(0, calculatedSubtotal - paid));
// //   }, [selectedItems, paidAmount]);

// //   // --- Form Submission ---
// //   const handleSubmit = async () => {
// //     // Use selectedStudent.studentId if you stored the object, or just selectedStudent if you stored the ID
// //     if (!selectedStudent || !selectedStudent.studentId) {
// //         toast.error("Please search and select a student.");
// //         return;
// //     }
// //     if (selectedItems.length === 0) {
// //         toast.error("Please add items to the sale.");
// //         return;
// //     }

// //     const saleData = {
// //       studentId: selectedStudent.studentId, // Ensure you pass the ID
// //       items: selectedItems.map((i) => ({
// //         itemId: i.itemId,
// //         quantity: i.quantity,
// //         price: i.price
// //       })),
// //       totalAmount: subtotal,
// //       paidAmount: parseFloat(paidAmount) || 0,
// //       dueAmount: dueAmount,
// //       paymentStatus: (parseFloat(paidAmount) || 0) >= subtotal ? "paid" : ((parseFloat(paidAmount) || 0) > 0 ? "partial" : "pending"),
// //     };

// //     try {
// //       setIsSubmitting(true); // Start submission loading
// //       const token = localStorage.getItem("token");
// //       const response = await axios.post(
// //         "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //         saleData,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       if (response.data.success) {
// //         const newSale = response.data.data.sale;
// //         const studentDetailsForReceipt = selectedStudent;
// //         setSales([newSale, ...sales]);
// //         setSearchTerm("");
// //         setSelectedStudent(null);
// //         setSelectedStudentDisplay("");
// //         setSelectedItems([]);
// //         setPaidAmount("");
// //         setSubtotal(0);
// //         setDueAmount(0);
// //         setSearchResults([]);
// //         setShowSuggestions(false);

// //         toast.success(response.data.message || "Sale created successfully!");
// //         if (response.data.data.receiptItems) {
// //             const receiptData = {
// //                 ...newSale,
// //                 items: response.data.data.receiptItems,
// //             };
// //             await generateReceipt(receiptData, studentDetailsForReceipt);
// //         } else {
// //              const fallbackReceiptData = {
// //                 ...newSale,
// //                 items: selectedItems.map(item => ({ // Use items from state before clearing
// //                     itemName: item.itemName,
// //                     quantity: item.quantity,
// //                     price: item.price,
// //                     total: item.price * item.quantity
// //                 })),
// //             };
// //             await generateReceipt(fallbackReceiptData, studentDetailsForReceipt);
// //             toast.info("Receipt preview generated (using cached item names).");
// //         }

// //       } else {
// //         toast.error(response.data.message || "Failed to create sale.");
// //       }
// //     } catch (error) {
// //       console.error("Submit sale error:", error);
// //       toast.error(error.response?.data?.message || "An error occurred while creating the sale.");
// //     } finally {
// //       setIsSubmitting(false); // End submission loading
// //     }
// //   };

// //   // --- Receipt Generation (jsPDF and html2canvas logic) ---
// //   // generateReceipt, handlePrint, handleDownload remain the same
// //   const generateReceipt = async (receiptData, student) => {
// //     const input = receiptRef.current;
// //     if (!input || !receiptData) return;

// //     input.innerHTML = ""; // Clear previous content

// //     // Use student object passed in
// //     const studentInfo = student
// //       ? `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`
// //       : `Student ID: ${receiptData.studentId}`;

// //     const receiptContent = `
// //       <div style="padding: 15px; font-family: sans-serif; font-size: 10px; background-color: #ffffff; width: 280px;">
// //         <h2 style="color: #111827; font-size: 14px; text-align: center; margin-bottom: 10px; font-weight: bold;">INVOICE / RECEIPT</h2>
// //         <p style="margin-bottom: 4px;"><strong>Student:</strong> ${studentInfo}</p>
// //         <p style="margin-bottom: 4px;"><strong>Sale ID:</strong> ${receiptData.saleId}</p>
// //         <p style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(receiptData.date).toLocaleString()}</p>
// //         <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px;">
// //           <thead>
// //             <tr style="background-color: #f3f4f6;">
// //               <th style="border: 1px solid #d1d5db; padding: 4px; text-align: left;">Item</th>
// //               <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Qty</th>
// //               <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">Price</th>
// //               <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">Total</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             ${(receiptData.items || [])
// //               .map(
// //                 (item) => `
// //               <tr>
// //                 <td style="border: 1px solid #d1d5db; padding: 4px;">${item.itemName || 'N/A'}</td>
// //                 <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">${item.quantity}</td>
// //                 <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">₹${item.price?.toFixed(2)}</td>
// //                 <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
// //               </tr>
// //             `
// //               )
// //               .join("")}
// //           </tbody>
// //         </table>
// //         <div style="margin-top: 10px; text-align: right;">
// //             <p style="margin-bottom: 4px;"><strong>Subtotal:</strong> ₹${receiptData.totalAmount?.toFixed(2)}</p>
// //             <p style="margin-bottom: 4px;"><strong>Paid:</strong> ₹${receiptData.paidAmount?.toFixed(2)}</p>
// //             <p style="margin-bottom: 4px; font-weight: bold;"><strong>Due:</strong> ₹${receiptData.dueAmount?.toFixed(2)}</p>
// //             <p style="margin-bottom: 4px;"><strong>Status:</strong> <span style="text-transform: capitalize;">${receiptData.paymentStatus}</span></p>
// //         </div>
// //          <p style="font-size: 8px; text-align: center; margin-top: 15px; color: #6b7280;">Thank you!</p>
// //       </div>
// //     `;
// //     input.innerHTML = receiptContent;

// //     await new Promise((resolve) => setTimeout(resolve, 300));

// //     try {
// //       const canvas = await html2canvas(input, {
// //         scale: 3,
// //         useCORS: true,
// //         backgroundColor: "#ffffff",
// //       });
// //       const imgData = canvas.toDataURL("image/png");
// //       const pdf = new jsPDF({
// //         orientation: "portrait",
// //         unit: "mm",
// //          format: "a6",
// //       });
// //       const pdfWidth = pdf.internal.pageSize.getWidth();
// //       const pdfHeight = pdf.internal.pageSize.getHeight();
// //       const imgProps = pdf.getImageProperties(imgData);
// //       const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
// //       let position = 5;
// //       pdf.addImage(imgData, "PNG", 5, position, pdfWidth - 10, Math.min(imgHeight, pdfHeight - 10) ); // Adjust height if needed

// //       const pdfDataUrl = pdf.output("datauristring");
// //       setReceiptPDFUrl(pdfDataUrl);
// //       setShowReceiptModal(true);

// //     } catch (canvasError) {
// //         console.error("Error generating canvas for PDF:", canvasError);
// //         toast.error("Failed to generate receipt preview.");
// //     }
// //   };

// //   const handlePrint = () => {
// //     if (!receiptPDFUrl) return;
// //     const printWindow = window.open(receiptPDFUrl, "_blank");
// //     printWindow.addEventListener('load', () => {
// //         printWindow.focus();
// //         printWindow.print();
// //     }, true);
// //   };

// //   const handleDownload = () => {
// //     if (!receiptPDFUrl) return;
// //     const link = document.createElement("a");
// //     link.href = receiptPDFUrl;
// //     const filename = `receipt-${Date.now()}.pdf`; // Simplified filename
// //     link.download = filename;
// //     document.body.appendChild(link);
// //     link.click();
// //     document.body.removeChild(link);
// //   };

// //   // --- Print Existing Receipt ---
// //   const handlePrintReceipt = async (saleId) => {
// //     // ... (keep existing logic, ensure student lookup happens) ...
// //     try {
// //       setIsFetchingReceipt(true); // Show loading indicator for this action
// //       const token = localStorage.getItem("token");
// //       const response = await axios.get(
// //         `https://api.digitalvidyasaarthi.in/api/v1/adminRoute/receipts/${saleId}`,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );

// //       if (response.data.success && response.data.receipt) {
// //         const receiptDetails = response.data.receipt;
// //         // Find student details locally (important for accurate name/class/etc.)
// //         const student = students.find(s => s.studentId === receiptDetails.studentId);
// //         if (!student) {
// //             toast.warn(`Student details for ID ${receiptDetails.studentId} not found locally. Receipt may show ID only.`);
// //         }
// //         await generateReceipt(receiptDetails, student); // Pass found student or null
// //         toast.success("Receipt preview ready.");
// //       } else {
// //         toast.warning(`Failed to fetch receipt details: ${response.data.message || 'Not found'}`);
// //       }
// //     } catch (error) {
// //       console.error("Error in handlePrintReceipt:", error);
// //       toast.error(`Error fetching receipt: ${error.response?.data?.message || error.message}`);
// //     } finally {
// //         setIsFetchingReceipt(false); // Hide loading indicator
// //     }
// //   };

// //   // --- Render Receipt Modal ---
// //   // renderReceiptModal remains the same
// //   const renderReceiptModal = () => (
// //     showReceiptModal && (
// //       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
// //         <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
// //           <h2 className="text-xl font-semibold mb-4 text-gray-800">Receipt Preview</h2>
// //           <div className="flex-grow overflow-hidden border border-gray-200 rounded mb-4 bg-gray-50">
// //             {receiptPDFUrl ? (
// //              <>

// //               <iframe
// //                 title="Receipt PDF Preview"
// //                 src={receiptPDFUrl}
// //                 className="w-full h-full min-h-[400px]"
// //                 style={{ border: 'none' }}
// //               />
// //              </>
// //             ) : (
// //                 <div className="flex items-center justify-center h-full text-gray-500">Generating preview...</div>
// //             )}
// //           </div>
// //           <div className="flex flex-wrap justify-end gap-2">
// //             <button
// //               onClick={handlePrint}
// //               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 text-sm font-medium"
// //             >
// //               Print
// //             </button>
// //             <button
// //               onClick={handleDownload}
// //               className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 text-sm font-medium"
// //             >
// //               Download PDF
// //             </button>
// //             <button
// //               onClick={() => setShowReceiptModal(false)}
// //               className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-150 text-sm font-medium"
// //             >
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   );

// //   // --- Loading and Error States ---
// //   if (loading && !sales.length) {
// //     return (
// //       <div className="flex justify-center items-center h-64">
// //         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
// //         Error: {error}
// //       </div>
// //     );
// //   }

// //   // --- Main Render ---
// //   return (
// //     <div className="px-4 md:p-6  ">
// //       <div className=" ">
// // <div className="grid grid-cols-2 gap-2">
// // <div>

// // <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
// //     <div className="relative mb-4" ref={searchContainerRef}>
// //         <ReactInput
// //             name="studentSearch"
// //             value={searchTerm}
// //             onChange={(e) => {
// //                 setSearchTerm(e.target.value);
// //                 // If user clears search, also clear selection
// //                 if (e.target.value.trim() === "") {
// //                     setSelectedStudent(null);
// //                     setSelectedStudentDisplay("");
// //                 }
// //             }}
// //             placeholder="Search & Select Student (Name / Adm No / ID) *"
// //             onFocus={() => searchTerm.trim() && setSearchResults.length > 0 && setShowSuggestions(true)} // Show suggestions on focus if results exist
// //         />
// //         {showSuggestions && searchResults.length > 0 && (
// //             <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto">
// //                 {searchResults.map(student => (
// //                     <div
// //                         key={student.studentId}
// //                         className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
// //                         onMouseDown={(e) => { // Use onMouseDown to fire before input's onBlur
// //                             e.preventDefault(); // Prevent input blur
// //                             handleStudentSelect(student);
// //                         }}
// //                     >
// //                         {`${student.studentName} (${student.class} - ${student.section})`}
// //                         {student.admissionNumber && <span className="text-xs text-gray-500 ml-2">[Adm: {student.admissionNumber}]</span>}
// //                     </div>
// //                 ))}
// //             </div>
// //         )}
// //          {showSuggestions && searchTerm.trim() && searchResults.length === 0 && (
// //              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1 text-sm text-gray-500">
// //                 No students found matching "{searchTerm}".
// //             </div>
// //          )}
// //     </div>

// //     <div className="">
// //         {selectedStudentDisplay ? (
// //             <div className="px-2 border border-green-300 bg-green-50 rounded-md text-sm text-green-800 py-1 flex items-center">
// //                 <span className="font-medium">Selected:</span> {selectedStudentDisplay}
// //             </div>
// //         ) : (
// //             <div className="px-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 py-1 flex items-center italic">
// //                 No student selected
// //             </div>
// //         )}
// //     </div>
// // </div>

// // <div className="flex items-end space-x-2 ite">
// //      <div className="flex-grow">
// //          <ReactSelect
// //             // label="Select Item"
// //             name="selectedItem"
// //             value={selectedItem}
// //             handleChange={(e) => setSelectedItem(e.target.value)}
// //             options={itemOptions}
// //             required={false}
// //         />
// //     </div>
// //     <button
// //       type="button"
// //       onClick={handleAddItem}
// //       className="px-4 py-1 bg-blue-500 text-white text-[12px] rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500  self-end whitespace-nowrap"
// //       disabled={!selectedItem || isSubmitting}
// //     >
// //       Add Item
// //     </button>
// // </div>
// // <div className="mt-2 flex flex-wrap gap-3">
// // <div className="flex flex-row">
// //                 <span className="text-[16px] font-bold text-gray-600 block">Total : </span>
// //                 <span className="text-[16px] font-bold text-blue-800">₹{subtotal.toFixed(2)}</span>
// //             </div>

// // <ReactInput
// //                 label="Amount Paid"
// //                 type="number"
// //                 name="paidAmount"
// //                 value={paidAmount}
// //                 onChange={(e) => setPaidAmount(e.target.value)}
// //                 placeholder="0.00"
// //                 required={false}
// //             />
// //               {paidAmount > 0 &&
// //                <div className={` flex flex-row ${dueAmount > 0 ? '' : 'bg-green-50 border border-green-200'}`}>
// //                <span className={`text-[13px] font-medium block ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}> Due :</span>
// //                <span className={`text-[13px] font-bold ${dueAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{dueAmount.toFixed(2)}</span>
// //            </div>
// //             }
// //              <div className="text-center ">
// //             <button
// //               type="button"
// //               onClick={handleSubmit}
// //               className={`px-8 py-1 bg-green-600 text-white text-[13px] font-bold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 flex items-center justify-center mx-auto ${isSubmitting || !selectedStudent || selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
// //               disabled={isSubmitting || !selectedStudent || selectedItems.length === 0}
// //             >
// //               {isSubmitting ? (
// //                   <>
// //                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                     </svg>
// //                     Processing...
// //                   </>
// //               ) : 'Create Sale & Generate Receipt'}
// //             </button>
// //         </div>
// // </div>

// //       </div>

// //      <div>
// //          {selectedItems.length > 0 && (
// //           <div className="border rounded-md p-1 bg-gray-50/50">
// //             <h2 className="text-[13px] font-semibold mb-1 text-gray-700">Cart Items</h2>
// //             <div className="overflow-x-auto shadow-md rounded-lg"> {/* Added overflow for responsiveness */}
// //       <table className="w-full text-sm text-left text-gray-500">
// //         <thead className="text-xs text-gray-700 uppercase bg-gray-100">
// //           <tr>
// //             <th scope="col" className="px-4 py-1">
// //               Item Name
// //             </th>
// //             <th scope="col" className="px-4 py-1 text-right w-24"> {/* Added width */}
// //               Unit Price
// //             </th>
// //             <th scope="col" className="px-4 py-1 text-center w-40"> {/* Added width */}
// //               Quantity
// //             </th>
// //             <th scope="col" className="px-4 py-1 text-right w-28"> {/* Added width */}
// //               Price
// //             </th>
// //             <th scope="col" className="px-4 py-1 text-center w-16"> {/* Added width */}
// //               Action
// //             </th>
// //           </tr>
// //         </thead>
// //         <tbody className="bg-white divide-y divide-gray-200">
// //           {selectedItems.length === 0 ? (
// //             <tr>
// //                 <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
// //                     No items selected.
// //                 </td>
// //             </tr>
// //           ) : (
// //             selectedItems?.map((item) => (
// //               <tr key={item.itemId} className="hover:bg-gray-50">
// //                 {/* Item Name */}
// //                 <td className="px-4 py-1 font-medium text-gray-900 whitespace-nowrap">
// //                   {item.itemName}
// //                 </td>

// //                 {/* Unit Price */}
// //                 <td className="px-4 py-1 text-right text-gray-700">
// //                   ₹{item.price.toFixed(2)}
// //                   <span className="text-xs text-gray-500 block sm:inline sm:ml-1">/unit</span> {/* Adjusted for clarity */}
// //                 </td>

// //                 {/* Quantity Controls */}
// //                 <td className="px-4 py-1">
// //                   <div className="flex items-center justify-center space-x-1"> {/* Centered controls */}
// //                     <button
// //                       onClick={() => handleDecreaseQuantity(item.itemId)}
// //                       className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-6 h-6 flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed"
// //                       disabled={item.quantity <= 1 || isSubmitting}
// //                       aria-label="Decrease quantity"
// //                     >
// //                       -
// //                     </button>
// //                     <input
// //                       type="number"
// //                       value={item.quantity}
// //                       onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
// //                       className="w-12 h-7 text-center border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
// //                       min="1"
// //                       disabled={isSubmitting}
// //                       aria-label={`Quantity for ${item.itemName}`}
// //                     />
// //                     <button
// //                       onClick={() => handleIncreaseQuantity(item.itemId)}
// //                       className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-6 h-6 flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed"
// //                       disabled={isSubmitting}
// //                       aria-label="Increase quantity"
// //                     >
// //                       +
// //                     </button>
// //                   </div>
// //                 </td>

// //                 <td className="px-4 py-1 text-right font-semibold text-gray-900">
// //                   ₹{(item.price * item.quantity).toFixed(2)}
// //                 </td>

// //                 <td className="px-4 py-1 text-center">
// //                   <button
// //                     onClick={() => handleRemoveItem(item.itemId)}
// //                     className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
// //                     disabled={isSubmitting}
// //                     aria-label="Remove item"
// //                   >

// //                      🗑️
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))
// //           )}
// //         </tbody>
// //       </table>
// //     </div>

// //           </div>
// //         )}
// //      </div>
// // </div>
// //       </div>

// //       <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mt-6">
// //          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales History</h2>
// //         <div className="overflow-x-auto">
// //            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
// //              <thead className="bg-gray-50">
// //                <tr>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
// //                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
// //                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
// //                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
// //                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
// //                </tr>
// //              </thead>
// //              <tbody className="bg-white divide-y divide-gray-200">
// //                 {sales.length === 0 && (
// //                     <tr>
// //                         <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500 italic">No sales records found.</td>
// //                     </tr>
// //                 )}
// //                {sales?.map((s) => {
// //                  const student = students.find((st) => st.studentId === s.studentId);
// //                  const studentDisplay = student
// //                    ? `${student.studentName} (${student.class}-${student.section})`
// //                    : s.studentId;
// //                  return (
// //                    <tr key={s._id || s.saleId} className="hover:bg-gray-50">
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(s.date).toLocaleDateString()}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{studentDisplay}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">₹{s.totalAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">₹{s.paidAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">₹{s.dueAmount.toFixed(2)}</td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center">
// //                         <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
// //                             s.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
// //                             s.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
// //                             'bg-red-100 text-red-800'
// //                         }`}>
// //                             {s.paymentStatus}
// //                         </span>
// //                      </td>
// //                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
// //                        <button
// //                          onClick={() => handlePrintReceipt(s.saleId)}
// //                          className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded hover:bg-indigo-50"
// //                          disabled={isFetchingReceipt || isSubmitting} // Disable while any loading
// //                          title="Print Receipt"
// //                        >
// //                          📄 Print
// //                        </button>
// //                      </td>
// //                    </tr>
// //                  );
// //                })}
// //              </tbody>
// //            </table>
// //         </div>
// //       </div>

// //       <div className="absolute -left-[9999px] top-0" aria-hidden="true">
// //         <div ref={receiptRef}></div>
// //       </div>
// //       {renderReceiptModal()}
// //     </div>
// //   );
// // };

// // export default Sales;

// // // src/ADMINDASHBOARD/Inventory/Sales.jsx
// // import React, { useState, useEffect, useRef } from "react";
// // import axios from "axios";
// // import { toast } from "react-toastify";
// // import jsPDF from "jspdf";
// // import html2canvas from "html2canvas";
// // import {
// //   Box,
// //   Card,
// //   CardContent,
// //   Typography,
// //   Stack,
// //   Button,
// //   TextField,
// //   Select,
// //   MenuItem,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableRow,
// //   CircularProgress,
// //   IconButton,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// // } from "@mui/material";
// // import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
// // import DeleteIcon from "@mui/icons-material/Delete";
// // import ReceiptIcon from "@mui/icons-material/Receipt";
// // import RemoveIcon from "@mui/icons-material/Remove";
// // import AddIcon from "@mui/icons-material/Add";
// // import PrintIcon from "@mui/icons-material/Print";
// // import { motion } from "framer-motion";
// // import theme from "../../theme";
// // import { ThemeProvider } from "@mui/material/styles";

// // const Sales = () => {
// //   // State variables for data
// //   const [students, setStudents] = useState([]);
// //   const [items, setItems] = useState([]);
// //   const [sales, setSales] = useState([]);
// //   const [selectedStudent, setSelectedStudent] = useState("");
// //   const [selectedItem, setSelectedItem] = useState("");
// //   const [selectedItems, setSelectedItems] = useState([]);
// //   const [subtotal, setSubtotal] = useState(0);
// //   const [paidAmount, setPaidAmount] = useState("");
// //   const [dueAmount, setDueAmount] = useState(0);
// //   const [classFilter, setClassFilter] = useState("");
// //   const [sectionFilter, setSectionFilter] = useState("");
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   // States for receipt preview modal
// //   const [showReceiptModal, setShowReceiptModal] = useState(false);
// //   const [receiptPDFUrl, setReceiptPDFUrl] = useState("");

// //   // Ref for receipt capture container
// //   const receiptRef = useRef();

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
// //         const [studentResponse, itemResponse, salesResponse] =
// //           await Promise.all([
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/studentparent?fetchAllStudents=true",
// //               {
// //                 withCredentials: true,
// //                 headers: {
// //                   Authorization: `Bearer ${localStorage.getItem("token")}`,
// //                 },
// //               }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items",
// //               {
// //                 withCredentials: true,
// //                 headers: {
// //                   Authorization: `Bearer ${localStorage.getItem("token")}`,
// //                 },
// //               }
// //             ),
// //             axios.get(
// //               "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //               {
// //                 withCredentials: true,
// //                 headers: {
// //                   Authorization: `Bearer ${localStorage.getItem("token")}`,
// //                 },
// //               }
// //             ),
// //           ]);

// //         if (studentResponse.data.success)
// //           setStudents(studentResponse.data.students.data || []);
// //         if (itemResponse.data.success)
// //           setItems(itemResponse.data.listOfAllItems || []);
// //         if (salesResponse.data.success)
// //           setSales(salesResponse.data.sales || []);
// //       } catch (error) {
// //         toast.error("Failed to fetch data.");
// //         setError(error.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   const filteredStudents = students.filter(
// //     (s) =>
// //       (!classFilter || s.class === classFilter) &&
// //       (!sectionFilter || s.section === sectionFilter)
// //   );

// //   const handleAddItem = () => {
// //     const item = items.find((i) => i.itemId === selectedItem);
// //     if (item) {
// //       setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
// //       setSelectedItem("");
// //     }
// //   };

// //   const handleQuantityChange = (itemId, quantity) => {
// //     const newQuantity = Math.max(1, parseInt(quantity) || 1);
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: newQuantity } : i
// //       )
// //     );
// //   };

// //   const handleIncreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
// //       )
// //     );
// //   };

// //   const handleDecreaseQuantity = (itemId) => {
// //     setSelectedItems(
// //       selectedItems.map((i) =>
// //         i.itemId === itemId && i.quantity > 1
// //           ? { ...i, quantity: i.quantity - 1 }
// //           : i
// //       )
// //     );
// //   };

// //   const handleRemoveItem = (itemId) => {
// //     setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
// //   };

// //   useEffect(() => {
// //     const calculatedSubtotal = selectedItems.reduce(
// //       (sum, item) => sum + item.price * item.quantity,
// //       0
// //     );
// //     setSubtotal(calculatedSubtotal);
// //     const paid = parseFloat(paidAmount) || 0;
// //     setDueAmount(Math.max(0, calculatedSubtotal - paid));
// //   }, [selectedItems, paidAmount]);

// //   const handleSubmit = async () => {
// //     const saleData = {
// //       studentId: selectedStudent,
// //       items: selectedItems.map((i) => ({
// //         itemId: i.itemId,
// //         quantity: i.quantity,
// //       })),
// //       totalAmount: subtotal,
// //       paidAmount: parseFloat(paidAmount) || 0,
// //       dueAmount: dueAmount,
// //       paymentStatus: parseFloat(paidAmount) >= subtotal ? "paid" : "pending",
// //     };
// //     try {
// //       const response = await axios.post(
// //         "https://api.digitalvidyasaarthi.in/api/v1/adminRoute/sales",
// //         saleData,
// //         {
// //           withCredentials: true,
// //           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
// //         }
// //       );
// //       if (response.data.success) {
// //         // Add new sale to sales state
// //         setSales([...sales, response.data.data.sale]);
// //         // If the receipt data is returned, we can open the modal preview
// //         if (response.data.receipt) {
// //           // Also update student details for the receipt using the local sales state.
// //           // Find the new sale record by saleId:
// //           const newSale = response.data.data.sale;
// //           const student = students.find(
// //             (s) => s.studentId === newSale.studentId
// //           );
// //           await generateReceipt(response.data.receipt, student);
// //         } else {
// //           toast.warning("Receipt generation failed.");
// //         }
// //         setSelectedStudent("");
// //         setSelectedItems([]);
// //         setPaidAmount("");
// //         toast.success(response.data.message);
// //       } else {
// //         toast.error(response.data.message || "Failed to create sale.");
// //       }
// //     } catch (error) {
// //       toast.error(error.response?.data?.message || "Failed to create sale.");
// //     }
// //   };

// //   // Modify generateReceipt to accept the receipt data and student record;
// //   // Instead of downloading the PDF immediately, we generate a PDF data URL and set state
// //   const generateReceipt = async (receiptData, student) => {
// //     const input = receiptRef.current;
// //     input.innerHTML = ""; // Clear previous content
// //     // Use student details if found, otherwise fallback to receiptData.studentName
// //     const studentInfo = student
// //       ? `${student.studentName} (${student.class} - ${student.section})`
// //       : receiptData.studentName;
// //     const receiptContent = `
// //       <div style="padding: 10px; font-size: 10px; background-color: #ffffff;">
// //         <h2 style="color: #2c3e50; font-size: 14px; text-align: center;">Receipt</h2>
// //         <p><strong>Student:</strong> ${studentInfo}</p>
// //         <p><strong>Sale ID:</strong> ${receiptData.saleId}</p>
// //         <p><strong>Date:</strong> ${new Date(
// //           receiptData.date
// //         ).toLocaleDateString()}</p>
// //         <table style="width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 10px;">
// //           <thead>
// //             <tr style="background-color: #ecf0f1;">
// //               <th style="border: 1px solid #ddd; padding: 4px;">Item</th>
// //               <th style="border: 1px solid #ddd; padding: 4px;">Qty</th>
// //               <th style="border: 1px solid #ddd; padding: 4px;">Price</th>
// //               <th style="border: 1px solid #ddd; padding: 4px;">Total</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             ${receiptData.items
// //               .map(
// //                 (item) => `
// //               <tr>
// //                 <td style="border: 1px solid #ddd; padding: 4px;">${item.itemName}</td>
// //                 <td style="border: 1px solid #ddd; padding: 4px;">${item.quantity}</td>
// //                 <td style="border: 1px solid #ddd; padding: 4px;">₹${item.price}</td>
// //                 <td style="border: 1px solid #ddd; padding: 4px;">₹${item.total}</td>
// //               </tr>
// //             `
// //               )
// //               .join("")}
// //           </tbody>
// //         </table>
// //         <p><strong>Subtotal:</strong> ₹${receiptData.totalAmount}</p>
// //         <p><strong>Paid:</strong> ₹${receiptData.paidAmount}</p>
// //         <p><strong>Due:</strong> ₹${receiptData.dueAmount}</p>
// //         <p><strong>Status:</strong> ${receiptData.paymentStatus}</p>
// //       </div>
// //     `;
// //     input.innerHTML = receiptContent;

// //     // Wait briefly so that the content is rendered. Note: Use an offscreen container.
// //     await new Promise((resolve) => setTimeout(resolve, 200));

// //     // Capture the receipt to a canvas with a white background
// //     const canvas = await html2canvas(input, {
// //       scale: 2,
// //       useCORS: true,
// //       backgroundColor: "#ffffff",
// //     });

// //     const imgData = canvas.toDataURL("image/png");

// //     // Generate PDF using jsPDF
// //     const pdf = new jsPDF({
// //       orientation: "portrait",
// //       unit: "mm",
// //       format: "a6",
// //     });
// //     const imgProps = pdf.getImageProperties(imgData);
// //     const pdfWidth = pdf.internal.pageSize.getWidth();
// //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
// //     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

// //     // Instead of auto-downloading, get PDF as data URL and show preview modal
// //     const pdfDataUrl = pdf.output("datauristring");
// //     setReceiptPDFUrl(pdfDataUrl);
// //     setShowReceiptModal(true);
// //   };

// //   // Function to handle printing from the modal
// //   const handlePrint = () => {
// //     // Open the PDF in a new window and trigger print
// //     const printWindow = window.open(receiptPDFUrl, "_blank");
// //     printWindow.focus();
// //     printWindow.print();
// //   };

// //   // Function to handle downloading the PDF from the modal
// //   const handleDownload = () => {
// //     // Create a temporary link and trigger download
// //     const link = document.createElement("a");
// //     link.href = receiptPDFUrl;
// //     link.download = "receipt.pdf";
// //     link.click();
// //   };

// //   // Modified receipt modal render using MUI Dialog
// //   const renderReceiptModal = () => (
// //     <Dialog
// //       open={showReceiptModal}
// //       onClose={() => setShowReceiptModal(false)}
// //       fullWidth
// //       maxWidth="sm"
// //     >
// //       <DialogTitle>Receipt Preview</DialogTitle>
// //       <DialogContent dividers>
// //         {/* Display PDF using an iframe */}
// //         {receiptPDFUrl && (
// //           <iframe
// //             title="Receipt PDF Preview"
// //             src={receiptPDFUrl}
// //             style={{ width: "100%", height: "400px", border: "none" }}
// //           />
// //         )}
// //       </DialogContent>
// //       <DialogActions>
// //         <Button onClick={handlePrint} color="primary" variant="outlined">
// //           Print
// //         </Button>
// //         <Button onClick={handleDownload} color="primary" variant="contained">
// //           Download
// //         </Button>
// //         <Button onClick={() => setShowReceiptModal(false)} color="secondary">
// //           Close
// //         </Button>
// //       </DialogActions>
// //     </Dialog>
// //   );

// //   // Function for printing receipt based on saleId
// //   const handlePrintReceipt = async (saleId) => {
// //     try {
// //       // Find the sale record from the sales state
// //       const saleRecord = sales.find((s) => s.saleId === saleId);
// //       if (!saleRecord) {
// //         toast.error("Sale record not found.");
// //         return;
// //       }
// //       // Retrieve receipt details from the API
// //       const response = await axios.get(
// //         `https://api.digitalvidyasaarthi.in/api/v1/adminRoute/receipts/${saleId}`,
// //         {
// //           withCredentials: true,
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("token")}`,
// //           },
// //         }
// //       );
// //       if (response.data.success && response.data.receipt) {
// //         // Find student data for this sale from state
// //         const student = students.find(
// //           (s) => s.studentId === saleRecord.studentId
// //         );
// //         await generateReceipt(response.data.receipt, student);
// //         toast.success("Receipt preview generated.");
// //       } else {
// //         toast.warning("Failed to generate receipt: " + response.data.message);
// //       }
// //     } catch (error) {
// //       console.error("Error in handlePrintReceipt:", error);
// //       toast.error("Error generating receipt: " + error.message);
// //     }
// //   };

// //   if (loading)
// //     return (
// //       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
// //         <CircularProgress />
// //       </Box>
// //     );
// //   if (error)
// //     return (
// //       <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
// //         Error: {error}
// //       </Typography>
// //     );

// //   return (
// //     <ThemeProvider theme={theme}>
// //       <Box
// //         p={2}
// //         sx={{
// //           backgroundColor: "#fff",
// //           borderRadius: 2,
// //           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// //         }}
// //       >
// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.5 }}
// //         >
// //           <Card sx={{ p: 2 }}>
// //             <CardContent>
// //               <Typography variant="h5" gutterBottom>
// //                 Sales Management
// //               </Typography>
// //               <Stack spacing={2}>
// //                 <Stack direction="row" spacing={2}>
// //                   <Select
// //                     value={classFilter}
// //                     onChange={(e) => setClassFilter(e.target.value)}
// //                     displayEmpty
// //                     fullWidth
// //                   >
// //                     <MenuItem value="">Filter by Class</MenuItem>
// //                     {[...new Set(students.map((s) => s.class))].map((cls) => (
// //                       <MenuItem key={cls} value={cls}>
// //                         {cls}
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                   <Select
// //                     value={sectionFilter}
// //                     onChange={(e) => setSectionFilter(e.target.value)}
// //                     displayEmpty
// //                     fullWidth
// //                   >
// //                     <MenuItem value="">Filter by Section</MenuItem>
// //                     {[...new Set(students.map((s) => s.section))].map((sec) => (
// //                       <MenuItem key={sec} value={sec}>
// //                         {sec}
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                 </Stack>
// //                 <Select
// //                   value={selectedStudent}
// //                   onChange={(e) => setSelectedStudent(e.target.value)}
// //                   displayEmpty
// //                   fullWidth
// //                 >
// //                   <MenuItem value="">Select Student</MenuItem>
// //                   {filteredStudents.map((s) => (
// //                     <MenuItem key={s.studentId} value={s.studentId}>
// //                       {s.studentName} ({s.class} - {s.section})
// //                     </MenuItem>
// //                   ))}
// //                 </Select>
// //                 <Stack direction="row" spacing={1} alignItems="center">
// //                   <Select
// //                     value={selectedItem}
// //                     onChange={(e) => setSelectedItem(e.target.value)}
// //                     displayEmpty
// //                     fullWidth
// //                   >
// //                     <MenuItem value="">Select Item</MenuItem>
// //                     {items.map((item) => (
// //                       <MenuItem key={item.itemId} value={item.itemId}>
// //                         {item.itemName} - ₹{item.price}
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                   <Button
// //                     variant="contained"
// //                     onClick={handleAddItem}
// //                     startIcon={<AddShoppingCartIcon />}
// //                   >
// //                     Add
// //                   </Button>
// //                 </Stack>
// //                 {selectedItems.map((item) => (
// //                   <Stack
// //                     key={item.itemId}
// //                     direction="row"
// //                     alignItems="center"
// //                     spacing={1}
// //                   >
// //                     <Typography>{item.itemName}</Typography>
// //                     <IconButton
// //                       onClick={() => handleDecreaseQuantity(item.itemId)}
// //                     >
// //                       <RemoveIcon />
// //                     </IconButton>
// //                     <TextField
// //                       type="number"
// //                       value={item.quantity}
// //                       onChange={(e) =>
// //                         handleQuantityChange(item.itemId, e.target.value)
// //                       }
// //                       size="small"
// //                       sx={{ width: 60 }}
// //                     />
// //                     <IconButton
// //                       onClick={() => handleIncreaseQuantity(item.itemId)}
// //                     >
// //                       <AddIcon />
// //                     </IconButton>
// //                     <Typography>₹{item.price * item.quantity}</Typography>
// //                     <IconButton onClick={() => handleRemoveItem(item.itemId)}>
// //                       <DeleteIcon />
// //                     </IconButton>
// //                   </Stack>
// //                 ))}
// //                 <Typography variant="h6">Subtotal: ₹{subtotal}</Typography>
// //                 <TextField
// //                   type="number"
// //                   value={paidAmount}
// //                   onChange={(e) => setPaidAmount(e.target.value)}
// //                   placeholder="Amount Paid"
// //                   variant="outlined"
// //                   size="small"
// //                 />
// //                 <Typography>Due: ₹{dueAmount}</Typography>
// //                 <Button
// //                   variant="contained"
// //                   onClick={handleSubmit}
// //                   startIcon={<ReceiptIcon />}
// //                 >
// //                   Create Sale
// //                 </Button>
// //               </Stack>
// //             </CardContent>
// //           </Card>
// //         </motion.div>
// //         <Table sx={{ mt: 2 }}>
// //           <TableHead>
// //             <TableRow>
// //               <TableCell>Sale ID</TableCell>
// //               <TableCell>Date</TableCell>
// //               <TableCell>Student</TableCell>
// //               <TableCell>Total</TableCell>
// //               <TableCell>Paid</TableCell>
// //               <TableCell>Due</TableCell>
// //               <TableCell>Status</TableCell>
// //               <TableCell>Action</TableCell>
// //             </TableRow>
// //           </TableHead>
// //           <TableBody>
// //             {sales.map((s) => {
// //               // Lookup student details from local state using sale.studentId
// //               const student = students.find(
// //                 (st) => st.studentId === s.studentId
// //               );
// //               const studentDisplay = student
// //                 ? `${student.studentName} (${student.class} - ${student.section})`
// //                 : "Unknown";
// //               return (
// //                 <TableRow key={s._id}>
// //                   <TableCell>{s.saleId}</TableCell>
// //                   <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
// //                   <TableCell>{studentDisplay}</TableCell>
// //                   <TableCell>₹{s.totalAmount}</TableCell>
// //                   <TableCell>₹{s.paidAmount}</TableCell>
// //                   <TableCell>₹{s.dueAmount}</TableCell>
// //                   <TableCell>{s.paymentStatus}</TableCell>
// //                   <TableCell>
// //                     <IconButton
// //                       color="primary"
// //                       onClick={() => handlePrintReceipt(s.saleId)}
// //                     >
// //                       <PrintIcon />
// //                     </IconButton>
// //                   </TableCell>
// //                 </TableRow>
// //               );
// //             })}
// //           </TableBody>
// //         </Table>
// //         {/* Offscreen container for receipt generation */}
// //         <Box sx={{ position: "absolute", left: "-10000px", top: 0 }}>
// //           <Box ref={receiptRef} />
// //         </Box>
// //         {/* Receipt Preview Modal */}
// //         {renderReceiptModal()}
// //       </Box>
// //     </ThemeProvider>
// //   );
// // };

// // export default Sales;
