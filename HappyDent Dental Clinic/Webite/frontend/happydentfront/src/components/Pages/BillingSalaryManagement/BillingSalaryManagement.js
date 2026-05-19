
import React from "react";

import BillingManagement from "./BillingPart";
import SalaryManagement from "./SalaryPart";

const BillingSalaryManagement = ({ setToast }) => {

  return (
    <>
      <div>
        <BillingManagement setToast={setToast}/>
        <SalaryManagement setToast={setToast}/>
      </div>
    </>
  );

};

export default BillingSalaryManagement;