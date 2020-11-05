# frozen_string_literal: true

Pathname.new(__dir__)
  .then { |root_dir| root_dir.join('initializers', '*.rb') }
  .then { |initializers_glob| Dir[initializers_glob] }
  .then { |initializer_files| initializer_files.each(&method(:require)) }
