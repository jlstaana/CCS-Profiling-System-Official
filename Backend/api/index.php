<?php

/**
 * Vercel Serverless Entry Point for Laravel 11
 * Handles CORS Preflights and URI Normalization 
 */

// 1. Handle CORS Preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
    header('Access-Control-Allow-Headers: X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    header('Access-Control-Allow-Credentials: true');
    http_response_code(200);
    exit;
}

// 2. Global CORS Headers for all PHP responses
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
header('Access-Control-Allow-Credentials: true');

// 3. Normalize URI for Laravel (Ensures stability in Monorepos)
$_SERVER['REQUEST_URI'] = preg_replace('/^\/api/', '', $_SERVER['REQUEST_URI']);

// 4. Forward to the actual Laravel entry point
require __DIR__ . '/../public/index.php';
