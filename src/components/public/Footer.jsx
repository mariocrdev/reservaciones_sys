import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import landingContent from "@/data/landingContent.json";

const iconMap = {
  Facebook,
  Twitter,
  Instagram,
};

const Footer = () => {
  const {
    quickLinks = { title: "Enlaces Rápidos", list: [] },
    servicesLinks = { title: "Servicios", list: [] },
    socialLinks = [],
    clubInfo = {},
  } = landingContent.footer || {};

  const hours = landingContent.hours || {
    title: "Horarios de Atención",
    schedule: [],
  };

  // Mapa de iconos sociales usando los nombres del JSON
  const SocialIcon = ({ iconName }) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  // Manejador seguro para los links del footer
  const navQuickLinks = Array.isArray(quickLinks) ? quickLinks : (landingContent.footer?.quickLinks || []);
  const navServicesLinks = Array.isArray(servicesLinks) ? servicesLinks : (landingContent.footer?.servicesLinks || []);

  return (
    <footer className="w-full bg-card/90 dark:bg-slate-950/80 border-t border-border/80 text-card-foreground transition-colors duration-300 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Club info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 p-1">
                <img
                  src="/logo_reservacion.png"
                  alt="Centro Deportivo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    const target = e.target;
                    target.src = "/placeholder.svg?height=64&width=64";
                  }}
                />
              </div>
              <div>
                <span className="font-bold text-xl text-foreground tracking-tight block">
                  Centro Deportivo
                </span>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Gestión y Reservas
                </span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              {clubInfo.description ||
                "Ofrecemos instalaciones deportivas y programas de entrenamiento de primer nivel para toda la comunidad."}
            </p>

            {/* Redes sociales */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href || "#"}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted/80 hover:bg-primary/15 text-muted-foreground hover:text-primary border border-border/60 hover:border-primary/40 transition-all duration-200"
                  aria-label={social.label || "Red social"}
                >
                  <SocialIcon iconName={social.icon} />
                </a>
              ))}
            </div>

            {/* Datos de contacto directo */}
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-snug">
                  {clubInfo.address || "Av. Principal 123, Instalaciones Deportivas"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground font-medium">
                  {clubInfo.phone || "+593 123 456 789"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground font-medium">
                  {clubInfo.email || "contacto@centrodeportivo.com"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Enlaces
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navQuickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href || "#"}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight className="h-3.5 w-3.5 mr-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-primary -ml-5 group-hover:ml-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services links */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Servicios
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navServicesLinks.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href || "#"}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center group"
                  >
                    <ChevronRight className="h-3.5 w-3.5 mr-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-primary -ml-5 group-hover:ml-0" />
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {hours.title || "Horarios"}
            </h3>
            <ul className="space-y-3 text-sm">
              {hours.schedule?.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-semibold text-foreground block">
                      {item.label || item.days}:
                    </span>
                    <span className="text-muted-foreground block">
                      {item.time}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-border/70 my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Centro Deportivo. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Términos y Condiciones
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Seguridad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
