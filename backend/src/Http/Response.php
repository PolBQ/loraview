<?php
// Response.php
namespace Loraview\Http;

final class Response {
  public function json(array $payload, int $code=200): self {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    return $this;
  }
  public function send(): void { /* sólo por fluidez */ }
}
