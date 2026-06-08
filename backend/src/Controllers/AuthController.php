<?php
namespace Loraview\Controllers;

use Loraview\Http\Request;
use Loraview\Http\Response;
use Loraview\Security\Csrf;
use Loraview\Security\RateLimiter;
use Loraview\Helpers\Validation;
use PDO;

final class AuthController {
  private PDO $pdo;
  private array $env;

  public function __construct(array $c) {
    $this->pdo = $c['pdo'];
    $this->env = $c['env'];
  }

  public function register(Request $req, Response $res): Response {
    Csrf::check(Csrf::extractFromHeaders());

    $body = $req->json();
    $email = trim((string)($body['email'] ?? ''));
    $pass  = (string)($body['password'] ?? '');

    if (!Validation::email($email) || !Validation::password($pass)) {
      return $res->json(['ok'=>false,'msg'=>'Datos inválidos'], 422);
    }

    $pepper = $this->env['PASSWORD_PEPPER'] ?? '';
    $hash = password_hash($pass.$pepper, PASSWORD_ARGON2ID);

    $stmt = $this->pdo->prepare('INSERT INTO users(email, password_hash) VALUES(?, ?)');
    try {
      $stmt->execute([$email, $hash]);
    } catch (\PDOException $e) {
      return $res->json(['ok'=>false,'msg'=>'Email en uso'], 409);
    }

    return $res->json(['ok'=>true], 201);
  }

  public function login(Request $req, Response $res): Response {
    $body = $req->json();
    $email = (string)($body['email'] ?? '');
    $pass  = (string)($body['password'] ?? '');

    $stmt = $this->pdo->prepare('SELECT id, password_hash FROM users WHERE email=?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    $pepper = $this->env['PASSWORD_PEPPER'] ?? '';

    $ok = $user && password_verify($pass.$pepper, $user['password_hash']);
    if (!$ok) {
      RateLimiter::recordAttempt($this->pdo, $email);
      return $res->json(['ok'=>false,'msg'=>'Credenciales'], 401);
    }

    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$user['id'];

    return $res->json(['ok'=>true]);
  }

  public function logout(Request $req, Response $res): Response {
    Csrf::check(Csrf::extractFromHeaders());
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
      $params = session_get_cookie_params();
      setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    return $res->json(['ok'=>true]);
  }
}
