import React from "react";

// Updated to match the latest devices and your uploaded files
export type DeviceType = "iphone17" | "ipad-air" | "macbook-pro-16";

interface DeviceConfig {
  label: string;
  localPath: string;
  aspectRatio: number;
  // Percentage coordinates to place the screen perfectly within the frame
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

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  dropShadow?: number;
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, image, dropShadow = 0 }) => {
  const config = DEVICE_CONFIGS[device];
  
  return (
    <div 
      className="relative transition-all duration-300"
      style={{
        // Responsive sizing based on device category
        width: device.includes("macbook") ? 850 : (device.includes("ipad") ? 600 : 340),
        aspectRatio: `${config.aspectRatio}`,
        filter: dropShadow > 0 ? `drop-shadow(0 ${10 + dropShadow * 0.5}px ${25 + dropShadow * 1.5}px rgba(0,0,0,${0.2 + dropShadow * 0.01}))` : undefined,
      }}
    >
      {/* 1. The Physical Device Frame (Actual Photo) */}
      <img 
        src={config.localPath} 
        alt={config.label} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none object-contain"
      />

      {/* 2. The Interactive Screen Container */}
      <div 
        className="absolute z-10 overflow-hidden bg-black flex items-center justify-center"
        style={{
          top: config.screenArea.top,
          left: config.screenArea.left,
          width: config.screenArea.width,
          height: config.screenArea.height,
          borderRadius: config.screenArea.borderRadius,
        }}
      >
        {image ? (
          <img src={image} alt="Mockup Content" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 p-4 text-center">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">
              No Screenshot Uploaded
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceFrame;