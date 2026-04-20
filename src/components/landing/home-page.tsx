import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { styleTemplates } from "@/mock/catalog";
import { landingShowcaseImages, styleImageMap } from "@/mock/media";

const featureCards = [
  {
    title: "多风格测款，数据选优",
    copy: "同一件衣服，同时生成工作室、街拍、白底三种风格，哪个点击率高用哪个。",
    image: styleImageMap["studio-model-full"][0]
  },
  {
    title: "智能卖点拆解，转化率翻倍",
    copy: "自动识别面料与剪裁，生成“垂感”、“透气”等本地化卖点细节图，无需自己修图。",
    image: landingShowcaseImages.detailStory
  }
] as const;

const exampleCards = [
  {
    title: "Lazada 官方推荐风格",
    copy: "干净明亮的工作室背景，突出专业感，适合品牌旗舰店。",
    image: styleImageMap["studio-model-full"][0]
  },
  {
    title: "TikTok 爆款街拍风",
    copy: "真实生活场景，增强代入感，点击率通常高出 20%。",
    image: styleImageMap["street-model-full"][0]
  },
  {
    title: "Shopee 细节展示风",
    copy: "聚焦面料纹理与做工，减少售后纠纷，提升信任度。",
    image: styleImageMap["selling-point-secondary"][0]
  }
] as const;

const processSteps = [
  {
    id: "01",
    title: "上传原图",
    copy: "手机拍摄的白底图或平铺图均可。"
  },
  {
    id: "02",
    title: "选择目标市场",
    copy: "选择泰国、越南等站点，AI 自动匹配当地流行审美。"
  },
  {
    id: "03",
    title: "下载即用",
    copy: "一键下载全套主图与详情页素材，直接上传店铺。"
  }
] as const;

function HeroStyleShowcase() {
  const heroStyles = styleTemplates.slice(0, 4);

  return (
    <div className="panel h-full overflow-hidden p-4 lg:p-5">
      <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-accent-700">Style Preview</div>
            <div className="mt-2 text-xl font-semibold text-ink">先看四种风格，再决定要不要进工作台</div>
          </div>
          <div className="rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-xs text-accent-700">
            热门模板预览
          </div>
        </div>

        <div className="mt-5 grid flex-1 gap-4 sm:grid-cols-2">
          {heroStyles.map((style, index) => (
            <div
              key={style.id}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 p-3 transition hover:border-accent-200 hover:bg-white"
            >
              <div className="relative overflow-hidden rounded-[18px]">
                <Image
                  alt={style.name}
                  src={styleImageMap[style.id][0]}
                  width={960}
                  height={1200}
                  className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02] lg:h-52"
                />
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
                  0{index + 1}
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-ink">{style.name}</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">{style.scene}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-slate-200/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(15,156,141,0.10),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(242,184,75,0.10),transparent_22%),linear-gradient(180deg,#fbfcfd_0%,#eef4f6_100%)]" />
        <div className="container-shell relative py-6 sm:py-8">
          <header className="panel grid gap-4 px-5 py-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6">
            <Logo />
            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-600">
              <Link href="#features" className="transition hover:text-slate-900">
                功能介绍
              </Link>
              <Link href="#examples" className="transition hover:text-slate-900">
                爆款案例
              </Link>
              <Link href="#process" className="transition hover:text-slate-900">
                使用流程
              </Link>
              <Link href="/studio" className="transition hover:text-slate-900">
                工作台
              </Link>
            </nav>
            <div className="flex justify-start md:justify-end">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center rounded-full bg-accent-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-700"
              >
                立即免费生成
              </Link>
            </div>
          </header>

          <div className="grid gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-12 lg:py-16">
            <div className="flex flex-col justify-center">
              <div className="inline-flex rounded-full border border-accent-100 bg-accent-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-accent-700">
                SEA Visual Lab
              </div>
              <h1 className="mt-5 max-w-[12ch] text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[4.25rem] lg:leading-[0.95]">
                一键生成东南亚爆款主图，不懂当地审美也能轻松卖货！
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                上传一张商品图，AI 自动生成多套符合东南亚审美的专业主图、场景图和细节图。轻松测试不同风格，快速找到最能吸引买家点击的“爆款”模板，提升转化率！
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/studio"
                  className="rounded-full bg-accent-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-700"
                >
                  立即免费生成
                </Link>
                <Link
                  href="#examples"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
                >
                  查看爆款案例
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["看得懂", "先看风格差异，再决定要不要进入工作台"],
                  ["用得上", "上传、生成、筛选和下载都在同一页完成"],
                  ["更省时", "减少来回切页，把注意力留给选图"]
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-[22px] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur">
                    <div className="text-sm font-semibold text-ink">{title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{copy}</div>
                  </div>
                ))}
              </div>
            </div>

            <HeroStyleShowcase />
          </div>
        </div>
      </section>

      <section id="features" className="container-shell py-20">
        <div className="mb-10 max-w-3xl">
          <div className="text-sm uppercase tracking-[0.24em] text-accent-700">核心功能</div>
          <h2 className="section-title mt-3">告别盲目测图，一套工具搞定东南亚全平台视觉</h2>
          <p className="section-copy mt-4">
            不再猜测哪种图片好卖，我们为您预置了 Shopee/Lazada/TikTok 最火的视觉模板。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {featureCards.map((card) => (
            <div key={card.title} className="panel overflow-hidden p-5">
              <Image alt={card.title} src={card.image} width={1280} height={720} className="h-72 w-full rounded-[24px] object-cover" />
              <div className="px-1 pb-1 pt-5">
                <div className="text-2xl font-semibold text-ink">{card.title}</div>
                <div className="mt-3 text-sm leading-7 text-slate-600">{card.copy}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="examples" className="container-shell py-6 pb-20">
        <div className="mb-10 max-w-3xl">
          <div className="text-sm uppercase tracking-[0.24em] text-accent-700">场景示例</div>
          <h2 className="section-title mt-3">专为东南亚市场定制的热门风格模板</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {exampleCards.map((card, index) => (
            <div key={card.title} className="panel p-5">
              <Image alt={card.title} src={card.image} width={1280} height={900} className="h-60 w-full rounded-[22px] object-cover" />
              <div className="mt-5 flex items-center gap-2">
                <div className="rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-xs text-accent-700">
                  0{index + 1}
                </div>
              </div>
              <div className="mt-4 text-xl font-semibold text-ink">{card.title}</div>
              <div className="mt-3 text-sm leading-7 text-slate-600">{card.copy}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="process" className="bg-[#eef4f2] py-20">
        <div className="container-shell">
          <div className="mb-10 max-w-3xl">
            <div className="text-sm uppercase tracking-[0.24em] text-accent-700">使用流程</div>
            <h2 className="section-title mt-3">只需 3 步，1 分钟完成专业修图</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {processSteps.map((step) => (
              <div key={step.id} className="panel p-6">
                <div className="text-sm uppercase tracking-[0.24em] text-accent-700">{step.id}</div>
                <div className="mt-4 text-xl font-semibold text-ink">{step.title}</div>
                <div className="mt-3 text-sm leading-7 text-slate-600">{step.copy}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <div className="panel overflow-hidden bg-[linear-gradient(135deg,rgba(15,156,141,0.08),rgba(255,255,255,0.97)_55%,rgba(242,184,75,0.08))] px-6 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-accent-700">Ready For Trial</div>
              <div className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">准备好提升店铺销量了吗？</div>
              <div className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                新用户注册即送 10 次免费生成额度，无需绑定信用卡。
              </div>
            </div>
            <Link
              href="/studio"
              className="inline-flex items-center justify-center rounded-full bg-accent-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-accent-700"
            >
              立即开始免费试用
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
