<?php
set_time_limit(0);
// Check speed of 10 calls
$count = 10;
$cmd = "C:\\Users\\abina\\kp-standalone\\swetest.exe -edirC:\\Users\\abina\\kp-standalone\\ephe -b01.01.1990 -ut12:00:00 -geopos80.27,13.08,0 -house -sid5 -fPl -head -n1";

$start = microtime(true);
for ($i = 0; $i < $count; $i++) {
    shell_exec($cmd . " 2>&1");
}
$end = microtime(true);

$total = $end - $start;
$avg = $total / $count;

echo "Total time for $count runs: " . number_format($total, 4) . "s\n";
echo "Average time per run: " . number_format($avg, 4) . "s\n";
