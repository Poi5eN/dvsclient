import React, { Component } from 'react';
import Timetable from './Timetable';

class Newtest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      inputValues: {
        classStart: '10',
        classSection: '',
        academicYear: '',
        generatedOn: '',
        version: '',
      },
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      inputValues: {
        ...prevState.inputValues,
        [name]: value,
      },
    }));
  };

  handleStepChange = (step) => {
    this.setState({ step });
  };

  handleSubmit = () => {
    // Handle form submission logic here
    console.log('Form submitted with values:', this.state.inputValues);
  };

  render() {
    const { step, inputValues } = this.state;

    return (
        <div>
      <div className="container flex justify-center gap-2 bg-slate-500 ">
        <div className="row">
          <div className="col-lg-3 mb-[10px] flex flex-col gap-3 pt-[10px] ">
            <div className="form-group inline-flex gap-3 ">
              <label className=' text-white' >Classes Start At</label>
              <input
                type="time"
                name="classStart"
                value={inputValues.classStart}
                onChange={this.handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group inline-flex gap-3  ">
              <label className=' text-white' >Class & Section</label>
              <input
                type="text"
                name="classSection"
                value={inputValues.classSection}
                onChange={this.handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group inline-flex gap-3">
              <label className=' text-white' >Academic Year</label>
              <input
                type="text"
                name="academicYear"
                value={inputValues.academicYear}
                onChange={this.handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group inline-flex gap-3">
              <label className=' text-white' >Generated On</label>
              <input
                type="date"
                name="generatedOn"
                value={inputValues.generatedOn}
                onChange={this.handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className=' text-white' >Version</label>
              <input
                type="number"
                name="version"
                value={inputValues.version}
                onChange={this.handleInputChange}
                className="form-control  m-[2px] p-[2px] "
              />
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded my-1" onClick={this.handleSubmit}>
              Submit Form
            </button>
          </div>
          <div className="col-lg-9">
            {/* Your timetable component and table will go here */}
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4  my-1 " onClick={() => this.handleStepChange(2)}>
              Step 2
            </button>
            {/* The rest of your timetable component */}
          </div>
        </div>
        <Timetable />
      </div>
      </div>  
    );
  }
}

export default Newtest;
