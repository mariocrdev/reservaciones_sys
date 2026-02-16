import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    useFamilyMembers,
    useCreateFamilyMember,
    useUpdateFamilyMember,
    useDeleteFamilyMember
} from "@/hooks/useFamilyMembers";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Calendar, User, FileText, Loader2 } from "lucide-react";
import Loading from "@/components/global/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function FamilyMembers() {
    const { session } = useAuth();
    const { data: members, isLoading } = useFamilyMembers();
    const createMutation = useCreateFamilyMember();
    const updateMutation = useUpdateFamilyMember();
    const deleteMutation = useDeleteFamilyMember();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    const openAddDialog = () => {
        setEditingMember(null);
        reset({
            first_name: "",
            last_name: "",
            date_of_birth: "",
            gender: "",
            medical_notes: "",
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (member) => {
        setEditingMember(member);
        reset({
            first_name: member.first_name,
            last_name: member.last_name,
            date_of_birth: member.date_of_birth, // Assuming 'YYYY-MM-DD' format from DB
            gender: member.gender,
            medical_notes: member.medical_notes || "",
        });
        setIsDialogOpen(true);
    };

    const onSubmit = async (data) => {
        const memberData = {
            ...data,
            parent_id: session?.user?.id,
        };

        try {
            if (editingMember) {
                await updateMutation.mutateAsync({
                    id: editingMember.id,
                    data: memberData,
                });
            } else {
                await createMutation.mutateAsync(memberData);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de que quieres eliminar a este familiar?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <Loading />;

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mi Grupo Familiar</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra los perfiles de tus hijos y dependientes para inscripciones y reservas.
                    </p>
                </div>
                <Button onClick={openAddDialog} className="shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Familiar
                </Button>
            </div>

            {members?.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <User className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No hay familiares registrados</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm">
                            Agrega a tus hijos o dependientes para poder inscribirlos en cursos y gestionar sus actividades.
                        </p>
                        <Button variant="outline" onClick={openAddDialog}>
                            Agregar el primero
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {members?.map((member) => (
                        <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow group border-l-4 border-l-primary/50">
                            <CardHeader className="pb-3 bg-muted/10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {member.first_name[0]}{member.last_name[0]}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{member.first_name} {member.last_name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {member.date_of_birth ? format(new Date(member.date_of_birth), "d 'de' MMMM, yyyy", { locale: es }) : "Sin fecha"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs font-semibold uppercase">Género</span>
                                        <span>{member.gender === 'M' ? 'Masculino' : member.gender === 'F' ? 'Femenino' : 'Otro'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs font-semibold uppercase">Edad</span>
                                        <span>
                                            {member.date_of_birth
                                                ? new Date().getFullYear() - new Date(member.date_of_birth).getFullYear()
                                                : "?"} años
                                        </span>
                                    </div>
                                </div>

                                {member.medical_notes && (
                                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800 text-sm">
                                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold mb-1">
                                            <FileText className="h-3 w-3" /> Notas Médicas
                                        </div>
                                        <p className="text-muted-foreground line-clamp-2">{member.medical_notes}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-2 pb-4 px-4 bg-muted/5">
                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)} className="text-muted-foreground hover:text-primary">
                                    <Pencil className="h-4 w-4 mr-1" /> Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(member.id)}
                                    className="text-muted-foreground hover:text-destructive text-destructive/80"
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog for Add/Edit */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingMember ? "Editar Familiar" : "Agregar Nuevo Familiar"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Nombre</Label>
                                <Input
                                    id="first_name"
                                    {...register("first_name", { required: "El nombre es requerido" })}
                                />
                                {errors.first_name && <span className="text-xs text-destructive">{errors.first_name.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Apellido</Label>
                                <Input
                                    id="last_name"
                                    {...register("last_name", { required: "El apellido es requerido" })}
                                />
                                {errors.last_name && <span className="text-xs text-destructive">{errors.last_name.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    {...register("date_of_birth", { required: "La fecha es requerida" })}
                                />
                                {errors.date_of_birth && <span className="text-xs text-destructive">{errors.date_of_birth.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Género</Label>
                                <select
                                    id="gender"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register("gender", { required: "El género es requerido" })}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="Other">Otro</option>
                                </select>
                                {errors.gender && <span className="text-xs text-destructive">{errors.gender.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="medical_notes">Notas Médicas (Alergias, condiciones, etc.)</Label>
                            <Textarea
                                id="medical_notes"
                                placeholder="Escribe aquí cualquier información médica relevante..."
                                {...register("medical_notes")}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {(createMutation.isPending || updateMutation.isPending) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {editingMember ? "Guardar Cambios" : "Agregar Familiar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
