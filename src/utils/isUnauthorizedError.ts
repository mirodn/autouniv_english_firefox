import { AxiosError } from "axios";

const isUnauthorizedError = (error: unknown) =>
  (error as AxiosError | undefined)?.response?.status === 401;

export default isUnauthorizedError;
