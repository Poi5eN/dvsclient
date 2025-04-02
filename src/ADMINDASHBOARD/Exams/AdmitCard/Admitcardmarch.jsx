import React from "react";
import "./Index.css"; // <-- Import the CSS file

function Admitcardmarch() {
  return (
    <div className="admitcard-container">
      {/* School Header Section */}
      <header className="school-header">
        <h1 className="school-title">NATIONAL CHILDREN PUBLIC SCHOOL</h1>
        <p className="school-address">
          At. Khagra Ward No 32 Kishanganj, Dist. Kishanganj (Bihar)
        </p>
        <p className="school-subtitle">(An English Medium Co-educational School)</p>
        <h2 className="admitcard-heading">
          FOR CLASS NURSERY TO VIII <br />
          APPLICATION FOR ADMISSION
        </h2>
      </header>

      {/* Form Section */}
      <section className="admitcard-form">
        <div className="form-group">
          <label htmlFor="fullName">1. Full Name (in block letter)</label>
          <input type="text" id="fullName" name="fullName" />
        </div>

        <div className="form-group">
          <label htmlFor="fatherName">2. Father's Name</label>
          <input type="text" id="fatherName" name="fatherName" />
        </div>

        <div className="form-group">
          <label htmlFor="motherName">3. Mother's Name</label>
          <input type="text" id="motherName" name="motherName" />
        </div>

        <div className="form-group small-group">
          <label htmlFor="age">4. Age</label>
          <input type="number" id="age" name="age" />
        </div>

        <div className="form-group small-group">
          <label htmlFor="dob">5. Date of Birth</label>
          <input type="date" id="dob" name="dob" />
        </div>

        <div className="form-group small-group">
          <label htmlFor="sex">6. Sex (M/F)</label>
          <select id="sex" name="sex">
            <option value="">-- Select --</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="category">
            7. Category (Gen./OBC/SC/ST/Oth)
          </label>
          <input type="text" id="category" name="category" />
        </div>

        <div className="form-group">
          <label htmlFor="address">8. Address</label>
          <textarea id="address" name="address" rows="3"></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="guardianMob">9. Guardian Mob</label>
          <input type="text" id="guardianMob" name="guardianMob" />
        </div>

        <div className="form-group">
          <label>
            10. Session: (e.g. 2023-2024)
          </label>
          <input type="text" name="session" />
        </div>
      </section>

      {/* Declaration Section */}
      <section className="declaration">
        <h3>DECLARATION BY THE GUARDIAN</h3>
        <p>
          I hereby declare that the information stated above is correct. I shall
          be responsible for any inaccuracy in the provided information. If the
          student does not maintain the rules, the authority can remove him/her
          from the school.
        </p>
      </section>

      {/* Footer / Sign Section */}
      <footer className="admitcard-footer">
        <div className="footer-col">
          <p>Principal Seal & Sign</p>
        </div>
        <div className="footer-col">
          <p>Full Sign. of Guardian / Thumb</p>
        </div>
      </footer>
    </div>
  );
}

export default Admitcardmarch;
