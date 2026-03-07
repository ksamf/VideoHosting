import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import SearchField from "./SearchField";
import Logo from "./Logo";
import UserAvatar from "./UserAvatar";
import useAuth from "../../hooks/useAuth";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import SideBar from "./SideBar";
import Button from "@mui/material/Button";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import PersonIcon from "@mui/icons-material/Person";
import { Link } from "react-router-dom";
import { commonSx } from "../../styles/sx/common";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useMediaQuery, useTheme } from "@mui/material";

type ThemeMode = "light" | "dark";

type NavBarProps = {
    themeMode: ThemeMode;
    onToggleTheme: () => void;
};

export default function NavBar({ themeMode, onToggleTheme }: NavBarProps) {
    const { user, loading, isAuth } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const open = isAuth && drawerOpen;

    if (loading) return null;

    return (
        <>
            <AppBar sx={commonSx.navBarAppBar}>
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        sx={commonSx.navBarToolbar}
                    >
                        <Box sx={commonSx.navBarLeft}>
                            {isAuth && user && (
                                <IconButton
                                    color="inherit"
                                    onClick={() => setDrawerOpen(v => !v)}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}

                            <Logo />
                        </Box>

                        <Box sx={commonSx.navBarSearchWrap}>
                            <SearchField />
                        </Box>

                        <Box sx={commonSx.navBarRight}>
                            <IconButton color="inherit" onClick={onToggleTheme}>
                                {themeMode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                            </IconButton>

                            <Button
                                variant="contained"
                                startIcon={!isMobile ? <VideoCallIcon /> : undefined}
                                component={Link}
                                to={isAuth ? "/studio/upload" : "/login"}
                                sx={commonSx.navBarUploadButton}
                            >
                                {isMobile ? <VideoCallIcon fontSize="small" /> : "Загрузить"}
                            </Button>

                            {isAuth && user ? (
                                <UserAvatar
                                    username={user.username}
                                    avatar_url={user.avatar_url}
                                />
                            ) : (
                                <Button
                                    component={Link}
                                    to="/login"
                                    variant="contained"
                                    startIcon={!isMobile ? <PersonIcon /> : undefined}
                                    sx={commonSx.navBarLoginButton}
                                >
                                    {isMobile ? <PersonIcon fontSize="small" /> : "Войти"}
                                </Button>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <SideBar
                user={user}
                open={open}
                setOpen={(next) => setDrawerOpen(isAuth ? next : false)}
            />
        </>
    );
}

