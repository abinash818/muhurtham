<?php
// validate_json.php
// Validates the KP Engine Output against Mandatory Rules

$jsonFile = $argv[1] ?? 'verify_24h_output.json';

if (!file_exists($jsonFile)) {
    die("Error: File $jsonFile not found.\n");
}

$data = json_decode(file_get_contents($jsonFile), true);
if (!$data || !isset($data['timeline'])) {
    die("Error: Invalid JSON format.\n");
}

$timeline = $data['timeline'];
$errors = [];
$warnings = [];

$vimshottari = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

$prevToTime = null;

echo "Validating " . count($timeline) . " entries...\n";

foreach ($timeline as $i => $row) {
    // Parse times
    $from = strtotime($row['from']);
    $to = strtotime($row['to']);
    $duration = $row['durationSeconds'];
    
    // 1. Duration Check
    if ($duration < 60) {
        // Allow last entry to be short?
        if ($i < count($timeline) - 1) {
             $errors[] = "Row $i: Duration $duration is < 60s.";
        } else {
             $warnings[] = "Row $i (Last): Duration $duration is < 60s (acceptable at cutoff).";
        }
    }
    
    // 2. Continuity Check
    if ($prevToTime !== null) {
        $expectedFrom = $prevToTime + 1; // Strict +1s rule
        // Allow for ISO parsing nuance? microseconds? 
        // Our PHP outputs .000Z, so strtotime should be precise to second.
        
        if ($from !== $expectedFrom) {
             $errors[] = "Row $i: Gap/Overlap detected. From " . date('H:i:s', $from) . 
                         " expected " . date('H:i:s', $expectedFrom) . 
                         " (Prev End: " . date('H:i:s', $prevToTime) . ")";
        }
    }
    
    // 3. Vimshottari Check
    if ($i > 0) {
        $prevSub = $timeline[$i-1]['subLord'];
        $currSub = $row['subLord'];
        $prevNak = $timeline[$i-1]['nakshatra'];
        $currNak = $row['nakshatra'];
        
        if ($prevNak === $currNak) {
            $prevIdx = array_search($prevSub, $vimshottari);
            $currIdx = array_search($currSub, $vimshottari);
            $expectedIdx = ($prevIdx + 1) % 9;
            
            if ($currIdx !== $expectedIdx) {
                // Check if validation note exists (Smart Merge)
                if (isset($row['validation_note'])) {
                    $warnings[] = "Row $i: Vimshottari skip flagged: " . $row['validation_note'];
                } else {
                    $errors[] = "Row $i: Vimshottari Order Break! $prevSub -> $currSub (Nak: $currNak)";
                }
            }
        }
    }
    
    // 4. Input Validity
    if (!in_array($row['subLord'], $vimshottari)) {
        $errors[] = "Row $i: Invalid Sub Lord '" . $row['subLord'] . "'";
    }

    $prevToTime = $to;
}

echo "\n--- Validation Report ---\n";
if (empty($errors)) {
    echo "SUCCESS: Timeline Passed Mandatory Validation.\n";
} else {
    echo "FAILED: " . count($errors) . " errors found.\n";
    foreach ($errors as $e) echo " - $e\n";
}

if (!empty($warnings)) {
    echo "\nWarnings:\n";
    foreach ($warnings as $w) echo " - $w\n";
}
