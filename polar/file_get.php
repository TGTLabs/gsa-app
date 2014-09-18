<?php
$content = file_get_contents('http://assets-polarb-com.a.ssl.fastly.net/api/v4/publishers/nicolenetland/embedded_polls/iframe?pollset_id=4877-which-sweater-do-you-prefer');
$content = str_replace('</title>','</title><base href="http://assets-polarb-com.a.ssl.fastly.net/" />', $content);
$content = str_replace('</head>','<link rel="stylesheet" href="http://www.chahla.net/rad/polar/css/surveyStyle.css" /></head>', $content);
echo $content;
?>