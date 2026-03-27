type UploadFormProps = {
  mode: "image" | "gif";
  file: File | null;
  isLoading: boolean;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
};

const ACCEPT_MAP: Record<"image" | "gif", string> = {
  image: ".png,.jpg,.jpeg,.webp",
  gif: ".gif"
};

export function UploadForm({ mode, file, isLoading, onFileChange, onSubmit }: UploadFormProps) {
  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold">Upload</h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="file"
          accept={ACCEPT_MAP[mode]}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!file || isLoading}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Convertendo..." : "Converter"}
        </button>
      </div>

      {file ? <p className="mt-3 text-sm text-slate-600">Arquivo: {file.name}</p> : null}
    </section>
  );
}
