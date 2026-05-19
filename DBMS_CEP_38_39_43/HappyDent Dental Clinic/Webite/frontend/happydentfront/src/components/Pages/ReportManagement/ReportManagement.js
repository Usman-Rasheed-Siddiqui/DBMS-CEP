import React, { useState, useEffect, useCallback } from 'react';
import AxiosInstance from '../../Axios'; 
import CustomSelect from '../../CustomSelect/CustomSelect'; 

const ReportManagement = ({ setToast }) => {
    const [userRole, setUserRole] = useState(null); 
    const [pageLoading, setPageLoading] = useState(true);
    
    const [reportType, setReportType] = useState('patient_records');
    const [scope, setScope] = useState('all');
    const [targetId, setTargetId] = useState('');
    const [loading, setLoading] = useState(false);
    const [optionsList, setOptionsList] = useState([]);

    // 1. Get user role when page opens
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await AxiosInstance.get('/current-staff-info/');
                const role = response.data?.staff_role;
                
                if (role) {
                    setUserRole(role);
                    setScope('all');
                    setReportType('patient_records');
                } else {
                    setToast({ show: true, message: 'User profile role not found.', type: 'danger' });
                }
            } catch (err) {
                setToast({ show: true, message: 'Failed to load user role permissions.', type: 'danger' });
            } finally {
                setPageLoading(false);
            }
        };

        checkUserRole();
    }, [setToast]);

    // 2. Fetch dropdown options for single record selection
    const loadDropdownData = useCallback(async () => {
        try {
            let endpoint = '';
            
            if (reportType === 'patient_records' || reportType === 'bills' || reportType === 'appointments') {
                endpoint = '/patient-record-dropdown/'; 
            } else if (reportType === 'salary') {
                endpoint = '/staff-dropdown/';
            } else if (reportType === 'suppliers') {
                endpoint = '/supplier-dropdown/'; 
            } else if (reportType === 'inventory') {
                endpoint = '/inventory-dropdown/'; 
            }

            if (!endpoint) {
                setOptionsList([]);
                return;
            }

            const res = await AxiosInstance.get(endpoint);
            const rawData = res.data || [];
            
            const seenIds = new Set();
            const structuredData = [];

            rawData.forEach(item => {
                if (!item) return;

                if (reportType === 'patient_records' || reportType === 'bills' || reportType === 'appointments') {
                    const pId = item.patient_id || item.record_id || item.id;
                    
                    if (pId && !seenIds.has(pId)) {
                        seenIds.add(pId);
                        const labelName = item.full_name || `${item.name_first || ''} ${item.name_last || ''}`.trim();
                        const finalLabel = labelName ? `Patient ID: ${pId} - ${labelName}` : `Patient ID: ${pId}`;

                        structuredData.push({
                            value: String(pId),
                            unique_key: `patient-${pId}`,
                            label: finalLabel
                        });
                    }
                } else if (reportType === 'salary') {
                    const sId = item.staff_id || item.id;
                    
                    if (sId && !seenIds.has(sId)) {
                        seenIds.add(sId);
                        const fullName = item.label || item.full_name || `${item.name_first || ''} ${item.name_last || ''}`.trim();
                        const finalLabel = fullName ? `Staff ID: ${sId} - ${fullName}` : `Staff ID: ${sId}`;

                        structuredData.push({
                            value: String(sId),
                            unique_key: `staff-${sId}`,
                            label: finalLabel
                        });
                    }
                } else if (reportType === 'suppliers') {
                    const supId = item.supplier_id || item.id;
                    
                    if (supId && !seenIds.has(supId)) {
                        seenIds.add(supId);
                        const compName = item.company_name || item.label || `Supplier ID: ${supId}`;
                        
                        structuredData.push({
                            value: String(supId),
                            unique_key: `supplier-${supId}`,
                            label: compName
                        });
                    }
                } else if (reportType === 'inventory') {
                    const itemId = item.item_id || item.id;
                    
                    if (itemId && !seenIds.has(itemId)) {
                        seenIds.add(itemId);
                        const iName = item.item_name || `Item ID: ${itemId}`;
                        const finalLabel = `Item ID: ${itemId} - ${iName}`;

                        structuredData.push({
                            value: String(itemId),
                            unique_key: `inventory-${itemId}`,
                            label: finalLabel
                        });
                    }
                }
            });

            structuredData.sort((a, b) => a.label.localeCompare(b.label));
            setOptionsList(structuredData);

        } catch (err) {
            console.error("Dropdown data loading error:", err);
            setToast({ show: true, message: 'Failed to load dropdown options.', type: 'danger' });
        }
    }, [reportType, setToast]);

    // 3. Reload dropdown entries when filter options change
    useEffect(() => {
        if (!userRole) return;

        // Skip dropdown API query if it's a doctor looking up their own salary status
        if (userRole === 'doctor' && reportType === 'salary') {
            setOptionsList([]);
            return;
        }

        // Skip dropdown API query completely for patient requests
        if (userRole === 'patient') {
            setOptionsList([]);
            return;
        }

        if (scope === 'single') {
            loadDropdownData();
        } else {
            setOptionsList([]);
        }
    }, [scope, userRole, reportType, loadDropdownData]);

    // 4. Download PDF Report
    const handleDownloadReport = async () => {
        setLoading(true);
        try {
            // Check if it's a doctor generating a salary statement or a patient looking up their data to enforce payload constraints
            const isDoctorSalary = userRole === 'doctor' && reportType === 'salary';
            const isPatient = userRole === 'patient';

            const finalScope = (isDoctorSalary || isPatient) ? 'single' : scope;
            const finalTargetId = (isDoctorSalary || isPatient) ? '' : targetId;

            const response = await AxiosInstance.post('/generate-hospital-report/', {
                report_by: userRole, 
                report_type: reportType,
                scope: finalScope,
                target_id: finalTargetId
            }, { responseType: 'blob' });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Hospital_Report_${reportType}_${new Date().toISOString().slice(0,10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setToast({ show: true, message: 'PDF report downloaded successfully.', type: 'success' });
        } catch (err) {
            if (err.response && err.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    const rawResult = reader.result;
                    try {
                        const errorObj = JSON.parse(rawResult);
                        console.error("Django API Error:", errorObj.error || errorObj);
                    } catch (jsonErr) {
                        console.error("Django Backend String Error:", rawResult);
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                console.error("Frontend Critical Error:", err);
            }

            setToast({ show: true, message: 'Failed to generate PDF report.', type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const getReportTypeOptions = () => {
        if (userRole === 'patient') {
            return [
                { value: 'patient_records', label: 'My Treatment History' },
                { value: 'bills', label: 'My Bills' }
            ];
        }
        if (userRole === 'doctor') {
            return [
                { value: 'patient_records', label: 'Patient Directory' },
                { value: 'salary', label: 'My Salary History' }
            ];
        }
        return [
            { value: 'patient_records', label: 'Patient Records' },
            { value: 'salary', label: 'Salary Records' },
            { value: 'bills', label: 'Patient Bills' },
            { value: 'appointments', label: 'Appointments' },
            { value: 'inventory', label: 'Clinic Stock Inventory' }, 
            { value: 'suppliers', label: 'Supplier / Vendor Registry' },
            { value: 'departments', label: 'Department Summary' }
        ];
    };

    const scopeOptions = [
        { value: 'all', label: 'All Records' },
        { value: 'single', label: 'Select Specific Record' }
    ];

    if (pageLoading) {
        return (
            <div style={panelContainer}>
                <div style={{ fontSize: '15px', color: '#64748b', fontWeight: '500' }}>
                    Loading Report Generator...
                </div>
            </div>
        );
    }

    if (userRole === 'nurse') {
        return (
            <div style={panelContainer}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px', color: '#0f172a' }}>Report Generation</h2>
                <div style={{ ...cardLayout, color: '#64748b', fontSize: '14px' }}>
                    ⚠️ Your account profile (Nurse) does not have permission to generate reports.
                </div>
            </div>
        );
    }

    // Determine if we should hide scope filters (Department report, Doctor salary, OR Patient ledger views)
    const isSalaryForDoctor = userRole === 'doctor' && reportType === 'salary';
    const isPatient = userRole === 'patient';
    const showScopeSelection = reportType !== 'departments' && !isSalaryForDoctor && !isPatient;

    // Check if submit button should be interactive
    const isButtonDisabled = loading || (scope === 'single' && !targetId && !isSalaryForDoctor && !isPatient);

    return (
        <div style={panelContainer}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '25px', color: '#0f172a' }}>
                Report Generation Center
            </h2>
            
            <div style={cardLayout}>
                {/* 1. Report Category Selector */}
                <div style={fieldWrapper}>
                    <label style={fieldLabel}>Select Report Category</label>
                    <CustomSelect 
                        options={getReportTypeOptions()}
                        value={reportType}
                        placeholder="Choose category..."
                        onChange={(val) => {
                            setReportType(val);
                            setScope('all');
                            setTargetId('');
                            setOptionsList([]);
                        }}
                    />
                </div>

                {/* 2. Scope Filter Selector - Hidden for departments, doctor salary, and patients */}
                {showScopeSelection && (
                    <div style={fieldWrapper}>
                        <label style={fieldLabel}>Filter Options</label>
                        <CustomSelect 
                            options={scopeOptions}
                            value={scope}
                            placeholder="Select data range..."
                            onChange={(val) => {
                                setScope(val);
                                setTargetId('');
                            }}
                        />
                    </div>
                )}

                {/* 3. Dropdown for selecting a single item - Hidden for doctor salary and patients */}
                {scope === 'single' && reportType !== 'departments' && !isSalaryForDoctor && !isPatient && (
                    <div style={fieldWrapper}>
                        <label style={fieldLabel}>Choose Specific Record</label>
                        <CustomSelect 
                            options={optionsList}
                            value={targetId}
                            placeholder={optionsList.length === 0 ? "Loading records..." : "Search or choose a record..."}
                            onChange={(val) => setTargetId(val)}
                        />
                    </div>
                )}

                {/* 4. Submit Button */}
                <button 
                    style={loading ? { ...submitBtn, background: '#94a3b8', cursor: 'not-allowed' } : submitBtn} 
                    onClick={handleDownloadReport}
                    disabled={isButtonDisabled}
                >
                    {loading ? 'Generating PDF Report...' : '⚙️ Download PDF Report'}
                </button>
            </div>
        </div>
    );
};

const panelContainer = { padding: '40px', background: 'transparent', minHeight: '85vh' };
const cardLayout = { background: '#ffffff', padding: '35px', paddingBottom: '55px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.05)', maxWidth: '600px' };
const fieldWrapper = { marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '8px' };
const fieldLabel = { fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
const submitBtn = { marginTop: '10px', padding: '14px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', width: '100%', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.25)', transition: 'background 0.2s' };

export default ReportManagement;