Settings =
  get: (variable) ->
    localStorage['settings_' + variable]
  set: (variable, newValue) ->
    localStorage.setItem 'settings_' + variable, newValue
