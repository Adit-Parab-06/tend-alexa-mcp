import { z } from "zod";

/**
 * Standard voice-first response contract for all Alexa+ tools
 */
export const VoiceResponseSchema = z.object({
  speech: z.string().max(280),
  data: z.record(z.unknown()),
});

export type VoiceResponse = z.infer<typeof VoiceResponseSchema>;

/**
 * Core Tend Member Roles
 */
export const MemberRoleSchema = z.enum(["elder", "primary_caregiver", "caregiver"]);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export interface Member {
  id: string;
  circleId: string;
  name: string;
  role: MemberRole;
  phone?: string;
}

export interface CareCircle {
  id: string;
  name: string;
  elderName: string;
  createdAt: string;
}

export const TEND_VERSION = "0.1.0";
