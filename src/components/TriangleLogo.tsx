interface TriangleLogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

const TriangleLogo = ({ 
  className = "w-16 h-16", 
  variant = 'default'
}: TriangleLogoProps) => {
  // Apply filter for white variant to make the blue logo appear white
  const filterStyle = variant === 'white' 
    ? { filter: 'brightness(0) invert(1)' } 
    : {};

  return (
    <img
      src="/src/assets/zepthlogo.png"
      alt="Triangle Logo"
      className={className}
      style={filterStyle}
    />
  );
};

export default TriangleLogo;
