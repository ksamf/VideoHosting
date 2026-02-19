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

export default function NavBar() {
    const { user, loading, isAuth } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const open = isAuth && drawerOpen;

    if (loading) return null;

    return (
        <>
            <AppBar sx={{ bgcolor: "#0f0f0f" }}>
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        sx={{
                            minHeight: 64,
                            display: "grid",
                            gridTemplateColumns: "auto minmax(0, 720px) auto",
                            alignItems: "center",
                            columnGap: { xs: 1, md: 2 },
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                minWidth: 0,
                            }}
                        >
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

                        <Box
                            sx={{
                                width: "100%",
                                minWidth: 0,
                                justifySelf: "center",
                            }}
                        >
                            <SearchField />
                        </Box>

                        <Box
                            sx={{
                                marginLeft: "auto",
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 1, sm: 2 },
                                flexShrink: 0,
                                minWidth: 0,
                            }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<VideoCallIcon />}
                                component={Link}
                                to={isAuth ? "/studio/upload" : "/login"}
                                sx={{ px: { xs: 1.2, sm: 2 }, whiteSpace: "nowrap" }}
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
                                    sx={{ whiteSpace: "nowrap" }}
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
