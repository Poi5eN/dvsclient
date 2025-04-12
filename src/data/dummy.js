import React from "react";
import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import { FaIdCard } from "react-icons/fa6"
import { PiExamFill } from "react-icons/pi";
import { ImBookmarks } from "react-icons/im";
import { FaCertificate } from "react-icons/fa6";
import { FaWpforms } from "react-icons/fa6";
import { FaArrowDownUpAcrossLine } from "react-icons/fa6";

import {
  BsPersonFillAdd,
} from "react-icons/bs";
import { BiSolidStoreAlt } from "react-icons/bi";
import { MdAccountBalanceWallet, MdGroups3, MdWork} from "react-icons/md";

import { ImManWoman } from "react-icons/im";
import { PiStudentFill, PiPiggyBankFill } from "react-icons/pi";
import {
  GiTeacher,
  GiTakeMyMoney,
  GiBookshelf,
 
} from "react-icons/gi";

import { MdOutlineAppRegistration } from "react-icons/md";
export const LinePrimaryXAxis = {
  valueType: "DateTime",
  labelFormat: "y",
  intervalType: "Years",
  edgeLabelPlacement: "Shift",
  majorGridLines: { width: 0 },
  background: "white",
};

export const LinePrimaryYAxis = {
  labelFormat: "{value}%",
  rangePadding: "None",
  minimum: 0,
  maximum: 100,
  interval: 20,
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
};


export const links = [
  { name: 'Registration', link: 'registration' ,icon: <MdOutlineAppRegistration />},
  { name: 'Admission', link: 'admission' ,icon: <BsPersonFillAdd />},
  { name: 'Student', link: 'allstudent' ,icon: <PiStudentFill />},
  // { name: 'Fees', link: 'fees' ,icon: <PiStudentFill />},
  // { name: 'Create fee', link: 'create-fees' ,icon: <PiStudentFill />},

  {
      name: 'Fees System',
      id :2,
      icon: <GiTakeMyMoney />,
      children: [
          { name: 'Create fee', link: 'create-fees',id :22 , icon: <GiTakeMyMoney />,},
          { name: 'Fee history', link: 'feehistory' ,id :23 , icon: <GiTakeMyMoney />,},
          { name: 'Student History', link: 'StudentHistory' ,id :23 , icon: <GiTakeMyMoney />,},
          // { name: 'Late Fine', link: 'lateFine' ,id :23 , icon: <GiTakeMyMoney />,},
          // { name: 'Specific Fee', link: 'specificFee' ,id :23 , icon: <GiTakeMyMoney />,},
          
      ],
  },
  {
      name: 'Set Fees',
      id :2,
      icon: <GiTakeMyMoney />,
      children: [
          { name: 'Classwise', link: 'classwise',id :22 , icon: <GiTakeMyMoney />,},
          { name: 'Additional', link: 'additional' ,id :23 , icon: <GiTakeMyMoney />,},
          { name: 'Add Dues', link: 'add-dues' ,id :23 , icon: <GiTakeMyMoney />,},
          { name: 'Late Fine', link: 'lateFine' ,id :23 , icon: <GiTakeMyMoney />,},
          { name: 'Specific Fee', link: 'specificFee' ,id :23 , icon: <GiTakeMyMoney />,},
          { name: 'Dues Status', link: 'dues-status' ,id :23 , icon: <GiTakeMyMoney />,},
          
      ],
  },
  // { name: 'Dues Status', link: 'dues-status' ,icon: <PiStudentFill />},
  // { name: 'Fees Payment', link: 'checkfee' ,icon: <GiTakeMyMoney />},
  {
    name: 'Classes',
    icon: <MdGroups3 />,
    link: 'classes',

},
  
  {
      name: 'Teachers',
      icon: <GiTeacher />,
      children: [
          { name: 'All Teachers', link: 'allteachers' , icon: <GiTeacher />,},
          { name: 'Payment', link: 'payment' ,icon: <GiTakeMyMoney />},
         
      ],
  },

  {
      name: 'Parents',
      icon: <ImManWoman />,
      children: [
          { name: 'All Parents', link: 'allparents', icon: <ImManWoman />, },
          { name: 'Fees Status', link: 'feestatus', icon: <GiTakeMyMoney />, },
      ],
  },
//   {
//     name: 'Exam System',
//     icon: <MdGroups3 />,
//     link: 'exam-system',

// },
  {
      name: 'Account',
      icon: <MdAccountBalanceWallet />,
      children: [
          { name: 'Income', link: 'income',   icon: <MdAccountBalanceWallet />, },
          { name: 'Expenditure', link: 'expenditure',   icon: <MdAccountBalanceWallet />, },
      ],
  },
  {
      name: 'Inventory',
      icon: <BiSolidStoreAlt />,
      children: [
          // { name: 'Records', link: 'records' },
          { name: 'Stocks', link: 'stocks' },
          { name: 'Sales', link: 'sales' }, 
        
      ],
  },
  {
      name: 'Library',
      icon: <GiBookshelf />,
      children: [
          { name: 'Books', link: 'books',icon: <GiBookshelf />, },
          { name: 'Issued', link: 'issued',icon: <GiBookshelf />, },
      ],
  },

  
  {
      name: 'Employee',
      icon: <MdWork />,
      children: [
          { name: 'Staff', link: 'staff' },
          { name: 'Wages', link: 'wages' },
      ],
  },
  {
      name: 'Exam System',
      icon: <ImBookmarks />,
      
      children: [
          // { name: 'Marks', link: 'results' },
          { name: 'Create Exam', link: 'createexam' },
          { name: 'Report Card', link: 'report' },
          { name: 'Edit Report ', link: 'editreport' },
          { name: 'View Marks ', link: 'viewmarks' },
          { name: 'Admit Card', link: 'admitcard' },

      ],
  },
  // {
  //     name: 'Curriculum',
  //     icon: <PiExamFill />,
  //     children: [
  //         { name: 'Exam', link: 'allexam' },
  //         { name: 'Syllabus', link: 'curriculum' },
  //     ],
  // },

 
  
//   {
//     name: 'Certificate',
//     icon: <FaCertificate />,
//     children: [
//         { name: 'Leaving Certificate', link: 'leavingcertificate' },
//         // { name: 'Syllabus', link: 'curriculum' },
//     ],
// },
// { name: 'ID Card', link: 'idcard' ,icon: <FaIdCard />},
// { name: 'Udise', link: 'udise' ,icon: <FaIdCard />},
// { name: 'Admit Card', link: 'admitcards' ,icon: <BsFillCreditCard2FrontFill />},
// { name: 'All Form', link: 'allforms' ,icon: <FaWpforms />},
{
  name: 'Promotion',
  icon: <FaArrowDownUpAcrossLine />, link: 'promotion'

},
{
  name: 'UserDetails',
  icon: <FaArrowDownUpAcrossLine />, link: 'userdetails'

},
// {
//   name: 'Testing',
//   icon: <FaArrowDownUpAcrossLine />, link: 'testing'

// },
// {
//   name: 'Admit Design',
//   icon: <FaArrowDownUpAcrossLine />, link: 'admitdesign'

// },
// {
//   name: 'Admit UI',
//   icon: <FaArrowDownUpAcrossLine />, link: 'newcard'

// },

];


export const Studentlinks = [
  {
    title: "Student Dashboard",
    links: [


      {
        id: "2",
        name: "results",
        icon: <GiTeacher />,
        route: "student/results",
      },
      {
        id: "3",

        name: "timeTable",
        icon: <PiStudentFill />,
        route: "student/timeTable",
      },
      {
        id: "4",

        name: "Assigments",
        icon: <ImManWoman />,
        route: "student/assigments",
      },
      {
        id: "5",

        name: "Study Material",
        icon: <PiPiggyBankFill />,
        route: "student/StudyMaterial",
      },
      {
        id: "6",

        name: "syllabus",
        icon: <BiSolidStoreAlt />,
        route: "student/syllabus",
      },
      {
        id: "7",

        name: "exams",
        icon: <BiSolidStoreAlt />,
        route: "student/exams",
      },
      {
        id: "8",

        name: "admit card",
        icon: <BiSolidStoreAlt />,
        route: "student/admitcard",
      },
      {
        id: "9",
        name: "Books",
        icon: <MdWork />,
        route: "student/issuedBooks",
      },
    ],
  },
];
export const Teacherslinks = [
  {
    title: "Teacher Dashboard",
    links: [
      {
        id: "1",
        name: "Dashboard",
        icon: <GiTakeMyMoney />,
        route: "teacher",
      },
      {
        id: "1",
        name: "MyStudents",
        icon: <GiTakeMyMoney />,
        route: "teacher/mystudents",
      },
      {
        id: "2",
        name: "Assignments",
        icon: <GiTeacher />,
        route: "teacher/assignments",
      },

      {
        id: "4",

        name: "Attendance",
        icon: <ImManWoman />,
        route: "teacher/attendance",
      },
      {
        id: "5",

        name: "lectures",
        icon: <PiPiggyBankFill />,
        route: "teacher/lectures",
      },
      {
        id: "6",

        name: "curriculum",
        icon: <BiSolidStoreAlt />,
        route: "teacher/curriculum",
      },
      {
        id: "7",

        name: "study Material",
        icon: <BiSolidStoreAlt />,
        route: "teacher/study",
      },
      {
        id: "8",

        name: "Exams",
        icon: <BiSolidStoreAlt />,
        route: "teacher/exams",
      },
      // {
      //   id: "8",

      //   name: "Admit Card",
      //   icon: <BiSolidStoreAlt />,
      //   route: "teacher/admitcard",
      // },
      {
        id: "8",

        name: "Allot Marks",
        icon: <BiSolidStoreAlt />,
        route: "teacher/allotmaks",
      },
      {
        id: "8",

        name: "Students Marks",
        icon: <BiSolidStoreAlt />,
        route: "teacher/studentsmaks",
      },
      {
        id: "8",

        name: "coScholasticMarks",
        icon: <BiSolidStoreAlt />,
        route: "teacher/coScholasticMarks",
      },
      // {
      //   id: "8",

      //   name: "Reports Card",
      //   icon: <BiSolidStoreAlt />,
      //   route: "teacher/reportscard",
      // },
      {
        id: "9",

        name: "About",
        icon: <BiSolidStoreAlt />,
        route: "teacher/AboutTeacher",
      },

    ],
  },
];
export const Parentslinks = [
  {
    title: "Parents Dashboard",
    links: [
      {
        id: "1",
        name: "mykids",
        icon: <GiTakeMyMoney />,
        route: "parent/mykids",
      },
   
      {
        id: "2",

        name: "results",
        icon: <PiStudentFill />,
        route: "parent/results",
      },
   
      {
        id: "3",

        name: "expenses",
        icon: <PiPiggyBankFill />,
        route: "parent/expenses",
      },
      {
        id: "4",

        name: "curriculum",
        icon: <BiSolidStoreAlt />,
        route: "parent/curriculum",
      },
      {
        id: "5",

        name: "exams",
        icon: <BiSolidStoreAlt />,
        route: "parent/exams",
      },
      {
        id: "6",

        name: "fees",
        icon: <BiSolidStoreAlt />,
        route: "parent/fees",
      },
      {
        id: "7",

        name: "queries",
        icon: <BiSolidStoreAlt />,
        route: "parent/queries",
      },
    ],
  },
];


export const themeColors = [
  {
    name: "blue-theme",
    color: "#01579b",
    // color: "#1A97F5",
  },
  {
    name: "green-theme",
    color: "#03C9D7",
  },
  {
    name: "purple-theme",
    color: "#7352FF",
  },
  {
    name: "red-theme",
    color: "#FF5C8E",
  },
  {
    name: "indigo-theme",
    color: "#1E4DB7",
  },
  {
    color: "#FB9678",
    name: "orange-theme",
  },
  {
    color: "#37474f",
    name: "gray-theme",
  },
 
];

// export const userProfileData = [
//   {
//     icon: <BsCurrencyDollar />,
//     title: "My Profile",
//     desc: "Account Settings",
//     iconColor: "#03C9D7",
//     iconBg: "#E5FAFB",
//   },
//   {
//     icon: <BsShield />,
//     title: "My Inbox",
//     desc: "Messages & Emails",
//     iconColor: "rgb(0, 194, 146)",
//     iconBg: "rgb(235, 250, 242)",
//   },
//   {
//     icon: <FiCreditCard />,
//     title: "My Tasks",
//     desc: "To-do and Daily Tasks",
//     iconColor: "rgb(255, 244, 229)",
//     iconBg: "rgb(254, 201, 15)",
//   },
// ];

// export const ordersGrid = [
//   {
//     headerText: "Image",
//     template: gridOrderImage,
//     textAlign: "Center",
//     width: "120",
//   },
//   {
//     field: "OrderItems",
//     headerText: "Item",
//     width: "150",
//     editType: "dropdownedit",
//     textAlign: "Center",
//   },
//   {
//     field: "CustomerName",
//     headerText: "Customer Name",
//     width: "150",
//     textAlign: "Center",
//   },
//   {
//     field: "TotalAmount",
//     headerText: "Total Amount",
//     format: "C2",
//     textAlign: "Center",
//     editType: "numericedit",
//     width: "150",
//   },
//   {
//     headerText: "Status",
//     template: gridOrderStatus,
//     field: "OrderItems",
//     textAlign: "Center",
//     width: "120",
//   },
//   {
//     field: "OrderID",
//     headerText: "Order ID",
//     width: "120",
//     textAlign: "Center",
//   },

//   {
//     field: "Location",
//     headerText: "Location",
//     width: "150",
//     textAlign: "Center",
//   },
// ];

// export const scheduleData = [
//   {
//     Id: 1,
//     Subject: "Explosion of Betelgeuse Star",
//     Location: "Space Center USA",
//     StartTime: "2021-01-10T04:00:00.000Z",
//     EndTime: "2021-01-10T05:30:00.000Z",
//     CategoryColor: "#1aaa55",
//   },
//   {
//     Id: 23,
//     Subject: "Sky Gazers",
//     Location: "Greenland",
//     StartTime: "2021-01-15T09:00:00.000Z",
//     EndTime: "2021-01-15T10:30:00.000Z",
//     CategoryColor: "#ea7a57",
//   },
//   {
//     Id: 24,
//     Subject: "Facts of Humming Birds",
//     Location: "California",
//     StartTime: "2021-01-16T07:00:00.000Z",
//     EndTime: "2021-01-16T09:00:00.000Z",
//     CategoryColor: "#7fa900",
//   },
// ];

export const lineChartData = [
  [
    { x: new Date(2005, 0, 1), y: 21 },
    { x: new Date(2006, 0, 1), y: 24 },
    { x: new Date(2007, 0, 1), y: 36 },
    { x: new Date(2008, 0, 1), y: 38 },
    { x: new Date(2009, 0, 1), y: 54 },
    { x: new Date(2010, 0, 1), y: 57 },
    { x: new Date(2011, 0, 1), y: 70 },
  ],
  [
    { x: new Date(2005, 0, 1), y: 28 },
    { x: new Date(2006, 0, 1), y: 44 },
    { x: new Date(2007, 0, 1), y: 48 },
    { x: new Date(2008, 0, 1), y: 50 },
    { x: new Date(2009, 0, 1), y: 66 },
    { x: new Date(2010, 0, 1), y: 78 },
    { x: new Date(2011, 0, 1), y: 84 },
  ],

  [
    { x: new Date(2005, 0, 1), y: 10 },
    { x: new Date(2006, 0, 1), y: 20 },
    { x: new Date(2007, 0, 1), y: 30 },
    { x: new Date(2008, 0, 1), y: 39 },
    { x: new Date(2009, 0, 1), y: 50 },
    { x: new Date(2010, 0, 1), y: 70 },
    { x: new Date(2011, 0, 1), y: 100 },
  ],
];
export const dropdownData = [
  {
    Id: "1",
    Time: "March 2021",
  },
  {
    Id: "2",
    Time: "April 2021",
  },
  {
    Id: "3",
    Time: "May 2021",
  },
];
// export const SparklineAreaData = [
//   { x: 1, yval: 2 },
//   { x: 2, yval: 6 },
//   { x: 3, yval: 8 },
//   { x: 4, yval: 5 },
//   { x: 5, yval: 10 },
// ];

export const lineCustomSeries = [
  {
    dataSource: lineChartData[0],
    xName: "x",
    yName: "y",
    name: "Germany",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },

  {
    dataSource: lineChartData[1],
    xName: "x",
    yName: "y",
    name: "England",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },

  {
    dataSource: lineChartData[2],
    xName: "x",
    yName: "y",
    name: "India",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },
];
