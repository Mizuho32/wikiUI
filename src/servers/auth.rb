#!/usr/bin/env ruby
# coding:utf-8

require 'uri'
require 'net/https'
require 'yaml'

require 'bundler'
Bundler.require

use Rack::Session::Cookie,
  #:key => 'rack.session',
  #:domain => 'foo.com',
  #:path => '/',
  :expire_after => 3600,
  :secret => 'change'

get "/new" do
  session[:new] = "hello new"
  erb :new
end

get "/test" do
  p session[:new]
  "test"
end

get ?/ do
  p "hello"
  erb :test
end

#=begin
get '/auth' do
  client_id = (c = YAML.load_file("cred.yaml"))[:client_id]
  secret = c[:secret]
  p params
  code = params["code"]
  halt 400, "bad request (code)" if code.to_s.empty?
  
  ## get token
  query = {
    body:{
      client_id:client_id,
      client_secret:secret,
      code:code
    },
    headers:{
      "Accept" => "application/json"
    }
  }
  res = HTTParty.post("https://github.com/login/oauth/access_token", query)
  p res
  halt 500, "github auth error" unless res.code == 200

  begin
    token = JSON.parse(res.body)["access_token"]
  rescue
    halt 500, "github auth error2"
  end

  session[:token] = token
  p res.body
  p session[:token]
end
#=end
