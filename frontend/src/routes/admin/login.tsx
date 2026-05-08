import { LoginExperience } from "@/components/certichain/LoginExperience";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginExperience isAdmin={true} />
    </Suspense>
  );
}
