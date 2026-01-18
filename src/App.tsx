import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Map as MapIcon, BarChart3 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsGrid } from './components/StatsGrid';
import { InteractiveMap } from './components/InteractiveMap';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { RiskTable } from './components/RiskTable';
import type { SummaryStatistics, GridCell, Accident, SeverityType, SeverityData, RiskZone } from './types';

const App: React.FC = () => {
  const [summary, setSummary] = useState<SummaryStatistics | null>(null);
  const [gridData, setGridData] = useState<GridCell[]>([]);
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityType>('all');
  const [mapFocus, setMapFocus] = useState<[number, number] | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/summary_statistics.json').then(r => r.json()),
      fetch('/accident_risk_grid.json').then(r => r.json()),
      fetch('/accidents_sample.json').then(r => r.json())
    ]).then(([summaryData, grid, accidentsList]: [SummaryStatistics, GridCell[], Accident[]]) => {
      setSummary(summaryData);
      setGridData(grid);
      setAccidents(accidentsList);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading data:', err);
      setLoading(false);
    });
  }, []);

  // Force dark class on mounting
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Initializing Analytics Engine...</p>
        </motion.div>
      </div>
    );
  }

  if (!summary) return null;

  const severityData: SeverityData[] = [
    { name: 'Fatal', value: summary.severity_distribution.Fatal, color: '#ef4444' },
    { name: 'Serious', value: summary.severity_distribution.Serious, color: '#f59e0b' },
    { name: 'Slight', value: summary.severity_distribution.Slight, color: '#10b981' }
  ];

  const handleRowClick = (lat: number, lon: number) => {
    setMapFocus([lat, lon]);
    // Scroll to map if needed, but the map is usually visible
    const mapElement = document.getElementById('explorer-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const topRiskZones: RiskZone[] = [...gridData]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10)
    .map(zone => ({
      location: `${zone.lat.toFixed(3)}°N, ${Math.abs(zone.lon).toFixed(3)}°W`,
      risk: zone.risk_score.toFixed(2),
      accidents: zone.total_accidents,
      fatal: zone.fatal_count,
      lat: zone.lat,
      lon: zone.lon
    }));

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-lg leading-none">SafeGuard UK</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Road Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-muted/30 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
              Sync: {summary.date_range.end}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-6 border-b">
          <div className="space-y-4">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Geospatial Analysis v2.4
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-3xl">
              Road Accident <span className="text-primary italic">Risk Index</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Real-time geospatial visualization of road safety across the UK. Utilizing
              <span className="text-foreground font-semibold"> {summary.model_performance.best_model} </span>
              with <span className="text-emerald-500 font-bold">{(summary.model_performance.accuracy * 100).toFixed(1)}%</span> accuracy.
            </p>
          </div>
          <div className="bg-muted/20 p-6 rounded-2xl border border-white/5 min-w-[200px]">
            <p className="text-[10px] uppercase text-muted-foreground tracking-widest font-black mb-1">Processed Events</p>
            <p className="text-4xl font-black font-mono text-primary">{summary.total_accidents.toLocaleString()}</p>
          </div>
        </section>

        {/* Stats Grid */}
        <StatsGrid stats={{
          total: summary.total_accidents,
          fatal: summary.severity_distribution.Fatal,
          serious: summary.severity_distribution.Serious,
          zones: gridData.length,
          dateRange: `${summary.date_range.start} – ${summary.date_range.end}`
        }} />

        {/* Dynamic Explorer */}
        <div id="explorer-section" className="space-y-6 pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-2xl">Operational Dashboard</h3>
              </div>
              <p className="text-sm text-muted-foreground">Monitor and filter geospatial accident data blocks.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter Severity:</span>
              <div className="flex bg-muted/40 p-1.5 rounded-xl gap-1">
                {(['all', 'Fatal', 'Serious', 'Slight'] as const).map((sev) => {
                  const isActive = selectedSeverity === sev;
                  return (
                    <button
                      key={sev}
                      onClick={() => setSelectedSeverity(sev)}
                      className={cn(
                        "px-5 py-2 rounded-lg text-xs font-black transition-all",
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      )}
                    >
                      {sev.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="bg-muted/40 p-1.5 mb-6 h-auto w-fit gap-2">
              <TabsTrigger value="map" className="gap-2 px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-xs">
                <MapIcon className="w-4 h-4" /> SPATIAL DATA
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 px-8 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-xs">
                <BarChart3 className="w-4 h-4" /> TRENDS
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="map" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                >
                  <InteractiveMap
                    gridData={gridData}
                    accidents={accidents}
                    selectedSeverity={selectedSeverity}
                    focusPosition={mapFocus}
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="analytics" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                >
                  <AnalyticsCharts
                    severityData={severityData}
                    topRiskZones={topRiskZones}
                  />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Risk Registry */}
        <RiskTable topRiskZones={topRiskZones} onCoordinateClick={handleRowClick} />

      </main>
    </div>
  );
};

export default App;
