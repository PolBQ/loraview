<?php
namespace Loraview\Security;

use PDO;

final class RateLimiter {
  public static function guardLogin($req, array $c): void {
    $pdo = $c['pdo'];
    $email = (string)($req->json()['email'] ?? '');
    $ipBin = inet_pton($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

    $limit = (int)($_ENV['RATE_LIMIT_LOGIN'] ?? 5);
    $window = (int)($_ENV['RATE_LIMIT_WINDOW_SECONDS'] ?? 900);

    // Cuenta intentos en ventana
    $stmt = $pdo->prepare(
      "SELECT COUNT(*) AS cnt FROM login_attempts
       WHERE (email = ? OR ip = ?)
       AND attempted_at >= (NOW() - INTERVAL ? SECOND)"
    );
    $stmt->execute([$email, $ipBin, $window]);
    $cnt = (int)$stmt->fetch()['cnt'];

    if ($cnt >= $limit) {
      http_response_code(429);
      exit(json_encode(['ok'=>false,'msg'=>'Demasiados intentos. Intenta más tarde.']));
    }
  }

  public static function recordAttempt(PDO $pdo, string $email): void {
    $ipBin = inet_pton($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
    $stmt = $pdo->prepare("INSERT INTO login_attempts(email, ip) VALUES (?, ?)");
    $stmt->execute([$email, $ipBin]);
  }
}
