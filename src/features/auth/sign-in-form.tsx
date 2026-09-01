"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRole, isRoleId, roles } from "@/config/roles";
import type { RoleId } from "./types";
import { useAuth } from "./auth-provider";

const signInSchema = z.object({ identifier: z.string().trim().min(1, "Enter your email or username."), password: z.string().min(1, "Enter your password."), role: z.custom<RoleId>(isRoleId, { message: "Select a role." }) });
type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const auth = useAuth();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { identifier: "", password: "" } });
  const submit = async ({ identifier, password, role }: SignInValues) => {
    const result = await auth.signIn(identifier, password, role);
    if (!result.ok) { setError("root", { message: result.error }); return; }
    router.replace(getRole(result.session.role)?.dashboardRoute ?? "/sign-in");
  };
  return <form className="mt-7 space-y-5" onSubmit={handleSubmit(submit)} noValidate><div className="space-y-2"><Label htmlFor="identifier">Email or username <span aria-hidden="true" className="text-[var(--bd-red-deep)]">*</span></Label><Input id="identifier" className="h-11 bg-white/90" autoComplete="username" placeholder="Enter your email or username" aria-invalid={Boolean(errors.identifier)} aria-describedby={errors.identifier ? "identifier-error" : undefined} {...register("identifier")} />{errors.identifier ? <p id="identifier-error" className="text-xs font-medium text-[var(--danger)]">{errors.identifier.message}</p> : null}</div><div className="space-y-2"><Label htmlFor="password">Password <span aria-hidden="true" className="text-[var(--bd-red-deep)]">*</span></Label><Input id="password" className="h-11 bg-white/90" type="password" autoComplete="current-password" placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} {...register("password")} />{errors.password ? <p id="password-error" className="text-xs font-medium text-[var(--danger)]">{errors.password.message}</p> : null}</div><div className="space-y-2"><Label htmlFor="role">Role <span aria-hidden="true" className="text-[var(--bd-red-deep)]">*</span></Label><Controller name="role" control={control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="role" className="h-11 w-full bg-white/90" aria-invalid={Boolean(errors.role)} aria-describedby={errors.role ? "role-error" : undefined}><SelectValue placeholder="Select your role" /></SelectTrigger><SelectContent>{roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>)}</SelectContent></Select>} />{errors.role ? <p id="role-error" className="text-xs font-medium text-[var(--danger)]">{errors.role.message}</p> : null}</div>{errors.root ? <p role="alert" className="rounded-lg border border-[var(--danger)]/30 bg-red-50 px-3 py-2 text-sm font-medium text-[var(--danger)]">{errors.root.message}</p> : null}<Button className="h-11 w-full shadow-[0_8px_22px_rgba(0,88,64,.18)]" disabled={isSubmitting} type="submit">{isSubmitting ? "Signing in…" : "Sign in"}<ArrowRight /></Button></form>;
}
