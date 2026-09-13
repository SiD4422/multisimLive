export const Logo = ({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <img 
    src="/logo_main.png" 
    alt="NodeSim Logo" 
    className={className} 
    style={{ 
      objectFit: 'contain', 
      filter: 'drop-shadow(1px 1px 0px rgba(255,255,255,0.9)) drop-shadow(-1px -1px 0px rgba(255,255,255,0.9)) drop-shadow(1px -1px 0px rgba(255,255,255,0.9)) drop-shadow(-1px 1px 0px rgba(255,255,255,0.9))',
      ...style 
    }} 
  />
);
