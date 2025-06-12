import { useQuery } from "react-query";
import { getIncident } from "../../../api/incidents/incidents";

export const useGetIncident = (id: string | undefined) => {
  const response = useQuery(
    ["getIncident", id],
    () => (id ? getIncident(id) : null),
    {
      enabled: !!id,
    },
  );

  return response;
};
