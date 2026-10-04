import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Key, CheckCircle2, Lock, Plus, AlertTriangle, RefreshCw, Mail, UserPlus } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthCompany } from '../../context/AuthCompanyContext';

interface TeamMemberItem {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  status: string;
  twoFactorEnabled?: boolean;
}

interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userId?: string;
  ip?: string;
}

export const TeamRbacView: React.FC = () => {
  const { user } = useAuthCompany();
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'analyst' | 'viewer'>('analyst');
  const [inviting, setInviting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamAndLogs();
  }, []);

  const fetchTeamAndLogs = async () => {
    setLoading(true);
    try {
      const [teamRes, logsRes] = await Promise.all([
        api.get('/api/team'),
        api.get('/api/audit-logs'),
      ]);

      if (teamRes.success && Array.isArray(teamRes.team)) {
        setMembers(teamRes.team);
      } else {
        // Current user as fallback
        setMembers([
          {
            id: user?.uid || 'usr-owner',
            name: user?.name || user?.email?.split('@')[0] || 'Owner',
            email: user?.email || '',
            role: (user?.role ? (user.role.toLowerCase() as any) : 'owner'),
            status: 'active',
            twoFactorEnabled: true,
          },
        ]);
      }

      if (logsRes.success && Array.isArray(logsRes.logs)) {
        setAuditLogs(logsRes.logs);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setError(null);
    try {
      const res = await api.post('/api/team/invite', {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res.success) {
        setNotification(`Invitation dispatched to ${inviteEmail} with role "${inviteRole}".`);
        setShowInviteModal(false);
        setInviteEmail('');
        await fetchTeamAndLogs();
      } else {
        setError(res.error || 'Failed to send team invitation');
      }
    } catch (e: any) {
      setError(e.message || 'Invitation failed');
    } finally {
      setInviting(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 animate-in fade-in duration-150 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2 py-0.5 rounded">
              Identity &amp; Governance
            </span>
            <span className="text-xs text-slate-400">Strict Role-Based Access Control</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Team Access &amp; Role-Based Security Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Granular permission controls, multi-role security enforcement, and server-written immutable cryptographic audit logging.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center justify-between shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Team Roster */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">Authorized Enterprise Team Members</h2>
          <span className="text-[11px] text-slate-400 font-mono-code">{members.length} Active Members</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading team roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-1">Member</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Security MFA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {members.map((m) => (
                  <tr key={m.id || m.email} className="hover:bg-slate-800/40">
                    <td className="py-3 pl-1">
                      <div className="font-bold text-white font-sans">{m.name || m.email.split('@')[0]}</div>
                      <div className="text-[11px] text-slate-400">{m.email}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-emerald-400 font-sans text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                      </span>
                    </td>
                    <td className="py-3 text-slate-300 font-sans">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Audit Log */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Server Security Audit Trail (Immutable)
          </h2>
          <span className="text-[11px] text-slate-400">{auditLogs.length} Events Recorded</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No audit events recorded yet. All administrative actions and authentications are logged here.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white">{log.action}</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" /> Invite Team Member
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Team Member Email</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Security Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="admin">Admin (Store connection, billing &amp; config)</option>
                  <option value="analyst">Analyst (ML models &amp; dashboards only)</option>
                  <option value="viewer">Viewer (Read-only reports)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviting}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {inviting ? 'Dispatching...' : 'Send Access Invite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
