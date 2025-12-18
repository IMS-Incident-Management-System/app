import { useQuery } from "react-query";
import { getIncidentEventTypes } from "../../../api/incidentEventTypes/incidentEventTypes";

export const useGetIncidentEventTypes = () => {
  const response = useQuery(["getAllIncidentEventTypes"], () =>
    getIncidentEventTypes(),
  );

  return response;
};


