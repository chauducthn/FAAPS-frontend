import { useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { CreateMajorDto } from '../../../types/major';

interface CreateMajorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMajorDto) => void;
}

export default function CreateMajorModal({ isOpen, onClose, onSubmit }: CreateMajorModalProps) {
  const [formData, setFormData] = useState<CreateMajorDto>({
    code: '',
    name: '',
    description: '',
    totalCredits: 144,
    durationYears: 3.5,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ code: '', name: '', description: '', totalCredits: 144, durationYears: 3.5 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F26F21] flex items-center justify-center font-bold">
              <BookOpen className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Create New Major</h3>
              <p className="text-[11px] text-gray-400">Add a new major to the master data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Major Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: SE, IA, AI..."
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21] transition-all font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Total Credits <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.totalCredits}
                onChange={(e) => setFormData({ ...formData, totalCredits: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Major Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineering"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21] transition-all"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">
              Duration (Years) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.durationYears}
              onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21] transition-all"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe the major..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21] focus:ring-1 focus:ring-[#F26F21] transition-all resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Create Major
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}