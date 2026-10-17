// src/components/admin/import/ImportUploadStep.tsx
// Step 1: pick entity preset, drop/pick XLSX, send to BE.

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import type { ImportEntity, ImportPreset } from '../../../types/import';
import { IMPORT_ENTITIES } from '../../../validations/import.schema';

interface Props {
  presets: ImportPreset[];
  isUploading: boolean;
  onUpload: (entity: ImportEntity, file: File) => void;
}

export default function ImportUploadStep({ presets, isUploading, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [entity, setEntity] = useState<ImportEntity>('COURSES');
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);

  const submit = () => {
    if (file) onUpload(entity, file);
  };

  const selectedPreset = presets.find((p) => p.entity === entity);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-gray-700 uppercase mb-1 text-xs">
            Import target
          </label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as ImportEntity)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F26F21] text-xs"
          >
            {IMPORT_ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e.replace('_', ' ')}
              </option>
            ))}
          </select>
          {selectedPreset && (
            <p className="mt-2 text-[11px] text-gray-500">{selectedPreset.description}</p>
          )}
        </div>
        {selectedPreset && (
          <div>
            <label className="block font-bold text-gray-700 uppercase mb-1 text-xs">
              Expected columns
            </label>
            <ul className="text-[11px] text-gray-600 space-y-0.5">
              {selectedPreset.columns.map((c) => (
                <li key={c.key}>
                  <span className="font-bold text-gray-800">{c.label}</span>
                  {c.required && <span className="text-red-500"> *</span>}{' '}
                  <span className="text-gray-400">({c.example})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) setFile(dropped);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          drag ? 'border-[#F26F21] bg-orange-50/30' : 'border-gray-200'
        }`}
      >
        <Upload className="size-6 text-gray-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-gray-700">
          Drag &amp; drop your Excel file here
        </p>
        <p className="text-[11px] text-gray-500 mt-1">or</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex px-4 py-1.5 bg-white border border-gray-200 rounded-md text-gray-700 font-semibold text-xs hover:bg-gray-50"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <p className="mt-3 text-xs text-gray-700">
            Selected: <span className="font-bold">{file.name}</span> ·{' '}
            {(file.size / 1024).toFixed(1)} KB
          </p>
        )}
      </div>

      <div className="pt-3 flex justify-end border-t border-gray-100">
        <button
          disabled={!file || isUploading}
          onClick={submit}
          className="px-4 py-2 bg-[#F26F21] hover:bg-[#e05f14] text-white font-bold rounded-lg disabled:opacity-60"
        >
          {isUploading ? 'Parsing...' : 'Upload & Preview'}
        </button>
      </div>
    </div>
  );
}