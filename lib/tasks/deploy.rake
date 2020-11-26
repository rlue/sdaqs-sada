# frozen_string_literal: true

desc 'Deploy live application'
task :deploy => :'db:validate_seed' do
  system('docker-compose up --detach --build --force-recreate')
end
