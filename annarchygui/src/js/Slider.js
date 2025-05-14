import React, { useState } from 'react';
import { Range } from 'react-range';

const Slider = ({ min = 0, max = 1000, step = 1, onChange }) => {
  const [values, setValues] = useState([min, max]); // inicio y fin

  const handleChange = (vals) => {
    setValues(vals);
    onChange(vals); // Pasar el rango hacia afuera si es necesario
  };

  if (min === max) {
    return ""; 
  }

  return (
    <div style={{ margin: '20px', width: '100%' }}>
      <Range
        step={step}
        min={min}
        max={max}
        values={values}
        onChange={handleChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '6px',
              width: '100%',
              backgroundColor: '#ddd',
              margin: '30px 0',
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            style={{
              ...props.style,
              height: '20px',
              width: '20px',
              backgroundColor: '#999',
              borderRadius: '50%',
              outline: 'none',
            }}
          />
        )}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label>
          Inicio:
          <input
            type="number"
            value={values[0]}
            min={min}
            max={values[1]}
            onChange={(e) => handleChange([Number(e.target.value), values[1]])}
            style={{ marginLeft: '10px', width: '60px' }}
          />
        </label>
        <label>
          Fin:
          <input
            type="number"
            value={values[1]}
            min={values[0]}
            max={max}
            onChange={(e) => handleChange([values[0], Number(e.target.value)])}
            style={{ marginLeft: '10px', width: '60px' }}
          />
        </label>
      </div>
    </div>
  );
};

export default Slider;