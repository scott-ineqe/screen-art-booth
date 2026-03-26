import React from "react";

export type DeviceType = "iphone16pro" | "iphone16" | "ipadpro13" | "ipadair13" | "macbook14" | "macbook16";

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
    localPath: "/frames/iphone-17.png",
    aspectRatio: 1179 / 2556,
    screenArea: { top: "2.4%", left: "5.4%", width: "89.2%", height: "95.2%", borderRadius: "42px" }
  },
  "ipad-air": {
    label: "iPad Air",
    localPath: "/frames/ipad-air.png",
    aspectRatio: 2732 / 2048,
    screenArea: { top: "4.2%", left: "4.2%", width: "91.6%", height: "91.6%", borderRadius: "12px" }
  },
  "macbook-pro-16": {
    label: "MacBook Pro 16",
    localPath: "/frames/macbook-pro-16.png",
    aspectRatio: 3456 / 2234,
    screenArea: { top: "5.1%", left: "9.6%", width: "80.8%", height: "83.8%", borderRadius: "4px" }
  }
};

const DeviceFrame: React.FC<{ device: DeviceType; image: string | null; dropShadow: number }> = ({ device, image, dropShadow }) => {
  const config = DEVICE_CONFIGS[device] || DEVICE_CONFIGS.iphone16pro;
  
  return (
    <div 
      className="relative transition-all duration-300"
      style={{
        width: device.includes("macbook") ? 850 : (device.includes("ipad") ? 620 : 340),
        aspectRatio: `${config.aspectRatio}`,
        filter: dropShadow > 0 ? `drop-shadow(0 ${15 + dropShadow * 0.5}px ${30 + dropShadow * 1.5}px rgba(0,0,0,${0.25 + dropShadow * 0.01}))` : undefined,
      }}
    >
      {/* Actual Device Photo (PNG) */}
      <img 
        src={config.frameUrl} 
        alt={config.label} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none object-contain"
      />

      {/* Screen Content Container - Now using object-fill to prevent gaps */}
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
          <img 
            src={image} 
            alt="Mockup content" 
            className="w-full h-full object-fill" // Changed from object-cover to object-fill
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">
              Upload Screenshot
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceFrame;