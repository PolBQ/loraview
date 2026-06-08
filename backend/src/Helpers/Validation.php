<?php
namespace Loraview\Helpers;

final class Validation {
  public static function email(string $v): bool {
    return (bool)filter_var($v, FILTER_VALIDATE_EMAIL);
  }
  public static function password(string $v): bool {
    // Longitud mínima y al menos 3 clases (mayúscula/minúscula/dígito/símbolo)
    $len = strlen($v) >= 10;
    $classes = preg_match('/[a-z]/',$v)+preg_match('/[A-Z]/',$v)+preg_match('/\d/',$v)+preg_match('/[^a-zA-Z\d]/',$v);
    return $len && $classes >= 3;
  }
}
