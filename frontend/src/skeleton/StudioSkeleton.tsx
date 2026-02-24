import {
    Box,
    Typography,
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
} from "@mui/material";
import { pageSx } from "../styles/theme";

export default function StudioSkeleton() {
    return (
        <Box sx={pageSx.studioRoot}>
            <Skeleton variant="text" width={260} height={40} sx={{ mb: 3 }} />

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

            <Skeleton variant="text" width={180} height={32} sx={{ mt: 5, mb: 2 }} />

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
                                            sx={{ borderRadius: 1 }}
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
        </Box>
    );
}