# TianCode plugin market

English | [中文](PLUGIN_MARKET.zh.md)

This page describes a small, static plugin market for the experimental Web bundle and the TianCode Desktop client.

## Publish a static market directory

Put one `index.json`, the tarballs it names, and optional icons in one directory served by an ordinary HTTP server. The index URL must be an `http:` or `https:` URL without credentials or a fragment; relative icon paths resolve against that URL.

Copy the prepared bundle into the directory before publishing it:

```sh
mkdir -p /tmp/dsh-market
cp ds-bot-0.1.3.tgz /tmp/dsh-market/
```

Use format 1 and point the version's `source` at the tarball URL. This minimal example is valid when the package declares a compatible `engines.dsh` range and a DSH bundle patch:

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

The tarball URL is the exact pnpm install spec. It must end in `.tgz` or `.tar.gz`, and it cannot contain credentials, a query, or a fragment. Each listed version is pinned; the reader does not replace it with `latest`.

Serve the directory with any static HTTP server. For a local check, run `python3 -m http.server 8080 --directory /tmp/dsh-market`, then open `http://127.0.0.1:8080/index.json` and the tarball URL in a browser or with `curl`.

## Add and install a source in Windows Desktop

Start the built Desktop, open **Plugins**, select **Discover**, and choose **Manage sources**. Add the full URL of `index.json`, save it, and select the source to load its entries.

Open the `DS Bot` entry, review its version, compatibility range, origin, and tarball URL, then click **Install**. Discover passes the pinned target to the existing `plugin-manager`; its pnpm operation, compatibility check, build-script approval, progress reporting, and recovery behavior remain the same as a manually entered spec.

The Desktop needs the index and tarball reachable from the machine. An offline installation therefore requires a local HTTP server or intranet host, the tarball copied into that host, and every package dependency available in the configured pnpm cache or an internal registry. A market index alone does not vendor transitive dependencies.

## Web experiment and development verification

The ordinary Web profile leaves the market rows disabled. If a Web deployment needs custom markets, enable the optional **Custom plugin markets** bundle and follow its package README for the profile patch; this Desktop guide does not change the Web profile defaults.

Build and start the customized Desktop with:

```sh
pnpm run build:tiancode
DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop
```

Observable verification is a source row appearing under **Plugins > Discover**, an entry card showing `DS Bot` and version `0.1.3`, and the existing install dialog reaching its check and progress screens after **Install**. Confirm the profile package and bundle list after the operation; the installed package must retain the exact tarball URL and version.

For a static-host check, change the served index or tarball, reload the source, and verify that the updated metadata or a clear fetch/install error appears. Do not describe an installation as successful until these UI and profile observations are present.
