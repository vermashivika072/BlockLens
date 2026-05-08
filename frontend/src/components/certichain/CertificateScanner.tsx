"use client";

import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Download,
  FileScan,
  Link2,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { TrustGauge } from "./TrustGauge";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const statusMessages = [
  "Initializing Scanner...",
  "Reading OCR...",
  "Checking Pixel Consistency...",
  "Cross-referencing Blockchain Ledger...",
  "Finalizing Security Audit...",
];

const logs = [
  "Initializing Blockchain Node...",
  "Engaging Computer Vision AI Models...",
  "Extracting Metadata via Neural OCR...",
  "Locating QR Matrix and Steganographic Data...",
  "Analyzing URL for Phishing Vectors...",
  "Verifying Digital Signature against Ledger...",
  "Running QR Phishing Shield Audit...",
  "Cross-referencing Global Threat Intelligence...",
  "Finalizing Forensic Security Audit...",
];

type UploadResponse = {
  certificate_id: string;
  blockchain_hash: string;
  qr_code_url: string;
  verification_status: "real" | "fake" | "suspicious";
  authenticity_score: number;
  fraud_probability: number;
};

type VerificationResponse = {
  certificate_id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string | null;
  verification_status: "real" | "fake" | "suspicious";
  authenticity_score: number;
  fraud_probability: number;
  blockchain_hash: string;
  blockchain_valid: boolean;
  qr_code_url: string;
  qr_safety: {
    is_safe: boolean;
    risk_score: number;
    reasons: string[];
    url: string;
    can_navigate: boolean;
  };
  zkp_proof: {
    proof: string;
    proof_type: string;
    verifiable_claim: string;
  };
  original_image_url: string;
  ela_heatmap_url: string;
  extracted_text: string;
  analysis_summary: string[];
  forensic_category?: string;
  forensic_report?: Record<string, any>;
};

function buildAbsoluteUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path}`;
}

export function CertificateScanner() {
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [datasetTag, setDatasetTag] = useState("real");

  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [scanStarted, setScanStarted] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(0);
  const [slider, setSlider] = useState(54);
  const [score, setScore] = useState(0);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [tamperCoords, setTamperCoords] = useState<{ x: string; y: string }[]>(
    [],
  );

  const [error, setError] = useState("");
  const [certificateId, setCertificateId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "real" | "fake" | "suspicious" | ""
  >("");
  const [fraudProbability, setFraudProbability] = useState(0);
  const [blockchainHash, setBlockchainHash] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [elaHeatmapUrl, setElaHeatmapUrl] = useState<string | null>(null);
  const [qrSafetyUrl, setQrSafetyUrl] = useState("");
  const [analysisSummary, setAnalysisSummary] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [forensicCategory, setForensicCategory] = useState("");
  const [forensicReport, setForensicReport] = useState<Record<string, any>>({});
  const [scanId, setScanId] = useState(0);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();

    if (
      typeof window !== "undefined" &&
      window.speechSynthesis.onvoiceschanged !== undefined
    ) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!scanStarted) return;

    const logInterval = window.setInterval(() => {
      setCurrentLogs((prev) => {
        if (prev.length < logs.length) {
          return [...prev, logs[prev.length]];
        }
        return prev;
      });
    }, 800);

    const stepInterval = window.setInterval(() => {
      setStep((current) => {
        if (current >= statusMessages.length - 1) {
          window.clearInterval(stepInterval);
          return current;
        }
        return current + 1;
      });
    }, 1200);

    return () => {
      window.clearInterval(stepInterval);
      window.clearInterval(logInterval);
    };
  }, [scanStarted, scanId]);

  useEffect(() => {
    if (!scanStarted || scanComplete || isUploading) return;
    if (step !== statusMessages.length - 1) return;
    if (!verificationStatus) return;

    const spokenMessage =
      verificationStatus === "real"
        ? "This certificate is verified and appears authentic."
        : verificationStatus === "fake"
          ? "Warning. This certificate appears to be fake."
          : "This certificate is suspicious and needs manual review.";

    speak(spokenMessage);
    setScanComplete(true);
  }, [scanStarted, scanComplete, isUploading, step, verificationStatus]);

  useEffect(() => {
    if (scanComplete && verificationStatus === "real" && qrSafetyUrl && qrSafetyUrl.startsWith('http')) {
      const isInternal = qrSafetyUrl.includes(`${API_BASE}/verify`) || qrSafetyUrl.includes('localhost:3000/verify');
      if (!isInternal) {
        pushLog("[SECURITY] QR URL Verified. Authorized for redirection in 15s...");
        pushLog(`[REDIRECT] Moving to official institution: ${new URL(qrSafetyUrl).hostname}`);
        const timer = setTimeout(() => {
          window.location.assign(qrSafetyUrl);
        }, 15000); // 15 seconds delay
        return () => clearTimeout(timer);
      } else {
        pushLog("[SECURITY] Internal verification link detected. Staying on platform.");
      }
    }
  }, [scanComplete, verificationStatus, qrSafetyUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const preferredVoice = voices.find((voice) => {
      const lower = voice.name.toLowerCase();
      return (
        lower.includes("female") ||
        lower.includes("google uk english") ||
        lower.includes("google us english") ||
        lower.includes("zira") ||
        lower.includes("samantha") ||
        lower.includes("victoria")
      );
    });

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else {
      utterance.pitch = 1.2;
    }

    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const pushLog = (message: string) => {
    setCurrentLogs((prev) => [...prev, message]);
  };

  const resetResultState = () => {
    setError("");
    setCertificateId("");
    setVerificationStatus("");
    setFraudProbability(0);
    setBlockchainHash("");
    setOriginalImageUrl(null);
    setElaHeatmapUrl(null);
    setQrSafetyUrl("");
    setAnalysisSummary([]);
    setExtractedText("");
    setForensicCategory("");
    setForensicReport({});
  };

  async function start(file?: File) {
    if (!file) return;

    const token = localStorage.getItem("certichain.jwt");
    if (!token) {
      setError("Please login first before scanning a certificate.");
      return;
    }

    resetResultState();
    setFileName(file.name);
    setScanStarted(true);
    setScanId(prev => prev + 1);
    setScanComplete(false);
    setIsUploading(true);
    setStep(0);
    setScore(0);
    setCurrentLogs([]);

    const points = Array.from({
      length: Math.floor(Math.random() * 2) + 1,
    }).map(() => ({
      x: `${Math.floor(Math.random() * 20) + 40}%`,
      y: `${Math.floor(Math.random() * 30) + 35}%`,
    }));
    setTamperCoords(points);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    try {
      pushLog("Uploading certificate to secure verification server...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name || "Unknown Candidate");
      formData.append("issuer", issuer || "Unknown Issuer");
      formData.append("issue_date", issueDate || new Date().toISOString().split("T")[0]);
      if (expiryDate) {
        formData.append("expiry_date", expiryDate);
      }
      formData.append("dataset_tag", datasetTag);

      const uploadResponse = await fetch(`${API_BASE}/upload-certificate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = (await uploadResponse.json()) as
        | UploadResponse
        | { detail?: string };

      if (!uploadResponse.ok) {
        let errMsg = "Upload failed.";
        if (uploadData.detail) {
          errMsg = Array.isArray(uploadData.detail) 
            ? uploadData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ") 
            : typeof uploadData.detail === 'string' ? uploadData.detail : JSON.stringify(uploadData.detail);
        }
        throw new Error(errMsg);
      }

      const uploadResult = uploadData as UploadResponse;
      setCertificateId(uploadResult.certificate_id);
      setScore(Math.round(uploadResult.authenticity_score * 100));
      setVerificationStatus(uploadResult.verification_status);
      setFraudProbability(Math.round(uploadResult.fraud_probability * 100));
      pushLog(`[SUCCESS] Certificate uploaded: ${uploadResult.certificate_id}`);

      const verifyResponse = await fetch(
        `${API_BASE}/verify/${uploadResult.certificate_id}`,
      );
      const verifyData = (await verifyResponse.json()) as
        | VerificationResponse
        | { detail?: string };

      if (!verifyResponse.ok) {
        let errMsg = "Verification fetch failed.";
        if (verifyData.detail) {
          errMsg = Array.isArray(verifyData.detail) 
            ? verifyData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ") 
            : typeof verifyData.detail === 'string' ? verifyData.detail : JSON.stringify(verifyData.detail);
        }
        throw new Error(errMsg);
      }

      const verification = verifyData as VerificationResponse;
      setScore(Math.round(verification.authenticity_score * 100));
      setVerificationStatus(verification.verification_status);
      setFraudProbability(Math.round(verification.fraud_probability * 100));
      setBlockchainHash(verification.blockchain_hash);
      setOriginalImageUrl(buildAbsoluteUrl(verification.original_image_url));
      setElaHeatmapUrl(buildAbsoluteUrl(verification.ela_heatmap_url));
      setQrSafetyUrl(verification.qr_safety?.url || "");
      setAnalysisSummary(verification.analysis_summary || []);
      setExtractedText(verification.extracted_text || "");
      setForensicCategory(verification.forensic_category || "");
      setForensicReport(verification.forensic_report || {});
      
      // Auto-populate the UI fields with the details from the database
      setName(verification.name || "");
      setIssuer(verification.issuer || "");
      setIssueDate(verification.issue_date || "");
      setExpiryDate(verification.expiry_date || "");
      setDatasetTag(verification.verification_status === "real" ? "real" : "fake");

      pushLog(
        `[SUCCESS] Verification complete. Status: ${verification.verification_status.toUpperCase()}`,
      );
      pushLog(
        `[SUCCESS] Blockchain integrity: ${verification.blockchain_valid ? "VALID" : "INVALID"}`,
      );
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong during scanning.";
      setError(message);
      setVerificationStatus("fake");
      setScore(0);
      pushLog(`[ERROR] ${message}`);
    } finally {
      setIsUploading(false);
    }
  }

  const downloadReport = () => {
    if (!certificateId) {
      alert("Verification is not complete yet.");
      return;
    }
    const link = document.createElement("a");
    link.href = `${API_BASE}/report/${certificateId}`;
    link.download = `certichain_report_${certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareLink = async () => {
    const shareableUrl = certificateId
      ? `${API_BASE}/verify/${certificateId}`
      : qrSafetyUrl;

    if (!shareableUrl) {
      alert("Verification link is not available yet.");
      return;
    }

    await navigator.clipboard.writeText(shareableUrl);
    alert("Verification link copied to clipboard!");
  };

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    void start(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDrag(false);
    void start(event.dataTransfer.files[0]);
  }

  const previewSource = originalImageUrl || previewUrl;
  const heatmapSource = elaHeatmapUrl || previewUrl;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-10">

      {error ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          className={`glass relative cursor-pointer overflow-hidden rounded-3xl p-8 transition ${
            drag ? "neon-border shadow-[0_0_50px_oklch(0.78_0.18_200/0.35)]" : ""
          }`}
        >
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFile}
            className="sr-only"
          />
          <div className="grid min-h-72 place-items-center rounded-2xl border-2 border-dashed border-border/70 p-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] glow">
              <UploadCloud className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="mt-5 font-display text-3xl font-bold">
                Upload certificate to scan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag PDF/image. QR inside certificate will be scanned automatically.
              </p>
              <p className="mt-4 font-mono text-xs text-[oklch(0.78_0.18_200)]">
                {fileName || "Awaiting certificate..."}
              </p>
            </div>
          </div>
        </label>

        <div className="glass relative overflow-hidden rounded-3xl p-6">
          <div className="noise absolute inset-0" />
          <div className="relative min-h-80 rounded-2xl border border-[oklch(0.78_0.18_200)]/30 bg-black/30 p-5">
            <div className="absolute left-4 top-4 h-10 w-10 border-l-2 border-t-2 border-[oklch(0.78_0.18_200)]" />
            <div className="absolute right-4 top-4 h-10 w-10 border-r-2 border-t-2 border-[oklch(0.78_0.18_200)]" />
            <div className="absolute bottom-4 left-4 h-10 w-10 border-b-2 border-l-2 border-[oklch(0.78_0.18_200)]" />
            <div className="absolute bottom-4 right-4 h-10 w-10 border-b-2 border-r-2 border-[oklch(0.78_0.18_200)]" />

            <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-[oklch(0.78_0.18_200)]/30 bg-black/40 p-4">
              {scanStarted && !scanComplete ? (
                <motion.div
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 z-[100] h-1.5 bg-[oklch(0.78_0.18_200)] shadow-[0_0_40px_4px_oklch(0.78_0.18_200)]"
                />
              ) : null}

              {previewSource ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={previewSource}
                    alt="Certificate Preview"
                    className="relative z-10 max-h-full max-w-full object-contain shadow-2xl"
                  />
                  {scanStarted && !scanComplete ? (
                    <div className="pointer-events-none absolute inset-0 z-30 bg-[oklch(0.78_0.18_200)]/10" />
                  ) : null}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  {isUploading ? (
                    <LoaderCircle className="h-14 w-14 animate-spin text-[oklch(0.78_0.18_200)]" />
                  ) : (
                    <FileScan className="h-14 w-14 animate-glow-pulse text-[oklch(0.78_0.18_200)]" />
                  )}
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {isUploading ? "Uploading to backend" : "System Ready"}
                  </p>
                </div>
              )}
            </div>

            <p className="relative z-10 mt-4 text-center font-mono text-sm uppercase tracking-widest text-muted-foreground drop-shadow-lg">
              {scanStarted ? statusMessages[step] : "Scanner standby"}
            </p>
          </div>
        </div>
      </div>

      {scanStarted ? (
        <div
          className={`mt-6 grid gap-6 transition-all duration-1000 ${
            scanComplete ? "lg:grid-cols-[0.9fr_1.1fr]" : "grid-cols-1"
          }`}
        >
          <div className="glass h-fit rounded-3xl p-6 transition-all duration-700">
            <h3 className="font-display text-xl font-semibold">Live Terminal</h3>
            <div className="mt-4 space-y-3 rounded-2xl bg-black/50 p-4 font-mono text-xs text-[oklch(0.78_0.18_200)]">
              {currentLogs.map((log, index) => (
                <motion.p
                  key={`${log}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  &gt; {log}
                </motion.p>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {scanComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass rounded-3xl p-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      Trust Score
                    </h3>
                    <TrustGauge score={score} />
                    <div className="mt-4 rounded-2xl border border-border bg-white/5 p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-cyan-300" />
                        <span className="font-semibold uppercase tracking-wide">
                          {verificationStatus || "pending"}
                        </span>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        Fraud probability: {fraudProbability}%
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        Forensic: {forensicCategory || "Analyzing..."}
                      </div>
                      <p className="mt-3 break-all text-xs text-muted-foreground">
                        ID: {certificateId || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      Tamper Heatmap
                    </h3>
                    <div className="relative mt-4 h-48 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-slate-900 to-slate-800">
                      {heatmapSource ? (
                        <img
                          src={heatmapSource}
                          alt="ELA Heatmap"
                          className="h-full w-full object-contain p-4"
                        />
                      ) : null}

                      <div className="absolute inset-4 rounded-xl border border-white/10" />
                      
                      {qrSafetyUrl && !qrSafetyUrl.includes(`${API_BASE}/verify`) && verificationStatus === "real" ? (
                        <div className="absolute bottom-5 right-5 z-40 flex flex-col items-end gap-2">
                          <a 
                            href={qrSafetyUrl.startsWith('http') ? qrSafetyUrl : `https://${qrSafetyUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-xl transition hover:bg-cyan-500/40 animate-pulse"
                          >
                            <Link2 className="h-3 w-3" />
                            Visit Official Site
                          </a>
                          <QrCode className="h-8 w-8 text-cyan-300" />
                        </div>
                      ) : (
                        <QrCode className="absolute bottom-5 right-5 h-10 w-10 text-[oklch(0.78_0.18_200)]" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-display text-xl font-semibold">
                    Original vs ELA Heatmap
                  </h3>

                  <div className="relative mt-4 h-64 overflow-hidden rounded-2xl border border-border bg-slate-950">
                    {previewSource ? (
                      <div className="relative h-full w-full">
                        <img
                          src={previewSource}
                          className="absolute inset-0 h-full w-full object-contain p-2"
                          alt="Original"
                        />

                        {heatmapSource ? (
                          <div
                            className="absolute inset-0 h-full w-full overflow-hidden"
                            style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
                          >
                            <img
                              src={heatmapSource}
                              className="h-full w-full object-contain p-2"
                              alt="ELA Analysis"
                            />
                          </div>
                        ) : null}

                        <div
                          className="pointer-events-none absolute inset-y-0 z-20 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                          style={{ left: `${slider}%` }}
                        >
                          <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl">
                            <div className="flex gap-0.5">
                              <div className="h-3 w-0.5 rounded-full bg-slate-400" />
                              <div className="h-3 w-0.5 rounded-full bg-slate-400" />
                            </div>
                          </div>
                        </div>

                        <div className="absolute left-4 top-4 z-10 rounded-md bg-black/50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                          AI Forensic Mode
                        </div>
                        <div className="absolute right-4 top-4 z-10 rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                          Original
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-950" />
                    )}

                    <input
                      aria-label="Compare original and ELA"
                      type="range"
                      min="0"
                      max="100"
                      value={slider}
                      onChange={(event) => setSlider(Number(event.target.value))}
                      className="absolute inset-x-6 bottom-4 z-30 cursor-pointer accent-[oklch(0.78_0.18_200)]"
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-white/5 p-4">
                    <h4 className="font-semibold">AI Summary</h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {(analysisSummary.length ? analysisSummary : ["No analysis summary available."]).map(
                        (item, index) => (
                          <li key={`${item}-${index}`}>• {item}</li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-border bg-white/5 p-4">
                    <h4 className="font-semibold">Extracted OCR Text</h4>
                    <p className="mt-3 max-h-32 overflow-auto text-sm text-muted-foreground">
                      {extractedText || "No OCR text available."}
                    </p>
                  </div>
                </div>

                {forensicReport && Object.keys(forensicReport).length > 0 && (
                  <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                    <h4 className="flex items-center gap-2 font-semibold text-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      Forensic Audit Deep Scan
                    </h4>
                    <div className="mt-3 grid gap-4 text-xs sm:grid-cols-3">
                      <div className="rounded-xl bg-black/40 p-3">
                        <span className="block text-muted-foreground">ELA Analysis</span>
                        <span className="mt-1 block font-bold text-cyan-300">{forensicReport.ela_detection}</span>
                      </div>
                      <div className="rounded-xl bg-black/40 p-3">
                        <span className="block text-muted-foreground">Noise Patterns</span>
                        <span className="mt-1 block font-bold text-cyan-300">{forensicReport.noise_inconsistency}</span>
                      </div>
                      <div className="rounded-xl bg-black/40 p-3">
                        <span className="block text-muted-foreground">Edge Artifacts</span>
                        <span className="mt-1 block font-bold text-cyan-300">{forensicReport.edge_artifacts}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={downloadReport}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-105 active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    Download Verified Report
                  </button>

                  <button
                    onClick={shareLink}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10 active:scale-95"
                  >
                    <Link2 className="h-4 w-4" />
                    Share Verification Link
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}
