<?php
$start = microtime(true);

// Emulate an API call to kp_api.php
// We can't include kp_api.php directly easily because it echoes JSON.
// So we use shell_exec to call it via CLI-php or just curl.
// CLI-php is safer.

echo "Running kp_api.php speed test...\n";
$output = shell_exec("c:\\xampp\\php\\php.exe kp_api.php");
$end = microtime(true);

$duration = $end - $start;
echo "Time taken: " . number_format($duration, 4) . " seconds.\n";

$json = json_decode($output, true);
if ($json) {
    echo "Timeline entries: " . count($json['timeline']) . "\n";
    if (isset($json['bestTime'])) {
        echo "Best Time found: " . print_r($json['bestTime']['muhurtham']['score'], true) . "\n";
    }
} else {
    echo "Failed to decode JSON output.\n";
    // echo substr($output, 0, 500);
}
?>
