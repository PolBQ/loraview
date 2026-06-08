<?php
namespace Loraview\Database;
use PDO;
use PDOException;

final class Connection {
  public static function make(): PDO {
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $_ENV['DB_HOST'], 
        $_ENV['DB_PORT'], 
        $_ENV['DB_NAME'], 
        $_ENV['DB_CHARSET']
    );
    $pdo = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], $opt);

    $opt = [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
      return new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS'], $opt);
    } catch (PDOException $e) {
      http_response_code(500);
      exit('❌ Error al conectar con la base de datos');
    }
  }
}
