import { useState } from "react";
import { Link } from "react-router-dom";
import {
    useAdminCourses,
    useCreateCourse,
    useUpdateCourse,
    useDeleteCourse,
} from "@/hooks/admin/useAdminCourses";
import { AdminCoursesService } from "@/services/admin/courses.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, MoreHorizontal, Pencil, Trash2, Calendar, Search, Loader2 } from "lucide-react";
import { CourseModal } from "../../../components/admin/courses/CourseModal";
import Loading from "@/components/global/Loading";

export default function AdminCourses() {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const { data, isLoading } = useAdminCourses({ page, pageSize, search });
    const createMutation = useCreateCourse();
    const updateMutation = useUpdateCourse();
    const deleteMutation = useDeleteCourse();

    const handleCreate = async (courseData) => {
        try {
            let imageUrl = courseData.image_url;
            if (courseData.image_file) {
                imageUrl = await AdminCoursesService.uploadCourseImage(courseData.image_file);
            }

            const dataToSave = {
                ...courseData,
                image_url: imageUrl,
            };
            delete dataToSave.image_file; // Remove file object before sending to DB
            delete dataToSave.facility_id; // Remove facility_id not in schema

            await createMutation.mutateAsync(dataToSave);
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (courseData) => {
        try {
            if (!editingCourse) return;

            let imageUrl = courseData.image_url;
            if (courseData.image_file) {
                imageUrl = await AdminCoursesService.uploadCourseImage(courseData.image_file);
            }

            const dataToSave = {
                ...courseData,
                image_url: imageUrl,
            };
            delete dataToSave.image_file;
            delete dataToSave.facility_id;

            await updateMutation.mutateAsync({ id: editingCourse.id, data: dataToSave });
            setIsModalOpen(false);
            setEditingCourse(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de que quieres eliminar este curso?")) {
            deleteMutation.mutate(id);
        }
    };

    const openCreateModal = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
    };

    if (isLoading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cursos</h2>
                    <p className="text-muted-foreground">
                        Gestiona los cursos disponibles y sus horarios.
                    </p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cursos..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Cursos</CardTitle>
                    <CardDescription>Aquí puedes ver y administrar todos los cursos creados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Imagen</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No se encontraron cursos.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data?.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell>
                                                <Avatar
                                                    className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => course.image_url && setPreviewImage(course.image_url)}
                                                >
                                                    <AvatarImage src={course.image_url} alt={course.name} />
                                                    <AvatarFallback>{course.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{course.name}</TableCell>
                                            <TableCell>{course.category || "-"}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${course.is_active
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                                        }`}
                                                >
                                                    {course.is_active ? "Activo" : "Inactivo"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditModal(course)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/admin/courses/${course.id}/slots`}>
                                                                <Calendar className="mr-2 h-4 w-4" /> Gestionar Horarios
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(course.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <CourseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingCourse ? handleUpdate : handleCreate}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                initialData={editingCourse}
            />

            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={previewImage}
                            alt="Course Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-md"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
