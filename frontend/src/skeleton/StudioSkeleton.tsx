import {
    Box,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { pageSx } from "../styles/sx/page";
import { skeletonSx } from "../styles/sx/skeleton";

export default function StudioSkeleton() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Box sx={pageSx.studioRoot}>
            <Skeleton variant="text" width={260} height={40} sx={skeletonSx.studioTitle} />

            <Grid container spacing={2} sx={pageSx.studioMetricsGrid}>
                {[1, 2, 3].map((item) => (
                    <Grid key={item} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Paper sx={pageSx.studioCard}>
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="text" width="40%" height={30} />
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Skeleton variant="text" width={180} height={32} sx={skeletonSx.studioSectionTitle} />

            {isMobile ? (
                <Stack sx={pageSx.studioMobileList}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <Box key={idx} sx={pageSx.studioMobileCard}>
                            <Skeleton variant="rectangular" sx={pageSx.studioMobileThumb} />
                            <Box sx={pageSx.studioMobileMeta}>
                                <Skeleton variant="text" width="85%" />
                                <Skeleton variant="text" width="55%" />
                                <Skeleton variant="text" width="45%" />
                            </Box>
                        </Box>
                    ))}
                </Stack>
            ) : (
                <TableContainer component={Paper} sx={pageSx.studioTableContainer}>
                    <Table sx={pageSx.studioTable}>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Skeleton variant="text" width={80} />
                                </TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="text" width={60} />
                                </TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="text" width={80} />
                                </TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="text" width={90} />
                                </TableCell>
                                <TableCell align="center">
                                    <Skeleton variant="text" width={120} />
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {[1, 2, 3, 4, 5].map((row) => (
                                <TableRow key={row}>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Skeleton
                                                variant="rectangular"
                                                width={80}
                                                height={45}
                                                sx={skeletonSx.studioThumb}
                                            />
                                            <Skeleton variant="text" width={180} />
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Skeleton variant="text" width={80} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Skeleton variant="text" width={60} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Skeleton variant="text" width={60} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Skeleton variant="text" width={100} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

