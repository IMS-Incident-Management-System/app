import { useQuery } from "react-query";
import { getDepartments } from "../../../api/departments/departments";

export const useGetDepartments = () => {
  const response = useQuery(["getAllDepartments"], () =>
    getDepartments(),
  );

  return response;
};
