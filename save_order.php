<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
// Error reporting for development (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function handleError($message, $conn = null) {
    if ($conn) $conn->close();
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => $message]));
}

// Database connection with error handling
$servername = "localhost";
$username = "root";
$password = "vedangmore123";
$dbname = "aajis_kitchen";

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        handleError("Database connection failed");
    }
    
    // Set charset to prevent encoding issues
    $conn->set_charset("utf8mb4");

    // Get JSON input
    $jsonInput = file_get_contents('php://input');
    if (empty($jsonInput)) {
        handleError("No input data received", $conn);
    }

    $data = json_decode($jsonInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        handleError("Invalid JSON data: " . json_last_error_msg(), $conn);
    }

    // Validate required fields
    $requiredFields = ['username', 'phone', 'address', 'cartItems'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            handleError("Missing required field: $field", $conn);
        }
    }

    // Validate cart items
    if (!is_array($data['cartItems']) || count($data['cartItems']) === 0) {
        handleError("Cart is empty", $conn);
    }

    // Prepare data with proper escaping
    $username = $conn->real_escape_string(trim($data["username"]));
    $phone = $conn->real_escape_string(trim($data["phone"]));
    $address = $conn->real_escape_string(trim($data["address"]));
    $orderDate = date("Y-m-d H:i:s");

    // Start transaction for atomic operations
    $conn->autocommit(false);

    try {
        // Insert into orders table using prepared statement
        $orderStmt = $conn->prepare("INSERT INTO orders (customer_name, phone, address, orderdate) VALUES (?, ?, ?, ?)");
        if (!$orderStmt) {
            throw new Exception("Order statement preparation failed: " . $conn->error);
        }
        
        $orderStmt->bind_param("ssss", $username, $phone, $address, $orderDate);
        if (!$orderStmt->execute()) {
            throw new Exception("Order insertion failed: " . $orderStmt->error);
        }
        
        $orderId = $conn->insert_id;
        $orderStmt->close();

        // Prepare item statement
        $itemStmt = $conn->prepare("INSERT INTO order_items (order_id, item_name, price, quantity) VALUES (?, ?, ?, ?)");
        if (!$itemStmt) {
            throw new Exception("Item statement preparation failed: " . $conn->error);
        }

        // Process each cart item
        foreach ($data["cartItems"] as $item) {
            if (!isset($item['name']) || !isset($item['price']) || !isset($item['quantity'])) {
                throw new Exception("Invalid cart item structure");
            }

            $itemName = $conn->real_escape_string(trim($item["name"]));
            $price = (float)$item["price"];
            $quantity = (int)$item["quantity"];

            // Validate numeric values
            if ($price <= 0 || $quantity <= 0) {
                throw new Exception("Invalid price or quantity value");
            }

            $itemStmt->bind_param("isdi", $orderId, $itemName, $price, $quantity);
            if (!$itemStmt->execute()) {
                throw new Exception("Item insertion failed: " . $itemStmt->error);
            }
        }

        $itemStmt->close();
        $conn->commit();

        // Success response
        echo json_encode([
            "status" => "success",
            "orderId" => $orderId,
            "message" => "Order placed successfully"
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        handleError($e->getMessage(), $conn);
    }

} catch (Exception $e) {
    handleError("System error: " . $e->getMessage());
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
?>