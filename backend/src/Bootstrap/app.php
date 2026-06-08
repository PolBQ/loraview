<?php
namespace Loraview\Bootstrap;

use Dotenv\Dotenv;
use Loraview\Database\Connection;
use Loraview\Security\Session;

final class App {
  public function boot(): array {
    $dotenv = Dotenv::createImmutable(dirname(__DIR__,1).'/..');
    $dotenv->load();

    Session::start();

    $pdo = Connection::make();

    $container = [
      'pdo' => $pdo,
      'env' => $_ENV
    ];

    return [null, $container];
  }
}
