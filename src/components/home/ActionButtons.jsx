import React from "react";

export default function ActionButtons({ onDeposit, onWithdraw, onHistory, onSupport, t }) {
  const buttons = [
    {
      label: t("deposit"),
      bg: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/959dbe27e_aae6f748e_eb2c8d4e6e5b384e09e4e7c87d6043a39d17f26f.png",
      color: "#ddd2ef",
      onClick: onDeposit,
    },
    {
      label: t("withdraw"),
      bg: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/7b49e88ac_53b9467de_aed3384a6b74fec41040a27f65aeda359774b582.png",
      color: "#f3dabb",
      onClick: onWithdraw,
    },
    {
      label: t("history"),
      bg: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/2cdbe2998_54e015fbd_22321ceea9ad484c383e07ad84cc52ef48d08a91.png",
      color: "#f3d8bc",
      onClick: onHistory,
    },
    {
      label: t("support"),
      bg: "https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/c1504c4b7_7f09c48e9_bc57ebbbcfcd5c80380def67ce2e84e13d56831b.png",
      color: "#dacfed",
      onClick: onSupport,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-x-[27px] gap-y-[20px] px-4 mt-[27px] shrink-0">
      {buttons.map((b, i) => (
        <button
          key={i}
          onClick={b.onClick}
          className="relative w-full h-[51px] rounded-lg overflow-clip flex items-center justify-center hover:opacity-90 active:scale-95 transition-transform"
        >
          <img src={b.bg} alt={b.label} className="absolute inset-0 w-full h-full object-cover" />
          <span className="relative z-10 text-figma-12 font-normal font-paragraph leading-figma-17" style={{ color: b.color }}>
            {b.label}
          </span>
        </button>
      ))}
    </div>
  );
}