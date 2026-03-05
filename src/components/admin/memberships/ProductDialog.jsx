import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash, Upload, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateProduct, useUpdateProduct, useUploadImage } from "@/hooks/useMembership";
import { MembershipService } from "@/services/membership.service";

export function ProductDialog({ open, onOpenChange, productToEdit }) {
    const isEditing = !!productToEdit;
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const uploadImageMutation = useUploadImage();
    const [isUploading, setIsUploading] = useState(false);

    // UI state for image handling
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            description: "",
            features: [],
            active: true,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "features",
    });

    useEffect(() => {
        if (productToEdit) {
            const features = Array.isArray(productToEdit.features)
                ? productToEdit.features.map((f) => ({ value: f }))
                : [];

            reset({
                name: productToEdit.name,
                description: productToEdit.description || "",
                features: features,
                active: productToEdit.active,
            });
            setPreviewUrl(productToEdit.image_url);
            setSelectedFile(null);
        } else {
            reset({
                name: "",
                description: "",
                features: [],
                active: true,
            });
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    }, [productToEdit, open, reset]);

    // Handle file selection (local preview only)
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleRemoveImage = async () => {
        // If we have a selected file (unsaved), just clear it
        if (selectedFile) {
            setSelectedFile(null);
            setPreviewUrl(productToEdit?.image_url || null); // Revert to existing if any
            return;
        }

        // If we are editing an existing product with an image, delete it immediately
        if (isEditing && productToEdit.image_url) {
            if (confirm("¿Estás seguro de eliminar la imagen actual? Esta acción no se puede deshacer.")) {
                try {
                    await MembershipService.removeProductImage(productToEdit.id, productToEdit.image_url);
                    setPreviewUrl(null);
                    toast.success("Imagen eliminada correctamente");
                    // Optionally refresh parent list or update local state
                    // Ideally we should invalidate queries here or update local state to reflect deletion
                    // For now, we rely on the parent component refetching or user closing dialog
                } catch (error) {
                    console.error("Error removing image:", error);
                    toast.error("Error al eliminar la imagen");
                }
            }
        }
    };

    const onSubmit = async (data) => {
        setIsUploading(true);
        try {
            let finalImageUrl = previewUrl;

            // If a new file is selected, upload it now
            if (selectedFile) {
                finalImageUrl = await uploadImageMutation.mutateAsync(selectedFile);
            } else if (isEditing && !previewUrl) {
                // If editing and no preview (meaning it was deleted/cleared), ensure it's null
                finalImageUrl = null;
            } else if (isEditing && previewUrl === productToEdit.image_url) {
                // If editing and preview hasn't changed, keep existing
                finalImageUrl = productToEdit.image_url;
            }

            const featuresArray = data.features.map((f) => f.value).filter(Boolean);

            const formattedData = {
                name: data.name,
                description: data.description,
                features: featuresArray,
                active: data.active,
                image_url: finalImageUrl,
            };

            if (isEditing) {
                await updateProductMutation.mutateAsync({
                    id: productToEdit.id,
                    data: formattedData,
                });
                onOpenChange(false);
            } else {
                await createProductMutation.mutateAsync(formattedData);
                onOpenChange(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el producto");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Producto" : "Crear Nuevo Producto"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Producto</Label>
                                <Input
                                    id="name"
                                    {...register("name", { required: "El nombre es requerido" })}
                                    placeholder="Ej: Membresía Gold"
                                />
                                {errors.name && (
                                    <span className="text-sm text-destructive">
                                        {errors.name.message}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    className="resize-none"
                                    rows={3}
                                    placeholder="Descripción breve..."
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    id="active"
                                    checked={watch("active")}
                                    onCheckedChange={(checked) => setValue("active", checked)}
                                />
                                <Label htmlFor="active">Producto Activo</Label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Imagen del Producto</Label>
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-muted/30">
                                {previewUrl ? (
                                    <div className="relative w-full aspect-video rounded-md overflow-hidden group">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                                        <span className="text-sm mb-4">Sin imagen</span>
                                        <Label
                                            htmlFor="image-upload"
                                            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="mr-2 h-4 w-4" />
                                            )}
                                            Subir Imagen
                                        </Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                            disabled={isUploading}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Características</Label>
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <Input
                                    {...register(`features.${index}.value`)}
                                    placeholder="Ej: Acceso a piscina"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                >
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ value: "" })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Característica
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                createProductMutation.isPending || updateProductMutation.isPending || isUploading
                            }
                        >
                            {(createProductMutation.isPending ||
                                updateProductMutation.isPending) && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                            {isEditing ? "Guardar Cambios" : "Crear Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
