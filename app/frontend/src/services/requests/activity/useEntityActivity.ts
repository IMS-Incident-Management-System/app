import { useQuery } from 'react-query';
import { getEntityActivity } from '../../../api/activity/activity';
import { EntityActivityResource } from '../../../interfaces/activity';

export const useEntityActivity = (
  resource: EntityActivityResource,
  id: string | number | undefined
) => {
  return useQuery(
    ['entityActivity', resource, id],
    () => (id != null ? getEntityActivity(resource, id, { limit: 50 }) : []),
    { enabled: id != null }
  );
};
