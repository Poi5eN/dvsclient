import React, { useState } from 'react';
import SelectInput from './SelectInput';

const Abc = () => {
    const [selectedValue, setSelectedValue] = useState('');

    const handleSelect = (value) => {
        setSelectedValue(value)
        console.log('selected value', value)
    };


  const programmingLanguages = ["Python", "Javascript", "Node", "PHP", "Go", "Java", "C#", "C++", "Ruby", "Swift", "Kotlin"];

  return (
     <div className="p-4">
        <SelectInput options={programmingLanguages} onSelect={handleSelect} />
         {selectedValue && (
           <p className="mt-4"> Selected Value: <span className="font-medium">{selectedValue}</span></p>
        )}
     </div>
  );
};

export default Abc;