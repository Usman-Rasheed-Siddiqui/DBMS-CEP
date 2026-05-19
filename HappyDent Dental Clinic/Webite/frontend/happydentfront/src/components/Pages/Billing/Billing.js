import React, { useEffect, useState, useCallback } from "react";
import AxiosInstance from "../../Axios";

const PatientBillingPage = ({ setToast }) => {
    const [billing, setBilling] = useState([]);
    const [dueRecords, setDueRecords] = useState([]);
    const [summary, setSummary] = useState(null);

    const [billingSearch, setBillingSearch] = useState("");
    const [dueSearch, setDueSearch] = useState("");

    const [selectedRecord, setSelectedRecord] = useState("");
    const [amount, setAmount] = useState("");

    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    /* ---------------- FETCH DATA ---------------- */

    const fetchBilling = async (search = "") => {
        try {
            const res = await AxiosInstance.get(
                `/patient-billing/?search=${encodeURIComponent(search)}`
            );
            setBilling(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            setBilling([]);
        }
    };

    const fetchDueRecords = async (search = "") => {
        try {
            const res = await AxiosInstance.get(
                `/due-records/?search=${encodeURIComponent(search)}`
            );
            setDueRecords(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            setDueRecords([]);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await AxiosInstance.get("/payment-summary/");
            setSummary(res.data);
        } catch (error) {
            console.error("Summary Error:", error);
        }
    };

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.allSettled([
                fetchBilling(),
                fetchDueRecords(),
                fetchSummary()
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    /* ---------------- SEARCH DEBOUNCE ---------------- */

    useEffect(() => {
        const timeout = setTimeout(() => fetchBilling(billingSearch), 500);
        return () => clearTimeout(timeout);
    }, [billingSearch]);

    useEffect(() => {
        const timeout = setTimeout(() => fetchDueRecords(dueSearch), 500);
        return () => clearTimeout(timeout);
    }, [dueSearch]);

    /* ---------------- PAYMENT ---------------- */

    const handlePayment = async () => {
        if (!selectedRecord || !amount) return;
        try {
            setPaying(true);
            await AxiosInstance.post("/make-payment/", {
                record_id: selectedRecord,
                amount: parseFloat(amount)
            });
            setToast({ show: true, message: "Payment successful", type: "success" });
            setAmount("");
            setSelectedRecord("");
            fetchAll();
        } catch (error) {
            setToast({ show: true, message: "Payment failed", type: "danger" });
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <div style={loadingStyle}>Loading Billing Information...</div>;

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>Billing & Payments</h2>
                <p style={subtitleStyle}>Manage your healthcare expenses and payments</p>
            </div>

            {summary && (
                <div style={summaryGrid}>
                    <SummaryCard title="Total Paid" value={`Rs. ${summary.total_paid || 0}`} />
                    <SummaryCard title="Total Due" value={`Rs. ${summary.total_due || 0}`} />
                </div>
            )}

            <div style={mainGridStyle}>
                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                    
                    {/* MAKE PAYMENT */}
                    <div style={cardStyle}>
                        <h3 style={sectionTitleStyle}>Make Payment</h3>
                        <div style={{ marginBottom: "20px", marginTop: "15px" }}>
                            <label style={labelStyle}>Select Visit Date</label>
                            <select
                                value={selectedRecord}
                                onChange={(e) => setSelectedRecord(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="">Select a record</option>
                                {dueRecords.map((record) => (
                                    <option key={record.record_id} value={record.record_id}>
                                        Visit: {record.visit_date} (Due: Rs. {record.remaining_amount})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={labelStyle}>Payment Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                style={inputStyle}
                            />
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={paying || !selectedRecord || !amount}
                            style={{
                                ...payButtonStyle,
                                backgroundColor: (paying || !selectedRecord || !amount) ? "#94a3b8" : "#2563eb"
                            }}
                        >
                            {paying ? "Processing..." : "Complete Payment"}
                        </button>
                    </div>

                    {/* PENDING DUES TABLE */}
                    <div style={cardStyle}>
                        <div style={sectionHeaderStyle}>
                            <h3 style={sectionTitleStyle}>Pending Dues</h3>
                            <input
                                type="text"
                                placeholder="Search by date..."
                                value={dueSearch}
                                onChange={(e) => setDueSearch(e.target.value)}
                                style={searchInputStyle}
                            />
                        </div>
                        <div style={tableWrapperStyle}>
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>Visit Date</th>
                                        <th style={thStyle}>Total Bill</th>
                                        <th style={thStyle}>Balance Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dueRecords.length > 0 ? dueRecords.map((record, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{record.visit_date}</td>
                                            <td style={tdStyle}>Rs. {record.total_amount}</td>
                                            <td style={{ ...tdStyle, color: "#dc2626", fontWeight: "700" }}>
                                                Rs. {record.remaining_amount}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" style={emptyRowStyle}>No pending dues.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* BILLING HISTORY */}
                <div style={cardStyle}>
                    <div style={sectionHeaderStyle}>
                        <h3 style={sectionTitleStyle}>Payment History</h3>
                        <input
                            type="text"
                            placeholder="Search doctor or date..."
                            value={billingSearch}
                            onChange={(e) => setBillingSearch(e.target.value)}
                            style={searchInputStyle}
                        />
                    </div>
                    <div style={tableWrapperStyle}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Doctor</th>
                                    <th style={thStyle}>Visit Date</th>
                                    <th style={thStyle}>Amount Paid</th>
                                    <th style={thStyle}>Remaining</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billing.length > 0 ? billing.map((bill, index) => (
                                    <tr key={index}>
                                        <td style={tdStyle}>{bill.appointment_with}</td>
                                        <td style={tdStyle}>{bill.visit_date}</td>
                                        <td style={{ ...tdStyle, color: "#16a34a", fontWeight: "700" }}>
                                            Rs. {bill.amount_paid}
                                        </td>
                                        <td style={{ ...tdStyle, color: "#dc2626", fontWeight: "700" }}>
                                            Rs. {bill.remaining_amount}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={emptyRowStyle}>No payment history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------------- HELPER COMPONENTS & STYLES ---------------- */

const SummaryCard = ({ title, value }) => (
    <div style={summaryCardStyle}>
        <p style={summaryTitleStyle}>{title}</p>
        <h2 style={summaryValueStyle}>{value}</h2>
    </div>
);

const containerStyle = { padding: "40px", backgroundColor: "transparent", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const headerStyle = { marginBottom: "30px" };
const titleStyle = { margin: 0, fontSize: "32px", fontWeight: "800", color: "#1e293b" };
const subtitleStyle = { marginTop: "6px", color: "#64748b" };
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" };
const summaryCardStyle = { background: "white", padding: "25px", borderRadius: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const summaryTitleStyle = { color: "#64748b", marginBottom: "10px" };
const summaryValueStyle = { margin: 0, fontSize: "28px", color: "#2563eb" };
const mainGridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" };
const cardStyle = { background: "white", borderRadius: "20px", padding: "25px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const sectionTitleStyle = { margin: 0, fontSize: "20px", fontWeight: "700", color: "#1e293b" };
const sectionHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" };
const searchInputStyle = { padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none" };
const payButtonStyle = { width: "100%", padding: "14px", borderRadius: "12px", color: "white", fontWeight: "700", border: "none", cursor: "pointer", transition: "background 0.3s" };
const tableWrapperStyle = { overflowX: "auto" };
const tableStyle = { width: "100%", borderCollapse: "collapse" };
const thStyle = { textAlign: "left", padding: "14px", background: "#f1f5f9", color: "#475569", fontSize: "14px" };
const tdStyle = { padding: "14px", borderBottom: "1px solid #e2e8f0", fontSize: "14px" };
const emptyRowStyle = { textAlign: 'center', padding: '20px', color: '#94a3b8' };
const loadingStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#64748b" };

export default PatientBillingPage;