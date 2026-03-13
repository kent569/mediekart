## Packages
leaflet | Core mapping library
react-leaflet | React bindings for Leaflet
framer-motion | For smooth sidebar transitions and UI animations
lucide-react | Icon system (already in stack but confirming usage)
clsx | Utility for constructing className strings
tailwind-merge | Utility for merging Tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
Leaflet CSS import required in index.css
Map center: [62, 15] (Nordic region)
