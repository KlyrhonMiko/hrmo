"""Model contract tests for SQLModel mappings and table definitions."""
from __future__ import annotations

import importlib
import inspect
import pkgutil

from sqlalchemy.orm import configure_mappers
from sqlmodel import SQLModel

import models


def _iter_model_modules() -> list[object]:
    modules: list[object] = []
    for module_info in pkgutil.iter_modules(models.__path__):
        if module_info.name == "__init__":
            continue
        modules.append(importlib.import_module(f"models.{module_info.name}"))
    return modules


def test_model_modules_import_cleanly() -> None:
    loaded = _iter_model_modules()
    assert loaded, "No model modules discovered"


def test_sqlalchemy_mappers_configure_successfully() -> None:
    # Import side effects register all model relationships.
    _iter_model_modules()
    configure_mappers()


def test_table_models_have_columns() -> None:
    modules = _iter_model_modules()
    table_classes: list[type[SQLModel]] = []

    for module in modules:
        for _, cls in inspect.getmembers(module, inspect.isclass):
            if cls.__module__ != module.__name__:
                continue
            if not issubclass(cls, SQLModel):
                continue
            if hasattr(cls, "__table__"):
                table_classes.append(cls)

    assert table_classes, "No SQLModel table classes discovered"

    for cls in table_classes:
        columns = list(cls.__table__.columns)
        assert columns, f"{cls.__name__} has no columns"
        assert any(column.name == "id" for column in columns), f"{cls.__name__} missing id column"
