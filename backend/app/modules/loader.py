import importlib
import os
import yaml
from fastapi import FastAPI
from pathlib import Path


def load_modules(app: FastAPI):
    # loader.py path: backend/app/modules/loader.py
    # modules directory: backend/modules
    modules_dir = Path(__file__).resolve().parents[2] / "modules"
    if not modules_dir.exists():
        return

    for item in modules_dir.iterdir():
        if not item.is_dir():
            continue
        manifest_path = item / "manifest.yml"
        if not manifest_path.exists():
            continue
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = yaml.safe_load(f)

        api_import = manifest.get("entrypoint_api")
        prefix = manifest.get("api_prefix", f"/api/v1/{item.name}")

        if not api_import:
            continue

        module = importlib.import_module(api_import)
        router = getattr(module, "router", None)
        if router is not None:
            app.include_router(router, prefix=prefix)
