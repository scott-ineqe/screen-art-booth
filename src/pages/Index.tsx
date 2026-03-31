import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { toPng, toJpeg, toSvg, toCanvas } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { 
  Upload, Download, Smartphone, Tablet, Laptop, ImageIcon, 
  Play, RotateCcw, Crosshair, Move, Timer, Moon, Sun, Monitor, 
  Layers, Sparkles, Video, Boxes, Palette, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type ExportFormat = "png" | "jpeg" | "svg" | "video" | "gif";
type CanvasRatio = "16:9" | "9:16" | "1:1" | "4:5";
type AppMode = "mockup" | "animation";

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
  // --- Core State ---
  const [mode, setMode] = useState<AppMode>("mockup");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [device, setDevice] = useState<DeviceType>("iphone17");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [previewScale, setPreviewScale] = useState(0.5);

  // --- Lighting State ---
  const [dropShadow, setDropShadow] = useState(30);
  const [dropShadowAngle, setDropShadowAngle] = useState(180); 
  const [dropShadowAllSides, setDropShadowAllSides] = useState(false);
  const [dropShadowColor, setDropShadowColor] = useState("#000000");
  const [innerGlow, setInnerGlow] = useState(0);
  const [innerGlowAngle, setInnerGlowAngle] = useState(0); 

  // --- Animation State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [animDuration, setAnimDuration] = useState(2); 
  const [animEasing, setAnimEasing] = useState("ease-in-out");
  const [animStartScale, setAnimStartScale] = useState(40);
  const [animEndScale, setAnimEndScale] = useState(90);
  const [animStartRot, setAnimStartRot] = useState(0);
  const [animEndRot, setAnimEndRot] = useState(0);
  const [animRotDirection, setAnimRotDirection] = useState<"cw" | "ccw">("cw");
  const [animStartX, setAnimStartX] = useState(0);
  const [animStartY, setAnimStartY] = useState(0);
  const [animEndX, setAnimEndX] = useState(0);
  const [animEndY, setAnimEndY] = useState(0);
  const [scrubProgress, setScrubProgress] = useState(0);

  // --- Canvas Position State ---
  const [canvasX, setCanvasX] = useState(0);
  const [canvasY, setCanvasY] = useState(0);
  const [transparent, setTransparent] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState<CanvasRatio>("16:9");

  // --- Background Options State ---
  const [bgType, setBgType] = useState<"solid" | "gradient" | "image">("solid");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgGradientType, setBgGradientType] = useState<"linear" | "radial">("linear");
  const [bgGradientColor1, setBgGradientColor1] = useState("#e2e8f0");
  const [bgGradientColor2, setBgGradientColor2] = useState("#ffffff");
  const [bgGradientAngle, setBgGradientAngle] = useState(135);
  const [bgGradientStop1, setBgGradientStop1] = useState(0);
  const [bgGradientStop2, setBgGradientStop2] = useState(100);
  const [bgRadialX, setBgRadialX] = useState(50);
  const [bgRadialY, setBgRadialY] = useState(50);
  const [bgImage, setBgImage] = useState<string | null>(null);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState<string>("2");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const animTargetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const mainAreaRef = useRef<HTMLElement>(null);

  // Theme Sync
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Mode Sync - Update formats when mode changes
  useEffect(() => {
    if (mode === "animation") setExportFormat("gif");
    else setExportFormat("png");
  }, [mode]);

  const canvasDimensions = useMemo(() => {
    const map = { "9:16": [1080, 1920], "1:1": [1080, 1080], "4:5": [1080, 1350] };
    const [w, h] = map[canvasRatio as keyof typeof map] || [1920, 1080];
    return { width: w, height: h };
  }, [canvasRatio]);

  const CANVAS_WIDTH = canvasDimensions.width;
  const CANVAS_HEIGHT = canvasDimensions.height;

  useEffect(() => {
    const calculateScale = () => {
      if (!mainAreaRef.current) return;
      const { width, height } = mainAreaRef.current.getBoundingClientRect();
      const padding = 80;
      const scaleX = (width - padding) / CANVAS_WIDTH;
      const scaleY = (height - padding) / CANVAS_HEIGHT;
      setPreviewScale(Math.min(scaleX, scaleY));
    };
    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]); 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePlayAnimation = () => {
    setIsPlaying(false);
    setScrubProgress(0);
    setTimeout(() => { setIsPlaying(true); setScrubProgress(100); }, 50);
  };

  const getInterpolatedTransform = useCallback((t: number) => {
    const getEasingT = (time: number) => {
      if (animEasing === 'ease-in-out') return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
      if (animEasing === 'ease-in') return time * time;
      if (animEasing === 'ease-out') return time * (2 - time);
      return time;
    };
    const easeT = getEasingT(t);
    const actualEndRot = (() => {
        if (animStartRot === animEndRot) return animEndRot;
        if (animRotDirection === "cw" && animEndRot < animStartRot) return animEndRot + 360;
        if (animRotDirection === "ccw" && animEndRot > animStartRot) return animEndRot - 360;
        return animEndRot;
    })();

    return {
      s: animStartScale + (animEndScale - animStartScale) * easeT,
      r: animStartRot + (actualEndRot - animStartRot) * easeT,
      x: canvasX + (animStartX + (animEndX - animStartX) * easeT),
      y: canvasY + (animStartY + (animEndY - animStartY) * easeT)
    };
  }, [animEasing, animStartRot, animEndRot, animRotDirection, animStartScale, animEndScale, canvasX, canvasY, animStartX, animEndX, animStartY, animEndY]);

  const getCanvasBackgroundStyles = (): React.CSSProperties => {
    if (transparent) return { backgroundColor: "transparent" };
    if (bgType === "solid") return { backgroundColor: bgColor };
    if (bgType === "gradient") {
      return bgGradientType === "linear" 
        ? { backgroundImage: `linear-gradient(${bgGradientAngle}deg, ${bgGradientColor1} ${bgGradientStop1}%, ${bgGradientColor2} ${bgGradientStop2}%)` }
        : { backgroundImage: `radial-gradient(circle at ${bgRadialX}% ${bgRadialY}%, ${bgGradientColor1} ${bgGradientStop1}%, ${bgGradientColor2} ${bgGradientStop2}%)` };
    }
    return { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ffffff' };
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true); setExportProgress(0); setExportStatus("Preparing...");
    
    try {
      const pixelRatio = parseFloat(exportQuality);
      let effectiveBgColor = (exportFormat === "jpeg") ? ((transparent || bgType !== "solid") ? "#ffffff" : bgColor) : (transparent ? "rgba(0,0,0,0)" : (bgType === "solid" ? bgColor : "rgba(0,0,0,0)"));
      const baseExportOptions = { cacheBust: true, backgroundColor: effectiveBgColor, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, style: { transform: 'none' } };

      if (exportFormat === "video" || exportFormat === "gif") {
        const isGif = exportFormat === "gif";
        const fps = isGif ? 15 : 30;
        const totalFrames = Math.ceil(animDuration * fps);
        const frames: HTMLCanvasElement[] = [];
        const el = canvasRef.current;
        const targetNode = animTargetRef.current!;
        const originalTransition = targetNode.style.transitionProperty;
        targetNode.style.transitionProperty = 'none';
        
        for (let i = 0; i <= totalFrames; i++) {
            const { s, r, x, y } = getInterpolatedTransform(i / totalFrames);
            targetNode.style.transform = `translate(${x}px, ${y}px) scale(${s / 100}) rotate(${r}deg)`;
            await new Promise(res => setTimeout(res, 25));
            frames.push(await toCanvas(el, { ...baseExportOptions, pixelRatio: isGif ? 0.5 : 1 }));
            setExportProgress(Math.round((i / totalFrames) * 50));
        }
        targetNode.style.transitionProperty = originalTransition;

        if (isGif) {
          setExportStatus("Encoding GIF...");
          await loadGifJs();
          const workerReq = await fetch("https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js");
          const workerUrl = URL.createObjectURL(await workerReq.blob());
          const gif = new (window as any).GIF({ workers: 2, quality: 10, width: frames[0].width, height: frames[0].height, workerScript: workerUrl, transparent: transparent ? "rgba(0,0,0,0)" : null });
          frames.forEach(frame => gif.addFrame(frame, { delay: 1000 / fps, copy: true }));
          gif.on('finished', (blob: Blob) => {
            const link = document.createElement('a'); link.download = `booth-animation.gif`; link.href = URL.createObjectURL(blob); link.click();
            setExporting(false);
          });
          gif.render();
        } else {
          setExportStatus("Encoding Video...");
          const outCanvas = document.createElement('canvas'); outCanvas.width = frames[0].width; outCanvas.height = frames[0].height;
          const ctx = outCanvas.getContext('2d')!;
          const stream = outCanvas.captureStream(fps);
          
          let mimeType = 'video/webm';
          const codecs = ['video/mp4;codecs="avc1"', 'video/webm'];
          for (const c of codecs) { if (MediaRecorder.isTypeSupported(c)) { mimeType = c; break; } }

          const recorder = new MediaRecorder(stream, { mimeType });
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = e => chunks.push(e.data);
          recorder.onstop = () => {
            const link = document.createElement('a'); link.download = `booth-video.webm`; link.href = URL.createObjectURL(new Blob(chunks)); link.click();
            setExporting(false);
          };
          recorder.start();
          let f = 0;
          const int = setInterval(() => {
            if (f >= frames.length) { clearInterval(int); setTimeout(() => recorder.stop(), 500); return; }
            ctx.clearRect(0,0,outCanvas.width,outCanvas.height); ctx.drawImage(frames[f++],0,0);
            setExportProgress(50 + Math.round((f / frames.length) * 50));
          }, 1000/fps);
        }
      } else {
        const imageOptions = { ...baseExportOptions, pixelRatio };
        let dataUrl = (exportFormat === "jpeg") ? await toJpeg(canvasRef.current!, { ...imageOptions, quality: 0.95 }) : (exportFormat === "svg" ? await toSvg(canvasRef.current!, imageOptions) : await toPng(canvasRef.current!, imageOptions));
        const link = document.createElement("a"); link.download = `booth-mockup.${exportFormat}`; link.href = dataUrl; link.click();
        setExporting(false);
      }
    } catch (err) { console.error(err); setExporting(false); }
  }, [device, transparent, bgColor, exportFormat, exportQuality, animDuration, animEasing, canvasX, canvasY, bgType, bgImage, bgGradientType, bgGradientColor1, bgGradientColor2, bgGradientAngle, bgGradientStop1, bgGradientStop2, bgRadialX, bgRadialY, CANVAS_WIDTH, CANVAS_HEIGHT, getInterpolatedTransform]);

  const previewState = useMemo(() => {
      if (mode === "mockup") return { s: deviceScale, r: 0, x: canvasX, y: canvasY };
      return getInterpolatedTransform(scrubProgress / 100);
  }, [mode, deviceScale, canvasX, canvasY, getInterpolatedTransform, scrubProgress]);

  // Glassmorphism constants
  const glassCard = "bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl shadow-black/5";

  return (
    <div className="h-[100dvh] w-full bg-[#f1f5f9] dark:bg-[#020617] text-foreground transition-colors duration-700 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 px-6 flex items-center justify-between z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform hover:rotate-6 transition-transform">
            <Sparkles className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">
            SCREEN ART BOOTH
          </span>
        </div>

        <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-[360px]">
          <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1 rounded-full border border-border/40">
            <TabsTrigger value="mockup" className="rounded-full gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Monitor className="w-4 h-4" /> Mock-up
            </TabsTrigger>
            <TabsTrigger value="animation" className="rounded-full gap-2 transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Video className="w-4 h-4" /> Animation
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-background/40 hover:bg-background/80 transition-colors" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <div className="h-6 w-px bg-border/40 mx-1" />
          <Button onClick={handleExport} disabled={exporting || !image} className="rounded-full px-6 font-bold tracking-tight shadow-md hover:shadow-primary/20 transition-all">
            {exporting ? "Processing..." : "Export"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        
        {/* SIDEBAR */}
        <aside className="w-[400px] shrink-0 border-r border-border/40 bg-card/20 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            
            {/* 1. ASSET SECTION */}
            <div className={glassCard}>
              <div className="flex items-center gap-2 mb-4">
                 <div className="p-1.5 bg-primary/10 rounded-lg"><Layers className="w-4 h-4 text-primary" /></div>
                 <Label className="text-[11px] uppercase font-bold tracking-wider opacity-60">Mockup Content</Label>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button 
                variant="outline" 
                className="w-full h-16 rounded-xl border-dashed border-2 hover:border-primary transition-all flex flex-col gap-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase">{image ? "Replace Asset" : "Upload Screenshot"}</span>
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["frame", "canvas"]} className="space-y-4">
              {/* 2. FRAME SELECTION */}
              <AccordionItem value="frame" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Device Frame</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 grid grid-cols-2 gap-2">
                  {["iphone17", "ipad-air", "macbook-pro-16", "imac-24-inch", "samsung-galaxy-tab", "samsung-galaxy-phone"].map((id) => (
                    <button 
                      key={id} 
                      onClick={() => setDevice(id as DeviceType)} 
                      className={cn(
                        "p-3 rounded-xl border transition-all text-[10px] font-black uppercase text-center",
                        device === id ? "bg-primary text-primary-foreground border-primary" : "bg-background/40 hover:bg-muted border-border/40"
                      )}
                    >
                      {id.replace(/-/g, ' ')}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              {/* 3. CANVAS & EXPORT CONFIG */}
              <AccordionItem value="canvas" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}>
                   <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Canvas & Export</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase opacity-60">Ratio</Label>
                      <Select value={canvasRatio} onValueChange={(v: any) => setCanvasRatio(v)}>
                        <SelectTrigger className="rounded-xl h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                          <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                          <SelectItem value="1:1">Square (1:1)</SelectItem>
                          <SelectItem value="4:5">Instagram (4:5)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>

                   {/* DYNAMIC EXPORT OPTIONS */}
                   <div className="p-3 bg-muted/30 rounded-xl space-y-4">
                      <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-orange-500" /><Label className="text-[10px] font-bold uppercase opacity-60">Output Settings</Label></div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                          <SelectTrigger className="h-9 text-[10px] font-bold rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {mode === "mockup" ? (
                              <>
                                <SelectItem value="png">PNG</SelectItem>
                                <SelectItem value="jpeg">JPG</SelectItem>
                                <SelectItem value="svg">SVG</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="gif">GIF</SelectItem>
                                <SelectItem value="video">MP4 (WebM)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <Select value={exportQuality} onValueChange={setExportQuality}>
                          <SelectTrigger className="h-9 text-[10px] font-bold rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Standard</SelectItem>
                            <SelectItem value="2">High-Res</SelectItem>
                            <SelectItem value="3">Ultra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. MODE SPECIFIC SECTION */}
              <AccordionItem value="appearance" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4 border-primary/20 bg-primary/5")}>
                   <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{mode === "mockup" ? "Visual Styling" : "Motion Controls"}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                   {mode === "mockup" ? (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-bold uppercase opacity-60">Layout Position</Label>
                          <div className="space-y-3 px-1"><Slider value={[canvasX]} onValueChange={(v) => setCanvasX(v[0])} min={-800} max={800} /><Slider value={[canvasY]} onValueChange={(v) => setCanvasY(v[0])} min={-800} max={800} /></div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-border/40">
                           <Label className="text-[10px] font-bold uppercase opacity-60">Background</Label>
                           <Tabs value={bgType} onValueChange={(v: any) => setBgType(v)}>
                              <TabsList className="w-full h-8 bg-muted/40 rounded-lg"><TabsTrigger value="solid" className="flex-1 text-[10px]">Solid</TabsTrigger><TabsTrigger value="gradient" className="flex-1 text-[10px]">Gradient</TabsTrigger></TabsList>
                              <TabsContent value="solid" className="pt-3 flex gap-2"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer" /><Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono h-8 text-[10px] uppercase" /></TabsContent>
                              <TabsContent value="gradient" className="pt-3 space-y-3"><div className="flex gap-2"><input type="color" value={bgGradientColor1} onChange={(e) => setBgGradientColor1(e.target.value)} className="flex-1 h-8 rounded-lg cursor-pointer" /><input type="color" value={bgGradientColor2} onChange={(e) => setBgGradientColor2(e.target.value)} className="flex-1 h-8 rounded-lg cursor-pointer" /></div><Slider value={[bgGradientAngle]} onValueChange={(v) => setBgGradientAngle(v[0])} max={360} /></TabsContent>
                           </Tabs>
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                        <div className={cn(glassCard, "bg-primary/10 border-primary/20 shadow-none")}>
                           <div className="flex items-center justify-between mb-3"><Label className="text-[10px] font-black text-primary uppercase">Timeline</Label><span className="text-[10px] font-mono text-primary">{scrubProgress}%</span></div>
                           <Slider value={[scrubProgress]} onValueChange={(v) => { setIsPlaying(false); setScrubProgress(v[0]); }} max={100} step={0.1} className="py-2" />
                           <div className="flex gap-2 mt-4"><Button onClick={handlePlayAnimation} disabled={isPlaying} className="flex-1 h-9 rounded-lg font-bold text-[10px] uppercase"><Play className="w-3 h-3 mr-2" /> Play</Button><Button variant="outline" size="icon" onClick={() => { setIsPlaying(false); setScrubProgress(0); }} className="h-9 w-9 border-primary/20"><RotateCcw className="w-3 h-3" /></Button></div>
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[10px] font-bold uppercase opacity-60">Motion Path (Start/End)</Label>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2"><Label className="text-[9px] uppercase opacity-40">Start X/Y</Label><Slider value={[animStartX]} onValueChange={(v) => setAnimStartX(v[0])} min={-800} max={800} /><Slider value={[animStartY]} onValueChange={(v) => setAnimStartY(v[0])} min={-800} max={800} /></div>
                              <div className="space-y-2"><Label className="text-[9px] uppercase opacity-40">End X/Y</Label><Slider value={[animEndX]} onValueChange={(v) => setAnimEndX(v[0])} min={-800} max={800} /><Slider value={[animEndY]} onValueChange={(v) => setAnimEndY(v[0])} min={-800} max={800} /></div>
                           </div>
                        </div>
                     </div>
                   )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        {/* STAGE */}
        <main ref={mainAreaRef} className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-12">
          
          {/* Enhanced Stage Background */}
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000 opacity-5 dark:opacity-[0.08]" 
               style={{ backgroundImage: "linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />
          
          <div className="relative z-10 transition-transform duration-500 ease-out" 
               style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${previewScale})` }}>
            
            {/* Canvas Shadow Wrapper */}
            <div className="w-full h-full rounded-[4px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] transition-shadow duration-700 pointer-events-none absolute inset-0" />
            
            <div ref={canvasRef} 
                 className="w-full h-full relative overflow-hidden rounded-[2px] bg-background pointer-events-auto" 
                 style={getCanvasBackgroundStyles()}>
              
              {/* Alpha pattern for transparent bg */}
              {transparent && <div className="absolute inset-0" style={{ backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)", backgroundSize: "40px 40px" }} />}

              <div 
                ref={animTargetRef} 
                className="z-10"
                style={{ 
                  transform: `translate(${previewState.x}px, ${previewState.y}px) scale(${previewState.s / 100}) rotate(${previewState.r}deg)`, 
                  transitionProperty: isPlaying ? 'transform' : 'none', 
                  transitionDuration: isPlaying ? `${animDuration}s` : '0s', 
                  transitionTimingFunction: animEasing 
                }}
              >
                <DeviceFrame 
                  device={device} image={image} 
                  dropShadow={dropShadow} dropShadowAngle={dropShadowAngle} dropShadowAllSides={dropShadowAllSides} dropShadowColor={dropShadowColor} 
                  innerGlow={innerGlow} innerGlowAngle={innerGlowAngle} 
                  onUploadClick={() => fileInputRef.current?.click()} 
                />
              </div>
            </div>
          </div>

          {/* EXPORT OVERLAY */}
          {exporting && (
             <div className="absolute bottom-12 inset-x-0 px-12 z-[100] animate-in slide-in-from-bottom-8 duration-500">
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-zinc-900/90 backdrop-blur-2xl border border-white/10 text-white shadow-2xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><Zap className="w-4 h-4 text-primary animate-pulse" /><span className="text-[10px] font-black tracking-widest uppercase">{exportStatus}</span></div>
                      <span className="font-mono text-[10px] opacity-60">{exportProgress}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                    </div>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;