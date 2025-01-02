import { FilterQuery } from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mongoDbApplyFilter = (filter: Record<string, any>): FilterQuery<any> => {
  if (!filter) {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformOperators = (key: string, value: any) => {
    const operatorMap: Record<string, string> = {
      $eq: "$eq",
      $regex: "$regex",
      $between: "$gte",
      $gte: "$gte",
      $lte: "$lte",
      $isNull: "$exists",
      $isNotNull: "$exists",
    };

    if (key === "$between") {
      return {
        $gte: value[0],
        $lte: value[1],
      };
    }

    if (key === "$isNull") {
      return { $exists: false };
    }

    if (key === "$isNotNull") {
      return { $exists: true };
    }

    return { [operatorMap[key]]: value };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildLogic = (logic: Record<string, any>) => {
    const logicKeys = Object.keys(logic);
    return logicKeys.map((key) => {
      const condition = logic[key];
      if (Array.isArray(condition)) {
        return { [key]: condition.map(mongoDbApplyFilter) };
      }
      return { [key]: transformOperators(key, condition) };
    });
  };

  if (filter.$or || filter.$and) {
    const logicKey = filter.$or ? "$or" : "$and";
    return {
      [logicKey]: buildLogic(filter[logicKey]),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedFilter: Record<string, any> = {};
  Object.entries(filter).forEach(([key, value]) => {
    if (typeof value === "object" && !Array.isArray(value)) {
      transformedFilter[key] = transformOperators(Object.keys(value)[0], Object.values(value)[0]);
    } else {
      transformedFilter[key] = value;
    }
  });

  return transformedFilter;
};
