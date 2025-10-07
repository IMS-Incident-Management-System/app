import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { BaseLayout } from "../layouts/baseLayout/baseLayout";
import { Home } from "../pages/Home/Home";
import { ERoutes } from "../enums/routes";
import { Profile } from "../pages/Profile/Profile";
import { IncidentProvider } from "../pages/IncidentProvider/IncidentProvider";
import { IncidentView } from "../pages/IncidentView/IncidentView";
import Departments from "../pages/Departments";
import IncidentEvents from "../pages/IncidentEvents";
import ObjectTypes from "../pages/ObjectTypes";
import References from "../pages/References";

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
        path: ERoutes.INCIDENT_CREATE,
        element: <IncidentProvider />,
      },
      {
        path: ERoutes.INCIDENT_EDIT,
        element: <IncidentProvider />,
      },
      {
        path: ERoutes.INCIDENT_DUPLICATE_ID,
        element: <IncidentProvider />,
      },
      {
        path: ERoutes.INCIDENT_VIEW_ID,
        element: <IncidentView />,
      },
      {
        path: ERoutes.DEPARTMENTS,
        element: <Departments />,
      },
      {
        path: ERoutes.PROFILE,
        element: <Profile />,
      },
      {
        path: ERoutes.INCIDENT_EVENTS,
        element: <IncidentEvents />,
      },
      {
        path: ERoutes.OBJECT_TYPES,
        element: <ObjectTypes />,
      },
      {
        path: ERoutes.REFERENCES,
        element: <References />,
      },
    ],
  },
]);
