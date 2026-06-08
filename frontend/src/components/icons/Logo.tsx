
export const Logo = ({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 150" className={className} style={style}>
    {/* Background (Optional: remove for transparency) */}
    {/* We remove the background rect to make it fit nicely in the header, or we can keep it.
        Actually, the header might be dark. Let's keep it transparent for better integration, 
        or we can just leave the rect but make it fill="transparent". 
        I'll set fill="transparent" so it blends perfectly. */}
    <rect width="450" height="150" fill="transparent" rx="15" ry="15"/>
    
    {/* Waveform Graphic */}
    <path d="M 40 75 L 70 75 L 85 45 L 105 105 L 120 75 L 160 75" 
          fill="none" 
          stroke="#00d2ff" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"/>
          
    {/* Circuit Nodes */}
    <circle cx="160" cy="75" r="6" fill="#00d2ff"/>
    <circle cx="40" cy="75" r="6" fill="#00d2ff"/>
    
    {/* Main Text */}
    <text x="180" y="85" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="36" fontWeight="800" fill="#ffffff">
      Multi<tspan fill="#00d2ff">Sim</tspan>
    </text>
    
    {/* Live Text */}
    <text x="180" y="115" fontFamily="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" fontSize="14" fontWeight="700" fill="#ff4444" letterSpacing="3">
      ● LIVE
    </text>
  </svg>
);
