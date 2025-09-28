import { MemberActions } from '@/features/organizations/components/member-actions';
import type { OrganizationMemberSummary } from '@/features/organizations/queries';

function formatDate(isoString: string | null | undefined) {
  if (!isoString) {
    return '—';
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type OrganizationMembersTableProps = {
  members: OrganizationMemberSummary[];
  currentUserId: string;
};

export function OrganizationMembersTable({
  members,
  currentUserId,
}: OrganizationMembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
        Invite your first teammate to collaborate on purchase orders.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border shadow-sm">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card/50">
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            return (
              <tr key={member.userId}>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {member.displayName ?? member.email ?? 'Pending user'}
                      {isSelf ? ' (You)' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.email ?? 'Invite pending'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {member.status === 'active' ? 'Active' : 'Invited'}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatDate(member.joinedAt ?? member.invitedAt)}
                </td>
                <td className="px-4 py-3">
                  <MemberActions userId={member.userId} disableRemoval={isSelf} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
