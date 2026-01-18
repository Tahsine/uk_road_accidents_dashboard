// src/components/ui/badge.tsx

import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'fatal' | 'serious' | 'slight';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    fatal: "bg-red-100 text-red-800",
    serious: "bg-orange-100 text-orange-800",
    slight: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
};