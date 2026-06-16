"use client"; // <--- CRITICAL FOR NEXT.JS
import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';

const CategorySelector = () => {
  const [options, setOptions] = useState([
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
  ]);
  const [selected, setSelected] = useState(null);

  const handleCreate = (inputValue) => {
    const newOption = { value: inputValue.toLowerCase(), label: inputValue };
    setOptions((prev) => [...prev, newOption]);
    setSelected(newOption);
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#1E293B',
      borderColor: '#334155',
      color: 'white',
      padding: '4px',
      borderRadius: '0.75rem',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#1E293B',
    }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? '#3B82F6' : 'transparent',
      color: 'white',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    input: (base) => ({ ...base, color: 'white' }),
  };

  return (
    <CreatableSelect
      isClearable
      options={options}
      value={selected}
      onChange={(newValue) => setSelected(newValue)}
      onCreateOption={handleCreate}
      styles={customStyles}
      placeholder="Select or type to create..."
    />
  );
};

export default CategorySelector;