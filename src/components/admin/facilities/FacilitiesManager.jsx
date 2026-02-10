import { useState } from "react";
import {
  useAdminFacilities,
  useAdminFacilityTypes,
  useDeleteFacility,
} from "@/hooks/admin/useAdminFacilities";
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
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/global/Loading";
import { toast } from "sonner";
import { FacilityDialog } from "./FacilityDialog";
import { FacilityImagesDialog } from "./FacilityImagesDialog";
import { FacilityHoursDialog } from "./FacilityHoursDialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";

export function FacilitiesManager() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: facilitiesData, isLoading } = useAdminFacilities(page, limit);
  const { data: types } = useAdminFacilityTypes();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedFacilityForImages, setSelectedFacilityForImages] =
    useState(null);

  const [isHoursDialogOpen, setIsHoursDialogOpen] = useState(false);
  const [selectedFacilityForHours, setSelectedFacilityForHours] =
    useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Instalaciones</h2>
        <Button
          onClick={() => {
            setEditingFacility(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva Instalación
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="rounded-md border">
          <ScrollArea
            className={"max-w-[85vw] overflow-auto whitespace-nowrap"}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Precio/Hr</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilitiesData?.facilities?.map((facility) => (
                  <TableRow key={facility.id}>
                    <TableCell>
                      <Avatar
                        className="rounded-md h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedFacilityForImages(facility);
                          setIsImageDialogOpen(true);
                        }}
                      >
                        <AvatarImage src={facility.image_urls?.[0]} />
                        <AvatarFallback>
                          <ImageIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {facility.name}
                    </TableCell>
                    <TableCell>
                      {facility.type_facilities?.name || "Sin tipo"}
                    </TableCell>
                    <TableCell>{facility.capacity}</TableCell>
                    <TableCell>${facility.price_per_hour}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${facility.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {facility.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFacilityForHours(facility);
                          setIsHoursDialogOpen(true);
                        }}
                        title="Gestionar Horarios"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingFacility(facility);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteFacilityButton id={facility.id} />
                    </TableCell>
                  </TableRow>
                ))}
                {!facilitiesData?.facilities?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No hay instalaciones registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Página {page} de{" "}
          {Math.ceil((facilitiesData?.count || 0) / limit) || 1}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((p) =>
                Math.ceil((facilitiesData?.count || 0) / limit) > p ? p + 1 : p,
              )
            }
            disabled={page >= Math.ceil((facilitiesData?.count || 0) / limit)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <FacilityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        facility={editingFacility}
        types={types || []}
      />

      <FacilityImagesDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        facility={selectedFacilityForImages}
      />

      <FacilityHoursDialog
        open={isHoursDialogOpen}
        onOpenChange={setIsHoursDialogOpen}
        facility={selectedFacilityForHours}
      />
    </div>
  );
}

function DeleteFacilityButton({ id }) {
  const deleteMutation = useDeleteFacility();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-destructive hover:text-destructive"
      onClick={() => {
        if (confirm("¿Estás seguro de eliminar esta instalación?")) {
          deleteMutation.mutate(id, {
            onSuccess: () => toast.success("Instalación eliminada"),
            onError: () => toast.error("Error al eliminar"),
          });
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
