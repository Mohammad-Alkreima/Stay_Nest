import { useEffect, useState, useCallback } from 'react';
import { disputeApi } from '../../api';
import DisputeCard from '../../components/DisputeCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Modal } from '../../components/ui/Card';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveForm, setResolveForm] = useState({ winner: 'guest', resolutionType: 'fullRefund' });

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await disputeApi.getAll();
      setDisputes(response.disputes || []);
    } catch (err) {
      setError(err.message || 'Unable to load disputes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleResolve = async (dispute) => {
    setResolveTarget(dispute);
    setResolveForm({ winner: 'guest', resolutionType: 'fullRefund' });
  };

  const handleResolveSubmit = async () => {
    if (!resolveTarget) return;
    setActionLoading(resolveTarget._id);
    try {
      await disputeApi.resolve(resolveTarget._id, {
        status: 'resolved',
        winner: resolveForm.winner,
        resolutionType: resolveForm.resolutionType,
      });
      setResolveTarget(null);
      await loadDisputes();
    } catch (err) {
      setError(err.message || 'Unable to resolve dispute');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Dispute management</h1>
        <p className="mt-2 text-gray-600">Review and resolve disputes submitted by hosts and guests.</p>
      </div>

      {error && <Card className="mb-6 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {loading ? (
        <Card className="text-center">Loading disputes…</Card>
      ) : disputes.length === 0 ? (
        <Card className="text-center">No disputes found.</Card>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute._id}
              dispute={dispute}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}

      <Modal open={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Resolve Dispute">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Winner</label>
            <select
              value={resolveForm.winner}
              onChange={(e) => setResolveForm({ ...resolveForm, winner: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="guest">Guest</option>
              <option value="host">Host</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Type</label>
            <select
              value={resolveForm.resolutionType}
              onChange={(e) => setResolveForm({ ...resolveForm, resolutionType: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="fullRefund">Full refund</option>
              <option value="partialRefund">Partial refund</option>
              <option value="releasePayment">Release payment</option>
              <option value="noRefund">No refund</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setResolveTarget(null)}>Cancel</Button>
            <Button onClick={handleResolveSubmit} loading={actionLoading === resolveTarget?._id}>Resolve</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
