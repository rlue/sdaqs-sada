# frozen_string_literal: true

RSpec.describe 'Deployment form behavior:', type: :feature do
  describe 'abandoning partial input' do
    let(:search_field) { find_field('Search bases') }
    let(:first_result_elem) { find('#downshift-1-item-0') }
    let(:partial_query) { 'ram' }
    let(:first_result) { 'Ramrod' }

    # Thanks @kinopyo!
    # https://bloggie.io/@kinopyo/capybara-trigger-blur-event
    {
      'with <Esc>'      => -> { search_field.native.send_keys(:escape) },
      'with <Tab>'      => -> { search_field.native.send_keys(:tab) },
      'with <S-Tab>'    => -> { search_field.native.send_keys(%i[shift tab]) },
      'by clicking out' => -> { find('body').click },
    }.each do |description, blur_action|
      context description do
        let(:blur, &blur_action)

        it 'clears the input field' do
          visit '/'
          search_field.fill_in(with: partial_query)
          blur

          expect(search_field).to match_selector('[value=""]')
          expect(page).not_to have_selector('#downshift-1-menu')
        end
      end
    end

    context 'by deleting query within debouncing interval' do
      it 'actually debounces (i.e., does not show results)' do
        visit '/'
        search_field.fill_in(with: partial_query)
        search_field.fill_in(with: '')

        expect(page).not_to have_selector('#downshift-1-menu')
      end
    end

    context 'after highlighting a result' do
      context 'with <Esc>' do
        it 'clears the input field' do
          visit '/'
          search_field.fill_in(with: partial_query)
          first_result_elem.hover
          search_field.native.send_keys(:escape)

          expect(search_field).to match_selector('[value=""]')
        end
      end

      {
        'with <Tab>'      => -> { search_field.native.send_keys(:tab) },
        'with <S-Tab>'    => -> { search_field.native.send_keys(%i[shift tab]) },
        'by clicking out' => -> { find('body').click },
      }.each do |description, blur_action|
        context description do
          let(:blur, &blur_action)

          it 'selects the result' do
            visit '/'
            search_field.fill_in(with: partial_query)
            first_result_elem.hover
            blur

            expect(search_field).to match_selector(%([value="#{first_result}"]))
          end
        end
      end
    end
  end
end
