import AdbIcon from "@mui/icons-material/Adb";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

export default function Logo() {
    return (<>
        <Button
            component={Link}
            to="/"
            sx={{
                minWidth: 0,
                px: { xs: 0.25, sm: 0.5 },
                color: "inherit", textDecoration: "none", "&:hover": {
                    color: "inherit",
                    textDecoration: "none",
                },
            }}
        >
            <AdbIcon sx={{ display: "flex", mr: { xs: 0, sm: 1 } }} />
            <Typography
                variant="h5"
                noWrap
                sx={{
                    mr: { sm: 1 },
                    display: { xs: "none", lg: "flex" },
                    flexGrow: 1,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: ".3rem",

                }}
            >
                LOGO
            </Typography>
        </Button >
    </>)
}


