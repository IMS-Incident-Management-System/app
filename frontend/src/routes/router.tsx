import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { BaseLayout } from "../layouts/baseLayout/baseLayout";
import { Home } from "../pages/Home/Home";
import { Incidents } from "../pages/Incidents/Incidents";
import { Incident } from "../pages/Incident/Incident";

export const router = createBrowserRouter([
  {
    path: "",
    element: <BaseLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/incidents",
        element: <Incidents />,
      },
      {
        path: "/incidents/:id",
        element: <Incident />,
      },
    ],
  },
]);
