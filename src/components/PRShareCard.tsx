import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, X } from "lucide-react";
import { toast } from "sonner";

export interface ShareCard {
  headline: string;
  exercise: string;
  detail: string;
  athlete: string;
  kicker?: string;
}

/** Draws a 1080x1920 story-ready card so athletes can post PRs to IG/TikTok. */
function drawCard(canvas: HTMLCanvasElement, card: ShareCard) {
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#090A0F";
  ctx.fillRect(0, 0, W, H);

  const g1 = ctx.createRadialGradient(160, 220, 40, 160, 220, 900);
  g1.addColorStop(0, "rgba(0,255,136,0.30)");
  g1.addColorStop(1, "rgba(0,255,136,0)");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(980, 1620, 40, 980, 1620, 900);
  g2.addColorStop(0, "rgba(0,229,255,0.26)");
  g2.addColorStop(1, "rgba(0,229,255,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // glass panel
  const px = 80;
  const py = 470;
  const pw = W - px * 2;
  const ph = 980;
  const rad = 56;
  ctx.beginPath();
  ctx.moveTo(px + rad, py);
  ctx.arcTo(px + pw, py, px + pw, py + ph, rad);
  ctx.arcTo(px + pw, py + ph, px, py + ph, rad);
  ctx.arcTo(px, py + ph, px, py, rad);
  ctx.arcTo(px, py, px + pw, py, rad);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.055)";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,255,136,0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "700 34px Inter Tight, system-ui, sans-serif";
  ctx.letterSpacing = "10px";
  ctx.fillText("ATHLETE OS", W / 2, 240);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#00FF88";
  ctx.font = "900 58px Chakra Petch, Inter Tight, system-ui, sans-serif";
  ctx.fillText(card.headline.toUpperCase(), W / 2, 640);

  // exercise name, wrapped
  ctx.fillStyle = "#FFFFFF";
  const words = card.exercise.split(" ");
  const lines: string[] = [];
  let line = "";
  ctx.font = "900 96px Chakra Petch, Inter Tight, system-ui, sans-serif";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > pw - 120 && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  let y = 820;
  for (const l of lines.slice(0, 3)) {
    ctx.fillText(l, W / 2, y);
    y += 108;
  }

  ctx.fillStyle = "#00E5FF";
  ctx.font = "800 72px Chakra Petch, Inter Tight, system-ui, sans-serif";
  ctx.fillText(card.detail, W / 2, y + 90);

  if (card.kicker) {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "600 40px Inter Tight, system-ui, sans-serif";
    ctx.fillText(card.kicker, W / 2, y + 180);
  }

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "700 44px Inter Tight, system-ui, sans-serif";
  ctx.fillText(card.athlete, W / 2, py + ph - 90);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "600 32px Inter Tight, system-ui, sans-serif";
  ctx.fillText(new Date().toLocaleDateString(), W / 2, H - 150);
}

export function PRShareCard({ card, onClose }: { card: ShareCard | null; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!card || !canvasRef.current) return;
    drawCard(canvasRef.current, card);
    setUrl(canvasRef.current.toDataURL("image/png"));
  }, [card]);

  const blob = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return null;
    return await new Promise<Blob | null>((res) => c.toBlob((b) => res(b), "image/png"));
  }, []);

  async function share() {
    const b = await blob();
    if (!b) return;
    const file = new File([b], "athlete-os-pr.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: card?.headline ?? "New PR" });
        return;
      } catch {
        /* user cancelled */
      }
    }
    download();
  }

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "athlete-os-pr.png";
    a.click();
    toast.success("Card saved — post it to your story");
  }

  return (
    <AnimatePresence>
      {card ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-background/85 px-6 py-10 backdrop-blur-md"
        >
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={onClose}
            aria-label="Close share card"
            className="absolute right-5 top-5 rounded-full border border-border bg-surface-2/70 p-2 text-muted-foreground"
          >
            <X size={18} />
          </button>
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="max-h-[70vh] overflow-hidden rounded-3xl"
          >
            {url ? (
              <img
                src={url}
                alt={`${card.headline}: ${card.exercise} ${card.detail}`}
                className="max-h-[70vh] w-auto rounded-3xl"
              />
            ) : null}
          </motion.div>
          <div className="flex w-full max-w-sm gap-3">
            <button
              onClick={share}
              className="glow-lime flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-black uppercase tracking-wider text-primary-foreground"
            >
              <Share2 size={16} /> Share
            </button>
            <button
              onClick={download}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan/50 bg-surface-2/60 py-3.5 text-sm font-black uppercase tracking-wider text-cyan"
            >
              <Download size={16} /> Save
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
