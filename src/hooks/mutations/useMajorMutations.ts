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
      toast.success('Tạo ngành học mới thành công!', {
        description: `Ngành ${newMajor.code} - ${newMajor.name} đã được thêm vào hệ thống.`,
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
      toast.success('Cập nhật thông tin ngành thành công!');
      queryClient.invalidateQueries({ queryKey: MAJOR_QUERY_KEYS.all });
    },
  });

  // Mutation Xóa Ngành
  const deleteMajorMutation = useMutation({
    mutationFn: (id: string) => majorService.deleteMajor(id),
    onSuccess: () => {
      toast.success('Đã xóa ngành học!');
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