interface Props {
  title: string;
  value: string | number;
  sub?: string;
  icon?: string;
}

export default function StatCard({ title, value, sub, icon }: Props) {
  return (
    <div className="og-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-white/40">{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}
