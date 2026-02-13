<?php
require_once 'KPUtils.php';

// Mock Data for Testing Logic Directly
// We create a fake chart to force a rejection scenario.
// Scenario: Lagna Sub Lord connects to 8 and 12.

// 1. Create a Fake Chart Info
$chartInfo = [
    'houses' => [
        1 => 0, 2 => 30, 3 => 60, 4 => 90, 5 => 120, 6 => 150,
        7 => 180, 8 => 210, 9 => 240, 10 => 270, 11 => 300, 12 => 330
    ],
    'planets' => [
        // Lagna Sub Lord will be 'Venus'
        // Let's set Venus longitude so its Star Lord is 'Mars'
        // Mars Star Starts at 53.20 (Mrigashirsha)
        'Venus' => 55, // In House 2 (Taurus)
        'Mars' => 10,  // In House 1 (Aries). Owns 1, 8.
        'Mercury' => 340, // In 12th House. Owns 3, 6.
        'Jupiter' => 40,
        'Saturn' => 70,
        'Sun' => 100,
        'Moon' => 130, // 5th House
        'Rahu' => 160,
        'Ketu' => 340
    ]
];

// 2. Create a Timeline Entry
$entry = [
    'subLord' => 'Venus', // Lagna Sub
    'nakLord' => 'Mars',  // Lagna Star
    'sign' => 'Aries',    // Lagna Sign
    'muhurtham' => []
];

echo "Testing Rejection Logic...\n";
KPUtils::calculateMuhurthamScore($entry, $chartInfo);

echo "Score: " . $entry['muhurtham']['score'] . "\n";
echo "Decision: " . $entry['muhurtham']['decision'] . "\n";
echo "Reasons:\n";
print_r($entry['muhurtham']['reasons']);
echo "Influences:\n";
print_r($entry['muhurtham']['influences']);

// Scenario 2: Good Time
// Lagna Sub 'Jupiter' connects to 2, 11.
// Jupiter owns 9, 12. 
// Put Jupiter in 11.
// Star Lord 'Sun' in 2.
$chartInfo2 = $chartInfo;
$chartInfo2['planets']['Jupiter'] = 310; // 11th House
$chartInfo2['planets']['Sun'] = 40; // 2nd House

$entry2 = [
    'subLord' => 'Jupiter',
    'nakLord' => 'Sun',
    'sign' => 'Aries',
    'muhurtham' => []
];

echo "\nTesting Good Time Logic...\n";
KPUtils::calculateMuhurthamScore($entry2, $chartInfo2);
echo "Score: " . $entry2['muhurtham']['score'] . "\n";
echo "Decision: " . $entry2['muhurtham']['decision'] . "\n";
echo "Reasons:\n";
print_r($entry2['muhurtham']['reasons']);

// Scenario 3: Taurus Lagna + Jupiter Sub (Connected to bad houses)
// Force Global rule to PASS (Mitigation in Star) but Special Rule to FAIL.
$chartInfo3 = $chartInfo;
$chartInfo3['planets']['Jupiter'] = 130; // 5th House
$chartInfo3['planets']['Ketu'] = 35;    // 2nd House (Mitigation for Jupiter's Star)

$entry3 = [
    'subLord' => 'Jupiter',
    'nakLord' => 'Mars',
    'sign' => 'Taurus',
    'muhurtham' => []
];

echo "\nTesting Taurus Lagna + Jupiter Rule...\n";
KPUtils::calculateMuhurthamScore($entry3, $chartInfo3);
echo "Score: " . $entry3['muhurtham']['score'] . "\n";
echo "Decision: " . $entry3['muhurtham']['decision'] . "\n";
echo "Reasons:\n";
print_r($entry3['muhurtham']['reasons']);

// Scenario 4: Scorpio Lagna + Mercury Sub (Connected to bad houses)
$chartInfo4 = $chartInfo;
$chartInfo4['planets']['Mercury'] = 335; // 12th House
$chartInfo4['planets']['Saturn'] = 35;   // 2nd House (Mitigation for Mercury's Star)

$entry4 = [
    'subLord' => 'Mercury',
    'nakLord' => 'Mars',
    'sign' => 'Scorpio',
    'muhurtham' => []
];

echo "\nTesting Scorpio Lagna + Mercury Rule...\n";
KPUtils::calculateMuhurthamScore($entry4, $chartInfo4);
echo "Score: " . $entry4['muhurtham']['score'] . "\n";
echo "Decision: " . $entry4['muhurtham']['decision'] . "\n";
echo "Reasons:\n";
print_r($entry4['muhurtham']['reasons']);
?>
