import { STATUS_META, type Status } from '@/lib/types';

export default function StatusBadge({ status, onClick }: { status: Status; onClick: () => void }) {
  return (
    <button
      className={`status-dot dot-${status}`}
      onClick={onClick}
      aria-label={`${STATUS_META[status].label} status — press to cycle`}
      title={`${STATUS_META[status].label} — click to change`}
    />
  );
}
