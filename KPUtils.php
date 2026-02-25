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
    public static function getPlanetDetails($planetName, $chart) {
        // Find planet longitude
        $lon = $chart['planets'][$planetName] ?? 0;
        
        // Find Occupied House
        // House spans from Cusp N to Cusp N+1
        $occupiedHouse = 0;
        $houses = $chart['houses']; // 1..12
        
        for ($i = 1; $i <= 12; $i++) {
            $next = ($i == 12) ? 1 : $i + 1;
            $cusp = $houses[$i];
            $nextCusp = $houses[$next];
            
            // Handle wrap
            if ($nextCusp < $cusp) {
                if ($lon >= $cusp || $lon < $nextCusp) {
                    $occupiedHouse = $i;
                    break;
                }
            } else {
                if ($lon >= $cusp && $lon < $nextCusp) {
                    $occupiedHouse = $i;
                    break;
                }
            }
        }
        
        // Find Owned Houses
        // Sign of Cusp N -> Lord of Sign = Owner
        $ownedHouses = [];
        // Map Planet -> Signs Owned
        $signLords = [
            'Mars' => [1, 8], 'Venus' => [2, 7], 'Mercury' => [3, 6],
            'Moon' => [4], 'Sun' => [5], 
            'Jupiter' => [9, 12], 'Saturn' => [10, 11]
        ];
        
        foreach ($houses as $hNum => $cuspLon) {
             $sign = floor($cuspLon / 30) + 1; // 1..12
             foreach ($signLords as $lord => $signs) {
                 if (in_array($sign, $signs) && $lord === $planetName) {
                     $ownedHouses[] = $hNum;
                 }
             }
        }
        
        // Star Lord & Sub Lord of the Planet itself
        $lords = self::getKPLords($lon);
        
        return [
            'name' => $planetName,
            'occupies' => [$occupiedHouse],
            'owns' => $ownedHouses,
            'starLord' => $lords['nakLord'],
            'subLord' => $lords['subLord']
        ];
    }
    
    /**
     * Get Chain Significations for Rejection Logic
     * Returns all unique houses signified by Level 1, 2, 3
     */
    public static function getChainSignifications($planetName, $chart) {
        $pDetails = self::getPlanetDetails($planetName, $chart);
        $starLordName = $pDetails['starLord'];
        $subLordName = $pDetails['subLord'];
        
        $starDetails = self::getPlanetDetails($starLordName, $chart);
        $subDetails = self::getPlanetDetails($subLordName, $chart);
        
        // Level 1: Planet Itself
        $l1 = array_merge($pDetails['occupies'], $pDetails['owns']);
        
        // Level 2: Star Lord
        $l2 = array_merge($starDetails['occupies'], $starDetails['owns']);
        
        // Level 3: Sub Lord
        $l3 = array_merge($subDetails['occupies'], $subDetails['owns']);
        
        return [
            'planet' => $planetName,
            'star' => $starLordName,
            'sub' => $subLordName,
            'all' => array_unique(array_merge($l1, $l2, $l3))
        ];
    }
    
    public static function calculateMuhurthamScore(&$entry, $chartInfo) {
        $score = 50; // Neutral Base
        $reasons = [];
        $influences = [];
        
        $planets = $chartInfo['planets'];
        $houses = $chartInfo['houses'];
        
        $lagnaSub = $entry['subLord'];
        $lagnaStar = $entry['nakLord'];
        $lagnaSign = $entry['sign'];
        $lagnaSignLord = self::getSignLord(array_search($lagnaSign, self::$SIGNS));

        // ---------------------------------------------------------
        // 1. Prepare Planet Data (Significations)
        // ---------------------------------------------------------
        
        $houseOwners = [];
        foreach ($houses as $h => $cusp) {
            $sign = floor($cusp / 30);
            $houseOwners[$h] = self::getSignLord($sign);
        }
        
        $planetData = []; 
        foreach ($planets as $p => $lon) {
             $inHouse = self::getHouseOccupancy($lon, $houses);
             $lords = self::getKPLords($lon);
             $owns = [];
             foreach ($houseOwners as $h => $lord) {
                 if ($lord === $p) $owns[] = $h;
             }
             $planetData[$p] = [
                 'in' => $inHouse,
                 'owns' => $owns,
                 'star' => $lords['nakLord'],
                 'sub' => $lords['subLord']
             ];
        }

        // Helper to get Full Significations (Level 1 + 2)
        $getSigs = function($pName) use ($planetData) {
            $p = $planetData[$pName] ?? null;
            if (!$p) return [];
            $sigs = [$p['in']];
            foreach ($p['owns'] as $h) $sigs[] = $h;
            // Star Lord
            $star = $p['star'];
            if (isset($planetData[$star])) {
                $sigs[] = $planetData[$star]['in'];
                foreach ($planetData[$star]['owns'] as $h) $sigs[] = $h;
            }
            return array_unique($sigs);
        };

        // ---------------------------------------------------------
        // 2. Hierarchical Scoring Logic
        // ---------------------------------------------------------
        
        $roles = [
            'Lagna Sub' => ['lord' => $lagnaSub, 'weight' => 1.0],
            'Lagna Star' => ['lord' => $lagnaStar, 'weight' => 0.6],
            'Moon' => ['lord' => 'Moon', 'weight' => 0.6],
            'Lagna Sign' => ['lord' => $lagnaSignLord, 'weight' => 0.3]
        ];

        foreach ($roles as $label => $data) {
            $lord = $data['lord'];
            $weight = $data['weight'];
            $sigs = $getSigs($lord);
            
            $posSigs = array_intersect($sigs, [2, 6, 10, 11]);
            $negSigs = array_intersect($sigs, [5, 8, 9, 12]);
            $isMixed = (count($posSigs) > 0 && count($negSigs) > 0);
            
            $pScore = 0;
            if (in_array(2, $sigs) || in_array(11, $sigs)) $pScore += 25;
            if (in_array(6, $sigs) || in_array(10, $sigs)) $pScore += 15;
            
            $nScore = 0;
            if (in_array(8, $sigs) || in_array(12, $sigs)) $nScore -= 30;
            if (in_array(5, $sigs) || in_array(9, $sigs)) $nScore -= 15;

            // Mixed Modifier
            $finalP = ($isMixed) ? $pScore * 0.5 : $pScore;
            $roleTotal = ($finalP + $nScore) * $weight;
            
            $score += $roleTotal;
            
            $status = $isMixed ? "(Mixed)" : "";
            $reasons[] = "{$label} ({$lord}) {$status} -> Wt:" . ($weight*100) . "% Sum:" . round($roleTotal, 1);
            $influences[$lord] = implode(",", $sigs);
        }

        // ---------------------------------------------------------
        // 2b. Cuspal Confirmation (2, 6, 10, 11)
        // ---------------------------------------------------------
        $cuspTargets = [
            2 => [2, 11],
            6 => [6, 11, 2],
            10 => [10, 11],
            11 => [11, 2]
        ];

        foreach ($cuspTargets as $hNum => $targetHouses) {
            $cuspLon = $houses[$hNum];
            $cuspLords = self::getKPLords($cuspLon);
            $cuspSub = $cuspLords['subLord'];
            $subSigs = $getSigs($cuspSub);
            
            if (count(array_intersect($subSigs, $targetHouses)) > 0) {
                $bonus = 10; // Confirmation Bonus
                $score += $bonus;
                $reasons[] = "Cusp $hNum Sub ($cuspSub) confirms success [+10]";
            }
        }

        // ---------------------------------------------------------
        // 3. Advanced Rejection Rules (Global)
        // ---------------------------------------------------------
        $reject = false;
        $rejectReason = "";
        
        // Re-calculate Level 1 (Star) for Lagna Sub strictly for Rejection
        $lsPData = $planetData[$lagnaSub] ?? null;
        if ($lsPData) {
            $star = $lsPData['star'];
            $starData = $planetData[$star] ?? null;
            if ($starData) {
                $l1Sigs = array_merge([$starData['in']], $starData['owns']);
                $badGroup = [5, 8, 9, 12];
                $mitigation = [2, 11];
                
                if (count(array_intersect($l1Sigs, $badGroup)) > 0) {
                    if (count(array_intersect($l1Sigs, $mitigation)) === 0) {
                        $reject = true;
                        $rejectReason = "Lagna Sub's Star signifies negative houses without mitigation.";
                    }
                }
            }
        }

        // Special Lagna Filters
        if ($lagnaSign === 'Taurus' && !$reject) {
            if ($lagnaSub === 'Jupiter' || $lagnaStar === 'Jupiter') {
                 $jupSigs = $getSigs('Jupiter');
                 if (count(array_intersect($jupSigs, [5, 8, 9, 12])) > 0) {
                     $reject = true; $rejectReason = "Taurus: Jupiter bad connection.";
                 }
            }
        }
        if ($lagnaSign === 'Scorpio' && !$reject) {
            if ($lagnaSub === 'Mercury' || $lagnaStar === 'Mercury') {
                 $merSigs = $getSigs('Mercury');
                 if (count(array_intersect($merSigs, [5, 8, 9, 12])) > 0) {
                     $reject = true; $rejectReason = "Scorpio: Mercury bad connection.";
                 }
            }
        }

        if ($reject) {
            $score = 15;
            $entry['muhurtham']['reject'] = true;
            $reasons[] = "REJECTED: $rejectReason";
        } else {
            $entry['muhurtham']['reject'] = false;
        }

        // Finalize
        if ($score > 100) $score = 100;
        if ($score < 0) $score = 0;
        
        $entry['muhurtham']['score'] = round($score);
        $entry['muhurtham']['decision'] = ($score >= 70) ? 'GOOD' : (($score < 40) ? 'BAD' : 'NEUTRAL');
        $entry['muhurtham']['reasons'] = $reasons;
        $entry['muhurtham']['influences'] = $influences;
    }
    
    public static function getSignLord($signIdx) {
        $map = [
            'Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 
            'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'
        ];
        return $map[$signIdx % 12];
    }

    public static function getHouseOccupancy($longitude, $houses) {
        for ($i = 1; $i <= 11; $i++) {
            $c1 = $houses[$i];
            $c2 = $houses[$i + 1];
            if ($c2 < $c1) { // Crosses 360
                if ($longitude >= $c1 || $longitude < $c2) return $i;
            } else {
                if ($longitude >= $c1 && $longitude < $c2) return $i;
            }
        }
        return 12; // Must be in 12th
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
