@echo off
echo ==========================================
echo   EFFICIENCE HOTEL ERP - DEPLOY LOCAL
echo ==========================================
echo Chargement de l'environnement hôtelier...
echo.
echo Le serveur va démarrer sur le port 8080.
echo Gardez cette fenêtre ouverte pour maintenir l'accès.
echo.
npx serve -s dist -l 8080
pause
