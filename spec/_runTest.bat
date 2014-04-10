setlocal EnableDelayedExpansion
del /q /s .\spec\coverage\json_files\*.json
for /f %%j in ('karma start ./spec/karma.conf.js') do set karmaRe=%%j
for /f  %%i in ('node ./spec/mergeCoverageForIstanbul.js') do set re=%%i
istanbul report html spec/coverage/json_files/%re%.json