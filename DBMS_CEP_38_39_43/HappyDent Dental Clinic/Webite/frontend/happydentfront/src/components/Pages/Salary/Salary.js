import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";

const StaffSalary = () => {
  const [data, setData] = useState([]);
  const [totalNetSalary, setTotalNetSalary] = useState(0);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("monthly"); // 👈 NEW

  // ---------------- FETCH ----------------

  const fetchSalary = async (selectedView = view) => {
    try {
      setLoading(true);

      const [salaryRes, summaryRes] = await Promise.all([
        AxiosInstance.get(
          `/staff-salary/?view=${selectedView}`
        ),
        AxiosInstance.get("/staff-salary-summary/"),
      ]);

      setData(salaryRes.data);
      setTotalNetSalary(summaryRes.data.total_net_salary);

    } catch (err) {
      console.error("Salary fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalary(view);
  }, [view]);

  // ---------------- DYNAMIC COLUMNS ----------------

  const columns = useMemo(() => {
    if (view === "yearly") {
      return [
        {
          accessorKey: "year",
          header: "Year",
        },
        {
          accessorKey: "total_base_salary",
          header: "Base Salary",
        },
        {
          accessorKey: "total_bonus",
          header: "Bonus",
        },
        {
          accessorKey: "total_deduction",
          header: "Deduction",
        },
        {
          accessorKey: "total_net_salary",
          header: "Net Salary",
          cell: ({ getValue }) => (
            <span style={{ fontWeight: "700", color: "#2f855a" }}>
              {getValue()}
            </span>
          ),
        },
      ];
    }

    // monthly
    return [
      {
        accessorKey: "payment_date",
        header: "Date",
      },
      {
        accessorKey: "amount",
        header: "Base Salary",
      },
      {
        accessorKey: "bonus",
        header: "Bonus",
      },
      {
        accessorKey: "deduction",
        header: "Deduction",
      },
      {
        accessorKey: "net_salary",
        header: "Net Salary",
        cell: ({ getValue }) => (
          <span style={{ fontWeight: "700", color: "#2f855a" }}>
            {getValue()}
          </span>
        ),
      },
    ];
  }, [view]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---------------- UI ----------------

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>My Salary</h2>
          <p style={{ margin: 0, color: "#718096" }}>
            {view === "monthly"
              ? "Monthly salary records"
              : "Yearly salary summary"}
          </p>
        </div>

        {/* VIEW SWITCH */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setView("monthly")}
            style={{
              ...tabButton,
              background: view === "monthly" ? "#1a202c" : "white",
              color: view === "monthly" ? "white" : "#1a202c",
            }}
          >
            Monthly
          </button>

          <button
            onClick={() => setView("yearly")}
            style={{
              ...tabButton,
              background: view === "yearly" ? "#1a202c" : "white",
              color: view === "yearly" ? "white" : "#1a202c",
            }}
          >
            Yearly
          </button>
        </div>

        {/* TOTAL CARD */}
        <div style={totalCard}>
          <h4 style={{ margin: 0, color: "#718096" }}>
            Total Net Salary
          </h4>
          <h2 style={{ margin: 0, color: "#1a202c" }}>
            {totalNetSalary}
          </h2>
        </div>
      </div>

      {/* TABLE */}
      <div style={tableWrapper}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                <td colSpan={10} style={empty}>
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={10} style={empty}>
                  No salary records found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
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

export default StaffSalary;

/* ---------------- STYLES ---------------- */

const containerStyle = {
  padding: "30px",
  background: "#f7fafc",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  gap: "10px",
};

const totalCard = {
  background: "white",
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid #eee",
  textAlign: "right",
  minWidth: "200px",
};

const tableWrapper = {
  background: "white",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #eee",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  background: "#f7fafc",
  fontWeight: "600",
};

const tdStyle = {
  padding: "12px",
  borderTop: "1px solid #f1f1f1",
};

const empty = {
  textAlign: "center",
  padding: "20px",
  color: "#999",
};

const tabButton = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  cursor: "pointer",
};