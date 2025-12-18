import { useMutation } from "react-query";
import { createOperationalActivity } from "../../../api/operationalActivities/operationalActivities";
import { message } from "antd";
import { queryClient } from "../../../plugins/query";
import { EQueryKeys } from "../../../enums/query";
import { useNavigate } from "react-router-dom";
import { ERoutes } from "../../../enums/routes";

export const useCreateOperationalActivity = (onSuccess?: () => void) => {
  const navigate = useNavigate();

  return useMutation((data: any) => createOperationalActivity(data), {
    onSuccess: (data) => {
      console.log('Operational activity created successfully:', data);
      message.success("Операционная деятельность успешно создана");
      queryClient.invalidateQueries(EQueryKeys.GET_ALL_OPERATIONAL_ACTIVITIES);
      if (onSuccess) {
        console.log('Using onSuccess callback');
        onSuccess();
      } else {
        // Перенаправляем на карточку созданной операционной деятельности (поддержка разных форматов ответа)
        const createdId =
          // вариант { operationalActivity: { id } }
          (data as any)?.operationalActivity?.id ??
          // вариант { id }
          (data as any)?.id ??
          // вариант { data: { id } }
          (data as any)?.data?.id;

        if (createdId) {
          const target = ERoutes.OPERATIONAL_ACTIVITY_VIEW_ID.replace(':id', createdId.toString());
          console.log('Redirecting to operational activity view:', target);
          navigate(target);
        } else {
          console.log('No operational activity ID found, redirecting to operational activities list');
          navigate(ERoutes.OPERATIONAL_ACTIVITIES_LIST);
        }
      }
    },
    onError: () => {
      message.error("Ошибка при создании операционной деятельности");
    },
  });
};

