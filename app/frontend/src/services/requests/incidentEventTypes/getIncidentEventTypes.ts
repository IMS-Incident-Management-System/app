import { useQuery } from "react-query";
import { getIncidentEventTypes } from "../../../api/incidentEventTypes/incidentEventTypes";

export const useGetIncidentEventTypes = () => {
  const response = useQuery(
    ["getAllIncidentEventTypes"],
    () => getIncidentEventTypes(),
    { staleTime: 0, refetchOnMount: 'always' }
  );

  return response;
};


