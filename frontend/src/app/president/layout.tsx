import { RoleLayout } from "@/components/layout/RoleLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function PresidentLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard allowedRoles={["president"]}>
            <RoleLayout userRole="President" readOnly>{children}</RoleLayout>
        </AuthGuard>
    );
}
