@echo off
echo.
echo ====================================
echo  Parando Servidor de Desenvolvimento
echo ====================================
echo.

echo Procurando processos Node.js...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if %errorlevel% neq 0 (
    echo [AVISO] Nenhum processo Node.js encontrado!
    echo.
    pause
    exit /b 0
)

echo Encontrados os seguintes processos Node.js:
echo.
tasklist /FI "IMAGENAME eq node.exe"
echo.

set /p CONFIRM="Deseja parar todos os processos Node.js? (S/N): "
if /i "%CONFIRM%" neq "S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo Parando processos Node.js...
taskkill /F /IM node.exe 2>NUL

if %errorlevel% equ 0 (
    echo [OK] Processos Node.js encerrados com sucesso!
) else (
    echo [ERRO] Falha ao encerrar processos Node.js!
)

echo.
pause
