import React from "react";
import { TelegramIcon } from "./icons/TelegramIcon";

export const TELEGRAM_COMMUNITY_URL = "https://t.me/+2ZkLgrmVJgBkMGM1";

export const TelegramCommunityWidget: React.FC = () => {
  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
      <a
        href={TELEGRAM_COMMUNITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center size-12 rounded-full bg-[#229ED9] text-white shadow-[var(--shadow-popover)] hover:bg-[#1b8ec5] active:scale-95 transition-colors duration-200 outline-hidden"
        aria-label="Tham gia Group Telegram cộng đồng Salemylink"
        title="Group Telegram (Cộng đồng)"
      >
        <TelegramIcon className="w-6 h-6 text-white" />
      </a>
    </div>
  );
};
