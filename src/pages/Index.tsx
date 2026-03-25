import React, { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { Upload, Download, Smartphone, Tablet, Laptop, ImageIcon } from "lucide-react";

const Index = () => {
  const [device, setDevice] = useState<DeviceType>("iphone");
  const [image, setImage] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(1200);
  const [canvasHeight, setCanvasHeight] = useState(900);
  const [borderSize, setBorderSize] = useState(80);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [deviceScale, setDeviceScale] = useState(100);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      // Temporarily remove checkerboard for transparent export
      const el = canvasRef.current;
      const origBg = el.style.backgroundImage;
      if (transparent) {
        el.style.backgroundImage = "none";
        el.style.backgroundColor = "transparent";
      }
      const dataUrl = await toPng(el, {
        width: canvasWidth,
        height: canvasHeight,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: transparent ? undefined : undefined,
      });
      // Restore
      if (transparent) {
        el.style.backgroundImage = origBg;
      }
      const link = document.createElement("a");
      link.download = `mockup-${device}-${canvasWidth}x${canvasHeight}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [canvasWidth, canvasHeight, device, transparent]);

  const deviceIcons = {
    iphone: <Smartphone className="w-4 h-4" />,
    ipad: <Tablet className="w-4 h-4" />,
    macbook: <Laptop className="w-4 h-4" />,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">Device Mockup</h1>
              <p className="text-xs text-muted-foreground">Drop your screenshot into a realistic device frame</p>
            </div>
          </div>
          <Button onClick={handleExport} disabled={!image || exporting} className="gap-2">
            <Download className="w-4 h-4" />
            {exporting ? "Exporting…" : "Export PNG"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar controls */}
        <aside className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-border bg-card p-6 space-y-6 shrink-0">
          {/* Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Screenshot</Label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <Button
              variant="outline"
              className="w-full gap-2 h-11"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {image ? "Replace image" : "Upload image"}
            </Button>
          </div>

          {/* Device select */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Device</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["iphone", "ipad", "macbook"] as DeviceType[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    device === d
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {deviceIcons[d]}
                  <span className="capitalize">{d === "macbook" ? "MacBook" : d === "iphone" ? "iPhone" : "iPad"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas dimensions */}
          <div className="space-y-4">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Canvas Size</Label>
            
            {/* Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Width</label>
                <Input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Math.min(4000, Math.max(400, Number(e.target.value))))}
                  min={400}
                  max={4000}
                  className="w-20 h-7 text-xs text-right"
                />
              </div>
              <Slider
                value={[canvasWidth]}
                onValueChange={(v) => setCanvasWidth(v[0])}
                min={400}
                max={4000}
                step={10}
              />
            </div>

            {/* Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Height</label>
                <Input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => setCanvasHeight(Math.min(4000, Math.max(400, Number(e.target.value))))}
                  min={400}
                  max={4000}
                  className="w-20 h-7 text-xs text-right"
                />
              </div>
              <Slider
                value={[canvasHeight]}
                onValueChange={(v) => setCanvasHeight(v[0])}
                min={400}
                max={4000}
                step={10}
              />
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "1:1", w: 1080, h: 1080 },
                { label: "16:9", w: 1920, h: 1080 },
                { label: "4:5", w: 1080, h: 1350 },
                { label: "Story", w: 1080, h: 1920 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setCanvasWidth(p.w); setCanvasHeight(p.h); }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background</Label>
            
            {/* Transparent toggle */}
            <button
              onClick={() => setTransparent(!transparent)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-all ${
                transparent
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              {/* Checkerboard icon */}
              <div className="w-5 h-5 rounded border border-border overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0">
                <div className="bg-white" /><div className="bg-gray-300" />
                <div className="bg-gray-300" /><div className="bg-white" />
              </div>
              Transparent
            </button>

            {/* Color picker - only show when not transparent */}
            {!transparent && (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBgColor(v);
                  }}
                  placeholder="#ffffff"
                  className="flex-1 h-10 font-mono text-sm uppercase"
                />
              </div>
            )}
          </div>

          {/* Border size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Padding</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{borderSize}px</span>
            </div>
            <Slider
              value={[borderSize]}
              onValueChange={(v) => setBorderSize(v[0])}
              min={0}
              max={200}
              step={4}
            />
          </div>

          {/* Device scale */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Scale</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{deviceScale}%</span>
            </div>
            <Slider
              value={[deviceScale]}
              onValueChange={(v) => setDeviceScale(v[0])}
              min={30}
              max={200}
              step={1}
            />
          </div>

        {/* Canvas preview */}
        <main className="flex-1 overflow-auto p-6 lg:p-10 flex items-center justify-center bg-background">
          <div className="relative">
            {/* Visual preview (scaled to fit) */}
            <div
              className="origin-top-left"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${Math.min(1, 700 / canvasWidth, 600 / canvasHeight)})`,
              }}
            >
              <div
                ref={canvasRef}
                className="flex items-center justify-center"
                style={{
                  width: canvasWidth,
                  height: canvasHeight,
                  padding: borderSize,
                  backgroundColor: transparent ? "transparent" : bgColor,
                  backgroundImage: transparent
                    ? "repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%) 0 0 / 20px 20px"
                    : "none",
                }}
              >
                <div className="flex items-center justify-center" style={{ transform: "scale(1)", transformOrigin: "center" }}>
                  <DeviceFrame device={device} image={image} />
                </div>
              </div>
            </div>
            {/* Dimensions label */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground tabular-nums">
              {canvasWidth} × {canvasHeight}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
