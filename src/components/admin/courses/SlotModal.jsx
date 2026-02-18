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
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdminInstructors } from "@/hooks/admin/useAdminUsers";
import { useAdminFacilities } from "@/hooks/admin/useAdminFacilities";

export function SlotModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    initialData,
}) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            max_capacity: 10,
            price: 0,
            mode: "fixed", // 'fixed' or 'period' (UI only)
            start_date: "",
            end_date: "",
            duration_value: 1, // UI only
            duration_unit: "month", // UI only
            instructor_id: "",
            facility_id: "",
            is_active: true,
        },
    });

    const mode = watch("mode");

    // Fetch facilities for the dropdown
    const { data: facilities } = useAdminFacilities(1, 100);
    console.log("🚀 ~ SlotModal ~ facilities:", facilities)

    // Fetch instructors using the specific hook
    const { data: instructors } = useAdminInstructors();
    console.log("🚀 ~ SlotModal ~ instructors:", instructors)

    useEffect(() => {
        if (initialData) {
            // Determine mode based on data
            const isPeriod = !!initialData.duration;
            let durationVal = 1;
            let durationUnit = "month";

            if (isPeriod && initialData.duration) {
                // Try to parse basic postgres interval string if simple (e.g. "1 month", "30 days")
                // This is a naive parser for the UI state
                const parts = String(initialData.duration).split(" ");
                if (parts.length >= 2) {
                    durationVal = parts[0];
                    durationUnit = parts[1].replace(/s$/, ""); // remove plural 's'
                }
            }

            reset({
                max_capacity: initialData.max_capacity,
                price: initialData.price,
                mode: isPeriod ? "period" : "fixed",
                start_date: initialData.start_date || "",
                end_date: initialData.end_date || "",
                duration_value: durationVal,
                duration_unit: durationUnit,
                instructor_id: initialData.instructor_id,
                facility_id: initialData.facility_id,
                is_active:
                    initialData.is_active !== undefined ? initialData.is_active : true,
            });
        } else {
            reset({
                max_capacity: 10,
                price: 0,
                mode: "fixed",
                start_date: "",
                end_date: "",
                duration_value: 1,
                duration_unit: "month",
                instructor_id: "",
                facility_id: "",
                is_active: true,
            });
        }
    }, [initialData, reset, isOpen]);

    const handleFormSubmit = (data) => {
        const payload = {
            max_capacity: data.max_capacity,
            price: data.price,
            instructor_id: data.instructor_id || null,
            facility_id: data.facility_id || null,
            is_active: data.is_active,
        };

        if (data.mode === "fixed") {
            payload.start_date = data.start_date;
            payload.end_date = data.end_date;
            payload.duration = null;
        } else {
            payload.start_date = null;
            payload.end_date = null;
            payload.duration = `${data.duration_value} ${data.duration_unit}`;
        }

        onSubmit(payload);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Editar Horario/Cupo" : "Nuevo Horario/Cupo"}
                    </DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-4 py-4"
                >
                    {/* Modo de Curso Selector */}
                    <div className="flex flex-col gap-2">
                        <Label>Tipo de Programación</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="mode_fixed"
                                    value="fixed"
                                    {...register("mode")}
                                    className="cursor-pointer"
                                />
                                <Label
                                    htmlFor="mode_fixed"
                                    className="cursor-pointer font-normal"
                                >
                                    Ciclo Fijo (Fechas)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="mode_period"
                                    value="period"
                                    {...register("mode")}
                                    className="cursor-pointer"
                                />
                                <Label
                                    htmlFor="mode_period"
                                    className="cursor-pointer font-normal"
                                >
                                    Por Periodo (Duración)
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="max_capacity">Capacidad Máxima</Label>
                            <Input
                                id="max_capacity"
                                type="number"
                                {...register("max_capacity", { required: "Requerido", min: 1 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register("price", { required: "Requerido", min: 0 })}
                            />
                        </div>
                    </div>

                    {mode === "fixed" ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Fecha Inicio</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    {...register("start_date", {
                                        required: mode === "fixed" ? "Requerido" : false,
                                    })}
                                />
                                {errors.start_date && (
                                    <span className="text-xs text-destructive">
                                        {errors.start_date.message}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">Fecha Fin</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    {...register("end_date", {
                                        required: mode === "fixed" ? "Requerido" : false,
                                    })}
                                />
                                {errors.end_date && (
                                    <span className="text-xs text-destructive">
                                        {errors.end_date.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration_value">Duración</Label>
                                <Input
                                    id="duration_value"
                                    type="number"
                                    min="1"
                                    {...register("duration_value", {
                                        required: mode === "period",
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration_unit">Unidad</Label>
                                <Select
                                    onValueChange={(val) => setValue("duration_unit", val)}
                                    defaultValue={watch("duration_unit")}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day">Día(s)</SelectItem>
                                        <SelectItem value="week">Semana(s)</SelectItem>
                                        <SelectItem value="month">Mes(es)</SelectItem>
                                        <SelectItem value="year">Año(s)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="facility_id">Instalación (Lugar)</Label>
                        <Select
                            onValueChange={(val) => setValue("facility_id", val)}
                            defaultValue={initialData?.facility_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar ubicación..." />
                            </SelectTrigger>
                            <SelectContent>
                                {facilities?.facilities?.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructor_id">Instructor</Label>
                        <Select
                            onValueChange={(val) => setValue("instructor_id", val)}
                            defaultValue={initialData?.instructor_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar instructor..." />
                            </SelectTrigger>
                            <SelectContent>
                                {instructors?.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.first_name} {u.last_name} ({u.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {initialData ? "Guardar" : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
