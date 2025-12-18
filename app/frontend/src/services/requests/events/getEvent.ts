import { useQuery } from "react-query";
import { getEvent } from "../../../api/events/events";
import { EQueryKeys } from "../../../enums/query";

export const useGetEvent = (id?: string) => {
  const { data, isLoading } = useQuery(
    [EQueryKeys.GET_EVENT, id],
    () => (id ? getEvent(id) : Promise.resolve(null)),
    {
      enabled: !!id,
    }
  );

  return { data, isLoading };
};

