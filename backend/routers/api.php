<?php
use Loraview\Security\Csrf;
use Loraview\Security\RateLimiter;
use Loraview\Middleware\AuthRequired;
use Loraview\Controllers\AuthController;
use Loraview\Controllers\UserController;

/** @var \Loraview\Http\Request $req */
/** @var \Loraview\Http\Response $res */
/** @var array $container */

$path = $req->path();
$method = $req->method();

// CSRF token para formularios (GET)
if ($method==='GET' && $path==='/csrf') {
  $token = Csrf::token();
  return $res->json(['ok'=>true,'csrf'=>$token])->send();
}

// Registro
if ($method==='POST' && $path==='/auth/register') {
  return (new AuthController($container))->register($req, $res)->send();
}

// Login (con rate-limit)
if ($method==='POST' && $path==='/auth/login') {
  RateLimiter::guardLogin($req, $container);
  return (new AuthController($container))->login($req, $res)->send();
}

// Logout (requiere sesión)
if ($method==='POST' && $path==='/auth/logout') {
  AuthRequired::enforce($req);
  return (new AuthController($container))->logout($req, $res)->send();
}

// Yo (protegido)
if ($method==='GET' && $path==='/me') {
  AuthRequired::enforce($req);
  return (new UserController($container))->me($req, $res)->send();
}
