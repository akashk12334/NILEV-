@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for NILEV Backend
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

SET MAVEN_VERSION=3.9.9
SET MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip
SET MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%
SET MAVEN_BIN=%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd

IF NOT EXIST "%MAVEN_BIN%" (
    ECHO [NILEV] Maven %MAVEN_VERSION% wrapper not found. Downloading...
    IF NOT EXIST "%MAVEN_DIR%" MKDIR "%MAVEN_DIR%"
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%MAVEN_DIR%\maven.zip'; Expand-Archive -Path '%MAVEN_DIR%\maven.zip' -DestinationPath '%MAVEN_DIR%' -Force; Remove-Item '%MAVEN_DIR%\maven.zip'"
    IF NOT EXIST "%MAVEN_BIN%" (
        ECHO [NILEV] Failed to initialize Maven wrapper. Please verify internet connection.
        EXIT /B 1
    )
    ECHO [NILEV] Maven %MAVEN_VERSION% wrapper ready.
)

"%MAVEN_BIN%" %*
