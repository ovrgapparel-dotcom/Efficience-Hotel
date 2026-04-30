@echo off
echo ==========================================
echo   EFFICIENCE HOTEL ERP v2.0 - DEPLOY LOCAL
echo ==========================================
echo Chargement de l'intelligence hôtelière...
echo.
echo Le serveur va démarrer sur le port 8080.
echo Gardez cette fenêtre ouverte pour maintenir l'accès.
echo.
start http://localhost:8080
npx serve -s dist -l 8080
pause
