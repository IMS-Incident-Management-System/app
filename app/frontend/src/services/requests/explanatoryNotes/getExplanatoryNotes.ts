import { useQuery } from "react-query";
import { getExplanatoryNotes, ExplanatoryNoteFilter } from "../../../api/explanatoryNotes/explanatoryNotes";
import { IUseGetRequest } from "../../../interfaces/common/common";
import { EQueryKeys } from "../../../enums/query";

export const useGetExplanatoryNotes = (filter: IUseGetRequest<ExplanatoryNoteFilter>) => {
  const { data, isLoading } = useQuery(
    [EQueryKeys.GET_ALL_EXPLANATORY_NOTES, filter],
    () => getExplanatoryNotes(filter),
  );

  return { data, isLoading };
};
