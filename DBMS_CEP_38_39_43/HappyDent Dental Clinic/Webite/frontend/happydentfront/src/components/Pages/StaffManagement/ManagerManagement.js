import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const ManagerManagement = ({ setToast }) => {
  // ---------------- AUTH LOGIC (Direct from Storage) ----------------
  

    
  // ---------------- STATES ----------------
  const [managers, setManagers] = useState([]);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedManager, setSelectedManager] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [form, setForm] = useState({
    staff_id: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    gender: "",
    dept_id: "",
    clearance_level: "MEDIUM",
    budget_authority: "",
    budget_used: "",
    phone_numbers: "",
  });

  // ---------------- FETCH DATA ----------------
  const fetchManagers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (gender) params.append("gender", gender);

      const res = await AxiosInstance.get(`/management-list-manager/?${params.toString()}`);
      setManagers(res.data || []);
    } catch (err) {
      setToast({ show: true, message: "Failed to fetch managers", type: "danger" });
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchCurrentUser();
  }, [search, gender]);



  // ---------------- HANDLERS ----------------

    const fetchCurrentUser = async () => {
    try {
        const res = await AxiosInstance.get("/current-staff-info/");
        setCurrentUser(res.data);
    } catch (err) {
        console.error(err);
    }
    };

  const isHighAccess =
  currentUser?.clearance_level === "HIGH";

  const openAdd = () => {

    if (!isHighAccess) return;

    setMode("add");

    setForm({
      staff_id: "Auto-generated",
      email: "",

      first_name: "",
      last_name: "",

      password: "",

      gender: "",

      dept_id: "",

      clearance_level: "MEDIUM",

      budget_authority: "",
      budget_used: "0",

      phone_numbers: "",
    });

    setShowModal(true);
  };

  const openUpdate = (manager) => {

    if (!isHighAccess) return;

    setMode("update");

    setSelectedManager(manager);

    const nameParts = (
      manager?.full_name || ""
    ).split(" ");

    setForm({
      staff_id: manager.staff_id || "",

      email: manager.email || "",

      first_name: nameParts[0] || "",

      last_name:
        nameParts.slice(1).join(" ") || "",

      password: "",

      gender: manager.gender || "",

      dept_id: manager.dept_id || "",

      clearance_level:
        manager.clearance_level || "MEDIUM",

      budget_authority:
        manager.budget_authority || "",

      budget_used:
        manager.budget_used || "0",

      phone_numbers: Array.isArray(
        manager.phone_numbers
      )
        ? manager.phone_numbers.join(", ")
        : "",
    });

    setShowModal(true);
  };

  const handleDelete = async (staff_id) => {
    if (!isHighAccess) return;
    if (!window.confirm("Are you sure you want to delete this manager?")) return;
    try {
      await AxiosInstance.delete(`/manager-delete/${staff_id}/`);
      setToast({ show: true, message: "Deleted successfully", type: "success" });
      fetchManagers();
    } catch (err) {
      setToast({ show: true, message: "Delete failed", type: "danger" });
    }
  };

  const handleSubmit = async () => {

    if (!form.gender) {

      setToast({
        show: true,
        message: "Gender is required",
        type: "danger"
      });

      return;
    }

    try {

      const payload = {

        ...form,

        budget_authority:
          form.budget_authority || 0,

        budget_used:
          form.budget_used || 0,

        phone_numbers: form.phone_numbers
          ? form.phone_numbers
              .split(",")
              .map(p => p.trim())
              .filter(p => p !== "")
          : [],
      };

      if (mode === "add") {

        await AxiosInstance.post(
          "/manager-add/",
          payload
        );

      } else {

        await AxiosInstance.put(
          `/manager-edit/${selectedManager.staff_id}/`,
          payload
        );

      }

      setShowModal(false);

      fetchManagers();

      setToast({
        show: true,
        message: "Operation successful",
        type: "success"
      });

    } catch (err) {

      setToast({
        show: true,
        message:
          err.response?.data?.error ||
          "Operation failed",
        type: "danger"
      });

    }
  };

  // ---------------- TABLE COLUMNS ----------------
  const columns = useMemo(() => [

    {
      accessorKey: "staff_id",
      header: "ID"
    },

    {
      accessorKey: "full_name",
      header: "Manager Name"
    },

    {
      accessorKey: "email",
      header: "Email"
    },

    {
      accessorKey: "gender",
      header: "Gender"
    },

    {
      accessorKey: "clearance_level",
      header: "Clearance"
    },

    {
      accessorKey: "budget_authority",
      header: "Budget Authority",
      cell: ({ getValue }) =>
        `Rs. ${getValue() || 0}`
    },

    {
      accessorKey: "budget_used",
      header: "Budget Used",
      cell: ({ getValue }) =>
        `Rs. ${getValue() || 0}`
    },

    {
      accessorKey: "remaining_budget",
      header: "Remaining",
      cell: ({ getValue }) =>
        `Rs. ${getValue() || 0}`
    },

    {
      header: "Actions",

      cell: ({ row }) => (

        <div style={{
          display: "flex",
          gap: "8px"
        }}>

          <button
            style={{
              ...editBtn,
              opacity: isHighAccess ? 1 : 0.5,
              cursor: isHighAccess
                ? "pointer"
                : "not-allowed"
            }}

            onClick={() =>
              isHighAccess &&
              openUpdate(row.original)
            }
          >
            Manage
          </button>

          <button
            style={{
              ...deleteBtn,
              opacity: isHighAccess ? 1 : 0.5,
              cursor: isHighAccess
                ? "pointer"
                : "not-allowed"
            }}

            onClick={() =>
              isHighAccess &&
              handleDelete(
                row.original.staff_id
              )
            }
          >
            Delete
          </button>

        </div>

      ),
    },

  ], [managers, isHighAccess]);

  const table = useReactTable({
    data: managers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={container}>
      {/* TOP BAR */}
      <div style={topBar}>
        <h2 style={heading}>Manager Management</h2>
        <button 
          style={{ ...addBtn, opacity: isHighAccess ? 1 : 0.5, cursor: isHighAccess ? "pointer" : "not-allowed" }} 
          onClick={() => isHighAccess ? openAdd() : setToast({ show: true, message: "Permission Denied: High Clearance Required", type: "danger" })}
        >
          + Add Manager
        </button>
      </div>

      {/* FILTERS */}
      <div style={filterBar}>
        <input 
          placeholder="Search managers..." 
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
      </div>

      {/* SCROLLABLE TABLE */}
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

      {/* UNIFIED MODAL */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3 style={{ marginBottom: "25px", fontWeight: "700", color: "#2d3748" }}>
              {mode === "add" ? "Register New Manager" : "Modify Manager Profile"}
            </h3>
            <div style={formGrid}>

              <input
                placeholder="Staff ID"
                value={form.staff_id}
                disabled={mode === "update" || mode === "add" } 
                onChange={(e) =>
                  setForm({
                    ...form,
                    staff_id: e.target.value,
                  })
                }
                style={input}
              />


                <input
                    style={input}
                    placeholder="Email"
                    value={form.email}
                    disabled={mode === "update"} 
                    onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    style={input}
                    placeholder="First Name"
                    value={form.first_name}
                    onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                    }
                />

                <input
                    style={input}
                    placeholder="Last Name"
                    value={form.last_name}
                    onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                    }
                />

                {mode === "add" && (
                    <input
                    style={input}
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                    />
                )}

                {/* GENDER DROPDOWN */}
                <CustomSelect
                    options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    ]}
                    value={form.gender}
                    onChange={(v) =>
                    setForm({ ...form, gender: v })
                    }
                    placeholder="Select Gender"
                />

                {/* CLEARANCE LEVEL */}
                <CustomSelect
                    options={[
                    { value: "HIGH", label: "HIGH" },
                    { value: "MEDIUM", label: "MEDIUM" }
                    ]}
                    value={form.clearance_level}
                    onChange={(v) =>
                    setForm({ ...form, clearance_level: v })
                    }
                />

                <input
                  style={input}
                  type="number"
                  placeholder="Budget Authority"

                  value={form.budget_authority}

                  onChange={(e) =>
                    setForm({
                      ...form,
                      budget_authority: e.target.value
                    })
                  }
                />

                <input
                  style={input}
                  type="number"
                  placeholder="Budget Used"

                  value={form.budget_used}

                  onChange={(e) =>
                    setForm({
                      ...form,
                      budget_used: e.target.value
                    })
                  }
                />


                <input
                    style={input}
                    placeholder="Dept ID"
                    value={form.dept_id}
                    onChange={(e) =>
                    setForm({ ...form, dept_id: e.target.value })
                    }
                />

                <input
                    style={input}
                    placeholder="Phone Numbers (comma separated)"
                    value={form.phone_numbers}
                    onChange={(e) =>
                    setForm({
                        ...form,
                        phone_numbers: e.target.value
                    })
                    }
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

// ---------------- STYLES (Unified & Professional) ----------------
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
  transition: "all 0.2s"
};

const filterBar = { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "30px" };

const tableWrap = { 
  background: "white", 
  borderRadius: "20px", 
  padding: "10px", 
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)", 
  maxHeight: "60vh", 
  overflowY: "auto", 
  position: "relative",
  border: "1px solid #edf2f7"
};

const tableStyle = { width: "100%", borderCollapse: "collapse" };
const th = { 
  textAlign: "left", 
  padding: "16px", 
  borderBottom: "2px solid #edf2f7", 
  color: "#718096", 
  fontSize: "13px", 
  textTransform: "uppercase", 
  letterSpacing: "0.05em",
  position: "sticky", 
  top: 0, 
  background: "white", 
  zIndex: 10 
};

const td = { padding: "16px", borderBottom: "1px solid #edf2f7", color: "#4a5568", fontSize: "15px" };
const rowStyle = { transition: "background 0.2s" };

const input = { 
  padding: "12px 16px", 
  border: "1px solid #e2e8f0", 
  borderRadius: "12px", 
  outline: "none", 
  fontSize: "15px",
  background: "#fff",
  width: "100%",
  boxSizing: "border-box"
};

const editBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#ebf8ff", color: "#3182ce", fontWeight: "600" };
const deleteBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#fff5f5", color: "#e53e3e", fontWeight: "600" };

const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(26, 32, 44, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" };
const modal = { background: "white", padding: "40px", borderRadius: "24px", width: "90%", maxWidth: "700px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const modalActions = { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "30px" };

const cancelBtn = { padding: "12px 24px", border: "1px solid #e2e8f0", background: "white", borderRadius: "12px", color: "#718096", fontWeight: "600", cursor: "pointer" };
const saveBtn = { ...addBtn, cursor: "pointer" };

export default ManagerManagement;