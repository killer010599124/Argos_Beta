import "./index.css";
import React, { useState, useEffect } from "react";
interface AlertProps {
  message: string;
  visible: boolean;
  color: string;
  onClose: () => void;
}
function AlertMessage({ message, visible, color, onClose }: AlertProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <div
      className={`alert ${visible ? "visible" : ""}`}
      style={{
        position: "absolute",
        zIndex: "10",
        top: "5%",
        width: "20%",
        marginLeft: "40%",
        textAlign: "center",
        backgroundColor: color,
      }}
    >
      {message}
    </div>
  );
}

export default AlertMessage;
