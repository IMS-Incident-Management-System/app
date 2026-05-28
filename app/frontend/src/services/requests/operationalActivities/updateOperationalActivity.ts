import { useMutation } from "react-query";
import { updateOperationalActivity } from "../../../api/operationalActivities/operationalActivities";
import { message } from "antd";
import { queryClient } from "../../../plugins/query";
import { EQueryKeys } from "../../../enums/query";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";

export const useUpdateOperationalActivity = () => {
  const navigate = useNavigate();

  return useMutation(
    ({ data, id }: { data: any; id: number }) => updateOperationalActivity(data, id),
    {
      onSuccess: (_data, variables) => {
        message.success("Операционная деятельность успешно обновлена");
        const idKey = variables.id.toString();
        queryClient.invalidateQueries(EQueryKeys.GET_ALL_OPERATIONAL_ACTIVITIES);
        queryClient.invalidateQueries([EQueryKeys.GET_OPERATIONAL_ACTIVITY, idKey]);
        queryClient.invalidateQueries(['entityActivity', 'operational-activities', idKey]);
        navigate(ERoutes.OPERATIONAL_ACTIVITIES_LIST);
      },
      onError: () => {
        message.error("Ошибка при обновлении операционной деятельности");
      },
    }
  );
};


