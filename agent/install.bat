@echo off & setlocal enabledelayedexpansion

@REM ��Ҫ���滻���ַ���,ע���ַ���ǰ�󲻼ӡ�����֧�ֿո�
set var1=__exepath__
@REM �滻��ʲô���ݣ��˴���������ǰ·��
set var2=%~dp0FastGesturesChromeAgent.exe
set "var2=!var2:\=/!" 

for /r %%i in (*.tpl) do (
    echo %%i
    @REM ��ȡa.txt�������� 
    for /f "eol=* tokens=*" %%j in (%%i) do ( 
        @REM ���ñ���aΪÿ������ 
        set a=%%j 
        @REM ���������var1�������Ϊvar2
        set "a=!a:%var1%=%var2%!" 
        echo !a!
        @REM ���޸ĺ��ȫ���д���$ 
        echo !a!>>$
    ) 
    @REM ��$�������滻ԭ��a.txt���� 
    move $ manifest.json
)


REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.fastgestures.agent" /ve /t REG_SZ /d "%~dp0manifest.json" /f
pause