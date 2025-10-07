import { get } from "./get";

export type GroupedResult<T, K extends keyof T> = Record<string, T[]> & {
  [P in T[K] as P extends string ? P : never]: T[];
};

export const groupBy = <T extends Record<string, any>, K extends keyof T & string>(
  xs: readonly T[],
  key: K,
): GroupedResult<T, K> => {
  return xs.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = get(item, key);

    if (groupKey != null) {
      const keyAsString = String(groupKey);
      acc[keyAsString] ??= [];
      acc[keyAsString].push(item);
    }

    return acc;
  }, {}) as GroupedResult<T, K>;
};
