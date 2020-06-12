- 链接：[https://www.zhihu.com/question/49719195]

范德成
范德成
DOS/Windows老用户，Windows Internals 6e译者之一
18 人赞同了该回答
作为Windows老用户我也来回答一下：
system32 相当于Unix中的/bin和/sbin，但原则上只包含系统程序，不包含应用程序。原来在16位Windows上， 所有系统文件都放在\WINDOWS目录里的，后来到了Windows 95/98开始，32位的系统程序（exe/dll等）默认放在\WINDOWS\system32目录。在NT系列里，基本上都是32位系统程序，所有大多数都在\WINNT\system32（后来变成了\WINDOWS\system32，又后来变成了\Windows\System32）目录。

Installer Cache从字面上理解，是Windows Installer安装msi/msp的缓存文件。WinSxS 是side-by-side assembly的意思，基本上系统文件的各个版本（包括初始版本和补丁版本）、一些共享文件的各个版本（如VCRedist）可以被安装进去。不同版本用于服务对版本需求不同的程序。这个目录是为了解决DLL hell问题而诞生的。

为什么 etc 底下只有几个文件？因为主要指用来保存网络相关的配置。其他配置都放在注册表里。可能和当初Windows的POSIX子系统有关。在Windows 2000上安装一个系统组件，叫Services for Unix，就可以用一个Korn Shell来访问到POSIX子系统。最新版本的可能不叫SFU了，你查一下，应该还是能找到的。

ProgramData 是以前的\Documents and Settings\All Users\Application Data，也就是应用程序设置和数据部分。All Users的用户文档部分分到了\Users\Public，如\Users\Public\Documents等。Program Files则是应用程序的程序部分。Common Files放一些应用程序厂商自己的共享库和共享文件。

为什么Documents and Settings被改成了Users？因为Documents and Settings太长，不方便用。更早的NT 4里面这个目录叫\WINNT\Profiles，后来改到\Documents and Settings的。
总体思想就是改进，把不好用的改进。当然，偶尔也会在改进途中引入其他的不好用。

补充一点：Users\<user_name>\AppData\Roaming是针对网络同步的用户肖像文件（user profile）中，会同步的部分（这个功能在Windows 2000中就有）。AppData\Local则不会自动同步。Roaming对应于老的\Documents and Settings\<user_name>\Application Data，而Local对应于\Documents and Settings\<user_name>\Local Settings\Application Data。
另外，有些程序沿用把配置数据放在/home/<user_name>/.<app_name>的习惯，在Windows下也把配置数据放在\Users\<user_name>\.<app_name>下面。
编辑于 2016-08-19