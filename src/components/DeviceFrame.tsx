import React from "react";

type DeviceType = "iphone" | "ipad" | "macbook";

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  dropShadow?: number;
  innerGlow?: number;
}

const deviceConfigs: Record<DeviceType, { screenW: number; screenH: number; label: string }> = {
  iphone: { screenW: 280, screenH: 607, label: "iPhone 15 Pro" },
  ipad: { screenW: 512, screenH: 683, label: "iPad Pro" },
  macbook: { screenW: 640, screenH: 400, label: "MacBook Pro" },
};

const ScreenContent: React.FC<{ image: string | null }> = ({ image }) =>
  image ? (
    <img src={image} alt="Mockup" className="relative w-full h-full object-cover" />
  ) : (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/30">
      <span className="text-muted-foreground text-xs">Upload an image</span>
    </div>
  );

const InnerGlowOverlay: React.FC<{ innerGlow: number; radius?: string }> = ({ innerGlow, radius }) =>
  innerGlow > 0 ? (
    <div
      className="absolute inset-0 z-20 pointer-events-none"
      style={{
        borderRadius: radius,
        boxShadow: `inset 0 0 ${innerGlow * 1.2}px ${innerGlow * 0.4}px rgba(255,255,255,${0.04 + innerGlow * 0.004})`,
      }}
    />
  ) : null;

/* ─────────────────────── iPhone 15 Pro ─────────────────────── */
const IPhoneFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 310,
      height: 640,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.15 + dropShadow * 0.006}))` : undefined,
    }}
  >
    {/* Titanium outer shell */}
    <div className="absolute inset-0 rounded-[48px] overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(160deg, #3e3e42 0%, #2c2c30 12%, #232327 40%, #1e1e22 60%, #28282c 88%, #343438 100%)",
      }} />
      {/* Titanium micro-texture */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.008) 0px, transparent 1px, transparent 2px)",
      }} />
      {/* Top chamfer highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[48px]" style={{
        background: "linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.18) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.18) 75%, transparent 92%)",
      }} />
      {/* Bottom chamfer */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] rounded-b-[48px]" style={{
        background: "linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 70%, transparent 92%)",
      }} />
      {/* Left edge light */}
      <div className="absolute inset-y-0 left-0 w-[2px]" style={{
        background: "linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.1) 15%, rgba(255,255,255,0.06) 85%, transparent 95%)",
      }} />
      {/* Right edge shadow */}
      <div className="absolute inset-y-0 right-0 w-[1px]" style={{
        background: "linear-gradient(180deg, transparent 5%, rgba(0,0,0,0.2) 15%, rgba(0,0,0,0.15) 85%, transparent 95%)",
      }} />
      {/* Ambient reflection */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.06) 0%, transparent 45%)",
      }} />
    </div>

    {/* Antenna lines */}
    <div className="absolute top-[90px] left-0 w-full h-[0.5px]" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 15%, transparent 20%, transparent 80%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0.3) 100%)" }} />
    <div className="absolute bottom-[90px] left-0 w-full h-[0.5px]" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 15%, transparent 20%, transparent 80%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0.3) 100%)" }} />

    {/* Side buttons – titanium finish */}
    <div className="absolute -left-[3px] top-[118px] w-[3.5px] h-[30px] rounded-l-[2px]" style={{
      background: "linear-gradient(180deg, #4a4a4e 0%, #3a3a3e 50%, #333337 100%)",
      boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.15), inset 0 -0.5px 0 rgba(0,0,0,0.3), -1px 0 2px rgba(0,0,0,0.2)",
    }} />
    <div className="absolute -left-[3px] top-[168px] w-[3.5px] h-[54px] rounded-l-[2px]" style={{
      background: "linear-gradient(180deg, #4a4a4e 0%, #3a3a3e 50%, #333337 100%)",
      boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.15), inset 0 -0.5px 0 rgba(0,0,0,0.3), -1px 0 2px rgba(0,0,0,0.2)",
    }} />
    <div className="absolute -left-[3px] top-[233px] w-[3.5px] h-[54px] rounded-l-[2px]" style={{
      background: "linear-gradient(180deg, #4a4a4e 0%, #3a3a3e 50%, #333337 100%)",
      boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.15), inset 0 -0.5px 0 rgba(0,0,0,0.3), -1px 0 2px rgba(0,0,0,0.2)",
    }} />
    <div className="absolute -right-[3px] top-[168px] w-[3.5px] h-[70px] rounded-r-[2px]" style={{
      background: "linear-gradient(180deg, #4a4a4e 0%, #3a3a3e 50%, #333337 100%)",
      boxShadow: "inset 0 0.5px 0 rgba(255,255,255,0.15), inset 0 -0.5px 0 rgba(0,0,0,0.3), 1px 0 2px rgba(0,0,0,0.2)",
    }} />

    {/* Screen bezel + display */}
    <div className="absolute top-[13px] left-[14px] right-[14px] bottom-[13px] rounded-[37px] overflow-hidden"
      style={{ boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.8), inset 0 0 3px rgba(0,0,0,0.5)" }}
    >
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Dynamic Island */}
      <div className="absolute top-[11px] left-1/2 -translate-x-1/2 z-10" style={{ width: 98, height: 28 }}>
        <div className="w-full h-full rounded-full" style={{
          background: "linear-gradient(180deg, #0d0d0d 0%, #080808 100%)",
          boxShadow: "0 0.5px 1px rgba(0,0,0,0.5), inset 0 0.5px 0.5px rgba(255,255,255,0.03)",
        }} />
        {/* Front camera lens */}
        <div className="absolute right-[18px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full" style={{
          background: "radial-gradient(circle at 40% 35%, #1a1a30 0%, #08080e 60%, #040408 100%)",
          boxShadow: "0 0 0 0.5px rgba(255,255,255,0.06), inset 0 0.5px 1px rgba(255,255,255,0.04)",
        }} />
      </div>

      {/* Glass reflection over screen */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: "linear-gradient(165deg, rgba(255,255,255,0.025) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.01) 100%)",
      }} />

      <InnerGlowOverlay innerGlow={innerGlow} radius="37px" />
      <ScreenContent image={image} />
    </div>

    {/* Home indicator */}
    <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 w-[110px] h-[4px] rounded-full" style={{
      background: "linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.35), rgba(255,255,255,0.2))",
    }} />
  </div>
);

/* ─────────────────────── iPad Pro ─────────────────────── */
const IPadFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 548,
      height: 726,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.15 + dropShadow * 0.006}))` : undefined,
    }}
  >
    {/* Aluminum unibody */}
    <div className="absolute inset-0 rounded-[18px] overflow-hidden">
      {/* Base aluminum body – subtle directional brushed finish */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(155deg, #c8cad0 0%, #b8bac0 10%, #a8aab0 25%, #9ea0a6 50%, #a4a6ac 75%, #b4b6bc 90%, #c4c6cc 100%)",
      }} />
      {/* Brushed texture overlay */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.01) 0px, transparent 1px, transparent 3px)",
      }} />
      {/* Top chamfer – strong highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] rounded-t-[18px]" style={{
        background: "linear-gradient(90deg, transparent 3%, rgba(255,255,255,0.55) 20%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.55) 80%, transparent 97%)",
      }} />
      {/* Bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-[1.5px] rounded-b-[18px]" style={{
        background: "linear-gradient(90deg, transparent 3%, rgba(0,0,0,0.12) 20%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.12) 80%, transparent 97%)",
      }} />
      {/* Left edge light catch */}
      <div className="absolute inset-y-0 left-0 w-[1.5px]" style={{
        background: "linear-gradient(180deg, transparent 3%, rgba(255,255,255,0.35) 15%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.2) 85%, transparent 97%)",
      }} />
      {/* Right edge shadow */}
      <div className="absolute inset-y-0 right-0 w-[1.5px]" style={{
        background: "linear-gradient(180deg, transparent 3%, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.1) 85%, transparent 97%)",
      }} />
      {/* Ambient diffuse highlight */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 35% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
      }} />
      {/* Secondary reflection */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 70% 85%, rgba(255,255,255,0.04) 0%, transparent 40%)",
      }} />
    </div>

    {/* Antenna band lines */}
    <div className="absolute top-0 left-[60px] w-[0.5px] h-[18px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15), transparent)" }} />
    <div className="absolute top-0 right-[60px] w-[0.5px] h-[18px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15), transparent)" }} />
    <div className="absolute bottom-0 left-[60px] w-[0.5px] h-[18px]" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.15), transparent)" }} />
    <div className="absolute bottom-0 right-[60px] w-[0.5px] h-[18px]" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.15), transparent)" }} />

    {/* Front camera – detailed lens assembly */}
    <div className="absolute top-[9px] left-1/2 -translate-x-1/2 z-10" style={{ width: 12, height: 12 }}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full" style={{
        background: "linear-gradient(145deg, #888, #666)",
        boxShadow: "0 0 0 0.5px rgba(0,0,0,0.3)",
      }} />
      {/* Inner lens */}
      <div className="absolute inset-[1.5px] rounded-full" style={{
        background: "radial-gradient(circle at 38% 32%, #2a2a40 0%, #0e0e1a 55%, #060610 100%)",
        boxShadow: "inset 0 0.5px 1px rgba(255,255,255,0.08), 0 0 2px rgba(0,0,0,0.4)",
      }} />
      {/* Lens flare dot */}
      <div className="absolute top-[3px] left-[3.5px] w-[2px] h-[1.5px] rounded-full bg-white/15" />
    </div>

    {/* Screen area */}
    <div className="absolute top-[16px] left-[16px] right-[16px] bottom-[16px] rounded-[6px] overflow-hidden"
      style={{
        boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.6), inset 0 0 4px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(255,255,255,0.08)",
      }}
    >
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      {/* Glass reflection */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: "linear-gradient(140deg, rgba(255,255,255,0.03) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.015) 100%)",
      }} />
      <InnerGlowOverlay innerGlow={innerGlow} radius="6px" />
      <ScreenContent image={image} />
    </div>
  </div>
);

/* ─────────────────────── MacBook Pro ─────────────────────── */
const MacBookFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 700,
      height: 470,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.15 + dropShadow * 0.006}))` : undefined,
    }}
  >
    {/* ── Screen Lid ── */}
    <div className="absolute top-0 left-[20px] right-[20px] h-[420px] rounded-t-[12px] overflow-hidden">
      {/* Space black aluminum body */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #333338 0%, #26262b 6%, #1e1e23 15%, #1a1a1f 50%, #1c1c21 85%, #222227 94%, #2a2a2f 100%)",
      }} />
      {/* Subtle brushed texture */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.004) 0px, transparent 1px, transparent 2px)",
      }} />
      {/* Top chamfer highlight */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] rounded-t-[12px]" style={{
        background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.12) 20%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 80%, transparent 95%)",
      }} />
      {/* Left edge */}
      <div className="absolute inset-y-0 left-0 w-[1px]" style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.08) 5%, rgba(255,255,255,0.04) 50%, transparent 95%)",
      }} />
      {/* Right edge */}
      <div className="absolute inset-y-0 right-0 w-[1px]" style={{
        background: "linear-gradient(180deg, rgba(0,0,0,0.2) 5%, rgba(0,0,0,0.1) 95%)",
      }} />
      {/* Ambient reflection */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 30% 8%, rgba(255,255,255,0.04) 0%, transparent 40%)",
      }} />

      {/* Camera assembly */}
      <div className="absolute top-[7px] left-1/2 -translate-x-1/2 z-10" style={{ width: 8, height: 8 }}>
        <div className="absolute inset-0 rounded-full" style={{
          background: "radial-gradient(circle at 38% 32%, #22223a 0%, #0a0a14 60%, #04040a 100%)",
          boxShadow: "0 0 0 0.8px #3a3a40, 0 0 2px rgba(0,0,0,0.5), inset 0 0.5px 0.5px rgba(255,255,255,0.06)",
        }} />
        <div className="absolute top-[1.5px] left-[2px] w-[1.5px] h-[1px] rounded-full bg-white/10" />
      </div>
      {/* Camera indicator LED */}
      <div className="absolute top-[9px] left-1/2 translate-x-[7px] w-[2.5px] h-[2.5px] rounded-full" style={{
        background: "radial-gradient(circle, #0a2a0a, #061206)",
        boxShadow: "0 0 0 0.3px rgba(0,0,0,0.3)",
      }} />

      {/* Screen inset */}
      <div className="absolute top-[20px] left-[18px] right-[18px] bottom-[18px] rounded-[4px] overflow-hidden"
        style={{
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.9), inset 0 0 5px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.03)",
        }}
      >
        <div className="absolute inset-0 bg-[#050505]" />
        {/* Subtle glass reflection */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: "linear-gradient(155deg, rgba(255,255,255,0.02) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.01) 100%)",
        }} />
        <InnerGlowOverlay innerGlow={innerGlow} radius="4px" />
        <ScreenContent image={image} />
      </div>

      {/* Bottom bezel – subtle Apple logo area */}
      <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] opacity-[0.06]">
        <svg viewBox="0 0 170 170" fill="white">
          <path d="M150.4 130.2c-2.8 6.5-6.1 12.5-10 18-5.3 7.5-9.6 12.7-13 15.6-5.2 4.8-10.7 7.2-16.6 7.4-4.2 0-9.3-1.2-15.3-3.6-6-2.4-11.5-3.6-16.5-3.6-5.3 0-11 1.2-17 3.6-6.1 2.4-11 3.7-14.7 3.8-5.7 0.2-11.3-2.3-16.8-7.5-3.6-3.1-8.2-8.5-13.6-16.1-5.8-8.2-10.6-17.7-14.3-28.5C-1 108.1-3 97.2-3 86.7c0-12 2.6-22.3 7.8-31 4.1-7 9.5-12.4 16.3-16.4 6.8-4 14.1-6 22-6.1 4.5 0 10.3 1.4 17.6 4.1 7.2 2.7 11.9 4.1 13.9 4.1 1.5 0 6.7-1.6 15.5-4.9 8.3-3 15.3-4.3 21.1-3.8 15.6 1.3 27.3 7.5 35.1 18.8-14 8.5-20.9 20.3-20.7 35.6 0.2 11.9 4.4 21.8 12.7 29.7 3.8 3.6 8 6.3 12.7 8.3-1 3-2.1 5.8-3.3 8.6zM115.6 7.6c0 9.3-3.4 18-10.1 26-8.1 9.5-17.8 15-28.4 14.1-0.1-1.1-0.2-2.3-0.2-3.5 0-9 3.9-18.5 10.8-26.3 3.4-4 7.8-7.3 13-9.9 5.2-2.6 10.2-4 14.8-4.3 0.1 1.3 0.1 2.6 0.1 3.9z" />
        </svg>
      </div>
    </div>

    {/* ── Hinge ── */}
    <div className="absolute top-[420px] left-[16px] right-[16px] h-[6px] overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #5a5a5e 0%, #48484c 20%, #3c3c40 50%, #303034 80%, #28282c 100%)",
      }} />
      <div className="absolute inset-x-0 top-0 h-[0.5px]" style={{
        background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.2) 70%, transparent 95%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 h-[0.5px] bg-[rgba(0,0,0,0.3)]" />
    </div>

    {/* ── Base / Keyboard Deck ── */}
    <div className="absolute top-[426px] left-0 right-0 bottom-0 rounded-b-[8px] overflow-hidden">
      {/* Silver aluminum */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #d6d6da 0%, #ccccce 15%, #c2c2c6 35%, #bcbcc0 55%, #b6b6ba 75%, #b0b0b4 90%, #aaaaae 100%)",
      }} />
      {/* Brushed metal texture */}
      <div className="absolute inset-0" style={{
        background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.008) 0px, transparent 1px, transparent 4px)",
      }} />
      {/* Top edge catch */}
      <div className="absolute inset-x-0 top-0 h-[1px]" style={{
        background: "linear-gradient(90deg, transparent 3%, rgba(255,255,255,0.45) 20%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.45) 80%, transparent 97%)",
      }} />
      {/* Ambient highlight */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.1) 0%, transparent 55%)",
      }} />
      {/* Trackpad notch */}
      <div className="absolute top-[1px] left-1/2 -translate-x-1/2 overflow-hidden" style={{ width: 76, height: 5, borderRadius: "0 0 6px 6px" }}>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #9a9a9e 0%, #a6a6aa 100%)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12), inset 0 -0.5px 0 rgba(255,255,255,0.15)",
        }} />
      </div>
      {/* Bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] rounded-b-[8px]" style={{
        background: "linear-gradient(90deg, transparent 3%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.08) 80%, transparent 97%)",
      }} />
      {/* Rubber feet indicators (subtle) */}
      <div className="absolute bottom-[2px] left-[40px] w-[16px] h-[2px] rounded-full bg-[rgba(0,0,0,0.06)]" />
      <div className="absolute bottom-[2px] right-[40px] w-[16px] h-[2px] rounded-full bg-[rgba(0,0,0,0.06)]" />
    </div>
  </div>
);

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, image, dropShadow = 0, innerGlow = 0 }) => {
  switch (device) {
    case "iphone":
      return <IPhoneFrame image={image} dropShadow={dropShadow} innerGlow={innerGlow} />;
    case "ipad":
      return <IPadFrame image={image} dropShadow={dropShadow} innerGlow={innerGlow} />;
    case "macbook":
      return <MacBookFrame image={image} dropShadow={dropShadow} innerGlow={innerGlow} />;
  }
};

export default DeviceFrame;
export { deviceConfigs };
export type { DeviceType };
