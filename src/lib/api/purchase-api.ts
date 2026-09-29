import { apiClient } from "./api-client";

export interface PurchaseOrderResponse {
  id: string;
  organizationId?: string;
  projectId?: string;
  vendorId?: string;
  orderNumber?: string;
  description?: string;
  totalAmount?: number;
  status?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  dateCreated?: string;
}

export const purchaseApi = {
  list: (organizationId?: string): Promise<PurchaseOrderResponse[]> =>
    apiClient.get<PurchaseOrderResponse[]>(
      `/purchase-orders${organizationId ? `?organizationId=${organizationId}` : ""}`
    ),

  getById: (id: string): Promise<PurchaseOrderResponse> =>
    apiClient.get<PurchaseOrderResponse>(`/purchase-orders/${id}`),
};
