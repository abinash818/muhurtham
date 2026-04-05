<?php

class KPUtils {
    public static $SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    public static $VIMSHOTTARI_LORDS = [
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
    ];

    public static $VIMSHOTTARI_YEARS = [
        "Ketu" => 7, "Venus" => 20, "Sun" => 6, "Moon" => 10,
        "Mars" => 7, "Rahu" => 18, "Jupiter" => 16, "Saturn" => 19, "Mercury" => 17
    ];

    public static $NAKSHATRAS = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
        "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];

    public static $NAKSHATRA_LORDS = [
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", // 1-9
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", // 10-18
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"  // 19-27
    ];

    /**
     * Get Sign, Nakshatra, and Sub Lord for a given longitude.
     */
    public static function getKPLords($longitude) {
        $longitude = fmod($longitude, 360);
        if ($longitude < 0) $longitude += 360;

        // 1. Sign
        $signIdx = floor($longitude / 30);
        $sign = self::$SIGNS[$signIdx];

        // 2. Nakshatra
        $nakIdx = floor($longitude / (360 / 27));
        $nak = self::$NAKSHATRAS[$nakIdx];
        $nakLord = self::$NAKSHATRA_LORDS[$nakIdx];

        // 3. Sub Lord
        $nakStartDegree = $nakIdx * (360 / 27);
        $degreeInNak = $longitude - $nakStartDegree; // 0 to 13.333...
        
        $subLord = self::calculateSubLord($nakLord, $degreeInNak);

        return [
            'sign' => $sign,
            'nakshatra' => $nak,
            'nakLord' => $nakLord,
            'subLord' => $subLord
        ];
    }

    private static function calculateSubLord($startLord, $degreeInNak) {
        $arcMinutesInNak = $degreeInNak * 60; // 0 to 800
        $totalMinutes = 800;
        $totalYears = 120;

        // Find starting index in Vimshottari sequence
        $startIndex = array_search($startLord, self::$VIMSHOTTARI_LORDS);
        
        $currentMinute = 0;
        for ($i = 0; $i < 9; $i++) {
            $lordIdx = ($startIndex + $i) % 9;
            $lordName = self::$VIMSHOTTARI_LORDS[$lordIdx];
            $lordYears = self::$VIMSHOTTARI_YEARS[$lordName];
            
            $spanMinutes = ($lordYears / $totalYears) * $totalMinutes;
            $currentMinute += $spanMinutes;

            if ($arcMinutesInNak <= $currentMinute - 0.0001) { // Floating point buffer
                return $lordName;
            }
        }

        return self::$VIMSHOTTARI_LORDS[($startIndex + 8) % 9];
    }

    /**
     * Get the next end boundary degree for the current sub lord.
     * Used for calculating exact transition times.
     */
    public static function getNextSubBoundary($longitude) {
        $longitude = fmod($longitude, 360);
        if ($longitude < 0) $longitude += 360;

        $nakIdx = floor($longitude / (360 / 27));
        $nakStartDegree = $nakIdx * (360 / 27);
        $degreeInNak = $longitude - $nakStartDegree;
        $nakLord = self::$NAKSHATRA_LORDS[$nakIdx];

        $arcMinutesInNak = $degreeInNak * 60;
        $totalMinutes = 800;
        $totalYears = 120;
        
        $startIndex = array_search($nakLord, self::$VIMSHOTTARI_LORDS);
        $currentMinute = 0;
        
        for ($i = 0; $i < 9; $i++) {
            $lordIdx = ($startIndex + $i) % 9;
            $lordName = self::$VIMSHOTTARI_LORDS[$lordIdx];
            $lordYears = self::$VIMSHOTTARI_YEARS[$lordName];
            
            $spanMinutes = ($lordYears / $totalYears) * $totalMinutes;
            $currentMinute += $spanMinutes;
            
            // If the boundary is ahead of current position
            // Use a small epsilon to avoid returning the current boundary we are just sitting on
            if ($currentMinute > $arcMinutesInNak + 0.001) {
                $endDegree = $nakStartDegree + ($currentMinute / 60);
                return fmod($endDegree, 360);
            }
        }
        
        // Fallback: End of Nakshatra (should be covered by loop, but safe fallback)
        $endDegree = $nakStartDegree + (360 / 27);
        return fmod($endDegree, 360);
    }


    
    
    /**
     * Calculate Muhurtham Score (Professional Logic)
     */
    /**
     * Calculate Detailed Significations for a Planet
     * Returns: [
     *   'occupies' => house,
     *   'owns' => [houses],
     *   'starLord' => planetName,
     *   'subLord' => planetName
     * ]
     */
    
    private static $NAK_LORDS = [
        'Ashwini' => 'Ketu', 'Bharani' => 'Venus', 'Krittika' => 'Sun',
        'Rohini' => 'Moon', 'Mrigashirsha' => 'Mars', 'Ardra' => 'Rahu',
        'Punarvasu' => 'Jupiter', 'Pushya' => 'Saturn', 'Ashlesha' => 'Mercury',
        'Magha' => 'Ketu', 'Purva Phalguni' => 'Venus', 'Uttara Phalguni' => 'Sun',
        'Hasta' => 'Moon', 'Chitra' => 'Mars', 'Swati' => 'Rahu',
        'Vishakha' => 'Jupiter', 'Anuradha' => 'Saturn', 'Jyeshtha' => 'Mercury',
        'Mula' => 'Ketu', 'Purva Ashadha' => 'Venus', 'Uttara Ashadha' => 'Sun',
        'Shravana' => 'Moon', 'Dhanishta' => 'Mars', 'Shatabhisha' => 'Rahu',
        'Purva Bhadrapada' => 'Jupiter', 'Uttara Bhadrapada' => 'Saturn', 'Revati' => 'Mercury'
    ];

    private static $GMP_RULES = [
        ['Venus', 'Moon', 'Jupiter'],   // 1
        ['Mercury', 'Mars', 'Sun'],     // 2
        ['Moon', 'Mercury', 'Venus'],    // 3
        ['Sun', 'Venus', 'Mercury'],    // 4
        ['Mercury', 'Moon', 'Moon'],    // 5
        ['Venus', 'Jupiter', 'Sun'],    // 6
        ['Mars', 'Saturn', 'Mercury'],  // 7
        ['Mars', 'Mercury', 'Saturn'],  // 8
        ['Jupiter', 'Venus', 'Saturn'], // 9
        ['Saturn', 'Mars', 'Jupiter'],  // 10
        ['Saturn', 'Jupiter', 'Jupiter'], // 11
        ['Jupiter', 'Saturn', 'Venus']  // 12
    ];

    public static function calculateMuhurthamScore(&$entry, $chartInfo) {
        $reasons = [];
        $influences = [];
        
        $currentSign = $entry['sign'];
        $currentNak = $entry['nakshatra'];
        $currentSubLord = $entry['subLord'];

        $signIdx = array_search($currentSign, self::$SIGNS);
        $signLord = self::getSignLord($signIdx);
        $nakLord = self::$NAK_LORDS[$currentNak] ?? '';
        
        // Find Lords of relevant houses for default 11th lord rule
        $lord8 = self::getSignLord(array_search(self::$SIGNS[(array_search(self::getHouseSign($chartInfo['houses'][8]), self::$SIGNS))], self::$SIGNS)); 
        // More direct: 8th cusp sign lord
        $cusp8SignIdx = floor($chartInfo['houses'][8] / 30);
        $lord8 = self::getSignLord($cusp8SignIdx);
        
        $lord11 = self::getSignLord(($signIdx + 10) % 12);
        
        // Identify Planets physically in 8th House
        $planetsIn8 = [];
        $cusp8 = $chartInfo['houses'][8];
        $cusp9 = $chartInfo['houses'][9];
        foreach ($chartInfo['planets'] as $pName => $pLong) {
            if (self::isPlanetInHouseRange($pLong, $cusp8, $cusp9)) {
                $planetsIn8[] = $pName;
            }
        }

        // --- NEW: GMP Rule Check (Prioritized) ---
        $isGMP = false;
        foreach (self::$GMP_RULES as $rule) {
            if ($signLord === $rule[0] && $nakLord === $rule[1] && $currentSubLord === $rule[2]) {
                $isGMP = true;
                break;
            }
        }

        if ($isGMP) {
            $score = 100;
            $decision = 'GOOD (GMP)';
            $reasons[] = "GMP Success: $signLord / $nakLord / $currentSubLord matched Rule.";
            $reasons[] = "3/11 GMP விதிப்படி $signLord / $nakLord / $currentSubLord சேர்க்கை மிகச்சிறந்த நேரம் (GOOD TIME).";
        } else if ($currentSubLord === $lord11) {
            $score = 100;
            $decision = 'GOOD';
            $reasons[] = "Match: Sub Lord ($currentSubLord) is the 11th Lord of $currentSign.";
            $reasons[] = "$currentSign லக்னத்திற்கு 11-ஆம் அதிபதி $currentSubLord சுப அதிபதியாக வந்துள்ளார்.";
        } else {
            $score = 0;
            $decision = 'BAD';
            $reasons[] = "Mismatch: Sub Lord ($currentSubLord) is not the 11th Lord ($lord11) of $currentSign.";
            $reasons[] = "$currentSign லக்னத்திற்கு 11-ஆம் அதிபதி $lord11. ஆனால் இங்கு $currentSubLord வந்துள்ளார்.";
        }

        // --- NEW: 8th House Negative Rule (REJECTION) ---
        // Check triplet: Sign Lord, Nak Lord, Sub Lord
        $triplet = [$signLord, $nakLord, $currentSubLord];
        $rejected8 = false;
        $rejectReason = "";

        foreach ($triplet as $lord) {
            if (empty($lord)) continue;
            $pLong = $chartInfo['planets'][$lord] ?? null;
            if ($pLong === null) continue;

            // 1. Physically in 8th?
            if (in_array($lord, $planetsIn8)) {
                $rejected8 = true;
                $rejectReason = "$lord 8-ஆம் வீட்டில் உள்ளார்.";
                break;
            }

            // Get Star Lord of this lord
            $lStarLord = self::getKPLords($pLong)['nakLord'];

            // 2. Is Star Lord the 8th Lord?
            if ($lStarLord === $lord8) {
                $rejected8 = true;
                $rejectReason = "$lord, 8-ஆம் அதிபதி $lord8-இன் நட்சத்திரத்தில் உள்ளார்.";
                break;
            }

            // 3. Is Star Lord physically in 8th house?
            if (in_array($lStarLord, $planetsIn8)) {
                $rejected8 = true;
                $rejectReason = "$lord, 8-ஆம் வீட்டில் இருக்கும் $lStarLord-இன் நட்சத்திரத்தில் உள்ளார்.";
                break;
            }
        }

        if ($rejected8) {
            $score = 0;
            $decision = 'BAD';
            $reasons[] = "8th House Rejection: $rejectReason Time is BAD.";
            $reasons[] = "கவனம்: $rejectReason என்பதால் இது முகூர்த்தத்திற்கு உகந்த நேரம் அல்ல.";
        }

        // Finalize
        $entry['muhurtham'] = [
            'score' => $score,
            'decision' => $decision,
            'reasons' => $reasons,
            'influences' => [$lord11 => "11th Lord", $lord8 => "8th Lord"]
        ];
    }

    private static function isPlanetInHouseRange($pLong, $cuspStart, $cuspEnd) {
        if ($cuspEnd > $cuspStart) {
            return ($pLong >= $cuspStart && $pLong < $cuspEnd);
        } else {
            // Wrap around 360
            return ($pLong >= $cuspStart || $pLong < $cuspEnd);
        }
    }

    private static function getHouseSign($longitude) {
        $idx = floor($longitude / 30);
        return self::$SIGNS[$idx % 12];
    }
    
    public static function getSignLord($signIdx) {
        $map = [
            'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 
            'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
        ];
        return $map[$signIdx % 12];
    }


    public static function decimalToDms($deg) {
        $deg = fmod($deg, 360);
        if ($deg < 0) $deg += 360;
        
        $signIdx = floor($deg / 30);
        $d = $deg - ($signIdx * 30);
        
        $degInt = floor($d);
        $minTotal = ($d - $degInt) * 60;
        $minInt = floor($minTotal);
        $sec = ($minTotal - $minInt) * 60;
        
        return sprintf("%02d° %02d' %02d\"", $degInt, $minInt, round($sec));
    }

    public static function getBatchKPChart($startTime, $steps, $lat, $lon, $sidMode, $swetestPath, $epheDir) {
        $results = [];
        $epheDir = rtrim($epheDir, DIRECTORY_SEPARATOR);
        
        $dateStr = date('d.m.Y', $startTime);
        $timeStr = date('H:i:s', $startTime);
        
        // Step 1 minute. swetest uses seconds or fractional days for -s
        // -s1m works in some versions, but -s0.00069444444 is safer.
        // Actually -s1m is supported in newer ones.
        $cmd = "\"$swetestPath\" -edir\"$epheDir\" -b$dateStr -ut$timeStr -geopos$lon,$lat,0 -house -sid$sidMode -n$steps -s1m -fPl -p0123456t -head";
        
        $res = shell_exec($cmd . " 2>&1");
        if (!$res) return [];
        
        $lines = explode("\n", $res);
        $currentChart = ['houses' => [], 'planets' => []];
        $chartCount = 0;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            $parts = preg_split('/\s+/', $line);
            if (count($parts) < 2) continue;
            
            $name = $parts[0];
            
            // New block detection (House 1 or Sun depending on order)
            if (($name === 'house' && $parts[1] == '1') || ($name === 'Sun' && empty($currentChart['planets']))) {
                if (!empty($currentChart['houses']) && !empty($currentChart['planets'])) {
                    // Ketu
                    if (isset($currentChart['planets']['Rahu'])) {
                        $currentChart['planets']['Ketu'] = fmod($currentChart['planets']['Rahu'] + 180, 360);
                    }
                    $results[] = $currentChart;
                    $currentChart = ['houses' => [], 'planets' => []];
                }
            }
            
            if ($name === 'house') {
                $hIdx = (int)$parts[1];
                $val = (float)$parts[2];
                $currentChart['houses'][$hIdx] = $val;
            } else if ($name === 'true' && isset($parts[2])) {
                // node (Rahu)
                $currentChart['planets']['Rahu'] = (float)$parts[2];
            } else {
                // Direct Planet names
                $planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
                foreach ($planetNames as $p) {
                    if (stripos($name, $p) !== false) {
                        $currentChart['planets'][$p] = (float)$parts[1];
                        break;
                    }
                }
            }
        }
        
        // Push last
        if (!empty($currentChart['houses']) && !empty($currentChart['planets'])) {
            if (isset($currentChart['planets']['Rahu'])) {
                $currentChart['planets']['Ketu'] = fmod($currentChart['planets']['Rahu'] + 180, 360);
            }
            $results[] = $currentChart;
        }
        
        return $results;
    }
}
