import React, { useState } from 'react';
import { Box, Typography, Paper, Select, MenuItem, IconButton, RadioGroup, FormControlLabel, Radio, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const TAMIL_PLANETS = {
    'Sun': 'சூரியன்', 'Moon': 'சந்திரன்', 'Mars': 'செவ்வாய்', 'Mercury': 'புதன்',
    'Jupiter': 'குரு', 'Venus': 'சுக்கிரன்', 'Saturn': 'சனி', 'Rahu': 'ராகு', 'Ketu': 'கேது'
};

const TAMIL_SIGNS = {
    'Aries': 'மேஷம்', 'Taurus': 'ரிஷபம்', 'Gemini': 'மிதுனம்', 'Cancer': 'கடகம்',
    'Leo': 'சிம்மம்', 'Virgo': 'கன்னி', 'Libra': 'துலாம்', 'Scorpio': 'விருச்சிகம்',
    'Sagittarius': 'தனுசு', 'Capricorn': 'மகரம்', 'Aquarius': 'கும்பம்', 'Pisces': 'மீனம்'
};

const TAMIL_NAKSHATRAS = [
    'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிஷம்', 'திருவாதிரை',
    'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'ஹஸ்தம்',
    'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்',
    'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

const RASI_ORDER = [
    'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Aquarius', null, null, 'Cancer',
    'Capricorn', null, null, 'Leo',
    'Sagittarius', 'Scorpio', 'Libra', 'Virgo'
];

const PLANET_COLORS = {
    'Sun': '#ea580c',      // Orange-600
    'Moon': '#2563eb',     // Blue-600
    'Mars': '#dc2626',     // Red-600
    'Mercury': '#059669',  // Emerald-600
    'Jupiter': '#b45309',  // Amber-700
    'Venus': '#db2777',    // Pink-600
    'Saturn': '#334155',   // Slate-700
    'Rahu': '#7c3aed',     // Violet-600
    'Ketu': '#7c3aed',     // Violet-600
    'Lagna': '#dc2626'      // Red-600
};

const formatDms = (lon, lagnaLon = null, mode = 'planet_deg') => {
    let d;
    if (mode === 'lagna_dist' && lagnaLon !== null) {
        d = (lon - lagnaLon + 360) % 360;
    } else {
        d = lon % 30; // Within the sign
    }
    const deg = Math.floor(d);
    const min = Math.floor((d - deg) * 60);
    return `${deg}°${min}'`;
};

const SouthIndianChart = ({ chartData, onTimeChange, currentHour, currentMinute }) => {
    const [viewMode, setViewMode] = useState('planet_deg'); // 'planet_deg' or 'lagna_dist'

    if (!chartData || !chartData.planets || !chartData.houses) {
        return <Typography color="error">No Chart Data Available</Typography>;
    }

    const { planets, houses } = chartData;
    const lagnaLon = houses[1];

    const getNakInfo = (lon) => {
        lon = lon % 360;
        if (lon < 0) lon += 360;
        const nakIdx = Math.floor(lon / (360 / 27));
        const nakStart = nakIdx * (360 / 27);
        const degInNak = lon - nakStart;
        const pada = Math.floor(degInNak / (360 / 27 / 4)) + 1;
        return {
            name: TAMIL_NAKSHATRAS[nakIdx],
            pada: pada
        };
    };

    const tableData = [];
    const internalPlanetInfo = []; 

    Object.entries(planets).forEach(([name, lon]) => {
        const nakInfo = getNakInfo(lon);
        const displayData = {
            id: name,
            name: TAMIL_PLANETS[name] || name,
            nakshatra: nakInfo.name,
            pada: nakInfo.pada,
            lon: lon
        };
        tableData.push(displayData);
        internalPlanetInfo.push(displayData);
    });

    const lagnaData = {
        id: 'Lagna',
        name: "லக்னம் (L)",
        nakshatra: getNakInfo(lagnaLon).name,
        pada: getNakInfo(lagnaLon).pada,
        lon: lagnaLon
    };
    tableData.push(lagnaData);
    internalPlanetInfo.push(lagnaData);

    const rasiMap = {};
    internalPlanetInfo.forEach(item => {
        const rasiIdx = Math.floor((item.lon % 360) / 30);
        const rasiName = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ][rasiIdx];
        if (!rasiMap[rasiName]) rasiMap[rasiName] = [];
        rasiMap[rasiName].push(item);
    });

    const handleIncrement = () => {
        let nMin = parseInt(currentMinute) + 1;
        let nHr = parseInt(currentHour);
        if (nMin >= 60) { nMin = 0; nHr = (nHr + 1) % 24; }
        onTimeChange(nHr, nMin);
    };

    const handleDecrement = () => {
        let nMin = parseInt(currentMinute) - 1;
        let nHr = parseInt(currentHour);
        if (nMin < 0) { nMin = 59; nHr = (nHr - 1 + 24) % 24; }
        onTimeChange(nHr, nMin);
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 550, mx: 'auto', p: 1 }}>
            {/* 1. Time Controls UI */}
            <Paper elevation={0} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 4, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={2}>
                    <Box>
                        <Typography variant="caption" display="block" fontWeight="bold">மணி (Hr)</Typography>
                        <Select 
                            size="small" 
                            value={currentHour} 
                            onChange={(e) => onTimeChange(e.target.value, currentMinute)}
                            sx={{ minWidth: 65, fontWeight: 800, borderRadius: 2 }}
                        >
                            {[...Array(24)].map((_, i) => <MenuItem key={i} value={i}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                    </Box>
                    <Typography variant="h6" sx={{ mt: 2 }}>:</Typography>
                    <Box>
                        <Typography variant="caption" display="block" fontWeight="bold">நிமிடம் (Min)</Typography>
                        <Select 
                            size="small" 
                            value={currentMinute} 
                            onChange={(e) => onTimeChange(currentHour, e.target.value)}
                            sx={{ minWidth: 65, fontWeight: 800, borderRadius: 2 }}
                        >
                            {[...Array(60)].map((_, i) => <MenuItem key={i} value={i}>{String(i).padStart(2, '0')}</MenuItem>)}
                        </Select>
                    </Box>
                    <Box sx={{ pt: 2, display: 'flex', gap: 1 }}>
                        <IconButton onClick={handleDecrement} sx={{ border: '1px solid #e2e8f0' }}><RemoveIcon /></IconButton>
                        <IconButton onClick={handleIncrement} sx={{ border: '1px solid #e2e8f0' }}><AddIcon /></IconButton>
                    </Box>
                </Stack>

                {/* 2. View Mode Toggle */}
                <RadioGroup 
                    row 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)}
                    sx={{ justifyContent: 'center' }}
                >
                    <FormControlLabel 
                        value="planet_deg" 
                        control={<Radio size="small" />} 
                        label={<Typography variant="body2" fontWeight="bold" color="primary">கிரக பாகை</Typography>} 
                    />
                    <FormControlLabel 
                        value="lagna_dist" 
                        control={<Radio size="small" />} 
                        label={<Typography variant="body2" fontWeight="bold" color="secondary">லக்ன தூரம்</Typography>} 
                    />
                </RadioGroup>
            </Paper>

            <Paper elevation={12} sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)', 
                aspectRatio: '1/1',
                bgcolor: '#1e293b',
                padding: '6px',
                gap: '4px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {RASI_ORDER.map((rasi, idx) => {
                    if (rasi === null) {
                        if (idx === 5) {
                            return (
                                <Box key={idx} sx={{
                                    gridColumn: 'span 2',
                                    gridRow: 'span 2',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: '#f8fafc',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <Box sx={{ p: 1, bgcolor: '#f1f5f9', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>
                                        <Typography sx={{ fontWeight: 900, color: '#1e293b', fontSize: '0.95rem' }}>கோச்சார விவரம்</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, fontSize: '0.65rem' }}>PLANETARY DETAILS</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <tbody>
                                                {tableData.map((row, i) => (
                                                    <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(241, 245, 249, 0.5)' : 'white' }}>
                                                        <td style={{ padding: '4px', fontSize: '11px', fontWeight: 900, color: PLANET_COLORS[row.id] || '#1e293b' }}>{row.name}</td>
                                                        <td style={{ padding: '4px', fontSize: '10px', color: '#475569', fontWeight: 600 }}>{row.nakshatra}</td>
                                                        <td align="center" style={{ padding: '4px', fontSize: '10px', fontWeight: 900 }}>{row.pada}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Box>
                                </Box>
                            );
                        }
                        return null;
                    }

                    const items = rasiMap[rasi] || [];
                    const isLagna = items.some(i => i.id === 'Lagna');

                    return (
                        <Box key={idx} sx={{
                            display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative',
                            bgcolor: isLagna ? '#fff7ed' : '#ffffff', borderRadius: '8px',
                            border: isLagna ? '2px solid #fdba74' : '1px solid #e2e8f0',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'scale(1.05)', zIndex: 10, bgcolor: isLagna ? '#ffedd5' : '#f8fafc' }
                        }}>
                            <Typography sx={{ fontWeight: 900, color: '#cbd5e1', fontSize: '0.65rem', position: 'absolute', top: 4, right: 6 }}>
                                {TAMIL_SIGNS[rasi]}
                            </Typography>

                            <Box sx={{ flex: 1, p: 0.5, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                                {items.map((it, i) => (
                                    <Box key={i} sx={{ textAlign: 'center', mb: 0.5 }}>
                                        <Typography sx={{
                                            fontSize: it.id === 'Lagna' ? '0.8rem' : '0.85rem',
                                            fontWeight: 900, lineHeight: 1,
                                            color: PLANET_COLORS[it.id] || '#0f172a'
                                        }}>
                                            {it.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', lineHeight: 1, mt: 0.2 }}>
                                            {formatDms(it.lon, lagnaLon, viewMode)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    );
                })}
            </Paper>
        </Box>
    );
};

export default SouthIndianChart;
