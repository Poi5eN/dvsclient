import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';

const BulkExemption = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [additionalFees, setAdditionalFees] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedOneTimeFees, setSelectedOneTimeFees] = useState([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [affectedStudentsCount, setAffectedStudentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const authToken = localStorage.getItem('token');
  const session = JSON.parse(localStorage.getItem('session')) || '2025-2026';

  const months = [
    'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December', 'January', 'February', 'March'
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/v1/school/classes', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setClasses(response.data.classes || []);
    } catch (error) {
      toast.error('Failed to fetch classes: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = async (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    setSelectedSection('');
    setAdditionalFees([]);
    setSelectedMonths([]);
    setSelectedOneTimeFees([]);
    setAffectedStudentsCount(0);

    if (!className) return;

    try {
      setIsLoading(true);
      const [sectionsRes, feesRes, studentsRes] = await Promise.all([
        axios.get(`/api/v1/school/classes/${className}/sections`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get(`/api/v1/fees/?additional=true&className=${className}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get(`/api/v1/students?class=${className}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      setSections(sectionsRes.data.sections || []);
      setAdditionalFees(feesRes.data.data || []);
      setAffectedStudentsCount(studentsRes.data.students.length || 0);
    } catch (error) {
      toast.error('Failed to load class details: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = async (e) => {
    const section = e.target.value;
    setSelectedSection(section);

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/v1/students?class=${selectedClass}${section ? `&section=${section}` : ''}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAffectedStudentsCount(response.data.students.length || 0);
    } catch (error) {
      toast.error('Failed to fetch student count: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setSelectedMonths(prev =>
      prev.includes(value) ? prev.filter(m => m !== value) : [...prev, value]
    );
  };

  const handleOneTimeFeeChange = (feeName) => {
    setSelectedOneTimeFees(prev =>
      prev.includes(feeName) ? prev.filter(f => f !== feeName) : [...prev, feeName]
    );
  };

  const handleApplyExemption = () => {
    if (!selectedClass || (!selectedMonths.length && !selectedOneTimeFees.length)) {
      toast.warn('Please select a class and at least one month or additional fee to exempt.');
      return;
    }
    setIsConfirmationOpen(true);
  };

  const confirmExemption = async () => {
    setIsConfirmationOpen(false);
    setIsLoading(true);

    const additionalFeesExemptions = additionalFees.map(fee => ({
      name: fee.name,
      months: fee.frequency === 'monthly' && selectedMonths.length ? selectedMonths : [],
    })).filter(exemption =>
      (exemption.months.length > 0) || selectedOneTimeFees.includes(exemption.name)
    );

    const payload = {
      className: selectedClass,
      section: selectedSection || undefined,
      session,
      regularFeesMonths: selectedMonths,
      additionalFeesExemptions,
    };

    try {
      const response = await axios.post('/api/v1/fees/bulk-exemption', payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        toast.success('Bulk exemption applied successfully!');
        resetForm();
      } else {
        toast.error(response.data.message || 'Failed to apply bulk exemption.');
      }
    } catch (error) {
      toast.error('Error applying bulk exemption: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClass('');
    setSelectedSection('');
    setAdditionalFees([]);
    setSelectedMonths([]);
    setSelectedOneTimeFees([]);
    setAffectedStudentsCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Apply Bulk Fee Exemption</h2>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        <div className="space-y-6">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class *</label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="">-- Select a Class --</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Section Selection */}
          {sections.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Section</label>
              <select
                value={selectedSection}
                onChange={handleSectionChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">-- All Sections --</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          )}

          {/* Months Selection */}
          {selectedClass && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exempt Regular Fees and Monthly Additional Fees for Months
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {months.map(month => (
                  <label key={month} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={month}
                      checked={selectedMonths.includes(month)}
                      onChange={handleMonthChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">{month}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Additional Fees Selection */}
          {additionalFees.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exempt One-Time or Annual Additional Fees
              </label>
              <div className="space-y-2">
                {additionalFees.filter(fee => fee.frequency !== 'monthly').map(fee => (
                  <label key={fee.name} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={fee.name}
                      checked={selectedOneTimeFees.includes(fee.name)}
                      onChange={() => handleOneTimeFeeChange(fee.name)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-700">
                      {fee.name} ({fee.frequency}, ₹{fee.amount})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Summary and Apply Button */}
          {selectedClass && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-lg font-semibold text-blue-800">Summary</h3>
              <p className="text-sm text-gray-700">
                <strong>Class:</strong> {selectedClass} {selectedSection ? `(${selectedSection})` : ''}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Affected Students:</strong> {affectedStudentsCount}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Months to Exempt:</strong> {selectedMonths.length ? selectedMonths.join(', ') : 'None'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Additional Fees to Exempt:</strong>{' '}
                {selectedOneTimeFees.length ? selectedOneTimeFees.join(', ') : 'None'}
              </p>
              <button
                onClick={handleApplyExemption}
                className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={isLoading || (!selectedMonths.length && !selectedOneTimeFees.length)}
              >
                Apply Bulk Exemption
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <Transition show={isConfirmationOpen} as={React.Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsConfirmationOpen(false)}
          >
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                      Confirm Bulk Exemption
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to exempt fees for <strong>{selectedClass} {selectedSection ? `(${selectedSection})` : ''}</strong>:
                        <br />
                        - <strong>Months:</strong> {selectedMonths.length ? selectedMonths.join(', ') : 'None'}
                        <br />
                        - <strong>Additional Fees:</strong> {selectedOneTimeFees.length ? selectedOneTimeFees.join(', ') : 'None'}
                        <br />
                        This will affect <strong>{affectedStudentsCount}</strong> student(s). Proceed?
                      </p>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={confirmExemption}
                        className="flex-1 bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
                      >
                        Yes, Apply
                      </button>
                      <button
                        onClick={() => setIsConfirmationOpen(false)}
                        className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default BulkExemption;