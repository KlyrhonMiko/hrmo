"""Service layer contract and smoke tests."""
from __future__ import annotations

import importlib
import inspect
import pkgutil
from typing import Any, get_args, get_origin

import pytest

import services
from models.employees import Employee
from services.base import BaseService


def _iter_service_modules() -> list[object]:
    modules: list[object] = []
    for module_info in pkgutil.iter_modules(services.__path__):
        if module_info.name == "__init__":
            continue
        modules.append(importlib.import_module(f"services.{module_info.name}"))
    return modules


def _sample_value(annotation: Any, parameter_name: str) -> Any:
    if parameter_name in {"skip", "limit", "days"}:
        return 1

    origin = get_origin(annotation)
    if origin in {list, set, tuple}:
        inner = get_args(annotation)
        if inner and inner[0] is int:
            return [1]
        return ["sample"]

    if annotation in {int, float}:
        return 1
    if annotation is bool:
        return True

    return "sample"


def _build_kwargs(method: Any) -> dict[str, Any]:
    kwargs: dict[str, Any] = {}
    signature = inspect.signature(method)

    for name, parameter in signature.parameters.items():
        if name == "self":
            continue
        if parameter.default is not inspect._empty:
            continue
        kwargs[name] = _sample_value(parameter.annotation, name)

    return kwargs


def test_service_modules_import_cleanly() -> None:
    loaded = _iter_service_modules()
    assert loaded, "No service modules discovered"


def test_all_service_classes_instantiate(fake_session) -> None:
    service_classes: list[type[BaseService[Any]]] = []

    for module in _iter_service_modules():
        for _, cls in inspect.getmembers(module, inspect.isclass):
            if cls.__module__ != module.__name__:
                continue
            if cls is BaseService:
                continue
            if issubclass(cls, BaseService):
                service_classes.append(cls)

    assert service_classes, "No BaseService subclasses discovered"

    for cls in service_classes:
        instance = cls(fake_session)
        assert isinstance(instance, BaseService)
        assert hasattr(instance, "model_class")


@pytest.mark.anyio
async def test_base_service_core_methods(fake_session) -> None:
    service = BaseService(Employee, fake_session)

    assert await service.get("sample") is None
    assert await service.get_all() == []
    assert await service.count_all() == 0
    assert await service.remove("sample") is False
    assert await service.restore("sample") is False


@pytest.mark.anyio
async def test_all_public_async_service_methods_execute(fake_session) -> None:
    failures: list[str] = []

    for module in _iter_service_modules():
        for _, cls in inspect.getmembers(module, inspect.isclass):
            if cls.__module__ != module.__name__:
                continue
            if cls is BaseService or not issubclass(cls, BaseService):
                continue

            service = cls(fake_session)
            for method_name, method in inspect.getmembers(cls, inspect.iscoroutinefunction):
                if method_name.startswith("_"):
                    continue
                if not method.__qualname__.startswith(f"{cls.__name__}."):
                    continue

                bound_method = getattr(service, method_name)
                kwargs = _build_kwargs(bound_method)

                try:
                    await bound_method(**kwargs)
                except Exception as exc:  # noqa: BLE001
                    failures.append(f"{cls.__name__}.{method_name} failed: {exc}")

    assert not failures, "\n".join(failures)
