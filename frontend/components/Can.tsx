import { useCan } from "../hooks/useCan";

interface CanProps {
  permissions?: string[];
  roles?: string[];
}

export const Can: React.FC<CanProps> = ({ permissions, roles, children }) => {
  const userCanSeeComponent = useCan({
    permissions,
    roles
  });

  if (!userCanSeeComponent) {
    return null;
  }

  return (
    <>
      {children}
    </>
  );
}