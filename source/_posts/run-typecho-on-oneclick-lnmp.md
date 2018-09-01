---
title: "[Initial Post] 使用 LNMP 一键安装包运行 Typecho"
date: 2015-04-02 21:50:00
---

## 配置过程

这里我是在 VPS 上使用 LNMP 一键安装包搭建的 Web 环境，如果使用虚拟主机或 LAMP 过程会相对简单。下面是整个配置过程：

1. [VPS] 新建一个虚拟主机用来部署新站点：LNMP 一键安装包中提供了 `vhost.sh` 脚本来创建虚拟主机，按照提示绑定域名设置好各项参数即可顺利完成虚拟主机创建。需要注意的是，在配置 rewrite 规则时要键入「typecho」来加载为 Nginx 编写的 typecho rewrite 规则，否则将影响 typecho 伪静态功能。
2. [VPS] 绑定域名：到 DNS 服务提供商处将虚拟主机上设置的域名绑定到 VPS 的 IP 地址。
3. 下载并解压 typecho 安装包：进入到刚刚创建完成的虚拟主机根目录，使用 `wget https://github.com/typecho/typecho/releases/download/v1.0-14.10.10-release/1.0.14.10.10.-release.tar.gz` 命令下载最新版 typecho。下载完成后运行 `tar xzf 1.0.14.10.10.-release.tar.gz` 解压安装文件，解压后的程序文件包括在一个 build 目录中，我们还需要使用 `mv` 命令将 build 目录下的文件全部移动到虚拟主机根目录下。
4. 创建数据库：使用 phpMyAdmin 或其他数据库管理工具为 typecho 创建一个新的数据库备用。
5. 安装 typecho：使用域名访问站点，将自动进入 typecho 的安装界面，填写相关信息后 typecho 将会自动完成安装。

至此，typecho 已经安装完成。

<!--more-->

## 登录 404 问题

安装完成后如果马上登录管理页面，则会遇到 404 错误。导致该错误的原因是使用 LNMP 一键安装包提供的 `vhost.sh` 脚本创建的虚拟主机默认没有开启 pathinfo 路径模式，致使类似 `index.php/index` 形式的 URL 会出现 404 错误。（有关 Nginx 中 pathinfo 的详细信息，可以参见[这篇文章](http://www.nginx.cn/426.html)）

解决这个问题的方法也非常简单，只需要修改虚拟主机的配置文件（位于 `/usr/local/nginx/conf/vhost` 下），在 `try_files $uri =404;` 这行前添加 `#` 注释符号，并删除 `#include pathinfo.conf;` 这行前面的 `#` 注释符号即可。不要忘记重启 Nginx 服务来让配置生效。
