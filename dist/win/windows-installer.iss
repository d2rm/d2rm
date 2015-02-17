; Installer Variables
#define AppName "DOTA 2 Replay Manager"
#define AppVersion "0.3.0"
#define AppPublisher "Pavel Yarmak"
#define AppURL "https://github.com/d2rm/d2rm"
#define AppExeName "run.bat"
#define WebKitVersion "0.8.6"

[Setup]
; DON'T FUCK WITH THE APPID. This uniquely identifies this application, which is used to find the app if we need to update it.
AppId={{F4B2C5C1-F184-4858-B9C3-E641F5C12BBC}

AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}

; Make the Installer nicer and Minimalistic
WizardImageFile=.\installer-image.bmp
WindowResizable=no

; Don't ask for a install folder (it goes into \Users\Username\AppData\Roaming\D2RM\, which doesn't require admin privileges)
UsePreviousAppDir=no
DefaultDirName={userappdata}\D2RM

; No Start Menu Folder picker (It's always created)
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes

; We just need a Welcome Page and a Finish page. Nothing else.
DisableReadyPage=yes
DisableFinishedPage=no
DisableWelcomePage=no

; No UAC bullshit
PrivilegesRequired=lowest
; Put the uninstaller in the same folder, or else it'll go into Program Files, which requires Admin Privileges
UninstallFilesDir={app}

; Use the same language as the user (or ask otherwise)
ShowLanguageDialog=no

; Compress the files nicely
Compression=lzma2/ultra
SolidCompression=yes

; Final Installer
OutputBaseFilename=Install {#AppName} {#AppVersion}
SetupIconFile=..\..\images\d2rm.ico
UninstallDisplayIcon=..\..\images\d2rm.ico
OutputDir=.\


[Languages]
Name: "en"; MessagesFile: ".\languages\English.isl"


[Files]
Source: ".\run.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\index.html"; DestDir: "{app}\app\"; Flags: ignoreversion
Source: "..\..\splash.html"; DestDir: "{app}\app\"; Flags: ignoreversion
Source: "..\..\package.json"; DestDir: "{app}\app\"; Flags: ignoreversion
Source: "..\..\constants.json"; DestDir: "{app}\app\"; Flags: ignoreversion
Source: "..\..\abilities.json"; DestDir: "{app}\app\"; Flags: ignoreversion
Source: "..\..\l10n\*"; DestDir: "{app}\app\l10n\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\views\*"; DestDir: "{app}\app\views\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\css\*"; DestDir: "{app}\app\css\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\fonts\*"; DestDir: "{app}\app\fonts\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\js\*"; DestDir: "{app}\app\js\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\images\*"; DestDir: "{app}\app\images\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\node-uuid\*"; DestDir: "{app}\app\node_modules\node-uuid\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\request\*"; DestDir: "{app}\app\node_modules\request\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\request-progress\*"; DestDir: "{app}\app\node_modules\request-progress\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\tarball-extract\*"; DestDir: "{app}\app\node_modules\tarball-extract\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\universal-analytics\*"; DestDir: "{app}\app\node_modules\universal-analytics\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\nedb\*"; DestDir: "{app}\app\node_modules\nedb\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\winston\*"; DestDir: "{app}\app\node_modules\winston\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\seek-bzip\*"; DestDir: "{app}\app\node_modules\seek-bzip\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\retry\*"; DestDir: "{app}\app\node_modules\retry\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\dota2\*"; DestDir: "{app}\app\node_modules\dota2\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\steam\*"; DestDir: "{app}\app\node_modules\steam\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\async\*"; DestDir: "{app}\app\node_modules\async\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\big-number\*"; DestDir: "{app}\app\node_modules\big-number\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\cheerio\*"; DestDir: "{app}\app\node_modules\cheerio\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\jade\*"; DestDir: "{app}\app\node_modules\jade\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\moment\*"; DestDir: "{app}\app\node_modules\moment\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\node_modules\node-webkit-updater\*"; DestDir: "{app}\app\node_modules\node-webkit-updater\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\cache\{#WebKitVersion}\win\*"; DestDir: "{app}\node-webkit\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\parser\dist\parser.exe"; DestDir: "{app}\node-webkit\parser\dist\"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files


[Icons]
; Add an Icon in the app folder as a reference
Name: "{app}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\node-webkit\nw.exe"; Parameters:"""{app}\app"""; IconFilename: "{app}\app\images\d2rm.ico"; Flags: runminimized preventpinning
; Another in the group (this one can be featured)
Name: "{group}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\node-webkit\nw.exe"; Parameters:"""{app}\app"""; IconFilename: "{app}\app\images\d2rm.ico"; Flags: runminimized
; Another in the desktop
Name: "{commondesktop}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\node-webkit\nw.exe"; Parameters:"""{app}\app"""; IconFilename: "{app}\app\images\d2rm.ico"; Flags: runminimized preventpinning


[Run]
; Run the app after installing
Filename: "{app}\node-webkit\nw.exe"; Parameters: """{app}\app"""; Description: "{cm:LaunchProgram,{#StringChange(AppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent runminimized

[Code]
function InitializeSetup(): Boolean;
var
 ErrorCode: Integer;
 JavaInstalled : Boolean;
 Result1 : Boolean;
 Versions: TArrayOfString;
 I: Integer;
begin
 if RegGetSubkeyNames(HKLM, 'SOFTWARE\JavaSoft\Java Runtime Environment', Versions) then
 begin
  for I := 0 to GetArrayLength(Versions)-1 do
   if JavaInstalled = true then
   begin
    //do nothing
   end else
   begin
    if ( Versions[I][2]='.' ) and ( ( StrToInt(Versions[I][1]) > 1 ) or ( ( StrToInt(Versions[I][1]) = 1 ) and ( StrToInt(Versions[I][3]) >= 7 ) ) ) then
    begin
     JavaInstalled := true;
    end else
    begin
     JavaInstalled := false;
    end;
   end;
 end else
 begin
  JavaInstalled := false;
 end;


 //JavaInstalled := RegKeyExists(HKLM,'SOFTWARE\JavaSoft\Java Runtime Environment\1.9');
 if JavaInstalled then
 begin
  Result := true;
 end else
    begin
  Result1 := MsgBox('This tool requires Java Runtime Environment version 1.7 or newer to run. Please download and install the JRE and run this setup again. Do you want to download it now?',
   mbConfirmation, MB_YESNO) = idYes;
  if Result1 = false then
  begin
   Result:=false;
  end else
  begin
   Result:=false;
   ShellExec('open',
    'http://www.java.com/getjava/',
    '','',SW_SHOWNORMAL,ewNoWait,ErrorCode);
  end;
    end;
end;


end.
/////////////////////////////////////////////////////////////////////
function GetUninstallString(): String;
var
  sUnInstPath: String;
  sUnInstallString: String;
begin
  sUnInstPath := ExpandConstant('Software\Microsoft\Windows\CurrentVersion\Uninstall\{#emit SetupSetting("AppId")}_is1');
  sUnInstallString := '';
  if not RegQueryStringValue(HKLM, sUnInstPath, 'UninstallString', sUnInstallString) then
    RegQueryStringValue(HKCU, sUnInstPath, 'UninstallString', sUnInstallString);
  Result := sUnInstallString;
end;


/////////////////////////////////////////////////////////////////////
function IsUpgrade(): Boolean;
begin
  Result := (GetUninstallString() <> '');
end;


/////////////////////////////////////////////////////////////////////
function UnInstallOldVersion(): Integer;
var
  sUnInstallString: String;
  iResultCode: Integer;
begin
// Return Values:
// 1 - uninstall string is empty
// 2 - error executing the UnInstallString
// 3 - successfully executed the UnInstallString

  // default return value
  Result := 0;

  // get the uninstall string of the old app
  sUnInstallString := GetUninstallString();
  if sUnInstallString <> '' then begin
    sUnInstallString := RemoveQuotes(sUnInstallString);
    if Exec(sUnInstallString, '/SILENT /NORESTART /SUPPRESSMSGBOXES','', SW_HIDE, ewWaitUntilTerminated, iResultCode) then
      Result := 3
    else
      Result := 2;
  end else
    Result := 1;
end;

/////////////////////////////////////////////////////////////////////
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep=ssInstall) then
  begin
    if (IsUpgrade()) then
    begin
      UnInstallOldVersion();
    end;
  end;
end;
