import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Edit3,
  Globe2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { Modal } from '../components/common/Modal';
import { PageContainer } from '../components/layout/PageContainer';
import { organizationService } from '../features/organizations/organizationService';
import type {
  MembershipRole,
  OrganizationInput,
  OrganizationType,
} from '../features/organizations/types';
import { getErrorMessage } from '../utils/apiError';

const emptyOrganization: OrganizationInput = {
  name: '',
  type: 'EDUCATIONAL_INSTITUTION',
  description: '',
  website: '',
  country: '',
  city: '',
};

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [organization, setOrganization] = useState(emptyOrganization);
  const [member, setMember] = useState<{ email: string; role: MembershipRole }>({
    email: '',
    role: 'MEMBER',
  });
  const [notice, setNotice] = useState('');

  const organizations = useQuery({
    queryKey: ['organizations', search],
    queryFn: () => organizationService.list(search),
  });
  const members = useQuery({
    queryKey: ['organization-members', selectedId],
    queryFn: () => organizationService.members(selectedId!),
    enabled: Boolean(selectedId),
    retry: false,
  });

  const refreshMembers = () =>
    queryClient.invalidateQueries({ queryKey: ['organization-members', selectedId] });

  const saveOrganization = useMutation({
    mutationFn: () =>
      editingId
        ? organizationService.update(editingId, organization)
        : organizationService.create(organization),
    onSuccess: async (created) => {
      setCreateOpen(false);
      setEditingId(null);
      setOrganization(emptyOrganization);
      setSelectedId(created.id);
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });
  const removeOrganization = useMutation({
    mutationFn: organizationService.remove,
    onSuccess: async () => {
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const addMember = useMutation({
    mutationFn: () => organizationService.addMember(selectedId!, member),
    onSuccess: async () => {
      setMember({ email: '', role: 'MEMBER' });
      setNotice('');
      await refreshMembers();
    },
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const updateMember = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: string; role: MembershipRole }) =>
      organizationService.updateMember(selectedId!, membershipId, role),
    onSuccess: refreshMembers,
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const removeMember = useMutation({
    mutationFn: (membershipId: string) =>
      organizationService.removeMember(selectedId!, membershipId),
    onSuccess: refreshMembers,
    onError: (error) => setNotice(getErrorMessage(error)),
  });

  const selected = organizations.data?.content.find((item) => item.id === selectedId);

  const submitOrganization = (event: FormEvent) => {
    event.preventDefault();
    setNotice('');
    saveOrganization.mutate();
  };

  return (
    <PageContainer
      title="Organizations & institutions"
      description="Create organizer profiles and manage their members."
      action={
        <button
          className="button button-primary"
          onClick={() => {
            setEditingId(null);
            setOrganization(emptyOrganization);
            setCreateOpen(true);
          }}
        >
          <Plus /> New organization
        </button>
      }
    >
      <div className="page-toolbar">
        <label className="search-box">
          <Search />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search organizations"
          />
        </label>
      </div>

      {organizations.isLoading && <LoadingState message="Loading organizations..." />}
      {organizations.isError && (
        <ErrorState
          message={getErrorMessage(organizations.error)}
          onRetry={() => void organizations.refetch()}
        />
      )}
      {organizations.data?.content.length === 0 && (
        <EmptyState
          title="No organizations yet"
          message="Create an institution, esports organization, or independent organizer."
        />
      )}

      <div className="split-workspace">
        <div className="card-grid">
          {organizations.data?.content.map((item) => (
            <button
              key={item.id}
              className={`resource-card ${selectedId === item.id ? 'resource-card-active' : ''}`}
              onClick={() => {
                setNotice('');
                setSelectedId(item.id);
              }}
            >
              <div className="resource-icon">
                <Building2 />
              </div>
              <div>
                <div className="resource-title">
                  <h2>{item.name}</h2>
                  {item.verified && <span className="badge badge-success">Verified</span>}
                </div>
                <p>{item.type.replaceAll('_', ' ')}</p>
                <span>
                  <Globe2 /> {[item.city, item.country].filter(Boolean).join(', ') || 'Global'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <aside className="panel workspace-detail">
            <div className="section-heading detail-actions">
              <Users />
              <div>
                <h2>{selected.name} members</h2>
                <p>Invite registered users and assign organization access.</p>
              </div>
              <div className="review-actions">
                <button
                  className="icon-button"
                  onClick={() => {
                    setEditingId(selected.id);
                    setOrganization({
                      name: selected.name,
                      type: selected.type,
                      description: selected.description ?? '',
                      website: selected.website ?? '',
                      country: selected.country ?? '',
                      city: selected.city ?? '',
                    });
                    setCreateOpen(true);
                  }}
                  aria-label="Edit organization"
                >
                  <Edit3 />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => removeOrganization.mutate(selected.id)}
                  aria-label="Delete organization"
                >
                  <Trash2 />
                </button>
              </div>
            </div>

            {notice && <div className="alert alert-error">{notice}</div>}
            <form
              className="inline-form"
              onSubmit={(event) => {
                event.preventDefault();
                addMember.mutate();
              }}
            >
              <input
                type="email"
                value={member.email}
                onChange={(event) => setMember({ ...member, email: event.target.value })}
                placeholder="member@example.com"
                required
              />
              <select
                value={member.role}
                onChange={(event) =>
                  setMember({ ...member, role: event.target.value as MembershipRole })
                }
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button className="button button-primary" disabled={addMember.isPending}>
                <UserPlus /> Add
              </button>
            </form>

            {members.isLoading && <LoadingState message="Loading members..." />}
            {members.isError && (
              <div className="alert alert-error">
                {getErrorMessage(
                  members.error,
                  'Only organization members can view and manage this roster.',
                )}
              </div>
            )}
            <div className="member-list">
              {members.data?.map((item) => (
                <div className="member-row" key={item.id}>
                  <div>
                    <strong>{item.fullName}</strong>
                    <span>{item.email}</span>
                  </div>
                  <select
                    value={item.organizationRole}
                    disabled={item.organizationRole === 'OWNER'}
                    onChange={(event) =>
                      updateMember.mutate({
                        membershipId: item.id,
                        role: event.target.value as MembershipRole,
                      })
                    }
                  >
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                  <button
                    className="icon-button danger"
                    disabled={item.organizationRole === 'OWNER'}
                    onClick={() => removeMember.mutate(item.id)}
                    aria-label={`Remove ${item.fullName}`}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      <Modal
        open={createOpen}
        title={editingId ? 'Edit organization' : 'Create organization'}
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={submitOrganization} className="form-stack">
          {notice && <div className="alert alert-error">{notice}</div>}
          <label className="field">
            <span>Name</span>
            <input
              value={organization.name}
              onChange={(event) => setOrganization({ ...organization, name: event.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Organization type</span>
            <select
              value={organization.type}
              onChange={(event) =>
                setOrganization({
                  ...organization,
                  type: event.target.value as OrganizationType,
                })
              }
            >
              <option value="EDUCATIONAL_INSTITUTION">Educational institution</option>
              <option value="ESPORTS_ORGANIZATION">Esports organization</option>
              <option value="INDEPENDENT_ORGANIZER">Independent organizer</option>
            </select>
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              value={organization.description}
              onChange={(event) =>
                setOrganization({ ...organization, description: event.target.value })
              }
              rows={3}
            />
          </label>
          <div className="form-grid">
            <label className="field">
              <span>City</span>
              <input
                value={organization.city}
                onChange={(event) => setOrganization({ ...organization, city: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Country</span>
              <input
                value={organization.country}
                onChange={(event) =>
                  setOrganization({ ...organization, country: event.target.value })
                }
              />
            </label>
          </div>
          <label className="field">
            <span>Website</span>
            <input
              value={organization.website}
              onChange={(event) =>
                setOrganization({ ...organization, website: event.target.value })
              }
              placeholder="https://"
            />
          </label>
          <button className="button button-primary" disabled={saveOrganization.isPending}>
            {saveOrganization.isPending
              ? 'Saving...'
              : editingId
                ? 'Save organization'
                : 'Create organization'}
          </button>
        </form>
      </Modal>
    </PageContainer>
  );
}
