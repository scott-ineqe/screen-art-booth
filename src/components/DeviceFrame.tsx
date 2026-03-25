import React from "react";

type DeviceType = "iphone" | "ipad" | "macbook";

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
}

const deviceConfigs: Record<DeviceType, { screenW: number; screenH: number; label: string }> = {
  iphone: { screenW: 280, screenH: 607, label: "iPhone 15 Pro" },
  ipad: { screenW: 512, screenH: 683, label: "iPad Pro" },
  macbook: { screenW: 640, screenH: 400, label: "MacBook Pro" },
};

const IPhoneFrame: React.FC<{ image: string | null }> = ({ image }) => (
  <div className="relative" style={{ width: 310, height: 640 }}>
    {/* Outer shell */}
    <div
      className="absolute inset-0 rounded-[48px] bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1e]"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)" }}
    />
    {/* Side buttons */}
    <div className="absolute -left-[3px] top-[120px] w-[3px] h-[32px] rounded-l bg-[#3a3a3e]" />
    <div className="absolute -left-[3px] top-[170px] w-[3px] h-[56px] rounded-l bg-[#3a3a3e]" />
    <div className="absolute -left-[3px] top-[235px] w-[3px] h-[56px] rounded-l bg-[#3a3a3e]" />
    <div className="absolute -right-[3px] top-[170px] w-[3px] h-[72px] rounded-r bg-[#3a3a3e]" />
    {/* Screen area */}
    <div className="absolute top-[14px] left-[15px] right-[15px] bottom-[14px] rounded-[36px] overflow-hidden bg-black">
      {/* Dynamic Island */}
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-10" />
      {image ? (
        <img src={image} alt="Mockup" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          <span className="text-muted-foreground text-xs">Upload an image</span>
        </div>
      )}
    </div>
    {/* Bottom bar */}
    <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2 w-[120px] h-[4px] rounded-full bg-white/30" />
  </div>
);

const IPadFrame: React.FC<{ image: string | null }> = ({ image }) => (
  <div className="relative" style={{ width: 548, height: 726 }}>
    <div
      className="absolute inset-0 rounded-[24px] bg-gradient-to-b from-[#d4d4d8] to-[#c0c0c4]"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5)" }}
    />
    <div className="absolute top-[18px] left-[18px] right-[18px] bottom-[18px] rounded-[8px] overflow-hidden bg-black">
      {/* Camera dot */}
      <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-[#1a1a2e] rounded-full z-10 border border-[#333]" />
      {image ? (
        <img src={image} alt="Mockup" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted/30">
          <span className="text-muted-foreground text-xs">Upload an image</span>
        </div>
      )}
    </div>
  </div>
);

const MacBookFrame: React.FC<{ image: string | null }> = ({ image }) => (
  <div className="relative" style={{ width: 700, height: 470 }}>
    {/* Screen lid */}
    <div
      className="absolute top-0 left-[20px] right-[20px] h-[420px] rounded-t-[12px] bg-gradient-to-b from-[#2a2a2e] to-[#1d1d20]"
      style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.3)" }}
    >
      {/* Camera */}
      <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-[#0a0a0e] rounded-full border border-[#444]" />
      {/* Screen */}
      <div className="absolute top-[20px] left-[18px] right-[18px] bottom-[18px] rounded-[4px] overflow-hidden bg-black">
        {image ? (
          <img src={image} alt="Mockup" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <span className="text-muted-foreground text-xs">Upload an image</span>
          </div>
        )}
      </div>
    </div>
    {/* Base / Keyboard deck */}
    <div className="absolute bottom-0 left-0 right-0 h-[50px]">
      {/* Hinge */}
      <div className="absolute top-0 left-[18px] right-[18px] h-[4px] bg-gradient-to-b from-[#555] to-[#3a3a3e] rounded-b-sm" />
      {/* Base */}
      <div
        className="absolute top-[4px] left-0 right-0 bottom-0 bg-gradient-to-b from-[#c8c8cc] to-[#a8a8ac] rounded-b-[8px]"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
      >
        {/* Trackpad notch */}
        <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[80px] h-[4px] rounded-b-lg bg-[#999]" />
      </div>
    </div>
  </div>
);

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, image }) => {
  switch (device) {
    case "iphone":
      return <IPhoneFrame image={image} />;
    case "ipad":
      return <IPadFrame image={image} />;
    case "macbook":
      return <MacBookFrame image={image} />;
  }
};

export default DeviceFrame;
export { deviceConfigs };
export type { DeviceType };
