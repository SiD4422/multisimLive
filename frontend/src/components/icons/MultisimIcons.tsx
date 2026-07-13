
// Green Probe Pin (Base for V, A, V/A, Digital)
const ProbePin = () => (
  <path d="M 12 12 L 4 20 M 10 10 L 14 14" stroke="#666" strokeWidth="1.5" fill="none" />
);

export const IconProbeVoltage = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="10" r="7" fill={active ? "#fff" : "#10b981"} stroke={active ? "#10b981" : "none"} strokeWidth="1.5" />
    <text x="14" y="10" fontSize="9" fill={active ? "#10b981" : "#fff"} textAnchor="middle" dominantBaseline="central" fontWeight="bold">V</text>
    <ProbePin />
  </svg>
);

export const IconProbeCurrent = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="10" r="7" fill={active ? "#fff" : "#10b981"} stroke={active ? "#10b981" : "none"} strokeWidth="1.5" />
    <text x="14" y="10" fontSize="9" fill={active ? "#10b981" : "#fff"} textAnchor="middle" dominantBaseline="central" fontWeight="bold">A</text>
    <ProbePin />
  </svg>
);

export const IconProbeVA = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="10" r="8" fill="#10b981" />
    <text x="14" y="10" fontSize="7.5" fill="#fff" textAnchor="middle" dominantBaseline="central" fontWeight="bold">V/A</text>
    <ProbePin />
  </svg>
);

export const IconProbeDigital = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="10" r="8" fill="#10b981" />
    <text x="14" y="10" fontSize="7.5" fill="#fff" textAnchor="middle" dominantBaseline="central" fontWeight="bold">0/1</text>
    <ProbePin />
  </svg>
);

export const IconProbeRef = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="10" r="7" fill="#9ca3af" />
    <text x="14" y="10" fontSize="9" fill="#fff" textAnchor="middle" dominantBaseline="central" fontWeight="bold">V</text>
    <ProbePin />
  </svg>
);

export const IconGround = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 12 4 L 12 12 M 6 12 L 18 12 M 8 16 L 16 16 M 10 20 L 14 20" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconConnector = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 12 20 L 12 12 L 8 12 L 12 4 L 16 12 L 12 12" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </svg>
);

export const IconJunction = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4 12 L 20 12 M 12 4 L 12 12" stroke="#ef4444" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" fill="#ef4444" />
  </svg>
);

export const IconACVoltage = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" />
    <path d="M 12 2 L 12 4 M 12 20 L 12 22 M 12 6 L 12 8 M 11 7 L 13 7 M 12 16 L 12 18" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" />
    <path d="M 7 12 Q 9.5 8 12 12 T 17 12" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" fill="none" />
  </svg>
);

export const IconACCurrent = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" />
    <path d="M 12 2 L 12 4 M 12 20 L 12 22 M 12 6 L 12 8 M 11 7 L 13 7 M 12 16 L 12 18" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" />
    <path d="M 12 16 L 12 8 L 9 11 M 12 8 L 15 11" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconDCVoltage = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 8 L 18 8 M 9 12 L 15 12 M 6 16 L 18 16 M 9 20 L 15 20 M 12 2 L 12 8" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconDCCurrent = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 2 L 12 4 M 12 20 L 12 22 M 12 17 L 12 7 L 9 10 M 12 7 L 15 10" stroke="#666" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconPulseVoltage = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 2 L 12 4 M 12 20 L 12 22 M 12 6 L 12 8 M 11 7 L 13 7 M 12 16 L 12 18" stroke="#666" strokeWidth="1.5" />
    <path d="M 6 14 L 8 14 L 8 10 L 12 10 L 12 14 L 16 14 L 16 10 L 18 10" stroke="#666" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </svg>
);

export const IconResistor = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 6 12 L 7 9 L 9 15 L 11 9 L 13 15 L 15 9 L 17 15 L 18 12 L 22 12" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconLoad = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 5 12 M 19 12 L 22 12" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" />
    <rect x="5" y="8" width="14" height="8" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" fill="none" />
    <text x="12" y="12" fontSize="5.5" fill={active ? "#10b981" : "#666"} textAnchor="middle" dominantBaseline="central" fontWeight="bold">LOAD</text>
  </svg>
);

export const IconCapacitor = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 10 12 M 14 12 L 22 12 M 10 6 L 10 18 M 14 6 L 14 18" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconInductor = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 6 12 M 18 12 L 22 12 M 6 12 Q 8 6 10 12 Q 12 6 14 12 Q 16 6 18 12" stroke="#666" strokeWidth="1.5" fill="none" />
  </svg>
);

export const IconOpamp = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 4 L 6 20 L 20 12 Z" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M 2 8 L 6 8 M 2 16 L 6 16 M 20 12 L 24 12" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" />
    <path d="M 8 7 L 12 7 M 10 5 L 10 9 M 8 16 L 12 16" stroke={active ? "#10b981" : "#666"} strokeWidth="1.5" />
  </svg>
);

export const IconOpamp3T = IconOpamp;

export const IconOpamp5T = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 4 L 6 20 L 20 12 Z" stroke="#666" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M 2 8 L 6 8 M 2 16 L 6 16 M 20 12 L 24 12" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 8 L 13 2 M 13 16 L 13 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 8 7 L 12 7 M 10 5 L 10 9 M 8 16 L 12 16" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconComparator = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 4 L 6 20 L 20 12 Z" stroke="#666" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M 2 8 L 6 8 M 2 16 L 6 16 M 20 12 L 24 12" stroke="#666" strokeWidth="1.5" />
    <path d="M 8 7 L 12 7 M 10 5 L 10 9 M 8 16 L 12 16" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 10 L 16 12 L 12 14" stroke="#666" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
  </svg>
);

export const IconTimer555 = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="3" width="8" height="18" stroke="#666" strokeWidth="1.5" fill="none" />
    <path d="M 12 3 L 12 0 M 12 21 L 12 24" stroke="#666" strokeWidth="1.5" />
    <path d="M 4 5 L 8 5 M 4 8 L 8 8 M 4 11 L 8 11 M 4 14 L 8 14 M 4 17 L 8 17 M 4 20 L 8 20" stroke="#666" strokeWidth="1.5" />
    <path d="M 16 8 L 20 8" stroke="#666" strokeWidth="1.5" />
    <path d="M 10 5 L 12 5 M 10 8 L 12 8 M 10 11 L 12 11 M 10 14 L 12 14 M 10 17 L 12 17 M 10 20 L 12 20 M 12 8 L 14 8" stroke="#666" strokeWidth="0.5" />
  </svg>
);

export const IconDiode = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 8 12 M 16 12 L 22 12" stroke="#666" strokeWidth="1.5" />
    <path d="M 8 6 L 8 18 L 16 12 Z" stroke="#666" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M 16 6 L 16 18" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconDiodeZener = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 12 2 L 12 8 M 12 16 L 12 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 6 8 L 18 8 L 12 16 Z" stroke="#666" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M 6 16 L 18 16" stroke="#666" strokeWidth="1.5" />
    <path d="M 18 16 L 18 14 M 6 16 L 6 18" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconDiodeLED = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 8 12 M 16 12 L 22 12" stroke="#666" strokeWidth="1.5" />
    <path d="M 8 6 L 8 18 L 16 12 Z" stroke="#666" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M 16 6 L 16 18" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 6 L 17 2 M 17 2 L 15 2 M 17 2 L 17 4" stroke="#f59e0b" strokeWidth="1.2" />
    <path d="M 16 8 L 20 4 M 20 4 L 18 4 M 20 4 L 20 6" stroke="#f59e0b" strokeWidth="1.2" />
  </svg>
);

export const IconBridgeRectifier = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 12 4 L 4 12 L 12 20 L 20 12 Z" stroke="#666" strokeWidth="1.5" fill="none" />
    <path d="M 12 0 L 12 4 M 12 20 L 12 24 M 0 12 L 4 12 M 20 12 L 24 12" stroke="#666" strokeWidth="1.5" />
    <path d="M 7 9 L 9 11 M 15 9 L 17 11 M 7 15 L 9 13 M 15 15 L 17 13" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconThyristor = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 7 12 M 17 12 L 22 12" stroke="#666" strokeWidth="1.5" />
    <path d="M 7 6 L 7 18 L 17 12 Z" stroke="#666" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    <path d="M 17 6 L 17 18" stroke="#666" strokeWidth="1.5" />
    <path d="M 17 15 L 21 20 M 21 20 L 21 24" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconOptocoupler = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="14" height="16" stroke="#666" strokeWidth="1.5" rx="1" />
    <path d="M 2 7 L 5 7 M 2 17 L 5 17 M 19 7 L 22 7 M 19 17 L 22 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 7 8 L 9 8 L 9 16 L 7 16" stroke="#666" strokeWidth="1" />
    <path d="M 7 10 L 10 12 L 7 14 Z M 10 10 L 10 14" stroke="#666" strokeWidth="1" fill="#666" />
    <path d="M 11 12 L 13 12 M 11 14 L 13 14" stroke="#666" strokeWidth="1" strokeDasharray="1 1" />
    <path d="M 17 8 L 15 8 L 15 16 L 17 16" stroke="#666" strokeWidth="1" />
    <path d="M 15 10 L 13 12 L 15 14" stroke="#666" strokeWidth="1" />
  </svg>
);

export const IconVoltageRegulator = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="8" width="12" height="10" stroke="#666" strokeWidth="1.5" />
    <path d="M 8 8 L 8 4 L 16 4 L 16 8" stroke="#666" strokeWidth="1.5" />
    <circle cx="12" cy="6" r="1" fill="#666" />
    <path d="M 8 18 L 8 22 M 12 18 L 12 22 M 16 18 L 16 22" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const Icon7Segment = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="16" height="20" stroke="#666" strokeWidth="1.5" />
    <path d="M 6 2 L 6 0 M 9 2 L 9 0 M 12 2 L 12 0 M 15 2 L 15 0 M 18 2 L 18 0" stroke="#666" strokeWidth="1" />
    <path d="M 6 22 L 6 24 M 9 22 L 9 24 M 12 22 L 12 24 M 15 22 L 15 24 M 18 22 L 18 24" stroke="#666" strokeWidth="1" />
    <path d="M 9 6 L 15 6 M 9 12 L 15 12 M 9 18 L 15 18 M 8 7 L 8 11 M 16 7 L 16 11 M 8 13 L 8 17 M 16 13 L 16 17" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="17.5" cy="18.5" r="0.5" fill="#666" stroke="#666" strokeWidth="1" />
  </svg>
);

export const IconDIP14 = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" fill="#333" rx="1" />
    <path d="M 2 10 A 2 2 0 0 0 2 14" stroke="#666" strokeWidth="1.5" fill="none" />
    <path d="M 4 6 L 4 4 M 6.6 6 L 6.6 4 M 9.2 6 L 9.2 4 M 11.8 6 L 11.8 4 M 14.4 6 L 14.4 4 M 17 6 L 17 4 M 19.6 6 L 19.6 4" stroke="#666" strokeWidth="1.5" />
    <path d="M 4 18 L 4 20 M 6.6 18 L 6.6 20 M 9.2 18 L 9.2 20 M 11.8 18 L 11.8 20 M 14.4 18 L 14.4 20 M 17 18 L 17 20 M 19.6 18 L 19.6 20" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconTransistor = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 10 12 M 10 6 L 10 18 M 14 8 L 14 4 L 20 4 M 14 16 L 14 20 L 20 20" stroke="#666" strokeWidth="1.5" fill="none" />
    <path d="M 12 8 L 12 16 M 12 8 L 14 8 M 12 16 L 14 16 M 12 12 L 14 12" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconTransistorNPN = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4 12 L 10 12 M 10 7 L 10 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 10 9 L 16 4 L 16 2" stroke="#666" strokeWidth="1.5" />
    <path d="M 10 15 L 16 20 L 16 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 16 20 L 13 18.5 L 15 17 Z" fill="#666" />
  </svg>
);

export const IconIGBT = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4 12 L 8 12 M 10 7 L 10 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 8 7 L 8 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 10 9 L 16 4 L 16 2" stroke="#666" strokeWidth="1.5" />
    <path d="M 10 15 L 16 20 L 16 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 16 20 L 13 18.5 L 15 17 Z" fill="#666" />
  </svg>
);

export const IconTransistorPNP = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4 12 L 10 12 M 10 7 L 10 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 10 9 L 16 4 L 16 2" stroke="#666" strokeWidth="1.5" />
    <path d="M 10 15 L 16 20 L 16 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 11.5 10.2 L 13 8 L 14.5 9.5 Z" fill="#666" />
  </svg>
);

export const IconMosfetN = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4 12 L 10 12 M 10 7 L 10 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 7 L 13 10 M 13 10.5 L 13 13.5 M 13 14 L 13 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 7 L 18 7 L 18 2" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 17 L 18 17 L 18 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 12 L 18 12 L 18 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 12 L 15 10.5 L 15 13.5 Z" fill="#666" />
  </svg>
);

export const IconMosfetP = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4 12 L 10 12 M 10 7 L 10 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 7 L 13 10 M 13 10.5 L 13 13.5 M 13 14 L 13 17" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 7 L 18 7 L 18 2" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 17 L 18 17 L 18 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 13 12 L 18 12 L 18 7" stroke="#666" strokeWidth="1.5" />
    <path d="M 15.5 12 L 17.5 10.5 L 17.5 13.5 Z" fill="#666" />
  </svg>
);

export const IconJFET = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 4 12 L 12 12 M 12 5 L 12 19" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 5 L 16 5 L 16 2" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 19 L 16 19 L 16 22" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 12 L 10 10.5 L 10 13.5 Z" fill="#666" />
  </svg>
);

export const IconSwitch = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 8 12 M 16 12 L 22 12" stroke="#666" strokeWidth="1.5" />
    <circle cx="8" cy="12" r="2" stroke="#666" strokeWidth="1.5" fill="none" />
    <circle cx="16" cy="12" r="2" stroke="#666" strokeWidth="1.5" fill="none" />
    <path d="M 8 10 L 15 6" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconPotentiometer = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 5 12 L 6 9 L 8 15 L 10 9 L 12 15 L 14 9 L 16 15 L 18 9 L 19 12 L 22 12" stroke="#666" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M 6 18 L 15 6 L 12 6 M 15 6 L 15 9" stroke="#666" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconFuse = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 12 L 7 12 C 9 9, 11 9, 12 12 C 13 15, 15 15, 17 12 L 22 12" stroke="#666" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconTransformers = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="4" width="14" height="16" stroke="#666" strokeWidth="1.5" />
    <path d="M 9 6 C 11 6, 11 8, 9 9 C 11 9, 11 11, 9 12 C 11 12, 11 14, 9 15 C 11 15, 11 17, 9 18" stroke="#666" strokeWidth="1.5" />
    <path d="M 15 6 C 13 6, 13 8, 15 9 C 13 9, 13 11, 15 12 C 13 12, 13 14, 15 15 C 13 15, 13 17, 15 18" stroke="#666" strokeWidth="1.5" />
    <line x1="11.5" y1="6" x2="11.5" y2="18" stroke="#666" strokeWidth="1.5" />
    <line x1="12.5" y1="6" x2="12.5" y2="18" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconTransformer1P1S = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 7 C 8 7, 8 9.5, 10 9.5 C 8 9.5, 8 12, 10 12 C 8 12, 8 14.5, 10 14.5 C 8 14.5, 8 17, 10 17" stroke="#666" strokeWidth="1.2" />
    <path d="M 14 7 C 16 7, 16 9.5, 14 9.5 C 16 9.5, 16 12, 14 12 C 16 12, 16 14.5, 14 14.5 C 16 14.5, 16 17, 14 17" stroke="#666" strokeWidth="1.2" />
    <path d="M 11.5 6 L 11.5 18 M 12.5 6 L 12.5 18" stroke="#666" strokeWidth="1.2" />
    <path d="M 6 7 L 10 7 M 6 17 L 10 17 M 14 7 L 18 7 M 14 17 L 18 17" stroke="#666" strokeWidth="1.2" />
  </svg>
);

export const IconTransformer1P1S_CT = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 7 C 8 7, 8 9.5, 10 9.5 C 8 9.5, 8 12, 10 12 C 8 12, 8 14.5, 10 14.5 C 8 14.5, 8 17, 10 17" stroke="#666" strokeWidth="1.2" />
    <path d="M 14 7 C 16 7, 16 9.5, 14 9.5 C 16 9.5, 16 12, 14 12 C 16 12, 16 14.5, 14 14.5 C 16 14.5, 16 17, 14 17" stroke="#666" strokeWidth="1.2" />
    <path d="M 11.5 6 L 11.5 18 M 12.5 6 L 12.5 18" stroke="#666" strokeWidth="1.2" />
    <path d="M 6 7 L 10 7 M 6 17 L 10 17 M 14 7 L 18 7 M 14 12 L 18 12 M 14 17 L 18 17" stroke="#666" strokeWidth="1.2" />
  </svg>
);

export const IconTransformer1P2S = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 2 C 8 2, 8 6, 10 6 C 8 6, 8 10, 10 10" stroke="#666" strokeWidth="1.2" />
    <path d="M 14 2 C 16 2, 16 6, 14 6 C 16 6, 16 10, 14 10" stroke="#666" strokeWidth="1.2" />
    <path d="M 14 14 C 16 14, 16 18, 14 18 C 16 18, 16 22, 14 22" stroke="#666" strokeWidth="1.2" />
    <path d="M 11.5 1 L 11.5 23 M 12.5 1 L 12.5 23" stroke="#666" strokeWidth="1.2" />
    <path d="M 6 2 L 10 2 M 6 10 L 10 10 M 14 2 L 18 2 M 14 10 L 18 10 M 14 14 L 18 14 M 14 22 L 18 22" stroke="#666" strokeWidth="1.2" />
  </svg>
);

export const IconTransformer2P1S = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 2 C 8 2, 8 6, 10 6 C 8 6, 8 10, 10 10" stroke="#666" strokeWidth="1.2" />
    <path d="M 10 14 C 8 14, 8 18, 10 18 C 8 18, 8 22, 10 22" stroke="#666" strokeWidth="1.2" />
    <path d="M 14 2 C 16 2, 16 6, 14 6 C 16 6, 16 10, 14 10" stroke="#666" strokeWidth="1.2" />
    <path d="M 11.5 1 L 11.5 23 M 12.5 1 L 12.5 23" stroke="#666" strokeWidth="1.2" />
    <path d="M 6 2 L 10 2 M 6 10 L 10 10 M 6 14 L 10 14 M 6 22 L 10 22 M 14 2 L 18 2 M 14 10 L 18 10" stroke="#666" strokeWidth="1.2" />
  </svg>
);

export const IconTransformer2P2S = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 2 C 8 2, 8 6, 10 6 C 8 6, 8 10, 10 10" stroke="#666" strokeWidth="1.2" />
    <path d="M 10 14 C 8 14, 8 18, 10 18 C 8 18, 8 22, 10 22" stroke="#666" strokeWidth="1.2" />
    <path d="M 14 2 C 16 2, 16 6, 14 6 C 16 6, 16 10, 14 10" stroke="#666" strokeWidth="1.2" />
    <path d="M 14 14 C 16 14, 16 18, 14 18 C 16 18, 16 22, 14 22" stroke="#666" strokeWidth="1.2" />
    <path d="M 11.5 1 L 11.5 23 M 12.5 1 L 12.5 23" stroke="#666" strokeWidth="1.2" />
    <path d="M 6 2 L 10 2 M 6 10 L 10 10 M 6 14 L 10 14 M 6 22 L 10 22 M 14 2 L 18 2 M 14 10 L 18 10 M 14 14 L 18 14 M 14 22 L 18 22" stroke="#666" strokeWidth="1.2" />
  </svg>
);

export const IconCoupledInductors = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 2 7 L 6 7 C 6 4, 10 4, 10 7 C 10 4, 14 4, 14 7 C 14 4, 18 4, 18 7 L 22 7" stroke="#666" strokeWidth="1.5" />
    <path d="M 2 17 L 6 17 C 6 20, 10 20, 10 17 C 10 20, 14 20, 14 17 C 14 20, 18 20, 18 17 L 22 17" stroke="#666" strokeWidth="1.5" />
    <line x1="10" y1="9" x2="10" y2="15" stroke="#666" strokeWidth="1.5" />
    <line x1="14" y1="9" x2="14" y2="15" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconLossyTransmissionLine = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="6" width="14" height="12" stroke="#666" strokeWidth="1.5" />
    <path d="M 2 9 L 5 9 M 2 15 L 5 15 M 19 9 L 22 9 M 19 15 L 22 15" stroke="#666" strokeWidth="1.5" />
    <path d="M 7 12 L 9 9 L 11 15 L 13 9 L 15 15 L 17 12" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconLosslessTransmissionLine = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="6" width="14" height="12" rx="3" stroke="#666" strokeWidth="1.5" />
    <line x1="9" y1="6" x2="9" y2="18" stroke="#666" strokeWidth="1.5" />
    <line x1="15" y1="6" x2="15" y2="18" stroke="#666" strokeWidth="1.5" />
    <path d="M 2 9 L 5 9 M 2 15 L 5 15 M 19 9 L 22 9 M 19 15 L 22 15" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconResistorsPack = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="4" width="12" height="16" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 6 L 9 8 L 15 11 L 9 14 L 12 16" stroke="#666" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M 6 12 L 3 12 M 18 12 L 21 12" stroke="#666" strokeWidth="1.5" />
  </svg>
);

// ─── Digital Logic Gate Icons ──────────────────────────────────────────────

export const IconLogicGate = ({ size = 24, active = false }: { size?: number, active?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 8 L 14 8 Q 26 8 26 16 Q 26 24 14 24 L 6 24 Z" stroke={active ? '#10b981' : '#555'} strokeWidth="1.8" fill={active ? '#e6fff8' : 'white'} />
    <path d="M 2 12 L 6 12 M 2 20 L 6 20 M 26 16 L 30 16" stroke={active ? '#10b981' : '#555'} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IconGateAND = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 8 L 14 8 Q 24 8 24 16 Q 24 24 14 24 L 6 24 Z" stroke="#555" strokeWidth="1.6" fill="white" />
    <path d="M 2 12 L 6 12 M 2 20 L 6 20 M 24 16 L 30 16" stroke="#555" strokeWidth="1.6" strokeLinecap="round" />
    <text x="12" y="17" fontSize="7" fill="#333" textAnchor="middle" fontWeight="bold">&amp;</text>
  </svg>
);

export const IconGateOR = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 8 Q 12 8 16 8 Q 26 8 26 16 Q 26 24 16 24 Q 12 24 6 24 Q 10 20 10 16 Q 10 12 6 8 Z" stroke="#555" strokeWidth="1.6" fill="white" />
    <path d="M 2 12 L 8 12 M 2 20 L 8 20 M 26 16 L 30 16" stroke="#555" strokeWidth="1.6" strokeLinecap="round" />
    <text x="15" y="17" fontSize="7" fill="#333" textAnchor="middle" fontWeight="bold">≥1</text>
  </svg>
);

export const IconGateNOT = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 6 8 L 6 24 L 23 16 Z" stroke="#555" strokeWidth="1.6" fill="white" />
    <circle cx="25" cy="16" r="2" stroke="#555" strokeWidth="1.5" fill="white" />
    <path d="M 2 16 L 6 16 M 27 16 L 30 16" stroke="#555" strokeWidth="1.6" strokeLinecap="round" />
    <text x="11" y="17" fontSize="7" fill="#333" textAnchor="middle" fontWeight="bold">1</text>
  </svg>
);

export const IconGateNAND = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 5 8 L 13 8 Q 21 8 21 16 Q 21 24 13 24 L 5 24 Z" stroke="#555" strokeWidth="1.6" fill="white" />
    <circle cx="23" cy="16" r="2" stroke="#555" strokeWidth="1.5" fill="white" />
    <path d="M 2 12 L 5 12 M 2 20 L 5 20 M 25 16 L 30 16" stroke="#555" strokeWidth="1.6" strokeLinecap="round" />
    <text x="11" y="17" fontSize="6" fill="#333" textAnchor="middle" fontWeight="bold">&amp;</text>
  </svg>
);

export const IconGateNOR = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 5 8 Q 11 8 15 8 Q 22 8 22 16 Q 22 24 15 24 Q 11 24 5 24 Q 9 20 9 16 Q 9 12 5 8 Z" stroke="#555" strokeWidth="1.6" fill="white" />
    <circle cx="24" cy="16" r="2" stroke="#555" strokeWidth="1.5" fill="white" />
    <path d="M 2 12 L 7 12 M 2 20 L 7 20 M 26 16 L 30 16" stroke="#555" strokeWidth="1.6" strokeLinecap="round" />
    <text x="14" y="17" fontSize="6" fill="#333" textAnchor="middle" fontWeight="bold">≥1</text>
  </svg>
);

export const IconGateXOR = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 8 8 Q 14 8 18 8 Q 26 8 26 16 Q 26 24 18 24 Q 14 24 8 24 Q 12 20 12 16 Q 12 12 8 8 Z" stroke="#555" strokeWidth="1.6" fill="white" />
    <path d="M 5 8 Q 9 12 9 16 Q 9 20 5 24" stroke="#555" strokeWidth="1.6" fill="none" />
    <path d="M 2 12 L 10 12 M 2 20 L 10 20 M 26 16 L 30 16" stroke="#555" strokeWidth="1.6" strokeLinecap="round" />
    <text x="17" y="17" fontSize="6" fill="#333" textAnchor="middle" fontWeight="bold">=1</text>
  </svg>
);

export const IconCrystal = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8" y1="8" x2="8" y2="16" stroke="#666" strokeWidth="1.5" />
    <line x1="16" y1="8" x2="16" y2="16" stroke="#666" strokeWidth="1.5" />
    <rect x="10" y="9" width="4" height="6" stroke="#666" strokeWidth="1" fill="transparent" />
    <line x1="2" y1="12" x2="8" y2="12" stroke="#666" strokeWidth="1.5" />
    <line x1="16" y1="12" x2="22" y2="12" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconPhotodiode = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 10 16 L 16 12 L 10 8 Z" fill="transparent" stroke="#666" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="16" y1="8" x2="16" y2="16" stroke="#666" strokeWidth="1.5" />
    <line x1="2" y1="12" x2="10" y2="12" stroke="#666" strokeWidth="1.5" />
    <line x1="16" y1="12" x2="22" y2="12" stroke="#666" strokeWidth="1.5" />
    <path d="M 6 6 L 10 10 M 10 10 L 10 8 M 10 10 L 8 10" stroke="#ef4444" strokeWidth="1" />
    <path d="M 8 4 L 12 8 M 12 8 L 12 6 M 12 8 L 10 8" stroke="#ef4444" strokeWidth="1" />
  </svg>
);

export const IconPhototransistor = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8" y1="7" x2="8" y2="17" stroke="#666" strokeWidth="1.5" />
    <line x1="8" y1="9" x2="14" y2="4" stroke="#666" strokeWidth="1.5" />
    <line x1="14" y1="4" x2="14" y2="2" stroke="#666" strokeWidth="1.5" />
    <line x1="8" y1="15" x2="14" y2="20" stroke="#666" strokeWidth="1.5" />
    <line x1="14" y1="20" x2="14" y2="22" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 18 L 14 20 L 11 20 Z" fill="#666" />
    <path d="M 2 8 L 6 12 M 6 12 L 6 10 M 6 12 L 4 12" stroke="#ef4444" strokeWidth="1" />
    <path d="M 4 6 L 8 10 M 8 10 L 8 8 M 8 10 L 6 10" stroke="#ef4444" strokeWidth="1" />
  </svg>
);

export const IconTriac = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 9 14 L 15 10 L 9 10 Z" fill="transparent" stroke="#666" strokeWidth="1.2" />
    <path d="M 15 10 L 9 14 L 15 14 Z" fill="transparent" stroke="#666" strokeWidth="1.2" />
    <line x1="9" y1="10" x2="9" y2="14" stroke="#666" strokeWidth="1.2" />
    <line x1="15" y1="10" x2="15" y2="14" stroke="#666" strokeWidth="1.2" />
    <line x1="2" y1="12" x2="9" y2="12" stroke="#666" strokeWidth="1.5" />
    <line x1="15" y1="12" x2="22" y2="12" stroke="#666" strokeWidth="1.5" />
    <line x1="15" y1="14" x2="18" y2="16" stroke="#666" strokeWidth="1.2" />
    <line x1="18" y1="16" x2="18" y2="20" stroke="#666" strokeWidth="1.2" />
  </svg>
);

export const IconDiac = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 9 14 L 15 10 L 9 10 Z" fill="transparent" stroke="#666" strokeWidth="1.2" />
    <path d="M 15 10 L 9 14 L 15 14 Z" fill="transparent" stroke="#666" strokeWidth="1.2" />
    <line x1="9" y1="10" x2="9" y2="14" stroke="#666" strokeWidth="1.2" />
    <line x1="15" y1="10" x2="15" y2="14" stroke="#666" strokeWidth="1.2" />
    <line x1="2" y1="12" x2="9" y2="12" stroke="#666" strokeWidth="1.5" />
    <line x1="15" y1="12" x2="22" y2="12" stroke="#666" strokeWidth="1.5" />
  </svg>
);

export const IconDarlington = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M 8 8 L 8 12 M 8 10 L 11 8 L 11 4 M 8 10 L 11 12 M 10 8 L 11 8 L 10.5 9 Z M 10 11 L 11 12 L 10.5 12.5 Z" stroke="#666" strokeWidth="1" fill="none" />
    <path d="M 11 11 L 11 15 M 11 13 L 14 11 L 14 4 M 11 13 L 14 15 L 14 20 M 13 14 L 14 15 L 13.5 15.5 Z" stroke="#666" strokeWidth="1" fill="none" />
    <line x1="11" y1="4" x2="14" y2="4" stroke="#666" strokeWidth="1" />
    <line x1="2" y1="10" x2="8" y2="10" stroke="#666" strokeWidth="1" />
  </svg>
);

export const IconCurrentMirror = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="16" height="12" rx="1" fill="white" stroke="#666" strokeWidth="1.5" />
    <path d="M 6 12 L 10 12 M 14 12 L 18 12 M 12 6 L 12 10" stroke="#666" strokeWidth="1.5" />
    <path d="M 12 10 L 10 8 M 12 10 L 14 8" stroke="#666" strokeWidth="1" />
  </svg>
);
