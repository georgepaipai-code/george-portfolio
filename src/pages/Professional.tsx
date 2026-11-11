import { Linkedin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { NewsletterBox } from "@/components/events/NewsletterBox";

export default function Professional() {
  return (
    <div className="min-h-screen bg-background text-white">

      <Navbar />

      {/* Banner */}
      <div className="relative h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('/george-work.png')] bg-cover" style={{ backgroundPosition: 'center 25%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 pb-6">
          <p className="text-amber-400/70 text-[11px] tracking-[0.3em] uppercase mb-2">Professional</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            George Pai
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 pt-10 pb-24">

        {/* Subheading */}
        <div className="mb-16">
          <p className="text-white/40 text-xl">
            VP, Business Partner Manager at{" "}
            <a
              href="https://www.fidelityprivateshares.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 underline underline-offset-4 hover:text-amber-400"
            >
              Fidelity Private Shares
            </a>
          </p>
        </div>

        {/* About */}
        <section className="mb-14">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500/60 mb-5 pb-3 border-b border-white/5">
            About
          </h2>
          <p className="text-white/65 text-lg leading-relaxed">
            I&apos;m a Bay Area native who&apos;s spent my career helping early stage founders get
            from their first check to Series A. My path so far: VC, hypergrowth startups in the US
            and Asia, cofounder, angel investor, and founder advisor. Now I&apos;m building a
            grassroots founder ecosystem backed by the global resources of Fidelity. Let&apos;s
            collab!
          </p>
        </section>

        {/* CTAs */}
        <section className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://www.linkedin.com/in/georgepai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl px-8 py-4 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            View LinkedIn
          </a>
        </section>

        {/* Newsletter */}
        <section className="mt-14">
          <NewsletterBox />
        </section>

      </div>
    </div>
  );
}
