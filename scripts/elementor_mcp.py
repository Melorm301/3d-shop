#!/usr/bin/env python3
"""Small Streamable HTTP client for the configured Elementor MCP server.

Credentials are read at runtime from ~/.codex/config.toml and are never printed.
Usage:
  python3 scripts/elementor_mcp.py --list
  python3 scripts/elementor_mcp.py --call elementor-get-page-structure '{"post_id":81}'
"""

from __future__ import annotations

import argparse
import json
import sys
import tomllib
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


def mcp_request(url: str, headers: dict[str, str], session_id: str | None, body: dict[str, Any] | None):
    request_headers = dict(headers)
    request_headers.update({"Accept": "application/json, text/event-stream"})
    if body is not None:
        request_headers["Content-Type"] = "application/json"
    if session_id:
        request_headers["MCP-Session-ID"] = session_id
    data = None if body is None else json.dumps(body).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers=request_headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            new_session = response.headers.get("MCP-Session-ID") or session_id
            content_type = response.headers.get("Content-Type", "")
            raw = response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        # Do not display server response bodies or request headers; either may contain secrets.
        raise RuntimeError(f"MCP HTTP request failed (status {error.code})") from None
    except Exception as error:
        raise RuntimeError(f"MCP request failed ({type(error).__name__})") from None

    if not raw.strip():
        return new_session, None
    if "text/event-stream" in content_type:
        for line in raw.splitlines():
            if line.startswith("data:"):
                try:
                    return new_session, json.loads(line[5:].strip())
                except json.JSONDecodeError:
                    continue
        return new_session, None
    try:
        return new_session, json.loads(raw)
    except json.JSONDecodeError:
        raise RuntimeError("MCP returned a non-JSON response") from None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--list", action="store_true", help="list MCP tool names")
    group.add_argument("--call", nargs=2, metavar=("TOOL", "JSON_ARGS"), help="call one MCP tool")
    args = parser.parse_args()

    config_path = Path.home() / ".codex" / "config.toml"
    try:
        with config_path.open("rb") as config_file:
            server = tomllib.load(config_file)["mcp_servers"]["wordpress-website-elementor"]
        url = server["url"]
        headers = {str(key): str(value) for key, value in server.get("headers", {}).items()}
    except Exception as error:
        print(f"Could not load configured Elementor MCP settings ({type(error).__name__}).", file=sys.stderr)
        return 2

    session_id = None
    try:
        session_id, initialized = mcp_request(
            url,
            headers,
            session_id,
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2025-11-25",
                    "capabilities": {},
                    "clientInfo": {"name": "stykk-project-client", "version": "1.0"},
                },
            },
        )
        if not initialized or "error" in initialized:
            print("Elementor MCP initialize failed.", file=sys.stderr)
            return 1
        session_id, _ = mcp_request(
            url, headers, session_id, {"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}}
        )
        if args.list:
            session_id, result = mcp_request(
                url, headers, session_id, {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
            )
            if not result or "error" in result:
                print("Elementor MCP tools/list failed.", file=sys.stderr)
                return 1
            tools = result.get("result", {}).get("tools", [])
            print(json.dumps([tool.get("name") for tool in tools], ensure_ascii=False, indent=2))
            return 0

        tool_name, raw_args = args.call
        try:
            tool_args = json.loads(raw_args)
        except json.JSONDecodeError:
            print("Tool arguments must be valid JSON.", file=sys.stderr)
            return 2
        _, result = mcp_request(
            url,
            headers,
            session_id,
            {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": tool_name, "arguments": tool_args}},
        )
        if not result:
            print("Elementor MCP tool returned no response.", file=sys.stderr)
            return 1
        print(json.dumps(result.get("result", result), ensure_ascii=False, indent=2))
        return 1 if result.get("isError") or "error" in result else 0
    except RuntimeError as error:
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
