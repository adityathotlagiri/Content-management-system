/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";

export type CMSRole = "admin" | "instructor" | "viewer";

interface CMSAuthContextValue {
  role: CMSRole;
  setRole: (role: CMSRole) => void; 
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

const CMSAuthContext = createContext<CMSAuthContextValue | undefined>(undefined);

function getPermissions(role: CMSRole) {
  switch (role) {
    case "admin":
      return { canCreate: true, canEdit: true, canDelete: true, canPublish: true };
    case "instructor":
      return { canCreate: true, canEdit: true, canDelete: true, canPublish: true };
    case "viewer":
      return { canCreate: false, canEdit: false, canDelete: false, canPublish: false };
  }
}

export function CMSAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<CMSRole>("instructor");
  const permissions = getPermissions(role);

  return (
    <CMSAuthContext.Provider value={{ role, setRole, ...permissions }}>
      {children}
    </CMSAuthContext.Provider>
  );
}

export function useCMSAuth(): CMSAuthContextValue {
  const context = useContext(CMSAuthContext);
  if (!context) {
    throw new Error("useCMSAuth must be used within a CMSAuthProvider");
  }
  return context;
}