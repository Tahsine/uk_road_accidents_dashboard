import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SeverityData, RiskZone } from '../types';

interface AnalyticsChartsProps {
    severityData: SeverityData[];
    topRiskZones: RiskZone[];
}

interface TooltipPayloadEntry {
    name: string;
    value: number;
    color?: string;
    fill?: string;
    payload: SeverityData | RiskZone;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border-none shadow-xl text-xs">
                <p className="font-bold mb-1">{label || payload[0].name}</p>
                {payload.map((entry: TooltipPayloadEntry, index: number) => (
                    <p key={index} className="flex items-center gap-2" style={{ color: entry.color || entry.fill }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        {entry.name}: <span className="font-mono ml-auto">{entry.value.toLocaleString()}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function AnalyticsCharts({ severityData, topRiskZones }: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none glass shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        Severity Distribution
                        <span className="text-[10px] font-normal text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">Proportional Analysis</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    stroke="none"
                                    animationBegin={200}
                                    animationDuration={1500}
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-medium text-muted-foreground">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none glass shadow-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        Top High-Risk Zones
                        <span className="text-[10px] font-normal text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">Geospatial Insights</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topRiskZones.slice(0, 8)} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <XAxis
                                    dataKey="location"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={10}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                    axisLine={{ stroke: 'var(--border)' }}
                                />
                                <YAxis
                                    fontSize={10}
                                    tick={{ fill: 'var(--muted-foreground)' }}
                                    axisLine={{ stroke: 'var(--border)' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.1 }} />
                                <Bar
                                    dataKey="accidents"
                                    fill="url(#barGradient)"
                                    name="Total Accidents"
                                    radius={[4, 4, 0, 0]}
                                    animationBegin={400}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
