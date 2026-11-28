// Major Groups (khối ngành, FLM codes such as BIT, BBA, BCT). Advisors are attached to a group and each
// major belongs to one. The ids differ between the local database and RDS, so they always come from the API.
import { apiClient } from '../../../shared/lib/apiClient';

export interface MajorGroup {
  id: string;
  code: string;
  name: string;
}

export const majorGroupService = {
  list: async (): Promise<MajorGroup[]> => (await apiClient.get<MajorGroup[]>('/major-groups')).data,
};

/** "BIT · Information Technology", or null when the record has no group yet. */
export function majorGroupLabel(code?: string | null, name?: string | null): string | null {
  if (code && name) return `${code} · ${name}`;
  return code || name || null;
}
