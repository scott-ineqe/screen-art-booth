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
      <span className="text-muted-foreground text-xs font-medium">Upload image</span>
    </div>
  );

const InnerGlowOverlay: React.FC<{ innerGlow: number; radius?: string }> = ({ innerGlow, radius }) =>
  innerGlow > 0 ? (
    <div
      className="absolute inset-0 z-20 pointer-events-none"
      style={{
        borderRadius: radius,
        boxShadow: `inset 0 0 ${innerGlow * 1.5}px ${innerGlow * 0.5}px rgba(255,255,255,${0.05 + innerGlow * 0.005})`,
      }}
    />
  ) : null;

/* ─────────────────────── iPhone 15 Pro (Titanium) ─────────────────────── */
const IPhoneFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 310,
      height: 640,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.2 + dropShadow * 0.008}))` : undefined,
    }}
  >
    {/* Natural Titanium outer shell with physical depth */}
    <div className="absolute inset-0 rounded-[48px] overflow-hidden border-[0.5px] border-white/10">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(160deg, #4e4e52 0%, #3c3c40 12%, #2d2d31 40%, #28282c 60%, #323236 88%, #444448 100%)",
      }} />
      {/* Metallic grain texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />
      <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.4)]" />
    </div>

    {/* Buttons with tactile 3D effect */}
    {/* Action Button */}
    <div className="absolute -left-[2px] top-[118px] w-[3px] h-[28px] rounded-l-[2px] border-y border-white/10" style={{
      background: "linear-gradient(180deg, #5a5a5e, #3a3a3e)",
      boxShadow: "-1px 0 2px rgba(0,0,0,0.3)"
    }} />
    {/* Volume Up */}
    <div className="absolute -left-[2px] top-[168px] w-[3px] h-[52px] rounded-l-[2px] border-y border-white/10" style={{
      background: "linear-gradient(180deg, #5a5a5e, #3a3a3e)",
      boxShadow: "-1px 0 2px rgba(0,0,0,0.3)"
    }} />
    {/* Volume Down */}
    <div className="absolute -left-[2px] top-[233px] w-[3px] h-[52px] rounded-l-[2px] border-y border-white/10" style={{
      background: "linear-gradient(180deg, #5a5a5e, #3a3a3e)",
      boxShadow: "-1px 0 2px rgba(0,0,0,0.3)"
    }} />
    {/* Power Button */}
    <div className="absolute -right-[2px] top-[168px] w-[3px] h-[68px] rounded-r-[2px] border-y border-white/10" style={{
      background: "linear-gradient(180deg, #5a5a5e, #3a3a3e)",
      boxShadow: "1px 0 2px rgba(0,0,0,0.3)"
    }} />

    {/* Display area with Dynamic Island */}
    <div className="absolute top-[12px] left-[13px] right-[13px] bottom-[12px] rounded-[38px] overflow-hidden bg-black ring-1 ring-inset ring-black/80">
      <div className="absolute inset-0 z-20 pointer-events-none rounded-[38px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />
      
      {/* Dynamic Island */}
      <div className="absolute top-[11px] left-1/2 -translate-x-1/2 z-30" style={{ width: 98, height: 28 }}>
        <div className="w-full h-full rounded-full bg-black shadow-[0_0.5px_1px_rgba(255,255,255,0.1)]" />
        <div className="absolute right-[18px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full" style={{
          background: "radial-gradient(circle at 40% 35%, #1a1a30 0%, #08080e 60%, #040408 100%)",
        }} />
      </div>

      <ScreenContent image={image} />
      <InnerGlowOverlay innerGlow={innerGlow} radius="38px" />
    </div>
  </div>
);

/* ─────────────────────── iPad Pro (Silver) ─────────────────────── */
const IPadFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 548,
      height: 726,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.2 + dropShadow * 0.008}))` : undefined,
    }}
  >
    <div className="absolute inset-0 rounded-[24px] overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(155deg, #e5e7eb 0%, #d1d5db 25%, #9ca3af 50%, #d1d5db 75%, #e5e7eb 100%)",
      }} />
      {/* Chamfered edge highlight */}
      <div className="absolute inset-0 border border-white/40 rounded-[24px]" />
      <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.2)]" />
    </div>

    <div className="absolute top-[18px] left-[18px] right-[18px] bottom-[18px] rounded-[10px] overflow-hidden bg-black ring-1 ring-inset ring-white/5">
      <div className="absolute inset-0 z-20 pointer-events-none rounded-[10px] shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]" />
      <ScreenContent image={image} />
      <InnerGlowOverlay innerGlow={innerGlow} radius="10px" />
    </div>
  </div>
);

/* ─────────────────────── MacBook Pro (Space Black) ─────────────────────── */
const MacBookFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 700,
      height: 470,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.2 + dropShadow * 0.008}))` : undefined,
    }}
  >
    {/* Screen Lid */}
    <div className="absolute top-0 left-[20px] right-[20px] h-[420px] rounded-t-[14px] overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #2a2a2f 0%, #1a1a1f 10%, #16161b 50%, #1c1c21 90%, #2a2a2f 100%)",
      }} />
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-white/10" />
      
      {/* Display Bezel */}
      <div className="absolute top-[20px] left-[18px] right-[18px] bottom-[16px] rounded-[4px] overflow-hidden bg-black">
        <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]" />
        <ScreenContent image={image} />
        <InnerGlowOverlay innerGlow={innerGlow} radius="4px" />
      </div>
    </div>

    {/* MacBook Base/Hinge */}
    <div className="absolute top-[420px] left-[16px] right-[16px] h-[8px] bg-[#1a1a1f] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]" />
    <div className="absolute top-[428px] left-0 right-0 bottom-0 rounded-b-[10px] overflow-hidden">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #d1d5db 0%, #9ca3af 20%, #4b5563 100%)",
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-2 rounded-b-lg bg-black/10 shadow-inner" />
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