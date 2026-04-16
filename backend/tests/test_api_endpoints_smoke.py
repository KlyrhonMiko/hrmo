"""Endpoint smoke tests that validate all documented router operations avoid 500 errors."""
from __future__ import annotations

import re
from typing import Any

from fastapi import FastAPI
from fastapi.testclient import TestClient

SAMPLE_UUID = "00000000-0000-0000-0000-000000000001"


def _param_value(name: str) -> str:
    if name == "employee_no":
        return "EMP-0001"
    if name.endswith("_id") or name == "id":
        return SAMPLE_UUID
    if "type" in name or "status" in name:
        return "sample"
    return "sample"


def _path_with_values(path_template: str) -> str:
    names = re.findall(r"{([^}]+)}", path_template)
    path = path_template
    for name in names:
        path = path.replace("{" + name + "}", _param_value(name))
    return path


def _required_query_params(operation: dict[str, Any]) -> dict[str, Any]:
    params: dict[str, Any] = {}
    for parameter in operation.get("parameters", []):
        if parameter.get("in") != "query" or not parameter.get("required", False):
            continue

        name = parameter["name"]
        schema = parameter.get("schema", {})
        enum_values = schema.get("enum")
        if enum_values:
            params[name] = enum_values[0]
            continue

        schema_type = schema.get("type")
        if schema_type in {"integer", "number"}:
            params[name] = 1
        elif schema_type == "boolean":
            params[name] = True
        else:
            params[name] = "sample"

    return params


def _request_kwargs(operation: dict[str, Any], method: str) -> dict[str, Any]:
    kwargs: dict[str, Any] = {}
    query_params = _required_query_params(operation)
    if query_params:
        kwargs["params"] = query_params

    if method in {"POST", "PATCH", "PUT"} and operation.get("requestBody"):
        content = operation["requestBody"].get("content", {})
        if "application/json" in content:
            kwargs["json"] = {}
        elif "multipart/form-data" in content:
            kwargs["data"] = {}

    return kwargs


def test_openapi_contains_paths_for_all_router_prefixes(test_app: FastAPI) -> None:
    openapi = test_app.openapi()
    paths = set(openapi.get("paths", {}))

    expected_prefixes = {
        "/api/basic-information",
        "/api/government-ids",
        "/api/addresses",
        "/api/contact-information",
        "/api/family-details",
        "/api/educational-backgrounds",
        "/api/civil-service-eligibility",
        "/api/work-experience",
        "/api/voluntary-work",
        "/api/training",
        "/api/training-tracking",
        "/api/other-information",
        "/api/reference-records",
        "/api/primary-government-ids",
        "/api/record-completions",
        "/api/employees",
        "/api/certificates",
        "/api/dashboard",
    }

    missing = [prefix for prefix in sorted(expected_prefixes) if not any(path.startswith(prefix) for path in paths)]
    assert not missing, f"Missing router prefixes in OpenAPI: {missing}"


def test_all_documented_operations_do_not_return_500(client: TestClient, test_app: FastAPI) -> None:
    openapi = test_app.openapi()
    failures: list[str] = []

    for path_template, methods in openapi.get("paths", {}).items():
        if not path_template.startswith("/api/"):
            continue

        for method_name, operation in methods.items():
            method = method_name.upper()
            if method not in {"GET", "POST", "PATCH", "PUT", "DELETE"}:
                continue

            path = _path_with_values(path_template)
            kwargs = _request_kwargs(operation, method)
            response = client.request(method, path, **kwargs)

            if response.status_code >= 500:
                failures.append(f"{method} {path} -> {response.status_code}: {response.text}")

    assert not failures, "\n".join(failures)
