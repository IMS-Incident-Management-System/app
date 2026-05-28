import { axiosGatewayBackend } from '../../plugins/axios';
import { useRequest } from '../../hooks/useRequest';
import { ActivityItem, EntityActivityResource } from '../../interfaces/activity';

export const getEntityActivity = async (
  resource: EntityActivityResource,
  id: string | number,
  params?: { limit?: number; before?: string; categories?: string }
) => {
  const response = await useRequest<ActivityItem[]>(async () =>
    axiosGatewayBackend.get(`/${resource}/${id}/activity`, { params })
  );
  return response;
};
