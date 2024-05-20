import DashboardPageLayout from "../pages/dashboard/DashboardPageLayout";
import HomePage from "../pages/home/HomePage";
import { RouteType } from "./config";
import DashboardIndex from "../pages/dashboard/DashboardIndex";
import ChangelogPage from "../pages/changelog/ChangelogPage";

import ComponentPageLayout from "../pages/component/ComponentPageLayout";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { SupervisedUserCircle, Dashboard, People } from "@mui/icons-material";
import AlertPage from "../pages/component/AlertPage";
import ButtonPage from "../pages/component/ButtonPage";
import UsersPage from "../pages/users/users";
import MembershipPage from "../pages/membership/Membership";

const appRoutes: RouteType[] = [
  {
    index: true,
    element: <DashboardPageLayout />,
    state: "home",
  },
  {
    path: "/dashboard",
    element: <DashboardPageLayout />,
    state: "dashboard",
    sidebarProps: {
      displayText: "DashBoard",
      icon: <Dashboard />,
    },
    // child: [
    //   {
    //     index: true,
    //     element: <DashboardIndex />,
    //     state: "dashboard.index",
    //   },
    //   {
    //     path: "/dashboard/light",
    //     element: <LightMap />,
    //     state: "dashboard.light",
    //     sidebarProps: {
    //       displayText: "Light",
    //     },
    //   },
    // ],
  },
  {
    path: "/Users",
    element: <UsersPage />,
    state: "Users",
    sidebarProps: {
      displayText: "Users",
      icon: <People />,
    },
  },
  {
    path: "/membership",
    element: <MembershipPage />,
    state: "membership",
    sidebarProps: {
      displayText: "Memberships",
      icon: <SupervisedUserCircle />,
    },
  },
  //   {
  //     path: "/component",
  //     element: <ComponentPageLayout />,
  //     state: "component",
  //     sidebarProps: {
  //       displayText: "Tools",
  //       icon: <AppsOutlinedIcon />,
  //     },
  //     child: [
  //       {
  //         path: "/component/alert",
  //         element: <AlertPage />,
  //         state: "component.alert",
  //         sidebarProps: {
  //           displayText: "Draw Geofences",
  //         },
  //       },
  //       {
  //         path: "/component/button",
  //         element: <ButtonPage />,
  //         state: "component.button",
  //         sidebarProps: {
  //           displayText: "Extract Data",
  //         },
  //       },
  //     ],
  //   },

  //   {
  //     path: "/changelog",
  //     element: <ChangelogPage />,
  //     state: "changelog",
  //     sidebarProps: {
  //       displayText: "Changelog",
  //       icon: <FormatListBulletedOutlinedIcon />,
  //     },
  //   },
];

export default appRoutes;
