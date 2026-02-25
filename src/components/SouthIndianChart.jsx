import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

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

const SouthIndianChart = ({ chartData }) => {
    if (!chartData || !chartData.planets || !chartData.houses) {
        return <Typography color="error">No Chart Data Available</Typography>;
    }

    const { planets, houses } = chartData;

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
    Object.entries(planets).forEach(([name, lon]) => {
        const nakInfo = getNakInfo(lon);
        tableData.push({
            name: TAMIL_PLANETS[name] || name,
            nakshatra: nakInfo.name,
            pada: nakInfo.pada,
            lon: lon
        });
    });

    const lagnaLon = houses[1];
    const lagnaNak = getNakInfo(lagnaLon);
    tableData.push({
        name: "லக்னம் (L)",
        nakshatra: lagnaNak.name,
        pada: lagnaNak.pada,
        lon: lagnaLon
    });

    const rasiMap = {};
    tableData.forEach(item => {
        const rasiIdx = Math.floor((item.lon % 360) / 30);
        const rasiName = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ][rasiIdx];
        if (!rasiMap[rasiName]) rasiMap[rasiName] = [];
        rasiMap[rasiName].push(item.name);
    });

    return (
        <Box sx={{ width: '100%', maxWidth: 550, mx: 'auto', p: 1 }}>
            <Paper elevation={12} sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)', // Enforce equal row heights
                aspectRatio: '1/1',
                bgcolor: '#2d3748',
                padding: '5px',
                gap: '3px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
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
                                    bgcolor: '#f0f9ff',
                                    borderRadius: '4px',
                                    overflow: 'hidden', // Contain the table correctly
                                    position: 'relative'
                                }}>
                                    <Box sx={{
                                        p: 1,
                                        bgcolor: '#e0f2fe',
                                        textAlign: 'center',
                                        borderBottom: '2px solid #bae6fd'
                                    }}>
                                        <Typography sx={{
                                            fontWeight: 900,
                                            color: '#0369a1',
                                            fontSize: '0.9rem',
                                            lineHeight: 1
                                        }}>
                                            கோச்சார விவரம்
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#075985', fontWeight: 700, fontSize: '0.6rem' }}>
                                            PLANETARY DETAILS
                                        </Typography>
                                    </Box>

                                    <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#f0f9ff', zIndex: 2 }}>
                                                <tr>
                                                    <th style={{ padding: '4px', textAlign: 'left', fontSize: '10px', color: '#0369a1', borderBottom: '2px solid #bae6fd' }}>கிரகம்</th>
                                                    <th style={{ padding: '4px', textAlign: 'left', fontSize: '10px', color: '#0369a1', borderBottom: '2px solid #bae6fd' }}>நட்சத்திரம்</th>
                                                    <th style={{ padding: '4px', textAlign: 'center', fontSize: '10px', color: '#0369a1', borderBottom: '2px solid #bae6fd' }}>பா</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((row, i) => (
                                                    <tr key={i} style={{
                                                        background: i % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'transparent'
                                                    }}>
                                                        <td style={{
                                                            padding: '4px',
                                                            fontSize: '11px',
                                                            fontWeight: row.name.includes('L') ? 900 : 700,
                                                            color: row.name.includes('L') ? '#dc2626' : '#1e293b'
                                                        }}>{row.name}</td>
                                                        <td style={{ padding: '4px', fontSize: '10px', color: '#475569' }}>{row.nakshatra}</td>
                                                        <td align="center" style={{ padding: '4px', fontSize: '10px', fontWeight: 800, color: '#1e293b' }}>{row.pada}</td>
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
                    const isLagna = items.some(i => i.includes('L'));

                    return (
                        <Box key={idx} sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            position: 'relative',
                            bgcolor: isLagna ? '#fff7ed' : '#fff',
                            borderRadius: '4px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                bgcolor: isLagna ? '#ffedd5' : '#f8fafc',
                                transform: 'scale(1.02)',
                                zIndex: 10,
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }
                        }}>
                            {/* Rasi Label */}
                            <Typography variant="caption" sx={{
                                fontWeight: 900,
                                color: '#94a3b8',
                                fontSize: '0.6rem',
                                position: 'absolute',
                                top: 4,
                                right: 6,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {TAMIL_SIGNS[rasi]}
                            </Typography>

                            {/* Planets List - Centered */}
                            <Box sx={{
                                flex: 1,
                                p: 1,
                                mt: 1, // Space for label
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {items.map((it, i) => (
                                    <Typography key={i} sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: it.includes('L') ? 900 : 800,
                                        lineHeight: 1.2,
                                        textAlign: 'center',
                                        color: it.includes('L') ? '#dc2626' : '#0f172a',
                                        padding: it.includes('L') ? '2px 8px' : '0',
                                        borderRadius: '6px',
                                        bgcolor: it.includes('L') ? 'rgba(254, 226, 226, 0.7)' : 'transparent',
                                        border: it.includes('L') ? '1px solid rgba(220, 38, 38, 0.2)' : 'none',
                                    }}>
                                        {it}
                                    </Typography>
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
