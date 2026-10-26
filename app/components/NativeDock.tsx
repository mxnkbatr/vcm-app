"use client";

import React from "react";
import DetailDock from "@/app/components/DetailDock";

type NativeDockProps = {
  visible?: boolean;
  price?: string | number;
  priceLabel?: string;
  children: React.ReactNode;
};

/** @deprecated Prefer DetailDock — kept as thin wrapper for older call sites. */
export default function NativeDock({
  visible = true,
  price,
  priceLabel,
  children,
}: NativeDockProps) {
  return (
    <DetailDock
      visible={visible}
      leading={
        price != null ? (
          <>
            <span className="detail-dock__price">₮{Number(price).toLocaleString()}</span>
            {priceLabel ? <span className="detail-dock__price-sub">{priceLabel}</span> : null}
          </>
        ) : undefined
      }
    >
      {children}
    </DetailDock>
  );
}
