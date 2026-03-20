import { IconLock } from "@tabler/icons-react";
import type { ConversationType } from "@/lib/types";

interface ChannelPrefixProps {
  type?: ConversationType;
  size?: number;
}

export function ChannelPrefix({ type, size = 10 }: ChannelPrefixProps) {
  if (type === "private_channel") {
    return <IconLock size={size} className="shrink-0" />;
  }
  return <span>#</span>;
}
