import React, { useEffect, useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const BillingManagement = ({ setToast }) => {

    const [billing, setBilling] = useState([]);
    const [summary, setSummary] = useState({});
    const [recordOptions, setRecordOptions] = useState([]);

    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("add");
    const [selectedBill, setSelectedBill] = useState(null);

    const [form, setForm] = useState({
        record_id: "",
        total_amount: "",
        amount_paid: "",
        payment_date: "",
        payment_method: "",
    });

    const fetchBilling = async () => {
        try {
            const res = await AxiosInstance.get(
                `/billing-list/?search=${search}`
            );

            setBilling(res.data || []);
        } catch {
            setToast({
                show: true,
                message: "Failed to fetch billing records",
                type: "danger"
            });
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await AxiosInstance.get("/billing-summary/");
            setSummary(res.data || {});
        } catch {}
    };

    const fetchRecords = async () => {
        try {
            const res = await AxiosInstance.get("/patient-record-dropdown/");
            // Directly store what the backend sends. It already contains label, record_id, and total_amount!
            setRecordOptions(res.data || []);
        } catch (err) {
            console.error("Failed to fetch dropdown records", err);
        }
    };

    useEffect(() => {
        fetchBilling();
    }, [search]);

    useEffect(() => {
        fetchSummary();
        fetchRecords();
    }, []);

    const openAdd = () => {
        setMode("add");

        setForm({
            record_id: "",
            total_amount: "",
            amount_paid: "",
            payment_date: "",
            payment_method: "",
        });

        setShowModal(true);
    };

    const openEdit = (bill) => {
        setMode("edit");
        setSelectedBill(bill);

        setForm({
            record_id: bill.record_id,
            total_amount: bill.total_amount || "",
            amount_paid: bill.amount_paid || "",
            payment_date: bill.payment_date || "",
            payment_method: bill.payment_method || "",
        });

        setShowModal(true);
    };
    
    const handleDelete = async (bill_id) => {

        if (!window.confirm("Delete this bill?")) return;

        try {

            await AxiosInstance.delete(`/delete-bill/${bill_id}/`);

            setToast({
                show: true,
                message: "Bill deleted successfully",
                type: "success"
            });

            fetchBilling();
            fetchSummary();

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

                await AxiosInstance.post("/add-bill/", form);

            } else {

                await AxiosInstance.put(
                    `/edit-bill/${selectedBill.bill_id}/`,
                    form
                );
            }

            setShowModal(false);

            fetchBilling();
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
        {
            accessorKey: "bill_id",
            header: "Bill ID"
        },
        {
            accessorKey: "patient_id",
            header: "Patient"
        },
        {
            accessorKey: "appointment_with",
            header: "Doctor"
        },
        {
            accessorKey: "total_amount",
            header: "Total"
        },
        {
            accessorKey: "amount_paid",
            header: "Paid"
        },
        {
            accessorKey: "remaining_amount",
            header: "Remaining"
        },
        {
            accessorKey: "payment_method",
            header: "Method"
        },
        {
            accessorKey: "payment_date",
            header: "Date"
        },
        {
            header: "Actions",
            cell: ({ row }) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        style={editBtn}
                        onClick={() => openEdit(row.original)}
                    >
                        Edit
                    </button>

                    <button
                        style={deleteBtn}
                        onClick={() => handleDelete(row.original.bill_id)}
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ], []);

    const table = useReactTable({
        data: billing,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div style={container}>

            <div style={topBar}>
                <h2 style={heading}>Billing Management</h2>

                <button style={addBtn} onClick={openAdd}>
                    + Add Bill
                </button>
            </div>

            <div style={summaryGrid}>
                <div style={summaryCard}>
                    <p>Total Revenue</p>
                    <h2>
                        Rs. {summary.total_revenue || 0}
                    </h2>
                </div>

                <div style={summaryCard}>
                    <p>Total Payments</p>
                    <h2>
                        {summary.total_transactions || 0}
                    </h2>
                </div>
            </div>

            <div style={filterBar}>
                <input
                    style={input}
                    placeholder="Search patient, doctor or method..."
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
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
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

            {showModal && (
                <div style={modalOverlay}>
                    <div style={modal}>

                        <h3>
                            {mode === "add"
                                ? "Add Bill"
                                : "Edit Bill"}
                        </h3>

                        <div style={formGrid}>

                        <CustomSelect
                            options={recordOptions.map(r => ({
                                value: r.record_id,
                                label: r.label
                            }))}
                            value={form.record_id}
                            onChange={(v) => {
                                // Convert both values safely to Numbers to guarantee an accurate match
                                const selected = recordOptions.find(
                                    r => Number(r.record_id) === Number(v)
                                );

                                setForm({
                                    ...form,
                                    record_id: v,
                                    // Fallback cleanly to empty string if not found
                                    total_amount: selected ? selected.total_amount : "" 
                                });
                            }}
                            placeholder="Select Record"
                            disabled={mode === "edit"}
                        />

                            <input
                                style={{
                                    ...input,
                                    background: "#f1f5f9",
                                    cursor: "not-allowed"
                                }}
                                placeholder="Auto detected after selecting record"
                                disabled
                                type="text"
                                value={
                                    form.total_amount
                                        ? `Rs. ${form.total_amount}`
                                        : ""
                                }
                            />

                            <input
                                style={input}
                                placeholder="Amount Paid"
                                type="number"
                                value={form.amount_paid}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        amount_paid: e.target.value
                                    })
                                }
                            />

                            <input
                                style={input}
                                type="date"
                                value={form.payment_date}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        payment_date: e.target.value
                                    })
                                }
                            />

                            <input
                                style={input}
                                placeholder="Payment Method"
                                value={form.payment_method}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        payment_method: e.target.value
                                    })
                                }
                            />

                        </div>

                        <div style={modalActions}>
                            <button
                                style={cancelBtn}
                                onClick={() => setShowModal(false)}
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

const container = {
    padding: "40px",
};

const topBar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
};

const heading = {
    fontSize: "30px",
    fontWeight: "800"
};

const addBtn = {
    padding: "12px 24px",
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "white",
    fontWeight: "600",
    cursor: "pointer"
};

const summaryGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "25px"
};

const summaryCard = {
    background: "white",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
};

const filterBar = {
    marginBottom: "20px"
};

const tableWrap = {
    background: "white",
    borderRadius: "18px",
    overflow: "auto",
    padding: "10px",
    maxHeight: "65vh",       // Sets a specific height (65% of viewport height)
    overflowY: "auto",      // Adds vertical scroll if content is too long
    overflowX: "auto",      // Adds horizontal scroll for small screens
    position: "relative",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse"
};

const th = {
    textAlign: "left",
    padding: "15px",
    background: "#f8fafc",
    position: "sticky",
    top: 0,
    background: "white",
    zIndex: 10,
};

const td = {
    padding: "15px",
    borderBottom: "1px solid #e2e8f0"
};

const input = {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    width: "100%",
    boxSizing: "border-box"
};

const editBtn = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#dbeafe",
    color: "#2563eb",
    cursor: "pointer"
};

const deleteBtn = {
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer"
};

const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
};

const modal = {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    width: "700px"
};

const formGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginTop: "20px"
};

const modalActions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "25px"
};

const cancelBtn = {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "white",
    cursor: "pointer"
};

const saveBtn = {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer"
};

export default BillingManagement;