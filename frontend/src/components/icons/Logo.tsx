export const Logo = ({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <div style={{ backgroundColor: 'white', padding: '4px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img 
      src="/logo_main.png" 
      alt="NodeSim Logo" 
      className={className} 
      style={{ objectFit: 'contain', ...style }} 
    />
  </div>
);
