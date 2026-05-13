export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="h-full animate-page-fade-in">{children}</div>;
}
