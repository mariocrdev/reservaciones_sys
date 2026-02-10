import { useState } from "react";
import { usePlans, useDeletePlan, useUpdatePlan } from "@/hooks/useMembership";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash,
  CheckCircle2,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { PlanDialog } from "./PlanDialog";
import { PlanImageDialog } from "./PlanImageDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PlansManager() {
  const { data: plans, isLoading } = usePlans();
  const deletePlanMutation = useDeletePlan();
  const updatePlanMutation = useUpdatePlan();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [imagePlan, setImagePlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);

  const handleCreate = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const handleImageClick = (plan) => {
    setImagePlan(plan);
    setIsImageDialogOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (planToDelete) {
      await deletePlanMutation.mutateAsync(planToDelete.id);
      setPlanToDelete(null);
    }
  };

  const handleToggleActive = async (plan, isActive) => {
    try {
      await updatePlanMutation.mutateAsync({
        id: plan.id,
        data: { is_active: isActive },
      });
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Planes de Membresía
          </h2>
          <p className="text-muted-foreground">
            Administra los planes de suscripción disponibles.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Plan
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Duración (días)</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-25">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans?.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(plan)}
                    >
                      <AvatarImage
                        src={plan.image_url}
                        alt={plan.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{plan.name}</span>
                  </div>
                </TableCell>
                <TableCell>${plan.price}</TableCell>
                <TableCell>{plan.duration_days}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={(checked) =>
                        handleToggleActive(plan, checked)
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {plan.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEdit(plan)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setPlanToDelete(plan)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {plans?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No hay planes creados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PlanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        planToEdit={editingPlan}
      />

      <PlanImageDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        plan={imagePlan}
      />

      <AlertDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el plan "{planToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
