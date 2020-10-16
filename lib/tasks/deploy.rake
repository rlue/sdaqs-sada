# frozen_string_literal: true

desc 'Deploy live application'
task :deploy do
  system('npm run build')
  system('docker build .')
end
