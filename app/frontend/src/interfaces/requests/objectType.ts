export interface ObjectTypeAttributes {
  object_type_id: number;
  title: string;
  parent_id?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ObjectTypeCreationAttributes
  extends Omit<ObjectTypeAttributes, 'object_type_id' | 'createdAt' | 'updatedAt'> {}

export interface ObjectTypeWithChildren extends ObjectTypeAttributes {
  children?: ObjectTypeWithChildren[];
}

export interface ObjectTypeTree {
  object_type_id: number;
  value: string;
  title: string;
  children: ObjectTypeTree[];
}

export interface ObjectTypeModelType {
  treeData: ObjectTypeTree[];
}

