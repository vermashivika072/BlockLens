"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CertificateScanner } from "@/components/certichain/CertificateScanner";
import { Layout, PageHeader } from "@/components/certichain/Layout";
import { isAuthenticated } from "@/lib/auth";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/scan");
    }
  }, [router]);

  return (
    <Layout>
      <PageHeader
        eyebrow="AI Scanner"
        title="Certificate scanner with QR and tamper detection."
        subtitle="Upload the full certificate. If it contains a QR, the scanner validates URL safety automatically."
      />
      <section className="mt-12">
        <CertificateScanner />
      </section>
    </Layout>
  );
}
