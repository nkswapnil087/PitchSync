"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type FieldError, type Path, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { DetailField } from "@/components/data-display/detail-field";
import { DetailGrid } from "@/components/data-display/detail-grid";
import { FormSection } from "@/components/forms/form-section";
import { StepIndicator } from "@/components/forms/step-indicator";
import { ValidationSummary } from "@/components/forms/validation-summary";
import { PageHeader } from "@/components/page/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { playerGenders, playerRoles } from "./player-options";

const required = (label: string) => z.string().trim().min(1, `${label} is required.`);
const playerSchema = z.object({
  firstName: required("First name"),
  lastName: required("Last name"),
  dateOfBirth: required("Date of birth"),
  phone: z.string().trim(),
  presentAddress: z.string().trim(),
  permanentAddress: z.string().trim(),
  playerRole: required("Player role"),
  gender: required("Gender"),
  education: z.string().trim(),
  familyBackground: z.string().trim(),
  achievements: z.string().trim(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;
type PlayerFormMode = "create" | "edit";

const defaults: PlayerFormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  presentAddress: "",
  permanentAddress: "",
  playerRole: "",
  gender: "",
  education: "",
  familyBackground: "",
  achievements: "",
};
const steps = ["Personal & Contact", "Playing & Background", "Review"] as const;
const personalFields: Path<PlayerFormValues>[] = ["firstName", "lastName", "dateOfBirth", "phone", "presentAddress", "permanentAddress"];
const playingFields: Path<PlayerFormValues>[] = ["playerRole", "gender", "education", "familyBackground", "achievements"];

function Field({ label, name, error, required: isRequired = false, children }: { label: string; name: string; error?: FieldError; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}{isRequired ? <span className="ml-1 text-[var(--danger)]" aria-hidden="true">*</span> : null}</Label>{children}{error ? <p id={`${name}-error`} className="text-xs font-medium text-[var(--danger)]">{error.message}</p> : null}</div>;
}

function ControlledSelect({ name, label, options, control, error, required: isRequired = false }: { name: "playerRole" | "gender"; label: string; options: readonly { value: string; label: string }[]; control: ReturnType<typeof useForm<PlayerFormValues>>["control"]; error?: FieldError; required?: boolean }) {
  return <Field label={label} name={name} error={error} required={isRequired}><Controller name={name} control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange} required={isRequired}><SelectTrigger id={name} className="w-full" aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined}><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem value={option.value} key={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>} /></Field>;
}

function PlayerForm({ mode }: { mode: PlayerFormMode }) {
  const [step, setStep] = useState(0);
  const form = useForm<PlayerFormValues>({ resolver: zodResolver(playerSchema), defaultValues: defaults, mode: "onTouched" });
  const { register, control, trigger, getValues, reset, handleSubmit, formState: { errors, isSubmitting } } = form;
  const errorMessages = useMemo(() => Object.values(errors).flatMap((error) => error?.message ? [String(error.message)] : []), [errors]);
  const next = async () => {
    const valid = await trigger(step === 0 ? personalFields : playingFields, { shouldFocus: true });
    if (valid) setStep((current) => Math.min(current + 1, 2));
  };
  const resetForm = () => { reset(defaults); setStep(0); };
  const submit = () => toast("Details passed validation. No changes were saved.", { duration: 5000 });
  const values = getValues();
  const title = mode === "create" ? "Register player" : "Edit player record";

  return (
    <>
      <PageHeader eyebrow="Player registry" title={title} description="Enter schema-supported player information and review it before validation." />
      <StepIndicator steps={steps} current={step} />
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
        <ValidationSummary errors={errorMessages} />
        {step === 0 ? (
          <FormSection title="Personal & contact information" description="Fields marked with an asterisk are required.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="First name" name="firstName" error={errors.firstName} required><Input id="firstName" aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? "firstName-error" : undefined} {...register("firstName")} /></Field>
              <Field label="Last name" name="lastName" error={errors.lastName} required><Input id="lastName" aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? "lastName-error" : undefined} {...register("lastName")} /></Field>
              <Field label="Date of birth" name="dateOfBirth" error={errors.dateOfBirth} required><Input id="dateOfBirth" type="date" aria-invalid={Boolean(errors.dateOfBirth)} aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined} {...register("dateOfBirth")} /></Field>
              <Field label="Phone" name="phone" error={errors.phone}><Input id="phone" type="tel" {...register("phone")} /></Field>
              <Field label="Present address" name="presentAddress" error={errors.presentAddress}><Textarea id="presentAddress" {...register("presentAddress")} /></Field>
              <Field label="Permanent address" name="permanentAddress" error={errors.permanentAddress}><Textarea id="permanentAddress" {...register("permanentAddress")} /></Field>
            </div>
          </FormSection>
        ) : null}
        {step === 1 ? (
          <FormSection title="Playing & background information" description="Capture only attributes supported by the finalized player model.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ControlledSelect name="playerRole" label="Player role" options={playerRoles.map((role) => ({ value: role, label: role }))} control={control} error={errors.playerRole} required />
              <ControlledSelect name="gender" label="Gender" options={playerGenders} control={control} error={errors.gender} required />
              <Field label="Education" name="education" error={errors.education}><Input id="education" {...register("education")} /></Field>
              <Field label="Family background" name="familyBackground" error={errors.familyBackground}><Textarea id="familyBackground" {...register("familyBackground")} /></Field>
              <Field label="Achievements" name="achievements" error={errors.achievements}><Textarea id="achievements" placeholder="Enter one achievement per line" {...register("achievements")} /></Field>
            </div>
          </FormSection>
        ) : null}
        {step === 2 ? (
          <FormSection title="Review entered details" description="Confirm the values before completing validation.">
            <div className="space-y-7">
              <DetailGrid columns={4}>
                <DetailField label="First name" value={values.firstName || "â€”"} />
                <DetailField label="Last name" value={values.lastName || "â€”"} />
                <DetailField label="Date of birth" value={values.dateOfBirth || "â€”"} />
                <DetailField label="Phone" value={values.phone || "â€”"} />
                <DetailField label="Player role" value={values.playerRole || "â€”"} />
                <DetailField label="Gender" value={values.gender || "â€”"} />
                <DetailField label="Education" value={values.education || "â€”"} />
                <DetailField label="Achievements" value={values.achievements || "â€”"} />
              </DetailGrid>
              <div className="flex gap-3 rounded-[10px] border border-[var(--border-strong)] bg-[var(--bd-green-soft)] p-4 text-sm text-[var(--bd-green-deep)]"><ShieldCheck className="size-5 shrink-0" /><p>Values are checked for completeness and field validity before you continue.</p></div>
            </div>
          </FormSection>
        ) : null}
        <div className="flex flex-col-reverse items-stretch justify-between gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center">
          <div className="flex gap-2"><Button asChild type="button" variant="ghost"><Link href="/players">Cancel</Link></Button><Button type="button" variant="ghost" onClick={resetForm}><RotateCcw />Reset</Button></div>
          <div className="flex gap-2">{step > 0 ? <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}><ArrowLeft />Previous</Button> : null}{step < 2 ? <Button type="button" onClick={next}>Next<ArrowRight /></Button> : <Button type="submit" disabled={isSubmitting}><Save />Validate {mode === "create" ? "record" : "changes"}</Button>}</div>
        </div>
      </form>
    </>
  );
}

export function RegisterPlayerForm() {
  return <PlayerForm mode="create" />;
}

export function EditPlayerForm() {
  return <PlayerForm mode="edit" />;
}
