import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListLocations,
  useAdminLogin,
  useCreateLocation,
  useDeleteLocation,
  getListLocationsQueryKey,
} from "@/hooks/use-locations";
import { getToken, setToken, clearToken, isLoggedIn } from "@/lib/api";
import { CitySearch, type CityResult } from "@/components/CitySearch";

export default function Admin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [pending, setPending] = useState<CityResult | null>(null);
  const [formError, setFormError] = useState("");

  const { data: locations, isLoading } = useListLocations({
    query: { enabled: loggedIn, queryKey: getListLocationsQueryKey() },
  });

  const loginMutation = useAdminLogin();
  const createMutation = useCreateLocation();
  const deleteMutation = useDeleteLocation();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    loginMutation.mutate(
      { data: { password } },
      {
        onSuccess: (data) => {
          setToken(data.token);
          setLoggedIn(true);
          setPassword("");
        },
        onError: () => setLoginError("Incorrect password"),
      }
    );
  }

  function handleLogout() {
    clearToken();
    setLoggedIn(false);
  }

  function handleSelect(result: CityResult) {
    setPending(result);
    setFormError("");
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() }) }
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!pending) { setFormError("Please search and select a city first"); return; }

    createMutation.mutate(
      {
        data: {
          city: pending.city,
          country: pending.country,
          lat: pending.lat,
          lng: pending.lng,
          continent: pending.continent,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
          setPending(null);
        },
        onError: () => setFormError("Failed to add location — try again"),
      }
    );
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Admin Login
            </h1>
            <p className="text-white/50 text-sm mt-1">georgep.ai</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              data-testid="input-password"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              data-testid="button-login"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
            >
              {loginMutation.isPending ? "Logging in…" : "Log In"}
            </button>
          </form>
          <button
            onClick={() => setLocation("/")}
            className="mt-6 w-full text-white/40 hover:text-white/60 text-sm text-center transition-colors"
          >
            ← Back to portfolio
          </button>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div>
          <span
            className="font-bold text-lg"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            georgep.ai
          </span>
          <span className="text-white/30 ml-2 text-sm">/ admin</span>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setLocation("/")}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            View portfolio
          </button>
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="text-red-400/70 hover:text-red-400 text-sm transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">

        {/* Add location */}
        <section>
          <h2
            className="text-lg font-semibold mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Add Location
          </h2>
          <p className="text-white/30 text-sm mb-4">
            Start typing a city name — select from the dropdown to fill in all details automatically.
          </p>

          <form onSubmit={handleAdd} className="space-y-3">
            {/* Search input */}
            <div className="grid grid-cols-2 gap-4">
              <CitySearch onSelect={handleSelect} />
            </div>

            {/* Preview card — shown after a city is selected */}
            {pending && (
              <div className="flex items-center justify-between bg-amber-500/8 border border-amber-500/20 rounded-lg px-4 py-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-medium text-sm text-white">{pending.city}</span>
                    <span className="text-white/50 text-sm ml-2">{pending.country}</span>
                  </div>
                  <span className="text-xs text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {pending.continent}
                  </span>
                  <span className="text-xs text-white/25">
                    {pending.lat.toFixed(4)}, {pending.lng.toFixed(4)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {formError && <p className="text-red-400 text-sm">{formError}</p>}

            <button
              type="submit"
              disabled={createMutation.isPending || !pending}
              data-testid="button-add-location"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? "Adding…" : "Add to Travel Log"}
            </button>
          </form>
        </section>

        {/* Location list */}
        <section>
          <h2
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            All Locations
            {locations && (
              <span className="text-white/40 text-sm font-normal ml-2">
                ({locations.length})
              </span>
            )}
          </h2>

          {isLoading ? (
            <p className="text-white/40 text-sm">Loading…</p>
          ) : locations?.length === 0 ? (
            <p className="text-white/30 text-sm">No locations yet — add some above.</p>
          ) : (
            <div className="space-y-1">
              {locations?.map((loc) => (
                <div
                  key={loc.id}
                  data-testid={`row-location-${loc.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="font-medium text-sm">{loc.city}</span>
                      <span className="text-white/40 text-sm ml-2">{loc.country}</span>
                    </div>
                    <span className="text-xs text-amber-500/60 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {loc.continent}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${loc.id}`}
                    className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-xs transition-all disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
