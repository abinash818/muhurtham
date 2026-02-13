<?php
require_once 'KPUtils.php';

echo "Testing Engine Upgrade (Hierarchical Scoring & Cuspal Confirmation)\n";
echo "===================================================================\n";

// Mock Chart Info
$chartInfo = [
    'houses' => [
        1 => 10,  // Aries
        2 => 40,  // Taurus
        3 => 70,  // Gemini
        4 => 100, // Cancer
        5 => 130, // Leo
        6 => 160, // Virgo
        7 => 190, // Libra
        8 => 220, // Scorpio
        9 => 250, // Sagittarius
        10 => 280, // Capricorn
        11 => 310, // Aquarius
        12 => 340  // Pisces
    ],
    'planets' => [
        'Sun'     => 15,  // Star Ashwini (Ketu)
        'Moon'    => 45,  // Star Rohini (Moon)
        'Mars'    => 75,  // Star Ardra (Rahu)
        'Mercury' => 105, // Star Pushya (Saturn)
        'Jupiter' => 135, // Star Magha (Ketu)
        'Venus'   => 165, // Star Hasta (Moon)
        'Saturn'  => 195, // Star Swati (Rahu)
        'Rahu'    => 225, // Star Anuradha (Saturn)
        'Ketu'    => 345  // Star Revati (Saturn)
    ]
];

// Scenario 1: Mixed Signification
// Let's set up a planet that signifies 2 (Pos) and 8 (Neg)
// Cusp 2 owner is Venus (Taurus).
// Venus owns 2, 7. 
// Star lord of Venus is Moon. Moon owns 4.
// Let's put Venus in house 8 (Scorpio).
// Significations of Venus: 8 (in), 2, 7 (owns) + 4 (star owns).
// Pos: 2. Neg: 8. -> Mixed.

$entry = [
    'subLord' => 'Venus',
    'nakLord' => 'Ketu',
    'sign' => 'Aries',
    'muhurtham' => []
];

echo "\nScenario 1: Mixed Signification (Venus in House 8, owns House 2)\n";
KPUtils::calculateMuhurthamScore($entry, $chartInfo);
echo "Final Score: " . $entry['muhurtham']['score'] . "\n";
echo "Reasons:\n";
foreach($entry['muhurtham']['reasons'] as $r) echo " - $r\n";

// Scenario 2: Cuspal Confirmation
// Cusp 2 (Taurus) Sub Lord.
// Cusp 2 Lon = 40. getKPLords(40) -> Sub Lord?
// 40 is Taurus, Rohini Moon star, ...
echo "\nScenario 2: Checking Cuspal Sub Lords...\n";
// Let's print some cuspal sub lords
for($i=2; $i<=11; $i+=4) {
    if(!isset($chartInfo['houses'][$i])) continue;
    $lords = KPUtils::getKPLords($chartInfo['houses'][$i]);
    echo "Cusp $i Sub Lord: " . $lords['subLord'] . "\n";
}

?>
