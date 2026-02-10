import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useFacilities } from "@/hooks/useFacilities";

const Facilities = () => {
  const { data: facilities = [], isLoading, isError } = useFacilities();

  return (
    <section
      id="instalaciones"
      className="py-24 relative overflow-hidden"
    >

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header de Sección */}
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
            <Badge  className="px-4 py-1 uppercase tracking-widest text-xs font-bold">
            Espacios Premium
          </Badge>
          
          <h2 className="text-4xl font-extrabold  tracking-tight">
            Nuestras Instalaciones
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Disfruta de instalaciones de primer nivel diseñadas meticulosamente para maximizar tu experiencia deportiva y confort.
          </p>
        </div>

        {/* Grid de Instalaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {facilities.map((facility) => (
            <div key={facility.id} className="h-full">
              <Card className="h-full group shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 p-0 overflow-hidden">
                
                {/* Carousel Container */}
                <div className="relative aspect-4/3 overflow-hidden">
                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full ml-0">
                      {facility.image_urls?.map((url, index) => (
                        <CarouselItem key={index} className="pl-0 h-full">
                          <div className="relative w-full h-full">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`${facility.name} - ${index}`}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target;
                                target.src = "/placeholder.svg?height=300&width=400";
                              }}
                            />
                            {/* Overlay sutil para profundidad */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {/* Controles: Minimalistas y solo en hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40 shadow-lg" />
                        <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40 shadow-lg" />
                    </div>
                  </Carousel>

                  {/* Icono decorativo flotante (Opcional, si tienes iconos para facilities) */}
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm p-2 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                     <Icon icon="solar:smart-home-angle-bold" className="w-5 h-5 text-sport-AquaLight" />
                  </div>
                </div>

                {/* Contenido */}
                <CardContent className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-sport-AquaLight transition-colors">
                        {facility.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {facility.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link to={`/auth`}>
            <Button
              size="lg"
              className="rounded-full px-8 py-6 bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white shadow-xl hover:shadow-2xl hover:shadow-sport-AquaLight/20 transition-all hover:scale-105 group"
            >
              <span className="font-semibold text-base mr-2">Reservar Espacio</span>
              {/* Icono de Iconify: Calendario/Reserva */}
              <Icon 
                icon="solar:calendar-add-bold" 
                className="h-5 w-5 transition-transform group-hover:rotate-12" 
              />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            ¿Tienes dudas? <Link to="/contact" className="text-sport-AquaLight hover:underline font-medium">Contáctanos</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Facilities;