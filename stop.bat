@echo off
REM Script para parar o projeto nm82
REM Powered by BMAD Core

echo ========================================
echo    Parando Projeto nm82
echo ========================================
echo.

REM Verifica se ha processos node rodando na porta 3000
netstat -ano | findstr :3000 > nul
if %errorlevel% neq 0 (
    echo [INFO] Nenhum servidor rodando na porta 3000.
    echo.
    pause
    exit /b 0
)

echo [INFO] Encontrando processo na porta 3000...

REM Obtem o PID do processo usando a porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    set PID=%%a
    goto :found
)

:found
if "%PID%"=="" (
    echo [ERRO] Nao foi possivel encontrar o PID do processo.
    pause
    exit /b 1
)

echo [INFO] Processo encontrado: PID %PID%
echo [INFO] Finalizando processo...

REM Mata o processo
taskkill //F //PID %PID% > nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    Servidor Parado com Sucesso!
    echo ========================================
    echo.
) else (
    echo.
    echo [ERRO] Falha ao parar o processo!
    echo Tente fechar manualmente ou execute como Administrador.
    echo.
)

REM Mata qualquer processo node remanescente (opcional, mais agressivo)
echo [INFO] Verificando por processos node remanescentes...
tasklist | findstr node.exe > nul
if %errorlevel% equ 0 (
    echo [INFO] Encontrados processos node. Deseja finalizar TODOS os processos node? (S/N)
    choice /C SN /M "Finalizar todos os processos Node.js"
    if errorlevel 2 goto :end
    if errorlevel 1 (
        taskkill //F //IM node.exe > nul 2>&1
        echo [INFO] Todos os processos node foram finalizados.
    )
)

:end
echo.
pause
