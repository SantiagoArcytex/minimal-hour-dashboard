// Logo component
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={className}>
      <Image
        src="/logo.svg"
        alt="Company Logo"
        width={80}
        height={40}
        priority
      />
    </div>
  );
}