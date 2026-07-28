import { Linkedin, Mail } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function Professional() {
  return (
    <div className="min-h-screen bg-background text-white">

      <Navbar />

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-24">

        {/* Header */}
        <div className="mb-16">
          <p className="text-amber-400/60 text-[11px] tracking-[0.3em] uppercase mb-4">Professional</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            George Pai
          </h1>
          <p className="text-white/40 text-xl">[ Your title / role here ]</p>
        </div>

        {/* About */}
        <section className="mb-14">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500/60 mb-5 pb-3 border-b border-white/5">
            About
          </h2>
          <p className="text-white/65 text-lg leading-relaxed">
            [ Draft — write a 2–3 sentence blurb about your professional background here. Where you've worked, what you've built, what you bring to the table. ]
          </p>
        </section>

        {/* Passionate About */}
        <section className="mb-14">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500/60 mb-5 pb-3 border-b border-white/5">
            What I'm Passionate About
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "[ Passion 1 ]", body: "[ A sentence or two about this passion ]" },
              { title: "[ Passion 2 ]", body: "[ A sentence or two about this passion ]" },
              { title: "[ Passion 3 ]", body: "[ A sentence or two about this passion ]" },
              { title: "[ Passion 4 ]", body: "[ A sentence or two about this passion ]" },
            ].map((item) => (
              <div key={item.title} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                <p className="text-white font-medium text-sm mb-1">{item.title}</p>
                <p className="text-white/40 text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://linkedin.com/in/your-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl px-8 py-4 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            View LinkedIn
          </a>
          <a
            href="#newsletter"
            className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl px-8 py-4 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Join My Newsletter
          </a>
        </section>

      </div>
    </div>
  );
}
