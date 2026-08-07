import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeFrames, chatAboutForm } from "./form-check.server";

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

export const askAboutForm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        exerciseName: z.string().min(1).max(120),
        score: z.number(),
        verdict: z.string().max(600).default(""),
        cues: z.array(z.string().max(300)).max(10).default([]),
        feedback: z.string().max(4000).default(""),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(2000),
            }),
          )
          .min(1)
          .max(30),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");
    const reply = await chatAboutForm(
      key,
      {
        exerciseName: data.exerciseName,
        score: data.score,
        verdict: data.verdict,
        cues: data.cues,
        feedback: data.feedback,
      },
      data.history,
    );
    return { reply };
  });
