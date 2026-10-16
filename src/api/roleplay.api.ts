import { api } from '@/api/client';
import type { ApiResponse } from '@/types';
import type {
  EndRoleplaySessionRequest,
  EndRoleplaySessionResponse,
  RoleplayScenariosResponse,
  RoleplaySession,
  SendRoleplayMessageRequest,
  SendRoleplayMessageResponse,
  StartRoleplaySessionRequest,
} from '@/types';

export const roleplayApi = {
  listScenarios: (params?: { page?: number; size?: number; tag?: string }) =>
    api
      .get<ApiResponse<RoleplayScenariosResponse>>('/roleplay/scenarios', {
        params: { page: 0, size: 20, ...(params ?? {}) },
      })
      .then(r => r.data.data),

  startSession: (req: StartRoleplaySessionRequest) =>
    api
      .post<ApiResponse<RoleplaySession>>('/roleplay/sessions', req)
      .then(r => r.data.data),

  getSession: (id: string) =>
    api
      .get<ApiResponse<RoleplaySession>>(`/roleplay/sessions/${id}`)
      .then(r => r.data.data),

  sendMessage: (req: SendRoleplayMessageRequest) =>
    api
      .post<ApiResponse<SendRoleplayMessageResponse>>(
        `/roleplay/sessions/${req.sessionId}/messages`,
        { text: req.text }
      )
      .then(r => r.data.data),

  endSession: (req: EndRoleplaySessionRequest) =>
    api
      .post<ApiResponse<EndRoleplaySessionResponse>>(
        `/roleplay/sessions/${req.sessionId}/end`
      )
      .then(r => r.data.data),
};
