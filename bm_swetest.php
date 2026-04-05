<?php
require_once 'KPUtils.php';

$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$SWETEST_PATH = realpath($isWindows ? './swetest.exe' : './swetest');
$EPHE_PATH = realpath('./ephe');

$t1 = microtime(true);
$chart = KPUtils::getKPChart(time(), 13.08, 80.27, 5, $SWETEST_PATH, $EPHE_PATH);
$t2 = microtime(true);

echo "Single Call Time: " . number_format(($t2 - $t1) * 1000, 2) . " ms\n";

if ($chart) {
    echo "Chart count: PLANETS=" . count($chart['planets']) . ", HOUSES=" . count($chart['houses']) . "\n";
} else {
    echo "FAILED to get chart.\n";
}

echo "Simulating 250 calls...\n";
$start = microtime(true);
for ($i=0; $i<10; $i++) {
    KPUtils::getKPChart(time() + ($i*300), 13.08, 80.27, 5, $SWETEST_PATH, $EPHE_PATH);
}
$end = microtime(true);
$avg = ($end - $start) / 10;
echo "Average (over 10 calls): " . number_format($avg * 1000, 2) . " ms\n";
echo "Projected 250 calls: " . number_format($avg * 250, 2) . " seconds\n";
?>
