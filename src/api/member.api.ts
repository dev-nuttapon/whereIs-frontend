import { client } from '@/api/client';
import type { ContainerAccessScope, Member } from '@/types/domain.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface MemberDto {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  roleCode: string;
  status: string;
  joinedAt: string;
}

interface MemberPermissionsDto {
  roleCode: string;
  effective: string[];
  overrides: Array<{ code: string; effect: string }>;
}

export interface UserLookupDto {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface InvitationDto {
  id: string;
  workspaceId: string;
  workspaceName?: string | null;
  email: string;
  roleCode: string;
  status: string;
  expiresAt: string;
  invitedByUserId: string;
  acceptedByUserId: string | null;
  createdAt: string;
  token: string;
  containerAccessScope?: ContainerAccessScope | null;
}

interface RoleDto {
  id: string;
  code: string;
  name: string;
}

export interface InviteMemberInput {
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  workspaceId?: string;
  containerAccessScope?: ContainerAccessScope | null;
}

function toMember(wsId: string, dto: MemberDto): Member {
  return {
    id: dto.id,
    workspaceId: wsId,
    user: {
      id: dto.userId,
      email: dto.email,
      name: dto.displayName,
    },
    role: dto.roleCode as Member['role'],
    permissions: [],
    invitationStatus: dto.status as Member['invitationStatus'],
    createdAt: dto.joinedAt,
  };
}

async function resolveRoleId(wsId: string, roleCode: InviteMemberInput['role']) {
  const response = await client.get<ApiResponse<PagedResult<RoleDto>>>(`/workspaces/${encodeURIComponent(wsId)}/roles`, {
    params: { page: 1, pageSize: 100 },
  });
  const role = response.data.data.items.find((entry) => entry.code === roleCode);
  if (!role) {
    throw new Error(`Role '${roleCode}' not found.`);
  }
  return role.id;
}

export async function listMembers(wsId: string): Promise<Member[]> {
  const response = await client.get<ApiResponse<PagedResult<MemberDto>>>(`/workspaces/${encodeURIComponent(wsId)}/members`, {
    params: { page: 1, pageSize: 100 },
  });
  return response.data.data.items.map((item) => toMember(wsId, item));
}

export async function getMember(wsId: string, id: string): Promise<Member> {
  const response = await client.get<ApiResponse<MemberDto>>(`/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(id)}`);
  return toMember(wsId, response.data.data);
}

export async function inviteMember(wsId: string, input: InviteMemberInput): Promise<InvitationDto> {
  const roleId = await resolveRoleId(wsId, input.role);
  const response = await client.post<ApiResponse<InvitationDto>>(`/workspaces/${encodeURIComponent(wsId)}/invitations`, {
    email: input.email,
    roleId,
    containerAccessScope: input.containerAccessScope,
  });
  return response.data.data;
}

export async function lookupUserByEmail(email: string): Promise<UserLookupDto> {
  const response = await client.get<ApiResponse<UserLookupDto>>('/users/lookup', {
    params: { email },
  });
  return response.data.data;
}

export async function listInvitations(wsId: string): Promise<InvitationDto[]> {
  const response = await client.get<ApiResponse<PagedResult<InvitationDto>>>(`/workspaces/${encodeURIComponent(wsId)}/invitations`, {
    params: { page: 1, pageSize: 100 },
  });
  return response.data.data.items;
}

export async function listMyInvitations(): Promise<InvitationDto[]> {
  const response = await client.get<ApiResponse<PagedResult<InvitationDto>>>('/invitations/inbox', {
    params: { page: 1, pageSize: 100 },
  });
  return response.data.data.items;
}

export async function getInvitationByToken(token: string): Promise<InvitationDto> {
  const response = await client.get<ApiResponse<InvitationDto>>(`/invitations/${encodeURIComponent(token)}`);
  return response.data.data;
}

export async function acceptInvitation(token: string): Promise<InvitationDto> {
  const response = await client.post<ApiResponse<InvitationDto>>('/invitations/accept', { token });
  return response.data.data;
}

export async function revokeInvitation(wsId: string, invitationId: string): Promise<{ success: true }> {
  await client.post(`/workspaces/${encodeURIComponent(wsId)}/invitations/${encodeURIComponent(invitationId)}/revoke`);
  return { success: true };
}

export async function updateMemberRole(wsId: string, id: string, role: InviteMemberInput['role']): Promise<Member> {
  const roleId = await resolveRoleId(wsId, role);
  const response = await client.put<ApiResponse<MemberDto>>(`/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(id)}/role`, {
    roleId,
  });
  return toMember(wsId, response.data.data);
}

export async function removeMember(wsId: string, id: string): Promise<{ success: true }> {
  await client.delete(`/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(id)}`);
  return { success: true };
}

export async function getMemberPermissions(wsId: string, memberId: string): Promise<MemberPermissionsDto> {
  const response = await client.get<ApiResponse<MemberPermissionsDto>>(
    `/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(memberId)}/permissions`,
  );
  return response.data.data;
}

export async function updateMemberPermissions(
  wsId: string,
  memberId: string,
  overrides: Record<string, boolean>,
  containerAccessScope?: { containerIds: string[]; includeDescendants: boolean } | null,
): Promise<MemberPermissionsDto> {
  const payload = {
    overrides: Object.entries(overrides).map(([permissionId, enabled]) => ({
      permissionId,
      effect: enabled ? 'Allow' : 'Deny',
    })),
    containerAccessScope,
  };
  const response = await client.put<ApiResponse<MemberPermissionsDto>>(
    `/workspaces/${encodeURIComponent(wsId)}/members/${encodeURIComponent(memberId)}/permissions`,
    payload,
  );
  return response.data.data;
}
