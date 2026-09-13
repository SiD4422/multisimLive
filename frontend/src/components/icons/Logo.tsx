export const Logo = ({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <img 
    src="/logo_main.png" 
    alt="NodeSim Logo" 
    className={className} 
    style={{ objectFit: 'contain', ...style }} 
  />
);
