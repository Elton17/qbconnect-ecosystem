import { useState, useCallback, ReactNode } from "react";
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

interface ConfirmDeleteState {
  open: boolean;
  onConfirm: () => void;
}

export function useConfirmDelete() {
  const [state, setState] = useState<ConfirmDeleteState>({ open: false, onConfirm: () => {} });

  const confirmDelete = useCallback((onConfirm: () => void) => {
    setState({ open: true, onConfirm });
  }, []);

  const dialog = (
    <AlertDialog open={state.open} onOpenChange={(open) => !open && setState({ open: false, onConfirm: () => {} })}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              state.onConfirm();
              setState({ open: false, onConfirm: () => {} });
            }}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirmDelete, ConfirmDialog: dialog };
}
