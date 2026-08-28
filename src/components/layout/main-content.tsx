export function MainContent({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-5 lg:p-7"><div className="space-y-6 lg:space-y-7">{children}</div></main>;
}
