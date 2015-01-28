class Utils
  @filterSymbols: (name) ->
    return name.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '')
