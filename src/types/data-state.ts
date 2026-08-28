export type DataStatus = "loading" | "empty" | "error" | "unavailable" | "ready";

export type DataState<T> = {
  status: DataStatus;
  data: T;
  message?: string;
};
