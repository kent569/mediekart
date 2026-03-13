import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap, GeoJSON } from "react-leaflet";
import { useMapData } from "@/hooks/use-map-data";
import { MapMarker } from "@/components/MapMarker";
import { CompanySidebar } from "@/components/CompanySidebar";
import { Loader2, Filter, Search, Compass, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Component to handle map center updates when selecting a company
function MapUpdater({ center, zoom }: { center?: [number, number], zoom?: number }) {
  const map = useMap();
  if (center) {
    map.flyTo(center, zoom || 14, { duration: 1.5 });
  }
  return null;
}

export default function Home() {
  const { data, isLoading, error } = useMapData();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);

  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    // Fetch GeoJSON for Nordic countries
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then(res => res.json())
      .then(data => {
        const nordicCodes = ["NOR", "SWE", "DNK", "FIN"];
        const nordicNames = ["Norway", "Sweden", "Denmark", "Finland"];
        const filtered = {
          ...data,
          features: data.features.filter((f: any) => {
            const code = f.properties.ISO_A3 || f.properties["ISO3166-1-Alpha-3"];
            const name = f.properties.name || f.properties.NAME;
            return (
              nordicCodes.includes(code) || 
              nordicNames.includes(name)
            );
          })
        };
        console.log("Filtered GeoJSON data:", filtered);
        setGeoData(filtered);
      })
      .catch(err => console.error("Error fetching GeoJSON:", err));
  }, []);

  const getCountryStyle = (feature: any) => {
    const code = feature.properties.ISO_A3 || feature.properties["ISO3166-1-Alpha-3"];
    const name = feature.properties.name || feature.properties.NAME;
    let color = "#cccccc";
    
    // Check both ISO code and Name as fallback
    const upperName = name?.toUpperCase();
    if (code === "NOR" || upperName === "NORWAY") color = "#add8e6"; // Light Blue
    else if (code === "DNK" || upperName === "DENMARK") color = "#ff0000"; // Red
    else if (code === "SWE" || upperName === "SWEDEN") color = "#ffff00"; // Yellow
    else if (code === "FIN" || upperName === "FINLAND") color = "#0000ff"; // Blue

    return {
      fillColor: 'transparent',
      weight: 1.5,
      opacity: 1,
      color: '#e2e8f0', // slate-200 for subtle borders
      fillOpacity: 0
    };
  };

  // Derive unique lists for filters
  const industries = useMemo(() => {
    if (!data?.companies) return [];
    return Array.from(new Set(data.companies.map(c => c.industry).filter(Boolean) as string[])).sort();
  }, [data]);

  const countries = useMemo(() => {
    if (!data?.countries) return [];
    return data.countries.map(c => c.name).sort();
  }, [data]);

  // Filter logic
  const filteredOffices = useMemo(() => {
    if (!data) return [];
    
    return data.offices.filter(office => {
      const company = data.companies.find(c => c.id === office.companyId);
      const country = data.countries.find(c => c.id === office.countryId);
      
      if (!company || !country) return false;

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!company.name.toLowerCase().includes(query) && 
            !office.city.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Industry Filter
      if (selectedIndustries.length > 0 && company.industry) {
        if (!selectedIndustries.includes(company.industry)) return false;
      }

      // Country Filter
      if (selectedCountries.length > 0) {
        if (!selectedCountries.includes(country.name)) return false;
      }

      return true;
    });
  }, [data, searchQuery, selectedIndustries, selectedCountries]);

  const handleCompanySelect = (id: number) => {
    setSelectedCompanyId(id);
    
    // Find HQ to center map
    const companyOffices = data?.offices.filter(o => o.companyId === id) || [];
    const hq = companyOffices.find(o => o.type === "HQ") || companyOffices[0];
    
    if (hq) {
      setMapCenter([hq.lat, hq.lng]);
      setMapZoom(14);
    }
  };

  const handleCloseSidebar = () => {
    setSelectedCompanyId(null);
    // Zoom out slightly (from 14 to 8)
    setMapZoom(8);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <Loader2 className="animate-spin w-10 h-10 text-primary" />
        <p className="font-display font-medium tracking-wide text-sm">LOADING NORDIC MAP DATA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md bg-white shadow-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            Could not fetch the map data. Please check your connection and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background flex flex-col">
      
      {/* Navbar / Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pointer-events-auto">
          
          {/* Brand */}
          <div className="glass px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Compass size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">NordicNexus</h1>
              <p className="text-xs text-muted-foreground font-medium mt-1">Corporate Landscape</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 glass rounded-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                className="pl-9 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 h-11"
                placeholder="Search companies or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="glass h-11 px-4 border-white/20 hover:bg-white/90">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(selectedIndustries.length > 0 || selectedCountries.length > 0) && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-accent" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel>Industry</DropdownMenuLabel>
                {industries.map(industry => (
                  <DropdownMenuCheckboxItem
                    key={industry}
                    checked={selectedIndustries.includes(industry)}
                    onCheckedChange={(checked) => {
                      setSelectedIndustries(prev => 
                        checked ? [...prev, industry] : prev.filter(i => i !== industry)
                      );
                    }}
                  >
                    {industry}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>Country</DropdownMenuLabel>
                {countries.map(country => (
                  <DropdownMenuCheckboxItem
                    key={country}
                    checked={selectedCountries.includes(country)}
                    onCheckedChange={(checked) => {
                      setSelectedCountries(prev => 
                        checked ? [...prev, country] : prev.filter(c => c !== country)
                      );
                    }}
                  >
                    {country}
                  </DropdownMenuCheckboxItem>
                ))}

                {(selectedIndustries.length > 0 || selectedCountries.length > 0) && (
                  <>
                    <DropdownMenuSeparator />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-muted-foreground justify-center"
                      onClick={() => {
                        setSelectedIndustries([]);
                        setSelectedCountries([]);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[62, 15]} 
          zoom={5} 
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          
          <MapUpdater center={mapCenter} zoom={mapZoom} />

          {geoData && (
            <GeoJSON 
              key={JSON.stringify(geoData)}
              data={geoData} 
              style={getCountryStyle}
              interactive={false}
            />
          )}

          {filteredOffices.map(office => {
            const company = data?.companies.find(c => c.id === office.companyId);
            return (
              <MapMarker 
                key={office.id}
                office={office}
                companyName={company?.name || "Unknown Company"}
                onClick={() => handleCompanySelect(office.companyId)}
                isSelected={selectedCompanyId === office.companyId}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Detail Sidebar */}
      <CompanySidebar 
        companyId={selectedCompanyId} 
        onClose={handleCloseSidebar}
        onSelectCompany={handleCompanySelect}
      />

      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 z-[400] pointer-events-none hidden md:block">
        <div className="glass px-4 py-2 rounded-lg text-xs font-medium text-slate-500">
          Showing {filteredOffices.length} offices across the Nordics
        </div>
      </div>
    </div>
  );
}
