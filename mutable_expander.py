from __future__ import annotations

from enum import Enum
from typing import NamedTuple, Any, Optional

from streamlit.delta_generator import DeltaGenerator
from streamlit.type_util import SupportsStr


class ChildType(Enum):
    MARKDOWN = "MARKDOWN"
    EXCEPTION = "EXCEPTION"


class ChildRecord(NamedTuple):
    type: ChildType
    kwargs: dict[str, Any]
    dg: DeltaGenerator


class MutableExpander:
    """An expander that can be renamed and dynamically expanded/collapsed."""

    def __init__(self, parent_container: DeltaGenerator, label: str, expanded: bool):
        self._label = label
        self._expanded = expanded
        self._parent_cursor = parent_container.empty()
        self._container = self._parent_cursor.expander(label, expanded)
        self._children: list[ChildRecord] = []

    @property
    def label(self) -> str:
        return self._label

    @property
    def expanded(self) -> bool:
        return self._expanded

    def update(
        self, *, new_label: Optional[str] = None, new_expanded: Optional[bool] = None
    ) -> None:
        """Change the expander's label and expanded state"""
        if new_label is None:
            new_label = self._label
        if new_expanded is None:
            new_expanded = self._expanded

        if self._label == new_label and self._expanded == new_expanded:
            # No change!
            return

        self._label = new_label
        self._expanded = new_expanded
        self._container = self._parent_cursor.expander(new_label, new_expanded)

        prev_children = self._children
        self._children = []

        # Replay all children into the new container
        for child in prev_children:
            if child.type == ChildType.MARKDOWN:
                self.markdown(**child.kwargs)
            elif child.type == ChildType.EXCEPTION:
                self.exception(**child.kwargs)
            else:
                raise RuntimeError(f"Unexpected child.type {child.type}")

    def markdown(
        self,
        body: SupportsStr,
        unsafe_allow_html: bool = False,
        *,
        help: Optional[str] = None,
        index: Optional[int] = None,
    ) -> int:
        kwargs = {"body": body, "unsafe_allow_html": unsafe_allow_html, "help": help}

        new_dg = self._get_dg(index).markdown(**kwargs)
        record = ChildRecord(ChildType.MARKDOWN, kwargs, new_dg)
        return self._add_record(record, index)

    def exception(
        self, exception: BaseException, *, index: Optional[int] = None
    ) -> int:
        kwargs = {"exception": exception}
        new_dg = self._get_dg(index).exception(**kwargs)
        record = ChildRecord(ChildType.EXCEPTION, kwargs, new_dg)
        return self._add_record(record, index)

    def _add_record(self, record: ChildRecord, index: Optional[int]) -> int:
        if index is not None:
            # Replace existing child
            self._children[index] = record
            return index

        # Append new child
        self._children.append(record)
        return len(self._children) - 1

    def _get_dg(self, index: Optional[int]) -> DeltaGenerator:
        if index is not None:
            # Existing index: reuse child's DeltaGenerator
            assert 0 <= index < len(self._children), f"Bad index: {index}"
            return self._children[index].dg

        # No index: use container's DeltaGenerator
        return self._container
