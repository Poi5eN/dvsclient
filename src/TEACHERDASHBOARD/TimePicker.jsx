import React, { useState } from 'react';

const TimePicker = ({ value, onChange }) => {
  const [hours, setHours] = useState(value ? value.split(':')[0] : '12');
  const [minutes, setMinutes] = useState(value ? value.split(':')[1] : '00');
  const [period, setPeriod] = useState(value && Number(hours) < 12 ? 'AM' : 'PM');

  const handleTimeChange = () => {
    const adjustedHours = period === 'PM' && hours < 12 ? parseInt(hours) + 12 : hours;
    const timeValue = `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onChange(timeValue);
  };

  return (
    <div className="flex items-center">
      <select
        value={hours}
        onChange={(e) => {
          setHours(e.target.value);
          handleTimeChange();
        }}
        className="border rounded-lg p-2"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
      :
      <select
        value={minutes}
        onChange={(e) => {
          setMinutes(e.target.value);
          handleTimeChange();
        }}
        className="border rounded-lg p-2"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={String(i).padStart(2, '0')}>
            {String(i).padStart(2, '0')}
          </option>
        ))}
      </select>
      <select
        value={period}
        onChange={(e) => {
          setPeriod(e.target.value);
          handleTimeChange();
        }}
        className="border rounded-lg p-2"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimePicker;
