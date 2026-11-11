import React from 'react';
import {
  Cpu,
  Dumbbell,
  CheckSquare,
  Sparkles,
  Mic,
  Flame,
  BookOpen,
  Tv,
} from 'lucide-react';

interface ChannelBadgeProps {
  icon: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ChannelBadge: React.FC<ChannelBadgeProps> = ({
  icon,
  color,
  size = 'md',
}) => {
  const dimensions = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size];

  const iconSize = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const renderIcon = () => {
    switch (icon) {
      case 'tech':
        return <Cpu className={iconSize} />;
      case 'fitness':
        return <Dumbbell className={iconSize} />;
      case 'productivity':
        return <CheckSquare className={iconSize} />;
      case 'story':
        return <Sparkles className={iconSize} />;
      case 'podcast':
        return <Mic className={iconSize} />;
      case 'controversy':
        return <Flame className={iconSize} />;
      case 'kids':
        return <BookOpen className={iconSize} />;
      default:
        return <Tv className={iconSize} />;
    }
  };

  return (
    <span
      className={`${dimensions} rounded-full inline-flex items-center justify-center text-white shrink-0 shadow-xs`}
      style={{ backgroundColor: color }}
    >
      {renderIcon()}
    </span>
  );
};
