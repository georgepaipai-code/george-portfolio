import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type Location = {
  id: number;
  city: string;
  country: string;
  lat: number;
  lng: number;
  continent: string;
  createdAt: string;
};

export const LOCATIONS_KEY = ["locations"];

export function getListLocationsQueryKey() {
  return LOCATIONS_KEY;
}

export function useListLocations(options?: {
  query?: { enabled?: boolean; queryKey?: unknown[] };
}) {
  return useQuery<Location[]>({
    queryKey: options?.query?.queryKey ?? LOCATIONS_KEY,
    queryFn: async () => {
      const res = await apiFetch("/locations");
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
    enabled: options?.query?.enabled ?? true,
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async ({ data }: { data: { password: string } }) => {
      const res = await apiFetch("/admin/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Invalid password");
      return res.json() as Promise<{ token: string }>;
    },
  });
}

export function useCreateLocation() {
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: {
        city: string;
        country: string;
        lat: number;
        lng: number;
        continent: string;
      };
    }) => {
      const res = await apiFetch("/locations", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create location");
      return res.json();
    },
  });
}

export function useDeleteLocation() {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await apiFetch(`/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete location");
    },
  });
}
