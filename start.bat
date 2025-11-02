@echo off
echo.
echo ====================================
echo  Iniciando Servidor de Desenvolvimento
echo ====================================
echo.

REM Verificar se o Node está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não encontrado!
    echo Por favor, instale o Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js encontrado:
node --version
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo [AVISO] Dependências não encontradas. Instalando...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependências!
        pause
        exit /b 1
    )
    echo.
)

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo [AVISO] Arquivo .env não encontrado!
    echo Copiando .env.example para .env...
    copy .env.example .env
    echo.
    echo [ATENÇÃO] Configure as variáveis de ambiente no arquivo .env antes de continuar!
    echo Pressione qualquer tecla para abrir o arquivo .env...
    pause >nul
    start notepad .env
    echo.
    echo Após configurar o .env, pressione qualquer tecla para continuar...
    pause >nul
)

REM Limpar cache do Next.js (opcional, descomente se necessário)
REM if exist "apps\web\.next" (
REM     echo Limpando cache do Next.js...
REM     rmdir /s /q "apps\web\.next"
REM )

echo.
echo ====================================
echo  Iniciando servidor em http://localhost:3000
echo ====================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Iniciar o servidor
npm run dev

pause
