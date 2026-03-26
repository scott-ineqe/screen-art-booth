import React from "react";

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
    // Expanded slightly to bleed under the bezel
    screenArea: { 
      top: "3.9%", 
      left: "4.1%", 
      width: "93.9%", 
      height: "92.2%", 
      borderRadius: "44px" 
    }
  },
  "ipad-air": {
    label: "iPad Air",
    frameUrl: "/frames/ipad-air.png",
    aspectRatio: 2732 / 2048,
    // Expanded slightly to bleed under the bezel
    screenArea: { 
      top: "7.7%", 
      left: "4.3%", 
      width: "91.5%", 
      height: "84.7%", 
      borderRadius: "9.7px" 
    }
  },
  "macbook-pro-16": {
    label: "MacBook Pro 16",
    frameUrl: "/frames/macbook-pro-16.png",
    aspectRatio: 3456 / 2234,
    // Expanded slightly to bleed under the bezel (bottom margin kept larger for the physical hinge)
    screenArea: { 
      top: "6.3%", 
      left: "9.3%", 
      width: "81.4%", 
      height: "81.48%", 
      borderRadius: "1px" 
    }
  }
};

interface DeviceFrameProps {
  device: DeviceType;
  image: string | null;
  dropShadow: number;
  onUploadClick?: () => void; // Added prop for click-to-upload
}

const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, image, dropShadow, onUploadClick }) => {
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
      {/* Device PNG Frame (Front Layer) */}
      <img 
        src={config.frameUrl} 
        alt={config.label} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none object-contain"
      />

      {/* Screen Area (Back Layer) - Now Clickable */}
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
      </div>
    </div>
  );
};

export default DeviceFrame;