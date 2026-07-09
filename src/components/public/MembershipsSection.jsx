import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { usePublicMembership } from "@/hooks/public/useMembership";

const getDurationLabel = (duration) => {
  if (!duration) return "periodo";
  // Si es un objeto de intervalo de postgres (ej: { months: 1 }) o string (ej: "1 month")
  const durationStr = typeof duration === 'string' ? duration : JSON.stringify(duration);
  
  if (durationStr.includes("1 month") || durationStr.includes('"months":1')) return "mensual";
  if (durationStr.includes("1 year") || durationStr.includes('"years":1')) return "anual";
  return durationStr;
};

const getProductIcon = (productName) => {
  const name = productName?.toLowerCase() || "";
  if (name.includes("basic") || name.includes("básic")) return "solar:star-outline";
  if (name.includes("premium") || name.includes("gold") || name.includes("plat")) return "solar:crown-bold";
  if (name.includes("fam")) return "solar:users-group-two-rounded-bold";
  return "solar:medal-bold";
};

const MembershipsSection = () => {
  const [page, setPage] = useState(1);
  const pageSize = 3; // 3 planes por página

  const { data, isLoading, isError } = usePublicMembership(page, pageSize);

  const products = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section id="membresia" className="py-24 bg-background relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-sport-AquaLight/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold bg-sport-AquaLight/10 text-sport-AquaLight border-none">
            Membresías
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Planes que se adaptan a ti
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Elige el plan perfecto para tus objetivos deportivos. Puedes activar o cambiar de plan en cualquier momento desde tu panel de usuario.
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
            <p className="font-semibold">Error al cargar las membresías. Por favor, inténtelo de nuevo más tarde.</p>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="solar:info-circle-bold" className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold">No se encontraron productos de membresía activos en este momento.</p>
          </div>
        )}

        {/* Grid de Membresías */}
        {!isLoading && !isError && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {products.map((product) => {
                // Obtenemos los planes asociados al producto
                const plans = product.membership_plans || [];
                const firstPlan = plans[0]; // Plan por defecto a mostrar en grande
                
                return (
                  <div
                    key={product.id}
                    className="relative rounded-3xl border border-border bg-card/80 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Destacar si es de tipo Premium/Crown */}
                    {product.name.toLowerCase().includes("premium") && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg bg-sport-AquaLight">
                          Más Popular
                        </span>
                      </div>
                    )}

                    <div className="p-7 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Icono + Nombre */}
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-sport-AquaLight/10 flex items-center justify-center">
                            <Icon icon={getProductIcon(product.name)} className="w-5 h-5 text-sport-AquaLight" />
                          </div>
                          <h3 className="text-xl font-bold">{product.name}</h3>
                        </div>

                        {/* Descripción */}
                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Precios (Listar planes activos del producto) */}
                        <div className="mb-6 pb-6 border-b border-border/80">
                          {plans.length > 0 ? (
                            <div className="space-y-2">
                              {plans.map((plan) => (
                                <div key={plan.id} className="flex justify-between items-center bg-muted/30 p-2.5 rounded-xl border border-border/40 hover:border-sport-AquaLight/25 transition-colors">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {plan.name || `Plan ${getDurationLabel(plan.duration)}`}
                                  </span>
                                  <span className="text-sm font-black text-foreground">
                                    ${plan.price} <span className="text-[10px] text-muted-foreground font-normal">/{getDurationLabel(plan.duration)}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Planes no definidos</span>
                          )}
                        </div>

                        {/* Características */}
                        {product.features && product.features.length > 0 && (
                          <ul className="space-y-3 mb-7">
                            {product.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs">
                                <CheckCircle2 className="h-4 w-4 text-sport-AquaLight shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Link to="/auth/login" className="mt-auto">
                        <Button
                          className="w-full rounded-full font-semibold transition-all bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white shadow-lg"
                          size="lg"
                        >
                          Adquirir Plan
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
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

        <p className="text-center text-sm text-muted-foreground mt-8">
          ¿Tienes dudas sobre qué plan elegir?{" "}
          <a href="#contact" className="text-sport-AquaLight hover:underline font-medium">
            Contáctanos
          </a>{" "}
          y te asesoramos.
        </p>
      </div>
    </section>
  );
};

export default MembershipsSection;
