import React from "react";

type DeviceType = "iphone16pro" | "iphone16" | "ipadpro13" | "ipadair13" | "macbook14" | "macbook16";

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  dropShadow?: number;
  innerGlow?: number;
}

const ScreenContent: React.FC<{ image: string | null }> = ({ image }) =>
  image ? (
    <img src={image} alt="Mockup" className="relative w-full h-full object-cover" />
  ) : (
    <div className="relative w-full h-full flex items-center justify-center bg-muted/30">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-tight">Upload Image</span>
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

/* ─────────────────────── iPhone 16 Series ─────────────────────── */
const IPhone16Frame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number; isPro: boolean }> = ({ image, dropShadow, innerGlow, isPro }) => (
  <div
    className="relative"
    style={{
      width: 310,
      height: 670,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${25 + dropShadow * 1.5}px rgba(0,0,0,${0.25 + dropShadow * 0.01}))` : undefined,
    }}
  >
    {/* Chassis with Material Finish */}
    <div className="absolute inset-0 rounded-[54px] overflow-hidden border-[0.5px] border-white/10">
      <div className="absolute inset-0" style={{
        background: isPro 
          ? "linear-gradient(160deg, #4b4b4f 0%, #2d2d31 40%, #28282c 60%, #444448 100%)" // Natural Titanium
          : "linear-gradient(160deg, #1a1a1c 0%, #0d0d0f 40%, #1a1a1c 100%)", // Ultramarine/Black
      }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.5)]" />
    </div>

    {/* Physical Buttons (Action, Volume, Power) */}
    <div className="absolute -left-[2px] top-[115px] w-[3px] h-[30px] rounded-l-[2px] bg-[#333] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" /> {/* Action/Mute */}
    <div className="absolute -left-[2px] top-[170px] w-[3px] h-[55px] rounded-l-[2px] bg-[#333] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" /> {/* Vol Up */}
    <div className="absolute -left-[2px] top-[235px] w-[3px] h-[55px] rounded-l-[2px] bg-[#333] shadow-[-1px_0_2px_rgba(0,0,0,0.4)]" /> {/* Vol Down */}
    
    {/* Camera Control Button (Lower Right) */}
    <div className="absolute -right-[2px] top-[340px] w-[3px] h-[50px] rounded-r-[4px] bg-[#222] shadow-[1px_0_2px_rgba(0,0,0,0.4)] border-y border-white/5" />

    {/* Display with ultra-thin bezels */}
    <div className={`absolute ${isPro ? 'top-[10px] left-[11px] right-[11px] bottom-[10px]' : 'top-[13px] left-[14px] right-[14px] bottom-[13px]'} rounded-[46px] overflow-hidden bg-black ring-1 ring-inset ring-black/80`}>
      <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_12px_rgba(0,0,0,0.7)]" />
      
      {/* Dynamic Island */}
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 z-30" style={{ width: 92, height: 26 }}>
        <div className="w-full h-full rounded-full bg-black shadow-[0_0.5px_1px_rgba(255,255,255,0.1)]" />
      </div>

      <ScreenContent image={image} />
      <InnerGlowOverlay innerGlow={innerGlow} radius="46px" />
    </div>
  </div>
);

/* ─────────────────────── iPad Pro M4 (13-inch) ─────────────────────── */
const IPadPro13Frame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 580,
      height: 780,
      filter: dropShadow > 0 ? `drop-shadow(0 ${10 + dropShadow * 0.5}px ${30 + dropShadow * 1.8}px rgba(0,0,0,${0.22 + dropShadow * 0.009}))` : undefined,
    }}
  >
    {/* Ultra-thin 5.1mm housing */}
    <div className="absolute inset-0 rounded-[28px] overflow-hidden border-[0.5px] border-white/10">
      <div className="absolute inset-0" style={{
        background: "linear-gradient(155deg, #c5c7cf 0%, #9da1a8 50%, #b9bcc4 100%)",
      }} />
      <div className="absolute inset-0 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.3)]" />
    </div>

    {/* Screen Bezel */}
    <div className="absolute top-[14px] left-[14px] right-[14px] bottom-[14px] rounded-[16px] overflow-hidden bg-black ring-1 ring-white/5">
      <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]" />
      <ScreenContent image={image} />
      <InnerGlowOverlay innerGlow={innerGlow} radius="16px" />
    </div>
  </div>
);

/* ─────────────────────── MacBook Pro (Space Black) ─────────────────────── */
const MacBookProFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number; is16Inch: boolean }> = ({ image, dropShadow, innerGlow, is16Inch }) => (
  <div
    className="relative"
    style={{
      width: is16Inch ? 800 : 720,
      height: is16Inch ? 530 : 480,
      filter: dropShadow > 0 ? `drop-shadow(0 ${12 + dropShadow * 0.6}px ${35 + dropShadow * 2}px rgba(0,0,0,${0.25 + dropShadow * 0.01}))` : undefined,
    }}
  >
    {/* Lid */}
    <div className={`absolute top-0 left-[2%] right-[2%] ${is16Inch ? 'h-[92%]' : 'h-[90%]'} rounded-t-[16px] overflow-hidden border-[0.5px] border-white/5`}>
      <div className="absolute inset-0 bg-[#16161b]" />
      
      {/* Display Bezel with Notch */}
      <div className="absolute top-[16px] left-[14px] right-[14px] bottom-[12px] rounded-[4px] overflow-hidden bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-black rounded-b-[10px] z-30" />
        <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" />
        <ScreenContent image={image} />
        <InnerGlowOverlay innerGlow={innerGlow} radius="4px" />
      </div>
    </div>

    {/* Hinge & Base */}
    <div className={`absolute bottom-0 left-0 right-0 ${is16Inch ? 'h-[8%]' : 'h-[10%]'} rounded-b-[12px] overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#b0b0b4] to-[#7a7a7e]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[15%] h-[20%] bg-black/10 rounded-b-lg" />
    </div>
  </div>
);

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, image, dropShadow = 0, innerGlow = 0 }) => {
  switch (device) {
    case "iphone16pro": return <IPhone16Frame image={image} dropShadow={dropShadow} innerGlow={innerGlow} isPro={true} />;
    case "iphone16": return <IPhone16Frame image={image} dropShadow={dropShadow} innerGlow={innerGlow} isPro={false} />;
    case "ipadpro13": return <IPadPro13Frame image={image} dropShadow={dropShadow} innerGlow={innerGlow} />;
    case "ipadair13": return <IPadPro13Frame image={image} dropShadow={dropShadow} innerGlow={innerGlow} />; // Using similar frame with slight variations
    case "macbook14": return <MacBookProFrame image={image} dropShadow={dropShadow} innerGlow={innerGlow} is16Inch={false} />;
    case "macbook16": return <MacBookProFrame image={image} dropShadow={dropShadow} innerGlow={innerGlow} is16Inch={true} />;
    default: return <IPhone16Frame image={image} dropShadow={dropShadow} innerGlow={innerGlow} isPro={true} />;
  }
};

export default DeviceFrame;