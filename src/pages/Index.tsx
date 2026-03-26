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
  const [device, setDevice] = useState<DeviceType>("iphone17");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(60);
  const [dropShadow, setDropShadow] = useState(30);
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
      // High-resolution export
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = `mockup-${device}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  }, [device]);

  const previewScale = Math.min(1, 800 / CANVAS_WIDTH, 700 / CANVAS_HEIGHT);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <ImageIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Screen Booth</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] border-r bg-card p-6 space-y-8 overflow-y-auto">
          
          {/* Action Group: Upload & Export */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">1. Manage Asset</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button variant="outline" className="w-full h-12 shadow-sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 w-4 h-4" /> {image ? "Change Image" : "Upload Screenshot"}
              </Button>
            </div>

            {/* Export button placed directly below the upload button */}
            <Button 
              onClick={handleExport} 
              disabled={!image || exporting} 
              className="w-full h-12 shadow-md transition-all active:scale-95"
            >
              <Download className="mr-2 w-4 h-4" /> 
              {exporting ? "Preparing..." : "Export PNG"}
            </Button>
          </div>

          {/* Device Selection */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">2. Select Frame</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "iphone17", label: "iPhone 17", icon: <Smartphone className="w-4 h-4" /> },
                { id: "ipad-air", label: "iPad Air", icon: <Tablet className="w-4 h-4" /> },
                { id: "macbook-pro-16", label: "MacBook Pro 16", icon: <Laptop className="w-4 h-4" /> },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id as DeviceType)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    device === d.id 
                      ? "border-primary bg-primary/10 text-primary shadow-inner" 
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  {d.icon}
                  <span className="font-bold text-sm">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="space-y-6 pt-4 border-t">
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Scale</Label><span className="text-xs font-mono">{deviceScale}%</span></div>
              <Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Drop Shadow</Label><span className="text-xs font-mono">{dropShadow}%</span></div>
              <Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} />
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 bg-muted/10 flex items-center justify-center p-10 overflow-auto">
          <div 
            ref={canvasRef}
            className="flex items-center justify-center relative shadow-2xl bg-white"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${previewScale})`,
              backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
              backgroundSize: "20px 20px"
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