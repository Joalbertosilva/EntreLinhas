import { cn } from '@/lib/utils'
import { BrandLogo } from '@/features/auth/BrandLogo'

interface LoginBrandProps {
  className?: string
}

/** Logo oficial EntreLinhas na tela de login */
export function LoginBrand({ className }: LoginBrandProps) {
  return <BrandLogo className={cn('mx-auto lg:mx-0', className)} />
}
