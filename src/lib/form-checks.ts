import { supabase } from "@/integrations/supabase/client";

export interface FormCheck {
  id: string;
  exercise_id: string | null;
  exercise_name: string;
  video_path: string | null;
  score: number | null;
  verdict: string | null;
  cues: string[];
  feedback: string | null;
  created_at: string;
}

export async function fetchFormChecks(): Promise<FormCheck[]> {
  const { data, error } = await supabase
    .from("form_checks")
    .select("id,exercise_id,exercise_name,video_path,score,verdict,cues,feedback,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as FormCheck[];
}

export async function uploadFormVideo(userId: string, file: File) {
  const ext = file.name.split(".").pop() || "mp4";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("form-videos").upload(path, file, {
    contentType: file.type || "video/mp4",
  });
  if (error) throw error;
  return path;
}

export async function saveFormCheck(
  userId: string,
  row: {
    exercise_id: string | null;
    exercise_name: string;
    video_path: string | null;
    score: number;
    verdict: string;
    cues: string[];
    feedback: string;
  },
) {
  const { error } = await supabase
    .from("form_checks")
    .insert({ ...row, user_id: userId, cues: row.cues as never });
  if (error) throw error;
}

export async function deleteFormCheck(id: string, videoPath: string | null) {
  if (videoPath) await supabase.storage.from("form-videos").remove([videoPath]);
  const { error } = await supabase.from("form_checks").delete().eq("id", id);
  if (error) throw error;
}

export async function signedVideoUrl(path: string) {
  const { data, error } = await supabase.storage.from("form-videos").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

/** Grab N evenly spaced frames from a video file as base64 JPEGs (browser only). */
export async function extractFrames(file: File, count = 5): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Could not read that video file"));
  });

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 720 / Math.max(video.videoWidth || 720, 1));
  canvas.width = Math.max(2, Math.round((video.videoWidth || 720) * scale));
  canvas.height = Math.max(2, Math.round((video.videoHeight || 1280) * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const frames: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = (duration * (i + 0.5)) / count;
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
      video.currentTime = Math.min(t, Math.max(0, duration - 0.05));
    });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push(canvas.toDataURL("image/jpeg", 0.72).split(",")[1]);
  }

  URL.revokeObjectURL(url);
  return frames;
}
