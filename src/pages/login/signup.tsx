import { useState } from "react";
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import AlertMessage from "../../components/common/alertMessage";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import { getApp } from "firebase/app";
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
const SignUpPage = () => {
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const functions = getFunctions(getApp());
  // connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  const sendMail = httpsCallable(functions, "sendMail");

  const [validationErrors, setValidationErrors] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [alertContent, setAlertContent] = useState("");
  const [alertColor, setAlertColor] = useState("");
  const [alertVisible, setAlertVisible] = useState<boolean>(false);

  function handleAlertClose() {
    setAlertVisible(false);
  }
  const validateForm = (): boolean => {
    const errors: FormState = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    // Validate first name field
    if (!fristName.match(/^[a-zA-Z]+$/)) {
      errors.firstName = "First name must contain only letters";
      isValid = false;
    }

    // Validate last name field
    if (!lastName.match(/^[a-zA-Z]+$/)) {
      errors.lastName = "Last name must contain only letters";
      isValid = false;
    }

    // Validate email field
    if (!email.match(/^\S+@\S+\.\S+$/)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate phone number field
    if (!phone.match(/^[0-9]+$/)) {
      errors.phone = "Phone number must contain only numbers";
      isValid = false;
    }

    // Validate password field
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
      isValid = false;
    } else if (
      !password.match(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/
      )
    ) {
      errors.password =
        "Password must contain at least one letter, one number, and one special character";
      isValid = false;
    }

    // Validate confirm password field
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  function registerUser(auth: any, email: any, password: any) {
    if (validateForm()) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          // Signed in
          const user = userCredential.user;

          updateProfile(user, { displayName: `${fristName} ${lastName}` })
            .then(() => {
              console.log("Profile updated");
              // Profile updated!
              // ...
            })
            .catch((error) => {
              console.log("Profile update Error");
            });
          setDoc(doc(db, "users", user.uid), {
            fristName,
            lastName,
            email,
            phone,
            uid: user.uid,
          });

          sendEmailVerification(user).then(() => {
            console.log("Verification Email sent");
          });
          sendMail({
            email: email,
            title: "Welcome to Argos Geospatial-Intelligence Tool",
            content: `Dear ${fristName} ${lastName},

We're delighted to welcome you to the Argos Geospatial-Intelligence Tool community! \n Your account has been successfully created and you now have full access to our wide range of powerful geospatial tools and capabilities. \n We value your trust and commitment and we're excited to support your work. Thank you for choosing Argos Geospatial-Intelligence Tool, and here's to making the world a more connected and understood place.

Best regards,

Argos Geospatial-Intelligence Team`,
          }).then((result) => {});
          navigate("/signin");
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage);
          setAlertVisible(true);
          setAlertColor("#f44336");

          if (error.code === "auth/email-already-in-use") {
            setAlertContent(
              "An account with this email already exists. Please sign in or use a different email address."
            );
          } else {
            setAlertContent(error.message);
          }
          // ..
        });
    }
  }

  const [fristName, setFristName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [uid, setUid] = useState("");

  const handlefristNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFristName(event.target.value);
  };
  const handlelastNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(event.target.value);
  };
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="vh-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6 text-black" style={{ zIndex: "10" }}>
            <div className="d-flex align-items-center h-custom-2 px-5 ms-xl-4 mt-5 pt-5 pt-xl-0 mt-xl-n5">
              <form style={{ width: "23rem" }} onSubmit={handleSubmit}>
                <h3
                  className="fw-normal mb-3 pb-3"
                  style={{ letterSpacing: "1px", color: "white" }}
                >
                  Sign Up
                </h3>

                <div className="form-outline mb-4 d-flex">
                  <div className=" me-3">
                    <input
                      type=""
                      id="form2Example22"
                      className="form-control form-control-lg mb-3 "
                      placeholder="First Name"
                      value={fristName}
                      onChange={handlefristNameChange}
                    />
                    {validationErrors.firstName && (
                      <div className="error">{validationErrors.firstName}</div>
                    )}
                  </div>
                  <div>
                    <input
                      type=""
                      id="form2Example23"
                      className="form-control form-control-lg mb-3"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={handlelastNameChange}
                    />
                    {validationErrors.lastName && (
                      <div className="error">{validationErrors.lastName}</div>
                    )}
                  </div>
                </div>
                <div className="form-outline mb-4">
                  <input
                    type="email"
                    id="form2Example18"
                    className="form-control form-control-lg"
                    placeholder="Email address"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  {validationErrors.email && (
                    <div className="error">{validationErrors.email}</div>
                  )}
                </div>
                <div className="form-outline mb-4">
                  <input
                    type="phone"
                    id="form2Example20"
                    className="form-control form-control-lg"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                  {validationErrors.phone && (
                    <div className="error">{validationErrors.phone}</div>
                  )}
                </div>
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form2Example28"
                    className="form-control form-control-lg"
                    placeholder="password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {validationErrors.password && (
                    <div className="error">{validationErrors.password}</div>
                  )}
                </div>
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form2Example29"
                    className="form-control form-control-lg"
                    placeholder="confirm password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  {validationErrors.confirmPassword && (
                    <div className="error">
                      {validationErrors.confirmPassword}
                    </div>
                  )}
                </div>

                <div className="pt-1 mb-4">
                  <button
                    className="btn btn-info btn-lg btn-block"
                    style={{ color: "white", width: "100%" }}
                    onClick={() => {
                      registerUser(auth, email, password);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div
            className="col-sm-12 px-0 d-none d-sm-block"
            style={{ position: "absolute" }}
          >
            <img
              src={process.env.PUBLIC_URL + "/login.jpg"}
              alt="Login image"
              className="w-100 vh-100"
              style={{ objectFit: "cover", objectPosition: "left" }}
            />
          </div>
        </div>
        <AlertMessage
          message={alertContent}
          visible={alertVisible}
          color={alertColor}
          onClose={handleAlertClose}
        />
      </div>
    </div>
  );
};

export default SignUpPage;
