import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/features/auth/useAuth";
import { therapistNavItems } from "./therapistNavItems";

// The same shell as the admin panel, with only the pages this therapist may open.
export const TherapistLayout = () => {
  const { user } = useAuth();
  const navItems = therapistNavItems.filter(
    (item) => !item.privilege || user?.privileges.includes(item.privilege),
  );

  return <AdminLayout navItems={navItems} />;
};
