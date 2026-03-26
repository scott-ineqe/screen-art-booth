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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { Upload, Download, Smartphone, Tablet, Laptop, ImageIcon, ImagePlus, Play, RotateCcw } from "lucide-react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

type ExportFormat = "png" | "jpeg" | "svg" | "video" | "gif";

const loadGifJs = async () => {
  if ((window as any).GIF) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const Index = () => {
  const [device, setDevice] = useState<DeviceType>("iphone17");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [previewScale, setPreviewScale] = useState(0.5);
  
  const [dropShadow, setDropShadow] = useState(30);
  const [dropShadowAngle, setDropShadowAngle] = useState(180); 
  const [dropShadowAllSides, setDropShadowAllSides] = useState(false);
  const [innerGlow, setInnerGlow] = useState(0);
  const [innerGlowAngle, setInnerGlowAngle] = useState(0); 

  const [animEnabled, setAnimEnabled] = useState(false);
  const [animStartScale, setAnimStartScale] = useState(40);
  const [animEndScale, setAnimEndScale] = useState(90);
  const [animDuration, setAnimDuration] = useState(2); 
  const [animEasing, setAnimEasing] = useState("ease-in-out");
  const [isPlaying, setIsPlaying] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  
  const [bgColor, setBgColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState<string>("2");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const animTargetRef = useRef<HTMLDivElement>(null);
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
    setExportStatus("Preparing...");
    
    try {
      const pixelRatio = parseFloat(exportQuality);
      const effectiveBgColor = transparent && exportFormat === "jpeg" 
        ? "#ffffff" 
        : (transparent ? "rgba(0,0,0,0)" : bgColor);

      if (exportFormat === "video" || exportFormat === "gif") {
        if (!animTargetRef.current) throw new Error("Missing animation target node.");
        
        const isGif = exportFormat === "gif";
        const fps = isGif ? 15 : 30;
        const resRatio = isGif ? 0.5 : 1; 
        
        const duration = animEnabled ? animDuration : 1; 
        const totalFrames = duration * fps;
        const frames: HTMLCanvasElement[] = [];
        
        const el = canvasRef.current;
        const targetNode = animTargetRef.current;
        
        const originalTransition = targetNode.style.transitionProperty;
        const originalTransform = targetNode.style.transform;
        targetNode.style.transitionProperty = 'none';
        
        setExportStatus("Rendering Frames...");
        for (let i = 0; i <= totalFrames; i++) {
            const t = i / totalFrames;
            
            let easeT = t;
            if (animEasing === 'ease-in-out') easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            else if (animEasing === 'ease-in') easeT = t * t;
            else if (animEasing === 'ease-out') easeT = t * (2 - t);
            
            const startS = animEnabled ? animStartScale : deviceScale;
            const endS = animEnabled ? animEndScale : deviceScale;
            const currentScale = startS + (endS - startS) * easeT;
            
            targetNode.style.transform = `scale(${currentScale / 100})`;
            await new Promise(r => setTimeout(r, 5));
            
            const frameCanvas = await toCanvas(el, { 
                pixelRatio: resRatio, 
                cacheBust: true,
                backgroundColor: effectiveBgColor,
            });
            frames.push(frameCanvas);
            setExportProgress(Math.round((i / totalFrames) * 50)); 
        }
        
        targetNode.style.transitionProperty = originalTransition;
        targetNode.style.transform = originalTransform;

        if (isGif) {
          setExportStatus("Encoding GIF...");
          await loadGifJs();
          
          const workerReq = await fetch("https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js");
          const workerBlob = await workerReq.blob();
          const workerUrl = URL.createObjectURL(workerBlob);

          const gif = new (window as any).GIF({
            workers: 2,
            quality: 10,
            width: CANVAS_WIDTH * resRatio,
            height: CANVAS_HEIGHT * resRatio,
            workerScript: workerUrl,
            transparent: transparent ? "rgba(0,0,0,0)" : null,
          });

          frames.forEach(frame => {
            gif.addFrame(frame, { delay: 1000 / fps, copy: true });
          });

          gif.on('progress', (p: number) => setExportProgress(50 + Math.round(p * 50)));

          gif.on('finished', (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `mockup-animated.${exportFormat}`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(workerUrl);
            setExporting(false);
          });

          gif.render();
          return; 
        } 
        
        setExportStatus("Encoding Video...");
        const outCanvas = document.createElement('canvas');
        outCanvas.width = CANVAS_WIDTH;
        outCanvas.height = CANVAS_HEIGHT;
        const ctx = outCanvas.getContext('2d');
        if (!ctx) throw new Error("Could not initialize video context.");
        
        const stream = outCanvas.captureStream(fps);
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
      if (exportFormat !== "gif") {
        setExporting(false);
        setExportProgress(0);
      }
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
        
        <aside className="w-full lg:w-[360px] border-r bg-card flex flex-col shrink-0 z-10 relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Accordion grouping for a cleaner UI */}
            <Accordion type="multiple" defaultValue={["asset", "frame"]} className="w-full">
              
              {/* Asset & Export Section */}
              <AccordionItem value="asset" className="border-b px-6">
                <AccordionTrigger className="text-[11px] font-black uppercase text-muted-foreground hover:no-underline py-4">
                  Manage Asset
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-6">
                  <div className="space-y-2">
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
                        <SelectItem value="gif">Animated GIF</SelectItem>
                        <SelectItem value="video">Video (Browser Native)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={exportQuality} 
                      onValueChange={setExportQuality} 
                      disabled={exportFormat === 'video' || exportFormat === 'gif' || exporting}
                    >
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
                      ? `${exportStatus} (${exportProgress}%)` 
                      : `Export ${exportFormat.toUpperCase()}`
                    }
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Frame Selection Section */}
              <AccordionItem value="frame" className="border-b px-6">
                <AccordionTrigger className="text-[11px] font-black uppercase text-muted-foreground hover:no-underline py-4">
                  Select Frame
                </AccordionTrigger>
                <AccordionContent className="grid grid-cols-1 gap-2 pb-6">
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
                </AccordionContent>
              </AccordionItem>

              {/* Lighting & Shadows Section */}
              <AccordionItem value="lighting" className="border-b px-6">
                <AccordionTrigger className="text-[11px] font-black uppercase text-muted-foreground hover:no-underline py-4">
                  Lighting & Shadows
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-6 pt-2">
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
                </AccordionContent>
              </AccordionItem>

              {/* Animation Section */}
              <AccordionItem value="animation" className="border-b px-6">
                <AccordionTrigger className="text-[11px] font-black uppercase text-muted-foreground hover:no-underline py-4">
                  Animation
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pb-6 pt-2">
                  <div className="flex items-center justify-between pb-2">
                    <Label className="text-sm font-medium cursor-pointer" onClick={() => setAnimEnabled(!animEnabled)}>Enable Animation</Label>
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
                </AccordionContent>
              </AccordionItem>

              {/* Canvas & Background Section */}
              <AccordionItem value="canvas" className="border-b-0 px-6">
                <AccordionTrigger className="text-[11px] font-black uppercase text-muted-foreground hover:no-underline py-4">
                  Canvas & Background
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pb-8 pt-2">
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
                </AccordionContent>
              </AccordionItem>

            </Accordion>
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