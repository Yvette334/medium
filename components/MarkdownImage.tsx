'use client';

import Image from 'next/image';

type MarkdownImageProps = {
  src?: string | null;
  alt?: string | null;
  [key: string]: any;
};

export function MarkdownImage({ src, alt, ...props }: MarkdownImageProps) {
  if (!src || src.trim() === "" || src === "null" || src === "undefined") {
    return null;
  }

  const isDataUrl = src.startsWith('data:');
  const isExternal = src.startsWith('http://') || src.startsWith('https://');

  if (isDataUrl || isExternal) {
    return (
      <Image
        src={src}
        alt={alt || ""}
        width={800}
        height={600}
        className="rounded-lg max-w-full my-4"
        unoptimized={isDataUrl}
        {...props}
      />
    );
  }

  return null;
}

