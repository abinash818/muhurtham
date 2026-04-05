import React from 'react';
import {
    Box, Typography, Paper, Grid, Chip, Divider,
    List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RuleIcon from '@mui/icons-material/Rule';
import StarsIcon from '@mui/icons-material/Stars';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

const MuhurthamView = () => {
    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="800" color="primary" gutterBottom>
                    📈 New KP Muhurtham Logic (11th Lord Rule)
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    புதிய கே.பி முகூர்த்த விதிகளின் விளக்கம்
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* 1. Rule Definition */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <AutoGraphIcon color="primary" />
                            <Typography variant="h6" fontWeight="700">
                                The 11th Lord Rule (11-ஆம் இடத்து அதிபதி விதி)
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            This engine follows a single, precise rule for Muhurtham:
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, mb: 2, borderLeft: '5px solid #2563eb' }}>
                            <Typography variant="h6" fontWeight="900" color="primary">
                                IF (Sub Lord == 11th Lord of Lagnam Sign) → GOOD
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                லக்ன ராசிக்கு 11-ஆம் இடத்து அதிபதியே உப அதிபதியாக (Sub Lord) வந்தால் அது <strong>சிறந்த நேரம் (GOOD)</strong>.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* 2. Examples */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%', bgcolor: '#f0fdf4' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <CheckCircleIcon color="success" />
                            <Typography variant="subtitle1" fontWeight="700">
                                Example (உதாரணம்)
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            <strong>Lagnam:</strong> Simmam (Leo) <br />
                            <strong>11th House:</strong> Midhunam (Gemini) <br />
                            <strong>11th Lord:</strong> Mercury (Budhan) <br />
                            <br />
                            • Sub Lord is <strong>Mercury</strong> → <Chip label="GOOD" color="success" size="small" /> <br />
                            • Sub Lord is <strong>Sun/Rahu/etc</strong> → <Chip label="BAD" color="error" size="small" />
                        </Typography>
                    </Paper>
                </Grid>

                {/* 3. Decision Visuals */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <RuleIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight="700">
                                Decision Status
                            </Typography>
                        </Box>
                        <Grid container spacing={1}>
                            <Grid item xs={4}>
                                <Box textAlign="center" p={1} sx={{ borderRadius: 1, bgcolor: '#dcfce7', border: '1px solid #22c55e' }}>
                                    <Typography variant="bold" color="success.main">GOOD (100)</Typography>
                                    <Typography variant="caption" display="block">Matches 11th Lord</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box textAlign="center" p={1} sx={{ borderRadius: 1, bgcolor: '#f3f4f6', border: '1px solid #94a3b8' }}>
                                    <Typography variant="bold" color="text.secondary">NEUTRAL (50)</Typography>
                                    <Typography variant="caption" display="block">11th Lord is also 8/12</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box textAlign="center" p={1} sx={{ borderRadius: 1, bgcolor: '#fee2e2', border: '1px solid #ef4444' }}>
                                    <Typography variant="bold" color="error.main">BAD (0)</Typography>
                                    <Typography variant="caption" display="block">Mismatch</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Box mt={2}>
                            <Typography variant="caption" color="text.secondary">
                                * 8 அல்லது 12-ஆம் ஆண்டிற்கும் அதே கிரகமே அதிபதியாக இருந்தால் அது <strong>Neutral</strong>.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Final Note */}
                <Grid item xs={12}>
                    <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                        Current calculation is strictly based on the 11th lord from the Ascendant (Lagnam) Sign at each point in time.
                    </Alert>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MuhurthamView;
