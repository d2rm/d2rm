# global MatchSource, l10n, Playlists, userTracking, jQuery,
# sidebar
class Matchlist
  constructor: ->
    @_currentMatchlist = []
    @_contentWrapper = $('#ContentWrapper')
    @_matchContainerClass = "tr[role]"

    @bindEvents()

  bindEvents: ->
    self = @

    @_contentWrapper.on 'contextmenu', @_matchContainerClass, (e) ->
      currentMatchContainer = $(@)

      # this is an option used to create menuItem if needed
      options =
        groupName: ''
        match_id: Number($(@).find('.match-link').text())

      e.stopPropagation()
      menu = new gui.Menu()

      if window.sidebar.getActiveItem().hasClass('history')
        menu.append self._createRemoveFromHistoryMenuItem(
          currentMatchContainer, options)

      Playlists.getAll((playlists) ->
        # create playlists
        $.each playlists, (index, playlist) ->

          isActivePlaylist =
            playlist.name is window.sidebar.getActivePlaylistName()

          # Do nothing
          if isActivePlaylist
            return

          options.groupName = playlist.name
          menu.append self._createPlaylistMenuItem(options)

        if window.sidebar.getActiveItem().hasClass('playlist')
          options.groupName = window.sidebar.getActivePlaylistName()
          menu.append self._createRemoveFromPlaylistMenuItem(
            currentMatchContainer, options)

        # Add one more separator to make it look sexy
        if playlists.length isnt 0
          menu.append self._createSeparatorMenuItem()

        # show menu
        menu.popup e.clientX, e.clientY
      )

  getCurrentMatchlist: ->
    return @_currentMatchlist

  populate: (matches, players, route) ->
    @_currentMatchlist = []

    @_contentWrapper
      .empty()
      .scrollTop()

    if players and $('#SideBar .active').hasClass('tracked-players')
      makeView(route, {players: players}).appendTo($('#ContentWrapper'))
    else if matches
      for x of matches
        matches[x].id = x
      @_currentMatchlist = matches
      db.constants.find({}, (err, constants)->
        if(err)
          return logger.error(err)
        data = []
        constants = constants[0]
        for id, match of matches
          available = "Yes"
          fileName = Settings.get('replay-folder') + path.sep + match.match_id + ".dem"
          if(!fs.existsSync(fileName))
            available = "No"
          row = {}
          row.match_id = "<a href='#' class='match-link' id='" + match.match_id + "'>" + match.match_id + "</a>"
          if route is 'history'
            row.last_watched = {"display": moment.unix(match.last_watched).fromNow(), "timestamp": match.last_watched}
          row.game_mode = (if constants.modes[match.game_mode] then constants.modes[match.game_mode].name else match.game_mode)
          row.region = (if constants.regions[match.cluster] then constants.regions[match.cluster] else match.cluster)
          row.duration = moment().startOf("day").seconds(match.duration).format("H:mm:ss")
          row.result = (if match.radiant_win then "Radiant Victory" else "Dire Victory")
          row.played = {"display": moment.unix(match.start_time + match.duration).fromNow(), "timestamp": match.start_time + match.duration}
          row.status = constants.parse_status[match.parse_status] or "Unavailable"
          row.saved = available
          data.push(row)
        makeView(route,
          {
            moment: moment,
            data: data
          }).appendTo($('#ContentWrapper'))
      )
    else
      makeView('404', {message: "Unable to process matches"}).appendTo(@_contentWrapper)
    
  _createSeparatorMenuItem: () ->
    return new gui.MenuItem(type: 'separator')

  _createPlaylistMenuItem: (options) ->
    playlistName = options.groupName
    match_id = options.match_id

    return new gui.MenuItem(
      label: l10n.get('context_menu_add_to_playlist') + ' ' + playlistName,
      click: ->
        Playlists.addMatch(
          match_id,
          playlistName
        )
        userTracking.event(
          'Playlist',
          'Add Match to Group',
          playlistName
        ).send()
    )

  _createRemoveFromPlaylistMenuItem: (currentMatchContainer, options) ->
    playlistName = options.groupName
    match_id = options.match_id

    return new gui.MenuItem(
      label: l10n.get('context_menu_remove_from_playlist') + playlistName,
      click: ->
        Playlists.removeMatch(
          match_id,
          playlistName
        )
        $('.dataTable').DataTable().row(currentMatchContainer).remove().draw()
        userTracking.event(
          'Playlist',
          'Remove Match from Group',
          playlistName
        ).send()
    )

  _createRemoveFromHistoryMenuItem: (currentMatchContainer, options) ->
    match_id = options.match_id

    return new gui.MenuItem(
      label: l10n.get('context_menu_remove_from_history'),
      click: ->
        History.removeMatch(
          match_id
        )
        $('.dataTable').DataTable().row(currentMatchContainer).remove().draw()
        userTracking.event(
          'History',
          'Remove Match from History'
        ).send()
    )
