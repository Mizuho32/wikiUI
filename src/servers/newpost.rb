#!/usr/bin/env ruby

require 'cgi'
require 'yaml'
require 'open3'
require 'date'

redirect = (y = YAML.load_file("servers.yaml"))[:article]

begin
  DEBUG = File.open("/dev/pts/#{y[:out]}", "r+") 
rescue
  DEBUG = File.open("log/#{(DateTime.now).to_s}.log", "w+")
end
  

begin 
cgi = CGI.new

pid = Open3.capture3("cat pid")[0].chomp
DEBUG.puts "pid = #{pid.inspect}"

if pid == "" then 
  fork{
    DEBUG.puts r = Open3.capture3("#{y[:bundle]} exec ruby article_server.rb '#{y[:root]}' &")
    raise(r) if r[2] != 0
  }
end

DEBUG.puts redirect

sleep 1

print cgi.header({
  "status" =>  'REDIRECT', 
  "Location" => redirect
})
=begin
print <<-"EOF"
Content-type: text/html

<html>
<head>
<title>Hello World</title>
</head>
<body>
<h1 style="color:blue;">Hello World</h1>
</body>
</html>
EOF
=end

rescue Exception => e
DEBUG.puts e.message, e.backtrace
end
