import React, { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { Upload, Download, Smartphone, Tablet, Laptop, ImageIcon } from "lucide-react";

// Fixed 16:9 canvas
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const Index = () => {
  const [device, setDevice] = useState<DeviceType>("iphone");
  const [image, setImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [deviceScale, setDeviceScale] = useState(50);
  const [dropShadow, setDropShadow] = useState(0);
  const [innerGlow, setInnerGlow] = useState(0);
  const [exporting, setExporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scaleFactor = deviceScale / 100;

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
      const el = canvasRef.current;
      const origBg = el.style.backgroundImage;
      if (transparent) {
        el.style.backgroundImage = "none";
        el.style.backgroundColor = "transparent";
      }
      const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
      if (transparent) {
        el.style.backgroundImage = origBg;
      }
      const link = document.createElement("a");
      link.download = `mockup-${device}-${CANVAS_WIDTH}x${CANVAS_HEIGHT}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [device, transparent]);

  const deviceIcons = {
    iphone: <Smartphone className="w-4 h-4" />,
    ipad: <Tablet className="w-4 h-4" />,
    macbook: <Laptop className="w-4 h-4" />,
  };

  const previewScale = Math.min(1, 800 / CANVAS_WIDTH, 700 / CANVAS_HEIGHT);

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <aside className="w-full lg:w-[320px] border-b lg:border-b-0 lg:border-r border-border bg-card p-6 space-y-6 shrink-0 overflow-y-auto">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Screenshot</Label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <Button variant="outline" className="w-full gap-2 h-11" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" />
              {image ? "Replace image" : "Upload image"}
            </Button>
          </div>

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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Size</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{deviceScale}%</span>
            </div>
            <Slider
              value={[deviceScale]}
              onValueChange={(v) => setDeviceScale(v[0])}
              min={10}
              max={150}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Background</Label>
            <button
              onClick={() => setTransparent(!transparent)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-all ${
                transparent
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <div className="w-5 h-5 rounded border border-border overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0">
                <div style={{ background: "#fff" }} /><div style={{ background: "#ccc" }} />
                <div style={{ background: "#ccc" }} /><div style={{ background: "#fff" }} />
              </div>
              Transparent
            </button>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drop Shadow</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{dropShadow}%</span>
            </div>
            <Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} min={0} max={100} step={1} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inner Glow</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{innerGlow}%</span>
            </div>
            <Slider value={[innerGlow]} onValueChange={(v) => setInnerGlow(v[0])} min={0} max={100} step={1} />
          </div>

          <div className="rounded-xl border border-border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Export size</p>
            <p className="text-sm font-medium text-foreground tabular-nums">{CANVAS_WIDTH} × {CANVAS_HEIGHT}px</p>
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-6 lg:p-10 flex items-center justify-center bg-background">
          <div className="relative">
            <div style={{ width: CANVAS_WIDTH * previewScale, height: CANVAS_HEIGHT * previewScale }}>
              <div
                ref={canvasRef}
                className="flex items-center justify-center origin-top-left"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${previewScale})`,
                  backgroundColor: transparent ? "transparent" : bgColor,
                  backgroundImage: transparent
                    ? "repeating-conic-gradient(#d4d4d4 0% 25%, transparent 0% 50%) 0 0 / 20px 20px"
                    : "none",
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{ transform: `scale(${scaleFactor})`, transformOrigin: "center" }}
                >
                  <DeviceFrame device={device} image={image} dropShadow={dropShadow} innerGlow={innerGlow} />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground tabular-nums">
              {CANVAS_WIDTH} × {CANVAS_HEIGHT}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
