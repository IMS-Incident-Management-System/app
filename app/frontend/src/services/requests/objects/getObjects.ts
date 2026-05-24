import { useQuery } from "react-query";
import { getObjects } from "../../../api/objects/objects";

export const useGetObjects = () => {
  const response = useQuery(["getAllObjects"], () => getObjects());
  return response;
};