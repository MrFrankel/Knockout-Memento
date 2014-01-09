@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\istanbul\lib\cli.js" %*
) ELSE (
  node  "%~dp0\..\istanbul\lib\cli.js" %*
)