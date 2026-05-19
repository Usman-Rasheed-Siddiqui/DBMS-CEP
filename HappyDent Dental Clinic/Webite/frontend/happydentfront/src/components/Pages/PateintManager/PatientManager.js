
import React from "react";
import PatientManagement from "./PatientPart";
import PatientRecordManagement from "./PatientRecordManager";

const PatientWholeManagement = ({ setToast }) => {

  return (
    <>
      <div>
        <PatientManagement setToast={setToast}/>
        <PatientRecordManagement setToast={setToast}/>
      </div>
    </>
  );

};

export default PatientWholeManagement;