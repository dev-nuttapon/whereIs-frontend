import type { Member } from '@/types/domain.types';
import { getMember as getMemberRecord, inviteMember as inviteMemberRecord, listMembers as listMembersRecord, removeMember as removeMemberRecord, updateMemberRole as updateMemberRoleRecord } from '@/mocks/demo-db';
import { delay } from '@/utils/mock-api';

export interface InviteMemberInput {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export async function listMembers(wsId: string): Promise<Member[]> {
  return delay(listMembersRecord(wsId));
}

export async function getMember(id: string): Promise<Member> {
  return delay(getMemberRecord(id));
}

export async function inviteMember(wsId: string, input: InviteMemberInput): Promise<Member> {
  return delay(inviteMemberRecord(wsId, input.email, input.role));
}

export async function updateMemberRole(id: string, role: 'admin' | 'member' | 'viewer'): Promise<Member> {
  return delay(updateMemberRoleRecord(id, role));
}

export async function removeMember(id: string): Promise<{ success: true }> {
  return delay(removeMemberRecord(id));
}
