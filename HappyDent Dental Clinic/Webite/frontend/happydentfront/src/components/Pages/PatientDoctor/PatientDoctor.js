import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import AxiosInstance from "../../Axios";
import CustomSelect from "../../CustomSelect/CustomSelect";

const PatientDoctor = ({ setToast }) => {

  // ---------------- STATES ----------------

  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

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

    </div>

  );

};

export default PatientDoctor;

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