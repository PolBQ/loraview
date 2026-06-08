<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user = $_POST["username"];
    $password = $_POST["password"];

    // Simulación de autenticación (reemplazar con base de datos)
    if ($user === "admin" && $password === "1234") {
        $_SESSION["logged_in"] = true;
        setcookie("session", "true", time() + 3600, "/");
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false]);
    }
}
?>
