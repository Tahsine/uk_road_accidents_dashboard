// src/App.tsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Car, Users, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { cn } from './lib/utils';
import type { SummaryStatistics, GridCell, Accident, SeverityType, SeverityData, RiskZone } from './types';
import 'leaflet/dist/leaflet.css';

// StatCard Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  color?: 'blue' | 'red' | 'orange' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600"
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={cn("p-3 rounded-full", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

// AccidentMap Component
interface AccidentMapProps {
  gridData: GridCell[];
  accidents: Accident[];
  selectedSeverity: SeverityType;
}

const AccidentMap: React.FC<AccidentMapProps> = ({ gridData, accidents, selectedSeverity }) => {
  const filteredAccidents = selectedSeverity === 'all' 
    ? accidents 
    : accidents.filter(a => a.severity_label === selectedSeverity);

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      'Fatal': '#dc2626',
      'Serious': '#f97316', 
      'Slight': '#fbbf24'
    };
    return colors[severity] || '#3b82f6';
  };

  const getRiskColor = (riskScore: number): string => {
    if (riskScore > 15) return '#dc2626';
    if (riskScore > 10) return '#f97316';
    if (riskScore > 5) return '#fbbf24';
    return '#22c55e';
  };

  return (
    <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={[54.5, -3.5]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Risk Grid Heatmap */}
        {gridData.slice(0, 500).map((cell, idx) => (
          <CircleMarker
            key={`grid-${idx}`}
            center={[cell.lat, cell.lon]}
            radius={8}
            fillColor={getRiskColor(cell.risk_score)}
            color="white"
            weight={1}
            opacity={0.8}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold mb-1">Risk Score: {cell.risk_score.toFixed(2)}</p>
                <p className="text-sm">Total: {cell.total_accidents}</p>
                <p className="text-sm text-red-600">Fatal: {cell.fatal_count}</p>
                <p className="text-sm text-orange-600">Serious: {cell.serious_count}</p>
                <p className="text-sm text-yellow-600">Slight: {cell.slight_count}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Individual Accidents */}
        {filteredAccidents.slice(0, 1000).map((accident, idx) => (
          <CircleMarker
            key={`accident-${idx}`}
            center={[accident.latitude, accident.longitude]}
            radius={3}
            fillColor={getSeverityColor(accident.severity_label)}
            color="white"
            weight={1}
            opacity={1}
            fillOpacity={0.8}
          >
            <Popup>
              <div className="p-2">
                <Badge variant={accident.severity_label.toLowerCase() as 'fatal' | 'serious' | 'slight'}>
                  {accident.severity_label}
                </Badge>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<SummaryStatistics | null>(null);
  const [gridData, setGridData] = useState<GridCell[]>([]);
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityType>('all');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load data. Please check JSON files in public/</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const severityData: SeverityData[] = [
    { name: 'Fatal', value: summary.severity_distribution.Fatal, color: '#dc2626' },
    { name: 'Serious', value: summary.severity_distribution.Serious, color: '#f97316' },
    { name: 'Slight', value: summary.severity_distribution.Slight, color: '#fbbf24' }
  ];

  // Top risk zones
  const topRiskZones: RiskZone[] = [...gridData]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 10)
    .map(zone => ({
      location: `${zone.lat.toFixed(2)}°N, ${Math.abs(zone.lon).toFixed(2)}°W`,
      risk: zone.risk_score.toFixed(2),
      accidents: zone.total_accidents,
      fatal: zone.fatal_count
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Car className="w-8 h-8" />
            <h1 className="text-3xl font-bold">UK Road Accidents Risk Dashboard</h1>
          </div>
          <p className="text-blue-100">
            Geospatial Analysis & ML Prediction Model ({summary.date_range.start} - {summary.date_range.end})
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Model: {summary.model_performance.best_model}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Accuracy: {(summary.model_performance.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span>F1-Score: {summary.model_performance.f1_score.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Accidents"
            value={summary.total_accidents.toLocaleString()}
            icon={AlertTriangle}
            trend={`${summary.date_range.start} - ${summary.date_range.end}`}
            color="blue"
          />
          <StatCard
            title="Fatal Accidents"
            value={summary.severity_distribution.Fatal.toLocaleString()}
            icon={AlertTriangle}
            trend={`${((summary.severity_distribution.Fatal / summary.total_accidents) * 100).toFixed(1)}% of total`}
            color="red"
          />
          <StatCard
            title="Serious Injuries"
            value={summary.severity_distribution.Serious.toLocaleString()}
            icon={Users}
            trend={`${((summary.severity_distribution.Serious / summary.total_accidents) * 100).toFixed(1)}% of total`}
            color="orange"
          />
          <StatCard
            title="Risk Zones"
            value={gridData.length.toLocaleString()}
            icon={MapPin}
            trend="Analyzed grid cells"
            color="green"
          />
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'Fatal', 'Serious', 'Slight'] as const).map((severity) => {
                const config = {
                  all: { bg: 'bg-blue-600', bgLight: 'bg-gray-100', text: 'text-gray-700', textLight: 'text-white', hover: 'hover:bg-gray-200', label: 'All Accidents' },
                  Fatal: { bg: 'bg-red-600', bgLight: 'bg-red-50', text: 'text-red-700', textLight: 'text-white', hover: 'hover:bg-red-100', label: 'Fatal Only' },
                  Serious: { bg: 'bg-orange-600', bgLight: 'bg-orange-50', text: 'text-orange-700', textLight: 'text-white', hover: 'hover:bg-orange-100', label: 'Serious Only' },
                  Slight: { bg: 'bg-yellow-600', bgLight: 'bg-yellow-50', text: 'text-yellow-700', textLight: 'text-white', hover: 'hover:bg-yellow-100', label: 'Slight Only' }
                }[severity];

                return (
                  <button
                    key={severity}
                    onClick={() => setSelectedSeverity(severity)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-colors",
                      selectedSeverity === severity
                        ? `${config.bg} ${config.textLight}`
                        : `${config.bgLight} ${config.text} ${config.hover}`
                    )}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Geospatial Risk Map
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Heatmap shows risk zones. Larger circles = higher risk. Click for details.
            </p>
          </CardHeader>
          <CardContent>
            <AccidentMap 
              gridData={gridData} 
              accidents={accidents}
              selectedSeverity={selectedSeverity}
            />
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Severity Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Accident Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Risk Zones Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Highest Risk Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRiskZones.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accidents" fill="#3b82f6" name="Total Accidents" />
                  <Bar dataKey="fatal" fill="#dc2626" name="Fatal" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Zones Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Risk Zones Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Risk Score</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Accidents</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Fatal</th>
                  </tr>
                </thead>
                <tbody>
                  {topRiskZones.map((zone, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Badge variant={idx < 3 ? 'fatal' : 'default'}>#{idx + 1}</Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm">{zone.location}</td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600">{zone.risk}</td>
                      <td className="py-3 px-4 text-right">{zone.accidents}</td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">{zone.fatal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data Source: UK Department for Transport Road Safety Data</p>
          <p className="mt-1">
            ML Model: {summary.model_performance.best_model} | 
            Accuracy: {(summary.model_performance.accuracy * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;