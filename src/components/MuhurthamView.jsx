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
                    📈 Advanced KP Muhurtham Engine Rules
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    மேம்பட்ட கே.பி முகூர்த்த விதிகளின் விளக்கம்
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* 1. Scoring Weights */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <AutoGraphIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight="700">
                                1. Hierarchical Weighting (அதிபதி முக்கியத்துவம்)
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Scoring is based on the Lord's hierarchy: <br />
                            • <strong>Lagna Sub Lord (100%):</strong> Primary decider. <br />
                            • <strong>Lagna Star Lord & Moon (60%):</strong> strong influencers. <br />
                            • <strong>Lagna Sign Lord (30%):</strong> Baseline strength. <br />
                            <em>Note: Points are reduced by 50% for mixed significators (Positive + Negative).</em>
                        </Typography>
                    </Paper>
                </Grid>

                {/* 2. Success Rules & Bonus */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <CheckCircleIcon color="success" />
                            <Typography variant="subtitle1" fontWeight="700">
                                2. Profit & Success (லாபம் மற்றும் வெற்றி)
                            </Typography>
                        </Box>
                        <List dense>
                            <ListItem>
                                <ListItemIcon><StarsIcon fontSize="small" color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Primary Houses: 2, 6, 11"
                                    secondary="Lords must connect to these houses for financial success."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><StarsIcon fontSize="small" color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Cuspal Confirmation (+10 Bonus)"
                                    secondary="If Sub Lord of Cusp 2, 6, 10, or 11 confirms their own house."
                                />
                            </ListItem>
                        </List>
                        <Box mt={1} display="flex" gap={1}>
                            <Chip label="Jackpot: 2, 6, 11" color="success" size="small" />
                            <Chip label="Bonus: +10 pts" variant="outlined" size="small" />
                        </Box>
                    </Paper>
                </Grid>

                {/* 3. Rejection Rules */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%', bgcolor: '#fff1f2' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <CancelIcon color="error" />
                            <Typography variant="subtitle1" fontWeight="700" color="error">
                                3. Hard Rejection (கண்டிப்பான தவிர்ப்புகள்)
                            </Typography>
                        </Box>
                        <List dense>
                            <ListItem>
                                <ListItemIcon><RuleIcon fontSize="small" color="error" /></ListItemIcon>
                                <ListItemText
                                    primary="Negative Houses: 5, 8, 9, 12"
                                    secondary="Strong connection to 8/12 without 2/11 = Automatic Score 15."
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><RuleIcon fontSize="small" color="error" /></ListItemIcon>
                                <ListItemText
                                    primary="Lagna Specific Rules (லக்ன விதிகள்)"
                                    secondary="Taurus/Jupiter & Scorpio/Mercury negative links cause rejection."
                                />
                            </ListItem>
                        </List>
                        <Box mt={1}>
                            <Chip label="Dangerous: 8, 12" color="error" size="small" />
                        </Box>
                    </Paper>
                </Grid>

                {/* 4. Decision Thresholds */}
                <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                        <Typography variant="subtitle2" fontWeight="700" gutterBottom>
                            Decision Logic (தீர்மான முறைகள்)
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Box textAlign="center" p={1} sx={{ borderRadius: 1, bgcolor: '#dcfce7' }}>
                                    <Typography variant="bold" color="success.main">GOOD (≥ 70)</Typography>
                                    <Typography variant="caption" display="block">Buy/Invest</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box textAlign="center" p={1} sx={{ borderRadius: 1, bgcolor: '#f3f4f6' }}>
                                    <Typography variant="bold" color="text.secondary">NEUTRAL (40-69)</Typography>
                                    <Typography variant="caption" display="block">Caution</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box textAlign="center" p={1} sx={{ borderRadius: 1, bgcolor: '#fee2e2' }}>
                                    <Typography variant="bold" color="error.main">BAD (&lt; 40)</Typography>
                                    <Typography variant="caption" display="block">Avoid/Sell</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Final Note */}
                <Grid item xs={12}>
                    <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                        Our engine uses <strong>Exact House Longitudes</strong> and <strong>Placidus (KP) House system</strong> for rule verification. Rejections override all positive scores.
                    </Alert>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MuhurthamView;
