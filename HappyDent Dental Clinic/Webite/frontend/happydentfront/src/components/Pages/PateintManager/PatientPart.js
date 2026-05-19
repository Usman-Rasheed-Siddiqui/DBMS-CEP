import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const PatientManagement = ({ setToast }) => {

  // ---------------- STATES ----------------

  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    patient_id: "",
    email: "",
    password: "",

    first_name: "",
    last_name: "",

    gender: "",
    marital_status: "",

    address: "",

    has_diabetes: false,
    has_hypertension: false,
    has_allergies: false,

    dob: "",

    phone_numbers: "",
  });

  // ---------------- FETCH PATIENTS ----------------

  const fetchPatients = async () => {

    try {

      const params = new URLSearchParams();

      if (search) {
        params.append("search", search);
      }

      if (gender) {
        params.append("gender", gender);
      }

      if (maritalStatus) {
        params.append("marital_status", maritalStatus);
      }

      const res = await AxiosInstance.get(
        `/patient-list-manager/?${params.toString()}`
      );

      setPatients(res.data);

    } catch (err) {

      setToast({
        show: true,
        message: "Failed to fetch patients",
        type: "danger",
      });

    }

  };

  useEffect(() => {
    fetchPatients();
  }, [search, gender, maritalStatus]);

  // ---------------- OPEN ADD ----------------

  const openAdd = () => {

    setMode("add");

    setForm({
      patient_id: "Auto-generated",
      email: "",
      password: "",

      first_name: "",
      last_name: "",

      gender: "",
      marital_status: "",

      address: "",

      has_diabetes: false,
      has_hypertension: false,
      has_allergies: false,

      dob: "",

      phone_numbers: "",
    });

    setShowModal(true);

  };

  // ---------------- OPEN UPDATE ----------------

  const openUpdate = (patient) => {

    setMode("update");

    setSelectedPatient(patient);

    const nameStr = patient?.full_name || "";
    const nameParts = nameStr.split(" ");

    setForm({
      patient_id: patient?.patient_id || "",
      email: patient?.email || "",
      password: "",

      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",

      gender: patient?.gender || "",
      marital_status: patient?.marital_status || "",

      address: patient?.address || "",

      has_diabetes: patient?.has_diabetes || false,
      has_hypertension: patient?.has_hypertension || false,
      has_allergies: patient?.has_allergies || false,

      dob: patient?.dob || "",

      phone_numbers: Array.isArray(patient?.phone_numbers)
        ? patient.phone_numbers.join(", ")
        : "",
    });

    setShowModal(true);

  };

  // ---------------- DELETE ----------------

  const handleDelete = async (patient_id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmDelete) return;

    try {

      await AxiosInstance.delete(
        `/patient-delete/${patient_id}/`
      );

      setToast({
        show: true,
        message: "Patient deleted successfully",
        type: "success",
      });

      fetchPatients();

    } catch (err) {

      const msg =
        err.response?.data?.error ||
        "Failed to delete patient";

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

        patient_id: form.patient_id,
        email: form.email,
        password: form.password,

        first_name: form.first_name,
        last_name: form.last_name,

        gender: form.gender,
        marital_status: form.marital_status,

        address: form.address,

        has_diabetes: form.has_diabetes,
        has_hypertension: form.has_hypertension,
        has_allergies: form.has_allergies,

        dob: form.dob,

        phone_numbers: form.phone_numbers
          ? form.phone_numbers
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p !== "")
          : [],
      };

      if (mode === "add") {

        if (!form.password) {

          setToast({
            show: true,
            message: "Password is required",
            type: "danger",
          });

          return;
        }

        await AxiosInstance.post(
          "/patient-add/",
          payload
        );

        setToast({
          show: true,
          message: "Patient added successfully",
          type: "success",
        });

      } else {

        await AxiosInstance.put(
          `/patient-edit/${selectedPatient.patient_id}/`,
          payload
        );

        setToast({
          show: true,
          message: "Patient updated successfully",
          type: "success",
        });

      }

      setShowModal(false);

      fetchPatients();

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
        accessorKey: "patient_id",
        header: "Patient ID",
      },

      {
        accessorKey: "full_name",
        header: "Patient",
      },

      {
        accessorKey: "email",
        header: "Email",
      },

      {
        accessorKey: "gender",
        header: "Gender",
      },

      {
        accessorKey: "marital_status",
        header: "Marital Status",
      },

      {
        accessorKey: "dob",
        header: "DOB",
      },

      {
        accessorKey: "has_diabetes",
        header: "Diabetes",

        cell: ({ getValue }) =>
          getValue() ? "Yes" : "No",
      },

      {
        accessorKey: "has_hypertension",
        header: "Hypertension",

        cell: ({ getValue }) =>
          getValue() ? "Yes" : "No",
      },

      {
        accessorKey: "has_allergies",
        header: "Allergies",

        cell: ({ getValue }) =>
          getValue() ? "Yes" : "No",
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
                handleDelete(row.original.patient_id)
              }
            >
              Delete
            </button>

          </div>

        ),
      },
    ],
    [patients]
  );

  const table = useReactTable({
    data: patients,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (

    <div style={container}>

      {/* HEADER */}

      <div style={topBar}>

        <h2 style={heading}>
          Patient Management
        </h2>

        <button
          style={addBtn}
          onClick={openAdd}
        >
          + Add Patient
        </button>

      </div>

      {/* FILTERS */}

      <div style={filterBar}>

        <input
          placeholder="Search by name, email or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <div style={{ width: "220px" }}>

          <CustomSelect
            options={[
              {
                value: "",
                label: "All Genders",
              },
              {
                value: "Male",
                label: "Male",
              },
              {
                value: "Female",
                label: "Female",
              },
            ]}
            value={gender}
            onChange={(val) => setGender(val)}
          />

        </div>

        <div style={{ width: "220px" }}>

          <CustomSelect
            options={[
              {
                value: "",
                label: "All Status",
              },
              {
                value: "Single",
                label: "Single",
              },
              {
                value: "Married",
                label: "Married",
              },
            ]}
            value={maritalStatus}
            onChange={(val) =>
              setMaritalStatus(val)
            }
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
                ? "Add Patient"
                : "Manage Patient"}

            </h3>

            <div style={formGrid}>

              <input
                placeholder="Patient ID"
                value={form.patient_id}
                disabled
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

              {mode === "add" && (

                <input
                  type="password"
                  placeholder="Account Password"
                  value={form.password}
                  disabled = {mode === "update"}
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

              <div>

                <CustomSelect
                  options={[
                    {
                      value: "Male",
                      label: "Male",
                    },
                    {
                      value: "Female",
                      label: "Female",
                    },
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

              <div>

                <CustomSelect
                  options={[
                    {
                      value: "Single",
                      label: "Single",
                    },
                    {
                      value: "Married",
                      label: "Married",
                    },
                  ]}
                  value={form.marital_status}
                  onChange={(val) =>
                    setForm({
                      ...form,
                      marital_status: val,
                    })
                  }
                />

              </div>

              <input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dob: e.target.value,
                  })
                }
                style={input}
              />

              <textarea
                rows="2"
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

              <div style={checkboxWrap}>

                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.has_diabetes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        has_diabetes:
                          e.target.checked,
                      })
                    }
                  />
                  Diabetes
                </label>

                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.has_hypertension}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        has_hypertension:
                          e.target.checked,
                      })
                    }
                  />
                  Hypertension
                </label>

                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.has_allergies}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        has_allergies:
                          e.target.checked,
                      })
                    }
                  />
                  Allergies
                </label>

              </div>

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

export default PatientManagement;

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
  gridTemplateColumns: "1fr 220px 220px",
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

const checkboxWrap = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "500",
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
  width: "800px",
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