// src/data/manuals.ts
export type ManualVersion = {
  id: string;   // "1.0"
  label: string; // "v1.0 (01/02/2025)"
  date: string;  // "2025-02-01" (YYYY-MM-DD)
  file: string;  // "/manuales/loraview-manual-v1.0.pdf"
};

const manuals: ManualVersion[] = [
  { id: "1.0", label: "v1.0 (01/02/2025)", date: "2025-02-01", file: "/manuals/loraview-manual-v1.0.pdf" },
];

export default manuals;
