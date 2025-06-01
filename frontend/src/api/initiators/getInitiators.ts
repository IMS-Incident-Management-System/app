import { axiosGatewayBackend } from "../../plugins/axios";
import { ITable, IUseGetRequest } from "../../interfaces/common/common";
import {
  IncidentWithRelations,
  TIncidentFilter,
} from "../../interfaces/requests/incident";
import { useRequest } from "../../hooks/useRequest";

export const getInitiators = async (
  filter: IUseGetRequest<TIncidentFilter>,
) => {
  const response = await useRequest<ITable<IncidentWithRelations>>(async () =>
    axiosGatewayBackend.get("/incidents", {
      params: { ...filter.filter, ...filter.pagination },
    }),
  );

  return response;
};
