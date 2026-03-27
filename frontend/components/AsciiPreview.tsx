type AsciiPreviewProps = {
  asciiArt: string;
};

export function AsciiPreview({ asciiArt }: AsciiPreviewProps) {
  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold">Preview ASCII</h2>
      <div className="max-h-[520px] overflow-auto rounded-lg bg-slate-950 p-4 text-[8px] leading-none text-slate-100 sm:text-[10px]">
        <pre>{asciiArt || "O resultado ASCII aparecerá aqui."}</pre>
      </div>
    </section>
  );
}
