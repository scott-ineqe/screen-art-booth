import React from "react";

// 1. Added the new devices to the type definition
export type DeviceType = 
  | "iphone17" 
  | "ipad-air" 
  | "macbook-pro-16"
  | "imac-24-inch"
  | "samsung-galaxy-tab"
  | "samsung-galaxy-phone";

interface DeviceConfig {
  label: string;
  frameUrl: string;
  aspectRatio: number;
  defaultWidth: number; // 2. Added this so you can control exact base sizes!
  screenArea: {
    top: string;
    left: string;
    width: string;
    height: string;
    borderRadius: string;
  };
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  "iphone17": {
    label: "iPhone 17",
    frameUrl: "/frames/iphone-17.png",
    aspectRatio: 1179 / 2556,
    defaultWidth: 340, // Phone size
    screenArea: { top: "3.9%", left: "4.1%", width: "93.9%", height: "92.2%", borderRadius: "44px" }
  },
  "ipad-air": {
    label: "iPad Air",
    frameUrl: "/frames/ipad-air.png",
    aspectRatio: 2732 / 2048,
    defaultWidth: 620, // Tablet size
    screenArea: { top: "7.7%", left: "4.3%", width: "91.5%", height: "84.7%", borderRadius: "9.7px" }
  },
  "macbook-pro-16": {
    label: "MacBook Pro 16",
    frameUrl: "/frames/macbook-pro-16.png",
    aspectRatio: 3456 / 2234,
    defaultWidth: 850, // Laptop size
    screenArea: { top: "6.3%", left: "9.3%", width: "81.4%", height: "81.48%", borderRadius: "1px" }
  },
  "imac-24-inch": {
    label: "iMac 2021 24 inch",
    frameUrl: "/frames/imac-24-inch.png",
    aspectRatio: 1920 / 1440, // Desktop monitor with a chin ratio
    defaultWidth: 1000, // Massive Desktop size
    screenArea: { top: "2.9%", left: "13.6%", width: "72.5%", height: "64%", borderRadius: "1px" }
  },
  "samsung-galaxy-tab": {
    label: "Samsung Galaxy Tab",
    frameUrl: "/frames/samsung-galaxy-tab.png",
    aspectRatio: 2560 / 1600, // Landscape tablet ratio
    defaultWidth: 650, // Tablet size
    screenArea: { top: "5.6%", left: "3.6%", width: "92.8%", height: "89.3%", borderRadius: "4px" }
  },
  "samsung-galaxy-phone": {
    label: "Samsung Galaxy Phone",
    frameUrl: "/frames/samsung-galaxy-phone.png",
    aspectRatio: 1080 / 2340, // Vertical phone ratio
    defaultWidth: 340, // Phone size
    screenArea: { top: "1.59%", left: "35.73%", width: "28.3%", height: "96.48%", borderRadius: "9.3px" }
  }
};

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  dropShadow: number;
  dropShadowAngle: number;
  dropShadowAllSides: boolean;
  innerGlow: number;
  innerGlowAngle: number;
  onUploadClick?: () => void;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ 
  device, 
  image, 
  dropShadow, 
  dropShadowAngle, 
  dropShadowAllSides,
  innerGlow,
  innerGlowAngle,
  onUploadClick 
}) => {
  const config = DEVICE_CONFIGS[device] || DEVICE_CONFIGS["iphone17"];

  // --- DROP SHADOW MATH ---
  const dsRad = (dropShadowAngle - 90) * (Math.PI / 180);
  const dsDistance = dropShadow * 0.8;
  const dsBlur = 20 + dropShadow * 1.5;
  const dsAlpha = 0.1 + dropShadow * 0.005;
  
  const dsX = dropShadowAllSides ? 0 : Math.round(Math.cos(dsRad) * dsDistance);
  const dsY = dropShadowAllSides ? 0 : Math.round(Math.sin(dsRad) * dsDistance);
  
  const dropShadowFilter = dropShadow > 0 
    ? `drop-shadow(${dsX}px ${dsY}px ${dsBlur}px rgba(0,0,0,${dsAlpha}))` 
    : undefined;

  // --- INNER GLOW MATH ---
  const igRad = (innerGlowAngle - 90) * (Math.PI / 180);
  const igDistance = innerGlow * 0.8;
  const igBlur = 10 + innerGlow * 0.6;
  const igAlpha = innerGlow * 0.008; 
  
  const igX = Math.round(Math.cos(igRad) * igDistance);
  const igY = Math.round(Math.sin(igRad) * igDistance);
  
  const innerGlowBoxShadow = innerGlow > 0 
    ? `inset ${igX}px ${igY}px ${igBlur}px rgba(255,255,255,${igAlpha})` 
    : "none";
  
  return (
    <div 
      className="relative transition-all duration-300"
      style={{
        // 3. Replaced the messy "includes" math with the explicit defaultWidth
        width: config.defaultWidth,
        aspectRatio: `${config.aspectRatio}`,
        filter: dropShadowFilter,
      }}
    >
      {/* Device PNG Frame (Front Layer) */}
      <img 
        src={config.frameUrl} 
        alt={config.label} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none object-contain"
      />

      {/* Screen Area (Back Layer) */}
      <div 
        className="absolute z-10 overflow-hidden bg-black cursor-pointer group"
        onClick={onUploadClick}
        style={{
          top: config.screenArea.top,
          left: config.screenArea.left,
          width: config.screenArea.width,
          height: config.screenArea.height,
          borderRadius: config.screenArea.borderRadius,
        }}
      >
        {image ? (
          <img 
            src={image} 
            alt="Mockup content" 
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" 
          />
        ) : (
          <div className="w-full h-full flex flex-col gap-2 items-center justify-center bg-muted/20 group-hover:bg-muted/30 transition-colors">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
              Upload Asset
            </span>
            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">
              Click or Drag
            </span>
          </div>
        )}

        {/* Inner Glow Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
          style={{ boxShadow: innerGlowBoxShadow }}
        />
      </div>
    </div>
  );
};

export default DeviceFrame;