import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import HandymanIcon from '@mui/icons-material/Handyman';
import { useState } from 'react'
import Button from '@mui/material/Button';
import Logout from './Logout';
import UserAvatar from './UserAvatar';

export default function NavMenu({ username, avatar_url }) {
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    const handleOpenUserMenu = (event) => {
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
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                <MenuItem onClick={handleCloseUserMenu} sx={{ flexDirection: "column", alignItems: "flex-start", ":hover": { backgroundColor: "transparent" } }}>
                    <Button sx={{ color: "inherit", textDecoration: 'none', }}><PersonIcon sx={{ paddingRight: "10px" }} /> Перейти на канал</Button>
                    <Button href='/studio' sx={{ color: "inherit", textDecoration: 'none', }}><HandymanIcon sx={{ paddingRight: "10px" }} />Студия</Button>
                    <Logout />
                </MenuItem>

            </Menu>
        </>
    )
}