import { BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProfilePictureUploader } from "./profile-picture-uploader";

export function ProfileHeader({
  userId,
  name,
  image,
  isVerified,
}: {
  userId: string;
  name: string;
  image?: string | null;
  isVerified: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <ProfilePictureUploader userId={userId} name={name} image={image} />
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
