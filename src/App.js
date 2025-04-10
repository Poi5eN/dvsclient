import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
// import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
// import 'primereact/resources/primereact.min.css';      
// import 'primeicons/primeicons.css';   



import ExamSystem from "./ADMINDASHBOARD/Exams/ExamSystem";
import Loading from "./Loading";
import PublicRoute from "./components/Auth/PublicRoute";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useStateContext } from "./contexts/ContextProvider";
import AddDues from "./ADMINDASHBOARD/Fees/AddDues";
import DuesStatus from "./ADMINDASHBOARD/Fees/DuesStatus";
import AdminUser from "./Users/AdminUser";
import Testing from "./ADMINDASHBOARD/Testing";
import AdmitcardTesting from "./ADMINDASHBOARD/AdmitcardTesting";
import Admitcardmarch from "./ADMINDASHBOARD/Exams/AdmitCard/Admitcardmarch";
import LateFine from "./ADMINDASHBOARD/Fees/LateFine";
import CoScholasticMarks from "./TEACHERDASHBOARD/NewExam/coScholasticMarks";
import StudentsMarks from "./TEACHERDASHBOARD/NewExam/StudentsMarks";
import EditRportCard from "./ADMINDASHBOARD/Exams/EditRportCard";
import ViewMarks from "./ADMINDASHBOARD/Exams/ViewMarks";
import SpecificFee from "./ADMINDASHBOARD/Fees/SpecificFee";
import Table from "./ADMINDASHBOARD/Fees/Table";
import StudentFeeHistory from "./ADMINDASHBOARD/Fees/StudentFeeHistory";
import InventoryDashboard from "./ADMINDASHBOARD/Inventory/InventoryDashboard"; // New import

const LandingPage = lazy(() => import("./ShikshMitraWebsite/LandingPage"));
const AdminDashboard = lazy(() => import("./ADMINDASHBOARD/AdminDashboard"));
const Teacher = lazy(() =>
  import("./ShikshMitraWebsite/component/LoginPage/Teacher")
);
const Login = lazy(() =>
  import("./ShikshMitraWebsite/component/LoginPage/Login")
);
const Home = lazy(() => import("./ShikshMitraWebsite/component/Pages/Home"));
const DashboardHome = lazy(() => import("./ADMINDASHBOARD/DashboardHome"));
const AllTeachers = lazy(() => import("./ADMINDASHBOARD/Teacher/AllTeachers"));
const ViewTeacher = lazy(() => import("./ADMINDASHBOARD/Teacher/ViewTeacher"));
const EditTeacher = lazy(() => import("./ADMINDASHBOARD/Teacher/EditTeacher"));
const Payment = lazy(() => import("./ADMINDASHBOARD/Payment/Payment"));
const AdditionalFee = lazy(() =>
  import("./ADMINDASHBOARD/Fees/Additional/AdditionalFee")
);
const ClasswiseFee = lazy(() =>
  import("./ADMINDASHBOARD/Fees/ClassWise/ClasswiseFee")
);
const EditClasswiseFees = lazy(() =>
  import("./ADMINDASHBOARD/Fees/ClassWise/EditClassWise")
);
const Allstudent = lazy(() =>
  import("./ADMINDASHBOARD/Student/AllStudent/Allstudent")
);
const EditStudent = lazy(() =>
  import("./ADMINDASHBOARD/Student/AllStudent/EditStudent")
);
const Promotion = lazy(() =>
  import("./ADMINDASHBOARD/Student/Promotion/Promotion")
);
const CreateParents = lazy(() =>
  import("./ADMINDASHBOARD/Parents/AllParent/CreateParents")
);
const FeeStatus = lazy(() =>
  import("./ADMINDASHBOARD/Parents/FeesStatus/FeeStatus")
);
const Income = lazy(() => import("./ADMINDASHBOARD/Account/Income"));
const Expenditure = lazy(() =>
  import("./ADMINDASHBOARD/Account/Expenditure/Expenditure")
);
const Stocks = lazy(() => import("./ADMINDASHBOARD/Inventory/Stocks"));
const EditStocks = lazy(() => import("./ADMINDASHBOARD/Inventory/Edit_Stocks"));
const Sales = lazy(() => import("./ADMINDASHBOARD/Inventory/Sales"));
const AllBooks = lazy(() => import("./ADMINDASHBOARD/Library/AllBooks"));
const EditBook = lazy(() => import("./ADMINDASHBOARD/Library/EditBook"));
const ViewBooks = lazy(() => import("./ADMINDASHBOARD/Library/ViewBooks"));
const IssuedBook = lazy(() => import("./ADMINDASHBOARD/Library/IssuedBook"));
const Registration = lazy(() =>
  import("./ADMINDASHBOARD/Admission/Registration")
);
const AdmissionStatus = lazy(() =>
  import("./ADMINDASHBOARD/Admission/AdmissionStatus")
);
const Classes = lazy(() => import("./ADMINDASHBOARD/Classes/Classes"));
const Staff = lazy(() => import("./ADMINDASHBOARD/Employees/Staff"));
const Wages = lazy(() => import("./ADMINDASHBOARD/Employees/Wages"));
const EditAdmission = lazy(() =>
  import("./ADMINDASHBOARD/Admission/EditAdmission")
);
const EditPrimary = lazy(() => import("./ADMINDASHBOARD/Classes/EditClass"));
const ViewStaff = lazy(() => import("./ADMINDASHBOARD/Employees/Staff/ViewStaff"));
const EditStaff = lazy(() => import("./ADMINDASHBOARD/Employees/Staff/EditStaff"));
const TeacherDashboard = lazy(() => import("./TEACHERDASHBOARD/TeacherDashboard"));
const TeacherHome = lazy(() => import("./TEACHERDASHBOARD/TeacherHome"));
const MyStudent = lazy(() => import("./TEACHERDASHBOARD/MyStudent/MyStudent"));
const ViewStudentTeacher = lazy(() =>
  import("./TEACHERDASHBOARD/MyStudent/ViewStudent")
);
const EditStudentTeacher = lazy(() =>
  import("./TEACHERDASHBOARD/MyStudent/EditStudent")
);
const Assignments = lazy(() => import("./TEACHERDASHBOARD/Assignments"));
const Attendance = lazy(() => import("./TEACHERDASHBOARD/Attendance"));
const Curriculum = lazy(() => import("./TEACHERDASHBOARD/Curriculum"));
const Lectures = lazy(() => import("./TEACHERDASHBOARD/Lectures"));
const Study = lazy(() => import("./TEACHERDASHBOARD/Study"));
const AboutTeacher = lazy(() => import("./TEACHERDASHBOARD/AboutTeacher"));
const StudentDashboard = lazy(() => import("./STUDENTDASHBOARD/StudentDashboard"));
const ParentDashboard = lazy(() => import("./ParentDashboard"));
const Subjects = lazy(() => import("./STUDENTDASHBOARD/Subjects"));
const StudentResults = lazy(() => import("./STUDENTDASHBOARD/StudentResults"));
const StudentStudyMaterial = lazy(() =>
  import("./STUDENTDASHBOARD/StudentStudyMaterial")
);
const TimeTable = lazy(() => import("./STUDENTDASHBOARD/TimeTable"));
const StudentAssigments = lazy(() =>
  import("./STUDENTDASHBOARD/StudentAssigments")
);
const Syllabus = lazy(() => import("./STUDENTDASHBOARD/Syllabus"));
const MyKids = lazy(() => import("./PARENTDASHBOARD/MyKids"));
const Events = lazy(() => import("./PARENTDASHBOARD/Events"));
const ParentResults = lazy(() => import("./PARENTDASHBOARD/ParentResults"));
const ParentCurriculum = lazy(() => import("./PARENTDASHBOARD/ParentCurriculum"));
const ParentNotification = lazy(() => import("./PARENTDASHBOARD/ParentNotification"));
const Expenses = lazy(() => import("./PARENTDASHBOARD/Expenses"));
const Queries = lazy(() => import("./PARENTDASHBOARD/Queries"));
const StudentHome = lazy(() => import("./STUDENTDASHBOARD/StudentHome"));
const AdmitCard = lazy(() => import("./ADMINDASHBOARD/Exams/AdmitCard"));
const CreateExams = lazy(() => import("./TEACHERDASHBOARD/NewExam/CreateExam"));
const ParentHome = lazy(() => import("./PARENTDASHBOARD/ParentHome"));
const StudentFeeStatus = lazy(() =>
  import("./ADMINDASHBOARD/Student/AllStudent/StudentFeeStatus")
);
const Issue = lazy(() => import("./ADMINDASHBOARD/Library/IssueBook/Issue"));
const ReturnBook = lazy(() => import("./ADMINDASHBOARD/Library/ReturnBook/ReturnBook"));
const ParentExam = lazy(() => import("./PARENTDASHBOARD/ParentExam"));
const ParentFees = lazy(() => import("./PARENTDASHBOARD/ParentFees"));
const StudentExam = lazy(() => import("./STUDENTDASHBOARD/StudentExam"));
const StudentAdmitCard = lazy(() => import("./STUDENTDASHBOARD/StudentAdmitCard"));
const SalaryStatus = lazy(() => import("./ADMINDASHBOARD/Teacher/SalaryStatus"));
const ViewAdmitCard = lazy(() => import("./ADMINDASHBOARD/Exams/ViewAdmitCard"));
const StudentsResult = lazy(() => import("./ADMINDASHBOARD/Result/StudentsResult"));
const ViewResultCard = lazy(() => import("./ADMINDASHBOARD/Result/ViewResultCard"));
const EmployeeSalaryStatus = lazy(() => import("./ADMINDASHBOARD/Employees/SalaryStatus"));
const CreateCurriculum = lazy(() => import("./ADMINDASHBOARD/CreateCurriculum"));
const BookManagement = lazy(() => import("./STUDENTDASHBOARD/BookManagement"));
const StudentIdCardNew = lazy(() => import("./ADMINDASHBOARD/Student/AllStudent/StudentIdCardNew"));
const AdmissioReceipt = lazy(() => import("./ADMINDASHBOARD/Admission/AdmissioReceipt"));
const ViewReg = lazy(() => import("./ADMINDASHBOARD/NewRegistration/ViewReg"));
const AdmissionsForms = lazy(() => import("./ADMINDASHBOARD/Admission/NewAdmissionForm"));
const AdmissionPrint = lazy(() => import("./ADMINDASHBOARD/Admission/AdmissionPrint"));
const IdCard = lazy(() => import("./ADMINDASHBOARD/IdCard/IdCard"));
const AdmitCardUi = lazy(() => import("./ADMINDASHBOARD/Exams/AllExams/AdmidCardUi"));
const AdmissionFormblank = lazy(() => import("./ADMINDASHBOARD/Form/AdmissionForm"));
const LeavingCertificate = lazy(() => import("./Certificate/LeavingCertificate/LeavingCertificate"));
const BulkAdmission = lazy(() => import("./ADMINDASHBOARD/Admission/BulkAdmission"));
const CreateFees = lazy(() => import("./ADMINDASHBOARD/Fees/CreateFees"));
const Udise = lazy(() => import("./ADMINDASHBOARD/Udise/Udise"));
const AllotMarks = lazy(() => import("./TEACHERDASHBOARD/NewExam/AllotMarks"));
const ReportCardteacher = lazy(() => import("./TEACHERDASHBOARD/NewExam/ReportCard"));
const AdmitCardTeacher = lazy(() => import("./TEACHERDASHBOARD/NewExam/AdmitCard"));
const Fees = lazy(() => import("./ADMINDASHBOARD/Fees/Fees"));
const Thirdparty = lazy(() => import("./ADMINDASHBOARD/NewRegistration/Thirdparty"));
const Admin = lazy(() => import("./ShikshMitraWebsite/component/LoginPage/Admin"));
const Receptionist = lazy(() => import("./ShikshMitraWebsite/component/LoginPage/Receptionist"));
const Thirdpartylogin = lazy(() => import("./ShikshMitraWebsite/component/LoginPage/Thirdparty"));
const Accountants = lazy(() => import("./ShikshMitraWebsite/component/LoginPage/Accountants"));
const StudentLogin = lazy(() => import("./ShikshMitraWebsite/component/LoginPage/Student"));
const ParentLogin = lazy(() => import("./ShikshMitraWebsite/component/LoginPage/Parent"));
const CreateExam = lazy(() => import("./ADMINDASHBOARD/Exams/CreateExam"));
const ThirdPartyDashboard = lazy(() => import("./THIRDPARTY/ThirdPartyDashboard"));
const ThirdPartyHome = lazy(() => import("./THIRDPARTY/ThirdPartyHome"));
const ThirdPartyMobile = lazy(() => import("./THIRDPARTY/Mobile/ThirdPartyMobile"));
const Feature = lazy(() => import("./ShikshMitraWebsite/component/New/Feature"));
const Contact = lazy(() => import("./ShikshMitraWebsite/component/New/Page/Fetaure/Contact/Contact"));
const About = lazy(() => import("./ShikshMitraWebsite/component/New/Page/About/About"));
const ReportCard = lazy(() => import("./ADMINDASHBOARD/Exams/ReportCard"));
const Newegistrations = lazy(() => import("./ADMINDASHBOARD/NewRegistration/Newegistrations"));
const Unauthorized = lazy(() => import("./components/Auth/Unauthorized"));

function App() {
  const { isLoggedIn } = useStateContext();
  // const token = localStorage.getItem("token");
  // const userRole = sessionStorage.getItem("userRole");
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (token && !userRole) {
  //     localStorage.clear();
  //     sessionStorage.clear();
  //     navigate("/login", { replace: true });
  //   }
  // }, [token, userRole, navigate]);

  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />}>
              <Route index element={<Home />} />
              <Route path="/feature" element={<Feature />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/teacherlogin" element={<Teacher />} />
              <Route path="/adminlogin" element={<Admin />} />
              <Route path="/receptionist" element={<Receptionist />} />
              <Route path="/accountants" element={<Accountants />} />
              <Route path="/thirdparty" element={<Thirdpartylogin />} />
              <Route path="/studentlogin" element={<StudentLogin />} />
              <Route path="/parentlogin" element={<ParentLogin />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/*" element={<AdminDashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="allteachers" element={<AllTeachers />} />
              <Route path="payment" element={<Payment />} />
              <Route path="allteachers/view-profile/:email" element={<ViewTeacher />} />
              <Route path="allteachers/edit-profile/:email" element={<EditTeacher />} />
              <Route path="admin/allteachers/salaryStatus/:email" element={<SalaryStatus />} />
              <Route path="additional" element={<AdditionalFee />} />
              <Route path="classwise" element={<ClasswiseFee />} />
              <Route path="add-dues" element={<AddDues />} />
              <Route path="lateFine" element={<LateFine />} />
              <Route path="specificFee" element={<SpecificFee />} />
              <Route path="feehistory" element={<Table />} />
              <Route path="StudentHistory" element={<StudentFeeHistory />} />
              <Route path="classwise/edit-fees/:_id" element={<EditClasswiseFees />} />
              <Route path="allstudent" element={<Allstudent />} />
              <Route path="allstudent/viewstudent/view-profile/:email" element={<StudentIdCardNew />} />
              <Route path="allstudent/editstudent/edit-profile/:email" element={<EditStudent />} />
              <Route path="allstudent/StudentFeeStatus/:email" element={<StudentFeeStatus />} />
              <Route path="promotion" element={<Promotion />} />
              <Route path="allparents" element={<CreateParents />} />
              <Route path="feestatus" element={<FeeStatus />} />
              <Route path="income" element={<Income />} />
              <Route path="expenditure" element={<Expenditure />} />
              <Route path="stocks" element={<Stocks />} />
              <Route path="stocks/editstock/:_id" element={<EditStocks />} />
              <Route path="sales" element={<Sales />} />
              <Route path="records" element={<InventoryDashboard />} /> {/* New Route */}
              <Route path="books" element={<AllBooks />} />
              <Route path="books/edit-book/:_id" element={<EditBook />} />
              <Route path="books/view-book/:_id" element={<ViewBooks />} />
              <Route path="issued" element={<IssuedBook />} />
              <Route path="books/issue-book/:_id" element={<Issue />} />
              <Route path="books/return-book/:_id" element={<ReturnBook />} />
              <Route path="registration" element={<Newegistrations />} />
              <Route path="newregistration/:registrationNumber" element={<ViewReg />} />
              <Route path="create-fees" element={<CreateFees />} />
              <Route path="dues-status" element={<DuesStatus />} />
              <Route path="admission" element={<Registration />} />
              <Route path="admission/bulkadmission" element={<BulkAdmission />} />
              <Route path="admission/admissionform" element={<AdmissionsForms />} />
              <Route path="admission/view-admission/:email" element={<AdmissionPrint />} />
              <Route path="ad" element={<AdmissioReceipt />} />
              <Route path="idcard" element={<IdCard />} />
              <Route path="admitcards" element={<AdmitCardUi />} />
              <Route path="admission/edit-admission/:email" element={<EditAdmission />} />
              <Route path="status" element={<AdmissionStatus />} />
              <Route path="classes" element={<Classes />} />
              <Route path="classes/edit-classes/:className" element={<EditPrimary />} />
              <Route path="staff" element={<Staff />} />
              <Route path="staff/view-profile/:email" element={<ViewStaff />} />
              <Route path="staff/edit-profile/:email" element={<EditStaff />} />
              <Route path="staff/salaryStatus/:email" element={<EmployeeSalaryStatus />} />
              <Route path="wages" element={<Wages />} />
              <Route path="exam-system" element={<ExamSystem />} />
              <Route path="results" element={<StudentsResult />} />
              <Route path="createexam" element={<CreateExam />} />
              <Route path="admitcard" element={<AdmitCard />} />
              <Route path="report" element={<ReportCard />} />
              <Route path="editreport" element={<EditRportCard />} />
              <Route path="viewmarks" element={<ViewMarks />} />
              <Route path="viewadmitcard/:email" element={<ViewAdmitCard />} />
              <Route path="studentsresult" element={<StudentsResult />} />
              <Route path="viewresultcard/:email" element={<ViewResultCard />} />
              <Route path="curriculum" element={<CreateCurriculum />} />
              <Route path="allforms" element={<AdmissionFormblank />} />
              <Route path="leavingcertificate" element={<LeavingCertificate />} />
              <Route path="udise" element={<Udise />} />
              <Route path="userdetails" element={<AdminUser />} />
              <Route path="testing" element={<Testing />} />
              <Route path="admitdesign" element={<AdmitcardTesting />} />
              <Route path="newcard" element={<Admitcardmarch />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
            <Route path="/teacher/*" element={<TeacherDashboard />}>
              <Route index element={<TeacherHome />} />
              <Route path="mystudents" element={<MyStudent />} />
              <Route path="teacher/mystudents/view-profile/:email" element={<ViewStudentTeacher />} />
              <Route path="teacher/mystudents/edit-profile/:email" element={<EditStudentTeacher />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="curriculum" element={<Curriculum />} />
              <Route path="lectures" element={<Lectures />} />
              <Route path="study" element={<Study />} />
              <Route path="aboutTeacher" element={<AboutTeacher />} />
              <Route path="exams" element={<CreateExams />} />
              <Route path="allotmaks" element={<AllotMarks />} />
              <Route path="studentsmaks" element={<StudentsMarks />} />
              <Route path="coScholasticMarks" element={<CoScholasticMarks />} />
              <Route path="reportscard" element={<ReportCardteacher />} />
              <Route path="admitcard" element={<AdmitCardTeacher />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/student/*" element={<StudentDashboard />}>
              <Route index element={<StudentHome />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="StudyMaterial" element={<StudentStudyMaterial />} />
              <Route path="timetable" element={<TimeTable />} />
              <Route path="assigments" element={<StudentAssigments />} />
              <Route path="syllabus" element={<Syllabus />} />
              <Route path="exams" element={<StudentExam />} />
              <Route path="admitcard" element={<StudentAdmitCard />} />
              <Route path="issuedBooks" element={<BookManagement />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["parent"]} />}>
            <Route path="/parent/*" element={<ParentDashboard />}>
              <Route index element={<ParentHome />} />
              <Route path="mykids" element={<MyKids />} />
              <Route path="events" element={<Events />} />
              <Route path="results" element={<ParentResults />} />
              <Route path="curriculum" element={<ParentCurriculum />} />
              <Route path="notification" element={<ParentNotification />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="exams" element={<ParentExam />} />
              <Route path="fees" element={<ParentFees />} />
              <Route path="queries" element={<Queries />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["thirdparty"]} />}>
            <Route path="/thirdparty/*" element={<ThirdPartyDashboard />}>
              <Route index element={<ThirdPartyHome />} />
              <Route path="school" element={<ThirdPartyMobile />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/unauthorized" : "/"} />}
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;