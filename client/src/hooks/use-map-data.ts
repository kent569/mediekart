import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Helper type for the specialized map response
type MapDataResponse = z.infer<typeof api.map.data.responses[200]>;

export function useMapData() {
  return useQuery({
    queryKey: [api.map.data.path],
    queryFn: async () => {
      const res = await fetch(api.map.data.path);
      if (!res.ok) throw new Error("Failed to fetch map data");
      return api.map.data.responses[200].parse(await res.json());
    },
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: [api.companies.list.path],
    queryFn: async () => {
      const res = await fetch(api.companies.list.path);
      if (!res.ok) throw new Error("Failed to fetch companies");
      return api.companies.list.responses[200].parse(await res.json());
    },
  });
}

export function useCompanyDetails(id: number | null) {
  return useQuery({
    queryKey: [api.companies.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const url = buildUrl(api.companies.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch company details");
      }
      // Note: The response schema in routes is generic <any>, so we trust the backend 
      // returns the complex structure defined in schema.ts (CompanyWithDetails)
      return await res.json(); 
    },
  });
}
