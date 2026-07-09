import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  Calendar,
  Star,
  Award,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  Zap,
  Shield,
  BookOpen,
  CreditCard,
  UserCheck,
  Dumbbell,
  Waves,
  Trophy,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Importar componentes existentes
import Navbar from "@/components/public/NavBar";
import Hero from "@/components/public/Hero";
import Services from "@/components/public/Services";
import AboutUs from "@/components/public/AboutUs";
import Footer from "@/components/public/Footer";
import Contact from "@/components/public/Contact";
import StatsSection from "@/components/public/Stats";
import Facilities from "@/components/public/FacilitiesSection";
import HowItWorks from "@/components/public/HowItWorks";
import CoursesSection from "@/components/public/CoursesSection";
import MembershipsSection from "@/components/public/MembershipsSection";
import landingContent from "@/data/landingContent.json";
// ─── Platform Features Section ────────────────────────────────────────────────
const platformFeatures = [
  {
    icon: "solar:calendar-mark-bold",
    title: "Reserva de Instalaciones",
    desc: "Canchas de tenis, padel, piscina, gimnasio y más. Verifica disponibilidad en tiempo real y reserva tu horario sin llamadas.",
    color: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-500",
  },
  {
    icon: "solar:book-2-bold",
    title: "Inscripción a Cursos",
    desc: "Clases de natación, tenis, padel y más. Inscríbete tú o a tus hijos con cupos garantizados e instructores certificados.",
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
  },
  {
    icon: "solar:card-2-bold",
    title: "Membresías Flexibles",
    desc: "Planes Básico, Premium y Familiar con acceso diferenciado. Activa, renueva o cancela tu suscripción en cualquier momento.",
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: "solar:users-group-rounded-bold",
    title: "Gestión Familiar",
    desc: "Registra a tus hijos como miembros secundarios. Inscríbelos en cursos adaptados a su edad con notas médicas incluidas.",
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: "solar:shield-check-bold",
    title: "Pagos Seguros",
    desc: "Sistema de comprobantes verificados por administradores. Tu reserva queda bloqueada mientras el pago es procesado.",
    color: "from-rose-500/20 to-red-500/20",
    iconColor: "text-rose-500",
  },
  {
    icon: "solar:clock-circle-bold",
    title: "Horarios en Tiempo Real",
    desc: "Sin solapamientos ni dobles reservas. El sistema bloquea automáticamente los horarios ocupados y expirados.",
    color: "from-sky-500/20 to-indigo-500/20",
    iconColor: "text-sky-500",
  },
];

const PlatformFeatures = () => (
  <section id="plataforma" className="py-24 bg-muted/20 relative overflow-hidden">
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes scroll-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes scroll-right {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
      .animate-scroll-left {
        animation: scroll-left 40s linear infinite;
      }
      .animate-scroll-right {
        animation: scroll-right 40s linear infinite;
      }
      .animate-scroll-left:hover,
      .animate-scroll-right:hover {
        animation-play-state: paused;
      }
    ` }} />

    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sport-AquaLight/5 blur-[100px] rounded-full" />
    </div>

    <div className="container mx-auto px-4 relative z-10 mb-10">
      <div className="text-center space-y-4">
        <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold">
          Plataforma Integral
        </Badge>
        <h2 className="text-4xl font-extrabold tracking-tight">
          Todo lo que necesitas, en un solo lugar
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Nuestro sistema digital integra reservas, cursos, membresías y pagos para que tu experiencia deportiva sea completamente fluida.
        </p>
      </div>
    </div>

    {/* Carrusel Horizontal Infinito */}
    <div className="relative w-full overflow-hidden py-4 select-none">
      {/* Sombras de degradado en los extremos para efecto premium */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background/80 to-transparent z-20 pointer-events-none" />

      <div className="flex w-max gap-6 animate-scroll-left">
        {[...platformFeatures, ...platformFeatures].map((feat, i) => (
          <div
            key={i}
            className={cn(
              "group relative p-6 w-[340px] shrink-0 rounded-2xl border border-border/60 bg-card hover:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            )}
          >
            {/* Background gradient */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", feat.color)} />

            <div className="relative z-10">
              <div className={cn("w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 shadow-sm border border-border/50")}>
                <Icon icon={feat.icon} className={cn("w-6 h-6", feat.iconColor)} />
              </div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);



// ─── Testimonials Section ─────────────────────────────────────────────────────
const testimonials = landingContent.testimonials.list;

const Testimonials = () => (
  <section id="testimonios" className="py-24 bg-background relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-sport-AquaLight/5 rounded-full blur-3xl" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center mb-16 space-y-4">
        <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold">
          Testimonios
        </Badge>
        <h2 className="text-4xl font-extrabold tracking-tight">
          {landingContent.testimonials.title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {landingContent.testimonials.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn("h-4 w-4", i < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")}
                />
              ))}
            </div>

            <p className="text-sm text-muted-foreground italic flex-1 mb-5 leading-relaxed">
              "{t.content}"
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <img
                src={t.avatar || "/placeholder.svg"}
                alt={t.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                onError={(e) => { e.target.src = "/placeholder.svg?height=40&width=40"; }}
              />
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Schedule Section ─────────────────────────────────────────────────────────
const ScheduleSection = () => (
  <section id="horarios" className="py-24 bg-muted/20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16 space-y-4">
        <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold">
          Horarios
        </Badge>
        <h2 className="text-4xl font-extrabold tracking-tight">
          {landingContent.hours.title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {landingContent.hours.description}
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule card */}
        <div className="rounded-2xl border border-border bg-card p-7">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-sport-AquaLight" />
            Horario Regular
          </h3>
          <ul className="space-y-4">
            {landingContent.hours.schedule.map((item, i) => (
              <li key={i} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-sm bg-sport-AquaLight/10 text-sport-AquaLight px-3 py-1 rounded-full font-semibold">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info card */}
        <div className="rounded-2xl border border-border bg-sport-blueOcean text-white p-7">
          <h3 className="text-xl font-bold mb-6">Información</h3>
          <ul className="space-y-5">
            {landingContent.hours.additionalInfo.map((info, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {info.icon === "MapPin" && <MapPin className="h-4 w-4" />}
                  {info.icon === "Users" && <Users className="h-4 w-4" />}
                  {info.icon === "Award" && <Award className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{info.label}</p>
                  <p className="text-xs text-white/70">{info.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

// ─── Quick CTA Banner ─────────────────────────────────────────────────────────
const CTABanner = () => (
  <section className="py-20 relative overflow-hidden">
    <div
      className="absolute inset-0 bg-sport-blueOcean"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
    <div className="absolute inset-0 bg-sport-blueOcean/85" />

    <div className="container mx-auto px-4 relative z-10 text-center text-white">
      <span className="inline-block px-4 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold uppercase tracking-widest mb-5 border border-white/20">
        Únete hoy
      </span>
      <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
        Tu deporte, a un clic de distancia
      </h2>
      <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
        Reserva canchas, inscríbete en cursos y activa tu membresía desde nuestra plataforma digital. Sin llamadas, sin esperas.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/auth/login">
          <Button
            size="lg"
            className="rounded-full bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white font-semibold shadow-xl px-8 py-6 hover:scale-105 transition-all"
          >
            <UserCheck className="mr-2 h-5 w-5" />
            Registrarse Gratis
          </Button>
        </Link>
        <a href="#contact">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 bg-transparent"
          >
            Contactar al Club
          </Button>
        </a>
      </div>
    </div>
  </section>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Stats */}
      {/* <StatsSection /> */}

      {/* How It Works */}
      <HowItWorks />

      {/* Platform Features */}
      <PlatformFeatures />

      {/* Servicios & Comodidades (existing) */}
      <Services />

      {/* Instalaciones (real DB data) */}
      <Facilities />

      {/* Cursos Preview */}
      <CoursesSection />

      {/* Membresías */}
      <MembershipsSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Schedule */}
      <ScheduleSection />

      {/* CTA Banner */}
      <CTABanner />

      {/* About us */}
      <AboutUs />

      {/* Contact */}
      <Contact />

      {/* Footer */}
      <Footer />

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-sport-AquaLight text-white shadow-lg z-50 hover:bg-sport-AquaLight/90 transition-all hover:scale-110 active:scale-95"
          aria-label="Volver arriba"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default HomePage;
