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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePlan, useUpdatePlan } from "@/hooks/useMembership";

export function PlanDialog({ open, onOpenChange, planToEdit, productId }) {
  const isEditing = !!planToEdit;
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();

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
      price: "",
      duration_interval: "1 month",
      is_active: true,
    },
  });

  useEffect(() => {
    if (planToEdit) {
      reset({
        name: planToEdit.name || "",
        price: planToEdit.price,
        duration_interval: planToEdit.duration, // Assuming DB returns '1 month' etc or we need to parse it
        is_active: planToEdit.is_active,
      });
    } else {
      reset({
        name: "",
        price: "",
        duration_interval: "1 month",
        is_active: true,
      });
    }
  }, [planToEdit, open, reset]);

  const onSubmit = async (data) => {
    const formattedData = {
      product_id: productId,
      name: data.name,
      price: parseFloat(data.price),
      duration: data.duration_interval,
      is_active: data.is_active,
    };

    try {
      if (isEditing) {
        await updatePlanMutation.mutateAsync({
          id: planToEdit.id,
          data: formattedData,
        });
      } else {
        await createPlanMutation.mutateAsync(formattedData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Plan de Precios" : "Agregar Plan de Precios"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre (Opcional)</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Mensual, Anual"
              />
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
              <Label htmlFor="duration">Duración</Label>
              <select
                id="duration"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("duration_interval", { required: "La duración es requerida" })}
              >
                <option value="1 month">1 Mes</option>
                <option value="3 months">3 Meses</option>
                <option value="6 months">6 Meses</option>
                <option value="1 year">1 Año</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Plan Activo</Label>
            </div>
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
              {isEditing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
