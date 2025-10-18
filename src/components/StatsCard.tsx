import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
}) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-surface rounded-xl p-5 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-foreground-muted text-sm">{title}</p>
        <Icon className="w-5 h-5 text-foreground-muted" />
      </div>

      <h3 className="text-3xl font-bold text-foreground-default mb-1">{value}</h3>

      <div className="flex items-center text-sm">
        <span
          className={`font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}
          {change}%
        </span>
        <span className="text-foreground-muted ml-2">from last month</span>
      </div>
    </motion.div>
  );
};

export default StatsCard;
