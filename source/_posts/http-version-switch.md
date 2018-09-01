---
title: HTTP 版本切换
date: 2021-08-06 13:00:00
categories:
  - 分享
---

> 本文整理自技术分享，可以在[这里](/presentations/http-version-switch)获取演示文稿。

作为 Web 基石 的 HTTP 协议已经经历了 30 余年的迭代，发布了 3 个大版本，尽管版本之间互不兼容，但始终在使用 `https://` 这个协议标识符，那么 HTTP 如何才能无缝地从 HTTP/1.x 切换到 HTTP/2，甚至即将到来的 HTTP/3 呢？

## HTTP Upgrade

[Upgrade](https://httpwg.org/specs/rfc7230.html#header.upgrade) 机制是 HTTP/1.1 引入的，目的是使客户端和服务端之间可以借助已有的 HTTP 语法升级到其他协议。

要发起协议升级，客户端需要指定以下请求头：

```http
Connection: Upgrade
Upgrade: protocol-name[/protocol-version]
```

其中，`Connection: Upgrade` 表示当前请求为一个升级请求，以便代理及最终服务做出正确相应。`Upgrade` 列出了希望升级到的协议和版本，按优先级排序，多个协议之间使用 `,` 隔开。

如果服务器接受升级请求，则会返回一个 `101 Switching Protocols` 的响应状态吗，同时在 `Upgrade` 头中标识选择的协议。服务器在返回 101 状态响应后就可以开始使用新的协议进行通信了。

如果服务不支持/不接受升级请求，则会返回一个常规的 HTTP 响应（比如 `200 OK`）。客户端需要进行相应的回退操作。

HTTP Upgrade 的一个典型应用场景是 WebSocket 连接，通常一个 WebSocket 连接的 `Upgrade` 请求和响应如下：

```http
GET ws://example.com/ HTTP/1.1
Connection: Upgrade
Upgrade: websocket
Origin: http://example.com
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: d4egt7snxxxxxx2WcaMQlA==
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits
```

```http
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Accept: gczJQPmQ4Ixxxxxx6pZO8U7UbZs=
```

你可以通过这个[在线示例](http://websocket.org/echo.html)观察 HTTP 协议是如何升级到 WebSocket 协议的。

HTTP Upgrade Header 提供了丰富的扩展性，你可以使用 Upgrade 升级到任意基于 TCP 的协议而不必创建新的 TCP 连接，这其中也包括 HTTP/2：

```bash
curl -I --http2 nghttp2.org
```

可以看到服务器返回了 `101 Switching Protocols`，并且将协议升级为 h2c(http2 cleartext)。但是如果你使用浏览器访问这个服务，会发现请求仍然使用的是 HTTP/1.1，这是因为主流浏览器都已经[不支持通过 Upgrade 的方式升级到 h2c 协议](https://stackoverflow.com/questions/46788904/why-do-web-browsers-not-support-h2c-http-2-without-tls)，而是通过 ALPN 进行协议协商。

## Application Layer Protocol Negotiation(ALPN)

虽然 HTTP Upgrade 的设计具有扩展性，但缺陷也十分明显：首先，运行其他协议的服务必须部署 HTTP 服务来接收并处理 Upgrade 请求，增加了系统复杂度；其次，通过 HTTP 升级到其他协议不可避免的会浪费掉 1RTT 的时间，影响服务响应速度。为了解决上面两点缺陷，ALPN 便诞生了。

ALPN 是传输层安全协议（TLS）的一个扩展，用来协商在安全连接层之上使用何种应用层协议，避免了额外的往返通讯。要明白 ALPN 是如何工作的，我们需要先了解一下 TLS 的握手过程：

![TLS handshake](/usr/uploads/http-version-switch/tls-handshake.png)

一个典型的 TLS 握手流程需要 2RTT 完成（以 TLS 1.2 为例），ALPN 主要依附于 client hello 和 server hello 两条消息，协商的流程如下：

1. 客户端在 client hello 中附带支持的协议列表，按照期望使用的优先级排序
2. 服务端从客户端支持的协议列表中选择一个协议，附加在 server hello 中
3. TLS 握手完成后，客户端将使用商定的应用层协议发起请求
4. 若服务端不支持客户端提供的所有协议，则服务器会抛出 no_application_protocol 错误

清楚了 ALPN 的工作流程，我们可以通过 Wireshark 来检查 TLS 的握手消息：

![ALPN Client Hello](/usr/uploads/http-version-switch/alpn-request.png)

![ALPN Server Hello](/usr/uploads/http-version-switch/alpn-response.png)

ALPN 看起来是一个非常完美的解决方案，通过扩展 TLS 提前进行应用层协议协商，避免了依赖 HTTP 协议自举带来的复杂度提升和响应延迟问题。然而进入到 HTTP/3 的时代，事情又发生了变化：由于 HTTP/3 基于 UDP 传输，所有基于 TCP/TLS 的方案都没办法无缝切换到 HTTP/3，因此必须寻找新的方案来实现 HTTP/3 切换 Alternative Services 就是其中之一。

## HTTP Alternative Services

HTTP Alternative Services 是作为 HTTP/2 的一个特性于 2016 年引入的（[RFC 7838](https://datatracker.ietf.org/doc/html/rfc7838)），主要作用是进行流量分发。HTTP Alternative Services 通过在服务器响应中（使用 Alt-Svc Header 或 ALT_SVC 控制帧两种形式）指定一组「替身」服务，客户端就可以从「替身」服务处获取资源。这些「替身」服务不但可以使用不同的主机/端口，甚至可以使用不同的协议来提供服务，这一特性为 HTTP/3 切换提供了实现基础。

一个响应头中的 HTTP Alternative Services 信息以以下格式呈现：

```http
Alt-Svc: clear
Alt-Svc: <service-list>; ma=<max-age>
Alt-Svc: <service-list>; ma=<max-age>; persist=1
```

其中，ma 为持续时间（max-age）, persist 表示在网络环境切换后是否保留「替身」服务，service-list 的形式如下：

```text
<protocol>=<host>:<port>, ...
```

host 和 port 可省略其一，因此下列声明都是合法的：

```http
Alt-Svc: h2=":443";
Alt-Svc: h3="example.com:8080"; ma=86400; persist=1
Alt-Svc: h3=":443", h2=":443"; ma=86400; persist=1
```

HTTP Alternative Services 的行为非常类似于反向代理：用户不会感知到代理的存在，而目标服务则可以使用多个不同的主机、端口和协议来提供服务。特别地，出于安全考虑，「替身」服务需要支持 TLS 并与原服务使用相同的证书。HTTP Alternative Services 的行为可以参考下图：

![HTTP Alternative Services 行为](/usr/uploads/http-version-switch/http-alternative.png)

使用 HTTP Alternative Services 可以将 HTTP/3 服务部署为 HTTP/2 或 HTTP/1.1 的「替身」服务，实现 HTTP/3 升级：

```http
Alt-Svc: h3=":443"; ma=86400; persist=1
```

使用最新的浏览器访问[这个地址](https://http3.is)，可以查看 HTTP Alternative Services 是如何将 HTTP/2 升级为 HTTP/3 的。
