import React from "react";

export type DeviceType = "iphone16pro" | "iphone16" | "ipadpro13" | "ipadair13" | "macbook14" | "macbook16";

interface DeviceConfig {
  label: string;
  frameUrl: string; // URL to the transparent PNG of the device
  aspectRatio: number;
  screenArea: {
    top: string;    // % from top
    left: string;   // % from left
    width: string;  // % of total width
    height: string; // % of total height
    borderRadius: string;
  };
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  iphone16pro: {
    label: "iPhone 16 Pro",
    frameUrl: "https://your-cdn.com/iphone16pro_frame.png",
    aspectRatio: 1206 / 2622,
    screenArea: { top: "2.2%", left: "4.5%", width: "91%", height: "95.6%", borderRadius: "46px" }
  },
  iphone16: {
    label: "iPhone 16",
    frameUrl: "https://your-cdn.com/iphone16_frame.png",
    aspectRatio: 1179 / 2556,
    screenArea: { top: "2.5%", left: "5.2%", width: "89.6%", height: "95%", borderRadius: "42px" }
  },
  ipadpro13: {
    label: "iPad Pro 13 (M4)",
    frameUrl: "https://your-cdn.com/ipadpro13_frame.png",
    aspectRatio: 2752 / 2064,
    screenArea: { top: "3.5%", left: "3.5%", width: "93%", height: "93%", borderRadius: "16px" }
  },
  ipadair13: {
    label: "iPad Air 13 (M2)",
    frameUrl: "https://your-cdn.com/ipadair13_frame.png",
    aspectRatio: 2732 / 2048,
    screenArea: { top: "4.2%", left: "4.2%", width: "91.6%", height: "91.6%", borderRadius: "12px" }
  },
  macbook14: {
    label: "MacBook Pro 14",
    frameUrl: "https://your-cdn.com/macbook14_frame.png",
    aspectRatio: 3024 / 1964,
    screenArea: { top: "5.5%", left: "10.2%", width: "79.6%", height: "82%", borderRadius: "4px" }
  },
  macbook16: {
    label: "MacBook Pro 16",
    frameUrl: "https://your-cdn.com/macbook16_frame.png",
    aspectRatio: 3456 / 2234,
    screenArea: { top: "5%", left: "9.5%", width: "81%", height: "84%", borderRadius: "4px" }
  }
};

const DeviceFrame: React.FC<{ device: DeviceType; image: string | null; dropShadow: number }> = ({ device, image, dropShadow }) => {
  const config = DEVICE_CONFIGS[device];
  
  return (
    <div 
      className="relative transition-all duration-300"
      style={{
        width: device.includes("macbook") ? 800 : (device.includes("ipad") ? 550 : 320),
        aspectRatio: `${config.aspectRatio}`,
        filter: dropShadow > 0 ? `drop-shadow(0 ${10 + dropShadow * 0.5}px ${25 + dropShadow * 1.5}px rgba(0,0,0,${0.2 + dropShadow * 0.01}))` : undefined,
      }}
    >
      {/* Actual Device Photo (PNG) */}
      <img 
        src={config.frameUrl} 
        alt={config.label} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none object-contain"
        crossOrigin="anonymous"
      />

      {/* Screen Content Container */}
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
          <img src={image} alt="Mockup" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Upload Image</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceFrame;