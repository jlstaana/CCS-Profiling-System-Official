<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$credentials = [
    ['email' => 'admin123@ccs.edu',   'name' => 'Demo Admin',   'role' => 'admin'],
    ['email' => 'faculty123@ccs.edu', 'name' => 'Demo Faculty', 'role' => 'faculty'],
    ['email' => 'student123@ccs.edu', 'name' => 'Demo Student', 'role' => 'student'],
];

foreach ($credentials as $cred) {
    echo "Processing {$cred['email']}...\n";
    $user = User::where('email', $cred['email'])->first();
    if (!$user) {
        echo "  Creating user...\n";
        $user = User::create([
            'email' => $cred['email'],
            'name' => $cred['name'],
            'password' => 'any', // Laravel 11 'hashed' cast will handle this
            'role' => $cred['role']
        ]);
    } else {
        echo "  Resetting password...\n";
        $user->password = 'any';
        $user->save();
    }
    echo "  Verify: " . (Hash::check('any', $user->password) ? 'OK' : 'FAIL') . "\n";
}
echo "All done.\n";
