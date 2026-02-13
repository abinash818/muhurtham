<?php
require_once 'KPUtils.php';

$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$SWETEST_PATH = realpath($isWindows ? './swetest.exe' : './swetest');
$EPHE_PATH = realpath('./ephe');

echo "Testing getBatchKPChart...\n";
$start = time();
$charts = KPUtils::getBatchKPChart($start, 10, 13.08, 80.27, 5, $SWETEST_PATH, $EPHE_PATH);

echo "Fetched " . count($charts) . " charts.\n";

if (count($charts) > 0) {
    echo "First Chart (Index 0):\n";
    print_r($charts[0]);
    
    echo "Last Chart (Index " . (count($charts)-1) . "):\n";
    print_r($charts[count($charts)-1]);
} else {
    echo "No charts returned.\n";
}
?>
