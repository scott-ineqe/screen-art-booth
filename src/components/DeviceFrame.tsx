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
    screenArea: { top: "3.9%", left: "4.1%", width: "91.8%", height: "92.2%", borderRadius: "44px" }
  },
  "ipad-air": {
    label: "iPad Air",
    frameUrl: "/frames/ipad-air.png",
    aspectRatio: 2732 / 2048,
    defaultWidth: 620, // Tablet size
    screenArea: { top: "7.7%", left: "4.3%", width: "91.5%", height: "84.7%", borderRadius: "9.7px" }
  },
  "ipad-pro": {
    label: "iPad Pro 11",
    frameUrl: "/frames/apple-ipad-pro-11.png",
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
    aspectRatio: 1920 / 1440,
    defaultWidth: 1000,
    screenArea: { top: "2.8%", left: "7.7%", width: "84.6%", height: "63.4%", borderRadius: "1px" }
  },
  "apple-watch": {
    label: "Apple Watch Series 6",
    frameUrl: "/frames/imac-24-inch.png",
    aspectRatio: 1920 / 1920,
    defaultWidth: 1000,
    screenArea: { top: "2.8%", left: "7.7%", width: "84.6%", height: "63.4%", borderRadius: "1px" }
  },
  "samsung-galaxy-tab": {
    label: "Samsung Galaxy Tab",
    frameUrl: "/frames/samsung-galaxy-tab.png",
    aspectRatio: 2560 / 1600, // Landscape tablet ratio
    defaultWidth: 650, // Tablet size
    screenArea: { top: "5.53%", left: "5.3%", width: "89.55%", height: "89.37%", borderRadius: "7.5px" }
  },
  "samsung-galaxy-phone": {
    label: "Samsung Galaxy Phone",
    frameUrl: "/frames/samsung-galaxy-phone.png",
    aspectRatio: 1080 / 2340, // Vertical phone ratio
    defaultWidth: 340, // Phone size
    screenArea: { top: "1.42%", left: "2.6%", width: "94.1%", height: "96.6%", borderRadius: "26.3px" }
  }
  "pixel-10": {
    label: "Google Pixel 10",
    frameUrl: "/frames/google-pixel-8.png",
    aspectRatio: 1080 / 2340, // Vertical phone ratio
    defaultWidth: 340, // Phone size
    screenArea: { top: "1.42%", left: "2.6%", width: "94.1%", height: "96.6%", borderRadius: "26.3px" }
  }
};

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  dropShadow: number;
  dropShadowAngle: number;
  dropShadowAllSides: boolean;
  dropShadowColor: string; // Added shadow color prop
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
  dropShadowColor, // Destructured shadow color
  innerGlow,
  innerGlowAngle,
  onUploadClick 
}) => {
  const config = DEVICE_CONFIGS[device] || DEVICE_CONFIGS["iphone17"];

  // --- DROP SHADOW MATH ---
  const dsRad = (dropShadowAngle - 90) * (Math.PI / 180);
  const dsDistance = dropShadow * 0.8;
  const dsBlur = 20 + dropShadow * 1.5;
  
  const dsX = dropShadowAllSides ? 0 : Math.round(Math.cos(dsRad) * dsDistance);
  const dsY = dropShadowAllSides ? 0 : Math.round(Math.sin(dsRad) * dsDistance);
  
  // Updated to use the hex color prop instead of hardcoded RGBA
  const dropShadowFilter = dropShadow > 0 
    ? `drop-shadow(${dsX}px ${dsY}px ${dsBlur}px ${dropShadowColor})` 
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