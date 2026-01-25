import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TurtleIcon as Tennis,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import landingContent from "@/data/landingContent.json";
import { Badge } from "../ui/badge";
// Separator eliminado para mayor limpieza visual

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = landingContent.hero.slides;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const scrollToServices = () => {
    document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [nextSlide, currentSlide]);

  return (
    <section id="inicio" className="relative h-screen w-full overflow-hidden bg-black">
      {/* Slides Background */}
      <div className="absolute inset-0 h-full w-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out", // Duración suavizada a 1s
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
              style={{
                visibility: isActive ? "visible" : "hidden",
                transitionDelay: isActive ? "0ms" : "1000ms",
              }}
            >
              {/* Imagen */}
              <div
                className="absolute inset-0 bg-cover bg-center will-change-transform"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transition: "transform 8s ease-out", // Animación más lenta y sutil
                }}
              />
              
              {/* Gradiente Overlay: Crucial para la legibilidad minimalista */}
              <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/60" />
              <div className="absolute inset-0 bg-black/20" /> {/* Overlay general suave */}
            </div>
          );
        })}
      </div>

      {/* Main Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 sm:px-6 pointer-events-none">
        
        {/* Glass Card Minimalista */}
        <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700 pointer-events-auto">
          
          <div className="space-y-4">
            {/* Título: Grande, audaz y con sombra sutil para contraste */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg leading-tight">
              {slides[currentSlide].title}
            </h1>

            {/* Subtítulo: Color blanco con transparencia para jerarquía */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto drop-shadow-md">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* Features: Estilo "Pill" transparente */}
          <div className="flex flex-wrap justify-center gap-3">
            {slides[currentSlide].features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                {index === 0 ? (
                  <Tennis className="h-4 w-4 text-sport-AquaLight" />
                ) : index === 1 ? (
                  <Trophy className="h-4 w-4 text-sport-AquaLight" />
                ) : (
                  <Users className="h-4 w-4 text-sport-AquaLight" />
                )}
                <span className="text-sm font-medium tracking-wide">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              onClick={scrollToServices}
              size="lg"
              className="group relative overflow-hidden rounded-full bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
            >
              <span className="relative z-10 flex items-center font-semibold">
                Descubrir Servicios
                <ChevronDown className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" />
              </span>
              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-30 px-6 md:px-12 flex justify-between items-end pointer-events-none">
        
        {/* Flechas: Más minimalistas, solo circulos blur */}
        <div className="flex gap-4 pointer-events-auto">
          <button
            onClick={prevSlide}
            className="group p-3 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="group p-3 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all hover:scale-110 active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Indicadores: Barras de progreso limpias */}
        <div className="flex gap-2 pointer-events-auto pb-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1 transition-all duration-500 rounded-full",
                index === currentSlide
                  ? "w-12 bg-sport-AquaLight shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                  : "w-8 bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;