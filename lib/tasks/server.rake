# frozen_string_literal: true

desc 'Launch development server'
task :server => :'secrets:generate' do
  system('forego start -f Procfile.dev')
end
task :s => :server
