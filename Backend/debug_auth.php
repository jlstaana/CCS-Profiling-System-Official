<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=ccs_profiling', 'root', '');
$stmt = $pdo->query('SELECT id, name, email FROM users ORDER BY id DESC LIMIT 5');
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "LATEST USERS IN DB:\n";
foreach($users as $u) {
    echo "ID: " . $u['id'] . " | " . $u['name'] . " | '" . $u['email'] . "'\n";
}
