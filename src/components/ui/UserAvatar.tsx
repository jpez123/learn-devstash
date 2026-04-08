import Image from "next/image";

type UserAvatarProps = {
  name?: string | null;
  image?: string | null;
  size?: number;
};

export default function UserAvatar({ name, image, size = 28 }: UserAvatarProps) {
  const initials = name?.trim()
    ? name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "User"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
