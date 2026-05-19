import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const NurseManagement = ({ setToast }) => {
  // ---------------- STATES ----------------
  const [nurses, setNurses] = useState([]);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedNurse, setSelectedNurse] = useState(null);

  const [form, setForm] = useState({
    staff_id: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    gender: "",
    dept_id: "",
    shift_type: "",
    phone_numbers: "",
  });

  // ---------------- FETCH NURSES ----------------
  const fetchNurses = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (gender) params.append("gender", gender);
      if (shiftType) params.append("shift_type", shiftType);

      const res = await AxiosInstance.get(`/nurse-list-manager/?${params.toString()}`);
      setNurses(res.data || []);
    } catch (err) {
      setToast({
        show: true,
        message: "Failed to fetch nurses",
        type: "danger",
      });
    }
  };

  useEffect(() => {
    fetchNurses();
  }, [search, gender, shiftType]);

  // ---------------- HANDLERS ----------------
  const openAdd = () => {
    setMode("add");
    setForm({
      staff_id: "Auto-generated",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      gender: "",
      dept_id: "",
      shift_type: "",
      phone_numbers: "",
    });
    setShowModal(true);
  };

  const openUpdate = (nurse) => {
    setMode("update");
    setSelectedNurse(nurse);
    const nameParts = (nurse?.full_name || "").split(" ");
    setForm({
      staff_id: nurse.staff_id || "",
      email: nurse.email || "",
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      password: "",
      gender: nurse.gender || "",
      dept_id: nurse.dept_id || "",
      shift_type: nurse.shift_type || "",
      phone_numbers: Array.isArray(nurse.phone_numbers) ? nurse.phone_numbers.join(", ") : "",
    });
    setShowModal(true);
  };

  const handleDelete = async (staff_id) => {
    if (!window.confirm("Are you sure you want to delete this nurse?")) return;
    try {
      await AxiosInstance.delete(`/nurse-delete/${staff_id}/`);
      setToast({ show: true, message: "Nurse deleted successfully", type: "success" });
      fetchNurses();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.error || "Delete failed", type: "danger" });
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
            staff_id: form.staff_id,
            email: form.email,
            first_name: form.first_name,
            last_name: form.last_name,
            password: form.password,
            gender: form.gender,
            dept_id: form.dept_id,
            shift_type: form.shift_type,

            phone_numbers: form.phone_numbers
                ? form.phone_numbers.split(",").map(p => p.trim())
                : [],
            };
      if (mode === "add") {
        await AxiosInstance.post("/nurse-add/", payload);
        setToast({ show: true, message: "Nurse added successfully", type: "success" });
      } else {
        await AxiosInstance.put(`/nurse-edit/${selectedNurse.staff_id}/`, payload);
        setToast({ show: true, message: "Nurse updated successfully", type: "success" });
      }
      setShowModal(false);
      fetchNurses();
    } catch (err) {
      setToast({ show: true, message: err.response?.data?.error || "Operation failed", type: "danger" });
    }
  };

  // ---------------- TABLE CONFIG ----------------
  const columns = useMemo(() => [
    { accessorKey: "staff_id", header: "ID" },
    { accessorKey: "full_name", header: "Nurse Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "shift_type", header: "Shift" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={editBtn} onClick={() => openUpdate(row.original)}>Manage</button>
          <button style={deleteBtn} onClick={() => handleDelete(row.original.staff_id)}>Delete</button>
        </div>
      ),
    },
  ], [nurses]);

  const table = useReactTable({
    data: nurses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={container}>
      <div style={topBar}>
        <h2 style={heading}>Nurse Management</h2>
        <button style={addBtn} onClick={openAdd}>+ Add Nurse</button>
      </div>

      <div style={filterBar}>
        <input
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />
        <CustomSelect
          options={[
            { value: "", label: "All Genders" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
          value={gender}
          onChange={setGender}
        />
        <input
          placeholder="Filter by Shift..."
          value={shiftType}
          onChange={(e) => setShiftType(e.target.value)}
          style={input}
        />


      </div>

      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} style={th}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} style={rowStyle}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3 style={{ marginBottom: "20px", fontWeight: "700" }}>
              {mode === "add" ? "Add New Nurse" : "Update Nurse Details"}
            </h3>
            <div style={formGrid}>
              <input 
                style={input} placeholder="Email Address" value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})} 
              />
              <input 
                style={input} placeholder="First Name" value={form.first_name}
                onChange={(e) => setForm({...form, first_name: e.target.value})} 
              />
              <input 
                style={input} placeholder="Last Name" value={form.last_name}
                onChange={(e) => setForm({...form, last_name: e.target.value})} 
              />
              <input 
                style={input} placeholder="Password" type="password" value={form.password} disabled={mode === "update"} 
                onChange={(e) => setForm({...form, password: e.target.value})} 
              />
              <input 
                style={input} placeholder="Dept ID" value={form.dept_id}
                onChange={(e) => setForm({...form, dept_id: e.target.value})} 
              />
              <input 
                style={input} placeholder="Shift (e.g. Day/Night)" value={form.shift_type}
                onChange={(e) => setForm({...form, shift_type: e.target.value})} 
              />

              <input
                style={input}
                placeholder="Phone Numbers (comma separated)"
                value={form.phone_numbers}
                onChange={(e) =>
                    setForm({ ...form, phone_numbers: e.target.value })
                }
            />

              <CustomSelect
                options={[{value:"Male", label:"Male"}, {value:"Female", label:"Female"}]}
                value={form.gender}
                onChange={(v) => setForm({...form, gender: v})}
              />
            </div>
            <div style={modalActions}>
              <button style={cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={saveBtn} onClick={handleSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- CONSISTENT STYLES ----------------

const container = { padding: "40px", background: "transparent", minHeight: "100vh" };
const topBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const heading = { fontSize: "28px", fontWeight: "800", color: "#2d3748", margin: 0 };

const addBtn = {
  padding: "12px 24px",
  background: "#3182ce",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s"
};

const filterBar = { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "20px", marginBottom: "30px" };

const tableWrap = { 
  background: "white", 
  borderRadius: "20px", 
  padding: "10px", 
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" ,
  maxHeight: "65vh",       // Sets a specific height (65% of viewport height)
  overflowY: "auto",      // Adds vertical scroll if content is too long
  overflowX: "auto",      // Adds horizontal scroll for small screens
  position: "relative",

};

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: "16px", borderBottom: "2px solid #edf2f7", color: "#718096", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 10,
            };
            
const td = { padding: "16px", borderBottom: "1px solid #edf2f7", color: "#4a5568", fontSize: "15px" };
const rowStyle = { transition: "background 0.2s" };

const input = { 
  padding: "12px 16px", 
  border: "1px solid #e2e8f0", 
  borderRadius: "12px", 
  outline: "none", 
  fontSize: "15px",
  background: "white"
};

const editBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#ebf8ff", color: "#3182ce", fontWeight: "600", cursor: "pointer" };
const deleteBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#fff5f5", color: "#e53e3e", fontWeight: "600", cursor: "pointer" };

const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(26, 32, 44, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modal = { background: "white", padding: "40px", borderRadius: "24px", width: "100%", maxWidth: "700px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const modalActions = { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "30px" };

const cancelBtn = { padding: "12px 24px", border: "1px solid #e2e8f0", background: "white", borderRadius: "12px", color: "#718096", fontWeight: "600", cursor: "pointer" };
const saveBtn = { ...addBtn };

export default NurseManagement;