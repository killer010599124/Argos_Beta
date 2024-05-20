import { AppBar, Toolbar, Typography, Avatar, IconButton } from "@mui/material";
import colorConfigs from "../../configs/colorConfigs";
import sizeConfigs from "../../configs/sizeConfigs";
import "./index.css";
import { getAuth, signOut } from "firebase/auth";
import assets from "../../assets";

const AdminTopbar = () => {
  const auth = getAuth();
  function logout(auth: any) {
    signOut(auth)
      .then(() => {
        console.log("Sign-out successful.");
      })
      .catch((error) => {
        // An error happened.
      });
  }

  return (
    <AppBar
      style={{ background: "transparent" }}
      sx={{
        width: `calc(100%)`,

        boxShadow: "unset",
        backgroundColor: "black",
        // backgroundColor: colorConfigs.topbar.bg,
        // color: colorConfigs.topbar.color,
        color: "white",
        minHeight: "0px",
      }}
    >
      <Toolbar style={{ background: "#233044" }}>
        {/* <Typography
          variant="h6"
          style={{
            color: "white",
            position: "absolute",
            marginTop: "10px",
            marginLeft: "100px",
            fontSize: "30px",
          }}
        >
          Geospatial Mapping Software
        </Typography> */}
      </Toolbar>
      <Avatar
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "20px",
          position: "absolute",
          marginTop: "12px",
          marginLeft: "90%",
        }}
        alt="Remy Sharp"
        // src={assets.images.avatar}
      />
      <Typography
        variant="h6"
        style={{
          color: "white",
          position: "absolute",
          marginTop: "20px",
          marginLeft: "93%",
          fontSize: "16px",
        }}
      >
        Admin
      </Typography>
      <IconButton
        style={{
          position: "absolute",
          marginTop: "8px",
          marginLeft: "97%",
          width: "30px",
        }}
        onClick={() => {
          logout(auth);
        }}
      >
        <img
          src={assets.images.logout}
          alt="Button label"
          style={{ width: "30px", height: "30px" }}
        />
      </IconButton>
    </AppBar>
  );
};

export default AdminTopbar;
