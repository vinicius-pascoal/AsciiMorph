import { useState } from "react";

type ControlsPanelProps = {
  width: number;
  charset: string;
  invert: boolean;
  autoQuality: boolean;
  mosaicMode: boolean;
  mosaicBlocksX: number;
  mosaicBlocksY: number;
  mosaicCharsets: string;
  whatsappFormat: boolean;
  mode: "image" | "gif";
  customPresets: CustomStylePreset[];
  onWidthChange: (value: number) => void;
  onCharsetChange: (value: string) => void;
  onInvertChange: (value: boolean) => void;
  onAutoQualityChange: (value: boolean) => void;
  onMosaicModeChange: (value: boolean) => void;
  onMosaicBlocksXChange: (value: number) => void;
  onMosaicBlocksYChange: (value: number) => void;
  onMosaicCharsetsChange: (value: string) => void;
  onWhatsappFormatChange: (value: boolean) => void;
  onModeChange: (value: "image" | "gif") => void;
  onSaveCustomPreset: (name: string) => void;
  onDeleteCustomPreset: (id: string) => void;
};

export type CustomStylePreset = {
  id: string;
  name: string;
  charset: string;
  invert: boolean;
  whatsappFormat: boolean;
};

const STYLE_PRESETS = {
  terminal: {
    charset: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
    invert: false,
    whatsappFormat: false
  },
  bold: {
    charset: "@#%WM8B$&*+=-:. ",
    invert: false,
    whatsappFormat: false
  },
  minimal: {
    charset: "@#*:. ",
    invert: false,
    whatsappFormat: false
  },
  retro: {
    charset: "#@O=+|:. ",
    invert: false,
    whatsappFormat: false
  },
  whatsapp: {
    charset: "@%#*+=-:. ",
    invert: false,
    whatsappFormat: true
  }
} as const;

export function ControlsPanel({
  width,
  charset,
  invert,
  autoQuality,
  mosaicMode,
  mosaicBlocksX,
  mosaicBlocksY,
  mosaicCharsets,
  whatsappFormat,
  mode,
  customPresets,
  onWidthChange,
  onCharsetChange,
  onInvertChange,
  onAutoQualityChange,
  onMosaicModeChange,
  onMosaicBlocksXChange,
  onMosaicBlocksYChange,
  onMosaicCharsetsChange,
  onWhatsappFormatChange,
  onModeChange,
  onSaveCustomPreset,
  onDeleteCustomPreset
}: ControlsPanelProps) {
  const [presetName, setPresetName] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const selectedBasePreset = Object.entries(STYLE_PRESETS).find(([, preset]) => {
    return (
      preset.charset === charset &&
      preset.invert === invert &&
      preset.whatsappFormat === whatsappFormat
    );
  })?.[0];

  const selectedCustomPreset = customPresets.find((preset) => {
    return (
      preset.charset === charset &&
      preset.invert === invert &&
      preset.whatsappFormat === whatsappFormat
    );
  });

  const selectedPreset = selectedBasePreset
    ? selectedBasePreset
    : selectedCustomPreset
      ? `custom:${selectedCustomPreset.id}`
      : "custom";

  const selectedCustomPresetId = selectedPreset.startsWith("custom:")
    ? selectedPreset.replace("custom:", "")
    : null;

  function openSaveModal() {
    setPresetName("");
    setIsSaveModalOpen(true);
  }

  function closeSaveModal() {
    setIsSaveModalOpen(false);
    setPresetName("");
  }

  function handleSavePreset() {
    const trimmedName = presetName.trim();
    if (!trimmedName) {
      return;
    }
    onSaveCustomPreset(trimmedName);
    closeSaveModal();
  }

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
            disabled={autoQuality}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Preset de estilo</span>
          <select
            value={selectedPreset}
            onChange={(event) => {
              const key = event.target.value;
              if (key in STYLE_PRESETS) {
                const preset = STYLE_PRESETS[key as keyof typeof STYLE_PRESETS];
                onCharsetChange(preset.charset);
                onInvertChange(preset.invert);
                onWhatsappFormatChange(preset.whatsappFormat);
                return;
              }

              if (key.startsWith("custom:")) {
                const customId = key.replace("custom:", "");
                const preset = customPresets.find((item) => item.id === customId);
                if (!preset) {
                  return;
                }
                onCharsetChange(preset.charset);
                onInvertChange(preset.invert);
                onWhatsappFormatChange(preset.whatsappFormat);
              }
            }}
            className="rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="terminal">Terminal</option>
            <option value="bold">Bold</option>
            <option value="minimal">Minimal</option>
            <option value="retro">Retro</option>
            <option value="whatsapp">WhatsApp</option>
            {customPresets.length > 0
              ? customPresets.map((preset) => (
                <option key={preset.id} value={`custom:${preset.id}`}>
                  {preset.name}
                </option>
              ))
              : null}
            <option value="custom">Personalizado</option>
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Preset personalizado</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openSaveModal}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedCustomPresetId) {
                  onDeleteCustomPreset(selectedCustomPresetId);
                }
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedCustomPresetId}
            >
              Remover
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Charset</span>
          <input
            value={charset}
            onChange={(event) => onCharsetChange(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="@%#*+=-:. "
            disabled={autoQuality}
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={autoQuality}
            onChange={(event) => onAutoQualityChange(event.target.checked)}
          />
          <span>Auto Quality (largura, charset e inversão automáticos)</span>
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={invert}
            onChange={(event) => onInvertChange(event.target.checked)}
            disabled={autoQuality}
          />
          <span>Inverter intensidade dos caracteres</span>
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={mosaicMode}
            onChange={(event) => onMosaicModeChange(event.target.checked)}
          />
          <span>Modo mosaico (charsets diferentes por bloco)</span>
        </label>

        {mosaicMode ? (
          <>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Blocos no eixo X ({mosaicBlocksX})</span>
              <input
                type="range"
                min={1}
                max={8}
                value={mosaicBlocksX}
                onChange={(event) => onMosaicBlocksXChange(Number(event.target.value))}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Blocos no eixo Y ({mosaicBlocksY})</span>
              <input
                type="range"
                min={1}
                max={8}
                value={mosaicBlocksY}
                onChange={(event) => onMosaicBlocksYChange(Number(event.target.value))}
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-medium">Charsets do mosaico (separe com |)</span>
              <input
                value={mosaicCharsets}
                onChange={(event) => onMosaicCharsetsChange(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="@%#*+=-:. | @#*:. | #@O=+|:. "
              />
              <span className="text-xs text-slate-500">
                Se vazio, o charset principal sera reaplicado em todos os blocos.
              </span>
            </label>
          </>
        ) : null}

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={whatsappFormat}
            onChange={(event) => onWhatsappFormatChange(event.target.checked)}
          />
          <span>Formatar saída para WhatsApp (bloco monoespaçado)</span>
        </label>
      </div>

      {isSaveModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-card">
            <h3 className="text-lg font-semibold text-ink">Salvar preset personalizado</h3>
            <p className="mt-1 text-sm text-slate-600">
              Confira as configuracoes atuais e informe um nome para o preset.
            </p>

            <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Largura</span>
                <span className="font-medium text-ink">{width}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Charset</span>
                <span className="max-w-[65%] truncate font-mono text-xs text-ink">{charset || "(vazio)"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Inversao</span>
                <span className="font-medium text-ink">{invert ? "Ativa" : "Desativada"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Formato WhatsApp</span>
                <span className="font-medium text-ink">{whatsappFormat ? "Ativo" : "Desativado"}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-600">Auto Quality</span>
                <span className="font-medium text-ink">{autoQuality ? "Ativo" : "Desativado"}</span>
              </div>
            </div>

            <label className="mt-4 flex flex-col gap-2">
              <span className="text-sm font-medium">Nome do preset</span>
              <input
                autoFocus
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSavePreset();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeSaveModal();
                  }
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ex.: Meu preset"
                maxLength={32}
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeSaveModal}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePreset}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!presetName.trim()}
              >
                Confirmar e salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
