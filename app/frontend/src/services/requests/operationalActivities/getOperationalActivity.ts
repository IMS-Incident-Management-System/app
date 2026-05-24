import { useQuery } from "react-query";
import { getOperationalActivity } from "../../../api/operationalActivities/operationalActivities";
import { EQueryKeys } from "../../../enums/query";

export const useGetOperationalActivity = (id?: string) => {
  const { data, isLoading } = useQuery(
    [EQueryKeys.GET_OPERATIONAL_ACTIVITY, id],
    () => (id ? getOperationalActivity(id) : Promise.resolve(null)),
    {
      enabled: !!id,
    }
  );

  return { data, isLoading };
};


