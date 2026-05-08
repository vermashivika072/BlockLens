import { LoginExperience } from "@/components/certichain/LoginExperience";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginExperience isAdmin={false} />
    </Suspense>
  );
}
