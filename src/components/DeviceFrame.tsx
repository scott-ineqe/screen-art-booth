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

const DeviceFrame: React.FC<{ device: DeviceType; image: string | null; dropShadow: number }> = ({ device, image, dropShadow }) => {
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
      {/* 1. Device PNG Frame (Front Layer) */}
      {/* This sits on top of the screen (z-30) so the solid bezels hide any slight image overlap */}
      <img 
        src={config.frameUrl} 
        alt={config.label} 
        className="absolute inset-0 w-full h-full z-30 pointer-events-none object-contain"
      />

      {/* 2. Screen Area (Back Layer) */}
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
            // object-cover ensures the image fills the entire bleed area symmetrically
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