<?php
// Request.php
namespace Loraview\Http;

final class Request {
  public static function fromGlobals(): self {
    return new self();
  }
  public function json(): array {
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
  }
  public function path(): string {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    // asumiendo backend montado en /backend
    return preg_replace('#^/backend#','', $uri) ?: '/';
  }
  public function method(): string {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  }
}
