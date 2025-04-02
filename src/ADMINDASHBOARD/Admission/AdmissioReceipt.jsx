import React, { useState } from "react";

function AdmissioReceipt() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [dateOfAdmission, setDateOfAdmission] = useState("");
  const [surname, setSurname] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [monthOfBirth, setMonthOfBirth] = useState("");
  const [yearOfBirth, setYearOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [religion, setReligion] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [address, setAddress] = useState("");
  const [schoolLastStudied, setSchoolLastStudied] = useState("");
  const [transferCertificate, setTransferCertificate] = useState("");
  const [numberAndDate, setNumberAndDate] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex justify-center">
      <div className=" border-4 p-4 w-[70%]">
        <div className="flex justify-around">
          <div>
            <img src="" alt="image" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-4">UVAAN MODEL SCHOOL</h1>
            <p className="text-xl mb-2">(Recognized by the Govt. of T.S)</p>
            <p className="text-xl mb-4">NURSERY to X Class | English Medium</p>
          </div>
          <div>Address</div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Application for Admission</h1>
        <div className="flex justify-between">
          <div className="border-2 p-1 w-80">
            <h2 className="text-xl mb-2">To be filled by the office</h2>
            <table className="w-full mb-4">
              <tr>
                <td className="w-1/2">Admission No:</td>
                <td>
                  <input
                    type="text"
                    value="nidhi12345"
                    onChange={(event) => setAdmissionNo(event.target.value)}
                    className="w-full p-2 pl-10  text-sm border-b-2"
                  />
                </td>
              </tr>
              <tr>
                <td>Aadhar No:</td>
                <td>
                  <input
                    value="nidhi12345"
                    type="text"
                    // value={aadharNo}
                    onChange={(event) => setAadharNo(event.target.value)}
                    className="w-full p-2 pl-10 text-sm border-b-2"
                  />
                </td>
              </tr>
              <tr>
                <td>Date of Admission:</td>
                <td>
                  <input
                    value="nidhi12345"
                    type="text"
                    // value={dateOfAdmission}
                    onChange={(event) => setDateOfAdmission(event.target.value)}
                    className="w-full p-2 pl-10 text-sm border-b-2"
                  />
                </td>
              </tr>
            </table>
          </div>
          <div>
            <div className="border-4 h-44 w-36"></div>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto p-4 pt-6 mb-4"
        >
          <ol className="list-none">
            <li>
              Surname (in black letters)
              <input type="text" className="w-full  text-sm text-gray-700" />
            </li>
            <li>
              Name (in black letters)
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Father's name (in black letters)
              <input
                type="text"
                value={fatherName}
                onChange={(event) => setFatherName(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Mother's name (in black letters)
              <input
                type="text"
                value={motherName}
                onChange={(event) => setMotherName(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Occupation - Father/Guardian
              <input
                type="text"
                value={fatherOccupation}
                onChange={(event) => setFatherOccupation(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Gender - Male
              <input
                type="checkbox"
                checked={gender === "Male"}
                onChange={(event) =>
                  setGender(event.target.checked ? "Male" : "")
                }
                className="mr-2"
              />
              Female
              <input
                type="checkbox"
                checked={gender === "Female"}
                onChange={(event) =>
                  setGender(event.target.checked ? "Female" : "")
                }
                className="mr-2"
              />
            </li>
            <li>
              Date of birth Date
              <input
                type="text"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="w-1/3 p-2 pl-10 text-sm text-gray-700"
              />
              Month
              <input
                type="text"
                value={monthOfBirth}
                onChange={(event) => setMonthOfBirth(event.target.value)}
                className="w-1/3 p-2 pl-10 text-sm text-gray-700"
              />
              Year
              <input
                type="text"
                value={yearOfBirth}
                onChange={(event) => setYearOfBirth(event.target.value)}
                className="w-1/3 p-2 pl-10 text-sm text-gray-700"
              />
              in words
              <input
                type="text"
                value={nationality}
                onChange={(event) => setNationality(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Nationality - Religion
              <input
                type="text"
                value={religion}
                onChange={(event) => setReligion(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
              Mother Tongue
              <input
                type="text"
                value={motherTongue}
                onChange={(event) => setMotherTongue(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Address for communication permanent address
              <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Do you belongs to SC
              <input type="checkbox" className="mr-2" />
              ST
              <input type="checkbox" className="mr-2" />
              BC
              <input type="checkbox" className="mr-2" />
              OC
              <input type="checkbox" className="mr-2" />
              OBC
              <input type="checkbox" className="mr-2" />
            </li>
            <li>
              School and class last studied
              <input
                type="text"
                value={schoolLastStudied}
                onChange={(event) => setSchoolLastStudied(event.target.value)}
                className="w-full p-2 pl-10 text-sm text-gray-700"
              />
            </li>
            <li>
              Whether a transfer certificate or
              <input
                type="text"
                value={transferCertificate}
                onChange={(event) => setTransferCertificate(event.target.value)}
                className="w-1/3 p-2 pl-10 text-sm text-gray-700"
              />
              record sheet is attached and if s
              <input
                type="text"
                value={numberAndDate}
                onChange={(event) => setNumberAndDate(event.target.value)}
                className="w-2/3 p-2 pl-10 text-sm text-gray-700"
              />
            </li>
          </ol>
        </form>
      </div>
    </div>
  );
}

export default AdmissioReceipt;
