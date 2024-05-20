import React, { useState } from "react";

type AlertProps = {
  message: string;
  isVisible: boolean;
  onOkPressed: () => void;
  onCancelPressed: () => void;
};

const AlertDialog: React.FC<AlertProps> = ({
  message,
  isVisible,
  onOkPressed,
  onCancelPressed,
}) => {
  return (
    <div
      style={{
        display: isVisible ? "block" : "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "10px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "90%",
        }}
      >
        <div
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "50px" }}
        >
          {message}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
          }}
        >
          <button
            style={{
              borderRadius: "5px",
              backgroundColor: "#6c757d",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              height: "35px",
            }}
            onClick={onCancelPressed}
          >
            Cancel
          </button>
          <button
            style={{
              borderRadius: "5px",
              backgroundColor: "#007bff",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              height: "35px",
            }}
            onClick={onOkPressed}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
