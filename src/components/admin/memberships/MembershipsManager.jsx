import { useState } from "react";
import { useProducts, useDeleteProduct, useUpdateProduct, usePlans, useDeletePlan, useUpdatePlan } from "@/hooks/useMembership";
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
    ImageIcon,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { ProductDialog } from "./ProductDialog";
import { PlanDialog } from "./PlanDialog";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function PlansList({ productId }) {
    const { data: plans, isLoading } = usePlans(productId);
    const deletePlanMutation = useDeletePlan();
    const updatePlanMutation = useUpdatePlan();
    const [editingPlan, setEditingPlan] = useState(null);
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    const handleCreatePlan = () => {
        setEditingPlan(null);
        setIsPlanDialogOpen(true);
    };

    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
        setIsPlanDialogOpen(true);
    };

    const handleDeletePlan = async () => {
        if (planToDelete) {
            await deletePlanMutation.mutateAsync(planToDelete.id);
            setPlanToDelete(null);
        }
    };

    const handleTogglePlanActive = async (plan, isActive) => {
        try {
            await updatePlanMutation.mutateAsync({
                id: plan.id,
                data: { is_active: isActive },
            });
        } catch (error) {
            console.error("Error updating plan status", error);
        }
    };

    if (isLoading) return <div className="p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>;

    return (
        <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-muted-foreground">Planes de Precios</h4>
                <Button variant="outline" size="sm" onClick={handleCreatePlan}>
                    <Plus className="mr-2 h-3 w-3" />
                    Agregar Plan
                </Button>
            </div>

            {plans?.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No hay planes configurados para este producto.</p>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Duración</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans?.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium">{plan.name || "Estándar"}</TableCell>
                                    <TableCell>${plan.price}</TableCell>
                                    <TableCell>{plan.duration || "N/A"}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={plan.is_active}
                                            onCheckedChange={(checked) => handleTogglePlanActive(plan, checked)}
                                            className="scale-75"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setPlanToDelete(plan)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <PlanDialog
                open={isPlanDialogOpen}
                onOpenChange={setIsPlanDialogOpen}
                planToEdit={editingPlan}
                productId={productId}
            />

            <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el plan permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlan} className="bg-destructive text-destructive-foreground">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function MembershipsManager() {
    const { data: products, isLoading } = useProducts();
    const deleteProductMutation = useDeleteProduct();
    const updateProductMutation = useUpdateProduct();

    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [expandedProducts, setExpandedProducts] = useState({});

    const handleCreateProduct = () => {
        setEditingProduct(null);
        setIsProductDialogOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsProductDialogOpen(true);
    };

    const handleDeleteProduct = async () => {
        if (productToDelete) {
            await deleteProductMutation.mutateAsync(productToDelete.id);
            setProductToDelete(null);
        }
    };

    const handleToggleProductActive = async (product, isActive) => {
        try {
            await updateProductMutation.mutateAsync({
                id: product.id,
                data: { active: isActive },
            });
        } catch (error) {
            console.error("Error updating product status", error);
        }
    };

    const toggleExpand = (productId) => {
        setExpandedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
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
                        Membresías y Suscripciones
                    </h2>
                    <p className="text-muted-foreground">
                        Gestiona los productos de membresía y sus planes de precios.
                    </p>
                </div>
                <Button onClick={handleCreateProduct}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            <div className="grid gap-4">
                {products?.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                        <div className="flex items-start p-6 gap-6">
                            <Avatar className="h-20 w-20 rounded-lg">
                                <AvatarImage src={product.image_url} className="object-cover" />
                                <AvatarFallback className="rounded-lg">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg flex items-center gap-2">
                                            {product.name}
                                            {!product.active && <Badge variant="secondary">Inactivo</Badge>}
                                        </h3>
                                        <p className="text-muted-foreground text-sm">{product.description}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar Producto
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleProductActive(product, !product.active)}>
                                                {product.active ? "Desactivar" : "Activar"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setProductToDelete(product)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex gap-2 flex-wrap mt-2">
                                    {product.features?.map((feature, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {feature}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 px-6 py-2 border-t flex justify-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => toggleExpand(product.id)}
                            >
                                {expandedProducts[product.id] ? (
                                    <>Ocultar Planes <ChevronUp className="ml-2 h-3 w-3" /></>
                                ) : (
                                    <>Ver Planes de Precios <ChevronDown className="ml-2 h-3 w-3" /></>
                                )}
                            </Button>
                        </div>

                        {expandedProducts[product.id] && (
                            <div className="px-6 pb-6 border-t bg-muted/10 animate-in slide-in-from-top-2">
                                <PlansList productId={product.id} />
                            </div>
                        )}
                    </Card>
                ))}

                {products?.length === 0 && (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <h3 className="text-lg font-medium">No hay productos de membresía</h3>
                        <p className="text-muted-foreground mt-1">Crea uno nuevo para empezar a vender suscripciones.</p>
                    </div>
                )}
            </div>

            <ProductDialog
                open={isProductDialogOpen}
                onOpenChange={setIsProductDialogOpen}
                productToEdit={editingProduct}
            />

            <AlertDialog
                open={!!productToDelete}
                onOpenChange={(open) => !open && setProductToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el producto "{productToDelete?.name}" y TODOS sus planes asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
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
