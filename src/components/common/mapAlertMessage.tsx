import "./index.css";
import React, { useState, useEffect } from "react";
interface AlertProps {
  message: string;
  visible: boolean;
  color: string;
  onClose: () => void;
}
function MapAlertMessage({ message, visible, color, onClose }: AlertProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <div
      className={`alert ${visible ? "visible" : ""}`}
      style={{
        position: "absolute",
        zIndex: "10",
        top: "90%",
        width: "20%",
        marginLeft: "5%",
        textAlign: "center",
        borderWidth : 1,
        borderColor : 'white',
        backgroundColor: color
      }}
    >
      {message}
    </div>
  );
}

export default MapAlertMessage;
