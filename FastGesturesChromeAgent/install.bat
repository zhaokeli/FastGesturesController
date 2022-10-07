@echo off & setlocal enabledelayedexpansion

@REM 需要被替换的字符串,注意字符串前后不加“”，支持空格
set var1=__exepath__
@REM 替换成什么内容，此处是批处理当前路径
set var2=%~dp0FastGesturesChromeAgent.exe
set "var2=!var2:\=/!" 

for /r %%i in (*.tpl) do (
    echo %%i
    @REM 读取a.txt所有内容 
    for /f "eol=* tokens=*" %%j in (%%i) do ( 
        @REM 设置变量a为每行内容 
        set a=%%j 
        @REM 如果该行有var1，则将其改为var2
        set "a=!a:%var1%=%var2%!" 
        echo !a!
        @REM 把修改后的全部行存入$ 
        echo !a!>>$
    ) 
    @REM 用$的内容替换原来a.txt内容 
    move $ manifest.json
)


REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.fastgestures.agent" /ve /t REG_SZ /d "%~dp0manifest.json" /f
pause