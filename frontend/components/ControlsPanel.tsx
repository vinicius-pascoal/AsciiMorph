type ControlsPanelProps = {
  width: number;
  charset: string;
  invert: boolean;
  whatsappFormat: boolean;
  mode: "image" | "gif";
  onWidthChange: (value: number) => void;
  onCharsetChange: (value: string) => void;
  onInvertChange: (value: boolean) => void;
  onWhatsappFormatChange: (value: boolean) => void;
  onModeChange: (value: "image" | "gif") => void;
};

export function ControlsPanel({
  width,
  charset,
  invert,
  whatsappFormat,
  mode,
  onWidthChange,
  onCharsetChange,
  onInvertChange,
  onWhatsappFormatChange,
  onModeChange
}: ControlsPanelProps) {
  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold">Controles</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Modo</span>
          <select
            value={mode}
            onChange={(event) => onModeChange(event.target.value as "image" | "gif")}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="image">Imagem</option>
            <option value="gif">GIF</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Largura ({width})</span>
          <input
            type="range"
            min={20}
            max={300}
            value={width}
            onChange={(event) => onWidthChange(Number(event.target.value))}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-medium">Charset</span>
          <input
            value={charset}
            onChange={(event) => onCharsetChange(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="@%#*+=-:. "
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={invert}
            onChange={(event) => onInvertChange(event.target.checked)}
          />
          <span>Inverter intensidade dos caracteres</span>
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={whatsappFormat}
            onChange={(event) => onWhatsappFormatChange(event.target.checked)}
          />
          <span>Formatar saída para WhatsApp (bloco monoespaçado)</span>
        </label>
      </div>
    </section>
  );
}
