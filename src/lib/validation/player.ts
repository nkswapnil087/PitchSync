import { z } from "zod";

const optionalText = (maximum: number) => z.string().trim().max(maximum).default("");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth.").refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}, "Date of birth cannot be in the future.");

export const playerWriteSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  dateOfBirth: isoDate,
  phone: optionalText(20).refine((value) => !value || /^[+\d][\d\s-]{5,19}$/.test(value), "Enter a valid phone number."),
  presentAddress: optionalText(255),
  presentUpazila: optionalText(100),
  presentDistrict: optionalText(100),
  presentDivision: optionalText(100),
  permanentAddress: optionalText(255),
  permanentUpazila: optionalText(100),
  permanentDistrict: optionalText(100),
  permanentDivision: optionalText(100),
  playerRole: z.enum(["Batter", "Bowler", "All-rounder", "Wicketkeeper-batter"]),
  gender: z.enum(["MALE", "FEMALE"]),
  education: optionalText(100),
  familyBackground: optionalText(100),
  achievements: z.string().trim().max(2559).default("").transform((value, context) => {
    const entries = [...new Set(value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean))];
    if (entries.length > 10 || entries.some((entry) => entry.length > 255)) context.addIssue({ code: "custom", message: "Enter up to 10 achievements, each no longer than 255 characters." });
    return entries;
  }),
});

export type PlayerWriteInput = z.infer<typeof playerWriteSchema>;
