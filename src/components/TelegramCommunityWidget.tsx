import React, { useState } from "react";
import { TelegramIcon } from "./icons/TelegramIcon";
import { MessageCircle, X } from "lucide-react";

export const TELEGRAM_COMMUNITY_URL = "https://t.me/+2ZkLgrmVJgBkMGM1";

export const TelegramCommunityWidget: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Tooltip badge */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-xl bg-card border border-border shadow-lg text-xs font-medium text-foreground animate-fade-in transition-all duration-300 group-hover:shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span>Tham gia Group Telegram cộng đồng</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-muted-foreground hover:text-foreground ml-1 p-0.5 rounded-full hover:bg-muted transition-colors"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={TELEGRAM_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-13 h-13 rounded-full bg-[#229ED9] text-white shadow-lg hover:shadow-[#229ED9]/50 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#229ED9]/30"
        aria-label="Tham gia Group Telegram cộng đồng Salemylink"
        title="Group Telegram (Cộng đồng)"
      >
        {/* Pulse effect */}
        <span className="absolute -inset-1 rounded-full bg-[#229ED9] opacity-30 animate-pulse group-hover:opacity-50"></span>
        <TelegramIcon className="w-7 h-7 relative z-10 text-white" />
      </a>
    </div>
  );
};
