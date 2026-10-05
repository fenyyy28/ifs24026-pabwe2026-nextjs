import AuthLayout from "@/features/auth/layouts/AuthLayout";

interface AuthRouteLayoutProps {
  children: React.ReactNode;
}

export default function AuthRouteLayout({
  children,
}: AuthRouteLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}