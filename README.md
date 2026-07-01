# SafeGuard UK — Road Accident Risk Dashboard

Interactive geospatial dashboard for visualizing road accident risk across the UK.
Built with React, TypeScript, and the ML model from [uk_road_accidents_analysis](https://github.com/Tahsine/uk_road_accidents_analysis).

### Features

- Interactive map with risk heatmap and accident markers
- Severity filtering (Fatal / Serious / Slight)
- Analytics charts: severity distribution, top risk zones
- Risk zone ranking table with coordinate navigation
- Real-time stats from 45 years of UK road data

### Stack

React · TypeScript · Vite · Framer Motion · Recharts
Leaflet · shadcn/ui · Tailwind CSS · Lucide Icons

### Model

The dashboard consumes precomputed data from an XGBoost classifier trained on UK road accident records (1979–2024) with ~86% accuracy. Prediction classes: Fatal, Serious, Slight.

### Getting Started

```bash
npm install
npm run dev
```

Related
- uk_road_accidents_analysis (https://github.com/Tahsine/uk_road_accidents_analysis) — ML training pipeline and data preprocessing
