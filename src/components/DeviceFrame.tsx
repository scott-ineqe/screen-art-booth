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

const IPhoneFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 310,
      height: 640,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.15 + dropShadow * 0.006}))` : undefined,
    }}
  >
    <div
      className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1e]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)" }}
    />
    <div className="absolute -left-[3px] top-[120px] w-[3px] h-[32px] rounded-l bg-[#3a3a3e]" />
    <div className="absolute -left-[3px] top-[170px] w-[3px] h-[56px] rounded-l bg-[#3a3a3e]" />
    <div className="absolute -left-[3px] top-[235px] w-[3px] h-[56px] rounded-l bg-[#3a3a3e]" />
    <div className="absolute -right-[3px] top-[170px] w-[3px] h-[72px] rounded-r bg-[#3a3a3e]" />
    <div className="absolute top-[14px] left-[15px] right-[15px] bottom-[14px] rounded-[36px] overflow-hidden bg-black">
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-10" />
      {innerGlow > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none rounded-[36px]" style={{ boxShadow: `inset 0 0 ${innerGlow * 0.8}px ${innerGlow * 0.3}px rgba(255,255,255,${0.05 + innerGlow * 0.003})` }} />
      )}
      {image ? (
        <img src={image} alt="Mockup" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          <span className="text-muted-foreground text-xs">Upload an image</span>
        </div>
      )}
    </div>
    <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[120px] h-[4px] rounded-full bg-white/30" />
  </div>
);

const IPadFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 548,
      height: 726,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.15 + dropShadow * 0.006}))` : undefined,
    }}
  >
    {/* Outer shell – space gray with subtle bevel highlights */}
    <div className="absolute inset-0 rounded-[20px] overflow-hidden">
      {/* Base metal body */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, #bfc2c8 0%, #a8aab0 15%, #9a9da3 50%, #a2a5ab 85%, #b8bbc1 100%)",
        }}
      />
      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 70%, transparent 95%)" }} />
      {/* Bottom edge shadow */}
      <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.15) 70%, transparent 95%)" }} />
      {/* Left edge highlight */}
      <div className="absolute inset-y-0 left-0 w-[2px]" style={{ background: "linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.3) 80%, transparent 95%)" }} />
      {/* Right edge shadow */}
      <div className="absolute inset-y-0 right-0 w-[2px]" style={{ background: "linear-gradient(180deg, transparent 5%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.15) 80%, transparent 95%)" }} />
      {/* Subtle anodized texture overlay */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
    </div>

    {/* Camera lens */}
    <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full z-10"
      style={{
        background: "radial-gradient(circle at 35% 35%, #3a3a4e, #0a0a1e 70%)",
        boxShadow: "0 0 0 1.5px #666, 0 0 3px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.15)",
      }}
    />

    {/* Screen area */}
    <div className="absolute top-[18px] left-[18px] right-[18px] bottom-[18px] rounded-[6px] overflow-hidden"
      style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 0 4px rgba(0,0,0,0.3)" }}
    >
      <div className="absolute inset-0 bg-black" />
      {innerGlow > 0 && (
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ boxShadow: `inset 0 0 ${innerGlow * 0.8}px ${innerGlow * 0.3}px rgba(255,255,255,${0.05 + innerGlow * 0.003})` }} />
      )}
      {image ? (
        <img src={image} alt="Mockup" className="relative w-full h-full object-cover" />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-muted/30">
          <span className="text-muted-foreground text-xs">Upload an image</span>
        </div>
      )}
    </div>
  </div>
);

const MacBookFrame: React.FC<{ image: string | null; dropShadow: number; innerGlow: number }> = ({ image, dropShadow, innerGlow }) => (
  <div
    className="relative"
    style={{
      width: 700,
      height: 470,
      filter: dropShadow > 0 ? `drop-shadow(0 ${8 + dropShadow * 0.4}px ${20 + dropShadow * 1.5}px rgba(0,0,0,${0.15 + dropShadow * 0.006}))` : undefined,
    }}
  >
    {/* Screen lid */}
    <div className="absolute top-0 left-[20px] right-[20px] h-[420px] rounded-t-[12px] overflow-hidden">
      {/* Metal body with realistic gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, #2e2e32 0%, #1f1f23 8%, #1a1a1e 50%, #1c1c20 92%, #2a2a2e 100%)",
      }} />
      {/* Top bezel highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 70%, transparent 90%)" }} />
      {/* Side bevels */}
      <div className="absolute inset-y-0 left-0 w-[1px]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.1) 10%, rgba(255,255,255,0.05) 90%)" }} />
      <div className="absolute inset-y-0 right-0 w-[1px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.2) 10%, rgba(0,0,0,0.1) 90%)" }} />

      {/* Camera with realistic lens */}
      <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full z-10"
        style={{
          background: "radial-gradient(circle at 35% 35%, #2a2a3e, #050510 70%)",
          boxShadow: "0 0 0 1px #444, 0 0 2px rgba(0,0,0,0.5), inset 0 0.5px 1px rgba(255,255,255,0.1)",
        }}
      />
      {/* Camera indicator dot */}
      <div className="absolute top-[9.5px] left-1/2 translate-x-[6px] w-[3px] h-[3px] rounded-full" style={{ background: "radial-gradient(circle, #1a3a1a, #0a1a0a)" }} />

      {/* Screen */}
      <div className="absolute top-[22px] left-[20px] right-[20px] bottom-[20px] rounded-[4px] overflow-hidden"
        style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.8), inset 0 0 6px rgba(0,0,0,0.4)" }}
      >
        <div className="absolute inset-0 bg-black" />
        {/* Screen glass reflection */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.015) 100%)",
        }} />
        {innerGlow > 0 && (
          <div className="absolute inset-0 z-20 pointer-events-none" style={{ boxShadow: `inset 0 0 ${innerGlow * 0.8}px ${innerGlow * 0.3}px rgba(255,255,255,${0.05 + innerGlow * 0.003})` }} />
        )}
        {image ? (
          <img src={image} alt="Mockup" className="relative w-full h-full object-cover" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-muted/30">
            <span className="text-muted-foreground text-xs">Upload an image</span>
          </div>
        )}
      </div>
    </div>

    {/* Base / Keyboard deck */}
    <div className="absolute bottom-0 left-0 right-0 h-[50px]">
      {/* Hinge – realistic with multi-layer gradient */}
      <div className="absolute top-0 left-[18px] right-[18px] h-[5px] overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #666 0%, #4a4a4e 30%, #3a3a3e 60%, #2e2e32 100%)",
        }} />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-[rgba(255,255,255,0.15)]" />
      </div>
      {/* Base body with aluminum finish */}
      <div className="absolute top-[5px] left-0 right-0 bottom-0 rounded-b-[8px] overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(180deg, #d0d0d4 0%, #c4c4c8 20%, #bababd 50%, #b0b0b4 80%, #a8a8ac 100%)",
        }} />
        {/* Top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent 95%)" }} />
        {/* Subtle brushed texture */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        {/* Trackpad notch indent */}
        <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[80px] h-[5px] rounded-b-lg"
          style={{ background: "linear-gradient(180deg, #999 0%, #aaa 100%)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)" }}
        />
      </div>
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
