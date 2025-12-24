// Logo component
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ className = '', size = 'medium' }: LogoProps) {
  const sizeMap = {
    small: { width: 60, height: 30 },
    medium: { width: 120, height: 60 },
    large: { width: 180, height: 90 },
  };

  const dimensions = sizeMap[size];

  return (
    <div className={`${className} inline-block`}>
      <Image
        src="/logo.svg"
        alt="Company Logo"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="object-contain"
      />
    </div>
  );
}