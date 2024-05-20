import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  getFirestore,
  collection,
  where,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} from "firebase/functions";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import TablePagination from "@mui/material/TablePagination";
import "./style.css";
import * as functions from "firebase/functions";
import AlertDialog from "../../components/common/alertDialog";
import EditDialog from "./editModal";
import NewUserDialog from "./addModal";
import AlertMessage from "../../components/common/alertMessage";
import { Edit } from "@mui/icons-material";

interface User {
  id: number;
  avatar: string;
  email: string;
  phone: string;
  fristName: string;
  lastName: string;
  uid: string;
}

type ContactData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function UserTable() {
  const db = getFirestore();
  const auth = getAuth();
  const functions = getFunctions(getApp());

  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  const deleteUser = httpsCallable(functions, "deleteUser");
  const updateUser = httpsCallable(functions, "updateUser");
  const setAdmin = httpsCallable(functions, "setAdmin");
  const sendMail = httpsCallable(functions, "sendMail");
  // setAdmin();
  // const addNumbers = httpsCallable(functions, "addNumbers");
  // addNumbers({ firstNumber: 10, secondNumber: 20 }).then((result) => {
  //   console.log(result);
  // });

  const [currentUser, setCurrentUser] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  const handleOkPressed = () => {
    setAlertVisible(false);
    deleteUserData(currentUser);
    // Handle "OK" press here
  };

  const handleCancelPressed = () => {
    setAlertVisible(false);
    // Handle "Cancel" press here
  };

  const [dialogVisible, setDialogVisible] = useState(false);
  const handleSave = (data: ContactData) => {
    // Handle contact data here
    console.log(data);
    createUserWithEmailAndPassword(auth, data.email, "123456")
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;

        updateProfile(user, {
          displayName: `${data.firstName} ${data.lastName}`,
        })
          .then(() => {
            console.log("Profile updated");
          })
          .catch((error) => {
            console.log("Profile update Error");
          });
        setDoc(doc(db, "users", user.uid), {
          fristName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          uid: user.uid,
        });

        sendEmailVerification(user).then(() => {
          console.log("Verification Email sent");
        });

        sendMail({
          email: data.email,
          title: "Welcome to Argos Geospatial-Intelligence Tool",
          content: `Dear ${data.firstName} ${data.lastName},

We're delighted to welcome you to the Argos Geospatial-Intelligence Tool community! \n Your account has been successfully created and you now have full access to our wide range of powerful geospatial tools and capabilities. \n We value your trust and commitment and we're excited to support your work. Thank you for choosing Argos Geospatial-Intelligence Tool, and here's to making the world a more connected and understood place.

Best regards,

Argos Geospatial-Intelligence Team`,
        }).then((result) => {});
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        setAlertMessageVisible(true);
        setAlertMessageColor("#f44336");

        if (error.code === "auth/email-already-in-use") {
          setAlertMessageContent(
            "An account with this email already exists. Please add a different email address."
          );
        } else {
          console.log(error);
          setAlertMessageContent(error.message);
        }
      });
    setDialogVisible(false);
    refresh();
  };
  const handleCancel = () => {
    setDialogVisible(false);
  };

  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<ContactData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleEditDialogSave = async (data: ContactData) => {
    // Handle contact data here
    updateUserData(data);
    setEditDialogVisible(false);
    refresh();
  };
  const handleEditDialogCancel = () => {
    setEditDialogVisible(false);
  };

  const [alertMessageVisible, setAlertMessageVisible] =
    useState<boolean>(false);
  const [alertMessageContent, setAlertMessageContent] = useState("");
  const [alertMessageColor, setAlertMessageColor] = useState("");
  function handleAlertMessageClose() {
    setAlertMessageVisible(false);
  }

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [users, setUsers] = useState<User[]>([]);
  const fetchData = async () => {
    const docRef = query(collection(db, "users"));
    const docSnap = await getDocs(docRef);

    const data: User[] = [];
    const fetchedItems = docSnap.forEach((doc: any) => {
      // console.log(doc.id, " => ", doc.data());
      data.push(doc.data());
      // setUsers((prevNames) => [...prevNames, doc.data()]);
    });
    setUsers(data);
    console.log("???");
  };
  const deleteUserData = (docName: string) => {
    deleteDoc(doc(db, "users", docName));
    deleteUser(docName).then((result) => {
      console.log("delete account successfully");
    });
    refresh();
  };
  const updateUserData = async (data: any) => {
    const userRef = doc(db, "users", currentUser);

    await updateDoc(userRef, {
      email: data.email,
      phone: data.phone,
      fristName: data.firstName,
      lastName: data.lastName,
      uid: currentUser,
    });

    updateUser({ uid: currentUser, data: data }).then((result) => {
      console.log(result);
    });
  };
  const refresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Typography
        style={{ textAlign: "center", fontSize: "40px", marginBottom: "10px" }}
      >
        User Table
      </Typography>
      <div style={{ float: "right" }}>
        <IconButton
          style={{ width: "50px" }}
          onClick={() => {
            setDialogVisible(true);
          }}
        >
          <AddIcon />
        </IconButton>
        <IconButton style={{ width: "50px" }} onClick={refresh}>
          <RefreshIcon />
        </IconButton>
      </div>

      <div>
        <AlertDialog
          message="Are you sure you want to delete this User?"
          isVisible={alertVisible}
          onOkPressed={handleOkPressed}
          onCancelPressed={handleCancelPressed}
        />
      </div>

      <div>
        <NewUserDialog
          visible={dialogVisible}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
      <div>
        <EditDialog
          visible={editDialogVisible}
          data={currentUserData}
          onSave={handleEditDialogSave}
          onCancel={handleEditDialogCancel}
        />
      </div>

      <AlertMessage
        message={alertMessageContent}
        visible={alertMessageVisible}
        color={alertMessageColor}
        onClose={handleAlertMessageClose}
      />

      <Table>
        <TableHead style={{ background: "#233044" }}>
          <TableRow>
            <TableCell style={{ color: "white" }}>Avatar</TableCell>
            <TableCell style={{ color: "white" }}>Email</TableCell>
            <TableCell style={{ color: "white" }}>Phone</TableCell>
            <TableCell style={{ color: "white" }}>Name</TableCell>
            <TableCell style={{ color: "white" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : users
          ).map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar alt="User Avatar" src={user.avatar} />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.fristName + " " + user.lastName}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    const data: ContactData = {
                      firstName: user.fristName,
                      lastName: user.lastName,
                      email: user.email,
                      phone: user.phone,
                    };
                    setCurrentUser(user.uid);
                    setCurrentUserData(data);
                    setEditDialogVisible(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setCurrentUser(user.uid);
                    setAlertVisible(true);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Rows per page"
      />
    </>
  );
}

export default UserTable;
