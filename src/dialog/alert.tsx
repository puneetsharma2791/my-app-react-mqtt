import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
function AlertDialog({ message, flag }: { message: string; flag: boolean }) {
  const [showAlert, setShowAlert] = useState<boolean>(flag);

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <div>
      {showAlert && (
        <div
          className={`alert alert-${flag} alert-dismissible fade show`}
          role="alert"
        >
          {message}
          <button type="button" className="close" onClick={handleCloseAlert}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AlertDialog;
