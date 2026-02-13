<?php
$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$SWETEST_PATH = realpath($isWindows ? './swetest.exe' : './swetest');
$EPHE_PATH = realpath('./ephe');

$cmd = "$SWETEST_PATH -edir\"$EPHE_PATH\" -b13.02.2026 -ut12:00 -geopos80.27,13.08,0 -house -sid5 -fPl -p0123456t -n2 -s0.000694444 -head";
echo "Command: $cmd\n";
echo "---------------------------------------------------\n";
echo shell_exec($cmd);
?>
