import React, { useEffect, useState } from "react";
import UserTable from "./table";
import {
  doc,
  getDocs,
  getDoc,
  query,
  getFirestore,
  collection,
  where,
} from "firebase/firestore";

type Props = {};
interface User {
  id: number;
  avatar: string;
  email: string;
  phone: string;
  fristName: string;
  lastName: string;
}
//

const UsersPage = (props: Props) => {
  return (
    <div style={{ padding: "30px", marginTop: "5%" }}>
      <UserTable />
    </div>
  );
};

export default UsersPage;
