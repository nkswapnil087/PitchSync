import { PitchSyncMark } from "@/components/branding/pitchsync-mark";
import { SignInForm } from "@/features/auth/sign-in-form";

import styles from "./page.module.css";

export default function SignInPage() {
  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[var(--bd-green-darker)] text-[var(--text-on-dark)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_46%,rgba(244,42,65,.13),transparent_18%),radial-gradient(circle_at_66%_18%,rgba(255,255,255,.09),transparent_26%),linear-gradient(125deg,#042c25_0%,#063d32_48%,#005840_100%)]"
      />
      <div aria-hidden="true" className="pitch-grid absolute inset-0 opacity-35" />

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(400px,480px)] items-center gap-16 px-[clamp(32px,7vw,104px)] py-12 max-lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] max-lg:gap-10 max-md:grid-cols-1 max-md:px-6 max-md:py-8">
        <section className={`${styles.hero} flex min-h-[560px] min-w-0 flex-col max-md:min-h-0`}>
          <div aria-hidden="true" className={styles.fieldGraphic}>
            <span className={`${styles.fieldRing} ${styles.outerRing}`} />
            <span className={`${styles.fieldRing} ${styles.innerRing}`} />
            <span className={styles.pitch}>
              <span className={styles.pitchLengthLine} />
              <span className={styles.pitchCrease} />
            </span>
          </div>

          <PitchSyncMark dark subtitle="Bangladesh Cricket Operations" />

          <div className="my-auto max-w-2xl max-md:my-14">
            <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/65">
              <span className="h-px w-8 bg-[var(--bd-red)]" />
              PitchSync
            </p>
            <h1 className="heading-font text-[clamp(3.5rem,5.4vw,5.6rem)] font-semibold leading-[.93] tracking-[-0.02em] max-md:text-5xl">
              Cricket operations,
              <br />
              connected.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/68 max-md:max-w-sm max-md:text-base max-md:leading-7">
              Manage performance, competition, administration, and integrity from one unified platform.
            </p>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.13em] text-white/38 max-md:hidden">
            Performance · Competition · Integrity
          </p>
        </section>

        <section className="w-full min-w-0 max-w-full rounded-[20px] border border-white/35 bg-[rgba(251,248,240,.88)] p-8 text-[var(--text)] shadow-[0_24px_80px_rgba(2,28,23,.28)] backdrop-blur-[24px] max-md:p-6">
          <div className="mb-7 h-1 w-10 rounded-full bg-[var(--bd-red)]" />
          <h2 className="heading-font text-4xl font-semibold tracking-[-0.01em]">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            Sign in to access your workspace.
          </p>
          <SignInForm />
        </section>
      </div>
    </main>
  );
}
