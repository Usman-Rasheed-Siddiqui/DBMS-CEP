
import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";

const DepartmentManagement = ({ setToast }) => {

  // ---------------- STATES ----------------

  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [form, setForm] = useState({
    dept_id: "",
    dept_name: "",
    room_number: "",
  });

  // ---------------- FETCH DEPARTMENTS ----------------

  const fetchDepartments = async () => {

    try {

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      const res = await AxiosInstance.get(
        `/department-list/?${params.toString()}`
      );

      setDepartments(res.data);

    } catch (err) {

      setToast({
        show: true,
        message: "Failed to fetch departments",
        type: "danger",
      });

    }

  };

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  // ---------------- OPEN ADD ----------------

  const openAdd = () => {

    setMode("add");

    setForm({
      dept_id: "Auto-generated",
      dept_name: "",
      room_number: "",
    });

    setShowModal(true);

  };

  // ---------------- OPEN UPDATE ----------------

  const openUpdate = (department) => {

    setMode("update");

    setSelectedDepartment(department);

    setForm({
      dept_id: department?.dept_id || "",
      dept_name: department?.dept_name || "",
      room_number: department?.room_number || "",
    });

    setShowModal(true);

  };

  // ---------------- DELETE ----------------

  const handleDelete = async (dept_id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmDelete) return;

    try {

      await AxiosInstance.delete(
        `/department-delete/${dept_id}/`
      );

      setToast({
        show: true,
        message: "Department deleted successfully",
        type: "success",
      });

      fetchDepartments();

    } catch (err) {

      const msg =
        err.response?.data?.error ||
        "Failed to delete department";

      setToast({
        show: true,
        message: msg,
        type: "danger",
      });

    }

  };

  // ---------------- SAVE ----------------

  const handleSubmit = async () => {

    try {

      const payload = {

        dept_name: form.dept_name,

        room_number:
          form.room_number === ""
            ? null
            : Number(form.room_number),

      };

      if (mode === "add") {

        await AxiosInstance.post(
          "/department-add/",
          payload
        );

        setToast({
          show: true,
          message: "Department added successfully",
          type: "success",
        });

      } else {

        await AxiosInstance.put(
          `/department-edit/${selectedDepartment.dept_id}/`,
          payload
        );

        setToast({
          show: true,
          message: "Department updated successfully",
          type: "success",
        });

      }

      setShowModal(false);

      fetchDepartments();

    } catch (err) {

      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Operation failed";

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
        accessorKey: "dept_id",
        header: "Department ID",
      },

      {
        accessorKey: "dept_name",
        header: "Department Name",
      },

      {
        accessorKey: "room_number",
        header: "Room Number",

        cell: ({ getValue }) =>
          getValue() || "-",
      },

      {
        accessorKey: "total_staff",
        header: "Total Staff",
      },

      {
        header: "Actions",

        cell: ({ row }) => (

          <div style={{ display: "flex", gap: "10px" }}>

            <button
              style={editBtn}
              onClick={() => openUpdate(row.original)}
            >
              Manage
            </button>

            <button
              style={deleteBtn}
              onClick={() =>
                handleDelete(row.original.dept_id)
              }
            >
              Delete
            </button>

          </div>

        ),
      },
    ],
    [departments]
  );

  const table = useReactTable({
    data: departments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (

    <div style={container}>

      {/* HEADER */}

      <div style={topBar}>

        <h2 style={heading}>
          Department Management
        </h2>

        <button
          style={addBtn}
          onClick={openAdd}
        >
          + Add Department
        </button>

      </div>

      {/* SEARCH */}

      <div style={filterBar}>

        <input
          placeholder="Search by department name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

      </div>

      {/* TABLE */}

      <div style={tableWrap}>

        <table style={tableStyle}>

          <thead>

            {table.getHeaderGroups().map((hg) => (

              <tr key={hg.id}>

                {hg.headers.map((h) => (

                  <th key={h.id} style={th}>

                    {flexRender(
                      h.column.columnDef.header,
                      h.getContext()
                    )}

                  </th>

                ))}

              </tr>

            ))}

          </thead>

          <tbody>

            {table.getRowModel().rows.map((row) => (

              <tr key={row.id}>

                {row.getVisibleCells().map((cell) => (

                  <td key={cell.id} style={td}>

                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}

                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {showModal && (

        <div style={modalOverlay}>

          <div style={modal}>

            <h3 style={{ marginTop: 0 }}>

              {mode === "add"
                ? "Add Department"
                : "Manage Department"}

            </h3>

            <div style={formGrid}>

              <input
                placeholder="Department ID"
                value={form.dept_id}
                disabled
                style={input}
              />

              <input
                placeholder="Department Name"
                value={form.dept_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dept_name: e.target.value,
                  })
                }
                style={input}
              />

              <input
                type="number"
                placeholder="Room Number"
                value={form.room_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    room_number: e.target.value,
                  })
                }
                style={input}
              />

            </div>

            <div style={modalActions}>

              <button
                style={cancelBtn}
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </button>

              <button
                style={saveBtn}
                onClick={handleSubmit}
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default DepartmentManagement;

/* ---------------- STYLES ---------------- */

const container = {
  padding: "30px",
  background: "transparent",
  minHeight: "100vh",
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
};

const heading = {
  margin: 0,
  fontWeight: "800",
  color: "#1a202c",
};

const addBtn = {
  padding: "10px 18px",
  background: "#3182ce",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "700",
  cursor: "pointer",
};

const filterBar = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "15px",
  marginBottom: "25px",
};

const tableWrap = {
  background: "white",
  borderRadius: "18px",
  padding: "20px",
  overflowX: "auto",
  maxHeight: "65vh",
  overflowY: "auto",
  position: "relative",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "14px",
  borderBottom: "2px solid #edf2f7",
  color: "#4a5568",
  fontSize: "13px",
  position: "sticky",
  top: 0,
  background: "white",
  zIndex: 10,
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #edf2f7",
  verticalAlign: "top",
};

const input = {
  padding: "12px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  outline: "none",
};

const editBtn = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "10px",
  background: "#ebf8ff",
  color: "#3182ce",
  fontWeight: "600",
  cursor: "pointer",
};

const deleteBtn = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "10px",
  background: "#fff5f5",
  color: "#e53e3e",
  fontWeight: "600",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modal = {
  background: "white",
  padding: "30px",
  borderRadius: "20px",
  width: "600px",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "25px",
};

const cancelBtn = {
  padding: "10px 18px",
  border: "1px solid #e2e8f0",
  background: "white",
  borderRadius: "10px",
  cursor: "pointer",
};

const saveBtn = {
  padding: "10px 18px",
  border: "none",
  background: "#3182ce",
  color: "white",
  borderRadius: "10px",
  cursor: "pointer",
};