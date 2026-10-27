import { apiClient } from "./api-client";

export const trackingApi = {
  // Multipart upload: fields are file, projectId, photoType, description?, workArea?,
  // latitude?, longitude?. Return type is loose since callers just need success/failure.
  uploadWorkPhoto: (formData: FormData): Promise<unknown> =>
    apiClient.postForm<unknown>("/nextenti/tracking/photo/upload-file", formData),
};
