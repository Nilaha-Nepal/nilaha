<?php
// Hostinger web hosting handles these two routes via .htaccess.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function respond($code, $body) {
    http_response_code($code);
    echo json_encode($body);
    exit;
}
function failRequest($code, $message) {
    respond($code, ['error' => $message]);
}
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
if ($path === '/api/status' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    respond(200, ['intakeEnabled' => function_exists('mail'), 'delivery' => 'email']);
}
if ($path !== '/api/requests') failRequest(404, 'Unknown endpoint.');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') failRequest(405, 'Use POST.');
if (!in_array($_SERVER['HTTP_ORIGIN'] ?? '', ['https://nilaha.com', 'https://www.nilaha.com'], true)) {
    failRequest(403, 'Request origin is not permitted.');
}
if (!function_exists('mail')) failRequest(503, 'Mail service unavailable.');
if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
    failRequest(415, 'Expected a JSON request.');
}
$raw = file_get_contents('php://input', false, null, 0, 16385);
if (strlen($raw) > 16384) failRequest(413, 'Request too large.');
$data = json_decode($raw, true);
if (!is_array($data) || !empty($data['website'])) failRequest(400, 'Invalid request.');
function field($data, $name, $min, $max) {
    $value = $data[$name] ?? null;
    if (!is_string($value)) failRequest(400, 'Please check your form entries.');
    $value = trim($value);
    $length = preg_match_all('/./us', $value);
    if ($length < $min || $length > $max) failRequest(400, 'Please check your form entries.');
    return $value;
}
$message = field($data, 'message', 2, 2000);
$time = field($data, 'safeTime', 2, 120);
$contact = field($data, 'contact', 7, 30);
$channel = $data['channel'] ?? '';
if (!preg_match('/^\+?[0-9 ()-]{7,30}$/D', $contact) || !in_array($channel, ['phone','sms','whatsapp'], true)
    || ($data['consent'] ?? false) !== true) failRequest(400, 'Check your contact details and consent.');
// Lock a bounded set of rate-limit counters. They contain no form or contact data.
$bucket = substr(hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''), 0, 3);
$file = fopen(sys_get_temp_dir() . '/nilaha-inbox-' . $bucket, 'c+');
if (!$file || !flock($file, LOCK_EX)) failRequest(503, 'Please try again later.');
$counter = json_decode(stream_get_contents($file), true);
if (!$counter || $counter['expires'] <= time()) $counter = ['expires' => time() + 3600, 'count' => 0];
if ($counter['count'] >= 5) failRequest(429, 'Too many requests. Please try again later.');
$counter['count']++;
rewind($file);
ftruncate($file, 0);
fwrite($file, json_encode($counter));
fclose($file);
$voicemail = $channel === 'phone' && ($data['voicemail'] ?? false) === true ? 'Yes' : 'No';
$body = "Contact method: $channel\nContact number: $contact\nSafe contact time: $time\nVoicemail permitted: $voicemail\nConsent to contact: Yes\n";
if (!empty($data['provider'])) $body .= 'Requested profile: ' . field($data, 'provider', 1, 100) . "\n";
$body .= "\nMessage:\n$message";
$headers = "From: Nilaha <info@nilaha.com>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64";
if (!mail('info@nilaha.com', 'Nilaha conversation request', chunk_split(base64_encode($body)), $headers)) {
    failRequest(503, 'Your request could not be sent. Please try again later.');
}
respond(201, ['received' => true]);
