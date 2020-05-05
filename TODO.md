* A11y: how to keyboard-navigate date selection?
* A11y: how to set input focus when clicking on map markers?
* Add 404 page
* Design: Fix visual feedback when hovering over comboboxes
  (currently, there’s jitter when moving across element boundaries)
* Defocus date picker when clicking ANYWHERE outside target area
  (as opposed to only in a new search unit box)
* Set cursor on clickable map markers
  (use “pointer”, but not when in date picker mode)
* dev env: make eslint & prettier play nicely together

  ```vimscript
  let g:ale_javascript_eslint_use_global = 1
  let g:ale_javascript_eslint_executable = 'yarn'
  let g:ale_javascript_eslint_options = 'run eslint'
  ```
