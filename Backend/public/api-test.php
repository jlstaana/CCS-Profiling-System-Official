<?php

/**
 * Diagnostic File: Baseline API Test
 * This file bypasses Laravel to test if Ngrok/Vercel handles POST requests.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$time = date('Y-m-d H:i:s');

echo json_encode([
    'status' => 'SUCCESS',
    'message' => 'Your connection is working!',
    'method_received' => $method,
    'server_time' => $time,
    'note' => 'If you see this, the issue is INSIDE your Laravel routes/CORS, not Ngrok.'
]);
