import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { City } from 'country-state-city';
import ct from 'countries-and-timezones';
import {
    Box, CssBaseline, Typography, Grid, Paper, Button,
    TextField, Autocomplete, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Radio, RadioGroup, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Card, CardContent, Avatar, Stack,
    List, ListItem, ListItemText
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import StarsIcon from '@mui/icons-material/Stars';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Fab from '@mui/material/Fab';
import CircleIcon from '@mui/icons-material/Circle';
import MuhurthamView from './components/MuhurthamView';
import SouthIndianChart from './components/SouthIndianChart';

// --- THEME ---
const theme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#f8fafc',
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
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    }
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
    const now = new Date();
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState([]);
    const [bestTime, setBestTime] = useState(null);
    const [viewLevel, setViewLevel] = useState('Sub');
    const [locationOptions, setLocationOptions] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

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
    const [modalChartData, setModalChartData] = useState(null);
    const [openChart, setOpenChart] = useState(false);
    const [modalTime, setModalTime] = useState({ hour: now.getHours(), minute: now.getMinutes() });
    const [openRules, setOpenRules] = useState(false);
    const [gmpOpen, setGmpOpen] = useState(false);

    // Live Timer Engine
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    };

    const getCountdown = (to) => {
        if (!to) return null;
        const diff = new Date(to) - currentTime;
        if (diff <= 0) return "0:00";
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const currentPeriod = useMemo(() => {
        return timeline.find(row => {
            const start = new Date(row.from);
            const end = new Date(row.to);
            return currentTime >= start && currentTime < end;
        });
    }, [timeline, currentTime]);

    const fetchChartForTime = async (h, m) => {
        const isProd = import.meta.env.PROD;
        const backendUrl = isProd ? './kp_api.php' : (import.meta.env.VITE_BACKEND_URL || './kp_api.php');
        try {
            const res = await axios.post(backendUrl, {
                ...form,
                hour: h,
                minute: m,
                mode: 'chart'
            });
            if (res.data && res.data.chart) {
                setModalChartData(res.data.chart);
                setModalTime({ hour: h, minute: m });
            }
        } catch (err) {
            console.error("Failed to fetch chart for time", err);
        }
    };

    const handleModalTimeChange = (h, m) => {
        fetchChartForTime(h, m);
    };

    const handleOpenChart = () => {
        setModalTime({ hour: parseInt(form.hour), minute: parseInt(form.minute) });
        setModalChartData(null); 
        setOpenChart(true);
    };

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
            alert(`Failed to fetch KP timeline data.`);
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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto', minHeight: '100vh' }}>
                
                {/* Header Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                            component="img" 
                            src="/profile_logo.jpg" 
                            sx={{ 
                                width: 56, 
                                height: 56, 
                                borderRadius: '50%', 
                                border: '2px solid #2563eb',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                            }} 
                        />
                        <Box>
                            <Typography variant="h5" fontWeight="900" color="primary">KP Astrology (கே.பி ஜோதிடம்)</Typography>
                            <Typography variant="caption" sx={{ letterSpacing: 1, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                                REAL-TIME MUHURTHAM CALCULATOR
                            </Typography>
                        </Box>
                    </Box>

                    {/* LIVE TIMER CARD */}
                    <Paper elevation={4} sx={{ 
                        p: 2, 
                        minWidth: 300, 
                        borderRadius: 4, 
                        background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', display: 'block', mb: 0.5 }}>
                            CURRENT TIME (தற்போதைய நேரம்)
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#1e293b' }}>
                            {formatTime(currentTime)}
                        </Typography>
                        
                        {currentPeriod ? (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', py: 0.5, bgcolor: '#e0f2fe', borderRadius: 2, mb: 1 }}>
                                    {TAMIL_MAPS.Planets[SIGN_LORDS[currentPeriod.sign]] || '-' } / {TAMIL_MAPS.Planets[NAK_LORDS[currentPeriod.nakshatra]] || '-' } / {TAMIL_MAPS.Planets[currentPeriod.subLord] || '-' }
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <CircleIcon sx={{ fontSize: 10, color: 'error.main' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 900, color: 'error.main' }}>
                                        அடுத்த மாற்றம்: {getCountdown(currentPeriod.to)}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontWeight: 700 }}>
                                கால அட்டவணைக் கணக்கிடவும்
                            </Typography>
                        )}
                    </Paper>

                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" startIcon={<StarsIcon />} onClick={() => setOpenRules(true)} sx={{ borderRadius: 3, fontWeight: 700 }}>
                            MUHURTHAM RULES
                        </Button>
                    </Stack>
                </Box>

                {/* Muhurtham Rules Dialog */}
                <Dialog open={openRules} onClose={() => setOpenRules(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                    <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="bold">Muhurtham Rules (முகூர்த்த விதிகள்)</Typography>
                        <IconButton onClick={() => setOpenRules(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ p: 0 }}><MuhurthamView /></DialogContent>
                    <DialogActions><Button onClick={() => setOpenRules(false)}>Close</Button></DialogActions>
                </Dialog>

                {/* GMP Times Dialog */}
                <Dialog open={gmpOpen} onClose={() => setGmpOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 5 } }}>
                    <DialogTitle sx={{ fontWeight: 900, bgcolor: '#f0fdf4', color: '#14532d', p: 3 }}>
                        3/11 GMP Success Times (சிறப்பு நேரங்கள்)
                    </DialogTitle>
                    <DialogContent sx={{ p: 0 }}>
                        {timeline.filter(t => t.muhurtham?.decision?.includes('GMP')).length > 0 ? (
                            <List sx={{ py: 0 }}>
                                {timeline.filter(t => t.muhurtham?.decision?.includes('GMP')).map((t, i, arr) => (
                                    <ListItem key={i} divider={i !== arr.length - 1} sx={{ px: 3, py: 2 }}>
                                        <ListItemText 
                                            primary={
                                                <Typography variant="h6" fontWeight="900" color="#1e293b">
                                                    {new Date(t.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(t.to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" fontWeight="700" color="success.main">
                                                    {TAMIL_MAPS.Planets[SIGN_LORDS[t.sign]] || t.sign} / {TAMIL_MAPS.Planets[NAK_LORDS[t.nakshatra]] || t.nakshatra} / {TAMIL_MAPS.Planets[t.subLord] || t.subLord}
                                                </Typography>
                                            }
                                        />
                                        <Chip label="GOOD TIME" color="success" size="small" sx={{ fontWeight: 900, borderRadius: 1 }} />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary" fontWeight="700">இன்று இந்த நிலையில் நேரங்கள் ஏதுமில்லை.</Typography>
                                <Typography variant="body2" color="text.secondary">No GMP success times found for today.</Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
                        <Button onClick={() => setGmpOpen(false)} variant="contained" sx={{ borderRadius: 3, fontWeight: 900 }}>CLOSE (மூடுக)</Button>
                    </DialogActions>
                </Dialog>

                {bestTime && (
                    <Card sx={{ mb: 4, borderRadius: 4, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2 }}>
                            <Avatar sx={{ bgcolor: '#16a34a', width: 48, height: 48, boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)' }}>
                                <TrendingUpIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" fontWeight="900" color="success.main" sx={{ letterSpacing: 1.5 }}>BEST TIME TODAY (இன்றைய சிறந்த நேரம்)</Typography>
                                <Typography variant="h5" fontWeight="900" color="#14532d">
                                    {new Date(bestTime.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(bestTime.to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                <Typography variant="body2" fontWeight="700" color="success.dark">Score: {bestTime.muhurtham.score}/100 • Sub Lord: {TAMIL_MAPS.Planets[bestTime.subLord]}</Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    color="success" 
                                    size="small"
                                    onClick={() => setGmpOpen(true)}
                                    sx={{ fontWeight: 900, borderRadius: 2, border: '2px solid' }}
                                >
                                    3/11 GMP TIME
                                </Button>
                                <Chip label="HIGH PROFIT POTENTIAL" color="success" sx={{ fontWeight: 900, borderRadius: 2 }} />
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Control Panel */}
                <Paper sx={{ p: 4, mb: 4, borderRadius: 6, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                    <Stack spacing={3}>
                        <Box>
                            <Autocomplete
                                options={locationOptions}
                                loading={locationLoading}
                                fullWidth
                                sx={{ 
                                    width: '100%',
                                    '& .MuiInputBase-root': {
                                        height: 64,
                                        fontSize: '1.2rem',
                                        fontWeight: 800,
                                        borderRadius: 4,
                                        bgcolor: '#f8fafc'
                                    }
                                }}
                                getOptionLabel={(o) => `${o.name}, ${o.stateCode}, ${o.countryCode}`}
                                onInputChange={handleLocationSearch}
                                onChange={(e, v) => v && setForm(f => ({ ...f, lat: v.latitude, lon: v.longitude }))}
                                renderInput={(p) => (
                                    <TextField 
                                        {...p} 
                                        label="🔍 Search City (தேடல் - இங்கு ஊர் பெயரைத் தட்டச்சு செய்யவும்)" 
                                        fullWidth 
                                        placeholder="Type city name, e.g. Chennai..."
                                    />
                                )}
                            />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth label="Date" type="date" value={`${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`} onChange={e => { const [y,m,d] = e.target.value.split('-'); setForm({...form, year:y, month:m, day:d}) }} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth label="Time" type="time" value={`${String(form.hour).padStart(2, '0')}:${String(form.minute).padStart(2, '0')}`} onChange={e => { const [h,m] = e.target.value.split(':'); setForm({...form, hour:h, minute:m}) }} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={4} md={2}><TextField fullWidth label="Lat" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} /></Grid>
                            <Grid item xs={4} md={2}><TextField fullWidth label="Lon" value={form.lon} onChange={e => setForm({...form, lon: e.target.value})} /></Grid>
                            <Grid item xs={4} md={2}><TextField fullWidth label="TZ" value={form.tz} onChange={e => setForm({...form, tz: e.target.value})} /></Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                             <Box sx={{ minWidth: 200 }}>
                                <TextField select fullWidth label="Ayanamsa" value={form.ayanamsa} onChange={e => setForm({...form, ayanamsa: e.target.value})} SelectProps={{ native: true }}>
                                    <option value="Lahiri">Lahiri</option>
                                    <option value="KP">KP</option>
                                    <option value="KP Straight">KP Straight</option>
                                </TextField>
                             </Box>
                             <Button 
                                variant="contained" 
                                size="large" 
                                onClick={fetchTimeline} 
                                disabled={loading} 
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TimelineIcon />} 
                                sx={{ flexGrow: 1, py: 2, fontWeight: 900, borderRadius: 4, height: 56 }}
                            >
                                {loading ? 'Calculating...' : 'Calculate 24h Timeline (கணக்கிடு)'}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>

                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'white', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" fontWeight="900" color="text.secondary">Display Level (காண்பிக்கும் நிலை):</Typography>
                    <RadioGroup row value={viewLevel} onChange={e => setViewLevel(e.target.value)}>
                        <FormControlLabel value="Sign" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight="700">Sign (ராசி)</Typography>} />
                        <FormControlLabel value="Nakshatra" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight="700">Nakshatra (நட்சத்திரம்)</Typography>} />
                        <FormControlLabel value="Sub" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight="700">Sub Lord (உப அதிபதி)</Typography>} />
                    </RadioGroup>
                </Box>

                {displayTimeline.length > 0 && (
                    <TableContainer component={Paper} sx={{ borderRadius: 6, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>FROM TIME</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>TO TIME</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>SIGN (ராசி)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>NAKSHATRA (நட்சத்திரம்)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>LORD (நாதன்)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>SUB LORD (உப அதிபதி)</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>MUHURTHAM</TableCell>
                                    <TableCell sx={{ bgcolor: '#1e293b', color: 'white', fontWeight: 900 }}>DURATION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayTimeline.map((row, idx) => {
                                    let badgeColor = 'default';
                                    let badgeBg = '#f3f4f6';
                                    let badgeText = '#374151';

                                    if (row.muhurtham) {
                                        if (row.muhurtham.score >= 100) {
                                            badgeColor = 'success'; badgeBg = '#dcfce7'; badgeText = '#166534';
                                        } else if (row.muhurtham.score < 50) {
                                            badgeColor = 'error'; badgeBg = '#fee2e2'; badgeText = '#991b1b';
                                        } else {
                                            badgeColor = 'warning'; badgeBg = '#fef3c7'; badgeText = '#92400e';
                                        }
                                    }

                                    return (
                                        <TableRow key={idx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#f8fafc' } }}>
                                            <TableCell sx={{ fontWeight: 800 }}>{new Date(row.from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: '13px', fontWeight: 600 }}>{new Date(row.to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</TableCell>
                                            <TableCell sx={{ fontWeight: 900 }}>{TAMIL_MAPS.Signs[row.sign]}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{TAMIL_MAPS.Nakshatras[row.nakshatra]}</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: 'secondary.main' }}>{TAMIL_MAPS.Planets[SIGN_LORDS[row.sign]]}/{TAMIL_MAPS.Planets[NAK_LORDS[row.nakshatra]]}</TableCell>
                                            <TableCell><Chip label={TAMIL_MAPS.Planets[row.subLord]} size="small" color={viewLevel === 'Sub' ? 'primary' : 'default'} sx={{ fontWeight: 900, px: 1 }} /></TableCell>
                                            <TableCell>
                                                {row.muhurtham && (
                                                    <Tooltip title={<Box p={1}><Typography variant="caption">{row.muhurtham.reasons.join(', ')}</Typography></Box>} arrow>
                                                        <Chip label={row.muhurtham.decision} size="small" sx={{ bgcolor: badgeBg, color: badgeText, fontWeight: 900 }} />
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ color: 'primary.main', fontWeight: 900, fontSize: '13px' }}>{Math.floor(row.durationSeconds / 60)}m {row.durationSeconds % 60}s</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Dialog open={openChart} onClose={() => setOpenChart(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 6, bgcolor: '#f1f5f9' } }}>
                    <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                        <Typography variant="h6" fontWeight="900" color="primary">ஜாதக கட்டம் (Horoscope)</Typography>
                        <IconButton onClick={() => setOpenChart(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 2 }}>
                        {chartData || modalChartData ? (
                            <SouthIndianChart chartData={modalChartData || chartData} onTimeChange={handleModalTimeChange} currentHour={modalTime.hour} currentMinute={modalTime.minute} />
                        ) : (
                            <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /><Typography mt={2}>Loading chart data...</Typography></Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenChart(false)} variant="outlined">Close</Button></DialogActions>
                </Dialog>

                <Fab color="primary" onClick={handleOpenChart} sx={{ position: 'fixed', bottom: 32, right: 32, width: 72, height: 72, boxShadow: '0 12px 24px rgba(37, 99, 235, 0.3)' }}>
                    <WbSunnyIcon sx={{ fontSize: 32 }} />
                </Fab>
            </Box>
        </ThemeProvider>
    );
};

export default App;
