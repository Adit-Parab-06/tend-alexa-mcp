import { describe, it, expect } from "vitest";
import { TEND_VERSION, VoiceResponseSchema } from "./index.js";

describe("Tend Core Foundation", () => {
  it("exports current version", () => {
    expect(TEND_VERSION).toBe("0.1.0");
  });

  it("validates voice response schema constraint", () => {
    const valid = VoiceResponseSchema.safeParse({
      speech: "All morning meds recorded.",
      data: { status: "recorded", time: "09:00" },
    });
    expect(valid.success).toBe(true);

    const tooLongSpeech = VoiceResponseSchema.safeParse({
      speech: "x".repeat(281),
      data: {},
    });
    expect(tooLongSpeech.success).toBe(false);
  });
});
