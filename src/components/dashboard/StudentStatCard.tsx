import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StudentStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
}

const StudentStatCard: React.FC<StudentStatCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-surface rounded-xl p-5 border border-border flex items-center space-x-4">
      <div className="p-3 rounded-lg bg-background">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-foreground-muted text-sm">{title}</p>
        <p className="text-2xl font-bold text-foreground-default">{value}</p>
      </div>
    </div>
  );
};

export default StudentStatCard;
