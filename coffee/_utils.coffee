class Utils
  @filterSymbols: (name) ->
    return name.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '')
    
  @resetCache: ->
    Utils.createEmptyCacheObject(matchPages)
    Utils.createEmptyCacheObject(playerPages)
    
  @createEmptyCacheObject: (obj) ->
    keys = Object.keys(obj)
    keys.forEach((k) ->
      name = obj[k].template
      cached_pages[name] = {}
    )
