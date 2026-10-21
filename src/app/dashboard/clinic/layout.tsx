import type { Metadata } from "next";
import { AuthProvider, LocationsProvider } from "@/components/dashboard/providers";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: {
    default: "Clinic Dashboard",
    template: "%s | Clinic Dashboard",
  },
};

export default function ClinicDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LocationsProvider>
        <DashboardShell>{children}</DashboardShell>
      </LocationsProvider>
    </AuthProvider>
  );
}
