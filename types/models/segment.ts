export enum SegmentConditionOperatorType {
  GTE = "gte", //Greater Than or Equal to
  LTE = "lte", //Less Than or Equal to
  GT = "gt", //Greater Than
  LT = "lt", //Less Than
  EQUAL = "equal",
  BETWEEN = "between"
}

export enum SegmentConditionType {
  TOTAL_PURCHASES = "total_purchases",
  TOTAL_ORDERS = "total_orders",
  CREATED_AT = "created_at",
  GENDER = "gender",
  DOB = "dob"
}

export type SegmentCondition = {
  type: SegmentConditionType;
  operator?: SegmentConditionOperatorType;
  //required when operator = between
  max_value?: number | string;
  //required when operator = between
  min_value?: number | string;
  //required when operator = gte, lte, gt, lt, equal
  value: string | number;
};

export type Segment = {
  id: number;
  name: string;
  icon: string;
  members_count: number;
  conditions: Array<SegmentCondition>;
  created_at: string;
  updated_at: string;
};
