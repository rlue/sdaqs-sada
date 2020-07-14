# frozen_string_literal: true

desc 'Launch development console'
task :console do
  system('bundle exec pry -r ./app/app')
end
task :c => :console
