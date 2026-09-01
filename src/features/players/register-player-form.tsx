"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type FieldError, type Path, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, RotateCcw, Save, ShieldCheck, Trash2 } from "lucide-react";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { FormSection } from "@/components/forms/form-section";
import { StepIndicator } from "@/components/forms/step-indicator";
import { ValidationSummary } from "@/components/forms/validation-summary";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PlayerRecord } from "@/data/contracts";
import { playerGenders, playerRoles } from "./player-options";

const required = (label: string, maximum: number) => z.string().trim().min(1, `${label} is required.`).max(maximum);
const optional = (maximum: number) => z.string().trim().max(maximum);
const dateOfBirth = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date of birth.").refine((value) => new Date(`${value}T00:00:00Z`) <= new Date(), "Date of birth cannot be in the future.");
const playerFormSchema = z.object({
  firstName: required("First name", 50), lastName: required("Last name", 50), dateOfBirth, phone: optional(20).refine((value) => !value || /^[+\d][\d\s-]{5,19}$/.test(value), "Enter a valid phone number."),
  presentAddress: optional(255), presentUpazila: optional(100), presentDistrict: optional(100), presentDivision: optional(100),
  permanentAddress: optional(255), permanentUpazila: optional(100), permanentDistrict: optional(100), permanentDivision: optional(100),
  playerRole: required("Player role", 50), gender: required("Gender", 20), education: optional(100), familyBackground: optional(100), achievements: optional(2559).refine((value) => { const entries = value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean); return entries.length <= 10 && entries.every((entry) => entry.length <= 255); }, "Enter up to 10 achievements, each no longer than 255 characters."),
});
type PlayerFormValues = z.infer<typeof playerFormSchema>;
type PlayerFormMode = "create" | "edit";

const defaults: PlayerFormValues = { firstName: "", lastName: "", dateOfBirth: "", phone: "", presentAddress: "", presentUpazila: "", presentDistrict: "", presentDivision: "", permanentAddress: "", permanentUpazila: "", permanentDistrict: "", permanentDivision: "", playerRole: "", gender: "", education: "", familyBackground: "", achievements: "" };
const steps = ["Personal & Contact", "Playing & Background", "Review"] as const;
const personalFields: Path<PlayerFormValues>[] = ["firstName", "lastName", "dateOfBirth", "phone", "presentAddress", "presentUpazila", "presentDistrict", "presentDivision", "permanentAddress", "permanentUpazila", "permanentDistrict", "permanentDivision"];
const playingFields: Path<PlayerFormValues>[] = ["playerRole", "gender", "education", "familyBackground", "achievements"];

function Field({ label, name, error, required: isRequired = false, children }: { label: string; name: string; error?: FieldError; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}{isRequired ? <span className="ml-1 text-[var(--danger)]" aria-hidden="true">*</span> : null}</Label>{children}{error ? <p id={`${name}-error`} className="text-xs font-medium text-[var(--danger)]">{error.message}</p> : null}</div>;
}

function ControlledSelect({ name, label, options, control, error }: { name: "playerRole" | "gender"; label: string; options: readonly { value: string; label: string }[]; control: ReturnType<typeof useForm<PlayerFormValues>>["control"]; error?: FieldError }) {
  return <Field label={label} name={name} error={error} required><Controller name={name} control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange} required><SelectTrigger id={name} className="w-full" aria-invalid={Boolean(error)}><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem value={option.value} key={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>} /></Field>;
}

function valuesFromPlayer(player: PlayerRecord): PlayerFormValues {
  return {
    firstName: player.person.firstName, lastName: player.person.lastName, dateOfBirth: player.person.dateOfBirth, phone: player.person.phones[0] ?? "",
    presentAddress: player.person.presentAddressDetails?.addressLine ?? "", presentUpazila: player.person.presentAddressDetails?.upazilaOrThana ?? "", presentDistrict: player.person.presentAddressDetails?.district ?? "", presentDivision: player.person.presentAddressDetails?.division ?? "",
    permanentAddress: player.person.permanentAddressDetails?.addressLine ?? "", permanentUpazila: player.person.permanentAddressDetails?.upazilaOrThana ?? "", permanentDistrict: player.person.permanentAddressDetails?.district ?? "", permanentDivision: player.person.permanentAddressDetails?.division ?? "",
    playerRole: player.playerRole, gender: player.gender, education: player.education?.split(" · ")[0] ?? "", familyBackground: player.familyBackground ?? "", achievements: player.achievements.join("\n"),
  };
}

function PlayerForm({ mode, playerId }: { mode: PlayerFormMode; playerId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(mode === "edit" ? "loading" : "ready");
  const [isDeleting, setIsDeleting] = useState(false);
  const form = useForm<PlayerFormValues>({ resolver: zodResolver(playerFormSchema), defaultValues: defaults, mode: "onTouched" });
  const { register, control, trigger, getValues, reset, handleSubmit, setError, formState: { errors, isSubmitting } } = form;
  useEffect(() => {
    if (mode !== "edit" || !playerId) return;
    const controller = new AbortController();
    fetch(`/api/players/${encodeURIComponent(playerId)}`, { signal: controller.signal }).then(async (response) => {
      const body = await response.json() as { data?: PlayerRecord };
      if (!response.ok || !body.data) throw new Error("Unable to load this player record.");
      reset(valuesFromPlayer(body.data)); setLoadState("ready");
    }).catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setLoadState("error"); });
    return () => controller.abort();
  }, [mode, playerId, reset]);
  const errorMessages = useMemo(() => Object.values(errors).flatMap((error) => error?.message ? [String(error.message)] : []), [errors]);
  const next = async () => { const valid = await trigger(step === 0 ? personalFields : playingFields, { shouldFocus: true }); if (valid) setStep((current) => Math.min(current + 1, 2)); };
  const resetForm = () => { reset(defaults); setStep(0); };
  const submit = async (values: PlayerFormValues) => {
    const endpoint = mode === "create" ? "/api/players" : `/api/players/${encodeURIComponent(playerId ?? "")}`;
    const response = await fetch(endpoint, { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const body = await response.json() as { data?: { playerId: string }; error?: string };
    if (!response.ok || !body.data) { setError("root", { message: body.error ?? "Unable to save this player record." }); return; }
    toast.success(mode === "create" ? "Player registered." : "Player record updated.");
    router.push(`/players/${body.data.playerId}`); router.refresh();
  };
  const remove = async () => {
    if (!playerId || !window.confirm("Remove this player from active records? Historical records will be retained.")) return;
    setIsDeleting(true);
    const response = await fetch(`/api/players/${encodeURIComponent(playerId)}`, { method: "DELETE" });
    const body = await response.json() as { error?: string };
    if (!response.ok) { setError("root", { message: body.error ?? "Unable to remove this player record." }); setIsDeleting(false); return; }
    toast.success("Player removed from active records."); router.push("/players"); router.refresh();
  };
  if (loadState === "loading") return <LoadingState title="Loading player record" />;
  if (loadState === "error") return <ErrorState message="Unable to load this player record." />;
  const values = getValues();
  const title = mode === "create" ? "Register player" : "Edit player record";
  return (
    <>
      <PageHeader eyebrow="Player registry" title={title} description="Enter schema-supported player information and review it before saving." />
      <StepIndicator steps={steps} current={step} />
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
        <ValidationSummary errors={errorMessages} />
        {step === 0 ? <FormSection title="Personal & contact information" description="Fields marked with an asterisk are required."><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="First name" name="firstName" error={errors.firstName} required><Input id="firstName" {...register("firstName")} /></Field><Field label="Last name" name="lastName" error={errors.lastName} required><Input id="lastName" {...register("lastName")} /></Field><Field label="Date of birth" name="dateOfBirth" error={errors.dateOfBirth} required><Input id="dateOfBirth" type="date" {...register("dateOfBirth")} /></Field><Field label="Phone" name="phone" error={errors.phone}><Input id="phone" type="tel" {...register("phone")} /></Field>
          <Field label="Present address line" name="presentAddress" error={errors.presentAddress}><Input id="presentAddress" {...register("presentAddress")} /></Field><Field label="Present upazila / thana" name="presentUpazila" error={errors.presentUpazila}><Input id="presentUpazila" {...register("presentUpazila")} /></Field><Field label="Present district" name="presentDistrict" error={errors.presentDistrict}><Input id="presentDistrict" {...register("presentDistrict")} /></Field><Field label="Present division" name="presentDivision" error={errors.presentDivision}><Input id="presentDivision" {...register("presentDivision")} /></Field>
          <Field label="Permanent address line" name="permanentAddress" error={errors.permanentAddress}><Input id="permanentAddress" {...register("permanentAddress")} /></Field><Field label="Permanent upazila / thana" name="permanentUpazila" error={errors.permanentUpazila}><Input id="permanentUpazila" {...register("permanentUpazila")} /></Field><Field label="Permanent district" name="permanentDistrict" error={errors.permanentDistrict}><Input id="permanentDistrict" {...register("permanentDistrict")} /></Field><Field label="Permanent division" name="permanentDivision" error={errors.permanentDivision}><Input id="permanentDivision" {...register("permanentDivision")} /></Field>
        </div></FormSection> : null}
        {step === 1 ? <FormSection title="Playing & background information" description="Capture only attributes supported by the finalized player model."><div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"><ControlledSelect name="playerRole" label="Player role" options={playerRoles.map((role) => ({ value: role, label: role }))} control={control} error={errors.playerRole} /><ControlledSelect name="gender" label="Gender" options={playerGenders} control={control} error={errors.gender} /><Field label="Education level" name="education" error={errors.education}><Input id="education" {...register("education")} /></Field><Field label="Family background" name="familyBackground" error={errors.familyBackground}><Textarea id="familyBackground" {...register("familyBackground")} /></Field><Field label="Achievements" name="achievements" error={errors.achievements}><Textarea id="achievements" placeholder="Enter one achievement per line" {...register("achievements")} /></Field></div></FormSection> : null}
        {step === 2 ? <FormSection title="Review entered details" description="Confirm the values before saving."><div className="space-y-7"><DetailGrid columns={4}><DetailField label="First name" value={values.firstName || "—"} /><DetailField label="Last name" value={values.lastName || "—"} /><DetailField label="Date of birth" value={values.dateOfBirth || "—"} /><DetailField label="Phone" value={values.phone || "—"} /><DetailField label="Player role" value={values.playerRole || "—"} /><DetailField label="Gender" value={values.gender || "—"} /><DetailField label="Education" value={values.education || "—"} /><DetailField label="Achievements" value={values.achievements || "—"} /></DetailGrid><div className="flex gap-3 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bd-green-soft)] p-4 text-sm text-[var(--bd-green-deep)]"><ShieldCheck className="size-5 shrink-0" /><p>Saving updates the active Oracle record and preserves an audit entry.</p></div></div></FormSection> : null}
        <div className="flex flex-col-reverse items-stretch justify-between gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"><div className="flex gap-2"><Button asChild type="button" variant="ghost"><Link href={playerId ? `/players/${playerId}` : "/players"}>Cancel</Link></Button><Button type="button" variant="ghost" onClick={resetForm}><RotateCcw />Reset</Button>{mode === "edit" ? <Button type="button" variant="outline" disabled={isDeleting} onClick={remove}><Trash2 />{isDeleting ? "Removing…" : "Remove"}</Button> : null}</div><div className="flex gap-2">{step > 0 ? <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}><ArrowLeft />Previous</Button> : null}{step < 2 ? <Button type="button" onClick={next}>Next<ArrowRight /></Button> : <Button type="submit" disabled={isSubmitting}><Save />{isSubmitting ? "Saving…" : mode === "create" ? "Register player" : "Save changes"}</Button>}</div></div>
      </form>
    </>
  );
}

export function RegisterPlayerForm() { return <PlayerForm mode="create" />; }
export function EditPlayerForm({ playerId }: { playerId: string }) { return <PlayerForm mode="edit" playerId={playerId} />; }
