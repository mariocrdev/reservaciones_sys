import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    useCourseSlots,
    useCreateCourseSlot,
    useUpdateCourseSlot,
    useDeleteCourseSlot,
    useAdminCourse,
} from "@/hooks/admin/useAdminCourses";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Users, Clock } from "lucide-react";
import { SlotModal } from "../../../components/admin/courses/SlotModal";
import { ScheduleModal } from "../../../components/admin/courses/ScheduleModal";
import Loading from "@/components/global/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminCourseSlots() {
    const { id: courseId } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [selectedSlotForSchedule, setSelectedSlotForSchedule] = useState(null);

    const { data: course, isLoading: loadingCourse } = useAdminCourse(courseId);
    const { data: slots, isLoading: loadingSlots } = useCourseSlots(courseId);

    const createMutation = useCreateCourseSlot();
    const updateMutation = useUpdateCourseSlot();
    const deleteMutation = useDeleteCourseSlot();

    const handleCreate = async (data) => {
        try {
            await createMutation.mutateAsync({ ...data, course_id: courseId });
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (data) => {
        try {
            if (!editingSlot) return;
            await updateMutation.mutateAsync({ id: editingSlot.id, data: { ...data, course_id: courseId } });
            setIsModalOpen(false);
            setEditingSlot(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de que deseas eliminar este horario/cupo?")) {
            deleteMutation.mutate({ id, courseId });
        }
    };

    const openCreateModal = () => {
        setEditingSlot(null);
        setIsModalOpen(true);
    };

    const openEditModal = (slot) => {
        setEditingSlot(slot);
        setIsModalOpen(true);
    };

    if (loadingCourse || loadingSlots) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/courses">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Horarios: {course?.name}</h2>
                    <p className="text-muted-foreground">Gestiona las instancias y horarios de este curso.</p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={openCreateModal}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Horario
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Horarios Disponibles</CardTitle>
                    <CardDescription>Lista de horarios activos para este curso.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ciclo / Duración</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Lugar</TableHead>
                                <TableHead>Cupos</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {slots?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No hay horarios registrados para este curso.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                slots?.map((slot) => (
                                    <TableRow key={slot.id}>
                                        <TableCell className="text-xs">
                                            {slot.duration ? (
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    Periodo: {slot.duration}
                                                </span>
                                            ) : (
                                                <span>
                                                    {slot.start_date && format(new Date(slot.start_date), "dd MMM yyyy", { locale: es })}
                                                    {" - "}
                                                    <br />
                                                    {slot.end_date && format(new Date(slot.end_date), "dd MMM yyyy", { locale: es })}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {slot.profiles ? `${slot.profiles.first_name} ${slot.profiles.last_name}` : "Sin asignar"}
                                        </TableCell>
                                        <TableCell>
                                            {slot.facilities?.name || "Sin asignar"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                <span>{slot.current_enrolments} / {slot.max_capacity}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>${slot.price}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${slot.is_active
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                    }`}
                                            >
                                                {slot.is_active ? "Activo" : "Inactivo"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedSlotForSchedule(slot)}
                                                title="Gestionar Horario"
                                            >
                                                <Clock className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(slot)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(slot.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <SlotModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingSlot ? handleUpdate : handleCreate}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                initialData={editingSlot}
            />

            {selectedSlotForSchedule && (
                <ScheduleModal
                    isOpen={!!selectedSlotForSchedule}
                    onClose={() => setSelectedSlotForSchedule(null)}
                    slot={selectedSlotForSchedule}
                />
            )}
        </div>
    );
}
