import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { DISPUTE_STATUS, DISPUTE_RESOLUTION } from '../constants/enums';

export default function DisputeCard({ dispute, onResolve, onUpdate }) {
  const status = DISPUTE_STATUS[dispute.status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {status && <Badge label={status.label} color={status.color} />}
            <Badge label={dispute.type === 'guest-to-host' ? 'Guest → Host' : 'Host → Guest'} color="blue" />
          </div>
          <p className="text-sm text-gray-700">{dispute.reason}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
            <p>Reporter: {dispute.reporterId?.name || '—'}</p>
            <p>Target: {dispute.targetId?.name || '—'}</p>
            <p>Date: {format(new Date(dispute.createdAt), 'dd MMM yyyy', { locale: enUS })}</p>
            {dispute.winner && <p>Winner: {dispute.winner === 'guest' ? 'Guest' : 'Host'}</p>}
            {dispute.resolutionType && <p>Resolution: {DISPUTE_RESOLUTION[dispute.resolutionType]}</p>}
          </div>
          {dispute.adminNotes && <p className="text-xs text-gray-400 mt-2">Notes: {dispute.adminNotes}</p>}
        </div>
        <div className="flex flex-col gap-2">
          {onUpdate && dispute.status === 'open' && (
            <Button size="sm" variant="secondary" onClick={() => onUpdate(dispute)}>Edit</Button>
          )}
          {onResolve && dispute.status !== 'resolved' && (
            <Button size="sm" onClick={() => onResolve(dispute)}>Resolve Dispute</Button>
          )}
        </div>
      </div>
    </div>
  );
}
