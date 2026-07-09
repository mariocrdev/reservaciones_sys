import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicCourses } from "@/hooks/public/useCourses";

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const formatSchedule = (schedules) => {
  if (!schedules || schedules.length === 0) return "Horario por definir";
  // Agrupar por días y ordenar por día de la semana
  const sortedSchedules = [...schedules].sort((a, b) => a.day_of_week - b.day_of_week);
  const dayNames = sortedSchedules.map(s => DAYS[s.day_of_week]);
  const uniqueDays = [...new Set(dayNames)];
  
  const first = sortedSchedules[0];
  const timeStr = first ? `${first.start_time.slice(0, 5)} - ${first.end_time.slice(0, 5)}` : "";
  return `${uniqueDays.join(" / ")} ${timeStr ? `(${timeStr})` : ""}`;
};

const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'natación':
    case 'natacion':
      return "mingcute:swimming-fill";
    case 'tenis':
      return "cil:tennis";
    case 'padel':
    case 'pádel':
      return "material-symbols:padel";
    case 'gimnasio':
    case 'fitness':
      return "solar:dumbbell-large-bold";
    default:
      return "solar:bookmark-bold";
  }
};

const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'natación':
    case 'natacion':
      return "bg-cyan-500 text-white";
    case 'tenis':
      return "bg-orange-500 text-white";
    case 'padel':
    case 'pádel':
      return "bg-blue-500 text-white";
    default:
      return "bg-violet-500 text-white";
  }
};

const CoursesSection = () => {
  const [page, setPage] = useState(1);
  const pageSize = 4; // Mostramos 4 cursos por página en grid

  const { data, isLoading, isError } = usePublicCourses(page, pageSize);

  const courses = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section id="cursos" className="py-24 bg-muted/20 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-sport-blueOcean/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4 max-w-3xl mx-auto">
          <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold bg-sport-AquaLight/10 text-sport-AquaLight border-none">
            Cursos Deportivos
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Aprende con los mejores instructores
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Ofrecemos clases y programas diseñados para todas las edades y niveles. Cada grupo cuenta con cupos limitados para garantizar atención personalizada.
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
            <p className="font-semibold">Error al cargar los cursos. Por favor, inténtelo de nuevo más tarde.</p>
          </div>
        )}

        {!isLoading && !isError && courses.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon icon="solar:info-circle-bold" className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold">No se encontraron cursos activos en este momento.</p>
          </div>
        )}

        {/* Grid de Cursos */}
        {!isLoading && !isError && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {courses.map((course) => {
                // Tomamos el primer slot activo si existe
                const activeSlot = course.course_slots?.find(s => s.is_active) || course.course_slots?.[0];
                const instructor = activeSlot?.instructor;
                const schedule = activeSlot?.course_schedule;
                const facility = activeSlot?.facilities;

                return (
                  <Card key={course.id} className="group overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 p-0 rounded-3xl bg-card/60 border-border/80 flex flex-col md:flex-row h-full">
                    {/* Imagen del Curso */}
                    <div className="relative w-full md:w-2/5 aspect-4/3 md:aspect-auto md:min-h-[220px] overflow-hidden bg-muted">
                      <img
                        src={course.image_url || "/placeholder.svg"}
                        alt={course.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=300&width=300";
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`px-3 py-1 font-semibold rounded-full border-none shadow-md ${getCategoryColor(course.category)}`}>
                          <Icon icon={getCategoryIcon(course.category)} className="w-3.5 h-3.5 mr-1 inline" />
                          {course.category || "General"}
                        </Badge>
                      </div>
                    </div>

                    {/* Contenido */}
                    <CardContent className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-sport-AquaLight transition-colors">
                          {course.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                          {course.description}
                        </p>
                      </div>

                      {/* Detalles del Slot Activo */}
                      {activeSlot ? (
                        <div className="space-y-2 text-xs border-t border-border/50 pt-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Icon icon="solar:user-bold-duotone" className="w-4 h-4 text-sport-AquaLight" />
                            <span>
                              Prof. {instructor ? `${instructor.first_name} ${instructor.last_name}` : "Por asignar"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Icon icon="solar:clock-circle-bold" className="w-4 h-4 text-sport-AquaLight" />
                            <span className="line-clamp-1">{formatSchedule(schedule)}</span>
                          </div>
                          {facility && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Icon icon="solar:map-pin-bold-duotone" className="w-4 h-4 text-sport-AquaLight" />
                              <span>{facility.name}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4 text-sport-AquaLight" />
                              <span>
                                {activeSlot.current_enrolments >= activeSlot.max_capacity ? (
                                  <span className="text-destructive font-bold">Cupos Agotados</span>
                                ) : (
                                  `${activeSlot.max_capacity - activeSlot.current_enrolments} cupos disponibles`
                                )}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-foreground bg-sport-AquaLight/10 text-sport-AquaLight px-2.5 py-1 rounded-full">
                              ${activeSlot.price}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground italic border-t border-border/50 pt-3">
                          Próximamente nuevas fechas de inscripción.
                        </div>
                      )}
                    </CardContent>
                  </Card>
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

        {/* CTA Button */}
        <div className="mt-14 text-center">
          <Link to="/auth/login">
            <Button size="lg" className="rounded-full px-8 py-6 bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white shadow-xl hover:shadow-2xl hover:shadow-sport-AquaLight/20 transition-all hover:scale-105 group font-semibold">
              <Icon icon="solar:book-2-bold" className="mr-2 h-5 w-5" />
              Inscribirse en Cursos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
