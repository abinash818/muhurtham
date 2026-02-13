<?php
$epheDir = realpath('./ephe');
$cmd = "C:\\Users\\abina\\kp-standalone\\swetest.exe -edir\"$epheDir\" -b01.01.1990 -p0 -head";
echo "Command: $cmd\n";
$start = microtime(true);
system($cmd, $retval);
$end = microtime(true);
echo "\nReturn: $retval\n";
echo "Time: " . ($end - $start) . "s\n";
