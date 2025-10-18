import React from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';
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
      className="bg-background rounded-xl p-5 border border-border shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-foreground-muted text-sm font-medium">{title}</p>
        <Icon className="w-5 h-5 text-foreground-muted" />
      </div>

      <h3 className="text-3xl font-bold text-foreground-default mb-1">{value}</h3>

      <div className="flex items-center text-sm">
        <span
          className={`flex items-center font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
          {Math.abs(change)}%
        </span>
        <span className="text-foreground-muted ml-2">vs last month</span>
      </div>
    </motion.div>
  );
};

export default StatsCard;
