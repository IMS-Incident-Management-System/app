import { useMutation } from "react-query";
import { patchIncident } from "../../../api/incidents/incidents";
import { queryClient } from "../../../plugins/query";
import useApp from "antd/es/app/useApp";
import { EQueryKeys } from "../../../enums/query";

export const usePatchIncident = () => {
  const app = useApp();

  return useMutation(
    ({ id, is_sent_1db }: { id: number; is_sent_1db: boolean }) =>
      patchIncident(id, { is_sent_1db }),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: [EQueryKeys.GET_ALL_INITIATORS],
        });
        queryClient.invalidateQueries({
          queryKey: ["getIncident", variables.id.toString()],
        });
        queryClient.invalidateQueries({
          queryKey: ["entityActivity", "incidents", variables.id.toString()],
        });
        app.message.success("Сохранено");
      },
      onError: (error) => {
        console.error("patchIncident error:", error);
        app.message.error("Не удалось сохранить");
      },
    },
  );
};
