
import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import AxiosInstance from "../../Axios";

const PatientRecordManagement = ({ setToast }) => {
  // ---------------- DATA ----------------
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [search, setSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");

  // ---------------- MODAL STATES ----------------
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add"); // add | update
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [form, setForm] = useState({
    patient_id: "",
    treatment_plan: "",
    prescription: "",
    procedure_done: "",
    visit_date: "",
    next_appointment: "",
    total_amount: "",
    clinical_notes: "",
  });

  // ---------------- FETCH PATIENTS ----------------
  const fetchPatients = async () => {
    try {
      const res = await AxiosInstance.get(`/patient-search/?q=${search}`);
      setPatients(res.data);
    } catch (err) {
      setToast({ show: true, message: "Error fetching patients", type: "danger" });
    }
  };

  // ---------------- FETCH RECORDS ----------------
  const fetchRecords = async (patient_id = selectedPatientId) => {
    if (!patient_id) return;
    try {
      const url = recordSearch
        ? `/search-patient-records/?patient_id=${patient_id}&search=${recordSearch}`
        : `/patient-records/?patient_id=${patient_id}`;

      const res = await AxiosInstance.get(url);
      setRecords(res.data);
    } catch (err) {
      setToast({ show: true, message: "Could not retrieve records", type: "danger" });
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      const firstId = patients[0].patient_id;
      setSelectedPatientId(firstId);
      fetchRecords(firstId);
    }
  }, [patients]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchRecords(selectedPatientId);
    }
  }, [recordSearch]);

  // ---------------- OPEN ADD ----------------
  const openAdd = (patient) => {
    setMode("add");
    setSelectedPatientId(patient.patient_id);
    setForm({
      patient_id: patient.patient_id,
      treatment_plan: "",
      prescription: "",
      procedure_done: "",
      visit_date: new Date().toISOString().split("T")[0],
      next_appointment: "",
      total_amount: "",
      clinical_notes: "",
    });
    setShowModal(true);
  };

  // ---------------- OPEN UPDATE ----------------
  const openUpdate = (record) => {
    setMode("update");
    setSelectedRecord(record);
    setForm({
      patient_id: record.patient_id,
      treatment_plan: record.treatment_plan,
      prescription: record.prescription,
      procedure_done: record.procedure_done,
      visit_date: record.visit_date,
      next_appointment: record.next_appointment,
      total_amount: record.total_amount,
      clinical_notes: Array.isArray(record.clinical_notes)
        ? record.clinical_notes.join(", ")
        : record.clinical_notes,
    });
    setShowModal(true);
  };

  // ---------------- SAVE ----------------
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        clinical_notes: form.clinical_notes
          ? form.clinical_notes.split(",").map((note) => note.trim())
          : [],
      };

      if (mode === "add") {
        await AxiosInstance.post("/add-patient-record/", payload);
        setToast({ show: true, message: "Record added successfully!", type: "success" });
      } else {
        await AxiosInstance.put("/update-patient-record/", {
          record_id: selectedRecord.record_id,
          ...payload,
        });
        setToast({ show: true, message: "Record updated successfully!", type: "success" });
      }

      setShowModal(false);
      fetchRecords();
    } catch (err) {
      const msg = err.response?.data?.detail || "Save failed";
      setToast({ show: true, message: msg, type: "danger" });
    }
  };

  const handleDeleteRecord = async (record_id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this clinical record?"
    );

    if (!confirmDelete) return;

    try {

      await AxiosInstance.delete(
        `/delete-patient-record/${record_id}/`
      );

      setToast({
        show: true,
        message: "Record deleted successfully!",
        type: "success",
      });

      fetchRecords();

    } catch (err) {

      const msg =
        err.response?.data?.error ||
        "Failed to delete record";

      setToast({
        show: true,
        message: msg,
        type: "danger",
      });

    }
  };

  // ---------------- TABLE ----------------
  const columns = useMemo(
    () => [
      { 
        accessorKey: "visit_date", 
        header: "Visit Date",
        cell: info => <strong style={{color: '#2d3748'}}>{info.getValue()}</strong> 
      },
      { accessorKey: "treatment_plan", header: "Treatment" },
      { accessorKey: "procedure_done", header: "Procedure" },
      { 
        accessorKey: "total_amount", 
        header: "Total",
        cell: info => `Rs. ${info.getValue()}`
      },
      {
        accessorKey: "clinical_notes",
        header: "Clinical Notes",
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val || (Array.isArray(val) && val.length === 0)) return "-";
          const notes = Array.isArray(val) ? val : String(val).split(",");
          return (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {notes.map((n, i) => (
                <span key={i} style={noteBadge}>{n}</span>
              ))}
            </div>
          );
        },
      },
        {
        header: "Actions",
        cell: ({ row }) => (
            <div style={{ display: "flex", gap: "8px" }}>

            {/* EDIT BUTTON */}
            <button 
                onClick={() => openUpdate(row.original)} 
                style={editBtnStyle}
            >
                Manage
            </button>

            {/* DELETE BUTTON (NEW) */}
            <button 
                onClick={() => handleDeleteRecord(row.original.record_id)} 
                style={{
                padding: "5px 12px",
                background: "#fed7d7",
                color: "#c53030",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600"
                }}
            >
                Delete
            </button>

            </div>
        ),
        },


    ],
    [records]
  );

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={container}>
      {/* HEADER & SEARCH */}
      <div style={topHeader}>
        <h2 style={{ margin: 0, fontWeight: 800, color: "#1a202c" }}>Patient Records Management</h2>
        <div style={{ position: 'relative', width: '300px' }}>
            <input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchField}
            />
        </div>
      </div>

      {/* PATIENT SELECTION GRID */}
      <div style={patientGrid}>
        {patients.map((p) => {
          const isActive = selectedPatientId === p.patient_id;
          return (
            <div 
              key={p.patient_id} 
              style={{ 
                ...card, 
                borderColor: isActive ? "#3182ce" : "transparent", 
                background: isActive ? "#ebf8ff" : "white",
                boxShadow: isActive ? "0 4px 12px rgba(49, 130, 206, 0.2)" : "0 2px 4px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ marginBottom: "16px", overflow: "hidden" }}>
                <h4 style={patientNameStyle}>
                  {p.name_first} {p.name_last}
                </h4>
                <div 
                  style={emailStyle} 
                  title={`${p.name_first} ${p.name_last} (${p.email})`}
                >
                  {p.email}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: 'auto' }}>
                <button 
                  onClick={() => { setSelectedPatientId(p.patient_id); fetchRecords(p.patient_id); }} 
                  style={isActive ? activeViewBtn : viewBtn}
                >
                  {isActive ? "Viewing" : "View Records"}
                </button>
                <button onClick={() => openAdd(p)} style={addBtn}>
                  + Record
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN RECORD SECTION */}
      <div style={tableWrap}>
        <div style={recordTitleBar}>
          <h3 style={{ margin: 0 }}>Clinical History</h3>
          <input
            type="text"
            placeholder="Filter by date (e.g. 2026-05)..."
            value={recordSearch}
            onChange={(e) => setRecordSearch(e.target.value)}
            style={filterInput}
          />
        </div>

        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} style={th}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} style={trHover}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ ...td, textAlign: "center", padding: '40px', color: '#a0aec0' }}>
                  No medical records found for this patient.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ borderBottom: '1px solid #edf2f7', marginBottom: '20px', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>{mode === "add" ? "New Clinical Record" : "Update Clinical Record"}</h3>
            </div>

            <div style={formGrid}>
                <div style={fieldGroup}>
                    <label style={labelStyle}>Treatment Plan</label>
                    <input value={form.treatment_plan} onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })} style={input} />
                </div>
                <div style={fieldGroup}>
                    <label style={labelStyle}>Procedure</label>
                    <input value={form.procedure_done} onChange={(e) => setForm({ ...form, procedure_done: e.target.value })} style={input} />
                </div>
                <div style={fieldGroup}>
                    <label style={labelStyle}>Visit Date</label>
                    <input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} style={input} />
                </div>
                <div style={fieldGroup}>
                    <label style={labelStyle}>Total Amount</label>
                    <input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} style={input} />
                </div>
                <div style={{ ...fieldGroup, gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Clinical Notes (Comma separated tags)</label>
                    <textarea rows="3" value={form.clinical_notes} onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })} style={{...input, resize: 'none'}} />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={cancelBtn}>Cancel</button>
              <button onClick={handleSubmit} style={saveBtn}>Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecordManagement;

/* ---------------- STYLES ---------------- */

const container = { padding: "30px 50px", backgroundColor: "transparent", minHeight: "100vh" };
const topHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };

const searchField = { 
    padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "100%", 
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)", outline: 'none' 
};

const patientGrid = { 
    display: "flex", 
    gap: "20px", 
    overflowX: "auto",      // Enables horizontal scrolling
    overflowY: "hidden",     // Prevents vertical jitter
    padding: "10px 5px 20px 5px", // Padding so shadows/borders aren't clipped
    marginBottom: "30px",
    width: "100%",
    scrollSnapType: "x proximity",
};

const card = { 
    flex: "0 0 350px",       
    padding: "24px", 
    background: "white", 
    borderRadius: "16px", 
    border: "2px solid",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease",
    cursor: "pointer",
    scrollSnapAlign: "start"
};

const viewBtn = { padding: "6px 12px", background: "#3182ce", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: '600', fontSize: '12px' };
const addBtn = { padding: "6px 12px", background: "white", color: "#3182ce", border: "1px solid #3182ce", borderRadius: "8px", cursor: "pointer", fontWeight: '600', fontSize: '12px' };

const tableWrap = { background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" };
const recordTitleBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const filterInput = { padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", width: '250px' };

const th = { textAlign: "left", padding: "12px 15px", color: "#718096", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" };
const td = { padding: "15px", backgroundColor: "#fff", borderBottom: "1px solid #f7fafc" };
const trHover = { transition: 'background 0.2s' };

const editBtnStyle = { padding: "5px 12px", background: "#edf2f7", color: "#2b6cb0", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: '600' };
const noteBadge = { background: '#e2e8f0', color: '#4a5568', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' };

const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(26, 32, 44, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalBox = { background: "white", padding: "30px", borderRadius: "20px", width: "600px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" };

const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#4a5568' };
const input = { padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", outline: 'none' };

const saveBtn = { padding: "10px 20px", background: "#3182ce", color: "white", border: "none", borderRadius: "10px", fontWeight: '600', cursor: 'pointer' };
const cancelBtn = { padding: "10px 20px", background: "#f7fafc", color: "#718096", border: "1px solid #e2e8f0", borderRadius: "10px", fontWeight: '600', cursor: 'pointer' };

const patientNameStyle = {
  margin: "0 0 4px 0",
  fontSize: "18px",
  fontWeight: "700",
  color: "#2d3748",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const emailStyle = { 
    color: "#718096", 
    fontSize: "14px",
    whiteSpace: "nowrap",      
    overflow: "hidden",         
    textOverflow: "ellipsis",   
    display: "block",
    width: "100%"
};

const activeViewBtn = { 
  ...viewBtn, 
  background: "#2b6cb0", 
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" 
};

