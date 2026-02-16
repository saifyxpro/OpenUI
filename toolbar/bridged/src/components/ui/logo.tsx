import type { FC, HTMLAttributes } from 'react';
import OpenUILogoImg from '@/components/logos/openui.png';

export type LogoColor =
  | 'default'
  | 'black'
  | 'white'
  | 'zinc'
  | 'current'
  | 'gradient';

export type LoadingSpeed = 'slow' | 'fast';

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  color?: LogoColor;
  loading?: boolean;
  loadingSpeed?: LoadingSpeed;
}

export const Logo: FC<LogoProps> = ({
  color = 'default',
  loading = false,
  loadingSpeed = 'slow',
  ...props
}) => {
  return (
    <div
      className={`relative ${props.className || ''} ${
        loading ? 'drop-shadow-xl' : ''
      } aspect-square overflow-visible`}
    >
      <img
        src={OpenUILogoImg}
        alt="OpenUI"
        className={`absolute top-0 left-0 h-full w-full object-contain ${
          loading
            ? loadingSpeed === 'fast'
              ? 'animate-spin-fast'
              : 'animate-spin-slow animate-pulse'
            : ''
        }`}
      />
    </div>
  );
};
