import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Building, Network, ArrowRight } from "lucide-react";
import { useCompanyDetails } from "@/hooks/use-map-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CompanySidebarProps {
  companyId: number | null;
  onClose: () => void;
  onSelectCompany: (id: number) => void;
}

export function CompanySidebar({ companyId, onClose, onSelectCompany }: CompanySidebarProps) {
  const { data: company, isLoading, error } = useCompanyDetails(companyId);

  return (
    <AnimatePresence>
      {companyId && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-[1000] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-background/80 backdrop-blur-md border-b border-border/50">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Company Details</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : error ? (
              <div className="text-destructive p-4 bg-destructive/10 rounded-xl">
                Failed to load details.
              </div>
            ) : company ? (
              <>
                {/* Main Info */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-display font-bold text-foreground mb-2">{company.name}</h1>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="px-3 py-1 bg-slate-100 rounded-full font-medium text-slate-600">
                        {company.industry || "General"}
                      </span>
                      {company.website && (
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <Globe size={12} /> Website
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {company.description || "No description available for this company."}
                  </p>
                </div>

                <Separator />

                {/* Offices */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Building size={18} className="text-slate-400" />
                    Offices ({company.offices.length})
                  </h3>
                  <div className="grid gap-3">
                    {company.offices.map((office: any) => (
                      <div 
                        key={office.id}
                        className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-sm">{office.city}, {office.country.name}</div>
                          <div className="text-xs text-muted-foreground">{office.type}</div>
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {office.lat.toFixed(2)}, {office.lng.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Relationships */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Network size={18} className="text-slate-400" />
                    Corporate Structure
                  </h3>

                  {/* Incoming (Owners) */}
                  {company.incomingRelationships && company.incomingRelationships.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Owned By / Parent Companies</h4>
                      <div className="space-y-2">
                        {company.incomingRelationships.map((rel: any) => (
                          <Card 
                            key={rel.id} 
                            className="p-4 cursor-pointer hover:shadow-md hover:border-accent/50 transition-all group"
                            onClick={() => onSelectCompany(rel.sourceCompany.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold text-foreground group-hover:text-accent transition-colors">
                                  {rel.sourceCompany.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {rel.type} {rel.percentage ? `• ${rel.percentage}% Stake` : ''}
                                </div>
                              </div>
                              <ArrowRight size={16} className="text-slate-300 group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                            </div>
                            {rel.description && (
                              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-dashed border-slate-100">
                                {rel.description}
                              </p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outgoing (Subsidiaries) */}
                  {company.outgoingRelationships && company.outgoingRelationships.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-1">Subsidiaries / Investments</h4>
                      <div className="space-y-2">
                        {company.outgoingRelationships.map((rel: any) => (
                          <Card 
                            key={rel.id} 
                            className="p-4 cursor-pointer hover:shadow-md hover:border-accent/50 transition-all group"
                            onClick={() => onSelectCompany(rel.targetCompany.id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold text-foreground group-hover:text-accent transition-colors">
                                  {rel.targetCompany.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {rel.type} {rel.percentage ? `• ${rel.percentage}% Stake` : ''}
                                </div>
                              </div>
                              <ArrowRight size={16} className="text-slate-300 group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
                            </div>
                            {rel.description && (
                              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-dashed border-slate-100">
                                {rel.description}
                              </p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {!company.incomingRelationships?.length && !company.outgoingRelationships?.length && (
                    <div className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-lg text-center">
                      No corporate relationships recorded.
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
