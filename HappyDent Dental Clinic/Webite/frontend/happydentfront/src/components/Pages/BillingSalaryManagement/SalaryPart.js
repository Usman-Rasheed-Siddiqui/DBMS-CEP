import React, { useEffect, useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const SalaryManagement = ({ setToast }) => {
    const [salary, setSalary] = useState([]);
    const [summary, setSummary] = useState({});
    const [staffOptions, setStaffOptions] = useState([]);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("add");
    const [selectedSalary, setSelectedSalary] = useState(null);

    const [form, setForm] = useState({
        staff_id: "",
        payment_date: "",
        amount: "",
        bonus: "",
        deduction: "",
    });

    const fetchSalary = async () => {
        try {
            const res = await AxiosInstance.get(`/salary-list/?search=${search}`);
            setSalary(res.data || []);
        } catch {
            setToast({
                show: true,
                message: "Failed to fetch salary records",
                type: "danger"
            });
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await AxiosInstance.get("/salary-summary/");
            setSummary(res.data || {});
        } catch {}
    };

    const fetchStaff = async () => {
        try {
            const res = await AxiosInstance.get("/staff-dropdown/");
            setStaffOptions(res.data || []);
        } catch {}
    };

    useEffect(() => {
        fetchSalary();
    }, [search]);

    useEffect(() => {
        fetchSummary();
        fetchStaff();
    }, []);

    const openAdd = () => {
        setMode("add");
        setForm({
            staff_id: "",
            payment_date: "",
            amount: "",
            bonus: "",
            deduction: "",
        });
        setShowModal(true);
    };

    const openEdit = (s) => {
        setMode("edit");
        setSelectedSalary(s);
        setForm({
            staff_id: String(s.staff_id),
            payment_date: s.payment_date,
            amount: s.amount,
            bonus: s.bonus,
            deduction: s.deduction,
        });
        setShowModal(true);
    };

    const handleDelete = async (staff_id, payment_date) => {
        if (!window.confirm("Are you sure you want to delete this salary record?")) return;
        try {
            await AxiosInstance.delete(`/delete-salary/${staff_id}/${payment_date}/`);
            fetchSalary();
            fetchSummary();
            setToast({
                show: true,
                message: "Deleted successfully",
                type: "success"
            });
        } catch (err) {
            setToast({
                show: true,
                message: err.response?.data?.error || "Delete failed",
                type: "danger"
            });
        }
    };

    const handleSubmit = async () => {
        try {
            if (mode === "add") {
                await AxiosInstance.post("/add-salary/", form);
            } else {
                await AxiosInstance.put(
                    `/edit-salary/${selectedSalary.staff_id}/${selectedSalary.payment_date}/`,
                    form
                );
            }
            setShowModal(false);
            fetchSalary();
            fetchSummary();
            setToast({
                show: true,
                message: "Operation successful",
                type: "success"
            });
        } catch (err) {
            setToast({
                show: true,
                message: err.response?.data?.error || "Operation failed",
                type: "danger"
            });
        }
    };

    const columns = useMemo(() => [
        { accessorKey: "staff_id", header: "Staff ID" },
        { accessorKey: "full_name", header: "Name" },
        { accessorKey: "amount", header: "Base Salary" },
        { accessorKey: "bonus", header: "Bonus" },
        { accessorKey: "deduction", header: "Deduction" },
        { accessorKey: "net_salary", header: "Net Salary" },
        { accessorKey: "payment_date", header: "Date" },
        {
            header: "Actions",
            cell: ({ row }) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button style={editBtn} onClick={() => openEdit(row.original)}>Edit</button>
                    <button style={deleteBtn} onClick={() => handleDelete(row.original.staff_id, row.original.payment_date)}>Delete</button>
                </div>
            )
        }
    ], [selectedSalary]);

    const table = useReactTable({
        data: salary,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div style={container}>
            <div style={topBar}>
                <h2 style={heading}>Salary Management</h2>
                <button style={addBtn} onClick={openAdd}>+ Add Salary</button>
            </div>

            <div style={summaryGrid}>
                <div style={summaryCard}>
                    <p style={{ margin: "0 0 10px 0", color: "#64748b", fontWeight: "600" }}>Total Salary Paid</p>
                    <h2>Rs. {Number(summary.total_salary_paid || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</h2>
                </div>
            </div>

            <div style={filterBar}>
                <input
                    style={input}
                    placeholder="Search staff ID, name, or date..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                            <tr key={row.id}>
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
                        <h3>{mode === "add" ? "Add Salary" : "Edit Salary"}</h3>
                    <div style={formGrid}>
                        {mode === "edit" ? (
                            /* Show a stylized read-only field instead of a broken disabled select */
                            <div style={{
                                ...input, 
                                background: "#f1f5f9", 
                                color: "#64748b", 
                                display: "flex", 
                                alignItems: "center",
                                fontWeight: "600"
                            }}>
                                {(() => {
                                    const match = staffOptions.find(s => String(s.staff_id) === String(form.staff_id));
                                    return match ? match.label : `Staff ID: ${form.staff_id}`;
                                })()}
                            </div>
                        ) : (
                            <CustomSelect
                                options={staffOptions.map(s => ({
                                    value: String(s.staff_id),
                                    label: s.label
                                }))}
                                value={form.staff_id ? String(form.staff_id) : ""}
                                onChange={(v) => setForm({ ...form, staff_id: v })}
                                placeholder="Select Staff"
                            />
                        )}
                            <input
                                style={input}
                                type="date"
                                value={form.payment_date}
                                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                            />
                            <input
                                style={input}
                                type="number"
                                placeholder="Base Salary"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            />
                            <input
                                style={input}
                                type="number"
                                placeholder="Bonus"
                                value={form.bonus}
                                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                            />
                            <input
                                style={input}
                                type="number"
                                placeholder="Deduction"
                                value={form.deduction}
                                onChange={(e) => setForm({ ...form, deduction: e.target.value })}
                            />
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

// Styles remain unchanged 
const container = { padding: "40px" };
const topBar = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const heading = { fontSize: "30px", fontWeight: "800" };
const addBtn = { padding: "12px 24px", border: "none", borderRadius: "12px", background: "#2563eb", color: "white", fontWeight: "600", cursor: "pointer" };
const summaryGrid = { display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "25px" };
const summaryCard = { background: "white", padding: "25px", borderRadius: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const filterBar = { marginBottom: "20px" };
const tableWrap = { background: "white", borderRadius: "18px", padding: "10px", maxHeight: "65vh", overflowY: "auto", overflowX: "auto", position: "relative" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: "15px", background: "white", position: "sticky", top: 0, zIndex: 10, borderBottom: "2px solid #e2e8f0" };
const td = { padding: "15px", borderBottom: "1px solid #e2e8f0" };
const input = { padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" };
const editBtn = { padding: "8px 14px", border: "none", borderRadius: "8px", background: "#dbeafe", color: "#2563eb", cursor: "pointer" };
const deleteBtn = { padding: "8px 14px", border: "none", borderRadius: "8px", background: "#fee2e2", color: "#dc2626", cursor: "pointer" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modal = { background: "white", padding: "30px", borderRadius: "20px", width: "700px" };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "20px" };
const modalActions = { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "25px" };
const cancelBtn = { padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" };
const saveBtn = { padding: "10px 18px", borderRadius: "10px", border: "none", background: "#2563eb", color: "white", cursor: "pointer" };

export default SalaryManagement;