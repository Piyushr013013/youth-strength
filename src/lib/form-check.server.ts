import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const VERDICT = z.object({
  score: z.number().min(0).max(100),
  verdict: z.string(),
  cues: z.array(z.string()).max(6),
  feedback: z.string(),
  riskFlags: z.array(z.string()).max(4),
});

export type FormVerdict = z.infer<typeof VERDICT>;

const SYSTEM = `You are a strength coach reviewing an athlete's lift technique from a sequence of still frames taken from a video (ordered start to finish).
Judge the movement honestly but supportively — the athlete is a student athlete.
Return:
- score: 0-100 technique score.
- verdict: one short sentence summary.
- cues: 2-5 short imperative coaching cues ("brace before you descend").
- feedback: 3-6 sentences of specific feedback referencing what you can see (depth, bar path, knee/hip position, spine, tempo, lockout).
- riskFlags: any injury-risk issues you can see. Empty array if none.
If the frames are too blurry, dark or cropped to judge, say so in verdict and score conservatively.`;

export async function analyzeFrames(
  apiKey: string,
  exerciseName: string,
  frames: string[],
): Promise<FormVerdict> {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const { output } = await generateText({
    model: gateway("google/gemini-3.6-flash"),
    system: SYSTEM,
    output: Output.object({ schema: VERDICT }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Exercise: ${exerciseName}. Frames are in chronological order. Judge my form.`,
          },
          ...frames.map((data) => ({
            type: "file" as const,
            mediaType: "image/jpeg",
            data,
          })),
        ],
      },
    ],
  });
  return output;
}
