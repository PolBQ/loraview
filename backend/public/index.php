<?php
declare(strict_types=1);

use Loraview\Bootstrap\App;
use Loraview\Http\Request;
use Loraview\Http\Response;

require __DIR__ . '/../vendor/autoload.php';

$app = new App();
[$router, $container] = $app->boot();

// Enrutador muy simple por path + método
$req = Request::fromGlobals();
$res = new Response();

require __DIR__ . '/../routes/api.php';

// Si nada matchea:
$res->json(['ok'=>false,'msg'=>'Not found'], 404)->send();
