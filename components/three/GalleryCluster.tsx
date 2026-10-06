"use client";

import { MEDIA } from "@/lib/journey";
import { ImagePanel } from "./MediaPanel";

export function GalleryCluster() {
  return (
    <group>
      {MEDIA.map((item) => <ImagePanel key={item.title} {...item} />)}
    </group>
  );
}
