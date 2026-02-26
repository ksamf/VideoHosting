import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import { useState, type MouseEvent } from "react";
import UserAvatar from "./UserAvatar";

type NavMenuProps = {
    username?: string;
    avatar_url?: string;
};

export default function NavMenu({ username, avatar_url }: NavMenuProps) {
    const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    return (
        <>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }} >
                    <UserAvatar username={username} avatar_url={avatar_url} />
                </IconButton>
            </Tooltip >
            <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
            </Menu>
        </>
    )
}


