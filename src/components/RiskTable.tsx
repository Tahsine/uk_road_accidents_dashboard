import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"
import type { RiskZone } from '../types'

interface RiskTableProps {
    topRiskZones: RiskZone[];
    onCoordinateClick?: (lat: number, lon: number) => void;
}

export function RiskTable({ topRiskZones, onCoordinateClick }: RiskTableProps) {
    return (
        <Card className="border-none glass shadow-2xl overflow-hidden mt-12 rounded-3xl">
            <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                            RISK INDEX REPOSITORY
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                            Synthesized geospatial profiling based on historical frequency and impact models.
                        </p>
                    </div>
                    <Badge variant="secondary" className="font-black text-[10px] tracking-widest uppercase py-1.5 px-4 rounded-full bg-primary/10 text-primary border-none w-fit">
                        Top 10 High Impact Zones
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="rounded-2xl border border-white/5 overflow-hidden shadow-inner bg-black/20">
                    <Table>
                        <TableHeader className="bg-muted/20">
                            <TableRow className="hover:bg-transparent border-white/5 h-14">
                                <TableHead className="w-[100px] font-black uppercase text-[10px] tracking-widest pl-6 italic text-primary">Rank</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest text-primary">Geospatial Coordinates</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-primary">Risk Score</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-primary">Total Accidents</TableHead>
                                <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-6 text-primary italic">Fatalities</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topRiskZones.map((zone, idx) => (
                                <TableRow key={idx} className="group transition-all hover:bg-primary/5 border-white/5 h-16">
                                    <TableCell className="font-black pl-6">
                                        <div className={cn(
                                            "w-9 h-9 flex items-center justify-center rounded-xl text-[11px] font-black border",
                                            idx === 0 && "bg-red-500/10 text-red-500 border-red-500/20 shadow-lg shadow-red-500/10",
                                            idx === 1 && "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-lg shadow-orange-500/10",
                                            idx === 2 && "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/10",
                                            idx > 2 && "bg-muted/10 text-muted-foreground border-white/5"
                                        )}>
                                            {idx + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs tracking-tight">
                                        <button
                                            onClick={() => onCoordinateClick?.(zone.lat, zone.lon)}
                                            className="flex items-center gap-2 text-foreground font-black hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4"
                                        >
                                            <MapPin className="w-3.5 h-3.5 text-primary opacity-50" />
                                            {zone.location}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <span className={cn(
                                            "font-black font-mono text-sm",
                                            parseFloat(zone.risk) > 15 ? "text-red-500" : "text-amber-500"
                                        )}>
                                            {zone.risk}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-black font-mono text-sm opacity-80">
                                        {zone.accidents.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge variant={zone.fatal > 0 ? "destructive" : "secondary"} className={cn(
                                            "font-black font-mono text-[10px] min-w-[36px] justify-center h-6 border-none",
                                            zone.fatal > 0 ? "bg-red-500 text-white" : "bg-muted/50 text-muted-foreground"
                                        )}>
                                            {zone.fatal}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
