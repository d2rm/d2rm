# global User, jQuery, tracklist
class Sidebar
  constructor: ->
    @sidebarContainer = $('#SideBar')
    @contentWrapper = $('#ContentWrapper')
    @topSidebar = @sidebarContainer.find('.top-sidebar ul')
    @middleSidebar = @sidebarContainer.find('.middle-sidebar ul')
    @bottomSidebar = @sidebarContainer.find('.bottom-sidebar ul')

    @bindEvents()

  bindEvents: ->
    self = @
    activeableList = [
      'li.history',
      'li.tracked-players',
      'li.matches',
      'li.playlist',
      'li.profile'
    ]

    @sidebarContainer.on('click', activeableList.join(','), ->
      self.sidebarContainer.find('.active').removeClass('active')
      $(@).addClass('active')
    )

    @sidebarContainer.on('click', 'li', ->
      if !$(@).hasClass('no-page')
        self.contentWrapper.empty()
        $('#Spinner').css('display', 'block')

      if $(@).hasClass('profile')
        viewHelper.clearContent()
        viewHelper.showPlayer(Number(Settings.get('steam-account-id')))

      if $(@).hasClass('matches')
        MatchSource.matches((matches) ->
          window.referrer.page = 'matches'
          window.referrer.bridge = false
          window.matchlist.populate(matches, null, 'matches')
        )
      else if $(@).hasClass('history')
        MatchSource.history((matches) ->
          window.matchlist.populate(matches, null, 'history')
        )
      else if $(@).hasClass('playlist')
        MatchSource.playlist($(@).data('name'), ((matches) ->
          window.matchlist.populate(matches, null, 'matches')
        ))
      else if $(@).hasClass('tracked-players')
        MatchSource.trackedPlayers((players) ->
          window.referrer.page = 'tracked-players'
          window.referrer.bridge = false
          window.matchlist.populate(null, players, 'players')
        )
      else if $(@).hasClass('refresh')
        resetCache()
        backend.refreshDOTA((err, result) ->
          if(err)
            logger.error(err)
            alertify.error(err)
          else
            logger.info(result)
        )
        alertify.success("Synchronizing DOTA 2 data")
      else if $(@).hasClass('settings')
        if $('#settings-panel').is ':hidden'
          settingsPanel.show()
        else
          settingsPanel.close()
      else if $(@).hasClass('donations')
        gui.Shell.openExternal(
          'https://www.paypal.com/cgi-bin/webscr?cmd=' +
            '_donations&business=pyarmak%40gmail%2ecom&lc=' +
            'CA&item_name=DOTA%202%20Replay%20Manager&currency_code=' +
            'CAD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted'
        )
    )

    @bottomSidebar.on 'click', 'li.new', ->
      playlistPanel.show()

    @bottomSidebar.on 'contextmenu', 'li.playlist', (e) ->
      e.stopPropagation()
      playlistName = Utils.filterSymbols($(@).data('name'))
      menu = new gui.Menu()
      menu.append self._createDeleteMenuItem(playlistName)
      menu.append self._createRenameMenuItem(playlistName)
      menu.popup e.clientX, e.clientY

  getActiveItem: ->
    return @sidebarContainer.find('ul li.active')

  getActivePlaylistName: ->
    activeItem = @getActiveItem()
    if activeItem.hasClass('playlist')
      return activeItem.attr("data-name")
    else
      return ''

  populatePlaylists: (playlists) ->
    self = @
    @bottomSidebar.find('li.playlist').remove()

    for playlist in playlists
      @bottomSidebar.append(
        @_createPlaylistItem(playlist.name)
      )

    # Re-active context after repopulating
    @_reactivePlaylistItem(@getActivePlaylistName())
    @bottomSidebar.sortable({
      placeholder: "ui-state-highlight",
      items: "li:not(.new)",
      update: (event, ui) ->
        self._updatePlaylistPos()
    })

  _updatePlaylistPos: () ->
    sideBarItems = @bottomSidebar.find("li:not(.new)")

    sideBarItems.each () ->
      Playlists.updatePlaylistPos($(@).attr("data-name"), $(@).index())


  _createPlaylistItem: (playlistName) ->
    playlistItem = $("
      <li class='playlist' data-name='#{playlistName}'>
          <i class='fa fa-align-justify'></i>
              #{playlistName}
      </li>
    ")

    return playlistItem

  _reactivePlaylistItem: (activePlaylistName) ->
    @sidebarContainer.find('ul li').filter( ->
      $(@).text() == activePlaylistName
    ).addClass('active')

  _createDeleteMenuItem: (playlistName) ->
    self = @
    return new gui.MenuItem(
      label: 'Delete ' + playlistName,
      click: ->
        alertify.confirm()
        .set('title', "Confirm Deletion")
        .set('message', l10n.get('delete_playlist_popup'))
        .set('labels', {ok: 'Yes', cancel: 'No'})
        .set('onok', (e) ->
          if e
            self.sidebarContainer.find(
              '[data-name="' + playlistName + '"]').remove()
            Playlists.delete(playlistName)
            Playlists.getAll((playlists) ->
              self.populatePlaylists(playlists)
            )
            userTracking.event("Group", "Delete", playlistName).send()
        ).show()
    )

  _createRenameMenuItem: (oldPlaylistName) ->
    self = @
    return new gui.MenuItem(
      label: 'Rename ' + $(@).text(),
      click: ->
        alertify.prompt()
        .set('title', "Rename Group")
        .set('message', l10n.get('rename_playlist_popup'))
        .set('value', oldPlaylistName)
        .set('onok', (e, newName) ->
          if e && newName
            newName = Utils.filterSymbols(newName)
            Playlists.getPlaylistNameExist(newName, (length) ->
              if !length
                Playlists.rename(oldPlaylistName, newName)
                Playlists.getAll((playlists) ->
                  self.populatePlaylists(playlists)
                )
                userTracking.event("Playlist", "Rename", newName).send()
              else
                alertify.alert("Error", "This group name already exists")
            )
          else
            return
        ).show()
    )
