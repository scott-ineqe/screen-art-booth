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
  Layers, Sparkles, Video, Palette, Plus, Trash2, Boxes
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

const Index = () => {
  const [mode, setMode] = useState<AppMode>("mockup");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [device, setDevice] = useState<DeviceType>("iphone17");
  const [image, setImage] = useState<string | null>(null);
  const [deviceScale, setDeviceScale] = useState(60);
  const [exporting, setExporting] = useState(false);
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

  const canvasRef = useRef<HTMLDivElement>(null);
  const animTargetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const mainAreaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

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
    if (!mainAreaRef.current) return;
    const { width, height } = mainAreaRef.current.getBoundingClientRect();
    const padding = 100;
    const availableWidth = width - padding;
    const availableHeight = height - padding;
    const scaleX = availableWidth / CANVAS_WIDTH;
    const scaleY = availableHeight / CANVAS_HEIGHT;
    setPreviewScale(Math.min(scaleX, scaleY));
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  useEffect(() => {
    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    if (mainAreaRef.current) observer.observe(mainAreaRef.current);
    return () => observer.disconnect();
  }, [calculateScale]);

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
    const newStop: GradientStop = {
      id: Math.random().toString(36).substr(2, 9),
      color: "#ffffff",
      stop: 50
    };
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
      const stopsStr = [...gradientStops]
        .sort((a, b) => a.stop - b.stop)
        .map(s => `${s.color} ${s.stop}%`)
        .join(", ");
      return bgGradientType === "linear" 
        ? { backgroundImage: `linear-gradient(${bgGradientAngle}deg, ${stopsStr})` }
        : { backgroundImage: `radial-gradient(circle at ${bgRadialX}% ${bgRadialY}%, ${stopsStr})` };
    }
    return { 
      backgroundImage: bgImage ? `url(${bgImage})` : 'none', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      backgroundColor: bgColor 
    };
  };

  const getInterpolatedTransform = useCallback((t: number) => {
    const getEasingT = (time: number) => {
      if (animEasing === 'ease-in-out') return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
      if (animEasing === 'ease-in') return time * time;
      if (animEasing === 'ease-out') return time * (2 - time);
      return time;
    };
    const easeT = getEasingT(t);
    
    // Simple rotation interpolation for preview
    const actualEndRot = animEndRot;

    return {
      s: animStartScale + (animEndScale - animStartScale) * easeT,
      r: animStartRot + (actualEndRot - animStartRot) * easeT,
      x: canvasX + (animStartX + (animEndX - animStartX) * easeT),
      y: canvasY + (animStartY + (animEndY - animStartY) * easeT)
    };
  }, [animEasing, animStartRot, animEndRot, animStartScale, animEndScale, canvasX, canvasY, animStartX, animEndX, animStartY, animEndY]);

  const previewState = useMemo(() => {
      if (mode === "mockup") return { s: deviceScale, r: 0, x: canvasX, y: canvasY };
      return getInterpolatedTransform((scrubProgress || 0) / 100);
  }, [mode, deviceScale, canvasX, canvasY, getInterpolatedTransform, scrubProgress]);

  const handlePlayAnimation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setScrubProgress(0);
    
    const startTime = performance.now();
    const durationMs = (animDuration || 2) * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      setScrubProgress(progress * 100);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `mockup-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Mockup exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export image.");
    } finally {
      setExporting(false);
    }
  };

  const glassCard = "bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-xl shadow-black/5";

  return (
    <div className="h-[100dvh] w-full bg-[#f1f5f9] dark:bg-[#020617] text-foreground transition-colors duration-700 flex flex-col overflow-hidden font-sans">
      <header className="h-16 px-6 flex items-center justify-between z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transform hover:rotate-6 transition-transform">
            <Sparkles className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-lg font-black tracking-tight hidden sm:block">SCREEN ART BOOTH</span>
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
          <Button variant="outline" size="icon" className="rounded-full bg-background/40" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button onClick={handleExport} disabled={exporting || !image} className="rounded-full px-6 font-bold shadow-md">
            {exporting ? "Wait..." : "Export"}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">
        <aside className="w-[380px] shrink-0 border-r border-border/40 bg-card/20 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            <div className={glassCard}>
              <Label className="text-[11px] uppercase font-bold tracking-wider opacity-60 block mb-3">Content Asset</Label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button variant="outline" className="w-full h-16 rounded-xl border-dashed border-2 flex flex-col gap-1" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase">{image ? "Replace Screenshot" : "Upload Screenshot"}</span>
              </Button>
            </div>

            <Accordion type="multiple" defaultValue={["frame", "canvas", "background", "appearance"]} className="space-y-4">
              <AccordionItem value="frame" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary" /><span className="text-[11px] font-bold uppercase tracking-wider">Device Frame</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 grid grid-cols-2 gap-2">
                  {["iphone17", "ipad-air", "macbook-pro-16", "imac-24-inch", "samsung-galaxy-tab", "samsung-galaxy-phone"].map((id) => (
                    <button key={id} onClick={() => setDevice(id as DeviceType)} className={cn("p-3 rounded-xl border transition-all text-[10px] font-black uppercase", device === id ? "bg-primary text-primary-foreground border-primary" : "bg-background/40 border-border/40")}>
                      {id.replace(/-/g, ' ')}
                    </button>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="canvas" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Boxes className="w-4 h-4 text-primary" /><span className="text-[11px] font-bold uppercase tracking-wider">Canvas Settings</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-60">Canvas Size</Label>
                    <Select value={canvasRatio} onValueChange={(v: any) => setCanvasRatio(v)}>
                      <SelectTrigger className="rounded-xl h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                        <SelectItem value="9:16">Vertical (9:16)</SelectItem>
                        <SelectItem value="1:1">Square (1:1)</SelectItem>
                        <SelectItem value="4:5">Instagram (4:5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="background" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Palette className="w-4 h-4 text-primary" /><span className="text-[11px] font-bold uppercase tracking-wider">Background</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl">
                    <Label className="text-[10px] font-bold uppercase opacity-60">Transparent Background</Label>
                    <Switch checked={transparent} onCheckedChange={setTransparent} />
                  </div>

                  {!transparent && (
                    <div className="space-y-4">
                      <Tabs value={bgType} onValueChange={(v: any) => setBgType(v)}>
                        <TabsList className="w-full h-8 bg-muted/40 rounded-lg">
                          <TabsTrigger value="solid" className="flex-1 text-[10px]">Solid</TabsTrigger>
                          <TabsTrigger value="gradient" className="flex-1 text-[10px]">Gradient</TabsTrigger>
                          <TabsTrigger value="image" className="flex-1 text-[10px]">Image</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="solid" className="pt-3 flex gap-2">
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer" />
                          <Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono h-8 text-[10px]" />
                        </TabsContent>

                        <TabsContent value="gradient" className="pt-3 space-y-4">
                          <Select value={bgGradientType} onValueChange={(v: any) => setBgGradientType(v)}>
                            <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="linear">Linear</SelectItem><SelectItem value="radial">Radial</SelectItem></SelectContent>
                          </Select>

                          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {gradientStops.map((stop) => (
                              <div key={stop.id} className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg">
                                <input type="color" value={stop.color} onChange={(e) => updateGradientStop(stop.id, { color: e.target.value })} className="w-6 h-6 rounded shrink-0 cursor-pointer" />
                                <div className="flex-1 px-2"><Slider value={[stop.stop]} onValueChange={(v) => updateGradientStop(stop.id, { stop: v[0] })} max={100} /></div>
                                <span className="text-[9px] font-mono w-6">{stop.stop}%</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80" onClick={() => removeGradientStop(stop.id)} disabled={gradientStops.length <= 2}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            ))}
                          </div>
                          
                          <Button variant="outline" size="sm" className="w-full h-7 text-[9px] font-bold" onClick={addGradientStop}><Plus className="w-3 h-3 mr-1" /> Add Color Stop</Button>

                          {bgGradientType === "linear" ? (
                            <div className="space-y-2"><div className="flex justify-between"><Label className="text-[9px] uppercase opacity-40">Angle</Label><span className="text-[9px]">{bgGradientAngle}°</span></div><Slider value={[bgGradientAngle]} onValueChange={(v) => setBgGradientAngle(v[0])} max={360} /></div>
                          ) : (
                            <div className="space-y-3"><Label className="text-[9px] uppercase opacity-40">Center Position</Label><Slider value={[bgRadialX]} onValueChange={(v) => setBgRadialX(v[0])} max={100} /><Slider value={[bgRadialY]} onValueChange={(v) => setBgRadialY(v[0])} max={100} /></div>
                          )}
                        </TabsContent>

                        <TabsContent value="image" className="pt-3 space-y-3">
                          <input ref={bgFileInputRef} type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                          <Button variant="outline" className="w-full h-20 rounded-xl border-dashed border-2 flex flex-col gap-1" onClick={() => bgFileInputRef.current?.click()}>
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase">{bgImage ? "Change Image" : "Upload Background"}</span>
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="appearance" className="border-none">
                <AccordionTrigger className={cn(glassCard, "hover:no-underline py-4")}><div className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /><span className="text-[11px] font-bold uppercase tracking-wider">{mode === "mockup" ? "Transform" : "Timeline"}</span></div></AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                   {mode === "mockup" ? (
                     <div className="space-y-6 animate-in fade-in">
                        <div className="space-y-3"><div className="flex justify-between"><Label className="text-[10px] uppercase font-bold">Scale</Label><span className="text-[10px]">{deviceScale}%</span></div><Slider value={[deviceScale]} onValueChange={(v) => setDeviceScale(v[0])} min={20} max={120} /></div>
                        <div className="space-y-3"><Label className="text-[10px] uppercase font-bold">Canvas Offset</Label><Slider value={[canvasX]} onValueChange={(v) => setCanvasX(v[0])} min={-800} max={800} /><Slider value={[canvasY]} onValueChange={(v) => setCanvasY(v[0])} min={-800} max={800} /></div>
                     </div>
                   ) : (
                     <div className="space-y-6 animate-in slide-in-from-left-4">
                        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                           <div className="flex items-center justify-between mb-3"><Label className="text-[10px] font-black uppercase text-primary">Scrubber</Label><span className="text-[10px] font-mono text-primary">{(scrubProgress || 0).toFixed(1)}%</span></div>
                           <Slider value={[scrubProgress]} onValueChange={(v) => { setIsPlaying(false); setScrubProgress(v[0]); }} max={100} step={0.1} />
                           <div className="flex gap-2 mt-4"><Button onClick={handlePlayAnimation} disabled={isPlaying} className="flex-1 h-9 rounded-lg font-black text-[10px] uppercase"><Play className="w-3 h-3 mr-2" /> Play Preview</Button><Button variant="outline" size="icon" onClick={() => { setIsPlaying(false); setScrubProgress(0); }} className="h-9 w-9 border-primary/20"><RotateCcw className="w-3 h-3" /></Button></div>
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[10px] font-bold uppercase opacity-60">Motion & Scale</Label>
                           <div className="space-y-4 px-1">
                              <div className="space-y-2"><Label className="text-[9px] uppercase opacity-40">Start X/Y & Scale</Label><Slider value={[animStartX]} onValueChange={(v) => setAnimStartX(v[0])} min={-800} max={800} /><Slider value={[animStartY]} onValueChange={(v) => setAnimStartY(v[0])} min={-800} max={800} /><Slider value={[animStartScale]} onValueChange={(v) => setAnimStartScale(v[0])} min={10} max={150} /></div>
                              <div className="space-y-2"><Label className="text-[9px] uppercase opacity-40">End X/Y & Scale</Label><Slider value={[animEndX]} onValueChange={(v) => setAnimEndX(v[0])} min={-800} max={800} /><Slider value={[animEndY]} onValueChange={(v) => setAnimEndY(v[0])} min={-800} max={800} /><Slider value={[animEndScale]} onValueChange={(v) => setAnimEndScale(v[0])} min={10} max={150} /></div>
                              <div className="space-y-2"><Label className="text-[9px] uppercase opacity-40">Rotation (Start/End)</Label><Slider value={[animStartRot]} onValueChange={(v) => setAnimStartRot(v[0])} min={-360} max={360} /><Slider value={[animEndRot]} onValueChange={(v) => setAnimEndRot(v[0])} min={-360} max={360} /></div>
                           </div>
                        </div>
                     </div>
                   )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <main ref={mainAreaRef} className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8 bg-muted/5">
          <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-[0.08]" 
               style={{ backgroundImage: "linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />
          
          <div className="relative z-10 shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] transition-all duration-500 ease-out border-4 border-white/10" 
               style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${previewScale})`, aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}>
            
            <div ref={canvasRef} className="w-full h-full relative overflow-hidden bg-background pointer-events-auto" style={getCanvasBackgroundStyles()}>
              {transparent && <div className="absolute inset-0" style={{ backgroundImage: "repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%)", backgroundSize: "20px 20px" }} />}

              <div ref={animTargetRef} className="z-10 absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ 
                  transform: `translate(${previewState.x}px, ${previewState.y}px) scale(${previewState.s / 100}) rotate(${previewState.r}deg)`, 
                  transitionProperty: isPlaying ? 'transform' : 'none', 
                  transitionDuration: isPlaying ? `${animDuration}s` : '0s', 
                  transitionTimingFunction: animEasing 
                }}>
                <div className="pointer-events-auto">
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
        </main>
      </div>
    </div>
  );
};

export default Index;