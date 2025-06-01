import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { BaseLayout } from "../layouts/baseLayout/baseLayout";
import { Home } from "../pages/Home/Home";
import { Incident } from "../pages/Incident/Incident";
import { ERoutes } from "../enums/routes";
import { Profile } from "../pages/Profile/Profile";
import { IncidentProvider } from "../pages/IncidentProvider/IncidentProvider";

export const router = createBrowserRouter([
  {
    path: "",
    element: <BaseLayout />,
    children: [
      {
        path: ERoutes.HOME,
        element: <Home />,
      },
      {
        path: ERoutes.INCIDENT,
        element: <Incident />,
      },
      {
        path: ERoutes.INCIDENT_CREATE,
        element: <IncidentProvider />,
      },
      {
        path: ERoutes.INCIDENT_EDIT,
        element: <IncidentProvider />,
      },
      {
        path: ERoutes.PROFILE,
        element: <Profile />,
      },
    ],
  },
]);
