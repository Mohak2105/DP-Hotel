@echo off
set "SCRIPT_DIR=%~dp0"
set "JAVA_HOME=C:\Users\MOHAK\Downloads\jdk-25_windows-x64_bin\jdk-25.0.1"
call "%SCRIPT_DIR%..\tools\apache-maven-3.9.9\bin\mvn.cmd" %*
