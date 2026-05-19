import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const DoctorManagement = ({ setToast }) => {

  // ---------------- STATES ----------------

  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [form, setForm] = useState({
    staff_id: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    gender: "",
    dept_id: "",
    phone_numbers: "",
    qualifications: "",
    specializations: "",
    license_number: "",
    years_experience: "",
  });

  // ---------------- FETCH DOCTORS ----------------

  const fetchDoctors = async () => {

    try {

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (specialization) {
        params.append("specialization", specialization);
      }

      if (qualification) {
        params.append("qualification", qualification);
      }

      if (gender) {
        params.append("gender", gender);
      }

      const res = await AxiosInstance.get(
        `/doctor-list-manager/?${params.toString()}`
      );

      setDoctors(res.data);

    } catch (err) {

      setToast({
        show: true,
        message: "Failed to fetch doctors",
        type: "danger",
      });

    }

  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization, qualification, gender]);

  // ---------------- OPEN ADD ----------------

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
      phone_numbers: "",
      qualifications: "",
      specializations: "",
      license_number: "",
      years_experience: "",
    });

    setShowModal(true);

  };

  // ---------------- OPEN UPDATE ----------------

  const openUpdate = (doctor) => {
      setMode("update");
      setSelectedDoctor(doctor);

      // 1. Use the correct key (full_name) 
      // 2. Add a fallback ('') before calling split
      const nameStr = doctor?.full_name || doctor?.name || "";
      const nameParts = nameStr.split(" ");
      
      setForm({
          staff_id: doctor?.staff_id || "",
          email: doctor?.email || "",

          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          password: "", 
          gender: doctor?.gender || "",
          dept_id: doctor?.dept_id || "",
          license_number: doctor?.license_number || "",
          years_experience: doctor?.years_experience || "",
          
          phone_numbers: Array.isArray(doctor?.phone_numbers) 
              ? doctor.phone_numbers.join(", ") 
              : "",
          qualifications: Array.isArray(doctor?.qualifications) 
              ? doctor.qualifications.join(", ") 
              : "",
          specializations: Array.isArray(doctor?.specializations) 
              ? doctor.specializations.join(", ") 
              : "",
      });

      setShowModal(true);
  };

  // ---------------- DELETE ----------------

  const handleDelete = async (staff_id) => {
    console.log("Deleting ID:", staff_id); // Check your console!
  if (!staff_id) {
    console.error("Staff ID is undefined!");
    return;
  }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmDelete) return;

    try {

      await AxiosInstance.delete(`/doctor-delete/${staff_id}/`);

      setToast({
        show: true,
        message: "Doctor deleted successfully",
        type: "success",
      });

      fetchDoctors();

    } catch (err) {

      setToast({
        show: true,
        message: "Failed to delete doctor",
        type: "danger",
      });

    }

  };

  // ---------------- SAVE ----------------

  const handleSubmit = async () => {
    console.log("Mode:", mode);
    console.log("Selected Doctor:", selectedDoctor);
    try {

      const payload = {
        staff_id: form.staff_id,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        gender: form.gender,
        dept_id: form.dept_id,

        license_number: form.license_number,
        years_experience: form.years_experience
          ? parseInt(form.years_experience)
          : null,

        phone_numbers: form.phone_numbers
          ? form.phone_numbers.split(",").map(p => p.trim())
          : [],

        qualifications: form.qualifications
          ? form.qualifications.split(",").map(q => q.trim())
          : [],

        specializations: form.specializations
          ? form.specializations.split(",").map(s => s.trim())
          : [],
      };

      if (mode === "add") {

        await AxiosInstance.post("/doctor-add/", payload);

        setToast({
          show: true,
          message: `Doctor added successfully`,
          type: "success",
        });

      } else {

        await AxiosInstance.put(
          `/doctor-edit/${selectedDoctor.staff_id}/`,
          payload
        );

        setToast({
          show: true,
          message: "Doctor updated successfully",
          type: "success",
        });

      }

      setShowModal(false);

      fetchDoctors();

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
        accessorKey: "staff_id",
        header: "Staff ID",
      },
      {
        accessorKey: "full_name", // Matches the view's column and JSON key
        header: "Doctor",
      },
      {
        accessorKey: "gender",
        header: "Gender",
      },
      {
        accessorKey: "dept_id",   // Matches the view's column and JSON key
        header: "Department",
      },

      {
        accessorKey: "license_number",
        header: "License No",
        cell: ({ getValue }) => {
          const val = getValue();
          return val ? `${val}` : "--";
        },
      },

      {
        accessorKey: "years_experience",
        header: "Experience",
        cell: ({ getValue }) => {
          const val = getValue();
          return val ? `${val} years` : "--";
        },
      },

      {
        accessorKey: "phone_numbers",
        header: "Phones",

        cell: ({ getValue }) => {

          const val = getValue();

          if (!val || val.length === 0) return "-";

          return (
            <div style={tagWrap}>
              {val.map((v, i) => (
                <span key={i} style={tag}>
                  {v}
                </span>
              ))}
            </div>
          );

        },
      },

      {
        accessorKey: "qualifications",
        header: "Qualifications",

        cell: ({ getValue }) => {

          const val = getValue();

          if (!val || val.length === 0) return "-";

          return (
            <div style={tagWrap}>
              {val.map((v, i) => (
                <span key={i} style={tag}>
                  {v}
                </span>
              ))}
            </div>
          );

        },
      },

      {
        accessorKey: "specializations",
        header: "Specializations",

        cell: ({ getValue }) => {

          const val = getValue();

          if (!val || val.length === 0) return "-";

          return (
            <div style={tagWrap}>
              {val.map((v, i) => (
                <span key={i} style={tagBlue}>
                  {v}
                </span>
              ))}
            </div>
          );

        },
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
              onClick={() => handleDelete(row.original.staff_id)}
            >
              Delete
            </button>

          </div>

        ),
      },
    ],
    [doctors]
  );

  const table = useReactTable({
    data: doctors,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (

    <div style={container}>

      {/* HEADER */}

      <div style={topBar}>

        <h2 style={heading}>
          Doctor Management
        </h2>

        <button style={addDoctorBtn} onClick={openAdd}>
          + Add Doctor
        </button>

      </div>

      {/* FILTERS */}

      <div style={filterBar}>

        <input
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <input
          placeholder="Search specialization..."
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          style={input}
        />

        <input
          placeholder="Search qualification..."
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          style={input}
        />

        <div style={{ width: "220px" }}>
          <CustomSelect
            options={[
              { value: "", label: "All Genders" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
            value={gender}
            onChange={(val) => setGender(val)}
          />
        </div>

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
                ? "Add Doctor"
                : "Manage Doctor"}

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
                placeholder="First Name"
                value={form.first_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    first_name: e.target.value,
                  })
                }
                style={input}
              />

              <input
                placeholder="Last Name"
                value={form.last_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    last_name: e.target.value,
                  })
                }
                style={input}
              />

              {mode === "add" && (

                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  style={input}
                />

              )}

              <input
                placeholder="Department ID"
                value={form.dept_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dept_id: e.target.value,
                  })
                }
                style={input}
              />

              <input
                placeholder="License Number"
                value={form.license_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    license_number: e.target.value,
                  })
                }
                style={input}
              />

              <input
                type="number"
                placeholder="Years of Experience"
                value={form.years_experience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    years_experience: e.target.value,
                  })
                }
                style={input}
              />

              <div style={{ gridColumn: "span 2" }}>

                <CustomSelect
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  value={form.gender}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      gender: val,
                    })
                  }
                />

              </div>

              <textarea
                rows="2"
                placeholder="Phone Numbers (comma separated)"
                value={form.phone_numbers}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone_numbers: e.target.value,
                  })
                }
                style={textarea}
              />

              <textarea
                rows="2"
                placeholder="Qualifications (comma separated)"
                value={form.qualifications}
                onChange={(e) =>
                  setForm({
                    ...form,
                    qualifications: e.target.value,
                  })
                }
                style={textarea}
              />

              <textarea
                rows="2"
                placeholder="Specializations (comma separated)"
                value={form.specializations}
                onChange={(e) =>
                  setForm({
                    ...form,
                    specializations: e.target.value,
                  })
                }
                style={textarea}
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

export default DoctorManagement;

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

const addDoctorBtn = {
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
  gridTemplateColumns: "1fr 1fr 1fr 220px",
  gap: "15px",
  marginBottom: "25px",
};

const tableWrap = {
  background: "white",
  borderRadius: "18px",
  padding: "20px",
  overflowX: "auto",
  maxHeight: "65vh",       // Sets a specific height (65% of viewport height)
  overflowY: "auto",      // Adds vertical scroll if content is too long
  overflowX: "auto",      // Adds horizontal scroll for small screens
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

const textarea = {
  padding: "12px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  resize: "none",
};

const tagWrap = {
  display: "flex",
  gap: "5px",
  flexWrap: "wrap",
};

const tag = {
  background: "#edf2f7",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
};

const tagBlue = {
  background: "#bee3f8",
  color: "#2b6cb0",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
};

const editBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#ebf8ff", color: "#3182ce", fontWeight: "600", cursor: "pointer" };

const deleteBtn = { padding: "8px 16px", border: "none", borderRadius: "10px", background: "#fff5f5", color: "#e53e3e", fontWeight: "600", cursor: "pointer" };

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
  width: "750px",
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