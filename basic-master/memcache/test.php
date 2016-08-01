<?php

//basic memcache example

$meminstance = new Memcache();
$meminstance->pconnect('localhost', 11211); //default port 11211

//database
$link	=	mysqli_connect("localhost", "test", "testing123") or die(mysqli_error($link));
mysqli_select_db($link,"test") or die(mysqli_error($link));

//query and key
$query = "select id from example where name = 'new_data'";
$querykey = "KEY" . md5($query);

$result = $meminstance->get($querykey);

//no cache
if (!$result) {

	$result = mysqli_fetch_array(mysqli_query($link,"select id from example where name = 'new_data'")) or die('mysql error');
	$meminstance->set($querykey, $result, 0, 600);

	print "got result from mysql\n";
	return 0;
}

print "got result from memcached\n";
return 0;