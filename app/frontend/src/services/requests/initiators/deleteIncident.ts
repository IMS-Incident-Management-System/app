import { useMutation } from "react-query";
import { deleteIncident } from "../../../api/incidents/incidents";
import { queryClient } from "../../../plugins/query";
import useApp from "antd/es/app/useApp";
import { EQueryKeys } from "../../../enums/query";

export const useDeleteIncident = () => {
  const app = useApp();

  const mutation = useMutation(
    (id: number) => deleteIncident(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              queryKey[0] === EQueryKeys.GET_ALL_INITIATORS
            );
          },
        });
      },
      onError: (error) => {
        console.error(error);
        app.message.error("Не удалось удалить инцидент");
      },
    },
  );

  return mutation;
};
