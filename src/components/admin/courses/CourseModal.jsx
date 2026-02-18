import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdminFacilities } from "@/hooks/admin/useAdminFacilities";

export function CourseModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            description: "",
            category: "",
            image_url: "",
            image_file: null, // New field for file
            is_active: true,
        },
    });

    const { data: facilities } = useAdminFacilities();
    console.log("🚀 ~ CourseModal ~ facilities:", facilities)

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                description: initialData.description || "",
                category: initialData.category || "",
                image_url: initialData.image_url || "",
                is_active: initialData.is_active !== undefined ? initialData.is_active : true,
            });
        } else {
            reset({
                name: "",
                description: "",
                category: "",
                image_url: "",
                image_file: null,
                is_active: true,
            });
        }
    }, [initialData, reset, isOpen]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Curso</Label>
                        <Input
                            id="name"
                            {...register("name", { required: "El nombre es requerido" })}
                        />
                        {errors.name && (
                            <span className="text-xs text-destructive">{errors.name.message}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Descripción del curso..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Categoría</Label>
                            <Input
                                id="category"
                                {...register("category")}
                                placeholder="Ej: Natación, Tenis"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="is_active">Estado</Label>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={watch("is_active")}
                                    onCheckedChange={(checked) => setValue("is_active", checked)}
                                />
                                <Label htmlFor="is_active" className="font-normal cursor-pointer">
                                    {watch("is_active") ? "Activo" : "Inactivo"}
                                </Label>
                            </div>
                        </div>

                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">Imagen del Curso</Label>
                        <div className="flex flex-col gap-2">
                            {/* Input para URL manual (opcional, o podrías quitarlo si solo quieres file) */}
                            {/* <Input
                                id="image_url"
                                {...register("image_url")}
                                placeholder="https://..."
                            /> */}

                            {/* Input para archivo */}
                            <Input
                                id="image_file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setValue("image_file", file);
                                    }
                                }}
                            />
                            {/* Preview si existe URL (edición) */}
                            {initialData?.image_url && (
                                <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-1">Imagen actual:</p>
                                    <img src={initialData.image_url} alt="Course preview" className="h-20 w-auto object-cover rounded" />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialData ? "Guardar Cambios" : "Crear Curso"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
