'use client';

import { useActionState, useCallback, useState, useTransition } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';

import { uploadAndProcessImportAction } from '../actions';
import type { ImportActionState } from '../form-state';

const initialState: ImportActionState = { status: 'idle' };

interface FileUpload {
  file: File | null;
  error?: string;
}

export function ImportUploadForm() {
  const [formState, formAction, isPending] = useActionState(
    uploadAndProcessImportAction,
    initialState,
  );
  const [isTransitionPending, startTransition] = useTransition();
  const [poUpload, setPOUpload] = useState<FileUpload>({ file: null });
  const [qsUpload, setQSUpload] = useState<FileUpload>({ file: null });

  const onPODrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      setPOUpload({
        file: null,
        error: 'Please upload a valid Excel file (.xlsx or .xls)',
      });
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setPOUpload({ file, error: undefined });
    }
  }, []);

  const onQSDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      setQSUpload({
        file: null,
        error: 'Please upload a valid Excel file (.xlsx or .xls)',
      });
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setQSUpload({ file, error: undefined });
    }
  }, []);

  const {
    getRootProps: getPORootProps,
    getInputProps: getPOInputProps,
    isDragActive: isPODragActive,
  } = useDropzone({
    onDrop: onPODrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const {
    getRootProps: getQSRootProps,
    getInputProps: getQSInputProps,
    isDragActive: isQSDragActive,
  } = useDropzone({
    onDrop: onQSDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!poUpload.file || !qsUpload.file) {
      return;
    }

    // Create form data with files
    const formData = new FormData();
    formData.append('poFile', poUpload.file);
    formData.append('qsFile', qsUpload.file);

    // Call the form action within a transition
    startTransition(() => {
      formAction(formData);
    });
  };

  const canSubmit = Boolean(poUpload.file && qsUpload.file && !isPending && !isTransitionPending);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Purchase Order File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Purchase Order File</label>
          <div
            {...getPORootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${
                isPODragActive
                  ? 'border-blue-500 bg-blue-50'
                  : poUpload.file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getPOInputProps()} />
            {poUpload.file ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-700">✓ {poUpload.file.name}</div>
                <div className="text-xs text-gray-500">{formatFileSize(poUpload.file.size)}</div>
                <div className="text-xs text-gray-500">Click or drag to replace</div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {isPODragActive
                    ? 'Drop the PO file here...'
                    : 'Drag & drop PO file here, or click to select'}
                </div>
                <div className="text-xs text-gray-500">
                  Supports .xlsx and .xls files (max 50MB)
                </div>
              </div>
            )}
          </div>
          {(poUpload.error || formState.fieldErrors?.poFile) && (
            <div className="text-sm text-red-600">
              {poUpload.error || formState.fieldErrors?.poFile}
            </div>
          )}
        </div>

        {/* Quantity Survey File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quantity Survey File</label>
          <div
            {...getQSRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${
                isQSDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : qsUpload.file
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getQSInputProps()} />
            {qsUpload.file ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-green-700">✓ {qsUpload.file.name}</div>
                <div className="text-xs text-gray-500">{formatFileSize(qsUpload.file.size)}</div>
                <div className="text-xs text-gray-500">Click or drag to replace</div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {isQSDragActive
                    ? 'Drop the QS file here...'
                    : 'Drag & drop QS file here, or click to select'}
                </div>
                <div className="text-xs text-gray-500">
                  Supports .xlsx and .xls files (max 50MB)
                </div>
              </div>
            )}
          </div>
          {(qsUpload.error || formState.fieldErrors?.qsFile) && (
            <div className="text-sm text-red-600">
              {qsUpload.error || formState.fieldErrors?.qsFile}
            </div>
          )}
        </div>
      </div>

      {/* Template Downloads */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Need templates?</h3>
        <div className="flex gap-4 text-sm">
          <button className="text-blue-600 hover:text-blue-700 underline">
            Download PO Template
          </button>
          <button className="text-blue-600 hover:text-blue-700 underline">
            Download QS Template
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {formState.status === 'error' && formState.message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700">{formState.message}</div>
        </div>
      )}

      {formState.status === 'success' && formState.message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700">{formState.message}</div>
        </div>
      )}

      {/* Submit Button */}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors
            ${
              canSubmit
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isPending || isTransitionPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Import...
            </div>
          ) : (
            'Process Import'
          )}
        </button>
      </form>

      {canSubmit && (
        <div className="text-sm text-gray-600 text-center">
          Both files are required. Processing may take several minutes for large files.
        </div>
      )}
    </div>
  );
}
