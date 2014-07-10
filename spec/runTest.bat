setlocal EnableDelayedExpansion
del /q /s .\coverage\json_files\*.json
for /f %%j in ('karma start ./karma.conf.js') do set karmaRe=%%j
for /f  %%i in ('node ./mergeCoverageForIstanbul.js') do set re=%%i
istanbul report html coverage/json_files/%re%.json
