import React, { useState, useRef, useCallback, useEffect } from "react";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { Upload, Download, Smartphone, Tablet, Laptop, ImageIcon, ImagePlus } from "lucide-react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

type ExportFormat = "png" | "jpeg" | "svg";

const Index = () => {
  const [device, setDevice] = useState<DeviceType>("iphone17");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(60);
  const [dropShadow, setDropShadow] = useState(30);
  const [exporting, setExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);
  
  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  
  // Background State Variables
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);

  // Export Options State
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState<string>("2");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainAreaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const calculateScale = () => {
      if (!mainAreaRef.current) return;
      const { clientWidth, clientHeight } = mainAreaRef.current;
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

  // Drag and Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const pixelRatio = parseFloat(exportQuality);
      const effectiveBgColor = transparent && exportFormat === "jpeg" 
        ? "#ffffff" 
        : (transparent ? "rgba(0,0,0,0)" : bgColor);

      const exportOptions = { 
        pixelRatio, 
        cacheBust: true,
        backgroundColor: effectiveBgColor,
      };

      let dataUrl;
      if (exportFormat === "jpeg") {
        dataUrl = await toJpeg(canvasRef.current, { ...exportOptions, quality: 0.95 });
      } else if (exportFormat === "svg") {
        dataUrl = await toSvg(canvasRef.current, exportOptions);
      } else {
        dataUrl = await toPng(canvasRef.current, exportOptions);
      }

      const link = document.createElement("a");
      link.download = `mockup-${device}-${exportQuality}x.${exportFormat}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  }, [device, transparent, bgColor, exportFormat, exportQuality]);

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card px-6 py-4 shrink-0 z-10 relative">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <ImageIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Screen Booth</h1>
        </div>
      </header>

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

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Select value={exportFormat} onValueChange={(val: ExportFormat) => setExportFormat(val)}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                </SelectContent>
              </Select>

              <Select value={exportQuality} onValueChange={setExportQuality}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x (Standard)</SelectItem>
                  <SelectItem value="2">2x (High)</SelectItem>
                  <SelectItem value="3">3x (Ultra)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleExport} 
              disabled={!image || exporting} 
              className="w-full h-12 shadow-md transition-all active:scale-95 font-semibold"
            >
              <Download className="mr-2 w-4 h-4" /> 
              {exporting ? "Preparing..." : `Export ${exportFormat.toUpperCase()}`}
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
            <Label className="text-[10px] font-black uppercase text-muted-foreground">3. Canvas & Background</Label>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium cursor-pointer" onClick={() => setTransparent(!transparent)}>
                  Transparent Background
                </Label>
                <Switch checked={transparent} onCheckedChange={setTransparent} />
              </div>

              {!transparent && (
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-md border border-border overflow-hidden shrink-0">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="font-mono uppercase h-10"
                    maxLength={7}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between"><Label>Scale Inside Canvas</Label><span className="text-xs font-mono">{deviceScale}%</span></div>
              <Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between"><Label>Drop Shadow</Label><span className="text-xs font-mono">{dropShadow}%</span></div>
              <Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} />
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main 
          ref={mainAreaRef}
          className="flex-1 relative flex items-center justify-center bg-muted/20 overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-primary/5 border-4 border-primary/50 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-200">
              <div className="bg-background/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 pointer-events-none">
                <div className="bg-primary/10 p-4 rounded-full">
                  <ImagePlus className="w-12 h-12 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold tracking-tight">Drop Image Here</p>
                  <p className="text-sm text-muted-foreground mt-1">Updates the device screen instantly</p>
                </div>
              </div>
            </div>
          )}

          <div 
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          <div
            className="flex items-center justify-center origin-center shadow-2xl transition-colors duration-300"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${previewScale})`,
              backgroundColor: transparent ? 'transparent' : bgColor,
              ...(transparent && {
                backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)",
                backgroundSize: "40px 40px",
              })
            }}
          >
            <div 
              ref={canvasRef}
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: transparent ? "transparent" : bgColor,
              }}
            >
              <div style={{ transform: `scale(${deviceScale / 100})` }}>
                <DeviceFrame 
                  device={device} 
                  image={image} 
                  dropShadow={dropShadow} 
                  onUploadClick={() => fileInputRef.current?.click()} // Trigger input directly from frame click
                />
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Index;