import React from "react";
import DoctorManagement from "./DoctorPart";
import NurseManagement from "./NursePart";
import ManagerManagement from "./ManagerManagement";

const StaffManagement = ({ setToast }) => {

  return (
    <>
      <div>
        <DoctorManagement setToast={setToast} />
        <NurseManagement setToast={setToast} />
        <ManagerManagement setToast={setToast} />
      </div>
      <div>
        
      </div>
    </>
  );

};

export default StaffManagement;