import Image from "next/image";
import Link from "next/link";

const SIZES = {
  header: { width: 72, height: 72, className: "h-10 w-auto max-w-[72px]" },
  xs: { width: 60, height: 60, className: "h-auto w-[60px]" },
  sm: { width: 90, height: 90, className: "h-auto w-[90px]" },
  md: { width: 120, height: 120, className: "h-auto w-[120px]" },
  lg: { width: 200, height: 200, className: "h-auto w-[200px]" },
} as const;

type Props = {
  href?: string;
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
};

export function Logo({
  href = "/",
  size = "sm",
  className = "",
  priority = true,
}: Props) {
  const { width, height, className: sizeClass } = SIZES[size];

  const image = (
    <Image
      src="/imagens/logocapi-ft.png"
      alt="Minhas Capivaras"
      width={width}
      height={height}
      className={`${sizeClass} ${className}`.trim()}
      priority={priority}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
