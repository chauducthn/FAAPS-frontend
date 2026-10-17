// src/hooks/mutations/useImportMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { importService } from '../../services/admin/import.service';
import type { ImportEntity, ImportPreview } from '../../types/import';
import { IMPORT_QUERY_KEYS } from '../queries/useImportQuery';

export const useImportMutations = () => {
  const qc = useQueryClient();

  const upload = useMutation({
    mutationFn: ({ entity, file }: { entity: ImportEntity; file: File }) =>
      importService.upload(entity, file),
  });

  const revalidate = useMutation({
    mutationFn: ({ jobId, edits }: { jobId: string; edits: ImportPreview }) =>
      importService.revalidatePreview(jobId, edits),
  });

  const confirm = useMutation({
    mutationFn: (jobId: string) => importService.confirm(jobId),
    onSuccess: (result) => {
      toast.success('Import confirmed', {
        description: `${result.inserted} inserted, ${result.skipped} skipped, ${result.failed} failed.`,
      });
      qc.invalidateQueries({ queryKey: IMPORT_QUERY_KEYS.all });
    },
  });

  const discard = useMutation({
    mutationFn: (jobId: string) => importService.discard(jobId),
    onSuccess: () => {
      toast.success('Import job discarded');
      qc.invalidateQueries({ queryKey: IMPORT_QUERY_KEYS.all });
    },
  });

  return {
    upload: upload.mutateAsync,
    isUploading: upload.isPending,
    revalidate: revalidate.mutateAsync,
    isRevalidating: revalidate.isPending,
    confirm: confirm.mutateAsync,
    isConfirming: confirm.isPending,
    discard: discard.mutateAsync,
    isDiscarding: discard.isPending,
  };
};