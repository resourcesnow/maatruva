import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function ProfileHeader({
  name,
  image,
  isVerified,
}: {
  name: string;
  image?: string | null;
  isVerified: boolean;
}) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg" className="size-16">
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className="text-xl font-semibold">{initial}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="text-lg font-semibold">{name}</span>
        {isVerified ? (
          <Badge variant="secondary" className="w-fit gap-1">
            <BadgeCheck className="size-3.5" />
            Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="w-fit">
            Not verified
          </Badge>
        )}
      </div>
    </div>
  );
}
