import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, UserCog } from 'lucide-react';
import { useState } from 'react';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuthStore } from '../features/auth/authStore';
import type { UserRole } from '../features/auth/types';
import { userService, type UserAdminInput } from '../features/users/userService';
import { getErrorMessage } from '../utils/apiError';

const roles: UserRole[] = [
  'SUPER_ADMIN',
  'ORGANIZER',
  'TOURNAMENT_MANAGER',
  'REFEREE',
  'TEAM_MANAGER',
  'PLAYER',
];

export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const users = useQuery({
    queryKey: ['users'],
    queryFn: userService.list,
    enabled: currentUser?.role === 'SUPER_ADMIN',
  });
  const updateUser = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UserAdminInput }) =>
      userService.update(userId, input),
    onSuccess: async () => {
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <ErrorState
        title="Super-admin access required"
        message="Only platform super administrators can manage user roles and account status."
      />
    );
  }

  return (
    <PageContainer title="Platform users" description="Manage roles, access, and locked accounts.">
      {notice && <div className="alert alert-error mb-4">{notice}</div>}
      {users.isLoading && <LoadingState message="Loading platform users..." />}
      {users.isError && <ErrorState message={getErrorMessage(users.error)} />}
      {users.data && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Enabled</th>
                <th>Lock account</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.data.content.map((user) => (
                <UserAdminRow
                  key={user.id}
                  user={user}
                  onSave={(input) => updateUser.mutate({ userId: user.id, input })}
                  saving={updateUser.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}

function UserAdminRow({
  user,
  onSave,
  saving,
}: {
  user: { id: string; fullName: string; email: string; role: UserRole; enabled: boolean };
  onSave: (input: UserAdminInput) => void;
  saving: boolean;
}) {
  const [input, setInput] = useState<UserAdminInput>({
    role: user.role,
    enabled: user.enabled,
    locked: false,
  });

  return (
    <tr>
      <td>
        <div className="table-primary">
          <UserCog />
          <div>
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
          </div>
        </div>
      </td>
      <td>
        <select
          value={input.role}
          onChange={(event) => setInput({ ...input, role: event.target.value as UserRole })}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="checkbox"
          checked={input.enabled}
          onChange={(event) => setInput({ ...input, enabled: event.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={input.locked}
          onChange={(event) => setInput({ ...input, locked: event.target.checked })}
        />
      </td>
      <td>
        <button className="button button-secondary" onClick={() => onSave(input)} disabled={saving}>
          <Shield /> Save
        </button>
      </td>
    </tr>
  );
}
