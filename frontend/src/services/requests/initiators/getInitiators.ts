import { useQuery } from "react-query";
import { getInitiators } from "../../../api/initiators/getInitiators";
import { IUseGetRequest } from "../../../interfaces/common/common";
import { TIncidentFilter } from "../../../interfaces/requests/incident";

export const useGetInitiators = (filter: IUseGetRequest<TIncidentFilter>) => {
  const { data, isLoading } = useQuery(["getAllInitiators", filter], () =>
    getInitiators(filter),
  );

  return { data, isLoading };
};
