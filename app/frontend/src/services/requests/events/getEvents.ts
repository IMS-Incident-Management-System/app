import { useQuery } from "react-query";
import { getEvents } from "../../../api/events/events";
import { IUseGetRequest } from "../../../interfaces/common/common";
import { TEventFilter } from "../../../interfaces/requests/event";
import { EQueryKeys } from "../../../enums/query";

export const useGetEvents = (filter: IUseGetRequest<TEventFilter>) => {
  const { data, isLoading } = useQuery(
    [EQueryKeys.GET_ALL_EVENTS, filter],
    () => getEvents(filter),
  );

  return { data, isLoading };
};

