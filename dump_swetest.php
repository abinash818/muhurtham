<?php
$isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
$SWETEST_PATH = realpath($isWindows ? './swetest.exe' : './swetest');
$EPHE_PATH = realpath('./ephe');
$epheDir = rtrim($EPHE_PATH, DIRECTORY_SEPARATOR);

$cmd = "$SWETEST_PATH -edir$epheDir -b01.01.1990 -ut06:30:00 -geopos80.27,13.08,0 -house -sid5 -fPl -head -n1";
$res = shell_exec($cmd . " 2>&1");
file_put_contents('raw_swetest_output.txt', $res);
echo "Dumped to raw_swetest_output.txt\n";
