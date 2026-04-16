"""Shared pytest fixtures for backend tests."""
from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


class FakeScalarResult:
    """Minimal scalar result wrapper compatible with SQLAlchemy result APIs."""

    def __init__(self, items: list[Any] | None = None):
        self._items = items or []

    def all(self) -> list[Any]:
        return list(self._items)

    def first(self) -> Any | None:
        return self._items[0] if self._items else None


class FakeResult:
    """Minimal result object used by the fake async session."""

    def __init__(self, rows: list[Any] | None = None, scalar_value: Any = None):
        self._rows = rows or []
        self._scalar_value = scalar_value

    def all(self) -> list[Any]:
        return list(self._rows)

    def first(self) -> Any | None:
        return self._rows[0] if self._rows else None

    def scalar_one_or_none(self) -> Any | None:
        return self._scalar_value

    def scalar_one(self) -> Any:
        if self._scalar_value is None:
            return 0
        return self._scalar_value

    def scalar(self) -> Any:
        if self._scalar_value is None:
            return 0
        return self._scalar_value

    def scalars(self) -> FakeScalarResult:
        return FakeScalarResult(self._rows)


class FakeTransaction:
    """No-op async transaction context manager."""

    def __init__(self, session: "FakeAsyncSession"):
        self.session = session

    async def __aenter__(self) -> "FakeAsyncSession":
        return self.session

    async def __aexit__(self, exc_type, exc, tb) -> None:
        return None


class FakeAsyncSession:
    """Tiny async session stub to exercise endpoint logic without a real DB."""

    def __init__(self):
        self._added: list[Any] = []

    def begin(self) -> FakeTransaction:
        return FakeTransaction(self)

    async def execute(self, statement: Any, *args: Any, **kwargs: Any) -> FakeResult:
        statement_text = str(statement).lower()
        if "count(" in statement_text:
            return FakeResult(rows=[], scalar_value=0)
        return FakeResult(rows=[], scalar_value=None)

    def add(self, instance: Any) -> None:
        self._added.append(instance)

    async def commit(self) -> None:
        return None

    async def rollback(self) -> None:
        return None

    async def refresh(self, instance: Any) -> None:
        if getattr(instance, "id", None) is None:
            setattr(instance, "id", "00000000-0000-0000-0000-000000000001")

    async def delete(self, instance: Any) -> None:
        return None

    async def get(self, *args: Any, **kwargs: Any) -> Any | None:
        return None

    async def close(self) -> None:
        return None


async def override_get_db() -> AsyncIterator[FakeAsyncSession]:
    """FastAPI dependency override for database sessions."""
    yield FakeAsyncSession()


@pytest.fixture
def fake_session() -> FakeAsyncSession:
    """Reusable fake async session fixture."""
    return FakeAsyncSession()


@pytest.fixture
def test_app(monkeypatch: pytest.MonkeyPatch) -> FastAPI:
    """Create app instance with disabled DB lifecycle and overridden DB dependency."""
    import main as backend_main
    from core.database import get_db

    async def _noop() -> None:
        return None

    monkeypatch.setattr(backend_main, "init_db", _noop)
    monkeypatch.setattr(backend_main, "close_db", _noop)

    app = backend_main.create_app()
    app.dependency_overrides[get_db] = override_get_db
    return app


@pytest.fixture
def client(test_app: FastAPI) -> AsyncIterator[TestClient]:
    """HTTP client fixture for API smoke tests."""
    with TestClient(test_app, raise_server_exceptions=False) as test_client:
        yield test_client
