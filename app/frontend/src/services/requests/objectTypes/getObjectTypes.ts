import { useQuery } from "react-query";
import { getObjectTypes } from "../../../api/objectTypes/objectTypes";

export const useGetObjectTypes = () => {
  const response = useQuery(["getAllObjectTypes"], () => getObjectTypes());
  return response;
};