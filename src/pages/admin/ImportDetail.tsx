// src/pages/admin/ImportDetail.tsx
// New import wizard with 3 steps: Upload -> Preview -> Result.

import { useState } from 'react';
import {
  ImportUploadStep,
  ImportPreviewStep,
  ImportResultStep,
} from '../../components/admin/import';
import { useImportMutations } from '../../hooks/mutations/useImportMutations';
import { useImportPresetsQuery } from '../../hooks/queries/useImportQuery';
import type { ImportConfirmResult, ImportEntity, ImportPreview } from '../../types/import';
import { Modal } from '../../components/ui/Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ImportDetailModal({ open, onClose }: Props) {
  const presetsQuery = useImportPresetsQuery();
  const { upload, isUploading, confirm, isConfirming, revalidate } = useImportMutations();

  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'RESULT'>('UPLOAD');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportConfirmResult | null>(null);

  const reset = () => {
    setStep('UPLOAD');
    setPreview(null);
    setResult(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleUpload = async (entity: ImportEntity, file: File) => {
    const next = await upload({ entity, file });
    setPreview(next);
    setStep('PREVIEW');
  };

  const handlePreviewChange = async (next: ImportPreview) => {
    setPreview(next);
    if (preview) {
      const refreshed = await revalidate({ jobId: preview.summary.jobId, edits: next });
      setPreview(refreshed);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    const r = await confirm(preview.summary.jobId);
    setResult(r);
    setStep('RESULT');
  };

  return (
    <Modal open={open} onClose={close} title="Import Wizard" className="max-w-4xl">
      <div className="p-6">
        <Stepper step={step} />

        {step === 'UPLOAD' && (
          <ImportUploadStep
            presets={presetsQuery.data ?? []}
            isUploading={isUploading}
            onUpload={handleUpload}
          />
        )}
        {step === 'PREVIEW' && preview && (
          <ImportPreviewStep
            preview={preview}
            onChange={handlePreviewChange}
            onConfirm={handleConfirm}
            onBack={() => setStep('UPLOAD')}
            isConfirming={isConfirming}
          />
        )}
        {step === 'RESULT' && result && (
          <ImportResultStep result={result} onDone={close} />
        )}
      </div>
    </Modal>
  );
}

function Stepper({ step }: { step: 'UPLOAD' | 'PREVIEW' | 'RESULT' }) {
  const steps = ['UPLOAD', 'PREVIEW', 'RESULT'] as const;
  const idx = steps.indexOf(step);
  return (
    <ol className="flex items-center gap-2 text-xs font-bold uppercase mb-5 text-gray-500">
      {steps.map((s, i) => (
        <li
          key={s}
          className={`flex items-center gap-2 ${i === idx ? 'text-[#F26F21]' : ''}`}
        >
          <span
            className={`size-6 rounded-full grid place-items-center text-[10px] ${
              i <= idx ? 'bg-[#F26F21] text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1}
          </span>
          {s}
          {i < steps.length - 1 && <span className="text-gray-300">→</span>}
        </li>
      ))}
    </ol>
  );
}