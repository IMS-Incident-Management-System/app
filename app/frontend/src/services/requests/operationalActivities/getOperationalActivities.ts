import { useQuery } from "react-query";
import { getOperationalActivities } from "../../../api/operationalActivities/operationalActivities";
import { IUseGetRequest } from "../../../interfaces/common/common";
import { TOperationalActivityFilter } from "../../../interfaces/requests/operationalActivity";
import { EQueryKeys } from "../../../enums/query";

export const useGetOperationalActivities = (filter: IUseGetRequest<TOperationalActivityFilter>) => {
  const { data, isLoading } = useQuery(
    [EQueryKeys.GET_ALL_OPERATIONAL_ACTIVITIES, filter],
    () => getOperationalActivities(filter),
  );

  return { data, isLoading };
};


