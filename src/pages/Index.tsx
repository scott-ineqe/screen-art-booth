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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeviceFrame, { type DeviceType } from "@/components/DeviceFrame";
import { Upload, Download, Smartphone, Tablet, Laptop, ImageIcon, ImagePlus, Play, RotateCcw, Crosshair, Move, Timer } from "lucide-react";

type ExportFormat = "png" | "jpeg" | "svg" | "video" | "gif";
type CanvasRatio = "16:9" | "9:16" | "1:1" | "4:5";

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
  const [dropShadowColor, setDropShadowColor] = useState("#000000");
  const [innerGlow, setInnerGlow] = useState(0);
  const [innerGlowAngle, setInnerGlowAngle] = useState(0); 

  const [openAccordions, setOpenAccordions] = useState<string[]>(["asset", "frame", "lighting", "canvas"]);

  // --- Animation State ---
  const [animEnabled, setAnimEnabled] = useState(false);
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

  // NEW: Timeline Scrubbing State
  const [scrubProgress, setScrubProgress] = useState(0); // 0 to 100

  // --- Canvas Position State ---
  const [canvasX, setCanvasX] = useState(0);
  const [canvasY, setCanvasY] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [transparent, setTransparent] = useState(false);

  const [canvasRatio, setCanvasRatio] = useState<CanvasRatio>("16:9");

  const canvasDimensions = useMemo(() => {
    if (canvasRatio === "9:16") return { width: 1080, height: 1920 };
    if (canvasRatio === "1:1") return { width: 1080, height: 1080 };
    if (canvasRatio === "4:5") return { width: 1080, height: 1350 }; 
    return { width: 1920, height: 1080 };
  }, [canvasRatio]);

  const CANVAS_WIDTH = canvasDimensions.width;
  const CANVAS_HEIGHT = canvasDimensions.height;

  const [bgType, setBgType] = useState<"solid" | "gradient" | "image">("solid");
  const [bgColor, setBgColor] = useState("#ffffff");
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

  useEffect(() => {
    const calculateScale = () => {
      if (!mainAreaRef.current) return;
      const { width, height } = mainAreaRef.current.getBoundingClientRect();
      const padding = window.innerWidth < 1024 ? 32 : 80;
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
    // Reset scrub visual when starting playback
    setScrubProgress(0);
    setTimeout(() => {
        setIsPlaying(true);
        setScrubProgress(100);
    }, 50);
  };

  const handleResetAnimation = () => {
    setIsPlaying(false);
    setScrubProgress(0);
  };

  const centerAnimPositions = () => {
    setAnimStartX(0); setAnimStartY(0); setAnimEndX(0); setAnimEndY(0);
  };

  const centerCanvasPosition = () => {
    setCanvasX(0); setCanvasY(0);
  };

  const getActualEndRotation = (start: number, end: number, dir: "cw" | "ccw") => {
    if (start === end) return end;
    if (dir === "cw" && end < start) return end + 360;
    if (dir === "ccw" && end > start) return end - 360;
    return end;
  };

  const getEasingT = (t: number, easing: string) => {
    if (easing === 'ease-in-out') return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    if (easing === 'ease-in') return t * t;
    if (easing === 'ease-out') return t * (2 - t);
    return t; // linear or custom
  };

  // NEW: Unified Interpolation Logic
  const getInterpolatedTransform = useCallback((t: number) => {
    const easeT = getEasingT(t, animEasing);
    const actualEndRot = getActualEndRotation(animStartRot, animEndRot, animRotDirection);

    const s = animStartScale + (animEndScale - animStartScale) * easeT;
    const r = animStartRot + (actualEndRot - animStartRot) * easeT;
    const x = canvasX + (animStartX + (animEndX - animStartX) * easeT);
    const y = canvasY + (animStartY + (animEndY - animStartY) * easeT);

    return { s, r, x, y };
  }, [animEasing, animStartRot, animEndRot, animRotDirection, animStartScale, animEndScale, canvasX, canvasY, animStartX, animEndX, animStartY, animEndY]);

  const getCanvasBackgroundStyles = (): React.CSSProperties => {
    if (transparent) return { backgroundColor: "transparent" };
    if (bgType === "solid") return { backgroundColor: bgColor };
    if (bgType === "gradient") {
      if (bgGradientType === "linear") {
        return { backgroundImage: `linear-gradient(${bgGradientAngle}deg, ${bgGradientColor1} ${bgGradientStop1}%, ${bgGradientColor2} ${bgGradientStop2}%)` };
      } else {
        return { backgroundImage: `radial-gradient(circle at ${bgRadialX}% ${bgRadialY}%, ${bgGradientColor1} ${bgGradientStop1}%, ${bgGradientColor2} ${bgGradientStop2}%)` };
      }
    }
    if (bgType === "image" && bgImage) {
      return { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ffffff' };
    }
    return { backgroundColor: bgColor };
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    setExportProgress(0);
    setExportStatus("Preparing...");
    
    try {
      const pixelRatio = parseFloat(exportQuality);
      let effectiveBgColor = (exportFormat === "jpeg") ? ((transparent || bgType !== "solid") ? "#ffffff" : bgColor) : (transparent ? "rgba(0,0,0,0)" : (bgType === "solid" ? bgColor : "rgba(0,0,0,0)"));

      const baseExportOptions = {
        cacheBust: true,
        backgroundColor: effectiveBgColor,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        style: { transform: 'none' }
      };

      if (exportFormat === "video" || exportFormat === "gif") {
        if (!animTargetRef.current) throw new Error("Missing animation target node.");
        
        const isGif = exportFormat === "gif";
        const fps = isGif ? 15 : 30;
        const resRatio = isGif ? 0.5 : 1; 
        const duration = animEnabled ? animDuration : 1; 
        const totalFrames = Math.ceil(duration * fps);
        const frames: HTMLCanvasElement[] = [];
        
        const el = canvasRef.current;
        const targetNode = animTargetRef.current;
        const originalTransition = targetNode.style.transitionProperty;
        const originalTransform = targetNode.style.transform;
        targetNode.style.transitionProperty = 'none';
        
        setExportStatus("Rendering Frames...");
        for (let i = 0; i <= totalFrames; i++) {
            const t = i / totalFrames;
            const { s, r, x, y } = animEnabled ? getInterpolatedTransform(t) : { s: deviceScale, r: 0, x: canvasX, y: canvasY };

            targetNode.style.transform = `translate(${x}px, ${y}px) scale(${s / 100}) rotate(${r}deg)`;
            
            await new Promise(res => setTimeout(res, 15)); // Increased wait for rendering
            
            const frameCanvas = await toCanvas(el, { 
                ...baseExportOptions,
                pixelRatio: resRatio,
                canvasWidth: CANVAS_WIDTH * resRatio,
                canvasHeight: CANVAS_HEIGHT * resRatio,
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
          const workerUrl = URL.createObjectURL(await workerReq.blob());

          const gif = new (window as any).GIF({ workers: 2, quality: 10, width: frames[0].width, height: frames[0].height, workerScript: workerUrl, transparent: transparent ? "rgba(0,0,0,0)" : null });
          frames.forEach(frame => gif.addFrame(frame, { delay: 1000 / fps, copy: true }));
          gif.on('progress', (p: number) => setExportProgress(50 + Math.round(p * 50)));
          gif.on('finished', (blob: Blob) => {
            const link = document.createElement('a'); link.download = `mockup-animated.gif`; link.href = URL.createObjectURL(blob); link.click();
            URL.revokeObjectURL(link.href); URL.revokeObjectURL(workerUrl); setExporting(false);
          });
          gif.render();
          return; 
        } 
        
        setExportStatus("Encoding Video...");
        const outCanvas = document.createElement('canvas');
        outCanvas.width = frames[0].width; outCanvas.height = frames[0].height;
        const ctx = outCanvas.getContext('2d');
        if (!ctx) throw new Error("Context error.");
        
        const stream = outCanvas.captureStream(fps);
        let mimeType = 'video/webm';
        let ext = 'webm';
        const codecs = ['video/mp4;codecs="avc1.42E01E, mp4a.40.2"', 'video/mp4;codecs="avc1"', 'video/mp4', 'video/webm'];
        for (const codec of codecs) { if (MediaRecorder.isTypeSupported(codec)) { mimeType = codec; ext = codec.includes('mp4') ? 'mp4' : 'webm'; break; } }
        
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) };
        const recorderPromise = new Promise<Blob>(res => recorder.onstop = () => res(new Blob(chunks, { type: mimeType })));
        
        recorder.start();
        let frameIdx = 0;
        const interval = setInterval(() => {
            if (frameIdx >= frames.length) {
                clearInterval(interval);
                // FIX: Delay stop to ensure the last frame is encoded
                setTimeout(() => recorder.stop(), 500); 
                return;
            }
            ctx.clearRect(0, 0, outCanvas.width, outCanvas.height);
            ctx.drawImage(frames[frameIdx], 0, 0);
            frameIdx++;
            setExportProgress(50 + Math.round((frameIdx / frames.length) * 50));
        }, 1000 / fps); 
        
        const blob = await recorderPromise;
        const link = document.createElement('a'); link.download = `mockup-video.${ext}`; link.href = URL.createObjectURL(blob); link.click();
        URL.revokeObjectURL(link.href);
      } else {
        const imageOptions = { ...baseExportOptions, pixelRatio };
        let dataUrl = (exportFormat === "jpeg") ? await toJpeg(canvasRef.current, { ...imageOptions, quality: 0.95 }) : (exportFormat === "svg" ? await toSvg(canvasRef.current, imageOptions) : await toPng(canvasRef.current, imageOptions));
        const link = document.createElement("a"); link.download = `mockup-${device}.${exportFormat}`; link.href = dataUrl; link.click();
      }
    } catch (err) { console.error("Export failed", err); } finally { if (exportFormat !== "gif") { setExporting(false); setExportProgress(0); } }
  }, [device, transparent, bgColor, exportFormat, exportQuality, animEnabled, animDuration, animEasing, deviceScale, canvasX, canvasY, bgType, bgImage, bgGradientType, bgGradientColor1, bgGradientColor2, bgGradientAngle, bgGradientStop1, bgGradientStop2, bgRadialX, bgRadialY, CANVAS_WIDTH, CANVAS_HEIGHT, getInterpolatedTransform]);

  // Preview Logic
  const previewState = useMemo(() => {
      if (!animEnabled) return { s: deviceScale, r: 0, x: canvasX, y: canvasY };
      return getInterpolatedTransform(scrubProgress / 100);
  }, [animEnabled, deviceScale, canvasX, canvasY, getInterpolatedTransform, scrubProgress]);

  return (
    <div className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-card px-6 py-4 shrink-0 z-10 relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg"><ImageIcon className="w-5 h-5 text-primary-foreground" /></div>
          <h1 className="text-xl font-bold tracking-tight">Screen Booth</h1>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
          <span>&copy; {new Date().getFullYear()} Screen Booth</span>
          <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f32d.png" alt="Hotdog" className="w-5 h-5 object-contain" />
        </div>
      </header>

      <div className="flex-1 flex flex-col-reverse lg:flex-row min-h-0 relative">
        <aside className="w-full lg:w-[360px] flex-1 lg:flex-none border-t lg:border-t-0 lg:border-r bg-card p-4 overflow-y-auto shrink-0 z-10 relative custom-scrollbar">
          <Accordion type="multiple" value={openAccordions} onValueChange={(val) => { setOpenAccordions(val); setAnimEnabled(val.includes("animation")); }} className="w-full pb-8 lg:pb-0">
            {/* Frame & Asset accordions remain the same... */}
            <AccordionItem value="frame" className="border-b-0 mb-4 bg-muted/20 p-4 rounded-xl border">
              <AccordionTrigger className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:no-underline py-0 pb-4">Select Frame</AccordionTrigger>
              <AccordionContent className="pb-4 pt-2 px-2 -mx-2">
                <div className="grid grid-cols-1 gap-2">
                  {["iphone17", "ipad-air", "macbook-pro-16", "imac-24-inch", "samsung-galaxy-tab", "samsung-galaxy-phone"].map((id) => (
                    <button key={id} onClick={() => setDevice(id as DeviceType)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${device === id ? "border-primary bg-primary/10 text-primary shadow-inner" : "border-border hover:bg-muted/50 bg-background"}`}>
                      <span className="font-bold text-sm capitalize">{id.replace(/-/g, ' ')}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="asset" className="border-b-0 mb-4 bg-muted/20 p-4 rounded-xl border">
              <AccordionTrigger className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:no-underline py-0 pb-4">Manage Asset</AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4 pt-2 px-2 -mx-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button variant="outline" className="w-full h-12 shadow-sm" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 w-4 h-4" /> {image ? "Change Image" : "Upload Screenshot"}</Button>
                <div className="flex flex-col gap-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-semibold">Format</Label>
                    <Select value={exportFormat} onValueChange={(val: ExportFormat) => setExportFormat(val)}>
                      <SelectTrigger className="h-10 text-xs bg-background w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpeg">JPEG</SelectItem><SelectItem value="svg">SVG</SelectItem><SelectItem value="gif">Animated GIF</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-semibold">Quality</Label>
                    <Select value={exportQuality} onValueChange={setExportQuality} disabled={exportFormat === 'video' || exportFormat === 'gif' || exporting}>
                      <SelectTrigger className="h-10 text-xs bg-background w-full"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="1">1x</SelectItem><SelectItem value="2">2x</SelectItem><SelectItem value="3">3x</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleExport} disabled={!image || exporting} className="w-full h-12 shadow-md transition-all active:scale-95 font-semibold"><Download className="mr-2 w-4 h-4" /> {exporting ? `${exportStatus} (${exportProgress}%)` : `Export ${exportFormat.toUpperCase()}`}</Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="canvas" className="border-b-0 mb-8 bg-muted/20 p-4 rounded-xl border">
              <AccordionTrigger className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:no-underline py-0 pb-4">Canvas Options</AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4 pt-2 px-2 -mx-2">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground font-semibold">Canvas Size</Label>
                  <Select value={canvasRatio} onValueChange={(val: CanvasRatio) => setCanvasRatio(val)}>
                    <SelectTrigger className="h-10 text-xs bg-background w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="16:9">16:9</SelectItem><SelectItem value="9:16">9:16</SelectItem><SelectItem value="1:1">1:1</SelectItem><SelectItem value="4:5">4:5 (1080x1350)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-4 bg-background p-3 rounded-lg border shadow-sm mt-2">
                  <div className="flex items-center justify-between border-b pb-1 w-full"><Label className="text-xs font-bold flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Position</Label><Button variant="ghost" size="sm" className="h-5 px-2 text-[10px] bg-muted border shadow-sm" onClick={centerCanvasPosition}><Crosshair className="w-3 h-3 mr-1"/> Center</Button></div>
                  <div className="space-y-3"><div className="flex justify-between"><Label className="text-[10px] text-muted-foreground">X Axis</Label><span className="text-[10px] font-mono">{canvasX}px</span></div><Slider value={[canvasX]} onValueChange={(v) => setCanvasX(v[0])} min={-800} max={800} /></div>
                  <div className="space-y-3"><div className="flex justify-between"><Label className="text-[10px] text-muted-foreground">Y Axis</Label><span className="text-[10px] font-mono">{canvasY}px</span></div><Slider value={[canvasY]} onValueChange={(v) => setCanvasY(v[0])} min={-800} max={800} /></div>
                </div>
                {/* Background controls... */}
                <div className="flex items-center justify-between pb-2 border-b pt-4"><Label className="text-sm font-medium cursor-pointer" onClick={() => setTransparent(!transparent)}>Transparent Background</Label><Switch checked={transparent} onCheckedChange={setTransparent} /></div>
                {!transparent && (
                  <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                    <Tabs value={bgType} onValueChange={(v: any) => setBgType(v)} className="w-full"><TabsList className="w-full grid grid-cols-3"><TabsTrigger value="solid" className="text-[10px]">Solid</TabsTrigger><TabsTrigger value="gradient" className="text-[10px]">Gradient</TabsTrigger><TabsTrigger value="image" className="text-[10px]">Image</TabsTrigger></TabsList></Tabs>
                    {bgType === "solid" && (<div className="flex items-center gap-3"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 cursor-pointer" /><Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono uppercase h-10" /></div>)}
                    {bgType === "gradient" && (
                        <div className="space-y-4 bg-background p-3 rounded-lg border shadow-sm">
                             <Select value={bgGradientType} onValueChange={(v: any) => setBgGradientType(v)}><SelectTrigger className="h-8 text-xs bg-muted"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="linear">Linear</SelectItem><SelectItem value="radial">Radial</SelectItem></SelectContent></Select>
                             <div className="flex gap-2"><input type="color" value={bgGradientColor1} onChange={(e) => setBgGradientColor1(e.target.value)} /><input type="color" value={bgGradientColor2} onChange={(e) => setBgGradientColor2(e.target.value)} /></div>
                             <div className="space-y-3 pt-2"><Label className="text-[10px]">Start/End Stop</Label><Slider value={[bgGradientStop1, bgGradientStop2]} onValueChange={(v) => {setBgGradientStop1(v[0]); setBgGradientStop2(v[1]);}} max={100} step={1} /></div>
                             {bgGradientType === "linear" ? (<Slider value={[bgGradientAngle]} onValueChange={(v) => setBgGradientAngle(v[0])} max={360} />) : (<div className="space-y-2"><Slider value={[bgRadialX]} onValueChange={(v) => setBgRadialX(v[0])} max={100} /><Slider value={[bgRadialY]} onValueChange={(v) => setBgRadialY(v[0])} max={100} /></div>)}
                        </div>
                    )}
                  </div>
                )}
                {!animEnabled && (<div className="space-y-3 pt-4 border-t"><div className="flex justify-between"><Label>Scale</Label><span className="text-xs font-mono">{deviceScale}%</span></div><Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} /></div>)}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lighting" className="border-b-0 mb-4 bg-muted/20 p-4 rounded-xl border">
              <AccordionTrigger className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:no-underline py-0 pb-4">Lighting & Shadows</AccordionTrigger>
              <AccordionContent className="space-y-6 pb-4 pt-2 px-2 -mx-2">
                <div className="space-y-3"><div className="flex justify-between"><Label>Drop Shadow</Label><span className="text-xs font-mono">{dropShadow}%</span></div><Slider value={[dropShadow]} onValueChange={(v) => setDropShadow(v[0])} max={100} /></div>
                {dropShadow > 0 && (
                    <div className="space-y-3"><input type="color" value={dropShadowColor} onChange={(e) => setDropShadowColor(e.target.value)} /><div className="flex justify-between"><Label>Angle</Label><Slider value={[dropShadowAngle]} onValueChange={(v) => setDropShadowAngle(v[0])} max={360} /></div></div>
                )}
                <div className="space-y-3"><div className="flex justify-between"><Label>Inner Glow</Label><span className="text-xs font-mono">{innerGlow}%</span></div><Slider value={[innerGlow]} onValueChange={(v) => setInnerGlow(v[0])} max={100} /></div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="animation" className="border-b-0 mb-4 bg-muted/20 p-4 rounded-xl border">
              <div className="flex items-center justify-between"><AccordionTrigger className="text-xs font-black uppercase tracking-wider text-muted-foreground hover:no-underline py-0 pb-4 focus:outline-none flex-1 text-left [&>svg]:hidden">Animation Options</AccordionTrigger><div className="pb-4"><Switch checked={animEnabled} onCheckedChange={(checked) => { setAnimEnabled(checked); setOpenAccordions(prev => checked ? [...prev, "animation"] : prev.filter(id => id !== "animation")); }} /></div></div>
              <AccordionContent className="pb-4 pt-2 px-2 -mx-2 overflow-visible">
                {animEnabled && (
                  <div className="space-y-6 pt-4 animate-in fade-in zoom-in-95 duration-200">
                    {/* NEW TIMELINE SCRUBBER */}
                    <div className="space-y-4 bg-primary/5 p-3 rounded-lg border border-primary/20 shadow-sm">
                      <div className="flex items-center justify-between"><Label className="text-xs font-bold flex items-center gap-1.5 text-primary"><Timer className="w-3.5 h-3.5" /> Animation Timeline</Label><span className="text-[10px] font-mono text-primary/70">{scrubProgress}%</span></div>
                      <Slider value={[scrubProgress]} onValueChange={(v) => { setIsPlaying(false); setScrubProgress(v[0]); }} max={100} step={0.1} className="py-2" />
                      <p className="text-[10px] text-muted-foreground leading-tight italic">Drag to scrub through the timeline and preview each frame.</p>
                    </div>

                    <div className="space-y-4 bg-background p-3 rounded-lg border shadow-sm">
                        <div className="flex justify-between"><Label className="text-[10px]">Start/End Scale</Label><Slider value={[animStartScale, animEndScale]} onValueChange={(v) => { setAnimStartScale(v[0]); setAnimEndScale(v[1]); }} min={10} max={150} disabled={isPlaying} /></div>
                    </div>

                    <div className="space-y-4 bg-background p-3 rounded-lg border shadow-sm">
                      <div className="flex items-center justify-between border-b pb-1 w-full"><Label className="text-xs font-bold">Position Offset</Label><Button variant="ghost" size="sm" className="h-5 px-2 text-[10px] bg-muted border shadow-sm" onClick={centerAnimPositions} disabled={isPlaying}><Crosshair className="w-3 h-3 mr-1"/> Center</Button></div>
                      <div className="space-y-3">
                        <Label className="text-[10px] text-muted-foreground">Start Point (X/Y)</Label>
                        <Slider value={[animStartX]} onValueChange={(v) => setAnimStartX(v[0])} min={-800} max={800} disabled={isPlaying} />
                        <Slider value={[animStartY]} onValueChange={(v) => setAnimStartY(v[0])} min={-800} max={800} disabled={isPlaying} />
                      </div>
                      <div className="space-y-3 pt-2 border-t border-dashed">
                        <Label className="text-[10px] text-muted-foreground">End Point (X/Y)</Label>
                        <Slider value={[animEndX]} onValueChange={(v) => setAnimEndX(v[0])} min={-800} max={800} disabled={isPlaying} />
                        <Slider value={[animEndY]} onValueChange={(v) => setAnimEndY(v[0])} min={-800} max={800} disabled={isPlaying} />
                      </div>
                    </div>

                    <div className="space-y-4 bg-background p-3 rounded-lg border shadow-sm">
                      <Label className="text-xs font-bold border-b pb-1 w-full flex">Rotation</Label>
                      <Slider value={[animStartRot, animEndRot]} onValueChange={(v) => { setAnimStartRot(v[0]); setAnimEndRot(v[1]); }} min={0} max={360} disabled={isPlaying} />
                      <div className="flex items-center justify-between pt-2"><Label className="text-[10px] text-muted-foreground">Direction</Label><div className="flex gap-1 bg-muted p-1 rounded-md border"><Button variant={animRotDirection === "cw" ? "default" : "ghost"} size="sm" className="h-6 text-[10px] px-2 shadow-none" onClick={() => setAnimRotDirection("cw")} disabled={isPlaying}>CW</Button><Button variant={animRotDirection === "ccw" ? "default" : "ghost"} size="sm" className="h-6 text-[10px] px-2 shadow-none" onClick={() => setAnimRotDirection("ccw")} disabled={isPlaying}>CCW</Button></div></div>
                    </div>

                    <div className="space-y-4 bg-background p-3 rounded-lg border shadow-sm">
                      <div className="space-y-3"><div className="flex justify-between"><Label className="text-[10px] text-muted-foreground">Duration</Label><span className="text-[10px] font-mono">{animDuration}s</span></div><Slider value={[animDuration]} onValueChange={(v) => setAnimDuration(v[0])} min={0.5} max={10} step={0.5} disabled={isPlaying} /></div>
                      <div className="space-y-2"><Label className="text-[10px] text-muted-foreground">Easing</Label><Select value={animEasing} onValueChange={setAnimEasing} disabled={isPlaying}><SelectTrigger className="h-8 text-xs bg-muted"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="linear">Linear</SelectItem><SelectItem value="ease-in">Ease In</SelectItem><SelectItem value="ease-out">Ease Out</SelectItem><SelectItem value="ease-in-out">Ease In Out</SelectItem></SelectContent></Select></div>
                    </div>

                    <div className="flex gap-2"><Button onClick={handlePlayAnimation} disabled={isPlaying} className="flex-1 font-semibold"><Play className="w-4 h-4 mr-2 fill-current" /> Play Preview</Button><Button variant="outline" onClick={handleResetAnimation} disabled={!isPlaying && scrubProgress === 0} className="px-3" title="Reset Animation"><RotateCcw className="w-4 h-4" /></Button></div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>

        <main ref={mainAreaRef} className="w-full h-[45vh] min-h-[300px] lg:h-auto lg:flex-1 relative bg-muted/20 overflow-hidden shrink-0" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="origin-center shadow-2xl transition-all duration-300 pointer-events-auto shrink-0" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${previewScale})`, ...(transparent && { backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)", backgroundSize: "40px 40px" }) }}>
              <div ref={canvasRef} className="w-full h-full flex items-center justify-center relative overflow-hidden transition-all duration-300" style={getCanvasBackgroundStyles()}>
                <div ref={animTargetRef} style={{ 
                    transform: `translate(${previewState.x}px, ${previewState.y}px) scale(${previewState.s / 100}) rotate(${previewState.r}deg)`, 
                    transitionProperty: isPlaying ? 'transform' : 'none', 
                    transitionDuration: isPlaying ? `${animDuration}s` : '0s', 
                    transitionTimingFunction: animEasing 
                }}>
                  <DeviceFrame device={device} image={image} dropShadow={dropShadow} dropShadowAngle={dropShadowAngle} dropShadowAllSides={dropShadowAllSides} dropShadowColor={dropShadowColor} innerGlow={innerGlow} innerGlowAngle={innerGlowAngle} onUploadClick={() => fileInputRef.current?.click()} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;