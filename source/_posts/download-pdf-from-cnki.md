---
title: 获取 CNKI 中 CAJ 格式学位论文的 PDF 下载链接
date: 2016-04-10 12:50:00
---

用过 CNKI 的都知道，上面的学位论文只提供 CAJ 格式的下载。这个鬼格式完全是 CNKI 自己搞出来的一套格式，相比 PDF 格式而言不仅没有什么优势，而且毫无通用性，必须要下载 CAJViewer 这个玩意儿才能阅读。作为一个致力于开源、通用应用推广的程序猿，怎么能乖乖的接受这种束缚呢？

<!--more-->

网上很多教程都是通过 PDF Printer 将 CAJ 转化为 PDF，这种方法仍然避免不了要去使用 CAJViewer 读取 CAJ 文件，所以本质上并没有解决问题。

其实，CNKI 提供了 PDF 格式的学问论文资源，只不过没有提供入口：

```auto
http://www.cnki.net/KCMS/download.aspx?filename=r5WM5JUdRVUeZRTbyMlZGRTQopXQvIzMmFmb2VmTMt0R55GZTJDRUR2UXRTSFBDa1ZnQycEaMxWeuhFUxdzbPNTNxYGN2U2ZVNEUQ5GazZES3E0Qz10aUt2T5ADVJp1MJhzQ6JHUkFEZNdDa5pVdq9UU3MHMLVjN&dflag=nhdown&tablename=CMFD2007
```

上面是一篇 CNKI 学位论文资源的 CAJ 格式全文下载链接，我们可以看到链接中有 `dflag=nhdown` 这样一个字段，没错！这个字段是用来请求文件格式的字段，想要得到 PDF 格式的文件，只需要将这个字段改成 `dflag=pdfdown` 即可。

如果你用修改好的链接直接下载文件，会发现请求被拦截了。这里是因为 CNKI 对请求的引用（Referer）进行检测，拦截掉直接访问的请求。因此，我们需要修改页面中对应的链接地址，然后通过链接下载。下面一段在论文页面的开发者工具中执行，就可以直接通过全文下载链接下载到 PDF 格式的文件：

```js
void (function () {
  var downloadLink = document.querySelector("li.whole a");
  downloadLink.href = downloadLink.href.replace(
    /&dflag=[^&]+/,
    "&dflag=pdfdown"
  );
  downloadLink.innerHTML += "(PDF)";
})();
```
