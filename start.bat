@echo off
REM Script para iniciar o projeto nm82
REM Powered by BMAD Core

echo ========================================
echo    Iniciando Projeto nm82
echo ========================================
echo.

REM Verifica se a porta 3000 ja esta em uso
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo [AVISO] Porta 3000 ja esta em uso!
    echo Execute stop.bat primeiro ou escolha outra porta.
    echo.
    pause
    exit /b 1
)

REM Verifica se node_modules existe
if not exist "node_modules" (
    echo [INFO] node_modules nao encontrado. Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

REM Gera o Prisma Client
echo [INFO] Gerando Prisma Client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo [AVISO] Erro ao gerar Prisma Client. Continuando...
)

echo.
echo [INFO] Iniciando servidor de desenvolvimento...
echo [INFO] Servidor disponivel em: http://localhost:3000
echo.
echo Para parar o servidor, feche esta janela ou use Ctrl+C
echo Para parar via script, execute: stop.bat
echo.

REM Inicia o servidor
start /B npm run dev

REM Aguarda um pouco para o servidor iniciar
timeout /t 5 /nobreak > nul

REM Verifica se o servidor iniciou
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    Servidor Iniciado com Sucesso!
    echo    URL: http://localhost:3000
    echo ========================================
    echo.
    echo Pressione qualquer tecla para abrir no navegador...
    pause > nul
    start http://localhost:3000
) else (
    echo.
    echo [ERRO] Falha ao iniciar o servidor!
    echo Verifique os logs acima para mais detalhes.
    pause
    exit /b 1
)
