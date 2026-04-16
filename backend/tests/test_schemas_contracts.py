"""Schema contract tests for Pydantic model availability and schema generation."""
from __future__ import annotations

import importlib
import inspect
import pkgutil

from pydantic import BaseModel

import schemas


def _iter_schema_modules() -> list[object]:
    modules: list[object] = []
    for module_info in pkgutil.iter_modules(schemas.__path__):
        if module_info.name == "__init__":
            continue
        modules.append(importlib.import_module(f"schemas.{module_info.name}"))
    return modules


def test_schema_modules_import_cleanly() -> None:
    loaded = _iter_schema_modules()
    assert loaded, "No schema modules discovered"


def test_schema_classes_build_json_schema() -> None:
    modules = _iter_schema_modules()
    found_classes = 0

    for module in modules:
        for _, cls in inspect.getmembers(module, inspect.isclass):
            if cls.__module__ != module.__name__:
                continue
            if not issubclass(cls, BaseModel):
                continue

            found_classes += 1
            cls.model_rebuild()
            schema = cls.model_json_schema()
            assert isinstance(schema, dict)
            assert "title" in schema

            # Construct without validation to verify model dump contract.
            instance = cls.model_construct()
            assert isinstance(instance.model_dump(), dict)

    assert found_classes > 0, "No schema classes discovered"
