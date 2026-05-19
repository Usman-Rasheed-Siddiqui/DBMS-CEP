import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";

const MyPatientRecords = ({ setToast }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");

  const fetchRecords = async (date = "") => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get(
        `/my-patient-records/${date ? `?date=${date}` : ""}`
      );
      setRecords(res.data);
    } catch (error) {
      const msg =
        error.response?.data?.detail ||
        error.response?.data ||
        error.message ||
        "Failed to fetch patient records";
      setToast({ show: true, message: msg, type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSearch = () => {
    fetchRecords(dateFilter);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "visit_date",
        header: "Visit Date",
        cell: (info) => (
          <span style={{ fontWeight: "600", color: "#2d3748" }}>
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "treatment_plan",
        header: "Treatment",
      },
      {
        accessorKey: "prescription",
        header: "Prescription",
      },
      {
        accessorKey: "procedure_done",
        header: "Procedure",
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: (info) => (
          <span style={{ fontWeight: "500" }}>Rs. {info.getValue()}</span>
        ),
      },
      {
        accessorKey: "amount_paid",
        header: "Status",
        cell: (info) => {
          const paid = parseFloat(info.getValue() || 0);
          const total = parseFloat(info.row.original.total_amount || 0);
          const isFullyPaid = paid >= total && total > 0;

          return (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                backgroundColor: isFullyPaid ? "#C6F6D5" : "#FEEBC8",
                color: isFullyPaid ? "#22543D" : "#744210",
                display: "inline-block",
              }}
            >
              {isFullyPaid ? "PAID" : `OWE: Rs. ${total - paid}`}
            </span>
          );
        },
      },
      {
        accessorKey: "next_appointment",
        header: "Next Visit",
        cell: (info) => info.getValue() || "---",
      },
    ],
    []
  );

  const data = useMemo(() => records, [records]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>My Dental Records</h2>
          <p style={subtitleStyle}>View your treatment history and follow-ups</p>
        </div>

        {/* SEARCH / FILTERS */}
        <div style={searchBoxStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#4A5568" }}>
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button onClick={handleSearch} style={buttonStyle}>
            Search
          </button>

          <button
            onClick={() => {
              setDateFilter("");
              fetchRecords();
            }}
            style={resetButtonStyle}
          >
            Reset
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={tableWrapperStyle}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} style={thStyle}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={emptyStyle}>
                  <div className="loading-spinner"></div>
                  <p style={{ marginTop: "10px" }}>Loading records...</p>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={10} style={emptyStyle}>
                  <div style={{ fontSize: "32px", marginBottom: "10px" }}>📁</div>
                  No records found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={trStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={tdStyle}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const containerStyle = {
  padding: "40px 50px",
  display: "flex",
  flexDirection: "column",
  height: "calc(100vh - 120px)",
  backgroundColor: "transparent",
  fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "30px",
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "800",
  color: "#1A202C",
  letterSpacing: "-0.5px",
};

const subtitleStyle = {
  marginTop: "4px",
  color: "#718096",
  fontSize: "14px",
};

const searchBoxStyle = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-end",
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #CBD5E0",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
};

const buttonStyle = {
  padding: "11px 20px",
  background: "#3182CE",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 4px 6px -1px rgba(66, 153, 225, 0.4)",
  transition: "transform 0.1s",
};

const resetButtonStyle = {
  padding: "11px 20px",
  background: "#EDF2F7",
  color: "#4A5568",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};

const tableWrapperStyle = {
  background: "white",
  borderRadius: "16px",
  overflow: "hidden",
  flex: 1,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  border: "1px solid #E2E8F0",
};

const thStyle = {
  padding: "16px 20px",
  background: "#F8FAFC",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "700",
  color: "#4A5568",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "2px solid #EDF2F7",
};

const tdStyle = {
  padding: "16px 20px",
  borderBottom: "1px solid #EDF2F7",
  fontSize: "14px",
  color: "#2D3748",
  verticalAlign: "middle",
};

const trStyle = {
  transition: "background-color 0.2s ease",
};

const emptyStyle = {
  padding: "60px",
  textAlign: "center",
  color: "#A0AEC0",
  fontSize: "16px",
};

export default MyPatientRecords;