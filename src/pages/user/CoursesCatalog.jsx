import { useEffect, useState } from "react";
import { useCourses } from "@/hooks/useCourses";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  UserCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EnrolmentModal } from "@/components/user/enrolments/EnrolmentModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CoursesCatalog() {
  const { courses, loading, fetchCourses } = useCourses();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenModal = (course, slot) => {
    setSelectedCourse(course);
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const formatDay = (dayInt) => {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return days[dayInt];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        Cargando cursos disponibles...
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cursos Disponibles
          </h1>
          <p className="text-muted-foreground">
            Explora y únete a nuestras actividades.
          </p>
        </div>
        <div className="flex justify-center items-center h-64 border rounded-lg bg-card text-muted-foreground">
          No hay cursos activos disponibles en este momento.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Cursos Disponibles
        </h1>
        <p className="text-muted-foreground">
          Explora nuestras actividades e inscríbete a ti o a tu familia.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card
            key={course.id}
            className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="aspect-video relative overflow-hidden bg-muted">
              {course.image_url ? (
                <img
                  src={course.image_url}
                  alt={course.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/50">
                  <CalendarDays className="h-12 w-12 opacity-20" />
                </div>
              )}
              {course.category && (
                <Badge className="absolute top-3 right-3 shadow-sm bg-background/90 text-foreground hover:bg-background/90 backdrop-blur-sm">
                  {course.category}
                </Badge>
              )}
            </div>

            <CardHeader className=" flex-1">
              <CardTitle className="text-xl line-clamp-1">
                {course.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description || "Sin descripción disponible."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">
                  {course.course_slots?.length || 0}
                </span>
                <span className="ml-1">horarios disponibles</span>
              </div>
            </CardContent>

            <CardFooter className="pt-0 flex flex-col gap-3 items-stretch relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="default"
                    className="w-full justify-between shadow-sm"
                  >
                    Ver horarios y opciones
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-(--radix-popover-trigger-width) p-2 max-h-100 overflow-y-auto"
                  align="start" // o "center", "end" según prefieras
                  side="bottom"
                  sideOffset={8}
                >
                  <h4 className="font-semibold text-base mb-3 pb-2 border-b">
                    Horarios y Opciones
                  </h4>
                  <div className="space-y-2">
                    {course.course_slots?.length > 0 ? (
                      course.course_slots.map((slot) => {
                        const isFull =
                          slot.current_enrolments >= slot.max_capacity;

                        return (
                          <div
                            key={slot.id}
                            className="bg-background border rounded-lg p-3 text-sm space-y-3 shadow-sm relative"
                          >
                            <div className="flex flex-col  items-start gap-2">
                              <div className="flex items-center gap-4 justify-between w-full">
                                <span className="font-bold block text-base text-primary/90">
                                  {new Intl.NumberFormat("es-CR", {
                                    style: "currency",
                                    currency: "USD",
                                  }).format(slot.price)}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded-full mt-1 inline-block">
                                  Cupos: {slot.current_enrolments} /{" "}
                                  {slot.max_capacity}
                                </span>
                              </div>
                              <div className="w-full">
                                {isFull ? (
                                  <Badge
                                    variant="destructive"
                                    className="text-[10px] uppercase tracking-wider"
                                  >
                                    Lleno
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleOpenModal(course, slot)
                                    }
                                    className="h-8 w-full shadow-sm"
                                  >
                                    Inscribirse
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-2 border-t">
                              <div className="flex items-center text-muted-foreground">
                                <CalendarDays className="h-3.5 w-3.5 mr-2 shrink-0" />
                                <span className="text-xs">
                                  {slot.start_date
                                    ? `${format(new Date(slot.start_date), "MMM d", { locale: es })} - ${format(new Date(slot.end_date), "MMM d", { locale: es })}`
                                    : `Duración: ${slot.duration}`}
                                </span>
                              </div>

                              {slot.facilities && (
                                <div className="flex items-center text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 mr-2 shrink-0" />
                                  <span className="text-xs line-clamp-1">
                                    {slot.facilities.name}
                                  </span>
                                </div>
                              )}

                              {slot.instructor && (
                                <div className="flex items-center">
                                  <Avatar className="h-5 w-5 mr-2">
                                    <AvatarImage
                                      src={slot.instructor?.profile_image_url}
                                    />
                                    <AvatarFallback className="text-[10px]">
                                      {slot.instructor?.first_name?.charAt(
                                        0,
                                      ) || <UserCircle className="h-4 w-4" />}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-foreground">
                                    {slot.instructor.first_name}{" "}
                                    {slot.instructor.last_name}
                                  </span>
                                </div>
                              )}

                              <div className="mt-2 bg-muted/30 p-2 rounded text-xs space-y-1">
                                <div className="font-semibold mb-1 flex items-center text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 mr-1" />{" "}
                                  Horario:
                                </div>
                                {slot.course_schedule?.length > 0 ? (
                                  slot.course_schedule.map((schedule, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="capitalize font-medium">
                                        {formatDay(schedule.day_of_week)}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {formatTime(schedule.start_time)} -{" "}
                                        {formatTime(schedule.end_time)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground block text-center py-1">
                                    Sin horario definido
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-sm py-6 text-muted-foreground bg-background rounded-md border border-dashed">
                        No hay horarios publicados para este curso.
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </CardFooter>
          </Card>
        ))}
      </div>

      <EnrolmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slot={selectedSlot}
        course={selectedCourse}
      />
    </div>
  );
}
