# Load native UI library
gui = require('nw.gui')
path = require('path')

# Get auto update libraries
pkg = require('../package.json')
updater = require('node-webkit-updater')
upd = new updater(pkg)

# load just a few things
async = require("async")
request = require("request")
progress = require('request-progress')
BigNumber = require('big-number').n
retry = require('retry')
cheerio = require('cheerio')
winston = require('winston')
fs = require('fs')
exec = require('child_process').exec
moment = require('moment')
Bunzip = require('seek-bzip')
steam = require('steam')
dota2 = require('dota2')
Steam = new steam.SteamClient()
Dota2 = new dota2.Dota2Client(Steam, false)
jade = require('jade')

# setup logging
transports = []
logPath = path.join(require('nw.gui').App.dataPath, 'dota.log')
exceptionPath = path.join(require('nw.gui').App.dataPath, 'exceptions.log')
winston.handleExceptions(new winston.transports.File({
  filename: exceptionPath,
  json: true
}))
FileLog = new winston.transports.File({
  filename: logPath,
  level: 'info',
  maxsize: 5242880,
  maxFiles: 1,
  json: false,
  timestamp: true
})
transports.push(FileLog)
transports.push(new(winston.transports.Console))
logger = new(winston.Logger)({transports: transports, prettyPrint: true})

# setup view helper function
makeView = (name, data)->
  if(!data)
    data = {}
  compiled = jade.compileFile('views/' + name + '.jade')
  $(compiled(data))

matchPages = {
  index: {
    template: "match_index",
    name: "Match"
  },
  details: {
    template: "match_details",
    name: "Details"
  },
  graphs: {
    template: "match_graphs",
    name: "Graphs"
  },
  chat: {
    template: "match_chat",
    name: "Chat"
  }
}

playerPages = {
  index: {
    template: "player_index",
    name: "Player"
  },
  matches: {
    template: "player_matches",
    name: "Matches"
  },
  heroes: {
    template: "player_heroes",
    name: "Heroes"
  },
  teammates: {
    template: "player_teammates",
    name: "Teammates"
  },
  graphs: {
    template: "player_graphs",
    name: "Graphs"
  }
}

window.referrer = {}

# Get window object (!= $(window))
win = gui.Window.get()
win.showDevTools()

# Debug flag
isDebug = false

# Set the app title (for Windows mostly)
win.title = gui.App.manifest.name + ' ' + gui.App.manifest.version

# Focus the window when the app opens
win.focus()

# Show the window when the app opens
win.show()

# DB
Datastore = require('nedb')

db = {}
db.playlist = new Datastore(
  filename: path.join(require('nw.gui').App.dataPath, 'playlist.db')
  autoload: true
)
db.constants = new Datastore(
  filename: path.join(require('nw.gui').App.dataPath, 'constants.db')
  autoload: true
)
db.players = new Datastore(
  filename: path.join(require('nw.gui').App.dataPath, 'players.db')
  autoload: true
)
db.players.ensureIndex({fieldName: 'account_id', unique: true})
db.matches = new Datastore(
  filename: path.join(require('nw.gui').App.dataPath, 'matches.db')
  autoload: true
)
db.matches.ensureIndex({fieldName: 'match_id', unique: true})

# Cancel all new windows (Middle clicks / New Tab)
win.on "new-win-policy", (frame, url, policy) ->
  policy.ignore()

# Prevent dragging/dropping files into/outside the window
preventDefault = (e) ->
  e.preventDefault()

window.addEventListener "dragover", preventDefault, false
window.addEventListener "drop", preventDefault, false
window.addEventListener "dragstart", preventDefault, false

# For mac, add basic menu back
if process.platform is 'darwin'
  defaultMenu = new gui.Menu({ type: 'menubar' })
  defaultMenu.createMacBuiltin(gui.App.manifest.name)
  win.menu = defaultMenu


########################################################

$ ->
  window.l10n = new L10n
  window.theme = new Theme
  window.windowManager = new WindowManager
  window.settingsPanel = new SettingsPanel
  window.matchlist = new Matchlist
  window.sidebar = new Sidebar
  window.playlistPanel = new PlaylistPanel
  window.backend = new Backend
  window.dotaUtils = new DotaUtils
  window.charts = new Charts
  window.viewHelper = new ViewHelper
  window.heatmap = new Heatmap
  
#  backend.printDBInfo();

  # Update DOTA 2 stuff
  backend.updateConstants((err) ->
    if(err)
      logger.error(err)
    $('#SideBar li.refresh').click()
  )

  if(Settings.get('steam-account-id'))
    $('#SideBar li.profile').show().click()
  else
    $('#SideBar li.matches').click()

  splash = gui.Window.open 'app://d2rm/splash.html', {
    position: 'center',
    width: 600,
    height: 300,
    frame: false,
    toolbar: false,
    icon: "images/icon.png"
  }

  windowManager.setWindowLocationOnScreen()

  setTimeout ->
    $(".blackScreen").remove()
    splash.close()
  , 3000

#provide a resizeend event
  timer = window.setTimeout ->
    ,
    0

  $(window).on 'resize', ->
    window.clearTimeout(timer)
    timer =
      window.setTimeout ->
        settingsPanel.reposition()
        if $('#cal-heatmap').length
          heatmap.responsiveCal()
      ,150

  # Make sure we would update strings when localization event is emitted
  l10n.addEventListener 'localizationchange', () ->
    $elements = $('[data-l10n-id]')
    $elements.each((index, ele) ->
      $ele = $(ele)
      l10nId = $ele.data('l10n-id')
      params = $ele.data('l10n-params')

      if $ele.attr('title') isnt undefined
        $ele.attr('title', l10n.get(l10nId, params))
      else if $ele.attr('placeholder') isnt undefined
        $ele.attr('placeholder', l10n.get(l10nId, params))
      else
        $ele.text(l10n.get(l10nId, params))
    )

  l10n.changeLang()

   # create sidebar related stuffs
  Playlists.getAll((playlists) ->
    sidebar.populatePlaylists(playlists)
  )

  # Check for version update
  # Linux and Windows only so far. Mac coming up soon
  if getOperatingSystem() is "windows" or "linux"
    upd.checkNewVersion (error, manifest) ->
      if error is null
        alertify.confirm()
        .set('title', "Confirm Update")
        .set('message', l10n.get('confirm_update'))
        .set('onok', (e) ->
          if e
            alertify.message l10n.get('downloading')
            upgradeNow manifest, (filename) ->
              logger.info "Done"
              if getOperatingSystem() is "windows"
                setTimeout ->
                  upd.run(filename)
                , 400
              if getOperatingSystem() is "linux"
                tarball = require('tarball-extract')
                tarball.extractTarball(filename, upd.getAppPath() + "/latest"
                , (error) ->
                  if error?
                    logger.error "path" + error
                  else
                    alertify.message l10n.get('linux_complete')
                )
        ).show()

    upgradeNow = (newManifest, cb) ->
      newVersion = upd.download (error, filename) ->
        logger.info "Saved to : " + filename
        if error is null
          logger.info "Current app in: " + upd.getAppPath() +
          "on " + getOperatingSystem()
          cb filename
      , newManifest
  true