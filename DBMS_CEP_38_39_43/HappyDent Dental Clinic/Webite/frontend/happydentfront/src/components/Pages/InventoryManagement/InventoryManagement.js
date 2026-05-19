import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const InventoryManagement = ({ setToast }) => {

  // ---------------- STATES ----------------
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // State structure matching your Django model property fields
  const [budget, setBudget] = useState({
    total_budget_authority: 0,
    budget_authority: 0,
    budget_used: 0,
    budget_remaining: 0,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(""); // Re-purposed for typed category search

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    item_id: "",
    item_name: "",
    category: "",
    quantity: "",
    unit: "",
    unit_price: "",
    supplier_id: "",
  });

  // ---------------- FETCH OPERATIONS ----------------

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const res = await AxiosInstance.get(`/inventory-list/?${params.toString()}`);
      setInventory(res.data || []);
    } catch (err) {
      setInventory([]);
      console.error("Inventory dataset retrieval error:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await AxiosInstance.get("/supplier-dropdown/");
      setSuppliers(res.data || []);
    } catch (err) {
      console.error("Supplier dropdown data source error:", err);
      setSuppliers([]);
    }
  };

  const fetchBudgetData = async () => {
    let companyAuthority = 0;
    let managerAuthority = 0;
    let managerUsed = 0;
    let managerRemaining = 0;

    // Isolate the endpoints so an error in one doesn't kill both cards
    try {
      const companyRes = await AxiosInstance.get("/company-budget-summary/");
      companyAuthority = companyRes.data?.total_budget_authority ?? 0;
    } catch (err) {
      console.error("Failed fetching company-budget-summary endpoint:", err.message);
    }

    try {
      const adminRes = await AxiosInstance.get("/admin-budget-list/");
      managerAuthority = adminRes.data?.budget_authority ?? 0;
      managerUsed = adminRes.data?.budget_used ?? 0;
      managerRemaining = adminRes.data?.budget_remaining ?? 0;
    } catch (err) {
      console.error("Failed fetching admin-budget-list endpoint:", err.message);
    }

    setBudget({
      total_budget_authority: companyAuthority,
      budget_authority: managerAuthority,
      budget_used: managerUsed,
      budget_remaining: managerRemaining,
    });
  };

  // ---------------- RUNNERS & EFFECTS ----------------

  // Initial dashboard load tracker (Runs only once on mount)
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.allSettled([
        fetchInventory(),
        fetchSuppliers(),
        fetchBudgetData(),
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Dynamic search handler (Updates table records inline without a full-screen loading flash)
  useEffect(() => {
    fetchInventory();
  }, [search, category]);

  // ---------------- MODAL CONFIGS ----------------

  const openAdd = () => {
    setMode("add");
    setForm({
      item_id: "Auto-generated",
      item_name: "",
      category: "",
      quantity: "",
      unit: "",
      unit_price: "",
      supplier_id: "",
    });
    setShowModal(true);
  };

  const openUpdate = (item) => {
    setMode("update");
    setSelectedItem(item);
    setForm({
      item_id: item.item_id || "",
      item_name: item.item_name || "",
      category: item.category || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      unit_price: item.unit_price || "",
      supplier_id: item.supplier_id || "",
    });
    setShowModal(true);
  };

  // ---------------- WRITE MUTATIONS ----------------

  const handleDelete = async (item_id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?")) return;
    try {
      await AxiosInstance.delete(`/inventory-delete/${item_id}/`);
      if (setToast) setToast({ show: true, message: "Item dropped successfully.", type: "success" });
      fetchInventory();
      fetchBudgetData(); // Refresh budget cards since costs changed
    } catch (err) {
      if (setToast) {
        setToast({
          show: true,
          message: err.response?.data?.error || "Purge operational target failed.",
          type: "danger",
        });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        item_name: form.item_name,
        category: form.category,
        quantity: parseInt(form.quantity) || 0,
        unit: form.unit,
        unit_price: parseFloat(form.unit_price) || 0,
        supplier_id: form.supplier_id,
      };

      if (mode === "add") {
        await AxiosInstance.post("/inventory-add/", payload);
        if (setToast) setToast({ show: true, message: "Inventory record created successfully", type: "success" });
      } else {
        await AxiosInstance.put(`/inventory-edit/${selectedItem.item_id}/`, payload);
        if (setToast) setToast({ show: true, message: "Inventory updated successfully", type: "success" });
      }

      setShowModal(false);
      fetchInventory();
      fetchBudgetData(); // Refresh budget cards to reflect edits
    } catch (err) {
      if (setToast) {
        setToast({
          show: true,
          message: err.response?.data?.error || "Transaction process validation failure.",
          type: "danger",
        });
      }
    }
  };

  // ---------------- TABLE CONFIGS ----------------

  const columns = useMemo(
    () => [
      { accessorKey: "item_id", header: "Item ID" },
      { accessorKey: "item_name", header: "Item Name" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "quantity", header: "Quantity" },
      { accessorKey: "unit", header: "Unit" },
      {
        accessorKey: "unit_price",
        header: "Unit Price",
        cell: ({ getValue }) => `Rs. ${parseFloat(getValue() || 0).toFixed(2)}`,
      },
      {
        accessorKey: "company_name",
        header: "Supplier",
        cell: ({ row }) => row.original.company_name || "N/A",
      },
      {
        header: "Total Cost",
        cell: ({ row }) => {
          const qty = parseInt(row.original.quantity) || 0;
          const price = parseFloat(row.original.unit_price) || 0;
          return `Rs. ${(qty * price).toFixed(2)}`;
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={editBtn} onClick={() => openUpdate(row.original)}>Manage</button>
            <button style={deleteBtn} onClick={() => handleDelete(row.original.item_id)}>Delete</button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: inventory,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return <div style={loadingStyle}>Loading Inventory Dashboard Panel...</div>;
  }

  return (
    <div style={containerStyle}>
      
      {/* TITLE HEAD */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>Inventory Management</h2>
        <p style={subtitleStyle}>Manage complete database asset tracking records</p>
      </div>

      {/* FOUR SUMMARY METRIC CARDS */}
      <div style={summaryGrid}>
        <SummaryCard
          title="Total Budget Authority"
          value={`Rs. ${parseFloat(budget.total_budget_authority).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="#0f172a"
        />
        <SummaryCard
          title="Manager Budget Limit"
          value={`Rs. ${parseFloat(budget.budget_authority).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="#2563eb"
        />
        <SummaryCard
          title="Manager Budget Used"
          value={`Rs. ${parseFloat(budget.budget_used).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="#dc2626"
        />
        <SummaryCard
          title="Manager Remaining"
          value={`Rs. ${parseFloat(budget.budget_remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="#16a34a"
        />
      </div>

      {/* UTILITY BUTTON BAR */}
      <div style={topBar}>
        <button style={addBtn} onClick={openAdd}>+ Add Inventory Item</button>
      </div>

      {/* FILTER CONTROLS */}
      <div style={filterBar}>
        <input
          placeholder="Search items, item IDs, or suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />
        <input
          placeholder="Search by category name..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={input}
        />
      </div>

      {/* DATA VIEWPORT */}
      <div style={tableWrap}>
        <table style={tableStyle}>
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
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                  No available items inventory records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MANAGEMENT MODAL DIALOG */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>
              {mode === "add" ? "Add Inventory Item" : "Manage Inventory Item"}
            </h3>

            <div style={formGrid}>
              <input placeholder="Item ID" value={form.item_id} disabled style={input} />
              <input
                placeholder="Item Name"
                value={form.item_name}
                disabled = {mode === "update"}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                style={input}
              />
              <input
                placeholder="Category"
                value={form.category}
                disabled = {mode === "update"}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={input}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                style={input}
              />
              <input
                placeholder="Unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                style={input}
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                style={input}
              />

              <div style={{ gridColumn: "1 / span 2" }}>
                <CustomSelect
                  disabled={mode === "update"}
                  options={suppliers.map((s) => ({
                    value: s.supplier_id,
                    label: s.display_name || `${s.supplier_id} - ${s.company_name}`,
                  }))}
                  value={form.supplier_id}
                  onChange={(val) => setForm({ ...form, supplier_id: val })}
                />
              </div>
            </div>

            <div style={modalActions}>
              <button style={cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={saveBtn} onClick={handleSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- DISPLAY COMPONENTS ---------------- */
const SummaryCard = ({ title, value, color }) => (
  <div style={summaryCardStyle}>
    <p style={summaryTitleStyle}>{title}</p>
    <h2 style={{ ...summaryValueStyle, color: color || "#2563eb" }}>{value}</h2>
  </div>
);

/* ---------------- STYLE LAYOUT WRAPPERS ---------------- */
const loadingStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#64748b", fontFamily: "sans-serif" };
const containerStyle = { padding: "40px", backgroundColor: "transparent", minHeight: "100vh", fontFamily: "sans-serif" };
const headerStyle = { marginBottom: "30px" };
const titleStyle = { margin: 0, fontSize: "32px", fontWeight: "800", color: "#1e293b" };
const subtitleStyle = { marginTop: "6px", color: "#64748b" };
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" };
const summaryCardStyle = { background: "white", padding: "22px", borderRadius: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const summaryTitleStyle = { color: "#64748b", fontSize: "14px", fontWeight: "600", marginBottom: "8px", margin: 0 };
const summaryValueStyle = { margin: 0, fontSize: "24px", fontWeight: "700" };
const topBar = { display: "flex", justifyContent: "flex-end", marginBottom: "20px" };
const addBtn = { padding: "12px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" };
const filterBar = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" };
const tableWrap = { background: "white", borderRadius: "18px", padding: "20px", overflowX: "auto", maxHeight: "65vh" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: "14px", borderBottom: "2px solid #edf2f7", color: "#4a5568", fontSize: "13px", background: "white" };
const td = { padding: "14px", borderBottom: "1px solid #edf2f7", fontSize: "14px" };
const input = { padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", outline: "none", width: "100%", boxSizing: "border-box" };
const editBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#ebf8ff", color: "#3182ce", fontWeight: "600", cursor: "pointer" };
const deleteBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#fff5f5", color: "#e53e3e", fontWeight: "600", cursor: "pointer" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 };
const modal = { background: "white", padding: "30px", borderRadius: "20px", width: "700px" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" };
const modalActions = { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "25px" };
const cancelBtn = { padding: "10px 18px", border: "1px solid #e2e8f0", background: "white", borderRadius: "10px", cursor: "pointer" };
const saveBtn = { padding: "10px 18px", border: "none", background: "#2563eb", color: "white", borderRadius: "10px", cursor: "pointer" };

export default InventoryManagement;