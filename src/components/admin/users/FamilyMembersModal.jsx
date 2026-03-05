
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useFamilyMembersByUser } from "@/hooks/admin/useAdminUsers";
import Loading from "@/components/global/Loading";
import { format } from "date-fns";

export function FamilyMembersModal({ userId, open, onOpenChange }) {
    const { data: members, isLoading } = useFamilyMembersByUser(userId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Familiares Registrados</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-4">
                        <Loading />
                    </div>
                ) : !members?.length ? (
                    <div className="text-center p-4 text-muted-foreground">
                        No hay familiares registrados para este usuario.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Fecha de Nacimiento</TableHead>
                                    <TableHead>Género</TableHead>
                                    <TableHead>Notas Médicas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">
                                            {member.first_name} {member.last_name}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(member.date_of_birth), "dd/MM/yyyy")}
                                        </TableCell>
                                        <TableCell>{member.gender}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={member.medical_notes}>
                                            {member.medical_notes || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
