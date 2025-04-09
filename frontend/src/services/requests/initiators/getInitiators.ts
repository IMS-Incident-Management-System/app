import { useQuery } from "react-query";
import { getInitiators } from "../../../api/initiators/getInitiators";

export const useGetInitiators = ({ filters }: any) => {
  const { data, isLoading } = useQuery("getAllInitiators", () =>
    getInitiators(),
  );

  return { data, isLoading };
};
