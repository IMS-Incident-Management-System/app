import { useQuery } from "react-query";
import { getEventTypes } from "../../../api/eventTypes/eventTypes";

export const useGetEventTypes = () => {
  const response = useQuery(["getAllEventTypes"], () =>
    getEventTypes(),
  );

  return response;
};