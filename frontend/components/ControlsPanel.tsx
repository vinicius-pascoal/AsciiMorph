import { useEffect, useState } from "react";

type ControlsPanelProps = {
  width: number;
  charset: string;
  invert: boolean;
  autoQuality: boolean;
  mosaicMode: boolean;
  mosaicBlocksX: number;
  mosaicBlocksY: number;
  mosaicCharsets: string;
  duotoneMode: boolean;
  duotoneThreshold: number;
  duotoneDarkCharset: string;
  duotoneLightCharset: string;
  layersMode: boolean;
  layersBackgroundCharset: string;
  layersSubjectCharset: string;
  layersTextCharset: string;
  layersTextEdgeThreshold: number;
  layersSubjectDeltaThreshold: number;
  typographyMode: boolean;
  typographyLetters: string;
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
  onDuotoneModeChange: (value: boolean) => void;
  onDuotoneThresholdChange: (value: number) => void;
  onDuotoneDarkCharsetChange: (value: string) => void;
  onDuotoneLightCharsetChange: (value: string) => void;
  onLayersModeChange: (value: boolean) => void;
  onLayersBackgroundCharsetChange: (value: string) => void;
  onLayersSubjectCharsetChange: (value: string) => void;
  onLayersTextCharsetChange: (value: string) => void;
  onLayersTextEdgeThresholdChange: (value: number) => void;
  onLayersSubjectDeltaThresholdChange: (value: number) => void;
  onTypographyModeChange: (value: boolean) => void;
  onTypographyLettersChange: (value: string) => void;
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

type AdvancedTab = "mosaic" | "duotone" | "layers";

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
  duotoneMode,
  duotoneThreshold,
  duotoneDarkCharset,
  duotoneLightCharset,
  layersMode,
  layersBackgroundCharset,
  layersSubjectCharset,
  layersTextCharset,
  layersTextEdgeThreshold,
  layersSubjectDeltaThreshold,
  typographyMode,
  typographyLetters,
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
  onDuotoneModeChange,
  onDuotoneThresholdChange,
  onDuotoneDarkCharsetChange,
  onDuotoneLightCharsetChange,
  onLayersModeChange,
  onLayersBackgroundCharsetChange,
  onLayersSubjectCharsetChange,
  onLayersTextCharsetChange,
  onLayersTextEdgeThresholdChange,
  onLayersSubjectDeltaThresholdChange,
  onTypographyModeChange,
  onTypographyLettersChange,
  onWhatsappFormatChange,
  onModeChange,
  onSaveCustomPreset,
  onDeleteCustomPreset
}: ControlsPanelProps) {
  const [presetName, setPresetName] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [activeAdvancedTab, setActiveAdvancedTab] = useState<AdvancedTab>("mosaic");

  useEffect(() => {
    if (mosaicMode) {
      setActiveAdvancedTab("mosaic");
      return;
    }
    if (duotoneMode) {
      setActiveAdvancedTab("duotone");
      return;
    }
    if (layersMode) {
      setActiveAdvancedTab("layers");
    }
  }, [mosaicMode, duotoneMode, layersMode]);

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

  const activeAdvancedMode = mosaicMode ? "Mosaico" : duotoneMode ? "Duotone" : layersMode ? "Layers" : "Nenhum";

  return (
    <section className="rounded-2xl bg-panel p-6 shadow-card">
      <h2 className="mb-4 text-lg font-semibold">Controles</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Modo: {mode === "gif" ? "GIF" : "Imagem"}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Avancado: {activeAdvancedMode}</span>
        {typographyMode ? <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Tipografico ativo</span> : null}
        {autoQuality ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Auto Quality</span> : null}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-ink">Base</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Modo</span>
              <select
                value={mode}
                onChange={(event) => onModeChange(event.target.value as "image" | "gif")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
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

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={autoQuality}
                onChange={(event) => onAutoQualityChange(event.target.checked)}
              />
              <span>Auto Quality (largura, charset e inversao automaticos)</span>
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
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-ink">Estilo</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
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
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
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

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-sm font-medium">Charset</span>
              <input
                value={charset}
                onChange={(event) => onCharsetChange(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                placeholder="@%#*+=-:. "
                disabled={autoQuality}
              />
            </label>

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={typographyMode}
                onChange={(event) => onTypographyModeChange(event.target.checked)}
              />
              <span>Modo tipografico (limitar saida a letras escolhidas)</span>
            </label>

            {typographyMode ? (
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium">Letras permitidas</span>
                <input
                  value={typographyLetters}
                  onChange={(event) => onTypographyLettersChange(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                  placeholder="VINI"
                />
                <span className="text-xs text-slate-500">Exemplo: VINI faz a arte usar apenas V, I e N.</span>
              </label>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-ink">Modos avancados</h3>
          <p className="mt-1 text-xs text-slate-500">Apenas um modo avancado pode ficar ativo por vez.</p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveAdvancedTab("mosaic")}
              className={`rounded-lg border px-2 py-2 text-xs font-medium ${activeAdvancedTab === "mosaic" ? "border-accent bg-white text-ink" : "border-slate-300 bg-slate-100 text-slate-600"}`}
            >
              Mosaico
            </button>
            <button
              type="button"
              onClick={() => setActiveAdvancedTab("duotone")}
              className={`rounded-lg border px-2 py-2 text-xs font-medium ${activeAdvancedTab === "duotone" ? "border-accent bg-white text-ink" : "border-slate-300 bg-slate-100 text-slate-600"}`}
            >
              Duotone
            </button>
            <button
              type="button"
              onClick={() => setActiveAdvancedTab("layers")}
              className={`rounded-lg border px-2 py-2 text-xs font-medium ${activeAdvancedTab === "layers" ? "border-accent bg-white text-ink" : "border-slate-300 bg-slate-100 text-slate-600"}`}
            >
              Layers
            </button>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            {activeAdvancedTab === "mosaic" ? (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={mosaicMode}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setActiveAdvancedTab("mosaic");
                      }
                      onMosaicModeChange(event.target.checked);
                    }}
                    disabled={duotoneMode || layersMode}
                  />
                  <span className="text-sm font-medium">Mosaico</span>
                </label>
                {mosaicMode ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
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
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                        placeholder="@%#*+=-:. | @#*:. | #@O=+|:. "
                      />
                      <span className="text-xs text-slate-500">Se vazio, o charset principal sera reaplicado em todos os blocos.</span>
                    </label>
                  </div>
                ) : null}
              </>
            ) : null}

            {activeAdvancedTab === "duotone" ? (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={duotoneMode}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setActiveAdvancedTab("duotone");
                      }
                      onDuotoneModeChange(event.target.checked);
                    }}
                    disabled={mosaicMode || layersMode}
                  />
                  <span className="text-sm font-medium">Duotone</span>
                </label>
                {duotoneMode ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-medium">Limiar duotone ({duotoneThreshold})</span>
                      <input
                        type="range"
                        min={1}
                        max={254}
                        value={duotoneThreshold}
                        onChange={(event) => onDuotoneThresholdChange(Number(event.target.value))}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Paleta escura</span>
                      <input
                        value={duotoneDarkCharset}
                        onChange={(event) => onDuotoneDarkCharsetChange(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                        placeholder="@#%WM8B$"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Paleta clara</span>
                      <input
                        value={duotoneLightCharset}
                        onChange={(event) => onDuotoneLightCharsetChange(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                        placeholder="+=-:. "
                      />
                    </label>
                  </div>
                ) : null}
              </>
            ) : null}

            {activeAdvancedTab === "layers" ? (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layersMode}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setActiveAdvancedTab("layers");
                      }
                      onLayersModeChange(event.target.checked);
                    }}
                    disabled={mosaicMode || duotoneMode}
                  />
                  <span className="text-sm font-medium">ASCII Layers</span>
                </label>
                {layersMode ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Charset do fundo</span>
                      <input
                        value={layersBackgroundCharset}
                        onChange={(event) => onLayersBackgroundCharsetChange(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                        placeholder=" .:-="
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Charset do sujeito</span>
                      <input
                        value={layersSubjectCharset}
                        onChange={(event) => onLayersSubjectCharsetChange(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                        placeholder="@#%WM8B$"
                      />
                    </label>

                    <label className="flex flex-col gap-2 md:col-span-2">
                      <span className="text-sm font-medium">Charset do texto</span>
                      <input
                        value={layersTextCharset}
                        onChange={(event) => onLayersTextCharsetChange(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
                        placeholder="/\\|()[]{}"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Sensibilidade de texto ({layersTextEdgeThreshold})</span>
                      <input
                        type="range"
                        min={1}
                        max={255}
                        value={layersTextEdgeThreshold}
                        onChange={(event) => onLayersTextEdgeThresholdChange(Number(event.target.value))}
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium">Separacao sujeito/fundo ({layersSubjectDeltaThreshold})</span>
                      <input
                        type="range"
                        min={1}
                        max={255}
                        value={layersSubjectDeltaThreshold}
                        onChange={(event) => onLayersSubjectDeltaThresholdChange(Number(event.target.value))}
                      />
                    </label>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-ink">Saida</h3>
          <div className="mt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={whatsappFormat}
                onChange={(event) => onWhatsappFormatChange(event.target.checked)}
              />
              <span>Formatar saida para WhatsApp (bloco monoespacado)</span>
            </label>
          </div>
        </div>
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
