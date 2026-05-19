
import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";

const PatientAppointments = () => {

  // ---------------- STATE ----------------

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("All");

  // ---------------- FETCH ----------------

  const fetchAppointments = async () => {

    try {

      setLoading(true);

      let url = "/patient-appointments/";

      if (statusFilter !== "All") {
        url += `?status=${statusFilter}`;
      }

      const res = await AxiosInstance.get(url);

      setAppointments(res.data);

    } catch (err) {

      console.error(
        "Appointment fetch error:",
        err.response?.data || err.message
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  // ---------------- CANCEL ----------------

  const handleCancel = async (appointment) => {

    try {

      await AxiosInstance.post(
        "/cancel-appointment/",
        {
          staff_id: appointment.staff_id,
          appointment_date: appointment.appointment_date,
        }
      );

      fetchAppointments();

    } catch (err) {

      console.error(
        "Cancel error:",
        err.response?.data || err.message
      );

    }
  };

  // ---------------- STATUS BADGE ----------------

  const getStatusStyle = (status) => {

    if (status === "Pending") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "Accepted") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  };

  // ---------------- TABLE ----------------

  const columns = useMemo(
    () => [
      {
        accessorKey: "doctor_name",
        header: "Doctor",
      },

      {
        accessorKey: "appointment_date",
        header: "Date",
      },

      {
        accessorKey: "appointment_time",
        header: "Time",
        cell: ({ row }) => {

          const status = row.original.status;

          if (status === "Pending") {
            return "Awaiting Approval";
          }

          if (status === "Rejected") {
            return "-";
          }

          return row.original.appointment_time;
        },
      },

      {
        accessorKey: "status",
        header: "Status",

        cell: ({ getValue }) => {

          const status = getValue();

          return (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "600",
                ...getStatusStyle(status),
              }}
            >
              {status}
            </span>
          );
        },
      },

      {
        header: "Actions",

        cell: ({ row }) => {

          const appointment = row.original;

          if (appointment.status !== "Pending") {
            return "-";
          }

          return (
            <button
              onClick={() => handleCancel(appointment)}
              style={cancelBtn}
            >
              Cancel
            </button>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---------------- UI ----------------

  return (
    <div style={container}>

      {/* HEADER */}

      <div style={header}>

        <div>
          <h2 style={{ margin: 0 }}>
            My Appointments
          </h2>

          <p style={subtitle}>
            Track all appointment requests
          </p>
        </div>

        {/* FILTERS */}

        <div style={filterWrap}>

          {[
            "All",
            "Pending",
            "Accepted",
            "Rejected",
          ].map((item) => (

            <button
              key={item}
              onClick={() => setStatusFilter(item)}
              style={{
                ...filterBtn,
                background:
                  statusFilter === item
                    ? "#3182ce"
                    : "white",

                color:
                  statusFilter === item
                    ? "white"
                    : "#333",
              }}
            >
              {item}
            </button>

          ))}
        </div>
      </div>

      {/* TABLE */}

      <div style={tableWrap}>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >

          <thead>

            {table.getHeaderGroups().map((hg) => (

              <tr key={hg.id}>

                {hg.headers.map((header) => (

                  <th
                    key={header.id}
                    style={th}
                  >
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
                <td
                  colSpan={10}
                  style={empty}
                >
                  Loading...
                </td>
              </tr>

            ) : table.getRowModel().rows.length === 0 ? (

              <tr>
                <td
                  colSpan={10}
                  style={empty}
                >
                  No appointments found
                </td>
              </tr>

            ) : (

              table.getRowModel().rows.map((row) => (

                <tr key={row.id}>

                  {row.getVisibleCells().map((cell) => (

                    <td
                      key={cell.id}
                      style={td}
                    >
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

export default PatientAppointments;

/* ---------------- STYLES ---------------- */

const container = {
  padding: "30px",
  background: "#f8fafc",
  minHeight: "100vh",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const subtitle = {
  color: "#64748b",
  marginTop: "4px",
};

const filterWrap = {
  display: "flex",
  gap: "10px",
};

const filterBtn = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  cursor: "pointer",
  fontWeight: "600",
};

const tableWrap = {
  background: "white",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #eee",
};

const th = {
  textAlign: "left",
  padding: "14px",
  background: "#f1f5f9",
  fontWeight: "700",
};

const td = {
  padding: "14px",
  borderTop: "1px solid #f1f5f9",
};

const empty = {
  textAlign: "center",
  padding: "30px",
  color: "#999",
};

const cancelBtn = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "8px",
  background: "#ef4444",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};