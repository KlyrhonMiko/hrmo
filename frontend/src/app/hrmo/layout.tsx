import { RoleLayout } from "@/components/layout/RoleLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function HRMOLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard allowedRoles={["admin", "hr"]}>
            <RoleLayout userRole="HR Head">{children}</RoleLayout>
        </AuthGuard>
    );
}
