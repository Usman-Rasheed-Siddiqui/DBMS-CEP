
import React, { useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const UseToast = ({ show, message, type = "success", onClose }) => {
  const toastRef = useRef(null);
    
  useEffect(() => {
    if (toastRef.current) {
      const toastBootstrap = window.bootstrap.Toast.getOrCreateInstance(toastRef.current);

      if (show) {
        toastBootstrap.show();
      } else {
        toastBootstrap.hide();
      }

      // Sync state if the toast is closed via the 'x' button or auto-hide
      toastRef.current.addEventListener("hidden.bs.toast", onClose);
    }
  }, [show, onClose]);

  return (
    <>
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div ref={toastRef} className={`toast align-items-center text-white bg-${type} border-0`} role="alert">
          <div className="d-flex">
            <div className="toast-body">
            {message}
          </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              onClick={onClose}
            ></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UseToast;