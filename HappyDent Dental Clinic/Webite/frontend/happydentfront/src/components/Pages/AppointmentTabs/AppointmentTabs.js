import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";

const AppointmentTabs = ({ setToast }) => {
  const [activeTab, setActiveTab] = useState("accepted");

  const [accepted, setAccepted] = useState([]);
  const [pending, setPending] = useState([]);
  const [rejected, setRejected] = useState([]);

  const [loading, setLoading] = useState(true);

  // MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentTime, setAppointmentTime] = useState("");

  // ---------------- FETCH ----------------

  const fetchData = async () => {
    try {
      setLoading(true);

      const [accRes, penRes, rejRes] = await Promise.allSettled([
        AxiosInstance.get("/accepted-appointments/"),
        AxiosInstance.get("/pending-appointments/"),
        AxiosInstance.get("/rejected-appointments/"),
      ]);

      if (accRes.status === "fulfilled")
        setAccepted(accRes.value.data);

      if (penRes.status === "fulfilled")
        setPending(penRes.value.data);

      if (rejRes.status === "fulfilled")
        setRejected(rejRes.value.data);

      [accRes, penRes, rejRes].forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`Endpoint ${i} failed`, r.reason?.response?.data);
          setToast?.({
            show: true,
            message: `Failed to load some appointment data`,
            type: "error",
          });
        }
      });
    } catch (error) {
      console.error(error);
            setToast?.({
        show: true,
        message: "Something went wrong while fetching appointments",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------- ACCEPT ----------------

  const handleAccept = async () => {

    if (!appointmentTime) {
      setToast?.({
        show: true,
        message: "Please select appointment time",
        type: "error",
      });

      return;
    }

    try {
      await AxiosInstance.post("/appointment-acception/", {
        staff_id: selectedAppointment.staff_id,
        patient_id: selectedAppointment.patient_id,
        date: selectedAppointment.appointment_date,
        time: appointmentTime,
      });

      setShowModal(false);
      setAppointmentTime("");
      setSelectedAppointment(null);

      fetchData();
    } catch (error) {
       const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to accept appointment";
      console.error(
        "Accept Error:",
        error.response?.data || error.message
      );
        setToast?.({
        show: true,
        message: msg,
        type: "error",
      });
    }
  };

  // ---------------- REJECT ----------------

  const handleReject = async () => {
    try {
      await AxiosInstance.post("/appointment-rejection/", {
        staff_id: selectedAppointment.staff_id,
        patient_id: selectedAppointment.patient_id,
        date: selectedAppointment.appointment_date,
      });

      setShowModal(false);
      setAppointmentTime("");
      setSelectedAppointment(null);

      fetchData();
    } catch (error) {
      const msg =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.response?.data ||
      "Failed to reject appointment";

      console.error(
        "Reject Error:",
        error.response?.data || error.message
      );
      setToast?.({
        show: true,
        message: msg,
        type: "error",
      });
    }
  };

  // ---------------- TABLE DATA ----------------

  const data = useMemo(() => {
    if (activeTab === "accepted") return accepted;
    if (activeTab === "pending") return pending;
    return rejected;
  }, [activeTab, accepted, pending, rejected]);

  // ---------------- COLUMNS ----------------

  const columns = useMemo(
    () => [
      {
        accessorKey: "patient_name",
        header: "Patient",
        cell: ({ getValue }) => (
          <span
            style={{
              fontWeight: "600",
              color: "#2c3e50",
            }}
          >
            {getValue() || "—"}
          </span>
        ),
      },

      {
        accessorKey: "patient_id",
        header: "Patient ID",
      },

      {
        accessorKey: "appointment_date",
        header: "Date",
      },

      {
        accessorKey: "appointment_time",
        header: "Time",
        cell: ({ getValue }) => getValue() || "—",
      },

      {
        header: "Status",

        cell: () => {
          const status =
            activeTab === "accepted"
              ? "Accepted"
              : activeTab === "pending"
              ? "Pending"
              : "Rejected";

          const color =
            activeTab === "accepted"
              ? "#2f855a"
              : activeTab === "pending"
              ? "#d69e2e"
              : "#e53e3e";

          return (
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                background: `${color}20`,
                color,
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

          if (activeTab !== "pending") return null;

          return (
            <button
              onClick={() => {
                setSelectedAppointment(row.original);
                setShowModal(true);
              }}
              style={actionButtonStyle}
            > 
              Manage
            </button>
          );
      },
    },
    ],
    [activeTab]
  );

  // ---------------- TABLE ----------------

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---------------- UI ----------------

  return (
    <>
      <div style={containerStyle}>
        {/* HEADER */}
        <div style={headerSectionStyle}>
          <div>
            <h2 style={titleStyle}>
              Appointment Management
            </h2>

            <p style={subtitleStyle}>
              Manage accepted, pending, and rejected appointments.
            </p>
          </div>

          {/* TABS */}
          <div style={filterContainerStyle}>
            {["accepted", "pending", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...tabButton,
                  background:
                    activeTab === tab ? "#1a202c" : "#ffffff",
                  color:
                    activeTab === tab ? "#ffffff" : "#4a5568",
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div style={tableWrapperStyle}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0",
            }}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
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
                    Loading...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={emptyStyle}>
                    No appointments found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="table-row"
                    style={trStyle}
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

      {/* MODAL */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0 }}>
                Manage Appointment
              </h3>

              <button
                onClick={() => setShowModal(false)}
                style={closeButtonStyle}
              >
                ✕
              </button>
            </div>

            <div style={modalBodyStyle}>
              <p>
                <strong>Patient:</strong>{" "}
                {selectedAppointment?.patient_name}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {selectedAppointment?.appointment_date}
              </p>

              <label style={labelStyle}>
                Set Appointment Time
              </label>

              <input
                type="time"
                value={appointmentTime}
                onChange={(e) =>
                  setAppointmentTime(e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div style={modalFooterStyle}>
              <button
                style={rejectButtonStyle}
                onClick={handleReject}
              >
                Reject
              </button>

              <button
                style={acceptButtonStyle}
                onClick={handleAccept}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentTabs;

/* ---------------- STYLES ---------------- */

const containerStyle = {
  padding: "40px",
  background: "transparent",
  height: "calc(100vh - 120px)",
  display: "flex",
  flexDirection: "column",
  fontFamily: "'Inter', sans-serif",
};

const headerSectionStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "30px",
};

const titleStyle = {
  margin: 0,
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "800",
  letterSpacing: "-0.02em",
};

const subtitleStyle = {
  marginTop: "8px",
  color: "#718096",
  fontSize: "15px",
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

const tabButton = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  fontWeight: "600",
  transition: "0.2s",
};

const tableWrapperStyle = {
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  overflowY: "auto",
  flex: 1,
  border: "1px solid #edf2f7",
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

const emptyStyle = {
  padding: "30px",
  textAlign: "center",
  color: "#a0aec0",
};

const actionButtonStyle = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#3182ce",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
};

/* MODAL */

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalStyle = {
  width: "450px",
  background: "white",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
};

const modalHeaderStyle = {
  padding: "20px",
  borderBottom: "1px solid #edf2f7",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalBodyStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const modalFooterStyle = {
  padding: "20px",
  borderTop: "1px solid #edf2f7",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "18px",
};

const labelStyle = {
  fontWeight: "600",
  color: "#2d3748",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  outline: "none",
};

const rejectButtonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#e53e3e",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const acceptButtonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#38a169",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};