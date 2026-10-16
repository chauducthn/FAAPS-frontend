import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { majorService } from '../../services/admin/major.service';
import { CreateMajorDto, UpdateMajorDto } from '../../types/major';
import { MAJOR_QUERY_KEYS } from '../queries/useMajorsQuery';

export const useMajorMutations = () => {
  const queryClient = useQueryClient();

  // Mutation Tạo mới Ngành
  const createMajorMutation = useMutation({
    mutationFn: (data: CreateMajorDto) => majorService.createMajor(data),
    onSuccess: (newMajor) => {
      toast.success('Major created successfully.', {
        description: `${newMajor.code} - ${newMajor.name} has been added.`,
      });
      // Invalidate cache để tự động load lại danh sách mới nhất
      queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all });
    },
  });

  // Mutation Cập nhật Ngành
  const updateMajorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMajorDto }) =>
      majorService.updateMajor(id, data),
    onSuccess: () => {
      toast.success('Major updated successfully.');
      queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all });
    },
  });

  // Mutation Xóa Ngành
  const deleteMajorMutation = useMutation({
    mutationFn: (id: string) => majorService.deleteMajor(id),
    onSuccess: () => {
      toast.success('Major deleted.');
      queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all });
    },
  });

  return {
    createMajor: createMajorMutation.mutate,
    isCreating: createMajorMutation.isPending,
    updateMajor: updateMajorMutation.mutate,
    isUpdating: updateMajorMutation.isPending,
    deleteMajor: deleteMajorMutation.mutate,
    isDeleting: deleteMajorMutation.isPending,
  };
};