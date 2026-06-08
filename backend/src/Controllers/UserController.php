<?php
namespace Loraview\Controllers;

use Loraview\Http\Request;
use Loraview\Http\Response;

final class UserController {
  private \PDO $pdo;
  public function __construct(array $c){ $this->pdo=$c['pdo']; }

  public function me(Request $req, Response $res): Response {
    $uid = (int)($_SESSION['uid'] ?? 0);
    $stmt = $this->pdo->prepare('SELECT id, email, created_at FROM users WHERE id=?');
    $stmt->execute([$uid]);
    return $res->json(['ok'=>true, 'user'=>$stmt->fetch()]);
  }
}
