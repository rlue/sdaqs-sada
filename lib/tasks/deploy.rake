# frozen_string_literal: true

desc 'Deploy live application'
task :deploy do
  system('yarn build')
  system('docker build .')
end
