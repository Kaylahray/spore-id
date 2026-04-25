import { Database, Lock, Code2 } from "lucide-react";

const ROWS = [
  {
    label: "Data",
    value: "Serialized Image + Metadata",
    icon: Database,
    accent: "bg-acid",
  },
  { label: "Lock", value: "Owner: ckb1...3a4f", icon: Lock, accent: "bg-lime" },
  {
    label: "Type",
    value: "Spore Protocol Script",
    icon: Code2,
    accent: "bg-shock text-paper",
  },
];

export function CellVisualization() {
  return (
    <div className="bg-paper border-[5px] border-ink shadow-brutal mt-6">
      <div className="bg-ink text-paper px-4 py-2 font-mono text-[10px] uppercase tracking-widest font-bold flex items-center justify-between">
        <span>CKB Cell Structure</span>
        <span className="text-acid">v0.1</span>
      </div>
      <div className="p-4 space-y-2">
        {ROWS.map((r) => (
          <div
            key={r.label}
            className="flex items-stretch border-[3px] border-ink"
          >
            <div
              className={`w-12 flex items-center justify-center border-r-[3px] border-ink ${r.accent}`}
            >
              <r.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 px-3 py-2">
              <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                {r.label}
              </div>
              <div className="font-mono text-xs font-bold">{r.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
