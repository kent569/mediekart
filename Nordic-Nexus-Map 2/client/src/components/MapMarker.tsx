import { Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { Office } from "@shared/schema";
import { Building2, MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

interface MapMarkerProps {
  office: Office;
  companyName: string;
  onClick: () => void;
  isSelected?: boolean;
}

export function MapMarker({ office, companyName, onClick, isSelected }: MapMarkerProps) {
  // Create a custom icon using Lucide icons
  const isHQ = office.type === "HQ";

  // Determine marker color based on company name
  const getMarkerColor = () => {
    if (isSelected) return 'bg-accent text-white scale-125 z-50';
    
    const name = companyName.toLowerCase();
    if (name.includes('amedia') || name.includes('berlingske') || 
        name.includes('avisa nordland') || name.includes('avisa oslo') || name.includes('avisen agder') || 
        name.includes('bergensavisen') || name.includes('bladet vesterålen') || name.includes('budstikka') || 
        name.includes('bygdebladet') || name.includes('bygdeposten') || name.includes('dalane tidende') || 
        name.includes('drammens tidende') || name.includes('eidsvoll ullensaker blad') || name.includes('enebakk avis') || 
        name.includes('fanaposten') || name.includes('finnmark dagblad') || name.includes('finnmarken') || 
        name.includes('firdaposten') || name.includes('fredriksstad blad') || name.includes('fremover') || 
        name.includes('gjengangeren') || name.includes('gjesdalbuen') || name.includes('glåmdalen') || 
        name.includes('gudbrandsdølen dagningen') || name.includes('hadeland') || name.includes('halden arbeiderblad') || 
        name.includes('hamar arbeiderblad') || name.includes('hammerfestingen') || name.includes('hardanger folkeblad') || 
        name.includes('haugesunds avis') || name.includes('østlands-posten') || name.includes('moss avis') || 
        name.includes('tønsbergs blad') || name.includes('hallingdølen') || name.includes('oppland arbeiderblad') || 
        name.includes('ringenblad') || name.includes('laagendalsposten') || name.includes('telemarksavisa') || 
        name.includes('aust agder blad') || name.includes('sandefjords blad') || name.includes('østlandets blad') || 
        name.includes('indv') || name.includes('jarlsberg') || name.includes('kragerø blad') || 
        name.includes('drøbak') || name.includes('kvinnheringen') || name.includes('nordhordland') || 
        name.includes('nordlys')) {
      return 'bg-blue-600 text-white hover:scale-110'; // Amedia blue
    }
    if (name.includes('polaris') || 
        name.includes('adresseavisen') || name.includes('fædrelandsvennen') || name.includes('agderposten') || 
        name.includes('varden') || name.includes('sunnmørsposten') || name.includes('romsdals budstikke') || 
        name.includes('itromsø') || name.includes('harstad tidende') || name.includes('altaposten') || 
        name.includes('troms folkeblad') || name.includes('andøyposten') || name.includes('brønnøysunds avis') || 
        name.includes('fosna-folket') || name.includes('hitra-frøya') || name.includes('gauldalsposten') || 
        name.includes('trønderbladet') || name.includes('vikebladet vestposten') || name.includes('driva') || 
        name.includes('åndalsnes avis') || name.includes('fjordenes tidende')) {
      return 'bg-orange-500 text-white hover:scale-110'; // Polaris orange
    }
    if (name.includes('watch') || name.includes('politikens')) {
      return 'bg-red-700 text-white hover:scale-110'; // JP/Politiken/Watch red
    }
    if (name.includes('schibsted') || name.includes('vg (') || name.includes('verdens gang') || 
        name.includes('aftenposten') || name.includes('bergens tidende') || name.includes('stavanger aftenblad') || 
        name.includes('e24') || name.includes('aftonbladet') || name.includes('svenska dagbladet') || 
        name.includes('tv4') || name.includes('shifter') || name.includes('norweco')) {
      return 'bg-pink-500 text-white hover:scale-110'; // Schibsted/JV pink
    }
    
    return isHQ ? 'bg-slate-800 text-white hover:scale-110' : 'bg-slate-500 text-white hover:scale-110';
  };
  
  const iconMarkup = renderToString(
    <div className={`
      relative flex items-center justify-center 
      w-8 h-8 rounded-full shadow-lg border-2 border-white 
      transition-transform duration-300
      ${getMarkerColor()}
    `}>
      {isHQ ? <Building2 size={14} /> : <MapPin size={14} />}
    </div>
  );

  const customIcon = divIcon({
    html: iconMarkup,
    className: "custom-marker-icon", // Use this class to remove default leaflet styles if needed
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <Marker 
      position={[office.lat, office.lng]} 
      icon={customIcon}
      eventHandlers={{
        click: onClick
      }}
    >
      <Popup className="font-sans">
        <div className="p-1 min-w-[150px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {office.type}
          </span>
          <h3 className="text-base font-bold text-foreground mt-0.5">{companyName}</h3>
          <p className="text-sm text-slate-500">{office.city}</p>
        </div>
      </Popup>
    </Marker>
  );
}
