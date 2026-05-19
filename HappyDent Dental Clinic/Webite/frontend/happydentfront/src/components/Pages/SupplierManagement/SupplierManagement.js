import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";

const SupplierManagement = ({ setToast }) => {

  // =====================================
  // STATES
  // =====================================

  const [suppliers, setSuppliers] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [mode, setMode] = useState("add");

  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [form, setForm] = useState({

    supplier_id: "",

    company_name: "",

    contact_person: "",

    email: "",

    phone: "",

    address: "",

  });

  // =====================================
  // FETCH SUPPLIERS
  // =====================================

  const fetchSuppliers = async () => {

    try {

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      const res = await AxiosInstance.get(
        `/supplier-list/?${params.toString()}`
      );

      setSuppliers(res.data);

    } catch (err) {

      setToast({
        show: true,
        message: "Failed to fetch suppliers",
        type: "danger",
      });

    }

  };

  useEffect(() => {

    fetchSuppliers();

  }, [search]);

  // =====================================
  // OPEN ADD
  // =====================================

  const openAdd = () => {

    setMode("add");

    setForm({

      supplier_id: "Auto-generated",

      company_name: "",

      contact_person: "",

      email: "",

      phone: "",

      address: "",

    });

    setShowModal(true);

  };

  // =====================================
  // OPEN UPDATE
  // =====================================

  const openUpdate = (supplier) => {

    setMode("update");

    setSelectedSupplier(supplier);

    setForm({

      supplier_id: supplier.supplier_id,

      company_name: supplier.company_name,

      contact_person: supplier.contact_person || "",

      email: supplier.email,

      phone: supplier.phone || "",

      address: supplier.address || "",

    });

    setShowModal(true);

  };

  // =====================================
  // DELETE
  // =====================================

  const handleDelete = async (supplier_id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmDelete) return;

    try {

      await AxiosInstance.delete(
        `/supplier-delete/${supplier_id}/`
      );

      setToast({
        show: true,
        message: "Supplier deleted successfully",
        type: "success",
      });

      fetchSuppliers();

    } catch (err) {

      const msg =
        err.response?.data?.error ||
        "Failed to delete supplier";

      setToast({
        show: true,
        message: msg,
        type: "danger",
      });

    }

  };

  // =====================================
  // SAVE
  // =====================================

  const handleSubmit = async () => {

    try {

      const payload = {

        company_name: form.company_name,

        contact_person: form.contact_person,

        email: form.email,

        phone: form.phone,

        address: form.address,

      };

      if (mode === "add") {

        await AxiosInstance.post(
          "/supplier-add/",
          payload
        );

        setToast({
          show: true,
          message: "Supplier added successfully",
          type: "success",
        });

      } else {

        await AxiosInstance.put(
          `/supplier-edit/${selectedSupplier.supplier_id}/`,
          payload
        );

        setToast({
          show: true,
          message: "Supplier updated successfully",
          type: "success",
        });

      }

      setShowModal(false);

      fetchSuppliers();

    } catch (err) {

      const msg =
        err.response?.data?.error ||
        "Operation failed";

      setToast({
        show: true,
        message: msg,
        type: "danger",
      });

    }

  };

  // =====================================
  // TABLE
  // =====================================

  const columns = useMemo(
    () => [

      {
        accessorKey: "supplier_id",
        header: "Supplier ID",
      },

      {
        accessorKey: "company_name",
        header: "Company Name",
      },

      {
        accessorKey: "contact_person",
        header: "Contact Person",
      },

      {
        accessorKey: "email",
        header: "Email",
      },

      {
        accessorKey: "phone",
        header: "Phone",
      },

      {
        accessorKey: "address",
        header: "Address",
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
                handleDelete(row.original.supplier_id)
              }
            >
              Delete
            </button>

          </div>

        ),
      },

    ],
    [suppliers]
  );

  const table = useReactTable({
    data: suppliers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (

    <div style={container}>

      {/* HEADER */}

      <div style={topBar}>

        <h2 style={heading}>
          Supplier Management
        </h2>

        <button
          style={addBtn}
          onClick={openAdd}
        >
          + Add Supplier
        </button>

      </div>

      {/* SEARCH */}

      <div style={filterBar}>

        <input
          placeholder="Search suppliers..."
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
                ? "Add Supplier"
                : "Manage Supplier"}

            </h3>

            <div style={formGrid}>

              <input
                placeholder="Supplier ID"
                value={form.supplier_id}
                disabled
                style={input}
              />

              <input
                placeholder="Company Name"
                value={form.company_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company_name: e.target.value,
                  })
                }
                style={input}
              />

              <input
                placeholder="Contact Person"
                value={form.contact_person}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact_person: e.target.value,
                  })
                }
                style={input}
              />

              <input
                placeholder="Email"
                value={form.email}
                disabled={mode === "update"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                style={input}
              />

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                style={input}
              />

              <textarea
                rows="3"
                placeholder="Address"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
                style={textarea}
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

export default SupplierManagement;

/* =====================================
STYLES
===================================== */

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
  width: "100%",
};

const textarea = {
  padding: "12px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  resize: "none",
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
  width: "700px",
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