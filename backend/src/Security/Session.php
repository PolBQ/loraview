<?php
namespace Loraview\Security;

final class Session {
  public static function start(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    ini_set('session.use_strict_mode', '1');
    session_name($_ENV['SESSION_NAME'] ?? 'loraview_sess');

    session_set_cookie_params([
      'lifetime' => 0,
      'path' => '/',
      'domain' => '',
      'secure' => ($_ENV['APP_ENV'] ?? '') === 'production',
      'httponly' => true,
      'samesite' => $_ENV['SESSION_SAMESITE'] ?? 'Strict'
    ]);

    session_start();
  }
}
