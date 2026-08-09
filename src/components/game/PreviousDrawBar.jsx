import React from "react";
import Ball from "./Ball";
import { computeDrawLabels } from "./gameConfig";

export default function PreviousDrawBar({ period, balance, drawn, threshold }) {
  const labels = computeDrawLabels(drawn, threshold);
  return (
    <section className="relative z-10 w-full px-[7px] pt-[15px] pb-[10px] flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <p className="text-figma-22 font-normal font-figma-inter leading-figma-27 text-[#b45258]">
          {period} Giai đoạn
        </p>
        <div className="flex flex-col items-end pr-2">
          <img
            className="w-[38px] h-[39px] object-cover"
            src="https://media.base44.com/images/public/6a729d033f9d0f63f381a6c6/61bd41edb_16534cf22_4090fb356802fb395fda9d50716e30c847944e93.png"
            alt="Coins"
          />
          <p className="text-figma-23 font-normal font-figma-inter leading-figma-23 text-[#bd5e63] mt-1">
            {Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-[7px] pl-[4px] -mt-6 flex-wrap">
        {(drawn || []).map((n, i) => (
          <Ball key={i} number={n} size={36} />
        ))}
      </div>

      <div className="flex items-center pl-[2px] mt-1 gap-2 flex-wrap">
        <p className="text-figma-21 font-normal font-figma-roboto-flex leading-figma-29 text-figma-text-6-5 mr-2">Tổng</p>
        <div className="bg-[#e4b060] rounded-[15px] shadow-[inset_0_0_0_1px_#e9b063] w-[31px] min-h-[31px] flex items-center justify-center">
          <p className="text-figma-23 font-normal font-figma-istok-web leading-figma-20 text-[#c04a2d]">{labels.sum}</p>
        </div>
        <p className="text-figma-21 font-normal font-figma-inter leading-figma-23 text-[#e39662]">{labels.big}</p>
        <p className="text-figma-23 font-normal font-figma-inter leading-figma-23 text-[#e29561]">{labels.parity}</p>
      </div>
    </section>
  );
}