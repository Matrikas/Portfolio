<?php
/**
 * Zinnia Lopes Portfolio - Contact Form Processing Backend
 * Performs server-side sanitization, regex validations, spam protection,
 * and securely processes message submissions (both via email and local JSON backup log).
 */

header('Content-Type: application/json');

// Force POST request only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. This endpoint only accepts secure POST submissions.'
    ]);
    exit;
}

// Extract and trim inputs
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validation checks
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please fill out all the fields! Name, email, and message are required.'
    ]);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars(strip_tags($name), ENT_QUOTES, 'UTF-8');
$email = filter_var($email, FILTER_SANITIZE_EMAIL);
$message = htmlspecialchars(strip_tags($message), ENT_QUOTES, 'UTF-8');

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Oops! That email address looks a bit funky. Please double-check it.'
    ]);
    exit;
}

// Length constraints
if (strlen($name) < 2 || strlen($name) > 100) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Name should be between 2 and 100 characters.'
    ]);
    exit;
}

if (strlen($message) < 10 || strlen($message) > 5000) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please write a message of at least 10 characters so we can chat properly!'
    ]);
    exit;
}

// ----------------------------------------------------------------------
// 1. LOCAL DATA BACKUP LOGGING (Highly robust for local testing)
// ----------------------------------------------------------------------
$logDir = 'assets';
if (!file_exists($logDir)) {
    mkdir($logDir, 0755, true);
}

$logFile = $logDir . '/messages.json';
$currentMessages = [];

if (file_exists($logFile)) {
    $fileData = file_get_contents($logFile);
    if (!empty($fileData)) {
        $currentMessages = json_decode($fileData, true);
        if (!is_array($currentMessages)) {
            $currentMessages = [];
        }
    }
}

// Append new message metadata
$newMessage = [
    'id' => uniqid(),
    'name' => $name,
    'email' => $email,
    'message' => $message,
    'timestamp' => date('Y-m-d H:i:s'),
    'ip_address' => $_SERVER['REMOTE_ADDR']
];

$currentMessages[] = $newMessage;
file_put_contents($logFile, json_encode($currentMessages, JSON_PRETTY_PRINT));

// ----------------------------------------------------------------------
// 2. EMAIL TRANSMISSION
// ----------------------------------------------------------------------
$toEmail = "zinnia.lopes.ux@gmail.com"; // Default target contact email
$subject = "✨ New UX Inquiry from " . $name . " on your Portfolio";

// Construct beautiful HTML email body
$emailBody = "
<html>
<head>
    <title>New UX Portfolio Message</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #2B231F; background-color: #FAF6F0; padding: 20px;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #2B231F; border-radius: 16px; padding: 30px; box-shadow: 6px 6px 0px #FF4A5A;'>
        <h2 style='color: #FF4A5A; border-bottom: 2px dashed #2B231F; padding-bottom: 15px; margin-top: 0;'>🎨 New UX Project Inquiry!</h2>
        
        <p><strong>Sender Name:</strong> {$name}</p>
        <p><strong>Email Address:</strong> <a href='mailto:{$email}' style='color: #FF7E5F; text-decoration: none; font-weight: bold;'>{$email}</a></p>
        <p><strong>Submission Time:</strong> " . date('F j, Y, g:i a') . "</p>
        
        <div style='margin-top: 20px; padding: 15px; background-color: #FAF6F0; border-left: 4px solid #FF4A5A; border-radius: 4px;'>
            <p style='margin: 0; font-style: italic;'>\"{$message}\"</p>
        </div>
        
        <p style='font-size: 0.85rem; color: #777777; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px;'>
            Sent securely via the Zinnia Lopes Interactive Portfolio Website form.
        </p>
    </div>
</body>
</html>
";

// Headers to secure email transmissions and prevent header injections
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
// From a domain email standard to ensure delivery, but reply to sender's address
$headers .= "From: no-reply@zinnialopes.com" . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Attempt to deliver the email
$emailSent = @mail($toEmail, $subject, $emailBody, $headers);

// Respond to Client AJAX Fetch call
echo json_encode([
    'success' => true,
    'message' => 'Yay! Your message has been sent successfully. Zinnia will get back to you super soon! 🎨✨',
    'mail_sent' => $emailSent,
    'logged_locally' => true
]);
exit;
