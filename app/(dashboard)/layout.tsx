import { ProtectedRoute } from '@/components/protected-route';
import { AppSidebar } from '@/components/app-sidebar';
import { TopHeader } from '@/components/top-header';
import { SidebarProvider } from '@/contexts/sidebar-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopHeader />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
