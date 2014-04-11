@echo off
setlocal EnableDelayedExpansion
del /q /s .\coverage\json_files\*.*
karma start ./karma.conf.js