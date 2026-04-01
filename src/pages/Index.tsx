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
  Upload, Smartphone, ImageIcon, 
  Play, RotateCcw, Moon, Sun, Monitor, 
  Layers, Sparkles, Video, Palette, Plus, Trash2, Crosshair, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ExportFormat = "png" | "jpeg" | "svg" | "video" | "gif";
type CanvasRatio = "16:9" | "9:16" | "1:1" | "4:5";
type AppMode = "mockup" | "animation";

interface GradientStop {
  id: string;
  color: string;
  stop: number;
}

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
  const [mode, setMode] = useState<AppMode>("mockup");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [device, setDevice] = useState<DeviceType>("iphone17");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [previewScale, setPreviewScale] = useState(0.5);

  // Shadows & Glow
  const [dropShadow, setDropShadow] = useState(30);
  const [dropShadowAngle, setDropShadowAngle] = useState(180); 
  const [dropShadowAllSides, setDropShadowAllSides] = useState(false);
  const [dropShadowColor, setDropShadowColor] = useState("#000000");
  const [innerGlow, setInnerGlow] = useState(0);
  const [innerGlowAngle, setInnerGlowAngle] = useState(0); 

  // Animation State
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

  // Canvas & Background State
  const [canvasX, setCanvasX] = useState(0);
  const [canvasY, setCanvasY] = useState(0);
  const [transparent, setTransparent] = useState(false);
  const [canvasRatio, setCanvasRatio] = useState<CanvasRatio>("16:9");

  const [bgType, setBgType] = useState<"solid" | "gradient" | "image">("gradient");
  const [bgColor, setBgColor] = useState("#f8fafc");
  const [bgGradientType, setBgGradientType] = useState<"linear" | "radial">("linear");
  const [bgGradientAngle, setBgGradientAngle] = useState(135);
  const [gradientStops, setGradientStops] = useState<GradientStop[]>([
    { id: '1', color: "#6366f1", stop: 0 },
    { id: '2', color: "#a855f7", stop: 100 }
  ]);
  const [bgRadialX, setBgRadialX] = useState(50);
  const [bgRadialY, setBgRadialY] = useState(50);
  const [bgImage, setBgImage] = useState<string | null>(null);

  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState<string>("2");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const animTargetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (mode === "animation") setExportFormat("video");
    else setExportFormat("png");
  }, [mode]);

  const canvasDimensions = useMemo(() => {
    const map = { 
        "9:16": [1080, 1920], 
        "1:1": [1080, 1080], 
        "4:5": [1080, 1350],
        "16:9": [1920, 1080]
    };
    const [w, h] = (map[canvasRatio] || [1920, 1080]) as [number, number];
    return { width: w, height: h, ratio: w / h };
  }, [canvasRatio]);

  const CANVAS_WIDTH = canvasDimensions.width;
  const CANVAS_HEIGHT = canvasDimensions.height;

  const calculateScale = useCallback(() => {
    if (!stageRef.current) return;
    const { width, height } = stageRef.current.getBoundingClientRect();
    const availableWidth = width - 80;
    const availableHeight = height - 80;
    const scaleX = availableWidth / CANVAS_WIDTH;
    const scaleY = availableHeight / CANVAS_HEIGHT;
    setPreviewScale(Math.min(scaleX, scaleY, 1.0));
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  useEffect(() => {
    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [calculateScale]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

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

  const addGradientStop = () => {
    const newStop: GradientStop = { id: Math.random().toString(36).substr(2, 9), color: "#ffffff", stop: 50 };
    setGradientStops([...gradientStops, newStop]);
  };

  const removeGradientStop = (id: string) => {
    if (gradientStops.length <= 2) return;
    setGradientStops(gradientStops.filter(s => s.id !== id));
  };

  const updateGradientStop = (id: string, updates: Partial<GradientStop>) => {
    setGradientStops(gradientStops.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const getCanvasBackgroundStyles = (): React.CSSProperties => {
    if (transparent) return { backgroundColor: "transparent" };
    if (bgType === "solid") return { backgroundColor: bgColor };
    if (bgType === "gradient") {
      const stopsStr = [...gradientStops].sort((a, b) => a.stop - b.stop).map(s => `${s.color} ${s.stop}%`).join(", ");
      return bgGradientType === "linear" ? { backgroundImage: `linear-gradient(${bgGradientAngle}deg, ${stopsStr})` } : { backgroundImage: `radial-gradient(circle at ${bgRadialX}% ${bgRadialY}%, ${stopsStr})` };
    }
    return { backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: bgColor };
  };

  const getInterpolatedTransform = useCallback((t: number) => {
    const getEasingT = (time: number) => {
      if (animEasing === 'ease-in-out') return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
      if (animEasing === 'ease-in') return time * time;
      if (animEasing === 'ease-out') return time * (2 - time);
      if (animEasing === 'bouncy') {
        const c4 = (2 * Math.PI) / 3;
        return time === 0 ? 0 : time === 1 ? 1 : Math.pow(2, -10 * time) * Math.sin((time * 10 - 0.75) * c4) + 1;
      }
      return time;
    };
    const easeT = getEasingT(t);
    return {
      s: animStartScale + (animEndScale - animStartScale) * easeT,
      r: animStartRot + (animEndRot - animStartRot) * easeT,
      x: canvasX + (animStartX + (animEndX - animStartX) * easeT),
      y: canvasY + (animStartY + (animEndY - animStartY) * easeT)
    };
  }, [animEasing, animStartRot, animEndRot, animStartScale, animEndScale, canvasX, canvasY, animStartX, animEndX, animStartY, animEndY]);

  const previewState = useMemo(() => {
    if (mode === "mockup") return { s: deviceScale, r: 0, x: canvasX, y: canvasY };
    return getInterpolatedTransform((scrubProgress || 0) / 100);
  }, [mode, deviceScale, canvasX, canvasY, getInterpolatedTransform, scrubProgress]);

  const handlePlayAnimation = () => {
    if (isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    setScrubProgress(0);
    const startTime = performance.now();
    const durationMs = Math.max((animDuration || 2) * 1000, 100);
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setScrubProgress(progress * 100);
      if (progress < 1) animationFrameRef.current = requestAnimationFrame(animate);
      else setIsPlaying(false);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true); setExportProgress(0); setExportStatus("Preparing Frames...");
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
        targetNode.style.transition = 'none';
        
        for (let i = 0; i <= totalFrames; i++) {
            const { s, r, x, y } = getInterpolatedTransform(i / totalFrames);
            targetNode.style.transform = `translate(${x}px, ${y}px) scale(${s / 100}) rotate(${r}deg)`;
            await new Promise(res => setTimeout(res, 25)); 
            frames.push(await toCanvas(el, { ...baseExportOptions, pixelRatio }));
            setExportProgress(Math.round((i / totalFrames) * 40));
        }

        if (isGif) {
          setExportStatus("Quantizing GIF...");
          await loadGifJs();
          const workerReq = await fetch("https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js");
          const workerUrl = URL.createObjectURL(await workerReq.blob());
          const gif = new (window as any).GIF({ workers: 4, quality: 2, width: frames[0].width, height: frames[0].height, workerScript: workerUrl, transparent: transparent ? "rgba(0,0,0,0)" : null });
          frames.forEach(frame => gif.addFrame(frame, { delay: 1000 / fps, copy: true }));
          gif.on('finished', (blob: Blob) => {
            const link = document.createElement('a'); link.download = `booth-art-${Date.now()}.gif`; link.href = URL.createObjectURL(blob); link.click();
            setExporting(false);
          });
          gif.render();
        } else {
          setExportStatus("Encoding MP4...");
          const outCanvas = document.createElement('canvas'); 
          const frameWidth = frames[0].width;
          const frameHeight = frames[0].height;
          outCanvas.width = frameWidth % 2 === 0 ? frameWidth : frameWidth - 1; 
          outCanvas.height = frameHeight % 2 === 0 ? frameHeight : frameHeight - 1;
          const ctx = outCanvas.getContext('2d')!;
          const videoMimeTypes = ['video/mp4;codecs=avc1', 'video/webm;codecs=h264', 'video/webm'];
          const mimeType = videoMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
          const stream = outCanvas.captureStream(fps);
          const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = e => chunks.push(e.data);
          recorder.onstop = () => {
            const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const link = document.createElement('a'); link.download = `booth-art-${Date.now()}.${ext}`; link.href = URL.createObjectURL(new Blob(chunks, { type: mimeType })); link.click();
            setExporting(false);
          };
          recorder.start();
          let f = 0;
          let lastTime = performance.now();
          const frameDelay = 1000 / fps; 
          const captureLoop = (currentTime: number) => {
            if (f >= frames.length) { setTimeout(() => recorder.stop(), 500); return; }
            const elapsed = currentTime - lastTime;
            if (elapsed >= frameDelay) {
              ctx.clearRect(0, 0, outCanvas.width, outCanvas.height); 
              ctx.drawImage(frames[f++], 0, 0, outCanvas.width, outCanvas.height);
              setExportProgress(40 + Math.round((f / frames.length) * 60));
              lastTime = currentTime - (elapsed % frameDelay);
            }
            requestAnimationFrame(captureLoop);
          };
          ctx.clearRect(0, 0, outCanvas.width, outCanvas.height); 
          ctx.drawImage(frames[f++], 0, 0, outCanvas.width, outCanvas.height);
          requestAnimationFrame(captureLoop);
        }
      } else {
        const imageOptions = { ...baseExportOptions, pixelRatio };
        let dataUrl = (exportFormat === "jpeg") ? await toJpeg(canvasRef.current!, { ...imageOptions, quality: 0.98 }) : (exportFormat === "svg" ? await toSvg(canvasRef.current!, imageOptions) : await toPng(canvasRef.current!, imageOptions));
        const link = document.createElement("a"); link.download = `booth-art-${Date.now()}.${exportFormat}`; link.href = dataUrl; link.click();
        setExporting(false);
      }
    } catch (err) { console.error(err); setExporting(false); toast.error("Export failed. Check permissions."); }
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, transparent, bgColor, bgType, bgImage, exportFormat, exportQuality, animDuration, animEasing, canvasX, canvasY, getInterpolatedTransform]);

  const NumericInput = ({ value, onChange, suffix = "" }: { value: number, onChange: (val: number) => void, suffix?: string }) => (
    <div className="relative w-16 group shrink-0">
      <Input type="text" value={value} onChange={(e) => {
          const val = parseFloat(e.target.value.replace(/[^\d.-]/g, ""));
          if (!isNaN(val)) onChange(val);
        }} className="h-7 px-1 text-center font-mono text-xs border-muted focus-visible:ring-1 focus-visible:ring-primary bg-background/50" />
      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] opacity-30 pointer-events-none group-focus-within:hidden">{suffix}</span>
    </div>
  );

  const glassCard = "bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl shadow-black/5";

  return (
    <div className="h-[100dvh] w-full bg-[#f1f5f9] dark:bg-[#020617] text-foreground transition-colors duration-700 flex flex-col overflow-hidden font-sans">
      <header className="h-16 px-6 flex items-center justify-between z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform hover:rotate-6 transition-transform">
            <Sparkles className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-lg font-black tracking-tight hidden sm:block uppercase">Screen Art Booth</span>
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
          <div className="flex items-center bg-muted/40 rounded-full px-3 py-1 gap-2 border border-border/40 mr-2">
            <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
              <SelectTrigger className="h-8 w-[100px] border-none bg-transparent shadow-none text-sm font-bold"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                {mode === "animation" && (
                  <><SelectItem value="video">MP4/WebM</SelectItem><SelectItem value="gif">GIF</SelectItem></>
                )}
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-border/40" />
            <Select value={exportQuality} onValueChange={setExportQuality}>
              <SelectTrigger className="h-8 w-[60px] border-none bg-transparent shadow-none text-sm font-bold"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="1">1x</SelectItem><SelectItem value="2">2x</SelectItem><SelectItem value="3">3x</SelectItem></SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" className="rounded-full bg-background/40" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button onClick={handleExport} disabled={exporting || !image} className="rounded-full px-6 font-bold shadow-md">
            {exporting ? "Wait..." : "Export"}
          </Button>
        </div>
      </header>

      {exporting && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
           <div className="w-[320px] space-y-4 text-center">
              <div className="flex justify-between items-end"><Label className="text-xl font-black uppercase tracking-tighter text-primary">{exportStatus}</Label><span className="text-sm font-mono">{exportProgress}%</span></div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/40"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${exportProgress}%` }} /></div>
              <p className="text-sm uppercase font-bold opacity-40">Please keep this tab active.</p>
           </div>
        </div>
      )}

      <div className="flex-1 flex min-h-0 relative">
        <aside className="w-[380px] shrink-0 border-r border-border/40 bg-card/20 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            <div className={glassCard}>
              <Label className="text-sm uppercase font-bold tracking-wider opacity-60 block mb-3">Content Asset</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button variant="outline" className="w-full h-16 rounded-xl border-dashed border-2 flex flex-col gap-1" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                <span className="text-sm font-black uppercase">{image ? "Replace Screenshot" : "Upload Screenshot"}</span>
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={[]} className="space-y-4">
              <AccordionItem value="frame" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary" /><span className="text-sm font-bold uppercase tracking-wider">Device Frame</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 grid grid-cols-2 gap-2">
                  {["iphone17", "ipad-air", "macbook-pro-16", "imac-24-inch", "samsung-galaxy-tab", "samsung-galaxy-phone"].map((id) => (
                    <button key={id} onClick={() => setDevice(id as DeviceType)} className={cn("p-3 rounded-xl border transition-all text-xs font-black uppercase", device === id ? "bg-primary text-primary-foreground border-primary" : "bg-background/40 border-border/40")}>
                      {id.replace(/-/g, ' ')}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="background" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /><span className="text-sm font-bold uppercase tracking-wider">Background</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl">
                    <Label className="text-sm font-bold uppercase opacity-60">Transparent Background</Label>
                    <Switch checked={transparent} onCheckedChange={setTransparent} />
                  </div>
                  {!transparent && (
                    <div className="space-y-4">
                      <Tabs value={bgType} onValueChange={(v: any) => setBgType(v)}>
                        <TabsList className="w-full h-8 bg-muted/40 rounded-lg"><TabsTrigger value="solid" className="flex-1 text-xs">Solid</TabsTrigger><TabsTrigger value="gradient" className="flex-1 text-xs">Gradient</TabsTrigger><TabsTrigger value="image" className="flex-1 text-xs">Image</TabsTrigger></TabsList>
                        <TabsContent value="solid" className="pt-3 flex gap-2"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer" /><Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono h-8 text-sm" /></TabsContent>
                        <TabsContent value="gradient" className="pt-3 space-y-4">
                          <Select value={bgGradientType} onValueChange={(v: any) => setBgGradientType(v)}><SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="linear">Linear</SelectItem><SelectItem value="radial">Radial</SelectItem></SelectContent></Select>
                          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {gradientStops.map((stop) => (
                              <div key={stop.id} className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg">
                                <input type="color" value={stop.color} onChange={(e) => updateGradientStop(stop.id, { color: e.target.value })} className="w-6 h-6 rounded shrink-0 cursor-pointer" />
                                <div className="flex-1 px-2"><Slider value={[stop.stop]} onValueChange={(v) => updateGradientStop(stop.id, { stop: v[0] })} max={100} /></div>
                                <NumericInput value={stop.stop} onChange={(val) => updateGradientStop(stop.id, { stop: val })} suffix="%" />
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeGradientStop(stop.id)} disabled={gradientStops.length <= 2}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" className="w-full h-7 text-sm font-bold" onClick={addGradientStop}><Plus className="w-3 h-3 mr-1" /> Add Color Stop</Button>
                        </TabsContent>
                        <TabsContent value="image" className="pt-3 space-y-3">
                          <input ref={bgFileInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                          <Button variant="outline" className="w-full h-20 rounded-xl border-dashed border-2 flex flex-col gap-1" onClick={() => bgFileInputRef.current?.click()}><ImageIcon className="w-4 h-4" /><span className="text-sm font-black uppercase">{bgImage ? "Change Image" : "Upload Background"}</span></Button>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="effects" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /><span className="text-sm font-bold uppercase tracking-wider">Effects</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><Label className="text-sm font-bold uppercase">Drop Shadow</Label><div className="flex items-center gap-2"><Label className="text-xs uppercase opacity-60">All Sides</Label><Switch checked={dropShadowAllSides} onCheckedChange={setDropShadowAllSides} /></div></div>
                    <div className="flex items-center gap-4"><Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} min={0} max={100} className="flex-1" /><NumericInput value={dropShadow} onChange={setDropShadow} /></div>
                    {!dropShadowAllSides && (
                      <div className="space-y-2"><Label className="text-xs uppercase opacity-60">Angle</Label><div className="flex items-center gap-4"><Slider value={[dropShadowAngle]} onValueChange={(v) => setDropShadowAngle(v[0])} min={0} max={360} className="flex-1" /><NumericInput value={dropShadowAngle} onChange={setDropShadowAngle} suffix="°" /></div></div>
                    )}
                    <div className="flex gap-2 items-center"><Label className="text-xs uppercase opacity-60 w-12">Color</Label><input type="color" value={dropShadowColor} onChange={(e) => setDropShadowColor(e.target.value)} className="w-6 h-6 rounded shrink-0 cursor-pointer" /></div>
                  </div>
                  <div className="space-y-4 border-t border-border/10 pt-4"><Label className="text-sm font-bold uppercase">Inner Glow</Label><div className="flex items-center gap-4"><Slider value={[innerGlow]} onValueChange={(v) => setInnerGlow(v[0])} min={0} max={100} className="flex-1" /><NumericInput value={innerGlow} onChange={setInnerGlow} /></div>
                    <div className="space-y-2"><Label className="text-xs uppercase opacity-60">Angle</Label><div className="flex items-center gap-4"><Slider value={[innerGlowAngle]} onValueChange={(v) => setInnerGlowAngle(v[0])} min={0} max={360} className="flex-1" /><NumericInput value={innerGlowAngle} onChange={setInnerGlowAngle} suffix="°" /></div></div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="appearance" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /><span className="text-sm font-bold uppercase tracking-wider">{mode === "mockup" ? "Transform" : "Timeline Style"}</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                   {mode === "mockup" ? (
                     <div className="space-y-6">
                        <div className="space-y-3"><Label className="text-sm uppercase font-bold">Scale</Label><div className="flex items-center gap-4"><Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} className="flex-1" /><NumericInput value={deviceScale} onChange={setDeviceScale} suffix="%" /></div></div>
                        <div className="space-y-4 pt-2 border-t border-border/10"><Label className="text-sm uppercase font-bold">Canvas Offset</Label><div className="space-y-3">
                              <div className="flex items-center gap-4"><Slider value={[canvasX]} onValueChange={(v) => setCanvasX(v[0])} min={-800} max={800} className="flex-1" /><NumericInput value={canvasX} onChange={setCanvasX} /></div>
                              <div className="flex items-center gap-4"><Slider value={[canvasY]} onValueChange={(v) => setCanvasY(v[0])} min={-800} max={800} className="flex-1" /><NumericInput value={canvasY} onChange={setCanvasY} /></div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full h-8 text-xs font-bold gap-2" onClick={() => { setCanvasX(0); setCanvasY(0); }}><Crosshair className="w-3 h-3" /> Center Position</Button></div>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <div className="space-y-3"><Label className="text-sm font-black uppercase text-primary">Easing Curve</Label><Select value={animEasing} onValueChange={setAnimEasing}><SelectTrigger className="h-10 rounded-xl font-bold text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ease-in-out">Easy Ease</SelectItem><SelectItem value="ease-in">Ease In</SelectItem><SelectItem value="ease-out">Ease Out</SelectItem><SelectItem value="bouncy">Bouncy</SelectItem><SelectItem value="linear">Linear</SelectItem></SelectContent></Select></div>
                        <div className="space-y-3"><Label className="text-sm uppercase font-bold">Duration</Label><div className="flex items-center gap-4"><Slider value={[animDuration]} onValueChange={(v) => setAnimDuration(v[0])} min={0.5} max={10} step={0.1} className="flex-1" /><NumericInput value={animDuration} onChange={setAnimDuration} suffix="s" /></div></div>
                        <div className="space-y-2 pt-2 border-t border-border/20"><Label className="text-sm uppercase opacity-60 font-bold">Frame Controls</Label><div className="space-y-6">
                            <div className="space-y-3"><div className="flex justify-between items-center"><Label className="text-sm font-bold uppercase">Start Frame</Label><Button variant="ghost" size="icon" className="h-5 w-5 opacity-40" onClick={() => { setAnimStartX(0); setAnimStartY(0); }}><Crosshair className="w-3 h-3" /></Button></div><div className="space-y-2"><div className="flex items-center gap-3"><Slider value={[animStartX]} onValueChange={(v) => setAnimStartX(v[0])} min={-800} max={800} className="flex-1" /><NumericInput value={animStartX} onChange={setAnimStartX} /></div><div className="flex items-center gap-3"><Slider value={[animStartY]} onValueChange={(v) => setAnimStartY(v[0])} min={-800} max={800} className="flex-1" /><NumericInput value={animStartY} onChange={setAnimStartY} /></div></div><div className="space-y-1"><Label className="text-sm uppercase opacity-60">Scale & Rotation</Label><div className="flex items-center gap-3"><Slider value={[animStartScale]} onValueChange={(v) => setAnimStartScale(v[0])} min={10} max={150} className="flex-1" /><NumericInput value={animStartScale} onChange={setAnimStartScale} suffix="%" /></div><div className="flex items-center gap-3"><Slider value={[animStartRot]} onValueChange={(v) => setAnimStartRot(v[0])} min={-360} max={360} className="flex-1" /><NumericInput value={animStartRot} onChange={setAnimStartRot} suffix="°" /></div></div></div>
                            <div className="space-y-3 border-t border-border/10 pt-4"><div className="flex justify-between items-center"><Label className="text-sm font-bold uppercase">End Frame</Label><Button variant="ghost" size="icon" className="h-5 w-5 opacity-40" onClick={() => { setAnimEndX(0); setAnimEndY(0); }}><Crosshair className="w-3 h-3" /></Button></div><div className="space-y-2"><div className="flex items-center gap-3"><Slider value={[animEndX]} onValueChange={(v) => setAnimEndX(v[0])} min={-800} max={800} className="flex-1" /><NumericInput value={animEndX} onChange={setAnimEndX} /></div><div className="flex items-center gap-3"><Slider value={[animEndY]} onValueChange={(v) => setAnimEndY(v[0])} min={-800} max={800} className="flex-1" /><NumericInput value={animEndY} onChange={setAnimEndY} /></div></div><div className="space-y-1"><Label className="text-sm uppercase opacity-60">Scale & Rotation</Label><div className="flex items-center gap-3"><Slider value={[animEndScale]} onValueChange={(v) => setAnimEndScale(v[0])} min={10} max={150} className="flex-1" /><NumericInput value={animEndScale} onChange={setAnimEndScale} suffix="%" /></div><div className="flex items-center gap-3"><Slider value={[animEndRot]} onValueChange={(v) => setAnimEndRot(v[0])} min={-360} max={360} className="flex-1" /><NumericInput value={animEndRot} onChange={setAnimEndRot} suffix="°" /></div></div></div>
                          </div></div>
                     </div>
                   )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative overflow-hidden bg-muted/5">
          <div ref={stageRef} className="flex-1 flex items-center justify-center relative overflow-hidden p-10">
            {transparent && <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%)", backgroundSize: "20px 20px" }} />}
            <div className="relative z-10 shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out border-4 border-white/10" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${previewScale})`, aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}>
              <div ref={canvasRef} className={cn("w-full h-full relative overflow-hidden pointer-events-auto", !transparent && "bg-background")} style={getCanvasBackgroundStyles()}>
                <div ref={animTargetRef} className="z-10 absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: `translate(${previewState.x}px, ${previewState.y}px) scale(${previewState.s / 100}) rotate(${previewState.r}deg)`, transition: 'none' }}>
                  <div className="pointer-events-auto">
                      <DeviceFrame device={device} image={image} dropShadow={dropShadow} dropShadowAngle={dropShadowAngle} dropShadowAllSides={dropShadowAllSides} dropShadowColor={dropShadowColor} innerGlow={innerGlow} innerGlowAngle={innerGlowAngle} onUploadClick={() => fileInputRef.current?.click()} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {mode === "animation" && (
            <div className="shrink-0 w-full flex justify-center pb-12 px-8 pt-4 z-50">
              <div className="w-[850px] max-w-full bg-background border border-border/80 p-6 rounded-[2.5rem] shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-8">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <Button onClick={handlePlayAnimation} variant={isPlaying ? "destructive" : "default"} className="h-12 w-12 rounded-full shadow-lg">
                      {isPlaying ? <span className="font-black text-xs">STOP</span> : <Play className="fill-current w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setIsPlaying(false); setScrubProgress(0); }} className="h-10 w-10 rounded-full bg-muted/40"><RotateCcw className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Label className="text-sm font-black tracking-widest text-primary uppercase opacity-70">Animation Scrubber</Label>
                    <span className="text-2xl font-mono font-bold leading-none">{(scrubProgress || 0).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="px-2 flex items-center gap-4">
                    <Slider value={[scrubProgress]} onValueChange={(v) => { setIsPlaying(false); setScrubProgress(v[0]); }} max={100} step={0.1} className="flex-1 h-4" />
                    <NumericInput value={parseFloat(scrubProgress.toFixed(1))} onChange={setScrubProgress} suffix="%" />
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