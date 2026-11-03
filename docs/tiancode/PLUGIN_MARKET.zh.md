# TianCode 插件市场

[English](PLUGIN_MARKET.md) | 中文

本页说明如何为实验性 Web bundle 与 TianCode Desktop 提供一个静态插件市场。

## 发布静态市场目录

将一个 `index.json`、它引用的 tarball 以及可选图标放在同一目录，由普通 HTTP 服务器提供。索引 URL 必须是没有凭据和片段的 `http:` 或 `https:` URL；相对图标路径会相对于该 URL 解析。

发布前将准备好的 bundle 复制到目录：

```sh
mkdir -p /tmp/dsh-market
cp ds-bot-0.1.3.tgz /tmp/dsh-market/
```

使用格式 1，并让版本的 `source` 指向 tarball URL。当软件包声明了兼容的 `engines.dsh` 范围和 DSH bundle patch 时，下面的最小示例有效：

```json
{
  "format": 1,
  "title": "Internal DSH market",
  "plugins": [
    {
      "name": "ds-bot",
      "title": "DS Bot",
      "versions": [
        {
          "version": "0.1.3",
          "publishTimestamp": 1790476800,
          "source": { "type": "tarball", "url": "http://127.0.0.1:8080/ds-bot-0.1.3.tgz" },
          "engines": { "dsh": ">=0.2.1-rc.3 <0.3.0" }
        }
      ]
    }
  ]
}
```

Tarball URL 就是 pnpm 使用的精确安装 spec，必须以 `.tgz` 或 `.tar.gz` 结尾，也不能包含凭据、查询参数或片段。每个列出的版本都已固定；读取器不会替换成 `latest`。

可以使用任意静态 HTTP 服务器提供目录。进行本地检查时运行 `python3 -m http.server 8080 --directory /tmp/dsh-market`，再在浏览器中打开 `http://127.0.0.1:8080/index.json` 和 tarball URL，或使用 `curl` 请求。

## 在 Windows Desktop 添加并安装来源

启动已构建的 Desktop，打开 **Plugins**，选择 **Discover**，再选择 **Manage sources**。添加完整的 `index.json` URL，保存后选择该来源以加载条目。

打开 `DS Bot` 条目，检查版本、兼容范围、来源和 tarball URL，然后点击 **Install**。Discover 会把固定的 target 交给现有的 `plugin-manager`；它的 pnpm 操作、兼容性检查、构建脚本批准、进度报告和恢复行为继续沿用手动输入 spec 的流程。

Desktop 必须能从运行机器访问索引和 tarball。离线安装需要本地 HTTP 服务器或内网主机、已复制到该主机的 tarball，以及配置的 pnpm 缓存或内部 Registry 中可用的全部软件包依赖。仅有市场索引不会携带传递依赖。

## Web 实验与开发验证

普通 Web profile 会保持市场行禁用。如果 Web 部署需要自定义市场，请启用可选的“自定义插件市场”bundle，并按照其 package README 配置 profile patch；本 Desktop 指南不会改变 Web profile 的默认值。

使用以下命令构建并启动定制 Desktop：

```sh
pnpm run build:tiancode
DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop
```

可观察验证包括：**Plugins > Discover** 下出现来源行，条目卡片显示 `DS Bot` 和版本 `0.1.3`，点击 **Install** 后现有安装对话框进入检查和进度页面。操作完成后检查 profile 软件包与 bundle 列表；已安装软件包必须保留精确的 tarball URL 和版本。

进行静态主机检查时修改已提供的索引或 tarball，重新加载来源，并确认界面显示更新后的元数据或清晰的获取/安装错误。在这些 UI 与 profile 观察结果出现前，不要将安装描述为成功。
