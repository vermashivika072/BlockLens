"use client";

import { Suspense } from "react";
import { LoginExperience } from "@/components/certichain/LoginExperience";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginExperience isAdmin={true} />
    </Suspense>
  );
}
