import { ObjectType } from "../../../enums/object";
import { ObjectAttributes } from "../../../interfaces/requests/object";

const objectDict = {
  [ObjectType.BS]: "БС",
  [ObjectType.OFFICE_MTS]: "Офис МТС",
  [ObjectType.CATEGORIZED_ROOM]: "Категорированное помещение",
  [ObjectType.OTHER_PROPERTY]: "Иное имущество",
  [ObjectType.PERSONNEL]: "Персонал",
};

export const usePrepareObjects = (objects: ObjectAttributes[]) => {
  const getObjectLabel = (object: ObjectAttributes): string => {
    const typeLabel = objectDict[object.type as ObjectType];

    switch (object.type) {
      case ObjectType.BS:
      case ObjectType.OFFICE_MTS:
      case ObjectType.CATEGORIZED_ROOM:
        return `${typeLabel}${object.address ? ` - ${object.address}` : ""}${object.number ? ` (${object.number})` : ""}`;

      case ObjectType.PERSONNEL:
        return `${typeLabel} - ${object.personnel_full_name || "Без имени"}${object.personnel_position ? `, ${object.personnel_position}` : ""}`;

      default:
        return `${typeLabel}${object.number ? ` - ${object.number}` : ""}`;
    }
  };

  const sortObjects = (
    a: { label: string; value: number },
    b: { label: string; value: number },
  ) => {
    const isAOther =
      objects?.find((obj: ObjectAttributes) => obj.id === a.value)?.type ===
      ObjectType.OTHER_PROPERTY;
    const isBOther =
      objects?.find((obj: ObjectAttributes) => obj.id === b.value)?.type ===
      ObjectType.OTHER_PROPERTY;

    if (isAOther && !isBOther) return 1;
    if (!isAOther && isBOther) return -1;
    return 0;
  };

  const objectOptions = objects
    ?.map((object) => ({
      label: getObjectLabel(object),
      value: object.id,
    }))
    .sort(sortObjects);

  return {
    objectOptions,
  };
};
