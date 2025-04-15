export const apiUrls = {

// class start

login:"login",

updateAdmin:"adminRoute/updateAdmin",
getAdminInfo:"adminRoute/getAdminInfo",
classData:"adminRoute/class",
getStudentAndParent:"adminRoute/getStudentAndParent",
getTeachers:"adminRoute/teacher",
getAllStudents:"adminRoute/studentparent",
getLastYearStudent: "adminRoute/studentparent",
studentparent: "adminRoute/studentparent",
feeIncomeMonths: "fees/feeIncomeMonths",

adminRoutestudents: "adminRoute/students",
parentandchild: "adminRoute/parentandchild",
editBulkstudentparent: "adminRoute/studentparent/many",

// getAllStudents:"adminRoute/getAllStudents",
// getLastYearStudent: "adminRoute/getLastYearStudents",

adminRouteThirdPartystudents: "adminRoute/students",
createStudentParent: "adminRoute/admission", 
// createStudentParent: "adminRoute/createStudentParent", 
editStudentParent: "adminRoute/students", 
// editStudentParent: "adminRoute/editStudentParent", 

// class end

   // registration Start
   getRegistrations: "adminRoute/registration",
   createRegistrations: "adminRoute/registration",
   deleteRegistrations: "adminRoute/deleteRegistration",
   adminRoutecreateBulkRegistrations: "adminRoute/createBulkRegistrations",
   adminRoutecreateBulkStudentParent: "adminRoute/createBulkStudentParent",
   // registration End

   // Admission Start
   adminRoutependingAdmissions: "adminRoute/pendingAdmissions",
   adminRouteapproveAdmissions: "adminRoute/approveAdmissions",
   admissionbulk: "adminRoute/admission/bulk",
   
   // Admission end
  
   
   
  
   // getAllClasses: "adminRoute/getAllClasses",
   

//    ThirdPartyApi Start 
thirdpartyadmissions: "thirdparty/admissions",

thirdpartymyadmissionsschool: "thirdparty/my-admissions/school",
thirdpartymystudents: "thirdparty/my-students/",
getAllstudents: "thirdparty/students",
thirdpartyclasses: "thirdparty/classes",
initialstudentphoto: "thirdparty/photo",

   //    ThirdPartyApi End 
  
   // Exams Strt 
   adminRouteexams:"exam/exams",
   createExam:"exam/exams",
   marksmarksbulkupload:"marks/marksbulkupload",
   // examresult:"exam/results/ce947fc0-b79c-4981-864d-70badba51ae7/report",
   // examresult:"exam/results/2782ef35-293f-4cc7-aca6-4e105309017b/report",
   examresult:"exam/results",
   allexamresult:"exam/results",
   // "https://dvsserver.onrender.com/api/v1/exam/results/2782ef35-293f-4cc7-aca6-4e105309017b/report"
   // createExam:"adminRoute/exam",

   deleteexams:"exam/exams",
   marksmarks:"marks/marks",
   // Exams End

   // Fees start
   feesaddPastDues:"fees/addPastDues",
   adminRoutefeesregular:"adminRoute/fees/regular",
   adminRoutefees:"adminRoute/fees",
   feesadditional:"adminRoute/fees/additional",
   cancelFeePayment:"fees/cancelFeePayment",
   adminRoutefine:"adminRoute/fees/fine",
   feescreateFeeStatus: "fees/createFeeStatus",
   feescreateUnifiedFeeStatus: "fees/createUnifiedFeePayment",
   fetchFeeReceipt: "fees/generateFeeReceipt",
   getAllStudentsFeeStatus:"fees/getAllStudentsFeeStatus",
   feesgetMonthlyDues:"fees/getMonthlyDues",
   // Fees End



   
   // teacher  start
teacherapi:  "adminRoute/teacher",
   // teacher  End
    
  


   // library start 
   createbooklibrary:"adminRoute/library",
   // library End

   // employee start 
   adminRoutestaff:"/adminRoute/staff",

   // employee end


   // fees start 

   getStudentFeeInfo:"fees/getStudentFeeInfo",
   feesfeeHistory:"fees/feeHistory",
   createStudentSpecificFee:"adminRoute/fees/student",
   getStudentSpecificFee:"fees/getStudentFeeInfo",
   promotionOfStudent:"adminRoute/promotionOfStudent",
   getStudentsBySession:"adminRoute/getStudentsBySession",
   // fees End


























   // teachers api 
   marksgetmarks:"marks/getmarks",
    createAttendance:"teacher/createAttendance",
   




   //  inventory start 

   adminRouteinventory:"adminRoute/inventory",
   adminRoutelibrary:"adminRoute/library",
   //  inventory end


}