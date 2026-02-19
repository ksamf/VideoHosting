import AdbIcon from '@mui/icons-material/Adb';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function Logo() {
    return (<>
        <Button
            href="/"
            textDecoration='none'
            sx={{
                color: "inherit", textDecoration: 'none', '&:hover': {
                    color: 'inherit',
                    textDecoration: 'none',
                },
            }}
        >
            <AdbIcon sx={{ display: { xs: 'flex', md: 'flex' }, mr: 1 }} />
            <Typography
                variant="h5"
                noWrap
                sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    flexGrow: 1,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '.3rem',

                }}
            >
                LOGO
            </Typography>
        </Button >
    </>)
}