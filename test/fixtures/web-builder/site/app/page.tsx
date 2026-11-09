export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <section className="mx-auto max-w-5xl px-6 py-32">
        <h1 className="font-display text-6xl">Operating systems for founders</h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          The workflows, agents, and reviews a one-person company runs on, set up in a week.
        </p>
        <a href="/start" className="mt-10 inline-block rounded-full bg-emerald-500 px-6 py-3 text-zinc-950">
          Start the setup
        </a>
      </section>
    </main>
  )
}
