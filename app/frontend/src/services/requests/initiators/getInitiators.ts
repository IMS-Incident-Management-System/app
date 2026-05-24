import { useQuery } from "react-query";
import { getInitiators } from "../../../api/incidents/incidents";
import { IUseGetRequest } from "../../../interfaces/common/common";
import { TIncidentFilter } from "../../../interfaces/requests/incident";
import { EQueryKeys } from "../../../enums/query";

export const useGetInitiators = (filter: IUseGetRequest<TIncidentFilter>) => {
  const { data, isLoading } = useQuery(
    [EQueryKeys.GET_ALL_INITIATORS, filter],
    () => getInitiators(filter),
  );

  return { data, isLoading };
};
