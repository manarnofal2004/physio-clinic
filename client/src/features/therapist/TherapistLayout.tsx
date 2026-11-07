import { PanelLayout } from "@/components/layout/PanelLayout";
import { useAuth } from "@/features/auth/useAuth";
import { therapistNavItems } from "./therapistNavItems";

// The shared panel shell, with only the pages this therapist may open.
export const TherapistLayout = () => {
  const { user } = useAuth();
  const navItems = therapistNavItems.filter(
    (item) => !item.privilege || user?.privileges.includes(item.privilege),
  );

  return <PanelLayout navItems={navItems} />;
};
