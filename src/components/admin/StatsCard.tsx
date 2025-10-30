import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, colorClass = 'text-primary' }: StatsCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass-card p-6 rounded-xl border border-border"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-2">{title}</p>
          <div className="text-3xl font-bold">
            <AnimatedCounter end={value} />
          </div>
          {trend && (
            <p className="text-xs text-muted-foreground mt-2">{trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};
