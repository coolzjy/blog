---
title: Docker 简明指南
date: 2019-06-29 09:00:00
---

<!--more-->

## 概念

- **Docker 客户端** - 在 Docker 式工作流程中，大多数时候都使用 docker 命令控制并与远程 Docker 服务器通讯。
- **Docker 服务器** - 以守护进程模式运行的 docker 命令。这个命令把 Linux 系统变成 Docker 服务器，然后通过远程客户端管理服务器，在服务器中部署、启动或删除容器。
- **Docker 映像** - Docker 映像由一个或多个文件系统层和一些重要的元数据组成，包含运行 Docker 化应用所需的全部文件。一个 Docker 容器可以复制到多个宿主机中。容器一般都有一个名字和一个标签。标签一般用于标识容器的某个版本。
- **Docker 容器** - Docker 容器是使用 Docker 映像实例化的 Linux 容器。特定的容器只能存在一次，不过可以使用同一个映像轻易地创建多个容器。
- **基元宿主机** - 基元宿主机是经过细致调整的小型操作系统映像，例如 CoreOS 和 Project Atomic，用于存储容器，支持使用原子性操作升级操作系统。

## Docker 映像

容器都基于映像（image）创建。映像提供了部署和运行 Docker 所需的一切基础。若想启动容器，必须下载公共映像或者自己创建映像。每个 Docker 映像都包含一个或多个文件系统层，一般来说创建映像时每个构建步骤都会创建一个文件系统层。

### Dockerfile

- **FROM** - 指定基础映像，必须为第一条指令
- **RUN** - 构建映像时执行的内容
- **CMD/ENTRYPOINT** - 启动容器时执行的内容
- **LABEL** - 为映像添加元信息，已经取代 MAINTAINER 指令
- **EXPOSE** - 指定容器运行时的监听端口，启动容器时需要通过 `docker run -p/-P` 参数暴露指定端口
- **ENV** - 设置环境变量
- **ADD/COPY** - 复制文件或目录到容器的文件系统中
- **WORKDIR** - 设置工作目录

### 映像操作

- `docker build` - 在当前目录下构建映像，使用 `-t` 参数指定映像的名称和标签
- `docker commit` - 将容器保存为映像
- `docker history` - 查看映像创建历史
- `docker images` - 列出所有映像
- `docker rmi` - 删除映像（删除所有映像 - `docker rmi $(docker images -q)`）
- `docker push` - 向远端映像仓库推送映像
- `docker pull` - 从远端映像仓库拉取映像

## Docker 容器

容器是自成一体的执行环境，所有容器共用宿主系统的内核，而且系统中的容器之间是相互隔离的。容器的最大优势是高效使用资源，因为不用为了使用各个独立的功能而运行整个操作系统。

### 容器操作

- `docker create` - 创建容器
- `docker rename` - 重命名容器
- `docker ps` - 查看容器
- `docker start` - 启动容器
- `docker restart` - 重启容器
- `docker pause` - 暂停容器
- `docker unpause` - 恢复容器
- `docker stop` - 停止容器
- `docker kill` - 强行停止容器
- `docker inspect` - 审查容器
- `docker rm` - 删除容器（删除所有容器 - `docker rm $(docker ps -a -q)`）

### 创建容器

使用 `docker create` 可以创建一个容器，常用的参数有：

- `-e` - 设置环境变量
- `-i` - 交互模式，保持 stdin 开启
- `--name` - 设置容器名称
- `-p` - 将容器的指定端口暴露为宿主机指定端口
- `-P` - 将容器的所有端口暴露为宿主机随机端口
- `-t` - 分配一个伪 TTY

### 启动容器

使用 `docker start` 启动容器，通常会使用 `docker run` 来将创建和启动容器合二为一
