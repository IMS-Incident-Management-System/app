import { useQuery } from "react-query";
import { getEvent } from "../../../api/events/events";
import { EQueryKeys } from "../../../enums/query";

export const useGetEvent = (id: string | undefined) => {
  const { data, isLoading } = useQuery(
    [EQueryKeys.GET_EVENT, id],
    () => getEvent(id!),
    {
      enabled: !!id,
    }
  );

  return { data, isLoading };
};

