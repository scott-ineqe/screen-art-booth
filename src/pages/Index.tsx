import React, { useState, useRef, useCallback, useEffect } from "react";
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
  const [previewScale, setPreviewScale] = useState(0.5);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainAreaRef = useRef<HTMLElement>(null);

  // Dynamically scale the canvas so it always fits perfectly in the center of the available space
  useEffect(() => {
    const calculateScale = () => {
      if (!mainAreaRef.current) return;
      const { clientWidth, clientHeight } = mainAreaRef.current;
      // Add a small 40px buffer margin around the canvas
      const scaleX = (clientWidth - 80) / CANVAS_WIDTH;
      const scaleY = (clientHeight - 80) / CANVAS_HEIGHT;
      setPreviewScale(Math.min(scaleX, scaleY));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, []);

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
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  }, [device]);

  return (
    // Strictly lock the container to the viewport height to prevent unwanted page scrolling
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card px-6 py-4 shrink-0 z-10 relative">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <ImageIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Screen Booth</h1>
        </div>
      </header>

      {/* min-h-0 is essential here to prevent flex children from blowing out the bounds */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] border-r bg-card p-6 space-y-8 overflow-y-auto shrink-0 z-10 relative">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">1. Manage Asset</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button variant="outline" className="w-full h-12 shadow-sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 w-4 h-4" /> {image ? "Change Image" : "Upload Screenshot"}
              </Button>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={!image || exporting} 
              className="w-full h-12 shadow-md transition-all active:scale-95"
            >
              <Download className="mr-2 w-4 h-4" /> 
              {exporting ? "Preparing..." : "Export PNG"}
            </Button>
          </div>

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

          <div className="space-y-6 pt-4 border-t border-border">
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Scale Inside Canvas</Label><span className="text-xs font-mono">{deviceScale}%</span></div>
              <Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Drop Shadow</Label><span className="text-xs font-mono">{dropShadow}%</span></div>
              <Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} />
            </div>
          </div>
        </aside>

        {/* Main Canvas Area - Strictly hidden overflow to maintain dead-center alignment */}
        <main 
          ref={mainAreaRef}
          className="flex-1 relative flex items-center justify-center bg-muted/20 overflow-hidden"
        >
          {/* Background grid decoupled from scaled canvas */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Scaled Wrapper: Visually shrinks the 1920x1080 canvas to fit perfectly on the monitor */}
          <div
            className="flex items-center justify-center origin-center"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${previewScale})`,
            }}
          >
            {/* The Actual Exportable Canvas */}
            <div 
              ref={canvasRef}
              className="w-full h-full flex items-center justify-center relative bg-white shadow-xl overflow-hidden"
            >
              <div style={{ transform: `scale(${deviceScale / 100})` }}>
                <DeviceFrame device={device} image={image} dropShadow={dropShadow} />
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Index;