import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────
   Hero — Minimalista / High-performance

   Performance decisions:
   • Single static background image (no JS carousel, no setInterval)
   • fetchpriority="high" + decoding="async" on the <img>
   • CSS-only animations (no requestAnimationFrame loops)
   • No useEffect / useState → zero hydration overhead
   • Overlay via CSS gradient (no extra DOM layers)
   ───────────────────────────────────────────── */

const HERO_BG =
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1920&q=75";

const pills = [
  { icon: "solar:calendar-add-bold",        label: "Reservas en línea"         },
  { icon: "solar:book-2-bold",              label: "Cursos con instructores"   },
  { icon: "solar:card-recive-bold",         label: "Membresías flexibles"      },
];

const Hero = () => (
  <section
    id="inicio"
    className="relative flex min-h-svh items-center overflow-hidden bg-[#0f2337]"
  >
    {/* ── Background image ── */}
    <img
      src={HERO_BG}
      alt=""
      aria-hidden="true"
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover object-center will-change-transform hero-zoom"
    />

    {/* ── Dark gradient overlay ── */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#0f2337]/90 via-[#0f2337]/60 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2337]/70 via-transparent to-transparent" />

    {/* ── Main content ── */}
    <div className="relative z-10 container mx-auto px-6 md:px-12 py-32">
      <div className="max-w-2xl">

        

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-white hero-fade-up" style={{ animationDelay: "80ms" }}>
          Tu deporte,<br />
          <span className="text-sport-AquaLight">a un clic</span> de distancia.
        </h1>

        {/* Sub */}
        <p className="mt-6 text-lg md:text-xl text-white/70 leading-relaxed max-w-lg hero-fade-up" style={{ animationDelay: "160ms" }}>
          Reserva instalaciones, inscríbete en cursos y gestiona tu membresía desde una sola plataforma. Sin llamadas, sin filas.
        </p>

        {/* Pills */}
        <div className="mt-8 flex flex-wrap gap-3 hero-fade-up" style={{ animationDelay: "240ms" }}>
          {pills.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-sm"
            >
              <Icon icon={icon} className="h-4 w-4 text-sport-AquaLight" />
              <span className="text-sm font-medium text-white/85">{label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center gap-4 hero-fade-up" style={{ animationDelay: "320ms" }}>
          <Link to="/auth/login">
            <Button
              size="lg"
              className="rounded-full bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white font-semibold px-8 py-6 text-base shadow-2xl shadow-sport-AquaLight/30 hover:scale-105 transition-all border-0"
            >
              <Icon icon="solar:login-2-bold" className="mr-2 h-5 w-5" />
              Ingresar al Club
            </Button>
          </Link>

          <a href="#servicios">
            <button className="group flex items-center gap-2 rounded-full border border-white/25 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 transition-all">
              Ver servicios
              <Icon
                icon="solar:arrow-right-linear"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </button>
          </a>
        </div>

      </div>
    </div>

    {/* ── Bottom scroll cue ── */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 hero-fade-up" style={{ animationDelay: "500ms" }}>
      <span className="text-xs font-medium uppercase tracking-widest text-white/40">Scroll</span>
      <span className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
    </div>

    {/* ── Decorative glow ── */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-32 right-0 h-[500px] w-[500px] rounded-full bg-sport-AquaLight/10 blur-[120px]"
    />
  </section>
);

export default Hero;