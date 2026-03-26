import React from "react";

// 1. Properly defined types mapping perfectly to the configs
export type DeviceType = "iphone17" | "ipad-air" | "macbook-pro-16";

interface DeviceConfig {
  label: string;
  frameUrl: string;
  aspectRatio: number;
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
    screenArea: { top: "2.3%", left: "4.8%", width: "94%", height: "95.4%", borderRadius: "44px" }
  },
  "ipad-air": {
    label: "iPad Air",
    frameUrl: "/frames/ipad-air.png",
    aspectRatio: 2732 / 2048,
    screenArea: { top: "3.8%", left: "3.8%", width: "92.4%", height: "92.4%", borderRadius: "14px" }
  },
  "macbook-pro-16": {
    label: "MacBook Pro 16",
    frameUrl: "/frames/macbook-pro-16.png",
    aspectRatio: 3456 / 2234,
    screenArea: { top: "4.8%", left: "9.2%", width: "81.6%", height: "84.4%", borderRadius: "4px" }
  }
};

const DeviceFrame: React.FC<{ device: DeviceType; image: string | null; dropShadow: number }> = ({ device, image, dropShadow }) => {
  // Safe fallback specifically matching the valid keys
  const config = DEVICE_CONFIGS[device] || DEVICE_CONFIGS["iphone17"];
  
  return (
    <div 
      className="relative transition-all duration-300"
      style={{
        width: device.includes("macbook") ? 850 : (device.includes("ipad") ? 620 : 340),
        aspectRatio: `${config.aspectRatio}`,
        filter: dropShadow > 0 ? `drop-shadow(0 ${15 + dropShadow * 0.5}px ${30 + dropShadow * 1.5}px rgba(0,0,0,${0.25 + dropShadow * 0.01}))` : undefined,
      }}
    >
      {/* Device PNG Frame */}
      <img 
        src={config.frameUrl} 
        alt={config.label} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none object-contain"
      />

      {/* Screen Area */}
      <div 
        className="absolute z-10 overflow-hidden bg-black"
        style={{
          top: config.screenArea.top,
          left: config.screenArea.left,
          width: config.screenArea.width,
          height: config.screenArea.height,
          borderRadius: config.screenArea.borderRadius,
        }}
      >
        {image ? (
          // Object-cover ensures the image fills the space proportionally without stretching
          <img 
            src={image} 
            alt="Mockup content" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">
              Upload Asset
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceFrame;