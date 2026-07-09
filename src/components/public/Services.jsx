import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import landingContent from "@/data/landingContent.json";

// Mapeo de iconos basado en el contexto de un Club Deportivo
// Usamos iconos "Bold" o "Filled" para que tengan peso visual sobre fondos de color
const iconMapping = {
  // Deportes
  TennisBall: "cil:tennis",
  Racquet: "material-symbols:padel",
  Waves: "mingcute:swimming-fill", // Natación
  Drop: "roentgen:sauna",
  Dumbbell: "solar:dumbbell-large-bold", // Gimnasio
  
  // Servicios Generales
  UtensilsCrossed: "solar:chef-hat-heart-bold", // Restaurante/Nutrición
  ShoppingBag: "solar:bag-5-bold", // Tienda
  PartyPopper: "solar:confetti-bold", // Eventos
  Scissors: "ion:cut-sharp", // Estética/Peluquería
  Users: "solar:users-group-rounded-bold",
  Trophy: "solar:cup-star-bold",
  
  // Fallback
  default: "solar:star-circle-bold"
};

const Services = () => {
  const services = landingContent.services.list;

  const ServiceIcon = ({ iconName, className }) => {
    // Busca el icono en el mapa, si no existe usa el default
    const iconString = iconMapping[iconName] || iconMapping.default;
    return <Icon icon={iconString} className={className} />;
  };

  return (
    <section
      id="servicios"
      className="py-24 relative overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-right {
          animation: scroll-right 40s linear infinite;
        }
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      ` }} />

      <div className="container mx-auto px-4 relative z-10 mb-10">
        {/* Header de Sección */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold">
            Nuestras Actividades
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight">
            {landingContent.services.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {landingContent.services.description}
          </p>
        </div>
      </div>

      {/* Carrusel Horizontal Infinito hacia la Derecha */}
      <div className="relative w-full overflow-hidden py-4 select-none">
        {/* Sombras de degradado en los extremos para efecto premium */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background/80 to-transparent z-20 pointer-events-none" />

        <div className="flex w-max gap-8 animate-scroll-right">
          {[...services, ...services].map((service, index) => (
            <div key={`${service.id}-${index}`} className="w-[340px] shrink-0">
              <Card className="h-full overflow-hidden group p-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-3xl border border-border/60 bg-card">
                
                {/* Carousel Container */}
                <div className="relative w-full aspect-4/3 overflow-hidden">
                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full ml-0">
                      {service.images.map((image, i) => (
                        <CarouselItem key={i} className="pl-0 h-full">
                          <div className="relative w-full h-full">
                            <img
                              src={image || "/placeholder.svg?height=300&width=400"}
                              alt={`${service.title} - imagen ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={(e) => {
                                e.target.src = "/placeholder.svg?height=300&width=400";
                              }}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                    {/* Controles del Carousel: Solo visibles en hover para minimalismo */}
                    {service.images.length > 1 && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/30 backdrop-blur-md border-none text-white hover:bg-black/50" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/30 backdrop-blur-md border-none text-white hover:bg-black/50" />
                      </div>
                    )}
                  </Carousel>

                  {/* Badge Destacado */}
                  {service.popular && (
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-sport-AquaLight hover:bg-sport-AquaLight text-white border-none shadow-lg px-3 py-1">
                        <Icon icon="solar:star-bold" className="mr-1 h-3 w-3" />
                        Popular
                      </Badge>
                    </div>
                  )}

                  {/* Icono Flotante Rediseñado */}
                  <div className={cn(
                    "absolute top-4 left-4 z-20 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md",
                    service.color || "bg-white/90 text-sport-darkMatte"
                  )}>
                    <ServiceIcon
                      iconName={service.icon}
                      className="h-6 w-6 text-white" 
                    />
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <CardHeader className="px-6 pt-5">
                  <h3 className="text-xl font-bold flex items-center gap-2 transition-colors text-foreground">
                    {service.title}
                  </h3>
                </CardHeader>

                <CardContent className="px-6 pb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;