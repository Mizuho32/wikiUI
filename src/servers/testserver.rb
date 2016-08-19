#!/usr/bin/env ruby

require 'webrick'
module WEBrick
  module HTTPServlet
    FileHandler.add_handler('rb', CGIHandler)
  end
end
server = WEBrick::HTTPServer.new({
  :DocumentRoot => '.',
  :CGIInterpreter => WEBrick::HTTPServlet::CGIHandler::Ruby,
  :Port => ARGV[0],
})
['INT', 'TERM'].each {|signal|
  Signal.trap(signal){ server.shutdown }
}
server.start
