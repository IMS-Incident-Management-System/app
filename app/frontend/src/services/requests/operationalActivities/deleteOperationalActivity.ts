import { useMutation } from "react-query";
import { deleteOperationalActivity } from "../../../api/operationalActivities/operationalActivities";
import { message } from "antd";
import { queryClient } from "../../../plugins/query";
import { EQueryKeys } from "../../../enums/query";

export const useDeleteOperationalActivity = () => {
  return useMutation((id: number) => deleteOperationalActivity(id), {
    onSuccess: () => {
      message.success("Операционная деятельность успешно удалена");
      queryClient.invalidateQueries(EQueryKeys.GET_ALL_OPERATIONAL_ACTIVITIES);
    },
    onError: () => {
      message.error("Ошибка при удалении операционной деятельности");
    },
  });
};


