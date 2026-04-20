import type { StaticImageData } from "next/image";
import collage1 from "@/image/拼图对比型/1.jpg";
import collage2 from "@/image/拼图对比型/2.jpg";
import collage3 from "@/image/拼图对比型/3.jpg";
import collageMultiColor from "@/image/拼图对比型/多色细节展示.png";
import studio1 from "@/image/真人工作室型/1.jpg";
import studio2 from "@/image/真人工作室型/2.jpg";
import studio4 from "@/image/真人工作室型/4.jpg";
import studioMain from "@/image/真人工作室型/模特全身图.jpg";
import halfBodyMain from "@/image/细节半身图/模特半身图.jpg";
import halfBody2 from "@/image/细节半身图/模特半身展示2.jpg";
import detail1 from "@/image/细节图/1.jpg";
import detail2 from "@/image/细节图/2.png";
import detail3 from "@/image/细节图/3.png";
import detail4 from "@/image/细节图/4.png";
import street1 from "@/image/街景生活型/1.jpg";
import streetMain from "@/image/街景生活型/模特全身街景图.png";

export const styleImageMap: Record<string, StaticImageData[]> = {
  "studio-model-full": [studioMain, studio1, studio2, studio4],
  "street-model-full": [streetMain, street1],
  "model-half": [halfBodyMain, halfBody2],
  "flatlay-plus-model": [collageMultiColor, collage1, collage2, collage3],
  "clean-white-bg": [studio2, studio1, studioMain],
  "collage-hero": [collage1, collage2, collage3],
  "lifestyle-secondary": [street1, streetMain, studio4],
  "selling-point-secondary": [collage3, detail2, detail4]
};

export const styleImageUrlMap: Record<string, string[]> = Object.fromEntries(
  Object.entries(styleImageMap).map(([key, value]) => [key, value.map((item) => item.src)])
);

export const landingShowcaseImages = {
  styleComparison: collageMultiColor,
  detailStory: detail2,
  heroSnapshot: [studioMain, streetMain, halfBodyMain, collageMultiColor]
};

export const detailImageMap = {
  structure: {
    front: studioMain,
    back: studio4,
    waist: detail4
  },
  material: {
    fabric: detail1,
    hem: detail3
  },
  wearing: {
    side: street1,
    closeup: halfBodyMain
  }
};

export const detailImageUrlMap = {
  structure: {
    front: detailImageMap.structure.front.src,
    back: detailImageMap.structure.back.src,
    waist: detailImageMap.structure.waist.src
  },
  material: {
    fabric: detailImageMap.material.fabric.src,
    hem: detailImageMap.material.hem.src
  },
  wearing: {
    side: detailImageMap.wearing.side.src,
    closeup: detailImageMap.wearing.closeup.src
  }
};
