import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  CloudSun,
  Crosshair,
  Eye,
  Filter,
  Gauge,
  Helicopter,
  Info,
  Layers,
  LifeBuoy,
  Map,
  MapPin,
  Radio,
  Search,
  ShieldAlert,
  Ship,
  Siren,
  Smartphone,
  Waves,
  Wind,
  Radar,
  Compass,
  AlertOctagon,
  Rewind,
  Play,
  Pause,
  Thermometer,
  Droplets,
  X,
} from "lucide-react";

const bondiPhoto = "https://images.unsplash.com/photo-1526481280695-3c4691f8d1d3?q=80&w=1600&auto=format&fit=crop";
const manlyPhoto = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop";
const cronullaPhoto = "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop";
const wollongongPhoto = "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1600&auto=format&fit=crop";

const coastalPhoto = bondiPhoto;
const rockPhoto = cronullaPhoto;
const patrolPhoto = wollongongPhoto;
const boatPhoto = manlyPhoto;

// Simulated coastal surveillance feeds (prototype hardcoded media, served locally)
const coastalFeedVideo = "/feeds/coastal-patrol.mp4";
const distressFeedVideo = "/feeds/bondi-distress.mp4";

const cameras = [
  { id: "CAM-00", name: "Northern Beaches Watch", site: "Palm Beach", state: "Online", health: 96, x: 83, y: 18, lat: -33.5966, lng: 151.3235, image: manlyPhoto, coverage: "Northern shoreline + surf", detections: 5, confidence: 61, bearing: 95, fov: 80, range: 550, conditions: { wave: "1.2 m", wind: "10 kt NE", tide: "Rising · mid", water: "21.1 °C", visibility: "9.2 km", risk: "Moderate", note: "Steady NE breeze, low swell." } },
  { id: "CAM-01", name: "North Bondi Tower", site: "Bondi Beach", state: "Online", health: 99, x: 82, y: 33, lat: -33.8889, lng: 151.2812, image: bondiPhoto, feedVideo: coastalFeedVideo, coverage: "North patrol + shoreline", detections: 11, confidence: 72, bearing: 100, fov: 75, range: 520, conditions: { wave: "1.6 m", wind: "16 kt SE", tide: "Rising · 2/3", water: "19.8 °C", visibility: "8.4 km", risk: "Elevated", note: "Cross-shore wind, choppy shorebreak." } },
  { id: "CAM-02", name: "Bondi South Waterline", site: "Bondi Beach", state: "Online", health: 96, x: 86, y: 36, lat: -33.8939, lng: 151.2799, image: coastalPhoto, feedVideo: distressFeedVideo, coverage: "Swim zone + offshore", detections: 23, confidence: 86, bearing: 110, fov: 85, range: 600, conditions: { wave: "1.8 m", wind: "18 kt SE", tide: "Rising · high in 47 min", water: "19.4 °C", visibility: "7.8 km", risk: "High", note: "Active rip on south corner. Jetski OK, heli marginal." } },
  { id: "CAM-03", name: "Coogee Surf Club", site: "Coogee Beach", state: "Online", health: 94, x: 82, y: 41, lat: -33.9207, lng: 151.2555, image: cronullaPhoto, coverage: "Flags + southern water", detections: 14, confidence: 76, bearing: 95, fov: 80, range: 500, conditions: { wave: "1.3 m", wind: "14 kt E", tide: "Rising · mid", water: "20.2 °C", visibility: "9.0 km", risk: "Moderate", note: "Manageable surf inside flags." } },
  { id: "CAM-04", name: "Maroubra North", site: "Maroubra Beach", state: "Degraded", health: 74, x: 83, y: 46, lat: -33.9449, lng: 151.2602, image: wollongongPhoto, coverage: "Rock shelf + rip channel", detections: 9, confidence: 64, bearing: 105, fov: 70, range: 480, conditions: { wave: "2.1 m", wind: "20 kt SE", tide: "Falling · 1/3", water: "19.6 °C", visibility: "6.9 km", risk: "High", note: "Strong rip near rocks. Avoid heli landing." } },
  { id: "CAM-05", name: "Manly Central", site: "Manly Beach", state: "Online", health: 97, x: 84, y: 25, lat: -33.7973, lng: 151.2886, image: manlyPhoto, feedVideo: coastalFeedVideo, coverage: "Surf club + patrol flags", detections: 19, confidence: 81, bearing: 85, fov: 80, range: 540, conditions: { wave: "1.1 m", wind: "12 kt NE", tide: "Rising · mid", water: "20.6 °C", visibility: "9.5 km", risk: "Low", note: "Clean small surf, light onshore wind." } },
  { id: "CAM-06", name: "Cronulla South", site: "Cronulla Beach", state: "Online", health: 91, x: 76, y: 57, lat: -34.0547, lng: 151.1545, image: rockPhoto, coverage: "South rocks + waterline", detections: 8, confidence: 74, bearing: 85, fov: 75, range: 500, conditions: { wave: "1.4 m", wind: "13 kt NE", tide: "Falling · mid", water: "20.4 °C", visibility: "8.7 km", risk: "Moderate", note: "Long-period swell, watch left side." } },
  { id: "CAM-07", name: "Wollongong North", site: "Wollongong", state: "Online", health: 93, x: 66, y: 72, lat: -34.4234, lng: 150.8931, image: wollongongPhoto, coverage: "North beach + harbour", detections: 12, confidence: 69, bearing: 90, fov: 80, range: 560, conditions: { wave: "1.7 m", wind: "17 kt S", tide: "Rising · 2/3", water: "19.1 °C", visibility: "8.0 km", risk: "Elevated", note: "Southerly building through afternoon." } },
  { id: "CAM-08", name: "Kiama Blowhole Watch", site: "Kiama", state: "Online", health: 95, x: 62, y: 84, lat: -34.6710, lng: 150.8543, image: rockPhoto, coverage: "Headland + swimmers", detections: 8, confidence: 65, bearing: 80, fov: 90, range: 480, conditions: { wave: "1.9 m", wind: "19 kt S", tide: "Falling · mid", water: "18.9 °C", visibility: "7.6 km", risk: "Elevated", note: "Blowhole swell pulses, keep clear of rocks." } },
  { id: "CAM-09", name: "Shellharbour Patrol", site: "Shellharbour", state: "Online", health: 92, x: 64, y: 78, lat: -34.5795, lng: 150.8710, image: coastalPhoto, coverage: "Patrol zone + shore", detections: 6, confidence: 60, bearing: 95, fov: 75, range: 500, conditions: { wave: "1.3 m", wind: "12 kt SE", tide: "Rising · low", water: "19.7 °C", visibility: "9.1 km", risk: "Low", note: "Calm patrol zone, good visibility." } },
];

const incidents = [
  { id: "INC-0142", priority: "P1", title: "Possible swimmer distress", cameraId: "CAM-02", severity: "Critical", status: "Needs verification", confidence: 86, distance: "214 m offshore", drift: "NW · 0.7 m/s", created: "10:42", age: "00:42", lat: -33.8953, lng: 151.2858, x: 90, y: 37, reason: "Erratic movement + stationary interval outside patrol boundary", action: "Verify camera, request jetski, start rescue route" },
  { id: "INC-0139", priority: "P2", title: "Person outside safe zone", cameraId: "CAM-04", severity: "High", status: "Monitoring", confidence: 74, distance: "91 m offshore", drift: "E · 0.3 m/s", created: "10:38", age: "04:18", lat: -33.9461, lng: 151.2671, x: 88, y: 48, reason: "Boundary breach near rocks", action: "Monitor and prepare lifeguard confirmation" },
  { id: "INC-0134", priority: "P3", title: "Crowd density increasing", cameraId: "CAM-01", severity: "Advisory", status: "Logged", confidence: 67, distance: "Near shoreline", drift: "N/A", created: "10:31", age: "11:05", lat: -33.8895, lng: 151.2801, x: 84, y: 33, reason: "High crowd count around entry path", action: "No dispatch required" },
];

const sites = [
  { id: "SITE-00", name: "Palm Beach", region: "Northern Sydney", risk: "Low", cameras: 1 },
  { id: "SITE-01", name: "Bondi Beach", region: "Sydney East", risk: "Critical", cameras: 2 },
  { id: "SITE-02", name: "Manly Beach", region: "Northern Beaches", risk: "Low", cameras: 1 },
  { id: "SITE-03", name: "Coogee Beach", region: "Eastern Suburbs", risk: "Moderate", cameras: 1 },
  { id: "SITE-04", name: "Maroubra Beach", region: "Eastern Suburbs", risk: "High", cameras: 1 },
  { id: "SITE-05", name: "Cronulla Beach", region: "South Sydney", risk: "Low", cameras: 1 },
  { id: "SITE-06", name: "Wollongong", region: "South Coast", risk: "Moderate", cameras: 1 },
  { id: "SITE-07", name: "Kiama", region: "South Coast", risk: "Low", cameras: 1 },
  { id: "SITE-08", name: "Shellharbour", region: "South Coast", risk: "Low", cameras: 1 },
];

const responderStatus = {
  jetski: { status: "Ready to launch", detail: "2 operators · water rescue" },
  helicopter: { status: "Standby", detail: "Pilot + medic · escalation" },
  tower: { status: "Visual tracking", detail: "3 lifeguards · shore team" },
};

const responders = [
  { id: "J1", name: "Jetski Unit 1", type: "Water rescue", icon: Ship, eta: "3 min 20 sec", status: "Available" },
  { id: "L1", name: "Lifeguard Tower", type: "Visual confirmation", icon: LifeBuoy, eta: "1 min 45 sec", status: "Available" },
  { id: "H1", name: "Helicopter", type: "Aerial support", icon: Helicopter, eta: "14 min", status: "Escalation only" },
];

const environment = [
  { icon: Wind, label: "Wind", value: "12 km/h NE", tone: "Low" },
  { icon: Waves, label: "Swell", value: "1.2 m", tone: "Moderate" },
  { icon: CloudSun, label: "Visibility", value: "8.6 km", tone: "Good" },
  { icon: Gauge, label: "Water risk", value: "Elevated", tone: "Caution" },
];

function cx(...items) {
  return items.filter(Boolean).join(" ");
}

function Badge({ value }) {
  const map = {
    Critical: "border-red-400/40 bg-red-500/15 text-red-100",
    High: "border-orange-400/40 bg-orange-500/15 text-orange-100",
    Moderate: "border-amber-400/40 bg-amber-500/15 text-amber-100",
    Advisory: "border-sky-400/40 bg-sky-500/15 text-sky-100",
    Low: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    Online: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    Degraded: "border-amber-400/40 bg-amber-500/15 text-amber-100",
    Available: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    "Escalation only": "border-slate-500/40 bg-slate-700/40 text-slate-200",
  };
  return <span className={cx("rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide", map[value] || "border-slate-700 bg-slate-900 text-slate-300")}>{value}</span>;
}

function Metric({ icon: Icon, label, value, sub, active, tone = "default", onClick }) {
  const toneClass = {
    danger: "border-red-400/40 bg-red-500/10 shadow-red-500/10 hover:border-red-300/60",
    warning: "border-amber-400/30 bg-amber-500/10 shadow-amber-500/10 hover:border-amber-300/50",
    default: "border-slate-800 bg-slate-950/70 hover:border-cyan-400/30 hover:bg-slate-900/80",
  };

  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-2xl border px-3 py-3 text-left transition-all duration-200 sm:px-4",
        active
          ? "border-cyan-400/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
          : toneClass[tone]
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border sm:h-10 sm:w-10",
          active
            ? "border-cyan-300/40 bg-cyan-500/20 text-cyan-100"
            : tone === "danger"
              ? "border-red-300/40 bg-red-500/15 text-red-100"
              : tone === "warning"
                ? "border-amber-300/40 bg-amber-500/15 text-amber-100"
                : "border-slate-700 bg-slate-900 text-slate-400"
        )}>
          {Icon && <Icon size={17} />}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 truncate text-lg font-extrabold text-white sm:text-xl">
            {value}
          </p>
          <p className="mt-1 truncate text-[11px] text-slate-500 sm:text-xs">
            {sub}
          </p>
        </div>
      </div>
    </button>
  );
}

const CV_DETECTIONS = {
  "CAM-02": [
    { id: "trk_07", label: "swimmer", color: "red", x: 42, y: 38, w: 18, h: 26, conf: 86, critical: true, note: "stationary 38s" },
    { id: "trk_03", label: "swimmer", color: "cyan", x: 16, y: 62, w: 13, h: 16, conf: 74 },
    { id: "trk_12", label: "swimmer", color: "cyan", x: 70, y: 56, w: 12, h: 16, conf: 71 },
  ],
  "CAM-01": [
    { id: "trk_22", label: "swimmer", color: "cyan", x: 28, y: 48, w: 10, h: 14, conf: 78 },
    { id: "trk_24", label: "swimmer", color: "cyan", x: 54, y: 58, w: 10, h: 14, conf: 81 },
    { id: "trk_27", label: "surfer", color: "amber", x: 70, y: 36, w: 12, h: 14, conf: 69 },
  ],
  "CAM-05": [
    { id: "trk_33", label: "swimmer", color: "cyan", x: 22, y: 54, w: 11, h: 14, conf: 76 },
    { id: "trk_35", label: "group", color: "amber", x: 56, y: 50, w: 22, h: 18, conf: 70, note: "5 ppl" },
  ],
};

const HEATMAP_BLOBS = {
  "CAM-02": [
    { x: 50, y: 50, r: 28, intensity: 0.55 },
    { x: 22, y: 66, r: 16, intensity: 0.3 },
    { x: 74, y: 60, r: 18, intensity: 0.32 },
  ],
  "CAM-01": [
    { x: 35, y: 55, r: 22, intensity: 0.3 },
    { x: 60, y: 60, r: 20, intensity: 0.32 },
  ],
  "CAM-05": [
    { x: 50, y: 55, r: 26, intensity: 0.32 },
  ],
};

const BOX_COLOR_MAP = {
  red: { stroke: "border-red-400", glow: "shadow-[0_0_14px_rgba(248,113,113,0.55)]", chip: "bg-red-500/95 text-white" },
  amber: { stroke: "border-amber-300", glow: "shadow-[0_0_8px_rgba(251,191,36,0.35)]", chip: "bg-amber-400/95 text-black" },
  cyan: { stroke: "border-cyan-300", glow: "shadow-[0_0_8px_rgba(103,232,249,0.3)]", chip: "bg-cyan-400/95 text-slate-950" },
};

function CVHeatmap({ blobs }) {
  if (!blobs?.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 mix-blend-screen">
      {blobs.map((b, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.r * 2}%`,
            height: `${b.r * 2}%`,
            background: `radial-gradient(circle, rgba(248,113,113,${b.intensity}) 0%, rgba(251,191,36,${b.intensity * 0.5}) 45%, rgba(34,211,238,0) 75%)`,
          }}
        />
      ))}
    </div>
  );
}

function CVBoundingBox({ box }) {
  const colors = BOX_COLOR_MAP[box.color] || BOX_COLOR_MAP.cyan;
  return (
    <div
      className={cx("pointer-events-none absolute rounded-[3px] border-2", colors.stroke, colors.glow)}
      style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
    >
      <div className={cx("absolute -top-[18px] left-0 flex items-center gap-1 rounded-sm px-1.5 py-[1px] text-[8px] font-bold uppercase tracking-wider", colors.chip)}>
        <span>{box.id}</span>
        <span className="opacity-80">{box.label}</span>
        <span className="opacity-90">{box.conf}%</span>
      </div>
      {box.critical && (
        <span className="absolute -right-1 -top-1 h-2 w-2 animate-ping rounded-full bg-red-300" />
      )}
      {box.note && (
        <div className="absolute -bottom-[14px] right-0 rounded-sm bg-black/85 px-1 py-[1px] text-[8px] font-semibold text-white">
          {box.note}
        </div>
      )}
    </div>
  );
}

function CameraFeed({ camera, incident, onRequestRescue }) {
  const bars = camera.id === "CAM-02" ? [22, 38, 76, 42, 84, 35, 68, 91] : [18, 28, 34, 22, 31, 26, 38, 30];
  const isIncidentSource = incident && camera.id === incident.cameraId;
  const useVideo = Boolean(camera.feedVideo);
  const videoSrc = camera.feedVideo;
  const detections = CV_DETECTIONS[camera.id] || [];
  const heatmap = HEATMAP_BLOBS[camera.id] || [];

  const [frame, setFrame] = useState(184523);
  const [playbackOpen, setPlaybackOpen] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => f + 1), 1000 / 24);
    return () => clearInterval(t);
  }, []);

  return (
    <>
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Eye size={16} className="shrink-0" />
          <span className="truncate text-sm font-semibold">{camera.id} · {camera.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isIncidentSource && useVideo && (
            <button
              onClick={() => setPlaybackOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-red-400/50 bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-100 transition hover:bg-red-500/25"
              title="Rewind to the moment AI flagged distress"
            >
              <Rewind size={12} />
              <span className="hidden sm:inline">Distress moment</span>
              <span className="sm:hidden">Replay</span>
            </button>
          )}
          {useVideo && (
            <span className="flex items-center gap-1.5 rounded-md border border-red-400/40 bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-100">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              Live
            </span>
          )}
          <Badge value={camera.state}/>
        </div>
      </div>
      <div className="relative h-56 bg-black sm:h-64">
        {useVideo ? (
          <video
            key={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            poster={camera.image}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img src={camera.image} alt={camera.name} className="absolute inset-0 h-full w-full object-cover" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-black/80" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
          }}
        />

        <CVHeatmap blobs={heatmap} />

        <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <pattern id={`grid-${camera.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(103,232,249,0.08)" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#grid-${camera.id})`} />
          <path
            d="M 0 72 Q 25 68, 50 71 T 100 70"
            fill="none"
            stroke="rgba(103,232,249,0.55)"
            strokeWidth="0.5"
            strokeDasharray="1.2 1.2"
          />
          <text x="2" y="70" fill="rgba(165,243,252,0.8)" fontSize="2.2" fontWeight="bold">SWIM ZONE</text>
          {isIncidentSource && (
            <>
              <path
                d="M 48 30 q 6 12, 0 24"
                stroke="rgba(248,113,113,0.85)"
                strokeWidth="0.6"
                fill="none"
                markerEnd="url(#arrow-red)"
              />
              <defs>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(248,113,113,0.9)" />
                </marker>
              </defs>
              <text x="49" y="58" fill="rgba(254,202,202,0.9)" fontSize="2" fontWeight="bold">RIP</text>
            </>
          )}
        </svg>

        <div className="pointer-events-none absolute inset-3 rounded-lg border border-cyan-400/20" />
        <div className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l-2 border-t-2 border-cyan-300/70" />
        <div className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r-2 border-t-2 border-cyan-300/70" />
        <div className="pointer-events-none absolute bottom-[4.5rem] left-4 h-3 w-3 border-b-2 border-l-2 border-cyan-300/70" />
        <div className="pointer-events-none absolute bottom-[4.5rem] right-4 h-3 w-3 border-b-2 border-r-2 border-cyan-300/70" />

        {detections.map((box) => (
          <CVBoundingBox key={box.id} box={box} />
        ))}

        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-black/80 px-2 py-1.5 text-[10px] text-cyan-100 backdrop-blur sm:left-4 sm:top-4">
          <Radar size={12} className={isIncidentSource ? "animate-pulse text-red-300" : ""} />
          <span className="font-semibold">{isIncidentSource ? "TRACKING · ALERT" : "TRACKING"}</span>
          <span className="rounded bg-cyan-500/20 px-1 py-px font-mono text-[9px] text-cyan-200">YOLOv8-coastal</span>
        </div>
        <div className="absolute right-3 top-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-2 py-1.5 text-[10px] text-emerald-100 backdrop-blur sm:right-4 sm:top-4">
          {camera.site}
        </div>
        <div className="absolute left-3 top-11 rounded-md bg-black/65 px-2 py-0.5 font-mono text-[9px] text-slate-300 sm:left-4 sm:top-12">
          10:42:18 AEST · {camera.id} · frame {frame.toLocaleString()}
        </div>
        <div className="absolute right-3 top-11 rounded-md bg-black/55 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 sm:right-4 sm:top-12">
          24 fps · 1080p · sim
        </div>

        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-2 sm:bottom-4 sm:left-4 sm:right-4">
          <div className="rounded-xl bg-black/65 p-2 backdrop-blur-sm"><p className="text-[10px] text-slate-400">Tracked</p><p className="text-sm font-bold text-white">{detections.length}</p></div>
          <div className="rounded-xl bg-black/65 p-2 backdrop-blur-sm"><p className="text-[10px] text-slate-400">Top conf.</p><p className="text-sm font-bold text-white">{Math.max(camera.confidence, ...detections.map((d) => d.conf))}%</p></div>
          <div className="rounded-xl bg-black/65 p-2 backdrop-blur-sm"><p className="text-[10px] text-slate-400">Detections</p><p className="text-sm font-bold text-white">{camera.detections}</p></div>
          <div className="rounded-xl bg-black/65 p-2 backdrop-blur-sm"><p className="text-[10px] text-slate-400">Zone</p><p className="truncate text-sm font-bold text-white">{camera.coverage.split(" ")[0]}</p></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Movement pattern</p>
          <div className="mt-3 flex h-12 items-end gap-1">
            {bars.map((h,i)=><div key={i} className={cx("w-full rounded-t", isIncidentSource ? "bg-red-300/80" : "bg-cyan-300/70")} style={{height:`${h}%`}} />)}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{isIncidentSource ? "Erratic movement followed by 38s stationary." : "Normal movement trend for monitored zone."}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Distress risk</p>
          <p className={cx("mt-3 text-2xl font-bold", isIncidentSource ? "text-red-100" : "text-cyan-100")}>{camera.id === "CAM-02" ? "86%" : "42%"}</p>
          <p className="text-xs text-slate-500">{isIncidentSource ? "High · operator must verify" : "Moderate · monitor only"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Why flagged</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">{isIncidentSource ? "Outside patrol boundary · NW drift · low movement." : "Tracking · crowd density · zone monitoring."}</p>
          {isIncidentSource && useVideo && (
            <button
              onClick={() => setPlaybackOpen(true)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-100 transition hover:bg-red-500/25"
            >
              <Rewind size={12} /> View distress moment
            </button>
          )}
        </div>
      </div>
    </div>
    {playbackOpen && isIncidentSource && (
      <IncidentPlaybackModal
        camera={camera}
        incident={incident}
        detections={detections}
        heatmap={heatmap}
        onRequestRescue={onRequestRescue}
        onClose={() => setPlaybackOpen(false)}
      />
    )}
    </>
  );
}

function IncidentPlaybackModal({ camera, incident, detections, heatmap, onRequestRescue, onClose }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const flagAt = 0.55;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    const onTime = () => {
      if (!v.duration) return;
      setProgress(v.currentTime / v.duration);
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const seek = (ratio) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.duration * ratio));
  };

  const jumpToFlag = () => {
    seek(flagAt);
    const v = videoRef.current;
    if (v) { v.play(); setPlaying(true); }
  };

  const confirmAndDispatch = () => {
    onRequestRescue?.("Jetski Unit 1");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-red-500/30 bg-[#070b12] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-300">Incident playback · {incident.id}</p>
            <h3 className="mt-1 truncate text-base font-bold text-white sm:text-lg">{incident.title} · {camera.name}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-400">AI flagged at 10:42:18 AEST · {incident.distance} · drift {incident.drift}</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:border-red-400/40 hover:text-red-100" title="Close (Esc)">
            <X size={16} />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            src={camera.feedVideo}
            poster={camera.image}
            muted
            playsInline
            loop
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/45 via-transparent to-black/85" />
          <CVHeatmap blobs={heatmap} />

          <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <pattern id={`playback-grid-${camera.id}`} width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(103,232,249,0.07)" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#playback-grid-${camera.id})`} />
          </svg>

          {detections.map((box) => (
            <CVBoundingBox key={box.id} box={box} />
          ))}

          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl border border-red-400/30 bg-black/80 px-2.5 py-1.5 text-[10px] text-red-100 backdrop-blur sm:left-5 sm:top-5">
            <Radar size={12} className="animate-pulse text-red-300" />
            <span className="font-bold uppercase tracking-wider">Distress moment</span>
            <span className="rounded bg-red-500/25 px-1.5 py-px font-mono text-[9px] text-red-100">AI {incident.confidence}%</span>
          </div>
          <div className="absolute right-3 top-3 rounded-xl border border-slate-700 bg-black/70 px-2.5 py-1.5 text-[10px] text-slate-200 backdrop-blur sm:right-5 sm:top-5">
            T-04s · stationary 38s · outside patrol boundary
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 sm:bottom-5 sm:left-5 sm:right-5">
            <button onClick={togglePlay} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/90 text-slate-950 hover:bg-white">
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div
              className="relative h-2 flex-1 cursor-pointer rounded-full bg-white/15"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - rect.left) / rect.width);
              }}
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-cyan-400/70" style={{ width: `${progress * 100}%` }} />
              <div
                className="absolute -top-1 h-4 w-1 rounded-sm bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]"
                style={{ left: `calc(${flagAt * 100}% - 1px)` }}
                title="AI distress detection"
              />
            </div>
            <button
              onClick={jumpToFlag}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-400/50 bg-red-500/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-100 hover:bg-red-500/30"
            >
              <Rewind size={12} /> Jump to flag
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-4 sm:px-6 sm:py-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Confidence at flag</p>
            <p className="mt-1 text-lg font-bold text-white">{incident.confidence}%</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Distance</p>
            <p className="mt-1 text-lg font-bold text-white">{incident.distance}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Drift</p>
            <p className="mt-1 text-lg font-bold text-white">{incident.drift}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Why flagged</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">{incident.reason}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[11px] text-slate-500">Esc to close · playback is a simulated rewind on the same camera feed.</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600">Dismiss</button>
            <button onClick={confirmAndDispatch} className="flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/30 hover:bg-red-400">
              <Siren size={14} /> Confirm distress · request rescue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const NSW_MAP_CENTER = [151.08, -34.18];
const NSW_MAP_ZOOM = 8.15;

const CAMERA_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>';
const SIREN_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';

function metersToDegLat(m) {
  return m / 111320;
}

function metersToDegLng(m, lat) {
  return m / (111320 * Math.cos((lat * Math.PI) / 180));
}

function buildCoverageWedge(cam, steps = 18) {
  const fov = cam.fov ?? 75;
  const range = cam.range ?? 500;
  const bearing = cam.bearing ?? 90;
  const coords = [[cam.lng, cam.lat]];
  for (let i = 0; i <= steps; i++) {
    const angle = bearing - fov / 2 + (fov * i) / steps;
    const rad = (angle * Math.PI) / 180;
    const dx = Math.sin(rad) * range;
    const dy = Math.cos(rad) * range;
    coords.push([
      cam.lng + metersToDegLng(dx, cam.lat),
      cam.lat + metersToDegLat(dy),
    ]);
  }
  coords.push([cam.lng, cam.lat]);
  return {
    type: "Feature",
    properties: {
      id: cam.id,
      state: cam.state,
      isSelected: false,
      isCritical: false,
    },
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

function buildCoverageCollection() {
  return {
    type: "FeatureCollection",
    features: cameras.map((c) => buildCoverageWedge(c)),
  };
}

function createCameraMarkerElement(cam) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.title = `${cam.id} · ${cam.name}`;
  btn.dataset.camId = cam.id;
  btn.className = "group block cursor-pointer border-0 bg-transparent p-0 outline-none focus:outline-none";
  return btn;
}

function paintCameraMarker(el, cam, isSelected, isCritical) {
  const size = isCritical ? "h-11 w-11" : isSelected ? "h-10 w-10" : "h-8 w-8";
  const colors = isCritical
    ? "border-red-300 bg-red-500 text-white shadow-red-500/40"
    : isSelected
    ? "border-cyan-300 bg-cyan-400 text-slate-950 shadow-cyan-400/40"
    : cam.state === "Degraded"
    ? "border-amber-300 bg-amber-400 text-black shadow-amber-400/30"
    : "border-cyan-300 bg-cyan-300 text-slate-950 shadow-cyan-400/20";
  const icon = isCritical ? SIREN_ICON_SVG : CAMERA_ICON_SVG;
  el.innerHTML = `
    <div class="relative flex ${size} items-center justify-center rounded-full border-2 shadow-2xl ${colors} transition-transform duration-150 ease-out hover:scale-110 active:scale-95">
      <span class="pointer-events-none flex items-center justify-center">${icon}</span>
      ${isCritical ? '<span class="pointer-events-none absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-red-200 ring-2 ring-red-950"></span>' : ""}
    </div>
  `;
}

function buildIncidentMarkerElement(incident) {
  const el = document.createElement("div");
  el.className = "pointer-events-none flex flex-col items-center";
  const distLabel = incident?.distance ? incident.distance : "Swimmer";
  const conf = incident?.confidence != null ? `${incident.confidence}%` : "";
  el.innerHTML = `
    <div class="relative flex h-5 w-5 items-center justify-center">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60"></span>
      <span class="relative inline-flex h-4 w-4 rounded-full border-2 border-red-200 bg-red-500 shadow-lg shadow-red-500/50"></span>
    </div>
    <div class="mt-1 flex flex-col items-center gap-0.5">
      <div class="rounded-md border border-red-400/50 bg-red-950/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-100 shadow-lg">${distLabel}</div>
      ${conf ? `<div class="rounded-md bg-black/80 px-1.5 py-px text-[9px] font-semibold text-red-100">AI ${conf}</div>` : ""}
    </div>
  `;
  return el;
}

function MapToolbarButton({ active, onClick, title, label, alert, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cx(
        "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-1.5 transition",
        active
          ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
          : alert
          ? "border-red-400/40 bg-red-500/10 text-red-200 hover:border-red-300/50"
          : "border-transparent text-slate-400 hover:border-slate-600 hover:bg-slate-900/80 hover:text-cyan-100"
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center">{children}</span>
      <span className="text-[8px] font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function buildConditionsPopupHtml(cam, opts = {}) {
  const c = cam.conditions;
  if (!c) return "";
  const riskColor = {
    Low: "background:rgba(16,185,129,0.18);color:#a7f3d0;border-color:rgba(16,185,129,0.4)",
    Moderate: "background:rgba(245,158,11,0.18);color:#fde68a;border-color:rgba(245,158,11,0.4)",
    Elevated: "background:rgba(249,115,22,0.18);color:#fed7aa;border-color:rgba(249,115,22,0.4)",
    High: "background:rgba(239,68,68,0.18);color:#fecaca;border-color:rgba(239,68,68,0.45)",
    Dangerous: "background:rgba(220,38,38,0.28);color:#fee2e2;border-color:rgba(220,38,38,0.5)",
  }[c.risk] || "background:rgba(15,23,42,0.6);color:#cbd5e1;border-color:rgba(71,85,105,0.5)";

  const eyebrow = opts.eyebrow || cam.id;
  const title = opts.title || cam.name;

  return `
    <div style="font-family:Inter,system-ui,sans-serif;min-width:220px;max-width:260px;padding:10px 12px;background:rgba(7,11,18,0.96);border:1px solid rgba(34,211,238,0.25);border-radius:14px;color:#e2e8f0;box-shadow:0 12px 30px rgba(0,0,0,0.45);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
        <div style="min-width:0;">
          <div style="font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#67e8f9;">${eyebrow}</div>
          <div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
        </div>
        <span style="border:1px solid;border-radius:6px;padding:2px 6px;font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;${riskColor}">${c.risk}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;">
        <div><span style="color:#64748b;">Waves</span> <span style="color:#fff;font-weight:600;">${c.wave}</span></div>
        <div><span style="color:#64748b;">Wind</span> <span style="color:#fff;font-weight:600;">${c.wind}</span></div>
        <div><span style="color:#64748b;">Tide</span> <span style="color:#fff;font-weight:600;">${c.tide}</span></div>
        <div><span style="color:#64748b;">Water</span> <span style="color:#fff;font-weight:600;">${c.water}</span></div>
        <div style="grid-column:span 2;"><span style="color:#64748b;">Visibility</span> <span style="color:#fff;font-weight:600;">${c.visibility}</span></div>
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(71,85,105,0.4);font-size:10px;line-height:1.45;color:#94a3b8;">${c.note}</div>
    </div>
  `;
}

function MapBoard({ selectedIncident, selectedCamera, routeActive, onCameraSelect }) {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const cameraMarkersRef = useRef({});
  const cameraElementsRef = useRef({});
  const incidentMarkerRef = useRef(null);
  const incidentElementRef = useRef(null);
  const hoverPopupRef = useRef(null);
  const routeAnimRef = useRef(null);
  const onCameraSelectRef = useRef(onCameraSelect);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [showCoverage, setShowCoverage] = useState(true);

  useEffect(() => {
    onCameraSelectRef.current = onCameraSelect;
  }, [onCameraSelect]);

  const flyToIncident = useCallback((incident) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [incident.lng, incident.lat],
      zoom: Math.max(map.getZoom(), 10.5),
      duration: 1200,
      essential: true,
    });
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    let map;

    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: NSW_MAP_CENTER,
        zoom: NSW_MAP_ZOOM,
        attributionControl: false,
        logoPosition: "bottom-left",
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: false }), "bottom-right");

      map.on("load", () => {
        try {
          if (!map.getSource("camera-coverage")) {
            map.addSource("camera-coverage", { type: "geojson", data: buildCoverageCollection() });
            map.addLayer({
              id: "camera-coverage-fill",
              type: "fill",
              source: "camera-coverage",
              paint: {
                "fill-color": [
                  "case",
                  ["==", ["get", "isCritical"], true], "#ef4444",
                  ["==", ["get", "state"], "Degraded"], "#fbbf24",
                  "#22d3ee",
                ],
                "fill-opacity": [
                  "case",
                  ["==", ["get", "isCritical"], true], 0.28,
                  ["==", ["get", "isSelected"], true], 0.22,
                  0.1,
                ],
              },
            });
            map.addLayer({
              id: "camera-coverage-line",
              type: "line",
              source: "camera-coverage",
              paint: {
                "line-color": [
                  "case",
                  ["==", ["get", "isCritical"], true], "#fca5a5",
                  ["==", ["get", "state"], "Degraded"], "#fbbf24",
                  "#67e8f9",
                ],
                "line-width": [
                  "case",
                  ["==", ["get", "isCritical"], true], 1.6,
                  ["==", ["get", "isSelected"], true], 1.4,
                  0.7,
                ],
                "line-opacity": 0.75,
              },
            });
          }
        } catch (err) {
          console.error("[Map] coverage layer error:", err);
          setMapError(err?.message || "Coverage layer failed");
        }
        setMapReady(true);
      });

      map.on("error", (e) => {
        if (e?.error?.message) setMapError(e.error.message);
      });

      mapRef.current = map;
    } catch (err) {
      setMapError(err?.message || "Failed to initialize map");
    }

    return () => {
      if (routeAnimRef.current) cancelAnimationFrame(routeAnimRef.current);
      Object.values(cameraMarkersRef.current).forEach((m) => m.remove());
      cameraMarkersRef.current = {};
      cameraElementsRef.current = {};
      incidentMarkerRef.current?.remove();
      incidentMarkerRef.current = null;
      map?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [MAPBOX_TOKEN]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    if (!hoverPopupRef.current) {
      hoverPopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 18,
        className: "resq-conditions-popup",
        maxWidth: "280px",
      });
    }
    const popup = hoverPopupRef.current;

    cameras.forEach((cam) => {
      const el = createCameraMarkerElement(cam);
      paintCameraMarker(el, cam, false, false);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onCameraSelectRef.current?.(cam.id);
      });
      el.addEventListener("mouseenter", () => {
        popup
          .setLngLat([cam.lng, cam.lat])
          .setHTML(buildConditionsPopupHtml(cam))
          .addTo(map);
      });
      el.addEventListener("mouseleave", () => {
        popup.remove();
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([cam.lng, cam.lat])
        .addTo(map);
      cameraMarkersRef.current[cam.id] = marker;
      cameraElementsRef.current[cam.id] = el;
    });

    return () => {
      popup.remove();
      Object.values(cameraMarkersRef.current).forEach((m) => m.remove());
      cameraMarkersRef.current = {};
      cameraElementsRef.current = {};
    };
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    cameras.forEach((cam) => {
      const el = cameraElementsRef.current[cam.id];
      if (!el) return;
      const isSelected = selectedCamera.id === cam.id;
      const isCritical = selectedIncident.cameraId === cam.id;
      paintCameraMarker(el, cam, isSelected, isCritical);
    });

    const map = mapRef.current;
    if (!map || !map.getSource("camera-coverage")) return;
    const features = cameras.map((cam) => {
      const wedge = buildCoverageWedge(cam);
      wedge.properties.isSelected = selectedCamera.id === cam.id;
      wedge.properties.isCritical = selectedIncident.cameraId === cam.id;
      return wedge;
    });
    map.getSource("camera-coverage").setData({ type: "FeatureCollection", features });
  }, [mapReady, selectedCamera.id, selectedIncident.cameraId]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const visibility = showCoverage ? "visible" : "none";
    if (map.getLayer("camera-coverage-fill")) map.setLayoutProperty("camera-coverage-fill", "visibility", visibility);
    if (map.getLayer("camera-coverage-line")) map.setLayoutProperty("camera-coverage-line", "visibility", visibility);
  }, [mapReady, showCoverage]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    incidentMarkerRef.current?.remove();
    const el = buildIncidentMarkerElement(selectedIncident);
    el.style.pointerEvents = "auto";
    el.style.cursor = "pointer";
    const sourceCam = cameras.find((c) => c.id === selectedIncident.cameraId);
    if (sourceCam && hoverPopupRef.current) {
      const popup = hoverPopupRef.current;
      el.addEventListener("mouseenter", () => {
        popup
          .setLngLat([selectedIncident.lng, selectedIncident.lat])
          .setHTML(buildConditionsPopupHtml(sourceCam, {
            eyebrow: `Incident · ${selectedIncident.id}`,
            title: selectedIncident.title,
          }))
          .addTo(map);
      });
      el.addEventListener("mouseleave", () => popup.remove());
    }
    incidentElementRef.current = el;
    incidentMarkerRef.current = new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat([selectedIncident.lng, selectedIncident.lat])
      .addTo(map);
  }, [mapReady, selectedIncident.id, selectedIncident.lng, selectedIncident.lat, selectedIncident.distance, selectedIncident.confidence, selectedIncident]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const lineId = "shore-distance-line";
    const labelId = "shore-distance-label";
    const sourceId = "shore-distance";

    const midLng = (selectedCamera.lng + selectedIncident.lng) / 2;
    const midLat = (selectedCamera.lat + selectedIncident.lat) / 2;
    const data = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [selectedCamera.lng, selectedCamera.lat],
              [selectedIncident.lng, selectedIncident.lat],
            ],
          },
        },
        {
          type: "Feature",
          properties: { label: `${selectedIncident.distance} from shore` },
          geometry: { type: "Point", coordinates: [midLng, midLat] },
        },
      ],
    };

    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(data);
    } else {
      map.addSource(sourceId, { type: "geojson", data });
      map.addLayer({
        id: lineId,
        type: "line",
        source: sourceId,
        filter: ["==", ["geometry-type"], "LineString"],
        paint: {
          "line-color": "#fca5a5",
          "line-width": 1.5,
          "line-opacity": 0.7,
          "line-dasharray": [1, 2],
        },
      });
      map.addLayer({
        id: labelId,
        type: "symbol",
        source: sourceId,
        filter: ["==", ["geometry-type"], "Point"],
        layout: {
          "text-field": ["get", "label"],
          "text-size": 11,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0],
          "text-anchor": "center",
        },
        paint: {
          "text-color": "#fecaca",
          "text-halo-color": "#450a0a",
          "text-halo-width": 1.4,
        },
      });
    }
  }, [mapReady, selectedCamera.lng, selectedCamera.lat, selectedIncident.lng, selectedIncident.lat, selectedIncident.distance]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const routeId = "rescue-route";
    const routeLayerId = "rescue-route-line";
    const routeGlowId = "rescue-route-glow";

    const removeRoute = () => {
      if (routeAnimRef.current) {
        cancelAnimationFrame(routeAnimRef.current);
        routeAnimRef.current = null;
      }
      if (map.getLayer(routeGlowId)) map.removeLayer(routeGlowId);
      if (map.getLayer(routeLayerId)) map.removeLayer(routeLayerId);
      if (map.getSource(routeId)) map.removeSource(routeId);
      if (map.getLayer("jetski-unit")) map.removeLayer("jetski-unit");
      if (map.getSource("jetski-unit")) map.removeSource("jetski-unit");
    };

    if (!routeActive) {
      removeRoute();
      return;
    }

    const coordinates = [
      [selectedCamera.lng, selectedCamera.lat],
      [selectedIncident.lng, selectedIncident.lat],
    ];

    const routeGeoJson = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates },
    };

    if (map.getSource(routeId)) {
      map.getSource(routeId).setData(routeGeoJson);
    } else {
      map.addSource(routeId, { type: "geojson", data: routeGeoJson });
      map.addLayer({
        id: routeGlowId,
        type: "line",
        source: routeId,
        paint: { "line-color": "#22d3ee", "line-width": 8, "line-opacity": 0.25 },
      });
      map.addLayer({
        id: routeLayerId,
        type: "line",
        source: routeId,
        paint: {
          "line-color": "#67e8f9",
          "line-width": 4,
          "line-opacity": 0.95,
          "line-dasharray": [2, 1],
        },
      });
    }

    const jetskiGeoJson = {
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: coordinates[0] },
    };

    if (!map.getSource("jetski-unit")) {
      map.addSource("jetski-unit", { type: "geojson", data: jetskiGeoJson });
      map.addLayer({
        id: "jetski-unit",
        type: "circle",
        source: "jetski-unit",
        paint: {
          "circle-radius": 10,
          "circle-color": "#22d3ee",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0f172a",
        },
      });
    }

    let start = null;
    const animateJetski = (timestamp) => {
      if (!start) start = timestamp;
      const progress = ((timestamp - start) % 5000) / 5000;
      const [lng1, lat1] = coordinates[0];
      const [lng2, lat2] = coordinates[1];
      const lng = lng1 + (lng2 - lng1) * progress;
      const lat = lat1 + (lat2 - lat1) * progress;
      const src = map.getSource("jetski-unit");
      if (src) {
        src.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [lng, lat] },
        });
      }
      routeAnimRef.current = requestAnimationFrame(animateJetski);
    };
    routeAnimRef.current = requestAnimationFrame(animateJetski);

    return removeRoute;
  }, [mapReady, routeActive, selectedCamera.lng, selectedCamera.lat, selectedIncident.lng, selectedIncident.lat]);

  useEffect(() => {
    if (mapReady) flyToIncident(selectedIncident);
  }, [mapReady, selectedIncident.id, flyToIncident, selectedIncident]);

  const togglePanel = (id) => setActivePanel((p) => (p === id ? null : id));

  const panelContent = useMemo(() => ({
    info: (
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200">Live satellite rescue map</p>
        <h2 className="mt-1 text-base font-bold text-white">NSW coastal operations</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          Sydney to South Coast camera network. Pan and zoom to inspect coastal sites. Pins stay on geographic coordinates.
        </p>
      </div>
    ),
    legend: (
      <div className="space-y-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> Monitoring camera</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Degraded camera</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical incident source</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-red-200" /> Swimmer alert position</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-4 rounded-sm bg-cyan-300/30 outline outline-1 outline-cyan-300/70" /> Camera coverage area</div>
        <div className="flex items-center gap-2"><span className="h-0.5 w-4 bg-cyan-300" /> Active rescue route</div>
      </div>
    ),
    alert: (
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-red-200">Swimmer alert</p>
        <p className="mt-1 text-sm font-bold text-white">{selectedIncident.distance}</p>
        <p className="mt-1 text-[11px] text-slate-300">AI confidence {selectedIncident.confidence}% · {selectedIncident.drift}</p>
        <p className="mt-2 text-xs text-slate-400">{selectedIncident.reason}</p>
      </div>
    ),
    camera: (
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">Selected camera</p>
          <p className="mt-1 truncate text-sm font-bold text-white">{selectedCamera.id} · {selectedCamera.name}</p>
          <p className="mt-1 truncate text-xs text-slate-400">{selectedCamera.site} · {selectedCamera.coverage}</p>
        </div>
        <Badge value={selectedCamera.state} />
      </div>
    ),
  }), [selectedIncident, selectedCamera]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-[#07111d] p-6 sm:rounded-[30px]">
        <p className="max-w-sm text-center text-sm text-slate-400">
          Add <code className="text-cyan-200">VITE_MAPBOX_TOKEN</code> to <code className="text-cyan-200">.env</code> to load the interactive NSW coastal map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#07111d] shadow-2xl shadow-cyan-500/10 sm:rounded-[30px]">
      <style>{`.mapboxgl-marker { z-index: 10; } .mapboxgl-ctrl-bottom-right { z-index: 15; }`}</style>
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      {mapError && (
        <div className="absolute inset-x-4 top-4 z-50 rounded-xl border border-red-400/30 bg-red-950/90 px-3 py-2 text-xs text-red-100">
          Map error: {mapError}
        </div>
      )}


      <div className="absolute left-3 top-3 z-20 flex flex-col gap-2 sm:left-4 sm:top-4">
        <div className="pointer-events-auto flex flex-col gap-0.5 rounded-2xl border border-slate-700/80 bg-slate-950/95 p-1 shadow-2xl backdrop-blur-xl">
          <MapToolbarButton active={activePanel === "info"} onClick={() => togglePanel("info")} title="Map info" label="Info">
            <Info size={15} />
          </MapToolbarButton>
          <MapToolbarButton active={activePanel === "legend"} onClick={() => togglePanel("legend")} title="Legend" label="Legend">
            <Layers size={15} />
          </MapToolbarButton>
          <MapToolbarButton
            active={showCoverage}
            onClick={() => setShowCoverage((v) => !v)}
            title="Toggle camera coverage areas"
            label="Range"
          >
            <Radar size={15} />
          </MapToolbarButton>
          <MapToolbarButton
            active={activePanel === "alert"}
            alert={selectedIncident.priority === "P1"}
            onClick={() => togglePanel("alert")}
            title="Active swimmer alert"
            label="Alert"
          >
            <Siren size={15} />
          </MapToolbarButton>
          <MapToolbarButton active={activePanel === "camera"} onClick={() => togglePanel("camera")} title="Selected camera" label="Camera">
            <Camera size={15} />
          </MapToolbarButton>
        </div>

        {activePanel && (
          <div className="pointer-events-auto w-[min(280px,calc(100vw-120px))] rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="mb-2 flex w-full items-center justify-end text-slate-500 hover:text-slate-300"
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
            {panelContent[activePanel]}
          </div>
        )}
      </div>

      {routeActive && (
        <div className="pointer-events-none absolute bottom-20 right-4 z-20 rounded-xl border border-cyan-400/30 bg-slate-950/90 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-100 shadow-xl backdrop-blur">
          Rescue route active · Jetski en route
        </div>
      )}
    </div>
  );
}

function IncidentCard({ incident, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "w-full rounded-2xl border p-3 text-left transition",
        selected
          ? "border-cyan-300/45 bg-cyan-500/10"
          : "border-slate-800 bg-slate-950/55 hover:border-cyan-400/30"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={cx("rounded-md px-2 py-1 text-xs font-bold text-white", incident.priority === "P1" ? "bg-red-500" : incident.priority === "P2" ? "bg-orange-500" : "bg-sky-500")}>{incident.priority}</span>
        <span className="text-xs text-slate-500">{incident.created}</span>
      </div>
      <p className="text-sm font-semibold text-white">{incident.title}</p>
      <p className="mt-1 text-xs text-slate-500">{incident.cameraId} · {incident.distance}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-cyan-300" style={{ width: `${incident.confidence}%` }} />
      </div>
    </button>
  );
}

function CameraCard({ camera, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "w-full rounded-2xl border p-3 text-left transition",
        selected
          ? "border-cyan-400/45 bg-cyan-500/10"
          : "border-slate-800 bg-slate-950/55 hover:border-cyan-400/30"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{camera.id} · {camera.name}</p>
          <p className="truncate text-xs text-slate-500">{camera.coverage}</p>
        </div>
        <Badge value={camera.state} />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-emerald-300" style={{ width: `${camera.health}%` }} />
      </div>
    </button>
  );
}

function SiteCard({ site, onClick }) {
  return (
    <button onClick={onClick} className="w-full rounded-2xl border border-slate-800 bg-slate-950/55 p-3 text-left transition hover:border-cyan-400/30">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{site.name}</p>
          <p className="truncate text-xs text-slate-500">{site.region} · {site.cameras} cameras</p>
        </div>
        <Badge value={site.risk} />
      </div>
    </button>
  );
}

function ConditionMini({ icon: Icon, value }) {
  return (
    <div className="flex shrink-0 items-center gap-1 text-[10px] text-slate-200">
      <Icon size={11} className="text-cyan-300/80" />
      <span className="font-medium">{value}</span>
    </div>
  );
}

function IncidentSummary({ incident, camera }) {
  const c = camera?.conditions;
  const riskTone = {
    Low: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    Moderate: "border-amber-400/40 bg-amber-500/15 text-amber-100",
    Elevated: "border-orange-400/40 bg-orange-500/15 text-orange-100",
    High: "border-red-400/40 bg-red-500/15 text-red-100",
    Dangerous: "border-red-500/60 bg-red-600/25 text-red-50",
  }[c?.risk] || "border-slate-700 bg-slate-900 text-slate-300";

  return (
    <section className="rounded-2xl border border-red-400/30 bg-red-500/8 p-3">
      <div className="flex items-center gap-2">
        <Siren size={15} className="shrink-0 text-red-200" />
        <span className="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{incident.priority}</span>
        <span className="truncate text-sm font-semibold text-white">{incident.title}</span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400">
        <span className="text-slate-300">{camera.site}</span> · {camera.name} · {incident.reason}
      </p>
      {c && (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 px-2.5 py-1.5">
          <span className={cx("shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", riskTone)}>{c.risk}</span>
          <ConditionMini icon={Waves} value={c.wave} />
          <ConditionMini icon={Wind} value={c.wind} />
          <ConditionMini icon={Droplets} value={c.tide} />
          <ConditionMini icon={Thermometer} value={c.water} />
        </div>
      )}
    </section>
  );
}

function ResponderBoard({ onRequestSupport, support }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Radio size={16} /> Request additional help</h3>
          <p className="mt-1 text-xs text-slate-500">Share incident context, live feed and responder route instantly.</p>
        </div>
        <Badge value="Available" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {responders.map((r) => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => onRequestSupport(r.name)} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-left transition hover:border-cyan-400/40 hover:bg-slate-900">
              <Icon size={18} className="mb-2 text-cyan-200" />
              <p className="text-xs font-bold text-white">{r.name}</p>
              <p className="mt-1 text-[10px] text-slate-500">Arrives in {r.eta}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-cyan-100"><Ship size={14} /> Jetski</div>
          <p className="text-slate-300">{responderStatus.jetski.status}</p>
          <p className="text-slate-500">{responderStatus.jetski.detail}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-amber-100"><Helicopter size={14} /> Air</div>
          <p className="text-slate-300">{responderStatus.helicopter.status}</p>
          <p className="text-slate-500">{responderStatus.helicopter.detail}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-emerald-100"><LifeBuoy size={14} /> Tower</div>
          <p className="text-slate-300">{responderStatus.tower.status}</p>
          <p className="text-slate-500">{responderStatus.tower.detail}</p>
        </div>
      </div>

      {support && (
        <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
          <p className="text-sm font-semibold text-emerald-100">{support} notified</p>
          <p className="mt-1 text-xs text-slate-300">Shared: location, camera image, confidence, route, ETA and incident ID.</p>
        </div>
      )}
    </section>
  );
}

function ActionsPanel({ routeActive, onConfirm, onRoute, onEscalate }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CheckCircle2 size={16} /> Operator actions</h3>
      <div className="space-y-2">
        <button onClick={onConfirm} className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100">Request visual confirm</button>
        <button onClick={onRoute} className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950">{routeActive ? "Stop rescue route" : "Start rescue route"}</button>
        <button onClick={onEscalate} className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white">Escalate to dispatch</button>
      </div>
    </section>
  );
}

function LiveLog({ toast, cameraId, onRefresh }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><Activity size={16} /> Live operations log</h3>
        <button onClick={onRefresh} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300 hover:border-cyan-400/30">Refresh</button>
      </div>
      <div className="space-y-2 text-xs text-slate-300">
        <p className="rounded-xl bg-slate-900/60 p-2">10:42 · {toast}</p>
        <p className="rounded-xl bg-slate-900/60 p-2">10:42 · {cameraId} visual feed active.</p>
        <p className="rounded-xl bg-slate-900/60 p-2">10:41 · Environmental conditions loaded.</p>
      </div>
    </section>
  );
}

function MobileApp({ state, actions, onExitPreview }) {
  const {
    selectedIncident,
    selectedCamera,
    routeActive,
    support,
    toast,
  } = state;
  const {
    selectIncident,
    selectCamera,
    focusSite,
    requestSupport,
    startRoute,
    setToast,
  } = actions;

  const [tab, setTab] = useState("map");

  const tabs = [
    { id: "map", label: "Map", icon: Map },
    { id: "incidents", label: "Incidents", icon: Siren },
    { id: "cameras", label: "Cameras", icon: Camera },
    { id: "alert", label: "Alert", icon: ShieldAlert },
  ];

  return (
    <div className="flex h-full flex-col bg-[#05070b] text-slate-100">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-[#090d14] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
            <LifeBuoy size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-wide">ResQVision</p>
            <p className="truncate text-[10px] text-slate-500">NSW Coastal Ops · 10:42 AEST</p>
          </div>
        </div>
        {onExitPreview ? (
          <button onClick={onExitPreview} className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-[11px] text-slate-300">
            <X size={14} /> Exit
          </button>
        ) : (
          <span className="rounded-md bg-red-500/15 px-2 py-1 text-[10px] font-semibold text-red-200">1 critical</span>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === "map" && (
          <div className="flex h-full flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Metric icon={AlertOctagon} label="Priority" value={selectedIncident.priority} sub={selectedIncident.status} onClick={() => setToast("Priority card opened.")} />
              <Metric icon={Crosshair} label="Confidence" value={`${selectedIncident.confidence}%`} sub="human review" onClick={() => setToast("Confidence is AI-derived.")} />
              <Metric icon={MapPin} label="Distance" value={selectedIncident.distance} sub={selectedIncident.drift} onClick={() => setToast("Position highlighted on map.")} />
              <Metric icon={Compass} label="Best response" value="Jetski" sub="ETA 03:20" active={routeActive} onClick={startRoute} />
            </div>
            <div className="min-h-[320px] flex-1">
              <MapBoard selectedIncident={selectedIncident} selectedCamera={selectedCamera} routeActive={routeActive} onCameraSelect={selectCamera} />
            </div>
          </div>
        )}

        {tab === "incidents" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Incident queue</h2>
              <span className="rounded-md bg-red-500/15 px-2 py-1 text-[11px] font-semibold text-red-200">1 critical</span>
            </div>
            <div className="space-y-2">
              {incidents.map((i) => (
                <IncidentCard key={i.id} incident={i} selected={selectedIncident.id === i.id} onClick={() => { selectIncident(i); setTab("alert"); }} />
              ))}
            </div>
            <h2 className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Coastal sites</h2>
            <div className="space-y-2">
              {sites.map((s) => (
                <SiteCard key={s.id} site={s} onClick={() => { focusSite(s); setTab("map"); }} />
              ))}
            </div>
          </div>
        )}

        {tab === "cameras" && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Camera network</h2>
            {cameras.map((c) => (
              <CameraCard key={c.id} camera={c} selected={selectedCamera.id === c.id} onClick={() => { selectCamera(c.id); setTab("alert"); }} />
            ))}
          </div>
        )}

        {tab === "alert" && (
          <div className="space-y-4">
            <IncidentSummary incident={selectedIncident} camera={selectedCamera} />
            <CameraFeed camera={selectedCamera} incident={selectedIncident} onRequestRescue={requestSupport} />
            <ResponderBoard onRequestSupport={requestSupport} support={support} />
            <ActionsPanel
              routeActive={routeActive}
              onConfirm={() => setToast("Visual confirmation requested from lifeguard tower.")}
              onRoute={startRoute}
              onEscalate={() => setToast("Incident escalated to dispatch channel.")}
            />
            <LiveLog toast={toast} cameraId={selectedCamera.id} onRefresh={() => setToast("Operator refreshed live operational feed.")} />
          </div>
        )}
      </main>

      <nav className="grid shrink-0 grid-cols-4 border-t border-slate-800 bg-[#090d14]">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cx(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition",
                active ? "text-cyan-200" : "text-slate-500 hover:text-slate-200"
              )}
            >
              <Icon size={18} />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function DesktopApp({ state, actions, onTogglePreview, previewActive }) {
  const {
    selectedIncident,
    selectedCamera,
    routeActive,
    support,
    toast,
  } = state;
  const {
    selectIncident,
    selectCamera,
    focusSite,
    requestSupport,
    startRoute,
    setToast,
  } = actions;

  return (
    <div className="grid h-screen min-w-[960px] grid-cols-[240px_1fr_320px] grid-rows-[64px_1fr] overflow-hidden bg-[#05070b] text-slate-100 xl:grid-cols-[280px_1fr_360px] xl:grid-rows-[68px_1fr]">
      <header className="col-span-3 flex items-center justify-between gap-3 border-b border-slate-800 bg-[#090d14] px-4 xl:px-5">
        <div className="flex min-w-0 items-center gap-3 xl:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 xl:h-10 xl:w-10">
            <LifeBuoy size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 xl:gap-3">
              <h1 className="truncate text-sm font-semibold tracking-wide xl:text-lg">ResQVision NSW Coastal Operations Console</h1>
              <span className="hidden rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 2xl:inline">Live prototype</span>
            </div>
            <p className="hidden text-xs text-slate-500 xl:block">Clickable rescue workflow · hardcoded data · operator demo</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm xl:gap-3">
          <Badge value="Online" />
          <button onClick={onTogglePreview} className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20">
            <Smartphone size={14} />
            <span className="hidden xl:inline">{previewActive ? "Exit mobile preview" : "Mobile preview"}</span>
            <span className="xl:hidden">{previewActive ? "Exit" : "Mobile"}</span>
          </button>
          <span className="hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-300 xl:inline-flex">
            <Clock size={15} /> 10:42 AEST
          </span>
        </div>
      </header>

      <aside className="min-h-0 overflow-y-auto border-r border-slate-800 bg-[#090d14] p-3 xl:p-4">
        <SidebarContent
          selectedIncident={selectedIncident}
          selectedCamera={selectedCamera}
          onSelectIncident={selectIncident}
          onFocusSite={focusSite}
          onSelectCamera={selectCamera}
        />
      </aside>

      <main className="min-h-0 overflow-hidden bg-[#060a10] p-3 xl:p-4">
        <div className="mb-3 grid grid-cols-5 gap-2 xl:mb-4 xl:gap-3">
          <Metric icon={AlertOctagon} label="Priority" value={selectedIncident.priority} sub={`Awaiting call · ${selectedIncident.age}`} tone="danger" onClick={() => setToast("Priority card opened · operator should verify before dispatch.")} />
          <Metric icon={Crosshair} label="Confidence" value={`${selectedIncident.confidence}%`} sub="AI · verify first" onClick={() => setToast("Confidence is AI-derived; human verification remains required.")} />
          <Metric icon={MapPin} label="Distance" value={selectedIncident.distance} sub={selectedIncident.drift} onClick={() => setToast("Swimmer position and drift estimate highlighted on map.")} />
          <Metric icon={Compass} label={routeActive ? "Route active" : "Best response"} value={routeActive ? "Jetski" : "Jetski"} sub={routeActive ? "En route · 03:20" : "ETA 03:20"} active={routeActive} onClick={startRoute} />
          <Metric icon={Clock} label="Alert age" value={selectedIncident.age} sub="Auto-flagged · unpatrolled" tone="warning" onClick={() => setToast("Alert age shows how long this incident has been active.")} />
        </div>
        <div className="h-[calc(100%-92px)] xl:h-[calc(100%-100px)]">
          <MapBoard selectedIncident={selectedIncident} selectedCamera={selectedCamera} routeActive={routeActive} onCameraSelect={selectCamera} />
        </div>
      </main>

      <aside className="min-h-0 space-y-3 overflow-y-auto border-l border-slate-800 bg-[#090d14] p-3 xl:space-y-4 xl:p-4">
        <IncidentSummary incident={selectedIncident} camera={selectedCamera} />
        <CameraFeed camera={selectedCamera} incident={selectedIncident} onRequestRescue={requestSupport} />
        <ResponderBoard onRequestSupport={requestSupport} support={support} />
        <ActionsPanel
          routeActive={routeActive}
          onConfirm={() => setToast("Visual confirmation requested from lifeguard tower.")}
          onRoute={startRoute}
          onEscalate={() => setToast("Incident escalated to dispatch channel.")}
        />
        <LiveLog toast={toast} cameraId={selectedCamera.id} onRefresh={() => setToast('Operator refreshed live operational feed.')} />
      </aside>
    </div>
  );
}

function SidebarContent({ selectedIncident, selectedCamera, onSelectIncident, onFocusSite, onSelectCamera }) {
  return (
    <>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-500">
        <Search size={16} />
        <span className="text-sm">Search operations</span>
        <Filter className="ml-auto" size={15} />
      </div>
      <section className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Incident queue</h2>
          <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-200">1 critical</span>
        </div>
        <div className="space-y-2">
          {incidents.map((i) => (
            <IncidentCard key={i.id} incident={i} selected={selectedIncident.id === i.id} onClick={() => onSelectIncident(i)} />
          ))}
        </div>
      </section>
      <section className="mb-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Coastal sites</h2>
        <div className="space-y-2">
          {sites.map((s) => (
            <SiteCard key={s.id} site={s} onClick={() => onFocusSite(s)} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Camera network</h2>
        <div className="space-y-2">
          {cameras.map((c) => (
            <CameraCard key={c.id} camera={c} selected={selectedCamera.id === c.id} onClick={() => onSelectCamera(c.id)} />
          ))}
        </div>
      </section>
    </>
  );
}

function PhoneFrame({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-start gap-4 overflow-y-auto bg-black/85 p-4 backdrop-blur sm:justify-center sm:p-6">
      <div className="flex w-full max-w-[420px] items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Mobile preview · 390 × 844</p>
        <button onClick={onClose} className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-400/40">
          <X size={14} /> Close
        </button>
      </div>
      <div className="relative h-[844px] w-[390px] max-w-[100vw] shrink-0 overflow-hidden rounded-[48px] border-[10px] border-slate-900 bg-black shadow-[0_30px_80px_-20px_rgba(0,200,255,0.25)] sm:max-w-none">
        <div className="absolute left-1/2 top-2 z-[120] h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
        <div className="h-full w-full overflow-hidden rounded-[38px] bg-[#05070b]">
          {children}
        </div>
      </div>
      <p className="max-w-[420px] text-center text-[11px] text-slate-400">
        This is a desktop preview of the mobile responder layout. Resize your browser or open on a phone for the real thing.
      </p>
    </div>
  );
}

function useIsMobileViewport(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handle = (e) => setIsMobile(e.matches);
    handle(mql);
    if (mql.addEventListener) {
      mql.addEventListener("change", handle);
      return () => mql.removeEventListener("change", handle);
    }
    mql.addListener(handle);
    return () => mql.removeListener(handle);
  }, [breakpoint]);

  return isMobile;
}

export default function App() {
  const [intro, setIntro] = useState(true);
  const [selectedIncidentId, setSelectedIncidentId] = useState("INC-0142");
  const [selectedCameraId, setSelectedCameraId] = useState("CAM-02");
  const [routeActive, setRouteActive] = useState(false);
  const [support, setSupport] = useState(null);
  const [forceMobile, setForceMobile] = useState(false);
  const [toast, setToast] = useState("System ready · select an incident, coastal site or camera to inspect.");

  const isRealMobile = useIsMobileViewport(600);

  const selectedIncident = useMemo(() => incidents.find((i) => i.id === selectedIncidentId) || incidents[0], [selectedIncidentId]);
  const selectedCamera = useMemo(() => cameras.find((c) => c.id === selectedCameraId) || cameras[1], [selectedCameraId]);

  function selectIncident(incident) {
    setSelectedIncidentId(incident.id);
    setSelectedCameraId(incident.cameraId);
    setToast(`${incident.priority} incident focused · ${incident.cameraId} opened on map.`);
  }

  function selectCamera(id) {
    setSelectedCameraId(id);
    setToast(`${id} selected · showing live visual feed and AI overlays.`);
  }

  function focusSite(site) {
    const camera = cameras.find((c) => c.site === site.name);
    if (camera) {
      setSelectedCameraId(camera.id);
      setToast(`${site.name} focused · ${camera.id} opened on the coastal map.`);
    } else {
      setToast(`${site.name} focused · no camera assigned in prototype data.`);
    }
  }

  function requestSupport(unit) {
    setSupport(unit);
    setToast(`${unit} request sent with swimmer location, camera feed, ETA and incident evidence.`);
  }

  function startRoute() {
    setRouteActive((v) => !v);
    setToast(routeActive ? "Rescue route paused." : "Rescue route started · responder navigation is now active.");
  }

  const state = { selectedIncident, selectedCamera, routeActive, support, toast };
  const actions = { selectIncident, selectCamera, focusSite, requestSupport, startRoute, setToast };

  const useMobileLayout = isRealMobile;

  return (
    <div className="min-h-screen bg-[#05070b] text-slate-100">
      {intro && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur sm:p-6">
          <div className="w-full max-w-5xl rounded-[32px] border border-cyan-400/20 bg-[#0b111c] p-5 shadow-2xl sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">ResQVision prototype · operator console</p>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-4xl">NSW coastal rescue coordination</h1>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
                  This is a live, clickable prototype of the operator screen surf lifesavers see when our AI flags a swimmer in distress. Sites on the left, the live map and CCTV in the middle, and the responder workflow on the right — built around one rule: <span className="text-cyan-200">verify fast, dispatch faster</span>.
                </p>
              </div>
              <button onClick={() => setIntro(false)} className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">Open prototype</button>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Detect the incident",
                  body: "A red, pulsing pin on the map is an active AI alert. Click it to load the swimmer's location, distance from shore and confidence score.",
                },
                {
                  title: "Verify on camera",
                  body: "The live feed plays with simulated YOLOv8 boxes, rip-current heatmap and a tracked-swimmer overlay so you can confirm distress in seconds.",
                },
                {
                  title: "Request support",
                  body: "One tap dispatches the nearest jetski, lifeguard tower or helicopter. Each request streams into the live log on the right.",
                },
                {
                  title: "Guide the rescue",
                  body: "Start the rescue route to drop a navigation line from the responder to the swimmer — what the jetski crew follows on the water.",
                },
              ].map((step, i) => (
                <div key={step.title} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-bold text-black">{i + 1}</div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-slate-500">
              Best viewed on desktop — use the <span className="text-cyan-200">Mobile preview</span> button in the header to see the responder phone layout. All data is simulated for demonstration.
            </p>
          </div>
        </div>
      )}

      {useMobileLayout ? (
        <div className="h-screen">
          <MobileApp state={state} actions={actions} />
        </div>
      ) : (
        <div className="h-screen overflow-x-auto">
          <DesktopApp
            state={state}
            actions={actions}
            previewActive={forceMobile}
            onTogglePreview={() => setForceMobile((v) => !v)}
          />
        </div>
      )}

      {forceMobile && !useMobileLayout && (
        <PhoneFrame onClose={() => setForceMobile(false)}>
          <MobileApp state={state} actions={actions} onExitPreview={() => setForceMobile(false)} />
        </PhoneFrame>
      )}
    </div>
  );
}
