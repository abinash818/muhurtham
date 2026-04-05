<?php
$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$SWETEST_PATH = realpath($isWindows ? './swetest.exe' : './swetest');
$EPHE_PATH = realpath('./ephe');

$epheDir = rtrim($EPHE_PATH, DIRECTORY_SEPARATOR);
$dateStr = "13.02.2026";
$timeStr = "12:00";
$lat = 13.08;
$lon = 80.27;
$sidMode = 5;

// Test 1440 steps (1 min)
$count = 1440;
$stepInDays = 0.00069444444; 

$cmd = "$SWETEST_PATH -edir\"$epheDir\" -b$dateStr -ut$timeStr -geopos$lon,$lat,0 -house -sid$sidMode -fPl -p0123456t -n$count -s$stepInDays -head";

echo "Running Batch 1440 steps...\n";
$t1 = microtime(true);
$res = shell_exec($cmd);
$t2 = microtime(true);

echo "1440 steps took: " . number_format(($t2 - $t1) * 1000, 2) . " ms\n";
echo "Output length: " . strlen($res) . " chars\n";

// Test 360 steps (4 min)
$count = 360;
$stepInDays = 0.00277777778; 
$cmd = "$SWETEST_PATH -edir\"$epheDir\" -b$dateStr -ut$timeStr -geopos$lon,$lat,0 -house -sid$sidMode -fPl -p0123456t -n$count -s$stepInDays -head";

echo "Running Batch 360 steps...\n";
$t1 = microtime(true);
$res = shell_exec($cmd);
$t2 = microtime(true);

echo "360 steps took: " . number_format(($t2 - $t1) * 1000, 2) . " ms\n";
echo "Output length: " . strlen($res) . " chars\n";

?>
