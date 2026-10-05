import PostLayout from "@/features/posts/layouts/PostLayout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <PostLayout>{children}</PostLayout>;
}