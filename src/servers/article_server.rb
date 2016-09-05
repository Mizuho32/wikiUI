#!/usr/bin/env ruby

require 'pathname'
$: << Pathname(__FILE__).expand_path.dirname.to_s + "/lib"

require 'lib.rb'

require 'open3'
require 'em-websocket'
require 'pp'
require 'json'
require 'yaml'


y = YAML.load_file 'servers.yaml'
root = ARGV[0] || raise("ARGV[0], root directory is  missing")
File.open("pid", "w+"){|file| file.print Process.pid }


@connections = {}

EM::WebSocket.start(host: y[:filer][:host], port:y[:filer][:port]) do |con|
  con.onopen do
    p "opend"
    con.send("opened! #{con}")
    @connections[con] = {current: root.split(?/).select{|n| !n.empty?} }
  end

  con.onclose do
    @connections.delete con
    if @connections.size == 0 then  
      `echo '' > pid`
			# EM::WebSocket.stop
      # exit 0
    end
  end

  con.onmessage do |msg|
    begin
      p msg
      json = nil

      if msg =~ /\Acmd/
				p "CMD"
        if msg.include? "cd"
          CD @connections[con], msg[/cd(.+)/m, 1].to_s.strip
          con.send "/#{@connections[con][:current].join ?/}"
        else
          con.send c=<<-"EOF"
#{msg}:
#{(r = Open3.capture3("cd /#{@connections[con][:current].join ?/};" + msg[/^cmd[^:]*:(.+)\Z/m, 1]))[0].to_s},#{r[1]},#{r[2]}
EOF
					puts c
        end
      elsif msg =~ /\Amkfile/
				p "MKFILE"
        file = msg[/^(mkfile[^:]*):(.+)\Z/m, 2]
        filename = $1.split(?,)[1].strip
        path = path(@connections[con][:current]) + ?/
        puts "filename = #{filename}\ncontent = #{file}"
        if (file.to_s.empty? or filename.to_s.empty?)
          con.send("file or filename is empty")
          next
        elsif (File.exists?(full = path +  filename))
          con.send("File already Exists")
          next
        end

        File.open(full, "w+"){|f|
          f.write file
        }
        con.send("File written")

      elsif msg =~ /\Aruby/
				p "RUBY"
        c = msg[/^ruby[^:]*:(.+)\Z/m, 1]
        con.send(eval(c).to_s)
      elsif msg =~ /\Aexit/
				p "EXIT"
        con.send("close #{con}")
        con.close
				EM::WebSocket.stop
        exit 0
			else
				p "ELSE"
      end
    rescue Exception => e
      puts e.message, e.backtrace
      con.send("#{e.message}\n#{e.backtrace}")
      `echo '' > pid`
    end
  end

end
