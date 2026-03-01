"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function QRCode({ 
  url, 
  size = 128, 
  className = "",
  showLabel = true,
  label
}: QRCodeProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="bg-white p-2 rounded">
        <QRCodeSVG
          value={url}
          size={size}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"M"}
          includeMargin={false}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-center text-muted-foreground max-w-[128px] break-words">
          {label || url}
        </p>
      )}
    </div>
  );
}
