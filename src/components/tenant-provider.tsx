"use client";

import { createContext, useContext, type ReactNode, useMemo } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getAllSports } from "@/lib/sports";

interface TenantContextType {
  tenantId: string;
  tenant: {
    name: string;
    slug?: string;
    plan: string;
  };
  currentSportId: string | null;
  enabledSports: string[];
  isFreePlan: boolean;
  setCurrentSport: (sportId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function useTenant(): TenantContextType {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return ctx;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth({ ensureSignedIn: true });
  const router = useRouter();

  const userId = (!authLoading && user) ? user.id : undefined;
  const tenants = useQuery(
    api.tenants.getUserTenants,
    userId ? { userId } : "skip"
  );
  
  const firstTenant = tenants?.[0] as any;
  const tenantId = firstTenant?.tenantId;
  
  const tenantData = useQuery(
    api.tenants.getByTenantId as any,
    tenantId ? { tenantId } : "skip"
  ) as any;
  
  const setCurrentSportMutation = useMutation(api.tenants.setCurrentSport);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tenants === undefined || tenantData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tenants.length === 0) {
    router.replace("/app/onboarding");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const plan = tenantData?.subscription?.tier ?? "free";
  const isFreePlan = plan === "free";
  const settings = tenantData?.settings || {};
  const enabledSportsMap = (settings.enabledSports || {}) as Record<string, boolean>;
  const enabledSports = Object.keys(enabledSportsMap).filter(key => enabledSportsMap[key]);
  const currentSportId = settings.currentSportId || enabledSports[0] || null;

  const handleSetCurrentSport = async (sportId: string) => {
    if (!tenantId) return;
    await setCurrentSportMutation({ tenantId, sportId });
  };

  const value: TenantContextType = {
    tenantId: firstTenant.tenantId,
    tenant: {
      name: firstTenant.name ?? "My Organization",
      slug: firstTenant.slug,
      plan,
    },
    currentSportId,
    enabledSports,
    isFreePlan,
    setCurrentSport: handleSetCurrentSport,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}
