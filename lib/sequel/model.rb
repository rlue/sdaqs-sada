# frozen_string_literal: true

module Sequel
  class Model
    # see https://github.com/jeremyevans/sequel/pull/1735#issuecomment-725770695
    def method_missing(m, *args, &block)
      super unless values.key?(m)
      raise ArgumentError, <<~MSG.chomp if args.any?
        wrong number of arguments (given #{args.length}, expected 0)
      MSG

      values[m]
    end

    def respond_to_missing?(m, include_private)
      values.key?(m) || super
    end
  end
end
