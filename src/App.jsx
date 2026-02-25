import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Country, State, City } from 'country-state-city';
import ct from 'countries-and-timezones';
import {
    Box, CssBaseline, Typography, Grid, Paper, Button,
    TextField, Autocomplete, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Radio, RadioGroup, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Card, CardContent
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import StarsIcon from '@mui/icons-material/Stars';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Fab from '@mui/material/Fab';
import MuhurthamView from './components/MuhurthamView';
import SouthIndianChart from './components/SouthIndianChart';

// --- THEME ---
const theme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#f4f6f9',
            paper: '#ffffff',
        },
        primary: {
            main: '#2563eb',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#0ea5e9',
            contrastText: '#FFFFFF',
        },
        text: {
            primary: '#111827',
            secondary: '#6b7280',
        },
    },
    shape: {
        borderRadius: 16,
    },
});

// --- CONSTANTS ---
const SIGN_LORDS = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
    'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
};

const NAK_LORDS = {
    'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
    'Rohini': 'Moon', 'Mrigashirsha': 'Mars', 'Ardra': 'Rahu',
    'Punarvasu': 'Jupiter', 'Pushya': 'Saturn', 'Ashlesha': 'Mercury',
    'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
    'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu',
    'Vishakha': 'Jupiter', 'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury',
    'Mula': 'Ketu', 'Purva Ashadha': 'Venus', 'Uttara Ashadha': 'Sun',
    'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
    'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
};

const TAMIL_MAPS = {
    Signs: {
        'Aries': 'மேஷம்', 'Taurus': 'ரிஷபம்', 'Gemini': 'மிதுனம்', 'Cancer': 'கடகம்',
        'Leo': 'சிம்மம்', 'Virgo': 'கன்னி', 'Libra': 'துலாம்', 'Scorpio': 'விருச்சிகம்',
        'Sagittarius': 'தனுசு', 'Capricorn': 'மகரம்', 'Aquarius': 'கும்பம்', 'Pisces': 'மீனம்'
    },
    Nakshatras: {
        'Ashwini': 'அஸ்வினி', 'Bharani': 'பரணி', 'Krittika': 'கார்த்திகை', 'Rohini': 'ரோகிணி',
        'Mrigashirsha': 'மிருகசீரிஷம்', 'Ardra': 'திருவாதிரை', 'Punarvasu': 'புனர்பூசம்', 'Pushya': 'பூசம்',
        'Ashlesha': 'ஆயில்யம்', 'Magha': 'மகம்', 'Purva Phalguni': 'பூரம்', 'Uttara Phalguni': 'உத்திரம்',
        'Hasta': 'ஹஸ்தம்', 'Chitra': 'சித்திரை', 'Swati': 'சுவாதி', 'Vishakha': 'விசாகம்',
        'Anuradha': 'அனுஷம்', 'Jyeshtha': 'கேட்டை', 'Mula': 'மூலம்', 'Purva Ashadha': 'பூராடம்',
        'Uttara Ashadha': 'உத்திராடம்', 'Shravana': 'திருவோணம்', 'Dhanishta': 'அவிட்டம்', 'Shatabhisha': 'சதயம்',
        'Purva Bhadrapada': 'பூரட்டாதி', 'Uttara Bhadrapada': 'உத்திரட்டாதி', 'Revati': 'ரேவதி'
    },
    Planets: {
        'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்', 'Mercury': 'புதன்',
        'Jupiter': 'குரு', 'Venus': 'சுக்கிரன்', 'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
    }
};

const App = () => {
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState([]);
    const [bestTime, setBestTime] = useState(null);
    const [viewLevel, setViewLevel] = useState('Sub');
    const [locationOptions, setLocationOptions] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);


    const now = new Date();
    const [form, setForm] = useState({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        lat: '13.0827',
        lon: '80.2707',
        tz: '5.5',
        ayanamsa: 'KP'
    });

    const [chartData, setChartData] = useState(null);
    const [openChart, setOpenChart] = useState(false);

    const calculateTimezone = (long) => {
        const lonNum = parseFloat(long);
        if (isNaN(lonNum)) return 5.5;
        let offset = lonNum / 15;
        offset = Math.round(offset * 2) / 2;
        if (offset > 14) offset = 14;
        if (offset < -12) offset = -12;
        return offset;
    };

    const handleLocationSearch = (event, newInputValue) => {
        if (!newInputValue || newInputValue.length < 3) return;
        setLocationLoading(true);
        setTimeout(() => {
            const q = newInputValue.toLowerCase();
            const all = City.getAllCities();
            const matches = [];
            for (let i = 0; i < all.length; i++) {
                if (all[i].name.toLowerCase().includes(q)) {
                    matches.push(all[i]);
                    if (matches.length >= 50) break;
                }
            }
            setLocationOptions(matches);
            setLocationLoading(false);
        }, 300);
    };

    const fetchTimeline = async () => {
        setLoading(true);
        const isProd = import.meta.env.PROD;
        const backendUrl = isProd ? './kp_api.php' : (import.meta.env.VITE_BACKEND_URL || './kp_api.php');
        try {
            const res = await axios.post(backendUrl, {
                year: parseInt(form.year),
                month: parseInt(form.month),
                day: parseInt(form.day),
                hour: parseInt(form.hour),
                minute: parseInt(form.minute),
                latitude: parseFloat(form.lat),
                longitude: parseFloat(form.lon),
                timezone: parseFloat(form.tz),
                ayanamsa: form.ayanamsa
            });
            if (res.data && res.data.timeline) {
                setTimeline(res.data.timeline.filter(row => row.durationSeconds >= 5));
                setBestTime(res.data.bestTime);
                setChartData(res.data.chart);
            } else {
                throw new Error("Invalid response from server: timeline data missing");
            }
        } catch (err) {
            console.error(err);
            alert(`Failed to fetch KP timeline from: ${backendUrl}\nMake sure the backend server is running and accessible.`);
        } finally {
            setLoading(false);
        }
    };

    const getDisplayTimeline = () => {
        if (!timeline.length) return [];
        if (viewLevel === 'Sub') return timeline;

        const merged = [];
        let current = { ...timeline[0] };

        for (let i = 1; i < timeline.length; i++) {
            const next = timeline[i];
            let shouldMerge = false;
            if (viewLevel === 'Sign') {
                shouldMerge = next.sign === current.sign;
            } else if (viewLevel === 'Nakshatra') {
                shouldMerge = next.nakshatra === current.nakshatra;
            }

            if (shouldMerge) {
                current.to = next.to;
                current.durationSeconds += next.durationSeconds;
            } else {
                merged.push(current);
                current = { ...next };
            }
        }
        merged.push(current);
        return merged;
    };

    const displayTimeline = useMemo(() => getDisplayTimeline(), [timeline, viewLevel]);

    const [openMuhurtham, setOpenMuhurtham] = useState(false);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" fontWeight="800" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="img" src="/profile_logo.jpg" sx={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #2563eb' }} />
                        KP Astrology (கே.பி ஜோதிடம்)
                    </Typography>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<StarsIcon />}
                        onClick={() => setOpenMuhurtham(true)}
                        sx={{ fontWeight: 'bold', borderRadius: '12px', border: '2px solid' }}
                    >
                        Muhurtham Rules (முகூர்த்த விதிகள்)
                    </Button>
                </Box>

                <Dialog
                    open={openMuhurtham}
                    onClose={() => setOpenMuhurtham(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <StarsIcon color="secondary" />
                            <Typography variant="h6" fontWeight="bold">Muhurtham Guide</Typography>
                        </Box>
                        <IconButton onClick={() => setOpenMuhurtham(false)}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <MuhurthamView />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenMuhurtham(false)} variant="contained" sx={{ borderRadius: 2 }}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {bestTime && (
                    <Card sx={{ mb: 3, borderRadius: '16px', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ p: 2, bgcolor: '#16a34a', borderRadius: '50%', color: 'white' }}>
                                <TrendingUpIcon fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="overline" fontWeight="bold" color="success.main">
                                    BEST TIME TODAY (இன்றைய சிறந்த நேரம்)
                                </Typography>
                                <Typography variant="h5" fontWeight="900" color="#14532d">
                                    {new Date(bestTime.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(bestTime.to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                <Typography variant="body2" fontWeight="600" color="text.secondary">
                                    Score: {bestTime.muhurtham.score}/100 • Sub Lord: {bestTime.subLord}
                                </Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                <Chip label="HIGH PROFIT POTENTIAL" color="success" sx={{ fontWeight: 'bold' }} />
                            </Box>
                        </CardContent>
                    </Card>
                )}

                <Paper sx={{ p: 4, mb: 3, borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6}>
                            <Autocomplete
                                id="city-search-autocomplete"
                                options={locationOptions}
                                loading={locationLoading}
                                fullWidth
                                getOptionLabel={(option) => `${option.name}, ${option.stateCode}, ${option.countryCode}`}
                                onInputChange={handleLocationSearch}
                                onChange={(event, val) => {
                                    if (val) {
                                        const lat = parseFloat(val.latitude);
                                        const long = parseFloat(val.longitude);
                                        let tz = 5.5;
                                        try {
                                            const timezones = ct.getTimezonesForCountry(val.countryCode);
                                            if (timezones && timezones.length > 0) {
                                                tz = timezones[0].utcOffset / 60;
                                            } else {
                                                tz = calculateTimezone(long);
                                            }
                                        } catch (e) {
                                            tz = calculateTimezone(long);
                                        }
                                        setForm(prev => ({ ...prev, lat: lat, lon: long, tz: tz }));
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="🔍 Search City (தேடல்)"
                                        fullWidth
                                        sx={{ minWidth: '400px' }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {locationLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={`${option.name}-${option.latitude}`}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                                            <Typography variant="caption" color="textSecondary">{option.stateCode}, {option.countryCode}</Typography>
                                        </Box>
                                    </li>
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={`${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`}
                                onChange={(e) => {
                                    const [y, m, d] = e.target.value.split('-');
                                    setForm({ ...form, year: y, month: m, day: d });
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Time"
                                type="time"
                                value={`${String(form.hour).padStart(2, '0')}:${String(form.minute).padStart(2, '0')}`}
                                onChange={(e) => {
                                    const [h, min] = e.target.value.split(':');
                                    setForm({ ...form, hour: h, minute: min });
                                }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        {/* Row 2 */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Lat"
                                value={form.lat}
                                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Lon"
                                value={form.lon}
                                onChange={(e) => setForm({ ...form, lon: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="TZ"
                                value={form.tz}
                                onChange={(e) => setForm({ ...form, tz: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Ayanamsa"
                                value={form.ayanamsa}
                                onChange={(e) => setForm({ ...form, ayanamsa: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="Lahiri">Lahiri</option>
                                <option value="KP">KP</option>
                                <option value="KP Straight">KP Straight</option>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={fetchTimeline}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TimelineIcon />}
                                sx={{ py: 2, fontWeight: 700, fontSize: '1.1rem' }}
                            >
                                {loading ? 'Calculating...' : 'Calculate 24h Timeline (கணக்கிடு)'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'white', borderRadius: '16px' }}>
                    <Typography variant="subtitle2" fontWeight="700">Display Level (காண்பிக்கும் நிலை):</Typography>
                    <RadioGroup row value={viewLevel} onChange={(e) => setViewLevel(e.target.value)}>
                        <FormControlLabel value="Sign" control={<Radio size="small" />} label="Sign (ராசி)" />
                        <FormControlLabel value="Nakshatra" control={<Radio size="small" />} label="Nakshatra (நட்சத்திரம்)" />
                        <FormControlLabel value="Sub" control={<Radio size="small" />} label="Sub Lord (உப அதிபதி)" />
                    </RadioGroup>
                </Box>

                {displayTimeline.length > 0 && (
                    <TableContainer component={Paper} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>FROM TIME</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>TO TIME</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>SIGN (ராசி)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>NAKSHATRA (நட்சத்திரம்)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>LORD (நாதன்)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>SUB LORD (உப அதிபதி)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>MUHURTHAM</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 700 }}>DURATION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayTimeline.map((row, idx) => {
                                    // Determine Muhurtham Color
                                    let badgeColor = 'default';
                                    let badgeBg = '#f3f4f6';
                                    let badgeText = '#374151';

                                    if (row.muhurtham) {
                                        if (row.muhurtham.score >= 70) {
                                            badgeColor = 'success';
                                            badgeBg = '#dcfce7';
                                            badgeText = '#166534';
                                        } else if (row.muhurtham.score < 40) {
                                            badgeColor = 'error';
                                            badgeBg = '#fee2e2';
                                            badgeText = '#991b1b';
                                        } else {
                                            badgeColor = 'warning';
                                            badgeBg = '#fef3c7';
                                            badgeText = '#92400e';
                                        }
                                    }

                                    return (
                                        <TableRow key={idx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#f8fafc' } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>{new Date(row.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: '13px' }}>{new Date(row.to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</TableCell>
                                            <TableCell sx={{ fontWeight: viewLevel === 'Sign' ? 800 : 400, color: viewLevel === 'Sign' ? 'primary.main' : 'inherit' }}>
                                                {TAMIL_MAPS.Signs[row.sign] || row.sign}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: viewLevel === 'Nakshatra' ? 800 : 400, color: viewLevel === 'Nakshatra' ? 'primary.main' : 'inherit' }}>
                                                {TAMIL_MAPS.Nakshatras[row.nakshatra] || row.nakshatra}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>
                                                {TAMIL_MAPS.Planets[SIGN_LORDS[row.sign]] || '-'}/{TAMIL_MAPS.Planets[NAK_LORDS[row.nakshatra]] || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={TAMIL_MAPS.Planets[row.subLord] || row.subLord}
                                                    size="small"
                                                    color={viewLevel === 'Sub' ? 'primary' : 'default'}
                                                    sx={{ fontWeight: 700, borderRadius: '8px' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {row.muhurtham ? (
                                                    <Tooltip
                                                        title={
                                                            <Box sx={{ p: 1 }}>
                                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ borderBottom: '1px solid #ffffff40', pb: 0.5, mb: 0.5 }}>
                                                                    Score: {row.muhurtham.score}/100
                                                                </Typography>
                                                                <ul style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '12px' }}>
                                                                    {row.muhurtham.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                                                </ul>
                                                                {row.muhurtham.influences && (
                                                                    <Box sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.15)', p: 1, borderRadius: 1 }}>
                                                                        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 0.5 }}>PLANET INFLUENCE:</Typography>
                                                                        {Object.entries(row.muhurtham.influences).map(([p, sigs]) => (
                                                                            <Box key={p} display="flex" justifyContent="space-between" sx={{ fontSize: '11px' }}>
                                                                                <span>{p}:</span>
                                                                                <span style={{ fontWeight: 600 }}>{sigs}</span>
                                                                            </Box>
                                                                        ))}
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        }
                                                        arrow
                                                    >
                                                        <Chip
                                                            label={row.muhurtham.decision}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: badgeBg,
                                                                color: badgeText,
                                                                fontWeight: '900',
                                                                border: '1px solid',
                                                                borderColor: badgeColor + '.main'
                                                            }}
                                                        />
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ color: 'info.main', fontWeight: 700, fontSize: '13px' }}>
                                                {Math.floor(row.durationSeconds / 60)}m {row.durationSeconds % 60}s
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* South Indian Chart Modal */}
                <Dialog
                    open={openChart}
                    onClose={() => setOpenChart(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, bgcolor: '#f1f5f9' } }}
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
                        <Typography variant="h6" fontWeight="900" color="primary">ஜாதக கட்டம் (Horoscope)</Typography>
                        <IconButton onClick={() => setOpenChart(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        {chartData ? (
                            <SouthIndianChart chartData={chartData} />
                        ) : (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography gutterBottom>Please calculate the timeline first to view the chart.</Typography>
                                <Button variant="contained" onClick={fetchTimeline}>Calculate Now</Button>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenChart(false)} sx={{ fontWeight: 'bold' }}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Floating Action Button (Sun Icon) */}
                <Fab
                    color="primary"
                    aria-label="view chart"
                    onClick={() => setOpenChart(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        width: 70,
                        height: 70,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)',
                        '&:hover': {
                            transform: 'scale(1.1) rotate(15deg)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }
                    }}
                >
                    <WbSunnyIcon sx={{ fontSize: 35, color: 'white' }} />
                </Fab>
            </Box>
        </ThemeProvider>
    );
};

export default App;
