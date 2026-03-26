import React, { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { Upload, Download, Smartphone, Tablet, Laptop, ImageIcon } from "lucide-react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const Index = () => {
  const [device, setDevice] = useState<DeviceType>("iphone16pro");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(50);
  const [dropShadow, setDropShadow] = useState(0);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `mockup-${device}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }, [device]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-6 py-4 flex items-center gap-3">
        <ImageIcon className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Screen Booth</h1>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-[320px] border-r bg-card p-6 space-y-8 overflow-y-auto">
          {/* Group 1: Files */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">1. Asset</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button variant="outline" className="w-full h-12" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 w-4 h-4" /> {image ? "Change Image" : "Upload Screenshot"}
              </Button>
            </div>
            {/* EXPORT BUTTON - POSITIONED BELOW UPLOAD */}
            <Button onClick={handleExport} disabled={!image || exporting} className="w-full h-12 shadow-lg">
              <Download className="mr-2 w-4 h-4" /> {exporting ? "Exporting..." : "Export PNG"}
            </Button>
          </div>

          {/* Group 2: Devices */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">2. Latest Devices</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "iphone16pro", label: "iPhone 16 Pro", icon: <Smartphone className="w-4 h-4" /> },
                { id: "iphone16", label: "iPhone 16", icon: <Smartphone className="w-4 h-4" /> },
                { id: "ipadpro13", label: "iPad Pro 13 (M4)", icon: <Tablet className="w-4 h-4" /> },
                { id: "ipadair13", label: "iPad Air 13 (M2)", icon: <Tablet className="w-4 h-4" /> },
                { id: "macbook14", label: "MBP 14 (M3)", icon: <Laptop className="w-4 h-4" /> },
                { id: "macbook16", label: "MBP 16 (M3)", icon: <Laptop className="w-4 h-4" /> },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id as DeviceType)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-[9px] transition-all font-bold ${
                    device === d.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  {d.icon}
                  <span className="mt-1">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Group 3: Customization */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Scale</Label><span className="text-xs">{deviceScale}%</span></div>
              <Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Drop Shadow</Label><span className="text-xs">{dropShadow}%</span></div>
              <Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} />
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-muted/30 flex items-center justify-center p-10 overflow-auto">
          <div 
            ref={canvasRef}
            className="flex items-center justify-center relative shadow-2xl bg-white"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${Math.min(1, 800 / CANVAS_WIDTH)})`,
            }}
          >
            <div style={{ transform: `scale(${deviceScale / 100})` }}>
              <DeviceFrame device={device} image={image} dropShadow={dropShadow} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;