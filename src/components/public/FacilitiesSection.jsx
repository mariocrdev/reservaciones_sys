import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
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
import { usePublicFacilities } from "@/hooks/public/useFacilities";

const Facilities = () => {
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isError } = usePublicFacilities(page, pageSize);

  const facilities = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section
      id="instalaciones"
      className="py-24 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header de Sección */}
        <div className="text-center mb-16 max-w-3xl mx-auto space-y-4">
          <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold bg-sport-AquaLight/10 text-sport-AquaLight border-none">
            Espacios Premium
          </Badge>
          
          <h2 className="text-4xl font-extrabold tracking-tight">
            Nuestras Instalaciones
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Disfruta de instalaciones de primer nivel diseñadas meticulosamente para maximizar tu experiencia deportiva y confort.
          </p>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <Icon icon="solar:spinner-bold-duotone" className="w-12 h-12 animate-spin text-sport-AquaLight" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-destructive">
            <Icon icon="solar:danger-bold" className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold">Error al cargar las instalaciones. Por favor, inténtelo de nuevo más tarde.</p>
          </div>
        )}

        {!isLoading && !isError && facilities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="solar:info-circle-bold" className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold">No se encontraron instalaciones activas en este momento.</p>
          </div>
        )}

        {/* Grid de Instalaciones */}
        {!isLoading && !isError && facilities.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {facilities.map((facility) => (
                <div key={facility.id} className="h-full">
                  <Card className="h-full group shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 p-0 overflow-hidden bg-card/60 border-border/80 rounded-3xl">
                    
                    {/* Carousel Container */}
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Carousel className="w-full h-full">
                        <CarouselContent className="h-full ml-0">
                          {facility.image_urls && facility.image_urls.length > 0 ? (
                            facility.image_urls.map((url, index) => (
                              <CarouselItem key={index} className="pl-0 h-full">
                                <div className="relative w-full h-full">
                                  <img
                                    src={url || "/placeholder.svg"}
                                    alt={`${facility.name} - ${index}`}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.src = "/placeholder.svg?height=300&width=400";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                </div>
                              </CarouselItem>
                            ))
                          ) : (
                            <CarouselItem className="pl-0 h-full">
                              <div className="relative w-full h-full">
                                <img
                                  src="/placeholder.svg?height=300&width=400"
                                  alt={facility.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </CarouselItem>
                          )}
                        </CarouselContent>

                        {/* Controles: Minimalistas y solo en hover */}
                        {facility.image_urls && facility.image_urls.length > 1 && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40 shadow-lg" />
                            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/40 shadow-lg" />
                          </div>
                        )}
                      </Carousel>

                      {/* Icono decorativo flotante */}
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm p-2 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                        <Icon icon="solar:smart-home-angle-bold" className="w-5 h-5 text-sport-AquaLight" />
                      </div>
                    </div>

                    {/* Contenido */}
                    <CardContent className="px-6 pb-6 pt-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-sport-AquaLight transition-colors">
                          {facility.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                        {facility.description}
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4 text-sport-AquaLight" />
                          <span>Capacidad: {facility.capacity}</span>
                        </div>
                        {facility.price_per_hour !== null && (
                          <span className="font-bold text-foreground bg-sport-AquaLight/10 text-sport-AquaLight px-2.5 py-1 rounded-full">
                            ${facility.price_per_hour}/hr
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 select-none">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="rounded-full px-5 py-2 border-border/80"
                >
                  Anterior
                </Button>
                <span className="text-sm font-semibold text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="rounded-full px-5 py-2 border-border/80"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link to={`/auth/login`}>
            <Button
              size="lg"
              className="rounded-full px-8 py-6 bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white shadow-xl hover:shadow-2xl hover:shadow-sport-AquaLight/20 transition-all hover:scale-105 group"
            >
              <span className="font-semibold text-base mr-2">Reservar Espacio</span>
              <Icon 
                icon="solar:calendar-add-bold" 
                className="h-5 w-5 transition-transform group-hover:rotate-12" 
              />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            ¿Tienes dudas? <a href="#contact" className="text-sport-AquaLight hover:underline font-medium">Contáctanos</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Facilities;