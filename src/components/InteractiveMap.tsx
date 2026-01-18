import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GridCell, Accident, SeverityType } from '../types';

interface InteractiveMapProps {
    gridData: GridCell[];
    accidents: Accident[];
    selectedSeverity: SeverityType;
    focusPosition?: [number, number] | null;
}

function MapFocusHandler({ position }: { position?: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 14, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
}

export function InteractiveMap({ gridData, accidents, selectedSeverity, focusPosition }: InteractiveMapProps) {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Since we enforced dark mode in index.css, we can keep it true
        setIsDarkMode(document.documentElement.classList.contains('dark') || true);
    }, []);

    const filteredAccidents = selectedSeverity === 'all'
        ? accidents
        : accidents.filter(a => a.severity_label === selectedSeverity);

    const getSeverityColor = (severity: string): string => {
        const colors: Record<string, string> = {
            'Fatal': '#ef4444',
            'Serious': '#f59e0b',
            'Slight': '#10b981'
        };
        return colors[severity] || '#6366f1';
    };

    const getRiskColor = (riskScore: number): string => {
        if (riskScore > 15) return '#ef4444';
        if (riskScore > 10) return '#f59e0b';
        if (riskScore > 5) return '#fbbf24';
        return '#10b981';
    };

    const lightUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    const darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    return (
        <Card className="relative h-[650px] w-full overflow-hidden border-none shadow-2xl glass transition-all duration-500 rounded-3xl">
            <MapContainer
                center={[54.5, -3.5]}
                zoom={6}
                zoomControl={false}
                style={{ height: '100%', width: '100%', background: 'transparent' }}
            >
                <TileLayer
                    url={isDarkMode ? darkUrl : lightUrl}
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ZoomControl position="bottomright" />
                <MapFocusHandler position={focusPosition} />

                {gridData.slice(0, 500).map((cell, idx) => (
                    <CircleMarker
                        key={`grid-${idx}`}
                        center={[cell.lat, cell.lon]}
                        radius={8}
                        fillColor={getRiskColor(cell.risk_score)}
                        color="white"
                        weight={0.5}
                        opacity={0.3}
                        fillOpacity={0.6}
                    >
                        <Popup className="custom-popup">
                            <div className="p-3 min-w-[150px]">
                                <h4 className="font-black text-sm mb-2 border-b pb-1 uppercase tracking-widest">Risk Analysis</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Risk Score:</span>
                                        <span className="font-mono font-black text-primary">{cell.risk_score.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Volume:</span>
                                        <span className="font-bold">{cell.total_accidents}</span>
                                    </div>
                                    <div className="flex justify-between text-red-500 font-bold">
                                        <span>Fatalities:</span>
                                        <span>{cell.fatal_count}</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

                {filteredAccidents.slice(0, 1000).map((accident, idx) => (
                    <CircleMarker
                        key={`accident-${idx}`}
                        center={[accident.latitude, accident.longitude]}
                        radius={3}
                        fillColor={getSeverityColor(accident.severity_label)}
                        color="white"
                        weight={0.5}
                        opacity={0.9}
                        fillOpacity={0.9}
                    >
                        <Popup>
                            <div className="p-2 min-w-[120px]">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-center font-black uppercase text-[9px] tracking-widest",
                                        accident.severity_label === 'Fatal' && "bg-red-500 text-white border-none",
                                        accident.severity_label === 'Serious' && "bg-amber-500 text-white border-none",
                                        accident.severity_label === 'Slight' && "bg-emerald-500 text-white border-none"
                                    )}
                                >
                                    {accident.severity_label}
                                </Badge>
                                <p className="mt-3 text-[9px] text-muted-foreground text-center font-bold tracking-tighter opacity-70">
                                    GEOSPATIAL INCIDENT LOG
                                </p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            <div className="absolute top-6 left-6 z-[1000] glass p-4 rounded-2xl space-y-3 pointer-events-none min-w-[120px]">
                <p className="font-black uppercase tracking-widest text-[9px] text-primary mb-2">Hazard Level</p>
                {[
                    { color: '#ef4444', label: 'Critical' },
                    { color: '#f59e0b', label: 'High' },
                    { color: '#fbbf24', label: 'Moderate' },
                    { color: '#10b981', label: 'Normal' }
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
