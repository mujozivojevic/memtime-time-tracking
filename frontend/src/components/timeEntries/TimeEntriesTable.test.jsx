import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import * as api from "../../api.js";
import TimeEntriesTable from "./TimeEntriesTable.jsx";

function makeEntries(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    taskId: 398,
    comment: `Entry ${index + 1}`,
    start: "2026-01-01T09:00:00.000Z",
    end: "2026-01-01T10:30:00.000Z",
    createdAt: "2026-01-01T10:30:00.000Z",
  }));
}

describe("TimeEntriesTable", () => {
  test("shows the entries with their duration", async () => {
    vi.spyOn(api, "getTimeEntries").mockResolvedValue(makeEntries(2));

    render(<TimeEntriesTable refreshKey={0} onEdit={() => {}} />);

    expect(await screen.findByText("Entry 1")).toBeInTheDocument();
    expect(screen.getAllByText("1h 30m")).toHaveLength(2);
  });

  test("loads the next page with the right offset", async () => {
    const getTimeEntries = vi
      .spyOn(api, "getTimeEntries")
      .mockResolvedValue(makeEntries(10));
    render(<TimeEntriesTable refreshKey={0} onEdit={() => {}} />);

    await screen.findByText("Entry 1");
    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(getTimeEntries).toHaveBeenLastCalledWith({ limit: 10, offset: 10 });
  });
});
