import { RoleLayout } from "@/components/layout/RoleLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard allowedRoles={["employee"]}>
            <RoleLayout userRole="Employee">{children}</RoleLayout>
        </AuthGuard>
    );
}
