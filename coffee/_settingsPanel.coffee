# global Playlists, History, win

class SettingsPanel
  constructor: ->
    # Selectors
    @settingsPanel = $('#settings-panel')
    @getAPIKeyBtn = $('#getAPIKey')
    @APIKey = $('#APIKey')
    @userID = $('#userID')
    @steamUser = $('#steam-user')
    @steamPassword = $('#steam-password')
    @settingsBtn = $('#Settings .settings')
    @devToolsBtn = $('#devTools')
    @resetDatabaseBtn = $('#resetDatabase')
    @languageSelect = $('#LanguageSelect')
    @themeSelect = $('#ThemeSelect')
    @positionTarget = $('body')
    @checkboxSettings = @settingsPanel.find('.checkbox-settings')
    @addUser = $('#addUser')
    @userList = $('#userList')
    @replayFolder = $('#replay-folder')
    @steamFolder = $('#steam-folder')
    @replayFolderBtn = $('#replay-folder-button')
    @steamFolderBtn = $('#steam-folder-button')
    @replayFolderInput = $('#replay-folder-input')
    @steamFolderInput = $('#steam-folder-input')
    @trackSteamUser = $('#track-steam-account')

    $('input[title]').tooltip()
    @bindEvents()
    @initDialog()
    @initL10nOptions()

  bindEvents: ->
    @trackSteamUser.on 'change', ->
      myProfile = $('#SideBar li.profile')
      if @.checked
        DotaUtils.trackSteamAccount((err)->
          if(err)
            logger.error(err)
            alertify.error('Could not track steam account')
          else
            myProfile.show()
        )
      else
        Settings.set('steam-account-id', '')
        DotaUtils.assureSteamConnection(->
          db.players.remove({account_id: Dota2.AccountID}, {}, (err) ->
            if(err)
              return logger.error("Unable to remove steam account from database")
            logger.info("No longer tracking steam account")
            DotaUtils.purgePlayerMatches()
            myProfile.hide()
          )
        )
    
    @settingsBtn.on 'click', =>
      if @settingsPanel.is ':hidden'
        @show()
      else
        @close()
        
    @replayFolderBtn.on 'click', =>
      @replayFolder.click()

    @steamFolderBtn.on 'click', =>
      @steamFolder.click()
      
    @replayFolder.change(->
      val = $(@).val()
      if(val)
        $('#replay-folder-input').val(val)
    )

    @steamFolder.change(->
      val = $(@).val()
      if(val)
        $('#steam-folder-input').val(val)
    )

    @getAPIKeyBtn.on 'click', ->
      gui.Shell.openExternal('http://steamcommunity.com/dev/apikey')

    @devToolsBtn.on 'click', =>
      win.showDevTools()
      @close()

    @resetDatabaseBtn.on 'click', =>
      @close()
      alertify.confirm()
      .set('title', "Confirm Deletion")
      .set('message', "Are you sure you want to clear the database?")
      .set('labels', {ok: 'Yes', cancel: 'No'})
      .set('onok', ->
        Playlists.clear ->
          History.clear ->
            DotaUtils.clearDota((err)->
              if(err)
                alertify.error("Failed to clear database")
                return logger.error(err);
              $('#SideBar li.matches').click()
              alertify.success("Cleared database")
            )
        ).show()

    @addUser.on 'click', =>
      idToAdd = @userID.val()
      @userID.val('')
      DotaUtils.addTrackedPlayer(idToAdd, (err, name, id) ->
        if(err)
          return alertify.error(err)
        if $('#userList li:contains("' + name + '")').length == 0
          $('#userList').append('<li class="list-group-item" id="' + id +
            '">' + name +
            '<i class="fa fa-times"></i></li>')
          trackedUsers = {}
          $('#userList li').each((index) ->
            trackedUsers[$(@).prop('id')] = $(@).text()
          )
          Settings.set('tracked-users', JSON.stringify(trackedUsers))
          alertify.success("Now tracking " + name)
      )

    @userList.on('click', 'i', () ->
      id = Number($(@).parent().prop('id'))
      db.players.remove({account_id: id})
      name = $(@).parent().text()
      $(@).parent().remove()
      trackedUsers = {}
      $('#userList li').each((index) ->
        trackedUsers[$(@).prop('id')] = $(@).text()
      )
      Settings.set('tracked-users', JSON.stringify(trackedUsers))
      DotaUtils.purgePlayerMatches()
      logger.info("No longer tracking " + name)
      alertify.success("No longer tracking " + name)
    )


  initCheckboxes: ->
    @checkboxSettings.each((index, checkbox)->
      settingsKey = $(checkbox).prop('name')
      $(checkbox).prop('checked', Settings.get(settingsKey) is "true")
      if(!Settings.get('steam-user') or !Settings.get('steam-password'))
        $(checkbox).prop('disabled', true)
      else
        $(checkbox).prop('disabled', false)
    )
    if(Settings.get('steam-account-id'))
      @trackSteamUser.prop('checked', true)
    else
      @trackSteamUser.prop('checked', false)
      

  initTextboxes: ->
    @APIKey.val(Settings.get(@APIKey.prop('name')))
    @steamUser.val(Settings.get(@steamUser.prop('name')))
    @steamPassword.val(Settings.get(@steamPassword.prop('name')))
    
    replay_folder = Settings.get('replay-folder')
    steam_folder = Settings.get('steam-folder')
    @replayFolder.prop('nwworkingdir', replay_folder)
    @steamFolder.prop('nwworkingdir', steam_folder)
    @replayFolderInput.prop('placeholder', replay_folder)
    @steamFolderInput.prop('placeholder', steam_folder)

  saveTextboxes: ->
    if(Settings.get(@steamUser.prop('name')) != @steamUser.val() or
        Settings.get(@steamPassword.prop('name')) != @steamPassword.val())
      if(@trackSteamUser.prop('checked'))
        @trackSteamUser.click()
    Settings.set(@APIKey.prop('name'), @APIKey.val())
    Settings.set(@steamUser.prop('name'), @steamUser.val())
    Settings.set(@steamPassword.prop('name'), @steamPassword.val())
    if(@replayFolderInput.val())
      Settings.set('replay-folder', @replayFolderInput.val())
      @replayFolderInput.val('')
    if(@steamFolderInput.val())
      Settings.set('steam-folder', @steamFolderInput.val())
      @steamFolderInput.val('')
    if(Settings.get('api-key'))
      db.constants.findOne({}, (err, constants) ->
        if(err)
          return logger.error(err)
        if(!constants)
          backend.updateConstants((err) ->
            if(err)
              logger.error(err)
          )
      )

  initUserList: ->
    users = Settings.get('tracked-users')
    $('#userList').empty()
    if users
      for id, name of JSON.parse(users)
        $('#userList').append('<li class="list-group-item" id="' + id +
            '">' + name +
            '<i class="fa fa-times"></i></li>')

  initDialog: ->
    @settingsPanel.dialog
      autoOpen: false,
      height: 500,
      width: 600,
      position:
        of: @positionTarget
      show:
        effect: 'blind',
        duration: 500
      hide:
        effect: 'blind',
        duration: 500
      title: 'Settings',
      modal: true,
      dialogClass: 'settingsClass',
      buttons:
        'Cancel': =>
          @close()
        ,
        'Save': =>
          window.l10n.changeLang(@languageSelect.val())
          window.theme.changeTheme(@themeSelect.val())
          @saveTextboxes()
          @saveCheckboxes()
          @close()
          alertify.success("Settings saved")

  initL10nOptions: ->
    window.l10n.getSupportedLanguages((data) =>
      if !data
        return

      options = []
      languages = data.languages
      languages.forEach((language) ->
        option = $('<option>')
        option.prop('value', language.lang)
        option.text(language.label)

        if language.default
          option.prop('selected', true)

        options.push(option)
      )
      @languageSelect.append(options)
    )

  saveCheckboxes: ->
    @checkboxSettings.each((index, checkbox) ->
      settingsKey = $(checkbox).prop('name')
      Settings.set(settingsKey, checkbox.checked)
    )
    @adjustParseStatus()
    
  adjustParseStatus: ->
    if(Settings.get('save-all-replays') is "true")
      data = {toFind: 3, toSet: 0}
    else
      data = {toFind: 0, toSet: 3}
    db.matches.update({
      parse_status: data.toFind
    }, {
      $set: {
        parse_status: data.toSet
      }
    }, {
      multi: true
    }, (err)->
      if(err)
        return logger.error(err)
    )

  reposition: ->
    @settingsPanel.dialog('option', 'position',
      of: @positionTarget
    )

  close: ->
    @settingsPanel.dialog 'close'

  show: ->
    @initCheckboxes()
    @initTextboxes()
    @initUserList()
    @settingsPanel.dialog 'open'

  toggle: ->
    isOpen = @settingsPanel.dialog 'isOpen'
    if isOpen
      @close()
    else
      @show()
