interface Props {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
}

const CLASSES: Record<Props["variant"], string> = {
  success: "og-badge-success",
  warning: "og-badge-warning",
  error: "og-badge-error",
  info: "og-badge-info",
  neutral: "og-badge-neutral",
};

export default function StatusBadge({ label, variant }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CLASSES[variant]}`}>
      {label}
    </span>
  );
}
