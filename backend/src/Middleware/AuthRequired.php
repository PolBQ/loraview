<?php
namespace Loraview\Middleware;

final class AuthRequired {
  public static function enforce($req): void {
    if (empty($_SESSION['uid'])) {
      http_response_code(401);
      exit(json_encode(['ok'=>false,'msg'=>'No autenticado']));
    }
  }
}
