import React, { useState, useRef, useCallback, useEffect } from "react";
import { toPng, toJpeg, toSvg, toCanvas } from "html-to-image";
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
import { Upload, Download, Smartphone, Tablet, Laptop, ImageIcon, ImagePlus, Play, RotateCcw } from "lucide-react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

type ExportFormat = "png" | "jpeg" | "svg" | "mp4";

const Index = () => {
  const [device, setDevice] = useState<DeviceType>("iphone17");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0); // Tracks frame rendering progress
  const [previewScale, setPreviewScale] = useState(0.5);
  
  // Lighting & Shadow State
  const [dropShadow, setDropShadow] = useState(30);
  const [dropShadowAngle, setDropShadowAngle] = useState(180); 
  const [dropShadowAllSides, setDropShadowAllSides] = useState(false);
  const [innerGlow, setInnerGlow] = useState(0);
  const [innerGlowAngle, setInnerGlowAngle] = useState(0); 

  // Animation State
  const [animEnabled, setAnimEnabled] = useState(false);
  const [animStartScale, setAnimStartScale] = useState(40);
  const [animEndScale, setAnimEndScale] = useState(90);
  const [animDuration, setAnimDuration] = useState(2); 
  const [animEasing, setAnimEasing] = useState("ease-in-out");
  const [isPlaying, setIsPlaying] = useState(false);

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  
  // Background State Variables
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);

  // Export Options State
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState<string>("2");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const animTargetRef = useRef<HTMLDivElement>(null); // Ref for capturing animation transformations
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handlePlayAnimation = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const handleResetAnimation = () => setIsPlaying(false);

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setExportProgress(0);
    
    try {
      const pixelRatio = parseFloat(exportQuality);
      const effectiveBgColor = transparent && exportFormat === "jpeg" 
        ? "#ffffff" 
        : (transparent ? "rgba(0,0,0,0)" : bgColor);

      // --- VIDEO EXPORT HANDLER ---
      if (exportFormat === "mp4") {
        if (!animTargetRef.current) throw new Error("Missing animation target node.");
        
        const fps = 30;
        const duration = animEnabled ? animDuration : 1; 
        const totalFrames = duration * fps;
        const frames: HTMLCanvasElement[] = [];
        
        const el = canvasRef.current;
        const targetNode = animTargetRef.current;
        
        // Save user's current styling to restore after export
        const originalTransition = targetNode.style.transitionProperty;
        const originalTransform = targetNode.style.transform;
        
        // Turn off real CSS transitions to manually render frames
        targetNode.style.transitionProperty = 'none';
        
        // 1. OFFLINE RENDERER (Takes ~2-3 seconds)
        for (let i = 0; i <= totalFrames; i++) {
            const t = i / totalFrames;
            
            // Calculate easing mathematically
            let easeT = t;
            if (animEasing === 'ease-in-out') easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            else if (animEasing === 'ease-in') easeT = t * t;
            else if (animEasing === 'ease-out') easeT = t * (2 - t);
            
            const startS = animEnabled ? animStartScale : deviceScale;
            const endS = animEnabled ? animEndScale : deviceScale;
            const currentScale = startS + (endS - startS) * easeT;
            
            targetNode.style.transform = `scale(${currentScale / 100})`;
            
            // Brief pause allows the DOM layout to catch up
            await new Promise(r => setTimeout(r, 5));
            
            const frameCanvas = await toCanvas(el, { 
                pixelRatio: 1, // Video frames must be 1x resolution to avoid canvas memory overflow
                cacheBust: true,
                backgroundColor: effectiveBgColor,
            });
            frames.push(frameCanvas);
            setExportProgress(Math.round((i / totalFrames) * 50)); 
        }
        
        // Restore styles
        targetNode.style.transitionProperty = originalTransition;
        targetNode.style.transform = originalTransform;
        
        // 2. VIDEO ENCODING
        const outCanvas = document.createElement('canvas');
        outCanvas.width = CANVAS_WIDTH;
        outCanvas.height = CANVAS_HEIGHT;
        const ctx = outCanvas.getContext('2d');
        if (!ctx) throw new Error("Could not initialize video context.");
        
        const stream = outCanvas.captureStream(fps);
        
        // Check browser capabilities (Safari natively supports mp4, Chrome/Firefox fall back to webm)
        let mimeType = 'video/webm';
        let ext = 'webm';
        if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
            ext = 'mp4';
        }
        
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) };
        
        const recorderPromise = new Promise<Blob>((resolve) => {
            recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        });
        
        recorder.start();
        
        // Play frames through the recorder at correct FPS
        let frameIdx = 0;
        const interval = setInterval(() => {
            ctx.clearRect(0, 0, outCanvas.width, outCanvas.height);
            ctx.drawImage(frames[frameIdx], 0, 0);
            frameIdx++;
            setExportProgress(50 + Math.round((frameIdx / frames.length) * 50));

            if (frameIdx >= frames.length) {
                clearInterval(interval);
                recorder.stop();
            }
        }, 1000 / fps); 
        
        const blob = await recorderPromise;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `mockup-video.${ext}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
      } else {
        // --- STANDARD IMAGE EXPORT ---
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
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  }, [device, transparent, bgColor, exportFormat, exportQuality, animEnabled, animStartScale, animEndScale, animDuration, animEasing, deviceScale]);

  const activeScale = animEnabled 
    ? (isPlaying ? animEndScale : animStartScale) 
    : deviceScale;

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
        
        <aside className="w-full lg:w-[360px] border-r bg-card p-6 space-y-8 overflow-y-auto shrink-0 z-10 relative custom-scrollbar">
          
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
                  <SelectItem value="mp4">Video (WebM/MP4)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={exportQuality} onValueChange={setExportQuality} disabled={exportFormat === 'mp4' || exporting}>
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
              {exporting 
                ? (exportFormat === 'mp4' ? `Rendering Video (${exportProgress}%)` : "Preparing Export...") 
                : `Export ${exportFormat.toUpperCase()}`
              }
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
            <Label className="text-[10px] font-black uppercase text-muted-foreground">3. Lighting & Shadows</Label>
            
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
              <div className="space-y-3">
                <div className="flex justify-between"><Label>Drop Shadow</Label><span className="text-xs font-mono">{dropShadow}%</span></div>
                <Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} max={100} />
              </div>
              
              {dropShadow > 0 && (
                <>
                  <div className="flex items-center justify-between pt-2">
                    <Label className="text-xs">Shadow on all sides</Label>
                    <Switch checked={dropShadowAllSides} onCheckedChange={setDropShadowAllSides} />
                  </div>
                  
                  {!dropShadowAllSides && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between"><Label className="text-xs text-muted-foreground">Shadow Angle</Label><span className="text-xs font-mono">{dropShadowAngle}°</span></div>
                      <Slider value={[dropShadowAngle]} onValueChange={(v) => setDropShadowAngle(v[0])} max={360} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
              <div className="space-y-3">
                <div className="flex justify-between"><Label>Screen Inner Glow</Label><span className="text-xs font-mono">{innerGlow}%</span></div>
                <Slider value={[innerGlow]} onValueChange={(v) => setInnerGlow(v[0])} max={100} />
              </div>

              {innerGlow > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between"><Label className="text-xs text-muted-foreground">Glow Direction</Label><span className="text-xs font-mono">{innerGlowAngle}°</span></div>
                  <Slider value={[innerGlowAngle]} onValueChange={(v) => setInnerGlowAngle(v[0])} max={360} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase text-muted-foreground">4. Animation</Label>
              <Switch checked={animEnabled} onCheckedChange={setAnimEnabled} />
            </div>

            {animEnabled && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl border animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <div className="flex justify-between"><Label>Start Scale</Label><span className="text-xs font-mono">{animStartScale}%</span></div>
                  <Slider value={[animStartScale]} onValueChange={(v) => setAnimStartScale(v[0])} min={10} max={150} disabled={isPlaying} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><Label>End Scale</Label><span className="text-xs font-mono">{animEndScale}%</span></div>
                  <Slider value={[animEndScale]} onValueChange={(v) => setAnimEndScale(v[0])} min={10} max={150} disabled={isPlaying} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><Label>Duration (seconds)</Label><span className="text-xs font-mono">{animDuration}s</span></div>
                  <Slider value={[animDuration]} onValueChange={(v) => setAnimDuration(v[0])} min={0.5} max={10} step={0.5} disabled={isPlaying} />
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-xs">Easing</Label>
                  <Select value={animEasing} onValueChange={setAnimEasing} disabled={isPlaying}>
                    <SelectTrigger className="h-10 text-xs bg-background">
                      <SelectValue placeholder="Select easing..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear (Constant speed)</SelectItem>
                      <SelectItem value="ease-in">Ease In (Starts slow)</SelectItem>
                      <SelectItem value="ease-out">Ease Out (Ends slow)</SelectItem>
                      <SelectItem value="ease-in-out">Ease In Out (Smooth ends)</SelectItem>
                      <SelectItem value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Bouncy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handlePlayAnimation} disabled={isPlaying} className="flex-1 font-semibold">
                    <Play className="w-4 h-4 mr-2 fill-current" /> Play
                  </Button>
                  <Button variant="outline" onClick={handleResetAnimation} disabled={!isPlaying} className="px-3" title="Reset Animation">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 pt-4 border-t border-border pb-8">
            <Label className="text-[10px] font-black uppercase text-muted-foreground">5. Canvas & Background</Label>
            
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
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                  </div>
                  <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} placeholder="#FFFFFF" className="font-mono uppercase h-10" maxLength={7} />
                </div>
              )}
            </div>

            {!animEnabled && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between"><Label>Scale Inside Canvas</Label><span className="text-xs font-mono">{deviceScale}%</span></div>
                <Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} />
              </div>
            )}
          </div>
        </aside>

        <main 
          ref={mainAreaRef}
          className="flex-1 relative flex items-center justify-center bg-muted/20 overflow-hidden"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-primary/5 border-4 border-primary/50 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-200">
              <div className="bg-background/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 pointer-events-none">
                <div className="bg-primary/10 p-4 rounded-full"><ImagePlus className="w-12 h-12 text-primary" /></div>
                <div className="text-center">
                  <p className="text-xl font-bold tracking-tight">Drop Image Here</p>
                  <p className="text-sm text-muted-foreground mt-1">Updates the device screen instantly</p>
                </div>
              </div>
            </div>
          )}

          <div 
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{ backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />

          <div
            className="flex items-center justify-center origin-center shadow-2xl transition-colors duration-300"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${previewScale})`,
              backgroundColor: transparent ? 'transparent' : bgColor,
              ...(transparent && { backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)", backgroundSize: "40px 40px" })
            }}
          >
            <div 
              ref={canvasRef}
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: transparent ? "transparent" : bgColor }}
            >
              <div 
                ref={animTargetRef}
                style={{ 
                  transform: `scale(${activeScale / 100})`,
                  transitionProperty: 'transform',
                  transitionDuration: animEnabled && isPlaying ? `${animDuration}s` : '0s',
                  transitionTimingFunction: animEasing,
                }}
              >
                <DeviceFrame 
                  device={device} image={image} dropShadow={dropShadow} dropShadowAngle={dropShadowAngle} dropShadowAllSides={dropShadowAllSides} innerGlow={innerGlow} innerGlowAngle={innerGlowAngle} onUploadClick={() => fileInputRef.current?.click()} 
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