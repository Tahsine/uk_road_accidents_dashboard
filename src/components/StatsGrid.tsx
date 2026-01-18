import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon, AlertTriangle, Users, MapPin, Skull } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatItemProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    description?: string;
    delay?: number;
    color?: "primary" | "destructive" | "warning" | "success";
}

const StatItem = ({ title, value, icon: Icon, trend, description, delay = 0, color = "primary" }: StatItemProps) => {
    const colorMap = {
        primary: "text-primary bg-primary/10",
        destructive: "text-red-600 bg-red-600/10",
        warning: "text-amber-600 bg-amber-600/10",
        success: "text-emerald-600 bg-emerald-600/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className="overflow-hidden border-none glass shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                            {trend && (
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", colorMap[color])}>
                                        {trend}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{description}</span>
                                </div>
                            )}
                        </div>
                        <div className={cn("p-4 rounded-2xl", colorMap[color])}>
                            <Icon className="w-6 h-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

interface StatsGridProps {
    stats: {
        total: number;
        fatal: number;
        serious: number;
        zones: number;
        dateRange: string;
    };
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatItem
                title="Total Accidents"
                value={stats.total.toLocaleString()}
                icon={IconWrapper('AlertTriangle')}
                trend="Period"
                description={stats.dateRange}
                color="primary"
                delay={0.1}
            />
            <StatItem
                title="Fatalities"
                value={stats.fatal.toLocaleString()}
                icon={IconWrapper('Skull')}
                trend={`${((stats.fatal / stats.total) * 100).toFixed(1)}%`}
                description="of total"
                color="destructive"
                delay={0.2}
            />
            <StatItem
                title="Serious Injuries"
                value={stats.serious.toLocaleString()}
                icon={IconWrapper('Users')}
                trend={`${((stats.serious / stats.total) * 100).toFixed(1)}%`}
                description="of total"
                color="warning"
                delay={0.3}
            />
            <StatItem
                title="High Risk Zones"
                value={stats.zones.toLocaleString()}
                icon={IconWrapper('MapPin')}
                trend="Analyzed"
                description="Grid cells"
                color="success"
                delay={0.4}
            />
        </div>
    );
}

// Helper to avoid prop drilling lucide icons if needed, or just pass them
function IconWrapper(name: string) {
    switch (name) {
        case 'AlertTriangle': return AlertTriangle;
        case 'Users': return Users;
        case 'MapPin': return MapPin;
        case 'Skull': return Skull;
        default: return AlertTriangle;
    }
}
