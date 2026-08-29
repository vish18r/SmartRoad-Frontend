import type { ApiError } from "@/types/api";

export interface ProjectApiUnavailable {
  readonly implemented: false;
  readonly message: string;
}

const unavailable: ApiError = {
  status: 501,
  message: "Project APIs are not implemented in the backend yet.",
};
const unavailableRequest = async (): Promise<never> => Promise.reject(unavailable);

export const projectApi = {
  availability: { implemented: false, message: unavailable.message } satisfies ProjectApiUnavailable,
  getList: unavailableRequest,
  getById: unavailableRequest,
  create: unavailableRequest,
  update: unavailableRequest,
  remove: unavailableRequest,
};
