import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeFrames } from "./form-check.server";

export const judgeForm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        exerciseName: z.string().min(1).max(120),
        frames: z.array(z.string().min(100)).min(1).max(8),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");
    return analyzeFrames(key, data.exerciseName, data.frames);
  });
