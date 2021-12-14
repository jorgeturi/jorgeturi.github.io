<?php

require_once('FormProcessor.php');

$form = array(
    'subject' => 'Mensaje de TuJo',
    'email_message' => 'Nuevo mensaje',
    'success_redirect' => '',
    'sendIpAddress' => true,
    'email' => array(
    'from' => 'hola@tujo.com.ar',
    'to' => 'jorgeturina@gmail.com'
    ),
    'fields' => array(
    'select' => array(
    'order' => 1,
    'type' => 'string',
    'label' => 'select',
    'required' => false,
    'errors' => array(
    'required' => 'Field \'select\' is required.'
    )
    ),
    'name' => array(
    'order' => 2,
    'type' => 'string',
    'label' => 'Name',
    'required' => true,
    'errors' => array(
    'required' => 'Field \'Name\' is required.'
    )
    ),
    'email' => array(
    'order' => 3,
    'type' => 'email',
    'label' => 'Email',
    'required' => true,
    'errors' => array(
    'required' => 'Field \'Email\' is required.'
    )
    ),
    'message' => array(
    'order' => 4,
    'type' => 'string',
    'label' => 'Message',
    'required' => true,
    'errors' => array(
    'required' => 'Field \'Message\' is required.'
    )
    ),
    )
    );

    $processor = new FormProcessor('');
    $processor->process($form);

    ?>