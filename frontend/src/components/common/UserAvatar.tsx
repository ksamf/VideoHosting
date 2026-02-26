import { Avatar } from "@mui/material";
import { commonSx } from "../../styles/sx/common";

type UserAvatarProps = {
    username?: string;
    avatar_url?: string;
    size?: number;
    cacheKey?: string | number;
};

export default function UserAvatar({ username, avatar_url, size = 40, cacheKey = "" }: UserAvatarProps) {
    const hasAvatar = Boolean(avatar_url);
    const suffix = cacheKey ? `?v=${cacheKey}` : "";
    const avatar64 = hasAvatar ? `${avatar_url}/avatar_64.jpg${suffix}` : undefined;
    const avatar128 = hasAvatar ? `${avatar_url}/avatar_128.jpg${suffix}` : undefined;
    const avatar256 = hasAvatar ? `${avatar_url}/avatar_256.jpg${suffix}` : undefined;

    return (
        <Avatar
            alt={username ?? "user"}
            src={avatar128}
            srcSet={hasAvatar ? `${avatar64} 64w, ${avatar128} 128w, ${avatar256} 256w` : undefined}
            sx={commonSx.userAvatar(size)}
        >
            {!hasAvatar ? username?.[0]?.toUpperCase() : null}
        </Avatar>
    );
}

