import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { 
  Upload, Download, Smartphone, Tablet, Laptop, ImageIcon, ImagePlus, 
  Play, RotateCcw, Crosshair, Move, Timer, Moon, Sun, Monitor, Layers, 
  Wind, Settings2, Sparkles, Video
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
  const [isDragging, setIsDragging] = useState(false);
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

  // Sync theme with document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

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
      const padding = 60;
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

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePlayAnimation = () => {
    setIsPlaying(false);
    setScrubProgress(0);
    setTimeout(() => { setIsPlaying(true); setScrubProgress(100); }, 50);
  };

  const getActualEndRotation = (start: number, end: number, dir: "cw" | "ccw") => {
    if (start === end) return end;
    if (dir === "cw" && end < start) return end + 360;
    if (dir === "ccw" && end > start) return end - 360;
    return end;
  };

  const getInterpolatedTransform = useCallback((t: number) => {
    const getEasingT = (time: number) => {
      if (animEasing === 'ease-in-out') return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
      if (animEasing === 'ease-in') return time * time;
      if (animEasing === 'ease-out') return time * (2 - time);
      return time;
    };
    const easeT = getEasingT(t);
    const actualEndRot = getActualEndRotation(animStartRot, animEndRot, animRotDirection);

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
            await new Promise(res => setTimeout(res, 20));
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
            const link = document.createElement('a'); link.download = `booth-anim.gif`; link.href = URL.createObjectURL(blob); link.click();
            setExporting(false);
          });
          gif.render();
        } else {
          setExportStatus("Encoding Video...");
          const outCanvas = document.createElement('canvas'); outCanvas.width = frames[0].width; outCanvas.height = frames[0].height;
          const ctx = outCanvas.getContext('2d')!;
          const stream = outCanvas.captureStream(fps);
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
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
        const link = document.createElement("a"); link.download = `mockup.${exportFormat}`; link.href = dataUrl; link.click();
        setExporting(false);
      }
    } catch (err) { console.error(err); setExporting(false); }
  }, [device, transparent, bgColor, exportFormat, exportQuality, animDuration, animEasing, canvasX, canvasY, bgType, bgImage, bgGradientType, bgGradientColor1, bgGradientColor2, bgGradientAngle, bgGradientStop1, bgGradientStop2, bgRadialX, bgRadialY, CANVAS_WIDTH, CANVAS_HEIGHT, getInterpolatedTransform]);

  const previewState = useMemo(() => {
      if (mode === "mockup") return { s: deviceScale, r: 0, x: canvasX, y: canvasY };
      return getInterpolatedTransform(scrubProgress / 100);
  }, [mode, deviceScale, canvasX, canvasY, getInterpolatedTransform, scrubProgress]);

  // Panels Glassmorphism Styles
  const glassPanel = "bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl overflow-hidden";
  const controlCard = "bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-sm";

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-[#09090b] text-foreground transition-colors duration-500 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 px-6 flex items-center justify-between z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <Sparkles className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            SCREEN BOOTH
          </span>
        </div>

        <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-full border">
            <TabsTrigger value="mockup" className="rounded-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Monitor className="w-4 h-4" /> Mock-up
            </TabsTrigger>
            <TabsTrigger value="animation" className="rounded-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="w-4 h-4" /> Animation
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full border bg-background/50" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <div className="h-8 w-px bg-border/40 mx-1" />
          <Button onClick={handleExport} disabled={exporting} className="rounded-full px-6 shadow-lg shadow-primary/25 font-bold">
            {exporting ? "Wait..." : "Export"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        
        {/* LEFT SIDEBAR (CONTROLS) */}
        <aside className="w-[380px] shrink-0 border-r border-border/40 bg-card/30 flex flex-col custom-scrollbar overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* COMMON CONTROLS */}
            <section className={controlCard}>
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mb-4 block">Asset Management</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-dashed bg-muted/20 hover:bg-muted/40 transition-all gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? <Layers className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5" />}
                <span className="font-bold">{image ? "Update Screenshot" : "Upload Screenshot"}</span>
              </Button>
            </section>

            <Accordion type="multiple" defaultValue={["frame"]} className="space-y-4">
              <AccordionItem value="frame" className="border-none">
                <AccordionTrigger className={cn(controlCard, "hover:no-underline py-4 text-xs font-bold uppercase tracking-wider")}>
                  1. Device Frame
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-1 space-y-2">
                  {["iphone17", "ipad-air", "macbook-pro-16", "imac-24-inch", "samsung-galaxy-tab", "samsung-galaxy-phone"].map((id) => (
                    <button 
                      key={id} 
                      onClick={() => setDevice(id as DeviceType)} 
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-medium",
                        device === id ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-background/50 hover:bg-muted border-border/40"
                      )}
                    >
                      <span className="capitalize">{id.replace(/-/g, ' ')}</span>
                      {device === id && <Sparkles className="w-4 h-4 fill-current" />}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="canvas" className="border-none">
                <AccordionTrigger className={cn(controlCard, "hover:no-underline py-4 text-xs font-bold uppercase tracking-wider")}>
                  2. Canvas & Layout
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-1 space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">Aspect Ratio</Label>
                      <Select value={canvasRatio} onValueChange={(v: any) => setCanvasRatio(v)}>
                        <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                          <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                          <SelectItem value="1:1">Square (1:1)</SelectItem>
                          <SelectItem value="4:5">Insta-Port (4:5)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between"><Label className="text-[10px] font-bold text-muted-foreground uppercase">Manual Position</Label><Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={centerCanvasPosition}>Reset</Button></div>
                      <div className="space-y-4 px-1">
                        <Slider value={[canvasX]} onValueChange={(v) => setCanvasX(v[0])} min={-800} max={800} />
                        <Slider value={[canvasY]} onValueChange={(v) => setCanvasY(v[0])} min={-800} max={800} />
                      </div>
                   </div>

                   <div className="pt-4 border-t border-border/40">
                      <div className="flex items-center justify-between mb-4"><Label className="text-sm font-bold">Transparent Bg</Label><Switch checked={transparent} onCheckedChange={setTransparent} /></div>
                      {!transparent && (
                        <Tabs value={bgType} onValueChange={(v: any) => setBgType(v)} className="w-full">
                          <TabsList className="w-full h-10 rounded-xl bg-muted/40"><TabsTrigger value="solid" className="flex-1 text-[10px] font-bold">Solid</TabsTrigger><TabsTrigger value="gradient" className="flex-1 text-[10px] font-bold">Gradient</TabsTrigger></TabsList>
                          <TabsContent value="solid" className="pt-4 flex gap-4">
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-12 rounded-xl border cursor-pointer overflow-hidden" />
                            <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono h-12 rounded-xl uppercase" />
                          </TabsContent>
                          <TabsContent value="gradient" className="pt-4 space-y-4">
                             <div className="flex gap-2"><input type="color" value={bgGradientColor1} onChange={(e) => setBgGradientColor1(e.target.value)} className="flex-1 h-10 rounded-lg cursor-pointer" /><input type="color" value={bgGradientColor2} onChange={(e) => setBgGradientColor2(e.target.value)} className="flex-1 h-10 rounded-lg cursor-pointer" /></div>
                             <div className="space-y-2"><Slider value={[bgGradientStop1, bgGradientStop2]} onValueChange={(v) => {setBgGradientStop1(v[0]); setBgGradientStop2(v[1]);}} max={100} /></div>
                             <Slider value={[bgGradientAngle]} onValueChange={(v) => setBgGradientAngle(v[0])} max={360} />
                          </TabsContent>
                        </Tabs>
                      )}
                   </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="lighting" className="border-none">
                <AccordionTrigger className={cn(controlCard, "hover:no-underline py-4 text-xs font-bold uppercase tracking-wider")}>
                  3. Lighting & Depth
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-1 space-y-6">
                  <div className="space-y-3"><div className="flex justify-between items-center"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Shadow Intensity</Label><span className="text-[10px] font-mono">{dropShadow}%</span></div><Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} max={100} /></div>
                  <div className="space-y-3 pt-2"><div className="flex justify-between items-center"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Screen Glow</Label><span className="text-[10px] font-mono">{innerGlow}%</span></div><Slider value={[innerGlow]} onValueChange={(v) => setInnerGlow(v[0])} max={100} /></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion)

            {/* MOCKUP EXPORT OPTIONS */}
            {mode === "mockup" && (
              <section className={cn(controlCard, "bg-primary/5 border-primary/20 mt-4")}>
                <Label className="text-[10px] uppercase font-black tracking-widest text-primary mb-4 block">Image Export Config</Label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                   <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                      <SelectTrigger className="h-10 text-[10px] font-bold rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpeg">JPEG</SelectItem><SelectItem value="svg">SVG</SelectItem></SelectContent>
                   </Select>
                   <Select value={exportQuality} onValueChange={setExportQuality}>
                      <SelectTrigger className="h-10 text-[10px] font-bold rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="1">1X Quality</SelectItem><SelectItem value="2">2X Quality</SelectItem><SelectItem value="3">3X Quality</SelectItem></SelectContent>
                   </Select>
                </div>
              </section>
            )}

            {/* ANIMATION OPTIONS (ONLY IN ANIMATION TAB) */}
            {mode === "animation" && (
              <div className="animate-in slide-in-from-left-4 duration-300 space-y-6">
                <section className={cn(controlCard, "bg-indigo-500/5 border-indigo-500/20")}>
                   <div className="flex items-center justify-between mb-4"><Label className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">Timeline Preview</Label><Timer className="w-4 h-4 text-indigo-500" /></div>
                   <Slider value={[scrubProgress]} onValueChange={(v) => { setIsPlaying(false); setScrubProgress(v[0]); }} max={100} step={0.1} className="py-2" />
                   <div className="flex gap-2 mt-4">
                      <Button onClick={handlePlayAnimation} disabled={isPlaying} className="flex-1 rounded-xl h-10 bg-indigo-600 hover:bg-indigo-700 font-bold"><Play className="w-3.5 h-3.5 mr-2" /> Play</Button>
                      <Button variant="outline" onClick={() => { setIsPlaying(false); setScrubProgress(0); }} className="rounded-xl h-10 border-indigo-500/30"><RotateCcw className="w-3.5 h-3.5" /></Button>
                   </div>
                </section>

                <Accordion type="multiple" defaultValue={["movement"]} className="space-y-4 pb-20">
                   <AccordionItem value="movement" className="border-none">
                      <AccordionTrigger className={cn(controlCard, "hover:no-underline py-4 text-xs font-bold uppercase tracking-wider")}>Motion path</AccordionTrigger>
                      <AccordionContent className="pt-4 px-1 space-y-8">
                         <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Start Position</Label><Slider value={[animStartX]} onValueChange={(v) => setAnimStartX(v[0])} min={-800} max={800} /><Slider value={[animStartY]} onValueChange={(v) => setAnimStartY(v[0])} min={-800} max={800} /></div>
                         <div className="space-y-3"><Label className="text-[10px] font-bold uppercase text-muted-foreground">End Position</Label><Slider value={[animEndX]} onValueChange={(v) => setAnimEndX(v[0])} min={-800} max={800} /><Slider value={[animEndY]} onValueChange={(v) => setAnimEndY(v[0])} min={-800} max={800} /></div>
                      </AccordionContent>
                   </AccordionItem>
                   <AccordionItem value="timing" className="border-none">
                      <AccordionTrigger className={cn(controlCard, "hover:no-underline py-4 text-xs font-bold uppercase tracking-wider")}>Timing & Feel</AccordionTrigger>
                      <AccordionContent className="pt-4 px-1 space-y-6">
                         <div className="space-y-3"><div className="flex justify-between"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Duration</Label><span className="text-[10px]">{animDuration}s</span></div><Slider value={[animDuration]} onValueChange={(v) => setAnimDuration(v[0])} min={0.5} max={10} step={0.5} /></div>
                         <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Easing Curve</Label><Select value={animEasing} onValueChange={setAnimEasing}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="linear">Linear</SelectItem><SelectItem value="ease-in">Ease In</SelectItem><SelectItem value="ease-out">Ease Out</SelectItem><SelectItem value="ease-in-out">Ease In-Out</SelectItem></SelectContent></Select></div>
                      </AccordionContent>
                   </AccordionItem>
                </Accordion>
              </div>
            )}

          </div>
        </aside>

        {/* MAIN PREVIEW AREA */}
        <main ref={mainAreaRef} className="flex-1 relative bg-muted/10 overflow-hidden flex flex-col">
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "32px 32px" }} />
          
          <div className="flex-1 flex items-center justify-center">
            <div className="relative pointer-events-none">
              <div 
                className="origin-center pointer-events-auto transition-shadow duration-500" 
                style={{ 
                  width: CANVAS_WIDTH, height: CANVAS_HEIGHT, 
                  transform: `scale(${previewScale})`,
                  boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                  ...(transparent && { backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)", backgroundSize: "40px 40px" })
                }}
              >
                <div ref={canvasRef} className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-sm" style={getCanvasBackgroundStyles()}>
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
            </div>
          </div>

          {/* OVERLAY EXPORT BAR */}
          {exporting && (
             <div className="absolute inset-x-0 bottom-0 p-8 z-[100] animate-in slide-in-from-bottom-10">
                <div className="max-w-xl mx-auto p-6 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-primary animate-pulse" /><span className="font-bold text-sm tracking-wide uppercase">{exportStatus}</span></div>
                      <span className="font-mono text-xs">{exportProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
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