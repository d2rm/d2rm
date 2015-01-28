class PlaylistPanel
  constructor: ->

    initDialog: ->
    # Selectors
    @playlistPanel = $('#playlist-panel')
    @playlistPopup = $('.new')
    @groupName = $('#playListName')
    @positionTarget = $('body')
    @playlistPanel.keydown((e) ->
      if e.keyCode is $.ui.keyCode.ENTER
        saveButton = $(@).parent().find('.ui-dialog-buttonpane button:last')
        saveButton.click()
    )
    @playlistPanel.dialog
      autoOpen: false,
      height: 220,
      width: 350,
      position:
        of: @positionTarget
      show:
        effect: 'blind',
        duration: 500
      hide:
        effect: 'blind',
        duration: 500
      title: 'Add New Group',
      modal: true,
      dialogClass: 'settingsClass',
      buttons: [
        text: 'Cancel',
        click: =>
          @close()
      ,
        text: 'Save',
        click: =>
          str = @groupName.val()
          if str.length < 1
            return
          else
            Playlists.getPlaylistNameExist(str, (length) ->
              if !length
                playlistName = Utils.filterSymbols(str)
                Playlists.create(playlistName, ->
                  Playlists.getAll((playlists) ->
                    sidebar.populatePlaylists(playlists)
                  )
                  userTracking.event(
                    "Group", "Create", playlistName).send()
                )
                $('#playListName').val("")
              else
                alertify.alert("Error", "This group name already exists")
            )
            @close()
      ]

  close: ->
    @playlistPanel.dialog 'close'

  show:  ->
    @playlistPanel.dialog 'open'

  reposition: ->
    @playlistPanel.dialog('option', 'position',
      of: @positionTarget
    )

  bindEvents: ->
    @playlistPopup.on 'click', =>
      if @playlistPanel.is ':hidden'
        @show()
      else
        @close()


__playlists = []

class Playlists
  @clear = (success) ->
    db.playlist.remove({}, { multi: true }, (error) ->
      if error
        logger.error("Playlists.clear remove playlist erorr :")
        logger.error(error)
      success?()
    )

  @addMatch: (match_id, playlistName) ->
    db.playlist.update({ name: playlistName },
      { $addToSet: { matches: match_id } }, {}, (error) ->
        if error
          logger.error("Playlists.addMatch erorr :")
          logger.error(error)
    )

  @updatePlaylistPos: (playlistName, position) ->
    db.playlist.update({
      name: playlistName
    }, {
      $set: {
        position: position
      }
    }, {}, (error) ->
      if error
        logger.error("Playlists.updatePlaylistPos update playlist erorr :")
        logger.error(error)
    )

  @removeMatch: (match_id, playlistName) ->
    db.playlist.update({ name: playlistName },
      { $pull: { matches: match_id } }, {}, (error, numUpdated) ->
        if error
          logger.error("Playlists.addMatch erorr :")
          logger.error(error)
    )

  @create: (name, success) ->
    unix_timestamp = Math.round((new Date()).getTime() / 1000)
    db.playlist.remove({
      name: name
    }, {}, (error) ->
      if error
        logger.error("Playlists.create remove playlist erorr :")
        logger.error(error)
      else
        db.playlist.insert({
          name: name,
          created: unix_timestamp,
          position: 0,
          matches: []
        }, (error) ->
          if error
            logger.error("Playlists.create create playlist erorr :")
            logger.error(error)
          else
            success?()
        )
    )

  @delete: (name) ->
    db.playlist.remove({
      name: name
    }, {}, (error) ->
      if error
        logger.error("Playlists.delete remove playlist erorr :")
        logger.error(error)
    )

  @getAll = (success) ->
    db.playlist.find({}).sort({
      position: 1
    }).exec((error, foundPlaylists) ->
      if error
        logger.error("Playlists.getAll find playlist erorr :")
        logger.error(error)
        success?([])
      else
        __playlists = foundPlaylists
        success?(foundPlaylists)
    )

  @getMatchesForPlaylist = (playlist, success) ->
    db.playlist.findOne({name: playlist}, (err, playlist)->
      if err
        logger.error("Playlists.getMatchesForPlaylist find track erorr :")
        logger.error(err)
        success?([])
      else
        match_ids = playlist.matches
        db.matches.find({match_id: $in: match_ids}, (err, matches)->
          if err
            logger.error("Playlists.getMatchesForPlaylist find track erorr :")
            logger.error(err)
            success?([])
          else
            success?(matches)
        )
    )

  @getPlaylistNameExist: (name, success) ->
    db.playlist.find({
      name: name
    }, (error, foundPlaylists) ->
      if error
        logger.error("Playlists.getPlaylistNameExist find playlist erorr :")
        logger.error(error)
        success?(0)
      else
        success?(foundPlaylists.length)
    )

  @rename: (name, new_name) ->
    db.playlist.update({
      name: name
    }, {
      $set: {
        name: new_name
      }
    }, {}, (error) ->
      if error
        logger.error("Playlists.rename update playlist erorr :")
        logger.error(error)
    )
