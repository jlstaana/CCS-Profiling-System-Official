<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$response = Http::post('http://127.0.0.1:8000/api/login', [
    'email' => 'admin123@ccs.edu',
    'password' => 'any',
]);

echo "Status: " . $response->status() . "\n";
echo "Body: " . $response->body() . "\n";

if ($response->successful()) {
    $token = $response->json('token');
    echo "Login successful. Token: $token\n";
    $profileRes = Http::withToken($token)->get('http://127.0.0.1:8000/api/profile');
    echo "Profile Status: " . $profileRes->status() . "\n";
    echo "Profile Body: " . $profileRes->body() . "\n";
}
