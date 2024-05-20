import { BrowserRouter, Route, Routes, Router } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { mapRoutes } from "./routes/appRoutes";
import { routes } from "./routes";
import LoginPage from "./pages/login/login";
import SignUpPage from "./pages/login/signup";
import "./configs/firebaseConfig";
import ProtectRoute from "./routes/protectRoute";
import AdminLayout from "./components/layout/AdminLayout";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<ProtectRoute />}>
          <Route path="/map" element={<MainLayout />}>
            {mapRoutes}
          </Route>
        </Route>
        <Route element={<ProtectRoute />}>
          <Route path="/" element={<AdminLayout />}>
            {routes}
          </Route>
        </Route>
        {/* <ProtectRoute path="/" element={<MainLayout />}>
          {routes}
        </ProtectRoute> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
