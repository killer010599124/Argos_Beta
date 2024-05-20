import React, { useState } from "react";
import "./style.css";
type ContactData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ContactDialogProps = {
  visible: boolean;
  onSave: (data: ContactData) => void;
  onCancel: () => void;
};

const NewUserDialog: React.FC<ContactDialogProps> = ({
  visible,
  onSave,
  onCancel,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    const contactData: ContactData = {
      firstName,
      lastName,
      email,
      phone,
    };
    onSave(contactData);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 style={{ textAlign: "center" }}>Add New User</h2>
        <form
          style={{
            width: "100%",
            padding: "5%",
            margin: "0px",
          }}
        >
          <div className="form-group">
            <label htmlFor="first-name">First Name:</label>
            <input
              id="first-name"
              name="first-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last Name:</label>
            <input
              id="last-name"
              name="last-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="button-group">
            <button className="btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewUserDialog;
