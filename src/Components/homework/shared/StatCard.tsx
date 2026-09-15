
interface StatCardProps {
  label: string;
  value: string | number;
  accent?: "default" | "warning" | "danger";
}

const ACCENT_COLOR: Record<string, string> = {
  default: "text-gray-900",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export function StatCard({ label, value, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${ACCENT_COLOR[accent]}`}>{value}</p>
    </div>
  );
}