import {
  Trophy,
  Users,
  Clock,
  Star,
  Activity,
  Award,
  CalendarCheck // Asegúrate de importar los iconos que uses en tu JSON
} from "lucide-react";
import { cn } from "@/lib/utils";
import landingContent from "@/data/landingContent.json";

// Mapeo simple para asegurar que los iconos se rendericen (puedes ajustar según tu JSON)
const iconMap = {
  Trophy,
  Users,
  Clock,
  Star,
  Activity,
  Award,
  CalendarCheck
};

// Componente auxiliar para el icono (si no lo tienes externo)
const StatIcon = ({ iconName, className }) => {
  const Icon = iconMap[iconName] || Activity;
  return <Icon className={className} />;
};

const StatsSection = () => {
  return (
    <section className="relative py-20 bg-background overflow-hidden">
      {/* Elementos decorativos de fondo (Glow sutil) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-75 bg-sport-AquaLight/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide border  bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden">
          {landingContent.stats.map((stat, index) => (
            <div
              key={stat.id}
              className={cn(
                "group relative p-8 md:p-10 flex flex-col items-center justify-center text-center transition-colors duration-300 ",
                // Ajuste para bordes en móvil (grid de 2 columnas)
                index < 2 ? "border-b  md:border-b-0" : "" 
              )}
            >
              {/* Icono: Ahora flota sutilmente con color acento */}
              <div className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:opacity-100">
                <StatIcon iconName={stat.icon} className="h-8 w-8" />
              </div>

              {/* Valor: Grande, negrita y limpio */}
              <h3 className="text-4xl md:text-5xl font-extrabold  tracking-tight mb-2 drop-shadow-sm">
                {stat.value}
              </h3>

              {/* Etiqueta: Pequeña, mayúscula y con espaciado amplio para elegancia */}
              <p className="text-xs md:text-sm font-medium  uppercase tracking-widest  transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;