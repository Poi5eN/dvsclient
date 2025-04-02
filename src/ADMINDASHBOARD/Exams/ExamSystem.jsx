import React from "react";
import { TabsDefault } from "../../Dynamic/TabsDefault";
import CreateExam from "./CreateExam";
import ViewExam from "./AllExams/ViewExam";
import AdmitCardUi from "./AllExams/AdmidCardUi";
import ReportCard from "./ReportCard";

const ExamSystem = () => {
  const Titletabs = [
    {
      label: "Create Exam",
      value: "exam",
      color: "#e91e63",
      desc: <CreateExam />,
    },
    {
      label: "View Exam",
      value: "view",
      url: "/admin/viewExam",
      color: "#f9a825",
      desc: <ViewExam />,
    },
    {
      label: "Admit Card",
      value: "admitcard",
      color: "#1e88e5",
      desc: <AdmitCardUi />,
    },
    {
      label: "Report Card",
      value: "reportcard",
      color: "#00838f",
      desc: <ReportCard />,
    },
    // {
    //   label: "Add Dues",
    //   value: "addDues",
    //   color: "#f9a825",
    // //   desc: <AddDues />,
    // },
  ];
  return (
    <>
      <TabsDefault Titletabs={Titletabs} />
    </>
  );
};

export default ExamSystem;
