import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect } from "react";

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const App = () => {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const days = getDaysInMonth(year, month);
  const [data, setData] = useState([]);

useEffect(() => {
  const days = getDaysInMonth(year, month);
  setData(
    Array.from({ length: days }, (_, i) => ({
      date: i + 1,
      classes: Array(7).fill(""),
    }))
  );
}, [month, year]);

  const handleInput = (dayIdx, classIdx, value) => {
    const newData = [...data];
    newData[dayIdx].classes[classIdx] = value;
    setData(newData);
  };

  const getSum = (arr, from, to) =>
    arr
      .slice(from, to + 1)
      .map(Number)
      .reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);

  const totalByColumn = (idx) =>
    data
      .map((row) => Number(row.classes[idx]))
      .reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);

  const totalRange = (from, to) =>
    data.reduce((sum, row) => sum + getSum(row.classes, from, to), 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "Date",
      ...Array.from({ length: 7 }, (_, i) => `Class ${i + 1}`),
      "1-5",
      "6-7",
    ];

    const tableRows = data.map((row) => {
      const classData = row.classes.map(Number);
      const sum1to5 = getSum(classData, 0, 4);
      const sum6to7 = getSum(classData, 5, 6);
      return [row.date, ...classData, sum1to5, sum6to7];
    });

    const totalRow = [
      "Total",
      ...[...Array(7)].map((_, i) => totalByColumn(i)),
      totalRange(0, 4),
      totalRange(5, 6),
    ];
    tableRows.push(totalRow);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    const monthName = new Date(year, month).toLocaleString("default", {
      month: "long",
    });
  
    const fileName = `attendance_report_${monthName}_${year}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Class Attendance Tracker
      </h1>

      {/* Month-Year Input */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold">Month:</label>
          <input
            type="number"
            value={month + 1}
            min={1}
            max={12}
            onChange={(e) => setMonth(Number(e.target.value) - 1)}
            className="border p-1 w-24 sm:w-auto"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border p-1 w-24 sm:w-auto"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border w-full text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Date</th>
              {[...Array(7)].map((_, i) => (
                <th key={i} className="border px-2 py-1">
                  Class {i + 1}
                </th>
              ))}
              <th className="border px-2 py-1">1-5</th>
              <th className="border px-2 py-1">6-7</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, dayIdx) => (
              <tr key={dayIdx}>
                <td className="border px-2 py-1">{row.date}</td>
                {row.classes.map((val, classIdx) => (
                  <td key={classIdx} className="border px-2 py-1">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) =>
                        handleInput(dayIdx, classIdx, e.target.value)
                      }
                      className="w-16 border rounded px-1 py-0.5 text-center"
                    />
                  </td>
                ))}
                <td className="border px-2 py-1 text-center">
                  {getSum(row.classes, 0, 4)}
                </td>
                <td className="border px-2 py-1 text-center">
                  {getSum(row.classes, 5, 6)}
                </td>
              </tr>
            ))}
            <tr className="font-semibold bg-gray-100">
              <td className="border px-2 py-1">Total</td>
              {[...Array(7)].map((_, i) => (
                <td key={i} className="border px-2 py-1 text-center">
                  {totalByColumn(i)}
                </td>
              ))}
              <td className="border px-2 py-1 text-center">
                {totalRange(0, 4)}
              </td>
              <td className="border px-2 py-1 text-center">
                {totalRange(5, 6)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PDF Button */}
      <div className="text-center mt-4">
        <button
          onClick={exportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default App;
