"""Set the plugin market's public origin before copying this directory to a server."""
import json
import sys
from pathlib import Path
from urllib.parse import urlsplit


def main():
    if len(sys.argv) != 2:
        raise ValueError("Usage: python3 configure-market.py http://skills.internal:8088")
    base = sys.argv[1].rstrip("/")
    url = urlsplit(base)
    if url.scheme not in {"http", "https"} or not url.hostname or url.username or url.password or url.query or url.fragment:
        raise ValueError("Provide an HTTP(S) server URL without credentials, query, or fragment")
    if url.port is not None and not 1 <= url.port <= 65535:
        raise ValueError("Invalid port")
    index_path = Path(__file__).resolve().parent / "public/plugins/plugin-market.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))
    for plugin in index["plugins"]:
        for version in plugin["versions"]:
            filename = urlsplit(version["source"]["url"]).path.rsplit("/", 1)[-1]
            if not filename.endswith(".tgz") or not (index_path.parent / filename).is_file():
                raise ValueError("Plugin tarball is missing")
            version["source"]["url"] = base + "/plugins/" + filename
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Plugin source: " + base + "/plugins/plugin-market.json")
    print("Skill catalog: " + base + "/catalog.json")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        sys.exit("Market configuration failed: " + str(error))
