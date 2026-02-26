
import Box from "@mui/material/Box";
import UserAvatar from "./UserAvatar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useEffect, useState } from "react";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import HistoryIcon from "@mui/icons-material/History";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import PersonIcon from "@mui/icons-material/Person";
import HandymanIcon from "@mui/icons-material/Handyman";
import { ListItemButton } from "@mui/material";
import Divider from "@mui/material/Divider";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { getUserSubscriptions } from "../../api/users";
import { logout } from "../../api/auth";
import type { User } from "../../types/user";
import { commonSx } from "../../styles/sx/common";

type SideBarProps = {
    user: User | null;
    open: boolean;
    setOpen: (open: boolean) => void;
};

export default function SideBar({ user, open, setOpen }: SideBarProps) {
    const [subs, setSubs] = useState<User[]>([]);
    const [showAllSubs, setShowAllSubs] = useState(false);

    const [logoutLoading, setLogoutLoading] = useState(false);
    const [logoutErr, setLogoutErr] = useState<string | null>(null);

    const navigate = useNavigate();

    const visibleSubs = showAllSubs ? subs : subs.slice(0, 5);

    const handleLogout = async () => {
        setLogoutLoading(true);
        setLogoutErr(null);

        try {
            await logout();
            navigate("/");
        } catch (err) {
            console.error(err);
            setLogoutErr("Ошибка при выходе");
        } finally {
            setLogoutLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.user_id) {
            setSubs([]);
            setShowAllSubs(false);
            return;
        }

        let isActive = true;
        getUserSubscriptions(user.user_id)
            .then((data) => {
                if (!isActive) return;
                setSubs(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!isActive) return;
                setSubs([]);
            });

        return () => {
            isActive = false;
        };
    }, [user?.user_id]);
    return (
        <Drawer
            open={open}
            onClose={() => setOpen(false)}
            sx={commonSx.sideBarDrawer}
        >
            <Box sx={commonSx.sideBarRoot}>
                <List sx={commonSx.sideBarList}>
                    <ListItem>
                        <ListItemButton
                            component={Link}
                            to={user?.user_id ? `/user/${user.user_id}/sub` : "/"}
                            onClick={() => setOpen(false)}
                        >
                            <SubscriptionsIcon sx={commonSx.sideBarPrimaryIcon} />
                            <ListItemText primary="Подписки" />
                        </ListItemButton>
                    </ListItem>

                    {visibleSubs.map((channel) => (
                        <ListItem key={channel.user_id} disablePadding >
                            <ListItemButton
                                component={Link}
                                to={`/channel/${channel.user_id}`}
                                onClick={() => setOpen(false)}
                            >
                                <UserAvatar
                                    username={channel.username}
                                    avatar_url={channel.avatar_url}
                                />

                                <ListItemText
                                    primary={channel.username}
                                    sx={commonSx.sideBarChannelText}
                                    slotProps={{
                                        primary: {
                                            sx: commonSx.sideBarChannelPrimary,
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}

                    {subs.length > 5 && (
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => setShowAllSubs(!showAllSubs)}
                            >
                                <ListItemText
                                    primary={showAllSubs ? "Свернуть" : "Показать все"}
                                    slotProps={{
                                        primary: {
                                            sx: commonSx.sideBarTogglePrimary,
                                        },
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )}

                    <Divider sx={commonSx.sideBarDivider} />

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/watched" onClick={() => setOpen(false)}>
                            <HistoryIcon sx={commonSx.sideBarIcon} />
                            <ListItemText primary="Просмотренные" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/liked" onClick={() => setOpen(false)}>
                            <ThumbUpAltIcon sx={commonSx.sideBarIcon} />
                            <ListItemText primary="Понравившиеся" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            component={Link}
                            to={user?.user_id ? `/channel/${user.user_id}` : "/"}
                            onClick={() => setOpen(false)}
                        >
                            <PersonIcon sx={commonSx.sideBarIcon} />
                            <ListItemText primary="Ваш канал" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} to="/studio" onClick={() => setOpen(false)}>
                            <HandymanIcon sx={commonSx.sideBarIcon} />
                            <ListItemText primary="Студия" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={handleLogout}
                            disabled={logoutLoading}
                        >
                            <LogoutIcon sx={commonSx.sideBarIcon} />
                            <ListItemText primary="Выйти" />
                        </ListItemButton>
                    </ListItem>

                    {logoutErr && (
                        <ListItem>
                            <ListItemText
                                primary={logoutErr}
                                slotProps={{
                                    primary: {
                                        sx: { color: "error.main" },
                                    },
                                }}
                            />
                        </ListItem>
                    )}
                </List>
            </Box>
        </Drawer >
    );
}


