"use client";

import { ReactNode } from "react";
import { QRCode } from "./QRCode";

interface PrintLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  tournamentName?: string;
  qrUrl?: string;
  showQR?: boolean;
  className?: string;
}

export function PrintLayout({
  children,
  title,
  subtitle,
  tournamentName,
  qrUrl,
  showQR = true,
  className = "",
}: PrintLayoutProps) {
  const currentDate = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`print-container ${className}`}>
      {/* Header */}
      <header className="print-header border-b-2 border-black pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {tournamentName && (
              <p className="text-sm text-gray-600 mb-1">{tournamentName}</p>
            )}
            <h1 className="text-3xl font-bold text-black">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {showQR && qrUrl && (
            <div className="print-qr">
              <QRCode url={qrUrl} size={80} showLabel={false} />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="print-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="print-footer border-t border-gray-300 pt-4 mt-6 flex items-center justify-between text-xs text-gray-600">
        <div>
          <p>Printed: {currentDate}</p>
          {qrUrl && <p className="text-gray-500 mt-1">Scan QR code for live updates</p>}
        </div>
        {qrUrl && (
          <div className="text-right">
            <p className="font-mono text-xs break-all max-w-xs">{qrUrl}</p>
          </div>
        )}
      </footer>
    </div>
  );
}
