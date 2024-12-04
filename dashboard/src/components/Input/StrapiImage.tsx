import Image from "next/image";
import { getStrapiMedia } from "@/lib/client";

interface StrapiImageProps {
  src: string;
  alt: string;
  height: number;
  width: number;
  className?: string;
}

const StrapiImage = ({
  src,
  alt,
  height,
  width,
  className,
}: Readonly<StrapiImageProps>) => {
  if (!src) return null;
  const imageUrl = getStrapiMedia(src);
  const imageFallback = `https://placehold.co/${width}x${height}`;

  return (
    <Image
      src={imageUrl ?? imageFallback}
      alt={alt}
      height={height}
      width={width}
      className={className}
    />
  );
}

export default StrapiImage;