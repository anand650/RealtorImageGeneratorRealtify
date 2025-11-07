import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
  }

  const imageSizes = {
    sm: 48,
    md: 64,
    lg: 96,
  }

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/realtifyGoldLogo.png"
        alt="Realtify Logo"
        width={imageSizes[size]}
        height={imageSizes[size]}
        className={cn('object-contain', sizeClasses[size])}
        priority
      />
    </div>
  )
}
