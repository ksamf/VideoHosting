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
import { commonSx } from "../../styles/theme";

export default function NavBar() {
    const { user, loading, isAuth } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

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
                            <Button
                                variant="contained"
                                startIcon={<VideoCallIcon />}
                                component={Link}
                                to={isAuth ? "/studio/upload" : "/login"}
                                sx={commonSx.navBarUploadButton}
                            >
                                Загрузить
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
                                    startIcon={<PersonIcon />}
                                    sx={commonSx.navBarLoginButton}
                                >
                                    Войти
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
