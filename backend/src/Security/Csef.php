<?php
namespace Loraview\Security;

final class Csrf {
  public static function token(): string {
    if (empty($_SESSION['csrf'])) {
      $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
  }

  public static function check(?string $token): void {
    $valid = isset($_SESSION['csrf']) && is_string($token) &&
             hash_equals($_SESSION['csrf'], $token);
    if (!$valid) {
      http_response_code(419); // Authentication Timeout
      exit(json_encode(['ok'=>false,'msg'=>'CSRF']));
    }
  }

  public static function extractFromHeaders(): ?string {
    $header = $_ENV['CSRF_HEADER'] ?? 'X-CSRF-Token';
    return $_SERVER['HTTP_'.strtoupper(str_replace('-', '_', $header))] ?? null;
  }
}
