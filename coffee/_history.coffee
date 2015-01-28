class History
  @clear: (success) ->
    db.matches.update({ last_watched: { $exists: true } },
    { $unset: { last_watched: true } },
    { multi: true }, (error) ->
      if error
        logger.error("History.clear remove erorr :")
        logger.error(error)
        success?()
      else
        success?()
    )

  @addMatch: (match_id) ->
    unix_timestamp = Math.round((new Date()).getTime() / 1000)
    db.matches.update({ match_id: match_id },
    { $set: { last_watched: unix_timestamp } }, {}, (error) ->
      if error
        logger.error("History.addMatch erorr :")
        logger.error(error)
    )

  @removeMatch: (match_id) ->
    db.matches.update({
      match_id: match_id
    }, {
      $unset: { last_watched: true }
    }, {}, (error) ->
      if error
        logger.error("History.removeMatch remove erorr :")
        logger.error(error)
    )

  @getMatches: (success) ->
    db.matches.find({ last_watched: { $exists: true } }).sort({
      last_watched: -1
    }).limit(150).exec((error, foundMatches) ->
      if error
        logger.error("History.getMatches find erorr :")
        logger.error(error)
        success?([])
      else
        success?(foundMatches)
    )

  @countMatches: (success) ->
    db.matches.count({ last_watched: { $exists: true } }, (error, count) ->
      if error
        logger.error("History.countMatches count erorr :")
        logger.error(error)
        success?(0)
      else
        success?(count)
    )
