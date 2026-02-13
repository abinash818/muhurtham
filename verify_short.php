<?php
// Short verification script (2 hours)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'KPUtils.php';

$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$SWETEST_PATH = realpath($isWindows ? './swetest.exe' : './swetest');
if (!$SWETEST_PATH) {
    $SWETEST_PATH = $isWindows ? '.\\swetest.exe' : './swetest';
}
$EPHE_PATH = realpath('./ephe');
if (!$EPHE_PATH) {
    $EPHE_PATH = './ephe';
}

function getAscendant($utcTimestamp, $lat, $lon, $sidMode) {
    global $SWETEST_PATH, $EPHE_PATH;
    
    $d = getdate((int)$utcTimestamp);
    $frac = $utcTimestamp - (int)$utcTimestamp;
    $seconds = $d['seconds'] + $frac;
    
    $dateStr = sprintf("%02d.%02d.%04d", $d['mday'], $d['mon'], $d['year']);
    $timeStr = sprintf("%02d:%02d:%02.4f", $d['hours'], $d['minutes'], $seconds);
    $epheDir = rtrim($EPHE_PATH, DIRECTORY_SEPARATOR);
    
    $cmd = "$SWETEST_PATH -edir\"$epheDir\" -b$dateStr -ut$timeStr -geopos$lon,$lat,0 -house -sid$sidMode -fPl -head -n1";
    
    $res = shell_exec($cmd . " 2>&1");
    if (!$res) return null;
    
    $output = explode("\n", $res);
    foreach ($output as $line) {
        $line = trim($line);
        if (preg_match('/(?:house\s+1|Ascendant|cusp\s+1:)\s+([\d\.]+)/i', $line, $matches)) {
            return (float)$matches[1];
        }
    }
    return null;
}

function seekBoundaryTime($startTime, $startAsc, $targetDegree, $lat, $lon, $sidMode) {
    $t = $startTime;
    $asc = $startAsc;
    $diff = $targetDegree - $asc;
    
    if ($diff < -180) $diff += 360;
    if ($diff > 180) $diff -= 360;
    if ($diff < 0) $diff += 360; 

    $secondsToTravel = $diff * 240;
    $currentT = $t;
    
    for ($i = 0; $i < 5; $i++) {
        $tAttempt = $currentT + $secondsToTravel;
        $ascAttempt = getAscendant($tAttempt, $lat, $lon, $sidMode);
        if ($ascAttempt === null) return $tAttempt; 
        
        $diffAttempt = $targetDegree - $ascAttempt;
        if ($diffAttempt < -180) $diffAttempt += 360;
        if ($diffAttempt > 180) $diffAttempt -= 360;
        
        if (abs($diffAttempt) < 0.0001) {
            return $tAttempt;
        }
        
        $secondsToTravel = $diffAttempt * 240;
        $currentT = $tAttempt;
    }
    
    return $currentT;
}

$year = 1990;
$month = 1;
$day = 1;
$hour = 12;
$minute = 0;
$lat = 13.08;
$lon = 80.27;
$tz = 5.5;
$ayanamsa = 'KP';

$sidMode = 5;
$localTimeStr = "$year-$month-$day $hour:$minute:00";
$startTimestamp = strtotime($localTimeStr) - ($tz * 3600);
$endTimestamp = $startTimestamp + (2 * 3600); // ONLY 2 HOURS

$timeline = [];
$currentTime = $startTimestamp;
$maxSteps = 300;
$stepCount = 0;
$lastToTime = null; 

while ($currentTime < $endTimestamp && $stepCount < $maxSteps) {
    $stepCount++;
    
    $entryStart = ($lastToTime !== null) ? $lastToTime + 1 : $currentTime;
    
    $searchTime = $entryStart;
    $validDurationFound = false;
    $lookaheadCount = 0;
    
    $baseAsc = getAscendant($entryStart, $lat, $lon, $sidMode);
    if ($baseAsc === null) break;
    $lords = KPUtils::getKPLords($baseAsc);
    $dms = KPUtils::decimalToDms($baseAsc);
    
    $finalEndTime = $entryStart;
    
    // FIX 3: Minimum Duration Safety Clamp
    while (!$validDurationFound && $lookaheadCount < 5) {
        $asc = getAscendant($searchTime, $lat, $lon, $sidMode);
        if ($asc === null) break 2;
        
        $nextBoundary = KPUtils::getNextSubBoundary($asc);
        $exactEndTime = seekBoundaryTime($searchTime, $asc, $nextBoundary, $lat, $lon, $sidMode);
        
        // Ensure we advance at least 1 second if stuck
        if ($exactEndTime <= $searchTime) {
            $exactEndTime = $searchTime + 1;
        }
        
        // FIX 4: Deterministic Output (Rounding)
        $endTimeRounded = round($exactEndTime);
        $duration = $endTimeRounded - $entryStart; 
        
        if ($duration >= 60) {
            $validDurationFound = true;
            $finalEndTime = $endTimeRounded;
        } else {
            // Too short, merge with next.
            $searchTime = $exactEndTime + 1; 
            $lookaheadCount++;
            
            // Smart Merge: Adopt label of next segment
            if ($lookaheadCount < 5) {
                // Peek at next Ascendant to switch Lords
                $nextAsc = getAscendant($searchTime, $lat, $lon, $sidMode);
                if ($nextAsc !== null) {
                   $lords = KPUtils::getKPLords($nextAsc);
                }
            }
        }
    }
    
    // Clamp to window end
    if ($finalEndTime > $endTimestamp) {
        $finalEndTime = $endTimestamp;
    }
    
    $duration = $finalEndTime - $entryStart;
    if ($duration <= 0) break; 

    $timeline[] = [
        'sign' => $lords['sign'],
        'nakshatra' => $lords['nakshatra'],
        'subLord' => $lords['subLord'],
        'longitude' => $dms,
        'from' => date('Y-m-d\TH:i:s.000\Z', $entryStart + ($tz * 3600)),
        'to' => date('Y-m-d\TH:i:s.000\Z', $finalEndTime + ($tz * 3600)),
        'durationSeconds' => $duration,
        'formattedDuration' => gmdate("i\m s\s", $duration)
    ];
    
    if ($finalEndTime >= $endTimestamp) break;

    // Advance
    $lastToTime = $finalEndTime;
    $currentTime = $finalEndTime; 
}

// Run Validation
function validateTimeline(&$timeline) {
    $vimshottari = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    
    for ($i = 0; $i < count($timeline) - 1; $i++) {
        $currentSub = $timeline[$i]['subLord'];
        $nextSub = $timeline[$i+1]['subLord'];
        
        if ($timeline[$i]['nakshatra'] === $timeline[$i+1]['nakshatra']) {
            $currIdx = array_search($currentSub, $vimshottari);
            $nextIdx = array_search($nextSub, $vimshottari);
            $expectedNextIdx = ($currIdx + 1) % 9;
            
            if ($nextIdx !== $expectedNextIdx) {
               $timeline[$i+1]['validation_note'] = "Sequence skip detected (likely due to merge)";
            }
        }
    }
}
validateTimeline($timeline);

echo json_encode([
    "timeline" => $timeline
]);
