import React, { useEffect, useState } from "react";
import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const ProfilePage = ({ setToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState(null); // "doctor", "patient", or "management"

  const [profile, setProfile] = useState({
    name_first: "",
    name_last: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    marital_status: "",
    has_diabetes: false,
    has_hypertension: false,
    has_allergies: false,
    staff_role: "",
    dept_id: "",
    date_joined: "",
    staff_id: "",
    patient_id: "",
    clearance_level: "",
    budget_authority: 0,
    availability: true,
    budget_used: 0,
    acc_password: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      let finalData = null;
      let detectedRole = "patient";

      try {
        // 1. Try checking the staff profile route first
        const res = await AxiosInstance.get("/doctor-profile/");
        console.log("STAFF ROUTE RESPONSE:", res.data);
        
        if (res.data && res.data.staff_role) {
          finalData = res.data;
          if (res.data.staff_role.toLowerCase() === "management") {
            detectedRole = "management";
            const mgmtRes = await AxiosInstance.get("/management-profile/");
            finalData = mgmtRes.data;
          } else {
            detectedRole = "doctor";
          }
        }
      } catch (staffError) {
        // 2. Fallback to patient endpoint if the staff endpoint throws a 404 Not Found
        if (staffError.response?.status === 404) {
          console.log("User is not staff. Triage routing to patient endpoint...");
          
          // ⚠️ Verify this matches your exact patient GET route profile endpoint
          const patientRes = await AxiosInstance.get("/patient-profile/"); 
          finalData = patientRes.data;
          detectedRole = "patient";
        } else {
          // Pass along any other distinct server errors (e.g., 500 crashes)
          throw staffError;
        }
      }

      if (finalData) {
        setUserType(detectedRole);
        setProfile((prev) => ({ ...prev, ...finalData, acc_password: "" }));
      }

    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to fetch profile settings";
      setToast({ show: true, message: errMsg, type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      let endpoint = "/patient-profile-update/";
      if (userType === "doctor") endpoint = "/doctor-profile-update/";
      if (userType === "management") endpoint = "/management-profile-update/";

      const payload = { ...profile };

      if (!payload.acc_password || payload.acc_password.trim() === "") {
        delete payload.acc_password;
      }

      await AxiosInstance.put(endpoint, payload);
      setProfile(prev => ({ ...prev, acc_password: "" }));

      setToast({
        show: true,
        message: "Profile updated successfully",
        type: "success",
      });

    } catch (error) {
      setToast({
        show: true,
        message: error.response?.data?.error || "Failed to update profile",
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={loadingStyle}>Loading Profile Framework...</div>;

  return (
    <div style={containerStyle}>
      {/* HEADER SECTION */}
      <div style={headerStyle}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={titleStyle}>My Profile</h2>
            {/* ✅ Fixed: Safe optional chaining ensures null safety before value resolves */}
            <span style={badgeStyle}>{userType ? userType.toUpperCase() : ""}</span>
          </div>
          <p style={subtitleStyle}>Manage your account settings and preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={saveButtonStyle}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={mainGridStyle}>
        
        {/* LEFT COLUMN: ACCOUNT & PERSONAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>Basic Information</h3>
            <div style={innerGridStyle}>
              <EditableField label="First Name" name="name_first" value={profile.name_first} onChange={handleChange} />
              <ClarifiedField label="Last Name" name="name_last" value={profile.name_last} onChange={handleChange} />
              <EditableField label="Date of Birth" type="date" name="dob" value={profile.dob || ""} onChange={handleChange} />
              
              <div>
                <label style={labelStyle}>Gender</label>
                <CustomSelect
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  value={profile.gender}
                  onChange={(val) => setProfile(p => ({ ...p, gender: val }))}
                />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>Contact & Address</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InputField label="Email Address (System ID)" value={profile.email} disabled />
              <EditableField label="Residential Address" name="address" value={profile.address} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFESSIONAL, ADMINISTRATIVE, OR MEDICAL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>
               {userType === "doctor" && "Professional Credentials"}
               {userType === "management" && "Administrative Framework"}
               {userType === "patient" && "Medical Profile"}
            </h3>
            
            <div style={innerGridStyle}>
              {userType === "doctor" && (
                <>
                  <InputField label="Staff ID" value={profile.staff_id} disabled />
                  <InputField label="Department" value={profile.dept_id} disabled />
                  <InputField label="Current Role" value={profile.staff_role} disabled />
                  <InputField label="Joined Date" value={profile.date_joined} disabled />
                  <div style={{ marginTop: "10px" }}>
                      <CheckboxField label="Available For Appointments" name="availability" checked={profile.availability}
                          onChange={handleChange}/>
                  </div>


                </>
              )}

              {userType === "management" && (
                <>
                  <InputField label="Staff ID" value={profile.staff_id} disabled />
                  <InputField label="Current Role" value={profile.staff_role} disabled />
                  <InputField label="Clearance Level" value={profile.clearance_level} disabled />
                  <InputField label="Joined Date" value={profile.date_joined} disabled />
                  <InputField label="Budget Authority" value={`$${Number(profile.budget_authority).toLocaleString()}`} disabled />
                  <InputField label="Budget Spent" value={`$${Number(profile.budget_used).toLocaleString()}`} disabled />
                </>
              )}

              {userType === "patient" && (
                <>
                  <InputField label="Patient ID" value={profile.patient_id} disabled />
                  <div>
                    <label style={labelStyle}>Marital Status</label>
                    <CustomSelect
                      options={[
                        { value: "Single", label: "Single" },
                        { value: "Married", label: "Married" },
                      ]}
                      value={profile.marital_status}
                      onChange={(val) => setProfile(p => ({ ...p, marital_status: val }))}
                    />
                  </div>
                </>
              )}
            </div>

            {userType === "patient" && (
              <div style={checkboxGrid}>
                <CheckboxField label="Diabetes" name="has_diabetes" checked={profile.has_diabetes} onChange={handleChange} />
                <CheckboxField label="Hypertension" name="has_hypertension" checked={profile.has_hypertension} onChange={handleChange} />
                <CheckboxField label="Allergies" name="has_allergies" checked={profile.has_allergies} onChange={handleChange} />
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>Security</h3>
            <EditableField
              label="Change Password"
              type="password"
              name="acc_password"
              value={profile.acc_password}
              onChange={handleChange}
              placeholder="Leave empty if you don't want to change password"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

/* ---------------- HELPER COMPONENTS ---------------- */

const InputField = ({ label, value, disabled }) => (
  <div style={{ width: '100%' }}>
    <label style={labelStyle}>{label}</label>
    <input
      value={value || ""}
      disabled={disabled}
      style={{ ...inputStyle, background: "#f8fafc", color: "#64748b", cursor: "not-allowed", border: '1px dashed #cbd5e1' }}
    />
  </div>
);

const EditableField = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (
  <div style={{ width: '100%' }}>
    <label style={labelStyle}>{label}</label>
    <input type={type} name={name} value={value || ""} onChange={onChange} placeholder={placeholder} style={inputStyle} />
  </div>
);

const ClarifiedField = ({ label, name, value, onChange }) => (
    <div style={{ width: '100%' }}>
      <label style={labelStyle}>{label}</label>
      <input type="text" name={name} value={value || ""} onChange={onChange} style={inputStyle} />
    </div>
);

const CheckboxField = ({ label, name, checked, onChange }) => (
  <div style={checkboxContainerStyle}>
    <input
      type="checkbox"
      name={name}
      checked={checked || false}
      onChange={onChange}
      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
    />
    <label style={{ fontSize: '14px', fontWeight: '500', color: '#475569', cursor: 'pointer' }}>{label}</label>
  </div>
);

/* ---------------- STYLES ---------------- */

const containerStyle = { padding: "40px", backgroundColor: "transparent", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const badgeStyle = { backgroundColor: '#e2e8f0', color: '#475569', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' };
const titleStyle = { margin: 0, fontSize: "32px", fontWeight: "800", color: "#1e293b" };
const subtitleStyle = { marginTop: "4px", color: "#64748b", fontSize: "16px" };
const saveButtonStyle = { padding: "12px 24px", borderRadius: "12px", background: "#2563eb", color: "white", fontWeight: "600", border: "none", cursor: "pointer" };
const mainGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' };
const cardStyle = { background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const innerGridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const sectionTitleStyle = { marginBottom: "25px", fontSize: "18px", fontWeight: "700", color: "#334155", borderLeft: "4px solid #2563eb", paddingLeft: "12px" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#475569" };
const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" };
const checkboxGrid = { display: 'flex', gap: '25px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' };
const checkboxContainerStyle = { display: "flex", alignItems: "center", gap: "8px" };
const loadingStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#64748b' };

export default ProfilePage;