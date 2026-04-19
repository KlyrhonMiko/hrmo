import { RoleLayout } from "@/components/layout/RoleLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function HRRecordAsstLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard allowedRoles={["hr-assistant"]}>
            <RoleLayout userRole="HR Record Asst">{children}</RoleLayout>
        </AuthGuard>
    );
}
