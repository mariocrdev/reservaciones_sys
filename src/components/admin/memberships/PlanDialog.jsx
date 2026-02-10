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
import { Loader2, Plus, Trash, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useCreatePlan, useUpdatePlan } from "@/hooks/useMembership";
import { MembershipService } from "@/services/membership.service";

export function PlanDialog({ open, onOpenChange, planToEdit }) {
  const isEditing = !!planToEdit;
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();

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
      price: "",
      duration_days: 30,
      features: [],
      duration_days: 30,
      features: [],
      is_active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  useEffect(() => {
    if (planToEdit) {
      // Ensure features is mapped correctly to { value: string } for useFieldArray if needed,
      // but since it's a simple array of strings in DB, we need to handle it.
      // useFieldArray expects objects with id.
      // Let's assume the DB stores ["feature1", "feature2"].
      // We need to transform it to [{ value: "feature1" }, { value: "feature2" }]
      const features = Array.isArray(planToEdit.features)
        ? planToEdit.features.map((f) => ({ value: f }))
        : [];

      reset({
        ...planToEdit,
        features: features,
      });
    } else {
      reset({
        name: "",
        description: "",
        price: "",
        duration_days: 30,
        features: [],
        is_active: true,
      });
    }
  }, [planToEdit, open, reset]);

  const onSubmit = async (data) => {
    // Transform features back to array of strings
    const featuresArray = data.features.map((f) => f.value).filter(Boolean);

    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      duration_days: parseInt(data.duration_days),
      features: featuresArray,
    };

    try {
      if (isEditing) {
        await updatePlanMutation.mutateAsync({
          id: planToEdit.id,
          data: formattedData,
        });

        toast.success("Plan actualizado correctamente");
      } else {
        await createPlanMutation.mutateAsync(formattedData);
        toast.success("Plan creado correctamente");
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Plan" : "Crear Nuevo Plan"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Plan</Label>
              <Input
                id="name"
                {...register("name", { required: "El nombre es requerido" })}
              />
              {errors.name && (
                <span className="text-sm text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  {...register("price", {
                    required: "El precio es requerido",
                    min: 0,
                  })}
                />
              </div>
              {errors.price && (
                <span className="text-sm text-destructive">
                  {errors.price.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (días)</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration_days", {
                  required: "La duración es requerida",
                  min: 1,
                })}
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Plan Activo</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="resize-none"
              rows={3}
            />
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
              className="mt-2"
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
                createPlanMutation.isPending || updatePlanMutation.isPending
              }
            >
              {(createPlanMutation.isPending ||
                updatePlanMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Guardar Cambios" : "Crear Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
