import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import AxiosInstance from "../Axios";
import CustomSelect from "../CustomSelect/CustomSelect";


const Doctor = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [gender, setGender] = useState("");

  const fetchDoctors = async () => {
    try {
      let url = `/doctors/?search=${search}&specialization=${specialization}&gender=${gender}`;

      console.log("REQUEST URL:", url);

      const response = await AxiosInstance.get(url);

      console.log("FULL RESPONSE:", response);

      console.log("RESPONSE DATA:", response.data);

      console.log("TOTAL ROWS:", response.data.length);

      setData(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization, gender]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Doctor Name",
        cell: ({ getValue }) => (
          <span style={{ fontWeight: "600", color: "#2c3e50" }}>{getValue()}</span>
        ),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ getValue }) => (
          <span style={{ 
            textTransform: "capitalize", 
            padding: "4px 12px", 
            borderRadius: "20px", 
            fontSize: "12px",
            background: getValue() === 'female' ? '#fff0f6' : '#e6f7ff',
            color: getValue() === 'female' ? '#c41d7f' : '#096dd9'
          }}>
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "department",
        header: "Department",
      },
      {
        accessorKey: "qualifications",
        header: "Qualifications",
        cell: ({ row }) => row.original.qualifications.join(", "),
      },
      {
        accessorKey: "specializations",
        header: "Specializations",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {row.original.specializations.map((s, i) => (
              <span key={i} style={badgeStyle}>{s}</span>
            ))}
          </div>
        ),
      },
      
      {
        accessorKey: "availability",
        header: "Availability",

        cell: ({ getValue }) => {

          const available = getValue();

          return (
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: available ? "#f0fff4" : "#fff5f5",
                color: available ? "#2f855a" : "#e53e3e",
              }}
            >
              {available ? "Available" : "Not Available"}
            </span>
          );
        },
      },

    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={containerStyle}>
      <div style={headerSectionStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ margin: 0, color: "#1a1a1a", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>
            Find Your Dental Specialist
          </h2>
          <p style={{ margin: 0, marginLeft:12, color: "#718096", fontSize: "15px", fontWeight: "400" }}>
            Browse our network of certified professionals dedicated to your oral health.
          </p>
        </div>
        
        <div style={filterContainerStyle}>
          <input
            type="text"
            placeholder="Search doctor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Search specialization..."
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            style={inputStyle}
          />

          <CustomSelect
            options={[
              { value: "", label: "All Genders" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
            value={gender}
            onChange={(value) => setGender(value)}
          />
        </div>
      </div>

      <div style={tableWrapperStyle}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={thStyle}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="table-row" style={trStyle}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={tdStyle}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Styles ---

const containerStyle = {
  padding: "40px",
  background: "transparent",
  height: "calc(100vh - 120px)",
  display:'flex',
  flexDirection: "column",
  fontFamily: "'Inter', sans-serif",
};

const headerSectionStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "left",
  marginBottom: "30px",
};

const tableWrapperStyle = {
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  overflowY: "auto",
  flex: 1,
  border: "1px solid #edf2f7",
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  width: "280px",
  outline: "none",
  fontSize: "14px",
  transition: "border-color 0.2s",
};

const selectStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  outline: "none",
  fontSize: "14px",
};

const thStyle = {
  padding: "16px 24px",
  textAlign: "left",
  background: "#fcfcfd",
  color: "#718096",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #edf2f7",
};

const tdStyle = {
  padding: "20px 24px",
  fontSize: "14px",
  color: "#4a5568",
  borderBottom: "1px solid #f7fafc",
  verticalAlign: "middle",
};

const trStyle = {
  transition: "background-color 0.2s",
};

const badgeStyle = {
  background: "#f1f5f9",
  color: "#475569",
  padding: "2px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "500",
};

const filterContainerStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "center",
  padding: "10px",
  background: "rgba(255,255,255,0.7)",
  borderRadius: "12px",
  backdropFilter: "blur(8px)",
};

export default Doctor;