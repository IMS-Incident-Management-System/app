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
import { OperationalActivitiesList } from "../pages/OperationalActivitiesList";
import { OperationalActivityProvider } from "../pages/OperationalActivityProvider";
import { OperationalActivityView } from "../pages/OperationalActivityView/OperationalActivityView";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { EventsList } from "../pages/EventsList/EventsList";
import { EventProvider } from "../pages/EventProvider/EventProvider";
import { EventView } from "../pages/EventView/EventView";
import { Reports } from "../pages/Reports/Reports";
import { ReportGenerator } from "../pages/Reports/ReportGenerator/ReportGenerator";
import { ExplanatoryNotesList } from "../pages/ExplanatoryNotesList/ExplanatoryNotesList";
import { Settings } from "../pages/Settings/Settings";

export const router = createBrowserRouter([
  {
    path: "",
    element: <BaseLayout />,
    children: [
      {
        path: ERoutes.HOME,
        element: <Dashboard />,
      },
      {
        path: ERoutes.INCIDENTS_LIST,
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
        path: ERoutes.INCIDENT_VIEW_ID,
        element: <IncidentView />,
      },
      {
        path: ERoutes.OPERATIONAL_ACTIVITIES_LIST,
        element: <OperationalActivitiesList />,
      },
      {
        path: ERoutes.OPERATIONAL_ACTIVITY_CREATE,
        element: <OperationalActivityProvider />,
      },
      {
        path: ERoutes.OPERATIONAL_ACTIVITY_EDIT,
        element: <OperationalActivityProvider />,
      },
      {
        path: ERoutes.OPERATIONAL_ACTIVITY_VIEW_ID,
        element: <OperationalActivityView />,
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
        path: ERoutes.SETTINGS,
        element: <Settings />,
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
      {
        path: ERoutes.EVENTS_LIST,
        element: <EventsList />,
      },
      {
        path: ERoutes.EVENT_CREATE,
        element: <EventProvider />,
      },
      {
        path: ERoutes.EVENT_EDIT,
        element: <EventProvider />,
      },
      {
        path: ERoutes.EVENT_VIEW_ID,
        element: <EventView />,
      },
      {
        path: ERoutes.REPORTS,
        element: <Reports />,
      },
      {
        path: ERoutes.REPORT_GENERATOR,
        element: <ReportGenerator />,
      },
      {
        path: ERoutes.EXPLANATORY_NOTES_LIST,
        element: <ExplanatoryNotesList />,
      },
    ],
  },
]);
