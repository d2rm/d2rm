# global Requestor, History, Playlists

class MatchSource

  @matches: (success) ->
    num = if Settings.get("hide-test-matches") is "true" then 1 else 0
    db.matches.find({human_players: {$gt: num}}, (err, matches)->
      if(err)
        return logger.error(err)
      success? matches
    )
    
  @history: (success) ->
    History.getMatches((tracks) ->
      success? tracks
    )

  @playlist: (playlist, success) ->
    Playlists.getMatchesForPlaylist(playlist, ((matches) ->
      success? matches
    ))

  @trackedPlayers: (success) ->
    account_ids = DotaUtils.getTrackedAccountIDs()
    
    db.players.find({account_id: {$in: account_ids}}, (err, players) ->
      if(err)
        return logger.error(err)
      db.matches.find({}, (err, matches) ->
        if(err)
          return logger.error(err)
        for id, player of players
          player.win = 0
          player.lose = 0
          player.games = 0
          
          for id, match of matches
            for id, p of match.players
              if(p.account_id == player.account_id)
                playerRadiant = DotaUtils.isRadiant(p)
                player_win = (playerRadiant == match.radiant_win)
                (if player_win then player.win++ else player.lose++)
                player.games++
        success? players
      )
    )