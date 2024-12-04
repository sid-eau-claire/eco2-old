import React, { useState } from 'react';
import { CellContext } from '@tanstack/react-table';

const EditableCell = ({ getValue, row, column }: CellContext<any, unknown>) => {
  const initialValue = getValue();
  const [cellValue, setCellValue] = useState(initialValue);

  const handleBlur = () => {
    // Update logic here
    console.log(`Updated row ${row.index} column ${column.id} to ${cellValue}`);
  };

  return (
    <input
      className="w-full border-none bg-transparent"
      value={cellValue as string}
      onChange={(e) => setCellValue(e.target.value)}
      onBlur={handleBlur}
    />
  );
};

export default EditableCell;
