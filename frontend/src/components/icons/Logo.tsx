export const Logo = ({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <img 
    src="/logo_dark_transparent.png" 
    alt="NodeSim Logo" 
    className={className} 
    style={{ objectFit: 'contain', ...style }} 
  />
);
