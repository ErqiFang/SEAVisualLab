"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Logo } from "@/components/shared/logo";
import {
  mapDetailResponseToUi,
  mapMainResponseToUi,
  requestDetailGeneration,
  requestMainGeneration,
  requestRegenerateDetailGroup,
  requestRegenerateStyle
} from "@/lib/client/generation-api";
import { readFileAsDataUrl } from "@/lib/client/file-utils";
import { validateClientImage } from "@/lib/validators/generation";
import {
  aspectRatios,
  countries,
  defaultDetailForm,
  defaultMainForm,
  detailFocusOptions,
  detailSceneModes,
  outputTypes,
  platforms,
  styleTemplates
} from "@/mock/catalog";
import { landingShowcaseImages, styleImageMap } from "@/mock/media";
import {
  DetailCategory,
  DetailGenerationRequest,
  DetailGenerationResponse,
  DetailGeneratorInput,
  DetailResultGroup,
  DetailViewMode,
  GenerationStatus,
  ImageSource,
  MainGenerationRequest,
  MainGenerationResponse,
  MainGeneratorInput,
  MainVisualGroup,
  UploadedAsset
} from "@/types/generation";

type StudioTab = "main" | "detail";
type MainFilterMode = "全部" | "主图" | "辅图";

function classNames(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function triggerDownload(src: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = src;
  anchor.download = filename;
  anchor.target = "_blank";
  anchor.rel = "noreferrer";
  anchor.click();
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={classNames("panel", className)}>{children}</div>;
}

function FieldLabel({ label }: { label: string }) {
  return <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>;
}

function TextField(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      <FieldLabel label={label} />
      <input
        {...rest}
        className={classNames(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-100",
          className
        )}
      />
    </label>
  );
}

function TextAreaField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <label className="block">
      <FieldLabel label={label} />
      <textarea
        {...rest}
        className={classNames(
          "min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-100",
          className
        )}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionCard({
  title,
  subtitle,
  expanded,
  onToggle,
  children
}: {
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50">
        <div>
          <div className="text-sm font-semibold text-ink">{title}</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</div>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{expanded ? "收起" : "展开"}</div>
      </button>
      {expanded ? <div className="border-t border-slate-200 px-5 py-5">{children}</div> : null}
    </div>
  );
}

function UploadField({
  uploadedAsset,
  onUpload
}: {
  uploadedAsset?: UploadedAsset | null;
  onUpload: (asset: UploadedAsset | null, error?: string) => void;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">第一步：上传您的商品原图</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">图片越清晰，生成效果越好。</div>
        </div>
        <div className="rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-xs text-accent-700">JPG/PNG</div>
      </div>

      <label className="mt-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-slate-200 bg-white px-5 py-6 text-center transition hover:border-accent-400">
        <div className="rounded-full bg-accent-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-accent-700">Upload</div>
        <div className="mt-4 text-base font-semibold text-ink">📤 点击上传商品原图</div>
        <div className="mt-2 max-w-xs text-sm leading-6 text-slate-500">上传后会同步用于主图和细节图生成，方便对比不同展示方案。</div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const validationError = validateClientImage(file);
            if (validationError) {
              onUpload(null, validationError);
              return;
            }

            try {
              const base64 = await readFileAsDataUrl(file);
              onUpload({
                name: file.name,
                mimeType: file.type,
                size: file.size,
                base64,
                previewUrl: URL.createObjectURL(file),
                file
              });
            } catch (error) {
              onUpload(null, error instanceof Error ? error.message : "图片读取失败。");
            }
          }}
        />
      </label>

      {uploadedAsset ? (
        <div className="mt-4 flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-3">
          <Image alt={uploadedAsset.name} src={uploadedAsset.previewUrl} width={88} height={88} className="h-[88px] w-[88px] rounded-[18px] object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{uploadedAsset.name}</div>
            <div className="mt-1 text-xs text-slate-500">
              {(uploadedAsset.size / 1024 / 1024).toFixed(2)} MB · {uploadedAsset.mimeType}
            </div>
            <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">主图与细节图共用这一张商品图</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusBanner({
  warningMessage,
  sourceType,
  progressLabel,
  status
}: {
  warningMessage?: string;
  sourceType?: string;
  progressLabel?: string;
  status?: GenerationStatus;
}) {
  if (!warningMessage && !sourceType && !progressLabel) return null;

  const sourceLabel =
    sourceType === "mock-fallback" ? "静态兜底素材" : sourceType === "server-rendered" ? "服务端预览" : "真实生成结果";

  const tone =
    status === "partial_success" || sourceType === "mock-fallback" || sourceType === "server-rendered"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-accent-100 bg-accent-50 text-accent-900";

  return (
    <div className={classNames("mb-5 rounded-[22px] border px-5 py-4 text-sm", tone)}>
      {progressLabel ? <div className="font-medium">{progressLabel}</div> : null}
      {sourceType ? <div className="mt-1">结果来源：{sourceLabel}</div> : null}
      {warningMessage ? <div className="mt-1 leading-6">{warningMessage}</div> : null}
    </div>
  );
}

function EmptyPreview({ activeTab }: { activeTab: StudioTab }) {
  const title = "生成效果实时预览";
  const subtitle = "系统正在根据您的选择，智能合成高清晰度商品图。";
  const highlights =
    activeTab === "main"
      ? ["多风格对比", "平台导向", "主图 + 辅图"]
      : ["结构 / 材质 / 上身", "详情页可用", "支持重生成"];
  const previewImages =
    activeTab === "main"
      ? [styleImageMap["studio-model-full"][0], styleImageMap["street-model-full"][0], styleImageMap["flatlay-plus-model"][0]]
      : [landingShowcaseImages.detailStory, styleImageMap["model-half"][0], styleImageMap["selling-point-secondary"][1]];

  return (
    <Panel className="h-full overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_55%,#eef5f4_100%)] p-6">
      <div className="inline-flex rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-accent-700">
        SEA Visual Lab
      </div>
      <h3 className="mt-5 text-3xl font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {previewImages.map((image, index) => (
          <div key={index} className="overflow-hidden rounded-[24px] border border-white/80 bg-white p-3 shadow-soft">
            <Image alt={`preview-${index}`} src={image} width={960} height={1200} className="h-64 w-full rounded-[18px] object-cover" />
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[26px] border border-accent-100 bg-[linear-gradient(135deg,rgba(15,156,141,0.08),rgba(255,255,255,0.96)_55%,rgba(242,184,75,0.08))] px-6 py-6 text-ink">
        
        <div className="mt-3 text-2xl font-semibold">提示：生成过程通常需要 10-20 秒，请耐心等待。</div>
        <div className="mt-3 text-sm leading-7 text-slate-600">系统会自动完成上传、校验和结果回传，生成后可继续预览或下载。</div>
        <div className="mt-5 flex flex-wrap gap-2">
          {highlights.map((item) => (
            <span key={item} className="rounded-full border border-accent-100 bg-white px-3 py-2 text-xs text-slate-600 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
              {item}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function LoadingState({ title, copy, status }: { title: string; copy: string; status: GenerationStatus }) {
  const labelMap: Record<string, string> = {
    validating: "正在校验信息",
    uploading: "正在准备商品图",
    submitting: "正在提交任务",
    generating: "正在生成图片",
    loading: "正在处理任务"
  };

  return (
    <Panel className="h-full overflow-hidden p-6">
      <div className="mb-6">
        <div className="text-sm uppercase tracking-[0.24em] text-accent-700">Generating</div>
        <div className="mt-2 text-2xl font-semibold text-ink">{title}</div>
        <div className="mt-2 text-sm text-slate-600">{copy}</div>
        <div className="mt-3 inline-flex rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-xs text-accent-700">
          {labelMap[status] ?? labelMap.loading}
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white">
            <div className="h-60 animate-pulse bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-40 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ErrorState({ title, error, onReset }: { title: string; error: string | null; onReset: () => void }) {
  return (
    <Panel className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="rounded-full bg-rose-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-rose-700">生成失败</div>
      <div className="mt-5 text-2xl font-semibold text-ink">{title}</div>
      <div className="mt-3 max-w-lg text-sm leading-7 text-slate-600">{error}</div>
      <button onClick={onReset} className="mt-6 rounded-full bg-accent-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-700">返回继续编辑</button>
    </Panel>
  );
}

function ImageModal({
  asset,
  onClose
}: {
  asset: { src: ImageSource; title: string; caption: string } | null;
  onClose: () => void;
}) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
      <div className="max-w-5xl rounded-[30px] bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <Image alt={asset.title} src={asset.src} width={1280} height={1280} className="max-h-[75vh] w-full rounded-[24px] object-contain" />
        <div className="flex items-center justify-between gap-4 px-2 pb-2 pt-4">
          <div>
            <div className="text-lg font-semibold text-ink">{asset.title}</div>
            <div className="text-sm text-slate-500">{asset.caption}</div>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function MainResults({
  status,
  error,
  results,
  filterMode,
  styleFilter,
  warningMessage,
  sourceType,
  progressLabel,
  onFilterModeChange,
  onStyleFilterChange,
  onPreview,
  onRegenerateStyle,
  onResetError
}: {
  status: GenerationStatus;
  error: string | null;
  results: MainVisualGroup[];
  filterMode: MainFilterMode;
  styleFilter: string;
  warningMessage?: string;
  sourceType?: string;
  progressLabel?: string;
  onFilterModeChange: (mode: MainFilterMode) => void;
  onStyleFilterChange: (value: string) => void;
  onPreview: (asset: { src: ImageSource; title: string; caption: string }) => void;
  onRegenerateStyle: (styleId: string) => void;
  onResetError: () => void;
}) {
  if (status === "idle") return <EmptyPreview activeTab="main" />;
  if (["validating", "uploading", "submitting", "generating"].includes(status)) {
    return <LoadingState title="正在生成主图与场景图" copy="系统正在整理风格并准备结果回传。" status={status} />;
  }
  if (status === "error") return <ErrorState title="主图 / 场景图生成失败" error={error} onReset={onResetError} />;

  const filtered = results.filter((group) => styleFilter === "all" || group.styleId === styleFilter);
  const comparisonAssets = filtered.map((group) => {
    const asset =
      filterMode === "辅图" ? group.assets.find((item) => item.kind === "辅图") : group.assets.find((item) => item.kind === "主图") ?? group.assets[0];
    return asset ? { styleName: group.styleName, asset } : null;
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <StatusBanner warningMessage={warningMessage} sourceType={sourceType} progressLabel={progressLabel} status={status} />
      <div className="soft-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        <Panel className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-accent-700">生成效果预览</div>
              <div className="mt-2 text-2xl font-semibold text-ink">同一商品的多风格横向对比</div>
              <div className="mt-2 text-sm text-slate-600">先看风格，再下拉查看每组主图和辅图，方便快速筛选更适合上新的方案。</div>
            </div>
            <div className="flex flex-wrap gap-3">
              {(["全部", "主图", "辅图"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onFilterModeChange(mode)}
                  className={classNames("rounded-full px-4 py-2 text-sm transition", filterMode === mode ? "bg-accent-600 text-white" : "border border-slate-200 bg-white text-slate-600")}
                >
                  {mode}
                </button>
              ))}
              <select value={styleFilter} onChange={(event) => onStyleFilterChange(event.target.value)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 outline-none">
                <option value="all">全部风格</option>
                {results.map((item) => (
                  <option key={item.styleId} value={item.styleId}>
                    {item.styleName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="soft-scrollbar mt-6 overflow-x-auto">
            <div className="flex min-w-max gap-4 pb-2">
              {comparisonAssets.map((entry) =>
                entry ? (
                  <button
                    key={entry.styleName}
                    onClick={() => onPreview(entry.asset)}
                    className="w-[220px] rounded-[24px] border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-accent-200 hover:shadow-soft"
                  >
                    <Image alt={entry.styleName} src={entry.asset.src} width={960} height={1200} className="h-60 w-full rounded-[18px] object-cover" />
                    <div className="mt-3 text-sm font-semibold text-ink">{entry.styleName}</div>
                    <div className="mt-1 text-xs text-slate-500">{entry.asset.kind} 预览</div>
                  </button>
                ) : null
              )}
            </div>
          </div>
        </Panel>

        <div className="grid gap-5">
          {filtered.map((group) => (
            <Panel key={group.styleId} className="overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-2xl font-semibold text-ink">{group.styleName}</div>
                      {group.recommended ? <span className="rounded-full bg-gold px-3 py-1 text-xs font-medium text-slate-900">推荐风格</span> : null}
                    </div>
                    <div className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{group.description}</div>
                    <div className="mt-3 text-sm text-slate-500">适用场景：{group.sceneFit}</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const firstAsset = group.assets[0];
                        if (firstAsset && typeof firstAsset.src === "string") triggerDownload(firstAsset.src, `${group.styleName}-single`);
                      }}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                    >
                      下载单张
                    </button>
                    <button
                      onClick={() => {
                        group.assets.forEach((asset, index) => {
                          if (typeof asset.src === "string") triggerDownload(asset.src, `${group.styleName}-${index + 1}`);
                        });
                      }}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                    >
                      下载整组
                    </button>
                    <button onClick={() => onRegenerateStyle(group.styleId)} className="rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700">
                      重新生成
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-5 lg:grid-cols-3">
                {group.assets
                  .filter((asset) => filterMode === "全部" || asset.kind === filterMode)
                  .map((asset) => (
                    <div key={asset.id} className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                      <button onClick={() => onPreview(asset)} className="block w-full text-left">
                        <Image alt={asset.title} src={asset.src} width={960} height={1200} className="h-72 w-full rounded-[18px] object-cover" />
                      </button>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-ink">{asset.title}</div>
                          <div className="mt-1 text-xs text-slate-500">{asset.caption}</div>
                        </div>
                        <span className="rounded-full bg-white px-3 py-2 text-xs text-slate-600">{asset.kind}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailResults({
  status,
  error,
  results,
  categoryFilter,
  viewMode,
  warningMessage,
  sourceType,
  progressLabel,
  onCategoryFilterChange,
  onViewModeChange,
  onPreview,
  onRegenerateCategory,
  onResetError
}: {
  status: GenerationStatus;
  error: string | null;
  results: DetailResultGroup[];
  categoryFilter: "全部" | DetailCategory;
  viewMode: DetailViewMode;
  warningMessage?: string;
  sourceType?: string;
  progressLabel?: string;
  onCategoryFilterChange: (value: "全部" | DetailCategory) => void;
  onViewModeChange: (value: DetailViewMode) => void;
  onPreview: (asset: { src: ImageSource; title: string; caption: string }) => void;
  onRegenerateCategory: (value: DetailCategory) => void;
  onResetError: () => void;
}) {
  if (status === "idle") return <EmptyPreview activeTab="detail" />;
  if (["validating", "uploading", "submitting", "generating"].includes(status)) {
    return <LoadingState title="正在生成商品细节图" copy="服务端正在整理细节分组并回传结果。" status={status} />;
  }
  if (status === "error") return <ErrorState title="细节图生成失败" error={error} onReset={onResetError} />;

  const groups = results.filter((group) => categoryFilter === "全部" || group.category === categoryFilter);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <StatusBanner warningMessage={warningMessage} sourceType={sourceType} progressLabel={progressLabel} status={status} />
      <div className="soft-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        <Panel className="p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-accent-700">生成效果预览</div>
              <div className="mt-2 text-2xl font-semibold text-ink">细节分组浏览与筛选</div>
              <div className="mt-2 text-sm text-slate-600">支持按分类筛选、网格 / 列表切换，以及对单个细节分类重新生成。</div>
            </div>
            <div className="flex flex-wrap gap-3">
              {(["全部", "结构细节", "材质细节", "上身细节"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => onCategoryFilterChange(filter)}
                  className={classNames("rounded-full px-4 py-2 text-sm transition", categoryFilter === filter ? "bg-accent-600 text-white" : "border border-slate-200 bg-white text-slate-600")}
                >
                  {filter}
                </button>
              ))}
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  className={classNames("rounded-full px-4 py-2 text-sm transition", viewMode === mode ? "bg-accent-600 text-white" : "border border-slate-200 bg-white text-slate-600")}
                >
                  {mode === "grid" ? "网格视图" : "列表视图"}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        {groups.map((group) => (
          <Panel key={group.category} className="overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-2xl font-semibold text-ink">{group.category}</div>
                <div className="mt-2 text-sm leading-7 text-slate-600">{group.summary}</div>
              </div>
              <button onClick={() => onRegenerateCategory(group.category)} className="rounded-full bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700">
                重新生成该分类
              </button>
            </div>
            <div className={classNames("p-5", viewMode === "grid" ? "grid gap-4 lg:grid-cols-2" : "space-y-4")}>
              {group.assets.map((asset) => (
                <div
                  key={asset.id}
                  className={classNames("rounded-[24px] border border-slate-200 bg-slate-50 p-3", viewMode === "list" && "flex flex-col gap-4 sm:flex-row")}
                >
                  <button onClick={() => onPreview({ src: asset.src, title: asset.label, caption: asset.description })}>
                    <Image
                      alt={asset.label}
                      src={asset.src}
                      width={960}
                      height={1200}
                      className={classNames("rounded-[18px] object-cover", viewMode === "grid" ? "h-64 w-full" : "h-48 w-full sm:w-64")}
                    />
                  </button>
                  <div className="flex flex-1 flex-col justify-between gap-4 p-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold text-ink">{asset.label}</div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">{asset.sceneMode}</span>
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-600">{asset.description}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {asset.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          if (typeof asset.src === "string") triggerDownload(asset.src, asset.label);
                        }}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                      >
                        下载单张
                      </button>
                      <button
                        onClick={() => onRegenerateCategory(group.category)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300"
                      >
                        重新生成
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function LeftSidebar({ activeTab, setActiveTab }: { activeTab: StudioTab; setActiveTab: (tab: StudioTab) => void }) {
  const menuItems: Array<{ id: StudioTab; title: string; subtitle: string; badge: string }> = [
    { id: "main", title: "1. 主图/场景图生成", subtitle: "一键切换多种热门背景", badge: "A" },
    { id: "detail", title: "2. 卖点细节图生成", subtitle: "自动放大面料与做工细节", badge: "B" }
  ];

  return (
    <Panel className="flex h-full flex-col overflow-hidden border-slate-200/70 bg-white p-4">
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <Logo />
        <div className="mt-4 text-xs uppercase tracking-[0.22em] text-accent-700">功能导航</div>
        <div className="mt-2 text-sm leading-6 text-slate-600">选择您需要的图片类型。</div>
      </div>
      <div className="mt-4 grid gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={classNames(
              "w-full rounded-[22px] border px-4 py-4 text-left transition",
              activeTab === item.id
                ? "border-accent-200 bg-accent-50 shadow-[0_8px_24px_rgba(15,156,141,0.08)]"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={classNames(
                  "flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-semibold",
                  activeTab === item.id ? "border border-accent-100 bg-white text-accent-700" : "border border-slate-200 bg-slate-50 text-slate-500"
                )}
              >
                {item.badge}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">{item.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{item.subtitle}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
    </Panel>
  );
}

function MainEditor({
  mainForm,
  setMainForm,
  uploadedAsset,
  uploadError,
  setUploadedAsset,
  setUploadError,
  mainValidationError,
  isBusy,
  handleMainGenerate,
  resetMain
}: {
  mainForm: MainGeneratorInput;
  setMainForm: (value: MainGeneratorInput) => void;
  uploadedAsset: UploadedAsset | null;
  uploadError: string | null;
  setUploadedAsset: (value: UploadedAsset | null) => void;
  setUploadError: (value: string | null) => void;
  mainValidationError: string | null;
  isBusy: boolean;
  handleMainGenerate: () => void;
  resetMain: () => void;
}) {
  const [sections, setSections] = useState<Record<"upload" | "product" | "output" | "styles", boolean>>({
    upload: true,
    product: true,
    output: true,
    styles: true
  });
  const toggle = (key: "upload" | "product" | "output" | "styles") => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Panel className="flex h-full min-h-0 flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-accent-700">Module A</div>
          <div className="mt-2 text-2xl font-semibold text-ink">主图与场景风格选择</div>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">查看生成记录</div>
      </div>

      <div className="soft-scrollbar mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <SectionCard title="第一步：上传您的商品原图" subtitle="图片越清晰，生成效果越好。" expanded={sections.upload} onToggle={() => toggle("upload")}>
          <UploadField
            uploadedAsset={uploadedAsset}
            onUpload={(asset, error) => {
              setUploadError(error ?? null);
              if (asset) setUploadedAsset(asset);
            }}
          />
          {uploadError ? <div className="mt-3 text-sm text-rose-600">{uploadError}</div> : null}
        </SectionCard>

        <SectionCard title="商品信息" subtitle="填写商品名称、材质描述和适用场景" expanded={sections.product} onToggle={() => toggle("product")}>
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <TextField label="商品名称" placeholder="示例：雪纺碎花连衣裙" value={mainForm.name} onChange={(e) => setMainForm({ ...mainForm, name: e.target.value })} />
              <TextField label="商品类目" placeholder="示例：连衣裙" value={mainForm.category} onChange={(e) => setMainForm({ ...mainForm, category: e.target.value })} />
            </div>
            <TextAreaField label="商品描述" value={mainForm.description} onChange={(e) => setMainForm({ ...mainForm, description: e.target.value })} />
            <div className="grid gap-4 xl:grid-cols-2">
              <TextAreaField label="材质描述" placeholder="请输入面料手感、厚度、透气性等，如：面料轻薄透气，摸起来很顺滑..." value={mainForm.materialDescription} onChange={(e) => setMainForm({ ...mainForm, materialDescription: e.target.value })} />
              <TextField label="材质名称" placeholder="示例：雪纺 / 棉混纺" value={mainForm.material} onChange={(e) => setMainForm({ ...mainForm, material: e.target.value })} />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <TextField label="颜色信息" placeholder="示例：米白、雾粉、浅蓝" value={mainForm.colorInfo} onChange={(e) => setMainForm({ ...mainForm, colorInfo: e.target.value, color: e.target.value })} />
              <TextField label="风格关键词" placeholder="示例：通勤、轻熟、简约" value={mainForm.styleKeywords} onChange={(e) => setMainForm({ ...mainForm, styleKeywords: e.target.value })} />
            </div>
            <TextField label="适用场景" placeholder="示例：日常通勤、约会、出街" value={mainForm.scenario} onChange={(e) => setMainForm({ ...mainForm, scenario: e.target.value })} />
          </div>
        </SectionCard>

        <SectionCard title="输出设置" subtitle="选择平台、国家、比例、输出类型和生成数量" expanded={sections.output} onToggle={() => toggle("output")}>
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <SelectField label="平台" value={mainForm.platform} options={platforms} onChange={(value) => setMainForm({ ...mainForm, platform: value as MainGeneratorInput["platform"] })} />
              <SelectField label="国家" value={mainForm.country} options={countries} onChange={(value) => setMainForm({ ...mainForm, country: value as MainGeneratorInput["country"] })} />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <SelectField label="图片比例" value={mainForm.ratio} options={aspectRatios} onChange={(value) => setMainForm({ ...mainForm, ratio: value as MainGeneratorInput["ratio"] })} />
              <SelectField label="输出类型" value={mainForm.outputType} options={outputTypes} onChange={(value) => setMainForm({ ...mainForm, outputType: value as MainGeneratorInput["outputType"] })} />
            </div>
            <label className="block rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 text-sm font-medium text-slate-700">生成数量</div>
              <input
                type="range"
                min={1}
                max={4}
                value={mainForm.quantity}
                onChange={(e) => setMainForm({ ...mainForm, quantity: Number(e.target.value) })}
                className="w-full accent-accent-600"
              />
              <div className="mt-2 text-sm text-slate-500">当前：{mainForm.quantity} 张辅图参考</div>
            </label>
          </div>
        </SectionCard>

        <SectionCard title="第二步：选择想要的风格（可多选）" subtitle="多选模板决定最终主图 / 场景图的展示方式。" expanded={sections.styles} onToggle={() => toggle("styles")}>
          <div className="grid gap-3">
            {styleTemplates.map((style) => {
              const active = mainForm.styleTemplateIds.includes(style.id);
              return (
                <label
                  key={style.id}
                  className={classNames(
                    "block cursor-pointer rounded-[22px] border p-4 transition",
                    active ? "border-accent-200 bg-accent-50" : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(event) =>
                        setMainForm({
                          ...mainForm,
                          styleTemplateIds: event.target.checked
                            ? [...mainForm.styleTemplateIds, style.id]
                            : mainForm.styleTemplateIds.filter((id) => id !== style.id)
                        })
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-accent-600"
                    />
                    <div>
                      <div className="text-sm font-semibold text-ink">{style.name}</div>
                      <div className="mt-1 text-xs leading-6 text-slate-600">{style.description}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {style.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </SectionCard>

      </div>
      <div className="mt-5 border-t border-slate-200 pt-4">
        {mainValidationError ? <div className="mb-3 text-sm text-rose-600">{mainValidationError}</div> : null}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleMainGenerate}
            disabled={isBusy}
            className="rounded-full bg-accent-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-accent-300"
          >
            {isBusy ? "生成中..." : "🚀 立即生成图片"}
          </button>
          <button
            onClick={resetMain}
            disabled={isBusy}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            重新选择
          </button>
        </div>
      </div>
    </Panel>
  );
}

function DetailEditor({
  detailForm,
  setDetailForm,
  uploadedAsset,
  uploadError,
  setUploadedAsset,
  setUploadError,
  detailValidationError,
  isBusy,
  handleDetailGenerate,
  resetDetail
}: {
  detailForm: DetailGeneratorInput;
  setDetailForm: (value: DetailGeneratorInput) => void;
  uploadedAsset: UploadedAsset | null;
  uploadError: string | null;
  setUploadedAsset: (value: UploadedAsset | null) => void;
  setUploadError: (value: string | null) => void;
  detailValidationError: string | null;
  isBusy: boolean;
  handleDetailGenerate: () => void;
  resetDetail: () => void;
}) {
  const [sections, setSections] = useState<Record<"upload" | "product" | "focus", boolean>>({
    upload: true,
    product: true,
    focus: true
  });
  const toggle = (key: "upload" | "product" | "focus") => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <Panel className="flex h-full min-h-0 flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-accent-700">Module B</div>
          <div className="mt-2 text-2xl font-semibold text-ink">商品卖点与细节拆解</div>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">查看生成记录</div>
      </div>

      <div className="soft-scrollbar mt-5 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <SectionCard title="第一步：上传您的商品原图" subtitle="细节图与主图共用同一张商品图。" expanded={sections.upload} onToggle={() => toggle("upload")}>
          <UploadField
            uploadedAsset={uploadedAsset}
            onUpload={(asset, error) => {
              setUploadError(error ?? null);
              if (asset) setUploadedAsset(asset);
            }}
          />
          {uploadError ? <div className="mt-3 text-sm text-rose-600">{uploadError}</div> : null}
        </SectionCard>

        <SectionCard title="第一步：填写商品卖点信息" subtitle="填写商品、材质、工艺和版型描述。" expanded={sections.product} onToggle={() => toggle("product")}>
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <TextField label="商品名称" placeholder="示例：雪纺碎花连衣裙" value={detailForm.name} onChange={(e) => setDetailForm({ ...detailForm, name: e.target.value })} />
              <TextField label="商品类目" placeholder="示例：连衣裙" value={detailForm.category} onChange={(e) => setDetailForm({ ...detailForm, category: e.target.value })} />
            </div>
            <TextAreaField label="材质细节描述" placeholder="请输入面料手感、厚度、透气性等，如：面料轻薄透气，摸起来很顺滑..." value={detailForm.materialDetail} onChange={(e) => setDetailForm({ ...detailForm, materialDetail: e.target.value })} />
            <div className="grid gap-4 xl:grid-cols-2">
              <TextField label="面料关键词" placeholder="示例：透气、亲肤" value={detailForm.fabricKeywords} onChange={(e) => setDetailForm({ ...detailForm, fabricKeywords: e.target.value })} />
              <TextField label="工艺关键词" placeholder="示例：精细走线、防走光" value={detailForm.craftKeywords} onChange={(e) => setDetailForm({ ...detailForm, craftKeywords: e.target.value })} />
            </div>
            <TextAreaField label="版型描述" placeholder="示例：高腰显瘦、垂感修身、适合通勤" value={detailForm.silhouette} onChange={(e) => setDetailForm({ ...detailForm, silhouette: e.target.value })} />
          </div>
        </SectionCard>

        <SectionCard title="细节重点与展示方式" subtitle="勾选重点细节和希望返回的展示场景。" expanded={sections.focus} onToggle={() => toggle("focus")}>
          <div className="space-y-5">
            <div>
              <div className="mb-3 text-sm font-medium text-slate-700">希望重点展示的细节（多选）</div>
              <div className="flex flex-wrap gap-2">
                {detailFocusOptions.map((option) => {
                  const active = detailForm.focusPoints.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setDetailForm({
                          ...detailForm,
                          focusPoints: active ? detailForm.focusPoints.filter((item) => item !== option) : [...detailForm.focusPoints, option]
                        })
                      }
                      className={classNames("rounded-full px-4 py-2 text-sm transition", active ? "bg-accent-600 text-white" : "border border-slate-200 bg-white text-slate-600")}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-slate-700">细节展示场景（多选）</div>
              <div className="flex flex-wrap gap-2">
                {detailSceneModes.map((option) => {
                  const active = detailForm.displayScenes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setDetailForm({
                          ...detailForm,
                          displayScenes: active ? detailForm.displayScenes.filter((item) => item !== option) : [...detailForm.displayScenes, option]
                        })
                      }
                      className={classNames("rounded-full px-4 py-2 text-sm transition", active ? "bg-accent-600 text-white" : "border border-slate-200 bg-white text-slate-600")}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

      </div>
      <div className="mt-5 border-t border-slate-200 pt-4">
        {detailValidationError ? <div className="mb-3 text-sm text-rose-600">{detailValidationError}</div> : null}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDetailGenerate}
            disabled={isBusy}
            className="rounded-full bg-accent-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-accent-300"
          >
            {isBusy ? "生成中..." : "🚀 生成细节大图"}
          </button>
          <button
            onClick={resetDetail}
            disabled={isBusy}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            重新选择
          </button>
        </div>
      </div>
    </Panel>
  );
}

export function StudioShell() {
  const [activeTab, setActiveTab] = useState<StudioTab>("main");
  const [uploadedAsset, setUploadedAsset] = useState<UploadedAsset | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mainForm, setMainForm] = useState<MainGeneratorInput>(defaultMainForm);
  const [detailForm, setDetailForm] = useState<DetailGeneratorInput>(defaultDetailForm);
  const [mainStatus, setMainStatus] = useState<GenerationStatus>("idle");
  const [detailStatus, setDetailStatus] = useState<GenerationStatus>("idle");
  const [mainError, setMainError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [mainResults, setMainResults] = useState<MainVisualGroup[]>([]);
  const [detailResults, setDetailResults] = useState<DetailResultGroup[]>([]);
  const [assetPreview, setAssetPreview] = useState<{ src: ImageSource; title: string; caption: string } | null>(null);
  const [mainFilterMode, setMainFilterMode] = useState<MainFilterMode>("全部");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [detailCategoryFilter, setDetailCategoryFilter] = useState<"全部" | DetailCategory>("全部");
  const [detailViewMode, setDetailViewMode] = useState<DetailViewMode>("grid");
  const [mainMeta, setMainMeta] = useState<Partial<Pick<MainGenerationResponse, "warningMessage" | "sourceType" | "progressLabel">> | null>(null);
  const [detailMeta, setDetailMeta] = useState<Partial<Pick<DetailGenerationResponse, "warningMessage" | "sourceType" | "progressLabel">> | null>(null);

  const mainBusy = ["validating", "uploading", "submitting", "generating"].includes(mainStatus);
  const detailBusy = ["validating", "uploading", "submitting", "generating"].includes(detailStatus);

  const mainValidationError = useMemo(() => {
    if (!uploadedAsset?.file) return "请先上传商品图，再开始生成。";
    if (!mainForm.name.trim()) return "请填写商品名称。";
    if (mainForm.styleTemplateIds.length === 0) return "请至少选择一个风格模板。";
    return null;
  }, [mainForm.name, mainForm.styleTemplateIds, uploadedAsset]);

  const detailValidationError = useMemo(() => {
    if (!uploadedAsset?.file) return "请先上传商品图，再开始生成。";
    if (!detailForm.name.trim()) return "请填写商品名称。";
    if (detailForm.focusPoints.length === 0) return "请至少选择一个重点细节。";
    return null;
  }, [detailForm.focusPoints, detailForm.name, uploadedAsset]);

  async function handleMainGenerate(regenerateStyleId?: string) {
    if (mainValidationError || !uploadedAsset) {
      setMainError(mainValidationError ?? "请先上传商品图片。");
      setMainStatus("error");
      return;
    }

    setMainStatus("validating");
    setMainError(null);
    setMainMeta({ progressLabel: regenerateStyleId ? "正在重新生成指定风格..." : "正在创建主图 / 场景图生成任务..." });

    try {
      const body: Omit<MainGenerationRequest, "image"> = {
        form: mainForm,
        regenerateStyleId: regenerateStyleId ?? null
      };

      setMainStatus("uploading");
      setMainStatus("submitting");
      setMainStatus("generating");

      const response = regenerateStyleId ? await requestRegenerateStyle(body, uploadedAsset) : await requestMainGeneration(body, uploadedAsset);
      const mapped = mapMainResponseToUi(response);
      setMainResults(regenerateStyleId ? [...mainResults.filter((item) => item.styleId !== regenerateStyleId), ...mapped] : mapped);

      setMainMeta({
        warningMessage: response.warningMessage,
        sourceType: response.sourceType,
        progressLabel: response.progressLabel ?? `任务 ${response.taskId} 已完成`
      });
      setStyleFilter("all");
      setMainFilterMode("全部");
      setMainStatus(response.status);
    } catch (error) {
      setMainError(error instanceof Error ? error.message : "生成失败，请稍后重试。");
      setMainStatus("error");
    }
  }

  async function handleDetailGenerate(regenerateCategory?: DetailCategory) {
    if (detailValidationError || !uploadedAsset) {
      setDetailError(detailValidationError ?? "请先上传商品图片。");
      setDetailStatus("error");
      return;
    }

    setDetailStatus("validating");
    setDetailError(null);
    setDetailMeta({ progressLabel: regenerateCategory ? "正在重新生成指定细节分类..." : "正在创建细节图生成任务..." });

    try {
      const body: Omit<DetailGenerationRequest, "image"> = {
        form: detailForm,
        regenerateCategory: regenerateCategory ?? null
      };

      setDetailStatus("uploading");
      setDetailStatus("submitting");
      setDetailStatus("generating");

      const response = regenerateCategory ? await requestRegenerateDetailGroup(body, uploadedAsset) : await requestDetailGeneration(body, uploadedAsset);
      const mapped = mapDetailResponseToUi(response);
      setDetailResults(regenerateCategory ? [...detailResults.filter((item) => item.category !== regenerateCategory), ...mapped] : mapped);

      setDetailMeta({
        warningMessage: response.warningMessage,
        sourceType: response.sourceType,
        progressLabel: response.progressLabel ?? `任务 ${response.taskId} 已完成`
      });
      setDetailCategoryFilter("全部");
      setDetailViewMode("grid");
      setDetailStatus(response.status);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "生成失败，请稍后重试。");
      setDetailStatus("error");
    }
  }

  const detailAssetsCount = detailResults.reduce((total, group) => total + group.assets.length, 0);
  const mainAssetsCount = mainResults.reduce((total, group) => total + group.assets.length, 0);

  return (
    <>
      <main className="min-h-screen">
        <section className="mx-auto w-full max-w-[1760px] px-4 py-5 sm:px-5 lg:px-6">
          <Panel className="mb-6 overflow-hidden border-slate-200/70 bg-white/88 px-0 py-0 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-200/70 bg-[linear-gradient(90deg,rgba(15,156,141,0.08),rgba(255,255,255,0.55)_35%,rgba(242,184,75,0.08))] px-6 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-700">
                      Studio Workspace
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      SEA Visual Lab
                    </div>
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2.15rem]">电商图片智能生成中心</h1>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                    一站式完成商品图上传、风格生成与素材下载，专为提升东南亚店铺点击率设计。
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                    返回首页
                  </Link>
                  <div className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">系统运行正常 · 高速生成模式</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-5 xl:grid-cols-[1.35fr_0.9fr_0.9fr_0.9fr]">
              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] xl:col-span-1">
                <div className="text-xs uppercase tracking-[0.24em] text-accent-700">当前任务进度</div>
                <div className="mt-3 text-lg font-semibold text-ink">请按照 1-2-3 步骤操作，快速产出您的商品图集。</div>
                <div className="mt-3 text-sm leading-7 text-slate-600">从左到右依次完成选择、生成和预览，流程更直观。</div>
              </div>
              {[
                ["主图 / 辅图素材", mainAssetsCount > 0 ? `${mainAssetsCount} 张` : "待生成"],
                ["细节图素材", detailAssetsCount > 0 ? `${detailAssetsCount} 张` : "待生成"],
                ["共享商品图", uploadedAsset ? "已上传" : "点击上传原图"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
                  <div className="mt-3 text-2xl font-semibold text-ink">{value}</div>
                  <div className="mt-2 text-sm text-slate-500">
                    {label === "共享商品图"
                      ? "支持 JPG/PNG，建议上传清晰的白底图或平铺图。"
                      : label === "主图 / 辅图素材"
                        ? "生成后的主图将在此处预览。"
                        : "生成后的细节图将在此处预览。"}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="flex flex-col gap-6 xl:h-[calc(100vh-286px)] xl:flex-row xl:items-stretch">
            <div className="xl:h-full xl:w-[260px] xl:flex-none">
              <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <section className="min-w-0 xl:h-full xl:w-[470px] xl:flex-none">
              {activeTab === "main" ? (
                <MainEditor
                  mainForm={mainForm}
                  setMainForm={setMainForm}
                  uploadedAsset={uploadedAsset}
                  uploadError={uploadError}
                  setUploadedAsset={setUploadedAsset}
                  setUploadError={setUploadError}
                  mainValidationError={mainValidationError}
                  isBusy={mainBusy}
                  handleMainGenerate={() => handleMainGenerate()}
                  resetMain={() => {
                    setMainForm(defaultMainForm);
                    setMainStatus("idle");
                    setMainError(null);
                  }}
                />
              ) : (
                <DetailEditor
                  detailForm={detailForm}
                  setDetailForm={setDetailForm}
                  uploadedAsset={uploadedAsset}
                  uploadError={uploadError}
                  setUploadedAsset={setUploadedAsset}
                  setUploadError={setUploadError}
                  detailValidationError={detailValidationError}
                  isBusy={detailBusy}
                  handleDetailGenerate={() => handleDetailGenerate()}
                  resetDetail={() => {
                    setDetailForm(defaultDetailForm);
                    setDetailStatus("idle");
                    setDetailError(null);
                  }}
                />
              )}
            </section>

            <section className="min-w-0 xl:h-full xl:flex-1">
              {activeTab === "main" ? (
                <MainResults
                  status={mainStatus}
                  error={mainError}
                  results={mainResults}
                  filterMode={mainFilterMode}
                  styleFilter={styleFilter}
                  warningMessage={mainMeta?.warningMessage}
                  sourceType={mainMeta?.sourceType}
                  progressLabel={mainMeta?.progressLabel}
                  onFilterModeChange={setMainFilterMode}
                  onStyleFilterChange={setStyleFilter}
                  onPreview={setAssetPreview}
                  onRegenerateStyle={(styleId) => handleMainGenerate(styleId)}
                  onResetError={() => {
                    setMainStatus("idle");
                    setMainError(null);
                  }}
                />
              ) : (
                <DetailResults
                  status={detailStatus}
                  error={detailError}
                  results={detailResults}
                  categoryFilter={detailCategoryFilter}
                  viewMode={detailViewMode}
                  warningMessage={detailMeta?.warningMessage}
                  sourceType={detailMeta?.sourceType}
                  progressLabel={detailMeta?.progressLabel}
                  onCategoryFilterChange={setDetailCategoryFilter}
                  onViewModeChange={setDetailViewMode}
                  onPreview={setAssetPreview}
                  onRegenerateCategory={(category) => handleDetailGenerate(category)}
                  onResetError={() => {
                    setDetailStatus("idle");
                    setDetailError(null);
                  }}
                />
              )}
            </section>
          </div>
        </section>
      </main>
      <ImageModal asset={assetPreview} onClose={() => setAssetPreview(null)} />
    </>
  );
}
